module.exports = function(grunt){
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        srcFiles: {
            js: [
                'src/js/angular-slider*.js'
            ],
            less: [
                'src/js/angular-slider.less'
            ]
        },
        concat: {
            prod: {
                src: ['<%= srcFiles %>'],
                dest: '<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*\n <%= pkg.name %> v<%= pkg.version %> \n (c) 2013-2014 Venturocket, Inc. http://github.com/Venturocket \n License: MIT \n*/\n'
            },
            build: {
                src: ['<%= srcFiles %>'],
                dest: '<%= pkg.name %>.min.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'concat:prod']);

    grunt.loadNpmTasks('grunt-contrib-concat');

};
