/*jshint node:true */
'use strict';
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );

	grunt.initConfig( {
		jshint: {
			options: {
				jshintrc: true
			},
			all: ['*.js', 'src/*.js']
		},
		qunit: {
			all: 'test/index.html'
		}
	} );

	grunt.registerTask( 'lint', 'jshint' );
	grunt.registerTask( 'test', ['lint', 'qunit'] );
	grunt.registerTask( 'default', 'test' );
};
