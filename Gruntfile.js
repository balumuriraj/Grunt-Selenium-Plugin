/*
 * grunt-selenium-plugin
 * https://github.com/balumuriraj/Grunt-Selenium-Plugin
 *
 * Copyright (c) 2015 MohanRaj
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path'),
    LIBRARY_PATH = 'lib',
    SEL_JAR_PATH = path.resolve(process.cwd(), LIBRARY_PATH, 'selenium-server-standalone-2.44.0.jar'),
    CHROME_DRIVER_PATH = path.resolve(process.cwd(), LIBRARY_PATH),
    CHROME_DRIVER_ZIP_PATH = path.resolve(process.cwd(), LIBRARY_PATH, 'chromedriver_win32.zip');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        curl: {
            'download-selenium': {
                src: 'http://selenium-release.storage.googleapis.com/2.44/selenium-server-standalone-2.44.0.jar',
                dest: SEL_JAR_PATH
            },

            'download-chromedriver': {
                src: 'http://chromedriver.storage.googleapis.com/2.14/chromedriver_win32.zip',
                dest: CHROME_DRIVER_ZIP_PATH
            }
        },

        unzip: {
            'chrome': {
                src: CHROME_DRIVER_ZIP_PATH,
                dest: CHROME_DRIVER_PATH
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // Load in `grunt-curl`
    grunt.loadNpmTasks('grunt-curl');
    // Load in `grunt-zip`
    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('start_selenium', function(){
        if(grunt.file.exists(SEL_JAR_PATH) && grunt.file.exists(CHROME_DRIVER_ZIP_PATH)){
            grunt.log.ok(['Selenium JAR and chromedriver already exists! Download not required..']);
            grunt.task.run(['startSelenium']);
        }
        else{
            grunt.log.error(['Selenium JAR and chromedriver doesnt exists! Downloading required files..']);
            grunt.task.run(['curl:download-selenium', 'curl:download-chromedriver', 'unzip:chrome', 'startSelenium']);
        }
    });

    grunt.registerTask('stop_selenium', ['stopSelenium']);
};
