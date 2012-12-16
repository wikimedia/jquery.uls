/**
 * QUnit tests for ULS.
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
 */
( function ( $ ) {
	'use strict';

	module( 'jquery.uls' );

	/*
	 * Runs over all script codes mentioned in langdb and checks whether
	 * they belong to the 'Other' group.
	 */
	var orphanScripts = function () {
		var result = [];

		for ( var language in $.uls.data.languages ) {
			var script = $.uls.data.getScript( language );
			if ( $.uls.data.getGroupOfScript( script ) === 'Other' ) {
				result.push( script );
			}
		}

		return result;
	};

	/*
	 * Runs over all script codes mentioned in langdb and checks whether
	 * they have something that looks like an autonym.
	 */
	var languagesWithoutAutonym = function () {
		var result = [];

		for ( var language in $.uls.data.languages ) {
			if ( typeof $.uls.data.getAutonym( language ) !== 'string' ) {
				result.push( language );
			}
		}

		return result;
	};

	test( "-- Initial check", 1, function ( assert ) {
		assert.ok( $.fn.uls, "$.fn.uls is defined" );
	} );

	test( "-- $.uls.data testing", 29, function ( assert ) {

		assert.strictEqual( $.uls.data.isRedirect( 'sr-ec' ), 'sr-cyrl', "'sr-ec' is a redirect to 'sr-cyrl'" );
		assert.strictEqual( $.uls.data.getAutonyms()['he'], 'עברית', 'Correct autonym is returned for Hebrew using getAutonyms().' );

		// This test assumes that we don't want any scripts to be in the 'Other'
		// group. Actually, this may become wrong some day.
		assert.deepEqual( orphanScripts(), [], 'All scripts belong to script groups.' );
		assert.deepEqual( languagesWithoutAutonym(), [], 'All languages have autonyms.' );

		assert.strictEqual(
			$.uls.data.getGroupOfScript( 'Beng' ),
			'SouthAsian',
			'Bengali script belongs to the SouthAsian group.'
		);
		assert.strictEqual(
			$.uls.data.getScriptGroupOfLanguage( 'iu' ),
			'NativeAmerican',
			'The script of the Inupiaq language belongs to the NativeAmerican group.'
		);

		assert.strictEqual( $.uls.data.getScript( 'ii' ), 'Yiii', 'Correct script of the Yi language was selected' );
		assert.deepEqual( $.uls.data.getRegions( 'lzz' ), [
			'EU', 'ME'
		], 'Correct regions of the Laz language were selected' );
		assert.strictEqual( $.uls.data.getRegions( 'no-such-language' ), 'UNKNOWN', "The region of an invalid language is 'UNKNOWN'" );

		var allLanguagesByRegionAndScript = $.uls.data.getAllLanguagesByRegionAndScript();
		assert.deepEqual( allLanguagesByRegionAndScript['4']['AS']['SouthEastAsian']['Bugi'], [
			'bug'
		], 'All languages in the Buginese script in Asia were selected' );

		assert.deepEqual( $.uls.data.getLanguagesInRegion( "PA" ),
			[
				"ace", "bi", "ch", "en-gb", "en", "fj", "haw", "hif", "hif-latn", "ho", "jv", "jv-java",
				"mh", "mi", "na", "niu", "pih", "pis", "pt", "rtm", "sm", "tet",
				"to", "tpi", "ty", "wls"
			],
			"languages of region PA are selected correctly" );
		assert.deepEqual( $.uls.data.getLanguagesInRegions( ["AM", "WW"] ),
			[
				"akz", "arn", "aro", "ase", "avk", "ay", "cho", "chr", "chy", "cr", "cr-cans", "cr-latn",
				"en-ca", "en", "eo", "es-419", "es-formal", "es", "esu", "fr", "gcf", "gn",
				"guc", "haw", "ht", "ia", "ie", "ik", "ike-cans", "ike-latn", "io", "iu", "jam",
				"jbo", "kgp", "kl", "lad", "lad-latn", "lad-hebr", "lfn", "mfe", "mic", "mus", "nah", "nl-informal", "nl",
				"nov", "nv", "pap", "pdc", "pdt", "ppl", "pt-br", "pt", "qu", "qug", "rap", "sei",
				"simple", "srn", "tokipona", "vo", "yi", "yrl", "yua"
			],
			"languages of regions AM and WW are selected correctly"
		);

		assert.deepEqual( $.uls.data.getLanguagesInScript( 'Knda' ), [
			"kn", "tcy"
		], "languages in script Knda are selected correctly" );
		assert.deepEqual( $.uls.data.getLanguagesInScript( 'Guru' ),
			["pa-guru"],
			"'pa-guru' is written in script Guru, and 'pa' is skipped as a redirect"
		);
		assert.deepEqual( $.uls.data.getLanguagesInScripts( ['Geor', 'Armn'] ),
			["hy", "ka", "xmf"],
			"languages in scripts Geor and Armn are selected correctly"
		);

		assert.deepEqual( $.uls.data.getRegionsInGroup( 3 ), [
			"EU", "ME", "AF"
		], "regions in group 3 are selected correctly" );
		assert.deepEqual( $.uls.data.getRegionsInGroup( 2 ), [
			"AM"
		], "regions in group 2 are selected correctly" );
		assert.deepEqual( $.uls.data.getRegionsInGroup( 1 ), [
			"WW"
		], "regions in group 1 are selected correctly" );

		var languagesByScriptInAM = $.uls.data.getLanguagesByScriptInRegion( "AM" );
		assert.deepEqual( languagesByScriptInAM['Cans'], [
			"cr", "cr-cans", "ike-cans", "iu"
		], "correct languages in Cans in AM selected" );

		assert.strictEqual( $.uls.data.getAutonym( 'pa' ), 'ਪੰਜਾਬੀ', 'Correct autonym of the Punjabi language was selected' );

		var languagesByScriptGroupInEMEA = $.uls.data.getLanguagesByScriptGroupInRegions( $.uls.data.getRegionsInGroup( 3 ) );
		assert.deepEqual( languagesByScriptGroupInEMEA['WestCaucasian'], [
			'hy', 'ka', 'xmf'
		], 'Correct languages in WestCaucasian script group in EMEA selected' );

		var allLanguagesByScriptGroup = $.uls.data.getAllLanguagesByScriptGroup();
		assert.deepEqual( allLanguagesByScriptGroup['Greek'], [
			'el', 'grc', 'pnt', 'ruq-grek', 'tsd'
		], 'All languages in the Greek script found' );

		assert.deepEqual( $.uls.data.getAllRegions(), [
			"WW", "AM", "EU", "ME", "AF", "AS", "PA"
		], "All regions found" );

		// autonyms: gn: avañe'ẽ, de: deutsch, hu: magyar, fi: suomi
		assert.deepEqual( ['de', 'fi', 'gn', 'hu'].sort( $.uls.data.sortByAutonym ), [
			'gn', 'de', 'hu', 'fi'
		], 'Languages are correctly sorted by autonym' );

		assert.strictEqual( $.uls.data.isRtl( "te" ), false, "Telugu language is not RTL" );
		assert.strictEqual( $.uls.data.isRtl( "dv" ), true, "Divehi language is RTL" );
		assert.strictEqual( $.uls.data.getDir( "mzn" ), "rtl", "Mazandarani language is RTL" );
		assert.strictEqual( $.uls.data.getDir( "uk" ), "ltr", "Ukrainian language is LTR" );

		assert.ok( $.inArray( "sah", $.uls.data.getLanguagesInTerritory( "RU" ) )
			> -1, "Sakha language is spoken in Russia" );
	} );

}( jQuery ) );
