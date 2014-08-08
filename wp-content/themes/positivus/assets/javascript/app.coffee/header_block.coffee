set_header_block_height = (onComplete) ->	
	header_height = global.header.outerHeight()
	viewport_height = global.window.height()
	new_height = viewport_height - header_height

	global.header_block.css
		height: new_height
		# easing: "easeOutExpo"
		# duration: 500
		# complete: onComplete
	do onComplete if onComplete? and _.isFunction onComplete

if global.header_block 
	App.dfd.header_block = new jQuery.Deferred()
	App.dfd.header_block.promise()
		

	# //-----------------------------------*/
	# // Auto Resize Header Height
	# //-----------------------------------*/
	
	if global.header_block.hasClass("js__resize")
		global.window.on "debouncedresize", set_header_block_height
		set_header_block_height -> App.dfd.header_block.resolve()

	else App.dfd.header_block.resolve()
	
	$.when(App.dfd.header_block).done ->
		App.stretch_images(global.header_block) 
