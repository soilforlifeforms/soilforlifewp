<header class="entry-header">
	<h2 class="entry-title">	
		<?php if ( ! is_single() ): ?>
			<a href="<?php the_permalink(); ?>" title="<?php echo esc_attr( sprintf( __( 'Permalink to %s', 'puremellow' ), the_title_attribute( 'echo=0' ) ) ); ?>" rel="bookmark">
				<?php the_title(); ?>
			</a>	
		<?php else: ?>
			<?php the_title(); ?>
		<?php endif; ?></h2>		
</header><!-- .entry-header -->