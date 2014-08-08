<?php
class Pure_Portfolio {
	var $plugin_path;
	var $plugin_url;
	static $prefix;

	function __construct() {

		$this -> plugin_path = plugin_dir_path( __FILE__ );
		$this -> plugin_url = plugin_dir_url( __FILE__ );

		// Apply Filters and allow access to prefix from anywhere
		self::$prefix = apply_filters( "pure_portfolio_prefix", "pure_portfolio_" );

		// Setup the Plugin before Setting up the theme
		add_action( 'setup_theme', array( &$this, 'setup_post_type' ), 5 ); 						// Setup Portfolio Post Type
		add_action( 'setup_theme', array( &$this, 'setup_taxonomies' ), 5 ); 						// Setup Portfolio Taxonomies
		add_action( 'admin_enqueue_scripts', array( &$this, 'enqueue_scripts'), 5);					// Enqueue Admin Scripts needed


		if ( $this->has_metabox() === true ) {
			add_action( 'admin_init', array( &$this, 'setup_metabox' ) );							// Setup Portfolio Meta Boxes
		}	


	}

	/* -----------------------------------*/
	/* 		Include Script
	/* -----------------------------------*/
	public function enqueue_scripts( $hook ) {

		if ( $hook == 'post-new.php' || $hook == 'post.php' ) {
			global $post;

			if ( 'portfolio' == $post->post_type ) {
				wp_register_script( 'fitvids', $this -> plugin_url . "javascript/jquery.fitvids.js", $deps = array('jquery'), $in_footer = true );
				wp_enqueue_script( 'fitvids' );

				wp_register_script( 'admin-portfolio-scripts', $this -> plugin_url . "javascript/admin-portfolio.js", $deps = array('jquery', 'fitvids'), $in_footer = true );
				wp_enqueue_script( 'admin-portfolio-scripts' );
			}
		}
	}





	/* -----------------------------------*/
	/* 		Require RW Meta Box
	/* -----------------------------------*/
	public function has_metabox() {
		if ( ! class_exists( 'RW_Meta_Box' ) ) {
			add_action('admin_notices', array( &$this, 'missing_metabox_notice' ) );
			add_action('admin_init', array( &$this, 'ignore_missing_metabox_notice') );
			return false;
		} else {
			return true;
		}
	}




	public function missing_metabox_notice() {
			$current_user = wp_get_current_user();
			$user_id = $current_user->ID;
			/* Check that the user hasn't already clicked to ignore the message */
		if ( ! get_user_meta($user_id, 'example_ignore_notice') ) {
			echo '<div class="updated"><p>';
			printf(__('<a href="http://wordpress.org/plugins/meta-box/" target="_blank">Meta Box</a> Plugin is recommended for a better Portfolio Admin Interface | <a href="%1$s">Hide Notice</a>'), '?ignore_missing_metabox_notice=0');
			echo "</p></div>";
		}
	}

	public function ignore_missing_metabox_notice() {
			$current_user = wp_get_current_user();
			$user_id = $current_user->ID;
			/* If user clicks to ignore the notice, add that to their user meta */
			if ( isset($_GET['ignore_missing_metabox_notice']) && '0' == $_GET['ignore_missing_metabox_notice'] ) {
				 add_user_meta($user_id, 'example_ignore_notice', 'true', true);
		}
	}


