<?php
//-----------------------------------*/
// Variables Used:
//-----------------------------------*/

$args = array();
$tabs = array();
$sections = array();

//-----------------------------------*/
// Helper Functions
//-----------------------------------*/
    
function get_pvc_blocks($args = null) {
	$args['post_type'] = 'pvc_block';	

	$pages = get_posts($args);
	$out[0] = "Disabled";
	foreach($pages as $page) {
		$out[$page->ID] = $page->post_title;
	}
	return $out;
}

// $args['dev_mode'] = true;

/**
 * <<< Theme Options: Begin >>>
 */

//-----------------------------------*/
// Tab: Home
//-----------------------------------*/
$sections[] = array(
	'title' => __( 'General Settings', 'puremellow' ),
	'icon_class' => 'icon-large',
	'icon' => 'el-icon-home',

	'fields' => array(
		/*---------------------------*/
		/*    Site Logo
		/*---------------------------*/
		array(
			'id' => "site_logo",
			'type' => 'media',
		),

		array(
			'id' => "responsive_logo",
			'description' => 'Logo used on Mobile Devices. If no image is uploaded, the "Site Logo" image is going to be used. ',
			'type' => 'media',
		),

		array(
			"id" => "masonry_width",
			'default' => "w2",
			'title' => "Default Masonry Width",
			'description' => 'Applies to Masonry in Blog and Portfolio',
			'type' => 'select',
			'options' => array(
				"w1" => "4 Columns",
				"w2" => "3 Columns",
				"w3" => "2 Columns",
				"w4" => "Full Width",
			),
		),
		array(
			"id" => "footer_vc_block",
			'default' => "",
			'title' => "Visual Composer Block to use in Footer",
			'type' => 'select',
			'options' => get_pvc_blocks()
		),		
	)
);

/*---------------------------*/
/*   Blog
/*---------------------------*/
$sections[] = array(
	'title' => 'Blog',
	'icon_class' => 'icon-large',
	'icon' => 'el-icon-edit',

	'fields' => array(

		array(
			"id" => "blog_layout",
			'default' => 'list',
			'type' => 'select',
			'options' => array(
				'masonry' => 'Masonry',
				'modern' => 'Modern Masonry',
				'list' => 'List',
				'classic' => 'Classic',
			),
		),

		array(
			"id" => "blog_meta",
			'type' => 'checkbox',
			'options' => array(
				 'content_header_categories' => "Show Categories in Post meta",
				 'content_header_tags' => 'Show Tags in Post meta',
				 'content_header_comment_count' => 'Show Comment Count in Post meta',
				 'content_header_post_author' => 'Show Author in Post meta',
			),
			'default' => array(
				'content_header_categories' => "1",
				'content_header_tags' => "1",
				'content_header_post_author' => "0",
				'content_header_comment_count' => "1",
			),
		),
	)
);
/*---------------------------*/
/*   Portfolio
/*---------------------------*/
$sections[] = array(
	'title' => 'Portfolio',
	'icon_class' => 'icon-large',
	'icon' => 'el-icon-picture',
	'fields' => array(	

		array(
			'id'=>'portfolio_url',
			'type' => 'select',
			'data' => 'pages',
			'title' => "Select Portfolio Page",
			'subtitle' => 'The page you select is going to be used for the "Show All" Button in Portfolio Filters',
			),

		array(
			"id" => "portfolio_layout",
			'title' => "Portfolio Style",
			'type' => 'select',
			'default' => 'masonry',
			'options' => array(
	               	'masonry' => 'Masonry',
	               	'modern' => 'Modern Masonry',
			),
		),

		array(
			"id" => "portfolio_filter_taxonomy",
			'default' => 'project-types',
			'title' => "Filter By",
			'type' => 'select',
			'options'  => array(
				'project-types' => 'Project Types',
				'skills' => 'Skills',
			),
		),	

	),

);

