(function() {
  var Modern_Masonry,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Modern_Masonry = (function() {
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

  })();

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
