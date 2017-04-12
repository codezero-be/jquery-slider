(function ($, window, document, undefined) {

    var pluginName = "slide",
        defaults = {
            // General settings...
            viewport: ".slider-viewport",
            track: ".slider-track",
            slide: ".slide",
            prevArrow: ".slider-prev",
            nextArrow: ".slider-next",
            atLastSlide: ".slider-end",
            atFirstSlide: ".slider-start",
            noSlide: ".no-slide",
            slideSpeed: 500,
            enableSwipe: true,

            // The breakpoint can be an integer or
            // a function that returns an integer.
            singleSlideBreakPoint: function ($slider) {
                return $slider.height() * 4;
            },

            // Slide distance used if the viewport is wider than "singleSlideBreakPoint".
            // Return any value supported by the jquery.scrollTo plegin:
            // https://github.com/flesler/jquery.scrollTo
            defaultSlideDistance: function ($slider, $viewport, $track, isNext) {
                return (isNext ? '+=' : '-=') + ($viewport.width() * .70) + 'px';
            },

            // Before callbacks...
            // Return false to cancel slide.
            onBeforeSlideNext: function ($slider) { },
            onBeforeSlidePrev: function ($slider) { },

            // After callbacks...
            onAfterSlideNext: function ($slider) { },
            onAfterSlidePrev: function ($slider) { }
        };

    function Plugin(element, options) {
        // Merge options...
        this.options = $.extend( {}, defaults, options);

        // Cache elements...
        this.$slider = $(element);
        this.$viewport = this.$slider.find(this.options.viewport);
        this.$track = this.$slider.find(this.options.track);
        this.$slides = this.$slider.find(this.options.slide);

        // Calculated values...
        this.viewportWidth = 0;
        this.slidesTotalWidth = 0;
        this.singleSlideIsWiderThanViewport = false;
        this.slidesFitInViewport = false;
        this.noSlideClass = (this.options.noSlide).substr(1);
        this.onResize = null;

        // Kickoff...
        this.init();
    }

    Plugin.prototype = {

        init: function ()  {
            this.registerEvents();
            this.evaluateSlider();

            // Do a recheck after 1 second
            // in case images load slowly...
            setTimeout(function () {
                this.evaluateSlider();
            }.bind(this), 1000);
        },

        registerEvents: function () {
            // Next arrow click...
            this.$slider.on('click', this.options.nextArrow, function (e) {
                e.preventDefault();
                this.slideTo(this.$slides, true);
            }.bind(this));

            // Prev arrow click...
            this.$slider.on('click', this.options.prevArrow, function (e) {
                e.preventDefault();
                this.slideTo($(this.$slides.get().reverse()), false);
            }.bind(this));

            if (this.options.enableSwipe) {
                // Swipe left...
                this.$slider.on('swiperight', function () {
                    this.slideTo($(this.$slides.get().reverse()), false);
                }.bind(this));

                // Swipe right...
                this.$slider.on('swipeleft', function () {
                    this.slideTo(this.$slides, true);
                }.bind(this));
            }

            // Window resize event...
            $(window).on('resize', function () {
                clearTimeout(this.onResize);
                this.onResize = setTimeout(function () {
                    this.evaluateSlider();
                    this.onResize = null;
                }.bind(this), 900);
            }.bind(this));
        },

        // Triggered on init
        // and on window resize.
        evaluateSlider: function () {
            this.updateSliderInfo();
            this.updateSlider();
            this.updateArrows();
        },

        updateSliderInfo: function () {
            this.viewportWidth = this.getViewportWidth();
            this.slidesTotalWidth = this.getSlidesWidth();
            this.singleSlideIsWiderThanViewport = this.isSingleSlideWiderThanViewport();
            this.slidesFitInViewport = this.checkSlidesFitInViewport();
        },

        updateSlider: function () {
            if (this.slidesFitInViewport || this.singleSlideIsWiderThanViewport) {
                this.$slider.addClass(this.noSlideClass);
            } else {
                this.$slider.removeClass(this.noSlideClass);
            }

            if (this.singleSlideIsWiderThanViewport) {
                this.slideTo(this.$slides, true);
            }
        },

        updateArrows: function () {
            var atLastSlide = (this.options.atLastSlide).substr(1),
                atFirstSlide = (this.options.atFirstSlide).substr(1);

            if (this.isAtLastSlide()) {
                this.$slider.addClass(atLastSlide);
            } else {
                this.$slider.removeClass(atLastSlide);
            }

            if (this.isAFirstSlide()) {
                this.$slider.addClass(atFirstSlide);
            } else {
                this.$slider.removeClass(atFirstSlide);
            }
        },

        slideTo: function ($slides, isNext) {
            if (this.runBeforeCallback(isNext) === false) {
                return false;
            }

            this.$viewport.scrollTo(this.getSlideToPosition($slides, isNext), this.options.slideSpeed, {
                onAfter: function () {
                    this.updateArrows();
                    this.runAfterCallback(isNext);
                }.bind(this)
            });
        },

        getSlideToPosition: function ($slides, isNext) {
            if ( ! this.isInSingleSlideMode()) {
                return this.options.defaultSlideDistance(this.$slider, this.$viewport, this.$track, isNext);
            }

            var trackOffset = this.getTrackOffset(),
                halfViewportWidth = this.viewportWidth / 2,
                slideToOffset = 0;

            $slides.each(function (index, slide) {
                var $slide = $(slide),
                    slideWidth = $slide.width(),
                    leftOffset = $slide.position().left,
                    rightOffset = leftOffset + slideWidth,
                    visualReferencePoint = (isNext ? leftOffset : rightOffset) - trackOffset,
                    slideIsOverHalfWay = visualReferencePoint > halfViewportWidth,
                    slideIsBeforeHalfWay = visualReferencePoint < halfViewportWidth;

                slideToOffset = leftOffset + ((slideWidth - this.viewportWidth) / 2);

                if ((isNext && slideIsOverHalfWay) ||
                 ( ! isNext && slideIsBeforeHalfWay)) {
                    return false;
                }
            }.bind(this));

            return slideToOffset;
        },

        getTrackOffset: function () {
            return Math.abs(this.$track.position().left);
        },

        getViewportWidth: function () {
            return parseFloat(this.$viewport.width());
        },

        getSlidesWidth: function () {
            var width = 0;

            this.$slides.each(function () {
                width += parseFloat($(this).width());
            });

            return width;
        },

        checkSlidesFitInViewport: function () {
            return this.viewportWidth > this.slidesTotalWidth;
        },

        isSingleSlideWiderThanViewport: function () {
            return this.$slides.length <= 1 && this.slidesTotalWidth >= this.viewportWidth;
        },

        isInSingleSlideMode: function () {
            var breakPoint = (this.options.singleSlideBreakPoint instanceof Function)
                            ? this.options.singleSlideBreakPoint(this.$slider)
                            : this.options.singleSlideBreakPoint;

            return this.viewportWidth < breakPoint;
        },

        isAFirstSlide: function () {
            return this.getTrackOffset() - 1 <= this.getSlideOverflow(this.$slides.first());
        },

        isAtLastSlide: function () {
            var trackRemaining = this.slidesTotalWidth - this.getTrackOffset() - 1,
                slideOverflow = this.getSlideOverflow(this.$slides.last());

            return this.viewportWidth > trackRemaining - slideOverflow;
        },

        getSlideOverflow: function ($slide) {
            if ($slide.width() <= this.viewportWidth) {
                return 0;
            }

            return ($slide.width() - this.viewportWidth) / 2;
        },

        runBeforeCallback: function (isNext) {
            var beforeCallback = isNext
                    ? this.options.onBeforeSlideNext
                    : this.options.onBeforeSlidePrev;

            if (beforeCallback instanceof Function) {
                return beforeCallback(this.$slider);
            }

            return true;
        },

        runAfterCallback: function (isNext) {
            var afterCallback = isNext
                    ? this.options.onAfterSlideNext
                    : this.options.onAfterSlidePrev;

            if (afterCallback instanceof Function) {
                afterCallback(this.$slider);
            }
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if ( ! $.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
