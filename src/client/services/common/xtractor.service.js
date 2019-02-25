Tw.XtractorService = function($container) {
  this.$container = $container;
  Tw.Logger.info('[Xtractor] init container', this.$container);

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
    this.$container.on('mousedown', '[data-xt_action="BC"],[data-xt_action2="BC"]', $.proxy(this._sendBC, this));
  },

  _sendBV: function(elem) {
    var $elem = $(elem),
      E_ID = $elem.data('xt_eid'),
      CS_ID = $elem.data('xt_csid');

    if (Tw.FormatHelper.isEmpty(E_ID) || Tw.FormatHelper.isEmpty(CS_ID)) {
      Tw.Logger.warn('[Xtractor] E_ID and CS_ID is required.', { E_ID: E_ID, CS_ID: CS_ID });
      return false;
    }

    this.logView(E_ID, CS_ID);
  },

  _sendBC: function(e) {
    var $elem = $(e.currentTarget),
      E_ID = $elem.data('xt_eid'),
      CS_ID = $elem.data('xt_csid');

    if (Tw.FormatHelper.isEmpty(E_ID) || Tw.FormatHelper.isEmpty(CS_ID)) {
      Tw.Logger.warn('[Xtractor] E_ID and CS_ID is required.', { E_ID: E_ID, CS_ID: CS_ID });
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

    if (!this._isScript) {
      Tw.Logger.warn('[Xtractor] Logger is failed. Xtractor script is not found.');
      return false;
    }

    if (this._loggedList.indexOf(key) !== -1) {
      Tw.Logger.info('[Xtractor] this key already logged.');
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
