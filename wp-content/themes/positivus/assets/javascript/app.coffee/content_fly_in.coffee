# $(".pure-skill__value").addClass("nowdith").appear()
# $(".pure-skill__value").on 'appear', ->
# 	$(this).removeClass("nowidth")
prepare_fly_in = ->
	return false if Modernizr.touch is true

	$items = $$(select.item.single, true)
	$items = $items.add global.content
						.find(".parallax-item")
						.find(".media,.content")
	$items = $items.add global.document.find(".js__trans")

	$items = $items.filter(":not(.in-place):not(:appeared)")

	if $items.length and $items.length > 0
		$items.addClass("offset")

		$items.waypoint
			offset: '95%'
			triggerOnce: true
			handler: fly_in
	

fly_in = (direction) ->
	return false if direction isnt "down"
	$item = $(this)
	ms = _.random(10, 400)
	App.Util.delay ms, -> $item.addClass("in-place")
	return

App.Util.delay 1000, -> 
	$(".pure-skill__value").each ->
		$skill = $(this)
		original_width = $skill.css("width")
		
		$skill.addClass("dont-flicker").css
			width: 0
			opacity: 0.5

		$skill.waypoint
			offset: 'bottom-in-view'
			triggerOnce: true
			handler: ->
				$skill.transition 
					width: original_width,
					opacity: 1
					easing: "easeOutQuart"
					duration: 990
	




#
# After AJAX ( Infinite Scroll, etc.)
#
unless is_msie?
	if App.Packery and Modernizr.touch is false
		App.callback.packery.add prepare_fly_in
		App.callback.recollect.add prepare_fly_in
	else
		do prepare_fly_in

