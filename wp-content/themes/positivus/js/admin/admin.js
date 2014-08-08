(function() {
    var a, b, c, d, e;
    a = jQuery, d = function(b) {
        var d, f, g;
        return d = a(b.target), g = d.closest(".description"), f = d.closest(".block-options"), 
        g.hasClass("js__style") ? e(d) : g.hasClass("js__opacity") ? c(b, d, f) : void 0;
    }, e = function(b) {
        var c, d, e, f, g, h, i, j, k;
        for (null == b && (b = !1), h = b ? b.find("option:selected") : a(".js__style").find("option:selected"), 
        k = [], f = i = 0, j = h.length; j > i; f = ++i) g = h[f], d = a(g), c = d.closest(".block-options"), 
        e = d.val() || !1, "parallax" === e ? k.push(c.find(".js__parallax").slideDown()) : k.push(c.find(".js__parallax").slideUp());
        return k;
    }, c = function(a, b, c) {
        var d, e, f;
        return e = b.val(), f = e / 100, 100 >= e && e >= 0 ? (b.css({
            "background-color": ""
        }), d = c.find(".reference-image img"), d.length > 0 ? d.stop().animate({
            opacity: f
        }, 100) : void 0) : (b.css({
            "background-color": "#fc5c5c"
        }), a.preventDefault(), !1);
    }, b = a(".js__options"), b.on("change input", d), b.addClass("collapsed").find(".column").slideUp(), 
    b.find(".reference-image").find("img").each(function(b, c) {
        var d;
        return d = a(c), d.clone().addClass("tiny-preview js__toggle_options").appendTo(d.closest(".js__options"));
    }), b.find(".js__toggle_options").click(function(c) {
        var d;
        return c.preventDefault(), d = a(c.currentTarget), b = d.closest(".js__options"), 
        b.toggleClass("collapsed"), b.children(".column").slideToggle(), b.children(".tiny-preview").fadeToggle();
    }), e();
}).call(this);