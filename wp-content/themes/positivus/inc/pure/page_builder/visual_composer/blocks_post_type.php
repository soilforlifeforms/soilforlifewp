<?php
if ( ! function_exists( 'create_pvc_blocks' ) ) {
	// Register Custom Post Type
	function create_pvc_blocks() {

		$labels = array(
			'name'                => _x( 'VC Blocks', 'Post Type General Name', 'pure' ),
			'singular_name'       => _x( 'VC Block', 'Post Type Singular Name', 'pure' ),
			'menu_name'           => __( 'VC Blocks', 'pure' ),
			'parent_item_colon'   => __( 'Parent Block', 'pure' ),
			'all_items'           => __( 'All Blocks', 'pure' ),
			'view_item'           => __( 'View Block', 'pure' ),
			'add_new_item'        => __( 'Add new Block', 'pure' ),
			'add_new'             => __( 'New Block', 'pure' ),
			'edit_item'           => __( 'Edit Block', 'pure' ),
			'update_item'         => __( 'Update Block', 'pure' ),
			'search_items'        => __( 'Search Blocks', 'pure' ),
			'not_found'           => __( 'No Blocks Found', 'pure' ),
			'not_found_in_trash'  => __( 'No Blocks in Trash', 'pure' ),
		);
		$args = array(
			'label'               => __( 'pvc_block', 'pure' ),
			'description'         => __( 'Visual Composer Block Templates', 'pure' ),
			'labels'              => $labels,
			'supports'            => array( 'title', 'editor', 'revisions', 'custom-fields', ),
			'hierarchical'        => true,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => false,
			'show_in_admin_bar'   => false,
			'menu_position'       => 20,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => true,
			'rewrite'             => false,
			'capability_type'     => 'page',
		);
		register_post_type( 'pvc_block', $args );

	}

	// Hook into the 'init' action
	add_action( 'init', 'create_pvc_blocks', 0 );



	/* -----------------------------------*/
	/* 		On Page Update - Update the Meta
	/* -----------------------------------*/
	function pvc_on_page_update( $post_id ) {
		// Perform this only on Pages
		if ( 'page' !== get_post_type( $post_id ) ) {
			return;
		}

		// Set the Keys
		$pvc_key = Pure::$key . 'page_header_pvc_block';
		$pvc_cached = $pvc_key . "_cached";
		$pvc_block_id = get_post_meta( $post_id, $pvc_key, false );

		// Make sure there is a block and it has an ID
		if ( ! $pvc_block_id ) {
			delete_post_meta( $post_id, $pvc_cached );
			return;
		}


		// Make sure there is only a single $pvc_block_id
		// If there are more, select the first, delete the rest
		if ( is_array( $pvc_block_id ) ) {
			$pvc_block_id = $pvc_block_id[0];
			delete_post_meta( $post_id, $pvc_key );
			update_post_meta( $post_id, $pvc_key, $pvc_block_id );
		}


		// Make sure the pvc_block_id is an ID (is numeric)
		if ( is_numeric( $pvc_block_id ) ) {
			$block_content = get_post_field( 'post_content', $pvc_block_id );

			if ( ! is_wp_error( $block_content ) && ! empty( $block_content ) ) {
				update_post_meta( $post_id, $pvc_cached, $block_content );
			}
		}
	}

	add_action( 'save_post', 'pvc_on_page_update', 50 );

}























?>
