return if is_msie? and is_msie is true
return if global.item.list is false

App.content = new Content_Castaway
							single: global.item.single
							container: global.item.list

# //-----------------------------------*/
# // Load more content is the window is tall enough
# //-----------------------------------*/
$$(document).ready ->
	if $$('#primary').height() <= global.window.height() * 1.25
		App.Infinite.load()

# //-----------------------------------*/
# // Portfolio Index URL
# //-----------------------------------*/
portfolio_index_url = $$("#js-filters").find(".select.all").attr("href") 
unless portfolio_index_url? or portfolio_index_url isnt "#"
	portfolio_index_url = document.URL

# //-----------------------------------*/
# // Portfolio Title
# //-----------------------------------*/
$sub_header_title = $$("#header-sub").find(".page-title")

if $sub_header_title.length 
	portfolio_index_title = $sub_header_title.text()


update_sub_header_title = ( data, title = false ) ->
	if $sub_header_title.length 
		new_title = if title then title else $(data).find("#header-sub .page-title").text()
		
		$sub_header_title.fadeOut 350, ->
			$sub_header_title
				.text( new_title )
				.fadeIn(350)

# //-----------------------------------*/
# // When a filter is clicked
# //-----------------------------------*/
$$("#js-filters").on "click", "a", (e) ->
	# Prevent & Setup
	e.preventDefault()
	$element = $(e.target)
	
	# Is this page already open?
	return false if $element.hasClass("is-open")
	
	# Destroy the current Infinite scroll instance
	App.Infinite.destroy()
	App.Loading.start()
		
	# Remove the "is-open" from all filters
	$$("#js-filters").find("a").removeClass("is-open")
	
	# Add "is-open" class to the clicked element
	$element.addClass("is-open")


	# Show All button ?
	if $element.data("reset") is "yes"
		$.when( App.content.restore() ).done ->
			
			if history? and history.pushState?
				history.pushState {}, "", portfolio_index_url
				$$(document).trigger("previewer:update_root", portfolio_index_url)

			update_sub_header_title( null, portfolio_index_title )

			# Setup Callbacks
			App.callback.packery.add App.Infinite.reset		

			# Recalculate the Layout
			App.content.show()
			$$(document).trigger "pure:repack"


			
	else
		# Get the URL To Fetch
		url = $element.attr("href")
		
		
		dfd = $.get(url)										# Setup a Deferred and ge the URL
		# App.content.hide( App.content.remove )					# Hide the Current Content
		App.Infinite.pause()									# Pause Infinie Scroll

		# When the #{url} is loaded, utilize the data
		dfd.done (data) ->
			$new_content = App.content.find_content(data)
			
			if history? and history.pushState?
				history.pushState {}, "", url
				$$(document).trigger("previewer:update_root", url)

			update_sub_header_title( data )

			# App.Util.delay 1800, ->
			$new_content.imagesLoaded ->			
				
				# Setup Callbacks for when Packery is done
				App.callback.layout.add App.Infinite.reset

				$.when( App.content.replace($new_content) ).done ->
					
					App.content.show()
					$$(document).trigger "pure:repack"
					App.Infinite.reset()
					


			
			return









