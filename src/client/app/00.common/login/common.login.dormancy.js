/**
 * @file: 휴면계정 해제
 * @author: Hakjoon Sim
 * @since: 2018-07-05
 */

/**
 * @class
 * @param (Object) rootEl - 최상위 element
 * @param (String) target - 휴면해제 후 이동할 url
 */
Tw.CommonLoginDormancy = function (rootEl, target) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;

  this._target = target || '/main/home';

  this._bindEvent();
};

Tw.CommonLoginDormancy.prototype = {
  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function () {
    this.$container.on('click', '#btn-activate', $.proxy(function () {
      Tw.Api.request(Tw.NODE_CMD.LOGIN_USER_LOCK)
        .done($.proxy(function (res) {
          if ( res.code === Tw.API_CODE.CODE_00 ) {
            this._apiService.sendNativeSession(Tw.AUTH_LOGIN_TYPE.TID, $.proxy(this._successSetSession, this));
          } else if ( res.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {  // Need service password
            this._historyService.goLoad('/common/member/login/cust-pwd');
          } else {
            Tw.Popup.openAlert(res.code + ' ' + res.msg);
          }
        }, this))
        .fail(function (err) {
          Tw.Logger.error('BFF_03_0010 Fail', err);
        });
    }, this));
  },

  /**
   * @function
   * @desc 완료 후 target url 로 이동
   */
  _successSetSession: function () {
    this._historyService.goLoad(this._target);
  }
};
