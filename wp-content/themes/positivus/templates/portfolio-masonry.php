<?php
/*
Template Name: Portfolio: Masonry
 */
get_header();

// Setup Pagination properly
$current_page = get_current_page();
$posts_per_page = get_option("posts_per_page");
if ($current_page === 1) { $posts_per_page++; $page_offset = 0; }
else {$page_offset = 1 + ( $current_page - 1 ) * $posts_per_page; }


$taxonomy = Pure::get_theme_mod("portfolio_filter_taxonomy", "project-types"); // Pure Options get this
$taxonomy_title = __("Project Types", "pure"); // Pure options get this

$args = array(
              'post_type' => 'portfolio',
              'posts_per_page' => $posts_per_page,
              'offset' => $page_offset,
              'paged' => $current_page
              );


$portfolio = new WP_Query( $args );


// A little hacky, will do for now.
// We're going to use Wordpress filters here in a very near future.
$override_width = Pure::get_post_meta("masonry_width", false);
if( $override_width ) {
	$override["masonry_width"] = $override_width;		
}

if ( isset($override) ) {
	Pure::add_override($override);
}
$portfolio_layout = Pure::get_theme_mod("portfolio_layout", "masonry");
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
				<li><a href="<?php echo $show_all_url ?>" class="select all" data-reset="yes"><?php _e("Show All", "pure") ?></a></li>
				<?php foreach ($terms as $term): ?>
					<li>
						<?php echo '<a href="'.get_term_link($term).'">'.$term->name.'</a></li>' ?>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
		


		<?php if ( $portfolio->have_posts() ) : ?>

			<?php /* Start the Loop */ ?>
			
			<div class="boxed masonry <?php echo $portfolio_layout ?> entry-list js__items--list js__packery">
				<div id="packery-column"></div><div id="packery-gutter"></div>
			
			<?php while ( $portfolio->have_posts() ) : $portfolio->the_post(); ?>

				<?php
					get_template_part( 'parts/boxed/entry-portfolio' );
				?>

			<?php endwhile; ?>
			<?php if ( isset( $override ) ){ Pure::clear_override(); }?>

			<?php pure_pagination($portfolio); ?>
			</div> <!-- .boxed-list -->

		<?php else : ?>

			<?php get_template_part( 'no-results', 'index' ); ?>

		<?php endif; ?>
		

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>