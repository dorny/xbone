module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		clean: {
			'test-build': ['test-build']
		},

		copy: {

			src2test: {
				files: [{
					expand: true,
					src: ['src/*'],
					dest: 'test-build'
				}]
			},

			test2build: {
				files: [{
					expand: true,
					cwd: 'test',
					src: ['*','**/*'],
					dest: 'test-build'
				}]
			},
		},

		ts: {
			options: {
				target: 'es5',
				module: 'commonjs',
				sourcemap: false,
				declaration: true,
				comments: true
			},

			src: {
				src: ["src/**/*.ts"],
				// watch: 'src',
				outDir: 'test-build/src'
			},

			test: {
				src: ["test-build/**/*.ts"],
				// watch: 'test',
			},
		},

		browserify: {
		  webapp: {
		    files: {
		      'test-build/webapp/main.js': ['test-build/webapp/src/**/*.js'],
		    },
		    options: {
		    	debug: true
		    }
		  }
		},

		yuidoc: {
			compile: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: 'src',
					extension: '.ts',
					// themedir: 'path/to/custom/theme/',
					outdir: 'doc/api'
				}
			}
		}

	})

	grunt.loadNpmTasks('grunt-contrib-clean')
	grunt.loadNpmTasks('grunt-contrib-copy')
	grunt.loadNpmTasks('grunt-contrib-yuidoc')
	grunt.loadNpmTasks('grunt-browserify')
	grunt.loadNpmTasks("grunt-ts")

	grunt.registerTask('default', ['ts:src'])

	grunt.registerTask('test-build', [
		'clean'
		, 'copy:src2test'
		, 'copy:test2build'
		, 'ts:test'
		, 'browserify:webapp'
	])

	grunt.registerTask('doc', ['yuidoc'])
}
