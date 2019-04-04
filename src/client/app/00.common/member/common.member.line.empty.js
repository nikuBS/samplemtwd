/**
 * @file common.member.line.empty.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.02
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
  _openCopPassword: function ($event) {
    var $target = $($event.currentTarget);
    this._popupService.open({
      hbs: 'CO_01_05_02_02'
    }, null, null, 'cop-password', $target);
  },
  _goUrl: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
  }
};