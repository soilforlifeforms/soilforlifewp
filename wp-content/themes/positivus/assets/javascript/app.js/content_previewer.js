(function() {
  var toggler;

  if (global.item.list === false) {
    return;
  }

  toggler = new Previewer({
    items: select.item.single,
    content: "#js-single-item"
  });

  global.content.imagesLoaded(function() {
    toggler.setup_properties();
    return toggler.update_items();
  });

  global.document.on("click", ".js__items--link", function(e) {
    var url;
    url = $(e.target).attr("href");
    if (url != null) {
      e.preventDefault();
      return toggler.toggle(url);
    }
  });

  global.document.on("click", ".wp-post-image", function(e) {
    var $el, url;
    $el = $(e.target);
    url = $el.closest(select.item.single).find(".js__items--link").attr("href");
    if (url != null) {
      return toggler.toggle(url);
    }
  });

  global.document.on("infscr", function() {
    return toggler.refresh();
  });

  global.document.on("preview:close", function() {
    $.waypoints('refresh');
    return toggler.close();
  });

  global.document.on("keyup", function(e) {
    if (e.keyCode === 27) {
      $.waypoints('refresh');
      return toggler.close();
    }
  });

  App.callback.previewer.add(function() {
    return $.waypoints('refresh');
  });

}).call(this);
