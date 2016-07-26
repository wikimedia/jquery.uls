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

( function ( $ ) {
	'use strict';

	var noResultsTemplate, LanguageCategoryDisplay;

	noResultsTemplate = $( '<div>' ).addClass( 'twelve columns uls-no-results-view hide' );
	noResultsTemplate.append(
		$( '<h2>' )
			.attr( 'data-i18n', 'uls-no-results-found' )
			.addClass( 'eleven columns offset-by-one uls-no-results-found-title' )
			.text( 'No results found' ),
		$( '<div>' )
			.attr( 'id', 'uls-no-found-more' )
			.addClass( 'uls-no-found-more' )
			.append(
				$( '<div>' )
					.addClass( 'ten columns offset-by-one' )
					.append(
						$( '<p>' ).append(
							$( '<span>' ).text( 'You can search by language name, script name, ISO code of language or you can browse by region.' )
						)
					)
			)
	);

	LanguageCategoryDisplay = function ( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.lcd.defaults, options );
		this.$element.addClass( 'lcd' );
		this.regionLanguages = {};
		this.renderTimeout = null;
		this.cachedQuicklist = null;

		this.$element.append( $( noResultsTemplate ) );
		this.$noResults = this.$element.children( '.uls-no-results-view' );

		this.render();
		this.listen();
	};

	LanguageCategoryDisplay.prototype = {
		constructor: LanguageCategoryDisplay,

		/**
		 * Adds language to the language list.
		 * @param {string} langCode
		 * @param {string} [regionCode]
		 * @return {boolean} Whether the language was added.
		 */
		append: function ( langCode, regionCode ) {
			var lcd = this,
				i, regions;

			if ( !$.uls.data.languages[ langCode ] ) {
				// Language is unknown or not in the list of languages for this context.
				return false;
			}

			// Show everything in one region when there is only one column
			if ( lcd.options.columns === 1 ) {
				regions = [ 'WW' ];

				// Languages are expected to be repeated in this case,
				// and we only want to show them once
				if ( $.inArray( langCode, this.regionLanguages.WW ) > -1 ) {
					return true;
				}
			} else {
				if ( regionCode ) {
					regions = [ regionCode ];
				} else {
					regions = $.uls.data.getRegions( langCode );
				}
			}

			for ( i = 0; i < regions.length; i++ ) {
				this.regionLanguages[ regions[ i ] ].push( langCode );
			}

			// Work around the bad interface, delay rendering until we have got
			// all the languages to speed up performance.
			window.clearTimeout( this.renderTimeout );
			this.renderTimeout = window.setTimeout( function () {
				lcd.renderRegions();
			}, 50 );

			return true;
		},

		render: function () {
			var $section,
				lcd = this,
				regions = [],
				regionNames = {
					// These are fallback text when i18n library not present
					WW: 'Worldwide',
					SP: 'Special',
					AM: 'America',
					EU: 'Europe',
					ME: 'Middle East',
					AS: 'Asia',
					AF: 'Africa',
					PA: 'Pacific'
				};

			regions.push( this.buildQuicklist() );

			$.each( $.uls.data.regiongroups, function ( regionCode ) {
				lcd.regionLanguages[ regionCode ] = [];

				// Don't show the region unless it was enabled
				if ( $.inArray( regionCode, lcd.options.showRegions ) === -1 ) {
					return;
				}

				$section = $( '<div>' )
					.addClass( 'eleven columns offset-by-one uls-lcd-region-section hide' )
					.attr( 'id', regionCode );

				// Show a region heading, unless we are using a narrow ULS
				if ( lcd.options.columns !== 1 ) {
					$section.append( $( '<h3>' )
						.attr( 'data-i18n', 'uls-region-' + regionCode )
						.addClass( 'eleven columns uls-lcd-region-title' )
						.text( regionNames[ regionCode ] )
					);
				}

				regions.push( $section );
			} );

			lcd.$element.append( regions );

			this.i18n();
		},

		/**
		 * Renders a region and displays it if it has content.
		 */
		renderRegions: function () {
			var languages,
				lcd = this;

			this.$noResults.addClass( 'hide' );
			this.$element.find( '.uls-lcd-region-section' ).each( function () {
				var $region = $( this ),
					regionCode = $region.attr( 'id' );

				if ( $region.is( '#uls-lcd-quicklist' ) ) {
					return;
				}

				$region.children( '.uls-language-block' ).remove();

				languages = lcd.regionLanguages[ regionCode ];
				if ( !languages || languages.length === 0 ) {
					$region.addClass( 'hide' );
					return;
				}

				lcd.renderRegion(
					$region,
					languages,
					lcd.options.itemsPerColumn,
					lcd.options.columns
				);
				$region.removeClass( 'hide' );

				lcd.regionLanguages[ regionCode ] = [];
			} );

		},

		/**
		 * Adds given languages sorted into rows and columns into given element.
		 * @param {jQuery} $region Element to add language list.
		 * @param {array} languages List of language codes.
		 * @param {number} itemsPerColumn How many languages fit in a column.
		 * @param {number} columnsPerRow How many columns fit in a row.
		 */
		renderRegion: function ( $region, languages, itemsPerColumn, columnsPerRow ) {
			var columnsClasses, i, lastItem, currentScript, nextScript, force,
				languagesCount = languages.length,
				items = [],
				columns = [],
				rows = [];

			if ( columnsPerRow === 1 ) {
				columnsClasses = 'twelve columns';
			} else if ( columnsPerRow === 2 ) {
				columnsClasses = 'six columns';
			} else {
				columnsClasses = 'three columns';
			}

			if ( this.options.columns === 1 ) {
				// For one-column narrow ULS, just render all the languages
				// in one simple list without separators or script groups
				for ( i = 0; i < languagesCount; i++ ) {
					items.push( this.renderItem( languages[ i ] ) );
				}

				columns.push( $( '<ul>' ).addClass( columnsClasses ).append( items ) );
				rows.push( $( '<div>' ).addClass( 'row uls-language-block' ).append( columns ) );
			} else {
				// For medium and wide ULS, clever column placement
				for ( i = 0; i < languagesCount; i++ ) {
					force = false;
					nextScript = $.uls.data.getScriptGroupOfLanguage( languages[ i + 1 ] );

					lastItem = languagesCount - i === 1;
					// Force column break if script changes and column has more than one row already
					if ( i === 0 ) {
						currentScript = $.uls.data.getScriptGroupOfLanguage( languages[ i ] );
					} else if ( currentScript !== nextScript && items.length > 1 ) {
						force = true;
					}
					currentScript = nextScript;

					items.push( this.renderItem( languages[ i ] ) );

					if ( items.length >= itemsPerColumn || lastItem || force ) {
						columns.push( $( '<ul>' ).addClass( columnsClasses ).append( items ) );
						items = [];
						if ( columns.length >= columnsPerRow || lastItem ) {
							rows.push( $( '<div>' ).addClass( 'row uls-language-block' ).append( columns ) );
							columns = [];
						}
					}
				}
			}

			$region.append( rows );
		},

		/**
		 * Creates dom node representing one item in language list.
		 * @param {string} code Language code
		 * @return {Element}
		 */
		renderItem: function ( code ) {
			var a, name, autonym, li;

			name = this.options.languages[ code ];
			autonym = $.uls.data.getAutonym( code ) || name || code;

			// Not using jQuery as this is performance hotspot
			li = document.createElement( 'li' );
			li.title = name;
			li.setAttribute( 'data-code', code );

			a = document.createElement( 'a' );
			a.appendChild( document.createTextNode( autonym ) );
			a.className = 'autonym';
			a.lang = code;
			a.dir = $.uls.data.getDir( code );


			li.appendChild( a );
			if ( this.options.languageDecorator ) {
				this.options.languageDecorator( $( a ), code );
			}
			return li;
		},

		i18n: function () {
			this.$element.find( '[data-i18n]' ).i18n();
		},

		/**
		 * Adds quicklist as a region.
		 */
		quicklist: function () {
			this.$element.find( '#uls-lcd-quicklist' ).removeClass( 'hide' );
		},

		buildQuicklist: function () {
			var quickList, $quickListSection, $quickListSectionTitle;

			if ( this.cachedQuicklist !== null ) {
				return this.cachedQuicklist;
			}

			if ( $.isFunction( this.options.quickList ) ) {
				this.options.quickList = this.options.quickList();
			}

			if ( !this.options.quickList ) {
				this.cachedQuicklist = $( [] );
				return this.cachedQuicklist;
			}

			// Pick only the first elements, because we don't have room for more
			quickList = this.options.quickList;
			quickList = quickList.slice( 0, 16 );
			quickList.sort( $.uls.data.sortByAutonym );

			$quickListSection = $( '<div>' )
				.addClass( 'eleven columns offset-by-one uls-lcd-region-section' )
				.attr( 'id', 'uls-lcd-quicklist' );

			$quickListSectionTitle = $( '<h3>' )
				.attr( 'data-i18n', 'uls-common-languages' )
				.addClass( 'eleven columns uls-lcd-region-title' )
				.text( 'Common languages' ); // This is placeholder text if jquery.i18n not present
			$quickListSection.append( $quickListSectionTitle );

			this.renderRegion(
				$quickListSection,
				quickList,
				this.options.itemsPerColumn,
				this.options.columns
			);

			$quickListSectionTitle.i18n();

			this.cachedQuicklist = $quickListSection;
			return this.cachedQuicklist;
		},

		show: function () {
			if ( !this.regionDivs ) {
				this.render();
			}
		},

		empty: function () {
			this.$element.find( '#uls-lcd-quicklist' ).addClass( 'hide' );
		},

		focus: function () {
			this.$element.focus();
		},

		noResults: function () {
			this.$noResults.removeClass( 'hide' );
			if ( this.$noResults.find( '.uls-lcd-region-title' ).length ) {
				return;
			}

			var $suggestions = this.buildQuicklist().clone();
			$suggestions.find( 'h3' )
				.data( 'i18n', 'uls-no-results-suggestion-title' )
				.text( 'You may be interested in:' )
				.i18n();
			this.$noResults.find( 'h2' ).after( $suggestions.show() );
		},

		listen: function () {
			var lcd = this;

			if ( this.options.clickhandler ) {
				this.$element.on( 'click', '.row li', function () {
					lcd.options.clickhandler.call( this, $( this ).data( 'code' ) );
				} );
			}
		}
	};

	$.fn.lcd = function ( option ) {
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( 'lcd' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'lcd', ( data = new LanguageCategoryDisplay( this, options ) ) );
			}

			if ( typeof option === 'string' ) {
				data[ option ]();
			}
		} );
	};

	$.fn.lcd.defaults = {
		languages: null,
		showRegions: [ 'WW', 'AM', 'EU', 'ME', 'AF', 'AS', 'PA' ],
		itemsPerColumn: 8,
		// Other supported values are 1 and 2.
		// Other values will have rendering issues.
		columns: 4,
		languageDecorator: null
	};

	$.fn.lcd.Constructor = LanguageCategoryDisplay;
}( jQuery ) );
