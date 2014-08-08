class Modern_Masonry
	constructor: ($container = global.document, items) ->
		@container = $container
		@selector = items
		
		$items = @container.find @selector
		@setup($items)

	setup: ($items) ->	 
		$items.hoverIntent
			over: @enter
			out: @leave

	refresh: (e) =>
		$items = @container.find(@selector)
		$items.hoverIntent()
		@setup($items)



	enter: (e) ->
		$this = $(this)
		$img = $this.find(".wp-post-image")
		$entry_header = $this.find(".entry-header")
		
		$this.addClass("dont-flicker")
		
		$img.transition
			y: $entry_header.height() * -1
			# opacity: 0.8
			duration: 400
			easing: "easeOutCubic"
		
		$entry_header.transition
			y: 0
			# opacity: 1
			duration: 400
			easing: "easeOutCubic"
	leave: (e) ->
		$this = $(this)
		$img = $this.find(".wp-post-image")
		$entry_header = $this.find(".entry-header")

		$this.removeClass("dont-flicker")
		$img.transition
			y: 0
			# opacity: 1
			duration: 400
			easing: "easeInSine"
		
		$entry_header.transition
			y: "100%"
			# opacity: 0.05
			duration: 400
			easing: "easeInSine"


if global.item.list and global.item.list.hasClass("modern") then do ->
	Masonry = {}
	for list, key in global.item.list.filter(".modern")
		Masonry[key] = new Modern_Masonry $(list), select.item.single
		App.callback.recollect.add Masonry[key].refresh





