(function() {
  var $sub_header_title, portfolio_index_title, portfolio_index_url, update_sub_header_title;

  if ((typeof is_msie !== "undefined" && is_msie !== null) && is_msie === true) {
    return;
  }

  if (global.item.list === false) {
    return;
  }

  App.content = new Content_Castaway({
    single: global.item.single,
    container: global.item.list
  });

  $$(document).ready(function() {
    if ($$('#primary').height() <= global.window.height() * 1.25) {
      return App.Infinite.load();
    }
  });

  portfolio_index_url = $$("#js-filters").find(".select.all").attr("href");

  if (!((portfolio_index_url != null) || portfolio_index_url !== "#")) {
    portfolio_index_url = document.URL;
  }

  $sub_header_title = $$("#header-sub").find(".page-title");

  if ($sub_header_title.length) {
    portfolio_index_title = $sub_header_title.text();
  }

  update_sub_header_title = function(data, title) {
    var new_title;
    if (title == null) {
      title = false;
    }
    if ($sub_header_title.length) {
      new_title = title ? title : $(data).find("#header-sub .page-title").text();
      return $sub_header_title.fadeOut(350, function() {
        return $sub_header_title.text(new_title).fadeIn(350);
      });
    }
  };

  $$("#js-filters").on("click", "a", function(e) {
    var $element, dfd, url;
    e.preventDefault();
    $element = $(e.target);
    if ($element.hasClass("is-open")) {
      return false;
    }
    App.Infinite.destroy();
    App.Loading.start();
    $$("#js-filters").find("a").removeClass("is-open");
    $element.addClass("is-open");
    if ($element.data("reset") === "yes") {
      return $.when(App.content.restore()).done(function() {
        if ((typeof history !== "undefined" && history !== null) && (history.pushState != null)) {
          history.pushState({}, "", portfolio_index_url);
          $$(document).trigger("previewer:update_root", portfolio_index_url);
        }
        update_sub_header_title(null, portfolio_index_title);
        App.callback.packery.add(App.Infinite.reset);
        App.content.show();
        return $$(document).trigger("pure:repack");
      });
    } else {
      url = $element.attr("href");
      dfd = $.get(url);
      App.Infinite.pause();
      return dfd.done(function(data) {
        var $new_content;
        $new_content = App.content.find_content(data);
        if ((typeof history !== "undefined" && history !== null) && (history.pushState != null)) {
          history.pushState({}, "", url);
          $$(document).trigger("previewer:update_root", url);
        }
        update_sub_header_title(data);
        $new_content.imagesLoaded(function() {
          App.callback.layout.add(App.Infinite.reset);
          return $.when(App.content.replace($new_content)).done(function() {
            App.content.show();
            $$(document).trigger("pure:repack");
            return App.Infinite.reset();
          });
        });
      });
    }
  });

}).call(this);
