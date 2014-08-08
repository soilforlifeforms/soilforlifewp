/*!
	Colorbox v1.4.33 - 2013-10-31
	jQuery lightbox and modal window plugin
	(c) 2013 Jack Moore - http://www.jacklmoore.com/colorbox
	license: http://www.opensource.org/licenses/mit-license.php
*/
(function($, document, window) {
    var // Default settings object.
    // See http://jacklmoore.com/colorbox for details.
    defaults = {
        // data sources
        html: false,
        photo: false,
        iframe: false,
        inline: false,
        // behavior and appearance
        transition: "elastic",
        speed: 300,
        fadeOut: 300,
        width: false,
        initialWidth: "600",
        innerWidth: false,
        maxWidth: false,
        height: false,
        initialHeight: "450",
        innerHeight: false,
        maxHeight: false,
        scalePhotos: true,
        scrolling: true,
        href: false,
        title: false,
        rel: false,
        opacity: .9,
        preloading: true,
        className: false,
        overlayClose: true,
        escKey: true,
        arrowKey: true,
        top: false,
        bottom: false,
        left: false,
        right: false,
        fixed: false,
        data: undefined,
        closeButton: true,
        fastIframe: true,
        open: false,
        reposition: true,
        loop: true,
        slideshow: false,
        slideshowAuto: true,
        slideshowSpeed: 2500,
        slideshowStart: "start slideshow",
        slideshowStop: "stop slideshow",
        photoRegex: /\.(gif|png|jp(e|g|eg)|bmp|ico|webp)((#|\?).*)?$/i,
        // alternate image paths for high-res displays
        retinaImage: false,
        retinaUrl: false,
        retinaSuffix: "@2x.$1",
        // internationalization
        current: "image {current} of {total}",
        previous: "previous",
        next: "next",
        close: "close",
        xhrError: "This content failed to load.",
        imgError: "This image failed to load.",
        // accessbility
        returnFocus: true,
        trapFocus: true,
        // callbacks
        onOpen: false,
        onLoad: false,
        onComplete: false,
        onCleanup: false,
        onClosed: false
    }, // Abstracting the HTML and event identifiers for easy rebranding
    colorbox = "colorbox", prefix = "cbox", boxElement = prefix + "Element", // Events
    event_open = prefix + "_open", event_load = prefix + "_load", event_complete = prefix + "_complete", event_cleanup = prefix + "_cleanup", event_closed = prefix + "_closed", event_purge = prefix + "_purge", // Cached jQuery Object Variables
    $overlay, $box, $wrap, $content, $topBorder, $leftBorder, $rightBorder, $bottomBorder, $related, $window, $loaded, $loadingBay, $loadingOverlay, $title, $current, $slideshow, $next, $prev, $close, $groupControls, $events = $("<a/>"), // $([]) would be prefered, but there is an issue with jQuery 1.4.2
    // Variables for cached values or use across multiple functions
    settings, interfaceHeight, interfaceWidth, loadedHeight, loadedWidth, element, index, photo, open, active, closing, loadingTimer, publicMethod, div = "div", className, requests = 0, previousCSS = {}, init;
    // ****************
    // HELPER FUNCTIONS
    // ****************
    // Convenience function for creating new jQuery objects
    function $tag(tag, id, css) {
        var element = document.createElement(tag);
        if (id) {
            element.id = prefix + id;
        }
        if (css) {
            element.style.cssText = css;
        }
        return $(element);
    }
    // Get the window height using innerHeight when available to avoid an issue with iOS
    // http://bugs.jquery.com/ticket/6724
    function winheight() {
        return window.innerHeight ? window.innerHeight : $(window).height();
    }
    // Determine the next and previous members in a group.
    function getIndex(increment) {
        var max = $related.length, newIndex = (index + increment) % max;
        return newIndex < 0 ? max + newIndex : newIndex;
    }
    // Convert '%' and 'px' values to integers
    function setSize(size, dimension) {
        return Math.round((/%/.test(size) ? (dimension === "x" ? $window.width() : winheight()) / 100 : 1) * parseInt(size, 10));
    }
    // Checks an href to see if it is a photo.
    // There is a force photo option (photo: true) for hrefs that cannot be matched by the regex.
    function isImage(settings, url) {
        return settings.photo || settings.photoRegex.test(url);
    }
    function retinaUrl(settings, url) {
        return settings.retinaUrl && window.devicePixelRatio > 1 ? url.replace(settings.photoRegex, settings.retinaSuffix) : url;
    }
    function trapFocus(e) {
        if ("contains" in $box[0] && !$box[0].contains(e.target)) {
            e.stopPropagation();
            $box.focus();
        }
    }
    // Assigns function results to their respective properties
    function makeSettings() {
        var i, data = $.data(element, colorbox);
        if (data == null) {
            settings = $.extend({}, defaults);
            if (console && console.log) {
                console.log("Error: cboxElement missing settings object");
            }
        } else {
            settings = $.extend({}, data);
        }
        for (i in settings) {
            if ($.isFunction(settings[i]) && i.slice(0, 2) !== "on") {
                // checks to make sure the function isn't one of the callbacks, they will be handled at the appropriate time.
                settings[i] = settings[i].call(element);
            }
        }
        settings.rel = settings.rel || element.rel || $(element).data("rel") || "nofollow";
        settings.href = settings.href || $(element).attr("href");
        settings.title = settings.title || element.title;
        if (typeof settings.href === "string") {
            settings.href = $.trim(settings.href);
        }
    }
    function trigger(event, callback) {
        // for external use
        $(document).trigger(event);
        // for internal use
        $events.triggerHandler(event);
        if ($.isFunction(callback)) {
            callback.call(element);
        }
    }
    var slideshow = function() {
        var active, className = prefix + "Slideshow_", click = "click." + prefix, timeOut;
        function clear() {
            clearTimeout(timeOut);
        }
        function set() {
            if (settings.loop || $related[index + 1]) {
                clear();
                timeOut = setTimeout(publicMethod.next, settings.slideshowSpeed);
            }
        }
        function start() {
            $slideshow.html(settings.slideshowStop).unbind(click).one(click, stop);
            $events.bind(event_complete, set).bind(event_load, clear);
            $box.removeClass(className + "off").addClass(className + "on");
        }
        function stop() {
            clear();
            $events.unbind(event_complete, set).unbind(event_load, clear);
            $slideshow.html(settings.slideshowStart).unbind(click).one(click, function() {
                publicMethod.next();
                start();
            });
            $box.removeClass(className + "on").addClass(className + "off");
        }
        function reset() {
            active = false;
            $slideshow.hide();
            clear();
            $events.unbind(event_complete, set).unbind(event_load, clear);
            $box.removeClass(className + "off " + className + "on");
        }
        return function() {
            if (active) {
                if (!settings.slideshow) {
                    $events.unbind(event_cleanup, reset);
                    reset();
                }
            } else {
                if (settings.slideshow && $related[1]) {
                    active = true;
                    $events.one(event_cleanup, reset);
                    if (settings.slideshowAuto) {
                        start();
                    } else {
                        stop();
                    }
                    $slideshow.show();
                }
            }
        };
    }();
    function launch(target) {
        if (!closing) {
            element = target;
            makeSettings();
            $related = $(element);
            index = 0;
            if (settings.rel !== "nofollow") {
                $related = $("." + boxElement).filter(function() {
                    var data = $.data(this, colorbox), relRelated;
                    if (data) {
                        relRelated = $(this).data("rel") || data.rel || this.rel;
                    }
                    return relRelated === settings.rel;
                });
                index = $related.index(element);
                // Check direct calls to Colorbox.
                if (index === -1) {
                    $related = $related.add(element);
                    index = $related.length - 1;
                }
            }
            $overlay.css({
                opacity: parseFloat(settings.opacity),
                cursor: settings.overlayClose ? "pointer" : "auto",
                visibility: "visible"
            }).show();
            if (className) {
                $box.add($overlay).removeClass(className);
            }
            if (settings.className) {
                $box.add($overlay).addClass(settings.className);
            }
            className = settings.className;
            if (settings.closeButton) {
                $close.html(settings.close).appendTo($content);
            } else {
                $close.appendTo("<div/>");
            }
            if (!open) {
                open = active = true;
                // Prevents the page-change action from queuing up if the visitor holds down the left or right keys.
                // Show colorbox so the sizes can be calculated in older versions of jQuery
                $box.css({
                    visibility: "hidden",
                    display: "block"
                });
                $loaded = $tag(div, "LoadedContent", "width:0; height:0; overflow:hidden");
                $content.css({
                    width: "",
                    height: ""
                }).append($loaded);
                // Cache values needed for size calculations
                interfaceHeight = $topBorder.height() + $bottomBorder.height() + $content.outerHeight(true) - $content.height();
                interfaceWidth = $leftBorder.width() + $rightBorder.width() + $content.outerWidth(true) - $content.width();
                loadedHeight = $loaded.outerHeight(true);
                loadedWidth = $loaded.outerWidth(true);
                // Opens inital empty Colorbox prior to content being loaded.
                settings.w = setSize(settings.initialWidth, "x");
                settings.h = setSize(settings.initialHeight, "y");
                $loaded.css({
                    width: "",
                    height: settings.h
                });
                publicMethod.position();
                trigger(event_open, settings.onOpen);
                $groupControls.add($title).hide();
                $box.focus();
                if (settings.trapFocus) {
                    // Confine focus to the modal
                    // Uses event capturing that is not supported in IE8-
                    if (document.addEventListener) {
                        document.addEventListener("focus", trapFocus, true);
                        $events.one(event_closed, function() {
                            document.removeEventListener("focus", trapFocus, true);
                        });
                    }
                }
                // Return focus on closing
                if (settings.returnFocus) {
                    $events.one(event_closed, function() {
                        $(element).focus();
                    });
                }
            }
            load();
        }
    }
    // Colorbox's markup needs to be added to the DOM prior to being called
    // so that the browser will go ahead and load the CSS background images.
    function appendHTML() {
        if (!$box && document.body) {
            init = false;
            $window = $(window);
            $box = $tag(div).attr({
                id: colorbox,
                "class": $.support.opacity === false ? prefix + "IE" : "",
                // class for optional IE8 & lower targeted CSS.
                role: "dialog",
                tabindex: "-1"
            }).hide();
            $overlay = $tag(div, "Overlay").hide();
            $loadingOverlay = $([ $tag(div, "LoadingOverlay")[0], $tag(div, "LoadingGraphic")[0] ]);
            $wrap = $tag(div, "Wrapper");
            $content = $tag(div, "Content").append($title = $tag(div, "Title"), $current = $tag(div, "Current"), $prev = $('<button type="button"/>').attr({
                id: prefix + "Previous"
            }), $next = $('<button type="button"/>').attr({
                id: prefix + "Next"
            }), $slideshow = $tag("button", "Slideshow"), $loadingOverlay);
            $close = $('<button type="button"/>').attr({
                id: prefix + "Close"
            });
            $wrap.append(// The 3x3 Grid that makes up Colorbox
            $tag(div).append($tag(div, "TopLeft"), $topBorder = $tag(div, "TopCenter"), $tag(div, "TopRight")), $tag(div, false, "clear:left").append($leftBorder = $tag(div, "MiddleLeft"), $content, $rightBorder = $tag(div, "MiddleRight")), $tag(div, false, "clear:left").append($tag(div, "BottomLeft"), $bottomBorder = $tag(div, "BottomCenter"), $tag(div, "BottomRight"))).find("div div").css({
                "float": "left"
            });
            $loadingBay = $tag(div, false, "position:absolute; width:9999px; visibility:hidden; display:none; max-width:none;");
            $groupControls = $next.add($prev).add($current).add($slideshow);
            $(document.body).append($overlay, $box.append($wrap, $loadingBay));
        }
    }
    // Add Colorbox's event bindings
    function addBindings() {
        function clickHandler(e) {
            // ignore non-left-mouse-clicks and clicks modified with ctrl / command, shift, or alt.
            // See: http://jacklmoore.com/notes/click-events/
            if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                launch(this);
            }
        }
        if ($box) {
            if (!init) {
                init = true;
                // Anonymous functions here keep the public method from being cached, thereby allowing them to be redefined on the fly.
                $next.click(function() {
                    publicMethod.next();
                });
                $prev.click(function() {
                    publicMethod.prev();
                });
                $close.click(function() {
                    publicMethod.close();
                });
                $overlay.click(function() {
                    if (settings.overlayClose) {
                        publicMethod.close();
                    }
                });
                // Key Bindings
                $(document).bind("keydown." + prefix, function(e) {
                    var key = e.keyCode;
                    if (open && settings.escKey && key === 27) {
                        e.preventDefault();
                        publicMethod.close();
                    }
                    if (open && settings.arrowKey && $related[1] && !e.altKey) {
                        if (key === 37) {
                            e.preventDefault();
                            $prev.click();
                        } else if (key === 39) {
                            e.preventDefault();
                            $next.click();
                        }
                    }
                });
                if ($.isFunction($.fn.on)) {
                    // For jQuery 1.7+
                    $(document).on("click." + prefix, "." + boxElement, clickHandler);
                } else {
                    // For jQuery 1.3.x -> 1.6.x
                    // This code is never reached in jQuery 1.9, so do not contact me about 'live' being removed.
                    // This is not here for jQuery 1.9, it's here for legacy users.
                    $("." + boxElement).live("click." + prefix, clickHandler);
                }
            }
            return true;
        }
        return false;
    }
    // Don't do anything if Colorbox already exists.
    if ($.colorbox) {
        return;
    }
    // Append the HTML when the DOM loads
    $(appendHTML);
    // ****************
    // PUBLIC FUNCTIONS
    // Usage format: $.colorbox.close();
    // Usage from within an iframe: parent.jQuery.colorbox.close();
    // ****************
    publicMethod = $.fn[colorbox] = $[colorbox] = function(options, callback) {
        var $this = this;
        options = options || {};
        appendHTML();
        if (addBindings()) {
            if ($.isFunction($this)) {
                // assume a call to $.colorbox
                $this = $("<a/>");
                options.open = true;
            } else if (!$this[0]) {
                // colorbox being applied to empty collection
                return $this;
            }
            if (callback) {
                options.onComplete = callback;
            }
            $this.each(function() {
                $.data(this, colorbox, $.extend({}, $.data(this, colorbox) || defaults, options));
            }).addClass(boxElement);
            if ($.isFunction(options.open) && options.open.call($this) || options.open) {
                launch($this[0]);
            }
        }
        return $this;
    };
    publicMethod.position = function(speed, loadedCallback) {
        var css, top = 0, left = 0, offset = $box.offset(), scrollTop, scrollLeft;
        $window.unbind("resize." + prefix);
        // remove the modal so that it doesn't influence the document width/height
        $box.css({
            top: -9e4,
            left: -9e4
        });
        scrollTop = $window.scrollTop();
        scrollLeft = $window.scrollLeft();
        if (settings.fixed) {
            offset.top -= scrollTop;
            offset.left -= scrollLeft;
            $box.css({
                position: "fixed"
            });
        } else {
            top = scrollTop;
            left = scrollLeft;
            $box.css({
                position: "absolute"
            });
        }
        // keeps the top and left positions within the browser's viewport.
        if (settings.right !== false) {
            left += Math.max($window.width() - settings.w - loadedWidth - interfaceWidth - setSize(settings.right, "x"), 0);
        } else if (settings.left !== false) {
            left += setSize(settings.left, "x");
        } else {
            left += Math.round(Math.max($window.width() - settings.w - loadedWidth - interfaceWidth, 0) / 2);
        }
        if (settings.bottom !== false) {
            top += Math.max(winheight() - settings.h - loadedHeight - interfaceHeight - setSize(settings.bottom, "y"), 0);
        } else if (settings.top !== false) {
            top += setSize(settings.top, "y");
        } else {
            top += Math.round(Math.max(winheight() - settings.h - loadedHeight - interfaceHeight, 0) / 2);
        }
        $box.css({
            top: offset.top,
            left: offset.left,
            visibility: "visible"
        });
        // this gives the wrapper plenty of breathing room so it's floated contents can move around smoothly,
        // but it has to be shrank down around the size of div#colorbox when it's done.  If not,
        // it can invoke an obscure IE bug when using iframes.
        $wrap[0].style.width = $wrap[0].style.height = "9999px";
        function modalDimensions() {
            $topBorder[0].style.width = $bottomBorder[0].style.width = $content[0].style.width = parseInt($box[0].style.width, 10) - interfaceWidth + "px";
            $content[0].style.height = $leftBorder[0].style.height = $rightBorder[0].style.height = parseInt($box[0].style.height, 10) - interfaceHeight + "px";
        }
        css = {
            width: settings.w + loadedWidth + interfaceWidth,
            height: settings.h + loadedHeight + interfaceHeight,
            top: top,
            left: left
        };
        // setting the speed to 0 if the content hasn't changed size or position
        if (speed) {
            var tempSpeed = 0;
            $.each(css, function(i) {
                if (css[i] !== previousCSS[i]) {
                    tempSpeed = speed;
                    return;
                }
            });
            speed = tempSpeed;
        }
        previousCSS = css;
        if (!speed) {
            $box.css(css);
        }
        $box.dequeue().animate(css, {
            duration: speed || 0,
            complete: function() {
                modalDimensions();
                active = false;
                // shrink the wrapper down to exactly the size of colorbox to avoid a bug in IE's iframe implementation.
                $wrap[0].style.width = settings.w + loadedWidth + interfaceWidth + "px";
                $wrap[0].style.height = settings.h + loadedHeight + interfaceHeight + "px";
                if (settings.reposition) {
                    setTimeout(function() {
                        // small delay before binding onresize due to an IE8 bug.
                        $window.bind("resize." + prefix, publicMethod.position);
                    }, 1);
                }
                if (loadedCallback) {
                    loadedCallback();
                }
            },
            step: modalDimensions
        });
    };
    publicMethod.resize = function(options) {
        var scrolltop;
        if (open) {
            options = options || {};
            if (options.width) {
                settings.w = setSize(options.width, "x") - loadedWidth - interfaceWidth;
            }
            if (options.innerWidth) {
                settings.w = setSize(options.innerWidth, "x");
            }
            $loaded.css({
                width: settings.w
            });
            if (options.height) {
                settings.h = setSize(options.height, "y") - loadedHeight - interfaceHeight;
            }
            if (options.innerHeight) {
                settings.h = setSize(options.innerHeight, "y");
            }
            if (!options.innerHeight && !options.height) {
                scrolltop = $loaded.scrollTop();
                $loaded.css({
                    height: "auto"
                });
                settings.h = $loaded.height();
            }
            $loaded.css({
                height: settings.h
            });
            if (scrolltop) {
                $loaded.scrollTop(scrolltop);
            }
            publicMethod.position(settings.transition === "none" ? 0 : settings.speed);
        }
    };
    publicMethod.prep = function(object) {
        if (!open) {
            return;
        }
        var callback, speed = settings.transition === "none" ? 0 : settings.speed;
        $loaded.empty().remove();
        // Using empty first may prevent some IE7 issues.
        $loaded = $tag(div, "LoadedContent").append(object);
        function getWidth() {
            settings.w = settings.w || $loaded.width();
            settings.w = settings.mw && settings.mw < settings.w ? settings.mw : settings.w;
            return settings.w;
        }
        function getHeight() {
            settings.h = settings.h || $loaded.height();
            settings.h = settings.mh && settings.mh < settings.h ? settings.mh : settings.h;
            return settings.h;
        }
        $loaded.hide().appendTo($loadingBay.show()).css({
            width: getWidth(),
            overflow: settings.scrolling ? "auto" : "hidden"
        }).css({
            height: getHeight()
        }).prependTo($content);
        $loadingBay.hide();
        // floating the IMG removes the bottom line-height and fixed a problem where IE miscalculates the width of the parent element as 100% of the document width.
        $(photo).css({
            "float": "none"
        });
        callback = function() {
            var total = $related.length, iframe, frameBorder = "frameBorder", allowTransparency = "allowTransparency", complete;
            if (!open) {
                return;
            }
            function removeFilter() {
                // Needed for IE7 & IE8 in versions of jQuery prior to 1.7.2
                if ($.support.opacity === false) {
                    $box[0].style.removeAttribute("filter");
                }
            }
            complete = function() {
                clearTimeout(loadingTimer);
                $loadingOverlay.hide();
                trigger(event_complete, settings.onComplete);
            };
            $title.html(settings.title).add($loaded).show();
            if (total > 1) {
                // handle grouping
                if (typeof settings.current === "string") {
                    $current.html(settings.current.replace("{current}", index + 1).replace("{total}", total)).show();
                }
                $next[settings.loop || index < total - 1 ? "show" : "hide"]().html(settings.next);
                $prev[settings.loop || index ? "show" : "hide"]().html(settings.previous);
                slideshow();
                // Preloads images within a rel group
                if (settings.preloading) {
                    $.each([ getIndex(-1), getIndex(1) ], function() {
                        var src, img, i = $related[this], data = $.data(i, colorbox);
                        if (data && data.href) {
                            src = data.href;
                            if ($.isFunction(src)) {
                                src = src.call(i);
                            }
                        } else {
                            src = $(i).attr("href");
                        }
                        if (src && isImage(data, src)) {
                            src = retinaUrl(data, src);
                            img = document.createElement("img");
                            img.src = src;
                        }
                    });
                }
            } else {
                $groupControls.hide();
            }
            if (settings.iframe) {
                iframe = $tag("iframe")[0];
                if (frameBorder in iframe) {
                    iframe[frameBorder] = 0;
                }
                if (allowTransparency in iframe) {
                    iframe[allowTransparency] = "true";
                }
                if (!settings.scrolling) {
                    iframe.scrolling = "no";
                }
                $(iframe).attr({
                    src: settings.href,
                    name: new Date().getTime(),
                    // give the iframe a unique name to prevent caching
                    "class": prefix + "Iframe",
                    allowFullScreen: true,
                    // allow HTML5 video to go fullscreen
                    webkitAllowFullScreen: true,
                    mozallowfullscreen: true
                }).one("load", complete).appendTo($loaded);
                $events.one(event_purge, function() {
                    iframe.src = "//about:blank";
                });
                if (settings.fastIframe) {
                    $(iframe).trigger("load");
                }
            } else {
                complete();
            }
            if (settings.transition === "fade") {
                $box.fadeTo(speed, 1, removeFilter);
            } else {
                removeFilter();
            }
        };
        if (settings.transition === "fade") {
            $box.fadeTo(speed, 0, function() {
                publicMethod.position(0, callback);
            });
        } else {
            publicMethod.position(speed, callback);
        }
    };
    function load() {
        var href, setResize, prep = publicMethod.prep, $inline, request = ++requests;
        active = true;
        photo = false;
        element = $related[index];
        makeSettings();
        trigger(event_purge);
        trigger(event_load, settings.onLoad);
        settings.h = settings.height ? setSize(settings.height, "y") - loadedHeight - interfaceHeight : settings.innerHeight && setSize(settings.innerHeight, "y");
        settings.w = settings.width ? setSize(settings.width, "x") - loadedWidth - interfaceWidth : settings.innerWidth && setSize(settings.innerWidth, "x");
        // Sets the minimum dimensions for use in image scaling
        settings.mw = settings.w;
        settings.mh = settings.h;
        // Re-evaluate the minimum width and height based on maxWidth and maxHeight values.
        // If the width or height exceed the maxWidth or maxHeight, use the maximum values instead.
        if (settings.maxWidth) {
            settings.mw = setSize(settings.maxWidth, "x") - loadedWidth - interfaceWidth;
            settings.mw = settings.w && settings.w < settings.mw ? settings.w : settings.mw;
        }
        if (settings.maxHeight) {
            settings.mh = setSize(settings.maxHeight, "y") - loadedHeight - interfaceHeight;
            settings.mh = settings.h && settings.h < settings.mh ? settings.h : settings.mh;
        }
        href = settings.href;
        loadingTimer = setTimeout(function() {
            $loadingOverlay.show();
        }, 100);
        if (settings.inline) {
            // Inserts an empty placeholder where inline content is being pulled from.
            // An event is bound to put inline content back when Colorbox closes or loads new content.
            $inline = $tag(div).hide().insertBefore($(href)[0]);
            $events.one(event_purge, function() {
                $inline.replaceWith($loaded.children());
            });
            prep($(href));
        } else if (settings.iframe) {
            // IFrame element won't be added to the DOM until it is ready to be displayed,
            // to avoid problems with DOM-ready JS that might be trying to run in that iframe.
            prep(" ");
        } else if (settings.html) {
            prep(settings.html);
        } else if (isImage(settings, href)) {
            href = retinaUrl(settings, href);
            photo = document.createElement("img");
            $(photo).addClass(prefix + "Photo").bind("error", function() {
                settings.title = false;
                prep($tag(div, "Error").html(settings.imgError));
            }).one("load", function() {
                var percent;
                if (request !== requests) {
                    return;
                }
                $.each([ "alt", "longdesc", "aria-describedby" ], function(i, val) {
                    var attr = $(element).attr(val) || $(element).attr("data-" + val);
                    if (attr) {
                        photo.setAttribute(val, attr);
                    }
                });
                if (settings.retinaImage && window.devicePixelRatio > 1) {
                    photo.height = photo.height / window.devicePixelRatio;
                    photo.width = photo.width / window.devicePixelRatio;
                }
                if (settings.scalePhotos) {
                    setResize = function() {
                        photo.height -= photo.height * percent;
                        photo.width -= photo.width * percent;
                    };
                    if (settings.mw && photo.width > settings.mw) {
                        percent = (photo.width - settings.mw) / photo.width;
                        setResize();
                    }
                    if (settings.mh && photo.height > settings.mh) {
                        percent = (photo.height - settings.mh) / photo.height;
                        setResize();
                    }
                }
                if (settings.h) {
                    photo.style.marginTop = Math.max(settings.mh - photo.height, 0) / 2 + "px";
                }
                if ($related[1] && (settings.loop || $related[index + 1])) {
                    photo.style.cursor = "pointer";
                    photo.onclick = function() {
                        publicMethod.next();
                    };
                }
                photo.style.width = photo.width + "px";
                photo.style.height = photo.height + "px";
                setTimeout(function() {
                    // A pause because Chrome will sometimes report a 0 by 0 size otherwise.
                    prep(photo);
                }, 1);
            });
            setTimeout(function() {
                // A pause because Opera 10.6+ will sometimes not run the onload function otherwise.
                photo.src = href;
            }, 1);
        } else if (href) {
            $loadingBay.load(href, settings.data, function(data, status) {
                if (request === requests) {
                    prep(status === "error" ? $tag(div, "Error").html(settings.xhrError) : $(this).contents());
                }
            });
        }
    }
    // Navigates to the next page/image in a set.
    publicMethod.next = function() {
        if (!active && $related[1] && (settings.loop || $related[index + 1])) {
            index = getIndex(1);
            launch($related[index]);
        }
    };
    publicMethod.prev = function() {
        if (!active && $related[1] && (settings.loop || index)) {
            index = getIndex(-1);
            launch($related[index]);
        }
    };
    // Note: to use this within an iframe use the following format: parent.jQuery.colorbox.close();
    publicMethod.close = function() {
        if (open && !closing) {
            closing = true;
            open = false;
            trigger(event_cleanup, settings.onCleanup);
            $window.unbind("." + prefix);
            $overlay.fadeTo(settings.fadeOut || 0, 0);
            $box.stop().fadeTo(settings.fadeOut || 0, 0, function() {
                $box.add($overlay).css({
                    opacity: 1,
                    cursor: "auto"
                }).hide();
                trigger(event_purge);
                $loaded.empty().remove();
                // Using empty first may prevent some IE7 issues.
                setTimeout(function() {
                    closing = false;
                    trigger(event_closed, settings.onClosed);
                }, 1);
            });
        }
    };
    // Removes changes Colorbox made to the document, but does not remove the plugin.
    publicMethod.remove = function() {
        if (!$box) {
            return;
        }
        $box.stop();
        $.colorbox.close();
        $box.stop().remove();
        $overlay.remove();
        closing = false;
        $box = null;
        $("." + boxElement).removeData(colorbox).removeClass(boxElement);
        $(document).unbind("click." + prefix);
    };
    // A method for fetching the current element Colorbox is referencing.
    // returns a jQuery object.
    publicMethod.element = function() {
        return $(element);
    };
    publicMethod.settings = defaults;
})(jQuery, document, window);

/*! Sidr - v1.2.1 - 2013-11-06
 * https://github.com/artberri/sidr
 * Copyright (c) 2013 Alberto Varela; Licensed MIT */
(function(e) {
    var t = !1, i = !1, n = {
        isUrl: function(e) {
            var t = RegExp("^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$", "i");
            return t.test(e) ? !0 : !1;
        },
        loadContent: function(e, t) {
            e.html(t);
        },
        addPrefix: function(e) {
            var t = e.attr("id"), i = e.attr("class");
            "string" == typeof t && "" !== t && e.attr("id", t.replace(/([A-Za-z0-9_.\-]+)/g, "sidr-id-$1")), 
            "string" == typeof i && "" !== i && "sidr-inner" !== i && e.attr("class", i.replace(/([A-Za-z0-9_.\-]+)/g, "sidr-class-$1")), 
            e.removeAttr("style");
        },
        execute: function(n, s, a) {
            "function" == typeof s ? (a = s, s = "sidr") : s || (s = "sidr");
            var r, d, l, c = e("#" + s), u = e(c.data("body")), f = e("html"), p = c.outerWidth(!0), g = c.data("speed"), h = c.data("side"), m = c.data("displace"), v = c.data("onOpen"), y = c.data("onClose"), x = "sidr" === s ? "sidr-open" : "sidr-open " + s + "-open";
            if ("open" === n || "toggle" === n && !c.is(":visible")) {
                if (c.is(":visible") || t) return;
                if (i !== !1) return o.close(i, function() {
                    o.open(s);
                }), void 0;
                t = !0, "left" === h ? (r = {
                    left: p + "px"
                }, d = {
                    left: "0px"
                }) : (r = {
                    right: p + "px"
                }, d = {
                    right: "0px"
                }), u.is("body") && (l = f.scrollTop(), f.css("overflow-x", "hidden").scrollTop(l)), 
                m ? u.addClass("sidr-animating").css({
                    width: u.width(),
                    position: "absolute"
                }).animate(r, g, function() {
                    e(this).addClass(x);
                }) : setTimeout(function() {
                    e(this).addClass(x);
                }, g), c.css("display", "block").animate(d, g, function() {
                    t = !1, i = s, "function" == typeof a && a(s), u.removeClass("sidr-animating");
                }), v();
            } else {
                if (!c.is(":visible") || t) return;
                t = !0, "left" === h ? (r = {
                    left: 0
                }, d = {
                    left: "-" + p + "px"
                }) : (r = {
                    right: 0
                }, d = {
                    right: "-" + p + "px"
                }), u.is("body") && (l = f.scrollTop(), f.removeAttr("style").scrollTop(l)), u.addClass("sidr-animating").animate(r, g).removeClass(x), 
                c.animate(d, g, function() {
                    c.removeAttr("style").hide(), u.removeAttr("style"), e("html").removeAttr("style"), 
                    t = !1, i = !1, "function" == typeof a && a(s), u.removeClass("sidr-animating");
                }), y();
            }
        }
    }, o = {
        open: function(e, t) {
            n.execute("open", e, t);
        },
        close: function(e, t) {
            n.execute("close", e, t);
        },
        toggle: function(e, t) {
            n.execute("toggle", e, t);
        },
        toogle: function(e, t) {
            n.execute("toggle", e, t);
        }
    };
    e.sidr = function(t) {
        return o[t] ? o[t].apply(this, Array.prototype.slice.call(arguments, 1)) : "function" != typeof t && "string" != typeof t && t ? (e.error("Method " + t + " does not exist on jQuery.sidr"), 
        void 0) : o.toggle.apply(this, arguments);
    }, e.fn.sidr = function(t) {
        var i = e.extend({
            name: "sidr",
            speed: 200,
            side: "left",
            source: null,
            renaming: !0,
            body: "body",
            displace: !0,
            onOpen: function() {},
            onClose: function() {}
        }, t), s = i.name, a = e("#" + s);
        if (0 === a.length && (a = e("<div />").attr("id", s).appendTo(e("body"))), a.addClass("sidr").addClass(i.side).data({
            speed: i.speed,
            side: i.side,
            body: i.body,
            displace: i.displace,
            onOpen: i.onOpen,
            onClose: i.onClose
        }), "function" == typeof i.source) {
            var r = i.source(s);
            n.loadContent(a, r);
        } else if ("string" == typeof i.source && n.isUrl(i.source)) e.get(i.source, function(e) {
            n.loadContent(a, e);
        }); else if ("string" == typeof i.source) {
            var d = "", l = i.source.split(",");
            if (e.each(l, function(t, i) {
                d += '<div class="sidr-inner">' + e(i).html() + "</div>";
            }), i.renaming) {
                var c = e("<div />").html(d);
                c.find("*").each(function(t, i) {
                    var o = e(i);
                    n.addPrefix(o);
                }), d = c.html();
            }
            n.loadContent(a, d);
        } else null !== i.source && e.error("Invalid Sidr Source");
        return this.each(function() {
            var t = e(this), i = t.data("sidr");
            i || (t.data("sidr", s), "ontouchstart" in document.documentElement ? (t.bind("touchstart", function(e) {
                e.originalEvent.touches[0], this.touched = e.timeStamp;
            }), t.bind("touchend", function(e) {
                var t = Math.abs(e.timeStamp - this.touched);
                200 > t && (e.preventDefault(), o.toggle(s));
            })) : t.click(function(e) {
                e.preventDefault(), o.toggle(s);
            }));
        });
    };
})(jQuery);

/* ============================================================
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * https://raw.github.com/danro/jquery-easing/master/LICENSE
 * ======================================================== */
jQuery.easing["jswing"] = jQuery.easing["swing"];

jQuery.extend(jQuery.easing, {
    // t: current time, b: begInnIng value, c: change In value, d: duration
    def: "easeOutQuad",
    swing: function(x, t, b, c, d) {
        //alert(jQuery.easing.default);
        return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
    },
    easeInQuad: function(x, t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function(x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * (--t * (t - 2) - 1) + b;
    },
    easeInCubic: function(x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function(x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function(x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function(x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function(x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function(x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function(x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function(x, t, b, c, d) {
        return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function(x, t, b, c, d) {
        return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function(x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function(x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function(x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p)) + b;
    },
    easeOutElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p) + c + b;
    },
    easeInOutElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * .3 * 1.5;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) * .5 + c + b;
    },
    easeInBack: function(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * t * t * (((s *= 1.525) + 1) * t - s) + b;
        return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function(x, t, b, c, d) {
        return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function(x, t, b, c, d) {
        if ((t /= d) < 1 / 2.75) {
            return c * 7.5625 * t * t + b;
        } else if (t < 2 / 2.75) {
            return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
        } else if (t < 2.5 / 2.75) {
            return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
        }
    },
    easeInOutBounce: function(x, t, b, c, d) {
        if (t < d / 2) return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */
/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.3
 */
(function($) {
    var selectors = [];
    var check_binded = false;
    var check_lock = false;
    var defaults = {
        interval: 250,
        force_process: false
    };
    var $window = $(window);
    var $prior_appeared;
    function process() {
        check_lock = false;
        for (var index = 0; index < selectors.length; index++) {
            var $appeared = $(selectors[index]).filter(function() {
                return $(this).is(":appeared");
            });
            $appeared.trigger("appear", [ $appeared ]);
            if ($prior_appeared) {
                var $disappeared = $prior_appeared.not($appeared);
                $disappeared.trigger("disappear", [ $disappeared ]);
            }
            $prior_appeared = $appeared;
        }
    }
    // "appeared" custom filter
    $.expr[":"]["appeared"] = function(element) {
        var $element = $(element);
        if (!$element.is(":visible")) {
            return false;
        }
        var window_left = $window.scrollLeft();
        var window_top = $window.scrollTop();
        var offset = $element.offset();
        var left = offset.left;
        var top = offset.top;
        if (top + $element.height() >= window_top && top - ($element.data("appear-top-offset") || 0) <= window_top + $window.height() && left + $element.width() >= window_left && left - ($element.data("appear-left-offset") || 0) <= window_left + $window.width()) {
            return true;
        } else {
            return false;
        }
    };
    $.fn.extend({
        // watching for element's appearance in browser viewport
        appear: function(options) {
            var opts = $.extend({}, defaults, options || {});
            var selector = this.selector || this;
            if (!check_binded) {
                var on_check = function() {
                    if (check_lock) {
                        return;
                    }
                    check_lock = true;
                    setTimeout(process, opts.interval);
                };
                $(window).scroll(on_check).resize(on_check);
                check_binded = true;
            }
            if (opts.force_process) {
                setTimeout(process, opts.interval);
            }
            selectors.push(selector);
            return $(selector);
        }
    });
    $.extend({
        // force elements's appearance check
        force_appear: function() {
            if (check_binded) {
                process();
                return true;
            }
            return false;
        }
    });
})(jQuery);

/*!
 * hoverIntent r7 // 2013.03.11 // jQuery 1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2013 Brian Cherne
 */
/* hoverIntent is similar to jQuery's built-in "hover" method except that
 * instead of firing the handlerIn function immediately, hoverIntent checks
 * to see if the user's mouse has slowed down (beneath the sensitivity
 * threshold) before firing the event. The handlerOut function is only
 * called after a matching handlerIn.
 *
 * // basic usage ... just like .hover()
 * .hoverIntent( handlerIn, handlerOut )
 * .hoverIntent( handlerInOut )
 *
 * // basic usage ... with event delegation!
 * .hoverIntent( handlerIn, handlerOut, selector )
 * .hoverIntent( handlerInOut, selector )
 *
 * // using a basic configuration object
 * .hoverIntent( config )
 *
 * @param  handlerIn   function OR configuration object
 * @param  handlerOut  function OR selector for delegation OR undefined
 * @param  selector    selector OR undefined
 * @author Brian Cherne <brian(at)cherne(dot)net>
 */
(function($) {
    $.fn.hoverIntent = function(handlerIn, handlerOut, selector) {
        // default configuration values
        var cfg = {
            interval: 100,
            sensitivity: 7,
            timeout: 0
        };
        if (typeof handlerIn === "object") {
            cfg = $.extend(cfg, handlerIn);
        } else if ($.isFunction(handlerOut)) {
            cfg = $.extend(cfg, {
                over: handlerIn,
                out: handlerOut,
                selector: selector
            });
        } else {
            cfg = $.extend(cfg, {
                over: handlerIn,
                out: handlerIn,
                selector: handlerOut
            });
        }
        // instantiate variables
        // cX, cY = current X and Y position of mouse, updated by mousemove event
        // pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
        var cX, cY, pX, pY;
        // A private function for getting mouse position
        var track = function(ev) {
            cX = ev.pageX;
            cY = ev.pageY;
        };
        // A private function for comparing current and previous mouse position
        var compare = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            // compare mouse positions to see if they've crossed the threshold
            if (Math.abs(pX - cX) + Math.abs(pY - cY) < cfg.sensitivity) {
                $(ob).off("mousemove.hoverIntent", track);
                // set hoverIntent state to true (so mouseOut can be called)
                ob.hoverIntent_s = 1;
                return cfg.over.apply(ob, [ ev ]);
            } else {
                // set previous coordinates for next time
                pX = cX;
                pY = cY;
                // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
                ob.hoverIntent_t = setTimeout(function() {
                    compare(ev, ob);
                }, cfg.interval);
            }
        };
        // A private function for delaying the mouseOut function
        var delay = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = 0;
            return cfg.out.apply(ob, [ ev ]);
        };
        // A private function for handling mouse 'hovering'
        var handleHover = function(e) {
            // copy objects to be passed into t (required for event object to be passed in IE)
            var ev = jQuery.extend({}, e);
            var ob = this;
            // cancel hoverIntent timer if it exists
            if (ob.hoverIntent_t) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            }
            // if e.type == "mouseenter"
            if (e.type == "mouseenter") {
                // set "previous" X and Y position based on initial entry point
                pX = ev.pageX;
                pY = ev.pageY;
                // update "current" X and Y position based on mousemove
                $(ob).on("mousemove.hoverIntent", track);
                // start polling interval (self-calling timeout) to compare mouse coordinates over time
                if (ob.hoverIntent_s != 1) {
                    ob.hoverIntent_t = setTimeout(function() {
                        compare(ev, ob);
                    }, cfg.interval);
                }
            } else {
                // unbind expensive mousemove event
                $(ob).off("mousemove.hoverIntent", track);
                // if hoverIntent state is true, then call the mouseOut function after the specified delay
                if (ob.hoverIntent_s == 1) {
                    ob.hoverIntent_t = setTimeout(function() {
                        delay(ev, ob);
                    }, cfg.timeout);
                }
            }
        };
        // listen for mouseenter and mouseleave
        return this.on({
            "mouseenter.hoverIntent": handleHover,
            "mouseleave.hoverIntent": handleHover
        }, cfg.selector);
    };
})(jQuery);

/*!
 * eventie v1.0.4
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 */
/*jshint browser: true, undef: true, unused: true */
/*global define: false */
(function(window) {
    "use strict";
    var docElem = document.documentElement;
    var bind = function() {};
    function getIEEvent(obj) {
        var event = window.event;
        // add event.target
        event.target = event.target || event.srcElement || obj;
        return event;
    }
    if (docElem.addEventListener) {
        bind = function(obj, type, fn) {
            obj.addEventListener(type, fn, false);
        };
    } else if (docElem.attachEvent) {
        bind = function(obj, type, fn) {
            obj[type + fn] = fn.handleEvent ? function() {
                var event = getIEEvent(obj);
                fn.handleEvent.call(fn, event);
            } : function() {
                var event = getIEEvent(obj);
                fn.call(obj, event);
            };
            obj.attachEvent("on" + type, obj[type + fn]);
        };
    }
    var unbind = function() {};
    if (docElem.removeEventListener) {
        unbind = function(obj, type, fn) {
            obj.removeEventListener(type, fn, false);
        };
    } else if (docElem.detachEvent) {
        unbind = function(obj, type, fn) {
            obj.detachEvent("on" + type, obj[type + fn]);
            try {
                delete obj[type + fn];
            } catch (err) {
                // can't delete window object properties
                obj[type + fn] = undefined;
            }
        };
    }
    var eventie = {
        bind: bind,
        unbind: unbind
    };
    // transport
    if (typeof define === "function" && define.amd) {
        // AMD
        define(eventie);
    } else {
        // browser global
        window.eventie = eventie;
    }
})(this);

// Generated by CoffeeScript 1.6.2
/*
jQuery Waypoints - v2.0.3
Copyright (c) 2011-2013 Caleb Troughton
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/
(function() {
    var __indexOf = [].indexOf || function(item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) return i;
        }
        return -1;
    }, __slice = [].slice;
    (function(root, factory) {
        if (typeof define === "function" && define.amd) {
            return define("waypoints", [ "jquery" ], function($) {
                return factory($, root);
            });
        } else {
            return factory(root.jQuery, root);
        }
    })(this, function($, window) {
        var $w, Context, Waypoint, allWaypoints, contextCounter, contextKey, contexts, isTouch, jQMethods, methods, resizeEvent, scrollEvent, waypointCounter, waypointKey, wp, wps;
        $w = $(window);
        isTouch = __indexOf.call(window, "ontouchstart") >= 0;
        allWaypoints = {
            horizontal: {},
            vertical: {}
        };
        contextCounter = 1;
        contexts = {};
        contextKey = "waypoints-context-id";
        resizeEvent = "resize.waypoints";
        scrollEvent = "scroll.waypoints";
        waypointCounter = 1;
        waypointKey = "waypoints-waypoint-ids";
        wp = "waypoint";
        wps = "waypoints";
        Context = function() {
            function Context($element) {
                var _this = this;
                this.$element = $element;
                this.element = $element[0];
                this.didResize = false;
                this.didScroll = false;
                this.id = "context" + contextCounter++;
                this.oldScroll = {
                    x: $element.scrollLeft(),
                    y: $element.scrollTop()
                };
                this.waypoints = {
                    horizontal: {},
                    vertical: {}
                };
                $element.data(contextKey, this.id);
                contexts[this.id] = this;
                $element.bind(scrollEvent, function() {
                    var scrollHandler;
                    if (!(_this.didScroll || isTouch)) {
                        _this.didScroll = true;
                        scrollHandler = function() {
                            _this.doScroll();
                            return _this.didScroll = false;
                        };
                        return window.setTimeout(scrollHandler, $[wps].settings.scrollThrottle);
                    }
                });
                $element.bind(resizeEvent, function() {
                    var resizeHandler;
                    if (!_this.didResize) {
                        _this.didResize = true;
                        resizeHandler = function() {
                            $[wps]("refresh");
                            return _this.didResize = false;
                        };
                        return window.setTimeout(resizeHandler, $[wps].settings.resizeThrottle);
                    }
                });
            }
            Context.prototype.doScroll = function() {
                var axes, _this = this;
                axes = {
                    horizontal: {
                        newScroll: this.$element.scrollLeft(),
                        oldScroll: this.oldScroll.x,
                        forward: "right",
                        backward: "left"
                    },
                    vertical: {
                        newScroll: this.$element.scrollTop(),
                        oldScroll: this.oldScroll.y,
                        forward: "down",
                        backward: "up"
                    }
                };
                if (isTouch && (!axes.vertical.oldScroll || !axes.vertical.newScroll)) {
                    $[wps]("refresh");
                }
                $.each(axes, function(aKey, axis) {
                    var direction, isForward, triggered;
                    triggered = [];
                    isForward = axis.newScroll > axis.oldScroll;
                    direction = isForward ? axis.forward : axis.backward;
                    $.each(_this.waypoints[aKey], function(wKey, waypoint) {
                        var _ref, _ref1;
                        if (axis.oldScroll < (_ref = waypoint.offset) && _ref <= axis.newScroll) {
                            return triggered.push(waypoint);
                        } else if (axis.newScroll < (_ref1 = waypoint.offset) && _ref1 <= axis.oldScroll) {
                            return triggered.push(waypoint);
                        }
                    });
                    triggered.sort(function(a, b) {
                        return a.offset - b.offset;
                    });
                    if (!isForward) {
                        triggered.reverse();
                    }
                    return $.each(triggered, function(i, waypoint) {
                        if (waypoint.options.continuous || i === triggered.length - 1) {
                            return waypoint.trigger([ direction ]);
                        }
                    });
                });
                return this.oldScroll = {
                    x: axes.horizontal.newScroll,
                    y: axes.vertical.newScroll
                };
            };
            Context.prototype.refresh = function() {
                var axes, cOffset, isWin, _this = this;
                isWin = $.isWindow(this.element);
                cOffset = this.$element.offset();
                this.doScroll();
                axes = {
                    horizontal: {
                        contextOffset: isWin ? 0 : cOffset.left,
                        contextScroll: isWin ? 0 : this.oldScroll.x,
                        contextDimension: this.$element.width(),
                        oldScroll: this.oldScroll.x,
                        forward: "right",
                        backward: "left",
                        offsetProp: "left"
                    },
                    vertical: {
                        contextOffset: isWin ? 0 : cOffset.top,
                        contextScroll: isWin ? 0 : this.oldScroll.y,
                        contextDimension: isWin ? $[wps]("viewportHeight") : this.$element.height(),
                        oldScroll: this.oldScroll.y,
                        forward: "down",
                        backward: "up",
                        offsetProp: "top"
                    }
                };
                return $.each(axes, function(aKey, axis) {
                    return $.each(_this.waypoints[aKey], function(i, waypoint) {
                        var adjustment, elementOffset, oldOffset, _ref, _ref1;
                        adjustment = waypoint.options.offset;
                        oldOffset = waypoint.offset;
                        elementOffset = $.isWindow(waypoint.element) ? 0 : waypoint.$element.offset()[axis.offsetProp];
                        if ($.isFunction(adjustment)) {
                            adjustment = adjustment.apply(waypoint.element);
                        } else if (typeof adjustment === "string") {
                            adjustment = parseFloat(adjustment);
                            if (waypoint.options.offset.indexOf("%") > -1) {
                                adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
                            }
                        }
                        waypoint.offset = elementOffset - axis.contextOffset + axis.contextScroll - adjustment;
                        if (waypoint.options.onlyOnScroll && oldOffset != null || !waypoint.enabled) {
                            return;
                        }
                        if (oldOffset !== null && oldOffset < (_ref = axis.oldScroll) && _ref <= waypoint.offset) {
                            return waypoint.trigger([ axis.backward ]);
                        } else if (oldOffset !== null && oldOffset > (_ref1 = axis.oldScroll) && _ref1 >= waypoint.offset) {
                            return waypoint.trigger([ axis.forward ]);
                        } else if (oldOffset === null && axis.oldScroll >= waypoint.offset) {
                            return waypoint.trigger([ axis.forward ]);
                        }
                    });
                });
            };
            Context.prototype.checkEmpty = function() {
                if ($.isEmptyObject(this.waypoints.horizontal) && $.isEmptyObject(this.waypoints.vertical)) {
                    this.$element.unbind([ resizeEvent, scrollEvent ].join(" "));
                    return delete contexts[this.id];
                }
            };
            return Context;
        }();
        Waypoint = function() {
            function Waypoint($element, context, options) {
                var idList, _ref;
                options = $.extend({}, $.fn[wp].defaults, options);
                if (options.offset === "bottom-in-view") {
                    options.offset = function() {
                        var contextHeight;
                        contextHeight = $[wps]("viewportHeight");
                        if (!$.isWindow(context.element)) {
                            contextHeight = context.$element.height();
                        }
                        return contextHeight - $(this).outerHeight();
                    };
                }
                this.$element = $element;
                this.element = $element[0];
                this.axis = options.horizontal ? "horizontal" : "vertical";
                this.callback = options.handler;
                this.context = context;
                this.enabled = options.enabled;
                this.id = "waypoints" + waypointCounter++;
                this.offset = null;
                this.options = options;
                context.waypoints[this.axis][this.id] = this;
                allWaypoints[this.axis][this.id] = this;
                idList = (_ref = $element.data(waypointKey)) != null ? _ref : [];
                idList.push(this.id);
                $element.data(waypointKey, idList);
            }
            Waypoint.prototype.trigger = function(args) {
                if (!this.enabled) {
                    return;
                }
                if (this.callback != null) {
                    this.callback.apply(this.element, args);
                }
                if (this.options.triggerOnce) {
                    return this.destroy();
                }
            };
            Waypoint.prototype.disable = function() {
                return this.enabled = false;
            };
            Waypoint.prototype.enable = function() {
                this.context.refresh();
                return this.enabled = true;
            };
            Waypoint.prototype.destroy = function() {
                delete allWaypoints[this.axis][this.id];
                delete this.context.waypoints[this.axis][this.id];
                return this.context.checkEmpty();
            };
            Waypoint.getWaypointsByElement = function(element) {
                var all, ids;
                ids = $(element).data(waypointKey);
                if (!ids) {
                    return [];
                }
                all = $.extend({}, allWaypoints.horizontal, allWaypoints.vertical);
                return $.map(ids, function(id) {
                    return all[id];
                });
            };
            return Waypoint;
        }();
        methods = {
            init: function(f, options) {
                var _ref;
                if (options == null) {
                    options = {};
                }
                if ((_ref = options.handler) == null) {
                    options.handler = f;
                }
                this.each(function() {
                    var $this, context, contextElement, _ref1;
                    $this = $(this);
                    contextElement = (_ref1 = options.context) != null ? _ref1 : $.fn[wp].defaults.context;
                    if (!$.isWindow(contextElement)) {
                        contextElement = $this.closest(contextElement);
                    }
                    contextElement = $(contextElement);
                    context = contexts[contextElement.data(contextKey)];
                    if (!context) {
                        context = new Context(contextElement);
                    }
                    return new Waypoint($this, context, options);
                });
                $[wps]("refresh");
                return this;
            },
            disable: function() {
                return methods._invoke(this, "disable");
            },
            enable: function() {
                return methods._invoke(this, "enable");
            },
            destroy: function() {
                return methods._invoke(this, "destroy");
            },
            prev: function(axis, selector) {
                return methods._traverse.call(this, axis, selector, function(stack, index, waypoints) {
                    if (index > 0) {
                        return stack.push(waypoints[index - 1]);
                    }
                });
            },
            next: function(axis, selector) {
                return methods._traverse.call(this, axis, selector, function(stack, index, waypoints) {
                    if (index < waypoints.length - 1) {
                        return stack.push(waypoints[index + 1]);
                    }
                });
            },
            _traverse: function(axis, selector, push) {
                var stack, waypoints;
                if (axis == null) {
                    axis = "vertical";
                }
                if (selector == null) {
                    selector = window;
                }
                waypoints = jQMethods.aggregate(selector);
                stack = [];
                this.each(function() {
                    var index;
                    index = $.inArray(this, waypoints[axis]);
                    return push(stack, index, waypoints[axis]);
                });
                return this.pushStack(stack);
            },
            _invoke: function($elements, method) {
                $elements.each(function() {
                    var waypoints;
                    waypoints = Waypoint.getWaypointsByElement(this);
                    return $.each(waypoints, function(i, waypoint) {
                        waypoint[method]();
                        return true;
                    });
                });
                return this;
            }
        };
        $.fn[wp] = function() {
            var args, method;
            method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            if (methods[method]) {
                return methods[method].apply(this, args);
            } else if ($.isFunction(method)) {
                return methods.init.apply(this, arguments);
            } else if ($.isPlainObject(method)) {
                return methods.init.apply(this, [ null, method ]);
            } else if (!method) {
                return $.error("jQuery Waypoints needs a callback function or handler option.");
            } else {
                return $.error("The " + method + " method does not exist in jQuery Waypoints.");
            }
        };
        $.fn[wp].defaults = {
            context: window,
            continuous: true,
            enabled: true,
            horizontal: false,
            offset: 0,
            triggerOnce: false
        };
        jQMethods = {
            refresh: function() {
                return $.each(contexts, function(i, context) {
                    return context.refresh();
                });
            },
            viewportHeight: function() {
                var _ref;
                return (_ref = window.innerHeight) != null ? _ref : $w.height();
            },
            aggregate: function(contextSelector) {
                var collection, waypoints, _ref;
                collection = allWaypoints;
                if (contextSelector) {
                    collection = (_ref = contexts[$(contextSelector).data(contextKey)]) != null ? _ref.waypoints : void 0;
                }
                if (!collection) {
                    return [];
                }
                waypoints = {
                    horizontal: [],
                    vertical: []
                };
                $.each(waypoints, function(axis, arr) {
                    $.each(collection[axis], function(key, waypoint) {
                        return arr.push(waypoint);
                    });
                    arr.sort(function(a, b) {
                        return a.offset - b.offset;
                    });
                    waypoints[axis] = $.map(arr, function(waypoint) {
                        return waypoint.element;
                    });
                    return waypoints[axis] = $.unique(waypoints[axis]);
                });
                return waypoints;
            },
            above: function(contextSelector) {
                if (contextSelector == null) {
                    contextSelector = window;
                }
                return jQMethods._filter(contextSelector, "vertical", function(context, waypoint) {
                    return waypoint.offset <= context.oldScroll.y;
                });
            },
            below: function(contextSelector) {
                if (contextSelector == null) {
                    contextSelector = window;
                }
                return jQMethods._filter(contextSelector, "vertical", function(context, waypoint) {
                    return waypoint.offset > context.oldScroll.y;
                });
            },
            left: function(contextSelector) {
                if (contextSelector == null) {
                    contextSelector = window;
                }
                return jQMethods._filter(contextSelector, "horizontal", function(context, waypoint) {
                    return waypoint.offset <= context.oldScroll.x;
                });
            },
            right: function(contextSelector) {
                if (contextSelector == null) {
                    contextSelector = window;
                }
                return jQMethods._filter(contextSelector, "horizontal", function(context, waypoint) {
                    return waypoint.offset > context.oldScroll.x;
                });
            },
            enable: function() {
                return jQMethods._invoke("enable");
            },
            disable: function() {
                return jQMethods._invoke("disable");
            },
            destroy: function() {
                return jQMethods._invoke("destroy");
            },
            extendFn: function(methodName, f) {
                return methods[methodName] = f;
            },
            _invoke: function(method) {
                var waypoints;
                waypoints = $.extend({}, allWaypoints.vertical, allWaypoints.horizontal);
                return $.each(waypoints, function(key, waypoint) {
                    waypoint[method]();
                    return true;
                });
            },
            _filter: function(selector, axis, test) {
                var context, waypoints;
                context = contexts[$(selector).data(contextKey)];
                if (!context) {
                    return [];
                }
                waypoints = [];
                $.each(context.waypoints[axis], function(i, waypoint) {
                    if (test(context, waypoint)) {
                        return waypoints.push(waypoint);
                    }
                });
                waypoints.sort(function(a, b) {
                    return a.offset - b.offset;
                });
                return $.map(waypoints, function(waypoint) {
                    return waypoint.element;
                });
            }
        };
        $[wps] = function() {
            var args, method;
            method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            if (jQMethods[method]) {
                return jQMethods[method].apply(null, args);
            } else {
                return jQMethods.aggregate.call(null, method);
            }
        };
        $[wps].settings = {
            resizeThrottle: 100,
            scrollThrottle: 30
        };
        return $w.load(function() {
            return $[wps]("refresh");
        });
    });
}).call(this);

/*!
 * docReady
 * Cross browser DOMContentLoaded event emitter
 */
/*jshint browser: true, strict: true, undef: true, unused: true*/
/*global define: false */
(function(window) {
    "use strict";
    var document = window.document;
    // collection of functions to be triggered on ready
    var queue = [];
    function docReady(fn) {
        // throw out non-functions
        if (typeof fn !== "function") {
            return;
        }
        if (docReady.isReady) {
            // ready now, hit it
            fn();
        } else {
            // queue function when ready
            queue.push(fn);
        }
    }
    docReady.isReady = false;
    // triggered on various doc ready events
    function init(event) {
        // bail if IE8 document is not ready just yet
        var isIE8NotReady = event.type === "readystatechange" && document.readyState !== "complete";
        if (docReady.isReady || isIE8NotReady) {
            return;
        }
        docReady.isReady = true;
        // process queue
        for (var i = 0, len = queue.length; i < len; i++) {
            var fn = queue[i];
            fn();
        }
    }
    function defineDocReady(eventie) {
        eventie.bind(document, "DOMContentLoaded", init);
        eventie.bind(document, "readystatechange", init);
        eventie.bind(window, "load", init);
        return docReady;
    }
    // transport
    if (typeof define === "function" && define.amd) {
        // AMD
        // if RequireJS, then doc is already ready
        docReady.isReady = typeof requirejs === "function";
        define([ "eventie/eventie" ], defineDocReady);
    } else {
        // browser global
        window.docReady = defineDocReady(window.eventie);
    }
})(this);

/*!
 * getStyleProperty v1.0.3
 * original by kangax
 * http://perfectionkills.com/feature-testing-css-properties/
 */
/*jshint browser: true, strict: true, undef: true */
/*global define: false, exports: false, module: false */
(function(window) {
    "use strict";
    var prefixes = "Webkit Moz ms Ms O".split(" ");
    var docElemStyle = document.documentElement.style;
    function getStyleProperty(propName) {
        if (!propName) {
            return;
        }
        // test standard property first
        if (typeof docElemStyle[propName] === "string") {
            return propName;
        }
        // capitalize
        propName = propName.charAt(0).toUpperCase() + propName.slice(1);
        // test vendor specific properties
        var prefixed;
        for (var i = 0, len = prefixes.length; i < len; i++) {
            prefixed = prefixes[i] + propName;
            if (typeof docElemStyle[prefixed] === "string") {
                return prefixed;
            }
        }
    }
    // transport
    if (typeof define === "function" && define.amd) {
        // AMD
        define(function() {
            return getStyleProperty;
        });
    } else if (typeof exports === "object") {
        // CommonJS for Component
        module.exports = getStyleProperty;
    } else {
        // browser global
        window.getStyleProperty = getStyleProperty;
    }
})(window);

/*!
 * jQuery Cookie Plugin v1.3.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function($, document, undefined) {
    var pluses = /\+/g;
    function raw(s) {
        return s;
    }
    function decoded(s) {
        return unRfc2068(decodeURIComponent(s.replace(pluses, " ")));
    }
    function unRfc2068(value) {
        if (value.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape
            value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
        }
        return value;
    }
    function fromJSON(value) {
        return config.json ? JSON.parse(value) : value;
    }
    var config = $.cookie = function(key, value, options) {
        // write
        if (value !== undefined) {
            options = $.extend({}, config.defaults, options);
            if (value === null) {
                options.expires = -1;
            }
            if (typeof options.expires === "number") {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }
            value = config.json ? JSON.stringify(value) : String(value);
            return document.cookie = [ encodeURIComponent(key), "=", config.raw ? value : encodeURIComponent(value), options.expires ? "; expires=" + options.expires.toUTCString() : "", // use expires attribute, max-age is not supported by IE
            options.path ? "; path=" + options.path : "", options.domain ? "; domain=" + options.domain : "", options.secure ? "; secure" : "" ].join("");
        }
        // read
        var decode = config.raw ? raw : decoded;
        var cookies = document.cookie.split("; ");
        var result = key ? null : {};
        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split("=");
            var name = decode(parts.shift());
            var cookie = decode(parts.join("="));
            if (key && key === name) {
                result = fromJSON(cookie);
                break;
            }
            if (!key) {
                result[name] = fromJSON(cookie);
            }
        }
        return result;
    };
    config.defaults = {};
    $.removeCookie = function(key, options) {
        if ($.cookie(key) !== null) {
            $.cookie(key, null, options);
            return true;
        }
        return false;
    };
})(jQuery, document);

/**
 * getSize v1.1.7
 * measure size of elements
 */
/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, exports: false, require: false, module: false */
(function(window, undefined) {
    "use strict";
    // -------------------------- helpers -------------------------- //
    var getComputedStyle = window.getComputedStyle;
    var getStyle = getComputedStyle ? function(elem) {
        return getComputedStyle(elem, null);
    } : function(elem) {
        return elem.currentStyle;
    };
    // get a number from a string, not a percentage
    function getStyleSize(value) {
        var num = parseFloat(value);
        // not a percent like '100%', and a number
        var isValid = value.indexOf("%") === -1 && !isNaN(num);
        return isValid && num;
    }
    // -------------------------- measurements -------------------------- //
    var measurements = [ "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth" ];
    function getZeroSize() {
        var size = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0
        };
        for (var i = 0, len = measurements.length; i < len; i++) {
            var measurement = measurements[i];
            size[measurement] = 0;
        }
        return size;
    }
    function defineGetSize(getStyleProperty) {
        // -------------------------- box sizing -------------------------- //
        var boxSizingProp = getStyleProperty("boxSizing");
        var isBoxSizeOuter;
        /**
 * WebKit measures the outer-width on style.width on border-box elems
 * IE & Firefox measures the inner-width
 */
        (function() {
            if (!boxSizingProp) {
                return;
            }
            var div = document.createElement("div");
            div.style.width = "200px";
            div.style.padding = "1px 2px 3px 4px";
            div.style.borderStyle = "solid";
            div.style.borderWidth = "1px 2px 3px 4px";
            div.style[boxSizingProp] = "border-box";
            var body = document.body || document.documentElement;
            body.appendChild(div);
            var style = getStyle(div);
            isBoxSizeOuter = getStyleSize(style.width) === 200;
            body.removeChild(div);
        })();
        // -------------------------- getSize -------------------------- //
        function getSize(elem) {
            // use querySeletor if elem is string
            if (typeof elem === "string") {
                elem = document.querySelector(elem);
            }
            // do not proceed on non-objects
            if (!elem || typeof elem !== "object" || !elem.nodeType) {
                return;
            }
            var style = getStyle(elem);
            // if hidden, everything is 0
            if (style.display === "none") {
                return getZeroSize();
            }
            var size = {};
            size.width = elem.offsetWidth;
            size.height = elem.offsetHeight;
            var isBorderBox = size.isBorderBox = !!(boxSizingProp && style[boxSizingProp] && style[boxSizingProp] === "border-box");
            // get all measurements
            for (var i = 0, len = measurements.length; i < len; i++) {
                var measurement = measurements[i];
                var value = style[measurement];
                value = mungeNonPixel(elem, value);
                var num = parseFloat(value);
                // any 'auto', 'medium' value will be 0
                size[measurement] = !isNaN(num) ? num : 0;
            }
            var paddingWidth = size.paddingLeft + size.paddingRight;
            var paddingHeight = size.paddingTop + size.paddingBottom;
            var marginWidth = size.marginLeft + size.marginRight;
            var marginHeight = size.marginTop + size.marginBottom;
            var borderWidth = size.borderLeftWidth + size.borderRightWidth;
            var borderHeight = size.borderTopWidth + size.borderBottomWidth;
            var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;
            // overwrite width and height if we can get it from style
            var styleWidth = getStyleSize(style.width);
            if (styleWidth !== false) {
                size.width = styleWidth + (// add padding and border unless it's already including it
                isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
            }
            var styleHeight = getStyleSize(style.height);
            if (styleHeight !== false) {
                size.height = styleHeight + (// add padding and border unless it's already including it
                isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
            }
            size.innerWidth = size.width - (paddingWidth + borderWidth);
            size.innerHeight = size.height - (paddingHeight + borderHeight);
            size.outerWidth = size.width + marginWidth;
            size.outerHeight = size.height + marginHeight;
            return size;
        }
        // IE8 returns percent values, not pixels
        // taken from jQuery's curCSS
        function mungeNonPixel(elem, value) {
            // IE8 and has percent value
            if (getComputedStyle || value.indexOf("%") === -1) {
                return value;
            }
            var style = elem.style;
            // Remember the original values
            var left = style.left;
            var rs = elem.runtimeStyle;
            var rsLeft = rs && rs.left;
            // Put in the new values to get a computed value out
            if (rsLeft) {
                rs.left = elem.currentStyle.left;
            }
            style.left = value;
            value = style.pixelLeft;
            // Revert the changed values
            style.left = left;
            if (rsLeft) {
                rs.left = rsLeft;
            }
            return value;
        }
        return getSize;
    }
    // transport
    if (typeof define === "function" && define.amd) {
        // AMD for RequireJS
        define([ "get-style-property/get-style-property" ], defineGetSize);
    } else if (typeof exports === "object") {
        // CommonJS for Component
        module.exports = defineGetSize(require("get-style-property"));
    } else {
        // browser global
        window.getSize = defineGetSize(window.getStyleProperty);
    }
})(window);

/*!
 * EventEmitter v4.1.1 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */
(function(exports) {
    // Place the script in strict mode
    "use strict";
    /**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class Manages event registering and emitting.
	 */
    function EventEmitter() {}
    // Shortcuts to improve speed and size
    // Easy access to the prototype
    var proto = EventEmitter.prototype, nativeIndexOf = Array.prototype.indexOf ? true : false;
    /**
	 * Finds the index of the listener for the event in it's storage array.
	 *
	 * @param {Function} listener Method to look for.
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
    function indexOfListener(listener, listeners) {
        // Return the index via the native method if possible
        if (nativeIndexOf) {
            return listeners.indexOf(listener);
        }
        // There is no native method
        // Use a manual loop to find the index
        var i = listeners.length;
        while (i--) {
            // If the listener matches, return it's index
            if (listeners[i] === listener) {
                return i;
            }
        }
        // Default to returning -1
        return -1;
    }
    /**
	 * Fetches the events object and creates one if required.
	 *
	 * @return {Object} The events storage object.
	 * @api private
	 */
    proto._getEvents = function() {
        return this._events || (this._events = {});
    };
    /**
	 * Returns the listener array for the specified event.
	 * Will initialise the event object and listener arrays if required.
	 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	 * Each property in the object response is an array of listener functions.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Function[]|Object} All listener functions for the event.
	 */
    proto.getListeners = function(evt) {
        // Create a shortcut to the storage object
        // Initialise it if it does not exists yet
        var events = this._getEvents(), response, key;
        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (typeof evt === "object") {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        } else {
            response = events[evt] || (events[evt] = []);
        }
        return response;
    };
    /**
	 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Object} All listener functions for an event in an object.
	 */
    proto.getListenersAsObject = function(evt) {
        var listeners = this.getListeners(evt), response;
        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }
        return response || listeners;
    };
    /**
	 * Adds a listener function to the specified event.
	 * The listener will not be added if it is a duplicate.
	 * If the listener returns true then it will be removed after it is called.
	 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.addListener = function(evt, listener) {
        var listeners = this.getListenersAsObject(evt), key;
        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listener, listeners[key]) === -1) {
                listeners[key].push(listener);
            }
        }
        // Return the instance of EventEmitter to allow chaining
        return this;
    };
    /**
	 * Alias of addListener
	 */
    proto.on = proto.addListener;
    /**
	 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	 * You need to tell it what event names should be matched by a regex.
	 *
	 * @param {String} evt Name of the event to create.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.defineEvent = function(evt) {
        this.getListeners(evt);
        return this;
    };
    /**
	 * Uses defineEvent to define multiple events.
	 *
	 * @param {String[]} evts An array of event names to define.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.defineEvents = function(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };
    /**
	 * Removes a listener function from the specified event.
	 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to remove the listener from.
	 * @param {Function} listener Method to remove from the event.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.removeListener = function(evt, listener) {
        var listeners = this.getListenersAsObject(evt), index, key;
        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listener, listeners[key]);
                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }
        // Return the instance of EventEmitter to allow chaining
        return this;
    };
    /**
	 * Alias of removeListener
	 */
    proto.off = proto.removeListener;
    /**
	 * Adds listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	 * You can also pass it a regular expression to add the array of listeners to all events that match it.
	 * Yeah, this function does quite a bit. That's probably a bad thing.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.addListeners = function(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };
    /**
	 * Removes listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be removed.
	 * You can also pass it a regular expression to remove the listeners from all events that match it.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.removeListeners = function(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };
    /**
	 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	 * The first argument will determine if the listeners are removed (true) or added (false).
	 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be added/removed.
	 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	 *
	 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.manipulateListeners = function(remove, evt, listeners) {
        // Initialise any required variables
        var i, value, single = remove ? this.removeListener : this.addListener, multiple = remove ? this.removeListeners : this.addListeners;
        // If evt is an object then pass each of it's properties to this method
        if (typeof evt === "object" && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === "function") {
                        single.call(this, i, value);
                    } else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        } else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }
        // Return the instance of EventEmitter to allow chaining
        return this;
    };
    /**
	 * Removes all listeners from a specified event.
	 * If you do not specify an event then all listeners will be removed.
	 * That means every event will be emptied.
	 * You can also pass a regex to remove all events that match it.
	 *
	 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.removeEvent = function(evt) {
        var type = typeof evt, events = this._getEvents(), key;
        // Remove different things depending on the state of evt
        if (type === "string") {
            // Remove all listeners for the specified event
            delete events[evt];
        } else if (type === "object") {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        } else {
            // Remove all listeners in all events
            delete this._events;
        }
        // Return the instance of EventEmitter to allow chaining
        return this;
    };
    /**
	 * Emits an event of your choice.
	 * When emitted, every listener attached to that event will be executed.
	 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	 * So they will not arrive within the array on the other side, they will be separate.
	 * You can also pass a regular expression to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {Array} [args] Optional array of arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.emitEvent = function(evt, args) {
        var listeners = this.getListenersAsObject(evt), i, key, response;
        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;
                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    response = args ? listeners[key][i].apply(null, args) : listeners[key][i]();
                    if (response === true) {
                        this.removeListener(evt, listeners[key][i]);
                    }
                }
            }
        }
        // Return the instance of EventEmitter to allow chaining
        return this;
    };
    /**
	 * Alias of emitEvent
	 */
    proto.trigger = proto.emitEvent;
    /**
	 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {...*} Optional additional arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
    proto.emit = function(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };
    // Expose the class either via AMD or the global object
    if (typeof define === "function" && define.amd) {
        define(function() {
            return EventEmitter;
        });
    } else {
        exports.EventEmitter = EventEmitter;
    }
})(this);

(function($, window, document, undefined) {
    var pluginName = "stellar", defaults = {
        scrollProperty: "scroll",
        positionProperty: "position",
        horizontalScrolling: true,
        verticalScrolling: true,
        horizontalOffset: 0,
        verticalOffset: 0,
        responsive: false,
        parallaxBackgrounds: true,
        parallaxElements: true,
        hideDistantElements: true,
        hideElement: function($elem) {
            $elem.hide();
        },
        showElement: function($elem) {
            $elem.show();
        }
    }, scrollProperty = {
        scroll: {
            getLeft: function($elem) {
                return $elem.scrollLeft();
            },
            setLeft: function($elem, val) {
                $elem.scrollLeft(val);
            },
            getTop: function($elem) {
                return $elem.scrollTop();
            },
            setTop: function($elem, val) {
                $elem.scrollTop(val);
            }
        },
        position: {
            getLeft: function($elem) {
                return parseInt($elem.css("left"), 10) * -1;
            },
            getTop: function($elem) {
                return parseInt($elem.css("top"), 10) * -1;
            }
        },
        margin: {
            getLeft: function($elem) {
                return parseInt($elem.css("margin-left"), 10) * -1;
            },
            getTop: function($elem) {
                return parseInt($elem.css("margin-top"), 10) * -1;
            }
        },
        transform: {
            getLeft: function($elem) {
                var computedTransform = getComputedStyle($elem[0])[prefixedTransform];
                return computedTransform !== "none" ? parseInt(computedTransform.match(/(-?[0-9]+)/g)[4], 10) * -1 : 0;
            },
            getTop: function($elem) {
                var computedTransform = getComputedStyle($elem[0])[prefixedTransform];
                return computedTransform !== "none" ? parseInt(computedTransform.match(/(-?[0-9]+)/g)[5], 10) * -1 : 0;
            }
        }
    }, positionProperty = {
        position: {
            setLeft: function($elem, left) {
                $elem.css("left", left);
            },
            setTop: function($elem, top) {
                $elem.css("top", top);
            }
        },
        transform: {
            setPosition: function($elem, left, startingLeft, top, startingTop) {
                $elem[0].style[prefixedTransform] = "translate3d(" + (left - startingLeft) + "px, " + (top - startingTop) + "px, 0)";
            }
        }
    }, // Returns a function which adds a vendor prefix to any CSS property name
    vendorPrefix = function() {
        var prefixes = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/, style = $("script")[0].style, prefix = "", prop;
        for (prop in style) {
            if (prefixes.test(prop)) {
                prefix = prop.match(prefixes)[0];
                break;
            }
        }
        if ("WebkitOpacity" in style) {
            prefix = "Webkit";
        }
        if ("KhtmlOpacity" in style) {
            prefix = "Khtml";
        }
        return function(property) {
            return prefix + (prefix.length > 0 ? property.charAt(0).toUpperCase() + property.slice(1) : property);
        };
    }(), prefixedTransform = vendorPrefix("transform"), supportsBackgroundPositionXY = $("<div />", {
        style: "background:#fff"
    }).css("background-position-x") !== undefined, setBackgroundPosition = supportsBackgroundPositionXY ? function($elem, x, y) {
        $elem.css({
            "background-position-x": x,
            "background-position-y": y
        });
    } : function($elem, x, y) {
        $elem.css("background-position", x + " " + y);
    }, getBackgroundPosition = supportsBackgroundPositionXY ? function($elem) {
        return [ $elem.css("background-position-x"), $elem.css("background-position-y") ];
    } : function($elem) {
        return $elem.css("background-position").split(" ");
    }, requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        setTimeout(callback, 1e3 / 60);
    };
    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    Plugin.prototype = {
        init: function() {
            this.options.name = pluginName + "_" + Math.floor(Math.random() * 1e9);
            this._defineElements();
            this._defineGetters();
            this._defineSetters();
            this._handleWindowLoadAndResize();
            this._detectViewport();
            this.refresh({
                firstLoad: true
            });
            if (this.options.scrollProperty === "scroll") {
                this._handleScrollEvent();
            } else {
                this._startAnimationLoop();
            }
        },
        _defineElements: function() {
            if (this.element === document.body) this.element = window;
            this.$scrollElement = $(this.element);
            this.$element = this.element === window ? $("body") : this.$scrollElement;
            this.$viewportElement = this.options.viewportElement !== undefined ? $(this.options.viewportElement) : this.$scrollElement[0] === window || this.options.scrollProperty === "scroll" ? this.$scrollElement : this.$scrollElement.parent();
        },
        _defineGetters: function() {
            var self = this, scrollPropertyAdapter = scrollProperty[self.options.scrollProperty];
            this._getScrollLeft = function() {
                return scrollPropertyAdapter.getLeft(self.$scrollElement);
            };
            this._getScrollTop = function() {
                return scrollPropertyAdapter.getTop(self.$scrollElement);
            };
        },
        _defineSetters: function() {
            var self = this, scrollPropertyAdapter = scrollProperty[self.options.scrollProperty], positionPropertyAdapter = positionProperty[self.options.positionProperty], setScrollLeft = scrollPropertyAdapter.setLeft, setScrollTop = scrollPropertyAdapter.setTop;
            this._setScrollLeft = typeof setScrollLeft === "function" ? function(val) {
                setScrollLeft(self.$scrollElement, val);
            } : $.noop;
            this._setScrollTop = typeof setScrollTop === "function" ? function(val) {
                setScrollTop(self.$scrollElement, val);
            } : $.noop;
            this._setPosition = positionPropertyAdapter.setPosition || function($elem, left, startingLeft, top, startingTop) {
                if (self.options.horizontalScrolling) {
                    positionPropertyAdapter.setLeft($elem, left, startingLeft);
                }
                if (self.options.verticalScrolling) {
                    positionPropertyAdapter.setTop($elem, top, startingTop);
                }
            };
        },
        _handleWindowLoadAndResize: function() {
            var self = this, $window = $(window);
            if (self.options.responsive) {
                $window.bind("load." + this.name, function() {
                    self.refresh();
                });
            }
            $window.bind("resize." + this.name, function() {
                self._detectViewport();
                if (self.options.responsive) {
                    self.refresh();
                }
            });
        },
        refresh: function(options) {
            var self = this, oldLeft = self._getScrollLeft(), oldTop = self._getScrollTop();
            if (!options || !options.firstLoad) {
                this._reset();
            }
            this._setScrollLeft(0);
            this._setScrollTop(0);
            this._setOffsets();
            this._findParticles();
            this._findBackgrounds();
            // Fix for WebKit background rendering bug
            if (options && options.firstLoad && /WebKit/.test(navigator.userAgent)) {
                $(window).load(function() {
                    var oldLeft = self._getScrollLeft(), oldTop = self._getScrollTop();
                    self._setScrollLeft(oldLeft + 1);
                    self._setScrollTop(oldTop + 1);
                    self._setScrollLeft(oldLeft);
                    self._setScrollTop(oldTop);
                });
            }
            this._setScrollLeft(oldLeft);
            this._setScrollTop(oldTop);
        },
        _detectViewport: function() {
            var viewportOffsets = this.$viewportElement.offset(), hasOffsets = viewportOffsets !== null && viewportOffsets !== undefined;
            this.viewportWidth = this.$viewportElement.width();
            this.viewportHeight = this.$viewportElement.height();
            this.viewportOffsetTop = hasOffsets ? viewportOffsets.top : 0;
            this.viewportOffsetLeft = hasOffsets ? viewportOffsets.left : 0;
        },
        _findParticles: function() {
            var self = this, scrollLeft = this._getScrollLeft(), scrollTop = this._getScrollTop();
            if (this.particles !== undefined) {
                for (var i = this.particles.length - 1; i >= 0; i--) {
                    this.particles[i].$element.data("stellar-elementIsActive", undefined);
                }
            }
            this.particles = [];
            if (!this.options.parallaxElements) return;
            this.$element.find("[data-stellar-ratio]").each(function(i) {
                var $this = $(this), horizontalOffset, verticalOffset, positionLeft, positionTop, marginLeft, marginTop, $offsetParent, offsetLeft, offsetTop, parentOffsetLeft = 0, parentOffsetTop = 0, tempParentOffsetLeft = 0, tempParentOffsetTop = 0;
                // Ensure this element isn't already part of another scrolling element
                if (!$this.data("stellar-elementIsActive")) {
                    $this.data("stellar-elementIsActive", this);
                } else if ($this.data("stellar-elementIsActive") !== this) {
                    return;
                }
                self.options.showElement($this);
                // Save/restore the original top and left CSS values in case we refresh the particles or destroy the instance
                if (!$this.data("stellar-startingLeft")) {
                    $this.data("stellar-startingLeft", $this.css("left"));
                    $this.data("stellar-startingTop", $this.css("top"));
                } else {
                    $this.css("left", $this.data("stellar-startingLeft"));
                    $this.css("top", $this.data("stellar-startingTop"));
                }
                positionLeft = $this.position().left;
                positionTop = $this.position().top;
                // Catch-all for margin top/left properties (these evaluate to 'auto' in IE7 and IE8)
                marginLeft = $this.css("margin-left") === "auto" ? 0 : parseInt($this.css("margin-left"), 10);
                marginTop = $this.css("margin-top") === "auto" ? 0 : parseInt($this.css("margin-top"), 10);
                offsetLeft = $this.offset().left - marginLeft;
                offsetTop = $this.offset().top - marginTop;
                // Calculate the offset parent
                $this.parents().each(function() {
                    var $this = $(this);
                    if ($this.data("stellar-offset-parent") === true) {
                        parentOffsetLeft = tempParentOffsetLeft;
                        parentOffsetTop = tempParentOffsetTop;
                        $offsetParent = $this;
                        return false;
                    } else {
                        tempParentOffsetLeft += $this.position().left;
                        tempParentOffsetTop += $this.position().top;
                    }
                });
                // Detect the offsets
                horizontalOffset = $this.data("stellar-horizontal-offset") !== undefined ? $this.data("stellar-horizontal-offset") : $offsetParent !== undefined && $offsetParent.data("stellar-horizontal-offset") !== undefined ? $offsetParent.data("stellar-horizontal-offset") : self.horizontalOffset;
                verticalOffset = $this.data("stellar-vertical-offset") !== undefined ? $this.data("stellar-vertical-offset") : $offsetParent !== undefined && $offsetParent.data("stellar-vertical-offset") !== undefined ? $offsetParent.data("stellar-vertical-offset") : self.verticalOffset;
                // Add our object to the particles collection
                self.particles.push({
                    $element: $this,
                    $offsetParent: $offsetParent,
                    isFixed: $this.css("position") === "fixed",
                    horizontalOffset: horizontalOffset,
                    verticalOffset: verticalOffset,
                    startingPositionLeft: positionLeft,
                    startingPositionTop: positionTop,
                    startingOffsetLeft: offsetLeft,
                    startingOffsetTop: offsetTop,
                    parentOffsetLeft: parentOffsetLeft,
                    parentOffsetTop: parentOffsetTop,
                    stellarRatio: $this.data("stellar-ratio") !== undefined ? $this.data("stellar-ratio") : 1,
                    width: $this.outerWidth(true),
                    height: $this.outerHeight(true),
                    isHidden: false
                });
            });
        },
        _findBackgrounds: function() {
            var self = this, scrollLeft = this._getScrollLeft(), scrollTop = this._getScrollTop(), $backgroundElements;
            this.backgrounds = [];
            if (!this.options.parallaxBackgrounds) return;
            $backgroundElements = this.$element.find("[data-stellar-background-ratio]");
            if (this.$element.data("stellar-background-ratio")) {
                $backgroundElements = $backgroundElements.add(this.$element);
            }
            $backgroundElements.each(function() {
                var $this = $(this), backgroundPosition = getBackgroundPosition($this), horizontalOffset, verticalOffset, positionLeft, positionTop, marginLeft, marginTop, offsetLeft, offsetTop, $offsetParent, parentOffsetLeft = 0, parentOffsetTop = 0, tempParentOffsetLeft = 0, tempParentOffsetTop = 0;
                // Ensure this element isn't already part of another scrolling element
                if (!$this.data("stellar-backgroundIsActive")) {
                    $this.data("stellar-backgroundIsActive", this);
                } else if ($this.data("stellar-backgroundIsActive") !== this) {
                    return;
                }
                // Save/restore the original top and left CSS values in case we destroy the instance
                if (!$this.data("stellar-backgroundStartingLeft")) {
                    $this.data("stellar-backgroundStartingLeft", backgroundPosition[0]);
                    $this.data("stellar-backgroundStartingTop", backgroundPosition[1]);
                } else {
                    setBackgroundPosition($this, $this.data("stellar-backgroundStartingLeft"), $this.data("stellar-backgroundStartingTop"));
                }
                // Catch-all for margin top/left properties (these evaluate to 'auto' in IE7 and IE8)
                marginLeft = $this.css("margin-left") === "auto" ? 0 : parseInt($this.css("margin-left"), 10);
                marginTop = $this.css("margin-top") === "auto" ? 0 : parseInt($this.css("margin-top"), 10);
                offsetLeft = $this.offset().left - marginLeft - scrollLeft;
                offsetTop = $this.offset().top - marginTop - scrollTop;
                // Calculate the offset parent
                $this.parents().each(function() {
                    var $this = $(this);
                    if ($this.data("stellar-offset-parent") === true) {
                        parentOffsetLeft = tempParentOffsetLeft;
                        parentOffsetTop = tempParentOffsetTop;
                        $offsetParent = $this;
                        return false;
                    } else {
                        tempParentOffsetLeft += $this.position().left;
                        tempParentOffsetTop += $this.position().top;
                    }
                });
                // Detect the offsets
                horizontalOffset = $this.data("stellar-horizontal-offset") !== undefined ? $this.data("stellar-horizontal-offset") : $offsetParent !== undefined && $offsetParent.data("stellar-horizontal-offset") !== undefined ? $offsetParent.data("stellar-horizontal-offset") : self.horizontalOffset;
                verticalOffset = $this.data("stellar-vertical-offset") !== undefined ? $this.data("stellar-vertical-offset") : $offsetParent !== undefined && $offsetParent.data("stellar-vertical-offset") !== undefined ? $offsetParent.data("stellar-vertical-offset") : self.verticalOffset;
                self.backgrounds.push({
                    $element: $this,
                    $offsetParent: $offsetParent,
                    isFixed: $this.css("background-attachment") === "fixed",
                    horizontalOffset: horizontalOffset,
                    verticalOffset: verticalOffset,
                    startingValueLeft: backgroundPosition[0],
                    startingValueTop: backgroundPosition[1],
                    startingBackgroundPositionLeft: isNaN(parseInt(backgroundPosition[0], 10)) ? 0 : parseInt(backgroundPosition[0], 10),
                    startingBackgroundPositionTop: isNaN(parseInt(backgroundPosition[1], 10)) ? 0 : parseInt(backgroundPosition[1], 10),
                    startingPositionLeft: $this.position().left,
                    startingPositionTop: $this.position().top,
                    startingOffsetLeft: offsetLeft,
                    startingOffsetTop: offsetTop,
                    parentOffsetLeft: parentOffsetLeft,
                    parentOffsetTop: parentOffsetTop,
                    stellarRatio: $this.data("stellar-background-ratio") === undefined ? 1 : $this.data("stellar-background-ratio")
                });
            });
        },
        _reset: function() {
            var particle, startingPositionLeft, startingPositionTop, background, i;
            for (i = this.particles.length - 1; i >= 0; i--) {
                particle = this.particles[i];
                startingPositionLeft = particle.$element.data("stellar-startingLeft");
                startingPositionTop = particle.$element.data("stellar-startingTop");
                this._setPosition(particle.$element, startingPositionLeft, startingPositionLeft, startingPositionTop, startingPositionTop);
                this.options.showElement(particle.$element);
                particle.$element.data("stellar-startingLeft", null).data("stellar-elementIsActive", null).data("stellar-backgroundIsActive", null);
            }
            for (i = this.backgrounds.length - 1; i >= 0; i--) {
                background = this.backgrounds[i];
                background.$element.data("stellar-backgroundStartingLeft", null).data("stellar-backgroundStartingTop", null);
                setBackgroundPosition(background.$element, background.startingValueLeft, background.startingValueTop);
            }
        },
        destroy: function() {
            this._reset();
            this.$scrollElement.unbind("resize." + this.name).unbind("scroll." + this.name);
            this._animationLoop = $.noop;
            $(window).unbind("load." + this.name).unbind("resize." + this.name);
        },
        _setOffsets: function() {
            var self = this, $window = $(window);
            $window.unbind("resize.horizontal-" + this.name).unbind("resize.vertical-" + this.name);
            if (typeof this.options.horizontalOffset === "function") {
                this.horizontalOffset = this.options.horizontalOffset();
                $window.bind("resize.horizontal-" + this.name, function() {
                    self.horizontalOffset = self.options.horizontalOffset();
                });
            } else {
                this.horizontalOffset = this.options.horizontalOffset;
            }
            if (typeof this.options.verticalOffset === "function") {
                this.verticalOffset = this.options.verticalOffset();
                $window.bind("resize.vertical-" + this.name, function() {
                    self.verticalOffset = self.options.verticalOffset();
                });
            } else {
                this.verticalOffset = this.options.verticalOffset;
            }
        },
        _repositionElements: function() {
            var scrollLeft = this._getScrollLeft(), scrollTop = this._getScrollTop(), horizontalOffset, verticalOffset, particle, fixedRatioOffset, background, bgLeft, bgTop, isVisibleVertical = true, isVisibleHorizontal = true, newPositionLeft, newPositionTop, newOffsetLeft, newOffsetTop, i;
            // First check that the scroll position or container size has changed
            if (this.currentScrollLeft === scrollLeft && this.currentScrollTop === scrollTop && this.currentWidth === this.viewportWidth && this.currentHeight === this.viewportHeight) {
                return;
            } else {
                this.currentScrollLeft = scrollLeft;
                this.currentScrollTop = scrollTop;
                this.currentWidth = this.viewportWidth;
                this.currentHeight = this.viewportHeight;
            }
            // Reposition elements
            for (i = this.particles.length - 1; i >= 0; i--) {
                particle = this.particles[i];
                fixedRatioOffset = particle.isFixed ? 1 : 0;
                // Calculate position, then calculate what the particle's new offset will be (for visibility check)
                if (this.options.horizontalScrolling) {
                    newPositionLeft = (scrollLeft + particle.horizontalOffset + this.viewportOffsetLeft + particle.startingPositionLeft - particle.startingOffsetLeft + particle.parentOffsetLeft) * -(particle.stellarRatio + fixedRatioOffset - 1) + particle.startingPositionLeft;
                    newOffsetLeft = newPositionLeft - particle.startingPositionLeft + particle.startingOffsetLeft;
                } else {
                    newPositionLeft = particle.startingPositionLeft;
                    newOffsetLeft = particle.startingOffsetLeft;
                }
                if (this.options.verticalScrolling) {
                    newPositionTop = (scrollTop + particle.verticalOffset + this.viewportOffsetTop + particle.startingPositionTop - particle.startingOffsetTop + particle.parentOffsetTop) * -(particle.stellarRatio + fixedRatioOffset - 1) + particle.startingPositionTop;
                    newOffsetTop = newPositionTop - particle.startingPositionTop + particle.startingOffsetTop;
                } else {
                    newPositionTop = particle.startingPositionTop;
                    newOffsetTop = particle.startingOffsetTop;
                }
                // Check visibility
                if (this.options.hideDistantElements) {
                    isVisibleHorizontal = !this.options.horizontalScrolling || newOffsetLeft + particle.width > (particle.isFixed ? 0 : scrollLeft) && newOffsetLeft < (particle.isFixed ? 0 : scrollLeft) + this.viewportWidth + this.viewportOffsetLeft;
                    isVisibleVertical = !this.options.verticalScrolling || newOffsetTop + particle.height > (particle.isFixed ? 0 : scrollTop) && newOffsetTop < (particle.isFixed ? 0 : scrollTop) + this.viewportHeight + this.viewportOffsetTop;
                }
                if (isVisibleHorizontal && isVisibleVertical) {
                    if (particle.isHidden) {
                        this.options.showElement(particle.$element);
                        particle.isHidden = false;
                    }
                    this._setPosition(particle.$element, newPositionLeft, particle.startingPositionLeft, newPositionTop, particle.startingPositionTop);
                } else {
                    if (!particle.isHidden) {
                        this.options.hideElement(particle.$element);
                        particle.isHidden = true;
                    }
                }
            }
            // Reposition backgrounds
            for (i = this.backgrounds.length - 1; i >= 0; i--) {
                background = this.backgrounds[i];
                fixedRatioOffset = background.isFixed ? 0 : 1;
                bgLeft = this.options.horizontalScrolling ? (scrollLeft + background.horizontalOffset - this.viewportOffsetLeft - background.startingOffsetLeft + background.parentOffsetLeft - background.startingBackgroundPositionLeft) * (fixedRatioOffset - background.stellarRatio) + "px" : background.startingValueLeft;
                bgTop = this.options.verticalScrolling ? (scrollTop + background.verticalOffset - this.viewportOffsetTop - background.startingOffsetTop + background.parentOffsetTop - background.startingBackgroundPositionTop) * (fixedRatioOffset - background.stellarRatio) + "px" : background.startingValueTop;
                setBackgroundPosition(background.$element, bgLeft, bgTop);
            }
        },
        _handleScrollEvent: function() {
            var self = this, ticking = false;
            var update = function() {
                self._repositionElements();
                ticking = false;
            };
            var requestTick = function() {
                if (!ticking) {
                    requestAnimFrame(update);
                    ticking = true;
                }
            };
            this.$scrollElement.bind("scroll." + this.name, requestTick);
            requestTick();
        },
        _startAnimationLoop: function() {
            var self = this;
            this._animationLoop = function() {
                requestAnimFrame(self._animationLoop);
                self._repositionElements();
            };
            this._animationLoop();
        }
    };
    $.fn[pluginName] = function(options) {
        var args = arguments;
        if (options === undefined || typeof options === "object") {
            return this.each(function() {
                if (!$.data(this, "plugin_" + pluginName)) {
                    $.data(this, "plugin_" + pluginName, new Plugin(this, options));
                }
            });
        } else if (typeof options === "string" && options[0] !== "_" && options !== "init") {
            return this.each(function() {
                var instance = $.data(this, "plugin_" + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === "function") {
                    instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
                if (options === "destroy") {
                    $.data(this, "plugin_" + pluginName, null);
                }
            });
        }
    };
    $[pluginName] = function(options) {
        var $window = $(window);
        return $window.stellar.apply($window, Array.prototype.slice.call(arguments, 0));
    };
    // Expose the scroll and position property function hashes so they can be extended
    $[pluginName].scrollProperty = scrollProperty;
    $[pluginName].positionProperty = positionProperty;
    // Expose the plugin class so it can be modified
    window.Stellar = Plugin;
})(jQuery, this, document);

/*!
 * imagesLoaded v3.0.4
 * JavaScript is all like "You images are done yet or what?"
 */
(function(window) {
    "use strict";
    var $ = window.jQuery;
    var console = window.console;
    var hasConsole = typeof console !== "undefined";
    // -------------------------- helpers -------------------------- //
    // extend objects
    function extend(a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    }
    var objToString = Object.prototype.toString;
    function isArray(obj) {
        return objToString.call(obj) === "[object Array]";
    }
    // turn element or nodeList into an array
    function makeArray(obj) {
        var ary = [];
        if (isArray(obj)) {
            // use object if already an array
            ary = obj;
        } else if (typeof obj.length === "number") {
            // convert nodeList to array
            for (var i = 0, len = obj.length; i < len; i++) {
                ary.push(obj[i]);
            }
        } else {
            // array of single index
            ary.push(obj);
        }
        return ary;
    }
    // --------------------------  -------------------------- //
    function defineImagesLoaded(EventEmitter, eventie) {
        /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
        function ImagesLoaded(elem, options, onAlways) {
            // coerce ImagesLoaded() without new, to be new ImagesLoaded()
            if (!(this instanceof ImagesLoaded)) {
                return new ImagesLoaded(elem, options);
            }
            // use elem as selector string
            if (typeof elem === "string") {
                elem = document.querySelectorAll(elem);
            }
            this.elements = makeArray(elem);
            this.options = extend({}, this.options);
            if (typeof options === "function") {
                onAlways = options;
            } else {
                extend(this.options, options);
            }
            if (onAlways) {
                this.on("always", onAlways);
            }
            this.getImages();
            if ($) {
                // add jQuery Deferred object
                this.jqDeferred = new $.Deferred();
            }
            // HACK check async to allow time to bind listeners
            var _this = this;
            setTimeout(function() {
                _this.check();
            });
        }
        ImagesLoaded.prototype = new EventEmitter();
        ImagesLoaded.prototype.options = {};
        ImagesLoaded.prototype.getImages = function() {
            this.images = [];
            // filter & find items if we have an item selector
            for (var i = 0, len = this.elements.length; i < len; i++) {
                var elem = this.elements[i];
                // filter siblings
                if (elem.nodeName === "IMG") {
                    this.addImage(elem);
                }
                // find children
                var childElems = elem.querySelectorAll("img");
                // concat childElems to filterFound array
                for (var j = 0, jLen = childElems.length; j < jLen; j++) {
                    var img = childElems[j];
                    this.addImage(img);
                }
            }
        };
        /**
   * @param {Image} img
   */
        ImagesLoaded.prototype.addImage = function(img) {
            var loadingImage = new LoadingImage(img);
            this.images.push(loadingImage);
        };
        ImagesLoaded.prototype.check = function() {
            var _this = this;
            var checkedCount = 0;
            var length = this.images.length;
            this.hasAnyBroken = false;
            // complete if no images
            if (!length) {
                this.complete();
                return;
            }
            function onConfirm(image, message) {
                if (_this.options.debug && hasConsole) {
                    console.log("confirm", image, message);
                }
                _this.progress(image);
                checkedCount++;
                if (checkedCount === length) {
                    _this.complete();
                }
                return true;
            }
            for (var i = 0; i < length; i++) {
                var loadingImage = this.images[i];
                loadingImage.on("confirm", onConfirm);
                loadingImage.check();
            }
        };
        ImagesLoaded.prototype.progress = function(image) {
            this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
            // HACK - Chrome triggers event before object properties have changed. #83
            var _this = this;
            setTimeout(function() {
                _this.emit("progress", _this, image);
                if (_this.jqDeferred) {
                    _this.jqDeferred.notify(_this, image);
                }
            });
        };
        ImagesLoaded.prototype.complete = function() {
            var eventName = this.hasAnyBroken ? "fail" : "done";
            this.isComplete = true;
            var _this = this;
            // HACK - another setTimeout so that confirm happens after progress
            setTimeout(function() {
                _this.emit(eventName, _this);
                _this.emit("always", _this);
                if (_this.jqDeferred) {
                    var jqMethod = _this.hasAnyBroken ? "reject" : "resolve";
                    _this.jqDeferred[jqMethod](_this);
                }
            });
        };
        // -------------------------- jquery -------------------------- //
        if ($) {
            $.fn.imagesLoaded = function(options, callback) {
                var instance = new ImagesLoaded(this, options, callback);
                return instance.jqDeferred.promise($(this));
            };
        }
        // --------------------------  -------------------------- //
        var cache = {};
        function LoadingImage(img) {
            this.img = img;
        }
        LoadingImage.prototype = new EventEmitter();
        LoadingImage.prototype.check = function() {
            // first check cached any previous images that have same src
            var cached = cache[this.img.src];
            if (cached) {
                this.useCached(cached);
                return;
            }
            // add this to cache
            cache[this.img.src] = this;
            // If complete is true and browser supports natural sizes,
            // try to check for image status manually.
            if (this.img.complete && this.img.naturalWidth !== undefined) {
                // report based on naturalWidth
                this.confirm(this.img.naturalWidth !== 0, "naturalWidth");
                return;
            }
            // If none of the checks above matched, simulate loading on detached element.
            var proxyImage = this.proxyImage = new Image();
            eventie.bind(proxyImage, "load", this);
            eventie.bind(proxyImage, "error", this);
            proxyImage.src = this.img.src;
        };
        LoadingImage.prototype.useCached = function(cached) {
            if (cached.isConfirmed) {
                this.confirm(cached.isLoaded, "cached was confirmed");
            } else {
                var _this = this;
                cached.on("confirm", function(image) {
                    _this.confirm(image.isLoaded, "cache emitted confirmed");
                    return true;
                });
            }
        };
        LoadingImage.prototype.confirm = function(isLoaded, message) {
            this.isConfirmed = true;
            this.isLoaded = isLoaded;
            this.emit("confirm", this, message);
        };
        // trigger specified handler for event type
        LoadingImage.prototype.handleEvent = function(event) {
            var method = "on" + event.type;
            if (this[method]) {
                this[method](event);
            }
        };
        LoadingImage.prototype.onload = function() {
            this.confirm(true, "onload");
            this.unbindProxyEvents();
        };
        LoadingImage.prototype.onerror = function() {
            this.confirm(false, "onerror");
            this.unbindProxyEvents();
        };
        LoadingImage.prototype.unbindProxyEvents = function() {
            eventie.unbind(this.proxyImage, "load", this);
            eventie.unbind(this.proxyImage, "error", this);
        };
        // -----  ----- //
        return ImagesLoaded;
    }
    // -------------------------- transport -------------------------- //
    if (typeof define === "function" && define.amd) {
        // AMD
        define([ "eventEmitter/EventEmitter", "eventie/eventie" ], defineImagesLoaded);
    } else {
        // browser global
        window.imagesLoaded = defineImagesLoaded(window.EventEmitter, window.eventie);
    }
})(window);

/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */
/*jshint browser: true, strict: true, undef: true */
/*global define: false */
(function(window) {
    "use strict";
    // class helper functions from bonzo https://github.com/ded/bonzo
    function classReg(className) {
        return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
    }
    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    var hasClass, addClass, removeClass;
    if ("classList" in document.documentElement) {
        hasClass = function(elem, c) {
            return elem.classList.contains(c);
        };
        addClass = function(elem, c) {
            elem.classList.add(c);
        };
        removeClass = function(elem, c) {
            elem.classList.remove(c);
        };
    } else {
        hasClass = function(elem, c) {
            return classReg(c).test(elem.className);
        };
        addClass = function(elem, c) {
            if (!hasClass(elem, c)) {
                elem.className = elem.className + " " + c;
            }
        };
        removeClass = function(elem, c) {
            elem.className = elem.className.replace(classReg(c), " ");
        };
    }
    function toggleClass(elem, c) {
        var fn = hasClass(elem, c) ? removeClass : addClass;
        fn(elem, c);
    }
    var classie = {
        // full names
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        // short names
        has: hasClass,
        add: addClass,
        remove: removeClass,
        toggle: toggleClass
    };
    // transport
    if (typeof define === "function" && define.amd) {
        // AMD
        define(classie);
    } else {
        // browser global
        window.classie = classie;
    }
})(window);

/**
 * matchesSelector helper v1.0.1
 *
 * @name matchesSelector
 *   @param {Element} elem
 *   @param {String} selector
 */
/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false */
(function(global, ElemProto) {
    "use strict";
    var matchesMethod = function() {
        // check un-prefixed
        if (ElemProto.matchesSelector) {
            return "matchesSelector";
        }
        // check vendor prefixes
        var prefixes = [ "webkit", "moz", "ms", "o" ];
        for (var i = 0, len = prefixes.length; i < len; i++) {
            var prefix = prefixes[i];
            var method = prefix + "MatchesSelector";
            if (ElemProto[method]) {
                return method;
            }
        }
    }();
    // ----- match ----- //
    function match(elem, selector) {
        return elem[matchesMethod](selector);
    }
    // ----- appendToFragment ----- //
    function checkParent(elem) {
        // not needed if already has parent
        if (elem.parentNode) {
            return;
        }
        var fragment = document.createDocumentFragment();
        fragment.appendChild(elem);
    }
    // ----- query ----- //
    // fall back to using QSA
    // thx @jonathantneal https://gist.github.com/3062955
    function query(elem, selector) {
        // append to fragment if no parent
        checkParent(elem);
        // match elem with all selected elems of parent
        var elems = elem.parentNode.querySelectorAll(selector);
        for (var i = 0, len = elems.length; i < len; i++) {
            // return true if match
            if (elems[i] === elem) {
                return true;
            }
        }
        // otherwise return false
        return false;
    }
    // ----- matchChild ----- //
    function matchChild(elem, selector) {
        checkParent(elem);
        return match(elem, selector);
    }
    // ----- matchesSelector ----- //
    var matchesSelector;
    if (matchesMethod) {
        // IE9 supports matchesSelector, but doesn't work on orphaned elems
        // check for that
        var div = document.createElement("div");
        var supportsOrphans = match(div, "div");
        matchesSelector = supportsOrphans ? match : matchChild;
    } else {
        matchesSelector = query;
    }
    // transport
    if (typeof define === "function" && define.amd) {
        // AMD
        define(function() {
            return matchesSelector;
        });
    } else {
        // browser global
        window.matchesSelector = matchesSelector;
    }
})(this, Element.prototype);

/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */
(function($) {
    $.transit = {
        version: "0.9.9",
        // Map of $.css() keys to values for 'transitionProperty'.
        // See https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
        propertyMap: {
            marginLeft: "margin",
            marginRight: "margin",
            marginBottom: "margin",
            marginTop: "margin",
            paddingLeft: "padding",
            paddingRight: "padding",
            paddingBottom: "padding",
            paddingTop: "padding"
        },
        // Will simply transition "instantly" if false
        enabled: true,
        // Set this to false if you don't want to use the transition end property.
        useTransitionEnd: false
    };
    var div = document.createElement("div");
    var support = {};
    // Helper function to get the proper vendor property name.
    // (`transition` => `WebkitTransition`)
    function getVendorPropertyName(prop) {
        // Handle unprefixed versions (FF16+, for example)
        if (prop in div.style) return prop;
        var prefixes = [ "Moz", "Webkit", "O", "ms" ];
        var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);
        if (prop in div.style) {
            return prop;
        }
        for (var i = 0; i < prefixes.length; ++i) {
            var vendorProp = prefixes[i] + prop_;
            if (vendorProp in div.style) {
                return vendorProp;
            }
        }
    }
    // Helper function to check if transform3D is supported.
    // Should return true for Webkits and Firefox 10+.
    function checkTransform3dSupport() {
        div.style[support.transform] = "";
        div.style[support.transform] = "rotateY(90deg)";
        return div.style[support.transform] !== "";
    }
    var isChrome = navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
    // Check for the browser's transitions support.
    support.transition = getVendorPropertyName("transition");
    support.transitionDelay = getVendorPropertyName("transitionDelay");
    support.transform = getVendorPropertyName("transform");
    support.transformOrigin = getVendorPropertyName("transformOrigin");
    support.transform3d = checkTransform3dSupport();
    var eventNames = {
        transition: "transitionEnd",
        MozTransition: "transitionend",
        OTransition: "oTransitionEnd",
        WebkitTransition: "webkitTransitionEnd",
        msTransition: "MSTransitionEnd"
    };
    // Detect the 'transitionend' event needed.
    var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;
    // Populate jQuery's `$.support` with the vendor prefixes we know.
    // As per [jQuery's cssHooks documentation](http://api.jquery.com/jQuery.cssHooks/),
    // we set $.support.transition to a string of the actual property name used.
    for (var key in support) {
        if (support.hasOwnProperty(key) && typeof $.support[key] === "undefined") {
            $.support[key] = support[key];
        }
    }
    // Avoid memory leak in IE.
    div = null;
    // ## $.cssEase
    // List of easing aliases that you can use with `$.fn.transition`.
    $.cssEase = {
        _default: "ease",
        "in": "ease-in",
        out: "ease-out",
        "in-out": "ease-in-out",
        snap: "cubic-bezier(0,1,.5,1)",
        // Penner equations
        easeOutCubic: "cubic-bezier(.215,.61,.355,1)",
        easeInOutCubic: "cubic-bezier(.645,.045,.355,1)",
        easeInCirc: "cubic-bezier(.6,.04,.98,.335)",
        easeOutCirc: "cubic-bezier(.075,.82,.165,1)",
        easeInOutCirc: "cubic-bezier(.785,.135,.15,.86)",
        easeInExpo: "cubic-bezier(.95,.05,.795,.035)",
        easeOutExpo: "cubic-bezier(.19,1,.22,1)",
        easeInOutExpo: "cubic-bezier(1,0,0,1)",
        easeInQuad: "cubic-bezier(.55,.085,.68,.53)",
        easeOutQuad: "cubic-bezier(.25,.46,.45,.94)",
        easeInOutQuad: "cubic-bezier(.455,.03,.515,.955)",
        easeInQuart: "cubic-bezier(.895,.03,.685,.22)",
        easeOutQuart: "cubic-bezier(.165,.84,.44,1)",
        easeInOutQuart: "cubic-bezier(.77,0,.175,1)",
        easeInQuint: "cubic-bezier(.755,.05,.855,.06)",
        easeOutQuint: "cubic-bezier(.23,1,.32,1)",
        easeInOutQuint: "cubic-bezier(.86,0,.07,1)",
        easeInSine: "cubic-bezier(.47,0,.745,.715)",
        easeOutSine: "cubic-bezier(.39,.575,.565,1)",
        easeInOutSine: "cubic-bezier(.445,.05,.55,.95)",
        easeInBack: "cubic-bezier(.6,-.28,.735,.045)",
        easeOutBack: "cubic-bezier(.175, .885,.32,1.275)",
        easeInOutBack: "cubic-bezier(.68,-.55,.265,1.55)"
    };
    // ## 'transform' CSS hook
    // Allows you to use the `transform` property in CSS.
    //
    //     $("#hello").css({ transform: "rotate(90deg)" });
    //
    //     $("#hello").css('transform');
    //     //=> { rotate: '90deg' }
    //
    $.cssHooks["transit:transform"] = {
        // The getter returns a `Transform` object.
        get: function(elem) {
            return $(elem).data("transform") || new Transform();
        },
        // The setter accepts a `Transform` object or a string.
        set: function(elem, v) {
            var value = v;
            if (!(value instanceof Transform)) {
                value = new Transform(value);
            }
            // We've seen the 3D version of Scale() not work in Chrome when the
            // element being scaled extends outside of the viewport.  Thus, we're
            // forcing Chrome to not use the 3d transforms as well.  Not sure if
            // translate is affectede, but not risking it.  Detection code from
            // http://davidwalsh.name/detecting-google-chrome-javascript
            if (support.transform === "WebkitTransform" && !isChrome) {
                elem.style[support.transform] = value.toString(true);
            } else {
                elem.style[support.transform] = value.toString();
            }
            $(elem).data("transform", value);
        }
    };
    // Add a CSS hook for `.css({ transform: '...' })`.
    // In jQuery 1.8+, this will intentionally override the default `transform`
    // CSS hook so it'll play well with Transit. (see issue #62)
    $.cssHooks.transform = {
        set: $.cssHooks["transit:transform"].set
    };
    // jQuery 1.8+ supports prefix-free transitions, so these polyfills will not
    // be necessary.
    if ($.fn.jquery < "1.8") {
        // ## 'transformOrigin' CSS hook
        // Allows the use for `transformOrigin` to define where scaling and rotation
        // is pivoted.
        //
        //     $("#hello").css({ transformOrigin: '0 0' });
        //
        $.cssHooks.transformOrigin = {
            get: function(elem) {
                return elem.style[support.transformOrigin];
            },
            set: function(elem, value) {
                elem.style[support.transformOrigin] = value;
            }
        };
        // ## 'transition' CSS hook
        // Allows you to use the `transition` property in CSS.
        //
        //     $("#hello").css({ transition: 'all 0 ease 0' });
        //
        $.cssHooks.transition = {
            get: function(elem) {
                return elem.style[support.transition];
            },
            set: function(elem, value) {
                elem.style[support.transition] = value;
            }
        };
    }
    // ## Other CSS hooks
    // Allows you to rotate, scale and translate.
    registerCssHook("scale");
    registerCssHook("translate");
    registerCssHook("rotate");
    registerCssHook("rotateX");
    registerCssHook("rotateY");
    registerCssHook("rotate3d");
    registerCssHook("perspective");
    registerCssHook("skewX");
    registerCssHook("skewY");
    registerCssHook("x", true);
    registerCssHook("y", true);
    // ## Transform class
    // This is the main class of a transformation property that powers
    // `$.fn.css({ transform: '...' })`.
    //
    // This is, in essence, a dictionary object with key/values as `-transform`
    // properties.
    //
    //     var t = new Transform("rotate(90) scale(4)");
    //
    //     t.rotate             //=> "90deg"
    //     t.scale              //=> "4,4"
    //
    // Setters are accounted for.
    //
    //     t.set('rotate', 4)
    //     t.rotate             //=> "4deg"
    //
    // Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
    // functions.
    //
    //     t.toString()         //=> "rotate(90deg) scale(4,4)"
    //     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
    //
    function Transform(str) {
        if (typeof str === "string") {
            this.parse(str);
        }
        return this;
    }
    Transform.prototype = {
        // ### setFromString()
        // Sets a property from a string.
        //
        //     t.setFromString('scale', '2,4');
        //     // Same as set('scale', '2', '4');
        //
        setFromString: function(prop, val) {
            var args = typeof val === "string" ? val.split(",") : val.constructor === Array ? val : [ val ];
            args.unshift(prop);
            Transform.prototype.set.apply(this, args);
        },
        // ### set()
        // Sets a property.
        //
        //     t.set('scale', 2, 4);
        //
        set: function(prop) {
            var args = Array.prototype.slice.apply(arguments, [ 1 ]);
            if (this.setter[prop]) {
                this.setter[prop].apply(this, args);
            } else {
                this[prop] = args.join(",");
            }
        },
        get: function(prop) {
            if (this.getter[prop]) {
                return this.getter[prop].apply(this);
            } else {
                return this[prop] || 0;
            }
        },
        setter: {
            // ### rotate
            //
            //     .css({ rotate: 30 })
            //     .css({ rotate: "30" })
            //     .css({ rotate: "30deg" })
            //     .css({ rotate: "30deg" })
            //
            rotate: function(theta) {
                this.rotate = unit(theta, "deg");
            },
            rotateX: function(theta) {
                this.rotateX = unit(theta, "deg");
            },
            rotateY: function(theta) {
                this.rotateY = unit(theta, "deg");
            },
            // ### scale
            //
            //     .css({ scale: 9 })      //=> "scale(9,9)"
            //     .css({ scale: '3,2' })  //=> "scale(3,2)"
            //
            scale: function(x, y) {
                if (y === undefined) {
                    y = x;
                }
                this.scale = x + "," + y;
            },
            // ### skewX + skewY
            skewX: function(x) {
                this.skewX = unit(x, "deg");
            },
            skewY: function(y) {
                this.skewY = unit(y, "deg");
            },
            // ### perspectvie
            perspective: function(dist) {
                this.perspective = unit(dist, "px");
            },
            // ### x / y
            // Translations. Notice how this keeps the other value.
            //
            //     .css({ x: 4 })       //=> "translate(4px, 0)"
            //     .css({ y: 10 })      //=> "translate(4px, 10px)"
            //
            x: function(x) {
                this.set("translate", x, null);
            },
            y: function(y) {
                this.set("translate", null, y);
            },
            // ### translate
            // Notice how this keeps the other value.
            //
            //     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
            //
            translate: function(x, y) {
                if (this._translateX === undefined) {
                    this._translateX = 0;
                }
                if (this._translateY === undefined) {
                    this._translateY = 0;
                }
                if (x !== null && x !== undefined) {
                    this._translateX = unit(x, "px");
                }
                if (y !== null && y !== undefined) {
                    this._translateY = unit(y, "px");
                }
                this.translate = this._translateX + "," + this._translateY;
            }
        },
        getter: {
            x: function() {
                return this._translateX || 0;
            },
            y: function() {
                return this._translateY || 0;
            },
            scale: function() {
                var s = (this.scale || "1,1").split(",");
                if (s[0]) {
                    s[0] = parseFloat(s[0]);
                }
                if (s[1]) {
                    s[1] = parseFloat(s[1]);
                }
                // "2.5,2.5" => 2.5
                // "2.5,1" => [2.5,1]
                return s[0] === s[1] ? s[0] : s;
            },
            rotate3d: function() {
                var s = (this.rotate3d || "0,0,0,0deg").split(",");
                for (var i = 0; i <= 3; ++i) {
                    if (s[i]) {
                        s[i] = parseFloat(s[i]);
                    }
                }
                if (s[3]) {
                    s[3] = unit(s[3], "deg");
                }
                return s;
            }
        },
        // ### parse()
        // Parses from a string. Called on constructor.
        parse: function(str) {
            var self = this;
            str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(x, prop, val) {
                self.setFromString(prop, val);
            });
        },
        // ### toString()
        // Converts to a `transition` CSS property string. If `use3d` is given,
        // it converts to a `-webkit-transition` CSS property string instead.
        toString: function(use3d) {
            var re = [];
            for (var i in this) {
                if (this.hasOwnProperty(i)) {
                    // Don't use 3D transformations if the browser can't support it.
                    if (!support.transform3d && (i === "rotateX" || i === "rotateY" || i === "perspective" || i === "transformOrigin")) {
                        continue;
                    }
                    if (i[0] !== "_") {
                        if (use3d && i === "scale") {
                            re.push(i + "3d(" + this[i] + ",1)");
                        } else if (use3d && i === "translate") {
                            re.push(i + "3d(" + this[i] + ",0)");
                        } else {
                            re.push(i + "(" + this[i] + ")");
                        }
                    }
                }
            }
            return re.join(" ");
        }
    };
    function callOrQueue(self, queue, fn) {
        if (queue === true) {
            self.queue(fn);
        } else if (queue) {
            self.queue(queue, fn);
        } else {
            fn();
        }
    }
    // ### getProperties(dict)
    // Returns properties (for `transition-property`) for dictionary `props`. The
    // value of `props` is what you would expect in `$.css(...)`.
    function getProperties(props) {
        var re = [];
        $.each(props, function(key) {
            key = $.camelCase(key);
            // Convert "text-align" => "textAlign"
            key = $.transit.propertyMap[key] || $.cssProps[key] || key;
            key = uncamel(key);
            // Convert back to dasherized
            if ($.inArray(key, re) === -1) {
                re.push(key);
            }
        });
        return re;
    }
    // ### getTransition()
    // Returns the transition string to be used for the `transition` CSS property.
    //
    // Example:
    //
    //     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
    //     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
    //
    function getTransition(properties, duration, easing, delay) {
        // Get the CSS properties needed.
        var props = getProperties(properties);
        // Account for aliases (`in` => `ease-in`).
        if ($.cssEase[easing]) {
            easing = $.cssEase[easing];
        }
        // Build the duration/easing/delay attributes for it.
        var attribs = "" + toMS(duration) + " " + easing;
        if (parseInt(delay, 10) > 0) {
            attribs += " " + toMS(delay);
        }
        // For more properties, add them this way:
        // "margin 200ms ease, padding 200ms ease, ..."
        var transitions = [];
        $.each(props, function(i, name) {
            transitions.push(name + " " + attribs);
        });
        return transitions.join(", ");
    }
    // ## $.fn.transition
    // Works like $.fn.animate(), but uses CSS transitions.
    //
    //     $("...").transition({ opacity: 0.1, scale: 0.3 });
    //
    //     // Specific duration
    //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
    //
    //     // With duration and easing
    //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
    //
    //     // With callback
    //     $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { ... });
    //
    //     // With everything
    //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
    //
    //     // Alternate syntax
    //     $("...").transition({
    //       opacity: 0.1,
    //       duration: 200,
    //       delay: 40,
    //       easing: 'in',
    //       complete: function() { /* ... */ }
    //      });
    //
    $.fn.transition = $.fn.transit = function(properties, duration, easing, callback) {
        var self = this;
        var delay = 0;
        var queue = true;
        // Account for `.transition(properties, callback)`.
        if (typeof duration === "function") {
            callback = duration;
            duration = undefined;
        }
        // Account for `.transition(properties, duration, callback)`.
        if (typeof easing === "function") {
            callback = easing;
            easing = undefined;
        }
        // Alternate syntax.
        if (typeof properties.easing !== "undefined") {
            easing = properties.easing;
            delete properties.easing;
        }
        if (typeof properties.duration !== "undefined") {
            duration = properties.duration;
            delete properties.duration;
        }
        if (typeof properties.complete !== "undefined") {
            callback = properties.complete;
            delete properties.complete;
        }
        if (typeof properties.queue !== "undefined") {
            queue = properties.queue;
            delete properties.queue;
        }
        if (typeof properties.delay !== "undefined") {
            delay = properties.delay;
            delete properties.delay;
        }
        // Set defaults. (`400` duration, `ease` easing)
        if (typeof duration === "undefined") {
            duration = $.fx.speeds._default;
        }
        if (typeof easing === "undefined") {
            easing = $.cssEase._default;
        }
        duration = toMS(duration);
        // Build the `transition` property.
        var transitionValue = getTransition(properties, duration, easing, delay);
        // Compute delay until callback.
        // If this becomes 0, don't bother setting the transition property.
        var work = $.transit.enabled && support.transition;
        var i = work ? parseInt(duration, 10) + parseInt(delay, 10) : 0;
        // If there's nothing to do...
        if (i === 0) {
            var fn = function(next) {
                self.css(properties);
                if (callback) {
                    callback.apply(self);
                }
                if (next) {
                    next();
                }
            };
            callOrQueue(self, queue, fn);
            return self;
        }
        // Save the old transitions of each element so we can restore it later.
        var oldTransitions = {};
        var run = function(nextCall) {
            var bound = false;
            // Prepare the callback.
            var cb = function() {
                if (bound) {
                    self.unbind(transitionEnd, cb);
                }
                if (i > 0) {
                    self.each(function() {
                        this.style[support.transition] = oldTransitions[this] || null;
                    });
                }
                if (typeof callback === "function") {
                    callback.apply(self);
                }
                if (typeof nextCall === "function") {
                    nextCall();
                }
            };
            if (i > 0 && transitionEnd && $.transit.useTransitionEnd) {
                // Use the 'transitionend' event if it's available.
                bound = true;
                self.bind(transitionEnd, cb);
            } else {
                // Fallback to timers if the 'transitionend' event isn't supported.
                window.setTimeout(cb, i);
            }
            // Apply transitions.
            self.each(function() {
                if (i > 0) {
                    this.style[support.transition] = transitionValue;
                }
                $(this).css(properties);
            });
        };
        // Defer running. This allows the browser to paint any pending CSS it hasn't
        // painted yet before doing the transitions.
        var deferredRun = function(next) {
            var i = 0;
            // Durations that are too slow will get transitions mixed up.
            // (Tested on Mac/FF 7.0.1)
            if (support.transition === "MozTransition" && i < 25) {
                i = 25;
            }
            window.setTimeout(function() {
                run(next);
            }, i);
        };
        // Use jQuery's fx queue.
        callOrQueue(self, queue, deferredRun);
        // Chainability.
        return this;
    };
    function registerCssHook(prop, isPixels) {
        // For certain properties, the 'px' should not be implied.
        if (!isPixels) {
            $.cssNumber[prop] = true;
        }
        $.transit.propertyMap[prop] = support.transform;
        $.cssHooks[prop] = {
            get: function(elem) {
                var t = $(elem).css("transit:transform");
                return t.get(prop);
            },
            set: function(elem, value) {
                var t = $(elem).css("transit:transform");
                t.setFromString(prop, value);
                $(elem).css({
                    "transit:transform": t
                });
            }
        };
    }
    // ### uncamel(str)
    // Converts a camelcase string to a dasherized string.
    // (`marginLeft` => `margin-left`)
    function uncamel(str) {
        return str.replace(/([A-Z])/g, function(letter) {
            return "-" + letter.toLowerCase();
        });
    }
    // ### unit(number, unit)
    // Ensures that number `number` has a unit. If no unit is found, assume the
    // default is `unit`.
    //
    //     unit(2, 'px')          //=> "2px"
    //     unit("30deg", 'rad')   //=> "30deg"
    //
    function unit(i, units) {
        if (typeof i === "string" && !i.match(/^[\-0-9\.]+$/)) {
            return i;
        } else {
            return "" + i + units;
        }
    }
    // ### toMS(duration)
    // Converts given `duration` to a millisecond string.
    //
    //     toMS('fast')   //=> '400ms'
    //     toMS(10)       //=> '10ms'
    //
    function toMS(duration) {
        var i = duration;
        // Allow for string durations like 'fast'.
        if ($.fx.speeds[i]) {
            i = $.fx.speeds[i];
        }
        return unit(i, "ms");
    }
    // Export some functions for testable-ness.
    $.transit.getTransitionValue = getTransition;
})(jQuery);

/*global jQuery */
/*jshint multistr:true browser:true */
/*!
* FitVids 1.0
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
* Date: Thu Sept 01 18:00:00 2011 -0500
*/
(function($) {
    "use strict";
    $.fn.fitVids = function(options) {
        var settings = {
            customSelector: null
        };
        if (!document.getElementById("fit-vids-style")) {
            var div = document.createElement("div"), ref = document.getElementsByTagName("base")[0] || document.getElementsByTagName("script")[0], cssStyles = "&shy;<style>.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}</style>";
            div.className = "fit-vids-style";
            div.id = "fit-vids-style";
            div.style.display = "none";
            div.innerHTML = cssStyles;
            ref.parentNode.insertBefore(div, ref);
        }
        if (options) {
            $.extend(settings, options);
        }
        return this.each(function() {
            var selectors = [ "iframe[src*='player.vimeo.com']", "iframe[src*='youtube.com']", "iframe[src*='youtube-nocookie.com']", "iframe[src*='kickstarter.com'][src*='video.html']", "object", "embed" ];
            if (settings.customSelector) {
                selectors.push(settings.customSelector);
            }
            var $allVideos = $(this).find(selectors.join(","));
            $allVideos = $allVideos.not("object object");
            // SwfObj conflict patch
            $allVideos.each(function() {
                var $this = $(this);
                if (this.tagName.toLowerCase() === "embed" && $this.parent("object").length || $this.parent(".fluid-width-video-wrapper").length) {
                    return;
                }
                var height = this.tagName.toLowerCase() === "object" || $this.attr("height") && !isNaN(parseInt($this.attr("height"), 10)) ? parseInt($this.attr("height"), 10) : $this.height(), width = !isNaN(parseInt($this.attr("width"), 10)) ? parseInt($this.attr("width"), 10) : $this.width(), aspectRatio = height / width;
                if (!$this.attr("id")) {
                    var videoID = "fitvid" + Math.floor(Math.random() * 999999);
                    $this.attr("id", videoID);
                }
                $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top", aspectRatio * 100 + "%");
                $this.removeAttr("height").removeAttr("width");
            });
        });
    };
})(window.jQuery || window.Zepto);

/*global jQuery */
/*jshint multistr:true browser:true */
/*!
* FitVids 1.0
*
* Copyright 2011, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
* Date: Thu Sept 01 18:00:00 2011 -0500
*/
(function($) {
    "use strict";
    $.fn.fitVids = function(options) {
        var settings = {
            customSelector: null
        };
        var div = document.createElement("div"), ref = document.getElementsByTagName("base")[0] || document.getElementsByTagName("script")[0];
        div.className = "fit-vids-style";
        div.innerHTML = "&shy;<style>               .fluid-width-video-wrapper {                 width: 100%;                              position: relative;                       padding: 0;                            }                                                                                   .fluid-width-video-wrapper iframe,        .fluid-width-video-wrapper object,        .fluid-width-video-wrapper embed {           position: absolute;                       top: 0;                                   left: 0;                                  width: 100%;                              height: 100%;                          }                                       </style>";
        ref.parentNode.insertBefore(div, ref);
        if (options) {
            $.extend(settings, options);
        }
        return this.each(function() {
            var selectors = [ "iframe[src*='player.vimeo.com']", "iframe[src*='youtube.com']", "iframe[src*='youtube-nocookie.com']", "iframe[src*='kickstarter.com']", "object", "embed" ];
            if (settings.customSelector) {
                selectors.push(settings.customSelector);
            }
            var $allVideos = $(this).find(selectors.join(","));
            $allVideos.each(function() {
                var $this = $(this);
                if (this.tagName.toLowerCase() === "embed" && $this.parent("object").length || $this.parent(".fluid-width-video-wrapper").length) {
                    return;
                }
                var height = this.tagName.toLowerCase() === "object" || $this.attr("height") && !isNaN(parseInt($this.attr("height"), 10)) ? parseInt($this.attr("height"), 10) : $this.height(), width = !isNaN(parseInt($this.attr("width"), 10)) ? parseInt($this.attr("width"), 10) : $this.width(), aspectRatio = height / width;
                if (!$this.attr("id")) {
                    var videoID = "fitvid" + Math.floor(Math.random() * 999999);
                    $this.attr("id", videoID);
                }
                $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top", aspectRatio * 100 + "%");
                $this.removeAttr("height").removeAttr("width");
            });
        });
    };
})(jQuery);

(function($, window, undefined) {
    "use strict";
    /* PLUGIN DEFINITION
   * ========================= */
    $.fn.backstretch = function(images, options) {
        // We need at least one image or method name
        if (images === undefined || images.length === 0) {
            $.error("No images were supplied for Backstretch");
        }
        /*
     * Scroll the page one pixel to get the right window height on iOS
     * Pretty harmless for everyone else
    */
        if ($(window).scrollTop() === 0) {
            window.scrollTo(0, 0);
        }
        return this.each(function() {
            var $this = $(this), obj = $this.data("backstretch");
            // Do we already have an instance attached to this element?
            if (obj) {
                // Is this a method they're trying to execute?
                if (typeof images == "string" && typeof obj[images] == "function") {
                    // Call the method
                    obj[images](options);
                    // No need to do anything further
                    return;
                }
                // Merge the old options with the new
                options = $.extend(obj.options, options);
                // Remove the old instance
                obj.destroy(true);
            }
            obj = new Backstretch(this, images, options);
            $this.data("backstretch", obj);
        });
    };
    // If no element is supplied, we'll attach to body
    $.backstretch = function(images, options) {
        // Return the instance
        return $("body").backstretch(images, options).data("backstretch");
    };
    // Custom selector
    $.expr[":"].backstretch = function(elem) {
        return $(elem).data("backstretch") !== undefined;
    };
    /* DEFAULTS
   * ========================= */
    $.fn.backstretch.defaults = {
        centeredX: true,
        centeredY: true,
        duration: 5e3,
        fade: 0
    };
    /* STYLES
   * 
   * Baked-in styles that we'll apply to our elements.
   * In an effort to keep the plugin simple, these are not exposed as options.
   * That said, anyone can override these in their own stylesheet.
   * ========================= */
    var styles = {
        wrap: {
            left: 0,
            top: 0,
            overflow: "hidden",
            margin: 0,
            padding: 0,
            height: "100%",
            width: "100%",
            zIndex: -999999
        },
        img: {
            position: "absolute",
            display: "none",
            margin: 0,
            padding: 0,
            border: "none",
            width: "auto",
            height: "auto",
            maxHeight: "none",
            maxWidth: "none",
            zIndex: -999999
        }
    };
    /* CLASS DEFINITION
   * ========================= */
    var Backstretch = function(container, images, options) {
        this.options = $.extend({}, $.fn.backstretch.defaults, options || {});
        /* In its simplest form, we allow Backstretch to be called on an image path.
     * e.g. $.backstretch('/path/to/image.jpg')
     * So, we need to turn this back into an array.
     */
        this.images = $.isArray(images) ? images : [ images ];
        // Preload images
        $.each(this.images, function() {
            $("<img />")[0].src = this;
        });
        // Convenience reference to know if the container is body.
        this.isBody = container === document.body;
        /* We're keeping track of a few different elements
     *
     * Container: the element that Backstretch was called on.
     * Wrap: a DIV that we place the image into, so we can hide the overflow.
     * Root: Convenience reference to help calculate the correct height.
     */
        this.$container = $(container);
        this.$root = this.isBody ? supportsFixedPosition ? $(window) : $(document) : this.$container;
        // Don't create a new wrap if one already exists (from a previous instance of Backstretch)
        var $existing = this.$container.children(".backstretch").first();
        this.$wrap = $existing.length ? $existing : $('<div class="backstretch"></div>').css(styles.wrap).appendTo(this.$container);
        // Non-body elements need some style adjustments
        if (!this.isBody) {
            // If the container is statically positioned, we need to make it relative,
            // and if no zIndex is defined, we should set it to zero.
            var position = this.$container.css("position"), zIndex = this.$container.css("zIndex");
            this.$container.css({
                position: position === "static" ? "relative" : position,
                zIndex: zIndex === "auto" ? 0 : zIndex,
                background: "none"
            });
            // Needs a higher z-index
            this.$wrap.css({
                zIndex: -999998
            });
        }
        // Fixed or absolute positioning?
        this.$wrap.css({
            position: this.isBody && supportsFixedPosition ? "fixed" : "absolute"
        });
        // Set the first image
        this.index = 0;
        this.show(this.index);
        // Listen for resize
        $(window).on("resize.backstretch", $.proxy(this.resize, this)).on("orientationchange.backstretch", $.proxy(function() {
            // Need to do this in order to get the right window height
            if (this.isBody && window.pageYOffset === 0) {
                window.scrollTo(0, 1);
                this.resize();
            }
        }, this));
    };
    /* PUBLIC METHODS
   * ========================= */
    Backstretch.prototype = {
        resize: function() {
            try {
                var bgCSS = {
                    left: 0,
                    top: 0
                }, rootWidth = this.isBody ? this.$root.width() : this.$root.innerWidth(), bgWidth = rootWidth, rootHeight = this.isBody ? window.innerHeight ? window.innerHeight : this.$root.height() : this.$root.innerHeight(), bgHeight = bgWidth / this.$img.data("ratio"), bgOffset;
                // Make adjustments based on image ratio
                if (bgHeight >= rootHeight) {
                    bgOffset = (bgHeight - rootHeight) / 2;
                    if (this.options.centeredY) {
                        bgCSS.top = "-" + bgOffset + "px";
                    }
                } else {
                    bgHeight = rootHeight;
                    bgWidth = bgHeight * this.$img.data("ratio");
                    bgOffset = (bgWidth - rootWidth) / 2;
                    if (this.options.centeredX) {
                        bgCSS.left = "-" + bgOffset + "px";
                    }
                }
                this.$wrap.css({
                    width: rootWidth,
                    height: rootHeight
                }).find("img:not(.deleteable)").css({
                    width: bgWidth,
                    height: bgHeight
                }).css(bgCSS);
            } catch (err) {}
            return this;
        },
        show: function(newIndex) {
            // Validate index
            if (Math.abs(newIndex) > this.images.length - 1) {
                return;
            }
            // Vars
            var self = this, oldImage = self.$wrap.find("img").addClass("deleteable"), evtOptions = {
                relatedTarget: self.$container[0]
            };
            // Trigger the "before" event
            self.$container.trigger($.Event("backstretch.before", evtOptions), [ self, newIndex ]);
            // Set the new index
            this.index = newIndex;
            // Pause the slideshow
            clearInterval(self.interval);
            // New image
            self.$img = $("<img />").css(styles.img).bind("load", function(e) {
                var imgWidth = this.width || $(e.target).width(), imgHeight = this.height || $(e.target).height();
                // Save the ratio
                $(this).data("ratio", imgWidth / imgHeight);
                // Show the image, then delete the old one
                // "speed" option has been deprecated, but we want backwards compatibilty
                $(this).fadeIn(self.options.speed || self.options.fade, function() {
                    oldImage.remove();
                    // Resume the slideshow
                    if (!self.paused) {
                        self.cycle();
                    }
                    // Trigger the "after" and "show" events
                    // "show" is being deprecated
                    $([ "after", "show" ]).each(function() {
                        self.$container.trigger($.Event("backstretch." + this, evtOptions), [ self, newIndex ]);
                    });
                });
                // Resize
                self.resize();
            }).appendTo(self.$wrap);
            // Hack for IE img onload event
            self.$img.attr("src", self.images[newIndex]);
            return self;
        },
        next: function() {
            // Next slide
            return this.show(this.index < this.images.length - 1 ? this.index + 1 : 0);
        },
        prev: function() {
            // Previous slide
            return this.show(this.index === 0 ? this.images.length - 1 : this.index - 1);
        },
        pause: function() {
            // Pause the slideshow
            this.paused = true;
            return this;
        },
        resume: function() {
            // Resume the slideshow
            this.paused = false;
            this.next();
            return this;
        },
        cycle: function() {
            // Start/resume the slideshow
            if (this.images.length > 1) {
                // Clear the interval, just in case
                clearInterval(this.interval);
                this.interval = setInterval($.proxy(function() {
                    // Check for paused slideshow
                    if (!this.paused) {
                        this.next();
                    }
                }, this), this.options.duration);
            }
            return this;
        },
        destroy: function(preserveBackground) {
            // Stop the resize events
            $(window).off("resize.backstretch orientationchange.backstretch");
            // Clear the interval
            clearInterval(this.interval);
            // Remove Backstretch
            if (!preserveBackground) {
                this.$wrap.remove();
            }
            this.$container.removeData("backstretch");
        }
    };
    /* SUPPORTS FIXED POSITION?
   *
   * Based on code from jQuery Mobile 1.1.0
   * http://jquerymobile.com/
   *
   * In a nutshell, we need to figure out if fixed positioning is supported.
   * Unfortunately, this is very difficult to do on iOS, and usually involves
   * injecting content, scrolling the page, etc.. It's ugly.
   * jQuery Mobile uses this workaround. It's not ideal, but works.
   *
   * Modified to detect IE6
   * ========================= */
    var supportsFixedPosition = function() {
        var ua = navigator.userAgent, platform = navigator.platform, wkmatch = ua.match(/AppleWebKit\/([0-9]+)/), wkversion = !!wkmatch && wkmatch[1], ffmatch = ua.match(/Fennec\/([0-9]+)/), ffversion = !!ffmatch && ffmatch[1], operammobilematch = ua.match(/Opera Mobi\/([0-9]+)/), omversion = !!operammobilematch && operammobilematch[1], iematch = ua.match(/MSIE ([0-9]+)/), ieversion = !!iematch && iematch[1];
        return !(// iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
        (platform.indexOf("iPhone") > -1 || platform.indexOf("iPad") > -1 || platform.indexOf("iPod") > -1) && wkversion && wkversion < 534 || // Opera Mini
        window.operamini && {}.toString.call(window.operamini) === "[object OperaMini]" || operammobilematch && omversion < 7458 || //Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
        ua.indexOf("Android") > -1 && wkversion && wkversion < 533 || // Firefox Mobile before 6.0 -
        ffversion && ffversion < 6 || // WebOS less than 3
        "palmGetResource" in window && wkversion && wkversion < 534 || // MeeGo
        ua.indexOf("MeeGo") > -1 && ua.indexOf("NokiaBrowser/8.5.0") > -1 || // IE6
        ieversion && ieversion <= 6);
    }();
})(jQuery, window);

/**
 * Bridget makes jQuery widgets
 * v1.0.1
 */
(function(window) {
    "use strict";
    // -------------------------- utils -------------------------- //
    var slice = Array.prototype.slice;
    function noop() {}
    // -------------------------- definition -------------------------- //
    function defineBridget($) {
        // bail if no jQuery
        if (!$) {
            return;
        }
        // -------------------------- addOptionMethod -------------------------- //
        /**
 * adds option method -> $().plugin('option', {...})
 * @param {Function} PluginClass - constructor class
 */
        function addOptionMethod(PluginClass) {
            // don't overwrite original option method
            if (PluginClass.prototype.option) {
                return;
            }
            // option setter
            PluginClass.prototype.option = function(opts) {
                // bail out if not an object
                if (!$.isPlainObject(opts)) {
                    return;
                }
                this.options = $.extend(true, this.options, opts);
            };
        }
        // -------------------------- plugin bridge -------------------------- //
        // helper function for logging errors
        // $.error breaks jQuery chaining
        var logError = typeof console === "undefined" ? noop : function(message) {
            console.error(message);
        };
        /**
 * jQuery plugin bridge, access methods like $elem.plugin('method')
 * @param {String} namespace - plugin name
 * @param {Function} PluginClass - constructor class
 */
        function bridge(namespace, PluginClass) {
            // add to jQuery fn namespace
            $.fn[namespace] = function(options) {
                if (typeof options === "string") {
                    // call plugin method when first argument is a string
                    // get arguments for method
                    var args = slice.call(arguments, 1);
                    for (var i = 0, len = this.length; i < len; i++) {
                        var elem = this[i];
                        var instance = $.data(elem, namespace);
                        if (!instance) {
                            logError("cannot call methods on " + namespace + " prior to initialization; " + "attempted to call '" + options + "'");
                            continue;
                        }
                        if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                            logError("no such method '" + options + "' for " + namespace + " instance");
                            continue;
                        }
                        // trigger method with arguments
                        var returnValue = instance[options].apply(instance, args);
                        // break look and return first value if provided
                        if (returnValue !== undefined) {
                            return returnValue;
                        }
                    }
                    // return this if no return value
                    return this;
                } else {
                    return this.each(function() {
                        var instance = $.data(this, namespace);
                        if (instance) {
                            // apply options & init
                            instance.option(options);
                            instance._init();
                        } else {
                            // initialize new instance
                            instance = new PluginClass(this, options);
                            $.data(this, namespace, instance);
                        }
                    });
                }
            };
        }
        // -------------------------- bridget -------------------------- //
        /**
 * converts a Prototypical class into a proper jQuery plugin
 *   the class must have a ._init method
 * @param {String} namespace - plugin name, used in $().pluginName
 * @param {Function} PluginClass - constructor class
 */
        $.bridget = function(namespace, PluginClass) {
            addOptionMethod(PluginClass);
            bridge(namespace, PluginClass);
        };
        return $.bridget;
    }
    // transport
    if (typeof define === "function" && define.amd) {
        // AMD
        define([ "jquery" ], defineBridget);
    } else {
        // get jquery from browser global
        defineBridget(window.jQuery);
    }
})(window);

/**
 * Outlayer Item
**/
(function(window) {
    "use strict";
    // ----- get style ----- //
    var defView = document.defaultView;
    var getStyle = defView && defView.getComputedStyle ? function(elem) {
        return defView.getComputedStyle(elem, null);
    } : function(elem) {
        return elem.currentStyle;
    };
    // extend objects
    function extend(a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    }
    function isEmptyObj(obj) {
        for (var prop in obj) {
            return false;
        }
        prop = null;
        return true;
    }
    // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
    function toDash(str) {
        return str.replace(/([A-Z])/g, function($1) {
            return "-" + $1.toLowerCase();
        });
    }
    // -------------------------- Outlayer definition -------------------------- //
    function outlayerItemDefinition(EventEmitter, getSize, getStyleProperty) {
        // -------------------------- CSS3 support -------------------------- //
        var transitionProperty = getStyleProperty("transition");
        var transformProperty = getStyleProperty("transform");
        var supportsCSS3 = transitionProperty && transformProperty;
        var is3d = !!getStyleProperty("perspective");
        var transitionEndEvent = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "otransitionend",
            transition: "transitionend"
        }[transitionProperty];
        // properties that could have vendor prefix
        var prefixableProperties = [ "transform", "transition", "transitionDuration", "transitionProperty" ];
        // cache all vendor properties
        var vendorProperties = function() {
            var cache = {};
            for (var i = 0, len = prefixableProperties.length; i < len; i++) {
                var prop = prefixableProperties[i];
                var supportedProp = getStyleProperty(prop);
                if (supportedProp && supportedProp !== prop) {
                    cache[prop] = supportedProp;
                }
            }
            return cache;
        }();
        // -------------------------- Item -------------------------- //
        function Item(element, layout) {
            if (!element) {
                return;
            }
            this.element = element;
            // parent layout class, i.e. Masonry, Isotope, or Packery
            this.layout = layout;
            this.position = {
                x: 0,
                y: 0
            };
            this._create();
        }
        // inherit EventEmitter
        extend(Item.prototype, EventEmitter.prototype);
        Item.prototype._create = function() {
            // transition objects
            this._transition = {
                ingProperties: {},
                clean: {},
                onEnd: {}
            };
            this.css({
                position: "absolute"
            });
        };
        // trigger specified handler for event type
        Item.prototype.handleEvent = function(event) {
            var method = "on" + event.type;
            if (this[method]) {
                this[method](event);
            }
        };
        Item.prototype.getSize = function() {
            this.size = getSize(this.element);
        };
        /**
 * apply CSS styles to element
 * @param {Object} style
 */
        Item.prototype.css = function(style) {
            var elemStyle = this.element.style;
            for (var prop in style) {
                // use vendor property if available
                var supportedProp = vendorProperties[prop] || prop;
                elemStyle[supportedProp] = style[prop];
            }
        };
        // measure position, and sets it
        Item.prototype.getPosition = function() {
            var style = getStyle(this.element);
            var layoutOptions = this.layout.options;
            var isOriginLeft = layoutOptions.isOriginLeft;
            var isOriginTop = layoutOptions.isOriginTop;
            var x = parseInt(style[isOriginLeft ? "left" : "right"], 10);
            var y = parseInt(style[isOriginTop ? "top" : "bottom"], 10);
            // clean up 'auto' or other non-integer values
            x = isNaN(x) ? 0 : x;
            y = isNaN(y) ? 0 : y;
            // remove padding from measurement
            var layoutSize = this.layout.size;
            x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
            y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;
            this.position.x = x;
            this.position.y = y;
        };
        // set settled position, apply padding
        Item.prototype.layoutPosition = function() {
            var layoutSize = this.layout.size;
            var layoutOptions = this.layout.options;
            var style = {};
            if (layoutOptions.isOriginLeft) {
                style.left = this.position.x + layoutSize.paddingLeft + "px";
                // reset other property
                style.right = "";
            } else {
                style.right = this.position.x + layoutSize.paddingRight + "px";
                style.left = "";
            }
            if (layoutOptions.isOriginTop) {
                style.top = this.position.y + layoutSize.paddingTop + "px";
                style.bottom = "";
            } else {
                style.bottom = this.position.y + layoutSize.paddingBottom + "px";
                style.top = "";
            }
            this.css(style);
            this.emitEvent("layout", [ this ]);
        };
        // transform translate function
        var translate = is3d ? function(x, y) {
            return "translate3d(" + x + "px, " + y + "px, 0)";
        } : function(x, y) {
            return "translate(" + x + "px, " + y + "px)";
        };
        Item.prototype._transitionTo = function(x, y) {
            this.getPosition();
            // get current x & y from top/left
            var curX = this.position.x;
            var curY = this.position.y;
            var compareX = parseInt(x, 10);
            var compareY = parseInt(y, 10);
            var didNotMove = compareX === this.position.x && compareY === this.position.y;
            // save end position
            this.setPosition(x, y);
            // if did not move and not transitioning, just go to layout
            if (didNotMove && !this.isTransitioning) {
                this.layoutPosition();
                return;
            }
            var transX = x - curX;
            var transY = y - curY;
            var transitionStyle = {};
            // flip cooridinates if origin on right or bottom
            var layoutOptions = this.layout.options;
            transX = layoutOptions.isOriginLeft ? transX : -transX;
            transY = layoutOptions.isOriginTop ? transY : -transY;
            transitionStyle.transform = translate(transX, transY);
            this.transition({
                to: transitionStyle,
                onTransitionEnd: {
                    transform: this.layoutPosition
                },
                isCleaning: true
            });
        };
        // non transition + transform support
        Item.prototype.goTo = function(x, y) {
            this.setPosition(x, y);
            this.layoutPosition();
        };
        // use transition and transforms if supported
        Item.prototype.moveTo = supportsCSS3 ? Item.prototype._transitionTo : Item.prototype.goTo;
        Item.prototype.setPosition = function(x, y) {
            this.position.x = parseInt(x, 10);
            this.position.y = parseInt(y, 10);
        };
        // ----- transition ----- //
        /**
 * @param {Object} style - CSS
 * @param {Function} onTransitionEnd
 */
        // non transition, just trigger callback
        Item.prototype._nonTransition = function(args) {
            this.css(args.to);
            if (args.isCleaning) {
                this._removeStyles(args.to);
            }
            for (var prop in args.onTransitionEnd) {
                args.onTransitionEnd[prop].call(this);
            }
        };
        /**
 * proper transition
 * @param {Object} args - arguments
 *   @param {Object} to - style to transition to
 *   @param {Object} from - style to start transition from
 *   @param {Boolean} isCleaning - removes transition styles after transition
 *   @param {Function} onTransitionEnd - callback
 */
        Item.prototype._transition = function(args) {
            // redirect to nonTransition if no transition duration
            if (!parseFloat(this.layout.options.transitionDuration)) {
                this._nonTransition(args);
                return;
            }
            var _transition = this._transition;
            // keep track of onTransitionEnd callback by css property
            for (var prop in args.onTransitionEnd) {
                _transition.onEnd[prop] = args.onTransitionEnd[prop];
            }
            // keep track of properties that are transitioning
            for (prop in args.to) {
                _transition.ingProperties[prop] = true;
                // keep track of properties to clean up when transition is done
                if (args.isCleaning) {
                    _transition.clean[prop] = true;
                }
            }
            // set from styles
            if (args.from) {
                this.css(args.from);
                // force redraw. http://blog.alexmaccaw.com/css-transitions
                var h = this.element.offsetHeight;
                // hack for JSHint to hush about unused var
                h = null;
            }
            // enable transition
            this.enableTransition(args.to);
            // set styles that are transitioning
            this.css(args.to);
            this.isTransitioning = true;
        };
        var itemTransitionProperties = transformProperty && toDash(transformProperty) + ",opacity";
        Item.prototype.enableTransition = function() {
            // only enable if not already transitioning
            // bug in IE10 were re-setting transition style will prevent
            // transitionend event from triggering
            if (this.isTransitioning) {
                return;
            }
            // make transition: foo, bar, baz from style object
            // TODO uncomment this bit when IE10 bug is resolved
            // var transitionValue = [];
            // for ( var prop in style ) {
            //   // dash-ify camelCased properties like WebkitTransition
            //   transitionValue.push( toDash( prop ) );
            // }
            // enable transition styles
            // HACK always enable transform,opacity for IE10
            this.css({
                transitionProperty: itemTransitionProperties,
                transitionDuration: this.layout.options.transitionDuration
            });
            // listen for transition end event
            this.element.addEventListener(transitionEndEvent, this, false);
        };
        Item.prototype.transition = Item.prototype[transitionProperty ? "_transition" : "_nonTransition"];
        // ----- events ----- //
        Item.prototype.onwebkitTransitionEnd = function(event) {
            this.ontransitionend(event);
        };
        Item.prototype.onotransitionend = function(event) {
            this.ontransitionend(event);
        };
        // properties that I munge to make my life easier
        var dashedVendorProperties = {
            "-webkit-transform": "transform",
            "-moz-transform": "transform",
            "-o-transform": "transform"
        };
        Item.prototype.ontransitionend = function(event) {
            // disregard bubbled events from children
            if (event.target !== this.element) {
                return;
            }
            var _transition = this._transition;
            // get property name of transitioned property, convert to prefix-free
            var propertyName = dashedVendorProperties[event.propertyName] || event.propertyName;
            // remove property that has completed transitioning
            delete _transition.ingProperties[propertyName];
            // check if any properties are still transitioning
            if (isEmptyObj(_transition.ingProperties)) {
                // all properties have completed transitioning
                this.disableTransition();
            }
            // clean style
            if (propertyName in _transition.clean) {
                // clean up style
                this.element.style[event.propertyName] = "";
                delete _transition.clean[propertyName];
            }
            // trigger onTransitionEnd callback
            if (propertyName in _transition.onEnd) {
                var onTransitionEnd = _transition.onEnd[propertyName];
                onTransitionEnd.call(this);
                delete _transition.onEnd[propertyName];
            }
            this.emitEvent("transitionEnd", [ this ]);
        };
        Item.prototype.disableTransition = function() {
            this.removeTransitionStyles();
            this.element.removeEventListener(transitionEndEvent, this, false);
            this.isTransitioning = false;
        };
        /**
 * removes style property from element
 * @param {Object} style
**/
        Item.prototype._removeStyles = function(style) {
            // clean up transition styles
            var cleanStyle = {};
            for (var prop in style) {
                cleanStyle[prop] = "";
            }
            this.css(cleanStyle);
        };
        var cleanTransitionStyle = {
            transitionProperty: "",
            transitionDuration: ""
        };
        Item.prototype.removeTransitionStyles = function() {
            // remove transition
            this.css(cleanTransitionStyle);
        };
        // ----- show/hide/remove ----- //
        // remove element from DOM
        Item.prototype.removeElem = function() {
            this.element.parentNode.removeChild(this.element);
            this.emitEvent("remove", [ this ]);
        };
        Item.prototype.remove = function() {
            // just remove element if no transition support or no transition
            if (!transitionProperty || !parseFloat(this.layout.options.transitionDuration)) {
                this.removeElem();
                return;
            }
            // start transition
            var _this = this;
            this.on("transitionEnd", function() {
                _this.removeElem();
                return true;
            });
            this.hide();
        };
        Item.prototype.reveal = function() {
            delete this.isHidden;
            // remove display: none
            this.css({
                display: ""
            });
            var options = this.layout.options;
            this.transition({
                from: options.hiddenStyle,
                to: options.visibleStyle,
                isCleaning: true
            });
        };
        Item.prototype.hide = function() {
            // set flag
            this.isHidden = true;
            // remove display: none
            this.css({
                display: ""
            });
            var options = this.layout.options;
            this.transition({
                from: options.visibleStyle,
                to: options.hiddenStyle,
                // keep hidden stuff hidden
                isCleaning: true,
                onTransitionEnd: {
                    opacity: function() {
                        // check if still hidden
                        // during transition, item may have been un-hidden
                        if (this.isHidden) {
                            this.css({
                                display: "none"
                            });
                        }
                    }
                }
            });
        };
        Item.prototype.destroy = function() {
            this.css({
                position: "",
                left: "",
                right: "",
                top: "",
                bottom: "",
                transition: "",
                transform: ""
            });
        };
        return Item;
    }
    // -------------------------- transport -------------------------- //
    if (typeof define === "function" && define.amd) {
        // AMD
        define([ "eventEmitter/EventEmitter", "get-size/get-size", "get-style-property/get-style-property" ], outlayerItemDefinition);
    } else {
        // browser global
        window.Outlayer = {};
        window.Outlayer.Item = outlayerItemDefinition(window.EventEmitter, window.getSize, window.getStyleProperty);
    }
})(window);

/**
 * Rect
 * low-level utility class for basic geometry
 */
(function(window) {
    "use strict";
    // -------------------------- Packery -------------------------- //
    // global namespace
    var Packery = window.Packery = function() {};
    function rectDefinition() {
        // -------------------------- Rect -------------------------- //
        function Rect(props) {
            // extend properties from defaults
            for (var prop in Rect.defaults) {
                this[prop] = Rect.defaults[prop];
            }
            for (prop in props) {
                this[prop] = props[prop];
            }
        }
        // make available
        Packery.Rect = Rect;
        Rect.defaults = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        /**
 * Determines whether or not this rectangle wholly encloses another rectangle or point.
 * @param {Rect} rect
 * @returns {Boolean}
**/
        Rect.prototype.contains = function(rect) {
            // points don't have width or height
            var otherWidth = rect.width || 0;
            var otherHeight = rect.height || 0;
            return this.x <= rect.x && this.y <= rect.y && this.x + this.width >= rect.x + otherWidth && this.y + this.height >= rect.y + otherHeight;
        };
        /**
 * Determines whether or not the rectangle intersects with another.
 * @param {Rect} rect
 * @returns {Boolean}
**/
        Rect.prototype.overlaps = function(rect) {
            var thisRight = this.x + this.width;
            var thisBottom = this.y + this.height;
            var rectRight = rect.x + rect.width;
            var rectBottom = rect.y + rect.height;
            // http://stackoverflow.com/a/306332
            return this.x < rectRight && thisRight > rect.x && this.y < rectBottom && thisBottom > rect.y;
        };
        /**
 * @param {Rect} rect - the overlapping rect
 * @returns {Array} freeRects - rects representing the area around the rect
**/
        Rect.prototype.getMaximalFreeRects = function(rect) {
            // if no intersection, return false
            if (!this.overlaps(rect)) {
                return false;
            }
            var freeRects = [];
            var freeRect;
            var thisRight = this.x + this.width;
            var thisBottom = this.y + this.height;
            var rectRight = rect.x + rect.width;
            var rectBottom = rect.y + rect.height;
            // top
            if (this.y < rect.y) {
                freeRect = new Rect({
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: rect.y - this.y
                });
                freeRects.push(freeRect);
            }
            // right
            if (thisRight > rectRight) {
                freeRect = new Rect({
                    x: rectRight,
                    y: this.y,
                    width: thisRight - rectRight,
                    height: this.height
                });
                freeRects.push(freeRect);
            }
            // bottom
            if (thisBottom > rectBottom) {
                freeRect = new Rect({
                    x: this.x,
                    y: rectBottom,
                    width: this.width,
                    height: thisBottom - rectBottom
                });
                freeRects.push(freeRect);
            }
            // left
            if (this.x < rect.x) {
                freeRect = new Rect({
                    x: this.x,
                    y: this.y,
                    width: rect.x - this.x,
                    height: this.height
                });
                freeRects.push(freeRect);
            }
            return freeRects;
        };
        Rect.prototype.canFit = function(rect) {
            return this.width >= rect.width && this.height >= rect.height;
        };
        return Rect;
    }
    // -------------------------- transport -------------------------- //
    if (typeof define === "function" && define.amd) {
        // AMD
        define(rectDefinition);
    } else {
        // browser global
        window.Packery = window.Packery || {};
        window.Packery.Rect = rectDefinition();
    }
})(window);

(function($) {
    "use strict";
    var methods = function() {
        // private properties and methods go here
        var c = {
            bcClass: "sf-breadcrumb",
            menuClass: "sf-js-enabled",
            anchorClass: "sf-with-ul",
            menuArrowClass: "sf-arrows"
        }, ios = function() {
            var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (ios) {
                // iOS clicks only bubble as far as body children
                $(window).load(function() {
                    $("body").children().on("click", $.noop);
                });
            }
            return ios;
        }(), wp7 = function() {
            var style = document.documentElement.style;
            return "behavior" in style && "fill" in style && /iemobile/i.test(navigator.userAgent);
        }(), toggleMenuClasses = function($menu, o) {
            var classes = c.menuClass;
            if (o.cssArrows) {
                classes += " " + c.menuArrowClass;
            }
            $menu.toggleClass(classes);
        }, setPathToCurrent = function($menu, o) {
            return $menu.find("li." + o.pathClass).slice(0, o.pathLevels).addClass(o.hoverClass + " " + c.bcClass).filter(function() {
                return $(this).children(o.popUpSelector).hide().show().length;
            }).removeClass(o.pathClass);
        }, toggleAnchorClass = function($li) {
            $li.children("a").toggleClass(c.anchorClass);
        }, toggleTouchAction = function($menu) {
            var touchAction = $menu.css("ms-touch-action");
            touchAction = touchAction === "pan-y" ? "auto" : "pan-y";
            $menu.css("ms-touch-action", touchAction);
        }, applyHandlers = function($menu, o) {
            var targets = "li:has(" + o.popUpSelector + ")";
            if ($.fn.hoverIntent && !o.disableHI) {
                $menu.hoverIntent(over, out, targets);
            } else {
                $menu.on("mouseenter.superfish", targets, over).on("mouseleave.superfish", targets, out);
            }
            var touchevent = "MSPointerDown.superfish";
            if (!ios) {
                touchevent += " touchend.superfish";
            }
            if (wp7) {
                touchevent += " mousedown.superfish";
            }
            $menu.on("focusin.superfish", "li", over).on("focusout.superfish", "li", out).on(touchevent, "a", o, touchHandler);
        }, touchHandler = function(e) {
            var $this = $(this), $ul = $this.siblings(e.data.popUpSelector);
            if ($ul.length > 0 && $ul.is(":hidden")) {
                $this.one("click.superfish", false);
                if (e.type === "MSPointerDown") {
                    $this.trigger("focus");
                } else {
                    $.proxy(over, $this.parent("li"))();
                }
            }
        }, over = function() {
            var $this = $(this), o = getOptions($this);
            clearTimeout(o.sfTimer);
            $this.siblings().superfish("hide").end().superfish("show");
        }, out = function() {
            var $this = $(this), o = getOptions($this);
            if (ios) {
                $.proxy(close, $this, o)();
            } else {
                clearTimeout(o.sfTimer);
                o.sfTimer = setTimeout($.proxy(close, $this, o), o.delay);
            }
        }, close = function(o) {
            o.retainPath = $.inArray(this[0], o.$path) > -1;
            this.superfish("hide");
            if (!this.parents("." + o.hoverClass).length) {
                o.onIdle.call(getMenu(this));
                if (o.$path.length) {
                    $.proxy(over, o.$path)();
                }
            }
        }, getMenu = function($el) {
            return $el.closest("." + c.menuClass);
        }, getOptions = function($el) {
            return getMenu($el).data("sf-options");
        };
        return {
            // public methods
            hide: function(instant) {
                if (this.length) {
                    var $this = this, o = getOptions($this);
                    if (!o) {
                        return this;
                    }
                    var not = o.retainPath === true ? o.$path : "", $ul = $this.find("li." + o.hoverClass).add(this).not(not).removeClass(o.hoverClass).children(o.popUpSelector), speed = o.speedOut;
                    if (instant) {
                        $ul.show();
                        speed = 0;
                    }
                    o.retainPath = false;
                    o.onBeforeHide.call($ul);
                    $ul.stop(true, true).animate(o.animationOut, speed, function() {
                        var $this = $(this);
                        o.onHide.call($this);
                    });
                }
                return this;
            },
            show: function() {
                var o = getOptions(this);
                if (!o) {
                    return this;
                }
                var $this = this.addClass(o.hoverClass), $ul = $this.children(o.popUpSelector);
                o.onBeforeShow.call($ul);
                $ul.stop(true, true).animate(o.animation, o.speed, function() {
                    o.onShow.call($ul);
                });
                return this;
            },
            destroy: function() {
                return this.each(function() {
                    var $this = $(this), o = $this.data("sf-options"), $hasPopUp;
                    if (!o) {
                        return false;
                    }
                    $hasPopUp = $this.find(o.popUpSelector).parent("li");
                    clearTimeout(o.sfTimer);
                    toggleMenuClasses($this, o);
                    toggleAnchorClass($hasPopUp);
                    toggleTouchAction($this);
                    // remove event handlers
                    $this.off(".superfish").off(".hoverIntent");
                    // clear animation's inline display style
                    $hasPopUp.children(o.popUpSelector).attr("style", function(i, style) {
                        return style.replace(/display[^;]+;?/g, "");
                    });
                    // reset 'current' path classes
                    o.$path.removeClass(o.hoverClass + " " + c.bcClass).addClass(o.pathClass);
                    $this.find("." + o.hoverClass).removeClass(o.hoverClass);
                    o.onDestroy.call($this);
                    $this.removeData("sf-options");
                });
            },
            init: function(op) {
                return this.each(function() {
                    var $this = $(this);
                    if ($this.data("sf-options")) {
                        return false;
                    }
                    var o = $.extend({}, $.fn.superfish.defaults, op), $hasPopUp = $this.find(o.popUpSelector).parent("li");
                    o.$path = setPathToCurrent($this, o);
                    $this.data("sf-options", o);
                    toggleMenuClasses($this, o);
                    toggleAnchorClass($hasPopUp);
                    toggleTouchAction($this);
                    applyHandlers($this, o);
                    $hasPopUp.not("." + c.bcClass).superfish("hide", true);
                    o.onInit.call(this);
                });
            }
        };
    }();
    $.fn.superfish = function(method, args) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            return $.error("Method " + method + " does not exist on jQuery.fn.superfish");
        }
    };
    $.fn.superfish.defaults = {
        popUpSelector: "ul,.sf-mega",
        // within menu context
        hoverClass: "sfHover",
        pathClass: "overrideThisToUse",
        pathLevels: 1,
        delay: 800,
        animation: {
            opacity: "show"
        },
        animationOut: {
            opacity: "hide"
        },
        speed: "normal",
        speedOut: "fast",
        cssArrows: true,
        disableHI: false,
        onInit: $.noop,
        onBeforeShow: $.noop,
        onShow: $.noop,
        onBeforeHide: $.noop,
        onHide: $.noop,
        onIdle: $.noop,
        onDestroy: $.noop
    };
    // soon to be deprecated
    $.fn.extend({
        hideSuperfishUl: methods.hide,
        showSuperfishUl: methods.show
    });
})(jQuery);

/*!
 * Outlayer v1.1.9
 * the brains and guts of a layout library
 */
(function(window) {
    "use strict";
    // ----- vars ----- //
    var document = window.document;
    var console = window.console;
    var jQuery = window.jQuery;
    var noop = function() {};
    // -------------------------- helpers -------------------------- //
    // extend objects
    function extend(a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    }
    var objToString = Object.prototype.toString;
    function isArray(obj) {
        return objToString.call(obj) === "[object Array]";
    }
    // turn element or nodeList into an array
    function makeArray(obj) {
        var ary = [];
        if (isArray(obj)) {
            // use object if already an array
            ary = obj;
        } else if (obj && typeof obj.length === "number") {
            // convert nodeList to array
            for (var i = 0, len = obj.length; i < len; i++) {
                ary.push(obj[i]);
            }
        } else {
            // array of single index
            ary.push(obj);
        }
        return ary;
    }
    // http://stackoverflow.com/a/384380/182183
    var isElement = typeof HTMLElement === "object" ? function isElementDOM2(obj) {
        return obj instanceof HTMLElement;
    } : function isElementQuirky(obj) {
        return obj && typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string";
    };
    // index of helper cause IE8
    var indexOf = Array.prototype.indexOf ? function(ary, obj) {
        return ary.indexOf(obj);
    } : function(ary, obj) {
        for (var i = 0, len = ary.length; i < len; i++) {
            if (ary[i] === obj) {
                return i;
            }
        }
        return -1;
    };
    function removeFrom(obj, ary) {
        var index = indexOf(ary, obj);
        if (index !== -1) {
            ary.splice(index, 1);
        }
    }
    // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
    function toDashed(str) {
        return str.replace(/(.)([A-Z])/g, function(match, $1, $2) {
            return $1 + "-" + $2;
        }).toLowerCase();
    }
    function outlayerDefinition(eventie, docReady, EventEmitter, getSize, matchesSelector, Item) {
        // -------------------------- Outlayer -------------------------- //
        // globally unique identifiers
        var GUID = 0;
        // internal store of all Outlayer intances
        var instances = {};
        /**
 * @param {Element, String} element
 * @param {Object} options
 * @constructor
 */
        function Outlayer(element, options) {
            // use element as selector string
            if (typeof element === "string") {
                element = document.querySelector(element);
            }
            // bail out if not proper element
            if (!element || !isElement(element)) {
                if (console) {
                    console.error("Bad " + this.settings.namespace + " element: " + element);
                }
                return;
            }
            this.element = element;
            // options
            this.options = extend({}, this.options);
            this.option(options);
            // add id for Outlayer.getFromElement
            var id = ++GUID;
            this.element.outlayerGUID = id;
            // expando
            instances[id] = this;
            // associate via id
            // kick it off
            this._create();
            if (this.options.isInitLayout) {
                this.layout();
            }
        }
        // settings are for internal use only
        Outlayer.prototype.settings = {
            namespace: "outlayer",
            item: Item
        };
        // default options
        Outlayer.prototype.options = {
            containerStyle: {
                position: "relative"
            },
            isInitLayout: true,
            isOriginLeft: true,
            isOriginTop: true,
            isResizeBound: true,
            // item options
            transitionDuration: "0.4s",
            hiddenStyle: {
                opacity: 0,
                transform: "scale(0.001)"
            },
            visibleStyle: {
                opacity: 1,
                transform: "scale(1)"
            }
        };
        // inherit EventEmitter
        extend(Outlayer.prototype, EventEmitter.prototype);
        /**
 * set options
 * @param {Object} opts
 */
        Outlayer.prototype.option = function(opts) {
            extend(this.options, opts);
        };
        Outlayer.prototype._create = function() {
            // get items from children
            this.reloadItems();
            // elements that affect layout, but are not laid out
            this.stamps = [];
            this.stamp(this.options.stamp);
            // set container style
            extend(this.element.style, this.options.containerStyle);
            // bind resize method
            if (this.options.isResizeBound) {
                this.bindResize();
            }
        };
        // goes through all children again and gets bricks in proper order
        Outlayer.prototype.reloadItems = function() {
            // collection of item elements
            this.items = this._itemize(this.element.children);
        };
        /**
 * turn elements into Outlayer.Items to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Outlayer Items
 */
        Outlayer.prototype._itemize = function(elems) {
            var itemElems = this._filterFindItemElements(elems);
            var Item = this.settings.item;
            // create new Outlayer Items for collection
            var items = [];
            for (var i = 0, len = itemElems.length; i < len; i++) {
                var elem = itemElems[i];
                var item = new Item(elem, this);
                items.push(item);
            }
            return items;
        };
        /**
 * get item elements to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - item elements
 */
        Outlayer.prototype._filterFindItemElements = function(elems) {
            // make array of elems
            elems = makeArray(elems);
            var itemSelector = this.options.itemSelector;
            var itemElems = [];
            for (var i = 0, len = elems.length; i < len; i++) {
                var elem = elems[i];
                // check that elem is an actual element
                if (!isElement(elem)) {
                    continue;
                }
                // filter & find items if we have an item selector
                if (itemSelector) {
                    // filter siblings
                    if (matchesSelector(elem, itemSelector)) {
                        itemElems.push(elem);
                    }
                    // find children
                    var childElems = elem.querySelectorAll(itemSelector);
                    // concat childElems to filterFound array
                    for (var j = 0, jLen = childElems.length; j < jLen; j++) {
                        itemElems.push(childElems[j]);
                    }
                } else {
                    itemElems.push(elem);
                }
            }
            return itemElems;
        };
        /**
 * getter method for getting item elements
 * @returns {Array} elems - collection of item elements
 */
        Outlayer.prototype.getItemElements = function() {
            var elems = [];
            for (var i = 0, len = this.items.length; i < len; i++) {
                elems.push(this.items[i].element);
            }
            return elems;
        };
        // ----- init & layout ----- //
        /**
 * lays out all items
 */
        Outlayer.prototype.layout = function() {
            this._resetLayout();
            this._manageStamps();
            // don't animate first layout
            var isInstant = this.options.isLayoutInstant !== undefined ? this.options.isLayoutInstant : !this._isLayoutInited;
            this.layoutItems(this.items, isInstant);
            // flag for initalized
            this._isLayoutInited = true;
        };
        // _init is alias for layout
        Outlayer.prototype._init = Outlayer.prototype.layout;
        /**
 * logic before any new layout
 */
        Outlayer.prototype._resetLayout = function() {
            this.getSize();
        };
        Outlayer.prototype.getSize = function() {
            this.size = getSize(this.element);
        };
        /**
 * get measurement from option, for columnWidth, rowHeight, gutter
 * if option is String -> get element from selector string, & get size of element
 * if option is Element -> get size of element
 * else use option as a number
 *
 * @param {String} measurement
 * @param {String} size - width or height
 * @private
 */
        Outlayer.prototype._getMeasurement = function(measurement, size) {
            var option = this.options[measurement];
            var elem;
            if (!option) {
                // default to 0
                this[measurement] = 0;
            } else {
                if (typeof option === "string") {
                    elem = this.element.querySelector(option);
                } else if (isElement(option)) {
                    elem = option;
                }
                // use size of element, if element
                this[measurement] = elem ? getSize(elem)[size] : option;
            }
        };
        /**
 * layout a collection of item elements
 * @api public
 */
        Outlayer.prototype.layoutItems = function(items, isInstant) {
            items = this._getItemsForLayout(items);
            this._layoutItems(items, isInstant);
            this._postLayout();
        };
        /**
 * get the items to be laid out
 * you may want to skip over some items
 * @param {Array} items
 * @returns {Array} items
 */
        Outlayer.prototype._getItemsForLayout = function(items) {
            var layoutItems = [];
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                if (!item.isIgnored) {
                    layoutItems.push(item);
                }
            }
            return layoutItems;
        };
        /**
 * layout items
 * @param {Array} items
 * @param {Boolean} isInstant
 */
        Outlayer.prototype._layoutItems = function(items, isInstant) {
            if (!items || !items.length) {
                // no items, emit event with empty array
                this.emitEvent("layoutComplete", [ this, items ]);
                return;
            }
            // emit layoutComplete when done
            this._itemsOn(items, "layout", function onItemsLayout() {
                this.emitEvent("layoutComplete", [ this, items ]);
            });
            var queue = [];
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                // get x/y object from method
                var position = this._getItemLayoutPosition(item);
                // enqueue
                position.item = item;
                position.isInstant = isInstant;
                queue.push(position);
            }
            this._processLayoutQueue(queue);
        };
        /**
 * get item layout position
 * @param {Outlayer.Item} item
 * @returns {Object} x and y position
 */
        Outlayer.prototype._getItemLayoutPosition = function() {
            return {
                x: 0,
                y: 0
            };
        };
        /**
 * iterate over array and position each item
 * Reason being - separating this logic prevents 'layout invalidation'
 * thx @paul_irish
 * @param {Array} queue
 */
        Outlayer.prototype._processLayoutQueue = function(queue) {
            for (var i = 0, len = queue.length; i < len; i++) {
                var obj = queue[i];
                this._positionItem(obj.item, obj.x, obj.y, obj.isInstant);
            }
        };
        /**
 * Sets position of item in DOM
 * @param {Outlayer.Item} item
 * @param {Number} x - horizontal position
 * @param {Number} y - vertical position
 * @param {Boolean} isInstant - disables transitions
 */
        Outlayer.prototype._positionItem = function(item, x, y, isInstant) {
            if (isInstant) {
                // if not transition, just set CSS
                item.goTo(x, y);
            } else {
                item.moveTo(x, y);
            }
        };
        /**
 * Any logic you want to do after each layout,
 * i.e. size the container
 */
        Outlayer.prototype._postLayout = function() {
            var size = this._getContainerSize();
            if (size) {
                this._setContainerMeasure(size.width, true);
                this._setContainerMeasure(size.height, false);
            }
        };
        /**
 * @returns {Object} size
 *   @param {Number} width
 *   @param {Number} height
 */
        Outlayer.prototype._getContainerSize = noop;
        /**
 * @param {Number} measure - size of width or height
 * @param {Boolean} isWidth
 */
        Outlayer.prototype._setContainerMeasure = function(measure, isWidth) {
            if (measure === undefined) {
                return;
            }
            var elemSize = this.size;
            // add padding and border width if border box
            if (elemSize.isBorderBox) {
                measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight + elemSize.borderLeftWidth + elemSize.borderRightWidth : elemSize.paddingBottom + elemSize.paddingTop + elemSize.borderTopWidth + elemSize.borderBottomWidth;
            }
            measure = Math.max(measure, 0);
            this.element.style[isWidth ? "width" : "height"] = measure + "px";
        };
        /**
 * trigger a callback for a collection of items events
 * @param {Array} items - Outlayer.Items
 * @param {String} eventName
 * @param {Function} callback
 */
        Outlayer.prototype._itemsOn = function(items, eventName, callback) {
            var doneCount = 0;
            var count = items.length;
            // event callback
            var _this = this;
            function tick() {
                doneCount++;
                if (doneCount === count) {
                    callback.call(_this);
                }
                return true;
            }
            // bind callback
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                item.on(eventName, tick);
            }
        };
        // -------------------------- ignore & stamps -------------------------- //
        /**
 * keep item in collection, but do not lay it out
 * ignored items do not get skipped in layout
 * @param {Element} elem
 */
        Outlayer.prototype.ignore = function(elem) {
            var item = this.getItem(elem);
            if (item) {
                item.isIgnored = true;
            }
        };
        /**
 * return item to layout collection
 * @param {Element} elem
 */
        Outlayer.prototype.unignore = function(elem) {
            var item = this.getItem(elem);
            if (item) {
                delete item.isIgnored;
            }
        };
        /**
 * adds elements to stamps
 * @param {NodeList, Array, Element, or String} elems
 */
        Outlayer.prototype.stamp = function(elems) {
            elems = this._find(elems);
            if (!elems) {
                return;
            }
            this.stamps = this.stamps.concat(elems);
            // ignore
            for (var i = 0, len = elems.length; i < len; i++) {
                var elem = elems[i];
                this.ignore(elem);
            }
        };
        /**
 * removes elements to stamps
 * @param {NodeList, Array, or Element} elems
 */
        Outlayer.prototype.unstamp = function(elems) {
            elems = this._find(elems);
            if (!elems) {
                return;
            }
            for (var i = 0, len = elems.length; i < len; i++) {
                var elem = elems[i];
                // filter out removed stamp elements
                removeFrom(elem, this.stamps);
                this.unignore(elem);
            }
        };
        /**
 * finds child elements
 * @param {NodeList, Array, Element, or String} elems
 * @returns {Array} elems
 */
        Outlayer.prototype._find = function(elems) {
            if (!elems) {
                return;
            }
            // if string, use argument as selector string
            if (typeof elems === "string") {
                elems = this.element.querySelectorAll(elems);
            }
            elems = makeArray(elems);
            return elems;
        };
        Outlayer.prototype._manageStamps = function() {
            if (!this.stamps || !this.stamps.length) {
                return;
            }
            this._getBoundingRect();
            for (var i = 0, len = this.stamps.length; i < len; i++) {
                var stamp = this.stamps[i];
                this._manageStamp(stamp);
            }
        };
        // update boundingLeft / Top
        Outlayer.prototype._getBoundingRect = function() {
            // get bounding rect for container element
            var boundingRect = this.element.getBoundingClientRect();
            var size = this.size;
            this._boundingRect = {
                left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
                top: boundingRect.top + size.paddingTop + size.borderTopWidth,
                right: boundingRect.right - (size.paddingRight + size.borderRightWidth),
                bottom: boundingRect.bottom - (size.paddingBottom + size.borderBottomWidth)
            };
        };
        /**
 * @param {Element} stamp
**/
        Outlayer.prototype._manageStamp = noop;
        /**
 * get x/y position of element relative to container element
 * @param {Element} elem
 * @returns {Object} offset - has left, top, right, bottom
 */
        Outlayer.prototype._getElementOffset = function(elem) {
            var boundingRect = elem.getBoundingClientRect();
            var thisRect = this._boundingRect;
            var size = getSize(elem);
            var offset = {
                left: boundingRect.left - thisRect.left - size.marginLeft,
                top: boundingRect.top - thisRect.top - size.marginTop,
                right: thisRect.right - boundingRect.right - size.marginRight,
                bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
            };
            return offset;
        };
        // -------------------------- resize -------------------------- //
        // enable event handlers for listeners
        // i.e. resize -> onresize
        Outlayer.prototype.handleEvent = function(event) {
            var method = "on" + event.type;
            if (this[method]) {
                this[method](event);
            }
        };
        /**
 * Bind layout to window resizing
 */
        Outlayer.prototype.bindResize = function() {
            // bind just one listener
            if (this.isResizeBound) {
                return;
            }
            eventie.bind(window, "resize", this);
            this.isResizeBound = true;
        };
        /**
 * Unbind layout to window resizing
 */
        Outlayer.prototype.unbindResize = function() {
            eventie.unbind(window, "resize", this);
            this.isResizeBound = false;
        };
        // original debounce by John Hann
        // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
        // this fires every resize
        Outlayer.prototype.onresize = function() {
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            var _this = this;
            function delayed() {
                _this.resize();
                delete _this.resizeTimeout;
            }
            this.resizeTimeout = setTimeout(delayed, 100);
        };
        // debounced, layout on resize
        Outlayer.prototype.resize = function() {
            // don't trigger if size did not change
            var size = getSize(this.element);
            // check that this.size and size are there
            // IE8 triggers resize on body size change, so they might not be
            var hasSizes = this.size && size;
            if (hasSizes && size.innerWidth === this.size.innerWidth) {
                return;
            }
            this.layout();
        };
        // -------------------------- methods -------------------------- //
        /**
 * add items to Outlayer instance
 * @param {Array or NodeList or Element} elems
 * @returns {Array} items - Outlayer.Items
**/
        Outlayer.prototype.addItems = function(elems) {
            var items = this._itemize(elems);
            // add items to collection
            if (items.length) {
                this.items = this.items.concat(items);
            }
            return items;
        };
        /**
 * Layout newly-appended item elements
 * @param {Array or NodeList or Element} elems
 */
        Outlayer.prototype.appended = function(elems) {
            var items = this.addItems(elems);
            if (!items.length) {
                return;
            }
            // layout and reveal just the new items
            this.layoutItems(items, true);
            this.reveal(items);
        };
        /**
 * Layout prepended elements
 * @param {Array or NodeList or Element} elems
 */
        Outlayer.prototype.prepended = function(elems) {
            var items = this._itemize(elems);
            if (!items.length) {
                return;
            }
            // add items to beginning of collection
            var previousItems = this.items.slice(0);
            this.items = items.concat(previousItems);
            // start new layout
            this._resetLayout();
            this._manageStamps();
            // layout new stuff without transition
            this.layoutItems(items, true);
            this.reveal(items);
            // layout previous items
            this.layoutItems(previousItems);
        };
        /**
 * reveal a collection of items
 * @param {Array of Outlayer.Items} items
 */
        Outlayer.prototype.reveal = function(items) {
            if (!items || !items.length) {
                return;
            }
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                item.reveal();
            }
        };
        /**
 * hide a collection of items
 * @param {Array of Outlayer.Items} items
 */
        Outlayer.prototype.hide = function(items) {
            if (!items || !items.length) {
                return;
            }
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                item.hide();
            }
        };
        /**
 * get Outlayer.Item, given an Element
 * @param {Element} elem
 * @param {Function} callback
 * @returns {Outlayer.Item} item
 */
        Outlayer.prototype.getItem = function(elem) {
            // loop through items to get the one that matches
            for (var i = 0, len = this.items.length; i < len; i++) {
                var item = this.items[i];
                if (item.element === elem) {
                    // return item
                    return item;
                }
            }
        };
        /**
 * get collection of Outlayer.Items, given Elements
 * @param {Array} elems
 * @returns {Array} items - Outlayer.Items
 */
        Outlayer.prototype.getItems = function(elems) {
            if (!elems || !elems.length) {
                return;
            }
            var items = [];
            for (var i = 0, len = elems.length; i < len; i++) {
                var elem = elems[i];
                var item = this.getItem(elem);
                if (item) {
                    items.push(item);
                }
            }
            return items;
        };
        /**
 * remove element(s) from instance and DOM
 * @param {Array or NodeList or Element} elems
 */
        Outlayer.prototype.remove = function(elems) {
            elems = makeArray(elems);
            var removeItems = this.getItems(elems);
            // bail if no items to remove
            if (!removeItems || !removeItems.length) {
                return;
            }
            this._itemsOn(removeItems, "remove", function() {
                this.emitEvent("removeComplete", [ this, removeItems ]);
            });
            for (var i = 0, len = removeItems.length; i < len; i++) {
                var item = removeItems[i];
                item.remove();
                // remove item from collection
                removeFrom(item, this.items);
            }
        };
        // ----- destroy ----- //
        // remove and disable Outlayer instance
        Outlayer.prototype.destroy = function() {
            // clean up dynamic styles
            var style = this.element.style;
            style.height = "";
            style.position = "";
            style.width = "";
            // destroy items
            for (var i = 0, len = this.items.length; i < len; i++) {
                var item = this.items[i];
                item.destroy();
            }
            this.unbindResize();
            delete this.element.outlayerGUID;
            // remove data for jQuery
            if (jQuery) {
                jQuery.removeData(this.element, this.settings.namespace);
            }
        };
        // -------------------------- data -------------------------- //
        /**
 * get Outlayer instance from element
 * @param {Element} elem
 * @returns {Outlayer}
 */
        Outlayer.data = function(elem) {
            var id = elem && elem.outlayerGUID;
            return id && instances[id];
        };
        // --------------------------  -------------------------- //
        // copy an object on the Outlayer prototype
        // used in options and settings
        function copyOutlayerProto(obj, property) {
            obj.prototype[property] = extend({}, Outlayer.prototype[property]);
        }
        // -------------------------- create Outlayer class -------------------------- //
        /**
 * create a layout class
 * @param {String} namespace
 */
        Outlayer.create = function(namespace, options) {
            // sub-class Outlayer
            function Layout() {
                Outlayer.apply(this, arguments);
            }
            extend(Layout.prototype, Outlayer.prototype);
            copyOutlayerProto(Layout, "options");
            copyOutlayerProto(Layout, "settings");
            extend(Layout.prototype.options, options);
            Layout.prototype.settings.namespace = namespace;
            Layout.data = Outlayer.data;
            // sub-class Item
            Layout.Item = function LayoutItem() {
                Item.apply(this, arguments);
            };
            Layout.Item.prototype = new Item();
            Layout.prototype.settings.item = Layout.Item;
            // -------------------------- declarative -------------------------- //
            /**
   * allow user to initialize Outlayer via .js-namespace class
   * options are parsed from data-namespace-option attribute
   */
            docReady(function() {
                var dashedNamespace = toDashed(namespace);
                var elems = document.querySelectorAll(".js-" + dashedNamespace);
                var dataAttr = "data-" + dashedNamespace + "-options";
                for (var i = 0, len = elems.length; i < len; i++) {
                    var elem = elems[i];
                    var attr = elem.getAttribute(dataAttr);
                    var options;
                    try {
                        options = attr && JSON.parse(attr);
                    } catch (error) {
                        // log error, do not initialize
                        if (console) {
                            console.error("Error parsing " + dataAttr + " on " + elem.nodeName.toLowerCase() + (elem.id ? "#" + elem.id : "") + ": " + error);
                        }
                        continue;
                    }
                    // initialize
                    var instance = new Layout(elem, options);
                    // make available via $().data('layoutname')
                    if (jQuery) {
                        jQuery.data(elem, namespace, instance);
                    }
                }
            });
            // -------------------------- jQuery bridge -------------------------- //
            // make into jQuery plugin
            if (jQuery && jQuery.bridget) {
                jQuery.bridget(namespace, Layout);
            }
            return Layout;
        };
        // ----- fin ----- //
        // back in global
        Outlayer.Item = Item;
        return Outlayer;
    }
    // -------------------------- transport -------------------------- //
    if (typeof define === "function" && define.amd) {
        // AMD
        define([ "eventie/eventie", "doc-ready/doc-ready", "eventEmitter/EventEmitter", "get-size/get-size", "matches-selector/matches-selector", "./item" ], outlayerDefinition);
    } else {
        // browser global
        window.Outlayer = outlayerDefinition(window.eventie, window.docReady, window.EventEmitter, window.getSize, window.matchesSelector, window.Outlayer.Item);
    }
})(window);

