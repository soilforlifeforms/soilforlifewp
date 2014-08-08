(function() {
  var setup_colorbox;

  setup_colorbox = function(container) {
    var $cbox, $post, cbox_class;
    $post = $(container).find("#js-single-item");
    cbox_class = $post.data("colorbox");
    if (cbox_class == null) {
      return false;
    }
    $cbox = $post.find("." + cbox_class);
    if (!(($cbox.length != null) && $cbox.length > 0)) {
      return false;
    }
    $cbox.colorbox({
      rel: $cbox,
      maxWidth: "100%",
      maxHeight: "100%"
    });
    return $cbox;
  };

  setup_colorbox("#content");

  global.document.on("preview:content_opened", function(e, container) {
    setup_colorbox(container);
  });

}).call(this);
