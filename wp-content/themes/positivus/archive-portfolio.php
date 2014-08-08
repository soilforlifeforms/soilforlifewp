<?php
/*
Same as templates/portfolio-grid.php
But this file has no custom WP_Query
 */

get_header();

// Setup Pagination properly
$current_page = get_current_page();
$posts_per_page = get_option("posts_per_page");
if ($current_page === 1) { $posts_per_page++; $page_offset = 0; }
else {$page_offset = 1 + ( $current_page - 1 ) * $posts_per_page; }

$layout_type = Pure::get_theme_mod("portfolio_layout", "masonry");

$taxonomy = Pure::get_theme_mod("portfolio_filter_taxonomy", "project-types"); // Pure Options get this
$taxonomy_title = __("Project Types", "pure"); // Pure options get this
?>

	<div id="primary" class="content-area">
		<div id="content" class="site-content" role="main">

		<div class="content-header">
			<h1 class="header-title"><?php the_title(); ?></h1>
			<?php 
			$excerpt = get_the_excerpt();
			if (!empty($excerpt)):
			?> 
			<h2 class="header-description"><?php echo $excerpt; ?></h2>
			<?php endif; ?>	




			<?php $terms = get_terms( $taxonomy, array( 'orderby' => 'name' )); ?>
			<ul id="js-filters" class="filters">
				<?php foreach ($terms as $term): ?>
					<li>
						<?php echo '<a href="'.get_term_link($term).'">'.$term->name.'</a></li>' ?>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
		


		<?php if ( have_posts() ) : ?>

			<?php /* Start the Loop */ ?>
			
			<div class="boxed entry-list js__items--list js__packery">
			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( "parts/boxed/boxed-portfolio", $layout_type ); ?>

			<?php endwhile; ?>


			<?php pure_pagination(); ?>
			</div> <!-- .boxed-list -->

		<?php else : ?>

			<?php get_template_part( 'no-results', 'index' ); ?>

		<?php endif; ?>
		

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>