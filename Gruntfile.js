module.exports = function(grunt){
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        srcFiles: {
            js: [
                'src/js/angular-slider*.js'
            ],
            less: [
                'src/less/angular-slider.less'
            ]
        },
        concat: {
            js: {
                src: ['<%= srcFiles.js %>'],
                dest: '<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*\n <%= pkg.name %> v<%= pkg.version %> \n (c) 2013-2014 Venturocket, Inc. http://github.com/Venturocket \n License: MIT \n*/\n'
            },
            build: {
                src: ['<%= srcFiles.js %>'],
                dest: '<%= pkg.name %>.min.js'
            }
        },
		less: {
			concat: {
				files: {
					'<%= pkg.name %>.css': '<%= srcFiles.less %>'
				}
			},
			min: {
				options: {
					compress: true,
					banner: '/*\n <%= pkg.name %> v<%= pkg.version %> \n (c) 2013-2014 Venturocket, Inc. http://github.com/Venturocket \n License: MIT \n*/\n'
				},
				files  : {
					'<%= pkg.name %>.min.css': '<%= srcFiles.less %>'
				}
			}
		},
		watch: {
			options: {
				interrupt: true,
				livereload: true,
				livereloadOnError: false,
				atBegin: true
			},
			js: {
				files: ['<%= srcFiles.js %>'],
				tasks: ['concat', 'uglify']
			},
			less: {
				files: ['<%= srcFiles.less %>'],
				tasks: ['less']
			},
			html: {
				files: ['*.html'],
				tasks: false
			},
			grunt: {
				files: ['Gruntfile.js'],
				tasks: ['concat', 'uglify', 'less'],
				options: {
					reload: true
				}
			}
		}
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['watch']);

};
