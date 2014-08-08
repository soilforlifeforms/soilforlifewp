/*
Thanks goes to rds from Stack Overflow:
http://stackoverflow.com/questions/8151278/jquery-unbind-or-rebind-hoverintent
 */
(function($) {
   if (typeof $.fn.hoverIntent === 'undefined')
     return;

   var rawIntent = $.fn.hoverIntent;

   $.fn.hoverIntent = function(handlerIn,handlerOut,selector) 
    {
      // If called with empty parameter list, disable hoverintent.
      if (typeof handlerIn === 'undefined')
      {
        // Destroy the time if it is present.
        if (typeof this.hoverIntent_t !== 'undefined') 
        { 
          this.hoverIntent_t = clearTimeout(this.hoverIntent_t); 
        }
        // Cleanup all hoverIntent properties on the object.
        delete this.hoverIntent_t;
        delete this.hoverIntent_s;

        // Unbind all of the hoverIntent event handlers.
        this.off('mousemove.hoverIntent,mouseenter.hoverIntent,mouseleave.hoverIntent');

        return this;
      }  

      return rawIntent.apply(this, arguments);
    };  
})(jQuery);