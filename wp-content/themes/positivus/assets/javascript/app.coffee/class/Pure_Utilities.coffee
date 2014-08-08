class Pure_Utilities
	# Syntactic Sugar for CoffeeScript setTimeout
	delay: (ms, func) -> setTimeout func, ms
	random_time: -> _.random(650, 1000)
	transition: (settings) ->

		Deferred = new $.Deferred()
		resolver = _.after settings.items.length, Deferred.resolve
		for item in settings.items
			trans = settings.transition
			trans.complete = resolver
			trans.duration = if _.isFunction(settings.duration) then settings.duration() else settings.duration

			$(item).addClass("dont-flicker").transition trans



		return Deferred.promise()