//-----------------------------------*/
// Tab: Sub Header
//-----------------------------------*/
$sections[] = array(
	'title'    => 'Page Sub Header',
	'icon' => 'el-icon-screen',
	'icon_class' => 'icon-large',
	'desc' => 'These are the default (fallback) settings for the Sub Header. You can edit these settings for each page and portfolio post separately.',
	'fields' => array(
		'sub_header' => array(
			'title' => 'Enable Page Sub-Header',
			'id'   => 'sub_header',
			'type' => 'select',
			'options' => array(
				'1' => 'Enable',
				'0' => 'Disable',
			)
		),

		'sub_header_font' => array(
			'title' => 'Font Preset',
			'id'   => 'sub_header_font',
			'type' => 'select',
			'options' => array(
				'light-font' => 'Light Font',
				'dark-font' => 'Dark Font'
			)
		),

		'sub_header_image' => array(
			'title' => 'Image to set as Background',
			'id'   => 'sub_header_image',
			'type' => 'media',
		),

		'sub_header_background_speed' => array(
			'title' => 'Background Parallax Settings',
			'id' => 'sub_header_background_speed',
			'type' => 'select',
			'options' => array(
				'false' => 'No Parallax',
				'0.05' => 'Really Slow',
				'0.25' => 'Pretty Slow',
				'0.85' => 'Regular',
				'1.25' => 'Pretty Fast',
				'1.5' => 'Really Fast',
			)
		),
		'sub_header_color' => array(
			'title' => 'Background Color',
			'id'   => 'sub_header_color',
			'type' => 'color',
			'validate' => 'color',
			'default' => '',
			'transparent' => false
		),
	)
);



//-----------------------------------*/
// Tab: Colors
//-----------------------------------*/

function tv_setup_theme_colors() {

	$config = Pure::get_file_contents( "colors.config.json" );
	$fields = array();

	if ( is_wp_error( $config ) ) { return false; }
	else { $config = json_decode( $config ); }

	foreach ( $config as $key => $value ) {
		$fields[] = array(
			'id' => $value->var,
			'default' => $value->color,
			'title' => $value->title,
			'validate' => 'color',
			'type' => 'color',
			'transparent' => false
		);
	}

	return $fields;
}

$color_fields = tv_setup_theme_colors();
if ( $color_fields ) {
	$sections[] = array(
		'title'    => 'Colors',
		'icon' => 'el-icon-eye-open',
		'icon_class' => 'icon-large',
		'fields' => $color_fields
	);
}

/*---------------------------*/
/*   Advanced Modification
/*---------------------------*/
$sections[] = array(
	'title' => 'Advanced Modification',
	'icon_class' => 'icon-large',
	'icon' => 'el-icon-fire',
	'fields' => array(	
		array(
			"id" => "logo_width",
			'subtitle' => 'Set a width of your logo in %. Note, that this is automatically going to calculate your Navigation Width as well.',
			'description' => 'Increasing the width is going to make the site fall into "responsive mode" earlier.',
			'type' => 'slider',
			"min" 		=> "10",
			"step"		=> "1",
			"max" 		=> "90",
			"default" => "33",

		),

		array(
			"id" => "custom_css",
			"title" => 'Custom CSS',
			'subtitle' => 'Quickly add some CSS the theme. Use with caution, only if you know what you are doing.',
			'type' => 'textarea',
			'validate' => 'css',
		),
	),

);




	/**
	 * <<< Theme Options: End >>>
	 */





	//-----------------------------------*/
	// Auto Import old theme panel settings!
	//-----------------------------------*/
	    
	$old_theme_mods = get_option( "theme_mods_" . Pure::$theme  );
	
	if( isset( $old_theme_mods[Pure::$key] ) && get_option( Pure::$key . "imported_theme_mods" ) !== "1" ) {
		$old_theme_options = $old_theme_mods[Pure::$key];
		update_option(Pure::$key . "imported_theme_mods", "1" );
		update_option(Pure::$key, $old_theme_options );
	} 
	


	//-----------------------------------*/
	// Setting Up Redux Framework:
	//-----------------------------------*/
	$theme_data = wp_get_theme();
	$args['display_name'] = $theme_data->get( 'Name' );
	$args['display_version'] = $theme_data->get( 'Version' );

	$args['share_icons']['twitter'] = array(
		'link' => 'http://twitter.com/Theme_Village',
		'title' => 'Follow us on Twitter',
		'img' => ReduxFramework::$_url . 'assets/img/social/Twitter.png'
	);

	// global $Theme_Village_Options;
	$args['opt_name'] = Pure::$key;
	$args['page_slug'] = 'positivus_options';
	$Theme_Village_Options = new ReduxFramework( TV_Parser::parse_sections( $sections ), $args, $tabs );

	remove_action( 'init', array( $Theme_Village_Options, "_tracking") , 3);


	
