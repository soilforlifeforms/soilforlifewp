<?php
// Generic Settings
$site_logo = Pure::get_theme_mod( "site_logo", null );

if ( $site_logo && is_array( $site_logo ) && ! empty( $site_logo['url'] ) ) {
	$site_logo = $site_logo['url'];
} else {
	$site_logo = null;
}


// Get the Responsive Logo
$responsive_logo = Pure::get_theme_mod( "responsive_logo", null );
if(  is_array( $responsive_logo ) && ! empty( $responsive_logo['url'] ) ) {
	$responsive_logo = $responsive_logo['url'];
} else {
	$responsive_logo = $site_logo;
}
$site_title = get_bloginfo( 'name' );

?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<title><?php wp_title( '|', true, 'right' ); ?></title>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
<?php wp_head(); ?>
<!--[if lt IE 9]>
<script>var is_msie = true;</script>
<script src="<?php echo get_template_directory_uri(); ?>/js/ie/html5.js"></script>
<script src="<?php echo get_template_directory_uri(); ?>/js/ie/selectivizr-min.js"></script>
<![endif]-->
<!--[if lt IE 10]>
<link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/css/ie.css">
<![endif]-->
</head>
<body <?php body_class("fixed-menu"); ?>>
<div id="loading-spinner">
	<div class="inner">
		<!-- Yes Kind Sir, I class poops here for loading animation. -->
		<i class="poop"></i>
		<i class="poop"></i>
		<i class="poop"></i>
		<i class="poop"></i>
	</div>
</div>

<?php
 wp_nav_menu(
	array( 
		'theme_location' => 'primary',
		'menu_class' => 'responsive-menu',
		'container_id' => 'responsive-menu',
		'menu_id' => 'menu-responsive-menu',
		'fallback_cb' => false,
	)
);  
?>


<?php if ( is_page() ): ?>
	<?php 
	$vc_block = Pure::get_post_meta('page_header_pvc_block_cached', false);
	$page_header_image = Pure::get_post_meta('page_header_image', false);
	$page_header_content = Pure::get_post_meta('page_header_content', false);
	?>

	<?php if ( $vc_block || $page_header_image || $page_header_content ): ?>
		<?php get_template_part( "parts/header-before" ); ?>
	<?php endif; ?>	
	
<?php endif; ?>

<div id="page" class="hfeed site">
	<?php do_action( 'before' ); ?>
	<header id="header" class="site-header" role="banner">
		<div class="inner-container">
			<div class="site-branding">
				<h1 class="site-title<?php if ( null != $site_logo ) echo " image"; ?>">
					<!-- BEGIN Logo -->
					<a id="logo" class="site-logo" href="<?php echo home_url( '/' ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
						<?php if ( null != $site_logo ): ?>
							<img src="<?php echo esc_url( $site_logo ); ?>" alt="<?php bloginfo( 'name' ); ?>" />
						<?php else: ?>   
							<?php bloginfo( 'name' ); ?>
						<?php endif; ?>
					</a>
					<!-- END Logo -->
				</h1>
			</div>

			<nav id="navigation" class="site-navigation" role="navigation">
				<div class="screen-reader-text skip-link"><a href="#content" title="<?php esc_attr_e( 'Skip to content', 'pure' ); ?>"><?php _e( 'Skip to content', 'pure' ); ?></a></div>
				<?php
					wp_nav_menu(
						array( 
							'theme_location' => 'primary',
							'menu_class' => 'sf-menu',
							'menu_id' => 'menu-main-menu',
							'container_class' => 'sf-container',
							'fallback_cb' => 'village_menu_fallback_function',
						)
					); 
				?>
			</nav><!-- #navigation -->
		</div>
	</header><!-- #header -->

	<div id="header--responsive" class="site-header">
		
		<div class="site-branding bg-primary">
			<h1 class="site-title <?php if ( null != $responsive_logo ) echo " image"; ?>">
				<!-- BEGIN Logo -->
				<a class="site-logo" href="<?php echo home_url( '/' ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
					<?php if ( null != $responsive_logo ): ?>
						<img src="<?php echo esc_url( $responsive_logo ); ?>" alt="<?php $site_title ?>" />
					<?php else: ?>   
						<?php $site_title ?>
					<?php endif; ?>
				</a>
				<!-- END Logo -->
			</h1>
		</div>

		<div class="toggle"><div><i></i><i></i><i></i></div></div>

	</div> <!-- #responsive-header -->


	<?php if( 
		Pure::is_enabled("sub_header", true)
		&& ! is_singular( array("post", "portfolio") )
		&& ! is_404() ): ?>
		<?php get_template_part("parts/header-after"); ?>
	<?php endif; ?>

	<div id="main" class="site-main"><?php // just some space

