/**
 * Packery Item Element
**/
(function(window) {
    "use strict";
    // -------------------------- Item -------------------------- //
    function itemDefinition(getStyleProperty, Outlayer, Rect) {
        var transformProperty = getStyleProperty("transform");
        // sub-class Item
        var Item = function PackeryItem() {
            Outlayer.Item.apply(this, arguments);
        };
        Item.prototype = new Outlayer.Item();
        var protoCreate = Item.prototype._create;
        Item.prototype._create = function() {
            // call default _create logic
            protoCreate.call(this);
            this.rect = new Rect();
            // rect used for placing, in drag or Packery.fit()
            this.placeRect = new Rect();
        };
        // -------------------------- drag -------------------------- //
        Item.prototype.dragStart = function() {
            this.getPosition();
            this.removeTransitionStyles();
            // remove transform property from transition
            if (this.isTransitioning && transformProperty) {
                this.element.style[transformProperty] = "none";
            }
            this.getSize();
            // create place rect, used for position when dragged then dropped
            // or when positioning
            this.isPlacing = true;
            this.needsPositioning = false;
            this.positionPlaceRect(this.position.x, this.position.y);
            this.isTransitioning = false;
            this.didDrag = false;
        };
        /**
 * handle item when it is dragged
 * @param {Number} x - horizontal position of dragged item
 * @param {Number} y - vertical position of dragged item
 */
        Item.prototype.dragMove = function(x, y) {
            this.didDrag = true;
            var packerySize = this.layout.size;
            x -= packerySize.paddingLeft;
            y -= packerySize.paddingTop;
            this.positionPlaceRect(x, y);
        };
        Item.prototype.dragStop = function() {
            this.getPosition();
            var isDiffX = this.position.x !== this.placeRect.x;
            var isDiffY = this.position.y !== this.placeRect.y;
            // set post-drag positioning flag
            this.needsPositioning = isDiffX || isDiffY;
            // reset flag
            this.didDrag = false;
        };
        // -------------------------- placing -------------------------- //
        /**
 * position a rect that will occupy space in the packer
 * @param {Number} x
 * @param {Number} y
 * @param {Boolean} isMaxYContained
 */
        Item.prototype.positionPlaceRect = function(x, y, isMaxYOpen) {
            this.placeRect.x = this.getPlaceRectCoord(x, true);
            this.placeRect.y = this.getPlaceRectCoord(y, false, isMaxYOpen);
        };
        /**
 * get x/y coordinate for place rect
 * @param {Number} coord - x or y
 * @param {Boolean} isX
 * @param {Boolean} isMaxOpen - does not limit value to outer bound
 * @returns {Number} coord - processed x or y
 */
        Item.prototype.getPlaceRectCoord = function(coord, isX, isMaxOpen) {
            var measure = isX ? "Width" : "Height";
            var size = this.size["outer" + measure];
            var segment = this.layout[isX ? "columnWidth" : "rowHeight"];
            var parentSize = this.layout.size["inner" + measure];
            // additional parentSize calculations for Y
            if (!isX) {
                parentSize = Math.max(parentSize, this.layout.maxY);
                // prevent gutter from bumping up height when non-vertical grid
                if (!this.layout.rowHeight) {
                    parentSize -= this.layout.gutter;
                }
            }
            var max;
            if (segment) {
                segment += this.layout.gutter;
                // allow for last column to reach the edge
                parentSize += isX ? this.layout.gutter : 0;
                // snap to closest segment
                coord = Math.round(coord / segment);
                // contain to outer bound
                // x values must be contained, y values can grow box by 1
                var maxSegments = Math[isX ? "floor" : "ceil"](parentSize / segment);
                maxSegments -= Math.ceil(size / segment);
                max = maxSegments;
            } else {
                max = parentSize - size;
            }
            coord = isMaxOpen ? coord : Math.min(coord, max);
            coord *= segment || 1;
            return Math.max(0, coord);
        };
        Item.prototype.copyPlaceRectPosition = function() {
            this.rect.x = this.placeRect.x;
            this.rect.y = this.placeRect.y;
        };
        return Item;
    }
    // -------------------------- transport -------------------------- //
    if (typeof define === "function" && define.amd) {
        // AMD
        define([ "get-style-property/get-style-property", "outlayer/outlayer", "./rect" ], itemDefinition);
    } else {
        // browser global
        window.Packery.Item = itemDefinition(window.getStyleProperty, window.Outlayer, window.Packery.Rect);
    }
})(window);

