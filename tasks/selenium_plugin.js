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

    started = false,
    seleniumServerProcess = null,

    LIBRARY_PATH = path.resolve(process.cwd(), 'lib/'),
    SEL_JAR_URL = 'http://selenium-release.storage.googleapis.com/2.44/selenium-server-standalone-2.44.0.jar',
    SEL_JAR_PATH = path.resolve(LIBRARY_PATH, 'selenium-server-standalone-2.44.0.jar'),
    CHROME_DRIVER_URL = 'http://chromedriver.storage.googleapis.com/2.14/chromedriver_win32.zip',
    CHROME_DRIVER_PATH = path.resolve(LIBRARY_PATH, 'chromedriver.exe');


function startSelenium (next, options) {

    console.log('Selenium JAR is at: ' + SEL_JAR_PATH);
    console.log('Chrome Driver is at: ' + CHROME_DRIVER_PATH);
    console.log('Current working directory is: ' + process.cwd());
    console.log( 'starting selenium server on ' + options.host + ':' + options.port );

    seleniumServerProcess = spawn('java', [
        '-jar', SEL_JAR_PATH,
        '-host', options.host,
        '-port', options.port,
        '-Dwebdriver.chrome.driver=' + CHROME_DRIVER_PATH
    ]);

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



module.exports = function(grunt) {

    grunt.registerTask('startSelenium', 'Starts the Selenium Webdriver', function(){
        var options = this.options({
            host:'127.0.0.1',
            port: 4444
        });

        // Tell Grunt this task is asynchronous.
        var done = this.async();

        if(grunt.file.exists(SEL_JAR_PATH) && grunt.file.exists(CHROME_DRIVER_PATH)){
            grunt.log.ok(['Selenium JAR and chromedriver already exists! Download not required..']);
            return startSelenium(done, options);
        }
        else{
            grunt.log.error(['Selenium JAR and chromedriver doesnt exists! Downloading required files..']);
            //grunt.task.run(['curl:download-selenium', 'curl:download-chromedriver', 'unzip:chrome', 'startSelenium']);
            console.log('downloading required files......');
            if(!grunt.file.isDir(LIBRARY_PATH)){
                console.log('lib directory doesnt exist. Creating a new dir...')
                grunt.file.mkdir(LIBRARY_PATH);
            }

            //Download Chrome Driver
            var download_chrome_driver = function() {
                var deferred = Q.defer();

                new Download({extract: true})
                    .get(CHROME_DRIVER_URL)
                    .dest(LIBRARY_PATH)
                    .run(function(err, files){
                        if(err){
                            throw err;
                        }
                        console.log('Chrome Driver downloaded successfully!!');
                        deferred.resolve();
                    });
                return deferred.promise;
            };

            //Download Selenium JAR
            var download_sel_jar = function() {
                var deferred = Q.defer();
                new Download({})
                    .get(SEL_JAR_URL)
                    .dest(LIBRARY_PATH)
                    .run(function(err, files){
                        if(err){
                            throw err;
                        }
                        console.log('Selenium JAR downloaded successfully!!');
                        deferred.resolve();
                    });
                return deferred.promise;
            };

            //Selenium will start once both the files are downloaded
            Q.all([download_chrome_driver(), download_sel_jar()]).done(function () {
                console.log("Downloads completed!");
                return startSelenium(done, options);
            });

        }


    });

    grunt.registerTask('stopSelenium', 'Stops the Selenium Webdriver', function(){
        var done = this.async();
        return stopSelenium(done);
    });

};
