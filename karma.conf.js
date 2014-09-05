module.exports = function(config){
    'use strict';
    config.set({
        basePath: '',
        frameworks: ['jasmine'],

        files: [
            //libraries
            'lib/jquery-2.0.3.min.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-touch/angular-touch.js',
            'bower_components/angular-mocks/angular-mocks.js',

            //our directive(s)
            'src/rangeInputSupported.js',
            'src/angular-slider.js',

            //tests
            'test/*.js'
        ],
        autoWatch: true,
        browsers: ['Firefox']
    });
};
