/**
 * Universal Language Selector
 * ULS core component.
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

	// Region numbers in id attributes also appear in the langdb.
	var template = '\
		<div class="uls-menu"> \
			<div class="row"> \
				<span id="uls-close" class="icon-close"></span> \
			</div> \
			<div class="row"> \
				<div class="uls-title four columns">\
					<h1 data-i18n="uls-select-language">Select Language</h1>\
				</div>\
				<div class="three columns" id="settings-block"></div>\
				<div class="five columns" id="map-block">\
					<div class="row">\
						<div data-regiongroup="1" id="uls-region-1" class="three columns uls-region">\
							<a data-i18n="uls-region-WW">Worldwide</a>\
						</div>\
						<div class="nine columns">\
							<div class="row uls-worldmap">\
								<div data-regiongroup="2" id="uls-region-2" class="four columns uls-region">\
									<a data-i18n="uls-region-AM">America</a>\
								</div>\
								<div data-regiongroup="3" id="uls-region-3" class="four columns uls-region">\
									<a><span data-i18n="uls-region-EU">Europe</span><br>\
									<span data-i18n="uls-region-ME">Middle East</span><br>\
									<span data-i18n="uls-region-AF">Africa</span></a>\
								</div>\
								<div data-regiongroup="4" id="uls-region-4" class="four columns uls-region">\
									<a><span data-i18n="uls-region-AS">Asia</span><br>\
									<span data-i18n="uls-region-PA">Pacific</span></a>\
								</div>\
							</div>\
						</div>\
					</div>\
				</div>\
			</div>\
			<div id="search" class="row"> \
				<div class="one column">\
					<span class="search-label"></span>\
				</div>\
				<div class="ten columns">\
					<div id="search-input-block">\
						<input type="text" class="filterinput" id="filtersuggestion" disabled="true"\
							autocomplete="off" /> <input type="text" class="filterinput" id="languagefilter"\
							data-clear="languagefilter-clear" data-suggestion="filtersuggestion"\
							placeholder="Language search" autocomplete="off" />\
					</div>\
				</div>\
				<div class="one column">\
					<span id="languagefilter-clear"></span>\
				</div>\
			</div>\
			<div class="row uls-language-list"></div>\
		</div> ';

	/**
	 * ULS Public class definition
	 */
	var ULS = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.uls.defaults, options );
		this.$menu = $( template );
		this.languages = this.options.languages;
		for ( var code in this.languages ) {
			if ( $.uls.data.languages[code] === undefined ) {
				if ( window.console && window.console.log ) {
					window.console.log( 'ULS: Unknown language ' + code + '.' );
				}
				delete this.languages[code];
			}
		}
		this.left = this.options.left;
		this.top = this.options.top;
		this.shown = false;
		this.initialized = false;
		this.$languageFilter = this.$menu.find( 'input#languagefilter' );
		this.$regionFilters = this.$menu.find( '.uls-region' );
		this.$resultsView = this.$menu.find( 'div.uls-language-list' );
		this.render();
		this.listen();
		this.ready();
	};

	ULS.prototype = {
		constructor: ULS,

		ready: function() {
			if ( this.options.onReady ) {
				this.options.onReady.call( this );
			}
		},

		/**
		 * Calculate the position of ULS
		 * Returns an object with top and left properties.
		 * @returns {Object}
		 */
		position: function() {
			var pos = $.extend( {}, this.$element.offset(), {
				height: this.$element[0].offsetHeight
			} );
			return {
				top: this.top || pos.top + pos.height,
				left: this.left || '25%'
			};
		},

		/**
		 * Show the ULS window
		 */
		show: function() {
			var pos = this.position();
			this.$menu.css( {
				top: pos.top,
				left: '25%'
			} );

			if ( !this.initialized ) {
				$( 'body' ).prepend( this.$menu );
				this.i18n();
				// Initialize with a full search.
				// This happens on first time click of uls trigger.
				this.defaultSearch();
				this.initialized = true;
			}
			this.$menu.show();
			this.shown = true;

			if ( !this.isMobile() ) {
				this.$languageFilter.focus();
			}
		},

		i18n: function() {
			if ( $.i18n ) {
				this.$menu.find( '[data-i18n]' ).i18n();
				this.$languageFilter.prop( 'placeholder', $.i18n( 'uls-search-placeholder' ) );
			}
		},

		defaultSearch: function () {
			this.$resultsView.lcd( 'empty' );

			if ( this.options.lazyload ) {
				this.$regionFilters.first().regionselector( 'show' );
			} else{
				this.$regionFilters.regionselector( 'show' );
			}
		},

		/**
		 * Hide the ULS window
		 */
		hide: function() {
			this.$menu.hide();
			this.shown = false;
		},

		/**
		 * Render the UI elements.
		 * Does nothing by default. Can be used for customization.
		 */
		render: function() {
			// Rendering stuff here
		},

		/**
		 * callback for no results found context.
		 * @param String search the search term
		 */
		noresults: function( search ) {
			this.$resultsView.lcd( 'noResults' );
		},

		/**
		 * callback for results found context.
		 */
		success: function() {
			this.$resultsView.show();
		},

		/**
		 * Bind the UI elements with their event listeners
		 */
		listen: function() {
			var lcd,
				uls = this,
				cancelProxy = $.proxy( uls.cancel, uls );

			// Register all event listeners to the ULS here.
			uls.$element.on( 'click', $.proxy( uls.click, uls ) );

			uls.$languageFilter.on( 'searchclear', $.proxy( uls.defaultSearch, uls ) );

			// Close when clicking on the close button
			uls.$menu.find( '#uls-close' ).on( 'click', cancelProxy );
			// Don't do anything if pressing on empty space in the ULS
			uls.$menu.on( 'click', function ( e ) {
				e.stopPropagation();
			} );
			// Close ULS if clicking elsewhere
			$( document ).on( 'click', cancelProxy );

			// Handle key press events on the menu
			uls.$menu.on( 'keypress', $.proxy( this.keypress, this ) )
				.on( 'keyup', $.proxy( this.keyup, this ) );
			if ( this.eventSupported( 'keydown' ) ) {
				this.$menu.on( 'keydown', $.proxy( this.keypress, this ) );
			}

			lcd = uls.$resultsView.lcd( {
				languages: uls.languages,
				quickList: uls.options.quickList,
				clickhandler: $.proxy( uls.select, uls ),
				lazyload: uls.options.lazyload,
				source: uls.$languageFilter
			} ).data( 'lcd' );

			uls.$languageFilter.languagefilter( {
				$target: lcd,
				languages: uls.languages,
				success: function() {
					$( '.regionselector' ).removeClass( 'active' );
					uls.success();
				},
				noresults: function() {
					$( '.regionselector' ).removeClass( 'active' );
					uls.noresults();
				},
				searchAPI: uls.options.searchAPI,
				onSelect: $.proxy( uls.select, uls )
			} );

			// Create region selectors, one per region
			this.$menu.find( '.uls-region, .uls-region-link' ).regionselector( {
				$target: lcd,
				languages: uls.languages,
				success: function( regionfilter ) {
					// Deactivate search filtering
					uls.$languageFilter.languagefilter( 'deactivate' );
					// If it is WW region, show the quicklist
					if ( regionfilter.regionGroup === 1 ) {
						lcd.quicklist();
					}
					// Show 'results view' if we are in no results mode
					uls.success();
				},
				noresults: function() {
					uls.$languageFilter.languagefilter( 'clear' );
				}
			} );
		},

		/**
		 * On select handler for search results
		 * @param langCode
		 */
		select: function( langCode ) {
			this.hide();
			if ( this.options.onSelect ) {
				this.options.onSelect.call( this, langCode );
			}
		},

		/**
		 * On cancel handler for the uls menu
		 */
		cancel: function() {
			this.hide();
			if ( this.options.onCancel ) {
				this.options.onCancel.call( this );
			}
		},

		keyup: function( e ) {
			if ( !this.shown ) {
				return;
			}
			if ( e.keyCode === 27 ) { // escape
				this.cancel();
				e.preventDefault();
				e.stopPropagation();
			}
		},

		keypress: function( e ) {
			if ( !this.shown ) {
				return;
			}
			if ( e.keyCode === 27 ) { // escape
				this.cancel();
				e.preventDefault();
				e.stopPropagation();
			}
		},

		click: function( e ) {
			e.stopPropagation();
			e.preventDefault();
			if ( this.shown ) {
				this.hide();
			} else {
				this.show();
			}
		},

		eventSupported: function ( eventName ) {
			var isSupported = eventName in this.$menu;

			if ( !isSupported ) {
				this.$element.setAttribute( eventName, 'return;' );
				isSupported = typeof this.$element[eventName] === 'function';
			}
			return isSupported;
		},

		isMobile: function () {
			return navigator.userAgent.match( /(iPhone|iPod|iPad|Android|BlackBerry)/ );
		}
	};

	/* ULS PLUGIN DEFINITION
	 * =========================== */

	$.fn.uls = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'uls' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'uls', ( data = new ULS( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.uls.defaults = {
		menu: template,
		onSelect: null, // Callback function to be called when a language is selected
		searchAPI: null, // Language search API
		languages: $.uls.data.getAutonyms(), // Languages to be used for ULS, default is all languages
		quickList: null, // Array of language codes or function that returns such
		lazyload: true // Lazy load the language list when scrolled.
	};

	//  Define a dummy i18n function, if jquery.i18n not integrated.
	if( !$.fn.i18n ) {
		$.fn.i18n = function( option ) {
		};
	}

	$.fn.uls.Constructor = ULS;

	// Private utility functions

	function getObjectLength ( obj ) {
		var k, count = 0;
		for ( k in obj ) {
			if ( obj.hasOwnProperty( k ) ) {
				count++;
			}
		}
		return count;
	}

} ( jQuery ) );
