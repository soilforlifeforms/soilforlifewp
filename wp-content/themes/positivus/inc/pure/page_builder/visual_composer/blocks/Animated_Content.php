<?php
if ( !class_exists( 'PVC_Animated_Content' ) && class_exists( 'Pure_Shortcode_Abstract' ) ) {
	class PVC_Animated_Content extends Pure_Shortcode_Abstract {
		var $user_options, $icon_names;


		function setup_vc_atts() {
			$params = array(
				array(
					"param_name" => "title",
					"type" => "textfield",
					"value" => "",
				),

				array(
					"param_name" => "content",
					"type" => "textarea_html",
					"value" => "",
					"holder" => 'div',

				),
				array(
					"param_name" => "scheme",
					"heading" => "Color Scheme",
					"type" => "dropdown",
					"value" => array(
						__( "Default" )  => "",
						__( 'Dark Font Scheme' ) => 'dark-font',
						__( 'Light Font Scheme' ) => 'light-font',
					),

				),
				array(
					"param_name" => "column_height",
					"type" => "textfield",
					"value" => "",

				),
				array(
					"param_name" => "media_image",
					"type" => "attach_image",
					"value" => "",

				),
				array(
					"param_name" => "media_position",
					"type" => "dropdown",
					'value' => self::selectify( array( 'left', 'right' ) ),

				),
				array(
					"param_name" => "responsive_lap",
					"type" => "dropdown",
					"description" => 'For devices with screen width from 768px to 1024px',
					"value" => array(
						"" => "",
						__( "Full Width", "pure" ) => "lap-one-whole",
						__( "1/2 (Half)", "pure" ) => "lap-one-half",
						__( "1/3 (One Third)", "pure" ) => "lap-one-third",
						__( "1/4 (One Fourth)", "pure" ) => "lap-one-fourth",
					),

				),
				array(
					"param_name" => "responsive_palm",
					"type" => "dropdown",
					"description" => 'For devices with screen width &lt; 768px',
					"value" => array(
						"" => "",
						__( "Full Width", "pure" ) => "palm-one-whole",
						__( "1/2 (Half)", "pure" ) => "palm-one-half",
						__( "1/3 (One Third)", "pure" ) => "palm-one-third",
						__( "1/4 (One Fourth)", "pure" ) => "palm-one-fourth",
					),

				),
			);


			$this -> atts = array(
				"base" => "animated_content",
				"icon" => "",
				"category" => __( 'Positivus', 'pure' ),
				"params" => $params,
			);


		}

		function display_media( $instance ) {
			extract( shortcode_atts( $this -> shortcode_atts, $instance ) );
			$image = wp_get_attachment_image_src( $media_image, 'large' );
?>
			<?php if ( $media_image ): ?>
			<div class="media">
				<img class="media__item" src="<?php echo $image[0]; ?>"/>
			</div>
			<?php endif; ?>

		<?php
		}



		function before_block( $instance ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );

			$class = array( "parallax-item", "cf" );
			$style = array();

			$class[] = $atts['scheme'];
			$class[] = "media-" . $atts['media_position'] ;

			if ( $atts['responsive_palm'] ) {
				$class[] = $atts['responsive_palm'];
			}

			if ( $atts['responsive_lap'] ) {
				$class[] = $atts['responsive_lap'];
			}

			if ( !empty( $column_height ) ) {
				$style['height'] = $this -> sanitize_int( $atts['column_height'] ) . 'px;';
			} else {
				$class[] = "js__resize";
			}


			// ID
			// $properties = ' id="' . $template_id . '-' . $number . '"';
			$properties = "";
			$properties .= $this -> render_class( $class, $echo = false );
			$properties .= $this -> render_style( $style, $echo = false );
			$output = "<div $properties> <div class=\"inner-wrapper\">";

			echo $output;
		}

		function after_block( $instance ) {
			echo '</div></div>';
		}


		function block( $instance, $content ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
?>


			<?php
			if ( $atts['media_position'] === "left" ) {
				$this->display_media( $atts );
			}
?>
			<div class="content">
				<?php if ( $atts['title'] ): ?>
					<h3 class="title"><?php echo do_shortcode( wp_kses( $atts['title'], self::$text_kses ) ); ?></h3>
				<?php endif; ?>

				<?php echo do_shortcode( $content ); ?>
			</div>

			<?php
			if ( $atts['media_position'] === "right" ) {
				$this->display_media( $atts );
			}
?>


			<?php
		}

	}
	new PVC_Animated_Content;
}
