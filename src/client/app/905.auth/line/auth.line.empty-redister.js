Tw.AuthLineEmptyRegister = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.AuthLineEmptyRegister.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '#cop-password', $.proxy(this._openCopPassword, this));
  },
  _openCopPassword: function () {
    this._popupService.open({
      hbs: 'CO_01_05_02_P01'
    }, $.proxy(this._onOpenCopPassword, this));
  },
  _onOpenCopPassword: function ($layer) {
    $layer.on('click', '.authority-bt', $.proxy(this._confirmCopPassword, this));
  },
  _confirmCopPassword: function () {
    this._popupService.close();
  }
};