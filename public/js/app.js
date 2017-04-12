webpackJsonp([1],[
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

window.$ = window.jQuery = __webpack_require__(0);
__webpack_require__(1);
__webpack_require__(5);

$('.slider').slide();

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 4 */,
/* 5 */
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
module.exports = __webpack_require__(3);


/***/ })
],[6]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvanMvYXBwLmpzIiwid2VicGFjazovLy8uL3NyYy9zY3NzL2FwcC5zY3NzIiwid2VicGFjazovLy8uL3NyYy9qcy9zbGlkZXIuanMiXSwibmFtZXMiOlsid2luZG93IiwiJCIsImpRdWVyeSIsInJlcXVpcmUiLCJzbGlkZSIsImRvY3VtZW50IiwidW5kZWZpbmVkIiwicGx1Z2luTmFtZSIsImRlZmF1bHRzIiwidmlld3BvcnQiLCJ0cmFjayIsInByZXZBcnJvdyIsIm5leHRBcnJvdyIsImF0TGFzdFNsaWRlIiwiYXRGaXJzdFNsaWRlIiwibm9TbGlkZSIsInNsaWRlU3BlZWQiLCJlbmFibGVTd2lwZSIsInNpbmdsZVNsaWRlQnJlYWtQb2ludCIsIiRzbGlkZXIiLCJoZWlnaHQiLCJkZWZhdWx0U2xpZGVEaXN0YW5jZSIsIiR2aWV3cG9ydCIsIiR0cmFjayIsImlzTmV4dCIsIndpZHRoIiwib25CZWZvcmVTbGlkZU5leHQiLCJvbkJlZm9yZVNsaWRlUHJldiIsIm9uQWZ0ZXJTbGlkZU5leHQiLCJvbkFmdGVyU2xpZGVQcmV2IiwiUGx1Z2luIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJleHRlbmQiLCJmaW5kIiwiJHNsaWRlcyIsInZpZXdwb3J0V2lkdGgiLCJzbGlkZXNUb3RhbFdpZHRoIiwic2luZ2xlU2xpZGVJc1dpZGVyVGhhblZpZXdwb3J0Iiwic2xpZGVzRml0SW5WaWV3cG9ydCIsIm5vU2xpZGVDbGFzcyIsInN1YnN0ciIsIm9uUmVzaXplIiwiaW5pdCIsInByb3RvdHlwZSIsInJlZ2lzdGVyRXZlbnRzIiwiZXZhbHVhdGVTbGlkZXIiLCJzZXRUaW1lb3V0IiwiYmluZCIsIm9uIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic2xpZGVUbyIsImdldCIsInJldmVyc2UiLCJjbGVhclRpbWVvdXQiLCJ1cGRhdGVTbGlkZXJJbmZvIiwidXBkYXRlU2xpZGVyIiwidXBkYXRlQXJyb3dzIiwiZ2V0Vmlld3BvcnRXaWR0aCIsImdldFNsaWRlc1dpZHRoIiwiaXNTaW5nbGVTbGlkZVdpZGVyVGhhblZpZXdwb3J0IiwiY2hlY2tTbGlkZXNGaXRJblZpZXdwb3J0IiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImlzQXRMYXN0U2xpZGUiLCJpc0FGaXJzdFNsaWRlIiwicnVuQmVmb3JlQ2FsbGJhY2siLCJzY3JvbGxUbyIsImdldFNsaWRlVG9Qb3NpdGlvbiIsIm9uQWZ0ZXIiLCJydW5BZnRlckNhbGxiYWNrIiwiaXNJblNpbmdsZVNsaWRlTW9kZSIsInRyYWNrT2Zmc2V0IiwiZ2V0VHJhY2tPZmZzZXQiLCJoYWxmVmlld3BvcnRXaWR0aCIsInNsaWRlVG9PZmZzZXQiLCJlYWNoIiwiaW5kZXgiLCIkc2xpZGUiLCJzbGlkZVdpZHRoIiwibGVmdE9mZnNldCIsInBvc2l0aW9uIiwibGVmdCIsInJpZ2h0T2Zmc2V0IiwidmlzdWFsUmVmZXJlbmNlUG9pbnQiLCJzbGlkZUlzT3ZlckhhbGZXYXkiLCJzbGlkZUlzQmVmb3JlSGFsZldheSIsIk1hdGgiLCJhYnMiLCJwYXJzZUZsb2F0IiwibGVuZ3RoIiwiYnJlYWtQb2ludCIsIkZ1bmN0aW9uIiwiZ2V0U2xpZGVPdmVyZmxvdyIsImZpcnN0IiwidHJhY2tSZW1haW5pbmciLCJzbGlkZU92ZXJmbG93IiwibGFzdCIsImJlZm9yZUNhbGxiYWNrIiwiYWZ0ZXJDYWxsYmFjayIsImZuIiwiZGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUFBLE9BQU9DLENBQVAsR0FBV0QsT0FBT0UsTUFBUCxHQUFnQixtQkFBQUMsQ0FBUSxDQUFSLENBQTNCO0FBQ0EsbUJBQUFBLENBQVEsQ0FBUjtBQUNBLG1CQUFBQSxDQUFRLENBQVI7O0FBRUFGLEVBQUUsU0FBRixFQUFhRyxLQUFiLEc7Ozs7OztBQ0pBLHlDOzs7Ozs7O0FDQUEsQ0FBQyxVQUFVSCxDQUFWLEVBQWFELE1BQWIsRUFBcUJLLFFBQXJCLEVBQStCQyxTQUEvQixFQUEwQzs7QUFFdkMsUUFBSUMsYUFBYSxPQUFqQjtBQUFBLFFBQ0lDLFdBQVc7QUFD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TCxDQUFhTCxpQkFGdkI7O0FBSUEsZ0JBQUl3RSwwQkFBMEJOLFFBQTlCLEVBQXdDO0FBQ3BDLHVCQUFPTSxlQUFlLEtBQUtoRixPQUFwQixDQUFQO0FBQ0g7O0FBRUQsbUJBQU8sSUFBUDtBQUNILFNBck1jOztBQXVNZm9ELDBCQUFrQiwwQkFBVS9DLE1BQVYsRUFBa0I7QUFDaEMsZ0JBQUk0RSxnQkFBZ0I1RSxTQUNWLEtBQUtRLE9BQUwsQ0FBYUosZ0JBREgsR0FFVixLQUFLSSxPQUFMLENBQWFILGdCQUZ2Qjs7QUFJQSxnQkFBSXVFLHlCQUF5QlAsUUFBN0IsRUFBdUM7QUFDbkNPLDhCQUFjLEtBQUtqRixPQUFuQjtBQUNIO0FBQ0o7QUEvTWMsS0FBbkI7O0FBa05BbEIsTUFBRW9HLEVBQUYsQ0FBSzlGLFVBQUwsSUFBbUIsVUFBVXlCLE9BQVYsRUFBbUI7QUFDbEMsZUFBTyxLQUFLNkMsSUFBTCxDQUFVLFlBQVk7QUFDekIsZ0JBQUssQ0FBRTVFLEVBQUVxRyxJQUFGLENBQU8sSUFBUCxFQUFhLFlBQVkvRixVQUF6QixDQUFQLEVBQTZDO0FBQ3pDTixrQkFBRXFHLElBQUYsQ0FBTyxJQUFQLEVBQWEsWUFBWS9GLFVBQXpCLEVBQ0EsSUFBSXVCLE1BQUosQ0FBVyxJQUFYLEVBQWlCRSxPQUFqQixDQURBO0FBRUg7QUFDSixTQUxNLENBQVA7QUFNSCxLQVBEO0FBU0gsQ0F4UkQsRUF3Ukc5QixNQXhSSCxFQXdSV0YsTUF4UlgsRUF3Um1CSyxRQXhSbkIsRSIsImZpbGUiOiJwdWJsaWMvanMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsid2luZG93LiQgPSB3aW5kb3cualF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5yZXF1aXJlKCdiZW5tYWpvci1qcXVlcnktdG91Y2gtZXZlbnRzJyk7XG5yZXF1aXJlKCcuL3NsaWRlcicpO1xuXG4kKCcuc2xpZGVyJykuc2xpZGUoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9qcy9hcHAuanMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3Njc3MvYXBwLnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiKGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAgIHZhciBwbHVnaW5OYW1lID0gXCJzbGlkZVwiLFxuICAgICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgIC8vIEdlbmVyYWwgc2V0dGluZ3MuLi5cbiAgICAgICAgICAgIHZpZXdwb3J0OiBcIi5zbGlkZXItdmlld3BvcnRcIixcbiAgICAgICAgICAgIHRyYWNrOiBcIi5zbGlkZXItdHJhY2tcIixcbiAgICAgICAgICAgIHNsaWRlOiBcIi5zbGlkZVwiLFxuICAgICAgICAgICAgcHJldkFycm93OiBcIi5zbGlkZXItcHJldlwiLFxuICAgICAgICAgICAgbmV4dEFycm93OiBcIi5zbGlkZXItbmV4dFwiLFxuICAgICAgICAgICAgYXRMYXN0U2xpZGU6IFwiLnNsaWRlci1lbmRcIixcbiAgICAgICAgICAgIGF0Rmlyc3RTbGlkZTogXCIuc2xpZGVyLXN0YXJ0XCIsXG4gICAgICAgICAgICBub1NsaWRlOiBcIi5uby1zbGlkZVwiLFxuICAgICAgICAgICAgc2xpZGVTcGVlZDogNTAwLFxuICAgICAgICAgICAgZW5hYmxlU3dpcGU6IHRydWUsXG5cbiAgICAgICAgICAgIC8vIFRoZSBicmVha3BvaW50IGNhbiBiZSBhbiBpbnRlZ2VyIG9yXG4gICAgICAgICAgICAvLyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBpbnRlZ2VyLlxuICAgICAgICAgICAgc2luZ2xlU2xpZGVCcmVha1BvaW50OiBmdW5jdGlvbiAoJHNsaWRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2xpZGVyLmhlaWdodCgpICogNDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIFNsaWRlIGRpc3RhbmNlIHVzZWQgaWYgdGhlIHZpZXdwb3J0IGlzIHdpZGVyIHRoYW4gXCJzaW5nbGVTbGlkZUJyZWFrUG9pbnRcIi5cbiAgICAgICAgICAgIC8vIFJldHVybiBhbnkgdmFsdWUgc3VwcG9ydGVkIGJ5IHRoZSBqcXVlcnkuc2Nyb2xsVG8gcGxlZ2luOlxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZsZXNsZXIvanF1ZXJ5LnNjcm9sbFRvXG4gICAgICAgICAgICBkZWZhdWx0U2xpZGVEaXN0YW5jZTogZnVuY3Rpb24gKCRzbGlkZXIsICR2aWV3cG9ydCwgJHRyYWNrLCBpc05leHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGlzTmV4dCA/ICcrPScgOiAnLT0nKSArICgkdmlld3BvcnQud2lkdGgoKSAqIC43MCkgKyAncHgnO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gQmVmb3JlIGNhbGxiYWNrcy4uLlxuICAgICAgICAgICAgLy8gUmV0dXJuIGZhbHNlIHRvIGNhbmNlbCBzbGlkZS5cbiAgICAgICAgICAgIG9uQmVmb3JlU2xpZGVOZXh0OiBmdW5jdGlvbiAoJHNsaWRlcikgeyB9LFxuICAgICAgICAgICAgb25CZWZvcmVTbGlkZVByZXY6IGZ1bmN0aW9uICgkc2xpZGVyKSB7IH0sXG5cbiAgICAgICAgICAgIC8vIEFmdGVyIGNhbGxiYWNrcy4uLlxuICAgICAgICAgICAgb25BZnRlclNsaWRlTmV4dDogZnVuY3Rpb24gKCRzbGlkZXIpIHsgfSxcbiAgICAgICAgICAgIG9uQWZ0ZXJTbGlkZVByZXY6IGZ1bmN0aW9uICgkc2xpZGVyKSB7IH1cbiAgICAgICAgfTtcblxuICAgIGZ1bmN0aW9uIFBsdWdpbihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICAgIC8vIE1lcmdlIG9wdGlvbnMuLi5cbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gQ2FjaGUgZWxlbWVudHMuLi5cbiAgICAgICAgdGhpcy4kc2xpZGVyID0gJChlbGVtZW50KTtcbiAgICAgICAgdGhpcy4kdmlld3BvcnQgPSB0aGlzLiRzbGlkZXIuZmluZCh0aGlzLm9wdGlvbnMudmlld3BvcnQpO1xuICAgICAgICB0aGlzLiR0cmFjayA9IHRoaXMuJHNsaWRlci5maW5kKHRoaXMub3B0aW9ucy50cmFjayk7XG4gICAgICAgIHRoaXMuJHNsaWRlcyA9IHRoaXMuJHNsaWRlci5maW5kKHRoaXMub3B0aW9ucy5zbGlkZSk7XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlZCB2YWx1ZXMuLi5cbiAgICAgICAgdGhpcy52aWV3cG9ydFdpZHRoID0gMDtcbiAgICAgICAgdGhpcy5zbGlkZXNUb3RhbFdpZHRoID0gMDtcbiAgICAgICAgdGhpcy5zaW5nbGVTbGlkZUlzV2lkZXJUaGFuVmlld3BvcnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zbGlkZXNGaXRJblZpZXdwb3J0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMubm9TbGlkZUNsYXNzID0gKHRoaXMub3B0aW9ucy5ub1NsaWRlKS5zdWJzdHIoMSk7XG4gICAgICAgIHRoaXMub25SZXNpemUgPSBudWxsO1xuXG4gICAgICAgIC8vIEtpY2tvZmYuLi5cbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgUGx1Z2luLnByb3RvdHlwZSA9IHtcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSAge1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckV2ZW50cygpO1xuICAgICAgICAgICAgdGhpcy5ldmFsdWF0ZVNsaWRlcigpO1xuXG4gICAgICAgICAgICAvLyBEbyBhIHJlY2hlY2sgYWZ0ZXIgMSBzZWNvbmRcbiAgICAgICAgICAgIC8vIGluIGNhc2UgaW1hZ2VzIGxvYWQgc2xvd2x5Li4uXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV2YWx1YXRlU2xpZGVyKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwMDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlZ2lzdGVyRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBOZXh0IGFycm93IGNsaWNrLi4uXG4gICAgICAgICAgICB0aGlzLiRzbGlkZXIub24oJ2NsaWNrJywgdGhpcy5vcHRpb25zLm5leHRBcnJvdywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZVRvKHRoaXMuJHNsaWRlcywgdHJ1ZSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAvLyBQcmV2IGFycm93IGNsaWNrLi4uXG4gICAgICAgICAgICB0aGlzLiRzbGlkZXIub24oJ2NsaWNrJywgdGhpcy5vcHRpb25zLnByZXZBcnJvdywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZVRvKCQodGhpcy4kc2xpZGVzLmdldCgpLnJldmVyc2UoKSksIGZhbHNlKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZW5hYmxlU3dpcGUpIHtcbiAgICAgICAgICAgICAgICAvLyBTd2lwZSBsZWZ0Li4uXG4gICAgICAgICAgICAgICAgdGhpcy4kc2xpZGVyLm9uKCdzd2lwZXJpZ2h0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNsaWRlVG8oJCh0aGlzLiRzbGlkZXMuZ2V0KCkucmV2ZXJzZSgpKSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBTd2lwZSByaWdodC4uLlxuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5vbignc3dpcGVsZWZ0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNsaWRlVG8odGhpcy4kc2xpZGVzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXaW5kb3cgcmVzaXplIGV2ZW50Li4uXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5vblJlc2l6ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV2YWx1YXRlU2xpZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25SZXNpemUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgOTAwKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gVHJpZ2dlcmVkIG9uIGluaXRcbiAgICAgICAgLy8gYW5kIG9uIHdpbmRvdyByZXNpemUuXG4gICAgICAgIGV2YWx1YXRlU2xpZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNsaWRlckluZm8oKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2xpZGVyKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUFycm93cygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVNsaWRlckluZm86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudmlld3BvcnRXaWR0aCA9IHRoaXMuZ2V0Vmlld3BvcnRXaWR0aCgpO1xuICAgICAgICAgICAgdGhpcy5zbGlkZXNUb3RhbFdpZHRoID0gdGhpcy5nZXRTbGlkZXNXaWR0aCgpO1xuICAgICAgICAgICAgdGhpcy5zaW5nbGVTbGlkZUlzV2lkZXJUaGFuVmlld3BvcnQgPSB0aGlzLmlzU2luZ2xlU2xpZGVXaWRlclRoYW5WaWV3cG9ydCgpO1xuICAgICAgICAgICAgdGhpcy5zbGlkZXNGaXRJblZpZXdwb3J0ID0gdGhpcy5jaGVja1NsaWRlc0ZpdEluVmlld3BvcnQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVTbGlkZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNsaWRlc0ZpdEluVmlld3BvcnQgfHwgdGhpcy5zaW5nbGVTbGlkZUlzV2lkZXJUaGFuVmlld3BvcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIuYWRkQ2xhc3ModGhpcy5ub1NsaWRlQ2xhc3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIucmVtb3ZlQ2xhc3ModGhpcy5ub1NsaWRlQ2xhc3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5zaW5nbGVTbGlkZUlzV2lkZXJUaGFuVmlld3BvcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlVG8odGhpcy4kc2xpZGVzLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVBcnJvd3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhdExhc3RTbGlkZSA9ICh0aGlzLm9wdGlvbnMuYXRMYXN0U2xpZGUpLnN1YnN0cigxKSxcbiAgICAgICAgICAgICAgICBhdEZpcnN0U2xpZGUgPSAodGhpcy5vcHRpb25zLmF0Rmlyc3RTbGlkZSkuc3Vic3RyKDEpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F0TGFzdFNsaWRlKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIuYWRkQ2xhc3MoYXRMYXN0U2xpZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIucmVtb3ZlQ2xhc3MoYXRMYXN0U2xpZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0FGaXJzdFNsaWRlKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIuYWRkQ2xhc3MoYXRGaXJzdFNsaWRlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2xpZGVyLnJlbW92ZUNsYXNzKGF0Rmlyc3RTbGlkZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2xpZGVUbzogZnVuY3Rpb24gKCRzbGlkZXMsIGlzTmV4dCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucnVuQmVmb3JlQ2FsbGJhY2soaXNOZXh0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJHZpZXdwb3J0LnNjcm9sbFRvKHRoaXMuZ2V0U2xpZGVUb1Bvc2l0aW9uKCRzbGlkZXMsIGlzTmV4dCksIHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCB7XG4gICAgICAgICAgICAgICAgb25BZnRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUFycm93cygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bkFmdGVyQ2FsbGJhY2soaXNOZXh0KTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNsaWRlVG9Qb3NpdGlvbjogZnVuY3Rpb24gKCRzbGlkZXMsIGlzTmV4dCkge1xuICAgICAgICAgICAgaWYgKCAhIHRoaXMuaXNJblNpbmdsZVNsaWRlTW9kZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5kZWZhdWx0U2xpZGVEaXN0YW5jZSh0aGlzLiRzbGlkZXIsIHRoaXMuJHZpZXdwb3J0LCB0aGlzLiR0cmFjaywgaXNOZXh0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRyYWNrT2Zmc2V0ID0gdGhpcy5nZXRUcmFja09mZnNldCgpLFxuICAgICAgICAgICAgICAgIGhhbGZWaWV3cG9ydFdpZHRoID0gdGhpcy52aWV3cG9ydFdpZHRoIC8gMixcbiAgICAgICAgICAgICAgICBzbGlkZVRvT2Zmc2V0ID0gMDtcblxuICAgICAgICAgICAgJHNsaWRlcy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgc2xpZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHNsaWRlID0gJChzbGlkZSksXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlV2lkdGggPSAkc2xpZGUud2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgbGVmdE9mZnNldCA9ICRzbGlkZS5wb3NpdGlvbigpLmxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0T2Zmc2V0ID0gbGVmdE9mZnNldCArIHNsaWRlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIHZpc3VhbFJlZmVyZW5jZVBvaW50ID0gKGlzTmV4dCA/IGxlZnRPZmZzZXQgOiByaWdodE9mZnNldCkgLSB0cmFja09mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVJc092ZXJIYWxmV2F5ID0gdmlzdWFsUmVmZXJlbmNlUG9pbnQgPiBoYWxmVmlld3BvcnRXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVJc0JlZm9yZUhhbGZXYXkgPSB2aXN1YWxSZWZlcmVuY2VQb2ludCA8IGhhbGZWaWV3cG9ydFdpZHRoO1xuXG4gICAgICAgICAgICAgICAgc2xpZGVUb09mZnNldCA9IGxlZnRPZmZzZXQgKyAoKHNsaWRlV2lkdGggLSB0aGlzLnZpZXdwb3J0V2lkdGgpIC8gMik7XG5cbiAgICAgICAgICAgICAgICBpZiAoKGlzTmV4dCAmJiBzbGlkZUlzT3ZlckhhbGZXYXkpIHx8XG4gICAgICAgICAgICAgICAgICggISBpc05leHQgJiYgc2xpZGVJc0JlZm9yZUhhbGZXYXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICByZXR1cm4gc2xpZGVUb09mZnNldDtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRUcmFja09mZnNldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMuJHRyYWNrLnBvc2l0aW9uKCkubGVmdCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Vmlld3BvcnRXaWR0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy4kdmlld3BvcnQud2lkdGgoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2xpZGVzV2lkdGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuJHNsaWRlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB3aWR0aCArPSBwYXJzZUZsb2F0KCQodGhpcykud2lkdGgoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNoZWNrU2xpZGVzRml0SW5WaWV3cG9ydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmlld3BvcnRXaWR0aCA+IHRoaXMuc2xpZGVzVG90YWxXaWR0aDtcbiAgICAgICAgfSxcblxuICAgICAgICBpc1NpbmdsZVNsaWRlV2lkZXJUaGFuVmlld3BvcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRzbGlkZXMubGVuZ3RoIDw9IDEgJiYgdGhpcy5zbGlkZXNUb3RhbFdpZHRoID49IHRoaXMudmlld3BvcnRXaWR0aDtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0luU2luZ2xlU2xpZGVNb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYnJlYWtQb2ludCA9ICh0aGlzLm9wdGlvbnMuc2luZ2xlU2xpZGVCcmVha1BvaW50IGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2luZ2xlU2xpZGVCcmVha1BvaW50KHRoaXMuJHNsaWRlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMub3B0aW9ucy5zaW5nbGVTbGlkZUJyZWFrUG9pbnQ7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXdwb3J0V2lkdGggPCBicmVha1BvaW50O1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQUZpcnN0U2xpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFRyYWNrT2Zmc2V0KCkgLSAxIDw9IHRoaXMuZ2V0U2xpZGVPdmVyZmxvdyh0aGlzLiRzbGlkZXMuZmlyc3QoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNBdExhc3RTbGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRyYWNrUmVtYWluaW5nID0gdGhpcy5zbGlkZXNUb3RhbFdpZHRoIC0gdGhpcy5nZXRUcmFja09mZnNldCgpIC0gMSxcbiAgICAgICAgICAgICAgICBzbGlkZU92ZXJmbG93ID0gdGhpcy5nZXRTbGlkZU92ZXJmbG93KHRoaXMuJHNsaWRlcy5sYXN0KCkpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3cG9ydFdpZHRoID4gdHJhY2tSZW1haW5pbmcgLSBzbGlkZU92ZXJmbG93O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNsaWRlT3ZlcmZsb3c6IGZ1bmN0aW9uICgkc2xpZGUpIHtcbiAgICAgICAgICAgIGlmICgkc2xpZGUud2lkdGgoKSA8PSB0aGlzLnZpZXdwb3J0V2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuICgkc2xpZGUud2lkdGgoKSAtIHRoaXMudmlld3BvcnRXaWR0aCkgLyAyO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJ1bkJlZm9yZUNhbGxiYWNrOiBmdW5jdGlvbiAoaXNOZXh0KSB7XG4gICAgICAgICAgICB2YXIgYmVmb3JlQ2FsbGJhY2sgPSBpc05leHRcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm9wdGlvbnMub25CZWZvcmVTbGlkZU5leHRcbiAgICAgICAgICAgICAgICAgICAgOiB0aGlzLm9wdGlvbnMub25CZWZvcmVTbGlkZVByZXY7XG5cbiAgICAgICAgICAgIGlmIChiZWZvcmVDYWxsYmFjayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJlZm9yZUNhbGxiYWNrKHRoaXMuJHNsaWRlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJ1bkFmdGVyQ2FsbGJhY2s6IGZ1bmN0aW9uIChpc05leHQpIHtcbiAgICAgICAgICAgIHZhciBhZnRlckNhbGxiYWNrID0gaXNOZXh0XG4gICAgICAgICAgICAgICAgICAgID8gdGhpcy5vcHRpb25zLm9uQWZ0ZXJTbGlkZU5leHRcbiAgICAgICAgICAgICAgICAgICAgOiB0aGlzLm9wdGlvbnMub25BZnRlclNsaWRlUHJldjtcblxuICAgICAgICAgICAgaWYgKGFmdGVyQ2FsbGJhY2sgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgIGFmdGVyQ2FsbGJhY2sodGhpcy4kc2xpZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkLmZuW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoICEgJC5kYXRhKHRoaXMsIFwicGx1Z2luX1wiICsgcGx1Z2luTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAkLmRhdGEodGhpcywgXCJwbHVnaW5fXCIgKyBwbHVnaW5OYW1lLFxuICAgICAgICAgICAgICAgIG5ldyBQbHVnaW4odGhpcywgb3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2pzL3NsaWRlci5qcyJdLCJzb3VyY2VSb290IjoiIn0=