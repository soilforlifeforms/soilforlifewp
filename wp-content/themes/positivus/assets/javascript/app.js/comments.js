(function() {
  var comment_failure, comment_success, setup_comments, submit_comment;

  comment_failure = function(data) {
    return $("#respond").prepend(LANG.comment_failure);
  };

  comment_success = function(data) {
    var $ajax_comment_area, $comment_area;
    $comment_area = $("#comments");
    $ajax_comment_area = $(data).find("#comments");
    if ($ajax_comment_area.length > 0) {
      $comment_area.replaceWith($ajax_comment_area);
    } else {
      comment_failure();
    }
  };

  submit_comment = function(e) {
    var $comment_area, $form, action, data, dfd;
    e.preventDefault();
    $comment_area = $("#comments");
    $form = $(e.target);
    data = $form.serialize();
    action = $form.attr("action");
    dfd = $.post(action, data);
    dfd.done(comment_success);
    dfd.fail(comment_failure);
  };

  setup_comments = function() {
    var $body, $form, $form_container, $list, $respond, $toggle_form, $toggle_list;
    $body = $("html, body");
    $toggle_list = $("#toggle-comment-list, .link-to-comments");
    $list = $("#comment-list");
    $toggle_form = $("#toggle-comment-form");
    $form_container = $("#comment-form");
    $respond = $("#respond");
    $form = $("#commentform");
    $list.hide().append([$toggle_form, $form_container]);
    $form_container.hide();
    $.waypoints('refresh');
    $toggle_list.on("click", function(e) {
      var offset;
      e.preventDefault();
      offset = global.header.parent().outerHeight() + 25;
      $list.slideToggle(500);
      if ($toggle_list.hasClass("is-open") !== true) {
        $toggle_list.addClass("is-open");
        global.body.animate({
          scrollTop: $toggle_list.offset().top - offset
        }, 500);
      } else {
        $toggle_list.removeClass("is-open");
        global.body.animate({
          scrollTop: $toggle_list.offset().top + global.window.height()
        }, 500);
      }
      return App.Util.delay(500, function() {
        return $.waypoints('refresh');
      });
    });
    $toggle_form.on("click", function(e) {
      var $comment_parent, offset;
      e.preventDefault();
      offset = global.header.parent().outerHeight() - 25;
      $comment_parent = $respond.find("#comment_parent");
      if ($comment_parent.attr("value") === "0") {
        if ($toggle_form.hasClass("is-open") !== true) {
          $toggle_form.addClass("is-open");
          global.body.animate({
            scrollTop: $toggle_form.offset().top - offset
          }, 500);
        } else {
          $toggle_form.removeClass("is-open");
          global.body.animate({
            scrollTop: $toggle_form.offset().top + global.window.height()
          }, 500);
        }
        $form_container.slideToggle(500);
      } else {
        $respond.appendTo($form_container);
        $("#cancel-comment-reply-link").trigger("click");
      }
      return App.Util.delay(500, function() {
        return $.waypoints('refresh');
      });
    });
    $(".comment-reply-link").on("click", function(e) {
      return e.preventDefault();
    });
    if ($form.length > 0) {
      $form.on("submit", submit_comment);
    }
  };

  setup_comments();

  global.document.on("preview:content_opened", function(e, container) {
    setup_comments();
  });

}).call(this);
