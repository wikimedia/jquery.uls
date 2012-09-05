/*global module:false*/
module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-css');
	// Project configuration.
	grunt
			.initConfig({
				pkg : '<json:package.json>',
				meta : {
					banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - '
							+ '<%= grunt.template.today("yyyy-mm-dd") %>\n'
							+ '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>'
							+ '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;'
							+ ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
				},
				concat : {
					js : {
						src: [ '<banner:meta.banner>','src/jquery.uls.data.js',
						'src/jquery.uls.data.utils.js', 'src/jquery.uls.lcd.js',
						'src/jquery.uls.languagefilter.js', 'src/jquery.uls.regionfilter.js',
						 'src/jquery.uls.core.js'],
						dest : 'dist/<%= pkg.name %>.js'
					},
					css: {
						src: [ 'css/jquery.uls.css', 'css/jquery.uls.grid.css',
							'css/jquery.uls.lcd.css' ],
						dest : 'dist/<%= pkg.name %>.css'
					}
				},
				min : {
					dist : {
						src : [ '<banner:meta.banner>',
								'<config:concat.js.dest>' ],
						dest : 'dist/<%= pkg.name %>.min.js'
					}
				},
				cssmin : {
					dist: {
						src : '<config:concat.css.dest>',
						dest : 'dist/<%= pkg.name %>.min.css'
					}
				},
				lint : {
					files : [ 'src/**/*.js', 'test/**/*.js' ]
				},
				csslint : {
					file: [ 'css/**/*.css' ]
				},
				watch : {
					files : '<config:lint.files>',
					tasks : 'lint'
				},
				jshint : {
					options : {
						curly : true,
						eqeqeq : true,
						immed : true,
						latedef : true,
						newcap : true,
						noarg : true,
						sub : true,
						undef : true,
						boss : true,
						eqnull : true,
						browser : true,
						smarttabs : true,
						laxbreak : true,
						multistr: true
					},
					globals : {
						jQuery : true,
						QUnit : true,
						pluralRuleParser : true,
						_ : true,
						module : true,
						test : true
					}
				},
				uglify : {
					src : [ '<banner:meta.banner>', '<config:concat.dist.js>' ],
					dest : 'dist/<%= pkg.name %>.min.js'
				}
			});
	// Default task.
	grunt.registerTask('default', 'lint cssmin concat min csslint');
};
