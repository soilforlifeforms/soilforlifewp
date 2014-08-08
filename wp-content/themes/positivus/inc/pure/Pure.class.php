<?php

class Pure {
	static $theme;
	static $theme_options_key;
	static $key;
	static $options = false;


	/**
	 * Initialize the Pure Static class variables. If this isn't happening, nothing is.
	 */
	public static function init() {
		self::$theme = sanitize_title( strtolower( get_stylesheet() ) );
		self::$theme_options_key = '_options_';
		self::$key = apply_filters( 'pure_theme_key', self::$theme . self::$theme_options_key );
	}

	/**
	 * Get the key for a particular option
	 *
	 * @param (string) $option Which option do you need the keys for ?
	 * @return (string) The option key or (bool) false
	 */
	public static function get_key( $option = false ) {
		if ( $option ) {
			return self::$key . "[$option]";
		} else {
			return false;
		}
	}

	/**
	 * Get Current Post Terms
	 *
	 * @param string  $term          Taxonomy from which to get the terms from
	 * @param boolean $stringify     Should return as a string ?
	 * @param string  $get_term_part Which part of the Taxonomy to return ? Default to the name (could be slug for example)
	 * @return (mixed)                (string) or (array), deppending on $stringify
	 */
	public static function post_terms( $term, $stringify = false, $get_term_part = "name" ) {
		global $post;

		$terms_obj = wp_get_object_terms( $post->ID, $term );

		// $terms_obj has to be truthy and shouldn't be a WP_Error
		if ( $terms_obj && !is_wp_error( $terms_obj ) ) {

			foreach ( $terms_obj as $term ) {
				$terms[] = $term->$get_term_part;
			}

			// If we have to stringify the term part
			if ( $stringify || $stringify == null ) {
				// Use Stringify as the glue, if it isn't a bool
				$glue = ( is_string( $stringify ) ) ? $stringify : ', ';
				return implode( $glue, $terms );

			} else {
				// Or return an array of $terms
				return $terms;
			}
		}

	}


	/**
	 *  Get
	 *
	 * @param (string) $taxonomy - The taxonomy slug, for example 'category' or 'skills'
	 * @return (string) All Post Links or (bool) false
	 */
	function post_term_slugs( $taxonomy ) {
		global $post;

		$terms = get_the_terms( $post->ID, $taxonomy );

		if ( $terms && ! is_wp_error( $terms ) ) {

			$links = array();

			foreach ( $terms as $term ) {
				$links[] = "$taxonomy-".$term->slug;
			}
			return join( " ", $links );
		}

		return false;
	}



	/**
	 * Alias for native get_theme_mod(Pure::get_key('some_option'));
	 *
	 * @param (string) $option to et
	 * @return (mixed)  Option returned
	 */
	public static function get_theme_mod( $option, $default = false ) {
		// Get the options, if they aren't here yet
		global $wp_customize;

		if ( self::$options === false || isset( $wp_customize ) ) {
			self::$options = get_option( self::$key );
		}

		if ( ( in_the_loop() || is_singular() ) ) {
			$meta_value = self::get_post_meta( $option, "" );
			if ( $meta_value !== "" && $meta_value !== null ) {
				return self::maybe_override( $option, $meta_value );
			}
		}

		// Check if this option is set
		if ( isset( self::$options[$option] ) ) {
			return self::maybe_override( $option, self::$options[$option] );
		}



		// If this option is not set, return the default value
		return self::maybe_override( $option, $default );


	}


	public static function get_template_part( $slug, $name = false ) {
		$name = $name || get_post_format_or_type();
		get_template_part( "/parts/$slug" , $name );
	}


	/**
	 * Modification from the original wordpress get_post_meta()
	 *
	 * @param int     $post_id
	 * @param string  $meta_key
	 * @param boolean $single
	 * @return (mixed) boolean/string
	 */
	public static function get_post_meta( $key = '', $default = false, $single = true ) {
		$meta_key = self::$key . $key;
		$value = get_post_meta( get_the_ID(), $meta_key, $single );

		if ( $value === "" or $value === array() ) {
			$value = $default;
		}

		if ( $single === true ) {
			$value = self::truthy( $value );
		}

		return self::maybe_override( $key, $value );
	}

	public static function truthy( $value ) {

		if ( empty( $value ) || ! is_string( $value ) ) {
			return $value;
		}

		switch ( $value ) {
		case 'false': return false; break;
		case 'default': return null; break;
		case 'true': return true; break;


		default:
			return $value;
			break;
		}
	}

	/**
	 * Instead of going "global" everywhere
	 * We're going to use Pure::override() functions
	 * as an interface for the one global that we're using.
	 *
	 * @param array   $args Any Pure argument that is supposed to be overriden
	 * @return (void)
	 */
	public static function add_override( $args ) {
		// Using a Global this time
		global $pure_override_args;
		$pure_override_args = $args;
	}

	/**
	 * Gets an Override from the Global Args
	 *
	 * @param (string) $key Needle
	 * @return (mixed)  Anything that was stored
	 */
	public static function get_override( $key ) {
		global $pure_override_args;

		if ( empty( $pure_override_args ) || !is_array( $pure_override_args ) ) {
			return false;
		}

		if ( isset( $pure_override_args[$key] ) ) {
			return $pure_override_args[$key];
		}

		return false;
	}

	public static function maybe_override( $key, $else ) {

		$override = self::get_override( $key );

		if ( $override !== false ) {
			return $override;
		} else {
			return $else;
		}

	}

	public static function clear_override() {
		global $pure_override_args;
		$pure_override_args = array();
	}

