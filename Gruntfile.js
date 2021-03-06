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

        startSelenium: {
            options: {
                host: 'localhost',
                port: 4445,
                browser: 'chrome',
                version: '3.9',
                subversion: '1',
                libpath: 'downloads'
            }
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // Load in `grunt-curl`
    grunt.loadNpmTasks('grunt-curl');
    // Load in `grunt-zip`
    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('default', ['startSelenium', 'stopSelenium']);

};
