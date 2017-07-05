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

	var orphanScripts, badRedirects, doubleRedirects, doubleAutonyms, languagesWithoutAutonym;

	/*
	 * Runs over all script codes mentioned in langdb and checks whether
	 * they belong to the 'Other' group.
	 */
	orphanScripts = function () {
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
	badRedirects = function () {
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
	 * Runs over all languages and checks that all autonyms are unique.
	 */
	doubleAutonyms = function () {
		var language, autonym,
			autonyms = [],
			duplicateAutonyms = [];

		for ( language in $.uls.data.languages ) {
			if ( $.uls.data.isRedirect( language ) ) {
				continue;
			}

			autonym = $.uls.data.getAutonym( language );

			if ( $.inArray( autonym, autonyms ) > -1 ) {
				duplicateAutonyms.push( language );
			}

			autonyms.push( autonym );
		}

		return duplicateAutonyms;
	};

	/*
	 * Runs over all languages and checks that all redirects point to a language.
	 * There's no reason to have double redirects.
	 */
	doubleRedirects = function () {
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
	languagesWithoutAutonym = function () {
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

	test( '-- $.uls.data testing', 32, function ( assert ) {
		var autonyms,
			languagesToGroup, groupedLanguages;

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
		assert.deepEqual( doubleAutonyms(), [], 'All languages have distinct autonyms.' );

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

		assert.strictEqual( $.uls.data.getScript( 'no-such-language' ), 'Zyyy', 'A script for an unknown language is Zyyy - undetermined' );
		assert.strictEqual( $.uls.data.getScript( 'ii' ), 'Yiii', 'Correct script of the Yi language was selected' );
		assert.deepEqual( $.uls.data.getRegions( 'lzz' ), [
			'EU', 'ME'
		], 'Correct regions of the Laz language were selected' );
		assert.strictEqual( $.uls.data.getRegions( 'no-such-language' ), 'UNKNOWN', 'The region of an invalid language is "UNKNOWN"' );

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
			Latin: [ 'en', 'fiu-vro', 'sr-latn', 'sr-el', 'vro' ],
			Cyrillic: [ 'ru', 'sr', 'sr-cyrl' ]
		};

		assert.deepEqual( $.uls.data.getLanguagesByScriptGroup( languagesToGroup ), groupedLanguages,
			'A custom list of languages is grouped correctly using getLanguagesByScriptGroup.' );

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

		$.uls.data.addLanguagesToTerritory( 'BY', [ 'be-tarask' ] );

		assert.ok(
			$.inArray( 'be-tarask', $.uls.data.getLanguagesInTerritory( 'BY' ) ) > -1,
			'Belarusian (Taraskevica) language is spoken in Belarus'
		);

		assert.ok( $.uls.data.deleteLanguage( 'qqq' ), 'Deleting language qqq, which was added earlier, returns true.' );
		assert.strictEqual( $.uls.data.languages['qqq'], undefined, 'Data about qqq is undefined after being deleted.' );
		assert.ok( !$.uls.data.deleteLanguage( 'qqr' ), 'Deleting language qqr, which was never added, returns false.' );
	} );
}( jQuery ) );
