<?php
if ( !class_exists( 'PVC_Call_To_Action' ) && class_exists( 'Pure_Shortcode_Abstract' ) ) {
	class PVC_Call_To_Action extends Pure_Shortcode_Abstract {

		function setup_vc_atts() {
			$defaults = array(
				'content' => false,
				'button_size' => array('medium', 'small', 'large'),
				'title' => '',
				'button_text' => '',
				'button_url' => '',
			);


			$params = array(
				array(
				'param_name' => 'title',
				'value' => $defaults['title'],
				),

				array(
				'param_name' => 'content',
				'type' => 'textarea',
				'value' => $defaults['content'],
				),

				array(
				'param_name' => 'button_text',
				'value' => $defaults['button_text'],
				),

				array(
				'param_name' => 'button_url',
				'value' => $defaults['button_url'],
				),
				
				array(
				'param_name' => 'button_size',
				'type' => 'dropdown',
				'value' => self::selectify( $defaults['button_size'] ),
				),
			);


			$this -> atts = array(
				"base" => "call_to_action",
				"icon" => "",
				"category" => __( 'Positivus', 'pure' ),
				"js_view" => 'VcCallToActionView',
				"params" => $params,
			);


		}

		// function before_block( $instance ) {
		// 	$atts = shortcode_atts( $this -> shortcode_atts, $instance );
		// }

		// function after_block( $instance ) {
		// 	$atts = shortcode_atts( $this -> shortcode_atts, $instance );
		// }


		function block( $instance, $content ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );

			$title = ( !empty( $atts['title'] ) ) ? esc_html( $atts['title'] ) : null;
			$button_text = ( !empty( $atts['button_text'] ) ) ? esc_html( $atts['button_text'] ) : null;
			$button_size = ( !empty( $atts['button_size'] ) ) ? sanitize_html_class( $atts['button_size'] ) : null;
			$button_url = ( !empty( $atts['button_url'] ) ) ? esc_url_raw( $atts['button_url'] ) : null;


		?>
			<div class="call-to-action">
				<div class="content-container js__trans">

					<div class="cell description">

							<h3 class="title"><?php echo html_entity_decode( wp_kses( $title, self::$text_kses ) ); ?></h3>
							<?php if ( !empty( $content ) ): ?>
								<p><?php echo do_shortcode( $content ); ?></p>
							<?php endif; ?>

					</div>


					<div class="cell action">

						<a href="<?php echo esc_url_raw( $button_url ) ?>" class="button <?php echo sanitize_html_class( $button_size ) ?>">
							<?php echo wp_kses( $button_text, self::$text_kses ); ?>
						</a>

					</div>
				</div>
			</div>
		<?php
		}

	}

	vc_remove_element("vc_cta_button");
	new PVC_Call_To_Action;
}
