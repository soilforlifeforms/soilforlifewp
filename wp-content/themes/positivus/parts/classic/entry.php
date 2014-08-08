<?php
$post_format = get_post_format();

if ( empty( $post_format ) ) { $post_format = "standard"; }
 ?>

	<article id="post-<?php the_ID(); ?>" <?php post_class("entry-item classic-item js__items--single-item"); ?>>
		
		<?php if ( has_post_thumbnail() ): ?>
			<?php the_post_thumbnail("pure_classic"); ?>
		<?php endif; ?>

		<header class="entry-header">	
			
			<h3 class="entry-title">
				<a class="js__items--link" href="<?php the_permalink(); ?>">
					<?php the_title() ?>
				</a>
			</h3>

			<div class="entry-meta" >
				<?php the_date("D m, Y") ?>
				<?php echo get_the_category_list( $separator = ', ' ); ?>
			</div>

		</header>
		
		<?php get_template_part("parts/entry-footer") ?>

		<div class="entry-content">
			<?php the_excerpt(); ?>

		</div>

	</article><!-- #post-## -->