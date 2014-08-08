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


$queried_object = get_queried_object();

$taxonomy = $queried_object->taxonomy; 
$taxonomy_title = __("Project Types", "pure"); // Pure options get this
$show_all_url = Pure::get_theme_mod('portfolio_url', false);
if( $show_all_url ) {
	$show_all_url = get_permalink( $show_all_url );
} else {
	$show_all_url = "#";
}


?>

	<div id="primary" class="content-area">
		<div id="content" class="site-content content-container" role="main">

		<div class="content-header">
			<?php $terms = get_terms( $taxonomy, array( 'orderby' => 'name' )); ?>
			<ul id="js-filters" class="filters">
				<li><a href="<?php echo $show_all_url ?>" class="select all"><?php _e("Show All", "pure") ?></a></li>
				<?php foreach ($terms as $term): ?>
					<li>	
					<?php
					echo '<a href="' . get_term_link($term) . '"';

					if ($term->name === $queried_object->name ) {
						echo 'class="is-open"';
						echo 'data-reset="yes"';
					}
					
					echo '>' . $term->name . '</a></li>';

					?>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
		


		<?php if ( have_posts() ) : ?>

			<?php /* Start the Loop */ ?>
			
			<div class="boxed masonry <?php echo $layout_type ?> entry-list js__items--list js__packery">
				<div id="packery-column"></div><div id="packery-gutter"></div>
			
			<?php while ( have_posts() ) : the_post(); ?>

				<?php
					get_template_part( 'parts/boxed/entry-portfolio' );
				?>

			<?php endwhile; ?>

			<?php pure_pagination(); ?>
			</div> <!-- .boxed-list -->

		<?php else : ?>

			<?php get_template_part( 'no-results', 'index' ); ?>

		<?php endif; ?>
		

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>