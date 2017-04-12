webpackJsonp([0],[
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

window.$ = window.jQuery = __webpack_require__(0);
__webpack_require__(5);
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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * jQuery Mobile Events
 * by Ben Major (lincweb - www.lincweb.co.uk)
 *
 * Copyright 2011-2015, Ben Major
 * Licensed under the MIT License:
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */



(function ($) {
    $.attrFn = $.attrFn || {};

    // navigator.userAgent.toLowerCase() isn't reliable for Chrome installs
    // on mobile devices. As such, we will create a boolean isChromeDesktop
    // The reason that we need to do this is because Chrome annoyingly
    // purports support for touch events even if the underlying hardware
    // does not!
    var agent = navigator.userAgent.toLowerCase(),
        isChromeDesktop = (agent.indexOf('chrome') > -1 && ((agent.indexOf('windows') > -1) || (agent.indexOf('macintosh') > -1) || (agent.indexOf('linux') > -1)) && agent.indexOf('mobile') < 0 && agent.indexOf('android') < 0),

        settings = {
            tap_pixel_range: 5,
            swipe_h_threshold: 50,
            swipe_v_threshold: 50,
            taphold_threshold: 750,
            doubletap_int: 500,

            touch_capable: ('ontouchstart' in window && !isChromeDesktop),
            orientation_support: ('orientation' in window && 'onorientationchange' in window),

            startevent:  (('ontouchstart' in window && !isChromeDesktop) ? 'touchstart' : 'mousedown'),
            endevent:    (('ontouchstart' in window && !isChromeDesktop) ? 'touchend' : 'mouseup'),
            moveevent:   (('ontouchstart' in window && !isChromeDesktop) ? 'touchmove' : 'mousemove'),
            tapevent:    ('ontouchstart' in window && !isChromeDesktop) ? 'tap' : 'click',
            scrollevent: ('ontouchstart' in window && !isChromeDesktop) ? 'touchmove' : 'scroll',

            hold_timer: null,
            tap_timer: null
        };
    
    // Convenience functions:
    $.isTouchCapable = function() { return settings.touch_capable; };
    $.getStartEvent = function() { return settings.startevent; };
    $.getEndEvent = function() { return settings.endevent; };
    $.getMoveEvent = function() { return settings.moveevent; };
    $.getTapEvent = function() { return settings.tapevent; };
    $.getScrollEvent = function() { return settings.scrollevent; };
    
    // Add Event shortcuts:
    $.each(['tapstart', 'tapend', 'tapmove', 'tap', 'tap2', 'tap3', 'tap4', 'singletap', 'doubletap', 'taphold', 'swipe', 'swipeup', 'swiperight', 'swipedown', 'swipeleft', 'swipeend', 'scrollstart', 'scrollend', 'orientationchange'], function (i, name) {
        $.fn[name] = function (fn) {
            return fn ? this.on(name, fn) : this.trigger(name);
        };

        $.attrFn[name] = true;
    });

    // tapstart Event:
    $.event.special.tapstart = {
        setup: function () {
			
            var thisObject = this,
                $this = $(thisObject);
			
            $this.on(settings.startevent, function tapStartFunc(e) {
				
                $this.data('callee', tapStartFunc);
                if (e.which && e.which !== 1) {
                    return false;
                }

                var origEvent = e.originalEvent,
                    touchData = {
                        'position': {
                            'x': ((settings.touch_capable) ? origEvent.touches[0].screenX : e.screenX),
                            'y': (settings.touch_capable) ? origEvent.touches[0].screenY : e.screenY
                        },
                        'offset': {
                            'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
                            'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                        },
                        'time': Date.now(),
                        'target': e.target
                    };
				
                triggerCustomEvent(thisObject, 'tapstart', e, touchData);
                return true;
            });
        },

        remove: function () {
            $(this).off(settings.startevent, $(this).data.callee);
        }
    };
	
    // tapmove Event:
    $.event.special.tapmove = {
    	setup: function() {
            var thisObject = this,
            $this = $(thisObject);
    			
            $this.on(settings.moveevent, function tapMoveFunc(e) {
                $this.data('callee', tapMoveFunc);
    			
                var origEvent = e.originalEvent,
                    touchData = {
                        'position': {
                            'x': ((settings.touch_capable) ? origEvent.touches[0].screenX : e.screenX),
                            'y': (settings.touch_capable) ? origEvent.touches[0].screenY : e.screenY
                        },
                        'offset': {
                            'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
							'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                        },
                        'time': Date.now(),
                        'target': e.target
                    };
    				
                triggerCustomEvent(thisObject, 'tapmove', e, touchData);
                return true;
            });
        },
        remove: function() {
            $(this).off(settings.moveevent, $(this).data.callee);
        }
    };

    // tapend Event:
    $.event.special.tapend = {
        setup: function () {
            var thisObject = this,
                $this = $(thisObject);

            $this.on(settings.endevent, function tapEndFunc(e) {
                // Touch event data:
                $this.data('callee', tapEndFunc);

                var origEvent = e.originalEvent;
                var touchData = {
                    'position': {
                        'x': (settings.touch_capable) ? origEvent.changedTouches[0].screenX : e.screenX,
                        'y': (settings.touch_capable) ? origEvent.changedTouches[0].screenY : e.screenY
                    },
                    'offset': {
                        'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
                        'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                    },
                    'time': Date.now(),
                    'target': e.target
                };
                triggerCustomEvent(thisObject, 'tapend', e, touchData);
                return true;
            });
        },
        remove: function () {
            $(this).off(settings.endevent, $(this).data.callee);
        }
    };

    // taphold Event:
    $.event.special.taphold = {
        setup: function () {
            var thisObject = this,
                $this = $(thisObject),
                origTarget,
                start_pos = {
                    x: 0,
                    y: 0
                },
                end_x = 0,
                end_y = 0;

            $this.on(settings.startevent, function tapHoldFunc1(e) {
                if (e.which && e.which !== 1) {
                    return false;
                } else {
                    $this.data('tapheld', false);
                    origTarget = e.target;

                    var origEvent = e.originalEvent;
                    var start_time = Date.now(),
                        startPosition = {
                            'x': (settings.touch_capable) ? origEvent.touches[0].screenX : e.screenX,
                            'y': (settings.touch_capable) ? origEvent.touches[0].screenY : e.screenY
                        },
                        startOffset = {
                            'x': (settings.touch_capable) ? origEvent.touches[0].pageX - origEvent.touches[0].target.offsetLeft : e.offsetX,
                            'y': (settings.touch_capable) ? origEvent.touches[0].pageY - origEvent.touches[0].target.offsetTop : e.offsetY
                        };

                    start_pos.x = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageX : e.pageX;
                    start_pos.y = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageY : e.pageY;

                    end_x = start_pos.x;
                    end_y = start_pos.y;

                    settings.hold_timer = window.setTimeout(function () {

                        var diff_x = (start_pos.x - end_x),
                            diff_y = (start_pos.y - end_y);

                        if (e.target == origTarget && ((start_pos.x == end_x && start_pos.y == end_y) || (diff_x >= -(settings.tap_pixel_range) && diff_x <= settings.tap_pixel_range && diff_y >= -(settings.tap_pixel_range) && diff_y <= settings.tap_pixel_range))) {
                            $this.data('tapheld', true);

                            var end_time = Date.now(),
                                endPosition = {
                                    'x': (settings.touch_capable) ? origEvent.touches[0].screenX : e.screenX,
                                    'y': (settings.touch_capable) ? origEvent.touches[0].screenY : e.screenY
                                },
                                endOffset = {
                                    'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
									'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                                };
                            var duration = end_time - start_time;

                            // Build the touch data:
                            var touchData = {
                                'startTime': start_time,
                                'endTime': end_time,
                                'startPosition': startPosition,
                                'startOffset': startOffset,
                                'endPosition': endPosition,
                                'endOffset': endOffset,
                                'duration': duration,
                                'target': e.target
                            };
                            $this.data('callee1', tapHoldFunc1);
                            triggerCustomEvent(thisObject, 'taphold', e, touchData);
                        }
                    }, settings.taphold_threshold);

                    return true;
                }
            }).on(settings.endevent, function tapHoldFunc2() {
                $this.data('callee2', tapHoldFunc2);
                $this.data('tapheld', false);
                window.clearTimeout(settings.hold_timer);
            })
            .on(settings.moveevent, function tapHoldFunc3(e) {
                $this.data('callee3', tapHoldFunc3);
				
                end_x = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageX : e.pageX;
                end_y = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageY : e.pageY;
            });
        },

        remove: function () {
            $(this).off(settings.startevent, $(this).data.callee1).off(settings.endevent, $(this).data.callee2).off(settings.moveevent, $(this).data.callee3);
        }
    };

    // doubletap Event:
    $.event.special.doubletap = {
        setup: function () {
            var thisObject = this,
                $this = $(thisObject),
                origTarget,
                action,
                firstTap = null,
                origEvent,
				cooloff,
				cooling = false;

            $this.on(settings.startevent, function doubleTapFunc1(e) {
                if (e.which && e.which !== 1) {
                    return false;
                }
                $this.data('doubletapped', false);
                origTarget = e.target;
                $this.data('callee1', doubleTapFunc1);

                origEvent = e.originalEvent;
                if (!firstTap) {
                    firstTap = {
                        'position': {
                            'x': (settings.touch_capable) ? origEvent.touches[0].screenX : e.screenX,
                            'y': (settings.touch_capable) ? origEvent.touches[0].screenY : e.screenY
                        },
                        'offset': {
                            'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
                            'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                        },
                        'time': Date.now(),
                        'target': e.target
                    };
                }

                return true;
            }).on(settings.endevent, function doubleTapFunc2(e) {
				
                var now = Date.now();
                var lastTouch = $this.data('lastTouch') || now + 1;
                var delta = now - lastTouch;
                window.clearTimeout(action);
                $this.data('callee2', doubleTapFunc2);

                if (delta < settings.doubletap_int && (e.target == origTarget) && delta > 100) {
                    $this.data('doubletapped', true);
                    window.clearTimeout(settings.tap_timer);

                    // Now get the current event:
                    var lastTap = {
                        'position': {
                            'x': (settings.touch_capable) ? e.originalEvent.changedTouches[0].screenX : e.screenX,
                            'y': (settings.touch_capable) ? e.originalEvent.changedTouches[0].screenY : e.screenY
                        },
                        'offset': {
                            'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
                            'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                        },
                        'time': Date.now(),
                        'target': e.target
                    };

                    var touchData = {
                        'firstTap': firstTap,
                        'secondTap': lastTap,
                        'interval': lastTap.time - firstTap.time
                    };

                    if (!cooling) {
                    	triggerCustomEvent(thisObject, 'doubletap', e, touchData);
                        firstTap = null;
                    }
                    
                    cooling = true;
                    
                    cooloff = window.setTimeout(function () {
                    	cooling = false;
                    }, settings.doubletap_int);
					
                } else {
                    $this.data('lastTouch', now);
                    action = window.setTimeout(function () {
                        firstTap = null;
                        window.clearTimeout(action);
                    }, settings.doubletap_int, [e]);
                }
                $this.data('lastTouch', now);
            });
        },
        remove: function () {
            $(this).off(settings.startevent, $(this).data.callee1).off(settings.endevent, $(this).data.callee2);
        }
    };

    // singletap Event:
    // This is used in conjuction with doubletap when both events are needed on the same element
    $.event.special.singletap = {
        setup: function () {
            var thisObject = this,
                $this = $(thisObject),
                origTarget = null,
                startTime = null,
                start_pos = {
                    x: 0,
                    y: 0
                };

            $this.on(settings.startevent, function singleTapFunc1(e) {
                if (e.which && e.which !== 1) {
                    return false;
                } else {
                    startTime = Date.now();
                    origTarget = e.target;
                    $this.data('callee1', singleTapFunc1);

                    // Get the start x and y position:
                    start_pos.x = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageX : e.pageX;
                    start_pos.y = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageY : e.pageY;
                    return true;
                }
            }).on(settings.endevent, function singleTapFunc2(e) {
                $this.data('callee2', singleTapFunc2);
                if (e.target == origTarget) {
                    // Get the end point:
                    var end_pos_x = (e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageX : e.pageX;
                    var end_pos_y = (e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageY : e.pageY;
                    
                    // We need to check if it was a taphold:

                    settings.tap_timer = window.setTimeout(function () {
                        if (!$this.data('doubletapped') && !$this.data('tapheld') && (start_pos.x == end_pos_x) && (start_pos.y == end_pos_y)) {
                            var origEvent = e.originalEvent;
                            var touchData = {
                                'position': {
                                    'x': (settings.touch_capable) ? origEvent.changedTouches[0].screenX : e.screenX,
                                    'y': (settings.touch_capable) ? origEvent.changedTouches[0].screenY : e.screenY
                                },
                                'offset': {
                                    'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
									'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                                },
                                'time': Date.now(),
                                'target': e.target
                            };
                            
                            // Was it a taphold?
                            if((touchData.time - startTime) < settings.taphold_threshold)
                            {
                                triggerCustomEvent(thisObject, 'singletap', e, touchData);
                            }
                        }
                    }, settings.doubletap_int);
                }
            });
        },

        remove: function () {
            $(this).off(settings.startevent, $(this).data.callee1).off(settings.endevent, $(this).data.callee2);
        }
    };

    // tap Event:
    $.event.special.tap = {
        setup: function () {
            var thisObject = this,
                $this = $(thisObject),
                started = false,
                origTarget = null,
                start_time,
                start_pos = {
                    x: 0,
                    y: 0
                },
                touches;

            $this.on(settings.startevent, function tapFunc1(e) {
                $this.data('callee1', tapFunc1);

                if( e.which && e.which !== 1 )
				{
                    return false;
                }
				else
				{
                    started = true;
                    start_pos.x = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageX : e.pageX;
                    start_pos.y = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageY : e.pageY;
                    start_time = Date.now();
                    origTarget = e.target;
					
                    touches = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches : [ e ];
                    return true;
                }
            }).on(settings.endevent, function tapFunc2(e) {
                $this.data('callee2', tapFunc2);

                // Only trigger if they've started, and the target matches:
                var end_x = (e.originalEvent.targetTouches) ? e.originalEvent.changedTouches[0].pageX : e.pageX,
                    end_y = (e.originalEvent.targetTouches) ? e.originalEvent.changedTouches[0].pageY : e.pageY,
                    diff_x = (start_pos.x - end_x),
                    diff_y = (start_pos.y - end_y),
                    eventName;
					
                if (origTarget == e.target && started && ((Date.now() - start_time) < settings.taphold_threshold) && ((start_pos.x == end_x && start_pos.y == end_y) || (diff_x >= -(settings.tap_pixel_range) && diff_x <= settings.tap_pixel_range && diff_y >= -(settings.tap_pixel_range) && diff_y <= settings.tap_pixel_range))) {
                    var origEvent = e.originalEvent;
                    var touchData = [ ];
					
                    for( var i = 0; i < touches.length; i++)
                    {
                        var touch = {
                            'position': {
                                'x': (settings.touch_capable) ? origEvent.changedTouches[i].screenX : e.screenX,
                                'y': (settings.touch_capable) ? origEvent.changedTouches[i].screenY : e.screenY
                            },
                            'offset': {
                                'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[i].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
                                'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[i].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                            },
                            'time': Date.now(),
                            'target': e.target
                        };
                    	
                        touchData.push( touch );
                    }
                    
                    triggerCustomEvent(thisObject, 'tap', e, touchData);
                }
            });
        },

        remove: function () {
            $(this).off(settings.startevent, $(this).data.callee1).off(settings.endevent, $(this).data.callee2);
        }
    };

    // swipe Event (also handles swipeup, swiperight, swipedown and swipeleft):
    $.event.special.swipe = {
        setup: function () {
            var thisObject = this,
                $this = $(thisObject),
                started = false,
                hasSwiped = false,
                originalCoord = {
                    x: 0,
                    y: 0
                },
                finalCoord = {
                    x: 0,
                    y: 0
                },
                startEvnt;

            // Screen touched, store the original coordinate

            function touchStart(e) {
                $this = $(e.currentTarget);
                $this.data('callee1', touchStart);
                originalCoord.x = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageX : e.pageX;
                originalCoord.y = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageY : e.pageY;
                finalCoord.x = originalCoord.x;
                finalCoord.y = originalCoord.y;
                started = true;
                var origEvent = e.originalEvent;
                // Read event data into our startEvt:
                startEvnt = {
                    'position': {
                        'x': (settings.touch_capable) ? origEvent.touches[0].screenX : e.screenX,
                        'y': (settings.touch_capable) ? origEvent.touches[0].screenY : e.screenY
                    },
                    'offset': {
                        'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
                        'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                    },
                    'time': Date.now(),
                    'target': e.target
                };
            }

            // Store coordinates as finger is swiping

            function touchMove(e) {
                $this = $(e.currentTarget);
                $this.data('callee2', touchMove);
                finalCoord.x = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageX : e.pageX;
                finalCoord.y = (e.originalEvent.targetTouches) ? e.originalEvent.targetTouches[0].pageY : e.pageY;

                var swipedir;

                // We need to check if the element to which the event was bound contains a data-xthreshold | data-vthreshold:
                var ele_x_threshold = ($this.parent().data('xthreshold')) ? $this.parent().data('xthreshold') : $this.data('xthreshold'),
                    ele_y_threshold = ($this.parent().data('ythreshold')) ? $this.parent().data('ythreshold') : $this.data('ythreshold'),
                    h_threshold = (typeof ele_x_threshold !== 'undefined' && ele_x_threshold !== false && parseInt(ele_x_threshold)) ? parseInt(ele_x_threshold) : settings.swipe_h_threshold,
                    v_threshold = (typeof ele_y_threshold !== 'undefined' && ele_y_threshold !== false && parseInt(ele_y_threshold)) ? parseInt(ele_y_threshold) : settings.swipe_v_threshold; 
                
                if (originalCoord.y > finalCoord.y && (originalCoord.y - finalCoord.y > v_threshold)) {
                    swipedir = 'swipeup';
                }
                if (originalCoord.x < finalCoord.x && (finalCoord.x - originalCoord.x > h_threshold)) {
                    swipedir = 'swiperight';
                }
                if (originalCoord.y < finalCoord.y && (finalCoord.y - originalCoord.y > v_threshold)) {
                    swipedir = 'swipedown';
                }
                if (originalCoord.x > finalCoord.x && (originalCoord.x - finalCoord.x > h_threshold)) {
                    swipedir = 'swipeleft';
                }
                if (swipedir != undefined && started) {
                    originalCoord.x = 0;
                    originalCoord.y = 0;
                    finalCoord.x = 0;
                    finalCoord.y = 0;
                    started = false;

                    // Read event data into our endEvnt:
                    var origEvent = e.originalEvent;
                    var endEvnt = {
                        'position': {
                            'x': (settings.touch_capable) ? origEvent.touches[0].screenX : e.screenX,
                            'y': (settings.touch_capable) ? origEvent.touches[0].screenY : e.screenY
                        },
                        'offset': {
                            'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
                            'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                        },
                        'time': Date.now(),
                        'target': e.target
                    };

                    // Calculate the swipe amount (normalized):
                    var xAmount = Math.abs(startEvnt.position.x - endEvnt.position.x),
                        yAmount = Math.abs(startEvnt.position.y - endEvnt.position.y);

                    var touchData = {
                        'startEvnt': startEvnt,
                        'endEvnt': endEvnt,
                        'direction': swipedir.replace('swipe', ''),
                        'xAmount': xAmount,
                        'yAmount': yAmount,
                        'duration': endEvnt.time - startEvnt.time
                    };
                    hasSwiped = true;
                    $this.trigger('swipe', touchData).trigger(swipedir, touchData);
                }
            }

            function touchEnd(e) {
                $this = $(e.currentTarget);
                var swipedir = "";
                $this.data('callee3', touchEnd);
                if (hasSwiped) {
                    // We need to check if the element to which the event was bound contains a data-xthreshold | data-vthreshold:
                    var ele_x_threshold = $this.data('xthreshold'),
                        ele_y_threshold = $this.data('ythreshold'),
                        h_threshold = (typeof ele_x_threshold !== 'undefined' && ele_x_threshold !== false && parseInt(ele_x_threshold)) ? parseInt(ele_x_threshold) : settings.swipe_h_threshold,
                        v_threshold = (typeof ele_y_threshold !== 'undefined' && ele_y_threshold !== false && parseInt(ele_y_threshold)) ? parseInt(ele_y_threshold) : settings.swipe_v_threshold;

                    var origEvent = e.originalEvent;
                    var endEvnt = {
                        'position': {
                            'x': (settings.touch_capable) ? origEvent.changedTouches[0].screenX : e.screenX,
                            'y': (settings.touch_capable) ? origEvent.changedTouches[0].screenY : e.screenY
                        },
                        'offset': {
                            'x': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageX - $this.offset().left) : Math.round(e.pageX - $this.offset().left),
                            'y': (settings.touch_capable) ? Math.round(origEvent.changedTouches[0].pageY - $this.offset().top) : Math.round(e.pageY - $this.offset().top)
                        },
                        'time': Date.now(),
                        'target': e.target
                    };

                    // Read event data into our endEvnt:
                    if (startEvnt.position.y > endEvnt.position.y && (startEvnt.position.y - endEvnt.position.y > v_threshold)) {
                        swipedir = 'swipeup';
                    }
                    if (startEvnt.position.x < endEvnt.position.x && (endEvnt.position.x - startEvnt.position.x > h_threshold)) {
                        swipedir = 'swiperight';
                    }
                    if (startEvnt.position.y < endEvnt.position.y && (endEvnt.position.y - startEvnt.position.y > v_threshold)) {
                        swipedir = 'swipedown';
                    }
                    if (startEvnt.position.x > endEvnt.position.x && (startEvnt.position.x - endEvnt.position.x > h_threshold)) {
                        swipedir = 'swipeleft';
                    }

                    // Calculate the swipe amount (normalized):
                    var xAmount = Math.abs(startEvnt.position.x - endEvnt.position.x),
                        yAmount = Math.abs(startEvnt.position.y - endEvnt.position.y);

                    var touchData = {
                        'startEvnt': startEvnt,
                        'endEvnt': endEvnt,
                        'direction': swipedir.replace('swipe', ''),
                        'xAmount': xAmount,
                        'yAmount': yAmount,
                        'duration': endEvnt.time - startEvnt.time
                    };
                    $this.trigger('swipeend', touchData);
                }

                started = false;
                hasSwiped = false;
            }

            $this.on(settings.startevent, touchStart);
            $this.on(settings.moveevent, touchMove);
            $this.on(settings.endevent, touchEnd);
        },

        remove: function () {
            $(this).off(settings.startevent, $(this).data.callee1).off(settings.moveevent, $(this).data.callee2).off(settings.endevent, $(this).data.callee3);
        }
    };

    // scrollstart Event (also handles scrollend):
    $.event.special.scrollstart = {
        setup: function () {
            var thisObject = this,
                $this = $(thisObject),
                scrolling,
                timer;

            function trigger(event, state) {
                scrolling = state;
                triggerCustomEvent(thisObject, scrolling ? 'scrollstart' : 'scrollend', event);
            }

            // iPhone triggers scroll after a small delay; use touchmove instead
            $this.on(settings.scrollevent, function scrollFunc(event) {
                $this.data('callee', scrollFunc);

                if (!scrolling) {
                    trigger(event, true);
                }

                clearTimeout(timer);
                timer = setTimeout(function () {
                    trigger(event, false);
                }, 50);
            });
        },

        remove: function () {
            $(this).off(settings.scrollevent, $(this).data.callee);
        }
    };

    // This is the orientation change (largely borrowed from jQuery Mobile):
    var win = $(window),
        special_event,
        get_orientation,
        last_orientation,
        initial_orientation_is_landscape,
        initial_orientation_is_default,
        portrait_map = {
            '0': true,
            '180': true
        };

    if (settings.orientation_support) {
        var ww = window.innerWidth || win.width(),
            wh = window.innerHeight || win.height(),
            landscape_threshold = 50;

        initial_orientation_is_landscape = ww > wh && (ww - wh) > landscape_threshold;
        initial_orientation_is_default = portrait_map[window.orientation];

        if ((initial_orientation_is_landscape && initial_orientation_is_default) || (!initial_orientation_is_landscape && !initial_orientation_is_default)) {
            portrait_map = {
                '-90': true,
                '90': true
            };
        }
    }

    $.event.special.orientationchange = special_event = {
        setup: function () {
            // If the event is supported natively, return false so that jQuery
            // will on to the event using DOM methods.
            if (settings.orientation_support) {
                return false;
            }

            // Get the current orientation to avoid initial double-triggering.
            last_orientation = get_orientation();

            win.on('throttledresize', handler);
            return true;
        },
        teardown: function () {
            if (settings.orientation_support) {
                return false;
            }

            win.off('throttledresize', handler);
            return true;
        },
        add: function (handleObj) {
            // Save a reference to the bound event handler.
            var old_handler = handleObj.handler;

            handleObj.handler = function (event) {
                event.orientation = get_orientation();
                return old_handler.apply(this, arguments);
            };
        }
    };

    // If the event is not supported natively, this handler will be bound to
    // the window resize event to simulate the orientationchange event.

    function handler() {
        // Get the current orientation.
        var orientation = get_orientation();

        if (orientation !== last_orientation) {
            // The orientation has changed, so trigger the orientationchange event.
            last_orientation = orientation;
            win.trigger("orientationchange");
        }
    }

    $.event.special.orientationchange.orientation = get_orientation = function () {
        var isPortrait = true,
            elem = document.documentElement;

        if (settings.orientation_support) {
            isPortrait = portrait_map[window.orientation];
        } else {
            isPortrait = elem && elem.clientWidth / elem.clientHeight < 1.1;
        }

        return isPortrait ? 'portrait' : 'landscape';
    };

    // throttle Handler:
    $.event.special.throttledresize = {
        setup: function () {
            $(this).on('resize', throttle_handler);
        },
        teardown: function () {
            $(this).off('resize', throttle_handler);
        }
    };

    var throttle = 250,
        throttle_handler = function () {
            curr = Date.now();
            diff = curr - lastCall;

            if (diff >= throttle) {
                lastCall = curr;
                $(this).trigger('throttledresize');

            } else {
                if (heldCall) {
                    window.clearTimeout(heldCall);
                }

                // Promise a held call will still execute
                heldCall = window.setTimeout(handler, throttle - diff);
            }
        },
        lastCall = 0,
        heldCall,
        curr,
        diff;

    // Trigger a custom event:

    function triggerCustomEvent(obj, eventType, event, touchData) {
        var originalType = event.type;
        event.type = eventType;

        $.event.dispatch.call(obj, event, touchData);
        event.type = originalType;
    }

    // Correctly on anything we've overloaded:
    $.each({
        scrollend: 'scrollstart',
        swipeup: 'swipe',
        swiperight: 'swipe',
        swipedown: 'swipe',
        swipeleft: 'swipe',
        swipeend: 'swipe',
        tap2: 'tap'
    }, function (e, srcE) {
        $.event.special[e] = {
            setup: function () {
                $(this).on(srcE, $.noop);
            }
        };
    });

}(jQuery));


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
module.exports = __webpack_require__(2);


/***/ })
],[6]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvanMvYXBwLmpzIiwid2VicGFjazovLy8uL3NyYy9zY3NzL2FwcC5zY3NzIiwid2VicGFjazovLy8uL3NyYy9qcy9zbGlkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iZW5tYWpvci1qcXVlcnktdG91Y2gtZXZlbnRzL3NyYy9qcXVlcnkubW9iaWxlLWV2ZW50cy5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCIkIiwialF1ZXJ5IiwicmVxdWlyZSIsInNsaWRlIiwiZG9jdW1lbnQiLCJ1bmRlZmluZWQiLCJwbHVnaW5OYW1lIiwiZGVmYXVsdHMiLCJ2aWV3cG9ydCIsInRyYWNrIiwicHJldkFycm93IiwibmV4dEFycm93IiwiYXRMYXN0U2xpZGUiLCJhdEZpcnN0U2xpZGUiLCJub1NsaWRlIiwic2xpZGVTcGVlZCIsImVuYWJsZVN3aXBlIiwic2luZ2xlU2xpZGVCcmVha1BvaW50IiwiJHNsaWRlciIsImhlaWdodCIsImRlZmF1bHRTbGlkZURpc3RhbmNlIiwiJHZpZXdwb3J0IiwiJHRyYWNrIiwiaXNOZXh0Iiwid2lkdGgiLCJvbkJlZm9yZVNsaWRlTmV4dCIsIm9uQmVmb3JlU2xpZGVQcmV2Iiwib25BZnRlclNsaWRlTmV4dCIsIm9uQWZ0ZXJTbGlkZVByZXYiLCJQbHVnaW4iLCJlbGVtZW50Iiwib3B0aW9ucyIsImV4dGVuZCIsImZpbmQiLCIkc2xpZGVzIiwidmlld3BvcnRXaWR0aCIsInNsaWRlc1RvdGFsV2lkdGgiLCJzaW5nbGVTbGlkZUlzV2lkZXJUaGFuVmlld3BvcnQiLCJzbGlkZXNGaXRJblZpZXdwb3J0Iiwibm9TbGlkZUNsYXNzIiwic3Vic3RyIiwib25SZXNpemUiLCJpbml0IiwicHJvdG90eXBlIiwicmVnaXN0ZXJFdmVudHMiLCJldmFsdWF0ZVNsaWRlciIsInNldFRpbWVvdXQiLCJiaW5kIiwib24iLCJlIiwicHJldmVudERlZmF1bHQiLCJzbGlkZVRvIiwiZ2V0IiwicmV2ZXJzZSIsImNsZWFyVGltZW91dCIsInVwZGF0ZVNsaWRlckluZm8iLCJ1cGRhdGVTbGlkZXIiLCJ1cGRhdGVBcnJvd3MiLCJnZXRWaWV3cG9ydFdpZHRoIiwiZ2V0U2xpZGVzV2lkdGgiLCJpc1NpbmdsZVNsaWRlV2lkZXJUaGFuVmlld3BvcnQiLCJjaGVja1NsaWRlc0ZpdEluVmlld3BvcnQiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwiaXNBdExhc3RTbGlkZSIsImlzQUZpcnN0U2xpZGUiLCJydW5CZWZvcmVDYWxsYmFjayIsInNjcm9sbFRvIiwiZ2V0U2xpZGVUb1Bvc2l0aW9uIiwib25BZnRlciIsInJ1bkFmdGVyQ2FsbGJhY2siLCJpc0luU2luZ2xlU2xpZGVNb2RlIiwidHJhY2tPZmZzZXQiLCJnZXRUcmFja09mZnNldCIsImhhbGZWaWV3cG9ydFdpZHRoIiwic2xpZGVUb09mZnNldCIsImlzUHJldiIsImVhY2giLCJpbmRleCIsIiRzbGlkZSIsInNsaWRlV2lkdGgiLCJsZWZ0T2Zmc2V0IiwicG9zaXRpb24iLCJsZWZ0IiwicmlnaHRPZmZzZXQiLCJ2aXN1YWxSZWZlcmVuY2VQb2ludCIsInNsaWRlSXNPdmVySGFsZldheSIsInNsaWRlSXNCZWZvcmVIYWxmV2F5Iiwic2xpZGVySXNBdFN0YXJ0Iiwic2xpZGVySXNBdEVuZCIsInNsaWRlSXNOb3RGaXJzdCIsInNsaWRlSXNOb3RMYXN0IiwiTWF0aCIsImFicyIsInBhcnNlRmxvYXQiLCJsZW5ndGgiLCJicmVha1BvaW50IiwiRnVuY3Rpb24iLCJnZXRTbGlkZU92ZXJmbG93IiwiZmlyc3QiLCJ0cmFja1JlbWFpbmluZyIsInNsaWRlT3ZlcmZsb3ciLCJsYXN0IiwiYmVmb3JlQ2FsbGJhY2siLCJhZnRlckNhbGxiYWNrIiwiZm4iLCJkYXRhIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBQSxPQUFPQyxDQUFQLEdBQVdELE9BQU9FLE1BQVAsR0FBZ0IsbUJBQUFDLENBQVEsQ0FBUixDQUEzQjtBQUNBLG1CQUFBQSxDQUFRLENBQVI7QUFDQSxtQkFBQUEsQ0FBUSxDQUFSOztBQUVB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Q0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMERBQTBEO0FBQzFEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2IsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTCxDQUFDIiwiZmlsZSI6InB1YmxpYy9qcy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuJCA9IHdpbmRvdy5qUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcbnJlcXVpcmUoJ2Jlbm1ham9yLWpxdWVyeS10b3VjaC1ldmVudHMnKTtcbnJlcXVpcmUoJy4vc2xpZGVyJyk7XG5cbiQoJy5zbGlkZXInKS5zbGlkZSgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2pzL2FwcC5qcyIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvc2Nzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gICAgdmFyIHBsdWdpbk5hbWUgPSBcInNsaWRlXCIsXG4gICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgLy8gR2VuZXJhbCBzZXR0aW5ncy4uLlxuICAgICAgICAgICAgdmlld3BvcnQ6IFwiLnNsaWRlci12aWV3cG9ydFwiLFxuICAgICAgICAgICAgdHJhY2s6IFwiLnNsaWRlci10cmFja1wiLFxuICAgICAgICAgICAgc2xpZGU6IFwiLnNsaWRlXCIsXG4gICAgICAgICAgICBwcmV2QXJyb3c6IFwiLnNsaWRlci1wcmV2XCIsXG4gICAgICAgICAgICBuZXh0QXJyb3c6IFwiLnNsaWRlci1uZXh0XCIsXG4gICAgICAgICAgICBhdExhc3RTbGlkZTogXCIuc2xpZGVyLWVuZFwiLFxuICAgICAgICAgICAgYXRGaXJzdFNsaWRlOiBcIi5zbGlkZXItc3RhcnRcIixcbiAgICAgICAgICAgIG5vU2xpZGU6IFwiLm5vLXNsaWRlXCIsXG4gICAgICAgICAgICBzbGlkZVNwZWVkOiA1MDAsXG4gICAgICAgICAgICBlbmFibGVTd2lwZTogdHJ1ZSxcblxuICAgICAgICAgICAgLy8gVGhlIGJyZWFrcG9pbnQgY2FuIGJlIGFuIGludGVnZXIgb3JcbiAgICAgICAgICAgIC8vIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGludGVnZXIuXG4gICAgICAgICAgICBzaW5nbGVTbGlkZUJyZWFrUG9pbnQ6IGZ1bmN0aW9uICgkc2xpZGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzbGlkZXIuaGVpZ2h0KCkgKiA0O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gU2xpZGUgZGlzdGFuY2UgdXNlZCBpZiB0aGUgdmlld3BvcnQgaXMgd2lkZXIgdGhhbiBcInNpbmdsZVNsaWRlQnJlYWtQb2ludFwiLlxuICAgICAgICAgICAgLy8gUmV0dXJuIGFueSB2YWx1ZSBzdXBwb3J0ZWQgYnkgdGhlIGpxdWVyeS5zY3JvbGxUbyBwbGVnaW46XG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmxlc2xlci9qcXVlcnkuc2Nyb2xsVG9cbiAgICAgICAgICAgIGRlZmF1bHRTbGlkZURpc3RhbmNlOiBmdW5jdGlvbiAoJHNsaWRlciwgJHZpZXdwb3J0LCAkdHJhY2ssIGlzTmV4dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaXNOZXh0ID8gJys9JyA6ICctPScpICsgKCR2aWV3cG9ydC53aWR0aCgpICogLjcwKSArICdweCc7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBCZWZvcmUgY2FsbGJhY2tzLi4uXG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsc2UgdG8gY2FuY2VsIHNsaWRlLlxuICAgICAgICAgICAgb25CZWZvcmVTbGlkZU5leHQ6IGZ1bmN0aW9uICgkc2xpZGVyKSB7IH0sXG4gICAgICAgICAgICBvbkJlZm9yZVNsaWRlUHJldjogZnVuY3Rpb24gKCRzbGlkZXIpIHsgfSxcblxuICAgICAgICAgICAgLy8gQWZ0ZXIgY2FsbGJhY2tzLi4uXG4gICAgICAgICAgICBvbkFmdGVyU2xpZGVOZXh0OiBmdW5jdGlvbiAoJHNsaWRlcikgeyB9LFxuICAgICAgICAgICAgb25BZnRlclNsaWRlUHJldjogZnVuY3Rpb24gKCRzbGlkZXIpIHsgfVxuICAgICAgICB9O1xuXG4gICAgZnVuY3Rpb24gUGx1Z2luKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gTWVyZ2Ugb3B0aW9ucy4uLlxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgICAgICAvLyBDYWNoZSBlbGVtZW50cy4uLlxuICAgICAgICB0aGlzLiRzbGlkZXIgPSAkKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLiR2aWV3cG9ydCA9IHRoaXMuJHNsaWRlci5maW5kKHRoaXMub3B0aW9ucy52aWV3cG9ydCk7XG4gICAgICAgIHRoaXMuJHRyYWNrID0gdGhpcy4kc2xpZGVyLmZpbmQodGhpcy5vcHRpb25zLnRyYWNrKTtcbiAgICAgICAgdGhpcy4kc2xpZGVzID0gdGhpcy4kc2xpZGVyLmZpbmQodGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICAvLyBDYWxjdWxhdGVkIHZhbHVlcy4uLlxuICAgICAgICB0aGlzLnZpZXdwb3J0V2lkdGggPSAwO1xuICAgICAgICB0aGlzLnNsaWRlc1RvdGFsV2lkdGggPSAwO1xuICAgICAgICB0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNsaWRlc0ZpdEluVmlld3BvcnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ub1NsaWRlQ2xhc3MgPSAodGhpcy5vcHRpb25zLm5vU2xpZGUpLnN1YnN0cigxKTtcbiAgICAgICAgdGhpcy5vblJlc2l6ZSA9IG51bGw7XG5cbiAgICAgICAgLy8gS2lja29mZi4uLlxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpICB7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnRzKCk7XG4gICAgICAgICAgICB0aGlzLmV2YWx1YXRlU2xpZGVyKCk7XG5cbiAgICAgICAgICAgIC8vIERvIGEgcmVjaGVjayBhZnRlciAxIHNlY29uZFxuICAgICAgICAgICAgLy8gaW4gY2FzZSBpbWFnZXMgbG9hZCBzbG93bHkuLi5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXZhbHVhdGVTbGlkZXIoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVnaXN0ZXJFdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIE5leHQgYXJyb3cgY2xpY2suLi5cbiAgICAgICAgICAgIHRoaXMuJHNsaWRlci5vbignY2xpY2snLCB0aGlzLm9wdGlvbnMubmV4dEFycm93LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlVG8odGhpcy4kc2xpZGVzLCB0cnVlKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIC8vIFByZXYgYXJyb3cgY2xpY2suLi5cbiAgICAgICAgICAgIHRoaXMuJHNsaWRlci5vbignY2xpY2snLCB0aGlzLm9wdGlvbnMucHJldkFycm93LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlVG8oJCh0aGlzLiRzbGlkZXMuZ2V0KCkucmV2ZXJzZSgpKSwgZmFsc2UpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lbmFibGVTd2lwZSkge1xuICAgICAgICAgICAgICAgIC8vIFN3aXBlIGxlZnQuLi5cbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIub24oJ3N3aXBlcmlnaHQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVUbygkKHRoaXMuJHNsaWRlcy5nZXQoKS5yZXZlcnNlKCkpLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgICAgIC8vIFN3aXBlIHJpZ2h0Li4uXG4gICAgICAgICAgICAgICAgdGhpcy4kc2xpZGVyLm9uKCdzd2lwZWxlZnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVUbyh0aGlzLiRzbGlkZXMsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdpbmRvdyByZXNpemUgZXZlbnQuLi5cbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUmVzaXplID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZhbHVhdGVTbGlkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA5MDApO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUcmlnZ2VyZWQgb24gaW5pdFxuICAgICAgICAvLyBhbmQgb24gd2luZG93IHJlc2l6ZS5cbiAgICAgICAgZXZhbHVhdGVTbGlkZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2xpZGVySW5mbygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTbGlkZXIoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQXJyb3dzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlU2xpZGVySW5mbzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy52aWV3cG9ydFdpZHRoID0gdGhpcy5nZXRWaWV3cG9ydFdpZHRoKCk7XG4gICAgICAgICAgICB0aGlzLnNsaWRlc1RvdGFsV2lkdGggPSB0aGlzLmdldFNsaWRlc1dpZHRoKCk7XG4gICAgICAgICAgICB0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCA9IHRoaXMuaXNTaW5nbGVTbGlkZVdpZGVyVGhhblZpZXdwb3J0KCk7XG4gICAgICAgICAgICB0aGlzLnNsaWRlc0ZpdEluVmlld3BvcnQgPSB0aGlzLmNoZWNrU2xpZGVzRml0SW5WaWV3cG9ydCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVNsaWRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2xpZGVzRml0SW5WaWV3cG9ydCB8fCB0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5hZGRDbGFzcyh0aGlzLm5vU2xpZGVDbGFzcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5yZW1vdmVDbGFzcyh0aGlzLm5vU2xpZGVDbGFzcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNpbmdsZVNsaWRlSXNXaWRlclRoYW5WaWV3cG9ydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVUbyh0aGlzLiRzbGlkZXMsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZUFycm93czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGF0TGFzdFNsaWRlID0gKHRoaXMub3B0aW9ucy5hdExhc3RTbGlkZSkuc3Vic3RyKDEpLFxuICAgICAgICAgICAgICAgIGF0Rmlyc3RTbGlkZSA9ICh0aGlzLm9wdGlvbnMuYXRGaXJzdFNsaWRlKS5zdWJzdHIoMSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXRMYXN0U2xpZGUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5hZGRDbGFzcyhhdExhc3RTbGlkZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5yZW1vdmVDbGFzcyhhdExhc3RTbGlkZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQUZpcnN0U2xpZGUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNsaWRlci5hZGRDbGFzcyhhdEZpcnN0U2xpZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzbGlkZXIucmVtb3ZlQ2xhc3MoYXRGaXJzdFNsaWRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzbGlkZVRvOiBmdW5jdGlvbiAoJHNsaWRlcywgaXNOZXh0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ydW5CZWZvcmVDYWxsYmFjayhpc05leHQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kdmlld3BvcnQuc2Nyb2xsVG8odGhpcy5nZXRTbGlkZVRvUG9zaXRpb24oJHNsaWRlcywgaXNOZXh0KSwgdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIHtcbiAgICAgICAgICAgICAgICBvbkFmdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQXJyb3dzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuQWZ0ZXJDYWxsYmFjayhpc05leHQpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2xpZGVUb1Bvc2l0aW9uOiBmdW5jdGlvbiAoJHNsaWRlcywgaXNOZXh0KSB7XG4gICAgICAgICAgICBpZiAoICEgdGhpcy5pc0luU2luZ2xlU2xpZGVNb2RlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmRlZmF1bHRTbGlkZURpc3RhbmNlKHRoaXMuJHNsaWRlciwgdGhpcy4kdmlld3BvcnQsIHRoaXMuJHRyYWNrLCBpc05leHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdHJhY2tPZmZzZXQgPSB0aGlzLmdldFRyYWNrT2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgaGFsZlZpZXdwb3J0V2lkdGggPSB0aGlzLnZpZXdwb3J0V2lkdGggLyAyLFxuICAgICAgICAgICAgICAgIHNsaWRlVG9PZmZzZXQgPSAwLFxuICAgICAgICAgICAgICAgIGlzUHJldiA9ICEgaXNOZXh0O1xuXG4gICAgICAgICAgICAkc2xpZGVzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBzbGlkZSkge1xuICAgICAgICAgICAgICAgIHZhciAkc2xpZGUgPSAkKHNsaWRlKSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVXaWR0aCA9ICRzbGlkZS53aWR0aCgpLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0T2Zmc2V0ID0gJHNsaWRlLnBvc2l0aW9uKCkubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRPZmZzZXQgPSBsZWZ0T2Zmc2V0ICsgc2xpZGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgdmlzdWFsUmVmZXJlbmNlUG9pbnQgPSAoaXNOZXh0ID8gbGVmdE9mZnNldCA6IHJpZ2h0T2Zmc2V0KSAtIHRyYWNrT2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBzbGlkZUlzT3ZlckhhbGZXYXkgPSB2aXN1YWxSZWZlcmVuY2VQb2ludCA+IGhhbGZWaWV3cG9ydFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZUlzQmVmb3JlSGFsZldheSA9IHZpc3VhbFJlZmVyZW5jZVBvaW50IDwgaGFsZlZpZXdwb3J0V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlcklzQXRTdGFydCA9IHRyYWNrT2Zmc2V0ID09PSAwLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXJJc0F0RW5kID0gdHJhY2tPZmZzZXQgPj0gdGhpcy5zbGlkZXNUb3RhbFdpZHRoIC0gdGhpcy52aWV3cG9ydFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZUlzTm90Rmlyc3QgPSBsZWZ0T2Zmc2V0ID4gMCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVJc05vdExhc3QgPSByaWdodE9mZnNldCA8IHRoaXMuc2xpZGVzVG90YWxXaWR0aDtcblxuICAgICAgICAgICAgICAgIHNsaWRlVG9PZmZzZXQgPSBsZWZ0T2Zmc2V0ICsgKChzbGlkZVdpZHRoIC0gdGhpcy52aWV3cG9ydFdpZHRoKSAvIDIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCAoaXNOZXh0ICYmIHNsaWRlcklzQXRTdGFydCAmJiBzbGlkZUlzTm90Rmlyc3QpXG4gICAgICAgICAgICAgICAgICAgIHx8IChpc1ByZXYgJiYgc2xpZGVySXNBdEVuZCAmJiBzbGlkZUlzTm90TGFzdClcbiAgICAgICAgICAgICAgICAgICAgfHwgKGlzTmV4dCAmJiBzbGlkZUlzT3ZlckhhbGZXYXkpXG4gICAgICAgICAgICAgICAgICAgIHx8IChpc1ByZXYgJiYgc2xpZGVJc0JlZm9yZUhhbGZXYXkpICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNsaWRlVG9PZmZzZXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VHJhY2tPZmZzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLiR0cmFjay5wb3NpdGlvbigpLmxlZnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZpZXdwb3J0V2lkdGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuJHZpZXdwb3J0LndpZHRoKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNsaWRlc1dpZHRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSAwO1xuXG4gICAgICAgICAgICB0aGlzLiRzbGlkZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggKz0gcGFyc2VGbG9hdCgkKHRoaXMpLndpZHRoKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB3aWR0aDtcbiAgICAgICAgfSxcblxuICAgICAgICBjaGVja1NsaWRlc0ZpdEluVmlld3BvcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXdwb3J0V2lkdGggPiB0aGlzLnNsaWRlc1RvdGFsV2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNTaW5nbGVTbGlkZVdpZGVyVGhhblZpZXdwb3J0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kc2xpZGVzLmxlbmd0aCA8PSAxICYmIHRoaXMuc2xpZGVzVG90YWxXaWR0aCA+PSB0aGlzLnZpZXdwb3J0V2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNJblNpbmdsZVNsaWRlTW9kZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJyZWFrUG9pbnQgPSAodGhpcy5vcHRpb25zLnNpbmdsZVNsaWRlQnJlYWtQb2ludCBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNpbmdsZVNsaWRlQnJlYWtQb2ludCh0aGlzLiRzbGlkZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLm9wdGlvbnMuc2luZ2xlU2xpZGVCcmVha1BvaW50O1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3cG9ydFdpZHRoIDwgYnJlYWtQb2ludDtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0FGaXJzdFNsaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRUcmFja09mZnNldCgpIC0gMSA8PSB0aGlzLmdldFNsaWRlT3ZlcmZsb3codGhpcy4kc2xpZGVzLmZpcnN0KCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQXRMYXN0U2xpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0cmFja1JlbWFpbmluZyA9IHRoaXMuc2xpZGVzVG90YWxXaWR0aCAtIHRoaXMuZ2V0VHJhY2tPZmZzZXQoKSAtIDEsXG4gICAgICAgICAgICAgICAgc2xpZGVPdmVyZmxvdyA9IHRoaXMuZ2V0U2xpZGVPdmVyZmxvdyh0aGlzLiRzbGlkZXMubGFzdCgpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmlld3BvcnRXaWR0aCA+PSB0cmFja1JlbWFpbmluZyAtIHNsaWRlT3ZlcmZsb3c7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2xpZGVPdmVyZmxvdzogZnVuY3Rpb24gKCRzbGlkZSkge1xuICAgICAgICAgICAgaWYgKCRzbGlkZS53aWR0aCgpIDw9IHRoaXMudmlld3BvcnRXaWR0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKCRzbGlkZS53aWR0aCgpIC0gdGhpcy52aWV3cG9ydFdpZHRoKSAvIDI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcnVuQmVmb3JlQ2FsbGJhY2s6IGZ1bmN0aW9uIChpc05leHQpIHtcbiAgICAgICAgICAgIHZhciBiZWZvcmVDYWxsYmFjayA9IGlzTmV4dFxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMub3B0aW9ucy5vbkJlZm9yZVNsaWRlTmV4dFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMub3B0aW9ucy5vbkJlZm9yZVNsaWRlUHJldjtcblxuICAgICAgICAgICAgaWYgKGJlZm9yZUNhbGxiYWNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmVmb3JlQ2FsbGJhY2sodGhpcy4kc2xpZGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcnVuQWZ0ZXJDYWxsYmFjazogZnVuY3Rpb24gKGlzTmV4dCkge1xuICAgICAgICAgICAgdmFyIGFmdGVyQ2FsbGJhY2sgPSBpc05leHRcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm9wdGlvbnMub25BZnRlclNsaWRlTmV4dFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMub3B0aW9ucy5vbkFmdGVyU2xpZGVQcmV2O1xuXG4gICAgICAgICAgICBpZiAoYWZ0ZXJDYWxsYmFjayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgYWZ0ZXJDYWxsYmFjayh0aGlzLiRzbGlkZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICggISAkLmRhdGEodGhpcywgXCJwbHVnaW5fXCIgKyBwbHVnaW5OYW1lKSkge1xuICAgICAgICAgICAgICAgICQuZGF0YSh0aGlzLCBcInBsdWdpbl9cIiArIHBsdWdpbk5hbWUsXG4gICAgICAgICAgICAgICAgbmV3IFBsdWdpbih0aGlzLCBvcHRpb25zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvanMvc2xpZGVyLmpzIiwiLyohXG4gKiBqUXVlcnkgTW9iaWxlIEV2ZW50c1xuICogYnkgQmVuIE1ham9yIChsaW5jd2ViIC0gd3d3LmxpbmN3ZWIuY28udWspXG4gKlxuICogQ29weXJpZ2h0IDIwMTEtMjAxNSwgQmVuIE1ham9yXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2U6XG4gKiBcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKiBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuKGZ1bmN0aW9uICgkKSB7XG4gICAgJC5hdHRyRm4gPSAkLmF0dHJGbiB8fCB7fTtcblxuICAgIC8vIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSBpc24ndCByZWxpYWJsZSBmb3IgQ2hyb21lIGluc3RhbGxzXG4gICAgLy8gb24gbW9iaWxlIGRldmljZXMuIEFzIHN1Y2gsIHdlIHdpbGwgY3JlYXRlIGEgYm9vbGVhbiBpc0Nocm9tZURlc2t0b3BcbiAgICAvLyBUaGUgcmVhc29uIHRoYXQgd2UgbmVlZCB0byBkbyB0aGlzIGlzIGJlY2F1c2UgQ2hyb21lIGFubm95aW5nbHlcbiAgICAvLyBwdXJwb3J0cyBzdXBwb3J0IGZvciB0b3VjaCBldmVudHMgZXZlbiBpZiB0aGUgdW5kZXJseWluZyBoYXJkd2FyZVxuICAgIC8vIGRvZXMgbm90IVxuICAgIHZhciBhZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgaXNDaHJvbWVEZXNrdG9wID0gKGFnZW50LmluZGV4T2YoJ2Nocm9tZScpID4gLTEgJiYgKChhZ2VudC5pbmRleE9mKCd3aW5kb3dzJykgPiAtMSkgfHwgKGFnZW50LmluZGV4T2YoJ21hY2ludG9zaCcpID4gLTEpIHx8IChhZ2VudC5pbmRleE9mKCdsaW51eCcpID4gLTEpKSAmJiBhZ2VudC5pbmRleE9mKCdtb2JpbGUnKSA8IDAgJiYgYWdlbnQuaW5kZXhPZignYW5kcm9pZCcpIDwgMCksXG5cbiAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICB0YXBfcGl4ZWxfcmFuZ2U6IDUsXG4gICAgICAgICAgICBzd2lwZV9oX3RocmVzaG9sZDogNTAsXG4gICAgICAgICAgICBzd2lwZV92X3RocmVzaG9sZDogNTAsXG4gICAgICAgICAgICB0YXBob2xkX3RocmVzaG9sZDogNzUwLFxuICAgICAgICAgICAgZG91YmxldGFwX2ludDogNTAwLFxuXG4gICAgICAgICAgICB0b3VjaF9jYXBhYmxlOiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93ICYmICFpc0Nocm9tZURlc2t0b3ApLFxuICAgICAgICAgICAgb3JpZW50YXRpb25fc3VwcG9ydDogKCdvcmllbnRhdGlvbicgaW4gd2luZG93ICYmICdvbm9yaWVudGF0aW9uY2hhbmdlJyBpbiB3aW5kb3cpLFxuXG4gICAgICAgICAgICBzdGFydGV2ZW50OiAgKCgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgJiYgIWlzQ2hyb21lRGVza3RvcCkgPyAndG91Y2hzdGFydCcgOiAnbW91c2Vkb3duJyksXG4gICAgICAgICAgICBlbmRldmVudDogICAgKCgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgJiYgIWlzQ2hyb21lRGVza3RvcCkgPyAndG91Y2hlbmQnIDogJ21vdXNldXAnKSxcbiAgICAgICAgICAgIG1vdmVldmVudDogICAoKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyAmJiAhaXNDaHJvbWVEZXNrdG9wKSA/ICd0b3VjaG1vdmUnIDogJ21vdXNlbW92ZScpLFxuICAgICAgICAgICAgdGFwZXZlbnQ6ICAgICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgJiYgIWlzQ2hyb21lRGVza3RvcCkgPyAndGFwJyA6ICdjbGljaycsXG4gICAgICAgICAgICBzY3JvbGxldmVudDogKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyAmJiAhaXNDaHJvbWVEZXNrdG9wKSA/ICd0b3VjaG1vdmUnIDogJ3Njcm9sbCcsXG5cbiAgICAgICAgICAgIGhvbGRfdGltZXI6IG51bGwsXG4gICAgICAgICAgICB0YXBfdGltZXI6IG51bGxcbiAgICAgICAgfTtcbiAgICBcbiAgICAvLyBDb252ZW5pZW5jZSBmdW5jdGlvbnM6XG4gICAgJC5pc1RvdWNoQ2FwYWJsZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc2V0dGluZ3MudG91Y2hfY2FwYWJsZTsgfTtcbiAgICAkLmdldFN0YXJ0RXZlbnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNldHRpbmdzLnN0YXJ0ZXZlbnQ7IH07XG4gICAgJC5nZXRFbmRFdmVudCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc2V0dGluZ3MuZW5kZXZlbnQ7IH07XG4gICAgJC5nZXRNb3ZlRXZlbnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNldHRpbmdzLm1vdmVldmVudDsgfTtcbiAgICAkLmdldFRhcEV2ZW50ID0gZnVuY3Rpb24oKSB7IHJldHVybiBzZXR0aW5ncy50YXBldmVudDsgfTtcbiAgICAkLmdldFNjcm9sbEV2ZW50ID0gZnVuY3Rpb24oKSB7IHJldHVybiBzZXR0aW5ncy5zY3JvbGxldmVudDsgfTtcbiAgICBcbiAgICAvLyBBZGQgRXZlbnQgc2hvcnRjdXRzOlxuICAgICQuZWFjaChbJ3RhcHN0YXJ0JywgJ3RhcGVuZCcsICd0YXBtb3ZlJywgJ3RhcCcsICd0YXAyJywgJ3RhcDMnLCAndGFwNCcsICdzaW5nbGV0YXAnLCAnZG91YmxldGFwJywgJ3RhcGhvbGQnLCAnc3dpcGUnLCAnc3dpcGV1cCcsICdzd2lwZXJpZ2h0JywgJ3N3aXBlZG93bicsICdzd2lwZWxlZnQnLCAnc3dpcGVlbmQnLCAnc2Nyb2xsc3RhcnQnLCAnc2Nyb2xsZW5kJywgJ29yaWVudGF0aW9uY2hhbmdlJ10sIGZ1bmN0aW9uIChpLCBuYW1lKSB7XG4gICAgICAgICQuZm5bbmFtZV0gPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBmbiA/IHRoaXMub24obmFtZSwgZm4pIDogdGhpcy50cmlnZ2VyKG5hbWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgICQuYXR0ckZuW25hbWVdID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIC8vIHRhcHN0YXJ0IEV2ZW50OlxuICAgICQuZXZlbnQuc3BlY2lhbC50YXBzdGFydCA9IHtcbiAgICAgICAgc2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFxuICAgICAgICAgICAgdmFyIHRoaXNPYmplY3QgPSB0aGlzLFxuICAgICAgICAgICAgICAgICR0aGlzID0gJCh0aGlzT2JqZWN0KTtcblx0XHRcdFxuICAgICAgICAgICAgJHRoaXMub24oc2V0dGluZ3Muc3RhcnRldmVudCwgZnVuY3Rpb24gdGFwU3RhcnRGdW5jKGUpIHtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnY2FsbGVlJywgdGFwU3RhcnRGdW5jKTtcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCAmJiBlLndoaWNoICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgb3JpZ0V2ZW50ID0gZS5vcmlnaW5hbEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICB0b3VjaERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAncG9zaXRpb24nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiAoKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gb3JpZ0V2ZW50LnRvdWNoZXNbMF0uc2NyZWVuWCA6IGUuc2NyZWVuWCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQudG91Y2hlc1swXS5zY3JlZW5ZIDogZS5zY3JlZW5ZXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29mZnNldCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneCc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IE1hdGgucm91bmQob3JpZ0V2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIC0gJHRoaXMub2Zmc2V0KCkubGVmdCkgOiBNYXRoLnJvdW5kKGUucGFnZVggLSAkdGhpcy5vZmZzZXQoKS5sZWZ0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneSc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IE1hdGgucm91bmQob3JpZ0V2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZIC0gJHRoaXMub2Zmc2V0KCkudG9wKSA6IE1hdGgucm91bmQoZS5wYWdlWSAtICR0aGlzLm9mZnNldCgpLnRvcClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAndGltZSc6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAndGFyZ2V0JzogZS50YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgfTtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgdHJpZ2dlckN1c3RvbUV2ZW50KHRoaXNPYmplY3QsICd0YXBzdGFydCcsIGUsIHRvdWNoRGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICQodGhpcykub2ZmKHNldHRpbmdzLnN0YXJ0ZXZlbnQsICQodGhpcykuZGF0YS5jYWxsZWUpO1xuICAgICAgICB9XG4gICAgfTtcblx0XG4gICAgLy8gdGFwbW92ZSBFdmVudDpcbiAgICAkLmV2ZW50LnNwZWNpYWwudGFwbW92ZSA9IHtcbiAgICBcdHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGlzT2JqZWN0ID0gdGhpcyxcbiAgICAgICAgICAgICR0aGlzID0gJCh0aGlzT2JqZWN0KTtcbiAgICBcdFx0XHRcbiAgICAgICAgICAgICR0aGlzLm9uKHNldHRpbmdzLm1vdmVldmVudCwgZnVuY3Rpb24gdGFwTW92ZUZ1bmMoZSkge1xuICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ2NhbGxlZScsIHRhcE1vdmVGdW5jKTtcbiAgICBcdFx0XHRcbiAgICAgICAgICAgICAgICB2YXIgb3JpZ0V2ZW50ID0gZS5vcmlnaW5hbEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICB0b3VjaERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAncG9zaXRpb24nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiAoKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gb3JpZ0V2ZW50LnRvdWNoZXNbMF0uc2NyZWVuWCA6IGUuc2NyZWVuWCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQudG91Y2hlc1swXS5zY3JlZW5ZIDogZS5zY3JlZW5ZXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29mZnNldCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneCc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IE1hdGgucm91bmQob3JpZ0V2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIC0gJHRoaXMub2Zmc2V0KCkubGVmdCkgOiBNYXRoLnJvdW5kKGUucGFnZVggLSAkdGhpcy5vZmZzZXQoKS5sZWZ0KSxcblx0XHRcdFx0XHRcdFx0J3knOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBNYXRoLnJvdW5kKG9yaWdFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWSAtICR0aGlzLm9mZnNldCgpLnRvcCkgOiBNYXRoLnJvdW5kKGUucGFnZVkgLSAkdGhpcy5vZmZzZXQoKS50b3ApXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RpbWUnOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RhcmdldCc6IGUudGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgXHRcdFx0XHRcbiAgICAgICAgICAgICAgICB0cmlnZ2VyQ3VzdG9tRXZlbnQodGhpc09iamVjdCwgJ3RhcG1vdmUnLCBlLCB0b3VjaERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMpLm9mZihzZXR0aW5ncy5tb3ZlZXZlbnQsICQodGhpcykuZGF0YS5jYWxsZWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHRhcGVuZCBFdmVudDpcbiAgICAkLmV2ZW50LnNwZWNpYWwudGFwZW5kID0ge1xuICAgICAgICBzZXR1cDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoaXNPYmplY3QgPSB0aGlzLFxuICAgICAgICAgICAgICAgICR0aGlzID0gJCh0aGlzT2JqZWN0KTtcblxuICAgICAgICAgICAgJHRoaXMub24oc2V0dGluZ3MuZW5kZXZlbnQsIGZ1bmN0aW9uIHRhcEVuZEZ1bmMoZSkge1xuICAgICAgICAgICAgICAgIC8vIFRvdWNoIGV2ZW50IGRhdGE6XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnY2FsbGVlJywgdGFwRW5kRnVuYyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgb3JpZ0V2ZW50ID0gZS5vcmlnaW5hbEV2ZW50O1xuICAgICAgICAgICAgICAgIHZhciB0b3VjaERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICdwb3NpdGlvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd4JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gb3JpZ0V2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnNjcmVlblggOiBlLnNjcmVlblgsXG4gICAgICAgICAgICAgICAgICAgICAgICAneSc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IG9yaWdFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5zY3JlZW5ZIDogZS5zY3JlZW5ZXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdvZmZzZXQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAneCc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IE1hdGgucm91bmQob3JpZ0V2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIC0gJHRoaXMub2Zmc2V0KCkubGVmdCkgOiBNYXRoLnJvdW5kKGUucGFnZVggLSAkdGhpcy5vZmZzZXQoKS5sZWZ0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd5JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkgLSAkdGhpcy5vZmZzZXQoKS50b3ApIDogTWF0aC5yb3VuZChlLnBhZ2VZIC0gJHRoaXMub2Zmc2V0KCkudG9wKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAndGltZSc6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICd0YXJnZXQnOiBlLnRhcmdldFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdHJpZ2dlckN1c3RvbUV2ZW50KHRoaXNPYmplY3QsICd0YXBlbmQnLCBlLCB0b3VjaERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5vZmYoc2V0dGluZ3MuZW5kZXZlbnQsICQodGhpcykuZGF0YS5jYWxsZWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHRhcGhvbGQgRXZlbnQ6XG4gICAgJC5ldmVudC5zcGVjaWFsLnRhcGhvbGQgPSB7XG4gICAgICAgIHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhpc09iamVjdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJHRoaXMgPSAkKHRoaXNPYmplY3QpLFxuICAgICAgICAgICAgICAgIG9yaWdUYXJnZXQsXG4gICAgICAgICAgICAgICAgc3RhcnRfcG9zID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmRfeCA9IDAsXG4gICAgICAgICAgICAgICAgZW5kX3kgPSAwO1xuXG4gICAgICAgICAgICAkdGhpcy5vbihzZXR0aW5ncy5zdGFydGV2ZW50LCBmdW5jdGlvbiB0YXBIb2xkRnVuYzEoZSkge1xuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoICYmIGUud2hpY2ggIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ3RhcGhlbGQnLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdUYXJnZXQgPSBlLnRhcmdldDtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ0V2ZW50ID0gZS5vcmlnaW5hbEV2ZW50O1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRfdGltZSA9IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gb3JpZ0V2ZW50LnRvdWNoZXNbMF0uc2NyZWVuWCA6IGUuc2NyZWVuWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneSc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IG9yaWdFdmVudC50b3VjaGVzWzBdLnNjcmVlblkgOiBlLnNjcmVlbllcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydE9mZnNldCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneCc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IG9yaWdFdmVudC50b3VjaGVzWzBdLnBhZ2VYIC0gb3JpZ0V2ZW50LnRvdWNoZXNbMF0udGFyZ2V0Lm9mZnNldExlZnQgOiBlLm9mZnNldFgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQudG91Y2hlc1swXS5wYWdlWSAtIG9yaWdFdmVudC50b3VjaGVzWzBdLnRhcmdldC5vZmZzZXRUb3AgOiBlLm9mZnNldFlcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc3RhcnRfcG9zLnggPSAoZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXMpID8gZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVggOiBlLnBhZ2VYO1xuICAgICAgICAgICAgICAgICAgICBzdGFydF9wb3MueSA9IChlLm9yaWdpbmFsRXZlbnQudGFyZ2V0VG91Y2hlcykgPyBlLm9yaWdpbmFsRXZlbnQudGFyZ2V0VG91Y2hlc1swXS5wYWdlWSA6IGUucGFnZVk7XG5cbiAgICAgICAgICAgICAgICAgICAgZW5kX3ggPSBzdGFydF9wb3MueDtcbiAgICAgICAgICAgICAgICAgICAgZW5kX3kgPSBzdGFydF9wb3MueTtcblxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5ob2xkX3RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlmZl94ID0gKHN0YXJ0X3Bvcy54IC0gZW5kX3gpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZfeSA9IChzdGFydF9wb3MueSAtIGVuZF95KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0ID09IG9yaWdUYXJnZXQgJiYgKChzdGFydF9wb3MueCA9PSBlbmRfeCAmJiBzdGFydF9wb3MueSA9PSBlbmRfeSkgfHwgKGRpZmZfeCA+PSAtKHNldHRpbmdzLnRhcF9waXhlbF9yYW5nZSkgJiYgZGlmZl94IDw9IHNldHRpbmdzLnRhcF9waXhlbF9yYW5nZSAmJiBkaWZmX3kgPj0gLShzZXR0aW5ncy50YXBfcGl4ZWxfcmFuZ2UpICYmIGRpZmZfeSA8PSBzZXR0aW5ncy50YXBfcGl4ZWxfcmFuZ2UpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ3RhcGhlbGQnLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmRfdGltZSA9IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQudG91Y2hlc1swXS5zY3JlZW5YIDogZS5zY3JlZW5YLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQudG91Y2hlc1swXS5zY3JlZW5ZIDogZS5zY3JlZW5ZXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZE9mZnNldCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVggLSAkdGhpcy5vZmZzZXQoKS5sZWZ0KSA6IE1hdGgucm91bmQoZS5wYWdlWCAtICR0aGlzLm9mZnNldCgpLmxlZnQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0J3knOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBNYXRoLnJvdW5kKG9yaWdFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWSAtICR0aGlzLm9mZnNldCgpLnRvcCkgOiBNYXRoLnJvdW5kKGUucGFnZVkgLSAkdGhpcy5vZmZzZXQoKS50b3ApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gZW5kX3RpbWUgLSBzdGFydF90aW1lO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHRvdWNoIGRhdGE6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvdWNoRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N0YXJ0VGltZSc6IHN0YXJ0X3RpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdlbmRUaW1lJzogZW5kX3RpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdGFydFBvc2l0aW9uJzogc3RhcnRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N0YXJ0T2Zmc2V0Jzogc3RhcnRPZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdlbmRQb3NpdGlvbic6IGVuZFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZW5kT2Zmc2V0JzogZW5kT2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZHVyYXRpb24nOiBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RhcmdldCc6IGUudGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCdjYWxsZWUxJywgdGFwSG9sZEZ1bmMxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQ3VzdG9tRXZlbnQodGhpc09iamVjdCwgJ3RhcGhvbGQnLCBlLCB0b3VjaERhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCBzZXR0aW5ncy50YXBob2xkX3RocmVzaG9sZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkub24oc2V0dGluZ3MuZW5kZXZlbnQsIGZ1bmN0aW9uIHRhcEhvbGRGdW5jMigpIHtcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCdjYWxsZWUyJywgdGFwSG9sZEZ1bmMyKTtcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCd0YXBoZWxkJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoc2V0dGluZ3MuaG9sZF90aW1lcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uKHNldHRpbmdzLm1vdmVldmVudCwgZnVuY3Rpb24gdGFwSG9sZEZ1bmMzKGUpIHtcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCdjYWxsZWUzJywgdGFwSG9sZEZ1bmMzKTtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgZW5kX3ggPSAoZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXMpID8gZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVggOiBlLnBhZ2VYO1xuICAgICAgICAgICAgICAgIGVuZF95ID0gKGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VZIDogZS5wYWdlWTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5vZmYoc2V0dGluZ3Muc3RhcnRldmVudCwgJCh0aGlzKS5kYXRhLmNhbGxlZTEpLm9mZihzZXR0aW5ncy5lbmRldmVudCwgJCh0aGlzKS5kYXRhLmNhbGxlZTIpLm9mZihzZXR0aW5ncy5tb3ZlZXZlbnQsICQodGhpcykuZGF0YS5jYWxsZWUzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBkb3VibGV0YXAgRXZlbnQ6XG4gICAgJC5ldmVudC5zcGVjaWFsLmRvdWJsZXRhcCA9IHtcbiAgICAgICAgc2V0dXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGlzT2JqZWN0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkdGhpcyA9ICQodGhpc09iamVjdCksXG4gICAgICAgICAgICAgICAgb3JpZ1RhcmdldCxcbiAgICAgICAgICAgICAgICBhY3Rpb24sXG4gICAgICAgICAgICAgICAgZmlyc3RUYXAgPSBudWxsLFxuICAgICAgICAgICAgICAgIG9yaWdFdmVudCxcblx0XHRcdFx0Y29vbG9mZixcblx0XHRcdFx0Y29vbGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAkdGhpcy5vbihzZXR0aW5ncy5zdGFydGV2ZW50LCBmdW5jdGlvbiBkb3VibGVUYXBGdW5jMShlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggJiYgZS53aGljaCAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ2RvdWJsZXRhcHBlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBvcmlnVGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnY2FsbGVlMScsIGRvdWJsZVRhcEZ1bmMxKTtcblxuICAgICAgICAgICAgICAgIG9yaWdFdmVudCA9IGUub3JpZ2luYWxFdmVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWZpcnN0VGFwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0VGFwID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3Bvc2l0aW9uJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gb3JpZ0V2ZW50LnRvdWNoZXNbMF0uc2NyZWVuWCA6IGUuc2NyZWVuWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneSc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IG9yaWdFdmVudC50b3VjaGVzWzBdLnNjcmVlblkgOiBlLnNjcmVlbllcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAnb2Zmc2V0Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVggLSAkdGhpcy5vZmZzZXQoKS5sZWZ0KSA6IE1hdGgucm91bmQoZS5wYWdlWCAtICR0aGlzLm9mZnNldCgpLmxlZnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkgLSAkdGhpcy5vZmZzZXQoKS50b3ApIDogTWF0aC5yb3VuZChlLnBhZ2VZIC0gJHRoaXMub2Zmc2V0KCkudG9wKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0aW1lJzogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0YXJnZXQnOiBlLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSkub24oc2V0dGluZ3MuZW5kZXZlbnQsIGZ1bmN0aW9uIGRvdWJsZVRhcEZ1bmMyKGUpIHtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgdmFyIGxhc3RUb3VjaCA9ICR0aGlzLmRhdGEoJ2xhc3RUb3VjaCcpIHx8IG5vdyArIDE7XG4gICAgICAgICAgICAgICAgdmFyIGRlbHRhID0gbm93IC0gbGFzdFRvdWNoO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoYWN0aW9uKTtcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCdjYWxsZWUyJywgZG91YmxlVGFwRnVuYzIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRlbHRhIDwgc2V0dGluZ3MuZG91YmxldGFwX2ludCAmJiAoZS50YXJnZXQgPT0gb3JpZ1RhcmdldCkgJiYgZGVsdGEgPiAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnZG91YmxldGFwcGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoc2V0dGluZ3MudGFwX3RpbWVyKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBOb3cgZ2V0IHRoZSBjdXJyZW50IGV2ZW50OlxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFRhcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdwb3NpdGlvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneCc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IGUub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5zY3JlZW5YIDogZS5zY3JlZW5YLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gZS5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnNjcmVlblkgOiBlLnNjcmVlbllcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAnb2Zmc2V0Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVggLSAkdGhpcy5vZmZzZXQoKS5sZWZ0KSA6IE1hdGgucm91bmQoZS5wYWdlWCAtICR0aGlzLm9mZnNldCgpLmxlZnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkgLSAkdGhpcy5vZmZzZXQoKS50b3ApIDogTWF0aC5yb3VuZChlLnBhZ2VZIC0gJHRoaXMub2Zmc2V0KCkudG9wKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0aW1lJzogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0YXJnZXQnOiBlLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b3VjaERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnZmlyc3RUYXAnOiBmaXJzdFRhcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzZWNvbmRUYXAnOiBsYXN0VGFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ludGVydmFsJzogbGFzdFRhcC50aW1lIC0gZmlyc3RUYXAudGltZVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghY29vbGluZykge1xuICAgICAgICAgICAgICAgICAgICBcdHRyaWdnZXJDdXN0b21FdmVudCh0aGlzT2JqZWN0LCAnZG91YmxldGFwJywgZSwgdG91Y2hEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VGFwID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29vbGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb29sb2ZmID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBcdGNvb2xpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgc2V0dGluZ3MuZG91YmxldGFwX2ludCk7XG5cdFx0XHRcdFx0XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnbGFzdFRvdWNoJywgbm93KTtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RUYXAgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChhY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICB9LCBzZXR0aW5ncy5kb3VibGV0YXBfaW50LCBbZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCdsYXN0VG91Y2gnLCBub3cpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5vZmYoc2V0dGluZ3Muc3RhcnRldmVudCwgJCh0aGlzKS5kYXRhLmNhbGxlZTEpLm9mZihzZXR0aW5ncy5lbmRldmVudCwgJCh0aGlzKS5kYXRhLmNhbGxlZTIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHNpbmdsZXRhcCBFdmVudDpcbiAgICAvLyBUaGlzIGlzIHVzZWQgaW4gY29uanVjdGlvbiB3aXRoIGRvdWJsZXRhcCB3aGVuIGJvdGggZXZlbnRzIGFyZSBuZWVkZWQgb24gdGhlIHNhbWUgZWxlbWVudFxuICAgICQuZXZlbnQuc3BlY2lhbC5zaW5nbGV0YXAgPSB7XG4gICAgICAgIHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhpc09iamVjdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJHRoaXMgPSAkKHRoaXNPYmplY3QpLFxuICAgICAgICAgICAgICAgIG9yaWdUYXJnZXQgPSBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IG51bGwsXG4gICAgICAgICAgICAgICAgc3RhcnRfcG9zID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJHRoaXMub24oc2V0dGluZ3Muc3RhcnRldmVudCwgZnVuY3Rpb24gc2luZ2xlVGFwRnVuYzEoZSkge1xuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoICYmIGUud2hpY2ggIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdUYXJnZXQgPSBlLnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnY2FsbGVlMScsIHNpbmdsZVRhcEZ1bmMxKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHN0YXJ0IHggYW5kIHkgcG9zaXRpb246XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0X3Bvcy54ID0gKGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VYIDogZS5wYWdlWDtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRfcG9zLnkgPSAoZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXMpID8gZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5vbihzZXR0aW5ncy5lbmRldmVudCwgZnVuY3Rpb24gc2luZ2xlVGFwRnVuYzIoZSkge1xuICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ2NhbGxlZTInLCBzaW5nbGVUYXBGdW5jMik7XG4gICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0ID09IG9yaWdUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBlbmQgcG9pbnQ6XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmRfcG9zX3ggPSAoZS5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCA6IGUucGFnZVg7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmRfcG9zX3kgPSAoZS5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWSA6IGUucGFnZVk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRvIGNoZWNrIGlmIGl0IHdhcyBhIHRhcGhvbGQ6XG5cbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MudGFwX3RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEkdGhpcy5kYXRhKCdkb3VibGV0YXBwZWQnKSAmJiAhJHRoaXMuZGF0YSgndGFwaGVsZCcpICYmIChzdGFydF9wb3MueCA9PSBlbmRfcG9zX3gpICYmIChzdGFydF9wb3MueSA9PSBlbmRfcG9zX3kpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9yaWdFdmVudCA9IGUub3JpZ2luYWxFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG91Y2hEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncG9zaXRpb24nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAneCc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IG9yaWdFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5zY3JlZW5YIDogZS5zY3JlZW5YLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uc2NyZWVuWSA6IGUuc2NyZWVuWVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnb2Zmc2V0Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBNYXRoLnJvdW5kKG9yaWdFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCAtICR0aGlzLm9mZnNldCgpLmxlZnQpIDogTWF0aC5yb3VuZChlLnBhZ2VYIC0gJHRoaXMub2Zmc2V0KCkubGVmdCksXG5cdFx0XHRcdFx0XHRcdFx0XHQneSc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IE1hdGgucm91bmQob3JpZ0V2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZIC0gJHRoaXMub2Zmc2V0KCkudG9wKSA6IE1hdGgucm91bmQoZS5wYWdlWSAtICR0aGlzLm9mZnNldCgpLnRvcClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RpbWUnOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGFyZ2V0JzogZS50YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdhcyBpdCBhIHRhcGhvbGQ/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoKHRvdWNoRGF0YS50aW1lIC0gc3RhcnRUaW1lKSA8IHNldHRpbmdzLnRhcGhvbGRfdGhyZXNob2xkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckN1c3RvbUV2ZW50KHRoaXNPYmplY3QsICdzaW5nbGV0YXAnLCBlLCB0b3VjaERhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgc2V0dGluZ3MuZG91YmxldGFwX2ludCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLm9mZihzZXR0aW5ncy5zdGFydGV2ZW50LCAkKHRoaXMpLmRhdGEuY2FsbGVlMSkub2ZmKHNldHRpbmdzLmVuZGV2ZW50LCAkKHRoaXMpLmRhdGEuY2FsbGVlMik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gdGFwIEV2ZW50OlxuICAgICQuZXZlbnQuc3BlY2lhbC50YXAgPSB7XG4gICAgICAgIHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhpc09iamVjdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJHRoaXMgPSAkKHRoaXNPYmplY3QpLFxuICAgICAgICAgICAgICAgIHN0YXJ0ZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBvcmlnVGFyZ2V0ID0gbnVsbCxcbiAgICAgICAgICAgICAgICBzdGFydF90aW1lLFxuICAgICAgICAgICAgICAgIHN0YXJ0X3BvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG91Y2hlcztcblxuICAgICAgICAgICAgJHRoaXMub24oc2V0dGluZ3Muc3RhcnRldmVudCwgZnVuY3Rpb24gdGFwRnVuYzEoZSkge1xuICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ2NhbGxlZTEnLCB0YXBGdW5jMSk7XG5cbiAgICAgICAgICAgICAgICBpZiggZS53aGljaCAmJiBlLndoaWNoICE9PSAxIClcblx0XHRcdFx0e1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0X3Bvcy54ID0gKGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VYIDogZS5wYWdlWDtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRfcG9zLnkgPSAoZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXMpID8gZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZO1xuICAgICAgICAgICAgICAgICAgICBzdGFydF90aW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ1RhcmdldCA9IGUudGFyZ2V0O1xuXHRcdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICB0b3VjaGVzID0gKGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzIDogWyBlIF07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLm9uKHNldHRpbmdzLmVuZGV2ZW50LCBmdW5jdGlvbiB0YXBGdW5jMihlKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnY2FsbGVlMicsIHRhcEZ1bmMyKTtcblxuICAgICAgICAgICAgICAgIC8vIE9ubHkgdHJpZ2dlciBpZiB0aGV5J3ZlIHN0YXJ0ZWQsIGFuZCB0aGUgdGFyZ2V0IG1hdGNoZXM6XG4gICAgICAgICAgICAgICAgdmFyIGVuZF94ID0gKGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCA6IGUucGFnZVgsXG4gICAgICAgICAgICAgICAgICAgIGVuZF95ID0gKGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWSA6IGUucGFnZVksXG4gICAgICAgICAgICAgICAgICAgIGRpZmZfeCA9IChzdGFydF9wb3MueCAtIGVuZF94KSxcbiAgICAgICAgICAgICAgICAgICAgZGlmZl95ID0gKHN0YXJ0X3Bvcy55IC0gZW5kX3kpLFxuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU7XG5cdFx0XHRcdFx0XG4gICAgICAgICAgICAgICAgaWYgKG9yaWdUYXJnZXQgPT0gZS50YXJnZXQgJiYgc3RhcnRlZCAmJiAoKERhdGUubm93KCkgLSBzdGFydF90aW1lKSA8IHNldHRpbmdzLnRhcGhvbGRfdGhyZXNob2xkKSAmJiAoKHN0YXJ0X3Bvcy54ID09IGVuZF94ICYmIHN0YXJ0X3Bvcy55ID09IGVuZF95KSB8fCAoZGlmZl94ID49IC0oc2V0dGluZ3MudGFwX3BpeGVsX3JhbmdlKSAmJiBkaWZmX3ggPD0gc2V0dGluZ3MudGFwX3BpeGVsX3JhbmdlICYmIGRpZmZfeSA+PSAtKHNldHRpbmdzLnRhcF9waXhlbF9yYW5nZSkgJiYgZGlmZl95IDw9IHNldHRpbmdzLnRhcF9waXhlbF9yYW5nZSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvcmlnRXZlbnQgPSBlLm9yaWdpbmFsRXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0b3VjaERhdGEgPSBbIF07XG5cdFx0XHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdG91Y2hlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvdWNoID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwb3NpdGlvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbaV0uc2NyZWVuWCA6IGUuc2NyZWVuWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbaV0uc2NyZWVuWSA6IGUuc2NyZWVuWVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29mZnNldCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBNYXRoLnJvdW5kKG9yaWdFdmVudC5jaGFuZ2VkVG91Y2hlc1tpXS5wYWdlWCAtICR0aGlzLm9mZnNldCgpLmxlZnQpIDogTWF0aC5yb3VuZChlLnBhZ2VYIC0gJHRoaXMub2Zmc2V0KCkubGVmdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbaV0ucGFnZVkgLSAkdGhpcy5vZmZzZXQoKS50b3ApIDogTWF0aC5yb3VuZChlLnBhZ2VZIC0gJHRoaXMub2Zmc2V0KCkudG9wKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RpbWUnOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0YXJnZXQnOiBlLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdWNoRGF0YS5wdXNoKCB0b3VjaCApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQ3VzdG9tRXZlbnQodGhpc09iamVjdCwgJ3RhcCcsIGUsIHRvdWNoRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLm9mZihzZXR0aW5ncy5zdGFydGV2ZW50LCAkKHRoaXMpLmRhdGEuY2FsbGVlMSkub2ZmKHNldHRpbmdzLmVuZGV2ZW50LCAkKHRoaXMpLmRhdGEuY2FsbGVlMik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gc3dpcGUgRXZlbnQgKGFsc28gaGFuZGxlcyBzd2lwZXVwLCBzd2lwZXJpZ2h0LCBzd2lwZWRvd24gYW5kIHN3aXBlbGVmdCk6XG4gICAgJC5ldmVudC5zcGVjaWFsLnN3aXBlID0ge1xuICAgICAgICBzZXR1cDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoaXNPYmplY3QgPSB0aGlzLFxuICAgICAgICAgICAgICAgICR0aGlzID0gJCh0aGlzT2JqZWN0KSxcbiAgICAgICAgICAgICAgICBzdGFydGVkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgaGFzU3dpcGVkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDb29yZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmluYWxDb29yZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RhcnRFdm50O1xuXG4gICAgICAgICAgICAvLyBTY3JlZW4gdG91Y2hlZCwgc3RvcmUgdGhlIG9yaWdpbmFsIGNvb3JkaW5hdGVcblxuICAgICAgICAgICAgZnVuY3Rpb24gdG91Y2hTdGFydChlKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnY2FsbGVlMScsIHRvdWNoU3RhcnQpO1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ29vcmQueCA9IChlLm9yaWdpbmFsRXZlbnQudGFyZ2V0VG91Y2hlcykgPyBlLm9yaWdpbmFsRXZlbnQudGFyZ2V0VG91Y2hlc1swXS5wYWdlWCA6IGUucGFnZVg7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDb29yZC55ID0gKGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VZIDogZS5wYWdlWTtcbiAgICAgICAgICAgICAgICBmaW5hbENvb3JkLnggPSBvcmlnaW5hbENvb3JkLng7XG4gICAgICAgICAgICAgICAgZmluYWxDb29yZC55ID0gb3JpZ2luYWxDb29yZC55O1xuICAgICAgICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBvcmlnRXZlbnQgPSBlLm9yaWdpbmFsRXZlbnQ7XG4gICAgICAgICAgICAgICAgLy8gUmVhZCBldmVudCBkYXRhIGludG8gb3VyIHN0YXJ0RXZ0OlxuICAgICAgICAgICAgICAgIHN0YXJ0RXZudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Bvc2l0aW9uJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQudG91Y2hlc1swXS5zY3JlZW5YIDogZS5zY3JlZW5YLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQudG91Y2hlc1swXS5zY3JlZW5ZIDogZS5zY3JlZW5ZXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdvZmZzZXQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAneCc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IE1hdGgucm91bmQob3JpZ0V2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIC0gJHRoaXMub2Zmc2V0KCkubGVmdCkgOiBNYXRoLnJvdW5kKGUucGFnZVggLSAkdGhpcy5vZmZzZXQoKS5sZWZ0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd5JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkgLSAkdGhpcy5vZmZzZXQoKS50b3ApIDogTWF0aC5yb3VuZChlLnBhZ2VZIC0gJHRoaXMub2Zmc2V0KCkudG9wKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAndGltZSc6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICd0YXJnZXQnOiBlLnRhcmdldFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN0b3JlIGNvb3JkaW5hdGVzIGFzIGZpbmdlciBpcyBzd2lwaW5nXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHRvdWNoTW92ZShlKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnY2FsbGVlMicsIHRvdWNoTW92ZSk7XG4gICAgICAgICAgICAgICAgZmluYWxDb29yZC54ID0gKGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzKSA/IGUub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VYIDogZS5wYWdlWDtcbiAgICAgICAgICAgICAgICBmaW5hbENvb3JkLnkgPSAoZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXMpID8gZS5vcmlnaW5hbEV2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZO1xuXG4gICAgICAgICAgICAgICAgdmFyIHN3aXBlZGlyO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBjaGVjayBpZiB0aGUgZWxlbWVudCB0byB3aGljaCB0aGUgZXZlbnQgd2FzIGJvdW5kIGNvbnRhaW5zIGEgZGF0YS14dGhyZXNob2xkIHwgZGF0YS12dGhyZXNob2xkOlxuICAgICAgICAgICAgICAgIHZhciBlbGVfeF90aHJlc2hvbGQgPSAoJHRoaXMucGFyZW50KCkuZGF0YSgneHRocmVzaG9sZCcpKSA/ICR0aGlzLnBhcmVudCgpLmRhdGEoJ3h0aHJlc2hvbGQnKSA6ICR0aGlzLmRhdGEoJ3h0aHJlc2hvbGQnKSxcbiAgICAgICAgICAgICAgICAgICAgZWxlX3lfdGhyZXNob2xkID0gKCR0aGlzLnBhcmVudCgpLmRhdGEoJ3l0aHJlc2hvbGQnKSkgPyAkdGhpcy5wYXJlbnQoKS5kYXRhKCd5dGhyZXNob2xkJykgOiAkdGhpcy5kYXRhKCd5dGhyZXNob2xkJyksXG4gICAgICAgICAgICAgICAgICAgIGhfdGhyZXNob2xkID0gKHR5cGVvZiBlbGVfeF90aHJlc2hvbGQgIT09ICd1bmRlZmluZWQnICYmIGVsZV94X3RocmVzaG9sZCAhPT0gZmFsc2UgJiYgcGFyc2VJbnQoZWxlX3hfdGhyZXNob2xkKSkgPyBwYXJzZUludChlbGVfeF90aHJlc2hvbGQpIDogc2V0dGluZ3Muc3dpcGVfaF90aHJlc2hvbGQsXG4gICAgICAgICAgICAgICAgICAgIHZfdGhyZXNob2xkID0gKHR5cGVvZiBlbGVfeV90aHJlc2hvbGQgIT09ICd1bmRlZmluZWQnICYmIGVsZV95X3RocmVzaG9sZCAhPT0gZmFsc2UgJiYgcGFyc2VJbnQoZWxlX3lfdGhyZXNob2xkKSkgPyBwYXJzZUludChlbGVfeV90aHJlc2hvbGQpIDogc2V0dGluZ3Muc3dpcGVfdl90aHJlc2hvbGQ7IFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbENvb3JkLnkgPiBmaW5hbENvb3JkLnkgJiYgKG9yaWdpbmFsQ29vcmQueSAtIGZpbmFsQ29vcmQueSA+IHZfdGhyZXNob2xkKSkge1xuICAgICAgICAgICAgICAgICAgICBzd2lwZWRpciA9ICdzd2lwZXVwJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsQ29vcmQueCA8IGZpbmFsQ29vcmQueCAmJiAoZmluYWxDb29yZC54IC0gb3JpZ2luYWxDb29yZC54ID4gaF90aHJlc2hvbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlZGlyID0gJ3N3aXBlcmlnaHQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxDb29yZC55IDwgZmluYWxDb29yZC55ICYmIChmaW5hbENvb3JkLnkgLSBvcmlnaW5hbENvb3JkLnkgPiB2X3RocmVzaG9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpcGVkaXIgPSAnc3dpcGVkb3duJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsQ29vcmQueCA+IGZpbmFsQ29vcmQueCAmJiAob3JpZ2luYWxDb29yZC54IC0gZmluYWxDb29yZC54ID4gaF90aHJlc2hvbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlZGlyID0gJ3N3aXBlbGVmdCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzd2lwZWRpciAhPSB1bmRlZmluZWQgJiYgc3RhcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbENvb3JkLnggPSAwO1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbENvb3JkLnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmaW5hbENvb3JkLnggPSAwO1xuICAgICAgICAgICAgICAgICAgICBmaW5hbENvb3JkLnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVhZCBldmVudCBkYXRhIGludG8gb3VyIGVuZEV2bnQ6XG4gICAgICAgICAgICAgICAgICAgIHZhciBvcmlnRXZlbnQgPSBlLm9yaWdpbmFsRXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmRFdm50ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3Bvc2l0aW9uJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gb3JpZ0V2ZW50LnRvdWNoZXNbMF0uc2NyZWVuWCA6IGUuc2NyZWVuWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneSc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IG9yaWdFdmVudC50b3VjaGVzWzBdLnNjcmVlblkgOiBlLnNjcmVlbllcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAnb2Zmc2V0Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVggLSAkdGhpcy5vZmZzZXQoKS5sZWZ0KSA6IE1hdGgucm91bmQoZS5wYWdlWCAtICR0aGlzLm9mZnNldCgpLmxlZnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5JzogKHNldHRpbmdzLnRvdWNoX2NhcGFibGUpID8gTWF0aC5yb3VuZChvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkgLSAkdGhpcy5vZmZzZXQoKS50b3ApIDogTWF0aC5yb3VuZChlLnBhZ2VZIC0gJHRoaXMub2Zmc2V0KCkudG9wKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0aW1lJzogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0YXJnZXQnOiBlLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgc3dpcGUgYW1vdW50IChub3JtYWxpemVkKTpcbiAgICAgICAgICAgICAgICAgICAgdmFyIHhBbW91bnQgPSBNYXRoLmFicyhzdGFydEV2bnQucG9zaXRpb24ueCAtIGVuZEV2bnQucG9zaXRpb24ueCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5QW1vdW50ID0gTWF0aC5hYnMoc3RhcnRFdm50LnBvc2l0aW9uLnkgLSBlbmRFdm50LnBvc2l0aW9uLnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b3VjaERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnc3RhcnRFdm50Jzogc3RhcnRFdm50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2VuZEV2bnQnOiBlbmRFdm50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpcmVjdGlvbic6IHN3aXBlZGlyLnJlcGxhY2UoJ3N3aXBlJywgJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3hBbW91bnQnOiB4QW1vdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3lBbW91bnQnOiB5QW1vdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2R1cmF0aW9uJzogZW5kRXZudC50aW1lIC0gc3RhcnRFdm50LnRpbWVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaGFzU3dpcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMudHJpZ2dlcignc3dpcGUnLCB0b3VjaERhdGEpLnRyaWdnZXIoc3dpcGVkaXIsIHRvdWNoRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiB0b3VjaEVuZChlKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICAgICAgdmFyIHN3aXBlZGlyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRhKCdjYWxsZWUzJywgdG91Y2hFbmQpO1xuICAgICAgICAgICAgICAgIGlmIChoYXNTd2lwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBjaGVjayBpZiB0aGUgZWxlbWVudCB0byB3aGljaCB0aGUgZXZlbnQgd2FzIGJvdW5kIGNvbnRhaW5zIGEgZGF0YS14dGhyZXNob2xkIHwgZGF0YS12dGhyZXNob2xkOlxuICAgICAgICAgICAgICAgICAgICB2YXIgZWxlX3hfdGhyZXNob2xkID0gJHRoaXMuZGF0YSgneHRocmVzaG9sZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlX3lfdGhyZXNob2xkID0gJHRoaXMuZGF0YSgneXRocmVzaG9sZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaF90aHJlc2hvbGQgPSAodHlwZW9mIGVsZV94X3RocmVzaG9sZCAhPT0gJ3VuZGVmaW5lZCcgJiYgZWxlX3hfdGhyZXNob2xkICE9PSBmYWxzZSAmJiBwYXJzZUludChlbGVfeF90aHJlc2hvbGQpKSA/IHBhcnNlSW50KGVsZV94X3RocmVzaG9sZCkgOiBzZXR0aW5ncy5zd2lwZV9oX3RocmVzaG9sZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZfdGhyZXNob2xkID0gKHR5cGVvZiBlbGVfeV90aHJlc2hvbGQgIT09ICd1bmRlZmluZWQnICYmIGVsZV95X3RocmVzaG9sZCAhPT0gZmFsc2UgJiYgcGFyc2VJbnQoZWxlX3lfdGhyZXNob2xkKSkgPyBwYXJzZUludChlbGVfeV90aHJlc2hvbGQpIDogc2V0dGluZ3Muc3dpcGVfdl90aHJlc2hvbGQ7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9yaWdFdmVudCA9IGUub3JpZ2luYWxFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVuZEV2bnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAncG9zaXRpb24nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiAoc2V0dGluZ3MudG91Y2hfY2FwYWJsZSkgPyBvcmlnRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uc2NyZWVuWCA6IGUuc2NyZWVuWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneSc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IG9yaWdFdmVudC5jaGFuZ2VkVG91Y2hlc1swXS5zY3JlZW5ZIDogZS5zY3JlZW5ZXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ29mZnNldCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneCc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IE1hdGgucm91bmQob3JpZ0V2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIC0gJHRoaXMub2Zmc2V0KCkubGVmdCkgOiBNYXRoLnJvdW5kKGUucGFnZVggLSAkdGhpcy5vZmZzZXQoKS5sZWZ0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAneSc6IChzZXR0aW5ncy50b3VjaF9jYXBhYmxlKSA/IE1hdGgucm91bmQob3JpZ0V2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZIC0gJHRoaXMub2Zmc2V0KCkudG9wKSA6IE1hdGgucm91bmQoZS5wYWdlWSAtICR0aGlzLm9mZnNldCgpLnRvcClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAndGltZSc6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAndGFyZ2V0JzogZS50YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBSZWFkIGV2ZW50IGRhdGEgaW50byBvdXIgZW5kRXZudDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0RXZudC5wb3NpdGlvbi55ID4gZW5kRXZudC5wb3NpdGlvbi55ICYmIChzdGFydEV2bnQucG9zaXRpb24ueSAtIGVuZEV2bnQucG9zaXRpb24ueSA+IHZfdGhyZXNob2xkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpcGVkaXIgPSAnc3dpcGV1cCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0RXZudC5wb3NpdGlvbi54IDwgZW5kRXZudC5wb3NpdGlvbi54ICYmIChlbmRFdm50LnBvc2l0aW9uLnggLSBzdGFydEV2bnQucG9zaXRpb24ueCA+IGhfdGhyZXNob2xkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpcGVkaXIgPSAnc3dpcGVyaWdodCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0RXZudC5wb3NpdGlvbi55IDwgZW5kRXZudC5wb3NpdGlvbi55ICYmIChlbmRFdm50LnBvc2l0aW9uLnkgLSBzdGFydEV2bnQucG9zaXRpb24ueSA+IHZfdGhyZXNob2xkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpcGVkaXIgPSAnc3dpcGVkb3duJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRFdm50LnBvc2l0aW9uLnggPiBlbmRFdm50LnBvc2l0aW9uLnggJiYgKHN0YXJ0RXZudC5wb3NpdGlvbi54IC0gZW5kRXZudC5wb3NpdGlvbi54ID4gaF90aHJlc2hvbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2lwZWRpciA9ICdzd2lwZWxlZnQnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBzd2lwZSBhbW91bnQgKG5vcm1hbGl6ZWQpOlxuICAgICAgICAgICAgICAgICAgICB2YXIgeEFtb3VudCA9IE1hdGguYWJzKHN0YXJ0RXZudC5wb3NpdGlvbi54IC0gZW5kRXZudC5wb3NpdGlvbi54KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHlBbW91bnQgPSBNYXRoLmFicyhzdGFydEV2bnQucG9zaXRpb24ueSAtIGVuZEV2bnQucG9zaXRpb24ueSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRvdWNoRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdGFydEV2bnQnOiBzdGFydEV2bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZW5kRXZudCc6IGVuZEV2bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGlyZWN0aW9uJzogc3dpcGVkaXIucmVwbGFjZSgnc3dpcGUnLCAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAneEFtb3VudCc6IHhBbW91bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAneUFtb3VudCc6IHlBbW91bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZHVyYXRpb24nOiBlbmRFdm50LnRpbWUgLSBzdGFydEV2bnQudGltZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAkdGhpcy50cmlnZ2VyKCdzd2lwZWVuZCcsIHRvdWNoRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1N3aXBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkdGhpcy5vbihzZXR0aW5ncy5zdGFydGV2ZW50LCB0b3VjaFN0YXJ0KTtcbiAgICAgICAgICAgICR0aGlzLm9uKHNldHRpbmdzLm1vdmVldmVudCwgdG91Y2hNb3ZlKTtcbiAgICAgICAgICAgICR0aGlzLm9uKHNldHRpbmdzLmVuZGV2ZW50LCB0b3VjaEVuZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLm9mZihzZXR0aW5ncy5zdGFydGV2ZW50LCAkKHRoaXMpLmRhdGEuY2FsbGVlMSkub2ZmKHNldHRpbmdzLm1vdmVldmVudCwgJCh0aGlzKS5kYXRhLmNhbGxlZTIpLm9mZihzZXR0aW5ncy5lbmRldmVudCwgJCh0aGlzKS5kYXRhLmNhbGxlZTMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHNjcm9sbHN0YXJ0IEV2ZW50IChhbHNvIGhhbmRsZXMgc2Nyb2xsZW5kKTpcbiAgICAkLmV2ZW50LnNwZWNpYWwuc2Nyb2xsc3RhcnQgPSB7XG4gICAgICAgIHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhpc09iamVjdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJHRoaXMgPSAkKHRoaXNPYmplY3QpLFxuICAgICAgICAgICAgICAgIHNjcm9sbGluZyxcbiAgICAgICAgICAgICAgICB0aW1lcjtcblxuICAgICAgICAgICAgZnVuY3Rpb24gdHJpZ2dlcihldmVudCwgc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxpbmcgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyQ3VzdG9tRXZlbnQodGhpc09iamVjdCwgc2Nyb2xsaW5nID8gJ3Njcm9sbHN0YXJ0JyA6ICdzY3JvbGxlbmQnLCBldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlQaG9uZSB0cmlnZ2VycyBzY3JvbGwgYWZ0ZXIgYSBzbWFsbCBkZWxheTsgdXNlIHRvdWNobW92ZSBpbnN0ZWFkXG4gICAgICAgICAgICAkdGhpcy5vbihzZXR0aW5ncy5zY3JvbGxldmVudCwgZnVuY3Rpb24gc2Nyb2xsRnVuYyhldmVudCkge1xuICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ2NhbGxlZScsIHNjcm9sbEZ1bmMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFzY3JvbGxpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlcihldmVudCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyKGV2ZW50LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLm9mZihzZXR0aW5ncy5zY3JvbGxldmVudCwgJCh0aGlzKS5kYXRhLmNhbGxlZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVGhpcyBpcyB0aGUgb3JpZW50YXRpb24gY2hhbmdlIChsYXJnZWx5IGJvcnJvd2VkIGZyb20galF1ZXJ5IE1vYmlsZSk6XG4gICAgdmFyIHdpbiA9ICQod2luZG93KSxcbiAgICAgICAgc3BlY2lhbF9ldmVudCxcbiAgICAgICAgZ2V0X29yaWVudGF0aW9uLFxuICAgICAgICBsYXN0X29yaWVudGF0aW9uLFxuICAgICAgICBpbml0aWFsX29yaWVudGF0aW9uX2lzX2xhbmRzY2FwZSxcbiAgICAgICAgaW5pdGlhbF9vcmllbnRhdGlvbl9pc19kZWZhdWx0LFxuICAgICAgICBwb3J0cmFpdF9tYXAgPSB7XG4gICAgICAgICAgICAnMCc6IHRydWUsXG4gICAgICAgICAgICAnMTgwJzogdHJ1ZVxuICAgICAgICB9O1xuXG4gICAgaWYgKHNldHRpbmdzLm9yaWVudGF0aW9uX3N1cHBvcnQpIHtcbiAgICAgICAgdmFyIHd3ID0gd2luZG93LmlubmVyV2lkdGggfHwgd2luLndpZHRoKCksXG4gICAgICAgICAgICB3aCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCB3aW4uaGVpZ2h0KCksXG4gICAgICAgICAgICBsYW5kc2NhcGVfdGhyZXNob2xkID0gNTA7XG5cbiAgICAgICAgaW5pdGlhbF9vcmllbnRhdGlvbl9pc19sYW5kc2NhcGUgPSB3dyA+IHdoICYmICh3dyAtIHdoKSA+IGxhbmRzY2FwZV90aHJlc2hvbGQ7XG4gICAgICAgIGluaXRpYWxfb3JpZW50YXRpb25faXNfZGVmYXVsdCA9IHBvcnRyYWl0X21hcFt3aW5kb3cub3JpZW50YXRpb25dO1xuXG4gICAgICAgIGlmICgoaW5pdGlhbF9vcmllbnRhdGlvbl9pc19sYW5kc2NhcGUgJiYgaW5pdGlhbF9vcmllbnRhdGlvbl9pc19kZWZhdWx0KSB8fCAoIWluaXRpYWxfb3JpZW50YXRpb25faXNfbGFuZHNjYXBlICYmICFpbml0aWFsX29yaWVudGF0aW9uX2lzX2RlZmF1bHQpKSB7XG4gICAgICAgICAgICBwb3J0cmFpdF9tYXAgPSB7XG4gICAgICAgICAgICAgICAgJy05MCc6IHRydWUsXG4gICAgICAgICAgICAgICAgJzkwJzogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICQuZXZlbnQuc3BlY2lhbC5vcmllbnRhdGlvbmNoYW5nZSA9IHNwZWNpYWxfZXZlbnQgPSB7XG4gICAgICAgIHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZXZlbnQgaXMgc3VwcG9ydGVkIG5hdGl2ZWx5LCByZXR1cm4gZmFsc2Ugc28gdGhhdCBqUXVlcnlcbiAgICAgICAgICAgIC8vIHdpbGwgb24gdG8gdGhlIGV2ZW50IHVzaW5nIERPTSBtZXRob2RzLlxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLm9yaWVudGF0aW9uX3N1cHBvcnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBvcmllbnRhdGlvbiB0byBhdm9pZCBpbml0aWFsIGRvdWJsZS10cmlnZ2VyaW5nLlxuICAgICAgICAgICAgbGFzdF9vcmllbnRhdGlvbiA9IGdldF9vcmllbnRhdGlvbigpO1xuXG4gICAgICAgICAgICB3aW4ub24oJ3Rocm90dGxlZHJlc2l6ZScsIGhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3Mub3JpZW50YXRpb25fc3VwcG9ydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2luLm9mZigndGhyb3R0bGVkcmVzaXplJywgaGFuZGxlcik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgYWRkOiBmdW5jdGlvbiAoaGFuZGxlT2JqKSB7XG4gICAgICAgICAgICAvLyBTYXZlIGEgcmVmZXJlbmNlIHRvIHRoZSBib3VuZCBldmVudCBoYW5kbGVyLlxuICAgICAgICAgICAgdmFyIG9sZF9oYW5kbGVyID0gaGFuZGxlT2JqLmhhbmRsZXI7XG5cbiAgICAgICAgICAgIGhhbmRsZU9iai5oYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQub3JpZW50YXRpb24gPSBnZXRfb3JpZW50YXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2xkX2hhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gSWYgdGhlIGV2ZW50IGlzIG5vdCBzdXBwb3J0ZWQgbmF0aXZlbHksIHRoaXMgaGFuZGxlciB3aWxsIGJlIGJvdW5kIHRvXG4gICAgLy8gdGhlIHdpbmRvdyByZXNpemUgZXZlbnQgdG8gc2ltdWxhdGUgdGhlIG9yaWVudGF0aW9uY2hhbmdlIGV2ZW50LlxuXG4gICAgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IG9yaWVudGF0aW9uLlxuICAgICAgICB2YXIgb3JpZW50YXRpb24gPSBnZXRfb3JpZW50YXRpb24oKTtcblxuICAgICAgICBpZiAob3JpZW50YXRpb24gIT09IGxhc3Rfb3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIC8vIFRoZSBvcmllbnRhdGlvbiBoYXMgY2hhbmdlZCwgc28gdHJpZ2dlciB0aGUgb3JpZW50YXRpb25jaGFuZ2UgZXZlbnQuXG4gICAgICAgICAgICBsYXN0X29yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG4gICAgICAgICAgICB3aW4udHJpZ2dlcihcIm9yaWVudGF0aW9uY2hhbmdlXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJC5ldmVudC5zcGVjaWFsLm9yaWVudGF0aW9uY2hhbmdlLm9yaWVudGF0aW9uID0gZ2V0X29yaWVudGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaXNQb3J0cmFpdCA9IHRydWUsXG4gICAgICAgICAgICBlbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5vcmllbnRhdGlvbl9zdXBwb3J0KSB7XG4gICAgICAgICAgICBpc1BvcnRyYWl0ID0gcG9ydHJhaXRfbWFwW3dpbmRvdy5vcmllbnRhdGlvbl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpc1BvcnRyYWl0ID0gZWxlbSAmJiBlbGVtLmNsaWVudFdpZHRoIC8gZWxlbS5jbGllbnRIZWlnaHQgPCAxLjE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXNQb3J0cmFpdCA/ICdwb3J0cmFpdCcgOiAnbGFuZHNjYXBlJztcbiAgICB9O1xuXG4gICAgLy8gdGhyb3R0bGUgSGFuZGxlcjpcbiAgICAkLmV2ZW50LnNwZWNpYWwudGhyb3R0bGVkcmVzaXplID0ge1xuICAgICAgICBzZXR1cDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5vbigncmVzaXplJywgdGhyb3R0bGVfaGFuZGxlcik7XG4gICAgICAgIH0sXG4gICAgICAgIHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLm9mZigncmVzaXplJywgdGhyb3R0bGVfaGFuZGxlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHRocm90dGxlID0gMjUwLFxuICAgICAgICB0aHJvdHRsZV9oYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY3VyciA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBkaWZmID0gY3VyciAtIGxhc3RDYWxsO1xuXG4gICAgICAgICAgICBpZiAoZGlmZiA+PSB0aHJvdHRsZSkge1xuICAgICAgICAgICAgICAgIGxhc3RDYWxsID0gY3VycjtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ3Rocm90dGxlZHJlc2l6ZScpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChoZWxkQ2FsbCkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGhlbGRDYWxsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBQcm9taXNlIGEgaGVsZCBjYWxsIHdpbGwgc3RpbGwgZXhlY3V0ZVxuICAgICAgICAgICAgICAgIGhlbGRDYWxsID0gd2luZG93LnNldFRpbWVvdXQoaGFuZGxlciwgdGhyb3R0bGUgLSBkaWZmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbGFzdENhbGwgPSAwLFxuICAgICAgICBoZWxkQ2FsbCxcbiAgICAgICAgY3VycixcbiAgICAgICAgZGlmZjtcblxuICAgIC8vIFRyaWdnZXIgYSBjdXN0b20gZXZlbnQ6XG5cbiAgICBmdW5jdGlvbiB0cmlnZ2VyQ3VzdG9tRXZlbnQob2JqLCBldmVudFR5cGUsIGV2ZW50LCB0b3VjaERhdGEpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsVHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgICAgIGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XG5cbiAgICAgICAgJC5ldmVudC5kaXNwYXRjaC5jYWxsKG9iaiwgZXZlbnQsIHRvdWNoRGF0YSk7XG4gICAgICAgIGV2ZW50LnR5cGUgPSBvcmlnaW5hbFR5cGU7XG4gICAgfVxuXG4gICAgLy8gQ29ycmVjdGx5IG9uIGFueXRoaW5nIHdlJ3ZlIG92ZXJsb2FkZWQ6XG4gICAgJC5lYWNoKHtcbiAgICAgICAgc2Nyb2xsZW5kOiAnc2Nyb2xsc3RhcnQnLFxuICAgICAgICBzd2lwZXVwOiAnc3dpcGUnLFxuICAgICAgICBzd2lwZXJpZ2h0OiAnc3dpcGUnLFxuICAgICAgICBzd2lwZWRvd246ICdzd2lwZScsXG4gICAgICAgIHN3aXBlbGVmdDogJ3N3aXBlJyxcbiAgICAgICAgc3dpcGVlbmQ6ICdzd2lwZScsXG4gICAgICAgIHRhcDI6ICd0YXAnXG4gICAgfSwgZnVuY3Rpb24gKGUsIHNyY0UpIHtcbiAgICAgICAgJC5ldmVudC5zcGVjaWFsW2VdID0ge1xuICAgICAgICAgICAgc2V0dXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLm9uKHNyY0UsICQubm9vcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbn0oalF1ZXJ5KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYmVubWFqb3ItanF1ZXJ5LXRvdWNoLWV2ZW50cy9zcmMvanF1ZXJ5Lm1vYmlsZS1ldmVudHMuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==