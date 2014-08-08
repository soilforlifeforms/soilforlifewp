<?php
function pure_cc_generate_javascript($config) {
  $out = '<script>(function($){
    $(document).ready(function(){
    ';

  foreach ($config as $c) {
    // Live cleanup of CSS Selectors 
    $css_selector = preg_replace("/::?[\w-]+/", "", $c['css_selector']);


    $out .= "
    wp.customize('acid_options[$c[php_variable]]',function( value ) {
        value.bind(function(to) {
          if(!to) {
            $('$css_selector').removeAttr('style');
          } 
          else {
            $('$css_selector').css('$c[css_property]', to);
          }
          });
      });
    ";
  }

  $out .= ' }); })(jQuery);</script>';

  return $out;
}