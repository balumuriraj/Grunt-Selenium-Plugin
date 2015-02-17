/*
 * grunt-selenium-plugin
 * https://github.com/balumuriraj/Grunt-Selenium-Plugin
 *
 * Copyright (c) 2015 MohanRaj
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        curl: {
            'download-selenium': {
                src: 'http://selenium-release.storage.googleapis.com/2.44/selenium-server-standalone-2.44.0.jar',
                dest: './lib/selenium-server-standalone-2.44.0.jar'
            },

            'download-chromedriver': {
                src: 'http://chromedriver.storage.googleapis.com/2.14/chromedriver_win32.zip',
                dest: './lib/chromedriver_win32.zip'
            }
        },

        unzip: {
            'chrome': {
                src: './lib/chromedriver_win32.zip',
                dest: './lib/'
            }
        },

        start_selenium: {
            options: {

            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // Load in `grunt-curl`
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-zip');


    // These plugins provide necessary tasks.
    //grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-clean');
    //grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    //grunt.registerTask('test', ['clean', 'selenium_plugin', 'nodeunit']);

    // By default, lint and run all tests.
    //grunt.registerTask('default', ['jshint', 'test']);

    grunt.registerTask('default', ['curl:download-selenium', 'curl:download-chromedriver', 'unzip:chrome']);
};
