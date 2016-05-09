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

	var template, ULS;

	// Region numbers in id attributes also appear in the langdb.
	/*jshint multistr:true */
	template = '<div class="grid uls-menu"> \
			<div id="search" class="row uls-search"> \
				<div class="uls-search-wrapper"> \
					<label class="uls-search-label" for="uls-languagefilter"></label>\
					<div class="uls-search-input-wrapper">\
						<span id="uls-languagefilter-clear" class="uls-languagefilter-clear"></span>\
						<input type="text" class="uls-filterinput uls-filtersuggestion"\
							id="uls-filtersuggestion" disabled="true" autocomplete="off">\
						<input type="text" class="uls-filterinput uls-languagefilter"\
							id="uls-languagefilter" data-clear="uls-languagefilter-clear"\
							data-suggestion="uls-filtersuggestion"\
							placeholder="Language search" autocomplete="off">\
					</div>\
				</div>\
			</div>\
			<div class="row uls-language-list"></div>\
			<div class="row" id="uls-settings-block"></div>\
		</div>';
	/*jshint multistr:false */

	/**
	 * Count the number of keys in an object.
	 * Works in a cross-browser way.
	 * @param {Object} The object.
	 */
	function objectLength ( obj ) {
		var count, key;

		// Some old browsers don't support Object.keys
		if ( Object.keys ) {
			return Object.keys( obj ).length;
		}

		count = 0;

		for ( key in obj ) {
			if ( Object.prototype.hasOwnProperty.call( obj, key ) ) {
				count++;
			}
		}

		return count;
	}

	/**
	 * ULS Public class definition
	 */
	ULS = function ( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.uls.defaults, options );
		this.$menu = $( template );
		this.languages = this.options.languages;

		for ( var code in this.languages ) {
			if ( $.uls.data.languages[ code ] === undefined ) {
				// Language is unknown to ULS.
				delete this.languages[ code ];
			}
		}

		this.left = this.options.left;
		this.top = this.options.top;
		this.shown = false;
		this.initialized = false;

		this.$languageFilter = this.$menu.find( '#uls-languagefilter' );
		this.$resultsView = this.$menu.find( 'div.uls-language-list' );

		this.render();
		this.listen();
		this.ready();
	};

	ULS.prototype = {
		constructor: ULS,

		/**
		 * A "hook" that runs after the ULS constructor.
		 * At this point it is not guaranteed that the ULS has its dimensions
		 * and that the languages lists are initialized.
		 *
		 * To use it, pass a function as the onReady parameter
		 * in the options when initializing ULS.
		 */
		ready: function () {
			if ( this.options.onReady ) {
				this.options.onReady.call( this );
			}
		},

		/**
		 * A "hook" that runs after the ULS panel becomes visible
		 * by using the show method.
		 *
		 * To use it, pass a function as the onVisible parameter
		 * in the options when initializing ULS.
		 */
		visible: function () {
			if ( this.options.onVisible ) {
				this.options.onVisible.call( this );
			}
		},

		/**
		 * Calculate the position of ULS
		 * Returns an object with top and left properties.
		 * @returns {Object}
		 */
		position: function () {
			var pos;

			pos = $.extend( {}, this.$element.offset(), {
				height: this.$element[ 0 ].offsetHeight
			} );

			return {
				top: this.top !== undefined ? this.top : pos.top + pos.height,
				left: this.left !== undefined ? this.left : '25%'
			};
		},

		/**
		 * Show the ULS window
		 */
		show: function () {
			var widthClasses = {
				wide: 'uls-wide',
				medium: 'uls-medium',
				narrow: 'uls-narrow'
			};

			this.$menu.addClass( widthClasses[this.getMenuWidth()] );
			this.$menu.css( this.position() );

			if ( !this.initialized ) {
				$( 'body' ).prepend( this.$menu );
				this.i18n();
				this.initialized = true;
			}

			this.$menu.show();
			this.$menu.scrollIntoView();
			this.shown = true;

			if ( !this.isMobile() ) {
				this.$languageFilter.focus();
			}

			this.visible();
		},

		i18n: function () {
			if ( $.i18n ) {
				this.$menu.find( '[data-i18n]' ).i18n();
				this.$languageFilter.prop( 'placeholder', $.i18n( 'uls-search-placeholder' ) );
			}
		},

		/**
		 * Hide the ULS window
		 */
		hide: function () {
			this.$menu.hide();
			this.shown = false;

			if ( this.options.onCancel ) {
				this.options.onCancel.call( this );
			}
		},

		/**
		 * Render the UI elements.
		 * Does nothing by default. Can be used for customization.
		 */
		render: function () {
			// Rendering stuff here
		},

		/**
		 * Callback for no results found context.
		 */
		noresults: function () {
			this.$resultsView.lcd( 'noResults' );
		},

		/**
		 * callback for results found context.
		 */
		success: function () {
			this.$resultsView.show();
		},

		/**
		 * Bind the UI elements with their event listeners
		 */
		listen: function () {
			var lcd, columnsOptions, languagesCount;

			columnsOptions = {
				wide: 4,
				medium: 2,
				narrow: 1
			};

			// Register all event listeners to the ULS here.
			this.$element.on( 'click', $.proxy( this.click, this ) );

			// Don't do anything if pressing on empty space in the ULS
			this.$menu.on( 'click', function ( e ) {
				e.stopPropagation();
			} );

			// Handle key press events on the menu
			this.$menu.on( 'keypress', $.proxy( this.keypress, this ) )
				.on( 'keyup', $.proxy( this.keyup, this ) );

			if ( this.eventSupported( 'keydown' ) ) {
				this.$menu.on( 'keydown', $.proxy( this.keypress, this ) );
			}

			languagesCount = objectLength( this.options.languages );
			lcd = this.$resultsView.lcd( {
				languages: this.languages,
				columns: columnsOptions[ this.getMenuWidth() ],

				quickList: languagesCount > 12 ? this.options.quickList : false,
				clickhandler: $.proxy( this.select, this ),
				source: this.$languageFilter,
				showRegions: this.options.showRegions,
				languageDecorator: this.options.languageDecorator
			} ).data( 'lcd' );

			this.$languageFilter.languagefilter( {
				$target: lcd,
				languages: this.languages,
				searchAPI: this.options.searchAPI,
				onSelect: $.proxy( this.select, this )
			} );

			this.$languageFilter.on( 'noresults.uls', $.proxy( this.noresults, this ) );
			this.$languageFilter.on( 'resultsfound.uls', $.proxy( this.success, this ) );

			$( 'html' ).click( $.proxy( this.cancel, this ) );
		},

		/**
		 * On select handler for search results
		 * @param langCode
		 */
		select: function ( langCode ) {
			this.hide();
			if ( this.options.onSelect ) {
				this.options.onSelect.call( this, langCode );
			}
		},

		/**
		 * On cancel handler for the uls menu
		 */
		cancel: function ( e ) {
			if ( e && ( this.$element.is( e.target ) || $.contains( this.$element[0], e.target ) ) ) {
				return;
			}

			this.hide();
		},

		keyup: function ( e ) {
			if ( !this.shown ) {
				return;
			}

			if ( e.keyCode === 27 ) { // escape
				this.cancel();
				e.preventDefault();
				e.stopPropagation();
			}
		},

		keypress: function ( e ) {
			if ( !this.shown ) {
				return;
			}

			if ( e.keyCode === 27 ) { // escape
				this.cancel();
				e.preventDefault();
				e.stopPropagation();
			}
		},

		click: function () {
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
				isSupported = typeof this.$element[ eventName ] === 'function';
			}

			return isSupported;
		},

		/**
		 * Get the panel menu width parameter
		 * @return string
		 */
		getMenuWidth: function () {
			var languagesCount;

			if ( this.options.menuWidth ) {
				return this.options.menuWidth;
			}

			languagesCount = objectLength( this.options.languages );

			if ( languagesCount < 12 ) {
				return 'narrow';
			}

			if ( languagesCount < 100 ) {
				return 'medium';
			}

			return 'wide';
		},

		isMobile: function () {
			return navigator.userAgent.match( /(iPhone|iPod|iPad|Android|BlackBerry)/ );
		}
	};

	/* ULS PLUGIN DEFINITION
	 * =========================== */

	$.fn.uls = function ( option ) {
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( 'uls' ),
				options = typeof option === 'object' && option;

			if ( !data ) {
				$this.data( 'uls', ( data = new ULS( this, options ) ) );
			}

			if ( typeof option === 'string' ) {
				data[ option ]();
			}
		} );
	};

	$.fn.uls.defaults = {
		onSelect: null, // Callback function to be called when a language is selected
		searchAPI: null, // Language search API
		languages: $.uls.data.getAutonyms(), // Languages to be used for ULS, default is all languages
		quickList: null, // Array of language codes or function that returns such
		// The options are wide (4 columns), medium (2 columns), and narrow (1 column).
		// If not specified, it will be set automatically.
		menuWidth: null,
		showRegions: [ 'WW', 'AM', 'EU', 'ME', 'AF', 'AS', 'PA' ],
		languageDecorator: null // Callback function to be called when a language link is prepared - for custom decoration.
	};

	// Define a dummy i18n function, if jquery.i18n not integrated.
	if ( !$.fn.i18n ) {
		$.fn.i18n = function () {};
	}

	/*
	 * Simple scrollIntoView plugin.
	 * Scrolls the element to the viewport smoothly if it is not already.
	 */
	$.fn.scrollIntoView = function () {
		return this.each( function () {
			var scrollPosition,
				$window = $( window ),
				windowHeight = $window.height(),
				windowTop = $window.scrollTop(),
				windowBottom = windowTop + windowHeight,
				$element = $( this ),
				panelHeight = $element.height(),
				panelTop = $element.offset().top,
				panelBottom = panelTop + panelHeight;

			if ( ( panelTop < windowTop ) || ( panelBottom > windowBottom ) ) {
				if ( windowTop > panelTop ) {
					scrollPosition = panelTop;
				} else {
					scrollPosition = panelBottom - windowHeight;
				}
				$( 'html, body' ).stop().animate( {
					scrollTop: scrollPosition
				}, 500 );
			}
		} );
	};

	$.fn.uls.Constructor = ULS;
}( jQuery ) );
