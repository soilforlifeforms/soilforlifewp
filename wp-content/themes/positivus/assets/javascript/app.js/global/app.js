"use strict";
var $, $$, App, Dump, global, select, setup_global_values;

$ = jQuery;

$$ = $.q;

$.fx.speeds._default = 700;

select = {
  body: "html, body",
  header: "#header",
  header_block: "#header-block",
  content: "#content",
  footer: "#footer",
  item: {
    single: ".js__items--single-item",
    list: ".js__items--list"
  }
};

App = {
  callback: {
    layout: jQuery.Callbacks(),
    packery: jQuery.Callbacks(),
    previewer: jQuery.Callbacks(),
    recollect: jQuery.Callbacks()
  },
  state: {
    responsive: null,
    width: 0
  },
  dfd: {},
  sniff: {},
  Packery: false,
  Util: false,
  Loading: false,
  Infinite: false
};

setup_global_values = function(select) {
  var $value, global, key, second_key, second_value, value;
  global = {
    window: $(window),
    document: $(document)
  };
  for (key in select) {
    value = select[key];
    if (_.isString(value)) {
      $value = $(value);
      global[key] = $value.length === 0 ? false : $value;
    } else {
      global[key] = {};
      for (second_key in value) {
        second_value = value[second_key];
        $value = $(second_value);
        global[key][second_key] = $value.length === 0 ? false : $value;
      }
    }
  }
  global.document.trigger("pure:globals");
  return global;
};

global = setup_global_values(select);

global.window.on("orientationchange", function() {
  global.window.trigger("debouncedresize");
  return $.waypoints("refresh");
});

/*
				DEBUGGING TOOLS BELOW
*/


Dump = function(message) {
  return null;
};
