var Loading_Spinner;

Loading_Spinner = (function() {
  function Loading_Spinner() {
    this.spinner = $("#loading-spinner");
    this.spinner.hide();
    this.status = 0;
  }

  Loading_Spinner.prototype.start = function(callback) {
    if (this.status === 1) {
      return;
    }
    this.status = 1;
    this.spinner.fadeIn(200, callback);
    return this;
  };

  Loading_Spinner.prototype.stop = function(callback) {
    if (this.status === 0) {
      return;
    }
    this.status = 0;
    this.spinner.fadeOut(200, callback);
    this.reset_size();
    return this;
  };

  Loading_Spinner.prototype.small = function() {
    this.spinner.addClass("small");
    return this;
  };

  Loading_Spinner.prototype.reset_size = function() {
    var _this = this;
    $.when(this.spinner).done(function() {
      return _this.spinner.removeClass("small");
    });
    return this;
  };

  return Loading_Spinner;

})();
