(function() {
  var stretch_images;

  stretch_images = function($content) {
    var $container, $images, container, duration, fade, images, options, _i, _len;
    if (Modernizr.backgroundsize === false) {
      $images = $content.find(".js__backstretch, .js__gallery_backstretch");
    } else {
      $images = $content.find(".js__gallery_backstretch");
    }
    if (($images != null) && $images.length > 0) {
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
