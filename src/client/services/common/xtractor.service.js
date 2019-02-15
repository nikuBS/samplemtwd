Tw.XtractorService = function($container) {
  this.$container = $container;
  this._init();
};

Tw.XtractorService.prototype = {

  _init: function() {
    this._loggedList = [];
    this._isScript = window.XtractorScript && window.XtractorScript.xtrCSDummy;

    this._onLoadBV();
  },

  _onLoadBV: function() {
    _.each(this.$container.find('[data-xt_eid][data-xt_cs_id]'), $.proxy(this._sendBV, this));
  },

  _sendBV: function(elem) {
    var $elem = $(elem);
    this.logView($elem.data('xt_eid'), $elem.data('xt_cs_id'));
  },

  _sendXtrCSDummy: function(E_ID, CS_ID, ACTION) {
    var key = E_ID + '|' + CS_ID + '|' + ACTION;

    if (!this._isScript || this._loggedList.indexOf(key) !== -1) {
      return false;
    }

    try {
      window.XtractorScript.xtrCSDummy(E_ID, CS_ID, ACTION);
      this._loggedList.push(key);
    } catch (e) {
      console.log(e);
    }
  },

  logClick: function(E_ID, CS_ID) {
    return this._sendXtrCSDummy(E_ID, CS_ID, 'BC');
  },

  logView: function(E_ID, CS_ID) {
    return this._sendXtrCSDummy(E_ID, CS_ID, 'BV');
  }

};
