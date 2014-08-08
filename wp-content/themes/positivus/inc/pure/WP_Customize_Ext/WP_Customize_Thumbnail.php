<?php


if (class_exists('WP_Customize_Control')) {
    class WP_Customize_Thumbnail extends WP_Customize_Control
    {

        public $type = 'option';

        
        /**
         * Render the content on the theme customizer page
         */
        public function render_content() {

    ?>

    <?php _e('Thumbnail size', 'puremellow') ?>
    <label for="thumbnail_size_w"><?php _e('Width', 'puremellow'); ?></label>
    <input name="thumbnail_size_w" type="number" step="1" min="0" id="thumbnail_size_w" value="<?php form_option('thumbnail_size_w'); ?>" class="small-text" />
    <label for="thumbnail_size_h"><?php _e('Height', 'puremellow'); ?></label>
    <input name="thumbnail_size_h" type="number" step="1" min="0" id="thumbnail_size_h" value="<?php form_option('thumbnail_size_h'); ?>" class="small-text" /><br />
    <input name="thumbnail_crop" type="checkbox" id="thumbnail_crop" value="1" <?php checked('1', get_option('thumbnail_crop')); ?>/>
    <label for="thumbnail_crop"><?php _e('Crop thumbnail to exact dimensions (normally thumbnails are proportional)', 'puremellow'); ?></label>



                <?php
        }
    }
}