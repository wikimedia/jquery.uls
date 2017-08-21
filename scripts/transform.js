var through = require( 'through' );

module.exports = function ( file ) {
	var data, end, write;
	data = '( function ( $ ) {\n\t$.uls = $.uls || {};\n\t$.uls.data = ';
	write = function ( buf ) {
		return data += buf;
	};
	end = function () {
		data += '\n} ( jQuery ) );';
		this.queue( data );
		return this.queue( null );
	};
	return through( write, end );
};
