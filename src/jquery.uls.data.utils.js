/**
 * Utility functions for querying language data.
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

( function ( $ ) {
	"use strict";

	/**
	 * Log deprecated functions
	 */
	function deprecated( oldFunc, newFunc ) {
		if ( window.console && window.console.log ) {
			window.console.log( oldFunc + " is deprecated. Please use " + newFunc );
		}
	}

	/**
	 * Returns the script of the language.
	 * @param string language code
	 * @return string
	 */
	$.uls.data.getScript = function( language ) {
		return $.uls.data.languages[language][0];
	};

	$.uls.data.script = function( language ) { // deprecated
		deprecated( "script", "getScript" );
		return $.uls.data.getScript( language );
	};

	/**
	 * Returns the regions in which a language is spoken.
	 * @param string language code
	 * @return array|string 'UNKNOWN'
	 */
	$.uls.data.getRegions = function( language ) {
		return ( $.uls.data.languages[language] && $.uls.data.languages[language][1] ) || 'UNKNOWN';
	};

	$.uls.data.regions = function( language ) { // deprecated
		deprecated( "regions", "getRegions" );
		return $.uls.data.getRegions( language );
	};

	/**
	 * Returns the autonym of the language.
	 * @param string language code
	 * @return string
	 */
	$.uls.data.getAutonym = function( language ) {
		return ( $.uls.data.languages[language] && $.uls.data.languages[language][2] ) || language;
	};

	$.uls.data.autonym = function( language ) { // deprecated
		deprecated( "autonym", "getAutonym" );
		return $.uls.data.getAutonym( language );
	};

	/**
	 * Returns all language codes and corresponding autonyms
	 * @return array
	 */
	$.uls.data.getAutonyms = function() {
		var autonymsByCode = {};

		for ( var language in $.uls.data.languages ) {
			autonymsByCode[language] = $.uls.data.getAutonym( language );
		}

		return autonymsByCode;
	};

	$.uls.data.autonyms = function() { // deprecated
		deprecated( "autonyms", "getAutonyms" );
		return $.uls.data.getAutonyms();
	};

	/**
	 * Returns an array of all region codes.
	 * @return array
	 */
	$.uls.data.getAllRegions = function() {
		var allRegions = [];

		for( var region in $.uls.data.regiongroups ) {
			allRegions.push( region );
		}

		return allRegions;
	};

	$.uls.data.allRegions = function() { // deprecated
		deprecated( "allRegions", "getAllRegions" );
		return $.uls.data.getAllRegions();
	};

	/**
	 * Returns all languages written in script.
	 * @param script string
	 * @return array of strings (languages codes)
	 */
	$.uls.data.getLanguagesInScript = function( script ) {
		return $.uls.data.getLanguagesInScripts( [ script ] );
	};

	$.uls.data.languagesInScript = function( script ) { // deprecated
		deprecated( "languagesInScript", "getLanguagesInScript" );
		return $.uls.data.getLanguagesInScript( script );
	};

	/**
	 * Returns all languages written in the given scripts.
	 * @param scripts array of strings
	 * @return array of strings (languages codes)
	 */
	$.uls.data.getLanguagesInScripts = function( scripts ) {
		var languagesInScripts = [];

		for ( var language in $.uls.data.languages ) {
			for ( var i = 0; i < scripts.length; i++ ) {
				if ( scripts[i] === $.uls.data.getScript( language ) ) {
					languagesInScripts.push( language );
					break;
				}
			}
		}

		return languagesInScripts;
	};

	$.uls.data.languagesInScripts = function( scripts ) { // deprecated
		deprecated( "languagesInScripts", "getLanguagesInScripts" );
		return $.uls.data.getLanguagesInScripts( scripts );
	};

	/**
	 * Returns all languages in a given region.
	 * @param region string
	 * @return array of strings (languages codes)
	 */
	$.uls.data.getLanguagesInRegion = function( region ) {
		return $.uls.data.getLanguagesInRegions( [ region ] );
	};

	$.uls.data.languagesInRegion = function( region ) { // deprecated
		deprecated( "languagesInRegion", "getLanguagesInRegion" );
		return $.uls.data.getLanguagesInRegion( region );
	};

	/**
	 * Returns all languages in given regions.
	 * @param region array of strings.
	 * @return array of strings (languages codes)
	 */
	$.uls.data.getLanguagesInRegions = function( regions ) {
		var languagesInRegions = [];

		for ( var language in $.uls.data.languages ) {
			for ( var i = 0; i < regions.length; i++ ) {
				if ( $.inArray( regions[i], $.uls.data.getRegions( language ) ) !== -1 ) {
					languagesInRegions.push( language );
					break;
				}
			}
		}

		return languagesInRegions;
	};

	$.uls.data.languagesInRegions = function( regions ) { // deprecated
		deprecated( "languagesInRegions", "getLanguagesInRegions" );
		return $.uls.data.getLanguagesInRegions( regions );
	};

	/**
	 * Returns all languages in a region group.
	 * @param groupNum number.
	 * @return array of strings (languages codes)
	 */
	$.uls.data.getLanguagesInRegionGroup = function( groupNum ) {
		return $.uls.data.getLanguagesInRegions( $.uls.data.getRegionsInGroup( groupNum ) );
	};

	$.uls.data.languagesInRegionGroup = function( groupNum ) { // deprecated
		deprecated( "languagesInRegionGroup", "getLanguagesInRegionGroup" );
		return $.uls.data.getLanguagesInRegionGroup( groupNum );
	};

	/**
	 * Returns an associative array of languages in a region,
	 * grouped by script.
	 * @param string region code
	 * @return associative array
	 */
	$.uls.data.getLanguagesByScriptInRegion = function( region ) {
		var languagesByScriptInRegion = {};

		for ( var language in $.uls.data.languages ) {
			if ( $.inArray( region, $.uls.data.getRegions( language ) ) !== -1 ) {
				var script = $.uls.data.getScript( language );
				if ( languagesByScriptInRegion[script] === undefined ) {
					languagesByScriptInRegion[script] = [];
				}
				languagesByScriptInRegion[script].push( language );
			}
		}

		return languagesByScriptInRegion;
	};

	$.uls.data.languagesByScriptInRegion = function( region ) { // deprecated
		deprecated( "languagesByScriptInRegion", "getLanguagesByScriptInRegion" );
		return $.uls.data.getLanguagesByScriptInRegion( region );
	};

	/**
	 * Returns an associative array of languages in a region,
	 * grouped by script group.
	 * @param string region code
	 * @return associative array
	 */
	$.uls.data.getLanguagesByScriptGroupInRegion = function( region ) {
		return $.uls.data.getLanguagesByScriptGroupInRegions( [ region ] );
	};

	$.uls.data.languagesByScriptGroupInRegion = function( region ) { // deprecated
		deprecated( "languagesByScriptGroupInRegion", "getLanguagesByScriptGroupInRegion" );
		return $.uls.data.getLanguagesByScriptGroupInRegion( region );
	};

	/**
	 * Returns an associative array of all languages,
	 * grouped by script group.
	 * @return associative array
	 */
	$.uls.data.getAllLanguagesByScriptGroup = function() {
		return $.uls.data.getLanguagesByScriptGroupInRegions( $.uls.data.getAllRegions() );
	};

	$.uls.data.allLanguagesByScriptGroup = function() { // deprecated
		deprecated( "allLanguagesByScriptGroup", "getAllLanguagesByScriptGroup" );
		return $.uls.data.getAllLanguagesByScriptGroup();
	};

	/**
	 * Get the given list of languages grouped by script.
	 * @param languages Array of language codes
	 * @return {Object} Array of languages indexed by script codes
	 */
	$.uls.data.getLanguagesByScriptGroup = function( languages ) {
		var languagesByScriptGroup = {},
			scriptGroup,
			language,
			langScriptGroup;

		for ( scriptGroup in $.uls.data.scriptgroups ) {
			for ( language in languages ) {
				langScriptGroup = $.uls.data.getScriptGroupOfLanguage( language );
				if( langScriptGroup !== scriptGroup ) {
					continue;
				}
				if ( !languagesByScriptGroup[scriptGroup] ) {
					languagesByScriptGroup[scriptGroup] = [];
				}
				languagesByScriptGroup[scriptGroup].push( language );
			}
		}

		return languagesByScriptGroup;
	};

	$.uls.data.languagesByScriptGroup = function( languages ) { // deprecated
		deprecated( "languagesByScriptGroup", "getLanguagesByScriptGroup" );
		return $.uls.data.getLanguagesByScriptGroup( languages );
	};

	/**
	 * Returns an associative array of languages in several regions,
	 * grouped by script group.
	 * @param array of strings - region codes
	 * @return associative array
	 */
	$.uls.data.getLanguagesByScriptGroupInRegions = function( regions ) {
		var languagesByScriptGroupInRegions = {};

		for ( var language in $.uls.data.languages ) {
			for ( var i = 0; i < regions.length; i++ ) {
				if ( $.inArray( regions[i], $.uls.data.getRegions( language ) ) !== -1 ) {
					var scriptGroup = $.uls.data.getScriptGroupOfLanguage( language );
					if ( languagesByScriptGroupInRegions[scriptGroup] === undefined ) {
						languagesByScriptGroupInRegions[scriptGroup] = [];
					}
					languagesByScriptGroupInRegions[scriptGroup].push( language );
					break;
				}
			}
		}

		return languagesByScriptGroupInRegions;
	};

	$.uls.data.languagesByScriptGroupInRegions = function( regions ) { // deprecated
		deprecated( "languagesByScriptGroupInRegions", "getLanguagesByScriptGroupInRegions" );
		return $.uls.data.getLanguagesByScriptGroupInRegions( regions );
	};

	/**
	 * Returns an array of languages grouped by region group,
	 * region, script group and script.
	 * @return associative array
	 */
	$.uls.data.getAllLanguagesByRegionAndScript = function() {
		var allLanguagesByRegionAndScript = {},
			region,
			regionGroup;

		for ( region in $.uls.data.regiongroups ) {
			regionGroup = $.uls.data.regiongroups[region];
			if ( allLanguagesByRegionAndScript[regionGroup] === undefined ) {
				allLanguagesByRegionAndScript[regionGroup] = {};
			}
			allLanguagesByRegionAndScript[regionGroup][region] = {};
		}

		for ( var language in $.uls.data.languages ) {
			var script = $.uls.data.getScript( language );
			var scriptGroup = $.uls.data.getGroupOfScript( script );
			var regions = $.uls.data.getRegions( language );

			for ( var regionNum = 0; regionNum < regions.length; regionNum++ ) {
				region = regions[regionNum];
				regionGroup = $.uls.data.regiongroups[region];

				if ( allLanguagesByRegionAndScript[regionGroup][region][scriptGroup] === undefined ) {
					allLanguagesByRegionAndScript[regionGroup][region][scriptGroup] = {};
				}

				if ( allLanguagesByRegionAndScript[regionGroup][region][scriptGroup][script] === undefined ) {
					allLanguagesByRegionAndScript[regionGroup][region][scriptGroup][script] = [];
				}

				allLanguagesByRegionAndScript[regionGroup][region][scriptGroup][script].push( language );
			}
		}

		return allLanguagesByRegionAndScript;
	};

	$.uls.data.allLanguagesByRegionAndScript = function() { // deprecated
		deprecated( "allLanguagesByRegionAndScript", "getAllLanguagesByRegionAndScript" );
		return $.uls.data.getAllLanguagesByRegionAndScript();
	};

	/**
	 * Returns all regions in a region group.
	 * @param number groupNum
	 * @return array of strings
	 */
	$.uls.data.getRegionsInGroup = function( groupNum ) {
		var regionsInGroup = [];

		for ( var region in $.uls.data.regiongroups ) {
			if ( $.uls.data.regiongroups[region] === groupNum ) {
				regionsInGroup.push( region );
			}
		}

		return regionsInGroup;
	};

	$.uls.data.regionsInGroup = function( groupNum ) { // deprecated
		deprecated( "regionsInGroup", "getRegionsInGroup" );
		return $.uls.data.getRegionsInGroup( groupNum );
	};

	/**
	 * Returns the script group of a script or 'Other' if it doesn't
	 * belong to any group.
	 * @param string script code
	 * @return string script group name
	 */
	$.uls.data.getGroupOfScript = function( script ) {
		for ( var group in $.uls.data.scriptgroups ) {
			if ( $.inArray( script, $.uls.data.scriptgroups[group] ) !== -1 ) {
				return group;
			}
		}

		return 'Other';
	};

	$.uls.data.groupOfScript = function( script ) { // deprecated
		deprecated( "groupOfScript", "getGroupOfScript" );
		return $.uls.data.getGroupOfScript( script );
	};

	/**
	 * Returns the script group of a language.
	 * @param string language code
	 * @return string script group name
	 */
	$.uls.data.getScriptGroupOfLanguage = function( language ) {
		return $.uls.data.getGroupOfScript( $.uls.data.getScript( language ) );
	};

	$.uls.data.scriptGroupOfLanguage = function( language ) { // deprecated
		deprecated( "scriptGroupOfLanguage", "getScriptGroupOfLanguage" );
		return $.uls.data.getScriptGroupOfLanguage( language );
	};

	/**
	 * A callback for sorting languages by autonym.
	 * Can be used as an argument to a sort function.
	 * @param two language codes
	 */
	$.uls.data.sortByAutonym = function( a, b ) {
		var autonymA = $.uls.data.getAutonym( a ) || a,
			autonymB = $.uls.data.getAutonym( b ) || b;
		return ( autonymA.toLowerCase() < autonymB.toLowerCase() ) ? -1 : 1;
	};

	/**
	 * Check if a language is right-to-left.
	 * @param string language code
	 * @return boolean
	 */
	$.uls.data.isRtl = function( language ) {
		return $.inArray( $.uls.data.getScript( language ), $.uls.data.rtlscripts ) !== -1;
	};

	/**
	 * Return the direction of the language
	 * @param string language code
	 * @return string
	 */
	$.uls.data.getDir = function( language ) {
		return $.uls.data.isRtl( language ) ? 'rtl' : 'ltr';
	};

	/**
	 * Returns the languages spoken in a territory.
	 * @param string Territory code
	 * @return list of language codes
	 */
	$.uls.data.getLanguagesInTerritory = function( territory ) {
		return $.uls.data.territories[territory];
	};

	$.uls.data.languagesInTerritory = function( territory ) { // deprecated
		deprecated( "languagesInTerritory", "getLanguagesInTerritory" );
		return $.uls.data.getLanguagesInTerritory( territory );
	};
} ( jQuery ) );