	/**
	 * Another wrapper, just to shorten things up a bit
	 *
	 * @param (string) $option Which option?
	 * @return (boolean)    Return whether that option is true or false
	 */
	public static function is_enabled( $option, $default = false ) {

		$value = self::get_theme_mod( $option, $default );

		if ( is_numeric( $value ) ) {
			$value = (int) $value;
		}

		// Loose comparison
		// null != true
		// 0 != true
		// 1 == true
		if ( $value == true ) {
			return true;
		}

		return false;
	}


	/**
	 * Get file contents.
	 * Currently a very weak implementation...
	 *
	 * @param (string) $file File name
	 * @return (string) File contents or WP_Error object
	 */
	public static function get_file_contents( $file ) {
		$target_dir = get_template_directory() . '/inc/pure';
		$target_file = trailingslashit( $target_dir ) . $file;

		if ( file_exists( $target_file ) ) {
			return file_get_contents( $target_file );
		}

		return new WP_Error( "reading_error", "Couldn't open CSS Selectors file" );

	}

	/**
	 * Return something if some option is enabled
	 *
	 * @param (string) $option Any Pure Mellow option
	 * @param (any)   $then   Whatever you want returned
	 * @param (any)   $else   Or return that other thing
	 * @return $then or null
	 */
	public static function if_enabled( $option, $then, $else = null  ) {

		if ( self::is_enabled ( $option ) === true ) {
			return $then;
		}
		return $else;
	}
	/**
	 * Inverse of if_enabled
	 * Return something, if some property is disabled.
	 *
	 * @param (string) $option Any Pure Mellow option
	 * @param (any)   $then   Whatever you want returned
	 * @param (any)   $else   Or return that other thing
	 * @return $then or null
	 */
	public static function if_disabled( $option, $then, $else = null ) {

		if ( self::is_enabled ( $option ) === false ) {
			return $then;
		}
		return $else;
	}

	public static function maybe_enable_sidebar( $classes ) {

		if ( self::is_enabled ( "blog_sidebar", true ) && get_post_type() !== "portfolio" ) {
			$classes[] = "sidebar-enabled";
		} else {
			$classes[] = "sidebar-disabled";
		}
		return $classes;
	}



	//-----------------------------------*/
	// Helpers
	//-----------------------------------*/
	public static function render_class( $class, $echo = true, $with_tag = true ) {
		$class = array_filter( (array) $class );

		// Stop if no class. Duh.
		if ( empty( $class ) ) { return; }

		$out = "";
		if ( $with_tag === true ) {
			$out .= " ";
			$out .= 'class="';
		}
		$class = array_map( "sanitize_html_class", $class );
		$out .= implode( " ", $class );

		if ( $with_tag === true ) {
			$out .= '"';
			$out .= " ";
		}

		if ( $echo === true ) {
			echo $out;
		} else {
			return $out;
		}

	}

	public static function render_style( $style, $echo = true, $with_tag = true ) {
		// Cast Style into an array
		$style = array_filter( (array) $style );

		// Stop if no style. Duh.
		if ( empty( $style ) ) { return; }
		$out = "";

		if ( $with_tag === true ) {
			$out .= " ";
			$out .= 'style="';
		}

		foreach ( $style as $property => $value ) {
			$out .= "{$property}:{$value};";
		}

		if ( $with_tag === true ) {
			$out .= '"';
			$out .= " ";

		}

		if ( $echo === true ) {
			echo $out;
		} else {
			return $out;
		}
	}

	public static function render_data( $name, $data, $echo = true, $with_tag = true ) {
		// Stop if no data. Duh.
		if ( empty( $data ) && "0" !== $data ) { return; }

		$out = "";
		if ( $with_tag === true ) {
			// Mind the single and double quotes.
			$out .= " ";
			$out .= " data-" . sanitize_html_class( $name ) . "='";
		}

		if ( is_string( $data ) !== true ) {
			$out .= json_encode( $data );	
		} else {
			$out .= htmlspecialchars( $data );
		}
		

		if ( $with_tag === true ) {
			$out .= "'";
			$out .= " ";
		}

		if ( $echo === true ) {
			echo $out;
		} else {
			return $out;
		}

	}

	public static function render_attributes( $data, $echo = true ) {
		if ( isset( $data['class'] ) ) {
			self::render_class( $data['class'], $echo );
		}

		if ( isset( $data['style'] ) ) {
			self::render_style( $data['style'], $echo );
		}

		if ( isset( $data['data'] ) ) {
			foreach ( $data['data'] as $name => $data ) {
				self::render_data( $name, $data, $echo ) ;
			}

		}
	}

	public static function setup() {

		/* -----------------------------------*/
		/* 		Thumbnails
		/* -----------------------------------*/

		/**
		 * Make theme available for translation
		 */
		load_theme_textdomain( 'pure', get_template_directory() . '/languages' );

		/**
		 * Add default posts and comments RSS feed links to head
		 */
		add_theme_support( 'automatic-feed-links' );

		/**
		 * Enable support for Post Thumbnails
		 */
		add_theme_support( 'post-thumbnails' );


		/**
		 * This theme uses wp_nav_menu() in one location.
		 */
		register_nav_menus( array(
				'primary' => __( 'Primary Menu', 'puremellow' ),
				'footer-menu' => __( 'Footer Menu', 'puremellow' ),
			) );

		/**
		 *  Custom Background Image Options
		 */
		$args = array(
			'default-color' => '',
			'default-image' => '',
		);

		$args = apply_filters( 'pure_custom_background_args', $args );
		add_theme_support( 'custom-background', $args );

	}
}
// DEBUG !!:
// Pure::setup();
