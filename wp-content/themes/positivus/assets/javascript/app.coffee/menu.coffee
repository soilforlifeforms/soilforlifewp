class Menu_Line
		constructor: (options) ->
			@line = $(options.line)				 	# This is the guy that's sliding around
			@container = $(options.container)		# Container
			@items = $(options.items)				# Menu Items
			@links = @items.find(options.links)		# Menu item Links
			@current = false						# We'll find Current on @slide()


			$current_item = @items.filter(".current-menu-item, .current-menu-ancestor, .current-menu-parent").first().find("> a")

			if $current_item.length > 0
				@slide($current_item)
	
				$(window).on "debouncedresize", =>
					@current = false
					@slide($current_item)
			else
				@current =
					width: 0
					left: 0

			@links.on "mouseenter", (e) =>
				$el = $(e.srcElement || e.target)
				@slide($el)

			@links.parent().on "mouseleave", (e) =>
				@move(@current)

		# set: (args) ->
		# 	@line.css args

		get: ($item) ->
			width: $item.width()
			left: $item.position().left

		move: (args) ->
			@line.stop().animate args,
					duration: 200
					easing: "easeOutCirc"

		slide: ($el) ->
			$parent = $el.parent()
			$grandparents = $parent.parents(".menu-item")

			if $grandparents.length isnt 0
				$parent = $grandparents.last()
				$el = $parent.find("a").first()


			if $el.hasClass("sf-with-ul")
				# Find the Sub-menu
				$submenu = $parent.find("> .sub-menu").first()

				# Get Widths
				el_w = $el.outerWidth()
				sub_w = $submenu.outerWidth()

				# Math
				diff = (el_w - sub_w) / 2

				# Offset the Sumenu
				$submenu.css
					left: diff

				#
				pos = $el.offset().left + diff
				width = sub_w
			else
				width = $parent.width()
				pos = $el.offset().left

			unless @current
				@current =
					left: pos
					width: width

			@move
				left: pos
				width: width


if $$("#menu-main-menu, #responsive-menu").length isnt 0
	# 
	# A little configuration for the menus
	# 
	responsive_breakpoint = 768
	
	$desktop_menu = $$("#menu-main-menu")

	# We don't need toggler on Desktop devices
	# Don't create until needed ( menu_responsive() )
	# But make it global in case toggling back and forth
	$toggler = false
	Line = false

	#
	#	Initialize Regular Menu ( superfish )
	#
	if $desktop_menu.length
		$desktop_menu.superfish
				delay: 250
				speed: 125
				speedOut: 75
				interval: 150
				animation:
					opacity: 'show'
					height: 'show'
				animationOut:
					height: 'hide'
					opacity: 'hide'

		# Get Top Level Items
		$items = $desktop_menu.find("> .menu-item")
		
		# We'll compare the position of the first and last items
		$first = $items.first()
		$last = $items.last()

	menu_regular = ->
		$$("body").removeClass("is-responsive")
		$$("#header--responsive").hide()
		$$("#header").show()
		$.waypoints("refresh")
		
		if Line is false and $items.length > 0
			$$("#navigation").append """<li id="menu-line"/>"""
			Line = new Menu_Line
				line: "#menu-line"
				container: $$("#navigation")#.addClass("regular")
				items: $items
				links: "a"
		return
		

	menu_responsive = ->
		$$("body").addClass("is-responsive")
		$$("#header--responsive").show()
		$$("#header").hide()
	
		if $toggler is false
			$toggler = $$("#header--responsive").find(".toggle")
			
			# Initialize Responsive Menu
			$toggler.sidr
				name: "responsive-menu"
				body: "#page"
				displace: false
		
	responsive_router = ->
		# Responsive Tests:
		window_width = $$(window).width()
		narrow_device = ( window_width < responsive_breakpoint )
		wider_than_before = ( window_width > App.state.width )

		if App.state.responsive is true
			
			# Not a narrow device BUT the device a wider than before
			if not narrow_device and wider_than_before
				$$("#header").show()
				f_offset = $first.offset().top
				l_offset = $last.offset().top
				menu_is_broken = ( f_offset isnt l_offset )
				$$("#header").hide()
			else
				menu_is_broken = true
		else
			menu_is_broken = ( $first.offset().top isnt $last.offset().top )

		#
		# Is it a responsive menu ?
		# 
		if App.state.responsive isnt true and ( menu_is_broken or narrow_device )
			
			App.state.responsive = true
			App.state.width = window_width

			do menu_responsive
			return

		#
		# Is it a regular menu ?
		# 
		if App.state.responsive isnt false and (  wider_than_before and not menu_is_broken and not narrow_device  )
			
			App.state.responsive = false
			App.state.width = window_width

			do menu_regular
			return

		App.state.width = window_width
		return






	$$(document).ready ->
		if $$("#header").length and $$("#header--responsive").length
		then responsive_router()
		else
			if App.sniff.isMobile
			then menu_responsive()
			else menu_regular()



		$$(window).on "debouncedresize", responsive_router








