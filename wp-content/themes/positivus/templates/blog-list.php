<?php
/*
Template Name: Blog: List Layout
 */
get_header();

// Setup Pagination properly
$current_page = get_current_page();

$taxonomy = "category"; // Pure Options get this
$taxonomy_title = __("Project Types", "pure"); // Pure options get this

$args = array(
              'post_type' => 'post',
              'paged' => $current_page
              );

$blog = new WP_Query($args);
?>

	<div id="primary" class="content-area">
		<div id="content" class="site-content" role="main">

		<?php if ( $blog->have_posts() ) : ?>

			<?php /* Start the Loop */ ?>
			
			<div class="entry-list list js__items--list">
			<?php while ( $blog->have_posts() ) : $blog->the_post(); ?>
				<?php
					get_template_part( 'parts/list/entry', get_post_format() );
				?>

			<?php endwhile; ?>


			<?php pure_pagination($blog); ?>
			</div> <!-- .boxed-list -->

		<?php else : ?>

			<?php get_template_part( 'no-results', 'index' ); ?>

		<?php endif; ?>
		

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>