<?php
/**
 * The Template for displaying all single posts.
 *
 */

get_header(); 
?>

	<div id="primary" class="content-area">
		<div id="content" class="site-content" role="main">

		<?php the_post(); ?>
			
			<?php get_template_part( 'parts/single/content-post', get_post_type() ); ?>

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>