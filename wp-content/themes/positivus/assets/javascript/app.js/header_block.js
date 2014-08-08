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
    if ((onComplete != null) && _.isFunction(onComplete)) {
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
