<?php
/**
 * Script to create the language data in JSON format for ULS.
 *
 * Copyright (C) 2012 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland and other
 * contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

include __DIR__ . '/spyc.php';

$data = file_get_contents( 'langdb.yaml' );
$parsed = spyc_load( $data );
$json = json_encode( $parsed );
$js = <<<JAVASCRIPT
// Please do not edit. This file is generated from data/langdb.yaml by ulsdata2json.php
( function ( $ ) {
	$.uls = $.uls || {};
	$.uls.data = $json;
} )( jQuery );

JAVASCRIPT;
file_put_contents( '../src/jquery.uls.data.js', $js );
