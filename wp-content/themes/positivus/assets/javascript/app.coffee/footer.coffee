start_footer = _.once ->
	$footer = $("#footer")
	return false if $footer.length is 0

	$listener = $footer.find(".js__footer--listener")
	$listener
		# Create Toggle Containers
		.closest(".container__block")
		.addClass("js__footer--toggle")
		
		# Find the content to toggle
		.next(".container__block")
		.addClass("js__footer--wrap")


	$container = $footer.find(".js__footer--toggle")
	$content = $footer.find(".js__footer--wrap")

	$footer
		.find(".container__block")
			.not($container)
			.not($content)
		.addClass("footer-block")

	$container.slice(1).hide()
	$content.hide()

	$listener.click (e) ->
		$el = $(e.srcElement || e.target)
		return unless $el.hasClass("js__footer--listener")

		$block = $el.closest($container).next($content)

		# Is already Open ?
		if $block.hasClass("is-open")
			$block
				.removeClass("is-open")
				.slideUp(duration: 500, easing: "easeInCubic")

				.nextAll($content)
				.slideUp(duration: 500, easing: "easeInCubic")
				.removeClass("is-open")

			$block
				.nextAll($container)
				.slideUp(500)


		# Well then open it up!
		else
			$block
				.next($container)
				.slideDown(duration: 500, easing: "easeInSine")
			$block
				.addClass("is-open")
				.slideDown(duration: 500, easing: "easeOutCubic")


		unless $footer.hasClass("stuck")
			global.body.animate scrollTop: $(document).height(), 500

		return

if global.item.list and global.item.list.hasClass("js__packery")
then App.callback.packery.add start_footer
else global.document.imagesLoaded start_footer