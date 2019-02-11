/**
 * FileName: customer.damage-info.warning.view.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.01.31
 */

Tw.CustomerDamageInfoWarningView = function(rootEl) {
  this.$container = rootEl;

  this._bindEvent();
};

Tw.CustomerDamageInfoWarningView.prototype = {

  _bindEvent: function() {
    this.$contents.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));
  },

  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};
