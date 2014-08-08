<?php
/*
Template Name: Blog: Masonry Layout (Modern)
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

// A little hacky, will do for now.
// We're going to use Wordpress filters here in a very near future.
$override_width = Pure::get_post_meta("masonry_width", false);
if( $override_width ) {
	$override["masonry_width"] = $override_width;		
	Pure::add_override($override);
}
?>

	<div id="primary" class="content-area">
		<div id="content" class="site-content" role="main">

		<?php if ( $blog->have_posts() ) : ?>

			<?php /* Start the Loop */ ?>
			
			<div class="entry-list boxed modern masonry js__items--list js__packery">
				<?php while ( $blog->have_posts() ) : $blog->the_post(); ?>
					<?php
						get_template_part( 'parts/boxed/entry', get_post_format_or_type() );
					?>
				<?php endwhile; ?>

			<?php if ( isset( $override ) ){ Pure::clear_override(); }?>
			<?php pure_pagination($blog); ?>
			</div> <!-- .boxed-list -->

		<?php else : ?>

			<?php get_template_part( 'no-results', 'index' ); ?>

		<?php endif; ?>
		

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>