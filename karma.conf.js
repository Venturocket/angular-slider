module.exports = function (config) {
    'use strict';
    var configuration = {
        basePath: '',
        frameworks: ['jasmine'],

        files: [
            //libraries
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-touch/angular-touch.js',
            'bower_components/angular-mocks/angular-mocks.js',

            //our directive(s)
            //'src/rangeInputSupported.js',
            //'src/angular-slider.js',
            'build/touk-angular-slider.js',

            //tests
            'test/*.js'
        ],
        autoWatch: true,
        browsers: ['Firefox', 'PhantomJS', 'Chrome', 'ChromeCanary'],
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        }
    };

    if (process.env.TRAVIS) {
        configuration.browsers = ['Chrome_travis_ci'];
    }

    config.set(configuration);

};
