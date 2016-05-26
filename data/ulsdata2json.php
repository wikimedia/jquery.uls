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

print "Reading langdb.yaml...\n";
$yamlLangdb = file_get_contents( 'langdb.yaml' );
$parsedLangdb = spyc_load( $yamlLangdb );

$supplementalDataFilename = 'supplementalData.xml';
$supplementalDataUrl =
	"http://unicode.org/repos/cldr/trunk/common/supplemental/$supplementalDataFilename";

$curl = curl_init( $supplementalDataUrl );
$supplementalDataFile = fopen( $supplementalDataFilename, 'w' );

curl_setopt( $curl, CURLOPT_FILE, $supplementalDataFile );
curl_setopt( $curl, CURLOPT_HEADER, 0 );

print "Trying to download $supplementalDataUrl...\n";
$curlSuccess = curl_exec( $curl );
curl_close( $curl );
fclose( $supplementalDataFile );

if ( !$curlSuccess ) {
	die( "Failed to download CLDR data from $supplementalDataUrl.\n" );
}
print "Downloaded $supplementalDataFilename, trying to parse...\n";

$supplementalData = simplexml_load_file( $supplementalDataFilename );

if ( !( $supplementalData instanceof SimpleXMLElement ) ) {
	die( "Attempt to load CLDR data from $supplementalDataFilename failed.\n" );
}

print "CLDR supplemental data parsed successfully, reading territories info...\n";
$parsedLangdb['territories'] = array();

foreach ( $supplementalData->territoryInfo->territory as $territoryRecord ) {
	$territoryAtributes = $territoryRecord->attributes();
	$territoryCodeAttr = $territoryAtributes['type'];
	$territoryCode = (string) $territoryCodeAttr[0];
	$parsedLangdb['territories'][$territoryCode] = array();

	foreach ( $territoryRecord->languagePopulation as $languageRecord ) {
		$languageAttributes = $languageRecord->attributes();
		$languageCodeAttr = $languageAttributes['type'];
		// Lower case is a convention for language codes in ULS.
		// '_' is used in CLDR for compound codes and it's replaced with '-' here.
		$parsedLangdb['territories'][$territoryCode][] =
			strtr( strtolower( (string) $languageCodeAttr[0] ), '_', '-' );
	}
}

foreach ( $parsedLangdb['territories'] as $territoryCode => $languages ) {
	foreach ( $languages as $index => $language ) {
		if ( !isset( $parsedLangdb['languages'][$language] ) ) {
			echo "Unknown language $language for territory $territoryCode\n";
			unset( $parsedLangdb['territories'][$territoryCode][$index] );
			continue;
		}

		$data = $parsedLangdb['languages'][$language];
		if ( count( $data ) === 1 ) {
			echo "Redirect for language $language to {$data[0]} territory $territoryCode\n";
			$parsedLangdb['territories'][$territoryCode][$index] = $data[0];
			continue;
		}
	}

	// Clean-up to save space
	if ( count( $parsedLangdb['territories'][$territoryCode] ) === 0 ) {
		unset( $parsedLangdb['territories'][$territoryCode] );
		continue;
	}

	// We need to renumber or json conversion thinks these are objects
	$parsedLangdb['territories'][$territoryCode] =
		array_values( $parsedLangdb['territories'][$territoryCode] );
}

print "Writing JSON langdb...\n";
$jsonVerbose = json_encode( $parsedLangdb, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
$jsonSlim = json_encode( $parsedLangdb, JSON_UNESCAPED_UNICODE );
$js = <<<JAVASCRIPT
// Please do not edit. This file is generated from data/langdb.yaml by ulsdata2json.php
( function ( $ ) {
	'use strict';
	$.uls = $.uls || {};
	//noinspection JSHint
	$.uls.data = $jsonSlim;
} ( jQuery ) );

JAVASCRIPT;
file_put_contents( '../src/jquery.uls.data.js', $js );
// For making diff review easier.
file_put_contents( 'generated-langdb.json', $jsonVerbose );

print "Done.\n";
