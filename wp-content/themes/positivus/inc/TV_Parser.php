<?php

 class TV_Parser {


	/**
	 * Prettify a string or an array
	 * Think of this as "anti-sanitize_title"
	 * Turns a "sluggish" string/array into a pretty one
	 * @param  mixed  $var  	Something Ugly
	 * @param  boolean $flip 	Only if $var is array - result is flipped.
	 * @return (mixed)       	For whatever one sows, that will he also reap
	 */
	public static function prettify( $var, $flip = false ) {

		if ( is_string( $var ) ) {
			$var = str_replace( array( "-", "_" ), " ", $var );
			$var = ucwords( $var );

			return $var;

		} elseif ( is_array( $var ) ) {

			foreach ( $var as $key => $value ) {
				$pretty = self::prettify( $value );
				$out[$key] = $pretty;
			}

			if ( $flip === true ) {
				$out = array_flip( $out );
			}

			return $out;
		}

		trigger_error("Abstract_Shortcode::prettify was expecting a string or an array, received something else.", E_WARRNING);
		return $var;
	}

	public static function make_int() {
		static $count;
		return "random-id-" . ++$count;
	}

	public static function parse_sections( $sections ) {
		foreach ($sections as $section_key => $section ) {
			
				if ( ! isset( $section['fields'] ) ) {
					continue;
				}

				foreach( $section['fields'] as $key => $field ) {

						if ( !isset( $field['title'] ) 
							 && isset( $field['id'] )
							 && $field['type'] != 'divide'
						) {
							$field['title'] = self::prettify( $field['id'] );
						}
						$sections[$section_key]['fields'][$key] = $field;
				}
		}
		return $sections;
	} // func parse_sections()

 }