<?php
global $wp_customize;

$theme_dir = get_template_directory();
$theme_url = get_template_directory_uri();

$pure_dir = $theme_dir . '/inc/pure';
$pure_url = $theme_url . '/inc/pure';

/* -----------------------------------*/
/* 		Load Pure Core Class
/* -----------------------------------*/
require_once $pure_dir . '/wordpress-helpers.php';
require_once $pure_dir . '/Pure.class.php';
require_once $pure_dir . '/color_options/generate_colors.php';

// Initialize Pure Class
Pure::init();




/* -----------------------------------*/
/* 		Actions:
/* -----------------------------------*/
add_action( 'after_setup_theme', array( 'Pure', 'setup' ) );
add_action( 'wp_enqueue_scripts', 'pure_scripts', 1000 );

add_action( 'wp_head', 'pure_cc_generate_css' );


/* -----------------------------------*/
/* 		Filters
/* -----------------------------------*/
add_filter( 'body_class', array( 'Pure', 'maybe_enable_sidebar' ) );
// add_filter( 'pure_print_items', 'pure_print_items', 10, 2);

remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );



/* -----------------------------------*/
/* 		Dashboard
/* -----------------------------------*/
// This Conditional Tag checks if the Dashboard or the administration panel is attempting to be displayed.
if ( is_admin() ) {

	// Load / Require Plugins if current user can activate them
	if ( current_user_can( 'activate_plugins' ) ) {
		require_once $pure_dir . '/init_plugins/initialize_plugins.php';
	}

	// Don't load customizer when it's not needed.
	if (  current_user_can( 'edit_theme_options' ) ) {
		if ( class_exists( "RW_Meta_Box" ) ) {
			require_once $pure_dir . "/metabox_options.php";
		}
		if ( isset ( $wp_customize ) ) {
			add_action( 'customize_register' , array( 'Pure_Customizer' , 'register_options' ) );
		}
	}

}


/*
 * Initialize Visual Composer
 * @todo Add Child Theme Compatibility. Check for some class that's defined in the theme.
 */
if ( class_exists( 'WPBakeryVisualComposerAbstract' ) ) {

	// Setup Directories
	$VC_Dir = $pure_dir . '/page_builder/visual_composer/';
	$VC_Plugin_Dir = $VC_Dir . 'js_composer/';
	$VC_Blocks_Dir = $VC_Dir . 'blocks/';

	if(function_exists('vc_set_as_theme')) vc_set_as_theme();
	if(function_exists('vc_disable_frontend')) vc_disable_frontend();

	if ( ! in_array( 'pvc_block', get_option('wpb_js_content_types') ) ) {
		update_option( 'wpb_js_content_types', array('page', 'pvc_block') );
	}

	if ( is_admin() ) {
		
		function enqueue_positivus_admin( $VC_Dir ) {
			$style = get_template_directory_uri() . "/inc/pure/page_builder/visual_composer/admin/style.css";
			wp_enqueue_style('positivus-vc-admin', $style);
		}
		$pure_vc_global_dir = $VC_Dir;

		add_action( 'admin_print_styles', 'enqueue_positivus_admin' );

		require_once $VC_Dir . 'blocks_post_type.php';
		require_once $VC_Dir . 'blocks_meta.php';
	}

	// Include Visual Composer Blocks
	require_once $VC_Blocks_Dir. 'Abstract_Shortcode.php';
	require_once $VC_Blocks_Dir. 'Container.php';
	require_once $VC_Blocks_Dir. 'Animated_Content.php';
	require_once $VC_Blocks_Dir. 'Media_With_Text.php';
	require_once $VC_Blocks_Dir. 'Call_To_Action.php';
	require_once $VC_Blocks_Dir. 'Pricing_Table.php';
	require_once $VC_Blocks_Dir. 'Footer_Separator.php';

	require_once $VC_Blocks_Dir. 'List_Posts.php';
	require_once $VC_Blocks_Dir. 'List_Portfolio.php';

}
