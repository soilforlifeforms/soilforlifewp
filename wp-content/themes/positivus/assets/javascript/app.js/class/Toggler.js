var Toggler,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Toggler = (function() {
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
      $("body").append(" \n<div id=\"toggle-container\"> \n	<div id=\"toggle-inner\" style=\"height: auto;\"></div>\n</div>");
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

})();
