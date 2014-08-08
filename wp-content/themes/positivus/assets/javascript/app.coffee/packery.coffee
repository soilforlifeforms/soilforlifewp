# Don't bother if there is no list
return if not global.item.list or not global.item.list.hasClass("js__packery")

check_packery_divs = ->
	if not $("#packery-column").length
		$(select.item.list).prepend("""<div id="packery-column"></div>""")
	
	if not $("#packery-gutter").length
		$(select.item.list).prepend("""<div id="packery-gutter"></div>""")
	return



packery_callback = ->
	App.callback.layout.fire()
	App.callback.layout.empty()

packery_setup = ->
	App.Packery("destroy") if App.Packery isnt false
	
	do check_packery_divs
	App.Packery = _.bind global.item.list.packery, global.item.list

	App.Packery
		itemSelector: select.item.single
		columnWidth: "#packery-column"
		gutter: "#packery-gutter"
		isLayoutInstant: true
		isResizeBound: false
	
	
	
	# Trigger Layout Callbacks when Layout is Complete
	App.Packery "on" , "layoutComplete", -> 
		App.callback.packery.fire()
		App.callback.packery.empty()
		$.waypoints("refresh")

	# Trigger Packery Setup Callbacks
	App.callback.packery.fire()

$$(document).imagesLoaded(packery_setup)


$$(window).on "debouncedresize", ->
	$$(select.item.list).packery("layout")

$$(document).on "pure:repack pure:append", ->
	do check_packery_divs
	App.Packery("reloadItems")
	App.Packery("layout")
	

