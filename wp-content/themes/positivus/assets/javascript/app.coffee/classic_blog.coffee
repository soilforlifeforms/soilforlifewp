setup_classic_items = ->
	return false unless global.item.single
	$entries = global.item.single.filter(".classic-item")
	
	return false if $entries.length is 0
	container_width = global.item.list.width()

	for entry in $entries
		$entry = $(entry)
		$image = $entry.find(".wp-post-image")
		continue if $image.length isnt 1

		if $image.width() < container_width
			$image.addClass("is-not-fullwidth")
		else
			$image.removeClass("is-not-fullwidth")

if global.item.list
	global.document.on "infscr", setup_classic_items
	global.window.on "debouncedresize", setup_classic_items