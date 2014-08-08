<?php
$post_format = get_post_format();

if ( empty( $post_format ) ) { $post_format = "standard"; }
 ?>

<div class="list-wrapper js__items--single-item">
	<article id="post-<?php the_ID(); ?>" <?php post_class("list-item"); ?>>
		<header class="entry-header">	
			
			<h2 class="entry-title">
				<a class="js__items--link" href="<?php the_permalink(); ?>">
					<?php the_title() ?>
				</a>
			</h2>

			<div class="entry-meta" >
				<?php echo get_the_category_list( $separator = ', ' ); ?>
			</div>

		</header>
		
	<?php get_template_part("parts/entry-footer") ?>
	</article><!-- #post-## -->
</div>