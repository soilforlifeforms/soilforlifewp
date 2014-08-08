<?php
class Pure_Migrate_Legacy_Portfolio extends Pure_Portfolio {

	public static function migrate() {
		$portfolio_posts = new WP_Query("post_type=portfolio&numberposts=-1");

		while ( $portfolio_posts->have_posts() ): $portfolio_posts -> the_post();
			$post_id = get_the_ID();
			$meta_key = apply_filters( "pure_portfolio_prefix", "pure_portfolio_" ) . "project_images";

			$images = (array) self::get_image_ids( $post_id );
			$meta	= (array) get_post_meta( $post_id, $meta_key, false );

			foreach ($images as $image_id) {
				if ( ! in_array( $image_id, $meta ) ) {
					add_post_meta( $post_id, $meta_key , $image_id, false );

				}
			}
		endwhile;
		update_option( "pure_portfolio_already_migrated", true );
	}

	public static function get_image_ids($post_id = false) {
		// Make sure we have a $post_id
		if ( false === $post_id) {
			$post_id = get_the_ID();
		}	

		$image_ids = parent::get_image_ids($post_id);

		if ( ! empty( $image_ids ) && is_array( $image_ids ) ) {

			return $image_ids;

		} else {

			$thumbnail_id = get_post_thumbnail_id( $post_id );
			$photos = get_children( array(
							'post_parent' => $post_id,
							'post_status' => 'inherit',
							'post_type' => 'attachment',
							'post_mime_type' => 'image',
							'order' => 'ASC',
							'orderby' => 'menu_order ID',
							'exclude' => $thumbnail_id
							) 
			);

			$results = array();

			if ( $photos && !is_wp_error( $photos ) ) {
				foreach ($photos as $photo) {
					$results[] = $photo->ID;
				}
			}

			return $results;
		}
	}

}