(function(window) {
    "use strict";
    // -------------------------- Packer -------------------------- //
    function packerDefinition(Rect) {
        function Packer(width, height) {
            this.width = width || 0;
            this.height = height || 0;
            this.reset();
        }
        Packer.prototype.reset = function() {
            this.spaces = [];
            this.newSpaces = [];
            var initialSpace = new Rect({
                x: 0,
                y: 0,
                width: this.width,
                height: this.height
            });
            this.spaces.push(initialSpace);
        };
        // change x and y of rect to fit with in Packer's available spaces
        Packer.prototype.pack = function(rect) {
            for (var i = 0, len = this.spaces.length; i < len; i++) {
                var space = this.spaces[i];
                if (space.canFit(rect)) {
                    this.placeInSpace(rect, space);
                    break;
                }
            }
        };
        Packer.prototype.placeInSpace = function(rect, space) {
            // place rect in space
            rect.x = space.x;
            rect.y = space.y;
            this.placed(rect);
        };
        // update spaces with placed rect
        Packer.prototype.placed = function(rect) {
            // update spaces
            var revisedSpaces = [];
            for (var i = 0, len = this.spaces.length; i < len; i++) {
                var space = this.spaces[i];
                var newSpaces = space.getMaximalFreeRects(rect);
                // add either the original space or the new spaces to the revised spaces
                if (newSpaces) {
                    revisedSpaces.push.apply(revisedSpaces, newSpaces);
                } else {
                    revisedSpaces.push(space);
                }
            }
            this.spaces = revisedSpaces;
            // remove redundant spaces
            Packer.mergeRects(this.spaces);
            this.spaces.sort(Packer.spaceSorterTopLeft);
        };
        // -------------------------- utility functions -------------------------- //
        /**
 * Remove redundant rectangle from array of rectangles
 * @param {Array} rects: an array of Rects
 * @returns {Array} rects: an array of Rects
**/
        Packer.mergeRects = function(rects) {
            for (var i = 0, len = rects.length; i < len; i++) {
                var rect = rects[i];
                // skip over this rect if it was already removed
                if (!rect) {
                    continue;
                }
                // clone rects we're testing, remove this rect
                var compareRects = rects.slice(0);
                // do not compare with self
                compareRects.splice(i, 1);
                // compare this rect with others
                var removedCount = 0;
                for (var j = 0, jLen = compareRects.length; j < jLen; j++) {
                    var compareRect = compareRects[j];
                    // if this rect contains another,
                    // remove that rect from test collection
                    var indexAdjust = i > j ? 0 : 1;
                    if (rect.contains(compareRect)) {
                        // console.log( 'current test rects:' + testRects.length, testRects );
                        // console.log( i, j, indexAdjust, rect, compareRect );
                        rects.splice(j + indexAdjust - removedCount, 1);
                        removedCount++;
                    }
                }
            }
            return rects;
        };
        // top down, then left to right
        Packer.spaceSorterTopLeft = function(a, b) {
            return a.y - b.y || a.x - b.x;
        };
        // left to right, then top down
        Packer.spaceSorterLeftTop = function(a, b) {
            return a.x - b.x || a.y - b.y;
        };
        return Packer;
    }
    // -------------------------- transport -------------------------- //
    if (typeof define === "function" && define.amd) {
        // AMD
        define([ "./rect" ], packerDefinition);
    } else {
        // browser global
        var Packery = window.Packery = window.Packery || {};
        Packery.Packer = packerDefinition(Packery.Rect);
    }
})(window);

