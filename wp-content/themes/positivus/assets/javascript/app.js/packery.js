(function() {
  var check_packery_divs, packery_callback, packery_setup;

  if (!global.item.list || !global.item.list.hasClass("js__packery")) {
    return;
  }

  check_packery_divs = function() {
    if (!$("#packery-column").length) {
      $(select.item.list).prepend("<div id=\"packery-column\"></div>");
    }
    if (!$("#packery-gutter").length) {
      $(select.item.list).prepend("<div id=\"packery-gutter\"></div>");
    }
  };

  packery_callback = function() {
    App.callback.layout.fire();
    return App.callback.layout.empty();
  };

  packery_setup = function() {
    if (App.Packery !== false) {
      App.Packery("destroy");
    }
    check_packery_divs();
    App.Packery = _.bind(global.item.list.packery, global.item.list);
    App.Packery({
      itemSelector: select.item.single,
      columnWidth: "#packery-column",
      gutter: "#packery-gutter",
      isLayoutInstant: true,
      isResizeBound: false
    });
    App.Packery("on", "layoutComplete", function() {
      App.callback.packery.fire();
      App.callback.packery.empty();
      return $.waypoints("refresh");
    });
    return App.callback.packery.fire();
  };

  $$(document).imagesLoaded(packery_setup);

  $$(window).on("debouncedresize", function() {
    return $$(select.item.list).packery("layout");
  });

  $$(document).on("pure:repack pure:append", function() {
    check_packery_divs();
    App.Packery("reloadItems");
    return App.Packery("layout");
  });

}).call(this);
