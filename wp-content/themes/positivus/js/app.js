(function(exports, global) {
    global["true"] = exports;
    "use strict";
    var $, $$, App, Dump, global, select, setup_global_values;
    $ = jQuery;
    $$ = $.q;
    $.fx.speeds._default = 700;
    select = {
        body: "html, body",
        header: "#header",
        header_block: "#header-block",
        content: "#content",
        footer: "#footer",
        item: {
            single: ".js__items--single-item",
            list: ".js__items--list"
        }
    };
    App = {
        callback: {
            layout: jQuery.Callbacks(),
            packery: jQuery.Callbacks(),
            previewer: jQuery.Callbacks(),
            recollect: jQuery.Callbacks()
        },
        state: {
            responsive: null,
            width: 0
        },
        dfd: {},
        sniff: {},
        Packery: false,
        Util: false,
        Loading: false,
        Infinite: false
    };
    setup_global_values = function(select) {
        var $value, global, key, second_key, second_value, value;
        global = {
            window: $(window),
            document: $(document)
        };
        for (key in select) {
            value = select[key];
            if (_.isString(value)) {
                $value = $(value);
                global[key] = $value.length === 0 ? false : $value;
            } else {
                global[key] = {};
                for (second_key in value) {
                    second_value = value[second_key];
                    $value = $(second_value);
                    global[key][second_key] = $value.length === 0 ? false : $value;
                }
            }
        }
        global.document.trigger("pure:globals");
        return global;
    };
    global = setup_global_values(select);
    global.window.on("orientationchange", function() {
        global.window.trigger("debouncedresize");
        return $.waypoints("refresh");
    });
    /*
				DEBUGGING TOOLS BELOW
*/
    Dump = function(message) {
        return null;
    };
    var Content_Castaway, __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    Content_Castaway = function() {
        function Content_Castaway(options) {
            this.restore = __bind(this.restore, this);
            this.show = __bind(this.show, this);
            this.replace = __bind(this.replace, this);
            this.remove = __bind(this.remove, this);
            var defaults, settings;
            defaults = {
                container: $$(select.item.list),
                content: $$(select.content),
                single: $$(select.item.single)
            };
            this.fly_distance = $(window).height();
            settings = $.extend(true, {}, defaults, options);
            this.content = $(settings.content);
            this.container = $(settings.container);
            this.single = $(settings.single);
            this.original_container = this.container.clone();
        }
        Content_Castaway.prototype.add = function(data) {
            return this.container.append(data);
        };
        Content_Castaway.prototype.detach = function(elements) {
            this.parent = this.content.parent();
            return this.content.detach();
        };
        Content_Castaway.prototype.reattach = function() {
            this.parent.append(this.content);
            return this;
        };
        Content_Castaway.prototype.remove = function() {
            return this.container.html("");
        };
        Content_Castaway.prototype.destroy = function() {
            return this.container.remove();
        };
        Content_Castaway.prototype.find_content = function(data) {
            return $(data).find(this.container.selector).children();
        };
        Content_Castaway.prototype.replace = function(data) {
            var dfd, _this = this;
            dfd = this.hide(this.remove);
            $.when(dfd).done(function() {
                return _this.add(data);
            });
            return dfd;
        };
        Content_Castaway.prototype.get_children = function() {
            return $(this.container.selector).find(this.single.selector);
        };
        Content_Castaway.prototype.hide = function(callback) {
            var $children, dfd;
            if (callback == null) {
                callback = false;
            }
            App.Loading.start();
            $children = this.get_children();
            dfd = App.Util.transition({
                items: _.shuffle($children),
                duration: App.Util.random_time,
                transition: {
                    y: this.fly_distance,
                    opacity: 0,
                    easing: "easeInQuint"
                }
            });
            if (callback) {
                $.when(dfd).done(callback);
            }
            return dfd;
        };
        Content_Castaway.prototype.show = function() {
            var $children, dfd;
            $children = this.get_children();
            App.Loading.stop();
            this.container.css({
                overflow: "hidden"
            });
            $children.css({
                y: this.fly_distance * -2
            });
            dfd = App.Util.transition({
                items: _.shuffle($children),
                duration: App.Util.random_time,
                transition: {
                    y: "0",
                    opacity: 1,
                    easing: "easeOutCubic"
                }
            });
            $.when(dfd).done(function() {
                App.callback.recollect.fire();
                if (App.Packery) {
                    return App.Packery("layout");
                }
            });
            return dfd;
        };
        Content_Castaway.prototype.restore = function() {
            return this.replace(this.original_container.clone().children());
        };
        return Content_Castaway;
    }();
    var Infinite_Scroll, __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    Infinite_Scroll = function() {
        function Infinite_Scroll(loading) {
            if (loading == null) {
                loading = false;
            }
            this.loading_end = __bind(this.loading_end, this);
            this.loading_start = __bind(this.loading_start, this);
            this.reset = __bind(this.reset, this);
            this.on_append = __bind(this.on_append, this);
            this.Loading = loading;
            this.setup();
        }
        Infinite_Scroll.prototype.setup = function() {
            if ($$(select.item.list).length === 0) {
                return false;
            }
            return $$(select.item.list).infinitescroll({
                navSelector: "ul.page-numbers",
                nextSelector: ".page-numbers.next",
                itemSelector: select.item.single,
                finishedMsg: false,
                loading: {
                    start: this.loading_start,
                    finished: this.loading_end
                },
                errorCallback: this.loading_end,
                msgText: false,
                debug: false,
                path: function(pageNum) {
                    var base_url, next_page, next_url, pattern;
                    base_url = $$(".page-numbers", true).find("a.page-numbers").first().attr("href");
                    pattern = /(page)(\/|=)(\d)/;
                    if (pageNum > 2) {
                        next_page = pageNum - 1;
                    }
                    next_url = base_url.replace(pattern, "$1$2" + pageNum);
                    return next_url;
                }
            }, this.on_append);
        };
        Infinite_Scroll.prototype.on_append = function(items) {
            var $items, _this = this;
            $items = $(items);
            if (App.Packery) {
                $items.css({
                    opacity: 0
                });
                App.callback.packery.add(function() {
                    return $items.css({
                        opacity: 1
                    });
                });
            }
            $items.find("img").imagesLoaded(function() {
                App.callback.recollect.fire();
                $$(document).trigger("pure:append", items);
                _this.loading_end();
                return _this.resume();
            });
        };
        Infinite_Scroll.prototype.destroy = function() {
            if ($$(select.item.list) === false) {
                return false;
            }
            $$(select.item.list).infinitescroll("destroy");
            return $$(select.item.list).data("infinitescroll", null);
        };
        Infinite_Scroll.prototype.reset = function() {
            if ($$(select.item.list).data("infinitescroll")) {
                this.destroy();
            }
            return this.setup();
        };
        Infinite_Scroll.prototype.pause = function() {
            if ($$(select.item.list) === false) {
                return false;
            }
            return $$(select.item.list).infinitescroll("pause");
        };
        Infinite_Scroll.prototype.resume = function() {
            if ($$(select.item.list) === false) {
                return false;
            }
            return $$(select.item.list).infinitescroll("resume");
        };
        Infinite_Scroll.prototype.load = function() {
            if ($$(select.item.list) === false) {
                return false;
            }
            return $$(select.item.list).infinitescroll("retrieve");
        };
        Infinite_Scroll.prototype.loading_start = function(opts) {
            if (this.Loading) {
                this.Loading.small().start();
            }
            if ($$(select.item.list) === false) {
                return false;
            }
            $$(select.item.list).data("infinitescroll").beginAjax(opts);
            return this.pause();
        };
        Infinite_Scroll.prototype.loading_end = function() {
            if ($$(select.item.list) === false) {
                return false;
            }
            if (this.Loading) {
                return this.Loading.stop();
            }
        };
        return Infinite_Scroll;
    }();
    var Loading_Spinner;
    Loading_Spinner = function() {
        function Loading_Spinner() {
            this.spinner = $("#loading-spinner");
            this.spinner.hide();
            this.status = 0;
        }
        Loading_Spinner.prototype.start = function(callback) {
            if (this.status === 1) {
                return;
            }
            this.status = 1;
            this.spinner.fadeIn(200, callback);
            return this;
        };
        Loading_Spinner.prototype.stop = function(callback) {
            if (this.status === 0) {
                return;
            }
            this.status = 0;
            this.spinner.fadeOut(200, callback);
            this.reset_size();
            return this;
        };
        Loading_Spinner.prototype.small = function() {
            this.spinner.addClass("small");
            return this;
        };
        Loading_Spinner.prototype.reset_size = function() {
            var _this = this;
            $.when(this.spinner).done(function() {
                return _this.spinner.removeClass("small");
            });
            return this;
        };
        return Loading_Spinner;
    }();
    var Pure_Utilities;
    Pure_Utilities = function() {
        function Pure_Utilities() {}
        Pure_Utilities.prototype.delay = function(ms, func) {
            return setTimeout(func, ms);
        };
        Pure_Utilities.prototype.random_time = function() {
            return _.random(650, 1e3);
        };
        Pure_Utilities.prototype.transition = function(settings) {
            var Deferred, item, resolver, trans, _i, _len, _ref;
            Deferred = new $.Deferred();
            resolver = _.after(settings.items.length, Deferred.resolve);
            _ref = settings.items;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                item = _ref[_i];
                trans = settings.transition;
                trans.complete = resolver;
                trans.duration = _.isFunction(settings.duration) ? settings.duration() : settings.duration;
                $(item).addClass("dont-flicker").transition(trans);
            }
            return Deferred.promise();
        };
        return Pure_Utilities;
    }();
    var Toggler, __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };
    Toggler = function() {
        var setup_preview;
        function Toggler(options) {
            this.toggle = __bind(this.toggle, this);
            this.load = __bind(this.load, this);
            var defaults;
            defaults = {
                preview: false,
                content: "#js-post",
                items: ".js-preview"
            };
            this.selectors = $.extend(true, {}, defaults, options);
            this._URL = false;
            this._loaded_URL = false;
            this.iface = {
                window: global.window,
                body: global.body,
                preview: setup_preview(this.selectors.preview)
            };
        }
        setup_preview = function(preview) {
            if (_.isObject(preview)) {
                return preview;
            } else {
                $("body").append(' \n<div id="toggle-container"> \n	<div id="toggle-inner" style="height: auto;"></div>\n</div>');
                return {
                    container: $("#toggle-container"),
                    content: $("#toggle-inner")
                };
            }
        };
        Toggler.prototype.load = function(e) {
            var _this = this;
            return this.iface.preview.container.load("" + this._URL + " " + this.selectors.content, function() {
                return _this.on_load_complete(e);
            });
        };
        Toggler.prototype.on_load_complete = function(data) {
            this.cache_url(this._URL);
            this.open(data);
        };
        Toggler.prototype.open = function() {
            this.is_open = true;
            return this.iface.preview.container.show();
        };
        Toggler.prototype.close = function() {
            this.is_open = false;
            return this.iface.preview.container.hide();
        };
        Toggler.prototype.toggle = function(URL) {
            this._URL = URL;
            if (this.is_open !== true || this.is_new_url(this._URL)) {
                return this.reopen(URL);
            } else {
                return this.close();
            }
        };
        Toggler.prototype.reopen = function(URL) {
            if (this.is_open === true) {
                this.close();
            }
            if (this.is_new_url(this._URL)) {
                return this.load(URL);
            } else {
                return this.open();
            }
        };
        Toggler.prototype.is_new_url = function(URL) {
            if (URL !== this._loaded_URL) {
                return true;
            } else {
                return false;
            }
        };
        Toggler.prototype.cache_url = function(URL) {
            this._loaded_URL = URL;
            this._URL = false;
        };
        Toggler.prototype.cache_data = function(data) {
            this._cached = data.clone().hide();
        };
        Toggler.prototype.get_cached_data = function() {
            return this._cached.clone().show();
        };
        return Toggler;
    }();
    var Previewer, __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    Previewer = function(_super) {
        __extends(Previewer, _super);
        function Previewer(options) {
            this.on_container_open = __bind(this.on_container_open, this);
            this.on_container_close = __bind(this.on_container_close, this);
            this.on_item_close = __bind(this.on_item_close, this);
            this.on_item_open = __bind(this.on_item_open, this);
            this.refresh = __bind(this.refresh, this);
            this.toggle = __bind(this.toggle, this);
            this.load = __bind(this.load, this);
            var _this = this;
            options.preview = {
                content: $("#content"),
                container: $("#primary")
            };
            options.content = "#content";
            Previewer.__super__.constructor.call(this, options);
            this.items = {
                current: {
                    $item: false
                },
                previous: false
            };
            this.properties = this.setup_properties();
            this.is_open = false;
            this._cached = {};
            this._root_url = document.URL;
            this.blocking(false);
            this.update_items();
            this.packery = global.item.list;
            if (!(App.browser.iOS || App.browser.IE)) {
                global.window.on("debouncedresize", function(e, args) {
                    _this.close();
                    return $.when(_this.items.current.$item).done(function() {
                        return _this.refresh();
                    });
                });
            }
            if (typeof history !== "undefined" && history !== null && history.pushState != null) {
                $$(document).on("previewer:update_root", function(e, url) {
                    console.log("Received " + url);
                    return _this._root_url = url;
                });
            }
        }
        Previewer.prototype.load = function(URL) {
            var load, _this = this;
            load = $.get(URL);
            load.done(function(data) {
                var $data, content;
                if (typeof history !== "undefined" && history !== null && history.pushState != null) {
                    history.pushState({}, "", URL);
                }
                $data = $(data);
                content = $data.find("#content");
                _this.cache_data(content);
                return _this.on_load_complete(content);
            });
            return load;
        };
        Previewer.prototype.open = function($content) {
            var $container, dfd, _this = this;
            if (this.is_open !== false) {
                return false;
            }
            this.current = $content;
            this.scrollTop = global.window.scrollTop();
            $container = this.iface.preview.container;
            global.body.animate({
                scrollTop: $container.offset().top - 25
            });
            dfd = App.content.hide();
            App.Infinite.pause();
            $.when(dfd).done(function() {
                _this.blocking(true);
                App.content.detach();
                $content.find("#js-single-item").css({
                    "min-height": _this.properties.min_height
                });
                $content.appendTo($container).css({
                    y: $container.height() * -1.25
                });
                $content.addClass("dont-flicker").transition({
                    y: 0,
                    easing: "easeOutCirc",
                    duration: 800,
                    complete: function() {
                        var $fitvids;
                        _this.on_item_open();
                        _this.on_container_open();
                        $fitvids = $content.find(".fitvids");
                        if ($fitvids.length > 0) {
                            $fitvids.css({
                                opacity: 0
                            });
                            $fitvids.fitVids();
                            return App.Util.delay(500, function() {
                                return $fitvids.transition({
                                    opacity: 1,
                                    duration: 800
                                });
                            });
                        }
                    }
                });
                return App.callback.previewer.fire($content);
            });
        };
        Previewer.prototype.close = function(item_obj) {
            var _this = this;
            if (item_obj == null) {
                item_obj = this.items.current;
            }
            if (this.is_open !== true) {
                return false;
            }
            if (typeof history !== "undefined" && history !== null && history.pushState != null) {
                history.pushState({}, "", this._root_url);
            }
            App.Infinite.resume();
            return this.current.transition({
                y: $(document).height(),
                easing: "easeInQuint",
                complete: function() {
                    _this.current.remove();
                    App.content.reattach().show();
                    $(window).scrollTop(_this.scrollTop);
                    _this.on_item_close(item_obj);
                    return _this.on_container_close(item_obj);
                }
            });
        };
        Previewer.prototype.reopen = function(e) {
            var $item, DFD, _this = this;
            $item = this.set_current_item($(e.currentTarget).closest(this.selectors.items));
            if (this.is_open === true) {
                DFD = this.close(this.items.previous);
            }
            this.start_loading();
            return $.when(DFD).done(function() {
                if (_this.is_new_url(_this._URL)) {
                    return _this.load(e);
                } else {
                    return _this.open(_this.get_cached_data());
                }
            });
        };
        Previewer.prototype.toggle = function(url) {
            if (this.blocked === true) {
                return false;
            }
            this.blocking(true);
            return Previewer.__super__.toggle.call(this, url);
        };
        Previewer.prototype.refresh = function() {
            this.setup_properties();
            return this.update_items();
        };
        Previewer.prototype.setup_properties = function() {
            this.properties = {
                min_height: 500,
                easing: "easeInOutQuad",
                window: {
                    width: global.window.width(),
                    height: global.window.height()
                }
            };
            this.properties.min_height = this.properties.window.height;
            return this.properties;
        };
        Previewer.prototype.set_current_item = function($item) {
            if ($item == null) {
                $item = false;
            }
            this.items.previous = $.extend(true, {}, this.items.current);
            this.items.previous.is_open = this.is_open;
            if ($item !== false) {
                if ($item.length > 1) {
                    $item = $item.first();
                }
                this.items.current.$item = $item;
            } else {
                this.items.current.$item = false;
            }
            return $item;
        };
        Previewer.prototype.update_items = function() {
            if (this.items.current.$item == null) {
                this.items.current.$item = false;
                this.items.previous = false;
                return this.items;
            } else {
                return true;
            }
        };
        Previewer.prototype.start_loading = function() {
            return App.Loading.start();
        };
        Previewer.prototype.stop_loading = function() {
            var $container, $content;
            $container = this.iface.preview.container;
            $content = this.iface.preview.content;
            return App.Loading.stop(function() {
                return $content.show();
            });
        };
        Previewer.prototype.blocking = function(maybe) {
            this.blocked = maybe;
            return this.blocked;
        };
        Previewer.prototype.on_item_open = function() {
            this.blocking(false);
            if (this.items.current != null && this.items.current.$item !== false) {
                this.stop_loading();
                this.items.current.$item.addClass("is-open");
                this.is_open = true;
            }
        };
        Previewer.prototype.on_item_close = function(item_obj) {
            this.is_open = false;
            this.blocking(false);
            return item_obj.$item.removeClass("is-open");
        };
        Previewer.prototype.on_container_close = function(item_obj) {
            this.is_open = false;
        };
        Previewer.prototype.on_container_open = function() {
            this.is_open = true;
            return global.document.trigger("preview:content_opened", this.current);
        };
        return Previewer;
    }(Toggler);
    (function() {
        var fix_firefox_image_height, images, setup_fitvids;
        App.Loading = new Loading_Spinner();
        App.Util = new Pure_Utilities();
        App.Infinite = new Infinite_Scroll(App.Loading);
        fix_firefox_image_height = function($images) {
            var $img, img, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = $images.length; _i < _len; _i++) {
                img = $images[_i];
                $img = $(img);
                $img.css({
                    height: "auto"
                });
                _results.push($img.css({
                    height: $img.height()
                }));
            }
            return _results;
        };
        if (Modernizr.flexboxlegacy && !Modernizr.flexbox) {
            images = global.content.find(".size-full");
            fix_firefox_image_height(images);
            global.window.on("debouncedresize", function() {
                return fix_firefox_image_height(images);
            });
        }
        App.browser = {
            iOS: navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false,
            IE: typeof is_msie !== "undefined" && is_msie !== null && is_msie === true ? true : false
        };
        if (App.browser.iOS === true) {
            $$("body").addClass("iOS");
        }
        setup_fitvids = function() {
            global.content.fitVids();
        };
        setup_fitvids();
        $$("#primary").css({
            "min-height": global.window.height()
        });
        $$(document).ready(function() {
            return $.stellar({
                positionProperty: "transform",
                verticalOffset: $$(select.header).height() / 2,
                horizontalScrolling: false,
                responsive: true
            });
        });
        $$(document).imagesLoaded(function() {
            return $.stellar("refresh");
        });
        $$(window).on("debouncedresize", function() {
            return $.stellar("refresh");
        });
    }).call(this);
    (function() {
        var setup_classic_items;
        setup_classic_items = function() {
            var $entries, $entry, $image, container_width, entry, _i, _len, _results;
            if (!global.item.single) {
                return false;
            }
            $entries = global.item.single.filter(".classic-item");
            if ($entries.length === 0) {
                return false;
            }
            container_width = global.item.list.width();
            _results = [];
            for (_i = 0, _len = $entries.length; _i < _len; _i++) {
                entry = $entries[_i];
                $entry = $(entry);
                $image = $entry.find(".wp-post-image");
                if ($image.length !== 1) {
                    continue;
                }
                if ($image.width() < container_width) {
                    _results.push($image.addClass("is-not-fullwidth"));
                } else {
                    _results.push($image.removeClass("is-not-fullwidth"));
                }
            }
            return _results;
        };
        if (global.item.list) {
            global.document.on("infscr", setup_classic_items);
            global.window.on("debouncedresize", setup_classic_items);
        }
    }).call(this);
    (function() {
        var create_close_button;
        create_close_button = function($content) {
            if ($content == null) {
                $content = false;
            }
            if ($content === false || $content.length === 0) {
                return;
            }
            return $.when($content).done(function() {
                var $close, close_height, content_height, header_height, max_bottom, offset, scroll, throttled;
                $close = $content.find(".js__close");
                header_height = global.header.height() * 2;
                offset = $content.offset().top;
                if (global.window.width() > 1023) {
                    offset = offset - header_height;
                } else {
                    offset = offset - 50;
                }
                close_height = $close.outerHeight();
                content_height = $content.outerHeight();
                max_bottom = content_height - close_height;
                scroll = function() {
                    var pos, sTop;
                    sTop = global.window.scrollTop();
                    pos = sTop - offset;
                    if (sTop < offset) {
                        pos = 0;
                    }
                    if (pos > max_bottom) {
                        pos = max_bottom;
                    }
                    return $close.stop().transition({
                        y: pos,
                        easing: "easeOutQuad",
                        duration: 200
                    });
                };
                throttled = _.debounce(scroll, 50);
                global.window.scroll(throttled);
                return $close.one("click", function() {
                    return global.document.trigger("preview:close");
                });
            });
        };
        App.callback.previewer.add(create_close_button);
    }).call(this);
    (function() {
        var setup_colorbox;
        setup_colorbox = function(container) {
            var $cbox, $post, cbox_class;
            $post = $(container).find("#js-single-item");
            cbox_class = $post.data("colorbox");
            if (cbox_class == null) {
                return false;
            }
            $cbox = $post.find("." + cbox_class);
            if (!($cbox.length != null && $cbox.length > 0)) {
                return false;
            }
            $cbox.colorbox({
                rel: $cbox,
                maxWidth: "100%",
                maxHeight: "100%"
            });
            return $cbox;
        };
        setup_colorbox("#content");
        global.document.on("preview:content_opened", function(e, container) {
            setup_colorbox(container);
        });
    }).call(this);
    (function() {
        var comment_failure, comment_success, setup_comments, submit_comment;
        comment_failure = function(data) {
            return $("#respond").prepend(LANG.comment_failure);
        };
        comment_success = function(data) {
            var $ajax_comment_area, $comment_area;
            $comment_area = $("#comments");
            $ajax_comment_area = $(data).find("#comments");
            if ($ajax_comment_area.length > 0) {
                $comment_area.replaceWith($ajax_comment_area);
            } else {
                comment_failure();
            }
        };
        submit_comment = function(e) {
            var $comment_area, $form, action, data, dfd;
            e.preventDefault();
            $comment_area = $("#comments");
            $form = $(e.target);
            data = $form.serialize();
            action = $form.attr("action");
            dfd = $.post(action, data);
            dfd.done(comment_success);
            dfd.fail(comment_failure);
        };
        setup_comments = function() {
            var $body, $form, $form_container, $list, $respond, $toggle_form, $toggle_list;
            $body = $("html, body");
            $toggle_list = $("#toggle-comment-list, .link-to-comments");
            $list = $("#comment-list");
            $toggle_form = $("#toggle-comment-form");
            $form_container = $("#comment-form");
            $respond = $("#respond");
            $form = $("#commentform");
            $list.hide().append([ $toggle_form, $form_container ]);
            $form_container.hide();
            $.waypoints("refresh");
            $toggle_list.on("click", function(e) {
                var offset;
                e.preventDefault();
                offset = global.header.parent().outerHeight() + 25;
                $list.slideToggle(500);
                if ($toggle_list.hasClass("is-open") !== true) {
                    $toggle_list.addClass("is-open");
                    global.body.animate({
                        scrollTop: $toggle_list.offset().top - offset
                    }, 500);
                } else {
                    $toggle_list.removeClass("is-open");
                    global.body.animate({
                        scrollTop: $toggle_list.offset().top + global.window.height()
                    }, 500);
                }
                return App.Util.delay(500, function() {
                    return $.waypoints("refresh");
                });
            });
            $toggle_form.on("click", function(e) {
                var $comment_parent, offset;
                e.preventDefault();
                offset = global.header.parent().outerHeight() - 25;
                $comment_parent = $respond.find("#comment_parent");
                if ($comment_parent.attr("value") === "0") {
                    if ($toggle_form.hasClass("is-open") !== true) {
                        $toggle_form.addClass("is-open");
                        global.body.animate({
                            scrollTop: $toggle_form.offset().top - offset
                        }, 500);
                    } else {
                        $toggle_form.removeClass("is-open");
                        global.body.animate({
                            scrollTop: $toggle_form.offset().top + global.window.height()
                        }, 500);
                    }
                    $form_container.slideToggle(500);
                } else {
                    $respond.appendTo($form_container);
                    $("#cancel-comment-reply-link").trigger("click");
                }
                return App.Util.delay(500, function() {
                    return $.waypoints("refresh");
                });
            });
            $(".comment-reply-link").on("click", function(e) {
                return e.preventDefault();
            });
            if ($form.length > 0) {
                $form.on("submit", submit_comment);
            }
        };
        setup_comments();
        global.document.on("preview:content_opened", function(e, container) {
            setup_comments();
        });
    }).call(this);
    (function() {
        var stretch_images;
        stretch_images = function($content) {
            var $container, $images, container, duration, fade, images, options, _i, _len;
            if (Modernizr.backgroundsize === false) {
                $images = $content.find(".js__backstretch, .js__gallery_backstretch");
            } else {
                $images = $content.find(".js__gallery_backstretch");
            }
            if ($images != null && $images.length > 0) {
                for (_i = 0, _len = $images.length; _i < _len; _i++) {
                    container = $images[_i];
                    $container = $(container);
                    images = $container.data("images");
                    duration = $container.data("duration") || false;
                    fade = duration !== false ? 600 : false;
                    options = {
                        duration: duration,
                        fade: fade
                    };
                    $container.backstretch(images, options);
                }
            }
        };
        stretch_images(global.content);
        App.stretch_images = stretch_images;
    }).call(this);
    (function() {
        var $sub_header_title, portfolio_index_title, portfolio_index_url, update_sub_header_title;
        if (typeof is_msie !== "undefined" && is_msie !== null && is_msie === true) {
            return;
        }
        if (global.item.list === false) {
            return;
        }
        App.content = new Content_Castaway({
            single: global.item.single,
            container: global.item.list
        });
        $$(document).ready(function() {
            if ($$("#primary").height() <= global.window.height() * 1.25) {
                return App.Infinite.load();
            }
        });
        portfolio_index_url = $$("#js-filters").find(".select.all").attr("href");
        if (!(portfolio_index_url != null || portfolio_index_url !== "#")) {
            portfolio_index_url = document.URL;
        }
        $sub_header_title = $$("#header-sub").find(".page-title");
        if ($sub_header_title.length) {
            portfolio_index_title = $sub_header_title.text();
        }
        update_sub_header_title = function(data, title) {
            var new_title;
            if (title == null) {
                title = false;
            }
            if ($sub_header_title.length) {
                new_title = title ? title : $(data).find("#header-sub .page-title").text();
                return $sub_header_title.fadeOut(350, function() {
                    return $sub_header_title.text(new_title).fadeIn(350);
                });
            }
        };
        $$("#js-filters").on("click", "a", function(e) {
            var $element, dfd, url;
            e.preventDefault();
            $element = $(e.target);
            if ($element.hasClass("is-open")) {
                return false;
            }
            App.Infinite.destroy();
            App.Loading.start();
            $$("#js-filters").find("a").removeClass("is-open");
            $element.addClass("is-open");
            if ($element.data("reset") === "yes") {
                return $.when(App.content.restore()).done(function() {
                    if (typeof history !== "undefined" && history !== null && history.pushState != null) {
                        history.pushState({}, "", portfolio_index_url);
                        $$(document).trigger("previewer:update_root", portfolio_index_url);
                    }
                    update_sub_header_title(null, portfolio_index_title);
                    App.callback.packery.add(App.Infinite.reset);
                    App.content.show();
                    return $$(document).trigger("pure:repack");
                });
            } else {
                url = $element.attr("href");
                dfd = $.get(url);
                App.Infinite.pause();
                return dfd.done(function(data) {
                    var $new_content;
                    $new_content = App.content.find_content(data);
                    if (typeof history !== "undefined" && history !== null && history.pushState != null) {
                        history.pushState({}, "", url);
                        $$(document).trigger("previewer:update_root", url);
                    }
                    update_sub_header_title(data);
                    $new_content.imagesLoaded(function() {
                        App.callback.layout.add(App.Infinite.reset);
                        return $.when(App.content.replace($new_content)).done(function() {
                            App.content.show();
                            $$(document).trigger("pure:repack");
                            return App.Infinite.reset();
                        });
                    });
                });
            }
        });
    }).call(this);
    (function() {
        var fly_in, prepare_fly_in;
        prepare_fly_in = function() {
            var $items;
            if (Modernizr.touch === true) {
                return false;
            }
            $items = $$(select.item.single, true);
            $items = $items.add(global.content.find(".parallax-item").find(".media,.content"));
            $items = $items.add(global.document.find(".js__trans"));
            $items = $items.filter(":not(.in-place):not(:appeared)");
            if ($items.length && $items.length > 0) {
                $items.addClass("offset");
                return $items.waypoint({
                    offset: "95%",
                    triggerOnce: true,
                    handler: fly_in
                });
            }
        };
        fly_in = function(direction) {
            var $item, ms;
            if (direction !== "down") {
                return false;
            }
            $item = $(this);
            ms = _.random(10, 400);
            App.Util.delay(ms, function() {
                return $item.addClass("in-place");
            });
        };
        App.Util.delay(1e3, function() {
            return $(".pure-skill__value").each(function() {
                var $skill, original_width;
                $skill = $(this);
                original_width = $skill.css("width");
                $skill.addClass("dont-flicker").css({
                    width: 0,
                    opacity: .5
                });
                return $skill.waypoint({
                    offset: "bottom-in-view",
                    triggerOnce: true,
                    handler: function() {
                        return $skill.transition({
                            width: original_width,
                            opacity: 1,
                            easing: "easeOutQuart",
                            duration: 990
                        });
                    }
                });
            });
        });
        if (typeof is_msie === "undefined" || is_msie === null) {
            if (App.Packery && Modernizr.touch === false) {
                App.callback.packery.add(prepare_fly_in);
                App.callback.recollect.add(prepare_fly_in);
            } else {
                prepare_fly_in();
            }
        }
    }).call(this);
    (function() {
        var toggler;
        if (global.item.list === false) {
            return;
        }
        toggler = new Previewer({
            items: select.item.single,
            content: "#js-single-item"
        });
        global.content.imagesLoaded(function() {
            toggler.setup_properties();
            return toggler.update_items();
        });
        global.document.on("click", ".js__items--link", function(e) {
            var url;
            url = $(e.target).attr("href");
            if (url != null) {
                e.preventDefault();
                return toggler.toggle(url);
            }
        });
        global.document.on("click", ".wp-post-image", function(e) {
            var $el, url;
            $el = $(e.target);
            url = $el.closest(select.item.single).find(".js__items--link").attr("href");
            if (url != null) {
                return toggler.toggle(url);
            }
        });
        global.document.on("infscr", function() {
            return toggler.refresh();
        });
        global.document.on("preview:close", function() {
            $.waypoints("refresh");
            return toggler.close();
        });
        global.document.on("keyup", function(e) {
            if (e.keyCode === 27) {
                $.waypoints("refresh");
                return toggler.close();
            }
        });
        App.callback.previewer.add(function() {
            return $.waypoints("refresh");
        });
    }).call(this);
    (function() {
        var start_footer;
        start_footer = _.once(function() {
            var $container, $content, $footer, $listener;
            $footer = $("#footer");
            if ($footer.length === 0) {
                return false;
            }
            $listener = $footer.find(".js__footer--listener");
            $listener.closest(".container__block").addClass("js__footer--toggle").next(".container__block").addClass("js__footer--wrap");
            $container = $footer.find(".js__footer--toggle");
            $content = $footer.find(".js__footer--wrap");
            $footer.find(".container__block").not($container).not($content).addClass("footer-block");
            $container.slice(1).hide();
            $content.hide();
            return $listener.click(function(e) {
                var $block, $el;
                $el = $(e.srcElement || e.target);
                if (!$el.hasClass("js__footer--listener")) {
                    return;
                }
                $block = $el.closest($container).next($content);
                if ($block.hasClass("is-open")) {
                    $block.removeClass("is-open").slideUp({
                        duration: 500,
                        easing: "easeInCubic"
                    }).nextAll($content).slideUp({
                        duration: 500,
                        easing: "easeInCubic"
                    }).removeClass("is-open");
                    $block.nextAll($container).slideUp(500);
                } else {
                    $block.next($container).slideDown({
                        duration: 500,
                        easing: "easeInSine"
                    });
                    $block.addClass("is-open").slideDown({
                        duration: 500,
                        easing: "easeOutCubic"
                    });
                }
                if (!$footer.hasClass("stuck")) {
                    global.body.animate({
                        scrollTop: $(document).height()
                    }, 500);
                }
            });
        });
        if (global.item.list && global.item.list.hasClass("js__packery")) {
            App.callback.packery.add(start_footer);
        } else {
            global.document.imagesLoaded(start_footer);
        }
    }).call(this);
    (function() {
        var set_header_block_height;
        set_header_block_height = function(onComplete) {
            var header_height, new_height, viewport_height;
            header_height = global.header.outerHeight();
            viewport_height = global.window.height();
            new_height = viewport_height - header_height;
            global.header_block.css({
                height: new_height
            });
            if (onComplete != null && _.isFunction(onComplete)) {
                return onComplete();
            }
        };
        if (global.header_block) {
            App.dfd.header_block = new jQuery.Deferred();
            App.dfd.header_block.promise();
            if (global.header_block.hasClass("js__resize")) {
                global.window.on("debouncedresize", set_header_block_height);
                set_header_block_height(function() {
                    return App.dfd.header_block.resolve();
                });
            } else {
                App.dfd.header_block.resolve();
            }
            $.when(App.dfd.header_block).done(function() {
                return App.stretch_images(global.header_block);
            });
        }
    }).call(this);
    (function() {
        var $pricing_columns, Media_Column_Resize, align_columns, mcr, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        };
        align_columns = function(column_container) {
            var $action, $features, $price, $pricing_columns, $title, actions, fcol, features, key, prices, titles, _i, _len;
            $pricing_columns = $(column_container).find(".pricing-column");
            $features = $pricing_columns.find(".features");
            $price = $pricing_columns.find(".price");
            $action = $pricing_columns.find(".action");
            $title = $pricing_columns.find(".pricing-column__title");
            if ($features.length === 0) {
                return;
            }
            prices = [];
            features = [];
            actions = [];
            titles = [];
            for (key = _i = 0, _len = $features.length; _i < _len; key = ++_i) {
                fcol = $features[key];
                prices.push($($price.get(key)).outerHeight());
                features.push($($features.get(key)).outerHeight());
                actions.push($($action.get(key)).outerHeight());
                titles.push($($title.get(key)).outerHeight());
            }
            $features.height(Math.max.apply(null, features));
            $price.height(Math.max.apply(null, prices));
            $action.height(Math.max.apply(null, actions));
            $title.height(Math.max.apply(null, titles));
        };
        Media_Column_Resize = function() {
            function Media_Column_Resize() {
                this.resize_groups = __bind(this.resize_groups, this);
                var $columns;
                $columns = $(".media-column.js__resize");
                if ($columns.length > 0) {
                    this.column_groups = _.groupBy($columns, function(elem) {
                        return $(elem).parent().offset().top;
                    });
                } else {
                    this.column_groups = false;
                }
            }
            Media_Column_Resize.prototype.resize_group = function(group) {
                var $column, column, height, key, tallest, _results, _this = this;
                tallest = 0;
                for (key in group) {
                    column = group[key];
                    $column = $(column);
                    $column.css({
                        height: ""
                    });
                    height = $column.outerHeight();
                    if (height > tallest) {
                        tallest = height;
                    }
                }
                if (tallest > 0) {
                    _results = [];
                    for (key in group) {
                        column = group[key];
                        _results.push($(column).css({
                            height: tallest
                        }));
                    }
                    return _results;
                } else {
                    return App.Util.delay(2e3, function() {
                        return _this.resize_group(group);
                    });
                }
            };
            Media_Column_Resize.prototype.resize_groups = function() {
                var group, groupKey, _ref;
                _ref = this.column_groups;
                for (groupKey in _ref) {
                    group = _ref[groupKey];
                    this.resize_group(group);
                }
            };
            return Media_Column_Resize;
        }();
        /*
  	Media Columns
  */
        mcr = new Media_Column_Resize();
        /*
  	Pricing Tables
  */
        $pricing_columns = $(".pricing-column");
        if ($pricing_columns.length > 0) {
            $pricing_columns.closest(".g").addClass("g--pricing-table");
        }
        global.document.imagesLoaded(function() {
            var column_container, _i, _len, _ref;
            if ($pricing_columns.length > 0) {
                _ref = $pricing_columns.closest(".container__content");
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    column_container = _ref[_i];
                    align_columns(column_container);
                }
            }
            if (mcr.column_groups !== false) {
                mcr.resize_groups();
                return global.window.on("debouncedresize", mcr.resize_groups);
            }
        });
    }).call(this);
    (function() {
        var Modern_Masonry, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        };
        Modern_Masonry = function() {
            function Modern_Masonry($container, items) {
                var $items;
                if ($container == null) {
                    $container = global.document;
                }
                this.refresh = __bind(this.refresh, this);
                this.container = $container;
                this.selector = items;
                $items = this.container.find(this.selector);
                this.setup($items);
            }
            Modern_Masonry.prototype.setup = function($items) {
                return $items.hoverIntent({
                    over: this.enter,
                    out: this.leave
                });
            };
            Modern_Masonry.prototype.refresh = function(e) {
                var $items;
                $items = this.container.find(this.selector);
                $items.hoverIntent();
                return this.setup($items);
            };
            Modern_Masonry.prototype.enter = function(e) {
                var $entry_header, $img, $this;
                $this = $(this);
                $img = $this.find(".wp-post-image");
                $entry_header = $this.find(".entry-header");
                $this.addClass("dont-flicker");
                $img.transition({
                    y: $entry_header.height() * -1,
                    duration: 400,
                    easing: "easeOutCubic"
                });
                return $entry_header.transition({
                    y: 0,
                    duration: 400,
                    easing: "easeOutCubic"
                });
            };
            Modern_Masonry.prototype.leave = function(e) {
                var $entry_header, $img, $this;
                $this = $(this);
                $img = $this.find(".wp-post-image");
                $entry_header = $this.find(".entry-header");
                $this.removeClass("dont-flicker");
                $img.transition({
                    y: 0,
                    duration: 400,
                    easing: "easeInSine"
                });
                return $entry_header.transition({
                    y: "100%",
                    duration: 400,
                    easing: "easeInSine"
                });
            };
            return Modern_Masonry;
        }();
        if (global.item.list && global.item.list.hasClass("modern")) {
            (function() {
                var Masonry, key, list, _i, _len, _ref, _results;
                Masonry = {};
                _ref = global.item.list.filter(".modern");
                _results = [];
                for (key = _i = 0, _len = _ref.length; _i < _len; key = ++_i) {
                    list = _ref[key];
                    Masonry[key] = new Modern_Masonry($(list), select.item.single);
                    _results.push(App.callback.recollect.add(Masonry[key].refresh));
                }
                return _results;
            })();
        }
    }).call(this);
    (function() {
        var $desktop_menu, $first, $items, $last, $toggler, Line, Menu_Line, menu_regular, menu_responsive, responsive_breakpoint, responsive_router;
        Menu_Line = function() {
            function Menu_Line(options) {
                var $current_item, _this = this;
                this.line = $(options.line);
                this.container = $(options.container);
                this.items = $(options.items);
                this.links = this.items.find(options.links);
                this.current = false;
                $current_item = this.items.filter(".current-menu-item, .current-menu-ancestor, .current-menu-parent").first().find("> a");
                if ($current_item.length > 0) {
                    this.slide($current_item);
                    $(window).on("debouncedresize", function() {
                        _this.current = false;
                        return _this.slide($current_item);
                    });
                } else {
                    this.current = {
                        width: 0,
                        left: 0
                    };
                }
                this.links.on("mouseenter", function(e) {
                    var $el;
                    $el = $(e.srcElement || e.target);
                    return _this.slide($el);
                });
                this.links.parent().on("mouseleave", function(e) {
                    return _this.move(_this.current);
                });
            }
            Menu_Line.prototype.get = function($item) {
                return {
                    width: $item.width(),
                    left: $item.position().left
                };
            };
            Menu_Line.prototype.move = function(args) {
                return this.line.stop().animate(args, {
                    duration: 200,
                    easing: "easeOutCirc"
                });
            };
            Menu_Line.prototype.slide = function($el) {
                var $grandparents, $parent, $submenu, diff, el_w, pos, sub_w, width;
                $parent = $el.parent();
                $grandparents = $parent.parents(".menu-item");
                if ($grandparents.length !== 0) {
                    $parent = $grandparents.last();
                    $el = $parent.find("a").first();
                }
                if ($el.hasClass("sf-with-ul")) {
                    $submenu = $parent.find("> .sub-menu").first();
                    el_w = $el.outerWidth();
                    sub_w = $submenu.outerWidth();
                    diff = (el_w - sub_w) / 2;
                    $submenu.css({
                        left: diff
                    });
                    pos = $el.offset().left + diff;
                    width = sub_w;
                } else {
                    width = $parent.width();
                    pos = $el.offset().left;
                }
                if (!this.current) {
                    this.current = {
                        left: pos,
                        width: width
                    };
                }
                return this.move({
                    left: pos,
                    width: width
                });
            };
            return Menu_Line;
        }();
        if ($$("#menu-main-menu, #responsive-menu").length !== 0) {
            responsive_breakpoint = 768;
            $desktop_menu = $$("#menu-main-menu");
            $toggler = false;
            Line = false;
            if ($desktop_menu.length) {
                $desktop_menu.superfish({
                    delay: 250,
                    speed: 125,
                    speedOut: 75,
                    interval: 150,
                    animation: {
                        opacity: "show",
                        height: "show"
                    },
                    animationOut: {
                        height: "hide",
                        opacity: "hide"
                    }
                });
                $items = $desktop_menu.find("> .menu-item");
                $first = $items.first();
                $last = $items.last();
            }
            menu_regular = function() {
                $$("body").removeClass("is-responsive");
                $$("#header--responsive").hide();
                $$("#header").show();
                $.waypoints("refresh");
                if (Line === false && $items.length > 0) {
                    $$("#navigation").append('<li id="menu-line"/>');
                    Line = new Menu_Line({
                        line: "#menu-line",
                        container: $$("#navigation"),
                        items: $items,
                        links: "a"
                    });
                }
            };
            menu_responsive = function() {
                $$("body").addClass("is-responsive");
                $$("#header--responsive").show();
                $$("#header").hide();
                if ($toggler === false) {
                    $toggler = $$("#header--responsive").find(".toggle");
                    return $toggler.sidr({
                        name: "responsive-menu",
                        body: "#page",
                        displace: false
                    });
                }
            };
            responsive_router = function() {
                var f_offset, l_offset, menu_is_broken, narrow_device, wider_than_before, window_width;
                window_width = $$(window).width();
                narrow_device = window_width < responsive_breakpoint;
                wider_than_before = window_width > App.state.width;
                if (App.state.responsive === true) {
                    if (!narrow_device && wider_than_before) {
                        $$("#header").show();
                        f_offset = $first.offset().top;
                        l_offset = $last.offset().top;
                        menu_is_broken = f_offset !== l_offset;
                        $$("#header").hide();
                    } else {
                        menu_is_broken = true;
                    }
                } else {
                    menu_is_broken = $first.offset().top !== $last.offset().top;
                }
                if (App.state.responsive !== true && (menu_is_broken || narrow_device)) {
                    App.state.responsive = true;
                    App.state.width = window_width;
                    menu_responsive();
                    return;
                }
                if (App.state.responsive !== false && wider_than_before && !menu_is_broken && !narrow_device) {
                    App.state.responsive = false;
                    App.state.width = window_width;
                    menu_regular();
                    return;
                }
                App.state.width = window_width;
            };
            $$(document).ready(function() {
                if ($$("#header").length && $$("#header--responsive").length) {
                    responsive_router();
                } else {
                    if (App.sniff.isMobile) {
                        menu_responsive();
                    } else {
                        menu_regular();
                    }
                }
                return $$(window).on("debouncedresize", responsive_router);
            });
        }
    }).call(this);
    (function() {
        var check_packery_divs, packery_callback, packery_setup;
        if (!global.item.list || !global.item.list.hasClass("js__packery")) {
            return;
        }
        check_packery_divs = function() {
            if (!$("#packery-column").length) {
                $(select.item.list).prepend('<div id="packery-column"></div>');
            }
            if (!$("#packery-gutter").length) {
                $(select.item.list).prepend('<div id="packery-gutter"></div>');
            }
        };
        packery_callback = function() {
            App.callback.layout.fire();
            return App.callback.layout.empty();
        };
        packery_setup = function() {
            if (App.Packery !== false) {
                App.Packery("destroy");
            }
            check_packery_divs();
            App.Packery = _.bind(global.item.list.packery, global.item.list);
            App.Packery({
                itemSelector: select.item.single,
                columnWidth: "#packery-column",
                gutter: "#packery-gutter",
                isLayoutInstant: true,
                isResizeBound: false
            });
            App.Packery("on", "layoutComplete", function() {
                App.callback.packery.fire();
                App.callback.packery.empty();
                return $.waypoints("refresh");
            });
            return App.callback.packery.fire();
        };
        $$(document).imagesLoaded(packery_setup);
        $$(window).on("debouncedresize", function() {
            return $$(select.item.list).packery("layout");
        });
        $$(document).on("pure:repack pure:append", function() {
            check_packery_divs();
            App.Packery("reloadItems");
            return App.Packery("layout");
        });
    }).call(this);
    (function() {
        var size_portfolio_item;
        size_portfolio_item = function(DFD) {
            var $content, $featured_image, $featured_image_container, $item, height, image_w, sizes;
            $item = $("#js-single-item");
            if ($item.length === 0 || $item.hasClass("portfolio") !== true) {
                return false;
            }
            $featured_image_container = $item.find(".featured-image");
            $featured_image = $featured_image_container.find(".portfolio-image");
            $content = $item.find(".container");
            image_w = $featured_image.outerWidth();
            sizes = [];
            height = $content.outerHeight();
            $content.css({
                y: height * -1
            });
            $item.css({
                "max-width": image_w
            });
            $.when(DFD).done(function() {
                return $content.transition({
                    y: 0,
                    complete: function() {
                        if ($("body.single-portfolio").length === 0) {
                            return $item.css({
                                overflow: "visible"
                            });
                        }
                    }
                });
            });
        };
        if (global.item.single && global.item.single.hasClass("portfolio") || $("#js-single-item").length) {
            App.callback.previewer.add(size_portfolio_item);
            size_portfolio_item();
        }
    }).call(this);
    /* 
	Stick class
	Heavily inspired (copied and modified) from Sticky Elements Shortcut for jQuery Waypoints - v2.0.2
	Requires jQuery Waypoints ~2.0.2
*/
    (function() {
        var Stick, stick_footer_at;
        Stick = function() {
            function Stick(el, options) {
                var $wrap, defaults, originalHandler;
                defaults = {
                    wrapper: '<div class="sticky-wrapper" />',
                    stuckClass: "stuck"
                };
                options = $.extend({}, $.fn.waypoint.defaults, defaults, options);
                $wrap = this.wrap(el, options);
                originalHandler = options.handler;
                options.handler = function(direction) {
                    var shouldBeStuck;
                    shouldBeStuck = direction === "down" || direction === "right";
                    return el.toggleClass(options.stuckClass, shouldBeStuck);
                };
                $wrap.waypoint(options);
            }
            Stick.prototype.wrap = function($elements, options) {
                $elements.wrap(options.wrapper);
                $elements.each(function() {
                    var $this;
                    $this = $(this);
                    return $this.parent().height($this.outerHeight());
                });
                return $elements.parent();
            };
            return Stick;
        }();
        if (App.dfd.header_block != null && App.state.responsive === false) {
            $.when(App.dfd.header_block).done(function() {
                var sticky_header;
                sticky_header = new Stick(global.header, {
                    offset: -1
                });
            });
        } else {
            global.document.imagesLoaded(function() {
                var sticky_header;
                sticky_header = new Stick(global.header, {
                    offset: -1
                });
            });
        }
        stick_footer_at = function(amount, percent) {
            var position;
            if (percent == null) {
                percent = false;
            }
            position = percent === true ? $(document).height() * (amount / 100) - $(window).height() : amount;
            return $("body").waypoint({
                handler: function(direction) {
                    var $footer;
                    $footer = $("#footer");
                    if (direction === "down" && $footer.hasClass("stuck") === false) {
                        return $footer.css({
                            opacity: 0
                        }).addClass("dont-flicker stuck").transition({
                            opacity: 1,
                            easing: "easeOutSine",
                            duration: 400,
                            complete: function() {
                                return App.Util.delay(500, function() {
                                    return $footer.removeClass("dont-flicker");
                                });
                            }
                        });
                    } else {
                        return $footer.transition({
                            opacity: 0,
                            easing: "easeInSine",
                            duration: 400,
                            complete: function() {
                                return $footer.removeClass("stuck");
                            }
                        });
                    }
                },
                offset: position * -1
            });
        };
        if (global.footer) {
            (function() {
                var scroll;
                scroll = global.footer.data("scrolltop");
                if (scroll != null) {
                    return stick_footer_at(scroll.top, scroll.percent);
                }
            })();
        }
    }).call(this);
})({}, function() {
    return this;
}());