return if global.item.list is false

toggler = new Previewer
				items: select.item.single
				content: "#js-single-item"
# On first load:
global.content.imagesLoaded ->
	toggler.setup_properties()
	toggler.update_items()

global.document.on "click", ".js__items--link", (e) ->
	url = $(e.target).attr("href")
	if url?
		e.preventDefault()
		toggler.toggle(url)

global.document.on "click", ".wp-post-image", (e) ->
	$el = $(e.target)
	url = $el.closest(select.item.single).find(".js__items--link").attr("href")
	
	if url?
		toggler.toggle(url)


# After Infinite Scroll has Loaded
global.document.on "infscr", ->
	toggler.refresh()

global.document.on "preview:close", -> 
	$.waypoints('refresh')
	toggler.close()

global.document.on "keyup", (e) ->
	if e.keyCode is 27 # The ESC key
		$.waypoints('refresh')
		toggler.close() 


App.callback.previewer.add ->
	$.waypoints('refresh')



