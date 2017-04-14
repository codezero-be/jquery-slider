/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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
        slideImageContainer: ".slide-image",
        slideCover: ".slide-cover",
        slideCoverWrapper: ".slide-cover-wrapper",
        slideSpeed: 500,
        enableSwipe: true,

        // Check if we should enable single slide mode..
        // Return true to scroll only one slide or false to slide the default distance.
        // You can also set this to a boolean instead of a function.
        // By default, if any slide is wider than 30% of the viewport, single slide mode is enabled.
        isInSingleSlideMode: function isInSingleSlideMode($slider) {
            var isInSingleSlideMode = false,
                viewportWidth = $slider.find(this.viewport).width();

            $slider.find(this.slide).each(function () {
                isInSingleSlideMode = $(this).width() / viewportWidth > .3;
                return !isInSingleSlideMode;
            });

            return isInSingleSlideMode;
        },

        // Slide distance used if "isInSingleSlideMode" is true.
        // Return any value supported by the jquery.scrollTo plugin:
        // https://github.com/flesler/jquery.scrollTo
        // By default this will slide 70% of the viewport.
        defaultSlideDistance: function defaultSlideDistance($slider, $viewport, $track, isNext) {
            return (isNext ? '+=' : '-=') + $viewport.width() * .7 + 'px';
        },

        // Before callbacks...
        // Return false to cancel slide.
        onBeforeSlideNext: function onBeforeSlideNext($slider) {},
        onBeforeSlidePrev: function onBeforeSlidePrev($slider) {},

        // After callbacks...
        onAfterSlideNext: function onAfterSlideNext($slider) {},
        onAfterSlidePrev: function onAfterSlidePrev($slider) {}
    };

    function Plugin(element, options) {
        // Merge options...
        this.options = $.extend({}, defaults, options);

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
        this.isInSingleSlideMode = false;
        this.noSlideClass = this.options.noSlide.substr(1);
        this.onResize = null;

        // Kickoff...
        this.init();
    }

    Plugin.prototype = {

        init: function init() {
            this.swapSlideCoverImages();
            this.registerEvents();
            this.evaluateSlider();

            // Do a recheck after 1 second
            // in case images load slowly...
            setTimeout(function () {
                this.evaluateSlider();
            }.bind(this), 1000);
        },

        swapSlideCoverImages: function swapSlideCoverImages() {
            this.$slider.find('img' + this.options.slideCover).each(function (index, image) {
                var $image = $(image),
                    $container = $image.closest(this.options.slideImageContainer),
                    imageUrl = $image.prop('src');

                if (imageUrl) {
                    $container.css('backgroundImage', 'url(' + imageUrl + ')').addClass(this.options.slideCoverWrapper.substr(1));
                }
            }.bind(this));
        },

        registerEvents: function registerEvents() {
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
        evaluateSlider: function evaluateSlider() {
            this.updateSliderInfo();
            this.updateSlider();
            this.updateArrows();
        },

        updateSliderInfo: function updateSliderInfo() {
            this.viewportWidth = this.getViewportWidth();
            this.slidesTotalWidth = this.getSlidesWidth();
            this.singleSlideIsWiderThanViewport = this.isSingleSlideWiderThanViewport();
            this.slidesFitInViewport = this.checkSlidesFitInViewport();
            this.isInSingleSlideMode = this.options.isInSingleSlideMode instanceof Function ? this.options.isInSingleSlideMode(this.$slider) : this.options.isInSingleSlideMode;
        },

        updateSlider: function updateSlider() {
            if (this.slidesFitInViewport || this.singleSlideIsWiderThanViewport) {
                this.$slider.addClass(this.noSlideClass);
            } else {
                this.$slider.removeClass(this.noSlideClass);
            }

            if (this.singleSlideIsWiderThanViewport) {
                this.slideTo(this.$slides, true);
            }
        },

        updateArrows: function updateArrows() {
            var atLastSlide = this.options.atLastSlide.substr(1),
                atFirstSlide = this.options.atFirstSlide.substr(1);

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

        slideTo: function slideTo($slides, isNext) {
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

        getSlideToPosition: function getSlideToPosition($slides, isNext) {
            if (!this.isInSingleSlideMode) {
                return this.options.defaultSlideDistance(this.$slider, this.$viewport, this.$track, isNext);
            }

            var trackOffset = this.getTrackOffset(),
                halfViewportWidth = this.viewportWidth / 2,
                slideToOffset = 0,
                isPrev = !isNext;

            $slides.each(function (index, slide) {
                var $slide = $(slide),
                    slideWidth = $slide.width(),
                    leftOffset = $slide.position().left,
                    slideCenterPosition = leftOffset + slideWidth / 2 - trackOffset,
                    slideCenterIsOverHalfWay = slideCenterPosition - 2 > halfViewportWidth,
                    slideCenterIsBeforeHalfWay = slideCenterPosition + 2 < halfViewportWidth;

                slideToOffset = leftOffset + (slideWidth - this.viewportWidth) / 2; //=> Center slide

                if (isNext && slideCenterIsOverHalfWay || isPrev && slideCenterIsBeforeHalfWay) {
                    return false;
                }
            }.bind(this));

            return slideToOffset;
        },

        getTrackOffset: function getTrackOffset() {
            return Math.abs(this.$track.position().left);
        },

        getViewportWidth: function getViewportWidth() {
            return parseFloat(this.$viewport.width());
        },

        getSlidesWidth: function getSlidesWidth() {
            var width = 0;

            this.$slides.each(function () {
                width += parseFloat($(this).width());
            });

            return width;
        },

        checkSlidesFitInViewport: function checkSlidesFitInViewport() {
            return this.viewportWidth > this.slidesTotalWidth;
        },

        isSingleSlideWiderThanViewport: function isSingleSlideWiderThanViewport() {
            return this.$slides.length <= 1 && this.slidesTotalWidth >= this.viewportWidth;
        },

        isAFirstSlide: function isAFirstSlide() {
            return this.getTrackOffset() - 1 <= this.getSlideOverflow(this.$slides.first());
        },

        isAtLastSlide: function isAtLastSlide() {
            var trackRemaining = this.slidesTotalWidth - this.getTrackOffset() - 1,
                slideOverflow = this.getSlideOverflow(this.$slides.last());

            return this.viewportWidth >= trackRemaining - slideOverflow;
        },

        getSlideOverflow: function getSlideOverflow($slide) {
            if ($slide.width() <= this.viewportWidth) {
                return 0;
            }

            return ($slide.width() - this.viewportWidth) / 2;
        },

        runBeforeCallback: function runBeforeCallback(isNext) {
            var beforeCallback = isNext ? this.options.onBeforeSlideNext : this.options.onBeforeSlidePrev;

            if (beforeCallback instanceof Function) {
                return beforeCallback(this.$slider);
            }

            return true;
        },

        runAfterCallback: function runAfterCallback(isNext) {
            var afterCallback = isNext ? this.options.onAfterSlideNext : this.options.onAfterSlidePrev;

            if (afterCallback instanceof Function) {
                afterCallback(this.$slider);
            }
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);
module.exports = __webpack_require__(1);


/***/ })
/******/ ]);