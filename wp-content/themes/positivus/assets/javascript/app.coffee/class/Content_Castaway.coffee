class Content_Castaway
	constructor: ( options ) -> 
		# Toggler Defaults 
		defaults = 
			container: $$(select.item.list)
			content: $$(select.content)
			single: $$(select.item.single)

		@fly_distance = $(window).height()

		# Merge Defaults with Provided Options
		settings = $.extend true, {}, defaults, options

		@content = $(settings.content)
		@container = $(settings.container)
		@single = $(settings.single)

		@original_container = @container.clone() # Store one in memory for backup			
	

	add: ( data ) ->
		@container.append( data )

	detach: (elements) ->
		@parent = @content.parent()
		@content.detach()
	
	reattach: ->
		@parent.append(@content)
		return this

	remove: =>
		@container.html("")

	destroy: ->
		@container.remove()

	find_content: (data) ->
		$(data).find(@container.selector).children()

	replace: ( data ) =>
		dfd = @hide( @remove )
		$.when( dfd ).done =>
			@add( data )

		return dfd
			
	get_children: ->
		$(@container.selector).find( @single.selector )

	hide: (callback = false) ->
		App.Loading.start()
		$children = @get_children()
		
		dfd = App.Util.transition
			items: _.shuffle $children
			duration: App.Util.random_time
			transition:
				y: @fly_distance
				opacity: 0
				easing: "easeInQuint"

		$.when(dfd).done(callback) if callback
		return dfd

	show: =>
		$children = @get_children()
		App.Loading.stop()
		@container.css "overflow": "hidden"
		$children.css 
			y: @fly_distance * -2
		
		dfd = App.Util.transition
			items: _.shuffle $children
			duration: App.Util.random_time
			transition:
				y: "0"
				opacity: 1
				easing: "easeOutCubic"


		$.when( dfd ).done ->
			App.callback.recollect.fire()
			App.Packery("layout") if App.Packery

		return dfd

	restore: =>
		@replace @original_container.clone().children()