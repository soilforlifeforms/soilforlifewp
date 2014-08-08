<?php
if ( !class_exists( 'PVC_List_Posts' ) && class_exists( 'Pure_Shortcode_Abstract' ) ) {
	class PVC_List_Posts extends Pure_Shortcode_Abstract {

		function setup_vc_atts() {
			$defaults = array(
				'categories' => array(),
				'tags' => array(),
				'post_count' => 5,
				'page' => false,
				'item_size' => array(
					"" => "Preserve Default",
					"1" => '4 Columns',
					"2" => '3 Columns',
					"3" => '2 Columns',
				),
				'layout_type' => array(
					"regular" => 'Regular Masonry',
					"modern" => 'Modern Masonry',
				),
			);
			$categories_options = array();
			$tags_options = array();


			// Save on Queries here
			// We need this only from admin side
			if ( is_admin() ) {
				$post_categories = ($temp = get_terms('category')) ? $temp : array();
				foreach($post_categories as $cat) {
					$categories_options[$cat->term_id] = $cat->name;
				}
				
				$post_tags = ($temp = get_terms('post_tag')) ? $temp : array();
				foreach($post_tags as $tag) {
					$tags_options[$tag->term_id] = $tag->name;
				}
			}
			



			$params = array(
				array(
					'param_name' => 'item_size',
					'type' => 'dropdown',
					'value' => array_flip( $defaults['item_size'] ),
				),

				array(
					'param_name' => 'layout_type',
					'type' => 'dropdown',
					'value' => array_flip( $defaults['layout_type'] ),
				),

				array(
					'param_name' => 'post_count',
					'value' => $defaults['post_count'],
				),

				array(
					'param_name' => 'categories',
					'type' => 'checkbox',
					'value' => array_flip( $categories_options ),
				),
				
				array(
					'param_name' => 'tags',
					'type' => 'checkbox',
					'value' => array_flip( $tags_options ),
				),

			);


			$this -> atts = array(
				"base" => "list_posts",
				"category" => __( 'Positivus', 'pure' ),
				"params" => $params,
			);


		}

		function before_block( $instance ) {
			// $atts = shortcode_atts( $this -> shortcode_atts, $instance );
		}

		function after_block( $instance ) {
			// $atts = shortcode_atts( $this -> shortcode_atts, $instance );
		}


		function block($instance) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
			extract($atts);

			$override = array();

			if( $item_size ) {
				$override['masonry_width'] = "w{$item_size}";
				$override['post_height'] = "h{$item_size}";
			}

			Pure::add_override($override);
			?>
			
			<?php 
			$args = array();

			if( $post_count ) { $args['posts_per_page'] = $post_count; }
			if( $categories ) { $args['category__in'] = $categories; }
			if( $tags ) { $args['tag__in'] = $tags; }
			

			$posts = new WP_Query( $args );
			
			
			?>
				<div class="boxed masonry <?php echo $layout_type ?> entry-list js__items--list js__packery">

					<?php if ( $posts->have_posts() ) : while ( $posts->have_posts() ) : $posts->the_post(); ?>
						<?php get_template_part( "parts/boxed/entry" ); ?>
					<?php endwhile; endif; wp_reset_postdata(); ?>			
				</div>
			<?php
			Pure::clear_override();
		}

	}
	new PVC_List_Posts;
}
