'use strict';

module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );

	grunt.initConfig( {
		eslint: {
			all: [
				'**/*.js',
				'src/jquery.uls.data.js',
				'!examples/**',
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

	grunt.registerTask( 'lint', [ 'eslint' ] );
	grunt.registerTask( 'test', [ 'lint', 'qunit' ] );
	grunt.registerTask( 'default', 'test' );
};
