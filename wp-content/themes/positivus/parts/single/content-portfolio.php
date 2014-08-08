<?php
if ( ! function_exists( 'get_meta_with_defaults' ) ) {
	function get_meta_with_defaults( $post_id, $defaults ) {
		return wp_parse_args( get_post_meta( $post_id ) , $defaults );
	}	
}

/* -----------------------------------*/
/* 		Generic
/* -----------------------------------*/
# Slug for Colorbox
$slug = "cb-" . sanitize_html_class( strtolower( get_the_title() ), "colorbox" );

/* -----------------------------------*/
/* 	Meta
/* -----------------------------------*/
$meta_to_ext = array(
	'pure_portfolio_client',
	'pure_portfolio_url',
	'pure_portfolio_url_title',
	'pure_portfolio_copyright',
	'pure_portfolio_project_date',
);

$defaults = array_fill_keys( $meta_to_ext, array() );

# Array shift gets the first value from the meta
$meta = array_map('array_shift', get_meta_with_defaults($post->ID, $defaults));

$filtered_meta = wp_array_slice_assoc( $meta, $meta_to_ext );
extract( $filtered_meta );


/* -----------------------------------*/
/* 	Skills & Taxonomies
/* -----------------------------------*/
$project_types = get_the_term_list( $post->ID, 'project-types', '<li><span class="title">'.__('Project Type:', 'pure').'</span> ', ' / '); 
$skills = get_the_term_list( $post->ID, 'skills', '<li><span class="title">'.__('Skills:', 'pure').'</span> ', ' / ' ); 


/* -----------------------------------*/
/* 	Media
/* -----------------------------------*/
$project_embed = Pure_Portfolio::get_embed( $post->ID );

// If a project embed exists
// Don't return post thumbnail as the "fallback" image
// Because it's possible the project has only a thumbnail and video
// We don't want that thumbnail to show up in "Gallery"
if ( !empty( $project_embed ) ) {
	add_filter( Pure_Portfolio::$prefix . 'project_images_fallback', '__return_false' );
}

$project_gallery = Pure_Portfolio::get_images( $post->ID, array('pure_mini', 'pure_large', 'large') );

if ( empty( $project_embed ) ) {
	
	$featured_image = array_shift($project_gallery);

}

/* -----------------------------------*/
/* 	Content
/* -----------------------------------*/
$the_content = get_the_content();


/* -----------------------------------*/
/* 	True/False values about this entry
/* -----------------------------------*/

$is_terms_empty = ( empty($project_types) && empty($skills) );
$is_meta_empty = ( array_filter( $filtered_meta ) === array() );

$is_slider_control_needed = ( !empty( $project_gallery ) && count( $project_gallery ) > 0 );
?>

<article id="js-single-item" <?php post_class("single cf clearfix");
		echo ' data-colorbox="'.$slug.'"';
		?>>

	<a class="close js__close">
		<span>
			<?php _e("Close", "pure"); ?>
		</span>
		<?php _e("X", "pure"); ?>
	</a>

	<?php if ( !empty( $featured_image ) && empty( $project_embed ) ): ?>
		<div class="featured-image">
			<a class="portfolio-image__container pure_mini <?php echo $slug ?>" href="<?php echo $featured_image['large']; ?>">
				<img class="portfolio-image" src="<?php echo $featured_image["pure_large"] ?>" title="<?php the_title(); ?>" />
			</a>	
		</div>
	<?php endif; ?>

	<?php if ( !empty( $project_embed ) ): ?>
		<div class="featured-image">
			<div class="fitvids">
				<?php echo wp_oembed_get( $project_embed ); ?>
			</div>
		</div>
	<?php endif; ?>



	<div class="container">
		<div class="description">		
		<?php if ( !empty( $project_gallery ) ): ?>
			<div class="thumbnails">
			<?php foreach ( $project_gallery as $key => $image ): ?>
				<a class="portfolio-image__container pure_mini <?php echo $slug ?>" href="<?php echo $image['large']; ?>">
					<img class="portfolio-image" src="<?php echo $image["pure_mini"] ?>" title="<?php the_title(); ?>" />
				</a>	
			<?php endforeach; ?>
			</div>
		<?php endif; ?>
			<header class="entry-title">
				<h1 class="portfolio-title"><?php the_title(); ?></h1>
			</header><!-- .entry-header -->
			<?php the_content() ?>
		</div>

		

		<?php if ( ! $is_terms_empty && ! $is_meta_empty ): ?>
			<aside class="side-info">
				<div class="entry-info details">

					
					<ul class="split">
						<?php
						// Project Date
						if ( !empty ( $pure_portfolio_project_date ) ): ?>
							<li><span class="title"><?php _e('Date:', 'pure'); ?></span>
							<?php echo $pure_portfolio_project_date; ?>
						<?php endif; ?>
						
						<?php 
							// Project Type
							echo $project_types;
						?>

						<?php
							// Skills
							echo $skills;
						?>


						<?php
						// Project Client
						if ( !empty ( $pure_portfolio_client ) ): ?>
							<li><span class="title"><?php _e('Project Client:', 'pure'); ?></span>
							<?php echo $pure_portfolio_client; ?> 
						<?php endif; ?>

						<?php
						// Copyright
						if ( !empty ( $pure_portfolio_copyright ) ): ?>
							<li><span class="title"><?php _e('Copyright:', 'pure'); ?></span>
							<?php echo $pure_portfolio_copyright; ?>
						<?php endif; ?>

						<?php
						// Project URL
						if ( !empty ( $pure_portfolio_url ) ): 

							// Get the Link URL
							$link_url = $pure_portfolio_url;
							// Set the link title to be either the set title, or if that's empty use the URL as title
							$link_title = (!empty($pure_portfolio_url_title)) ? $pure_portfolio_url_title : $pure_portfolio_url ;
						?>
							<li class="url"><span class="title"><?php _e('URL:', 'pure'); ?></span>
							<a target="_blank" rel="external nofollow" href="<?php echo $link_url;?>"><?php echo $link_title?></a>
						<?php endif; ?>

						
						<?php edit_post_link( __( 'Edit', 'pure' ), '<li> <span class="title edit-link">', '</span>' ); ?>

					</ul>
				</div><!-- .entry-info.details -->
			</aside> <!-- .side-info -->
		<?php endif; ?>

	</div> <!-- .container -->
	


</article><!-- #post-## -->
