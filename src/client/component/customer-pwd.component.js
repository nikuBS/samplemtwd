/**
 * FileName: customer-pwd.component.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.06
 */

Tw.CustomerPwdComponent = function (rootEl) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._isCloseCallbackNeeded = false;
  this._pwdSuccess = false;

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

  if (Tw.FormatHelper.isEmpty(rootEl)) {
    this._isPopup = true;
    return;
  }

  this._isPopup = false;
  this.$container = rootEl;

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerPwdComponent.prototype = {

  _onPopupOpend: function ($layer) {
    this.$container = $layer;

    this.$container.find('.badge').hide();
    this.$container.find('.circuit-tx').text(this._mdn);
    this._cachedElement();
    this._bindEvent();
  },
  _cachedElement: function () {
    this.$inputBox = this.$container.find('.inputbox');
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
    var api = this._isPopup ? Tw.NODE_CMD.CHANGE_SESSION : Tw.NODE_CMD.LOGIN_SVC_PASSWORD;
    var data = { svcPwd: pwd};
    if (this._isPopup) {
      data.svcMgmtNum = this._serviceNumber;
    }
    this._apiService.request(api, data)
      .done($.proxy(this._onLoginReuestDone, this))
      .fail(function (err) {
        Tw.Logger.error('auth.login.service.pwd Fail', err);
      });
  },
  _onLoginReuestDone: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._onSuccess();
    } else {
      var errCount = 0;
      var unexpectedError = false;
      switch (res.code) {
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

      if (errCount >= 1) {
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
    if (!this._isCloseCallbackNeeded) {
      return;
    }
    if (this._pwdSuccess) {
      if (this._isPopup) {
        this._callback();
      }
    } else {
      if (this._isPopup) {
        this._popupService.open({ hbs: 'CO_01_02_03_P01_P01' }, function ($layer) {
          $layer.on('click', '.bt-red1 > button', function () {
            Tw.Popup.close();
          });

          $layer.find('.link-long > a')[0].href = '/customer/email';
          $layer.find('.link-long.last > a').attr('href', '/customer/shop/search');
        });
      }
    }
  },
  _onSuccess: function () {
    this._pwdSuccess = true;
    if (this._isPopup) {
      this._isCloseCallbackNeeded = true;
      this._popupService.close();
    } else {
      this._historyService.goLoad('/home');
    }
  },
  _showFail: function () {
    this._pwdSuccess = false;
    if (this._isPopup) {
      this._isCloseCallbackNeeded = true;
      this._popupService.close();
    } else {
      this._historyService.goLoad('/auth/tid/logout?target=/auth/login/customer-pwd-fail');
    }
  },
  openLayer: function (mdn, serviceNumber, callback) {
    this._mdn = mdn;
    this._serviceNumber = serviceNumber;
    this._callback = callback;

    this._popupService.open({ hbs: 'CO_01_02_03_P01' },
      $.proxy(this._onPopupOpend, this),
      $.proxy(this._onPwdPopupClosed, this));
  }
};
