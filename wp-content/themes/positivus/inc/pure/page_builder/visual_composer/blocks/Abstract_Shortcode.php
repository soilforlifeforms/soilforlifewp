<?php

if ( ! function_exists( 'is_assoc') ) {
	function is_assoc($array) {
	  return (bool)count(array_filter(array_keys($array), 'is_string'));
	}	
}


if ( !class_exists( 'Pure_Shortcode_Abstract' ) ) {
	abstract class Pure_Shortcode_Abstract {
		/* -----------------------------------*/
		/* 		Generic Properties
		/*		used throughout the blocks
		/* -----------------------------------*/
		static $available_icons = array( "apple", "bell", "bird", "book", "briefcase", "brush", "calendar", "camera", "chart", "clipboard", "clock", "cloud", "cog", "coin", "compass", "comment-1", "comment", "compose", "controller", "dislike", "document-1", "document-2", "document", "doughnut", "envelope", "eye", "female-1", "female-2", "female", "flask-1", "flask", "flower-1", "flower", "folder", "gallery", "glass", "group", "heart", "house", "image", "key", "left", "letter", "like", "link", "lock", "magnify", "mail", "male-1", "male-2", "male", "map-pin-1", "map-pin", "map", "music", "no", "pause", "pencil", "phone", "pin", "play", "quotation", "right", "rocket", "scissors", "shopping-1", "shopping", "status", "stop", "tag", "tools", "trash-empty", "trash-full", "unlock", "video", "wine", "yes" );
		static $size_words = array(
			"one-whole",
			"one-twelfth",
			"one-sixth",
			"one-fourth",
			"one-third",
			"five-twelfths",
			"one-half",
			"seven-twelfths",
			"two-thirds",
			"three-fourths",
			"five-sixths",
			"eleven-twelfths",
			"one-whole"
		);
		static $font_size = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'regular', 'small' );
		static $font_weight = array(
			'100' => 'Ultra Light',
			'200' => 'Light',
			'300' => 'Book',
			'400' => 'Normal',
			'500' => 'Medium',
			'600' => 'Semi Bold',
			'700' => 'Bold',
			'800' => 'Extra Bold',
			'900' => 'Black',
		);
		static $text_kses = array(
			"strong" => array(),
			"br" => array(),
			"em" => array(),
			"h1" => array(),
			"h2" => array(),
			"h3" => array(),
			"h4" => array(),
			"h5" => array(),
			"h6" => array()
		);


		/* -----------------------------------*/
		/* 		Configuration Variables
		/* -----------------------------------*/
		var $prefix = "pure_vc_";
		var $atts = array();


		/* -----------------------------------*/
		/* 		Constructor
		/* -----------------------------------*/
		function __construct() {

			$this -> setup_vc_atts();
			$this -> parse_vc_atts();
			$this -> setup_shortcode_atts();

			$this->atts['base'] = $this -> prefix . $this -> atts['base'];

			add_shortcode( $this->atts['base'] , array( &$this, "block_callback" ) );
			vc_map( $this->atts );
		}

		/*
		* Using this function
		* to setup VC Atts ($this->atts) from child classes
		*/
		function setup_vc_atts() {}

		/* Parse VC Atts and fill in the blanks */
		function parse_vc_atts() {

			/*
			* If no default title, generate one
			*/
			if ( empty( $this->atts['icon'] ) ) {
				$this->atts["icon"] = 'icon-wpb-positivus';
			}

			/*
			* If no icon, set the default Theme Icon
			*/
			if ( ! isset( $this->atts['name'] ) ) {
				$this->atts["name"] = $this -> prettify( $this->atts["base"] );
			}


			foreach ( $this->atts['params'] as $param_key => $param ) {

				/*
				* If no default value type, set it to text
				*/
				if ( ! isset( $param['type'] ) ) {
					$param["type"] = "textfield";
				}

				/*
				* If no default title, generate one
				*/
				if ( ! isset( $param['heading'] ) ) {
					$param["heading"] = self::prettify( $param['param_name'] );
				}
				$this->atts["params"][$param_key] = $param;
			}

		}

		/* Extract shortcode default values from $this->atts */
		function setup_shortcode_atts() {
			$this -> shortcode_atts = array();

			foreach ( $this->atts["params"] as $key => $attr ) {
				
				$slug = $attr['param_name'];

				// Check for "default"
				// Useful when having arrays as the "value"
				if ( isset( $attr['default'] ) ) {
					$value = $attr['default'];
				} 
				// If no "default", use a "value"
				else {

					// Make sure some value exists, even if it's empty.
					if ( ! isset( $attr["value"] ) ) {
						$attr["value"] = "";
					}

					$value = $attr['value'];
				}
		
				//If this is an array, pick the first one as default.
				if ( is_array( $value ) ) {
					$values = array_values( $value );
					$value = array_shift( $values );
				}

				$this -> shortcode_atts[$slug] = $value;
			}

		}

		public function block_callback( $instance, $content = null ) {
			ob_start();

			//display the block
			$this->before_block( $instance );
			$this->block( $instance, $content );
			$this->after_block( $instance );

			return ob_get_clean();

		}

		public static function sanitize_int( $string ) {
			return filter_var( $string, FILTER_SANITIZE_NUMBER_INT );
		}

		public static function get_column_name( $size ) {
			$size = self::sanitize_int( $size );
			return self::$size_words[$size];
		}


		/**
		 * Prettify a string or an array
		 * Think of this as "anti-sanitize_title"
		 * Turns a "sluggish" string/array into a pretty one
		 * @param  mixed  $var  	Something Ugly
		 * @param  boolean $flip 	Only if $var is array - result is flipped.
		 * @return (mixed)       	For whatever one sows, that will he also reap
		 */
		public static function prettify( $var, $flip = false ) {

			if ( is_string( $var ) ) {
				$var = str_replace( array( "-", "_" ), " ", $var );
				$var = ucwords( $var );

				return $var;

			} elseif ( is_array( $var ) ) {

				foreach ( $var as $key => $value ) {
					$pretty = self::prettify( $value );
					$out[$key] = $pretty;
				}

				if ( $flip === true ) {
					$out = array_flip( $out );
				}

				return $out;
			}

			trigger_error("Abstract_Shortcode::prettify was expecting a string or an array, received something else.", E_WARRNING);
			return $var;
		}


		/**
		 * Take a flat out ugly array and turn 
		 * it into a beautiful Visual Composer ready "Select" array
		 * @param  (array) $array   Ugly array
		 * @param  boolean $prepend Prepend an empty row before the array ?
		 * @param  boolean $flip    Flip the array ?
		 * @return (array)          A pretty array
		 */
		public static function selectify( $array, $prepend = false, $flip = true ) {
			
			if ( ! is_assoc( $array ) ) {
				$keys = $array;
				$values = self::prettify( $array );

				$output = array_combine( $keys, $values );			
			} else {
				$output = $array;
			}

			if ( is_bool ( $prepend ) ) {
				
				if ( true === $prepend ) {
					$output = array( "" => "" ) +  $output;
				} 

			} else {
				$output = (array) $prepend +  $output;
			}

			if ( true === $flip ) {
				$output = array_flip( $output );
			}

			return $output;
		}


		function render_style( $style, $echo = true, $with_tag = true ) {
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
			}

			if ( $echo === true ) {
				echo $out;
			} else {
				return $out;
			}
		}

		function render_class( $class, $echo = true, $with_tag = true ) {
			// Stop if no class. Duh.
			if ( empty( $class ) ) { return; }

			// Cast $class into an array
			$class = (array) $class;


			$out = "";
			if ( $with_tag === true ) {
				$out .= " ";
				$out .= 'class="';
			}
			$class = array_map( "sanitize_html_class", $class );

			$class = implode( " ", $class );

			$out .= $class;

			if ( $with_tag === true ) {
				$out .= '"';
			}

			if ( $echo === true ) {
				echo $out;
			} else {
				return $out;
			}
		}

		/* block header */
		/* @todo Refactor Please */
		function before_block( $instance ) {
			// extract( $instance );
			// $size_word = $this->get_column_name( $size );

			// $class = array( "column", "cf" );

			// if ( $first ) {
				// $class[] = "first";
			// }

			// $element_id = $template_id.'-'.$number;

			// echo '<div' . $this->render_class( $class, $echo = false ) . '>';

		}

		/* block footer */
		function after_block( $instance ) {
			// echo '</div>';
		}

	}
}
