(function() {
  var start_footer;

  start_footer = _.once(function() {
    var $container, $content, $footer, $listener;
    $footer = $("#footer");
    if ($footer.length === 0) {
      return false;
    }
    $listener = $footer.find(".js__footer--listener");
    $listener.closest(".container__block").addClass("js__footer--toggle").next(".container__block").addClass("js__footer--wrap");
    $container = $footer.find(".js__footer--toggle");
    $content = $footer.find(".js__footer--wrap");
    $footer.find(".container__block").not($container).not($content).addClass("footer-block");
    $container.slice(1).hide();
    $content.hide();
    return $listener.click(function(e) {
      var $block, $el;
      $el = $(e.srcElement || e.target);
      if (!$el.hasClass("js__footer--listener")) {
        return;
      }
      $block = $el.closest($container).next($content);
      if ($block.hasClass("is-open")) {
        $block.removeClass("is-open").slideUp({
          duration: 500,
          easing: "easeInCubic"
        }).nextAll($content).slideUp({
          duration: 500,
          easing: "easeInCubic"
        }).removeClass("is-open");
        $block.nextAll($container).slideUp(500);
      } else {
        $block.next($container).slideDown({
          duration: 500,
          easing: "easeInSine"
        });
        $block.addClass("is-open").slideDown({
          duration: 500,
          easing: "easeOutCubic"
        });
      }
      if (!$footer.hasClass("stuck")) {
        global.body.animate({
          scrollTop: $(document).height()
        }, 500);
      }
    });
  });

  if (global.item.list && global.item.list.hasClass("js__packery")) {
    App.callback.packery.add(start_footer);
  } else {
    global.document.imagesLoaded(start_footer);
  }

}).call(this);
