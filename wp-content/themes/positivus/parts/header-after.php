<?php 

$sub_header = array();

//-----------------------------------*/
// Background
//-----------------------------------*/
$background_image = Pure::get_theme_mod("sub_header_image", null);

// Global Portfolio Background Image
if ( is_tax("project-types") || is_tax("skills") ) {
	
	$portfolio_page_id = Pure::get_theme_mod("portfolio_url", false);
	if( $portfolio_page_id && Pure::is_enabled("portfolio_global_header", true) ){

		$portfolio_header_background = get_post_meta( $portfolio_page_id, Pure::$key . "sub_header_image", true);
		if ( $portfolio_header_background ){
			$background_image = $portfolio_header_background;
		}
	}
}



# Check if that's an ID
if ( is_numeric( $background_image ) ) {
	$background_image = wp_get_attachment_url( $background_image );
}

if ( is_array( $background_image ) ) {
	$background_image = $background_image['url'];
}

# Add background image to the sub-header style
if ( !empty( $background_image ) ) {
	$sub_header['style']['background-image'] = "url('" . ( $background_image ) . "')";
}

// A shorthanded assignment, but it would just take too much space to type that out. Pure::get_post_meta("meta_to_get", "fallback")
$sub_header['style']['background-color'] = Pure::get_post_meta("sub_header_color", Pure::get_theme_mod("brand_color", null) );
$sub_header['class'][] = Pure::get_theme_mod("sub_header_font", "light-font");

// Parallax 
$parallax_speed = Pure::get_post_meta("sub_header_background_speed", "0.85");
if ( $parallax_speed ) {
	$sub_header['data']['stellar-background-ratio'] = (string) $parallax_speed;
	// $sub_header['data']['stellar-offset-parent'] = "true";
}

$title 	 = 	Pure::get_post_meta("sub_header_title", false);
$content = 	Pure::get_post_meta("sub_header_content", false);

?>
<section id="header-sub"<?php Pure::render_attributes( $sub_header ); ?>>
	<div class="cell">
			<h1 class="page-title">
			<?php
				// Echo the Custom Title
				if ( $title !== false ) {
					echo $title;
				} 
				else {
					get_template_part("parts/header/title"); 
				}
			?>
			</h1>
			<?php if ( $content !== false ): ?>
				<div class="sub-header-content"><?php echo do_shortcode( $content ); ?></div>
			<?php endif; ?>	
	</div>
</section>