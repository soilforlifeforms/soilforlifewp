<?php 
//-----------------------------------*/
// Define Vars
//-----------------------------------*/
    
$parent = array();
$parent['style'] = array();
$parent['class'] = array();

$child = array();
$child['class'] = array("page-header__background");
$child['style'] = array();


$images = array();

//-----------------------------------*/
// Fetch Meta Data
//-----------------------------------*/
    
$vc_block = Pure::get_post_meta('page_header_pvc_block_cached', false);

if( $vc_block ) {
	$content = $vc_block;
} else {
	$content = Pure::get_post_meta('page_header_content');	
}



$background_color = Pure::get_post_meta('page_header_background_color');

$block_height = Pure::get_post_meta('page_header_height');
$auto_resize = Pure::get_post_meta('page_header_auto_resize');

$parallax_speed = floatval( Pure::get_post_meta("page_header_parallax_speed", 1) );

$background_images = Pure::get_post_meta('page_header_image', $default = false, $single = false);


//-----------------------------------*/
// Logic
//-----------------------------------*/
    
# Parent
	if ( $background_color ) {
		$parent['style']['background-color'] = sanitize_hex_color($background_color);
	}
	if ( $block_height ) {
		$parent['style']['height'] = filter_var($block_height, FILTER_SANITIZE_NUMBER_INT) . 'px';
	}

	if ( $auto_resize === "1" ) {
		$parent['class'] = "js__resize";
	}

# Child
if ( $background_images ) {
	foreach ( $background_images as $image_id ) {
		
		$image = wp_get_attachment_url( $image_id );
		
		if ( is_string( $image ) ) {
			$images[] = $image;
		}
		
	}

	$image_opacity = Pure::get_post_meta('page_header_image_opacity', 100 ) / 100;
	$image_duration = Pure::get_post_meta('page_header_image_duration', 3.5 ) * 1000;

	if( count( $images ) > 1 ) {
		$child['class'][] = "js__gallery_backstretch";
	} else {
		$child['class'][] = "js__backstretch";
		$child['class'][] = "backstretch";
		$child['style']['background-image'] = "url('$images[0]')";
	}

	if ( $image_opacity ) {
		$child['style']['opacity'] = $image_opacity;
	}

	if ( $parallax_speed == 1 ){
		$parallax_speed = 0.01;
	}


}

?>


<?php 
//-----------------------------------*/
// Output:
//-----------------------------------*/
?>
<div id="header-block"<?php Pure::render_style($parent['style']); Pure::render_class($parent['class']); ?>>

<?php if ( $background_images ): ?>
	
	<!-- <div class="page-header-background-container"> -->
	 <div id="page-header-background"<?php
	 	Pure::render_class($child['class']);
	 	Pure::render_style($child['style']);


		if ( $background_images ) {
			Pure::render_data('images', $images);
			Pure::render_data('duration', $image_duration);
		}
	  ?><?php
			if ( !empty( $parallax_speed ) ) {
				Pure::render_data('stellar-ratio', $parallax_speed);
				Pure::render_data('stellar-vertical-offset', 1);
			}
	?>></div>
	  <!-- </div> -->

<?php endif; ?>
	<?php echo do_shortcode( $content ) ?> 
</div>







