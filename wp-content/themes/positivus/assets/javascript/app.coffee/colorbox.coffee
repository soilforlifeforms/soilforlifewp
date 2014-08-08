setup_colorbox = (container) ->
	
	$post = $(container).find("#js-single-item")
	
	cbox_class = $post.data("colorbox")
	return false unless cbox_class?
	
		
	$cbox = $post.find(".#{cbox_class}")
	return false unless $cbox.length? and $cbox.length > 0


	$cbox.colorbox
		rel: $cbox
		maxWidth: "100%"
		maxHeight: "100%"

	return $cbox

# Attempt to setup a colorbox in the content, just in case
setup_colorbox("#content")

# Setup colorbox when preview container is opened
global.document.on "preview:content_opened", (e, container) ->
	setup_colorbox(container)
	return