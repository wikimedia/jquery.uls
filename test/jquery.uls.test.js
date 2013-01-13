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

/*jshint sub:true */

( function ( $ ) {
	'use strict';

	module( 'jquery.uls' );

	/*
	 * Runs over all script codes mentioned in langdb and checks whether
	 * they belong to the 'Other' group.
	 */
	var orphanScripts = function () {
		var language, script,
			result = [];

		for ( language in $.uls.data.languages ) {
			script = $.uls.data.getScript( language );

			if ( $.uls.data.getGroupOfScript( script ) === 'Other' ) {
				result.push( script );
			}
		}

		return result;
	};

	/*
	 * Runs over all languages and checks that all redirects have a valid target.
	 */
	var badRedirects = function () {
		var language, target,
			result = [];

		for ( language in $.uls.data.languages ) {
			target = $.uls.data.isRedirect( language );

			if ( target && !$.uls.data.languages[target] ) {
				result.push( language );
			}
		}

		return result;
	};

	/*
	 * Runs over all languages and checks that all redirects point to a language.
	 * There's no reason to have double redirects.
	 */
	var doubleRedirects = function () {
		var language, target,
			result = [];

		for ( language in $.uls.data.languages ) {
			target = $.uls.data.isRedirect( language );

			if ( target && $.uls.data.isRedirect( target ) ) {
				result.push( language );
			}
		}

		return result;
	};

	/*
	 * Runs over all script codes mentioned in langdb and checks whether
	 * they have something that looks like an autonym.
	 */
	var languagesWithoutAutonym = function () {
		var language,
			result = [];

		for ( language in $.uls.data.languages ) {
			if ( typeof $.uls.data.getAutonym( language ) !== 'string' ) {
				result.push( language );
			}
		}

		return result;
	};

	test( '-- Initial check', 1, function ( assert ) {
		assert.ok( $.fn.uls, '$.fn.uls is defined' );
	} );

	test( '-- $.uls.data testing', 46, function ( assert ) {
		var autonyms,
			allLanguagesByRegionAndScript,
			languagesInEU,
			languagesByScriptInAM, languagesByScriptInEU,
			languagesToGroup, groupedLanguages,
			languagesByScriptGroupInEMEA,
			allLanguagesByScriptGroup;

		// Add a language in run time.
		// This is done early to make sure that it doesn't break other functions.
		$.uls.data.addLanguage( 'qqq', {
			script: 'Latn',
			regions: ['SP'],
			autonym: 'Language documentation'
		} );

		assert.ok( $.uls.data.getAutonym( 'qqq' ), 'Language documentation', 'Language qqq was added with the correct autonym' );

		assert.strictEqual( $.uls.data.isRedirect( 'sr-ec' ), 'sr-cyrl', '"sr-ec" is a redirect to "sr-cyrl"' );
		autonyms = $.uls.data.getAutonyms();
		assert.strictEqual( autonyms['zu'], 'isiZulu', 'Correct autonym is returned for Zulu using getAutonyms().' );
		assert.strictEqual( autonyms['pa'], undefined, 'Language "pa" is not listed in autonyms, because it is a redirect' );
		assert.strictEqual( autonyms['pa-guru'], 'ਪੰਜਾਬੀ', 'Language "pa-guru" has the correct autonym' );

		// This test assumes that we don't want any scripts to be in the 'Other'
		// group. Actually, this may become wrong some day.
		assert.deepEqual( orphanScripts(), [], 'All scripts belong to script groups.' );

		assert.deepEqual( badRedirects(), [], 'All redirects have valid targets.' );
		assert.deepEqual( doubleRedirects(), [], 'There are no double redirects.' );
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
		assert.strictEqual( $.uls.data.getRegions( 'no-such-language' ), 'UNKNOWN', 'The region of an invalid language is "UNKNOWN"' );

		allLanguagesByRegionAndScript = $.uls.data.getAllLanguagesByRegionAndScript();
		assert.deepEqual( allLanguagesByRegionAndScript['4']['AS']['SouthEastAsian']['Bugi'], [
			'bug'
		], 'All languages in the Buginese script in Asia were selected' );
		assert.deepEqual( allLanguagesByRegionAndScript['4']['AS']['SouthAsian']['Guru'], [
			'pa-guru'
		], 'Only language pa-guru appears as a language in script Guru in SouthAsian languages in Asia' );

		languagesInEU = $.uls.data.getLanguagesInRegion( 'EU' );
		assert.strictEqual( $.inArray( 'sr-ec', languagesInEU ), -1, 'Language "sr-ec" does not appear in languages of region EU, because it is a redirect' );
		assert.ok( $.inArray( 'sr-cyrl', languagesInEU ) > -1, 'Language "sr-cyrl" appears in languages of region EU, because it is not a redirect' );

		assert.deepEqual( $.uls.data.getLanguagesInRegion( 'PA' ),
			[
				'ace', 'bi', 'ch', 'en-gb', 'en', 'fj', 'haw', 'hif', 'ho', 'jv', 'jv-java',
				'mh', 'mi', 'na', 'niu', 'pih', 'pis', 'pt', 'rtm', 'sm', 'tet',
				'to', 'tpi', 'ty', 'wls'
			],
			'languages of region PA are selected correctly' );
		assert.deepEqual( $.uls.data.getLanguagesInRegions( ['AM', 'WW'] ),
			[
				'akz', 'arn', 'aro', 'ase', 'avk', 'ay', 'cho', 'chr', 'chy', 'cr', 'cr-latn',
				'en-ca', 'en', 'eo', 'es-419', 'es-formal', 'es', 'esu', 'fr', 'frc', 'gcf', 'gn',
				'guc', 'haw', 'ht', 'ia', 'ie', 'ik', 'ike-cans', 'ike-latn', 'io', 'iu', 'jam',
				'jbo', 'kgp', 'kl', 'lad-latn', 'lad-hebr', 'lfn', 'mfe', 'mic', 'mus', 'nah', 'nl-informal', 'nl',
				'nov', 'nv', 'pap', 'pdc', 'pdt', 'ppl', 'pt-br', 'pt', 'qu', 'qug', 'rap', 'sei',
				'simple', 'srn', 'tokipona', 'vo', 'yi', 'yrl', 'yua'
			],
			'languages of regions AM and WW are selected correctly'
		);

		assert.deepEqual( $.uls.data.getLanguagesInScript( 'Knda' ), [
			'kn', 'tcy'
		], 'languages in script Knda are selected correctly' );
		assert.deepEqual( $.uls.data.getLanguagesInScript( 'Guru' ),
			['pa-guru'],
			'"pa-guru" is written in script Guru, and "pa" is skipped as a redirect'
		);
		assert.deepEqual( $.uls.data.getLanguagesInScripts( ['Geor', 'Armn'] ),
			['hy', 'ka', 'xmf'],
			'languages in scripts Geor and Armn are selected correctly'
		);

		assert.deepEqual( $.uls.data.getRegionsInGroup( 3 ), [
			'EU', 'ME', 'AF'
		], 'regions in group 3 are selected correctly' );
		assert.deepEqual( $.uls.data.getRegionsInGroup( 2 ), [
			'AM'
		], 'regions in group 2 are selected correctly' );
		assert.deepEqual( $.uls.data.getRegionsInGroup( 1 ), [
			'WW', 'SP'
		], 'regions in group 1 are selected correctly' );

		languagesByScriptInAM = $.uls.data.getLanguagesByScriptInRegion( 'AM' );
		assert.deepEqual( languagesByScriptInAM['Cans'], [
			'cr', 'ike-cans', 'iu'
		], 'correct languages in Cans in AM selected' );

		languagesByScriptInEU = $.uls.data.getLanguagesByScriptInRegion( 'EU' );
		assert.strictEqual( $.inArray( 'sr-el', languagesByScriptInEU['Latn'] ), -1,
			'Language "sr-el" does not appear as a Latin-script language in EU, because it is a redirect' );
		assert.ok( $.inArray( 'sr-latn', languagesByScriptInEU['Latn'] ) > -1,
			'Language "sr-latn" appears as a Latin-script language in EU, because it is not a redirect' );

		assert.strictEqual( $.uls.data.getAutonym( 'pa' ), 'ਪੰਜਾਬੀ', 'Correct autonym of the Punjabi language was selected using code pa.' );
		assert.strictEqual( $.uls.data.getAutonym( 'pa-guru' ), 'ਪੰਜਾਬੀ', 'Correct autonym of the Punjabi language was selected using code pa-guru.' );

		languagesToGroup = {
			'en': 'English',
			'fiu-vro': 'Võro', // Alias before target
			'ru': 'русский',
			'sr': 'српски', // Alias before target
			'sr-cyrl': 'српски', // Target before alias
			'sr-latn': 'srpski', // Target before alias
			'sr-el': 'srpski', // Alias after target
			'vro': 'Võro' // Target after alias
		};
		groupedLanguages = {
			Latin: [ 'en', 'vro', 'sr-latn' ],
			Cyrillic: [ 'ru', 'sr-cyrl' ]
		};

		assert.deepEqual( $.uls.data.getLanguagesByScriptGroup( languagesToGroup ), groupedLanguages,
			'A custom list of languages is grouped correctly using getLanguagesByScriptGroup.' );

		languagesByScriptGroupInEMEA = $.uls.data.getLanguagesByScriptGroupInRegions( $.uls.data.getRegionsInGroup( 3 ) );
		assert.deepEqual( languagesByScriptGroupInEMEA['WestCaucasian'], [
			'hy', 'ka', 'xmf'
		], 'Correct languages in WestCaucasian script group in EMEA selected' );
		assert.strictEqual( $.inArray( 'sr-ec', languagesByScriptGroupInEMEA['Cyrillic'] ), -1,
			'Language "sr-ec" does not appear as a Cyrillic-scriptgroup language in EMEA, because it is a redirect' );
		assert.ok( $.inArray( 'sr-cyrl', languagesByScriptGroupInEMEA['Cyrillic'] ) > -1,
			'Language "sr-cyrl" appears as a Cyrillic-scriptgroup language in EMEA, because it is not a redirect' );

		allLanguagesByScriptGroup = $.uls.data.getAllLanguagesByScriptGroup();
		assert.deepEqual( allLanguagesByScriptGroup['Greek'], [
			'el', 'grc', 'pnt', 'ruq-grek', 'tsd'
		], 'All languages in the Greek script found' );

		assert.deepEqual( $.uls.data.getAllRegions(), [
			'WW', 'SP', 'AM', 'EU', 'ME', 'AF', 'AS', 'PA'
		], 'All regions found' );

		// autonyms: gn: avañe'ẽ, de: deutsch, hu: magyar, fi: suomi
		assert.deepEqual( ['de', 'fi', 'gn', 'hu'].sort( $.uls.data.sortByAutonym ), [
			'gn', 'de', 'hu', 'fi'
		], 'Languages are correctly sorted by autonym' );

		assert.strictEqual( $.uls.data.isRtl( 'te' ), false, 'Telugu language is not RTL' );
		assert.strictEqual( $.uls.data.isRtl( 'dv' ), true, 'Divehi language is RTL' );
		assert.strictEqual( $.uls.data.getDir( 'mzn' ), 'rtl', 'Mazandarani language is RTL' );
		assert.strictEqual( $.uls.data.getDir( 'uk' ), 'ltr', 'Ukrainian language is LTR' );

		assert.ok(
			$.inArray( 'sah', $.uls.data.getLanguagesInTerritory( 'RU' ) ) > -1,
			'Sakha language is spoken in Russia'
		);

		assert.ok( $.uls.data.deleteLanguage( 'qqq' ), 'Deleting language qqq, which was added earlier, returns true.' );
		assert.strictEqual( $.uls.data.languages['qqq'], undefined, 'Data about qqq is undefined after being deleted.' );
		assert.ok( !$.uls.data.deleteLanguage( 'qqr' ), 'Deleting language qqr, which was never added, returns false.' );
	} );

}( jQuery ) );
