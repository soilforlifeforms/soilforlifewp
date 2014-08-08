<article id="js-single-item" <?php post_class("single"); ?>>
	<a class="close js__close">
		<span>
			<?php _e("Close", "pure"); ?>
		</span>
		<?php _e("X", "pure"); ?>
	</a>

	<?php 
	the_post_thumbnail( 'pure_classic' );
	 ?>

	<div class="container">
		
		<?php get_template_part( "/parts/post/header", get_post_format() ); ?>
		
		<?php if ( 'post' == get_post_type() ) : ?>
			<div class="entry-meta">
				<?php get_template_part('/parts/post/header-meta'); ?>
			</div><!-- .entry-meta -->
		<?php endif; ?>
		
		<div class="entry-content">

			<?php the_content(); ?>
			<?php
				wp_link_pages( array(
					'before' => '<div class="page-links">' . __( 'Pages:', 'pure' ),
					'after'  => '</div>',
				) );
			?>

		</div><!-- .entry-content -->
	</div>
	<?php
	// If comments are open or we have at least one comment, load up the comment template
	if ( comments_open() || '0' != get_comments_number() )
	comments_template();
	?>
</article> <!-- #js-single-item , Loaded with AJAX -->