/*!
 * Packery v1.1.2
 * bin-packing layout library
 * http://packery.metafizzy.co
 *
 * Commercial use requires one-time purchase of a commercial license
 * http://packery.metafizzy.co/license.html
 *
 * Non-commercial use is licensed under the GPL v3 License
 *
 * Copyright 2013 Metafizzy
 */
(function(window) {
    "use strict";
    // -------------------------- Packery -------------------------- //
    // used for AMD definition and requires
    function packeryDefinition(classie, getSize, Outlayer, Rect, Packer, Item) {
        // create an Outlayer layout class
        var Packery = Outlayer.create("packery");
        Packery.Item = Packery.prototype.settings.item = Item;
        Packery.prototype._create = function() {
            // call super
            Outlayer.prototype._create.call(this);
            // initial properties
            this.packer = new Packer();
            // Left over from v1.0
            this.stamp(this.options.stamped);
            // create drag handlers
            var _this = this;
            this.handleDraggabilly = {
                dragStart: function(draggie) {
                    _this.itemDragStart(draggie.element);
                },
                dragMove: function(draggie) {
                    _this.itemDragMove(draggie.element, draggie.position.x, draggie.position.y);
                },
                dragEnd: function(draggie) {
                    _this.itemDragEnd(draggie.element);
                }
            };
            this.handleUIDraggable = {
                start: function handleUIDraggableStart(event) {
                    _this.itemDragStart(event.currentTarget);
                },
                drag: function handleUIDraggableDrag(event, ui) {
                    _this.itemDragMove(event.currentTarget, ui.position.left, ui.position.top);
                },
                stop: function handleUIDraggableStop(event) {
                    _this.itemDragEnd(event.currentTarget);
                }
            };
        };
        // ----- init & layout ----- //
        /**
 * logic before any new layout
 */
        Packery.prototype._resetLayout = function() {
            this.getSize();
            this._getMeasurements();
            // reset packer
            this.packer.width = this.size.innerWidth + this.gutter;
            this.packer.height = Number.POSITIVE_INFINITY;
            this.packer.reset();
            // layout
            this.maxY = 0;
        };
        /**
 * update columnWidth, rowHeight, & gutter
 * @private
 */
        Packery.prototype._getMeasurements = function() {
            this._getMeasurement("columnWidth", "width");
            this._getMeasurement("rowHeight", "height");
            this._getMeasurement("gutter", "width");
        };
        Packery.prototype._getItemLayoutPosition = function(item) {
            this._packItem(item);
            return item.rect;
        };
        /**
 * layout item in packer
 * @param {Packery.Item} item
 */
        Packery.prototype._packItem = function(item) {
            this._setRectSize(item.element, item.rect);
            // pack the rect in the packer
            this.packer.pack(item.rect);
            this._setMaxY(item.rect);
        };
        /**
 * set max Y value, for height of container
 * @param {Packery.Rect} rect
 * @private
 */
        Packery.prototype._setMaxY = function(rect) {
            this.maxY = Math.max(rect.y + rect.height, this.maxY);
        };
        /**
 * set the width and height of a rect, applying columnWidth and rowHeight
 * @param {Element} elem
 * @param {Packery.Rect} rect
 */
        Packery.prototype._setRectSize = function(elem, rect) {
            var size = getSize(elem);
            var w = size.outerWidth;
            var h = size.outerHeight;
            // size for columnWidth and rowHeight, if available
            var colW = this.columnWidth + this.gutter;
            var rowH = this.rowHeight + this.gutter;
            w = this.columnWidth ? Math.ceil(w / colW) * colW : w + this.gutter;
            h = this.rowHeight ? Math.ceil(h / rowH) * rowH : h + this.gutter;
            // rect must fit in packer
            rect.width = Math.min(w, this.packer.width);
            rect.height = h;
        };
        Packery.prototype._getContainerSize = function() {
            return {
                height: this.maxY - this.gutter
            };
        };
        // -------------------------- stamp -------------------------- //
        /**
 * makes space for element
 * @param {Element} elem
 */
        Packery.prototype._manageStamp = function(elem) {
            var item = this.getItem(elem);
            var rect;
            if (item && item.isPlacing) {
                rect = item.placeRect;
            } else {
                var offset = this._getElementOffset(elem);
                rect = new Rect({
                    x: this.options.isOriginLeft ? offset.left : offset.right,
                    y: this.options.isOriginTop ? offset.top : offset.bottom
                });
            }
            this._setRectSize(elem, rect);
            // save its space in the packer
            this.packer.placed(rect);
            this._setMaxY(rect);
        };
        // -------------------------- methods -------------------------- //
        Packery.prototype.sortItemsByPosition = function() {
            this.items.sort(function(a, b) {
                return a.position.y - b.position.y || a.position.x - b.position.x;
            });
        };
        /**
 * Fit item element in its current position
 * Packery will position elements around it
 * useful for expanding elements
 *
 * @param {Element} elem
 * @param {Number} x - horizontal destination position, optional
 * @param {Number} y - vertical destination position, optional
 */
        Packery.prototype.fit = function(elem, x, y) {
            var item = this.getItem(elem);
            if (!item) {
                return;
            }
            // prepare internal properties
            this._getMeasurements();
            // stamp item to get it out of layout
            this.stamp(item.element);
            // required for positionPlaceRect
            item.getSize();
            // set placing flag
            item.isPlacing = true;
            // fall back to current position for fitting
            x = x === undefined ? item.rect.x : x;
            y = y === undefined ? item.rect.y : y;
            // position it best at its destination
            item.positionPlaceRect(x, y, true);
            this._bindFitEvents(item);
            item.moveTo(item.placeRect.x, item.placeRect.y);
            // layout everything else
            this.layout();
            // return back to regularly scheduled programming
            this.unstamp(item.element);
            this.sortItemsByPosition();
            // un set placing flag, back to normal
            item.isPlacing = false;
            // copy place rect position
            item.copyPlaceRectPosition();
        };
        /**
 * emit event when item is fit and other items are laid out
 * @param {Packery.Item} item
 * @private
 */
        Packery.prototype._bindFitEvents = function(item) {
            var _this = this;
            var ticks = 0;
            function tick() {
                ticks++;
                if (ticks !== 2) {
                    return;
                }
                _this.emitEvent("fitComplete", [ _this, item ]);
            }
            // when item is laid out
            item.on("layout", function() {
                tick();
                return true;
            });
            // when all items are laid out
            this.on("layoutComplete", function() {
                tick();
                return true;
            });
        };
        // -------------------------- drag -------------------------- //
        /**
 * handle an item drag start event
 * @param {Element} elem
 */
        Packery.prototype.itemDragStart = function(elem) {
            this.stamp(elem);
            var item = this.getItem(elem);
            if (item) {
                item.dragStart();
            }
        };
        /**
 * handle an item drag move event
 * @param {Element} elem
 * @param {Number} x - horizontal change in position
 * @param {Number} y - vertical change in position
 */
        Packery.prototype.itemDragMove = function(elem, x, y) {
            var item = this.getItem(elem);
            if (item) {
                item.dragMove(x, y);
            }
            // debounce
            var _this = this;
            // debounce triggering layout
            function delayed() {
                _this.layout();
                delete _this.dragTimeout;
            }
            this.clearDragTimeout();
            this.dragTimeout = setTimeout(delayed, 40);
        };
        Packery.prototype.clearDragTimeout = function() {
            if (this.dragTimeout) {
                clearTimeout(this.dragTimeout);
            }
        };
        /**
 * handle an item drag end event
 * @param {Element} elem
 */
        Packery.prototype.itemDragEnd = function(elem) {
            var item = this.getItem(elem);
            var itemDidDrag;
            if (item) {
                itemDidDrag = item.didDrag;
                item.dragStop();
            }
            // if elem didn't move, or if it doesn't need positioning
            // unignore and unstamp and call it a day
            if (!item || !itemDidDrag && !item.needsPositioning) {
                this.unstamp(elem);
                return;
            }
            // procced with dragged item
            classie.add(item.element, "is-positioning-post-drag");
            // save this var, as it could get reset in dragStart
            var onLayoutComplete = this._getDragEndLayoutComplete(elem, item);
            if (item.needsPositioning) {
                item.on("layout", onLayoutComplete);
                item.moveTo(item.placeRect.x, item.placeRect.y);
            } else if (item) {
                // item didn't need placement
                item.copyPlaceRectPosition();
            }
            this.clearDragTimeout();
            this.on("layoutComplete", onLayoutComplete);
            this.layout();
        };
        /**
 * get drag end callback
 * @param {Element} elem
 * @param {Packery.Item} item
 * @returns {Function} onLayoutComplete
 */
        Packery.prototype._getDragEndLayoutComplete = function(elem, item) {
            var itemNeedsPositioning = item && item.needsPositioning;
            var completeCount = 0;
            var asyncCount = itemNeedsPositioning ? 2 : 1;
            var _this = this;
            return function onLayoutComplete() {
                completeCount++;
                // don't proceed if not complete
                if (completeCount !== asyncCount) {
                    return true;
                }
                // reset item
                if (item) {
                    classie.remove(item.element, "is-positioning-post-drag");
                    item.isPlacing = false;
                    item.copyPlaceRectPosition();
                }
                _this.unstamp(elem);
                // only sort when item moved
                _this.sortItemsByPosition();
                // emit item drag event now that everything is done
                if (itemNeedsPositioning) {
                    _this.emitEvent("dragItemPositioned", [ _this, item ]);
                }
                // listen once
                return true;
            };
        };
        /**
 * binds Draggabilly events
 * @param {Draggabilly} draggie
 */
        Packery.prototype.bindDraggabillyEvents = function(draggie) {
            draggie.on("dragStart", this.handleDraggabilly.dragStart);
            draggie.on("dragMove", this.handleDraggabilly.dragMove);
            draggie.on("dragEnd", this.handleDraggabilly.dragEnd);
        };
        /**
 * binds jQuery UI Draggable events
 * @param {jQuery} $elems
 */
        Packery.prototype.bindUIDraggableEvents = function($elems) {
            $elems.on("dragstart", this.handleUIDraggable.start).on("drag", this.handleUIDraggable.drag).on("dragstop", this.handleUIDraggable.stop);
        };
        Packery.Rect = Rect;
        Packery.Packer = Packer;
        return Packery;
    }
    // -------------------------- transport -------------------------- //
    if (typeof define === "function" && define.amd) {
        // AMD
        define([ "classie/classie", "get-size/get-size", "outlayer/outlayer", "./rect", "./packer", "./item" ], packeryDefinition);
    } else {
        // browser global
        window.Packery = packeryDefinition(window.classie, window.getSize, window.Outlayer, window.Packery.Rect, window.Packery.Packer, window.Packery.Item);
    }
})(window);

