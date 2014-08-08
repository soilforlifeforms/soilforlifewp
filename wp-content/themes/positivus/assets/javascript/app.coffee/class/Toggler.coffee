class Toggler  
	constructor: ( options ) -> 
		# Toggler Defaults 
		defaults = 
			preview: false
			content: "#js-post"
			items: ".js-preview" 
		
		# Merge Defaults with Provided Options
		@selectors = $.extend true, {}, defaults, options

		# Some Private class Variables
		@_URL = false
		@_loaded_URL = false
		
		# Select the core selectors only once, store them in class variable @iface
		@iface = 
			window: global.window
			body: global.body
			preview: setup_preview(@selectors.preview) # Cache the Container

	# Setup the Toggler if needed, return necessary jQuery selectors
	setup_preview = (preview) -> 
		
		# If Toggler is an already made Object, use that and assume all the necessary @iface elements are in place
		if _.isObject(preview) then return preview 
		# Append defaults and return them
		else
			$("body").append """ 
				<div id="toggle-container"> 
					<div id="toggle-inner" style="height: auto;"></div>
				</div>
				"""
			
			container: $("#toggle-container") 
			content: $("#toggle-inner")

	# Pull content in with AJAX
	load: (e) => 
		@iface.preview.container.load "#{@_URL} #{@selectors.content}", => @on_load_complete(e)

	# Yeah...
	on_load_complete: (data) ->
		@cache_url(@_URL)
		@open(data)
		return

	# Core Functiontality
	open: ->
		@is_open = true
		@iface.preview.container.show()
	
	close: ->
		@is_open = false
		@iface.preview.container.hide()
	
	toggle: (URL) =>
		@_URL = URL

		if @is_open isnt true or @is_new_url(@_URL)
		then @reopen(URL)
		else @close()
	
	reopen: (URL) ->
		@close() if @is_open is true
		if @is_new_url(@_URL)
		then @load(URL)
		else do @open


	is_new_url: (URL) ->
		if URL isnt @_loaded_URL then true else false
	
	cache_url: (URL) ->
		@_loaded_URL = URL
		@_URL = false
		return

	cache_data: (data) ->
		@_cached = data.clone().hide()
		return
	
	get_cached_data: ->
		@_cached.clone().show()
