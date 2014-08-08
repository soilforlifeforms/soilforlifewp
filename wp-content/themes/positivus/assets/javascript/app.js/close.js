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
