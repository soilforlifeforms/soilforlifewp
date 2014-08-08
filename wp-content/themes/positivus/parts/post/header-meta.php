<?php
// BEGIN Categories
// 
if ( Pure::is_enabled( 'content_header_categories', true) ):
		/* translators: used between list items, there is a space after the comma */
		$categories_list = get_the_category_list( __( ', ', 'pure' ) );
		if ( $categories_list && pure_categorized_blog() ) :
?>
	<div class="meta-cell">
		<span class="cat-links">
			<div class="meta-icon meta-category "></div>
			<?php printf( __( '%1$s', 'pure' ), $categories_list ); ?>
		</span>
	</div>
<?php 
		endif; 
endif;
// END Categories 
?>


<?php
// BEGIN Tags
if ( Pure::is_enabled( 'content_header_tags', true) ):
	/* translators: used between list items, there is a space after the comma */
	$tags_list = get_the_tag_list( '', __( ', ', 'pure' ) );
	if ( $tags_list ) :
?>
<div class="meta-cell">
	<span class="tags-links">
		<div class="meta-icon meta-tag "></div>
		<?php echo $tags_list; ?>
	</span>
</div>
<?php 
	endif; 
endif;
// END Tags 
?>


<?php
// BEGIN Comments
if ( comments_open() && Pure::is_enabled( 'content_header_comment_count', true) ):
	/* translators: used between list items, there is a space after the comma */
?>
<div class="meta-cell">
	<div class="meta-icon meta-comments"></div>
	<a class="link-to-comments"href="<?php comments_link(); ?>">
		<?php
		printf( 
	       _nx( '%1$s Comment', '%1$s Comments', get_comments_number(), 'comments', 'pure' ),
			number_format_i18n( get_comments_number() ) 
		);
		?>
	</a>
</div>
<?php 
endif;
// END Comments 
?>

<?php
// BEGIN Comments
if ( comments_open() && Pure::is_enabled( 'content_header_post_author', true) ):
	/* translators: used between list items, there is a space after the comma */
?>
<div class="meta-cell">
	<div class="meta-icon meta-author"></div>
	<?php the_author_posts_link(); ?>
</div>
<?php 
endif;
// END Comments 
?>

<?php
// BEGIN Edit Post
if ( current_user_can( "edit_posts" ) ):
?>
<div class="meta-cell">
	<?php edit_post_link( __( 'Edit', 'pure' ), '<span class="edit-link">', '</span>' ); ?>
</div>
<?php 
endif;
// END Tags 
?>

<?php

