/**
 * Rect
 * low-level utility class for basic geometry
 */
(function(window) {
    "use strict";
    // -------------------------- Packery -------------------------- //
    // global namespace
    var Packery = window.Packery = function() {};
    function rectDefinition() {
        // -------------------------- Rect -------------------------- //
        function Rect(props) {
            // extend properties from defaults
            for (var prop in Rect.defaults) {
                this[prop] = Rect.defaults[prop];
            }
            for (prop in props) {
                this[prop] = props[prop];
            }
        }
        // make available
        Packery.Rect = Rect;
        Rect.defaults = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        /**
 * Determines whether or not this rectangle wholly encloses another rectangle or point.
 * @param {Rect} rect
 * @returns {Boolean}
**/
        Rect.prototype.contains = function(rect) {
            // points don't have width or height
            var otherWidth = rect.width || 0;
            var otherHeight = rect.height || 0;
            return this.x <= rect.x && this.y <= rect.y && this.x + this.width >= rect.x + otherWidth && this.y + this.height >= rect.y + otherHeight;
        };
        /**
 * Determines whether or not the rectangle intersects with another.
 * @param {Rect} rect
 * @returns {Boolean}
**/
        Rect.prototype.overlaps = function(rect) {
            var thisRight = this.x + this.width;
            var thisBottom = this.y + this.height;
            var rectRight = rect.x + rect.width;
            var rectBottom = rect.y + rect.height;
            // http://stackoverflow.com/a/306332
            return this.x < rectRight && thisRight > rect.x && this.y < rectBottom && thisBottom > rect.y;
        };
        /**
 * @param {Rect} rect - the overlapping rect
 * @returns {Array} freeRects - rects representing the area around the rect
**/
        Rect.prototype.getMaximalFreeRects = function(rect) {
            // if no intersection, return false
            if (!this.overlaps(rect)) {
                return false;
            }
            var freeRects = [];
            var freeRect;
            var thisRight = this.x + this.width;
            var thisBottom = this.y + this.height;
            var rectRight = rect.x + rect.width;
            var rectBottom = rect.y + rect.height;
            // top
            if (this.y < rect.y) {
                freeRect = new Rect({
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: rect.y - this.y
                });
                freeRects.push(freeRect);
            }
            // right
            if (thisRight > rectRight) {
                freeRect = new Rect({
                    x: rectRight,
                    y: this.y,
                    width: thisRight - rectRight,
                    height: this.height
                });
                freeRects.push(freeRect);
            }
            // bottom
            if (thisBottom > rectBottom) {
                freeRect = new Rect({
                    x: this.x,
                    y: rectBottom,
                    width: this.width,
                    height: thisBottom - rectBottom
                });
                freeRects.push(freeRect);
            }
            // left
            if (this.x < rect.x) {
                freeRect = new Rect({
                    x: this.x,
                    y: this.y,
                    width: rect.x - this.x,
                    height: this.height
                });
                freeRects.push(freeRect);
            }
            return freeRects;
        };
        Rect.prototype.canFit = function(rect) {
            return this.width >= rect.width && this.height >= rect.height;
        };
        return Rect;
    }
    // -------------------------- transport -------------------------- //
    if (typeof define === "function" && define.amd) {
        // AMD
        define(rectDefinition);
    } else {
        // browser global
        window.Packery = window.Packery || {};
        window.Packery.Rect = rectDefinition();
    }
})(window);

