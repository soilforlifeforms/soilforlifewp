create_close_button = ($content = false) ->
	return if $content is false or $content.length is 0
	$.when($content).done ->
		$close = $content.find(".js__close")
		
		header_height = global.header.height() * 2
		offset = $content.offset().top

		if global.window.width() > 1023
			offset = offset - header_height
		else 
			offset = offset - 50


		close_height = $close.outerHeight()
		content_height = $content.outerHeight()

		max_bottom = content_height - close_height

		scroll = ->
			sTop = global.window.scrollTop()
			pos = sTop - offset

			if sTop < offset
				pos = 0

			if pos > max_bottom
				pos = max_bottom

			$close.stop().transition
				y: pos
				easing: "easeOutQuad"
				duration: 200

		
		throttled = _.debounce scroll, 50
		global.window.scroll throttled

		$close.one "click", -> global.document.trigger "preview:close"

App.callback.previewer.add create_close_button