size_portfolio_item = (DFD)->
	$item = $("#js-single-item")
	return false if $item.length is 0 or $item.hasClass("portfolio") isnt true

	$featured_image_container = $item.find(".featured-image")
	$featured_image = $featured_image_container.find(".portfolio-image")
	$content = $item.find(".container")

	image_w = $featured_image.outerWidth()
	
	sizes = []

	height = $content.outerHeight()
	

	$content.css 
		y: height * -1
	
	# $content.css
	# 	"max-width": image_w
	$item.css
		"max-width": image_w

	$.when(DFD).done ->
		$content.transition
			y: 0
			complete: -> $item.css "overflow": "visible" if $("body.single-portfolio").length is 0
	# $item.addClass("shadow")
	return



# Only do for Portfolio items
if ( global.item.single and global.item.single.hasClass("portfolio") ) or $("#js-single-item").length
	App.callback.previewer.add size_portfolio_item
	# global.document.on "debouncedresize", size_portfolio_item
	do size_portfolio_item
	