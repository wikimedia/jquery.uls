jQuery Universal Language Selector
==================================
Universal Language Selector

[![Build Status](https://secure.travis-ci.org/wikimedia/jquery.uls.png)](http://travis-ci.org/wikimedia/jquery.uls)

This is a [Wikimedia Foundation Internationalization team project](https://www.mediawiki.org/wiki/Project_Milkshake).


![Universal Language Selector](https://upload.wikimedia.org/wikipedia/commons/c/cd/ULS-GeoIP.png "Universal Language Selector")

Quick start
-----------

```bash
git clone https://github.com/wikimedia/jquery.uls.git
```

Documentation
-------------

The quick and easy way to learn usage of jquery.uls is trying out the examples/index.html in some webserver. Try it from here: http://thottingal.in/projects/js/jquery.uls/examples/

The jQuery.uls provides a jQuery extension ```$.fn.uls``` that can be attached to a trigger element. The expected behavior is, when you click on the trigger, the language selector opens up.

The trigger can be a link, button or any valid jQuery element.

Example:
```javascript
$( '.uls-trigger' ).uls( );
```

To use the selected language, you need define a selection Handler as shown below

```javascript
$( '.uls-trigger' ).uls( {
  onSelect : function( language ) {
  // language is a ISO 639 language code. eg: en, hi, fi, he etc
  // Your selection handler code goes here.
  }
} );
```

In some usecases, you may need to provide a quick list of languages to select before going through all languages. For eg, it can a list of recently selected languages, language suggestions based on Geo IP.
That can be done as follows

```javascript
$( '.uls-trigger' ).uls( {
  onSelect : function( language ) {
  // language is a ISO 639 language code. eg: en, hi, fi, he etc
  // Your selection handler code goes here.
  },
  quickList: [ 'en', 'ml', 'hi' ] // An array of language codes. Can be a function that returns this array too.
} );
```

If the search needs to be more complex(such as cross language search, spelling error tolerating etc), a search API option can be provided.

```javascript
$( '.uls-trigger' ).uls( {
  onSelect : function( language ) {
  // language is a ISO 639 language code. eg: en, hi, fi, he etc
  // Your selection handler code goes here.
  },
  searchAPI: apiURL,
  quickList: [ 'en', 'ml', 'hi' ] // An array of language codes. Can be a function that returns this array too.
} );
```

Example for such an api is used in Wikipedia: http://en.wikipedia.org/w/api.php?action=languagesearch&search=Te

ULS knows about 500 languages. If you dont want to use that many languages for your usecase, use languages option.


```javascript
$( '.uls-trigger' ).uls( {
  onSelect : function( language ) {
  // language is a ISO 639 language code. eg: en, hi, fi, he etc
  // Your selection handler code goes here.
  },
  languages: { languageCode1: languageName, languageCode2: languageName2 , .... },
  searchAPI: apiURL,
  quickList: [ 'en', 'ml', 'hi' ] // An array of language codes. Can be a function that returns this array too.
} );
```

*Other Options*

| Option      | Description |
|-------------|---------------------|
| left        | left position of ULS. eg: 100px, 20%|
| top         | top position of ULS. eg: 100px, 20%|
| onCancel    | function to be handled when language selection is not done. ie. language selector is closed without selecting any |
| showRegions | Regions to be shown in the language selector. Default: ['WW', 'AM', 'EU', 'ME', 'AF', 'AS', 'PA'] |
| itemsPerColumn | Number of languages per column. Default is 8 |


Features
--------
jQuery.uls has an elaborative language information collection. It knows about
1. the script in which a language is written.
2. The script code
3. The language code
4. The regions in which the language is spoken
5. The autonym - language name written in its own script

With all these information the search becomes very effective. Based on the spoken regions, the UI organize the languages. In side regions
the language is again organized based on scripts.

A user can search for a language based on script name.

ULS can autocomplete a language name search.

An advanced usage of jQuery.uls can be tried out from wikimedia sites. For eg, see the language icon at the top of http://mediawiki.org

More details
------------
* Technical design - https://www.mediawiki.org/wiki/Universal_Language_Selector/Design
* UX Design https://www.mediawiki.org/wiki/Universal_Language_Selector/Design


How to build and test jQuery ULS
----------------------------------

First, get a copy of the git repo by running:

```shell
git clone git://github.com/wikimedia/jquery.uls.git
```

Make sure you have `grunt` installed by testing:

```shell
grunt -version
```

If not, run:

```shell
npm install
```

To run tests locally, run `grunt test`. This will run the tests in PhantomJS.

You can also run the tests in a browser by navigating to the `test/` directory, but first run `grunt` to install the submodules.

Coding style
-------------

Please follow [jQuery coding guidelines](http://docs.jquery.com/JQuery_Core_Style_Guidelines)

