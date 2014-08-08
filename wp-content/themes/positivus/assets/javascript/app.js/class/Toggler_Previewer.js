var Previewer,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Previewer = (function(_super) {
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
    if ((typeof history !== "undefined" && history !== null) && (history.pushState != null)) {
      $$(document).on("previewer:update_root", function(e, url) {
        console.log("Received " + url);
        return _this._root_url = url;
      });
    }
  }

  Previewer.prototype.load = function(URL) {
    var load,
      _this = this;
    load = $.get(URL);
    load.done(function(data) {
      var $data, content;
      if ((typeof history !== "undefined" && history !== null) && (history.pushState != null)) {
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
    var $container, dfd,
      _this = this;
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
        "y": $container.height() * -1.25
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
    if ((typeof history !== "undefined" && history !== null) && (history.pushState != null)) {
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
    var $item, DFD,
      _this = this;
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
    if ((this.items.current != null) && this.items.current.$item !== false) {
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

})(Toggler);
