# grunt-selenium-plugin

> Grunt plugin for Selenium with Chrome driver

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-selenium-plugin --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-selenium-plugin');
```

## The "startSelenium" task

### Overview
This Grunt plugin will download the Selenium jar based on your options and place it in the 'lib' folder of the root directory. If chrome is selected as the browser, then the chrome driver is downloaded based on your OS and places it in the 'lib' folder of the root directory. To start selenium, you have to run the task 'startSelenium'. To stop selenium, run the task 'stopSelenium' (Anyway, when the grunt process stops the selenium will be automatically stopped).

In your project's Gruntfile, add a section named `startSelenium` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  startSelenium: {
    options: {
      // Task-specific options go here.
    }
  },
});
```

### Options
You can specify various options to the selenium. Following are the options that are accepted:

#### host
You can specify the host, if you want it other than 127.0.0.1

#### port
You can specify the port, on which you want to run the selenium. Default is 4444.

#### browser
You can specify the browser, in which you want to run the selenium. Default is chrome. You can specify firefox or safari as-well. When chrome is selected as browser, chrome driver will be downloaded to lib folder.

#### version
You can specify the selenium version, if you want to use a specific selenium version. The default is 2.44

#### subversion
You can specify the selenium sub-version, on which you want to run the selenium. Default is 0. (In case if you dont understand it is the last digit of the selenium version. ex: subversion of 2.44.0 version is 0).

### Usage Examples
Below is an example:

```js
grunt.initConfig({
    startSelenium: {
        options: {
            host: 'localhost',
            port: 4445,
            browser: 'firefox',
            version: '2.43',
            subversion: '1'
        }
    }
});

grunt.loadNpmTasks('grunt-selenium-plugin');

grunt.registerTask('default', ['startSelenium', 'intern:client', 'stopSelenium']);
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Notes
I have used a similar approach as grunt-selenium-webdriver by levexis (https://github.com/levexis/grunt-selenium-webdriver). But with some major changes like chrome driver support and custom options.

## Release History
The latest release 0.2.1 supports Windows, MAC and Linux OS as-well.
