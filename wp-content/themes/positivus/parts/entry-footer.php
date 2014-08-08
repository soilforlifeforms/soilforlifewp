
<div class="entry-footer">
		<div class="cell entry-date">
			<div class="month"><?php the_time("M");?></div>
			<div class="date"><?php the_time("d");?></div>
			<div class="year"><?php the_time("Y");?></div>
		</div>

	<?php if( function_exists('zilla_likes') ): ?>
		<div class="cell likes">
			<?php zilla_likes(); ?>
		</div>
	<?php endif; ?>

</div>