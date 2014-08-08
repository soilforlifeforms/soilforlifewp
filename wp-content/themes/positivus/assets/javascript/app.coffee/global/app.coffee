"use strict"

$ = jQuery
$$ = $.q

$.fx.speeds._default = 700

select =
	body: "html, body" # Browsers have their differences on what's body, so target both. Duh.
	header: "#header"
	header_block: "#header-block"
	content: "#content"
	footer: "#footer"
	item:
		single: ".js__items--single-item"
		list: ".js__items--list"

App = 
	# Callbacks
	callback:
		layout: jQuery.Callbacks()
		packery: jQuery.Callbacks()
		previewer: jQuery.Callbacks()
		recollect: jQuery.Callbacks()
	
	state:
		responsive: null # don't know yet
		width: 0
	
	# Deferreds
	dfd: {}
	
	# Sniffs are going to be here
	sniff: {} 

	# Packery
	Packery: false # packery.coffee
	Util: false
	Loading: false
	Infinite: false

# This is a little bit hacky, but better organization
# Maybe I can rewrite this in the future
# It works for now though.
setup_global_values = (select) ->

	global = 
		window: $(window)
		document: $(document)

	for key, value of select
		if _.isString value 
			$value = $(value)
			global[key] = if $value.length is 0 then false else $value
		else
			global[key] = {}
			
			for second_key, second_value of value
				$value = $(second_value)
				global[key][second_key] = if $value.length is 0 then false else $value
	
	global.document.trigger("pure:globals")
	return global

global = setup_global_values(select)

#
# In addition, these are the globals that we're going to have:
#





#
# Some Default Actions
#
global.window.on "orientationchange", -> 
	global.window.trigger "debouncedresize"
	$.waypoints("refresh")

# global.document.on "pure:append", (e, items) ->
# 	global = setup_global_values(select)	
# 	global.document.trigger("pure:globals")


#=======================================================
###
				DEBUGGING TOOLS BELOW
###
#=======================================================


Dump = (message) -> 
	return null
# window.g = global
# window.app = App

# do ->
#   # prepare base perf object
#   if typeof window.performance=='undefined'
#     window.performance = {}
#   if not window.performance.now
#     nowOffset = +new Date()
#     if performance.timing and performance.timing
#       nowOffset = performance.timing.navigationStart
#     window.performance.now = ->
#       now = +new Date()
#       return now - nowOffset

# globalTime = window.performance.now()

# Dump = (message) ->
# 	unless window.performance?
# 		console.log message 
# 		return

# 	stamp = window.performance.now()
# 	timeDiff = if globalTime isnt 0 then stamp - globalTime else 0
	
# 	ms = parseFloat(timeDiff).toFixed(3)
# 	if _.isString(message)
# 		console.log "( +#{ms}ms ) #{message}"
# 	else
# 		console.log ""
# 		console.log " --- "
# 		console.log "( +#{ms}ms ):"
# 		console.log message
# 		console.log " --- "
# 		console.log ""
# 	globalTime = stamp


# performance = (func) ->
# 	t1 = window.performance.now()
# 	do func
# 	t2 = window.performance.now()
# 	console.log "Result: #{t1} - #{t2} ms"


# global.document.on "ready", -> Dump "Event: Document Ready"
# global.document.imagesLoaded -> Dump "Event: Images Loaded"
# global.document.on "debouncedresize", -> Dump "Event: Debounced Resize"
# global.document.on "complete", -> Dump "Event: Ajax Success"
# global.document.on "pure:globals", -> Dump "Event: Pure Globals have Setup"









