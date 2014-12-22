/**
 * Region Filter for ULS
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
	'use strict';

	/**
	 * Region selector is a language selector based on regions.
	 * that defines the regiongroup for the selector.
	 */
	var RegionSelector = function ( options ) {
		this.options = options;
		this.regions = [];
		this.cache = null;
		this.init();
	};

	RegionSelector.prototype = {
		constructor: RegionSelector,

		init: function () {
			this.regions = this.options.regions || $.uls.data.getAllRegions();
			this.show();
		},

		test: function ( langCode ) {
			var region, i,
				langRegions = $.uls.data.getRegions( langCode );

			for ( i = 0; i < this.regions.length; i++ ) {
				region = this.regions[ i ];

				if ( $.inArray( region, langRegions ) >= 0 ) {
					this.render( langCode, region );
					this.cache[ langCode ] = region;

					return;
				}
			}
		},

		show: function () {
			var result, languagesByScriptGroup, scriptGroup, languages, i,
				$target = this.options.$target && this.options.$target.$target,
				$parent = $target && $target.parent(),
				$prev = $target && $target.prev();

			if ( $target && $parent ) {
				// Avoid reflows while adding new elements to the list
				// Use .detach() to keep jQuery events and data associated with elements
				$target.detach();
			}

			if ( this.cache ) {
				// If the result cache is present, render the results from there.
				//noinspection JSUnusedAssignment
				result = null;

				for ( result in this.cache ) {
					this.render( result, this.cache[ result ] );
				}
			} else {
				this.cache = {};
				// Get the languages grouped by script group
				languagesByScriptGroup = $.uls.data.getLanguagesByScriptGroup( this.options.languages );

				// Make sure that we go by the original order
				// of script groups
				for ( scriptGroup in $.uls.data.scriptgroups ) {
					// Get the languages for the script group
					languages = languagesByScriptGroup[ scriptGroup ];

					// It's possible that some script groups are missing
					if ( !languages ) {
						continue;
					}

					// Sort it based on autonym
					languages.sort( $.uls.data.sortByAutonym );

					for ( i = 0; i < languages.length; i++ ) {
						// Check whether it belongs to the region
						this.test( languages[ i ] );
					}
				}
			}

			if ( $target && $parent ) {
				// Restore the element to where we removed it from
				if ( $prev ) {
					$prev.after( $target );
				} else {
					$parent.append( $target );
				}
			}

			if ( this.options.success ) {
				this.options.success( this );
			}
		},

		render: function ( langCode, region ) {
			var $target = this.options.$target;

			if ( !$target ) {
				return;
			}

			$target.append( langCode, region );
		},
	};

	$.uls.RegionSelector = RegionSelector;
}( jQuery ) );
