<?php
/**
 * Get the Config from JSON File
 * @return (mixed) Array with config or false on error
 */
function pure_cc_get_config() {
	$json = Pure::get_file_contents("colors.config.json");
	$config = json_decode($json, true);

	if ( is_array($config) ) {
		return $config;
	}
	return false;
}

/**
 * Generate CSS from the colors.config.json file
 */
/**
 * Generate CSS from the colors.config.json file
 */
function pure_cc_generate_css() {
	$config = pure_cc_get_config();
	if( false == $config ) { return; }
	
	$out = '<style type="text/css">';

	$theme_color = Pure::get_theme_mod( "brand_color", false );
	$font_on_theme = Pure::get_theme_mod( "brand_color_contrast", false );

	if ( false != $theme_color && false != $font_on_theme ) {
		$out .= "
		::-moz-selection {
			background-color: $theme_color;
			color: $font_on_theme;
		}

		::selection {
			background-color: $theme_color;
			color: $font_on_theme;
		}
		";
	}

	foreach ($config as $value) {
		$css_value = Pure::get_theme_mod($value['var'], null);
		if( $css_value == null or $css_value == $value["color"] ) {  continue;  }

		else {
			foreach ($value["selectors"] as $property => $selectors) {
				
				$selector = implode(", ", $selectors);
				$out .= "
				$selector {
					{$property}: {$css_value};
				}
				";
			}
		}

	}

	$custom_logo_width = Pure::get_theme_mod("logo_width", false);

	if ( $custom_logo_width && $custom_logo_width != "33" ) {
		$nav_width = 100 - $custom_logo_width;
		$out .= "
		.site-branding {
			width: $custom_logo_width%;
		}
		#navigation {
			width: $nav_width%;
		}
		";
	}




	$out .= Pure::get_theme_mod("custom_css", null);
	$out .= '</style>';
	// $out = str_replace("a a:hover", "a:hover", $out);
	echo preg_replace( '/\s+/', ' ', $out );;
}
	
	