/*!
 * Modernizr v2.6.3
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */
/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */
window.Modernizr = function(window, document, undefined) {
    var version = "2.6.3", Modernizr = {}, /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true, /*>>cssclasses*/
    docElement = document.documentElement, /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = "modernizr", modElem = document.createElement(mod), mStyle = modElem.style, /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem = document.createElement("input"), /*>>smile*/
    smile = ":)", /*>>smile*/
    toString = {}.toString, // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = " -webkit- -moz- -o- -ms- ".split(" "), /*>>prefixes*/
    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius
    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/
    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = "Webkit Moz O ms", cssomPrefixes = omPrefixes.split(" "), domPrefixes = omPrefixes.toLowerCase().split(" "), /*>>domprefixes*/
    /*>>ns*/
    ns = {
        svg: "http://www.w3.org/2000/svg"
    }, /*>>ns*/
    tests = {}, inputs = {}, attrs = {}, classes = [], slice = classes.slice, featureName, // used in testing loop
    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function(rule, callback, nodes, testnames) {
        var style, ret, node, docOverflow, div = document.createElement("div"), // After page load injecting a fake body doesn't work so check if body exists
        body = document.body, // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
        fakeBody = body || document.createElement("body");
        if (parseInt(nodes, 10)) {
            // In order not to give false positives we create a node for each test
            // This also allows the method to scale for unspecified uses
            while (nodes--) {
                node = document.createElement("div");
                node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
                div.appendChild(node);
            }
        }
        // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
        // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
        // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
        // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
        // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
        style = [ "&#173;", '<style id="s', mod, '">', rule, "</style>" ].join("");
        div.id = mod;
        // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
        // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
        (body ? div : fakeBody).innerHTML += style;
        fakeBody.appendChild(div);
        if (!body) {
            //avoid crashing IE8, if background image is used
            fakeBody.style.background = "";
            //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
            fakeBody.style.overflow = "hidden";
            docOverflow = docElement.style.overflow;
            docElement.style.overflow = "hidden";
            docElement.appendChild(fakeBody);
        }
        ret = callback(div, rule);
        // If this is done after page load we don't want to remove the body so check if body exists
        if (!body) {
            fakeBody.parentNode.removeChild(fakeBody);
            docElement.style.overflow = docOverflow;
        } else {
            div.parentNode.removeChild(div);
        }
        return !!ret;
    }, /*>>teststyles*/
    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function(mq) {
        var matchMedia = window.matchMedia || window.msMatchMedia;
        if (matchMedia) {
            return matchMedia(mq).matches;
        }
        var bool;
        injectElementWithStyles("@media " + mq + " { #" + mod + " { position: absolute; } }", function(node) {
            bool = (window.getComputedStyle ? getComputedStyle(node, null) : node.currentStyle)["position"] == "absolute";
        });
        return bool;
    }, /*>>mq*/
    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = function() {
        var TAGNAMES = {
            select: "input",
            change: "input",
            submit: "form",
            reset: "form",
            error: "img",
            load: "img",
            abort: "img"
        };
        function isEventSupported(eventName, element) {
            element = element || document.createElement(TAGNAMES[eventName] || "div");
            eventName = "on" + eventName;
            // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
            var isSupported = eventName in element;
            if (!isSupported) {
                // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
                if (!element.setAttribute) {
                    element = document.createElement("div");
                }
                if (element.setAttribute && element.removeAttribute) {
                    element.setAttribute(eventName, "");
                    isSupported = is(element[eventName], "function");
                    // If property was created, "remove it" (by setting value to `undefined`)
                    if (!is(element[eventName], "undefined")) {
                        element[eventName] = undefined;
                    }
                    element.removeAttribute(eventName);
                }
            }
            element = null;
            return isSupported;
        }
        return isEventSupported;
    }(), /*>>hasevent*/
    // TODO :: Add flag for hasownprop ? didn't last time
    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = {}.hasOwnProperty, hasOwnProp;
    if (!is(_hasOwnProperty, "undefined") && !is(_hasOwnProperty.call, "undefined")) {
        hasOwnProp = function(object, property) {
            return _hasOwnProperty.call(object, property);
        };
    } else {
        hasOwnProp = function(object, property) {
            /* yes, this can give false positives/negatives, but most of the time we don't care about those */
            return property in object && is(object.constructor.prototype[property], "undefined");
        };
    }
    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5
    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(that) {
            var target = this;
            if (typeof target != "function") {
                throw new TypeError();
            }
            var args = slice.call(arguments, 1), bound = function() {
                if (this instanceof bound) {
                    var F = function() {};
                    F.prototype = target.prototype;
                    var self = new F();
                    var result = target.apply(self, args.concat(slice.call(arguments)));
                    if (Object(result) === result) {
                        return result;
                    }
                    return self;
                } else {
                    return target.apply(that, args.concat(slice.call(arguments)));
                }
            };
            return bound;
        };
    }
    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss(str) {
        mStyle.cssText = str;
    }
    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll(str1, str2) {
        return setCss(prefixes.join(str1 + ";") + (str2 || ""));
    }
    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is(obj, type) {
        return typeof obj === type;
    }
    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains(str, substr) {
        return !!~("" + str).indexOf(substr);
    }
    /*>>testprop*/
    // testProps is a generic CSS / DOM property test.
    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.
    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.
    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.
    function testProps(props, prefixed) {
        for (var i in props) {
            var prop = props[i];
            if (!contains(prop, "-") && mStyle[prop] !== undefined) {
                return prefixed == "pfx" ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/
    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps(props, obj, elem) {
        for (var i in props) {
            var item = obj[props[i]];
            if (item !== undefined) {
                // return the property name as a string
                if (elem === false) return props[i];
                // let's bind a function
                if (is(item, "function")) {
                    // default to autobind unless override
                    return item.bind(elem || obj);
                }
                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }
    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll(prop, prefixed, elem) {
        var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1), props = (prop + " " + cssomPrefixes.join(ucProp + " ") + ucProp).split(" ");
        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if (is(prefixed, "string") || is(prefixed, "undefined")) {
            return testProps(props, prefixed);
        } else {
            props = (prop + " " + domPrefixes.join(ucProp + " ") + ucProp).split(" ");
            return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/
    /**
     * Tests
     * -----
     */
    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox
    tests["flexbox"] = function() {
        return testPropsAll("flexWrap");
    };
    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/
    tests["flexboxlegacy"] = function() {
        return testPropsAll("boxDirection");
    };
    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/
    tests["canvas"] = function() {
        var elem = document.createElement("canvas");
        return !!(elem.getContext && elem.getContext("2d"));
    };
    tests["canvastext"] = function() {
        return !!(Modernizr["canvas"] && is(document.createElement("canvas").getContext("2d").fillText, "function"));
    };
    // webk.it/70117 is tracking a legit WebGL feature detect proposal
    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441
    tests["webgl"] = function() {
        return !!window.WebGLRenderingContext;
    };
    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */
    tests["touch"] = function() {
        var bool;
        if ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch) {
            bool = true;
        } else {
            injectElementWithStyles([ "@media (", prefixes.join("touch-enabled),("), mod, ")", "{#modernizr{top:9px;position:absolute}}" ].join(""), function(node) {
                bool = node.offsetTop === 9;
            });
        }
        return bool;
    };
    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158
    tests["geolocation"] = function() {
        return "geolocation" in navigator;
    };
    tests["postmessage"] = function() {
        return !!window.postMessage;
    };
    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests["websqldatabase"] = function() {
        return !!window.openDatabase;
    };
    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests["indexedDB"] = function() {
        return !!testPropsAll("indexedDB", window);
    };
    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests["hashchange"] = function() {
        return isEventSupported("hashchange", window) && (document.documentMode === undefined || document.documentMode > 7);
    };
    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests["history"] = function() {
        return !!(window.history && history.pushState);
    };
    tests["draganddrop"] = function() {
        var div = document.createElement("div");
        return "draggable" in div || "ondragstart" in div && "ondrop" in div;
    };
    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests["websockets"] = function() {
        return "WebSocket" in window || "MozWebSocket" in window;
    };
    // css-tricks.com/rgba-browser-support/
    tests["rgba"] = function() {
        // Set an rgba() color and check the returned value
        setCss("background-color:rgba(150,255,150,.5)");
        return contains(mStyle.backgroundColor, "rgba");
    };
    tests["hsla"] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla
        setCss("background-color:hsla(120,40%,100%,.5)");
        return contains(mStyle.backgroundColor, "rgba") || contains(mStyle.backgroundColor, "hsla");
    };
    tests["multiplebgs"] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!
        setCss("background:url(https://),url(https://),red url(https://)");
        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background
        return /(url\s*\(.*?){3}/.test(mStyle.background);
    };
    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396
    tests["backgroundsize"] = function() {
        return testPropsAll("backgroundSize");
    };
    tests["borderimage"] = function() {
        return testPropsAll("borderImage");
    };
    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance
    tests["borderradius"] = function() {
        return testPropsAll("borderRadius");
    };
    // WebOS unfortunately false positives on this test.
    tests["boxshadow"] = function() {
        return testPropsAll("boxShadow");
    };
    // FF3.0 will false positive on this test
    tests["textshadow"] = function() {
        return document.createElement("div").style.textShadow === "";
    };
    tests["opacity"] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.
        setCssAll("opacity:.55");
        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return /^0.55$/.test(mStyle.opacity);
    };
    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   daneden.me/2011/12/putting-up-with-androids-bullshit/
    tests["cssanimations"] = function() {
        return testPropsAll("animationName");
    };
    tests["csscolumns"] = function() {
        return testPropsAll("columnCount");
    };
    tests["cssgradients"] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */
        var str1 = "background-image:", str2 = "gradient(linear,left top,right bottom,from(#9f9),to(white));", str3 = "linear-gradient(left top,#9f9, white);";
        setCss(// legacy webkit syntax (FIXME: remove when syntax not in use anymore)
        (str1 + "-webkit- ".split(" ").join(str2 + str1) + // standard syntax             // trailing 'background-image:'
        prefixes.join(str3 + str1)).slice(0, -str1.length));
        return contains(mStyle.backgroundImage, "gradient");
    };
    tests["cssreflections"] = function() {
        return testPropsAll("boxReflect");
    };
    tests["csstransforms"] = function() {
        return !!testPropsAll("transform");
    };
    tests["csstransforms3d"] = function() {
        var ret = !!testPropsAll("perspective");
        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if (ret && "webkitPerspective" in docElement.style) {
            // Webkit allows this media query to succeed only if the feature is enabled.
            // `@media (transform-3d),(-webkit-transform-3d){ ... }`
            injectElementWithStyles("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}", function(node, rule) {
                ret = node.offsetLeft === 9 && node.offsetHeight === 3;
            });
        }
        return ret;
    };
    tests["csstransitions"] = function() {
        return testPropsAll("transition");
    };
    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/
    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests["fontface"] = function() {
        var bool;
        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function(node, rule) {
            var style = document.getElementById("smodernizr"), sheet = style.sheet || style.styleSheet, cssText = sheet ? sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || "" : "";
            bool = /src/i.test(cssText) && cssText.indexOf(rule.split(" ")[0]) === 0;
        });
        return bool;
    };
    /*>>fontface*/
    // CSS generated content detection
    tests["generatedcontent"] = function() {
        var bool;
        injectElementWithStyles([ "#", mod, "{font:0/0 a}#", mod, ':after{content:"', smile, '";visibility:hidden;font:3px/1 a}' ].join(""), function(node) {
            bool = node.offsetHeight >= 3;
        });
        return bool;
    };
    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan
    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5
    tests["video"] = function() {
        var elem = document.createElement("video"), bool = false;
        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if (bool = !!elem.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, "");
                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, "");
                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, "");
            }
        } catch (e) {}
        return bool;
    };
    tests["audio"] = function() {
        var elem = document.createElement("audio"), bool = false;
        try {
            if (bool = !!elem.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, "");
                bool.mp3 = elem.canPlayType("audio/mpeg;").replace(/^no$/, "");
                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav = elem.canPlayType('audio/wav; codecs="1"').replace(/^no$/, "");
                bool.m4a = (elem.canPlayType("audio/x-m4a;") || elem.canPlayType("audio/aac;")).replace(/^no$/, "");
            }
        } catch (e) {}
        return bool;
    };
    // In FF4, if disabled, window.localStorage should === null.
    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled
    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.
    // Because we are forced to try/catch this, we'll go aggressive.
    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files
    tests["localstorage"] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    };
    tests["sessionstorage"] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    };
    tests["webworkers"] = function() {
        return !!window.Worker;
    };
    tests["applicationcache"] = function() {
        return !!window.applicationCache;
    };
    // Thanks to Erik Dahlstrom
    tests["svg"] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, "svg").createSVGRect;
    };
    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests["inlinesvg"] = function() {
        var div = document.createElement("div");
        div.innerHTML = "<svg/>";
        return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };
    // SVG SMIL animation
    tests["smil"] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, "animate")));
    };
    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg
    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests["svgclippaths"] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, "clipPath")));
    };
    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr["input"] = function(props) {
            for (var i = 0, len = props.length; i < len; i++) {
                attrs[props[i]] = !!(props[i] in inputElem);
            }
            if (attrs.list) {
                // safari false positive's on datalist: webk.it/74252
                // see also github.com/Modernizr/Modernizr/issues/146
                attrs.list = !!(document.createElement("datalist") && window.HTMLDataListElement);
            }
            return attrs;
        }("autocomplete autofocus list placeholder max min multiple pattern required step".split(" "));
        /*>>input*/
        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value
        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr["inputtypes"] = function(props) {
            for (var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++) {
                inputElem.setAttribute("type", inputElemType = props[i]);
                bool = inputElem.type !== "text";
                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if (bool) {
                    inputElem.value = smile;
                    inputElem.style.cssText = "position:absolute;visibility:hidden;";
                    if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {
                        docElement.appendChild(inputElem);
                        defaultView = document.defaultView;
                        // Safari 2-4 allows the smiley as a value, despite making a slider
                        bool = defaultView.getComputedStyle && defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== "textfield" && // Mobile android web browser has false positive, so must
                        // check the height to see if the widget is actually there.
                        inputElem.offsetHeight !== 0;
                        docElement.removeChild(inputElem);
                    } else if (/^(search|tel)$/.test(inputElemType)) {} else if (/^(url|email)$/.test(inputElemType)) {
                        // Real url and email support comes with prebaked validation.
                        bool = inputElem.checkValidity && inputElem.checkValidity() === false;
                    } else {
                        // If the upgraded input compontent rejects the :) text, we got a winner
                        bool = inputElem.value != smile;
                    }
                }
                inputs[props[i]] = !!bool;
            }
            return inputs;
        }("search tel url email datetime date month week time datetime-local number range color".split(" "));
    }
    /*>>webforms*/
    // End of test definitions
    // -----------------------
    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for (var feature in tests) {
        if (hasOwnProp(tests, feature)) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();
            classes.push((Modernizr[featureName] ? "" : "no-") + featureName);
        }
    }
    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/
    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
    Modernizr.addTest = function(feature, test) {
        if (typeof feature == "object") {
            for (var key in feature) {
                if (hasOwnProp(feature, key)) {
                    Modernizr.addTest(key, feature[key]);
                }
            }
        } else {
            feature = feature.toLowerCase();
            if (Modernizr[feature] !== undefined) {
                // we're going to quit if you're trying to overwrite an existing test
                // if we were to allow it, we'd do this:
                //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
                //   docElement.className = docElement.className.replace( re, '' );
                // but, no rly, stuff 'em.
                return Modernizr;
            }
            test = typeof test == "function" ? test() : test;
            if (typeof enableClasses !== "undefined" && enableClasses) {
                docElement.className += " " + (test ? "" : "no-") + feature;
            }
            Modernizr[feature] = test;
        }
        return Modernizr;
    };
    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss("");
    modElem = inputElem = null;
    (function(window, document) {
        /*jshint evil:true */
        /** Preset options */
        var options = window.html5 || {};
        /** Used to skip problem elements */
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;
        /** Not all elements can be cloned in IE **/
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;
        /** Detect whether the browser supports default html5 styles */
        var supportsHtml5Styles;
        /** Name of the expando, to work with multiple documents or to re-shiv one document */
        var expando = "_html5shiv";
        /** The id for the the documents expando */
        var expanID = 0;
        /** Cached data for each document */
        var expandoData = {};
        /** Detect whether the browser supports unknown elements */
        var supportsUnknownElements;
        (function() {
            try {
                var a = document.createElement("a");
                a.innerHTML = "<xyz></xyz>";
                //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
                supportsHtml5Styles = "hidden" in a;
                supportsUnknownElements = a.childNodes.length == 1 || function() {
                    // assign a false positive if unable to shiv
                    document.createElement("a");
                    var frag = document.createDocumentFragment();
                    return typeof frag.cloneNode == "undefined" || typeof frag.createDocumentFragment == "undefined" || typeof frag.createElement == "undefined";
                }();
            } catch (e) {
                supportsHtml5Styles = true;
                supportsUnknownElements = true;
            }
        })();
        /*--------------------------------------------------------------------------*/
        /**
       * Creates a style sheet with the given CSS text and adds it to the document.
       * @private
       * @param {Document} ownerDocument The document.
       * @param {String} cssText The CSS text.
       * @returns {StyleSheet} The style element.
       */
        function addStyleSheet(ownerDocument, cssText) {
            var p = ownerDocument.createElement("p"), parent = ownerDocument.getElementsByTagName("head")[0] || ownerDocument.documentElement;
            p.innerHTML = "x<style>" + cssText + "</style>";
            return parent.insertBefore(p.lastChild, parent.firstChild);
        }
        /**
       * Returns the value of `html5.elements` as an array.
       * @private
       * @returns {Array} An array of shived element node names.
       */
        function getElements() {
            var elements = html5.elements;
            return typeof elements == "string" ? elements.split(" ") : elements;
        }
        /**
       * Returns the data associated to the given document
       * @private
       * @param {Document} ownerDocument The document.
       * @returns {Object} An object of data.
       */
        function getExpandoData(ownerDocument) {
            var data = expandoData[ownerDocument[expando]];
            if (!data) {
                data = {};
                expanID++;
                ownerDocument[expando] = expanID;
                expandoData[expanID] = data;
            }
            return data;
        }
        /**
       * returns a shived element for the given nodeName and document
       * @memberOf html5
       * @param {String} nodeName name of the element
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived element.
       */
        function createElement(nodeName, ownerDocument, data) {
            if (!ownerDocument) {
                ownerDocument = document;
            }
            if (supportsUnknownElements) {
                return ownerDocument.createElement(nodeName);
            }
            if (!data) {
                data = getExpandoData(ownerDocument);
            }
            var node;
            if (data.cache[nodeName]) {
                node = data.cache[nodeName].cloneNode();
            } else if (saveClones.test(nodeName)) {
                node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
            } else {
                node = data.createElem(nodeName);
            }
            // Avoid adding some elements to fragments in IE < 9 because
            // * Attributes like `name` or `type` cannot be set/changed once an element
            //   is inserted into a document/fragment
            // * Link elements with `src` attributes that are inaccessible, as with
            //   a 403 response, will cause the tab/window to crash
            // * Script elements appended to fragments will execute when their `src`
            //   or `text` property is set
            return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node;
        }
        /**
       * returns a shived DocumentFragment for the given document
       * @memberOf html5
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived DocumentFragment.
       */
        function createDocumentFragment(ownerDocument, data) {
            if (!ownerDocument) {
                ownerDocument = document;
            }
            if (supportsUnknownElements) {
                return ownerDocument.createDocumentFragment();
            }
            data = data || getExpandoData(ownerDocument);
            var clone = data.frag.cloneNode(), i = 0, elems = getElements(), l = elems.length;
            for (;i < l; i++) {
                clone.createElement(elems[i]);
            }
            return clone;
        }
        /**
       * Shivs the `createElement` and `createDocumentFragment` methods of the document.
       * @private
       * @param {Document|DocumentFragment} ownerDocument The document.
       * @param {Object} data of the document.
       */
        function shivMethods(ownerDocument, data) {
            if (!data.cache) {
                data.cache = {};
                data.createElem = ownerDocument.createElement;
                data.createFrag = ownerDocument.createDocumentFragment;
                data.frag = data.createFrag();
            }
            ownerDocument.createElement = function(nodeName) {
                //abort shiv
                if (!html5.shivMethods) {
                    return data.createElem(nodeName);
                }
                return createElement(nodeName, ownerDocument, data);
            };
            ownerDocument.createDocumentFragment = Function("h,f", "return function(){" + "var n=f.cloneNode(),c=n.createElement;" + "h.shivMethods&&(" + // unroll the `createElement` calls
            getElements().join().replace(/\w+/g, function(nodeName) {
                data.createElem(nodeName);
                data.frag.createElement(nodeName);
                return 'c("' + nodeName + '")';
            }) + ");return n}")(html5, data.frag);
        }
        /*--------------------------------------------------------------------------*/
        /**
       * Shivs the given document.
       * @memberOf html5
       * @param {Document} ownerDocument The document to shiv.
       * @returns {Document} The shived document.
       */
        function shivDocument(ownerDocument) {
            if (!ownerDocument) {
                ownerDocument = document;
            }
            var data = getExpandoData(ownerDocument);
            if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
                data.hasCSS = !!addStyleSheet(ownerDocument, // corrects block display not defined in IE6/7/8/9
                "article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}" + // adds styling not present in IE6/7/8/9
                "mark{background:#FF0;color:#000}");
            }
            if (!supportsUnknownElements) {
                shivMethods(ownerDocument, data);
            }
            return ownerDocument;
        }
        /*--------------------------------------------------------------------------*/
        /**
       * The `html5` object is exposed so that more elements can be shived and
       * existing shiving can be detected on iframes.
       * @type Object
       * @example
       *
       * // options can be changed before the script is included
       * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
       */
        var html5 = {
            /**
         * An array or space separated string of node names of the elements to shiv.
         * @memberOf html5
         * @type Array|String
         */
            elements: options.elements || "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",
            /**
         * A flag to indicate that the HTML5 style sheet should be inserted.
         * @memberOf html5
         * @type Boolean
         */
            shivCSS: options.shivCSS !== false,
            /**
         * Is equal to true if a browser supports creating unknown/HTML5 elements
         * @memberOf html5
         * @type boolean
         */
            supportsUnknownElements: supportsUnknownElements,
            /**
         * A flag to indicate that the document's `createElement` and `createDocumentFragment`
         * methods should be overwritten.
         * @memberOf html5
         * @type Boolean
         */
            shivMethods: options.shivMethods !== false,
            /**
         * A string to describe the type of `html5` object ("default" or "default print").
         * @memberOf html5
         * @type String
         */
            type: "default",
            // shivs the document according to the specified `html5` object options
            shivDocument: shivDocument,
            //creates a shived element
            createElement: createElement,
            //creates a shived documentFragment
            createDocumentFragment: createDocumentFragment
        };
        /*--------------------------------------------------------------------------*/
        // expose html5
        window.html5 = html5;
        // shiv the document
        shivDocument(document);
    })(this, document);
    /*>>shiv*/
    // Assign private properties to the return object with prefix
    Modernizr._version = version;
    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes = domPrefixes;
    Modernizr._cssomPrefixes = cssomPrefixes;
    /*>>domprefixes*/
    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq = testMediaQuery;
    /*>>mq*/
    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent = isEventSupported;
    /*>>hasevent*/
    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp = function(prop) {
        return testProps([ prop ]);
    };
    /*>>testprop*/
    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps = testPropsAll;
    /*>>testallprops*/
    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles = injectElementWithStyles;
    /*>>teststyles*/
    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'
    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');
    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];
    Modernizr.prefixed = function(prop, obj, elem) {
        if (!obj) {
            return testPropsAll(prop, "pfx");
        } else {
            // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
            return testPropsAll(prop, obj, elem);
        }
    };
    /*>>prefixed*/
    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (// Add the new classes to the <html> element.
    enableClasses ? " js " + classes.join(" ") : "");
    /*>>cssclasses*/
    return Modernizr;
}(this, this.document);

