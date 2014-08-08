<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 */

get_header();
$layout_type = Pure::get_theme_mod("blog_layout", "classic");
$layout_class = ($layout_type == "boxed") ? "js__packery masonry" : "";
?>
		<div id="primary" class="content-area">
		<div id="content" class="site-content" role="main">

		<?php if ( have_posts() ) : ?>

			<?php /* Start the Loop */ ?>
			
			<div class="entry-list <?php echo $layout_type ?> <?php echo $layout_class; ?> js__items--list">
			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( "parts/$layout_type/entry", get_post_format_or_type() ); ?>

			<?php endwhile; ?>


			<?php pure_pagination(); ?>
			</div> <!-- .boxed-list -->

		<?php else : ?>

			<?php get_template_part( 'no-results', 'index' ); ?>

		<?php endif; ?>
		

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>