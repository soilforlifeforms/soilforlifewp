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
    IE: (typeof is_msie !== "undefined" && is_msie !== null) && is_msie === true ? true : false
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
