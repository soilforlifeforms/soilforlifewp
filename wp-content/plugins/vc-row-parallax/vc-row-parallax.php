<?php
/*
Plugin Name: Parallax Backgrounds for VC
Description: Adds new options to Visual Composer rows to enable parallax scrolling to row background images.
Author: Benjamin Intal, Gambit
Version: 2.3
Author URI: http://gambit.ph
*/

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

defined( 'GAMBIT_VC_PARALLAX_BG' ) or define( 'GAMBIT_VC_PARALLAX_BG', 'gambit-vc-parallax-bg' );


if ( ! class_exists( 'GambitVCParallaxBackgrounds' ) ) {

	/**
	 * Parallax Background Class
	 *
	 * @since	1.0
	 */
	class GambitVCParallaxBackgrounds {


		/**
		 * Constructor, checks for Visual Composer and defines hooks
		 *
		 * @return	void
		 * @since	1.0
		 */
		function __construct() {
			add_action( 'plugins_loaded', array( $this, 'loadTextDomain' ) );
            add_action( 'after_setup_theme', array( $this, 'init' ), 1 );
			add_filter( 'gambit_add_parallax_div', array( __CLASS__, 'createParallaxDiv' ), 10, 3 );
            add_action( 'admin_head', array( $this, 'printAdminScripts' ) );
		}


		/**
		 * Hook into Visual Composer
		 *
		 * @return	void
		 * @since	2.3
		 */
        public function init() {
			// Check if Visual Composer is installed
            if ( ! defined( 'WPB_VC_VERSION' ) ) {
                return;
            }

            if ( version_compare( WPB_VC_VERSION, '4.2', '<' ) ) {
        		add_action( 'init', array( $this, 'addParallaxParams' ), 100 );
            } else {
        		add_action( 'vc_after_mapping', array( $this, 'addParallaxParams' ) );
            }
        }


		/**
		 * There is a bug in Visual Composer where the dependencies do not refresh if the settings
         * are inside a tab, this mini-script fixes this error
		 *
		 * @return	void
		 * @since	2.0
		 */
        public function printAdminScripts() {
            echo "<script>
                jQuery(document).ready(function(\$) {
                \$('body').on('click', '[role=tab]', function() { \$('[name=gmbt_prlx_bg_type]').trigger('change') });
                });
                </script>";
        }


		/**
		 * Loads the translations
		 *
		 * @return	void
		 * @since	1.0
		 */
		public function loadTextDomain() {
			load_plugin_textdomain( GAMBIT_VC_PARALLAX_BG, false, basename( dirname( __FILE__ ) ) . '/languages/' );
		}


		/**
		 * Creates the placeholder for the row with the parallax bg
		 *
		 * @param	string $output An empty string
		 * @param	array $atts The attributes of the vc_row shortcode
		 * @param	string $content The contents of vc_row
		 * @return	string The placeholder div
		 * @since	1.0
		 */
		public static function createParallaxDiv( $output, $atts, $content ) {
			extract( shortcode_atts( array(
				// Old parameter names, keep these for backward rendering compatibility
				'parallax'                => '',
				'speed'                   => '',
				'enable_mobile'           => '',
				'break_parents'           => '',
				'row_span'                => '',
                // BG type
                'gmbt_prlx_bg_type'       => '',
				// Our new parameter names
				'gmbt_prlx_parallax'      => '',
				'gmbt_prlx_speed'         => '',
				'gmbt_prlx_enable_mobile' => '',
				'gmbt_prlx_break_parents' => '',
				'gmbt_prlx_row_span'      => '',
                // Video options
                'gmbt_prlx_video_height_correction' => '0',
                'gmbt_prlx_video_width_correction' => '0',
                'gmbt_prlx_video_youtube' => '',
                'gmbt_prlx_video_youtube_mute' => '',
                'gmbt_prlx_video_youtube_loop_trigger' => '0',
                'gmbt_prlx_video_vimeo'   => '',

			), $atts ) );

			/*
			 * We're using new param names now, support the old ones
			 */

			if ( empty( $gmbt_prlx_parallax ) ) {
				$gmbt_prlx_parallax = $parallax;
			}
			if ( empty( $gmbt_prlx_speed ) ) {
				$gmbt_prlx_speed = $speed;
			}
			if ( empty( $gmbt_prlx_enable_mobile ) ) {
				$gmbt_prlx_enable_mobile = $enable_mobile;
			}
			if ( empty( $gmbt_prlx_break_parents ) ) {
				$gmbt_prlx_break_parents = $break_parents;
			}
			if ( empty( $gmbt_prlx_row_span ) ) {
				$gmbt_prlx_row_span = $row_span;
			}

			/*
			 * Main parallax method
			 */

            $type = 'video';
            if ( empty( $gmbt_prlx_bg_type ) || $gmbt_prlx_bg_type == 'parallax' ) {
                $type = 'parallax';
            }

			if ( empty( $gmbt_prlx_parallax ) ) {
				return "";
			}


            /*
             * Enqueue scripts
             */

            $pluginData = get_plugin_data( __FILE__ );

            // Our main script
            wp_enqueue_script(
                'vc-row-parallax',
                plugins_url( 'js/script.js', __FILE__ ),
                array( 'jquery' ),
                $pluginData['Version'],
                true
            );

            // Our main styles
            wp_enqueue_style(
                'vc-row-parallax',
                plugins_url( 'css/style.css', __FILE__ ),
                array(),
                $pluginData['Version']
            );

            // Our image scroller
			wp_enqueue_script(
                'vc-row-parallax-scrolly',
                plugins_url( 'js/jquery.scrolly-ck.js', __FILE__ ),
                array( 'jquery' ),
                $pluginData['Version'],
                true
            );

            // Our video handler
            if ( $type == 'video' ) {
    			wp_enqueue_script(
                    'vc-row-parallax-video',
                    plugins_url( 'js/bg-video-ck.js', __FILE__ ),
                    array( 'jquery' ),
                    $pluginData['Version'],
                    true
                );
            }


			$parallaxClass = ( $gmbt_prlx_parallax == "none" ) ? "" : "bg-parallax";
			$parallaxClass = in_array( $gmbt_prlx_parallax, array( "none", "up", "down", "left", "right", "bg-parallax" ) ) ? $parallaxClass : "";

            if ( $type == 'video' ) {
                $parallaxClass = "bg-parallax";
            }

            if ( ! $parallaxClass ) {
                return '';
            }

            $videoDiv = "";


            if ( $type == 'video' ) {
                if ( ! empty( $gmbt_prlx_video_youtube ) ) {
                    $videoDiv = "<div id='video-" . rand( 10000,99999 ) . "' data-youtube-video-id='" . $gmbt_prlx_video_youtube . "' data-mute='" . ( $gmbt_prlx_video_youtube_mute == 'mute' ? 'true' : 'false' ) . "' data-loop-adjustment='" . $gmbt_prlx_video_youtube_loop_trigger . "' data-height-correction='" . $gmbt_prlx_video_height_correction . "' data-width-correction='" . $gmbt_prlx_video_width_correction . "'><div id='video-" . rand( 10000,99999 ) . "-inner'></div></div>";
                } else if ( ! empty( $gmbt_prlx_video_vimeo ) ) {
                    $videoDiv = '<div id="video-' . rand( 10000,99999 ) . '" data-vimeo-video-id="' . $gmbt_prlx_video_vimeo . '"  data-height-correction="' . $gmbt_prlx_video_height_correction . '" data-width-correction="' . $gmbt_prlx_video_width_correction . '"><iframe src="//player.vimeo.com/video/' . $gmbt_prlx_video_vimeo . '?html5=1&autopause=0&autoplay=1&badge=0&byline=0&loop=1&title=0" frameborder="0"></iframe></div>';
                }
            }


			return  "<div style='pointer-events : none;' class='" . esc_attr( $parallaxClass ) . "' data-direction='" . esc_attr( $gmbt_prlx_parallax ) . "' data-velocity='" . esc_attr( (float)$gmbt_prlx_speed * -1 ) . "' data-mobile-enabled='" . esc_attr( $gmbt_prlx_enable_mobile ) . "' data-break-parents='" . esc_attr( $gmbt_prlx_break_parents ) . "' data-row-span='" . esc_attr( $gmbt_prlx_row_span ) . "'>" . $videoDiv . "</div>";
		}


		/**
		 * Adds the parameter fields to the VC row
		 *
		 * @return	void
		 * @since	1.0
		 */
		public function addParallaxParams() {
			$setting = array(
				"type" => "dropdown",
				"class" => "",
				"heading" => __( "Background Type", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_bg_type",
				"value" => array(
					"Image Parallax" => "parallax",
					"Video" => "video",
				),
				"description" => __( "", GAMBIT_VC_PARALLAX_BG ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "textfield",
				"class" => "",
				"heading" => __( "YouTube Video ID", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_video_youtube",
				"value" => "",
				"description" => __( "Enter the video ID of the YouTube video you want to use as your background. You can see the video ID from your video's URL: https://www.youtube.com/watch?v=XXXXXXXXX (The X's is the video ID). <em>Ads will show up in the video if it has them.</em> No video will be shown if left blank. <strong>Tip: newly uploaded videos may not display right away and might show an error message</strong>", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_bg_type",
                    "value" => array( "video" ),
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "textfield",
				"class" => "",
				"heading" => __( "Vimeo Video ID", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_video_vimeo",
				"value" => "",
				"description" => __( "Enter the video ID of the Vimeo video you want to use as your background. You can see the video ID from your video's URL: https://vimeo.com/XXXXXXX (The X's is the video ID). No video will be shown if left blank. <strong>Tip: Vimeo sometimes has problems with Firefox</strong>", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_bg_type",
                    "value" => array( "video" ),
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "checkbox",
				"class" => "",
				"heading" => __( "Mute YouTube Video", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_video_youtube_mute",
				"value" => array( __( "Check this to mute your video", GAMBIT_VC_PARALLAX_BG ) => "mute" ),
				"description" => __( "", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_video_youtube",
                    "not_empty" => true,
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "checkbox",
				"class" => "",
				"heading" => __( "Mute YouTube Video", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_video_youtube_mute",
				"value" => array( __( "Check this to mute your video", GAMBIT_VC_PARALLAX_BG ) => "mute" ),
				"description" => __( "", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_video_youtube",
                    "not_empty" => true,
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "textfield",
				"class" => "",
				"heading" => __( "YouTube Loop Triggering Refinement", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_video_youtube_loop_trigger",
				"value" => "0",
				"description" => '<div class="dashicons dashicons-megaphone" style="color: #e74c3c"></div> ' . __( "<strong>Use this if you see a noticeable dark video frame before the video loops.</strong> Because YouTube performs it's video looping with a huge noticeable delay, we try our best to guess when the video exactly ends and trigger a loop when we <em>just</em> reach the end. If there's a dark frame, put in a time here in milliseconds that we can use to push back the looping trigger. Try values from 5-100 milliseconds.", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_video_youtube",
                    "not_empty" => true,
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "textfield",
				"class" => "",
				"heading" => __( "Vertical Black Bars Fix (Video Height Correction)", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_video_height_correction",
				"value" => '0',
				"description" => '<div class="dashicons dashicons-megaphone" style="color: #e74c3c"></div> ' . __( "<strong>Use this if your video is showing black bars on its sides</strong>. To get rid of the black bars, we need to make your video a bit <strong>taller</strong>. The value you put here will be added to the height of the video. Your video will be clipped a little on the sides because of this. This is a percentage value, try using a value of 0.1 to 100.0", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_bg_type",
                    "value" => array( "video" ),
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "textfield",
				"class" => "",
				"heading" => __( "Horizontal Black Bars Fix (Video Width Correction)", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_video_width_correction",
				"value" => '0',
				"description" => '<div class="dashicons dashicons-megaphone" style="color: #e74c3c"></div> ' . __( "<strong>Use this if your video is showing black bars on the top and bottom</strong>. To get rid of the black bars, we need to make your video a bit <strong>wider</strong>. The value you put here will be added to the width of the video. Your video will be clipped a little on the top and bottom. because of this. This is a percentage value, try using a value of 0.1 to 100.0", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_bg_type",
                    "value" => array( "video" ),
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "dropdown",
				"class" => "",
				"heading" => __( "Background Image Parallax", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_parallax",
				"value" => array(
					"No Parallax" => "none",
					"Up" => "up",
					"Down" => "down",
					"Left" => "left",
					"Right" => "right",
				),
				"description" => __( "<strong><em>To select a background image, head over to the <strong>Design Options</strong> tab and upload an image there.</em></strong><br><br>Select the parallax effect for your background image in this field. Be mindful of the <strong>background size</strong> and the <strong>dimensions</strong> of your background image when setting this value. For example, if you're performing a vertical parallax (up or down), make sure that your background image has a large height that can provide sufficient scrolling space for the parallax effect.", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_bg_type",
                    "value" => array( "parallax" ),
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "textfield",
				"class" => "",
				"heading" => __( "Parallax Speed", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_speed",
				"value" => "0.3",
				"description" => __( "The movement speed, value should be between 0.1 and 1.0. A lower number means slower scrolling speed. Be mindful of the <strong>background size</strong> and the <strong>dimensions</strong> of your background image when setting this value. Faster scrolling means that the image will move faster, make sure that your background image has enough width or height for the offset.", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_bg_type",
                    "value" => array( "parallax" ),
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "checkbox",
				"class" => "",
				"param_name" => "gmbt_prlx_enable_mobile",
				"value" => array( __( "Check this to enable the parallax effect in mobile devices", GAMBIT_VC_PARALLAX_BG ) => "parallax-enable-mobile" ),
				"description" => __( "Parallax effects would most probably cause slowdowns when your site is viewed in mobile devices. If the device width is less than 980 pixels, then it is assumed that the site is being viewed in a mobile device.", GAMBIT_VC_PARALLAX_BG ),
                "dependency" => array(
                    "element" => "gmbt_prlx_bg_type",
                    "value" => array( "parallax" ),
                ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "dropdown",
				"class" => "",
				"heading" => __( "Breakout Parallax & Video Background", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_break_parents",
				"value" => array(
					"Don't break out the row container" => "0",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 1, GAMBIT_VC_PARALLAX_BG ), 1 ) => "1",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 2, GAMBIT_VC_PARALLAX_BG ), 2 ) => "2",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 3, GAMBIT_VC_PARALLAX_BG ), 3 ) => "3",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 4, GAMBIT_VC_PARALLAX_BG ), 4 ) => "4",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 5, GAMBIT_VC_PARALLAX_BG ), 5 ) => "5",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 6, GAMBIT_VC_PARALLAX_BG ), 6 ) => "6",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 7, GAMBIT_VC_PARALLAX_BG ), 7 ) => "7",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 8, GAMBIT_VC_PARALLAX_BG ), 8 ) => "8",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 9, GAMBIT_VC_PARALLAX_BG ), 9 ) => "9",
					sprintf( _n( "Break out of 1 container", "Break out of %d containers", 10, GAMBIT_VC_PARALLAX_BG ), 10 ) => "10",
					__( "Break out of all containers (full page width)", GAMBIT_VC_PARALLAX_BG ) => "99",
				),
				"description" => __( "The parallax or video effect is contained inside a Visual Composer row, depending on your theme, this container may be too small for your parallax effect. Adjust this option to let the parallax effect stretch outside it's current container and occupy the parent container's width.", GAMBIT_VC_PARALLAX_BG ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );

			$setting = array(
				"type" => "dropdown",
				"class" => "",
				"heading" => __( "Breakout Parallax & Video Row Span", GAMBIT_VC_PARALLAX_BG ),
				"param_name" => "gmbt_prlx_row_span",
				"value" => array(
					"Occupy this row only" => "0",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 1, GAMBIT_VC_PARALLAX_BG ), 1 ) => "1",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 2, GAMBIT_VC_PARALLAX_BG ), 2 ) => "2",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 3, GAMBIT_VC_PARALLAX_BG ), 3 ) => "3",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 4, GAMBIT_VC_PARALLAX_BG ), 4 ) => "4",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 5, GAMBIT_VC_PARALLAX_BG ), 5 ) => "5",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 6, GAMBIT_VC_PARALLAX_BG ), 6 ) => "6",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 7, GAMBIT_VC_PARALLAX_BG ), 7 ) => "7",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 8, GAMBIT_VC_PARALLAX_BG ), 8 ) => "8",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 9, GAMBIT_VC_PARALLAX_BG ), 9 ) => "9",
					sprintf( _n( "Occupy also the next row", "Occupy also the next %d rows", 10, GAMBIT_VC_PARALLAX_BG ), 10 ) => "10",
				),
				"description" => __( "The parallax or video effect is normall only applied for this Visual Composer row. You can choose here if you want this parallax background to also span across the next Visual Composer row. Remember to clear the background of the next row so as not to cover up the parallax.", GAMBIT_VC_PARALLAX_BG ),
				"group" => __( "Image Parallax / Video", GAMBIT_VC_PARALLAX_BG ),
			);
			vc_add_param( 'vc_row', $setting );
		}
	}


	new GambitVCParallaxBackgrounds();
}



if ( ! function_exists( 'vc_theme_before_vc_row' ) ) {


	/**
	 * Adds the placeholder div right before the vc_row is printed
	 *
	 * @param	array $atts The attributes of the vc_row shortcode
	 * @param	string $content The contents of vc_row
	 * @return	string The placeholder div
	 * @since	1.0
	 */
	function vc_theme_before_vc_row($atts, $content = null) {
		return apply_filters( 'gambit_add_parallax_div', '', $atts, $content );
	}
}
