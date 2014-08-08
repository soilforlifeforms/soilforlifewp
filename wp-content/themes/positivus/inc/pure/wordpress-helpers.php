<?php

/**
 * Wordpress is a little unreliable getting the current page.
 * @return int Page Number
 */
function get_current_page() {
	if ( get_query_var('paged') ) { 
		return get_query_var('paged'); 
	}
	elseif ( get_query_var('page') ) { 
		return get_query_var('page'); 
	}
	else { 
		return 1; 
	}
}


/**
 * Do Exactly what the function name says
 * Because sometimes you may want either a post format or a post 
 */
function get_post_format_or_type() {
	if ( $format = get_post_format() ) {
		return $format;
	} else {
		return get_post_type();
	}
}


/* -----------------------------------*/
/* 		In case sanitize_hex_color doesn't exist
/* -----------------------------------*/
if ( ! function_exists( "sanitize_hex_color") ) {
	function sanitize_hex_color( $color ) {
		if ( '' === $color )
			return '';

		// 3 or 6 hex digits, or the empty string.
		if ( preg_match('|^#([A-Fa-f0-9]{3}){1,2}$|', $color ) )
			return $color;

		return null;
	}
}

/* -----------------------------------*/
/* 		Get post color
/* -----------------------------------*/
function get_post_color($post_id, $meta, $fallback) {

	if ( is_numeric($post_id) ) {
		$color = get_post_meta( $post_id, "pure_" . $meta, true );	
	}

	if ( empty( $color ) ) {
		$color = Pure::get_theme_mod($fallback, false);
	}
	
	return sanitize_hex_color( $color );
}


