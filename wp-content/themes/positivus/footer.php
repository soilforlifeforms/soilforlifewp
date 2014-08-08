<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the id=main div and all content after
 *
 */
$data = array();
$data = array_filter($data);

$footer_block_id = Pure::get_theme_mod('footer_vc_block', 0);
?>

	</div><!-- #main -->
</div><!-- #page -->
	
<?php if ( is_numeric( $footer_block_id ) && 0 != $footer_block_id ): ?>
	<footer id="footer" class="site-footer" role="contentinfo"<?php Pure::render_data("scrolltop", $data); ?>>	
		<?php echo do_shortcode( get_post_field( 'post_content', $footer_block_id ) ); ?>
	</footer>
<?php endif; ?>

<?php 
	wp_footer(); 
?></body>
</html>

