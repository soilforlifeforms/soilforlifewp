(function() {
  var setup_classic_items;

  setup_classic_items = function() {
    var $entries, $entry, $image, container_width, entry, _i, _len, _results;
    if (!global.item.single) {
      return false;
    }
    $entries = global.item.single.filter(".classic-item");
    if ($entries.length === 0) {
      return false;
    }
    container_width = global.item.list.width();
    _results = [];
    for (_i = 0, _len = $entries.length; _i < _len; _i++) {
      entry = $entries[_i];
      $entry = $(entry);
      $image = $entry.find(".wp-post-image");
      if ($image.length !== 1) {
        continue;
      }
      if ($image.width() < container_width) {
        _results.push($image.addClass("is-not-fullwidth"));
      } else {
        _results.push($image.removeClass("is-not-fullwidth"));
      }
    }
    return _results;
  };

  if (global.item.list) {
    global.document.on("infscr", setup_classic_items);
    global.window.on("debouncedresize", setup_classic_items);
  }

}).call(this);