/*
Thanks goes to rds from Stack Overflow:
http://stackoverflow.com/questions/8151278/jquery-unbind-or-rebind-hoverintent
 */
(function($) {
    if (typeof $.fn.hoverIntent === "undefined") return;
    var rawIntent = $.fn.hoverIntent;
    $.fn.hoverIntent = function(handlerIn, handlerOut, selector) {
        // If called with empty parameter list, disable hoverintent.
        if (typeof handlerIn === "undefined") {
            // Destroy the time if it is present.
            if (typeof this.hoverIntent_t !== "undefined") {
                this.hoverIntent_t = clearTimeout(this.hoverIntent_t);
            }
            // Cleanup all hoverIntent properties on the object.
            delete this.hoverIntent_t;
            delete this.hoverIntent_s;
            // Unbind all of the hoverIntent event handlers.
            this.off("mousemove.hoverIntent,mouseenter.hoverIntent,mouseleave.hoverIntent");
            return this;
        }
        return rawIntent.apply(this, arguments);
    };
})(jQuery);

(function($) {
    $._jqache = {};
    $._assigned = Array();
    $._jqns = Array();
    $._jqnsAssigned = Array();
    $.q = function(selector, clear) {
        var clear = typeof clear !== "undefined" ? clear : false;
        if (typeof $._jqache[selector] !== "undefined" && !clear) {
            return $._jqache[selector];
        } else {
            if (typeof $._assigned[selector] !== "undefined") {
                return $._jqache[selector] = $($._assigned[selector]);
            }
            return $._jqache[selector] = $(selector);
        }
    };
    $.q.assign = function(options) {
        var defaults = {
            interval: 0,
            namespace: undefined
        };
        if (typeof options.selector === "undefined") return false;
        if (typeof options.name === "undefined") options.name = options.selector;
        options = $.extend({}, defaults, options);
        if (typeof options.namespace === "undefined") {
            $._jqache[options.name] = $(options.selector);
            $._assigned[options.name] = options.selector;
            if (options.interval > 0) {
                window.setInterval(function() {
                    $._jqache[options.name] = $(options.selector);
                }, options.interval * 1e3);
            }
            return $._jqache[options.name];
        } else {
            $._jqache[options.namespace] = typeof $._jqache[options.namespace] !== "undefined" ? $._jqache[options.namespace] : Array();
            $._jqache[options.namespace][options.name] = $(options.selector);
            $._jqns[options.namespace] = typeof $._jqns[options.namespace] !== "undefined" ? $._jqns[options.namespace] : Array();
            $._jqns[options.namespace].push(options.name);
            $._jqnsAssigned[options.namespace] = typeof $._jqnsAssigned[options.namespace] !== "undefined" ? $._jqnsAssigned[options.namespace] : Array();
            $._jqnsAssigned[options.namespace][options.name] = options.selector;
            if (options.interval > 0) {
                window.setInterval(function() {
                    $._jqache[options.namespace][options.name] = $(options.selector);
                }, options.interval * 1e3);
            }
            if (typeof $.q[options.namespace] !== "function") {
                $.q[options.namespace] = function(selector, clear) {
                    if (typeof selector !== "undefined") {
                        var clear = typeof clear !== "undefined" ? clear : false;
                        if (typeof $._jqache[options.namespace][selector] !== "undefined" && !clear) {
                            return $._jqache[options.namespace][selector];
                        } else if (typeof $._jqache[options.namespace][selector] !== "undefined" && clear) {
                            return $._jqache[options.namespace][selector] = $($._jqnsAssigned[options.namespace][selector]);
                        }
                    } else {
                        var result = Array();
                        for (var i in $._jqache[options.namespace]) {
                            if ($._jqache[options.namespace].hasOwnProperty(i)) {
                                result.push($.q[options.namespace](i)[0]);
                            }
                        }
                        return $(result);
                    }
                };
            }
        }
    };
    $.q.clear = function(ns) {
        if (typeof ns === "undefined") {
            $.each($._jqache, function(i, val) {
                if (typeof $._jqns[i] === "undefined") {
                    $.q(i, true);
                } else {
                    $.q.clear(i);
                }
            });
        } else {
            $.each($._jqns[ns], function(i, val) {
                $.q[ns](val, true);
            });
        }
    };
})(jQuery);

/*
 * debouncedresize: special jQuery event that happens once after a window resize
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery-smartresize
 *
 * Copyright 2012 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work? 
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 */
(function($) {
    var $event = $.event, $special, resizeTimeout;
    $special = $event.special.debouncedresize = {
        setup: function() {
            $(this).on("resize", $special.handler);
        },
        teardown: function() {
            $(this).off("resize", $special.handler);
        },
        handler: function(event, execAsap) {
            // Save the context
            var context = this, args = arguments, dispatch = function() {
                // set correct event type
                event.type = "debouncedresize";
                $event.dispatch.apply(context, args);
            };
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            execAsap ? dispatch() : resizeTimeout = setTimeout(dispatch, $special.threshold);
        },
        threshold: 150
    };
})(jQuery);

