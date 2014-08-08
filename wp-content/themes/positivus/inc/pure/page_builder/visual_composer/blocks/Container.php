<?php
if ( ! class_exists( "Pure_Short_Container" ) ) {
	class Pure_Short_Container extends Pure_Shortcode_Abstract {

		function __construct() {
			// vc_remove_element("vc_row");
			// remove_shortcode("vc_row");

			$this -> setup_vc_atts();
			$this -> parse_vc_atts();
			$this -> setup_shortcode_atts();

			// add_shortcode( $this->atts['base'] , array( &$this, "block_callback" ) );
			vc_map_update( 'vc_row', $this->atts );
		}

		function setup_vc_atts() {

			$defaults = array(
			   'parallax_speed' => array(
					'0.05' => 'Really Slow ( 0.05x )',
					'0.25' => 'Pretty Slow ( 0.25x )',
					'0.75' => 'Average ( 0.75x )',
					'0.85' => 'Regular ( 0.85x )',
					'1.25' => 'Pretty Fast ( 1.25x )',
					'1.5' => 'Really Fast ( 1.5x )',

					),
			  'background_style' => array(
					"stretched-image",
					"pattern",
					"static-pattern",
					"parallax"
				),
			);

			$params = array(
				array(
					"param_name" => "container_title",
					'value' => ''
				),

				array(
					"param_name" => "container_style",
					"type" => "dropdown",
					"value" => self::selectify ( array( "boxed", "full-width" )
					),
				),

				array(
					"param_name" => "scheme",
					'heading' => 'Font Color Preset',
					"type" => "dropdown",
					'value' => array(
						'Dark Font Scheme' => 'dark-font',
						'Light Font Scheme' => 'light-font'
					),
				),

				/* -----------------------------------*/
				/* 		Background
				/* -----------------------------------*/
				array(
					"param_name" => "background_color",
					"type" => "colorpicker",
					"value" => "",
				),

				array(
					"param_name" => "background_image",
					"type" => "attach_image",
					"value" => ''
				),

				array(
					"param_name" => "background_style",
					"type" => "dropdown",
					"value" => self::selectify( $defaults['background_style'], true ),
					// "dependency" => array(
					// 	  'element' => 'background_image', 
					// 	  'not_empty' => true,
					//   ),
				),

				array(
					"param_name" => "parallax_speed",
					"type" => "dropdown",
					"value" => self::selectify( $defaults['parallax_speed'], true),
					"dependency" => array('element' => 'background_style', 'value' => array('parallax') ),
				),
				array(
					"param_name" => "parallax_offset",
					"description" => "Set a Parallax offset if the background image doesn't appear right",
					"value" => "",
					"dependency" => array('element' => 'background_style', 'value' => array('parallax') ),
				),
				array(
					"param_name" => "background_image_opacity",
					"value" => '100',
					"description" => 'In Percent ( % ). For example 50.',
					"dependency" => array(
						  'element' => 'background_style', 
						  'not_empty' => true,
					  ),
				),

				/* -----------------------------------*/
				/* 		Heights and Spaces
				/* -----------------------------------*/
				array(
					"param_name" => "container_height",
					"description" => "In Pixels. For example 450",
					"value" => ''
				),

				array(
					"param_name" => "container_space_before",
					"description" => "In Pixels. For example 40",
					'value' => ''
				),

				array(
					"param_name" => "container_space_after",
					"description" => "In Pixels. For example 40",
					'value' => ''
				),
				array(
					"type" => "textfield",
					"heading" => __( "Extra class name", "js_composer" ),
					"description" => 'These functions are for specific use cases. Please refer to the documentation for more detailed instructions. For example "vertical center" is meant to be used with a full width container and a text block',
					"param_name" => "el_class",
					"description" => __( "If you wish to style particular content element differently, then use this field to add a class name and then refer to it in your css file.", "js_composer" )
				),


				/* -----------------------------------*/
				/* 		Misc
				/* -----------------------------------*/
				array(
					"type" => "checkbox",
					"param_name" => "additional_options",
					"description" => '',
					'value' => array(
		                 "Align Text to Center Vertically" => "valign", 
						 "Disable Row Padding " => "nopadding",
						 "Disable Column Spacing " => "nopadding--column"
		                 ),
					'default' => '',
				),
	
			);

			$this -> atts = array(
				"name" => __( "Row", "pure" ),
				"icon" => "",
				"is_container" => true,
				"category" => __( 'Container', 'pure' ),
				"js_view" => 'VcRowView',
				"icon" => "icon-wpb-row",
				"show_settings_on_create" => false,
				"params" => $params,
			);


		}

		function before_block( $instance ) {
			wp_enqueue_style( 'js_composer_front' );
			wp_enqueue_script( 'wpb_composer_front_js' );
			wp_enqueue_style( 'js_composer_custom_css' );

			$atts = shortcode_atts( $this->shortcode_atts, $instance );
			// We're going to use all this good stuff on our tag. Oh god.
			$parent = array();
			$child = array();

			$use_data = false; // Don't use the data attribute by default
			$this->inner_wrapper = false; // Dont display an inner wrapper by default

			$parent["class"][] = "container__block";
			$child["class"][] = "container__background";

			if ( $atts['el_class'] ) {
				$parent["class"][] = $atts["el_class"];	
			}
			
			if ( $atts['additional_options'] ) {
				$options = explode( ',', $atts['additional_options'] );
				foreach( $options as $opt ) {
					$parent['class'][] = sanitize_html_class($opt);
				}
				
			}

			if ( $atts['container_style'] ) {
				$parent['class'][] = sanitize_html_class( $atts['container_style'] );
				$this->inner_wrapper = true;
			}
			if ( $atts['scheme'] ) {
				$parent['class'][] = sanitize_html_class( $atts['scheme'] );
			}

			if ( $atts['container_height'] ) {
				$parent['style']['height'] = $this -> sanitize_int( $atts['container_height'] ) . "px";
			}

			if ( $atts['container_space_before'] ) {
				$parent['style']['margin-top'] = $this -> sanitize_int( $atts['container_space_before'] ) . "px";
			}

			if ( $atts['container_space_after'] ) {
				$parent['style']['margin-bottom'] = $this -> sanitize_int( $atts['container_space_after'] ) . "px";
			}

			if ( $atts['background_color'] ) {
				$parent['style']["background-color"] = sanitize_hex_color ( $atts['background_color'] );
			}

			if ( $atts['background_image_opacity'] ) {
				$child['style']["opacity"] = $atts['background_image_opacity'] / 100;
			}

			if ( $atts['background_image'] ) {
				$background_image = wp_get_attachment_image_src( $atts["background_image"], 'full' );
				$bg_width = $background_image[1];
				$bg_height = $background_image[2];
				$bg_image = $background_image[0];
			} else {
				$bg_image = false;
			}

			if ( $atts['background_style'] && $bg_image ) {
				switch ( $atts['background_style'] ) {

				case 'stretched-image':
					$bg_images = (array) $bg_image;

					if ( count( $bg_images ) > 1 ) {
						$child['class'][] = "js__gallery_backstretch";
					} else {
						$child['class'][] = "js__backstretch";
						$child['class'][] = "backstretch";
						$child['style']['background-image'] = "url('" . $bg_image . "')";
					}

					$child['data']['images'] = (array) $bg_image;
					if ( $atts['container_height'] ) {
						$child['style']['height'] = $this -> sanitize_int( $atts['container_height'] ) . "px";
					}
					break;

				case 'parallax':

					if ( $atts['parallax_speed'] == 1 ) {
						$parent['style']['background-image'] = "url('" . $bg_image . "')";
						$parent['class'][] = "backstretch";
						$parent['class'][] = "static-background";
						$child['data']['stellar-background-ratio'] = (float) 0.01;
						
						if( $atts['parallax_offset'] ) {
							$child['data']['stellar-vertical-offset'] = (int) $atts['parallax_offset'];	
						}

					} else {
						$child['style']['background-image'] = "url('" . $bg_image . "')";
						$child['class'][] = "backstretch";
						$child['data']['stellar-background-ratio'] = (float) $atts['parallax_speed'];
						
						if( $atts['parallax_offset'] ) {
							$child['data']['stellar-vertical-offset'] = (int) $atts['parallax_offset'];	
						}
					}


					break;

				case 'static-pattern':
					$child['style']['background-image'] = "url('" . $bg_image . "')";
					$child['style']['background-repeat'] = "repeat";
					$child['class'][] = "static-background";
					break;

				default:
					$child['style']['background-image'] = "url('" . $bg_image . "')";
					$child['style']['background-repeat'] = "repeat";
					break;
				}
			}
?>

			<div <?php Pure::render_attributes( $parent ); ?>>
			 <?php if (  ! empty( $child['style'] ) || !empty( $child['data'] )  ): ?>
				<div <?php Pure::render_attributes( $child ); ?>></div>
			 <?php endif; ?>
			<?php if ( $this->inner_wrapper === true ): ?>
				<div class="container__inner">
			<?php endif ?>


				 <div class="container__content">
			<?php if ( $atts['container_title'] ): ?>
				<h2 class="g one-whole container__title"><?php echo do_shortcode( wp_kses( $atts['container_title'], self::$text_kses ) ); ?></h2>
			<?php endif ?>

			<?php
		}


		function after_block( $instance ) {
?>
					</div> <!-- .container_content -->
			<?php if ( $this->inner_wrapper === true ): ?>
				</div> <!-- .container_inner -->
			<?php endif ?>
			</div> <!-- .container__block -->
			<?php
		}

		function block( $instance, $content ) {
			echo wpb_js_remove_wpautop( $content );
		}

	}

	new Pure_Short_Container;
}
