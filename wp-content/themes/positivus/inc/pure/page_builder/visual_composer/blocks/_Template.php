<?php
if ( !class_exists( 'Pure_Template_Class' ) && class_exists( 'Pure_Shortcode_Abstract' ) ) {
	class Pure_Template_Class extends Pure_Shortcode_Abstract {

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
			);


			$this -> atts = array(
				"base" => "animated_content",
				"icon" => "",
				"category" => __( 'Positivus', 'pure' ),
				"params" => $params,
			);


		}

		function before_block( $instance ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
		}

		function after_block( $instance ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
		}


		function block( $instance, $content ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
		}

	}
	new Pure_Template_Class;
}