/*jshint undef: true */
/*global jQuery: true */
/*
   --------------------------------
   Infinite Scroll
   --------------------------------
   + https://github.com/paulirish/infinite-scroll
   + version 2.0b2.120519
   + Copyright 2011/12 Paul Irish & Luke Shumard
   + Licensed under the MIT license

   + Documentation: http://infinite-scroll.com/
*/
(function(window, $, undefined) {
    "use strict";
    $.infinitescroll = function infscr(options, callback, element) {
        this.element = $(element);
        // Flag the object in the event of a failed creation
        if (!this._create(options, callback)) {
            this.failed = true;
        }
    };
    $.infinitescroll.defaults = {
        loading: {
            finished: undefined,
            finishedMsg: "<em>Congratulations, you've reached the end of the internet.</em>",
            img: "data:image/gif;base64,R0lGODlh3AATAPQeAPDy+MnQ6LW/4N3h8MzT6rjC4sTM5r/I5NHX7N7j8c7U6tvg8OLl8uXo9Ojr9b3G5MfP6Ovu9tPZ7PT1+vX2+tbb7vf4+8/W69jd7rC73vn5/O/x+K243ai02////wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgD/ACwAAAAA3AATAAAF/6AnjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEj0BAScpHLJbDqf0Kh0Sq1ar9isdioItAKGw+MAKYMFhbF63CW438f0mg1R2O8EuXj/aOPtaHx7fn96goR4hmuId4qDdX95c4+RBIGCB4yAjpmQhZN0YGYGXitdZBIVGAsLoq4BBKQDswm1CQRkcG6ytrYKubq8vbfAcMK9v7q7EMO1ycrHvsW6zcTKsczNz8HZw9vG3cjTsMIYqQkCLBwHCgsMDQ4RDAYIqfYSFxDxEfz88/X38Onr16+Bp4ADCco7eC8hQYMAEe57yNCew4IVBU7EGNDiRn8Z831cGLHhSIgdFf9chIeBg7oA7gjaWUWTVQAGE3LqBDCTlc9WOHfm7PkTqNCh54rePDqB6M+lR536hCpUqs2gVZM+xbrTqtGoWqdy1emValeXKzggYBBB5y1acFNZmEvXAoN2cGfJrTv3bl69Ffj2xZt3L1+/fw3XRVw4sGDGcR0fJhxZsF3KtBTThZxZ8mLMgC3fRatCbYMNFCzwLEqLgE4NsDWs/tvqdezZf13Hvk2A9Szdu2X3pg18N+68xXn7rh1c+PLksI/Dhe6cuO3ow3NfV92bdArTqC2Ebd3A8vjf5QWfH6Bg7Nz17c2fj69+fnq+8N2Lty+fuP78/eV2X13neIcCeBRwxorbZrA1ANoCDGrgoG8RTshahQ9iSKEEzUmYIYfNWViUhheCGJyIP5E4oom7WWjgCeBFAJNv1DVV01MAdJhhjdkplWNzO/5oXI846njjVEIqR2OS2B1pE5PVscajkxhMycqLJghQSwT40PgfAl4GqNSXYdZXJn5gSkmmmmJu1aZYb14V51do+pTOCmA40AqVCIhG5IJ9PvYnhIFOxmdqhpaI6GeHCtpooisuutmg+Eg62KOMKuqoTaXgicQWoIYq6qiklmoqFV0UoeqqrLbq6quwxirrrLTWauutJ4QAACH5BAUKABwALAcABADOAAsAAAX/IPd0D2dyRCoUp/k8gpHOKtseR9yiSmGbuBykler9XLAhkbDavXTL5k2oqFqNOxzUZPU5YYZd1XsD72rZpBjbeh52mSNnMSC8lwblKZGwi+0QfIJ8CncnCoCDgoVnBHmKfByGJimPkIwtiAeBkH6ZHJaKmCeVnKKTHIihg5KNq4uoqmEtcRUtEREMBggtEr4QDrjCuRC8h7/BwxENeicSF8DKy82pyNLMOxzWygzFmdvD2L3P0dze4+Xh1Arkyepi7dfFvvTtLQkZBC0T/FX3CRgCMOBHsJ+EHYQY7OinAGECgQsB+Lu3AOK+CewcWjwxQeJBihtNGHSoQOE+iQ3//4XkwBBhRZMcUS6YSXOAwIL8PGqEaSJCiYt9SNoCmnJPAgUVLChdaoFBURN8MAzl2PQphwQLfDFd6lTowglHve6rKpbjhK7/pG5VinZP1qkiz1rl4+tr2LRwWU64cFEihwEtZgbgR1UiHaMVvxpOSwBA37kzGz9e8G+B5MIEKLutOGEsAH2ATQwYfTmuX8aETWdGPZmiZcccNSzeTCA1Sw0bdiitC7LBWgu8jQr8HRzqgpK6gX88QbrB14z/kF+ELpwB8eVQj/JkqdylAudji/+ts3039vEEfK8Vz2dlvxZKG0CmbkKDBvllRd6fCzDvBLKBDSCeffhRJEFebFk1k/Mv9jVIoIJZSeBggwUaNeB+Qk34IE0cXlihcfRxkOAJFFhwGmKlmWDiakZhUJtnLBpnWWcnKaAZcxI0piFGGLBm1mc90kajSCveeBVWKeYEoU2wqeaQi0PetoE+rr14EpVC7oAbAUHqhYExbn2XHHsVqbcVew9tx8+XJKk5AZsqqdlddGpqAKdbAYBn1pcczmSTdWvdmZ17c1b3FZ99vnTdCRFM8OEcAhLwm1NdXnWcBBSMRWmfkWZqVlsmLIiAp/o1gGV2vpS4lalGYsUOqXrddcKCmK61aZ8SjEpUpVFVoCpTj4r661Km7kBHjrDyc1RAIQAAIfkEBQoAGwAsBwAEAM4ACwAABf/gtmUCd4goQQgFKj6PYKi0yrrbc8i4ohQt12EHcal+MNSQiCP8gigdz7iCioaCIvUmZLp8QBzW0EN2vSlCuDtFKaq4RyHzQLEKZNdiQDhRDVooCwkbfm59EAmKi4SGIm+AjIsKjhsqB4mSjT2IOIOUnICeCaB/mZKFNTSRmqVpmJqklSqskq6PfYYCDwYHDC4REQwGCBLGxxIQDsHMwhAIX8bKzcENgSLGF9PU1j3Sy9zX2NrgzQziChLk1BHWxcjf7N046tvN82715czn9Pryz6Ilc4ACj4EBOCZM8KEnAYYADBRKnACAYUMFv1wotIhCEcaJCisqwJFgAUSQGyX/kCSVUUTIdKMwJlyo0oXHlhskwrTJciZHEXsgaqS4s6PJiCAr1uzYU8kBBSgnWFqpoMJMUjGtDmUwkmfVmVypakWhEKvXsS4nhLW5wNjVroJIoc05wSzTr0PtiigpYe4EC2vj4iWrFu5euWIMRBhacaVJhYQBEFjA9jHjyQ0xEABwGceGAZYjY0YBOrRLCxUp29QM+bRkx5s7ZyYgVbTqwwti2ybJ+vLtDYpycyZbYOlptxdx0kV+V7lC5iJAyyRrwYKxAdiz82ng0/jnAdMJFz0cPi104Ec1Vj9/M6F173vKL/feXv156dw11tlqeMMnv4V5Ap53GmjQQH97nFfg+IFiucfgRX5Z8KAgbUlQ4IULIlghhhdOSB6AgX0IVn8eReghen3NRIBsRgnH4l4LuEidZBjwRpt6NM5WGwoW0KSjCwX6yJSMab2GwwAPDXfaBCtWpluRTQqC5JM5oUZAjUNS+VeOLWpJEQ7VYQANW0INJSZVDFSnZphjSikfmzE5N4EEbQI1QJmnWXCmHulRp2edwDXF43txukenJwvI9xyg9Q26Z3MzGUcBYFEChZh6DVTq34AU8Iflh51Sd+CnKFYQ6mmZkhqfBKfSxZWqA9DZanWjxmhrWwi0qtCrt/43K6WqVjjpmhIqgEGvculaGKklKstAACEAACH5BAUKABwALAcABADOAAsAAAX/ICdyQmaMYyAUqPgIBiHPxNpy79kqRXH8wAPsRmDdXpAWgWdEIYm2llCHqjVHU+jjJkwqBTecwItShMXkEfNWSh8e1NGAcLgpDGlRgk7EJ/6Ae3VKfoF/fDuFhohVeDeCfXkcCQqDVQcQhn+VNDOYmpSWaoqBlUSfmowjEA+iEAEGDRGztAwGCDcXEA60tXEiCrq8vREMEBLIyRLCxMWSHMzExnbRvQ2Sy7vN0zvVtNfU2tLY3rPgLdnDvca4VQS/Cpk3ABwSLQkYAQwT/P309vcI7OvXr94jBQMJ/nskkGA/BQBRLNDncAIAiDcG6LsxAWOLiQzmeURBKWSLCQbv/1F0eDGinJUKR47YY1IEgQASKk7Yc7ACRwZm7mHweRJoz59BJUogisKCUaFMR0x4SlJBVBFTk8pZivTR0K73rN5wqlXEAq5Fy3IYgHbEzQ0nLy4QSoCjXLoom96VOJEeCosK5n4kkFfqXjl94wa+l1gvAcGICbewAOAxY8l/Ky/QhAGz4cUkGxu2HNozhwMGBnCUqUdBg9UuW9eUynqSwLHIBujePef1ZGQZXcM+OFuEBeBhi3OYgLyqcuaxbT9vLkf4SeqyWxSQpKGB2gQpm1KdWbu72rPRzR9Ne2Nu9Kzr/1Jqj0yD/fvqP4aXOt5sW/5qsXXVcv1Nsp8IBUAmgswGF3llGgeU1YVXXKTN1FlhWFXW3gIE+DVChApysACHHo7Q4A35lLichh+ROBmLKAzgYmYEYDAhCgxKGOOMn4WR4kkDaoBBOxJtdNKQxFmg5JIWIBnQc07GaORfUY4AEkdV6jHlCEISSZ5yTXpp1pbGZbkWmcuZmQCaE6iJ0FhjMaDjTMsgZaNEHFRAQVp3bqXnZED1qYcECOz5V6BhSWCoVJQIKuKQi2KFKEkEFAqoAo7uYSmO3jk61wUUMKmknJ4SGimBmAa0qVQBhAAAIfkEBQoAGwAsBwAEAM4ACwAABf/gJm5FmRlEqhJC+bywgK5pO4rHI0D3pii22+Mg6/0Ej96weCMAk7cDkXf7lZTTnrMl7eaYoy10JN0ZFdco0XAuvKI6qkgVFJXYNwjkIBcNBgR8TQoGfRsJCRuCYYQQiI+ICosiCoGOkIiKfSl8mJkHZ4U9kZMbKaI3pKGXmJKrngmug4WwkhA0lrCBWgYFCCMQFwoQDRHGxwwGCBLMzRLEx8iGzMMO0cYNeCMKzBDW19lnF9DXDIY/48Xg093f0Q3s1dcR8OLe8+Y91OTv5wrj7o7B+7VNQqABIoRVCMBggsOHE36kSoCBIcSH3EbFangxogJYFi8CkJhqQciLJEf/LDDJEeJIBT0GsOwYUYJGBS0fjpQAMidGmyVP6sx4Y6VQhzs9VUwkwqaCCh0tmKoFtSMDmBOf9phg4SrVrROuasRQAaxXpVUhdsU6IsECZlvX3kwLUWzRt0BHOLTbNlbZG3vZinArge5Dvn7wbqtQkSYAAgtKmnSsYKVKo2AfW048uaPmG386i4Q8EQMBAIAnfB7xBxBqvapJ9zX9WgRS2YMpnvYMGdPK3aMjt/3dUcNI4blpj7iwkMFWDXDvSmgAlijrt9RTR78+PS6z1uAJZIe93Q8g5zcsWCi/4Y+C8bah5zUv3vv89uft30QP23punGCx5954oBBwnwYaNCDY/wYrsYeggnM9B2Fpf8GG2CEUVWhbWAtGouEGDy7Y4IEJVrbSiXghqGKIo7z1IVcXIkKWWR361QOLWWnIhwERpLaaCCee5iMBGJQmJGyPFTnbkfHVZGRtIGrg5HALEJAZbu39BuUEUmq1JJQIPtZilY5hGeSWsSk52G9XqsmgljdIcABytq13HyIM6RcUA+r1qZ4EBF3WHWB29tBgAzRhEGhig8KmqKFv8SeCeo+mgsF7YFXa1qWSbkDpom/mqR1PmHCqJ3fwNRVXjC7S6CZhFVCQ2lWvZiirhQq42SACt25IK2hv8TprriUV1usGgeka7LFcNmCldMLi6qZMgFLgpw16Cipb7bC1knXsBiEAACH5BAUKABsALAcABADOAAsAAAX/4FZsJPkUmUGsLCEUTywXglFuSg7fW1xAvNWLF6sFFcPb42C8EZCj24EJdCp2yoegWsolS0Uu6fmamg8n8YYcLU2bXSiRaXMGvqV6/KAeJAh8VgZqCX+BexCFioWAYgqNi4qAR4ORhRuHY408jAeUhAmYYiuVlpiflqGZa5CWkzc5fKmbbhIpsAoQDRG8vQwQCBLCwxK6vb5qwhfGxxENahvCEA7NzskSy7vNzzzK09W/PNHF1NvX2dXcN8K55cfh69Luveol3vO8zwi4Yhj+AQwmCBw4IYclDAAJDlQggVOChAoLKkgFkSCAHDwWLKhIEOONARsDKryogFPIiAUb/95gJNIiw4wnI778GFPhzBKFOAq8qLJEhQpiNArjMcHCmlTCUDIouTKBhApELSxFWiGiVKY4E2CAekPgUphDu0742nRrVLJZnyrFSqKQ2ohoSYAMW6IoDpNJ4bLdILTnAj8KUF7UeENjAKuDyxIgOuGiOI0EBBMgLNew5AUrDTMGsFixwBIaNCQuAXJB57qNJ2OWm2Aj4skwCQCIyNkhhtMkdsIuodE0AN4LJDRgfLPtn5YDLdBlraAByuUbBgxQwICxMOnYpVOPej074OFdlfc0TqC62OIbcppHjV4o+LrieWhfT8JC/I/T6W8oCl29vQ0XjLdBaA3s1RcPBO7lFvpX8BVoG4O5jTXRQRDuJ6FDTzEWF1/BCZhgbyAKE9qICYLloQYOFtahVRsWYlZ4KQJHlwHS/IYaZ6sZd9tmu5HQm2xi1UaTbzxYwJk/wBF5g5EEYOBZeEfGZmNdFyFZmZIR4jikbLThlh5kUUVJGmRT7sekkziRWUIACABk3T4qCsedgO4xhgGcY7q5pHJ4klBBTQRJ0CeHcoYHHUh6wgfdn9uJdSdMiebGJ0zUPTcoS286FCkrZxnYoYYKWLkBowhQoBeaOlZAgVhLidrXqg2GiqpQpZ4apwSwRtjqrB3muoF9BboaXKmshlqWqsWiGt2wphJkQbAU5hoCACH5BAUKABsALAcABADOAAsAAAX/oGFw2WZuT5oZROsSQnGaKjRvilI893MItlNOJ5v5gDcFrHhKIWcEYu/xFEqNv6B1N62aclysF7fsZYe5aOx2yL5aAUGSaT1oTYMBwQ5VGCAJgYIJCnx1gIOBhXdwiIl7d0p2iYGQUAQBjoOFSQR/lIQHnZ+Ue6OagqYzSqSJi5eTpTxGcjcSChANEbu8DBAIEsHBChe5vL13G7fFuscRDcnKuM3H0La3EA7Oz8kKEsXazr7Cw9/Gztar5uHHvte47MjktznZ2w0G1+D3BgirAqJmJMAQgMGEgwgn5Ei0gKDBhBMALGRYEOJBb5QcWlQo4cbAihZz3GgIMqFEBSM1/4ZEOWPAgpIIJXYU+PIhRG8ja1qU6VHlzZknJNQ6UanCjQkWCIGSUGEjAwVLjc44+DTqUQtPPS5gejUrTa5TJ3g9sWCr1BNUWZI161StiQUDmLYdGfesibQ3XMq1OPYthrwuA2yU2LBs2cBHIypYQPPlYAKFD5cVvNPtW8eVGbdcQADATsiNO4cFAPkvHpedPzc8kUcPgNGgZ5RNDZG05reoE9s2vSEP79MEGiQGy1qP8LA4ZcdtsJE48ONoLTBtTV0B9LsTnPceoIDBDQvS7W7vfjVY3q3eZ4A339J4eaAmKqU/sV58HvJh2RcnIBsDUw0ABqhBA5aV5V9XUFGiHfVeAiWwoFgJJrIXRH1tEMiDFV4oHoAEGlaWhgIGSGBO2nFomYY3mKjVglidaNYJGJDkWW2xxTfbjCbVaOGNqoX2GloR8ZeTaECS9pthRGJH2g0b3Agbk6hNANtteHD2GJUucfajCQBy5OOTQ25ZgUPvaVVQmbKh9510/qQpwXx3SQdfk8tZJOd5b6JJFplT3ZnmmX3qd5l1eg5q00HrtUkUn0AKaiGjClSAgKLYZcgWXwocGRcCFGCKwSB6ceqphwmYRUFYT/1WKlOdUpipmxW0mlCqHjYkAaeoZlqrqZ4qd+upQKaapn/AmgAegZ8KUtYtFAQQAgAh+QQFCgAbACwHAAQAzgALAAAF/+C2PUcmiCiZGUTrEkKBis8jQEquKwU5HyXIbEPgyX7BYa5wTNmEMwWsSXsqFbEh8DYs9mrgGjdK6GkPY5GOeU6ryz7UFopSQEzygOGhJBjoIgMDBAcBM0V/CYqLCQqFOwobiYyKjn2TlI6GKC2YjJZknouaZAcQlJUHl6eooJwKooobqoewrJSEmyKdt59NhRKFMxLEEA4RyMkMEAjDEhfGycqAG8TQx9IRDRDE3d3R2ctD1RLg0ttKEnbY5wZD3+zJ6M7X2RHi9Oby7u/r9g38UFjTh2xZJBEBMDAboogAgwkQI07IMUORwocSJwCgWDFBAIwZOaJIsOBjRogKJP8wTODw5ESVHVtm3AhzpEeQElOuNDlTZ0ycEUWKWFASqEahGwYUPbnxoAgEdlYSqDBkgoUNClAlIHbSAoOsqCRQnQHxq1axVb06FWFxLIqyaze0Tft1JVqyE+pWXMD1pF6bYl3+HTqAWNW8cRUFzmih0ZAAB2oGKukSAAGGRHWJgLiR6AylBLpuHKKUMlMCngMpDSAa9QIUggZVVvDaJobLeC3XZpvgNgCmtPcuwP3WgmXSq4do0DC6o2/guzcseECtUoO0hmcsGKDgOt7ssBd07wqesAIGZC1YIBa7PQHvb1+SFo+++HrJSQfB33xfav3i5eX3Hnb4CTJgegEq8tH/YQEOcIJzbm2G2EoYRLgBXFpVmFYDcREV4HIcnmUhiGBRouEMJGJGzHIspqgdXxK0yCKHRNXoIX4uorCdTyjkyNtdPWrA4Up82EbAbzMRxxZRR54WXVLDIRmRcag5d2R6ugl3ZXzNhTecchpMhIGVAKAYpgJjjsSklBEd99maZoo535ZvdamjBEpusJyctg3h4X8XqodBMx0tiNeg/oGJaKGABpogS40KSqiaEgBqlQWLUtqoVQnytekEjzo0hHqhRorppOZt2p923M2AAV+oBtpAnnPNoB6HaU6mAAIU+IXmi3j2mtFXuUoHKwXpzVrsjcgGOauKEjQrwq157hitGq2NoWmjh7z6Wmxb0m5w66+2VRAuXN/yFUAIACH5BAUKABsALAcABADOAAsAAAX/4CZuRiaM45MZqBgIRbs9AqTcuFLE7VHLOh7KB5ERdjJaEaU4ClO/lgKWjKKcMiJQ8KgumcieVdQMD8cbBeuAkkC6LYLhOxoQ2PF5Ys9PKPBMen17f0CCg4VSh32JV4t8jSNqEIOEgJKPlkYBlJWRInKdiJdkmQlvKAsLBxdABA4RsbIMBggtEhcQsLKxDBC2TAS6vLENdJLDxMZAubu8vjIbzcQRtMzJz79S08oQEt/guNiyy7fcvMbh4OezdAvGrakLAQwyABsELQkY9BP+//ckyPDD4J9BfAMh1GsBoImMeQUN+lMgUJ9CiRMa5msxoB9Gh/o8GmxYMZXIgxtR/yQ46S/gQAURR0pDwYDfywoyLPip5AdnCwsMFPBU4BPFhKBDi444quCmDKZOfwZ9KEGpCKgcN1jdALSpPqIYsabS+nSqvqplvYqQYAeDPgwKwjaMtiDl0oaqUAyo+3TuWwUAMPpVCfee0cEjVBGQq2ABx7oTWmQk4FglZMGN9fGVDMCuiH2AOVOu/PmyxM630gwM0CCn6q8LjVJ8GXvpa5Uwn95OTC/nNxkda1/dLSK475IjCD6dHbK1ZOa4hXP9DXs5chJ00UpVm5xo2qRpoxptwF2E4/IbJpB/SDz9+q9b1aNfQH08+p4a8uvX8B53fLP+ycAfemjsRUBgp1H20K+BghHgVgt1GXZXZpZ5lt4ECjxYR4ScUWiShEtZqBiIInRGWnERNnjiBglw+JyGnxUmGowsyiiZg189lNtPGACjV2+S9UjbU0JWF6SPvEk3QZEqsZYTk3UAaRSUnznJI5LmESCdBVSyaOWUWLK4I5gDUYVeV1T9l+FZClCAUVA09uSmRHBCKAECFEhW51ht6rnmWBXkaR+NjuHpJ40D3DmnQXt2F+ihZxlqVKOfQRACACH5BAUKABwALAcABADOAAsAAAX/ICdyUCkUo/g8mUG8MCGkKgspeC6j6XEIEBpBUeCNfECaglBcOVfJFK7YQwZHQ6JRZBUqTrSuVEuD3nI45pYjFuWKvjjSkCoRaBUMWxkwBGgJCXspQ36Bh4EEB0oKhoiBgyNLjo8Ki4QElIiWfJqHnISNEI+Ql5J9o6SgkqKkgqYihamPkW6oNBgSfiMMDQkGCBLCwxIQDhHIyQwQCGMKxsnKVyPCF9DREQ3MxMPX0cu4wt7J2uHWx9jlKd3o39MiuefYEcvNkuLt5O8c1ePI2tyELXGQwoGDAQf+iEC2xByDCRAjTlAgIUWCBRgCPJQ4AQBFXAs0coT40WLIjRxL/47AcHLkxIomRXL0CHPERZkpa4q4iVKiyp0tR/7kwHMkTUBBJR5dOCEBAVcKKtCAyOHpowXCpk7goABqBZdcvWploACpBKkpIJI1q5OD2rIWE0R1uTZu1LFwbWL9OlKuWb4c6+o9i3dEgw0RCGDUG9KlRw56gDY2qmCByZBaASi+TACA0TucAaTteCcy0ZuOK3N2vJlx58+LRQyY3Xm0ZsgjZg+oPQLi7dUcNXi0LOJw1pgNtB7XG6CBy+U75SYfPTSQAgZTNUDnQHt67wnbZyvwLgKiMN3oCZB3C76tdewpLFgIP2C88rbi4Y+QT3+8S5USMICZXWj1pkEDeUU3lOYGB3alSoEiMIjgX4WlgNF2EibIwQIXauWXSRg2SAOHIU5IIIMoZkhhWiJaiFVbKo6AQEgQXrTAazO1JhkBrBG3Y2Y6EsUhaGn95hprSN0oWpFE7rhkeaQBchGOEWnwEmc0uKWZj0LeuNV3W4Y2lZHFlQCSRjTIl8uZ+kG5HU/3sRlnTG2ytyadytnD3HrmuRcSn+0h1dycexIK1KCjYaCnjCCVqOFFJTZ5GkUUjESWaUIKU2lgCmAKKQIUjHapXRKE+t2og1VgankNYnohqKJ2CmKplso6GKz7WYCgqxeuyoF8u9IQAgA7",
            msg: null,
            msgText: "<em>Loading the next set of posts...</em>",
            selector: null,
            speed: "fast",
            start: undefined
        },
        state: {
            isDuringAjax: false,
            isInvalidPage: false,
            isDestroyed: false,
            isDone: false,
            // For when it goes all the way through the archive.
            isPaused: false,
            currPage: 1
        },
        debug: false,
        behavior: undefined,
        binder: $(window),
        // used to cache the selector
        nextSelector: "div.navigation a:first",
        navSelector: "div.navigation",
        contentSelector: null,
        // rename to pageFragment
        extraScrollPx: 150,
        itemSelector: "div.post",
        animate: false,
        pathParse: undefined,
        dataType: "html",
        appendCallback: true,
        bufferPx: 40,
        errorCallback: function() {},
        infid: 0,
        //Instance ID
        pixelsFromNavToBottom: undefined,
        path: undefined,
        // Either parts of a URL as an array (e.g. ["/page/", "/"] or a function that takes in the page number and returns a URL
        prefill: false,
        // When the document is smaller than the window, load data until the document is larger or links are exhausted
        maxPage: undefined
    };
    $.infinitescroll.prototype = {
        /*	
            ----------------------------
            Private methods
            ----------------------------
            */
        // Bind or unbind from scroll
        _binding: function infscr_binding(binding) {
            var instance = this, opts = instance.options;
            opts.v = "2.0b2.120520";
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["_binding_" + opts.behavior] !== undefined) {
                this["_binding_" + opts.behavior].call(this);
                return;
            }
            if (binding !== "bind" && binding !== "unbind") {
                this._debug("Binding value  " + binding + " not valid");
                return false;
            }
            if (binding === "unbind") {
                this.options.binder.unbind("smartscroll.infscr." + instance.options.infid);
            } else {
                this.options.binder[binding]("smartscroll.infscr." + instance.options.infid, function() {
                    instance.scroll();
                });
            }
            this._debug("Binding", binding);
        },
        // Fundamental aspects of the plugin are initialized
        _create: function infscr_create(options, callback) {
            // Add custom options to defaults
            var opts = $.extend(true, {}, $.infinitescroll.defaults, options);
            this.options = opts;
            var $window = $(window);
            var instance = this;
            // Validate selectors
            if (!instance._validate(options)) {
                return false;
            }
            // Validate page fragment path
            var path = $(opts.nextSelector).attr("href");
            if (!path) {
                this._debug("Navigation selector not found");
                return false;
            }
            // Set the path to be a relative URL from root.
            opts.path = opts.path || this._determinepath(path);
            // contentSelector is 'page fragment' option for .load() / .ajax() calls
            opts.contentSelector = opts.contentSelector || this.element;
            // loading.selector - if we want to place the load message in a specific selector, defaulted to the contentSelector
            opts.loading.selector = opts.loading.selector || opts.contentSelector;
            // Define loading.msg
            opts.loading.msg = opts.loading.msg || $('<div id="infscr-loading"><img alt="Loading..." src="' + opts.loading.img + '" /><div>' + opts.loading.msgText + "</div></div>");
            // Preload loading.img
            new Image().src = opts.loading.img;
            // distance from nav links to bottom
            // computed as: height of the document + top offset of container - top offset of nav link
            if (opts.pixelsFromNavToBottom === undefined) {
                opts.pixelsFromNavToBottom = $(document).height() - $(opts.navSelector).offset().top;
            }
            var self = this;
            // determine loading.start actions
            opts.loading.start = opts.loading.start || function() {
                $(opts.navSelector).hide();
                opts.loading.msg.appendTo(opts.loading.selector).show(opts.loading.speed, $.proxy(function() {
                    this.beginAjax(opts);
                }, self));
            };
            // determine loading.finished actions
            opts.loading.finished = opts.loading.finished || function() {
                opts.loading.msg.fadeOut(opts.loading.speed);
            };
            // callback loading
            opts.callback = function(instance, data, url) {
                if (!!opts.behavior && instance["_callback_" + opts.behavior] !== undefined) {
                    instance["_callback_" + opts.behavior].call($(opts.contentSelector)[0], data, url);
                }
                if (callback) {
                    callback.call($(opts.contentSelector)[0], data, opts, url);
                }
                if (opts.prefill) {
                    $window.bind("resize.infinite-scroll", instance._prefill);
                }
            };
            if (options.debug) {
                // Tell IE9 to use its built-in console
                if (Function.prototype.bind && (typeof console === "object" || typeof console === "function") && typeof console.log === "object") {
                    [ "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd" ].forEach(function(method) {
                        console[method] = this.call(console[method], console);
                    }, Function.prototype.bind);
                }
            }
            this._setup();
            // Setups the prefill method for use
            if (opts.prefill) {
                this._prefill();
            }
            // Return true to indicate successful creation
            return true;
        },
        _prefill: function infscr_prefill() {
            var instance = this;
            var $document = $(document);
            var $window = $(window);
            function needsPrefill() {
                return $document.height() <= $window.height();
            }
            this._prefill = function() {
                if (needsPrefill()) {
                    instance.scroll();
                }
                $window.bind("resize.infinite-scroll", function() {
                    if (needsPrefill()) {
                        $window.unbind("resize.infinite-scroll");
                        instance.scroll();
                    }
                });
            };
            // Call self after setting up the new function
            this._prefill();
        },
        // Console log wrapper
        _debug: function infscr_debug() {
            if (true !== this.options.debug) {
                return;
            }
            if (typeof console !== "undefined" && typeof console.log === "function") {
                // Modern browsers
                // Single argument, which is a string
                if (Array.prototype.slice.call(arguments).length === 1 && typeof Array.prototype.slice.call(arguments)[0] === "string") {
                    console.log(Array.prototype.slice.call(arguments).toString());
                } else {
                    console.log(Array.prototype.slice.call(arguments));
                }
            } else if (!Function.prototype.bind && typeof console !== "undefined" && typeof console.log === "object") {
                // IE8
                Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
            }
        },
        // find the number to increment in the path.
        _determinepath: function infscr_determinepath(path) {
            var opts = this.options;
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["_determinepath_" + opts.behavior] !== undefined) {
                return this["_determinepath_" + opts.behavior].call(this, path);
            }
            if (!!opts.pathParse) {
                this._debug("pathParse manual");
                return opts.pathParse(path, this.options.state.currPage + 1);
            } else if (path.match(/^(.*?)\b2\b(.*?$)/)) {
                path = path.match(/^(.*?)\b2\b(.*?$)/).slice(1);
            } else if (path.match(/^(.*?)2(.*?$)/)) {
                // page= is used in django:
                // http://www.infinite-scroll.com/changelog/comment-page-1/#comment-127
                if (path.match(/^(.*?page=)2(\/.*|$)/)) {
                    path = path.match(/^(.*?page=)2(\/.*|$)/).slice(1);
                    return path;
                }
                path = path.match(/^(.*?)2(.*?$)/).slice(1);
            } else {
                // page= is used in drupal too but second page is page=1 not page=2:
                // thx Jerod Fritz, vladikoff
                if (path.match(/^(.*?page=)1(\/.*|$)/)) {
                    path = path.match(/^(.*?page=)1(\/.*|$)/).slice(1);
                    return path;
                } else {
                    this._debug("Sorry, we couldn't parse your Next (Previous Posts) URL. Verify your the css selector points to the correct A tag. If you still get this error: yell, scream, and kindly ask for help at infinite-scroll.com.");
                    // Get rid of isInvalidPage to allow permalink to state
                    opts.state.isInvalidPage = true;
                }
            }
            this._debug("determinePath", path);
            return path;
        },
        // Custom error
        _error: function infscr_error(xhr) {
            var opts = this.options;
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["_error_" + opts.behavior] !== undefined) {
                this["_error_" + opts.behavior].call(this, xhr);
                return;
            }
            if (xhr !== "destroy" && xhr !== "end") {
                xhr = "unknown";
            }
            this._debug("Error", xhr);
            if (xhr === "end") {
                this._showdonemsg();
            }
            opts.state.isDone = true;
            opts.state.currPage = 1;
            // if you need to go back to this instance
            opts.state.isPaused = false;
            this._binding("unbind");
        },
        // Load Callback
        _loadcallback: function infscr_loadcallback(box, data, url) {
            var opts = this.options, callback = this.options.callback, // GLOBAL OBJECT FOR CALLBACK
            result = opts.state.isDone ? "done" : !opts.appendCallback ? "no-append" : "append", frag;
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["_loadcallback_" + opts.behavior] !== undefined) {
                this["_loadcallback_" + opts.behavior].call(this, box, data);
                return;
            }
            switch (result) {
              case "done":
                this._showdonemsg();
                return false;

              case "no-append":
                if (opts.dataType === "html") {
                    data = "<div>" + data + "</div>";
                    data = $(data).find(opts.itemSelector);
                }
                break;

              case "append":
                var children = box.children();
                // if it didn't return anything
                if (children.length === 0) {
                    return this._error("end");
                }
                // use a documentFragment because it works when content is going into a table or UL
                frag = document.createDocumentFragment();
                while (box[0].firstChild) {
                    frag.appendChild(box[0].firstChild);
                }
                this._debug("contentSelector", $(opts.contentSelector)[0]);
                $(opts.contentSelector)[0].appendChild(frag);
                // previously, we would pass in the new DOM element as context for the callback
                // however we're now using a documentfragment, which doesn't have parents or children,
                // so the context is the contentContainer guy, and we pass in an array
                // of the elements collected as the first argument.
                data = children.get();
                break;
            }
            // loadingEnd function
            opts.loading.finished.call($(opts.contentSelector)[0], opts);
            // smooth scroll to ease in the new content
            if (opts.animate) {
                var scrollTo = $(window).scrollTop() + $("#infscr-loading").height() + opts.extraScrollPx + "px";
                $("html,body").animate({
                    scrollTop: scrollTo
                }, 800, function() {
                    opts.state.isDuringAjax = false;
                });
            }
            if (!opts.animate) {
                // once the call is done, we can allow it again.
                opts.state.isDuringAjax = false;
            }
            callback(this, data, url);
            if (opts.prefill) {
                this._prefill();
            }
        },
        _nearbottom: function infscr_nearbottom() {
            var opts = this.options, pixelsFromWindowBottomToBottom = 0 + $(document).height() - opts.binder.scrollTop() - $(window).height();
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["_nearbottom_" + opts.behavior] !== undefined) {
                return this["_nearbottom_" + opts.behavior].call(this);
            }
            this._debug("math:", pixelsFromWindowBottomToBottom, opts.pixelsFromNavToBottom);
            // if distance remaining in the scroll (including buffer) is less than the orignal nav to bottom....
            return pixelsFromWindowBottomToBottom - opts.bufferPx < opts.pixelsFromNavToBottom;
        },
        // Pause / temporarily disable plugin from firing
        _pausing: function infscr_pausing(pause) {
            var opts = this.options;
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["_pausing_" + opts.behavior] !== undefined) {
                this["_pausing_" + opts.behavior].call(this, pause);
                return;
            }
            // If pause is not 'pause' or 'resume', toggle it's value
            if (pause !== "pause" && pause !== "resume" && pause !== null) {
                this._debug("Invalid argument. Toggling pause value instead");
            }
            pause = pause && (pause === "pause" || pause === "resume") ? pause : "toggle";
            switch (pause) {
              case "pause":
                opts.state.isPaused = true;
                break;

              case "resume":
                opts.state.isPaused = false;
                break;

              case "toggle":
                opts.state.isPaused = !opts.state.isPaused;
                break;
            }
            this._debug("Paused", opts.state.isPaused);
            return false;
        },
        // Behavior is determined
        // If the behavior option is undefined, it will set to default and bind to scroll
        _setup: function infscr_setup() {
            var opts = this.options;
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["_setup_" + opts.behavior] !== undefined) {
                this["_setup_" + opts.behavior].call(this);
                return;
            }
            this._binding("bind");
            return false;
        },
        // Show done message
        _showdonemsg: function infscr_showdonemsg() {
            var opts = this.options;
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["_showdonemsg_" + opts.behavior] !== undefined) {
                this["_showdonemsg_" + opts.behavior].call(this);
                return;
            }
            opts.loading.msg.find("img").hide().parent().find("div").html(opts.finishedMsg).animate({
                opacity: 1
            }, 2e3, function() {
                $(this).parent().fadeOut(opts.loading.speed);
            });
            // user provided callback when done    
            opts.errorCallback.call($(opts.contentSelector)[0], "done");
        },
        // grab each selector option and see if any fail
        _validate: function infscr_validate(opts) {
            for (var key in opts) {
                if (key.indexOf && key.indexOf("Selector") > -1 && $(opts[key]).length === 0) {
                    this._debug("Your " + key + " found no elements.");
                    return false;
                }
            }
            return true;
        },
        /*	
            ----------------------------
            Public methods
            ----------------------------
            */
        // Bind to scroll
        bind: function infscr_bind() {
            this._binding("bind");
        },
        // Destroy current instance of plugin
        destroy: function infscr_destroy() {
            this.options.state.isDestroyed = true;
            this.options.loading.finished();
            return this._error("destroy");
        },
        // Set pause value to false
        pause: function infscr_pause() {
            this._pausing("pause");
        },
        // Set pause value to false
        resume: function infscr_resume() {
            this._pausing("resume");
        },
        beginAjax: function infscr_ajax(opts) {
            var instance = this, path = opts.path, box, desturl, method, condition;
            // increment the URL bit. e.g. /page/3/
            opts.state.currPage++;
            // Manually control maximum page 
            if (opts.maxPage != undefined && opts.state.currPage > opts.maxPage) {
                this.destroy();
                return;
            }
            // if we're dealing with a table we can't use DIVs
            box = $(opts.contentSelector).is("table") ? $("<tbody/>") : $("<div/>");
            desturl = typeof path === "function" ? path(opts.state.currPage) : path.join(opts.state.currPage);
            instance._debug("heading into ajax", desturl);
            method = opts.dataType === "html" || opts.dataType === "json" ? opts.dataType : "html+callback";
            if (opts.appendCallback && opts.dataType === "html") {
                method += "+callback";
            }
            switch (method) {
              case "html+callback":
                instance._debug("Using HTML via .load() method");
                box.load(desturl + " " + opts.itemSelector, undefined, function infscr_ajax_callback(responseText) {
                    instance._loadcallback(box, responseText, desturl);
                });
                break;

              case "html":
                instance._debug("Using " + method.toUpperCase() + " via $.ajax() method");
                $.ajax({
                    // params
                    url: desturl,
                    dataType: opts.dataType,
                    complete: function infscr_ajax_callback(jqXHR, textStatus) {
                        condition = typeof jqXHR.isResolved !== "undefined" ? jqXHR.isResolved() : textStatus === "success" || textStatus === "notmodified";
                        if (condition) {
                            instance._loadcallback(box, jqXHR.responseText, desturl);
                        } else {
                            instance._error("end");
                        }
                    }
                });
                break;

              case "json":
                instance._debug("Using " + method.toUpperCase() + " via $.ajax() method");
                $.ajax({
                    dataType: "json",
                    type: "GET",
                    url: desturl,
                    success: function(data, textStatus, jqXHR) {
                        condition = typeof jqXHR.isResolved !== "undefined" ? jqXHR.isResolved() : textStatus === "success" || textStatus === "notmodified";
                        if (opts.appendCallback) {
                            // if appendCallback is true, you must defined template in options.
                            // note that data passed into _loadcallback is already an html (after processed in opts.template(data)).
                            if (opts.template !== undefined) {
                                var theData = opts.template(data);
                                box.append(theData);
                                if (condition) {
                                    instance._loadcallback(box, theData);
                                } else {
                                    instance._error("end");
                                }
                            } else {
                                instance._debug("template must be defined.");
                                instance._error("end");
                            }
                        } else {
                            // if appendCallback is false, we will pass in the JSON object. you should handle it yourself in your callback.
                            if (condition) {
                                instance._loadcallback(box, data, desturl);
                            } else {
                                instance._error("end");
                            }
                        }
                    },
                    error: function() {
                        instance._debug("JSON ajax request failed.");
                        instance._error("end");
                    }
                });
                break;
            }
        },
        // Retrieve next set of content items
        retrieve: function infscr_retrieve(pageNum) {
            pageNum = pageNum || null;
            var instance = this, opts = instance.options;
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["retrieve_" + opts.behavior] !== undefined) {
                this["retrieve_" + opts.behavior].call(this, pageNum);
                return;
            }
            // for manual triggers, if destroyed, get out of here
            if (opts.state.isDestroyed) {
                this._debug("Instance is destroyed");
                return false;
            }
            // we dont want to fire the ajax multiple times
            opts.state.isDuringAjax = true;
            opts.loading.start.call($(opts.contentSelector)[0], opts);
        },
        // Check to see next page is needed
        scroll: function infscr_scroll() {
            var opts = this.options, state = opts.state;
            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this["scroll_" + opts.behavior] !== undefined) {
                this["scroll_" + opts.behavior].call(this);
                return;
            }
            if (state.isDuringAjax || state.isInvalidPage || state.isDone || state.isDestroyed || state.isPaused) {
                return;
            }
            if (!this._nearbottom()) {
                return;
            }
            this.retrieve();
        },
        // Toggle pause value
        toggle: function infscr_toggle() {
            this._pausing();
        },
        // Unbind from scroll
        unbind: function infscr_unbind() {
            this._binding("unbind");
        },
        // update options
        update: function infscr_options(key) {
            if ($.isPlainObject(key)) {
                this.options = $.extend(true, this.options, key);
            }
        }
    };
    /*	
        ----------------------------
        Infinite Scroll function
        ----------------------------

        Borrowed logic from the following...

        jQuery UI
        - https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js

        jCarousel
        - https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js

        Masonry
        - https://github.com/desandro/masonry/blob/master/jquery.masonry.js		

*/
    $.fn.infinitescroll = function infscr_init(options, callback) {
        var thisCall = typeof options;
        switch (thisCall) {
          // method 
            case "string":
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function() {
                var instance = $.data(this, "infinitescroll");
                if (!instance) {
                    // not setup yet
                    // return $.error('Method ' + options + ' cannot be called until Infinite Scroll is setup');
                    return false;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    // return $.error('No such method ' + options + ' for Infinite Scroll');
                    return false;
                }
                // no errors!
                instance[options].apply(instance, args);
            });
            break;

          // creation 
            case "object":
            this.each(function() {
                var instance = $.data(this, "infinitescroll");
                if (instance) {
                    // update options of current instance
                    instance.update(options);
                } else {
                    // initialize new instance
                    instance = new $.infinitescroll(options, callback, this);
                    // don't attach if instantiation failed
                    if (!instance.failed) {
                        $.data(this, "infinitescroll", instance);
                    }
                }
            });
            break;
        }
        return this;
    };
    /* 
     * smartscroll: debounced scroll event for jQuery *
     * https://github.com/lukeshumard/smartscroll
     * Based on smartresize by @louis_remi: https://github.com/lrbabe/jquery.smartresize.js *
     * Copyright 2011 Louis-Remi & Luke Shumard * Licensed under the MIT license. *
     */
    var event = $.event, scrollTimeout;
    event.special.smartscroll = {
        setup: function() {
            $(this).bind("scroll", event.special.smartscroll.handler);
        },
        teardown: function() {
            $(this).unbind("scroll", event.special.smartscroll.handler);
        },
        handler: function(event, execAsap) {
            // Save the context
            var context = this, args = arguments;
            // set correct event type
            event.type = "smartscroll";
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(function() {
                $(context).trigger("smartscroll", args);
            }, execAsap === "execAsap" ? 0 : 100);
        }
    };
    $.fn.smartscroll = function(fn) {
        return fn ? this.bind("smartscroll", fn) : this.trigger("smartscroll", [ "execAsap" ]);
    };
})(window, jQuery);

// Generated by CoffeeScript 1.4.0
/*
Sticky Elements Shortcut for jQuery Waypoints - v2.0.2
Copyright (c) 2011-2013 Caleb Troughton
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/
(function() {
    (function(root, factory) {
        if (typeof define === "function" && define.amd) {
            return define([ "jquery", "waypoints" ], factory);
        } else {
            return factory(root.jQuery);
        }
    })(this, function($) {
        var defaults, wrap;
        defaults = {
            wrapper: '<div class="sticky-wrapper" />',
            stuckClass: "stuck"
        };
        wrap = function($elements, options) {
            $elements.wrap(options.wrapper);
            $elements.each(function() {
                var $this;
                $this = $(this);
                $this.parent().height($this.outerHeight());
                return true;
            });
            return $elements.parent();
        };
        return $.waypoints("extendFn", "sticky", function(options) {
            var $wrap, originalHandler;
            options = $.extend({}, $.fn.waypoint.defaults, defaults, options);
            $wrap = wrap(this, options);
            originalHandler = options.handler;
            options.handler = function(direction) {
                var $sticky, shouldBeStuck;
                $sticky = $(this).children(":first");
                shouldBeStuck = direction === "down" || direction === "right";
                $sticky.toggleClass(options.stuckClass, shouldBeStuck);
                if (originalHandler != null) {
                    return originalHandler.call(this, direction);
                }
            };
            $wrap.waypoint(options);
            return this;
        });
    });
}).call(this);