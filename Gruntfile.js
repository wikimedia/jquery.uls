/*!
 * Grunt file
 *
 * @package jquery.i18n
 */
'use strict';
/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		jshint: {
			options: JSON.parse( grunt.file.read( '.jshintrc' )
				.replace( /\/\*(?:(?!\*\/)[\s\S])*\*\//g, '' ).replace( /\/\/[^\n\r]*/g, '' ) ),
			all: ['src/jquery.uls.core.js',
			'src/jquery.uls.lcd.js',
			'src/jquery.uls.data.utils.js',
			'src/jquery.uls.languagefilter.js',
			'src/jquery.uls.regionfilter.js' ]
		},
		qunit: {
			all: ['test/index.html']
		}
	} );

	grunt.registerTask( 'lint', ['jshint'] );
	grunt.registerTask( 'unit', ['qunit'] );
	grunt.registerTask( 'test', ['lint', 'unit'] );
	grunt.registerTask( 'default', ['test'] );
};
