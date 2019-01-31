/**
 * FileName: common.member.line.empty.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.02
 */

Tw.CommonMemberLineEmpty = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.CommonMemberLineEmpty.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '#fe-bt-cop-password', $.proxy(this._openCopPassword, this));
    this.$container.on('click', '.fe-bt-go-url', $.proxy(this._goUrl, this));
  },
  _openCopPassword: function () {
    this._popupService.open({
      hbs: 'CO_01_05_02_02'
    }, null, null, 'cop-password');
  },
  _goUrl: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
  }
};