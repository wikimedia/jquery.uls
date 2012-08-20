/**
 * Universal Language Selector
 * Language category display component - Used for showing the search results,
 * grouped by regions, scripts
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

(function( $ ) {
	"use strict";

	var LanguageCategoryDisplay = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.lcd.defaults, options );
		this.$element.addClass( 'lcd' );
		this.show();
		this.listen();
	};

	LanguageCategoryDisplay.prototype = {
		constructor: LanguageCategoryDisplay,

		append: function( langCode, regionCode ) {
			this.addToRegion( langCode, regionCode );
		},

		/**
		 * Add the language to a region.
		 * If the region parameter is given , add to that region alone
		 * Otherwise to all regions that this language belongs.
		 * @param langCode
		 * @param region Optional region
		 */
		addToRegion: function( langCode, region ) {
			var that = this;
			var language = that.options.languages[langCode],
				langName = $.uls.data.autonym( langCode ) || language || langCode,
				regions = [];

			if ( region ) {
				regions.push( region );
			} else {
				regions = $.uls.data.regions( langCode );
			}

			for ( var i = 0; i < regions.length; i++ ) {
				var regionCode = regions[i];

				var $li = $( '<li>' )
					.data( 'code', langCode )
					.append(
						$( '<a>' ).prop( 'href', '#' ).prop( 'title', language ).html( langName )
					);

				// Append the element to the column in the list
				var $column = that.getColumn( regionCode );
				var lastLanguage = $column.find( 'li:last' ).data( 'code' );

				if ( lastLanguage ) {
					var lastScriptGroup = $.uls.data.scriptGroupOfLanguage( lastLanguage ),
						currentScriptGroup = $.uls.data.scriptGroupOfLanguage( langCode );

					if ( lastScriptGroup !== currentScriptGroup ) {
						if ( $column.find( 'li' ).length > 2 ) {
							// If column already has 2 or more languages, add a new column
							$column = that.getColumn( regionCode, true );
						}
					}
				}

				$column.append( $li );

				if ( that.options.clickhandler ) {
					$li.click( function() {
						that.options.clickhandler.call( this, langCode );
					} );
				}
			}
		},
		/**
		 * Get a column to add language.
		 * @param String regionCode The region code
		 * @param boolean forceNew whether a new column must be created or not
		 */
		getColumn: function( regionCode, forceNew ) {
			var $divRegionCode, $rowDiv, $ul;

			forceNew = forceNew || false;
			$divRegionCode = this.$element.find( 'div#' + regionCode );
			$rowDiv = $divRegionCode.find( 'div.row:last' );
			$ul = $divRegionCode.find( 'ul:last' );

			// Each column can have maximum 8 languages.
			if ( $ul.length === 0 || $ul.find( 'li' ).length >= 8 || forceNew ) {
				$ul = $( '<ul>' ).addClass( 'three columns end' );

				if ( $rowDiv.length === 0 || $rowDiv.find( 'ul' ).length >= 4 ) {
					$rowDiv = $( '<div>' ).addClass( 'row uls-language-block' );
					$divRegionCode.append( $rowDiv );
					$ul.addClass( 'offset-by-one' );
				}

				$rowDiv.append( $ul );
			}

			if( !$divRegionCode.is( ':visible' ) ) {
				$divRegionCode.show();
			}

			return $ul;
		},

		show: function() {
			var that = this;
			$.each( $.uls.data.regiongroups, function( regionCode, regionIndex ) {
				var $section = $( '<div>' ).addClass( 'twelve columns uls-lcd-region-section' ).prop( 'id', regionCode );
				$section.append( $( '<h3>' ).addClass( 'eleven columns uls-lcd-region-section offset-by-one' ).html( regionCode ) );
				// FIXME this is regioncode(NA, EU etc). Should be proper localized region name.
				that.$element.append( $section );
			} );
		},

		empty: function() {
			this.$element.find( 'div.row' ).remove();
			this.$element.find( 'div' ).hide();
		},

		focus: function() {
			this.$element.focus();
		},

		listen: function() {
			var that = this;
			// The region section need to be in sync with the map filter.
			that.$element.scroll( function () {
				var inviewRegion = that.$element.find( 'div.uls-lcd-region-section:first' ).attr( 'id' );
				var listtop = that.$element.position().top;
				that.$element.find( 'div.uls-lcd-region-section' ).each( function () {
					var offset = $( this ).position().top - listtop;
					if ( offset < 0 ) {
						inviewRegion = $( this ).attr( 'id' );
					} else {
						return false;
					}
				} );

				var inview = $.uls.data.regiongroups[inviewRegion];
				// FIXME This is not a clean solution. It should get fixed with infinite scroll feature.
				$( 'div.uls-region' ).removeClass( 'active' );
				$( 'div#uls-region-' + inview ).addClass( 'active' );
			} );
		}

	};

	$.fn.lcd = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'lcd' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'lcd', ( data = new LanguageCategoryDisplay( this, options ) ) );
			}
			if ( typeof option === 'string') {
				data[option]();
			}
		} );
	};

	$.fn.lcd.defaults = {
		languages: null
	};

	$.fn.lcd.Constructor = LanguageCategoryDisplay;

} )( jQuery );
