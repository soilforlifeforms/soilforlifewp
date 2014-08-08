### 
	Stick class
	Heavily inspired (copied and modified) from Sticky Elements Shortcut for jQuery Waypoints - v2.0.2
	Requires jQuery Waypoints ~2.0.2
###
class Stick 
	constructor: (el, options) ->
		defaults = 
			wrapper: '<div class="sticky-wrapper" />'
			stuckClass: 'stuck'

		options = $.extend {}, $.fn.waypoint.defaults, defaults, options
		$wrap = @wrap el, options
		
		originalHandler = options.handler

		options.handler = (direction) ->
			# $sticky = $(this).children ':first'
			shouldBeStuck = direction in ['down', 'right']
			el.toggleClass options.stuckClass, shouldBeStuck
			# originalHandler.call this, direction if originalHandler?

		$wrap.waypoint options


	wrap: ($elements, options) ->
		$elements.wrap options.wrapper
		$elements.each ->
			$this = $ this
			$this.parent().height $this.outerHeight()
			# true
		$elements.parent()

		


if App.dfd.header_block? and App.state.responsive is false
	
	$.when(App.dfd.header_block).done -> 
		sticky_header = new Stick global.header, offset: -1
		return
		# global.header.addClass("dont-flicker-3d")
			# offset: global.window.height() * -1
else 
	global.document.imagesLoaded -> 
		sticky_header = new Stick global.header, offset: -1
		return


stick_footer_at = (amount, percent = false) ->
	position = if percent is true 
	then $(document).height() * (amount / 100) - $(window).height()
	else amount

	$("body").waypoint
		handler: (direction) -> 
			$footer = $("#footer")

			if direction is "down" and $footer.hasClass("stuck") is false
				$footer.css(opacity: 0).addClass("dont-flicker stuck").transition
					opacity: 1
					easing: "easeOutSine"
					duration: 400
					complete: -> App.Util.delay 500, -> $footer.removeClass("dont-flicker")
			else
				$footer.transition
					opacity: 0
					easing: "easeInSine"
					duration: 400
					complete: -> $footer.removeClass("stuck")


		offset: position * -1



if global.footer then do ->	

	# Get Values	
	scroll = global.footer.data("scrolltop")
	
	if scroll?
		# Stick it. Stick it.
		stick_footer_at(scroll.top, scroll.percent)
