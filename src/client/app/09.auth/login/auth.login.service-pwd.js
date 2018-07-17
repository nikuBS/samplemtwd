/**
 * FileName: auth.login.service-pwd.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.11
 */

Tw.AuthLoginServicePwd = function (rootEl) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._isCloseCallbackNeeded = false;
  this._pwdSuccess = false;

  this._errorCode = {
    UNDER_3: 'ICAS3213',       // 고객보호비밀번호 오입력(3회 미만)
    ERROR_3: 'ICAS3212',       // 고객보호비밀번호 오입력(3회)
    ERROR_4: 'ICAS3215',       //고객보호비밀번호 오입력 (4회)
    BLOCKED: 'ICAS3216'        //고객보호비밀번호 잠김 (지점 내점 안내 노출)
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

Tw.AuthLoginServicePwd.prototype = {
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
    var api = this._isPopup ? Tw.NODE_CMD.CHANGE_SESSION : Tw.NODE_CMD.SVC_PASSWORD_LOGIN;
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
      switch (res.code) {
        case this._errorCode.ERROR_3:
          errCount = 3;
          break;
        case this._errorCode.ERROR_4:
          errCount = 4;
          break;
        case this._errorCode.BLOCKED:
          this._showFail();
          return;
      }

      if (errCount >= 3) {
        this.$inputBox.addClass('error');
        this.$deleteIcon.removeClass('none');
        this.$errMsg.removeClass('none');

        this.$errMsg.text(this._changeCount(this.$errMsg.text(), errCount));
      }

      this._popupService.openAlert(Tw.MSG_AUTH.LOGIN_A01);
    }
  },
  _changeCount: function (msg, count) {
    return msg.replace(/\d/, count);
  },
  _onPwdPopupClosed: function () {
    if (!this._isCloseCallbackNeeded) {
      return;
    }
    if (this._pwdSuccessp) {
      if (this._isPopup) {
        this._callback();
      }
    } else {
      if (this._isPopup) {
        this._popupService.open({ hbs: 'CO_01_02_03_P01_P01' }, function ($layer) {
          $layer.on('click', '.bt-red1 > button', function () {
            Tw.Popup.close();
          });
          // TODO: Insert href for a tags when routings ready
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
      window.location = '/home';
    }
  },
  _showFail: function () {
    this._pwdSuccess = false;
    if (this._isPopup) {
      this._isCloseCallbackNeeded = true;
      this._popupService.close();
    } else {
      window.location = '/auth/login/service-pwd-fail';
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
