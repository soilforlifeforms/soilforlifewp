var Infinite_Scroll,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Infinite_Scroll = (function() {
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
    var $items,
      _this = this;
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
    $$(select.item.list).infinitescroll('destroy');
    return $$(select.item.list).data('infinitescroll', null);
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
    return $$(select.item.list).infinitescroll('retrieve');
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

})();
