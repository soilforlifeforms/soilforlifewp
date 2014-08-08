<?php
if ( !class_exists( 'PVC_List_Portfolio_Entries' ) && class_exists( 'Pure_Shortcode_Abstract' ) ) {
	class PVC_List_Portfolio_Entries extends Pure_Shortcode_Abstract {

		function setup_vc_atts() {
			$defaults = array(
				'project_types' => array(),
				'skills' => array(),

				'post_count' => 9,
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
			$skill_terms = array();
			$project_type_terms = array();


			// Save on Queries here
			// We need this only from admin side
			if ( is_admin() ) {
				$skill_terms = $this -> prepare_terms( "skills" );
				$project_type_terms = $this -> prepare_terms( "project-types" );
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
					'param_name' => 'skills',
					'type' => 'checkbox',
					'value' => array_flip( $skill_terms ),
				),
				
				array(
					'param_name' => 'project_types',
					'type' => 'checkbox',
					'value' => array_flip( $project_type_terms ),
				),
			);


			$this -> atts = array(
				"base" => "list_portfolio_entries",
				"category" => __( 'Positivus', 'pure' ),
				"params" => $params,
			);


		}

		function prepare_terms( $taxonomy ) {

			$terms = get_terms( $taxonomy );
			if ( empty( $terms ) ) {
				return array();
			}

			if ( is_wp_error( $terms ) ) {
				trigger_error( "$taxonomy is not a valid taxonomy" );
				return array();
			}

			$out = array();
			foreach ( $terms as $term ) {
				$out[$term->term_id] = $term->name;
			}

			return $out;
		}

		function before_block( $instance ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
		}

		function after_block( $instance ) {
			$atts = shortcode_atts( $this -> shortcode_atts, $instance );
		}


		function block( $instance ) {
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
			$args = array('post_type' => 'portfolio');

			if( $post_count ) { $args['posts_per_page'] = $post_count; }
			
			$args['tax_query'] = array();
			if( $skills ) { 
				$args['tax_query'][] = array(
		    				'taxonomy' => 'skills',
		    				'field' => 'id',
		    				'terms' => $skills
    			);
			}

			if( $project_types ) { 
				$args['tax_query'][] = array(
		    				'taxonomy' => 'project-types',
		    				'field' => 'id',
		    				'terms' => $project_types
    			);
			}
			$posts = new WP_Query( $args );
			?>	
				<div class="<?php echo $layout_type ?> boxed entry-list masonry js__packery js__items--list">
					<?php if ( $posts->have_posts() ) : while ( $posts->have_posts() ) : $posts->the_post(); ?>
						<?php get_template_part( "parts/boxed/entry-portfolio" ); ?>
					<?php endwhile; endif; wp_reset_postdata(); 
					?>			
				</div>
			<?php
			Pure::clear_override();
		}

	}
	new PVC_List_Portfolio_Entries;
}
