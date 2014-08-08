<?php
/**
 * The template for displaying 404 pages (Not Found).
 *
 */

get_header(); ?>

	<div id="primary" class="content-area">
		<div id="content" class="site-content" role="main">
			<div class="error">404</div>
			<article id="post-0" class="post not-found">
				<header class="entry-header">
					<h1 class="entry-title"><?php _e( 'Sorry, can\'t find that page!', 'pure' ); ?></h1>
				</header><!-- .entry-header -->

				<div class="entry-content">
					<?php 
						printf( 
				             __("Go back to home page and <a href=\"%s\">Start Over ?</a>
							", "pure"),
							get_home_url()
					) ; ?>
				</div><!-- .entry-content -->
			</article><!-- #post-0 .post .not-found -->

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>