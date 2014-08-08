(function() {
  var fly_in, prepare_fly_in;

  prepare_fly_in = function() {
    var $items;
    if (Modernizr.touch === true) {
      return false;
    }
    $items = $$(select.item.single, true);
    $items = $items.add(global.content.find(".parallax-item").find(".media,.content"));
    $items = $items.add(global.document.find(".js__trans"));
    $items = $items.filter(":not(.in-place):not(:appeared)");
    if ($items.length && $items.length > 0) {
      $items.addClass("offset");
      return $items.waypoint({
        offset: '95%',
        triggerOnce: true,
        handler: fly_in
      });
    }
  };

  fly_in = function(direction) {
    var $item, ms;
    if (direction !== "down") {
      return false;
    }
    $item = $(this);
    ms = _.random(10, 400);
    App.Util.delay(ms, function() {
      return $item.addClass("in-place");
    });
  };

  App.Util.delay(1000, function() {
    return $(".pure-skill__value").each(function() {
      var $skill, original_width;
      $skill = $(this);
      original_width = $skill.css("width");
      $skill.addClass("dont-flicker").css({
        width: 0,
        opacity: 0.5
      });
      return $skill.waypoint({
        offset: 'bottom-in-view',
        triggerOnce: true,
        handler: function() {
          return $skill.transition({
            width: original_width,
            opacity: 1,
            easing: "easeOutQuart",
            duration: 990
          });
        }
      });
    });
  });

  if (typeof is_msie === "undefined" || is_msie === null) {
    if (App.Packery && Modernizr.touch === false) {
      App.callback.packery.add(prepare_fly_in);
      App.callback.recollect.add(prepare_fly_in);
    } else {
      prepare_fly_in();
    }
  }

}).call(this);
