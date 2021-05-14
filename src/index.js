import languageData from '@wikimedia/language-data';
import '../css/jquery.uls.css';
import '../css/jquery.uls.grid.css';
import '../css/jquery.uls.lcd.css';
import '../css/jquery.uls.mobile.css';
import ULS from './jquery.uls.core';
import LanguageFilter from './jquery.uls.languagefilter';
import LanguageCategoryDisplay from './jquery.uls.lcd';

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

// eslint-disable-next-line no-multi-str
var noResultsTemplate = '<div class="uls-no-results-view"> \
	<h2 data-i18n="uls-no-results-found" class="uls-no-results-found-title">No results found</h2> \
	<div class="uls-no-results-suggestions"></div> \
	<div class="uls-no-found-more"> \
	<div data-i18n="uls-search-help">You can search by language name, script name, ISO code of language or you can browse by region.</div> \
	</div></div>';

$.fn.lcd.defaults = {
	// List of languages to show
	languages: [],
	// List of regions to show
	showRegions: [ 'WW', 'AM', 'EU', 'ME', 'AF', 'AS', 'PA' ],
	// Whether to group by region, defaults to true when columns > 1
	groupByRegion: 'auto',
	// How many items per column until new "row" starts
	itemsPerColumn: 8,
	// Number of columns, only 1, 2 and 4 are supported
	columns: 4,
	// Callback function for language item styling
	languageDecorator: undefined,
	// Likely candidates
	quickList: [],
	// Callback function for language selection
	clickhandler: undefined,
	// Callback function when no search results.
	// If overloaded, it can accept the search string as an argument.
	noResultsTemplate: function () {
		var $suggestionsContainer, $suggestions,
			$noResultsTemplate = $( noResultsTemplate );

		$suggestions = this.buildQuicklist().clone();
		$suggestions.removeClass( 'hide' )
			.find( 'h3' )
			.data( 'i18n', 'uls-no-results-suggestion-title' )
			.text( 'You may be interested in:' )
			.i18n();
		$suggestionsContainer = $noResultsTemplate.find( '.uls-no-results-suggestions' );
		$suggestionsContainer.append( $suggestions );
		return $noResultsTemplate;
	}
};

/* ULS PLUGIN DEFINITION
* =========================== */

$.fn.languagefilter = function ( option ) {
	return this.each( function () {
		var $this = $( this ),
			data = $this.data( 'languagefilter' ),
			options = typeof option === 'object' && option;

		if ( !data ) {
			$this.data( 'languagefilter', ( data = new LanguageFilter( this, options ) ) );
		}

		if ( typeof option === 'string' ) {
			data[ option ]();
		}
	} );
};

$.fn.languagefilter.defaults = {
	// LanguageCategoryDisplay
	lcd: undefined,
	// URL to which we append query parameter with the query value
	searchAPI: undefined,
	// What is this ULS used for.
	// Should be set for distinguishing between different instances of ULS
	// in the same application.
	ulsPurpose: '',
	// Object of language tags to language names
	languages: [],
	// Callback function when language is selected
	onSelect: undefined
};

$.fn.languagefilter.Constructor = LanguageFilter;

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
// DEPRECATED: CSS top position for the dialog
	top: undefined,
	// DEPRECATED: CSS left position for the dialog
	left: undefined,
	// Callback function when user selects a language
	onSelect: undefined,
	// Callback function when the dialog is closed without selecting a language
	onCancel: undefined,
	// Callback function when ULS has initialized
	onReady: undefined,
	// Callback function when ULS dialog is shown
	onVisible: undefined,
	// Callback function when ULS dialog is ready to be shown
	onPosition: undefined,
	// Languages to be used for ULS, default is all languages
	languages: languageData.getAutonyms(),
	// The options are wide (4 columns), medium (2 columns), and narrow (1 column).
	// If not specified, it will be set automatically.
	menuWidth: undefined,
	// What is this ULS used for.
	// Should be set for distinguishing between different instances of ULS
	// in the same application.
	ulsPurpose: '',
	// Used by LCD
	quickList: [],
	// Used by LCD
	showRegions: undefined,
	// Used by LCD
	languageDecorator: undefined,
	// Used by LCD
	noResultsTemplate: undefined,
	// Used by LCD
	itemsPerColumn: undefined,
	// Used by LCD
	groupByRegion: undefined,
	// Used by LanguageFilter
	searchAPI: undefined
};

// Define a dummy i18n function, if jquery.i18n not integrated.
if ( !$.fn.i18n ) {
	$.fn.i18n = function () {};
}

/**
 * Creates and returns a new debounced version of the passed function,
 * which will postpone its execution, until after wait milliseconds have elapsed
 * since the last time it was invoked.
 *
 * @param {Function} fn Function to be debounced.
 * @param {number} wait Wait interval in milliseconds.
 * @param {boolean} [immediate] Trigger the function on the leading edge of the wait interval,
 * instead of the trailing edge.
 * @return {Function} Debounced function.
 */
$.fn.uls.debounce = function ( fn, wait, immediate ) {
	var timeout;

	return function () {
		var callNow, self = this,
			later = function () {
				timeout = null;
				if ( !immediate ) {
					fn.apply( self, arguments );
				}
			};

		callNow = immediate && !timeout;
		clearTimeout( timeout );
		timeout = setTimeout( later, wait || 100 );

		if ( callNow ) {
			fn.apply( self, arguments );
		}
	};
};

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
			// eslint-disable-next-line no-jquery/no-global-selector
			$( 'html, body' ).stop().animate( {
				scrollTop: scrollPosition
			}, 500 );
		}
	} );
};

$.uls = $.uls || {};
$.uls.data = languageData;
$.uls.data.languages = languageData.getLanguages();
$.fn.uls.Constructor = ULS;
