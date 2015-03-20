/*
 * grunt-selenium-plugin
 * https://github.com/balumuriraj/Grunt-Selenium-Plugin
 *
 * Copyright (c) 2015 MohanRaj
 * Licensed under the MIT license.
 */

'use strict';

var spawn = require('child_process').spawn,
    path = require('path'),
    Download = require('download'),
    Q = require('q'),
    os = require('os'),
    http = require('http'),
    util = require('util'),

    started = false,
    seleniumServerProcess = null,

    LIBRARY_PATH = path.resolve(process.cwd(), 'lib/'),

    os_details = {
        platform: '',
        arch: ''
    },

    chrome_driver_details = {
        version: '',
        url: 'http://chromedriver.storage.googleapis.com',
        name: 'chromedriver',
        path: path.resolve(LIBRARY_PATH, 'chromedriver')
    },

    selenium_driver_details = {
        version: '2.44',
        subversion: '0',
        url: 'http://selenium-release.storage.googleapis.com',
        name: 'selenium-server-standalone',
        path: ''
    };

/*
 SEL_JAR_URL = 'http://selenium-release.storage.googleapis.com/2.44/selenium-server-standalone-2.44.0.jar',
 SEL_JAR_PATH = path.resolve(LIBRARY_PATH, 'selenium-server-standalone-2.44.0.jar'),
 CHROME_DRIVER_URL = 'http://chromedriver.storage.googleapis.com/2.14/chromedriver_win32.zip',
 CHROME_DRIVER_PATH = path.resolve(LIBRARY_PATH, 'chromedriver.exe');
 */


function startSelenium (next, options) {

    console.log('Selenium JAR is at: ' + selenium_driver_details.path);
    console.log('Chrome Driver is at: ' + chrome_driver_details.path);
    console.log('Current working directory is: ' + process.cwd());
    console.log( 'starting selenium server on ' + options.host + ':' + options.port );

    var selenium_options = [];

    selenium_options.push('-jar', selenium_driver_details.path);    //JAR Path
    selenium_options.push('-host', options.host);                   //host
    selenium_options.push('-port', options.port);                   //port

    if(options.browser == 'chrome' || options.browser == null){
        selenium_options.push('-Dwebdriver.chrome.driver=' + chrome_driver_details.path);
    }

    seleniumServerProcess = spawn('java', selenium_options);

    seleniumServerProcess.stderr.setEncoding('utf8');
    seleniumServerProcess.stderr.on('data', function(data) {
        var errMsg;
        data = data.trim();

        if ( data.indexOf( 'Started SocketListener' ) > -1 ) {
            console.log('Selenium webdriver has started on ' + options.host + ':' + options.port);
            started = true;
            if (typeof next === 'function') {
                return next();
            }
        } else if ( data && data.indexOf('Failed to start') > -1) {
            errMsg = 'ERROR starting selenium: ' + data;
            throw errMsg;
        }
    });
}

function stopSelenium(next){
    if(seleniumServerProcess){
        seleniumServerProcess.on('close', function(code, signal) {
            if(typeof next === 'function'){
                next();
            }
        });

        seleniumServerProcess.kill('SIGTERM');
        started = false;
    }
}

process.on('exit', function onProcessExit(){
    if(started){
        stopSelenium();
    }
});

function update_selenium_details(options){

    //updating selenium details
    if(options.version != null){
        selenium_driver_details.version = options.version;
    }

    if(options.subversion != null){
        selenium_driver_details.subversion = options.subversion;
    }

    var sel_file_name = selenium_driver_details.name + '-' + selenium_driver_details.version + '.' + selenium_driver_details.subversion + '.jar';
    selenium_driver_details.url = selenium_driver_details.url + '/' + selenium_driver_details.version + '/' + sel_file_name;
    selenium_driver_details.path = path.resolve(LIBRARY_PATH, sel_file_name);

    console.log('Selenium driver details: ' + util.inspect(selenium_driver_details, false, null));

}

