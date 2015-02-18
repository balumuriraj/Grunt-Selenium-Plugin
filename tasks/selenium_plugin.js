/*
 * grunt-selenium-plugin
 * https://github.com/balumuriraj/Grunt-Selenium-Plugin
 *
 * Copyright (c) 2015 MohanRaj
 * Licensed under the MIT license.
 */

'use strict';

var spawn = require('child_process').spawn,
    started = false,
    seleniumServerProcess = null,
    path = require('path'),
    LIBRARY_PATH = 'lib',
    SEL_JAR_PATH = path.resolve(process.cwd(), LIBRARY_PATH, 'selenium-server-standalone-2.44.0.jar'),
    CHROME_DRIVER_PATH = path.resolve(process.cwd(), LIBRARY_PATH, 'chromedriver.exe');

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

        return startSelenium(done, options);
    });

    grunt.registerTask('stopSelenium', 'Stops the Selenium Webdriver', function(){
        var done = this.async();
        return stopSelenium(done);
    });

};
