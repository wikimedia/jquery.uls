'use strict';

/* eslint-env node, es6 */

module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );

	grunt.initConfig( {
		eslint: {
			options: {
				cache: true
			},
			all: [
				'**/*.{js,json,html}',
				'!src/jquery.uls.data.js',
				'!scripts/jquery.uls.data.template.js',
				'!examples/resources/*.min.js',
				'!node_modules/**',
				'!vendor/**'
			]
		},
		stylelint: {
			options: {
				syntax: 'css'
			},
			src: [
				'**/*.css',
				'!node_modules/**'
			]
		},
		qunit: {
			all: 'test/index.html'
		}
	} );

	grunt.registerTask( 'lint', [ 'eslint', 'stylelint' ] );
	grunt.registerTask( 'test', [ 'lint', 'qunit' ] );
	grunt.registerTask( 'default', 'test' );
};
