webpackJsonp([1],[
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery, $) {window.$ = __webpack_provided_window_dot_jQuery = __webpack_require__(0);
__webpack_require__(1);
__webpack_require__(5);

$('.slider').slide();
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0), __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 4 */,
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(jQuery) {(function ($, window, document, undefined) {

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
        singleSlideBreakPoint: function singleSlideBreakPoint($slider) {
            return $slider.height() * 4;
        },

        // Slide distance used if the viewport is wider than "singleSlideBreakPoint".
        // Return any value supported by the jquery.scrollTo plegin:
        // https://github.com/flesler/jquery.scrollTo
        defaultSlideDistance: function defaultSlideDistance($slider, $viewport, $track, isNext) {
            return (isNext ? '+=' : '-=') + $viewport.width() * .70 + 'px';
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
        this.noSlideClass = this.options.noSlide.substr(1);
        this.onResize = null;

        // Kickoff...
        this.init();
    }

    Plugin.prototype = {

        init: function init() {
            this.registerEvents();
            this.evaluateSlider();

            // Do a recheck after 1 second
            // in case images load slowly...
            setTimeout(function () {
                this.evaluateSlider();
            }.bind(this), 1000);
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
            if (!this.isInSingleSlideMode()) {
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
                    rightOffset = leftOffset + slideWidth,
                    visualReferencePoint = (isNext ? leftOffset : rightOffset) - trackOffset,
                    slideIsOverHalfWay = visualReferencePoint > halfViewportWidth,
                    slideIsBeforeHalfWay = visualReferencePoint < halfViewportWidth,
                    sliderIsAtStart = trackOffset === 0,
                    sliderIsAtEnd = trackOffset >= this.slidesTotalWidth - this.viewportWidth,
                    slideIsNotFirst = leftOffset > 0,
                    slideIsNotLast = rightOffset < this.slidesTotalWidth;

                slideToOffset = leftOffset + (slideWidth - this.viewportWidth) / 2;

                if (isNext && sliderIsAtStart && slideIsNotFirst || isPrev && sliderIsAtEnd && slideIsNotLast || isNext && slideIsOverHalfWay || isPrev && slideIsBeforeHalfWay) {
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

        isInSingleSlideMode: function isInSingleSlideMode() {
            var breakPoint = this.options.singleSlideBreakPoint instanceof Function ? this.options.singleSlideBreakPoint(this.$slider) : this.options.singleSlideBreakPoint;

            return this.viewportWidth < breakPoint;
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
module.exports = __webpack_require__(3);


/***/ })
],[6]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvanMvYXBwLmpzIiwid2VicGFjazovLy8uL3NyYy9zY3NzL2FwcC5zY3NzIiwid2VicGFjazovLy8uL3NyYy9qcy9zbGlkZXIuanMiXSwibmFtZXMiOlsid2luZG93IiwiJCIsInJlcXVpcmUiLCJzbGlkZSIsImRvY3VtZW50IiwidW5kZWZpbmVkIiwicGx1Z2luTmFtZSIsImRlZmF1bHRzIiwidmlld3BvcnQiLCJ0cmFjayIsInByZXZBcnJvdyIsIm5leHRBcnJvdyIsImF0TGFzdFNsaWRlIiwiYXRGaXJzdFNsaWRlIiwibm9TbGlkZSIsInNsaWRlU3BlZWQiLCJlbmFibGVTd2lwZSIsInNpbmdsZVNsaWRlQnJlYWtQb2ludCIsIiRzbGlkZXIiLCJoZWlnaHQiLCJkZWZhdWx0U2xpZGVEaXN0YW5jZSIsIiR2aWV3cG9ydCIsIiR0cmFjayIsImlzTmV4dCIsIndpZHRoIiwib25CZWZvcmVTbGlkZU5leHQiLCJvbkJlZm9yZVNsaWRlUHJldiIsIm9uQWZ0ZXJTbGlkZU5leHQiLCJvbkFmdGVyU2xpZGVQcmV2IiwiUGx1Z2luIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJleHRlbmQiLCJmaW5kIiwiJHNsaWRlcyIsInZpZXdwb3J0V2lkdGgiLCJzbGlkZXNUb3RhbFdpZHRoIiwic2luZ2xlU2xpZGVJc1dpZGVyVGhhblZpZXdwb3J0Iiwic2xpZGVzRml0SW5WaWV3cG9ydCIsIm5vU2xpZGVDbGFzcyIsInN1YnN0ciIsIm9uUmVzaXplIiwiaW5pdCIsInByb3RvdHlwZSIsInJlZ2lzdGVyRXZlbnRzIiwiZXZhbHVhdGVTbGlkZXIiLCJzZXRUaW1lb3V0IiwiYmluZCIsIm9uIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic2xpZGVUbyIsImdldCIsInJldmVyc2UiLCJjbGVhclRpbWVvdXQiLCJ1cGRhdGVTbGlkZXJJbmZvIiwidXBkYXRlU2xpZGVyIiwidXBkYXRlQXJyb3dzIiwiZ2V0Vmlld3BvcnRXaWR0aCIsImdldFNsaWRlc1dpZHRoIiwiaXNTaW5nbGVTbGlkZVdpZGVyVGhhblZpZXdwb3J0IiwiY2hlY2tTbGlkZXNGaXRJblZpZXdwb3J0IiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImlzQXRMYXN0U2xpZGUiLCJpc0FGaXJzdFNsaWRlIiwicnVuQmVmb3JlQ2FsbGJhY2siLCJzY3JvbGxUbyIsImdldFNsaWRlVG9Qb3NpdGlvbiIsIm9uQWZ0ZXIiLCJydW5BZnRlckNhbGxiYWNrIiwiaXNJblNpbmdsZVNsaWRlTW9kZSIsInRyYWNrT2Zmc2V0IiwiZ2V0VHJhY2tPZmZzZXQiLCJoYWxmVmlld3BvcnRXaWR0aCIsInNsaWRlVG9PZmZzZXQiLCJpc1ByZXYiLCJlYWNoIiwiaW5kZXgiLCIkc2xpZGUiLCJzbGlkZVdpZHRoIiwibGVmdE9mZnNldCIsInBvc2l0aW9uIiwibGVmdCIsInJpZ2h0T2Zmc2V0IiwidmlzdWFsUmVmZXJlbmNlUG9pbnQiLCJzbGlkZUlzT3ZlckhhbGZXYXkiLCJzbGlkZUlzQmVmb3JlSGFsZldheSIsInNsaWRlcklzQXRTdGFydCIsInNsaWRlcklzQXRFbmQiLCJzbGlkZUlzTm90Rmlyc3QiLCJzbGlkZUlzTm90TGFzdCIsIk1hdGgiLCJhYnMiLCJwYXJzZUZsb2F0IiwibGVuZ3RoIiwiYnJlYWtQb2ludCIsIkZ1bmN0aW9uIiwiZ2V0U2xpZGVPdmVyZmxvdyIsImZpcnN0IiwidHJhY2tSZW1haW5pbmciLCJzbGlkZU92ZXJmbG93IiwibGFzdCIsImJlZm9yZUNhbGxiYWNrIiwiYWZ0ZXJDYWxsYmFjayIsImZuIiwiZGF0YSIsImpRdWVyeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0VBQUFBLE9BQU9DLENBQVAsR0FBVyx1Q0FBZ0IsbUJBQUFDLENBQVEsQ0FBUixDQUEzQjtBQUNBLG1CQUFBQSxDQUFRLENBQVI7QUFDQSxtQkFBQUEsQ0FBUSxDQUFSOztBQUVBRCxFQUFFLFNBQUYsRUFBYUUsS0FBYixHOzs7Ozs7O0FDSkEseUM7Ozs7Ozs7QUNBQSwrQ0FBQyxVQUFVRixDQUFWLEVBQWFELE1BQWIs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Q0osU0FMTSxDQUFQO0FBTUgsS0FQRDtBQVNILENBL1JELEVBK1JHNEUsTUEvUkgsRUErUlczRyxNQS9SWCxFQStSbUJJLFFBL1JuQixFIiwiZmlsZSI6InB1YmxpYy9qcy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuJCA9IHdpbmRvdy5qUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcbnJlcXVpcmUoJ2Jlbm1ham9yLWpxdWVyeS10b3VjaC1ldmVudHMnKTtcbnJlcXVpcmUoJy4vc2xpZGVyJyk7XG5cbiQoJy5zbGlkZXInKS5zbGlkZSgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2pzL2FwcC5qcyIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvc2Nzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIoZnVuY3Rpb24gKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gICAgdmFyIHBsdWdpbk5hbWUgPSBcInNsaWRlXCIsXG4gICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgLy8gR2VuZXJhbCBzZXR0aW5ncy4uLlxuICAgICAgICAgICAgdmlld3BvcnQ6IFwiLnNsaWRlci12aWV3cG9ydFwiLFxuICAgICAgICAgICAgdHJhY2s6IFwiLnNsaWRlci10cmFja1wiLFxuICAgICAgICAgICAgc2xpZGU6IFwiLnNsaWRlXCIsXG4gICAgICAgICAgICBwcmV2QXJyb3c6IFwiLnNsaWRlci1wcmV2XCIsXG4gICAgICAgICAgICBuZXh0QXJyb3c6IFwiLnNsaWRlci1uZXh0XCIsXG4gICAgICAgICAgICBhdExhc3RTbGlkZTogXCIuc2xpZGVyLWVuZFwiLFxuICAgICAgICAgICAgYXRGaXJzdFNsaWRlOiBcIi5zbGlkZXItc3RhcnRcIixcbiAgICAgICAgICAgIG5vU2xpZGU6IFwiLm5vLXNsaWRlXCIsXG4gICAgICAgICAgICBzbGlkZVNwZWVkOiA1MDAsXG4gICAgICAgICAgICBlbmFibGVTd2lwZTogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gVGhlIGJyZWFrcG9pbnQgY2FuIGJlIGFuIGludGVnZXIgb3JcbiAgICAgICAgICAgIC8vIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGludGVnZXIuXG4gICAgICAgICAgICBzaW5nbGVTbGlkZUJyZWFrUG9pbnQ6IGZ1bmN0aW9uICgkc2xpZGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzbGlkZXIuaGVpZ2h0KCkgKiA0O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gU2xpZGUgZGlzdGFuY2UgdXNlZCBpZiB0aGUgdmlld3BvcnQgaXMgd2lkZXIgdGhhbiBcInNpbmdsZVNsaWRlQnJlYWtQb2ludFwiLlxuICAgICAgICAgICAgLy8gUmV0dXJuIGFueSB2YWx1ZSBzdXBwb3J0ZWQgYnkgdGhlIGpxdWVyeS5zY3JvbGxUbyBwbGVnaW46XG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmxlc2xlci9qcXVlcnkuc2Nyb2xsVG9cbiAgICAgICAgICAgIGRlZmF1bHRTbGlkZURpc3RhbmNlOiBmdW5jdGlvbiAoJHNsaWRlciwgJHZpZXdwb3J0LCAkdHJhY2ssIGlzTmV4dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaXNOZXh0ID8gJys9JyA6ICctPScpICsgKCR2aWV3cG9ydC53aWR0aCgpICogLjcwKSArICdweCc7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBCZWZvcmUgY2FsbGJhY2tzLi4uXG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsc2UgdG8gY2FuY2VsIHNsaWRlLlxuICAgICAgICAgICAgb25CZWZvcmVTbGlkZU5leHQ6IGZ1bmN0aW9uICgkc2xpZGVyKSB7IH0sXG4gICAgICAgICAgICBvbkJlZm9yZVNsaWRlUHJldjogZnVuY3Rpb24gKCRzbGlkZXIpIHsgfSxcblxuICAgICAgICAgICAgLy8gQWZ0ZXIgY2FsbGJhY2tzLi4uXG4gICAgICAgICAgICBvbkFmdGVyU2xpZGVOZXh0OiBmdW5jdGlvbiAoJHNsaWRlcikgeyB9LFxuICAgICAgICAgICAgb25BZnRlclNsaWRlUHJldjogZnVuY3Rpb24gKCRzbGlkZXIpIHsgfVxuICAgICAgICB9O1xuXG4gICAgZnVuY3Rpb24gUGx1Z2luKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gTWVyZ2Ugb3B0aW9ucy4uLlxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgICAgICAvLyBDYWNoZSBlbGVtZW50cy4uLlxuICAgICAgICB0aGlzLiRzbGlkZXIgPSAkKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLiR2aWV3cG9ydCA9IHRoaXMuJHNsaWRlci5maW5kKHRoaXMub3B0aW9ucy52aWV3cG9ydCk7XG4gICAgICAgIHRoaXMuJHRyYWNrID0gdGhpcy4kc2xpZGVyLmZpbmQodGhpcy5vcHRpb25zLnRyYWNrKTtcbiAgICAgICAgdGhpcy4kc2xpZGVzID0gdGhpcy4kc2xpZGVyLmZpbmQodGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICAvLyBDYWxjdWxhdGVkIHZhbHVlcy4uLlxuICAgICAgICB0aGlzLnZpZXdwb3J0V2lkdGggPSAwO1xuICAgICAgICB0aGlzLnNsaWRlc1RvdGFsV2lkdGggPSAwO1xuICAgICAgICB0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNsaWRlc0ZpdEluVmlld3BvcnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ub1NsaWRlQ2xhc3MgPSAodGhpcy5vcHRpb25zLm5vU2xpZGUpLnN1YnN0cigxKTtcbiAgICAgICAgdGhpcy5vblJlc2l6ZSA9IG51bGw7XG5cbiAgICAgICAgLy8gS2lja29mZi4uLlxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpICB7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnRzKCk7XG4gICAgICAgICAgICB0aGlzLmV2YWx1YXRlU2xpZGVyKCk7XG5cbiAgICAgICAgICAgIC8vIERvIGEgcmVjaGVjayBhZnRlciAxIHNlY29uZFxuICAgICAgICAgICAgLy8gaW4gY2FzZSBpbWFnZXMgbG9hZCBzbG93bHkuLi5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXZhbHVhdGVTbGlkZXIoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVnaXN0ZXJFdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIE5leHQgYXJyb3cgY2xpY2suLi5cbiAgICAgICAgICAgIHRoaXMuJHNsaWRlci5vbignY2xpY2snLCB0aGlzLm9wdGlvbnMubmV4dEFycm93LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlVG8odGhpcy4kc2xpZGVzLCB0cnVlKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIC8vIFByZXYgYXJyb3cgY2xpY2suLi5cbiAgICAgICAgICAgIHRoaXMuJHNsaWRlci5vbignY2xpY2snLCB0aGlzLm9wdGlvbnMucHJldkFycm93LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlVG8oJCh0aGlzLiRzbGlkZXMuZ2V0KCkucmV2ZXJzZSgpKSwgZmFsc2UpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lbmFibGVTd2lwZSkge1xuICAgICAgICAgICAgICAgIC8vIFN3aXBlIGxlZnQuLi5cbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIub24oJ3N3aXBlcmlnaHQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVUbygkKHRoaXMuJHNsaWRlcy5nZXQoKS5yZXZlcnNlKCkpLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgICAgIC8vIFN3aXBlIHJpZ2h0Li4uXG4gICAgICAgICAgICAgICAgdGhpcy4kc2xpZGVyLm9uKCdzd2lwZWxlZnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVUbyh0aGlzLiRzbGlkZXMsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdpbmRvdyByZXNpemUgZXZlbnQuLi5cbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUmVzaXplID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZhbHVhdGVTbGlkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA5MDApO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUcmlnZ2VyZWQgb24gaW5pdFxuICAgICAgICAvLyBhbmQgb24gd2luZG93IHJlc2l6ZS5cbiAgICAgICAgZXZhbHVhdGVTbGlkZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2xpZGVySW5mbygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTbGlkZXIoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQXJyb3dzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlU2xpZGVySW5mbzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy52aWV3cG9ydFdpZHRoID0gdGhpcy5nZXRWaWV3cG9ydFdpZHRoKCk7XG4gICAgICAgICAgICB0aGlzLnNsaWRlc1RvdGFsV2lkdGggPSB0aGlzLmdldFNsaWRlc1dpZHRoKCk7XG4gICAgICAgICAgICB0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCA9IHRoaXMuaXNTaW5nbGVTbGlkZVdpZGVyVGhhblZpZXdwb3J0KCk7XG4gICAgICAgICAgICB0aGlzLnNsaWRlc0ZpdEluVmlld3BvcnQgPSB0aGlzLmNoZWNrU2xpZGVzRml0SW5WaWV3cG9ydCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVNsaWRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2xpZGVzRml0SW5WaWV3cG9ydCB8fCB0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5hZGRDbGFzcyh0aGlzLm5vU2xpZGVDbGFzcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5yZW1vdmVDbGFzcyh0aGlzLm5vU2xpZGVDbGFzcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVUbyh0aGlzLiRzbGlkZXMsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZUFycm93czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGF0TGFzdFNsaWRlID0gKHRoaXMub3B0aW9ucy5hdExhc3RTbGlkZSkuc3Vic3RyKDEpLFxuICAgICAgICAgICAgICAgIGF0Rmlyc3RTbGlkZSA9ICh0aGlzLm9wdGlvbnMuYXRGaXJzdFNsaWRlKS5zdWJzdHIoMSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXRMYXN0U2xpZGUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5hZGRDbGFzcyhhdExhc3RTbGlkZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5yZW1vdmVDbGFzcyhhdExhc3RTbGlkZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQUZpcnN0U2xpZGUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5hZGRDbGFzcyhhdEZpcnN0U2xpZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIucmVtb3ZlQ2xhc3MoYXRGaXJzdFNsaWRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzbGlkZVRvOiBmdW5jdGlvbiAoJHNsaWRlcywgaXNOZXh0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ydW5CZWZvcmVDYWxsYmFjayhpc05leHQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kdmlld3BvcnQuc2Nyb2xsVG8odGhpcy5nZXRTbGlkZVRvUG9zaXRpb24oJHNsaWRlcywgaXNOZXh0KSwgdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIHtcbiAgICAgICAgICAgICAgICBvbkFmdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQXJyb3dzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuQWZ0ZXJDYWxsYmFjayhpc05leHQpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2xpZGVUb1Bvc2l0aW9uOiBmdW5jdGlvbiAoJHNsaWRlcywgaXNOZXh0KSB7XG4gICAgICAgICAgICBpZiAoICEgdGhpcy5pc0luU2luZ2xlU2xpZGVNb2RlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmRlZmF1bHRTbGlkZURpc3RhbmNlKHRoaXMuJHNsaWRlciwgdGhpcy4kdmlld3BvcnQsIHRoaXMuJHRyYWNrLCBpc05leHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdHJhY2tPZmZzZXQgPSB0aGlzLmdldFRyYWNrT2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgaGFsZlZpZXdwb3J0V2lkdGggPSB0aGlzLnZpZXdwb3J0V2lkdGggLyAyLFxuICAgICAgICAgICAgICAgIHNsaWRlVG9PZmZzZXQgPSAwLFxuICAgICAgICAgICAgICAgIGlzUHJldiA9ICEgaXNOZXh0O1xuXG4gICAgICAgICAgICAkc2xpZGVzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBzbGlkZSkge1xuICAgICAgICAgICAgICAgIHZhciAkc2xpZGUgPSAkKHNsaWRlKSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVXaWR0aCA9ICRzbGlkZS53aWR0aCgpLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0T2Zmc2V0ID0gJHNsaWRlLnBvc2l0aW9uKCkubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRPZmZzZXQgPSBsZWZ0T2Zmc2V0ICsgc2xpZGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgdmlzdWFsUmVmZXJlbmNlUG9pbnQgPSAoaXNOZXh0ID8gbGVmdE9mZnNldCA6IHJpZ2h0T2Zmc2V0KSAtIHRyYWNrT2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBzbGlkZUlzT3ZlckhhbGZXYXkgPSB2aXN1YWxSZWZlcmVuY2VQb2ludCA+IGhhbGZWaWV3cG9ydFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZUlzQmVmb3JlSGFsZldheSA9IHZpc3VhbFJlZmVyZW5jZVBvaW50IDwgaGFsZlZpZXdwb3J0V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlcklzQXRTdGFydCA9IHRyYWNrT2Zmc2V0ID09PSAwLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXJJc0F0RW5kID0gdHJhY2tPZmZzZXQgPj0gdGhpcy5zbGlkZXNUb3RhbFdpZHRoIC0gdGhpcy52aWV3cG9ydFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZUlzTm90Rmlyc3QgPSBsZWZ0T2Zmc2V0ID4gMCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVJc05vdExhc3QgPSByaWdodE9mZnNldCA8IHRoaXMuc2xpZGVzVG90YWxXaWR0aDtcblxuICAgICAgICAgICAgICAgIHNsaWRlVG9PZmZzZXQgPSBsZWZ0T2Zmc2V0ICsgKChzbGlkZVdpZHRoIC0gdGhpcy52aWV3cG9ydFdpZHRoKSAvIDIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCAoaXNOZXh0ICYmIHNsaWRlcklzQXRTdGFydCAmJiBzbGlkZUlzTm90Rmlyc3QpXG4gICAgICAgICAgICAgICAgICAgIHx8IChpc1ByZXYgJiYgc2xpZGVySXNBdEVuZCAmJiBzbGlkZUlzTm90TGFzdClcbiAgICAgICAgICAgICAgICAgICAgfHwgKGlzTmV4dCAmJiBzbGlkZUlzT3ZlckhhbGZXYXkpXG4gICAgICAgICAgICAgICAgICAgIHx8IChpc1ByZXYgJiYgc2xpZGVJc0JlZm9yZUhhbGZXYXkpICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNsaWRlVG9PZmZzZXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VHJhY2tPZmZzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLiR0cmFjay5wb3NpdGlvbigpLmxlZnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZpZXdwb3J0V2lkdGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuJHZpZXdwb3J0LndpZHRoKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNsaWRlc1dpZHRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSAwO1xuXG4gICAgICAgICAgICB0aGlzLiRzbGlkZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggKz0gcGFyc2VGbG9hdCgkKHRoaXMpLndpZHRoKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB3aWR0aDtcbiAgICAgICAgfSxcblxuICAgICAgICBjaGVja1NsaWRlc0ZpdEluVmlld3BvcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXdwb3J0V2lkdGggPiB0aGlzLnNsaWRlc1RvdGFsV2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNTaW5nbGVTbGlkZVdpZGVyVGhhblZpZXdwb3J0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kc2xpZGVzLmxlbmd0aCA8PSAxICYmIHRoaXMuc2xpZGVzVG90YWxXaWR0aCA+PSB0aGlzLnZpZXdwb3J0V2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNJblNpbmdsZVNsaWRlTW9kZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJyZWFrUG9pbnQgPSAodGhpcy5vcHRpb25zLnNpbmdsZVNsaWRlQnJlYWtQb2ludCBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNpbmdsZVNsaWRlQnJlYWtQb2ludCh0aGlzLiRzbGlkZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLm9wdGlvbnMuc2luZ2xlU2xpZGVCcmVha1BvaW50O1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3cG9ydFdpZHRoIDwgYnJlYWtQb2ludDtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0FGaXJzdFNsaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRUcmFja09mZnNldCgpIC0gMSA8PSB0aGlzLmdldFNsaWRlT3ZlcmZsb3codGhpcy4kc2xpZGVzLmZpcnN0KCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQXRMYXN0U2xpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0cmFja1JlbWFpbmluZyA9IHRoaXMuc2xpZGVzVG90YWxXaWR0aCAtIHRoaXMuZ2V0VHJhY2tPZmZzZXQoKSAtIDEsXG4gICAgICAgICAgICAgICAgc2xpZGVPdmVyZmxvdyA9IHRoaXMuZ2V0U2xpZGVPdmVyZmxvdyh0aGlzLiRzbGlkZXMubGFzdCgpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmlld3BvcnRXaWR0aCA+PSB0cmFja1JlbWFpbmluZyAtIHNsaWRlT3ZlcmZsb3c7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2xpZGVPdmVyZmxvdzogZnVuY3Rpb24gKCRzbGlkZSkge1xuICAgICAgICAgICAgaWYgKCRzbGlkZS53aWR0aCgpIDw9IHRoaXMudmlld3BvcnRXaWR0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKCRzbGlkZS53aWR0aCgpIC0gdGhpcy52aWV3cG9ydFdpZHRoKSAvIDI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcnVuQmVmb3JlQ2FsbGJhY2s6IGZ1bmN0aW9uIChpc05leHQpIHtcbiAgICAgICAgICAgIHZhciBiZWZvcmVDYWxsYmFjayA9IGlzTmV4dFxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMub3B0aW9ucy5vbkJlZm9yZVNsaWRlTmV4dFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMub3B0aW9ucy5vbkJlZm9yZVNsaWRlUHJldjtcblxuICAgICAgICAgICAgaWYgKGJlZm9yZUNhbGxiYWNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmVmb3JlQ2FsbGJhY2sodGhpcy4kc2xpZGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcnVuQWZ0ZXJDYWxsYmFjazogZnVuY3Rpb24gKGlzTmV4dCkge1xuICAgICAgICAgICAgdmFyIGFmdGVyQ2FsbGJhY2sgPSBpc05leHRcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm9wdGlvbnMub25BZnRlclNsaWRlTmV4dFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMub3B0aW9ucy5vbkFmdGVyU2xpZGVQcmV2O1xuXG4gICAgICAgICAgICBpZiAoYWZ0ZXJDYWxsYmFjayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgYWZ0ZXJDYWxsYmFjayh0aGlzLiRzbGlkZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICggISAkLmRhdGEodGhpcywgXCJwbHVnaW5fXCIgKyBwbHVnaW5OYW1lKSkge1xuICAgICAgICAgICAgICAgICQuZGF0YSh0aGlzLCBcInBsdWdpbl9cIiArIHBsdWdpbk5hbWUsXG4gICAgICAgICAgICAgICAgbmV3IFBsdWdpbih0aGlzLCBvcHRpb25zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvanMvc2xpZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==