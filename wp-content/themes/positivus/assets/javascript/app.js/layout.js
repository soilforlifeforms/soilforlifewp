(function() {
  var $pricing_columns, Media_Column_Resize, align_columns, mcr,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  align_columns = function(column_container) {
    var $action, $features, $price, $pricing_columns, $title, actions, fcol, features, key, prices, titles, _i, _len;
    $pricing_columns = $(column_container).find(".pricing-column");
    $features = $pricing_columns.find(".features");
    $price = $pricing_columns.find(".price");
    $action = $pricing_columns.find(".action");
    $title = $pricing_columns.find(".pricing-column__title");
    if ($features.length === 0) {
      return;
    }
    prices = [];
    features = [];
    actions = [];
    titles = [];
    for (key = _i = 0, _len = $features.length; _i < _len; key = ++_i) {
      fcol = $features[key];
      prices.push($($price.get(key)).outerHeight());
      features.push($($features.get(key)).outerHeight());
      actions.push($($action.get(key)).outerHeight());
      titles.push($($title.get(key)).outerHeight());
    }
    $features.height(Math.max.apply(null, features));
    $price.height(Math.max.apply(null, prices));
    $action.height(Math.max.apply(null, actions));
    $title.height(Math.max.apply(null, titles));
  };

  Media_Column_Resize = (function() {
    function Media_Column_Resize() {
      this.resize_groups = __bind(this.resize_groups, this);
      var $columns;
      $columns = $(".media-column.js__resize");
      if ($columns.length > 0) {
        this.column_groups = _.groupBy($columns, function(elem) {
          return $(elem).parent().offset().top;
        });
      } else {
        this.column_groups = false;
      }
    }

    Media_Column_Resize.prototype.resize_group = function(group) {
      var $column, column, height, key, tallest, _results,
        _this = this;
      tallest = 0;
      for (key in group) {
        column = group[key];
        $column = $(column);
        $column.css({
          height: ""
        });
        height = $column.outerHeight();
        if (height > tallest) {
          tallest = height;
        }
      }
      if (tallest > 0) {
        _results = [];
        for (key in group) {
          column = group[key];
          _results.push($(column).css({
            height: tallest
          }));
        }
        return _results;
      } else {
        return App.Util.delay(2000, function() {
          return _this.resize_group(group);
        });
      }
    };

    Media_Column_Resize.prototype.resize_groups = function() {
      var group, groupKey, _ref;
      _ref = this.column_groups;
      for (groupKey in _ref) {
        group = _ref[groupKey];
        this.resize_group(group);
      }
    };

    return Media_Column_Resize;

  })();

  /*
  	Media Columns
  */


  mcr = new Media_Column_Resize();

  /*
  	Pricing Tables
  */


  $pricing_columns = $(".pricing-column");

  if ($pricing_columns.length > 0) {
    $pricing_columns.closest(".g").addClass("g--pricing-table");
  }

  global.document.imagesLoaded(function() {
    var column_container, _i, _len, _ref;
    if ($pricing_columns.length > 0) {
      _ref = $pricing_columns.closest(".container__content");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        column_container = _ref[_i];
        align_columns(column_container);
      }
    }
    if (mcr.column_groups !== false) {
      mcr.resize_groups();
      return global.window.on("debouncedresize", mcr.resize_groups);
    }
  });

}).call(this);