	/* -----------------------------------*/
	/* 		Setup Post Type
	/* -----------------------------------*/
	public function setup_post_type() {

		$portfolio_slug = get_option("puremellow_portfolio_slug", true);

		if ($portfolio_slug === true) {
			$portfolio_rewrite = true;
		} else {
			$portfolio_rewrite = array( 'slug' => $portfolio_slug );
		}

		$labels = array(
			'name'                => _x( 'Entries', 'Post Type General Name', 'pure' ),
			'singular_name'       => _x( 'Entry', 'Post Type Singular Name', 'pure' ),
			'menu_name'           => __( 'Portfolio', 'pure' ),
			'parent_item_colon'   => __( 'Parent Entry', 'pure' ),
			'all_items'           => __( 'All Entries', 'pure' ),
			'view_item'           => __( 'View Entries', 'pure' ),
			'add_new_item'        => __( 'Add New Entry', 'pure' ),
			'add_new'             => __( 'New Entry', 'pure' ),
			'edit_item'           => __( 'Edit Entry', 'pure' ),
			'update_item'         => __( 'Update Entry', 'pure' ),
			'search_items'        => __( 'Search portfolio', 'pure' ),
			'not_found'           => __( 'No entries found', 'pure' ),
			'not_found_in_trash'  => __( 'No entries found in Trash', 'pure' ),
		);

		$args = array(
			'label'               => __( 'portfolio', 'pure' ),
			'description'         => __( 'Portfolio', 'pure' ),
			'labels'              => $labels,
			'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'custom-fields', ),
			'taxonomies'          => array( 'project-types', 'skills' ),
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => true,
			'show_in_admin_bar'   => true,
			'menu_position'       => 5,
			'menu_icon'           => plugins_url( "img/briefcase.png", __FILE__ ),
			'can_export'          => true,
			'has_archive'         => true,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
			'rewrite' => $portfolio_rewrite
		);

		register_post_type( 'portfolio', $args );
	}


	/* -----------------------------------*/
	/* 		Setup Taxonomy
	/* -----------------------------------*/
	function setup_taxonomies()  {
		$labels = array(
			'name'                       => _x( 'Project Types', 'Taxonomy General Name', 'pure' ),
			'singular_name'              => _x( 'Project Type', 'Taxonomy Singular Name', 'pure' ),
			'menu_name'                  => __( 'Project Types', 'pure' ),
			'all_items'                  => __( 'All Project Types', 'pure' ),
			'parent_item'                => __( 'Parent Project Type', 'pure' ),
			'parent_item_colon'          => __( 'Parent Project Type:', 'pure' ),
			'new_item_name'              => __( 'New Project Type Name', 'pure' ),
			'add_new_item'               => __( 'Add New Project Type', 'pure' ),
			'edit_item'                  => __( 'Edit Project Type', 'pure' ),
			'update_item'                => __( 'Update Project Type', 'pure' ),
			'separate_items_with_commas' => __( 'Separate project types with commas', 'pure' ),
			'search_items'               => __( 'Search project types', 'pure' ),
			'add_or_remove_items'        => __( 'Add or remove project types', 'pure' ),
			'choose_from_most_used'      => __( 'Choose from the most used project types', 'pure' ),
		);

		$args = array(
			'labels' 					 => $labels,
			'hierarchical'               => false,
			'public'                     => true,
			'show_ui'                    => true,
			'show_admin_column'          => true,
			'show_in_nav_menus'          => true,
			'show_tagcloud'              => true,
		);

		register_taxonomy( 'project-types', 'portfolio', $args );


		$labels = array(
			'name'                       => _x( 'Skills', 'Taxonomy General Name', 'pure' ),
			'singular_name'              => _x( 'Skill', 'Taxonomy Singular Name', 'pure' ),
			'menu_name'                  => __( 'Skills', 'pure' ),
			'all_items'                  => __( 'All Skills', 'pure' ),
			'parent_item'                => __( 'Parent Skill', 'pure' ),
			'parent_item_colon'          => __( 'Parent Skill:', 'pure' ),
			'new_item_name'              => __( 'New Skill Name', 'pure' ),
			'add_new_item'               => __( 'Add New Skill', 'pure' ),
			'edit_item'                  => __( 'Edit Skill', 'pure' ),
			'update_item'                => __( 'Update Skill', 'pure' ),
			'separate_items_with_commas' => __( 'Separate skills with commas', 'pure' ),
			'search_items'               => __( 'Search skills', 'pure' ),
			'add_or_remove_items'        => __( 'Add or remove skills', 'pure' ),
			'choose_from_most_used'      => __( 'Choose from the most used skills', 'pure' ),
		);


		$args = array(
			'labels' 					 => $labels,
			'hierarchical'               => false,
			'public'                     => true,
			'show_ui'                    => true,
			'show_admin_column'          => true,
			'show_in_nav_menus'          => true,
			'show_tagcloud'              => true,
		);

		register_taxonomy( 'skills', 'portfolio', $args );

	}

