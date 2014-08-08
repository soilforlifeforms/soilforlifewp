<?php

function pure_modify_page_metabox( $metabox_options ) {
	$prefix = Pure::$key;

	// Where the Plugins are located
	$aq_page_builder = "aqua-page-builder/aq-page-builder.php";

	// Are the plugins active
	$aq_active = is_plugin_active( $aq_page_builder );



	//-----------------------------------*/
	// Visual Composer Meta Add-On
	// This is going to be moved to metabox_options
	// @todo Remove Aqua Page Builder, Replace Meta with this
	//-----------------------------------*/
	    
	// Basic Description
	$meta_description = 'Create a new Block in "Pure Blocks" and select it here to display as header';

	// Additional Description if Aqua Page Builder is active
	if ( $aq_active ) {
		$meta_description .= '<br>Be careful. If "Header Content" is not going to be empty, that is going to be used instead. If you\'re not using the Aqua Page Builder anymore - please deactivate the plugin. ';
	}

	$pvc_blocks = array("" => "") + RWMB_Post_Field::get_options(
					array( 
					'query_args' => array(
						'post_type'      => 'pvc_block',
						'post_status'    => 'publish',
						'posts_per_page' => '-1'
						)
					));


	// Added Meta
	$VC_Options = array(
		'page_header_pvc_block' => array(
			'name' => 'Select a Block to Display',
			'desc' => $meta_description,
			'id'   => $prefix . 'page_header_pvc_block',
			'type' => 'select',
			'options' => $pvc_blocks,
		)
	);

	

	

	// Add Meta on Top
	$new_fields = array_merge( $VC_Options, $metabox_options['fields'] );
	$metabox_options['fields'] = $new_fields;


	// If Visual Composer is active and Aqua Page Builder isn't
	if ( ! $aq_active ) {
		unset( $metabox_options['fields']['page_header_content'] );
	}

	// Return
	return $metabox_options;
}
add_filter( 'pure_rw_page_meta', 'pure_modify_page_metabox' );

?>
