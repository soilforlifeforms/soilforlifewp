class Infinite_Scroll
	constructor: (loading = false) ->
		@Loading = loading
		@setup()

	setup: ->	
		return false if $$(select.item.list).length is 0
		# Setup Infinite Scroll
		$$(select.item.list).infinitescroll
			navSelector: "ul.page-numbers"
			nextSelector: ".page-numbers.next" 
			itemSelector: select.item.single
			finishedMsg: false
			loading:
				start: @loading_start
				finished: @loading_end
			errorCallback: @loading_end
			
			msgText: false 
			debug: false
			path: (pageNum) ->
				base_url = $$(".page-numbers", true).find("a.page-numbers").first().attr("href")
				pattern = /(page)(\/|=)(\d)/
				
				next_page = pageNum - 1 if pageNum > 2

				next_url = base_url.replace pattern, "$1$2#{pageNum}"
				

				return next_url
			# 	x
			# bufferPx: $$(window).height()
			, @on_append


	on_append: (items) =>
		$items = $(items)
		
		if App.Packery 
			$items.css opacity: 0
			App.callback.packery.add -> $items.css opacity: 1

		$items.find("img").imagesLoaded =>
			App.callback.recollect.fire()
			$$(document).trigger "pure:append", items
			do @loading_end
			do @resume

			
		return

	destroy: ->
		return false if $$(select.item.list) is false
		$$(select.item.list).infinitescroll('destroy'); 
		$$(select.item.list).data('infinitescroll', null);	
	
	reset: =>
		# Clear Infinite scroll if there is one already
		do @destroy if $$(select.item.list).data("infinitescroll")
		do @setup

	pause: ->
		return false if $$(select.item.list) is false
		$$(select.item.list).infinitescroll("pause")
	
	resume: ->
		return false if $$(select.item.list) is false
		$$(select.item.list).infinitescroll("resume")				
	
	load: ->
		return false if $$(select.item.list) is false
		$$(select.item.list).infinitescroll('retrieve')

	loading_start: (opts) =>
		@Loading.small().start() if @Loading
		return false if $$(select.item.list) is false
		$$(select.item.list).data("infinitescroll").beginAjax(opts)
		@pause()
	
	loading_end: =>
		return false if $$(select.item.list) is false
		@Loading.stop() if @Loading