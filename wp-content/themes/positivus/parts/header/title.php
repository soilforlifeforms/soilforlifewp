<?php
	if ( is_category() ) :
		printf( __( 'Category: %s', 'pure' ), '<span>' . single_cat_title( '', false ) . '</span>' );

		// show an optional category description
		$category_description = category_description();
		if ( ! empty( $category_description ) ) :
			echo apply_filters( 'category_archive_meta', '<div class="taxonomy-description">' . $category_description . '</div>' );
		endif;

	elseif ( is_tag() ) :
		printf( __( 'Tag: %s', 'pure' ), '<span>' . single_tag_title( '', false ) . '</span>' );
		// show an optional tag description
		$tag_description = tag_description();
		if ( ! empty( $tag_description ) ) :
			echo apply_filters( 'tag_archive_meta', '<div class="taxonomy-description">' . $tag_description . '</div>' );
		endif;

	elseif ( is_author() ) :
		/* Queue the first post, that way we know
		 * what author we're dealing with (if that is the case).
		*/
		the_post();
		printf( __( 'Author Archives: %s', 'pure' ), '<span class="vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '" title="' . esc_attr( get_the_author() ) . '" rel="me">' . get_the_author() . '</a></span>' );
		/* Since we called the_post() above, we need to
		 * rewind the loop back to the beginning that way
		 * we can run the loop properly, in full.
		 */
		rewind_posts();

	elseif ( is_day() ) :
		printf( __( 'Daily Archives: %s', 'pure' ), '<span>' . get_the_date() . '</span>' );

	elseif ( is_month() ) :
		printf( __( 'Monthly Archives: %s', 'pure' ), '<span>' . get_the_date( 'F Y' ) . '</span>' );

	elseif ( is_year() ) :
		printf( __( 'Yearly Archives: %s', 'pure' ), '<span>' . get_the_date( 'Y' ) . '</span>' );

	elseif ( is_tax( 'post_format', 'post-format-aside' ) ) :
		_e( 'Asides', 'pure' );

	elseif ( is_tax( 'post_format', 'post-format-image' ) ) :
		_e( 'Images', 'pure');

	elseif ( is_tax( 'post_format', 'post-format-video' ) ) :
		_e( 'Videos', 'pure' );

	elseif ( is_tax( 'post_format', 'post-format-quote' ) ) :
		_e( 'Quotes', 'pure' );

	elseif ( is_tax( 'post_format', 'post-format-link' ) ) :
		_e( 'Links', 'pure' );

	elseif ( is_tax( 'post_format', 'post-format-link' ) ) :
		_e( 'Links', 'pure' );

	elseif ( is_tax( 'project-types' ) || is_tax('skills') ) :
		single_term_title();

	elseif ( is_archive() ) :
		_e( 'Archives', 'pure' );

	else:
		the_title();
	endif;
?>