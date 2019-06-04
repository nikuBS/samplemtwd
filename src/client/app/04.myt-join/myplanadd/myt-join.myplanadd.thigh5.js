/**
 * @file myt-join.myplanadd.thigh5.js
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2019.05.31
 */

Tw.MyTJoinMyPlanAddThigh5 = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTJoinMyPlanAddThigh5.prototype = {
  /**
   * @desc jquery element 저장
   * @private
   */
  _cachedElement: function() { // jquery 객체 저장
    this.$btnOpenApp = this.$container.find('.fe-btn-open-app');
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$btnOpenApp.on('click', $.proxy(this._openApp, this));
  },

  _openApp: function() {
    var customUrl = 'https://finnq.onelink.me/YERF/46b2e4dc';
    var packageName = 'com.finnq.f1';
    if (Tw.BrowserHelper.isApp()) {
      if (Tw.BrowserHelper.isIos()) {
        location.href = customUrl;
      } else {
        this._nativeService.send(Tw.NTV_CMD.OPEN_APP, { 'package': packageName });
      }
    } else {
      location.href = customUrl;
    }
  }
};
