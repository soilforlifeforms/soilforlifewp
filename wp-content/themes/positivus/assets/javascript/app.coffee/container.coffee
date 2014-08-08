stretch_images = ($content) ->

	if Modernizr.backgroundsize is false 
		$images = $content.find(".js__backstretch, .js__gallery_backstretch")
	else
		$images = $content.find(".js__gallery_backstretch")
	
	if $images? and $images.length > 0

		for container in $images
			$container = $(container)
			images = $container.data("images")
			
			duration = $container.data("duration") || false
			fade = if duration isnt false then 600 else false
			options = 
					duration: duration
					fade: fade
			
			$container.backstretch images, options

	return 
	
# Each Section:
stretch_images(global.content)
App.stretch_images = stretch_images