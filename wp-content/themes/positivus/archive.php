<?php
/**
 * The template for displaying Archive pages.
 *
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 */

get_header(); 
$layout_type = Pure::get_theme_mod("blog_layout", "classic");

$layout_class = "";

if( $layout_type == "masonry") {
	$layout_type = "boxed";
	$layout_class = "js__packery masonry";
}
if( $layout_type == "modern") {
	$layout_type = "boxed";
	$layout_class = "js__packery modern masonry";
}

?>
	<section id="primary" class="content-area">
		<div id="content" class="site-content" role="main">

		<?php if ( have_posts() ) : ?>
			<?php /* Start the Loop */ ?>
			<div class="entry-list <?php echo $layout_type; ?> <?php echo $layout_class ?> js__items--list">
				
				<?php while ( have_posts() ) : the_post(); ?>
					<?php get_template_part( "parts/$layout_type/entry", get_post_format_or_type() ); ?>
				<?php endwhile; ?>

				
				<?php pure_pagination(); ?>
			</div> <!-- .list.entry-list -->

		<?php else : ?>

			<?php get_template_part( 'no-results', 'archive' ); ?>

		<?php endif; ?>

		</div><!-- #content -->
	</section><!-- #primary -->

<?php get_footer(); ?>