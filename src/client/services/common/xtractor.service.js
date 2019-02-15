Tw.XtractorService = function($container) {
  this.$container = $container;

  this._init();
  this._onLoadBV();
  this._bindBC();
};

Tw.XtractorService.prototype = {

  _init: function() {
    this._loggedList = [];
    this._isScript = window.XtractorScript && window.XtractorScript.xtrCSDummy;
  },

  _onLoadBV: function() {
    _.each(this.$container.find('[data-xt_action="BV"]'), $.proxy(this._sendBV, this));
  },

  _bindBC: function() {
    this.$container.on('click', '[data-xt_action="BC"]', $.proxy(this._sendBC, this));
  },

  _sendBV: function(elem) {
    var $elem = $(elem),
      E_ID = $elem.data('xt_eid'),
      CS_ID = $elem.data('xt_csid');
    if (Tw.FormatHelper.isEmpty(E_ID) || Tw.FormatHelper.isEmpty(CS_ID)) {
      return false;
    }

    this.logView(E_ID, CS_ID);
  },

  _sendBC: function(e) {
    var $elem = $(e.currentTarget),
      E_ID = $elem.data('xt_eid'),
      CS_ID = $elem.data('xt_csid');
    if (Tw.FormatHelper.isEmpty(E_ID) || Tw.FormatHelper.isEmpty(CS_ID)) {
      return false;
    }

    this.logClick(E_ID, CS_ID);
  },

  logClick: function(E_ID, CS_ID) {
    return this._sendXtrCSDummy(E_ID, CS_ID, 'BC');
  },

  logView: function(E_ID, CS_ID) {
    return this._sendXtrCSDummy(E_ID, CS_ID, 'BV');
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
  }

};
