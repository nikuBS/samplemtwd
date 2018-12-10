Tw.CustomerDamageInfo = function(rootEl) {
  this.$container = rootEl;
  this._bindEvent();
};

Tw.CustomerDamageInfo.prototype = {

  _bindEvent: function() {
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));
  },

  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    this._popupService.openAlert(Tw.MSG_COMMON.DATA_CONFIRM, null, $.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  _openExternalUrl: function(href) {
    this._popupService.close();
    Tw.CommonHelper.openUrlExternal(href);
  }

};
