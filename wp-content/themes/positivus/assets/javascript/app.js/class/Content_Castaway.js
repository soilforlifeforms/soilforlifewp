var Content_Castaway,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Content_Castaway = (function() {
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
    var dfd,
      _this = this;
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
      "overflow": "hidden"
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

})();
