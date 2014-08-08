<?php

if (class_exists('WP_Customize_Control'))
{
    /**
     * Class to create a custom post control
     */
    class Page_Dropdown_Custom_control extends WP_Customize_Control
    {
          /**
           * Render the content on the theme customizer page
           */
          public function render_content()
           {
            $value = $this->value();

                ?>
                    <label>
                      <span class="customize-post-dropdown"><?php echo esc_html( $this->label ); ?></span>
                      <select name="<?php echo $this->id; ?>" data-customize-setting-link="<?php echo $this->id; ?>">
                      <?php
                          $posts = get_pages();
                          foreach ( $posts as $post ) {
                            echo '<option value="'.$post->ID.'" '.selected($value, $post->ID).'>'.$post->post_title.'</option>';
                          }
                        ?>
                      </select>
                    </label>
                <?php
           }
    }
}