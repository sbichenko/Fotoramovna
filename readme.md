# Fotoramovna v1.0-beta #

Fotoramovna is a jQuery plugin that expands Fotorama thumbnails into a multi-row responsive gallery.

For more information on the Fotorama plugin visit http://fotorama.io/

## Demo ##

[http://vzryvy.ru/projects/fotoramovna/tests/index.html](http://vzryvy.ru/projects/fotoramovna/tests/index.html)

## Usage ##

Include after jQuery:

`<script src="fotoramovna.js"></script>`

Create:

    $('.fotorama')
         .on('fotorama:ready', function() {
           fotoramovna = $(this).fotoramovna(options);  // passing options is optional
           })
         .fotorama();

Destroy:

    $('.fotorama').unfotoramovna();

Use the `.refresh()` API method after manipulating the contents of Fotoramovna from outside:

    $('.fotoramovna__cell').append('<div>foo</div>');
    $('.fotorama').data('fotoramovna').refresh();

## Testing via browser console ##

You can see how Fotoramovna would work on a webpage with a Fotorama by using a single command in your browser's console  (don't forget to indicate the correct Fotorama selector). Try it out on the <a href="http://fotorama.io">Fotorama homepage</a>.

    jQuery.getScript('http://vzryvy.ru/projects/fotoramovna/fotoramovna.js', function() {
        jQuery('.fotorama').fotoramovna()  // .fotoramovna() method accepts options (see below)
        })


## Options and defaults ##

    horizontalAlign: 'justify',
    // How the thumbnails are aligned. Possible values: 'center'
    // and 'justify'

    columns: 5,
    // Number of columns in the grid (if horizontalAlign is
    // 'justify'

    hideFotoramaOnInit: true,
    // Should fotorama be hidden initially (and expanded on
    // first click on a thumbnail) or not

    verticalAlign: 'middle',
    // Vertical alignment of thumbnails inside the grid.
    // Can also be 'top' and 'bottom'

    duration: 200,
    // Duration of all animations used by Fotoramovna
    // (not Fotorama). Should generally be lower than
    // Fotorama's transitionduration

    classname: "fotoramovna",
    // CSS class name of Fotoramovna and a prefix for its components

    overlayFrameOverThumb: true,
    // Whether to overlay the frame that indicates the current
    // thumb over the thumb itself or not.

    verticalOffset: 50,
    // When clicking on thumbs, Fotoramovna tries to
    // scroll so that the window is centered on the
    // current Fotorama image. This options allows to
    // tweak the final position of the image (if positive,
    // the image is lower, if negative, the image is higher).

    getWidthFromFotorama: false,
    // Whether to set Fotoramovna's max-width to Fotorama's width

    disableScroll: false,
    // Whether to disable scrolling when clicking on Fotorama or not

    fitHeight: true
    // Make all thumbnails the same height (as specified by
    // Fotorama's data-thumbheight. Only works with horizontalAlign:
    // 'center'.

Fotoramovna uses Fotorama's thumbnail dimensions as maximum dimensions. They can be controlled via data attributes.
At the moment Fotoramovna ignores individual thumbnail dimensions.

See [http://fotorama.io/customize/thumbnails/](http://fotorama.io/customize/thumbnails/) for more.

## API ##

Access the API by accessing the `fotoramovna` data property of the Fotorama to which Fotoramovna
is attached:

    var APIFotoramovna = $('.fotorama').data('fotoramovna')

Currently the only method provided by the API is the `.refresh()` method, which recalculates
dimensions of Fotoramovna and position of the frame. Use it after manipulating styles or
Fotoramovna's DOM via scripts.

## Styling ##

All elements inside a Fotoramovna may be styled -- with the exception of inline styles created by Fotoramovna.
Thus, the main limitations is that `margin-top` of `$cell` elements should
not be changed, as it is used to position the thumbs. Control the padding above and below
Fotorama by using `padding` on `.fotoramovna__wrapper-fotorama` (as it is absolutely positioned).
The exception to the rule is the `$frame`, which indicates the active thumbnail. Feel free to style
it like this:

    .fotoramovna__frame[style] {
        /* stuff, like color, margin width or box-shadow, perhaps.
         * use "!important". */
        }

Feel free to experiment with overriding inline styles, but always test it afterwards, especially
its behaviour during resizing. To override inline styles use the [style] selector:

    .elementname[style] {
        property: value !important;
        }

## Browser support ##

Fotoramovna has been tested in:

* Chrome 30

* FF 22

* IE 9

* iOS7 Safari (iPad and iPhone)


## Requirements ##

* jQuery (tested with 1.10.2, but should work with versions >=1.7)

* Fotorama (tested with 4.4.9 but should work with versions >=4.0.0)

* `<DOCTYPE>` must be specified.

## Notes ##

Behaviour during Fotorama's movement to the next row:

When a thumbnail is clicked, Fotoramovna scrolls the window so that the Fotorama is
centered vertically. When the slide is chosen from within Fotorama (via a click or
a swipe), Fotoramovna scrolls the window trying to keep the Fotorama in the same
place relative to the window (so the cursor points to the same part of Fotorama).

## Credits ##

Designed by Constantin Pulyarkin and Stanislav Bichenko at [Vzryvy](http://www.vzryvy.ru).

Programmed by Stanislav Bichenko.

## License ##

Dual licensed under the MIT and GPL licenses:

[http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)

[http://www.gnu.org/licenses/gpl.html](http://www.opensource.org/licenses/mit-license.php)