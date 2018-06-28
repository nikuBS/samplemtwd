Tw.PopupService = function () {
  this._prevHash;
  this._init();
};

Tw.PopupService.prototype = {
  _init: function () {
    initHashNav($.proxy(this._onHashChange, this));
  },
  _onHashChange: function (hash) {
    if ( hash.base === this._prevHash ) {
      Tw.Logger.info('[Popup Close]');
      this.close();
    }
  },
  open: function (option) {
    Tw.Logger.info('[Popup Open]');
    this._prevHash = location.hash;
    location.hash = 'popup';
    skt_landing.action.popup.open(option);
  },
  close: function() {
    // TODO
    // skt_landing.action.popup.close();
    $('.popup-page').empty().remove();
    $('.popup').empty().remove();
    skt_landing.action.auto_scroll();
  }
};
