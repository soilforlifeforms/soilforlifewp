<?php
// Require Once, Require in the main template directory
$template_directory = get_template_directory();
// Pure Helpers, etc.
require_once $template_directory . '/inc/pure/core.php';

if ( is_admin() ) {
	if ( !class_exists( 'ReduxFramework' ) && file_exists( $template_directory . '/inc/options-panel/ReduxCore/framework.php' ) ) {
		require_once $template_directory . '/inc/options-panel/ReduxCore/framework.php';
	}
	if ( class_exists('ReduxFramework') && !isset( $redux_demo ) && file_exists( $template_directory . '/inc/options.php' ) ) {
		require_once $template_directory . '/inc/TV_Parser.php';
		require_once $template_directory . '/inc/options.php';
	}
}

//-----------------------------------*/
// Remove Redux Demo Mode
//-----------------------------------*/
    
if( ! function_exists('village_remove_redux_demo') ) {
	
	function village_remove_redux_demo() { // Be sure to rename this function to something more unique
	    if ( class_exists('ReduxFrameworkPlugin') ) {
	        remove_filter( 'plugin_row_meta', array( ReduxFrameworkPlugin::get_instance(), 'plugin_metalinks'), null, 2 );
	    }
	    if ( class_exists('ReduxFrameworkPlugin') ) {
	        remove_action('admin_notices', array( ReduxFrameworkPlugin::get_instance(), 'admin_notices' ) );    
	    }
	}
	add_action('init', 'village_remove_redux_demo');
}


// Helpers, Modifications
require_once $template_directory . '/inc/template-tags.php';



/* -----------------------------------*/
/* 	    Enqueue Scripts and Styles
/* -----------------------------------*/
if ( !function_exists( "pure_scripts" ) ) {
	function pure_scripts() {
		$protocol = ( is_ssl() ) ? "https" : "http";
		$color_scheme = Pure::get_theme_mod( "color_scheme", "blue" );


		/* -----------------------------------*/
		/* 		Register / Deregister
		/* -----------------------------------*/
		// We're fetching our own style
		wp_register_style( 'style', get_template_directory_uri() . '/css/app.css' );
		wp_register_style( 'icons-style', get_template_directory_uri() . '/css/icons/icons.css' );

		// Google Fonts
		// wp_register_style( 'google-fonts', $protocol . '://fonts.googleapis.com/css?family=Raleway:200,600,700,800|Open+Sans:400,300,700,600' );
		wp_register_style( 'google-fonts', $protocol . '://fonts.googleapis.com/css?family=Raleway:200,600,700,900,100,300,400,500,800|Open+Sans:400,300,700,600,800' );

		// Social Icons
		// wp_register_style( 'pure-social-icons', get_template_directory_uri() . '/social.css');
		wp_dequeue_style( 'zilla-likes' );

		/* -----------------------------------*/
		/* 		Enqueue
		/* -----------------------------------*/
		wp_enqueue_style( 'style' );
		wp_enqueue_style( 'icons-style' );
		wp_enqueue_style( 'google-fonts' );

		// All compressed libraries in /js/libs/*
		wp_enqueue_script(
			'compressed-libs',
			get_template_directory_uri() . '/js/libs.js',
			array( 'jquery' ),
			null,
			true // In Footer ?
		);

		// Main JavaScript file (Compressed coffeescript from /js/coffee/* )
		wp_enqueue_script(
			'app',
			get_template_directory_uri() . '/js/app.js',
			array( 'jquery', 'underscore' ),
			null,
			true // In Footer ?
		);
		wp_localize_script( 'app', "LANG", array(
				'comment_failure' => __( '
												   <div class="error">
														Please fill all the required fields!
												   </div>
						   ', 'pure' ),
				'show_all' => __( 'Show All', 'pure' ),
			) );

		if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
			wp_enqueue_script( 'comment-reply' , $in_footer = true );
		}

		if ( is_single() ) {
			wp_enqueue_script( 'post_colors',
				get_template_directory_uri() . '/js/post_colors.js',
				array( 'jquery' ),
				null,
				true // In Footer ?
			);
		}

		// if ( ! is_admin() ) {
		//  wp_dequeue_style( 'tipsy-social-icons' );
		//  wp_enqueue_style( 'pure-social-icons' );
		// }
	}
}

if ( !function_exists( 'pure_scripts_child' ) ){
	function pure_scripts_child() {
		wp_register_style( 'child-style', get_stylesheet_directory_uri() . '/style.css' );
		wp_enqueue_style( 'child-style' );		
	}

	if ( is_child_theme() ) {
		add_action( 'wp_enqueue_scripts', 'pure_scripts_child', 1001 );
	}
}



//-----------------------------------*/
// Thumbnail Sizes
//-----------------------------------*/
if ( ! isset( $content_width ) ) {
	$content_width = 1080; /* pixels */
}

$base_size = $content_width / 4; //px

$widths = range( 1, 3 );
$heights = range( 1, 4 );

foreach ( $widths as $w ) {
	$width = $base_size * $w;

	foreach ( $heights as $h ) {

		$height = ( $base_size * $h ) / 1.6;
		add_image_size( "boxed_thumbnail_w{$w}h{$h}", ceil( $width ), ceil( $height ), true );
	}
}

add_image_size( 'pure_mini', 100, 100, true );
add_image_size( 'pure_medium', 750, 750, false );
add_image_size( 'pure_classic', 1080, 300, true );
add_image_size( 'pure_large', 780, 780, true );
add_image_size( 'pure_portfolio', 780, 780, true );

/* -----------------------------------------------*/
/* 		In case sanitize_hex_color doesn't exist
/* -----------------------------------------------*/
if ( ! function_exists( "sanitize_hex_color" ) ) {
	function sanitize_hex_color( $color ) {
		if ( '' === $color )
			return '';

		// 3 or 6 hex digits, or the empty string.
		if ( preg_match( '|^#([A-Fa-f0-9]{3}){1,2}$|', $color ) )
			return $color;

		return null;
	}
}


/* -----------------------------------------------*/
/* 		Enable Shortcodes in Text Widgets
/* -----------------------------------------------*/
add_filter( 'widget_text', 'do_shortcode' );



//-----------------------------------*/
// Add Theme Support
//-----------------------------------*/
add_theme_support( 'custom-background' );



/* -----------------------------------*/
/*  Enable Legacy Portfolio Compitability
/* -----------------------------------*/
add_filter( "pure_portfolio_legacy_support", "__return_true" );




function custom_css_classes_for_vc_row_and_vc_column( $class_string, $tag ) {
	if ( $tag == 'vc_row' ) {
		return "vc_row wrapper ";
	}
	if ( $tag=='vc_column' || $tag=='vc_column_inner' ) {

		$column_size = intval( preg_replace( '/[^0-9]/', '', $class_string ) );

		if ( $column_size > 0 && $column_size <= 12 ) {
			return "g " . Pure_Shortcode_Abstract::$size_words[$column_size];
		}

	}
	return $class_string;
}
// Filter to Replace default css class for vc_row shortcode and vc_column
add_filter( 'vc_shortcodes_css_class', 'custom_css_classes_for_vc_row_and_vc_column', 10, 2 );




// Display if a main menu isn't defined. Called from header.php
function village_menu_fallback_function() {
	echo '<span class="no-menu">You haven\'t defined a Primary Menu yet. Time to open up <em>"Dashboard &rarr; Appearance &rarr; Menus"</em> and set up a menu!</span>';
}