	/* -----------------------------------*/
	/* 		Setup Meta Box
	/* -----------------------------------*/
	public function setup_metabox() {
		$meta_box = array(
			'id' => 'pure-portfolio-details',
			'title'    => 'Project Details',
			'pages' => array('portfolio'),
			'context'  => 'side',
			'priority' => 'low',

			'fields' => array(

				array(
					'name' => 'Project Date',
					'id'   => self::$prefix . 'project_date',
					'type' => 'text',
				),

				array(
					'name' => 'Client',
					'id'   => self::$prefix . 'client',
					'type' => 'text',
				),

				array(
					'name' => 'Copyright',
					'id'   => self::$prefix . 'copyright',
					'type' => 'text',
				),

				array(
					'name' => 'Link Title',
					'id'   => self::$prefix . 'url_title',
					'type' => 'text',
				),

				array(
					'name' => 'Link',
					'id'   => self::$prefix . 'url',
					'type' => 'text',
				),
			)
		);

		$portfolio_content = array(
		   'id' => 'pure-portfolio-content',
		   'title' => 'Project Media',
		   'pages' => array('portfolio'),
		   'priority' => 'high',

		   'fields' => array(
							array(
								'name' => 'Images',
								'id'   => self::$prefix . 'project_images',
								'type' => 'image_advanced',
								'max_file_uploads'  => 20,
							),

							array(
								'name' => 'Embed',
								'id'   => self::$prefix . 'project_embed',
								'type' => 'oembed',
							),
						),

		);

		new RW_Meta_Box( $meta_box );
		new RW_Meta_Box( $portfolio_content );
	}

	public static function get_image_ids( $post_id = false ) {

		if ( false === $post_id) {
			$post_id = get_the_ID();
		}

		$images = get_post_meta($post_id, self::$prefix . "project_images", false);
		return (array) $images;

	}


	public static function get_image_sizes( $attachment_id, $sizes ) {
		$return = array();

		foreach( (array) $sizes as $size) {
			$image = wp_get_attachment_image_src( $attachment_id, $size );
			$return[$size] =  array_shift( $image );
		}

		return $return;
	}


	public static function get_images( $post_id = false, $sizes = "thumbnail") {

		// Make sure we have a $post_id
		if ( false === $post_id) {
			$post_id = get_the_ID();
		}

		// Get Image Ids
		$image_ids = (array) self::get_image_ids( $post_id );

		// Prepare Results
		$results = array();

		if ( !empty( $image_ids ) ) {
			foreach ($image_ids as $image_ID) {
				$results[] = self::get_image_sizes($image_ID, $sizes);
			}
		}

		// Return Results if there are any
		if ( count($results) > 0 ) {
			return $results;
		}

		/* -----------------------------------*/
		/*  Fallback.
		/*  This only is executed if no $results were returned
		/* -----------------------------------*/
		$fallback_value = apply_filters( self::$prefix . "project_images_fallback", array() );

		// If Fallback value is set to false (via filter), don't bother getting the thumbnail
		if ( !empty( $fallback_value ) || ( false !== $fallback_value && true === has_post_thumbnail() ) ) {

				return array( self::get_image_sizes( get_post_thumbnail_id(), $sizes) );

		}
		// Either $fallback_value === false or has_post_thumbnail() === false
		else {
			return $fallback_value;
		}

	}

	public static function get_embed( $post_id = false ) {

		// Make sure we have a $post_id
		if ( false === $post_id) {
			$post_id = get_the_ID();
		}

		$embed = get_post_meta($post_id, self::$prefix . "project_embed", true);

		if ( empty( $embed ) ) {
			return false;
		} else {
			return $embed;
		}


	}

}









