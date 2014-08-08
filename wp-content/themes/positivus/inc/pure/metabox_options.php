<?php
/* -----------------------------------*/
/* 		Add Meta Boxes
/* -----------------------------------*/
function add_metaboxes()
{

	 // global $meta_boxes;
	if ( !class_exists( 'RW_Meta_Box' ) )
	return;
	
	$prefix = Pure::$key;
	
	$masonry_meta = array(
		'id' => 'pure-post-masonry-options',
		'title'    => 'Post Height / Width',
		'pages' => array('post', 'portfolio'),
		'context'  => 'side',
		'priority' => 'high',

		'fields' => array(
			array(
				'name' => 'Height',
				'id'   => $prefix . 'post_height',
				'type' => 'select',
				'options' => array(
								   'h1' => '1',
								   'h2' => '2',
								   'h3' => '3',
								   'h4' => '4',
				),
			),
		)
	);


	$post_meta = array(
		'id' => 'pure-post-color-options',
		'title'    => 'Post Color Options',
		'pages' => array('post', 'portfolio'),
		'context'  => 'side',
		'priority' => 'high',

		'fields' => array(
			'post_color' => array(
				'name' => 'Post Color',
				'id'   => $prefix . 'post_color',
				'type' => 'color',
			),

			'post_alt_color' => array(
				'name' => 'Post Alt Color',
				'id'   => $prefix . 'post_alt_color',
				'type' => 'color',
			),
		)
	);

	$page_meta = array(
		'id' => 'pure-page-header-options',
		'title'    => 'Page Header Options',
		'pages' => array('page'),
		'priority' => 'high',

		'fields' => array(
			'page_header_content' => array(
				'name' => 'Header Content',
				'id'   => $prefix . 'page_header_content',
				'type' => 'textarea',
			),
			
			'page_header_height' => array(
				'name' => 'Custom Header Height',
				'desc' => 'Set a Height of this header block',
				'id'   => $prefix . 'page_header_height',
				'type' => 'number',
			),
			
			'page_header_auto_resize' => array(
				'name' => 'Auto Resize Headder ?',
				'desc' => 'If enabled, the custom height option isn\'t going to work',
				'id'   => $prefix . 'page_header_auto_resize',
				'type' => 'checkbox',
			),

			'page_header_image' => array(
				'name' => 'Background Image',
				'id'   => $prefix . 'page_header_image',
				'type' => 'plupload_image',
			),

			'page_header_background_color' => array(
				'name' => 'Header Background Color',
				'id'   => $prefix . 'page_header_background_color',
				'type' => 'color',
			),


			'page_header_parallax_speed' => array(
				'name' => 'Header Background Parallax Effect Speed',
				'id'   => $prefix . 'page_header_parallax_speed',
				'type' => 'select',
				'options' => array(
								   'false' => 'Disable Parallax',
									'0.05' => 'Really Slow',
									'0.25' => 'Pretty Slow',
									'0.85' => 'Regular',
									'1.25' => 'Pretty Fast',
									'1.5' => 'Really Fast',
				),
			),

			'page_header_image_opacity' => array(
				'name' => 'Background Image Opacity',
				'id'   => $prefix . 'page_header_image_opacity',
				'type' => 'number',
				'std' => 100,
			),

			'page_header_image_duration' => array(
				'name' => 'Background Image Slide Duration',
				'id'   => $prefix . 'page_header_image_duration',
				'type' => 'text',
				'std' => 3.5,
			),

		)
	);


	$sub_meta = array(
		'id' => 'pure-page-sub-header-options',
		'title'    => 'Page Sub Header',
		'pages' => array('page'),
		'priority' => 'high',

		'fields' => array(

			'sub_header' => array(
				'name' => 'Enable Page Sub-Header',
				'id'   => $prefix . 'sub_header',
				'type' => 'select',
				'std' => 'default',
				'options' => array(
                   'default' => 'Default',
				   'true' => 'Enable',
				   'false' => 'Disable',
				   )
			),


			'sub_header_title' => array(
				'name' => 'Title',
				'id'   => $prefix . 'sub_header_title',
				'type' => 'text',
			),

			'sub_header_content' => array(
				'name' => 'Sub-Title',
				'id'   => $prefix . 'sub_header_content',
				'type' => 'wysiwyg',
			),


			'sub_header_font' => array(
				'name' => 'Font Preset',
				'id'   => $prefix . 'sub_header_font',
				'type' => 'select',
				'std' => 'default',
				'options' => array(
                   'default' => 'Default',
				   'light-font' => 'Light Font',
				   'darkf-font' => 'Dark Font'
				   )
			),

			'sub_header_image' => array(
				'name' => 'Image to set s Background',
				'id'   => $prefix . 'sub_header_image',
				'type' => 'plupload_image',
			),

			'sub_header_background_style' => array(
				'name' => 'Background Style',
				'id' => $prefix . 'sub_header_background_style',
				'type' => 'select',
				'std' => 'default',
				'options' => array(
                   'default' => 'Default',
					'regular' => 'Regular',
					'static' => 'Static',
				)
			),
			'sub_header_color' => array(
				'name' => 'Background Color',
				'id'   => $prefix . 'sub_header_color',
				'type' => 'color',
			),
		)
	);

	if ( Pure::is_enabled( "dynamic_widths", true )){
		new RW_Meta_Box( $masonry_meta );
	}

	new RW_Meta_Box( apply_filters( 'pure_rw_sub_meta', $sub_meta ) );
	new RW_Meta_Box( apply_filters( 'pure_rw_post_meta', $post_meta ) );
	new RW_Meta_Box( apply_filters( 'pure_rw_page_meta', $page_meta ) );


}


add_action( 'admin_init', 'add_metaboxes' );