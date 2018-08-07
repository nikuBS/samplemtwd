/**
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.
 *
 */

/**
 * FileName: myt.joinService.protect.change.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.24
 */
Tw.MyTJoinProtectChange = function ($element, isNew) {
  this.$container = $element;
  this._new = (isNew === 'true');
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._inputHelper = Tw.InputHelper;
  this.type = {
    SET: '20',
    CHANGE: '30'
  };
  this._rendered();
  this._bindEvent();
};

Tw.MyTJoinProtectChange.prototype = {
  //element event bind
  _bindEvent: function () {
    // 확인
    this.$okButton.on('click', $.proxy(this._onOkClicked, this));
    this.$pwd.on('keyup', 'input', $.proxy(this._onKeyUp, this));
    this.$checkPwd.on('keyup', 'input', $.proxy(this._onKeyUp, this));
  },

  // set selector
  _rendered: function () {
    // 비밀번호 설정
    this.$okButton = this.$container.find('.bt-red1');
    this.$pwd = this.$container.find('#change-pwd');
    this.$checkPwd = this.$container.find('#change-pwd-check');
  },

  _onKeyUp: function (event) {
    // 숫자 외 다른 문자를 입력한 경우
    var value = event.target.value;
    if ( Tw.InputHelper.validateNumber(value) ) {
      if ( !window.location.hash.match('popup') ) {
        this._popupService.openAlert(Tw.MSG_MYT.JOIN_SERVICE.ONLY_PWD, Tw.POPUP_TITLE.NOTIFY,
          null, $.proxy(this._initNumInput, event));
      }
    }
  },

  _initNumInput: function () {
    Tw.InputHelper.inputNumberOnly(this.target);
  },

  _onOkClicked: function (/*event*/) {
    // 비밀번호 확인
    var orgPwd = this.$pwd.find('input').val();
    var checkPwd = this.$checkPwd.find('input').val();

    // 비밀번호 입력란에 아무것도 없을 때
    if ( orgPwd.length === 0 ) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.AUTO_A04, Tw.POPUP_TITLE.NOTIFY);
      return;
    }
    // 1차 6자리 이상인지 확인 (6자리 미만인 경우 알림)
    if ( orgPwd.length < 6 ) {
      // 숫자만 입력가능하기때문에 length 로 비교
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_SERVICE.EMPTY_PWD, Tw.POPUP_TITLE.NOTIFY);
      return;
    }
    // 비밀번호 입력과 확인이 다른 경우
    if ( orgPwd !== checkPwd ) {
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_SERVICE.FAIL_PWD, Tw.POPUP_TITLE.NOTIFY);
      return;
    }
    this._requestProtectChangePwd();
  },

  _requestProtectChangePwd: function (/*event*/) {
    // var api = /*this._new ? Tw.API_CMD.BFF_05_0069 :*/ Tw.API_CMD.BFF_05_0070;
    var pwd = this.$pwd.find('input').val();
    var api = Tw.API_CMD.BFF_03_0016;
    var data = {
      // 20:설정, 30:변경,
      chgCd: this._new ? this.type.SET : this.type.CHANGE, // 필수 값
      svcChgPwd: pwd // 변경, 설정
    };
    if ( !this._new ) {
      // 변경인 경우
      data.svcPwd = pwd; // 변경
    }
    this._apiService
      .request(api, data)
      .done($.proxy(this._onApiSuccess, this))
      .fail($.proxy(this._onApiError, this));
  },

  _onApiSuccess: function (params) {
    Tw.Logger.info(params);
    if ( params.code === Tw.API_CODE.CODE_00 ) {
      // 해당페이지로 진입을 바로 하면 안되므로 replace
      window.location.replace('/myt/join/join-info');
    }
    else {
      var errMsg = params.code + ' ' + (params.msg || params.error && params.error.msg);
      this._popupService.openAlert(errMsg, Tw.POPUP_TITLE.NOTIFY);
    }
  },

  _onApiError: function (params) {
    // API 호출 오류
    Tw.Logger.warn(params);
    var errMsg = params.code + ' ' + (params.msg || params.error && params.error.msg);
    this._popupService.openAlert(errMsg, Tw.POPUP_TITLE.NOTIFY);
  }
};