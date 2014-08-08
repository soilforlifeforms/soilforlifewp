align_columns = (column_container) ->
	$pricing_columns = $(column_container).find(".pricing-column")

	$features = $pricing_columns.find(".features")
	$price = $pricing_columns.find(".price")
	$action = $pricing_columns.find(".action")
	$title = $pricing_columns.find(".pricing-column__title")



	return if $features.length is 0

	
	prices = []
	features = []
	actions = []
	titles = []

	for fcol, key in $features		
		prices.push $( $price.get(key) ).outerHeight()
		features.push $( $features.get(key) ).outerHeight()
		actions.push $( $action.get(key) ).outerHeight()
		titles.push $( $title.get(key) ).outerHeight()

	$features.height Math.max.apply null, features
	$price.height Math.max.apply null, prices
	$action.height Math.max.apply null, actions
	$title.height Math.max.apply null, titles
	return


class Media_Column_Resize
	constructor: ->
		
		$columns = $(".media-column.js__resize")

		if $columns.length > 0 #&& $inner_wrapper.length > 0
			# Group Columns
			@column_groups = _.groupBy $columns, (elem) -> $(elem).parent().offset().top 
		else
			@column_groups = false

	resize_group: ( group ) ->
		# Find the tallest
		tallest = 0
		for key, column of group
			$column = $(column)
			$column.css height: ""
			
			height = $column.outerHeight()
			tallest = height if height > tallest
		
		if tallest > 0
			# Set the tallest
			for key, column of group
				$(column).css height: tallest

		else
			App.Util.delay 2000, => @resize_group(group)


	resize_groups: =>
		for groupKey, group of @column_groups
			@resize_group(group)	
		return



# //-----------------------------------*/
# // We can fetch and group as soon as we have the document
# //-----------------------------------*/
###
	Media Columns
### 
mcr = new Media_Column_Resize()

###
	Pricing Tables
### 
$pricing_columns = $(".pricing-column")
if $pricing_columns.length > 0
	$pricing_columns.closest(".g").addClass("g--pricing-table")


# Let's do the resizing only when the document is fully ready
global.document.imagesLoaded ->
	# Pricing Tables
	if $pricing_columns.length > 0
		for column_container in $pricing_columns.closest(".container__content")
			align_columns(column_container)

	# Media Columns
	if mcr.column_groups isnt false
		do mcr.resize_groups
		global.window.on "debouncedresize", mcr.resize_groups









