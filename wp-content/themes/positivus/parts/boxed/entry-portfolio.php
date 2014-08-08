<?php
// This gets the Width from Theme Settings ( not post meta as in portfolio)
$css_width = Pure::get_theme_mod( 'masonry_width', 'w2' );
$css_height = Pure::get_post_meta( 'post_height', 'h2' );
?>

<article id="post-<?php the_ID(); ?>" <?php post_class("js__items--single-item noheight boxed-item $css_width"); ?>>
		<div class="entry-content">
			
			<?php echo get_the_post_thumbnail( get_the_ID(), 'boxed_thumbnail_' . $css_width . $css_height ); ?>
			
			<div class="entry-header">
				<h4 class="entry-title">
					<a class="js__items--link entry-link" href="<?php the_permalink(); ?>">
						<?php the_title(); ?>
					</a>
				</h4>

			<footer class="entry-footer">
				 <div class="left cell portfolio-taxonomy">
					 <?php the_terms( $post->ID, 'project-types'); ?>
				 </div>

				<?php if( function_exists('zilla_likes') ): ?>
					<div class="right cell likes">
						<?php zilla_likes(); ?>
					</div>
				<?php endif; ?>
		 
			</footer>
			</div>

		</div>
</article><!-- #post-## -->
