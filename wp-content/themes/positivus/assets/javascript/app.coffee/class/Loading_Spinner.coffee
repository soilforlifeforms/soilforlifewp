class Loading_Spinner
	constructor: ->
		@spinner = $("#loading-spinner")
		@spinner.hide()
		@status = 0

	start: (callback) ->
		return if @status is 1
		@status = 1
		@spinner.fadeIn(200, callback)
		return this

	stop: (callback) ->
		return if @status is 0
		@status = 0
		@spinner.fadeOut(200, callback)
		@reset_size()
		return this

	small: ->
		@spinner.addClass("small")
		return this

	reset_size: ->
		$.when(@spinner).done => @spinner.removeClass("small")
		return this