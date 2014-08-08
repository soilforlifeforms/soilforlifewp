<?php
if ( !class_exists( 'PVC_Footer_Separator' ) && class_exists( 'Pure_Shortcode_Abstract' ) ) {
	class PVC_Footer_Separator extends Pure_Shortcode_Abstract {

		function setup_vc_atts() {

			$defaults = array(
				'title' => '',
				'title_size' => self::selectify(self::$font_size, $prepend = true ),
				'font_color' => '',
				'font_weight' => self::selectify(self::$font_weight, $prepend = true ),
				'background_color' => '',
				'accent_color' => '',
				'font_family' => '',
				'block_height' => '',
			);


			$params = array(
				array(
					'param_name' => 'title',
					'value' => $defaults['title'],
				),
				array(
					'param_name' => 'background_color',
					'type' => 'colorpicker',
					'value' => $defaults['background_color'],
				),
				array(
					'param_name' => 'accent_color',
					'type' => 'colorpicker',
					'value' => $defaults['accent_color'],
				),
				array(
					'param_name' => 'font_color',
					'type' => 'colorpicker',
					'value' => $defaults['font_color'],
				),
				array(
					'param_name' => 'title_size',
					'type' => 'dropdown',
					'default' => 'h3',
					'value' => $defaults['title_size'],
				),
				array(
					'param_name' => 'font_family',
					'description' => 'Optional Google Font Name. For example <em>"Open Sans"</em> (without quotes)',
					'value' => $defaults['font_family'],
				),
				array(
					'param_name' => 'font_weight',
					'description' => 'Required if a custom Google Font is used. Make sure that font supports the font weight you want.',
					'type' => 'dropdown',
					'value' => $defaults['font_weight'],
				),
			);


			$this -> atts = array(
				"base" => "footer_separator",
				"icon" => "",
				"category" => __( 'Positivus Footer', 'pure' ),
				"params" => $params,
			);


		}

		function before_block( $instance ) {}
		function after_block( $instance ) {}

		function block( $instance, $content ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
			
			$keys_to_extract = array(
				"title",

			);
			extract( wp_array_slice_assoc( $atts, $keys_to_extract ) );



			# Stop Right there, if we don't have a title - nothing to do here. Simple as that.
			if ( ! $title ) { return; }

			$parent = array();
			$child = array();
			
			if ( !empty( $atts['block_height'] ) ) {
				$child["height"] = (int) $block_height;
			}

			//-----------------------------------*/
			// Colors
			//-----------------------------------*/
			if ( !empty( $atts['font_color'] ) ) {
				$child["color"] = sanitize_hex_color( $atts['font_color'] );
			}

			if ( !empty( $atts['background_color'] ) ) {
				$parent["background-color"] = sanitize_hex_color( $atts['background_color'] );
			}

			if ( !empty( $atts['accent_color'] ) ) {
				$child["background-color"] = sanitize_hex_color( $atts['accent_color'] );
			}

			//-----------------------------------*/
			// Fonts
			//-----------------------------------*/
			if ( !empty( $atts['font_weight'] ) ) {
				$child["font-weight"] = (int) $atts['font_weight'];
			}

			if ( !empty( $atts['font_family'] ) ) {
				$protocol = ( is_ssl() ) ? "https" : "http";
				$google_url = $protocol . "://fonts.googleapis.com/css?family=";
				$safe_font_name = utf8_encode( $atts['font_family'] );
				
				if ( !empty( $child['font-weight'] ) ) {
					$safe_font_weight = "|" . $child['font-weight'];
				} else {
					$safe_font_weight = "";
				}
				
				// wp_register_style( 'googlefont-' . $safe_font_name, , $deps = array, $ver = false, $media = 'all' )
				wp_enqueue_style( 'googlefont-' . $safe_font_name, $google_url . $safe_font_name . $safe_font_weight);

				$child['font-family'] = "'$font_family'"; // No fallback font, to fall back on default parent font
			}
			?>

			<div class="footer-toggle" <?php $this -> render_style( $parent ) ?>>
					<div class="footer-inner js__footer--listener" <?php $this->render_style( $child ); ?>>
						<?php echo $title ?>
					</div>
			</div>

		<?php
		
		}

	}
	new PVC_Footer_Separator;
}
