<?php
/**
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<a class="close js__close">X</a>
	<?php get_template_part( "/parts/post/header", get_post_format() ); ?>
	<div class="container">
		<?php if ( 'post' == get_post_type() ) : ?>

			<div class="entry-meta">
				<?php get_template_part('/parts/post/header-meta'); ?>
			</div><!-- .entry-meta -->

		<?php endif; ?>

		<?php if ( is_search() ) : // Only display Excerpts for Search ?>
		<div class="entry-summary">
			<?php the_excerpt(); ?>
		</div><!-- .entry-summary -->
		<?php else : ?>
		<div class="entry-content">

			<?php the_content( __( 'Continue reading <span class="meta-nav">&rarr;</span>', 'pure' ) ); ?>
			<?php
				wp_link_pages( array(
					'before' => '<div class="page-links">' . __( 'Pages:', 'pure' ),
					'after'  => '</div>',
				) );
			?>
		</div><!-- .entry-content -->
		<?php endif; ?>
	</div>
</article><!-- #post-## -->
