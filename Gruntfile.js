module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg:      grunt.file.readJSON('package.json'),
		srcFiles: {
			js:   [
				'src/js/angular-slider_app.js',
				'src/js/angular-slider_directives.js',
				'src/js/angular-slider_controllers.js'
			],
			less: {
				base: [
					'src/less/angular-slider.less'
				],
				templates: {
					simple: [
						'src/less/templates/simple.less'
					]
				}
			}
		},
		concat:   {
			js: {
				src:  ['<%= srcFiles.js %>'],
				dest: '<%= pkg.name %>.js'
			}
		},
		uglify:   {
			options: {
				banner: '/*\n <%= pkg.name %> v<%= pkg.version %> \n (c) 2013-2014 Venturocket, Inc. http://github.com/Venturocket \n License: MIT \n*/\n'
			},
			build:   {
				src:  ['<%= srcFiles.js %>'],
				dest: '<%= pkg.name %>.min.js'
			}
		},
		less:     {
			concat:    {
				files: {
					'<%= pkg.name %>.css': '<%= srcFiles.less.base %>',
					'<%= pkg.name %>.tmpl.simple.css': '<%= srcFiles.less.templates.simple %>'
				}
			},
			min:      {
				options: {
					compress: true,
					banner:   '/*\n <%= pkg.name %> v<%= pkg.version %> \n (c) 2013-2014 Venturocket, Inc. http://github.com/Venturocket \n License: MIT \n*/\n'
				},
				files:   {
					'<%= pkg.name %>.min.css': '<%= srcFiles.less.base %>',
					'<%= pkg.name %>.tmpl.simple.min.css': '<%= srcFiles.less.templates.simple %>'
				}
			}
		},
		watch:    {
			options: {
				interrupt:         true,
				livereload:        true,
				livereloadOnError: false,
				atBegin:           true
			},
			js:      {
				files: ['<%= srcFiles.js %>'],
				tasks: ['concat', 'uglify']
			},
			less:    {
				files: ['src/less/*.less'],
				tasks: ['less']
			},
			html:    {
				files: ['*.html'],
				tasks: false
			},
			grunt:   {
				files:   ['Gruntfile.js'],
				tasks:   ['concat', 'uglify', 'less'],
				options: {
					reload: true
				}
			}
		},
		karma:    {
			options: {
				configFile: 'karma.conf.js'
			},
			unit:    {
				autoWatch: true
			},
			travis:  {
				singleRun: true
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	// Default task(s).
	grunt.registerTask('default', ['watch']);

	grunt.registerTask('test', ['karma:travis']);

};
