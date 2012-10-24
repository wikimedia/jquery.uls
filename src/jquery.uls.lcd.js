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

( function( $ ) {
	"use strict";

	var noResultsTemplate = '\
	<div class="twelve columns uls-no-results-view">\
		<h2 data-i18n="uls-no-results-found" class="eleven columns end offset-by-one">\
		No results found\
		</h2>\
		<div id="uls-no-found-more">\
			<div class="ten columns end offset-by-one">\
				<p>\
					<span data-i18n="uls-search-help">You can search by language name, \
					script name, ISO code of language or \
					you can browse by region:</span>\
					<a class="uls-region-link" data-i18n="uls-region-AM" data-region="AM" href="#">America</a>, \
					<a class="uls-region-link" data-i18n="uls-region-EU" data-region="EU" href="#">Europe</a>, \
					<a class="uls-region-link" data-i18n="uls-region-ME" data-region="ME" href="#">Middle East</a>, \
					<a class="uls-region-link" data-i18n="uls-region-AF" data-region="AF" href="#">Africa</a>, \
					<a class="uls-region-link" data-i18n="uls-region-AS" data-region="AS" href="#">Asia</a>, \
					<a class="uls-region-link" data-i18n="uls-region-PA" data-region="PA" href="#">Pacific</a>, \
					<a class="uls-region-link" data-i18n="uls-region-WW" data-region="WW" href="#">Worldwide</a>.\
				</p>\
			</div>\
		</div>\
	</div>';

	var LanguageCategoryDisplay = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.lcd.defaults, options );
		this.$element.addClass( 'lcd' );
		this.regionDivs = {};
		this.$element.append( $(noResultsTemplate) );
		this.$noResults = this.$element.find( 'div.uls-no-results-view' );
		this.render();
		this.listen();
	};

	LanguageCategoryDisplay.prototype = {
		constructor: LanguageCategoryDisplay,

		append: function( langCode, regionCode ) {
			this.addToRegion( langCode, regionCode );
			this.$noResults.hide();
		},

		/**
		 * Add the language to a region.
		 * If the region parameter is given, add to that region alone
		 * Otherwise to all regions that this language belongs.
		 * @param langCode
		 * @param region Optional region
		 */
		addToRegion: function( langCode, region ) {
			var that = this;
			var language = that.options.languages[langCode],
				langName = $.uls.data.getAutonym( langCode ) || language || langCode,
				regions = [];

			if ( region ) {
				regions.push( region );
			} else {
				regions = $.uls.data.getRegions( langCode );
			}

			// World wide languages need not be repeated in all regions.
			if ( $.inArray( 'WW', regions ) > -1 ) {
				regions = [ 'WW' ];
			}

			for ( var i = 0; i < regions.length; i++ ) {
				var regionCode = regions[i];

				var $li = $( '<li>' )
					.data( 'code', langCode )
					.attr( {
						lang: langCode,
						dir: $.uls.data.getDir( langCode )
					} )
					.append(
						$( '<a>' ).prop( 'href', '#' ).prop( 'title', language ).html( langName )
					);

				// Append the element to the column in the list
				var $column = that.getColumn( regionCode );
				var lastLanguage = $column.find( 'li:last' ).data( 'code' );

				if ( lastLanguage ) {
					var lastScriptGroup = $.uls.data.getScriptGroupOfLanguage( lastLanguage ),
						currentScriptGroup = $.uls.data.getScriptGroupOfLanguage( langCode );

					if ( lastScriptGroup !== currentScriptGroup ) {
						if ( $column.find( 'li' ).length > 2 ) {
							// If column already has 2 or more languages, add a new column
							$column = that.getColumn( regionCode, true );
						}
					}
				}

				$column.append( $li );
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
			$divRegionCode = this.regionDivs[regionCode];
			$rowDiv = $divRegionCode.find( 'div.row:last' );
			$ul = $rowDiv.find( 'ul:last' );

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

			$divRegionCode.show();

			return $ul;
		},

		render: function() {
			var that = this;
			var $section, $sectionTitle;
			var regions = {
				// These are fallback text when i18n library not present
				WW: 'Worldwide',
				AM: 'America',
				EU: 'Europe',
				ME: 'Middle East',
				AS: 'Asia',
				AF: 'Africa',
				PA: 'Pacific'
			};
			$.each( $.uls.data.regiongroups, function( regionCode, regionIndex ) {
				$section = $( '<div>' ).addClass( 'twelve columns uls-lcd-region-section' ).prop( 'id', regionCode );
				$sectionTitle = $( '<h3 data-i18n="uls-region-'+ regionCode+'">' )
					.addClass( 'eleven columns uls-lcd-region-section offset-by-one' )
					.text( regions[regionCode] );
				$section.append( $sectionTitle );
				that.$element.append( $section );
				$section.hide();
				that.regionDivs[regionCode] = $section;
			} );
			this.$noResults.hide();
			this.i18n();
		},

		i18n: function( ) {
			this.$element.find( '[data-i18n]' ).i18n();
		},

		quicklist: function() {
			if ( $.isFunction( this.options.quickList ) ) {
				this.options.quickList = this.options.quickList();
			}

			if ( !this.options.quickList ) {
				return;
			}

			// Pick only the first elements, because we don't have room for more
			var quickList = this.options.quickList;
			quickList = quickList.slice( 0, 16 );
			quickList.sort( $.uls.data.sortByAutonym );
			var $quickListSection = $( '<div>' ).addClass( 'twelve columns uls-lcd-region-section' ).prop( 'id', 'uls-lcd-quicklist' );
			var $quickListSectionTitle = $( '<h3 data-i18n="uls-common-languages">' )
				.addClass( 'eleven columns uls-lcd-region-section offset-by-one' )
				.text( 'Common languages' ); // This is placeholder text if jquery.i18n not present
			$quickListSection.append( $quickListSectionTitle );
			this.$element.prepend( $quickListSection );
			this.regionDivs[ 'quick' ] = $quickListSection;
			for ( var i = 0; i < quickList.length; i++) {
				var $column = this.getColumn( 'quick', i % 4 === 0 );
				var langCode = quickList[i];
				var language = this.options.languages[langCode];
				var langName = $.uls.data.getAutonym( langCode ) || language || langCode;
				var $li = $( '<li>' )
					.data( 'code', langCode )
					.attr( {
						lang: langCode,
						dir: $.uls.data.getDir( langCode )
					} )
					.append(
						$( '<a>' ).prop( 'href', '#' ).prop( 'title', language ).html( langName )
					);
				$column.append( $li );
			}
			$quickListSection.show();
			$quickListSectionTitle.i18n();
			return $quickListSection;
		},

		show: function() {
			if ( !this.regionDivs ) {
				this.render();
			}
		},

		empty: function() {
			this.$element.find( 'div.uls-language-block' ).remove();
			this.$element.find( 'div.uls-lcd-region-section' ).hide();
		},

		focus: function() {
			this.$element.focus();
		},

		noResults: function() {
			this.$noResults.show();
			var $suggestions = this.quicklist();
			$suggestions.find( 'h3' )
				.data( 'i18n', 'uls-no-results-suggestion-title' )
				.text( "You may be interested in:" )
				.i18n();
			this.$noResults.find( 'h2' ).after( $suggestions );
		},

		listen: function () {
			var lcd = this;

			if ( this.options.clickhandler ) {
				this.$element.on( 'click', 'div.row li', function() {
					lcd.options.clickhandler.call( this, $( this ).data( 'code' ) );
				} );
			}

			// The region section need to be in sync with the map filter.
			lcd.$element.scroll( function () {
				var $ulsLanguageList = $( this ),
					languageListTop = $ulsLanguageList.position().top,
					languageListHeight = $ulsLanguageList.height();

				// When getting to the middle of the region, load the next region
				if ( this.offsetHeight + this.scrollTop >= this.scrollHeight / 2 ) {
					lcd.$element.trigger( 'scrollend' );
				}

				lcd.$element.find( 'div.uls-lcd-region-section' ).each( function () {
					var $lcdRegionSection = $( this ),
						regionTop = $lcdRegionSection.position().top,
						regionHeight = $lcdRegionSection.height();

					if ( regionTop < languageListTop && regionHeight > languageListHeight ) {
						var inviewRegion = $.uls.data.regiongroups[$lcdRegionSection.attr( 'id' )];
						$( '.regionselector' ).removeClass( 'active' );
						$( '#uls-region-' + inviewRegion ).addClass( 'active' );
					}
				} );
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

} ( jQuery ) );
