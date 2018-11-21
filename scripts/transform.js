var through = require( 'through' ); // eslint-disable-line no-implicit-globals

module.exports = function () {
	var data, end, write;
	data = '( function ( $ ) {\n\t$.uls = $.uls || {};\n\t$.uls.data = ';
	write = function ( buf ) {
		data += buf;
		return data;
	};
	end = function () {
		data += '\n} ( jQuery ) );';
		this.queue( data );
		return this.queue( null );
	};
	return through( write, end );
};
