<?php 
/*
Plugin Name: Pure Portfolio
Plugin URI: http://www.puremellow.com/pure-portfolio
Description: A plugin that enables your portfolio in Pure Mellow Themes.
Version: 1.1.2
Author: PureMellow
Author URI: http://www.puremellow.com
License: GPL2+
*/

$plugin_path = plugin_dir_path( __FILE__ );


function pure_migrate_legacy_portfolio() {
	
	$migrate_legacy = apply_filters( "pure_portfolio_legacy_support", false );
	$migrated_legacy = get_option("pure_portfolio_already_migrated", false);

	if ( $migrate_legacy === true && $migrated_legacy === false ) {
		require_once( plugin_dir_path( __FILE__ ) . "migrate_legacy.php" );
		Pure_Migrate_Legacy_Portfolio::migrate();
	}
}

// Legacy Support is mostly exclusivley for Pure Mellow Themes: Advantage, Inkberry, Acid and Positivus
// Hopefully this is going to go away some day
register_activation_hook( __FILE__, "pure_migrate_legacy_portfolio" );



if ( ! class_exists( "Pure_Portfolio") ) {
	require_once( $plugin_path . "portfolio.php" );
}
$portfolio = new Pure_Portfolio;




