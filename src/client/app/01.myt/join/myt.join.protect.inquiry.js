/**
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.
 *
 */

/**
 * FileName: myt.joinService.protect.inquiry.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.24
 */
Tw.MyTJoinProtectInquiry = function ($element, svcInfo) {
  this._svcInfo = svcInfo;
  this.$container = $element;
  this._loginService = new Tw.MyTJSProtectPwd();
  this._rendered();
  this._bindEvent();
};

Tw.MyTJoinProtectInquiry.prototype = {
  //element event bind
  _bindEvent: function () {
    // 확인
    this.$okButton.on('click', $.proxy(this._onOkClicked, this));
  },

  //set selector
  _rendered: function () {
    //신청버튼
    this.$okButton = this.$container.find('.bt-red1');
  },

  _onOkClicked: function (/*event*/) {
    // 비밀번호 확인
    var params = {
      mdn: this._svcInfo.svcNum,
      serviceNumber: this._svcInfo.svcMgmtNum,
      callback: $.proxy(this._onLayerOpened, this)
    };
    this._loginService.openLayer(params);
  },

  _onLayerOpened: function() {

  }
};

Tw.MyTJSProtectPwd = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  // error when login
  this._loginErrorCode = {
    UNDER_3: 'ICAS3213',       // 고객보호비밀번호 오입력(3회 미만)
    ERROR_3: 'ICAS3212',       // 고객보호비밀번호 오입력(3회)
    ERROR_4: 'ICAS3215',       //고객보호비밀번호 오입력 (4회)
    BLOCKED: 'ICAS3216'        //고객보호비밀번호 잠김 (지점 내점 안내 노출)
  };

  this._lineChangeErrorCode = {
    ERROR_1: 'ICAS3481',       // 고객보호비밀번호 입력 오류 1회
    ERROR_2: 'ICAS3482',       // 고객보호비밀번호 입력 오류 2회
    ERROR_3: 'ICAS3483',       // 고객보호비밀번호 입력 오류 3회
    ERROR_4: 'ICAS3484',       // 고객보호비밀번호 입력 오류 4회
    BLOCKED: 'ICAS3215'       // 고객보호비밀번호 입력 오류 5회 (잠김예정)
  };

};

Tw.MyTJSProtectPwd.prototype = {
  _onPopupOpend: function ($layer) {
    this.$container = $layer;

    this.$container.find('.badge').hide();
    this.$container.find('.circuit-tx').text(this._mdn);
    this._cachedElement();
    this._bindEvent();
  },
  _cachedElement: function () {
    this.$inputBox = this.$container.find('.inputbox');
    this.$pwdInput = this.$inputBox.find('input');
    this.$deleteIcon = this.$container.find('.ico');
    this.$errMsg = this.$container.find('.error-txt');
    this.$pwd = this.$container.find('input');
    this.$pwd.val('');
  },
  _bindEvent: function () {
    this.$container.on('click', '.bt-red1 > button', $.proxy(this._requestLogin, this));
    this.$deleteIcon.on('click', $.proxy(this._removePwd, this));

  },
  _removePwd: function () {
    this.$pwd.val('');
  },
  _requestLogin: function () {
    var pwd = this.$pwd.val();
    var api = Tw.API_CMD.BFF_05_0069;
    var data = {
      svcPwd: pwd
    };
    this._apiService.request(api, data)
      .done($.proxy(this._onLoginReuestDone, this))
      .fail(function (err) {
        Tw.Logger.error('auth.login.service.pwd Fail', err);
      });
  },
  _onLoginReuestDone: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._onSuccess(res);
    }
    else {
      var errCount = 0;
      var unexpectedError = false;
      switch ( res.code ) {
        case this._lineChangeErrorCode.ERROR_1:
          errCount = 1;
          break;
        case this._lineChangeErrorCode.ERROR_2:
          errCount = 2;
          break;
        case this._lineChangeErrorCode.ERROR_3:
        case this._loginErrorCode.ERROR_3:
          errCount = 3;
          break;
        case this._lineChangeErrorCode.ERROR_4:
        case this._loginErrorCode.ERROR_4:
          errCount = 4;
          break;
        case this._lineChangeErrorCode.BLOCKED:
        case this._loginErrorCode.BLOCKED:
          this._showFail();
          return;
        default:
          unexpectedError = true;
          break;
      }

      if ( errCount >= 1 ) {
        this.$inputBox.addClass('error');
        this.$deleteIcon.removeClass('none');
        this.$errMsg.removeClass('none');

        this.$errMsg.text(this._changeCount(this.$errMsg.text(), errCount));
      }

      var errorMsg = unexpectedError ? res.code + ' ' + res.msg : Tw.MSG_AUTH.LOGIN_A01;
      this._popupService.openAlert(errorMsg);
    }
  },

  _changeCount: function (msg, count) {
    return msg.replace(/\d/, count);
  },
  _onPwdPopupClosed: function () {
    if ( !this._isCloseCallbackNeeded ) {
      return;
    }
    if ( this._pwdSuccess ) {
      this._callback();
    }
    else {
      this._popupService.open({ hbs: 'CO_01_02_03_P01_P01' }, function ($layer) {
        $layer.on('click', '.bt-red1 > button', function () {
          Tw.Popup.close();
        });
        // TODO: Insert href for a tags when routings ready
      });
    }
  },
  _onSuccess: function () {
    this._pwdSuccess = true;
    this._isCloseCallbackNeeded = true;
    this._popupService.close();
  },
  _showFail: function () {
    this._pwdSuccess = false;
    this._isCloseCallbackNeeded = true;
    this._popupService.close();
  },
  openLayer: function (params) {
    this._mdn = params.mdn;
    this._callback = params.callback;
    this._popupService.open({ hbs: 'CO_01_02_03_P01' },
      $.proxy(this._onPopupOpend, this),
      $.proxy(this._onPwdPopupClosed, this));
  }
};