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
              "overflow": "visible"
            });
          }
        }
      });
    });
  };

  if ((global.item.single && global.item.single.hasClass("portfolio")) || $("#js-single-item").length) {
    App.callback.previewer.add(size_portfolio_item);
    size_portfolio_item();
  }

}).call(this);
