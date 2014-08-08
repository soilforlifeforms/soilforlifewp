class Previewer extends Toggler
	
	constructor: ( options ) ->
	

		options.preview =
			content: $("#content")
			container: $("#primary")

		options.content = "#content"

		# Run Parent 
		super(options) 
		
		# Public Class Variables
		@items =
			current: 
				# Preview always exists somewhere, so it's setup from the start
				$item: false
				
			previous: false # == @items.current structure


		# Setup Window Measurements
		@properties = @setup_properties()

		# Expect the Previewer to be closed
		@is_open = false 
		@_cached = {}
		@_root_url = document.URL

		# We're going to set @blocking to true when something is clicked and being animated
		@blocking(false)

		# Setup Items
		# (set current, preview position, extra scroll, item margin) 
		@update_items()
		
		@packery = global.item.list

		unless App.browser.iOS or App.browser.IE
			global.window.on "debouncedresize", (e,args) =>
				@close()
				$.when(@items.current.$item).done => @refresh()

		if history? and history.pushState?
			$$(document).on "previewer:update_root", (e, url) =>
				console.log "Received #{url}"
				@_root_url = url

	# //-----------------------------------*/
	# // Core Functionality
	# //-----------------------------------*/
 	# Pull content in with AJAX
	load: (URL) => 
		load = $.get(URL)
		load.done (data) =>
			if history? and history.pushState?
				history.pushState {}, "", URL

			$data = $(data)
			content = $data.find("#content")

			@cache_data content
			@on_load_complete(content)



		return load



	open: ($content) ->
		# Ensure we're opening only one Preview
		return false unless @is_open is false
		@current = $content
		@scrollTop = global.window.scrollTop()

		$container = @iface.preview.container
		
		global.body.animate
			scrollTop: $container.offset().top - 25	# Just a little space

		dfd = App.content.hide()
		
		# Infinite Scroll
		do App.Infinite.pause

		$.when(dfd).done => 
			@blocking(true)
			App.content.detach()
			
			$content.find("#js-single-item").css "min-height": @properties.min_height
			$content.appendTo($container).css 
				"y": $container.height() * -1.25

			$content.addClass("dont-flicker").transition 
				y: 0
				easing: "easeOutCirc"
				duration: 800
				complete: =>
					@on_item_open()
					@on_container_open()
					$fitvids = $content.find(".fitvids")
					if $fitvids.length > 0 
						$fitvids.css opacity: 0
						do $fitvids.fitVids
						App.Util.delay 500 , ->
							$fitvids.transition 
								opacity: 1
								duration: 800
			
			App.callback.previewer.fire($content)

		return

	close: (item_obj = @items.current) ->
		# Don't close unless there is something to close
		if @is_open isnt true then return false

		
		if history? and history.pushState?
			history.pushState {}, "", @_root_url


		# Infinite Scroll
		do App.Infinite.resume
		
		@current.transition
			y: $(document).height()
			easing: "easeInQuint"
			complete: => 
				@current.remove()
				App.content.reattach().show()
				$(window).scrollTop(@scrollTop)
				@on_item_close(item_obj)
				@on_container_close(item_obj)



	reopen: (e) ->
		# Get the item
		$item = @set_current_item $(e.currentTarget).closest(@selectors.items) # Closest Matching from the click origin
		
		if @is_open is true 
			DFD = @close(@items.previous) 
		
		@start_loading() 
		$.when(DFD).done =>
			if @is_new_url(@_URL) 
			then @load(e) 
			else @open @get_cached_data()


	toggle: (url) =>  
		# Figure out a way to make sure that the height of an item
		# is always set back to its original
		return false if @blocked is true 
		@blocking(true)
		super(url)


	refresh: =>
		@setup_properties()
		@update_items()
	



	# //-----------------------------------*/
	# // Setup
	# //-----------------------------------*/
	setup_properties: ->
		@properties = 
			min_height: 500
			easing: "easeInOutQuad"
			window:
				width: global.window.width()
				height: global.window.height()

		@properties.min_height = @properties.window.height 
		@properties

	set_current_item: ($item = false) ->
		@items.previous = $.extend true, {}, @items.current
		@items.previous.is_open = @is_open

		if $item isnt false
			if $item.length > 1
				$item = $item.first()
			
			# Setup the Current Item
			@items.current.$item = $item # Item jQuery Object
		else

			@items.current.$item = false # Item jQuery Object
		$item

	update_items: ->
		unless @items.current.$item?
			@items.current.$item = false
			@items.previous = false
		
			@items

		else true # True because the for loop did execute, even though the @items.current.$item might not exist (yet)


	# //-----------------------------------*/
	# // Helpers
	# //-----------------------------------*/
    
	start_loading: ->
		# $container = @iface.preview.container
		# $content = @iface.preview.content
		# $item = @items.current.$item

		# Hide Content from Container
		# $content.fadeOut(400) if @is_open is true ## DEBUG, there was a conditional if @is_open is false
		
		# Fade in $loading container
		App.Loading.start()

	stop_loading: ->
		$container = @iface.preview.container
		$content = @iface.preview.content

		# Show Content that was hidden in start_loading()
		App.Loading.stop -> $content.show()
			
	blocking: (maybe) ->
		@blocked = maybe
		@blocked

	# //-----------------------------------*/
	# // States
	# //-----------------------------------*/
    
	on_item_open: =>
			@blocking(false)
			if @items.current? and @items.current.$item isnt false
				@stop_loading()
				@items.current.$item
					.addClass "is-open"

	

				@is_open = true
			return

	on_item_close: (item_obj) =>
			@is_open = false
			@blocking(false)
			item_obj.$item.removeClass "is-open"
			
	on_container_close: (item_obj) =>
			@is_open = false
			return


	on_container_open: =>
			@is_open = true 
			global.document.trigger("preview:content_opened", @current)
