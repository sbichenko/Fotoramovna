/**
 * FOTORAMOVNA v1.0--beta5
 *
 * @author Stanislav Bichenko (s.bichenko@gmail.com)
 * @link https://github.com/sbichenko/fotoramovna
 * @requires jQuery, Fotorama >=4.4.0
 *
 * See full documentation on the Github page
 *
 * LICENSE
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

(function() {
    "use strict";
    var $ = jQuery,

        // OPTIONS
        //
        // (this object is used in the Fotoramovna constructor)
        defaults = {
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
            };

    $.fn.fotoramovna = function(options) {
        return FManager.addInstance($(this), options);
        };

    $.fn.unfotoramovna = function() {
        FManager.removeInstance($(this));
        }

    var FManager = {
        arrInstances: [],

        addInstance: function($el, settings) {
            var self = this,
                arrNew = [];

            $.each($el, function() {
                var FotoramovnaNew;

                // continue if Fotorama already is a part of another Fotoramovna
                if (self.findInstance($el)) {
                    return true;
                    }

                // create new Fotorama and add it to the array of Fotoramas that are being created
                FotoramovnaNew = new Fotoramovna($(this), settings, self);
                arrNew.push(FotoramovnaNew);
                });
            self.arrInstances = self.arrInstances.concat(arrNew);
            if (arrNew.length === 1) {
                return arrNew[0];
                }
            return arrNew;
            },

        removeInstance: function($elFotorama) {
            var self = this,
                searchResult = self.findInstance($elFotorama),
                Fotoramovna;


            if (searchResult) {
                Fotoramovna = searchResult.Fotoramovna;
                Fotoramovna.remove();
                Fotoramovna = {};
                self.arrInstances.splice(searchResult.index, 1);
                }
            },

        findInstance: function($elFotorama) {
            var self = this,
            result = false;

            $.each($elFotorama, function() {
                var domFotoramaCur = this;

                $.each(self.arrInstances, function(i) {
                    if (domFotoramaCur === this.$fotorama[0]) {
                        result = {
                            Fotoramovna: this,
                            index: i
                            }
                        return false;
                        }
                    });
                })
            return result;
            }
        };

    function FThumb(src, Fotoramovna) {
        this.src = src;
        this.Fotoramovna = Fotoramovna;
        this.row = false;
        this.$cell = $('<div class="' + Fotoramovna.CSSClassNames.cell + '">');
        this.$sizewrapper = $('<div class="' + Fotoramovna.CSSClassNames.sizewrapper + '">')
            .appendTo(this.$cell);
        this.$img = $('<img class="' + Fotoramovna.CSSClassNames.img + '" src="' + this.src + '">')
            .appendTo(this.$sizewrapper);
        }

    FThumb.prototype.setRow = function(row) {
        this.row = row;
        }

    FThumb.prototype.setCSSClassForNewRow = function() {
        this.$cell.addClass(this.Fotoramovna.CSSClassNames.firstInRow)
        }

    function FRow() {
        this.arrThumbs = [];
        this.$cells = $([]);
        }

    FRow.prototype.addThumb = function(thumb) {
        this.arrThumbs.push(thumb);
        this.$cells = this.$cells.add(thumb.$cell);
        thumb.setRow(this);
        }

    function Fotoramovna($fotorama, options, manager){
        var self = this,
            settings = $.extend({}, defaults, options);

        if (!($fotorama.data('fotorama')) || !($fotorama.data('fotorama').options)) {
            throw "Fotoramovna error: can't access $fotorama.data(). Passed object should be a ready Fotorama (version 4.4.0 or later)";
            }

        // own properties
        self.$fotorama = $fotorama;
        self.APIFotorama = $fotorama.data('fotorama');
        self.manager = manager;
        self.doIgnoreFotorama = false; // used for preventing Fotorama's 'show' event from calling selectThumb() when clicking on thumbs
        self.idTimerResize = false;

        // assign from settings
        self.horizontalAlign = settings.horizontalAlign;
        self.nameClass = settings.classname;
        self.countColumns = parseInt(settings.columns, 10);
        self.doHideOnInit = settings.hideFotoramaOnInit;
        self.doDisableScroll = settings.disableScroll;
        self.offsetScrollVertical = parseInt(settings.verticalOffset, 10);
        self.verticalAlign = settings.verticalAlign;
        self.durAnimation = settings.duration ?
            parseInt(settings.duration, 10) :
            self.$fotorama.data('fotorama').options.transitionduration;
        self.width = settings.getWidthFromFotorama ?
            self.APIFotorama.options.width :
            false;
        self.doFitHeight = settings.horizontalAlign == 'center' ?
            settings.fitHeight :
            false;

        // check inputs
        assert(self.horizontalAlign == 'center' || self.horizontalAlign == 'justify');
        assert(self.nameClass !== "", "Class name is not empty");
        assert(self.countColumns > 0, "Amount of columns is more than zero");
        assert(self.durAnimation >= 0, "Duration is more than or equal to zero");

        // CSS class names
        self.CSSClassNames = {
            wrapperFotorama: self.nameClass + '__wrapper-fotorama',
            grid: self.nameClass + '__grid',
            row: self.nameClass + '__row',
            gridBreak: self.nameClass + '__break',
            cell: self.nameClass + '__cell',
            cellPlaceholder: self.nameClass + '__placeholder',
            sizewrapper: self.nameClass + '__sizewrapper',
            img: self.nameClass + '__img',
            frame: self.nameClass + '__frame',
            firstInRow: self.nameClass + '__first-cell-in-row'
            };

        // load thumbs
        self.arrThumbs = [];
        self.$cells = $([]);
        self.loadThumbs();

        // update DOM
        self.$fotoramovna = false;
        self.$wrapperFotorama = false;
        self.$grid = false;
        self.$placeholders = $([]);
        self.$frame = false;
        self.updateDOM();

        // add styles
        self.addStyles();

        // add rows
        self.arrRows = [];
        self.detectRows();

        // set min-width for grid
        self.setMinWidth();

        // set up event listeners
        self.listenToThumbs();
        self.listenToFotorama();
        self.listenToResize();

        // set up events
        self.setEventLoad();

        // create API object
        self.initAPI();

        // select the first thumb or hide fotorama on init
        if (self.doHideOnInit) {
            self.$wrapperFotorama.hide();
            }
        else {
            self.selectThumb('init');
            }
        };

    Fotoramovna.prototype.loadThumbs = function() {
        var self = this,
            $cells = $([]),
            arrThumbs = [],
            arrDOMCells = [],
            thumbNew;

        // go through all slides and create thumbs
        $.each(self.APIFotorama.data, function() {
            assert(typeof(this.thumb) != 'undefined', "Thumb for slide " + this.i + " is undefined. Probably an HTML slide without a thumb set. Use data-thumb attribute to set thumb URL.")
            thumbNew = new FThumb(this.thumb, self);
            arrThumbs.push(thumbNew);
            arrDOMCells.push(thumbNew.$cell[0]);
            })
        $cells = $(arrDOMCells);
        self.arrThumbs = arrThumbs;
        self.$cells = $cells;
        }

    Fotoramovna.prototype.updateDOM = function() {
        var self = this,
            $anchorFotorama = self.$fotorama.prev('.fotorama--hidden'),
            htmlGridBreak = ('<div class="' + self.CSSClassNames.gridBreak + '">'),
            countPlaceholders,
            i;

        // wrap fotorama in a Fotoramovna div
        self.$fotorama.wrap('<div class="' + self.nameClass + '">');
        self.$fotoramovna = self.$fotorama.parent();

        // add Fotoramovna thumbnails grid
        self.$grid = $('<div class="' + self.CSSClassNames.grid + '">').appendTo(self.$fotoramovna);

        // add cells with thumbnails
        $.each(self.arrThumbs, function(indexThumb) {
            self.$grid.append(this.$cell);
            })

        if (self.horizontalAlign == 'justify') {
            // add placeholders
            countPlaceholders = self.countColumns - (self.arrThumbs.length % self.countColumns);
            for (i = 0; i < countPlaceholders; i++) {
                self.$placeholders = self.$placeholders.add(
                    $('<div class="' + self.CSSClassNames.cell + ' ' + self.CSSClassNames.cellPlaceholder + '">').appendTo(self.$grid)
                    );
                }

            // append breaks after rows
            self.$grid.find('.' + self.CSSClassNames.cell + ':nth-child(' + self.countColumns + 'n)').after($(htmlGridBreak));

            // add spaces after each cell
            self.$cells.add(self.$placeholders).after(" ") // without the " " the "text-align: justify" doesn't work
            }

        // add frame
        self.$frame = $('<div class="' + self.CSSClassNames.frame + '">').appendTo(self.$grid);
        self.$frame.hide();

        // add a wrapper for Fotorama
        self.$fotorama.wrap($('<div class="' + self.CSSClassNames.wrapperFotorama + '">'));
        self.$wrapperFotorama = self.$fotorama.parent();

        // move the hidden Fotorama anchor inside Fotoramovna
        $anchorFotorama.prependTo(self.$wrapperFotorama);
        }

    Fotoramovna.prototype.addStyles = function() {
        var self = this,
        optionsFotorama = self.APIFotorama.options,
        widthThumb = typeof(optionsFotorama.thumbwidth) != 'undefined' ?
            optionsFotorama.thumbwidth :
            optionsFotorama.thumbWidth,
        heightThumb = typeof(optionsFotorama.thumbheight) != 'undefined' ?
            optionsFotorama.thumbheight :
            optionsFotorama.thumbHeight,
        bottomImg = '',
        topImg = '';

        // set top and bottom for vertical alignment of images
        switch (self.verticalAlign) {
            case 'top':
                topImg = 0;
                break;
            case 'middle':
                topImg = 0;
                bottomImg = 0;
                break;
            case 'bottom':
                bottomImg = 0;
                break;
            }

        if(self.width !== false) {
            self.$fotoramovna.css('width', self.width + "px")
            }
        self.$fotoramovna.css({
            position: 'relative'
            });
        self.$wrapperFotorama.css({
            position: 'absolute',
            left: 0,
            right: 0,
            width: $('.fotorama__wrap', self.$fotorama).width() + "px",
            margin: '0 auto',
            zIndex: 100
            });
        $('.fotorama__nav-wrap', self.$fotorama).css({
            display: 'none'
            })
        $(self.$grid).css({
            position: 'relative',
            textAlign: self.horizontalAlign,
            fontSize: '0.1px',
            lineHeight: '1'
            })
        self.$cells.add(self.$placeholders).css({
            display: 'inline-block',
            textAlign: 'center'
            })
        $('.' + self.CSSClassNames.cellPlaceholder, self.$fotoramovna).css({
            margin: '0px',
            padding: '0px',
            width: widthThumb
            })
        $('.' + self.CSSClassNames.sizewrapper, self.$fotoramovna).css({
            position: 'relative',
            display: 'block',
            width: widthThumb,
            height: heightThumb,
            marginTop: 0
            })
        $('.' + self.CSSClassNames.img, self.$fotoramovna).css({
            cursor: 'pointer',
            position: 'absolute',
            margin: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            left: 0,
            right: 0,
            // vertical alignment of imgs
            bottom: bottomImg,
            top: topImg
            })
        $('.' + self.CSSClassNames.gridBreak, self.$fotoramovna).css({
            display: 'inline-block',
            width: '100%'
            })
        self.$frame.css({
            position: 'absolute',
            border: '2px rgb(0, 175, 234) solid',
            zIndex: 50
            });

        // make the images fit by height
        if (self.doFitHeight) {
            $('.' + self.CSSClassNames.img, self.$fotoramovna).css({
                maxWidth: '',
                height: '100%'
                })
            $('.' + self.CSSClassNames.cell, self.$fotoramovna).css({
                marginRight: self.APIFotorama.options.thumbmargin + "px",
                overflow: 'hidden'
                })

            // set width for individual thumbnails
            $.each(this.arrThumbs, function() {
                var thumb = this;

                onImageLoad(thumb.$img, function() {
                    thumb.$sizewrapper.css('width', thumb.$img.outerWidth(false) - 1 + 'px');

                    // recalculate rows and row paddingn height. This is pretty wasteful,
                    // but doesn't seem to incure a noticeable performance impact.
                    self.detectRows();
                    self.refresh();
                    })
                })
            }

        // trigger Fotorama's left offset recalculation (so that the click on the
        // left 1/3 of the slide shows previous slide)
        self.APIFotorama.resize();
        }

    Fotoramovna.prototype.detectRows = function() {
        var self = this,
            leftCellLast = Number.POSITIVE_INFINITY;

        self.$cells.removeClass(self.CSSClassNames.firstInRow);
        self.arrRows = [];
        $.each(self.arrThumbs, function() {
            var $cell = this.$cell,
                leftCell = $cell.offset().left,
                rowLast;

            if (leftCell <= leftCellLast) {
                self.arrRows.push(new FRow);
                this.setCSSClassForNewRow();
                }
            rowLast = self.arrRows[self.arrRows.length - 1];
            rowLast.addThumb(this);
            leftCellLast = leftCell;
            })
        }

    Fotoramovna.prototype.getAPIObject = function() {
        var self = this;

        return {
            refresh: function() {
                self.refresh();
                }
            }
        }

    Fotoramovna.prototype.initAPI = function() {
        var self = this,
            API = this.getAPIObject();

        self.$fotorama.data('fotoramovna', API)
        }

    Fotoramovna.prototype.listenToThumbs = function() {
        var self = this;

        $("." + self.CSSClassNames.img, this.$fotoramovna).on('click', function() {
            var index = $('.' + self.CSSClassNames.img, self.$fotoramovna).index(this);

            self.doIgnoreFotorama = true; // so that the 'show' event handler won't call selectThumb again
            self.APIFotorama.show(index);
            self.selectThumb('thumb');
            self.doIgnoreFotorama = false;
            })
        }

    Fotoramovna.prototype.listenToResize = function() {
        var self = this,
            fnTimer = function() {
                self.refresh();
                };

        $(window).on('resize', function() {
            window.clearTimeout(self.idTimerResize);
            self.idTimerResize = window.setTimeout(fnTimer, 100);
            })
        }

    Fotoramovna.prototype.listenToFotorama = function() {
        var self = this;

        this.$fotorama
            .on('fotorama:show', function() {
                if (!self.doIgnoreFotorama) {
                    self.selectThumb('fotorama');
                    }
                })
            .on('fotorama:fullscreenexit', function() {
                if (!self.doIgnoreFotorama) {
                    self.selectThumb('refresh');
                    }
                })
        }

    Fotoramovna.prototype.setEventLoad = function() {
        var self = this;

        (function() {
            var countLoadedThumbs = 0;

            $.each(self.arrThumbs, function() {
                onImageLoad(this.$img, function() {
                    countLoadedThumbs++;
                    if (self.arrThumbs.length <= countLoadedThumbs) {
                        // set timeout to make sure that all other internal event handlers
                        // have been called
                        setTimeout(function() {
                            self.$fotorama.trigger('fotoramovna:load');
                            }, 10);
                        }
                    });
                })
            })();
        }

    Fotoramovna.prototype.remove = function() {
        var self = this;

        self.$wrapperFotorama.contents().unwrap();
        self.$fotoramovna.children(':not(.fotorama)').remove();
        self.$fotoramovna.contents().unwrap();
        $('.fotorama__nav-wrap', self.$fotorama).css('display', 'block');
        self.$fotorama.off('fotorama:show', self.onClick);
        }

    Fotoramovna.prototype.refresh = function() {
        if (this.thumbCur) {
            this.refreshFotoramaWidth();
            }
        this.detectRows();
        this.setMinWidth();
        if (this.thumbCur) {
            // don't do anything with thumbs of no thumb is selected (and Fotorama is hidden)
            this.selectThumb('refresh');
            }
        }

    Fotoramovna.prototype.refreshFotoramaWidth = function() {
        this.$wrapperFotorama.css('width', 'auto');
        this.APIFotorama.resize();
        this.$wrapperFotorama.css('width', $('.fotorama__stage', this.$fotoramovna).width() + 'px');
    }

    Fotoramovna.prototype.setMinWidth = function() {
        var self = this,
            widthMin = Number.NEGATIVE_INFINITY;

        if (self.horizontalAlign == 'justify') {
            $.each(self.arrRows, function() {
                var widthRow = 0;
                this.$cells.each(function() {
                    widthRow += $(this).outerWidth(true);
                    })
                if (widthRow > widthMin) {
                    widthMin = widthRow;
                    }
                })
            widthMin = widthMin + 1;
            self.$fotoramovna.css('minWidth', widthMin + 'px');
            }
        }

    Fotoramovna.prototype.getDuration = function(source) {
        return source != 'refresh' && source != 'init' ? this.durAnimation : 0
        }

    // main animation method
    // 'source' may be
    //      'init': initial display of Fotoramovna if hideFotoramaOnInit is false
    //      'thumb': when a thumb is clicked
    //      'fotorama': when a slide is changed from within Fotorama
    //      'refresh': when the window has been resized or when called by an outside script
    Fotoramovna.prototype.selectThumb = function(source) {
        var self = this;

        // make sure that Fotorama is visible, as its height and width are used in calculations
        if (!this.thumbCur) {
            self.$wrapperFotorama.show();
            this.refreshFotoramaWidth();
            }

        // only then do everything else
        (function(){
            var index = self.APIFotorama.activeIndex,
                thumb = self.arrThumbs[index],
                rowNew = thumb.row,
                rowCur = self.thumbCur ? self.thumbCur.row : false,
                isNewRow = (rowNew !== rowCur),
                heightFotorama = self.$wrapperFotorama.outerHeight(false),
                direction = rowCur && self.arrRows.indexOf(rowNew) > self.arrRows.indexOf(rowCur) ?
                    'down' :
                    'up',
                topTargetFotorama = (direction == 'up' || rowCur === false) ?
                    // when Fotorama is moving up, target thumb row moves one Fotorama height down,
                    // so no adjustment is needed
                    thumb.$cell.position().top :
                    // when Fotorama is moving down, target thumb row is still,
                    // so we must adjust Fotorama's position by it's height
                    thumb.$cell.position().top - heightFotorama;

            // a source must be passed
            if (!source) {
                throw "Fotoramovna.selectThumb() error: Unknown source";
                }

            // move the Fotorama if neccessary
            if (isNewRow || source == 'refresh') {
                self.moveFotorama(topTargetFotorama, heightFotorama, rowNew, source);
                // scroll at the same time
                self.scroll(topTargetFotorama, source);
                }

            // after row animations are finished, move the frame
            thumb.$cell.promise().done(function() {
                self.moveFrame(thumb, isNewRow);
                })

            // show Fotorama in case this is the first selection with 'hideFotoramaOnInit' option on
            if (!self.thumbCur && self.doHideOnInit) {
                self.$wrapperFotorama.hide();
                self.$wrapperFotorama.slideToggle(self.durAnimation, self.APIFotorama.resize);
                // APIFotorama.resize() is called in order for it to recalculate it's left offset
                }

            // finally, set current thumb
            self.thumbCur = thumb;
            })();
        }

    Fotoramovna.prototype.moveFotorama = function(topTargetFotorama, heightFotorama, rowNew, source) {
        var self = this,
            duration = self.getDuration(source);  // move instantly on init

        // hide frame so it doesn't "hang in the air" while fotorama is being moved down
        self.$frame.hide();

        // set padding-top to 0 for all rows
        self.$cells.animate({
            marginTop: 0
            }, {duration: duration, queue: false});

        // add padding-top for target row to make space for Fotorama
        rowNew.$cells.animate({
            marginTop: heightFotorama
            }, {duration: duration, queue: false});

        // move Fotorama above the selected thumb
        self.$wrapperFotorama.animate({
            top: topTargetFotorama + "px"
            }, {duration: duration, queue: false, complete: function(){self.$frame.show()}});
        }

    Fotoramovna.prototype.scroll = function(topTarget, source) {
        var self = this,
            duration = self.getDuration(source),
            scrollTopTarget = false,
            topFotoramovna = self.$fotoramovna.offset().top,
            topTargetAbsolute = topTarget + topFotoramovna,
            diff = topTargetAbsolute - self.$wrapperFotorama.offset().top,
            $stage = $('.fotorama__stage', self.$fotorama),
            // assumes distance between 'stage' and 'wrap' won't change
            topTargetStageAbsolute = topTargetAbsolute + $stage.offset().top - self.$wrapperFotorama.offset().top;

        if (self.doDisableScroll) {
            return false;
            }

        // determine scrolling behaviour
        switch (source) {
            case 'fotorama':
                // if the call came from a Fotorama, we should scroll down or up distance equal to
                // its height, so the arrow on which the user clicked is still in place
                scrollTopTarget = '+=' + diff;
                break;
            case 'thumb':
                // if the call came from a Fotoramovna thumb, we should scroll down or up so that
                // Fotorama is centered vertically
                scrollTopTarget =
                    topTargetStageAbsolute - ($(window).height() - $stage.outerHeight(false)) / 2
                    + self.offsetScrollVertical;
                break;
            }
        if (scrollTopTarget) {
            $('body, html').animate({scrollTop: scrollTopTarget}, {duration: duration, queue: false});
            }
        }

    Fotoramovna.prototype.moveFrame = function(thumb, isRowNew) {
        var self = this;

        // if the selected thumb is already loaded, move the frame to it
        onImageLoad(thumb.$img, function() {moveFrame();})

        function moveFrame() {
            var targetWidth = thumb.$img.outerWidth(false)
                    - parseFloat(self.$frame.css('borderBottomWidth'))
                    - parseFloat(self.$frame.css('borderTopWidth')),
                targetHeight = thumb.$img.outerHeight(false)
                    - parseFloat(self.$frame.css('borderRightWidth'))
                    - parseFloat(self.$frame.css('borderLeftWidth')),
                // not using .position() to allow using non-static positioning for $sizewrappers and $imgs
                targetTop = thumb.$img.offset().top - self.$grid.offset().top,
                targetLeft = thumb.$img.offset().left - self.$grid.offset().left,
                duration = !isRowNew ? self.durAnimation : 0;

            // animate the frame
            self.$frame.animate({
                width: targetWidth + "px",
                height: targetHeight + "px",
                top: targetTop + "px",
                left: targetLeft + "px"
                }, duration);
            }
        }

    function onImageLoad($el, fnCallback) {
        if ($el[0].complete) {
            fnCallback();
            }
        else { // if the thumb image is not loaded, wait until it is (relevant only when changing frames via Fotorama itself)
            $el.one('load', function() {
                fnCallback();
                })
            }
        }

    function assert(condition, message) {
        if (!condition) {
            throw "Fotoramovna exception. Assertion failed: \"" + message + "\"";
            }
        }

    // indexOf polyfill, via https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    if (typeof Array.prototype.indexOf === 'undefined') {
      Array.prototype.indexOf = function (searchElement, fromIndex) {
        if (!this) {
          throw new TypeError();
        }

        fromIndex = +fromIndex;
        if (isNaN(fromIndex)) {
          fromIndex = 0;
        }

        var length = this.length;

        if (length == 0 || fromIndex >= length) {
          return -1;
        }

        if (fromIndex < 0) {
          fromIndex += length;
        }

        while (fromIndex < length) {
          if (this[fromIndex++] === searchElement) {
            return fromIndex;
          }
        }

        return -1;
      };
    }
    })();