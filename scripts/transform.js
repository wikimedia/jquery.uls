const through = require( 'through' );

module.exports = function () {
	let data = '( function ( $ ) {\n\t$.uls = $.uls || {};\n\t$.uls.data = ';

	const write = function ( buf ) {
		data += buf;
		return data;
	};

	const end = function () {
		data += '\n} ( jQuery ) );';
		this.queue( data );
		this.queue( null );
	};

	return through( write, end );
};
