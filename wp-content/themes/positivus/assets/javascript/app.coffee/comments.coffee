comment_failure = (data) ->
	$("#respond").prepend LANG.comment_failure


comment_success = (data) ->

	$comment_area = $("#comments")
	$ajax_comment_area = $(data).find("#comments")

	if ($ajax_comment_area.length > 0)
		$comment_area.replaceWith $ajax_comment_area
	else
		comment_failure()

	return

submit_comment = (e) ->
	e.preventDefault()
	$comment_area = $("#comments")

	$form = $(e.target)
	data = $form.serialize()

	action = $form.attr("action")

	dfd = $.post(action, data)

	dfd.done comment_success
	dfd.fail comment_failure
	return

setup_comments = () ->
	$body = $("html, body")
	$toggle_list = $("#toggle-comment-list, .link-to-comments") # Need to make link-co-comments scroll
	$list = $("#comment-list")
	$toggle_form = $("#toggle-comment-form")
	$form_container = $("#comment-form")
	$respond = $("#respond")
	$form = $("#commentform")

	

	$list.hide().append([$toggle_form, $form_container])
	$form_container.hide()
	$.waypoints('refresh')
	
	$toggle_list.on "click", (e) ->
		e.preventDefault()
		offset = global.header.parent().outerHeight() + 25
		$list.slideToggle 500

		if $toggle_list.hasClass("is-open") isnt true
			$toggle_list.addClass("is-open")
			global.body.animate 
				scrollTop: $toggle_list.offset().top - offset
				, 500
		else
			$toggle_list.removeClass("is-open")
			global.body.animate 
				scrollTop: $toggle_list.offset().top + global.window.height()
				, 500

		App.Util.delay 500, -> $.waypoints('refresh')


	$toggle_form.on "click", (e) ->
		e.preventDefault()
		offset = global.header.parent().outerHeight() - 25

		$comment_parent = $respond.find("#comment_parent")

		if $comment_parent.attr("value") == "0"
			
			if $toggle_form.hasClass("is-open") isnt true
				$toggle_form.addClass("is-open")
				global.body.animate 
					scrollTop: $toggle_form.offset().top - offset
					, 500
			else
				$toggle_form.removeClass("is-open")
				global.body.animate 
					scrollTop: $toggle_form.offset().top + global.window.height()
					, 500
			$form_container.slideToggle 500

		else
			$respond.appendTo($form_container)
			$("#cancel-comment-reply-link").trigger("click")

		App.Util.delay 500, -> $.waypoints('refresh')

	$(".comment-reply-link").on "click", (e) ->
		e.preventDefault()
	
	if $form.length > 0
		$form.on "submit", submit_comment
	
	return
setup_comments()

# Setup colorbox when preview container is opened
global.document.on "preview:content_opened", (e, container) ->
	setup_comments()
	return