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
			var script = $.uls.data.script( language );
			if ( $.uls.data.groupOfScript( script ) === 'Other' ) {
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
			if ( typeof $.uls.data.autonym( language ) !== 'string' ) {
				result.push( language );
			}
		}

		return result;
	};

	test( "-- Initial check", 1, function ( assert ) {
		assert.ok( $.fn.uls, "$.fn.uls is defined" );
	} );

	test( "-- $.uls.data testing", 27, function ( assert ) {

		assert.strictEqual( $.uls.data.autonyms()['he'], 'עברית', 'Correct autonym is returned for Hebrew using autonyms().' );

		// This test assumes that we don't want any scripts to be in the 'Other'
		// group. Actually, this may become wrong some day.
		assert.deepEqual( orphanScripts(), [], 'All scripts belong to script groups.' );
		assert.deepEqual( languagesWithoutAutonym(), [], 'All languages have autonyms.' );

		assert.strictEqual(
			$.uls.data.groupOfScript( 'Beng' ),
			'SouthAsian',
			'Bengali script belongs to the SouthAsian group.'
		);
		assert.strictEqual(
			$.uls.data.scriptGroupOfLanguage( 'iu' ),
			'NativeAmerican',
			'The script of the Inupiaq language belongs to the NativeAmerican group.'
		);

		assert.strictEqual( $.uls.data.script( 'ii' ), 'Yiii', 'Correct script of the Yi language was selected' );
		assert.deepEqual( $.uls.data.regions( 'lzz' ), [
			'EU', 'ME'
		], 'Correct regions of the Laz language were selected' );
		assert.strictEqual( $.uls.data.regions( 'no-such-language' ), 'UNKNOWN', "The region of an invalid language is 'UNKNOWN'" );

		var allLanguagesByRegionAndScript = $.uls.data.allLanguagesByRegionAndScript();
		assert.deepEqual( allLanguagesByRegionAndScript['4']['AS']['SouthEastAsian']['Bugi'], [
			'bug'
		], 'All languages in the Buginese script in Asia were selected' );

		assert.deepEqual( $.uls.data.languagesInRegion( "PA" ),
			[
				"ace", "bi", "ch", "en-gb", "en", "fj", "haw", "hif-latn", "hif", "ho", "jv",
				"mh", "mi", "na", "niu", "pih", "pis", "pt", "rtm", "sm", "tet",
				"to", "tpi", "ty", "wls"
			],
			"languages of region PA are selected correctly" );
		assert.deepEqual( $.uls.data.languagesInRegions( ["AM", "WW"] ),
			[
				"akz", "arn", "aro", "ase", "avk", "ay", "cho", "chr", "chy", "cr-cans", "cr-latn",
				"cr", "en-ca", "en", "eo", "es-419", "es-formal", "es", "esu", "fr", "gcf", "gn",
				"guc", "haw", "ht", "ia", "ie", "ik", "ike-cans", "ike-latn", "io", "iu", "jam",
				"jbo", "kgp", "kl", "lad", "lfn", "mfe", "mic", "mus", "nah", "nl-informal", "nl",
				"nov", "nv", "pap", "pdc", "pdt", "ppl", "pt-br", "pt", "qu", "qug", "rap", "sei",
				"simple", "srn", "tokipona", "vo", "yi", "yrl", "yua"
			],
			"languages of regions AM and WW are selected correctly"
		);

		assert.deepEqual( $.uls.data.languagesInScript( 'Knda' ), [
			"kn", "tcy"
		], "languages in script Knda are selected correctly" );
		assert.deepEqual( $.uls.data.languagesInScripts( ['Geor', 'Armn'] ),
			["hy", "ka", "xmf"],
			"languages in scripts Geor and Armn are selected correctly"
		);

		assert.deepEqual( $.uls.data.regionsInGroup( 3 ), [
			"EU", "ME", "AF"
		], "regions in group 3 are selected correctly" );
		assert.deepEqual( $.uls.data.regionsInGroup( 2 ), [
			"AM"
		], "regions in group 2 are selected correctly" );
		assert.deepEqual( $.uls.data.regionsInGroup( 1 ), [
			"WW"
		], "regions in group 1 are selected correctly" );

		var languagesByScriptInAM = $.uls.data.languagesByScriptInRegion( "AM" );
		assert.deepEqual( languagesByScriptInAM['Cans'], [
			"cr-cans", "cr", "ike-cans", "iu"
		], "correct languages in Cans in AM selected" );

		assert.strictEqual( $.uls.data.autonym( 'pa' ), 'ਪੰਜਾਬੀ', 'Correct autonym of the Punjabi language was selected' );

		var languagesByScriptGroupInEMEA = $.uls.data.languagesByScriptGroupInRegions( $.uls.data.regionsInGroup( 3 ) );
		assert.deepEqual( languagesByScriptGroupInEMEA['WestCaucasian'], [
			'hy', 'ka', 'xmf'
		], 'Correct languages in WestCaucasian script group in EMEA selected' );

		var allLanguagesByScriptGroup = $.uls.data.allLanguagesByScriptGroup();
		assert.deepEqual( allLanguagesByScriptGroup['Greek'], [
			'el', 'grc', 'pnt', 'ruq-grek', 'tsd'
		], 'All languages in the Greek script found' );

		assert.deepEqual( $.uls.data.allRegions(), [
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

		assert.ok( $.inArray( "sah", $.uls.data.languagesInTerritory( "RU" ) )
			> -1, "Sakha language is spoken in Russia" );
	} );

}( jQuery ) );
