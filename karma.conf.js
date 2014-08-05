/**
 * Created with IntelliJ IDEA.
 * User: Joe Linn
 * Date: 8/9/13
 * Time: 10:00 AM
 * To change this template use File | Settings | File Templates.
 */
module.exports = function(config){
    config.set({

        files: [
            //libraries
            'lib/jquery-2.0.3.min.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',

            //our directive(s)
            'src/js/angular-slider_app.js',
            'src/js/angular-slider_controllers.js',
            'src/js/angular-slider_directives.js',
               
            //styles
            'angular-slider.css',

            //tests
            'src/js/*_test.js'
        ],
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
		reporters: 'dots'
    });
};