function update_chrome_driver_details(){

    var env_deferred = Q.defer();

    //OS Environment
    console.log('OS platform detected as: ' + os.platform() + ' ' + os.arch());
    os_details.arch = os.arch();
    os_details.platform = os.platform();

    var get_chrome_driver_version = function(){
        console.log('inside chrome details...');

        var deferred = Q.defer();

        //http.request('http://chromedriver.storage.googleapis.com/LATEST_RELEASE', callback).end();

        var req = http.get('http://chromedriver.storage.googleapis.com/LATEST_RELEASE', function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Latest Release of Chrome driver is: ' + chunk);
                chrome_driver_details.version = chunk;
                deferred.resolve();
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        return deferred.promise;
    };


    get_chrome_driver_version().then(function(){

        console.log('updating chrome details...');

        //updating chrome driver details
        if(os_details.platform == 'linux'){
            if(os_details.arch == 'x64'){
                chrome_driver_details.url = chrome_driver_details.url + '/' + chrome_driver_details.version + '/' + chrome_driver_details.name + '_linux64.zip';
            } else if(os_details.arch == 'x32'){
                chrome_driver_details.url = chrome_driver_details.url + '/' + chrome_driver_details.version + '/' + chrome_driver_details.name + '_linux32.zip';
            }
        } else if(os_details.platform == 'darwin'){
            chrome_driver_details.url = chrome_driver_details.url + '/' + chrome_driver_details.version + '/' + chrome_driver_details.name + '_mac32.zip';
        } else if(os_details.platform == 'win32'){
            chrome_driver_details.url = chrome_driver_details.url + '/' + chrome_driver_details.version + '/' + chrome_driver_details.name + '_win32.zip';
            chrome_driver_details.path = chrome_driver_details.path + '.exe';
        }

        console.log('Chrome driver details: ' + util.inspect(chrome_driver_details, false, null));
        env_deferred.resolve();
    });

    return env_deferred.promise;

}


module.exports = function(grunt) {

    grunt.registerTask('startSelenium', 'Starts the Selenium Webdriver', function(){
        var options = this.options();

        if(options.host == null) {
            options.host = '127.0.0.1';
        }

        if(options.port == null) {
            options.port = 4444;
        }

        if(options.libpath != null){
            LIBRARY_PATH = options.libpath;
            chrome_driver_details.path = path.resolve(LIBRARY_PATH, 'chromedriver')
        }

        // Tell Grunt this task is asynchronous.
        var done = this.async();

        update_selenium_details(options);

        //Download Selenium JAR
        var download_sel_jar = function() {
            var deferred = Q.defer();

            if(grunt.file.exists(selenium_driver_details.path)){
                grunt.log.ok(['Selenium JAR already exists! Download not required..']);
                deferred.resolve();
            } else {
                grunt.log.error(['Selenium JAR doesnt exists! Downloading required files..']);

                if(!grunt.file.isDir(LIBRARY_PATH)) {
                    console.log('lib directory doesnt exist. Creating a new dir...');
                    grunt.file.mkdir(LIBRARY_PATH);
                }

                new Download({})
                    .get(selenium_driver_details.url)
                    .dest(LIBRARY_PATH)
                    .run(function(err, files){
                        if(err){
                            throw err;
                        }
                        console.log('Selenium JAR downloaded successfully!!');
                        deferred.resolve();
                    });

            }

            return deferred.promise;
        };

        //Download browser drivers
        var download_browser_driver = function() {
            var deferred = Q.defer();

            if(options.browser == 'chrome' || options.browser == null){

                update_chrome_driver_details().then(function(){

                    if(grunt.file.exists(chrome_driver_details.path)){
                        grunt.log.ok(['Chromedriver already exists! Download not required..']);
                        deferred.resolve();
                    }
                    else{
                        grunt.log.error(['Chromedriver doesnt exists! Downloading required file..']);

                        if(!grunt.file.isDir(LIBRARY_PATH)){
                            console.log('lib directory doesnt exist. Creating a new dir...')
                            grunt.file.mkdir(LIBRARY_PATH);
                        }

                        new Download({extract: true})
                            .get(chrome_driver_details.url)
                            .dest(LIBRARY_PATH)
                            .run(function(err, files){
                                if(err){
                                    throw err;
                                }
                                console.log('Chrome Driver downloaded successfully!!');
                                deferred.resolve();
                            });
                    }
                });

            } else{
                console.log('browser driver download not required...')
                deferred.resolve();
            }

            return deferred.promise;
        };

        //Selenium will start once both the files are downloaded
        Q.all([download_browser_driver(), download_sel_jar()]).done(function () {
            console.log("Downloads completed!");
            return startSelenium(done, options);
        });
    });

    grunt.registerTask('stopSelenium', 'Stops the Selenium Webdriver', function(){
        var done = this.async();
        return stopSelenium(done);
    });

};
