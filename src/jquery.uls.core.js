/**
 * <explain briefly what this file is about>.
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

(function ( $ ) {
	"use strict";

	var ULS = function( element, options ) {
		this.$element = $( element );
		this.options = $.extend( {}, $.fn.uls.defaults, options );
		this.$menu = $( this.options.menu );
		this.languages = this.$menu.data( 'languages' );
		for ( var code in this.languages ) {
			if ( $.uls.data.languages[code] === undefined ) {
				window.console && console.log && console.log( "ULS: Unknown language " + code + "." );
				delete this.languages[code];
			}
		}
		this.shown = false;
		this.initialized = false;
		this.$languageFilter = $( 'input#languagefilter' );
		this.$noResultsView = $( 'div.uls-no-results-view' );
		this.$resultsView = $( 'div.uls-language-list' );
		this.$noResultsView.hide();
		this.render();
		this.listen();
		this.ready();
	};

	ULS.prototype = {
		constructor: ULS,
		ready: function() {
			// Currently empty, can be overridden for anything useful.
		},
		show: function() {
			var pos = $.extend( {}, this.$element.offset(), {
				height: this.$element[0].offsetHeight
			} );
			this.$menu.css( {
				top: pos.top + pos.height,
				left: '25%'
			} );

			if ( !this.initialized ) {
				// Initialize with a full search.
				// This happens on first time click of uls trigger.
				this.$languageFilter.languagefilter( 'clear' );
				this.initialized = true;
			}
			this.$menu.show();
			this.shown = true;
			this.$languageFilter.focus();
			return this;
		},

		hide: function() {
			this.$menu.hide();
			this.shown = false;
			return this;
		},

		render: function() {
			// Rendering stuff here
		},

		noresults: function( search ) {
			this.$noResultsView.show();
			// FIXME i18n
			this.$noResultsView.find( 'span#uls-no-found-search-term' ).text( search );
			this.$resultsView.hide();
		},

		success: function() {
			this.$noResultsView.hide();
			this.$resultsView.show();
		},

		listen: function() {
			var that = this, lcd;
			// Register all event listeners to the ULS here.
			that.$element.on( 'click', $.proxy( that.click, that ) );

			// Handle click on close button
			$( ".icon-close" ).on( 'click', $.proxy( that.click, that ) );

			// Handle key press events on the menu
			that.$menu.on('keypress', $.proxy(this.keypress, this) )
				.on('keyup', $.proxy(this.keyup, this) );
			if ( $.browser.webkit || $.browser.msie ) {
				this.$menu.on( 'keydown', $.proxy( this.keypress, this ) )
			}

			lcd = that.$resultsView.lcd( {
				languages: that.languages,
				clickhandler: function( langCode ) {
					if ( that.options.onSelect ) {
						that.options.onSelect.call( this, langCode );
					}
				}
			} ).data( "lcd" );

			that.$languageFilter.languagefilter( {
				$target: lcd,
				languages: that.languages,
				success: $.proxy( that.success, that ),
				noresults: $.proxy( that.noresults, that ),
				searchAPI: that.options.searchAPI
			} );

			// Create region selectors, one per region
			$( '.uls-region, .uls-region-link' ).regionselector( {
				$target: lcd,
				languages: that.languages,
				success: function() {
					// clear the search field.
					that.$languageFilter.val( '' );
					that.success();
				}
			} );

		},

		keyup: function( e ) {
			if ( !this.shown ) {
				return;
			}
			switch( e.keyCode ) {
				case 27: // escape
					this.hide();
					e.preventDefault();
					break;
			}
			e.stopPropagation();
		},

		keypress: function( e ) {
			if ( !this.shown ) {
				return;
			}
			switch( e.keyCode ) {
				case 27: // escape
					this.hide();
					e.preventDefault();
					break;
			}
			e.stopPropagation();
		},

		click: function( e ) {
			e.stopPropagation();
			e.preventDefault();
			if ( !this.shown ) {
				this.show();
			} else {
				this.hide();
			}
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
		menu: '.uls-menu',
		onSelect: null, // Callback function to be called when a language is selected
		searchAPI: null // Language search API
	};

	$.fn.uls.Constructor = ULS;

} )( jQuery );
