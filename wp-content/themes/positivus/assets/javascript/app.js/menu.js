(function() {
  var $desktop_menu, $first, $items, $last, $toggler, Line, Menu_Line, menu_regular, menu_responsive, responsive_breakpoint, responsive_router;

  Menu_Line = (function() {
    function Menu_Line(options) {
      var $current_item,
        _this = this;
      this.line = $(options.line);
      this.container = $(options.container);
      this.items = $(options.items);
      this.links = this.items.find(options.links);
      this.current = false;
      $current_item = this.items.filter(".current-menu-item, .current-menu-ancestor, .current-menu-parent").first().find("> a");
      if ($current_item.length > 0) {
        this.slide($current_item);
        $(window).on("debouncedresize", function() {
          _this.current = false;
          return _this.slide($current_item);
        });
      } else {
        this.current = {
          width: 0,
          left: 0
        };
      }
      this.links.on("mouseenter", function(e) {
        var $el;
        $el = $(e.srcElement || e.target);
        return _this.slide($el);
      });
      this.links.parent().on("mouseleave", function(e) {
        return _this.move(_this.current);
      });
    }

    Menu_Line.prototype.get = function($item) {
      return {
        width: $item.width(),
        left: $item.position().left
      };
    };

    Menu_Line.prototype.move = function(args) {
      return this.line.stop().animate(args, {
        duration: 200,
        easing: "easeOutCirc"
      });
    };

    Menu_Line.prototype.slide = function($el) {
      var $grandparents, $parent, $submenu, diff, el_w, pos, sub_w, width;
      $parent = $el.parent();
      $grandparents = $parent.parents(".menu-item");
      if ($grandparents.length !== 0) {
        $parent = $grandparents.last();
        $el = $parent.find("a").first();
      }
      if ($el.hasClass("sf-with-ul")) {
        $submenu = $parent.find("> .sub-menu").first();
        el_w = $el.outerWidth();
        sub_w = $submenu.outerWidth();
        diff = (el_w - sub_w) / 2;
        $submenu.css({
          left: diff
        });
        pos = $el.offset().left + diff;
        width = sub_w;
      } else {
        width = $parent.width();
        pos = $el.offset().left;
      }
      if (!this.current) {
        this.current = {
          left: pos,
          width: width
        };
      }
      return this.move({
        left: pos,
        width: width
      });
    };

    return Menu_Line;

  })();

  if ($$("#menu-main-menu, #responsive-menu").length !== 0) {
    responsive_breakpoint = 768;
    $desktop_menu = $$("#menu-main-menu");
    $toggler = false;
    Line = false;
    if ($desktop_menu.length) {
      $desktop_menu.superfish({
        delay: 250,
        speed: 125,
        speedOut: 75,
        interval: 150,
        animation: {
          opacity: 'show',
          height: 'show'
        },
        animationOut: {
          height: 'hide',
          opacity: 'hide'
        }
      });
      $items = $desktop_menu.find("> .menu-item");
      $first = $items.first();
      $last = $items.last();
    }
    menu_regular = function() {
      $$("body").removeClass("is-responsive");
      $$("#header--responsive").hide();
      $$("#header").show();
      $.waypoints("refresh");
      if (Line === false && $items.length > 0) {
        $$("#navigation").append("<li id=\"menu-line\"/>");
        Line = new Menu_Line({
          line: "#menu-line",
          container: $$("#navigation"),
          items: $items,
          links: "a"
        });
      }
    };
    menu_responsive = function() {
      $$("body").addClass("is-responsive");
      $$("#header--responsive").show();
      $$("#header").hide();
      if ($toggler === false) {
        $toggler = $$("#header--responsive").find(".toggle");
        return $toggler.sidr({
          name: "responsive-menu",
          body: "#page",
          displace: false
        });
      }
    };
    responsive_router = function() {
      var f_offset, l_offset, menu_is_broken, narrow_device, wider_than_before, window_width;
      window_width = $$(window).width();
      narrow_device = window_width < responsive_breakpoint;
      wider_than_before = window_width > App.state.width;
      if (App.state.responsive === true) {
        if (!narrow_device && wider_than_before) {
          $$("#header").show();
          f_offset = $first.offset().top;
          l_offset = $last.offset().top;
          menu_is_broken = f_offset !== l_offset;
          $$("#header").hide();
        } else {
          menu_is_broken = true;
        }
      } else {
        menu_is_broken = $first.offset().top !== $last.offset().top;
      }
      if (App.state.responsive !== true && (menu_is_broken || narrow_device)) {
        App.state.responsive = true;
        App.state.width = window_width;
        menu_responsive();
        return;
      }
      if (App.state.responsive !== false && (wider_than_before && !menu_is_broken && !narrow_device)) {
        App.state.responsive = false;
        App.state.width = window_width;
        menu_regular();
        return;
      }
      App.state.width = window_width;
    };
    $$(document).ready(function() {
      if ($$("#header").length && $$("#header--responsive").length) {
        responsive_router();
      } else {
        if (App.sniff.isMobile) {
          menu_responsive();
        } else {
          menu_regular();
        }
      }
      return $$(window).on("debouncedresize", responsive_router);
    });
  }

}).call(this);
