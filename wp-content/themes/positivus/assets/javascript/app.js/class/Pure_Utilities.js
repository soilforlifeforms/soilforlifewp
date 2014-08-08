var Pure_Utilities;

Pure_Utilities = (function() {
  function Pure_Utilities() {}

  Pure_Utilities.prototype.delay = function(ms, func) {
    return setTimeout(func, ms);
  };

  Pure_Utilities.prototype.random_time = function() {
    return _.random(650, 1000);
  };

  Pure_Utilities.prototype.transition = function(settings) {
    var Deferred, item, resolver, trans, _i, _len, _ref;
    Deferred = new $.Deferred();
    resolver = _.after(settings.items.length, Deferred.resolve);
    _ref = settings.items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      trans = settings.transition;
      trans.complete = resolver;
      trans.duration = _.isFunction(settings.duration) ? settings.duration() : settings.duration;
      $(item).addClass("dont-flicker").transition(trans);
    }
    return Deferred.promise();
  };

  return Pure_Utilities;

})();
