App.Loading = new Loading_Spinner()
App.Util = new Pure_Utilities()
App.Infinite = new Infinite_Scroll( App.Loading )

# Fix Legacy Flexbox in Firefox
# Where the height is somehow freaky below FF 22
# 
# Remove when < FF 21 is 2 versions back
fix_firefox_image_height = ($images) ->
	for img in $images
		$img = $(img)
		$img.css height: "auto"
		$img.css height: $img.height()

if Modernizr.flexboxlegacy and not Modernizr.flexbox
	images = global.content.find(".size-full")
	fix_firefox_image_height(images)
	
	global.window.on "debouncedresize", ->
		fix_firefox_image_height(images)

# 
# Setup Sniffs
# 
App.browser = 
	iOS: if navigator.userAgent.match(/(iPad|iPhone|iPod)/g) then true else false
	IE: if is_msie? and is_msie is true then true else false

$$("body").addClass("iOS") if App.browser.iOS is true

#
# FitVids
#
setup_fitvids = -> 
	do global.content.fitVids
	return

do setup_fitvids
# delayed_hover = global.content.find(".media-column")
# delayed_hover = delayed_hover.add global.item.single


# delayed_hover.hoverIntent
# 	over: -> $(this).addClass("js-delayed-hover")
# 	out: -> $(this).removeClass("js-delayed-hover")
# 	interval: 400

$$("#primary").css
	"min-height": global.window.height()


$$(document).ready ->
	$.stellar
		positionProperty: "transform"
		verticalOffset: $$(select.header).height() / 2
		horizontalScrolling: false
		responsive: true
		# hideDistantElements: false

$$(document).imagesLoaded -> $.stellar("refresh")
$$(window).on "debouncedresize", -> $.stellar("refresh")











