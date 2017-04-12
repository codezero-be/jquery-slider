webpackJsonp([0],[
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

window.$ = window.jQuery = __webpack_require__(0);
__webpack_require__(4);

$('.slider').slide();

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 3 */,
/* 4 */
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
        slideSpeed: 500,

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
                slideToOffset = 0;

            $slides.each(function (index, slide) {
                var $slide = $(slide),
                    slideWidth = $slide.width(),
                    leftOffset = $slide.position().left,
                    rightOffset = leftOffset + slideWidth,
                    visualReferencePoint = (isNext ? leftOffset : rightOffset) - trackOffset,
                    slideIsOverHalfWay = visualReferencePoint > halfViewportWidth,
                    slideIsBeforeHalfWay = visualReferencePoint < halfViewportWidth;

                slideToOffset = leftOffset + (slideWidth - this.viewportWidth) / 2;

                if (isNext && slideIsOverHalfWay || !isNext && slideIsBeforeHalfWay) {
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

            return this.viewportWidth > trackRemaining - slideOverflow;
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
module.exports = __webpack_require__(2);


/***/ })
],[5]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvanMvYXBwLmpzIiwid2VicGFjazovLy8uL3NyYy9zY3NzL2FwcC5zY3NzIiwid2VicGFjazovLy8uL3NyYy9qcy9zbGlkZXIuanMiXSwibmFtZXMiOlsid2luZG93IiwiJCIsImpRdWVyeSIsInJlcXVpcmUiLCJzbGlkZSIsImRvY3VtZW50IiwidW5kZWZpbmVkIiwicGx1Z2luTmFtZSIsImRlZmF1bHRzIiwidmlld3BvcnQiLCJ0cmFjayIsInByZXZBcnJvdyIsIm5leHRBcnJvdyIsImF0TGFzdFNsaWRlIiwiYXRGaXJzdFNsaWRlIiwibm9TbGlkZSIsInNsaWRlU3BlZWQiLCJzaW5nbGVTbGlkZUJyZWFrUG9pbnQiLCIkc2xpZGVyIiwiaGVpZ2h0IiwiZGVmYXVsdFNsaWRlRGlzdGFuY2UiLCIkdmlld3BvcnQiLCIkdHJhY2siLCJpc05leHQiLCJ3aWR0aCIsIm9uQmVmb3JlU2xpZGVOZXh0Iiwib25CZWZvcmVTbGlkZVByZXYiLCJvbkFmdGVyU2xpZGVOZXh0Iiwib25BZnRlclNsaWRlUHJldiIsIlBsdWdpbiIsImVsZW1lbnQiLCJvcHRpb25zIiwiZXh0ZW5kIiwiZmluZCIsIiRzbGlkZXMiLCJ2aWV3cG9ydFdpZHRoIiwic2xpZGVzVG90YWxXaWR0aCIsInNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCIsInNsaWRlc0ZpdEluVmlld3BvcnQiLCJub1NsaWRlQ2xhc3MiLCJzdWJzdHIiLCJvblJlc2l6ZSIsImluaXQiLCJwcm90b3R5cGUiLCJyZWdpc3RlckV2ZW50cyIsImV2YWx1YXRlU2xpZGVyIiwic2V0VGltZW91dCIsImJpbmQiLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInNsaWRlVG8iLCJnZXQiLCJyZXZlcnNlIiwiY2xlYXJUaW1lb3V0IiwidXBkYXRlU2xpZGVySW5mbyIsInVwZGF0ZVNsaWRlciIsInVwZGF0ZUFycm93cyIsImdldFZpZXdwb3J0V2lkdGgiLCJnZXRTbGlkZXNXaWR0aCIsImlzU2luZ2xlU2xpZGVXaWRlclRoYW5WaWV3cG9ydCIsImNoZWNrU2xpZGVzRml0SW5WaWV3cG9ydCIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJpc0F0TGFzdFNsaWRlIiwiaXNBRmlyc3RTbGlkZSIsInJ1bkJlZm9yZUNhbGxiYWNrIiwic2Nyb2xsVG8iLCJnZXRTbGlkZVRvUG9zaXRpb24iLCJvbkFmdGVyIiwicnVuQWZ0ZXJDYWxsYmFjayIsImlzSW5TaW5nbGVTbGlkZU1vZGUiLCJ0cmFja09mZnNldCIsImdldFRyYWNrT2Zmc2V0IiwiaGFsZlZpZXdwb3J0V2lkdGgiLCJzbGlkZVRvT2Zmc2V0IiwiZWFjaCIsImluZGV4IiwiJHNsaWRlIiwic2xpZGVXaWR0aCIsImxlZnRPZmZzZXQiLCJwb3NpdGlvbiIsImxlZnQiLCJyaWdodE9mZnNldCIsInZpc3VhbFJlZmVyZW5jZVBvaW50Iiwic2xpZGVJc092ZXJIYWxmV2F5Iiwic2xpZGVJc0JlZm9yZUhhbGZXYXkiLCJNYXRoIiwiYWJzIiwicGFyc2VGbG9hdCIsImxlbmd0aCIsImJyZWFrUG9pbnQiLCJGdW5jdGlvbiIsImdldFNsaWRlT3ZlcmZsb3ciLCJmaXJzdCIsInRyYWNrUmVtYWluaW5nIiwic2xpZGVPdmVyZmxvdyIsImxhc3QiLCJiZWZvcmVDYWxsYmFjayIsImFmdGVyQ2FsbGJhY2siLCJmbiIsImRhdGEiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUFBLE9BQU9DLENBQVAsR0FBV0QsT0FBT0UsTUFBUCxHQUFnQixtQkFBQUMsQ0FBUSxDQUFSLENBQTNCO0FBQ0EsbUJBQUFBLENBQVEsQ0FBUjs7QUFFQUYsRUFBRSxTQUFGLEVBQWFHLEtBQWIsRzs7Ozs7O0FDSEEseUM7Ozs7Ozs7QUNBQSxDQUFDLFVBQVVILENBQVYsRUFBYUQsTUFBYixFQUFxQkssUUFBckIsRUFBK0JDLFNBQS9CLEVBQTBDOztBQUV2QyxRQUFJQyxhQUFhLE9BQWpCO0FBQUEsUUFDSUMsV0FBVztBQUNQO0FBQ0FDLGtCQUFVLGtCQUZIO0FBR1BDLGVBQU8sZUFIQTtB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QUFQLEVBQWEsWUFBWTlGLFVBQXpCLENBQVAsRUFBNkM7QUFDekNOLGtCQUFFb0csSUFBRixDQUFPLElBQVAsRUFBYSxZQUFZOUYsVUFBekIsRUFDQSxJQUFJc0IsTUFBSixDQUFXLElBQVgsRUFBaUJFLE9BQWpCLENBREE7QUFFSDtBQUNKLFNBTE0sQ0FBUDtBQU1ILEtBUEQ7QUFTSCxDQTNRRCxFQTJRRzdCLE1BM1FILEVBMlFXRixNQTNRWCxFQTJRbUJLLFFBM1FuQixFIiwiZmlsZSI6InB1YmxpYy9qcy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuJCA9IHdpbmRvdy5qUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcbnJlcXVpcmUoJy4vc2xpZGVyJyk7XG5cbiQoJy5zbGlkZXInKS5zbGlkZSgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2pzL2FwcC5qcyIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvc2Nzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gICAgdmFyIHBsdWdpbk5hbWUgPSBcInNsaWRlXCIsXG4gICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgLy8gR2VuZXJhbCBzZXR0aW5ncy4uLlxuICAgICAgICAgICAgdmlld3BvcnQ6IFwiLnNsaWRlci12aWV3cG9ydFwiLFxuICAgICAgICAgICAgdHJhY2s6IFwiLnNsaWRlci10cmFja1wiLFxuICAgICAgICAgICAgc2xpZGU6IFwiLnNsaWRlXCIsXG4gICAgICAgICAgICBwcmV2QXJyb3c6IFwiLnNsaWRlci1wcmV2XCIsXG4gICAgICAgICAgICBuZXh0QXJyb3c6IFwiLnNsaWRlci1uZXh0XCIsXG4gICAgICAgICAgICBhdExhc3RTbGlkZTogXCIuc2xpZGVyLWVuZFwiLFxuICAgICAgICAgICAgYXRGaXJzdFNsaWRlOiBcIi5zbGlkZXItc3RhcnRcIixcbiAgICAgICAgICAgIG5vU2xpZGU6IFwiLm5vLXNsaWRlXCIsXG4gICAgICAgICAgICBzbGlkZVNwZWVkOiA1MDAsXG5cbiAgICAgICAgICAgIC8vIFRoZSBicmVha3BvaW50IGNhbiBiZSBhbiBpbnRlZ2VyIG9yXG4gICAgICAgICAgICAvLyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBpbnRlZ2VyLlxuICAgICAgICAgICAgc2luZ2xlU2xpZGVCcmVha1BvaW50OiBmdW5jdGlvbiAoJHNsaWRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2xpZGVyLmhlaWdodCgpICogNDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIFNsaWRlIGRpc3RhbmNlIHVzZWQgaWYgdGhlIHZpZXdwb3J0IGlzIHdpZGVyIHRoYW4gXCJzaW5nbGVTbGlkZUJyZWFrUG9pbnRcIi5cbiAgICAgICAgICAgIC8vIFJldHVybiBhbnkgdmFsdWUgc3VwcG9ydGVkIGJ5IHRoZSBqcXVlcnkuc2Nyb2xsVG8gcGxlZ2luOlxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZsZXNsZXIvanF1ZXJ5LnNjcm9sbFRvXG4gICAgICAgICAgICBkZWZhdWx0U2xpZGVEaXN0YW5jZTogZnVuY3Rpb24gKCRzbGlkZXIsICR2aWV3cG9ydCwgJHRyYWNrLCBpc05leHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGlzTmV4dCA/ICcrPScgOiAnLT0nKSArICgkdmlld3BvcnQud2lkdGgoKSAqIC43MCkgKyAncHgnO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gQmVmb3JlIGNhbGxiYWNrcy4uLlxuICAgICAgICAgICAgLy8gUmV0dXJuIGZhbHNlIHRvIGNhbmNlbCBzbGlkZS5cbiAgICAgICAgICAgIG9uQmVmb3JlU2xpZGVOZXh0OiBmdW5jdGlvbiAoJHNsaWRlcikgeyB9LFxuICAgICAgICAgICAgb25CZWZvcmVTbGlkZVByZXY6IGZ1bmN0aW9uICgkc2xpZGVyKSB7IH0sXG5cbiAgICAgICAgICAgIC8vIEFmdGVyIGNhbGxiYWNrcy4uLlxuICAgICAgICAgICAgb25BZnRlclNsaWRlTmV4dDogZnVuY3Rpb24gKCRzbGlkZXIpIHsgfSxcbiAgICAgICAgICAgIG9uQWZ0ZXJTbGlkZVByZXY6IGZ1bmN0aW9uICgkc2xpZGVyKSB7IH1cbiAgICAgICAgfTtcblxuICAgIGZ1bmN0aW9uIFBsdWdpbihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICAgIC8vIE1lcmdlIG9wdGlvbnMuLi5cbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gQ2FjaGUgZWxlbWVudHMuLi5cbiAgICAgICAgdGhpcy4kc2xpZGVyID0gJChlbGVtZW50KTtcbiAgICAgICAgdGhpcy4kdmlld3BvcnQgPSB0aGlzLiRzbGlkZXIuZmluZCh0aGlzLm9wdGlvbnMudmlld3BvcnQpO1xuICAgICAgICB0aGlzLiR0cmFjayA9IHRoaXMuJHNsaWRlci5maW5kKHRoaXMub3B0aW9ucy50cmFjayk7XG4gICAgICAgIHRoaXMuJHNsaWRlcyA9IHRoaXMuJHNsaWRlci5maW5kKHRoaXMub3B0aW9ucy5zbGlkZSk7XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlZCB2YWx1ZXMuLi5cbiAgICAgICAgdGhpcy52aWV3cG9ydFdpZHRoID0gMDtcbiAgICAgICAgdGhpcy5zbGlkZXNUb3RhbFdpZHRoID0gMDtcbiAgICAgICAgdGhpcy5zaW5nbGVTbGlkZUlzV2lkZXJUaGFuVmlld3BvcnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zbGlkZXNGaXRJblZpZXdwb3J0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMubm9TbGlkZUNsYXNzID0gKHRoaXMub3B0aW9ucy5ub1NsaWRlKS5zdWJzdHIoMSk7XG4gICAgICAgIHRoaXMub25SZXNpemUgPSBudWxsO1xuXG4gICAgICAgIC8vIEtpY2tvZmYuLi5cbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgUGx1Z2luLnByb3RvdHlwZSA9IHtcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSAge1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckV2ZW50cygpO1xuICAgICAgICAgICAgdGhpcy5ldmFsdWF0ZVNsaWRlcigpO1xuXG4gICAgICAgICAgICAvLyBEbyBhIHJlY2hlY2sgYWZ0ZXIgMSBzZWNvbmRcbiAgICAgICAgICAgIC8vIGluIGNhc2UgaW1hZ2VzIGxvYWQgc2xvd2x5Li4uXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV2YWx1YXRlU2xpZGVyKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwMDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlZ2lzdGVyRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBOZXh0IGFycm93IGNsaWNrLi4uXG4gICAgICAgICAgICB0aGlzLiRzbGlkZXIub24oJ2NsaWNrJywgdGhpcy5vcHRpb25zLm5leHRBcnJvdywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZVRvKHRoaXMuJHNsaWRlcywgdHJ1ZSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAvLyBQcmV2IGFycm93IGNsaWNrLi4uXG4gICAgICAgICAgICB0aGlzLiRzbGlkZXIub24oJ2NsaWNrJywgdGhpcy5vcHRpb25zLnByZXZBcnJvdywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZVRvKCQodGhpcy4kc2xpZGVzLmdldCgpLnJldmVyc2UoKSksIGZhbHNlKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIC8vIFdpbmRvdyByZXNpemUgZXZlbnQuLi5cbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUmVzaXplID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZhbHVhdGVTbGlkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA5MDApO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUcmlnZ2VyZWQgb24gaW5pdFxuICAgICAgICAvLyBhbmQgb24gd2luZG93IHJlc2l6ZS5cbiAgICAgICAgZXZhbHVhdGVTbGlkZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2xpZGVySW5mbygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTbGlkZXIoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQXJyb3dzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlU2xpZGVySW5mbzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy52aWV3cG9ydFdpZHRoID0gdGhpcy5nZXRWaWV3cG9ydFdpZHRoKCk7XG4gICAgICAgICAgICB0aGlzLnNsaWRlc1RvdGFsV2lkdGggPSB0aGlzLmdldFNsaWRlc1dpZHRoKCk7XG4gICAgICAgICAgICB0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCA9IHRoaXMuaXNTaW5nbGVTbGlkZVdpZGVyVGhhblZpZXdwb3J0KCk7XG4gICAgICAgICAgICB0aGlzLnNsaWRlc0ZpdEluVmlld3BvcnQgPSB0aGlzLmNoZWNrU2xpZGVzRml0SW5WaWV3cG9ydCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVNsaWRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2xpZGVzRml0SW5WaWV3cG9ydCB8fCB0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5hZGRDbGFzcyh0aGlzLm5vU2xpZGVDbGFzcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5yZW1vdmVDbGFzcyh0aGlzLm5vU2xpZGVDbGFzcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVUbyh0aGlzLiRzbGlkZXMsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZUFycm93czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGF0TGFzdFNsaWRlID0gKHRoaXMub3B0aW9ucy5hdExhc3RTbGlkZSkuc3Vic3RyKDEpLFxuICAgICAgICAgICAgICAgIGF0Rmlyc3RTbGlkZSA9ICh0aGlzLm9wdGlvbnMuYXRGaXJzdFNsaWRlKS5zdWJzdHIoMSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXRMYXN0U2xpZGUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5hZGRDbGFzcyhhdExhc3RTbGlkZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5yZW1vdmVDbGFzcyhhdExhc3RTbGlkZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQUZpcnN0U2xpZGUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5hZGRDbGFzcyhhdEZpcnN0U2xpZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIucmVtb3ZlQ2xhc3MoYXRGaXJzdFNsaWRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzbGlkZVRvOiBmdW5jdGlvbiAoJHNsaWRlcywgaXNOZXh0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ydW5CZWZvcmVDYWxsYmFjayhpc05leHQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kdmlld3BvcnQuc2Nyb2xsVG8odGhpcy5nZXRTbGlkZVRvUG9zaXRpb24oJHNsaWRlcywgaXNOZXh0KSwgdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIHtcbiAgICAgICAgICAgICAgICBvbkFmdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQXJyb3dzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuQWZ0ZXJDYWxsYmFjayhpc05leHQpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2xpZGVUb1Bvc2l0aW9uOiBmdW5jdGlvbiAoJHNsaWRlcywgaXNOZXh0KSB7XG4gICAgICAgICAgICBpZiAoICEgdGhpcy5pc0luU2luZ2xlU2xpZGVNb2RlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmRlZmF1bHRTbGlkZURpc3RhbmNlKHRoaXMuJHNsaWRlciwgdGhpcy4kdmlld3BvcnQsIHRoaXMuJHRyYWNrLCBpc05leHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdHJhY2tPZmZzZXQgPSB0aGlzLmdldFRyYWNrT2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgaGFsZlZpZXdwb3J0V2lkdGggPSB0aGlzLnZpZXdwb3J0V2lkdGggLyAyLFxuICAgICAgICAgICAgICAgIHNsaWRlVG9PZmZzZXQgPSAwO1xuXG4gICAgICAgICAgICAkc2xpZGVzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBzbGlkZSkge1xuICAgICAgICAgICAgICAgIHZhciAkc2xpZGUgPSAkKHNsaWRlKSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVXaWR0aCA9ICRzbGlkZS53aWR0aCgpLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0T2Zmc2V0ID0gJHNsaWRlLnBvc2l0aW9uKCkubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRPZmZzZXQgPSBsZWZ0T2Zmc2V0ICsgc2xpZGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgdmlzdWFsUmVmZXJlbmNlUG9pbnQgPSAoaXNOZXh0ID8gbGVmdE9mZnNldCA6IHJpZ2h0T2Zmc2V0KSAtIHRyYWNrT2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBzbGlkZUlzT3ZlckhhbGZXYXkgPSB2aXN1YWxSZWZlcmVuY2VQb2ludCA+IGhhbGZWaWV3cG9ydFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZUlzQmVmb3JlSGFsZldheSA9IHZpc3VhbFJlZmVyZW5jZVBvaW50IDwgaGFsZlZpZXdwb3J0V2lkdGg7XG5cbiAgICAgICAgICAgICAgICBzbGlkZVRvT2Zmc2V0ID0gbGVmdE9mZnNldCArICgoc2xpZGVXaWR0aCAtIHRoaXMudmlld3BvcnRXaWR0aCkgLyAyKTtcblxuICAgICAgICAgICAgICAgIGlmICgoaXNOZXh0ICYmIHNsaWRlSXNPdmVySGFsZldheSkgfHxcbiAgICAgICAgICAgICAgICAgKCAhIGlzTmV4dCAmJiBzbGlkZUlzQmVmb3JlSGFsZldheSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzbGlkZVRvT2Zmc2V0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFRyYWNrT2Zmc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hYnModGhpcy4kdHJhY2sucG9zaXRpb24oKS5sZWZ0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWaWV3cG9ydFdpZHRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLiR2aWV3cG9ydC53aWR0aCgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTbGlkZXNXaWR0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gMDtcblxuICAgICAgICAgICAgdGhpcy4kc2xpZGVzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdpZHRoICs9IHBhcnNlRmxvYXQoJCh0aGlzKS53aWR0aCgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hlY2tTbGlkZXNGaXRJblZpZXdwb3J0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3cG9ydFdpZHRoID4gdGhpcy5zbGlkZXNUb3RhbFdpZHRoO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzU2luZ2xlU2xpZGVXaWRlclRoYW5WaWV3cG9ydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHNsaWRlcy5sZW5ndGggPD0gMSAmJiB0aGlzLnNsaWRlc1RvdGFsV2lkdGggPj0gdGhpcy52aWV3cG9ydFdpZHRoO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzSW5TaW5nbGVTbGlkZU1vZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBicmVha1BvaW50ID0gKHRoaXMub3B0aW9ucy5zaW5nbGVTbGlkZUJyZWFrUG9pbnQgaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMub3B0aW9ucy5zaW5nbGVTbGlkZUJyZWFrUG9pbnQodGhpcy4kc2xpZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5vcHRpb25zLnNpbmdsZVNsaWRlQnJlYWtQb2ludDtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmlld3BvcnRXaWR0aCA8IGJyZWFrUG9pbnQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNBRmlyc3RTbGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VHJhY2tPZmZzZXQoKSAtIDEgPD0gdGhpcy5nZXRTbGlkZU92ZXJmbG93KHRoaXMuJHNsaWRlcy5maXJzdCgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0F0TGFzdFNsaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdHJhY2tSZW1haW5pbmcgPSB0aGlzLnNsaWRlc1RvdGFsV2lkdGggLSB0aGlzLmdldFRyYWNrT2Zmc2V0KCkgLSAxLFxuICAgICAgICAgICAgICAgIHNsaWRlT3ZlcmZsb3cgPSB0aGlzLmdldFNsaWRlT3ZlcmZsb3codGhpcy4kc2xpZGVzLmxhc3QoKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXdwb3J0V2lkdGggPiB0cmFja1JlbWFpbmluZyAtIHNsaWRlT3ZlcmZsb3c7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2xpZGVPdmVyZmxvdzogZnVuY3Rpb24gKCRzbGlkZSkge1xuICAgICAgICAgICAgaWYgKCRzbGlkZS53aWR0aCgpIDw9IHRoaXMudmlld3BvcnRXaWR0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKCRzbGlkZS53aWR0aCgpIC0gdGhpcy52aWV3cG9ydFdpZHRoKSAvIDI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcnVuQmVmb3JlQ2FsbGJhY2s6IGZ1bmN0aW9uIChpc05leHQpIHtcbiAgICAgICAgICAgIHZhciBiZWZvcmVDYWxsYmFjayA9IGlzTmV4dFxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMub3B0aW9ucy5vbkJlZm9yZVNsaWRlTmV4dFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMub3B0aW9ucy5vbkJlZm9yZVNsaWRlUHJldjtcblxuICAgICAgICAgICAgaWYgKGJlZm9yZUNhbGxiYWNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmVmb3JlQ2FsbGJhY2sodGhpcy4kc2xpZGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcnVuQWZ0ZXJDYWxsYmFjazogZnVuY3Rpb24gKGlzTmV4dCkge1xuICAgICAgICAgICAgdmFyIGFmdGVyQ2FsbGJhY2sgPSBpc05leHRcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm9wdGlvbnMub25BZnRlclNsaWRlTmV4dFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMub3B0aW9ucy5vbkFmdGVyU2xpZGVQcmV2O1xuXG4gICAgICAgICAgICBpZiAoYWZ0ZXJDYWxsYmFjayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgYWZ0ZXJDYWxsYmFjayh0aGlzLiRzbGlkZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICggISAkLmRhdGEodGhpcywgXCJwbHVnaW5fXCIgKyBwbHVnaW5OYW1lKSkge1xuICAgICAgICAgICAgICAgICQuZGF0YSh0aGlzLCBcInBsdWdpbl9cIiArIHBsdWdpbk5hbWUsXG4gICAgICAgICAgICAgICAgbmV3IFBsdWdpbih0aGlzLCBvcHRpb25zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvanMvc2xpZGVyLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==