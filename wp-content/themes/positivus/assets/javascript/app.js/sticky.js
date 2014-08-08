/* 
	Stick class
	Heavily inspired (copied and modified) from Sticky Elements Shortcut for jQuery Waypoints - v2.0.2
	Requires jQuery Waypoints ~2.0.2
*/


(function() {
  var Stick, stick_footer_at;

  Stick = (function() {
    function Stick(el, options) {
      var $wrap, defaults, originalHandler;
      defaults = {
        wrapper: '<div class="sticky-wrapper" />',
        stuckClass: 'stuck'
      };
      options = $.extend({}, $.fn.waypoint.defaults, defaults, options);
      $wrap = this.wrap(el, options);
      originalHandler = options.handler;
      options.handler = function(direction) {
        var shouldBeStuck;
        shouldBeStuck = direction === 'down' || direction === 'right';
        return el.toggleClass(options.stuckClass, shouldBeStuck);
      };
      $wrap.waypoint(options);
    }

    Stick.prototype.wrap = function($elements, options) {
      $elements.wrap(options.wrapper);
      $elements.each(function() {
        var $this;
        $this = $(this);
        return $this.parent().height($this.outerHeight());
      });
      return $elements.parent();
    };

    return Stick;

  })();

  if ((App.dfd.header_block != null) && App.state.responsive === false) {
    $.when(App.dfd.header_block).done(function() {
      var sticky_header;
      sticky_header = new Stick(global.header, {
        offset: -1
      });
    });
  } else {
    global.document.imagesLoaded(function() {
      var sticky_header;
      sticky_header = new Stick(global.header, {
        offset: -1
      });
    });
  }

  stick_footer_at = function(amount, percent) {
    var position;
    if (percent == null) {
      percent = false;
    }
    position = percent === true ? $(document).height() * (amount / 100) - $(window).height() : amount;
    return $("body").waypoint({
      handler: function(direction) {
        var $footer;
        $footer = $("#footer");
        if (direction === "down" && $footer.hasClass("stuck") === false) {
          return $footer.css({
            opacity: 0
          }).addClass("dont-flicker stuck").transition({
            opacity: 1,
            easing: "easeOutSine",
            duration: 400,
            complete: function() {
              return App.Util.delay(500, function() {
                return $footer.removeClass("dont-flicker");
              });
            }
          });
        } else {
          return $footer.transition({
            opacity: 0,
            easing: "easeInSine",
            duration: 400,
            complete: function() {
              return $footer.removeClass("stuck");
            }
          });
        }
      },
      offset: position * -1
    });
  };

  if (global.footer) {
    (function() {
      var scroll;
      scroll = global.footer.data("scrolltop");
      if (scroll != null) {
        return stick_footer_at(scroll.top, scroll.percent);
      }
    })();
  }

}).call(this);
