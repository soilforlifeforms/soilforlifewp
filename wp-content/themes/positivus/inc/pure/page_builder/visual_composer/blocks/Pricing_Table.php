<?php
if ( !class_exists( 'PVC_Pricing_Table' ) && class_exists( 'Pure_Shortcode_Abstract' ) ) {
	class PVC_Pricing_Table extends Pure_Shortcode_Abstract {

		function setup_vc_atts() {
			$defaults = array(
				'title' => 'The Plan',
				'sub' => '',
				'price' => 'Free',
				'price_sub' => '',
				'features' => '',
				'style' => array( "regular", "popular" ),
				'button_size' => array( "medium", "small", "large" ),
				'button_text' => '',
				'button_url' => '',

			);
			$params = array(
				array(
					'param_name' => 'title',
					'value' => $defaults['title'],
				),
				array(
					'param_name' => 'sub',
					'heading' => 'Sub Title',
					'value' => $defaults['sub'],
				),
				array(
					'param_name' => 'price',
					'value' => $defaults['price'],
				),
				array(
					'param_name' => 'price_sub',
					'heading' => 'Sub Price Title',
					'value' => $defaults['price_sub'],
				),
				array(
					'param_name' => 'features',
					'description' => '
						One feature per line.<br>
						You can use HTML and Shortcodes to mark certain features more important than others.
						<br>
						For example:<br>
						<strong> '. htmlspecialchars( "<strong> Bold Feature </strong>" ) . ' </strong>
						<br> or <br>
						<em> '. htmlspecialchars( "<em> less important </em>" ) . ' </em>
						<br>
					',
					'type' => 'textarea',
					'value' => $defaults['features'],
				),
				array(
					'param_name' => 'style',
					'type' => 'dropdown',
					'value' => self::selectify( $defaults['style'] ),
				),
				array(
					'param_name' => 'button_size',
					'type' => 'dropdown',
					'value' => self::selectify( $defaults['button_size'] ),
				),
				array(
					'param_name' => 'button_text',
					'value' => $defaults['button_text'],
				),
				array(
					'param_name' => 'button_url',
					'value' => $defaults['button_url'],
				),
			);


			$this -> atts = array(
				"base" => "pricing_table",
				"icon" => "",
				"category" => __( 'Positivus', 'pure' ),
				"params" => $params,
			);


		}

		function block( $instance, $content ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
			$atts['features'] = !empty( $atts['features'] ) ? explode( "\n", trim( $atts['features'] ) ) : array();

			$class[] = "pricing-column";
			$class[] = $atts['style'];
?>

			<div <?php Pure::render_class( $class ) ?>>
			  <?php /* -- Title -- */ ?>
			  <h3 class="pricing-column__title">
				<?php echo esc_html( $atts['title'] ) ?>
				<?php if ( $atts['sub'] ): ?>
				<span class="sub-title">
				<?php echo esc_html( $atts['sub'] ) ?>
					</span>
					<?php endif ?>
			  </h3>

			  <div class="pricing-column__content">
				<?php /* -- Price -- */ ?>
				<div class="price">
					<h2>
						<?php echo esc_html( $atts['price'] ); ?>
					</h2>

					<?php if ( $atts['price_sub'] ): ?>
						<span class="price-sub">
							<?php echo esc_html( $atts['price_sub'] ); ?>
						</span>
					<?php endif ?>
				</div>

				<?php /* -- Features -- */ ?>
				<ul class="features">
				  <?php foreach ( $atts['features'] as $feature ): ?>
				  	<li><?php echo do_shortcode( wp_kses_post ( $feature ) ); ?></li>
				  <?php endforeach ?>
				</ul>


				<?php /* -- Button -- */ ?>
				<?php if ( $atts['button_text'] && $atts['button_url'] ): ?>
					<div class="action">
					<a href="<?php echo esc_url( $atts['button_url'] ) ?>" class="button <?php echo sanitize_html_class( $atts['button_size'] ) ?>">
						<?php echo esc_html( $atts['button_text'] ) ?>
					</a>
					</div>
				<?php endif ?>

			  </div>
			</div>
			<?php
		}

	}
	new PVC_Pricing_Table;
}
