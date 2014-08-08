<?php
if ( !class_exists( 'PVC_Media_Text' ) && class_exists( 'Pure_Shortcode_Abstract' ) ) {
	class PVC_Media_Text extends Pure_Shortcode_Abstract {

		function setup_vc_atts() {
			$defaults = array(
				'scheme' => array(
					'' => 'Default',
					'dark-font' => 'Dark Font Scheme',
					'light-font' => 'Light Font Scheme',
				),
				'media_position' => self::selectify( array( 'top', 'right', 'left' ) ),
				// 'align' => array( 
				// 	'alignright' => 'right', 
				// 	'aligncenter' => 'center', 
				// 	'alignleft' => 'left',
				// ),
			);


			$params = array(
				array(
					'param_name' => 'content',
					'type' => 'textarea_html',
					'value' => '',
				),
				array(
					'param_name' => 'icon',
					'type' => 'dropdown',
					'value' => self::selectify( self::$available_icons, true )
				),
				array(
					'param_name' => 'media_image',
					'type' => 'attach_image',
					'dependency' => 
						array(
					      'element' => "icon",
					      'is_empty' => true,

						),
					'value' => '',
				),
				array(
					'param_name' => 'rounded',
					'type' => 'checkbox',
					'value' => array("Round the Image" => "rounded"),
					'default' => '',
				),

				
				array(
					'param_name' => 'media_position',
					'type' => 'dropdown',
					'value' => $defaults['media_position'],
				),		                

				array(
					'param_name' => 'scheme',
					'type' => 'dropdown',
					'value' => array_flip( $defaults['scheme'] ),
				),
				
				array(
					'param_name' => 'background_color',
					'type' => 'colorpicker',
					'value' => '',
				),
				
				array(
					'param_name' => 'link',
					'value' => '',
				),

			);


			$this -> atts = array(
				"base" => "Media with Text",
				"category" => __( 'Positivus', 'pure' ),
				"params" => $params,
			);


		}

		function display_media( $instance ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
			$class = array("media");

			if ( $atts['media_image'] ) {
				$class[] = "media--image";
			}

			?>
			<div <?php Pure::render_class($class); ?>>
				
				<?php if ( $atts['icon'] ): ?>
						
						<div class="media__item pure-icon">
							<div class="icon-<?php echo sanitize_html_class( $atts['icon'] ) ?>"></div>
						</div>

				<?php elseif ( $atts['media_image'] ): ?>

						<?php $image = wp_get_attachment_image_src( $atts['media_image'], "full" ); ?>

						<?php if ( isset( $image[0] ) && false != $image[0] ): ?>
							<img class="media__item" src="<?php echo $image[0]; ?>"/>
						<?php endif; ?>

				<?php endif; ?>
			</div>

		<?php
		}


		// function before_block() {}
		function before_block( $instance ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
			$keys_to_extract = array(
				"column_height",
				"icon",
				"scheme",
				"background_color",
				"media_position",
				"media_image",
				"responsive_palm",
				"responsive_lap",
				"rounded",
				"link"
			);
			extract( wp_array_slice_assoc( $atts, $keys_to_extract ) );

			$class = array( "media-column", "column", "cf" );
			$style = array();


			$class[] = $scheme;
			$class[] = "media-" . $media_position ;

			// if ( $text_align ) {
			// 	$class[] = "text-" . $text_align;
			// }

			if ( $rounded && $rounded == "rounded" ) {
				$class[] = "rounded";
			}

			if ( $link ) {
				$class[] = "hoverable";

				$element = "a";
				$properties = 'href="' . esc_url( $link ) . '"';
			}
			else {
				$element = "div";
				$properties = "";
			}

			if ( ! empty( $column_height ) ) {
				$style['height'] = $this -> sanitize_int( $column_height ) . 'px;';
			} else {
				$class[] = "js__resize";
			}

			if ( $background_color ) {
				$style['background-color'] = $background_color;
			}

			// ID
			// $properties .= ' id="'.$template_id.'-'.$number.'"';
			$properties .= $this -> render_class( $class, $echo = false );
			$properties .= $this -> render_style( $style, $echo = false );
			$output = "<{$element} {$properties}><div class=\"inner-wrapper\">";

			// Set this element so we can use it in after_block
			$this->element = $element;
			echo $output;
		}

		function after_block( $instance ) {
			echo '</div></' . $this->element . '>';
		}


		function block( $instance, $content ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
			$keys_to_extract = array(
				"column_height",
				// "title",
				"icon",
				"scheme",
				"background_color",
				"media_position",
				"media_image",
				"responsive_palm",
				"responsive_lap",
				"rounded",
				"link"
			);
			extract( wp_array_slice_assoc( $atts, $keys_to_extract ) );

			if ( $media_position && $media_position !== "center" ) {
				$this->display_media( $atts );
			} 
			?>

					<div class="content js__trans">
						<?php  if ( $media_position === "center" ) { $this->display_media( $atts ); } ?>
							<?php echo wpb_js_remove_wpautop( $content ); ?>
					</div>
				<?php

		}



	}
new PVC_Media_Text;
}
