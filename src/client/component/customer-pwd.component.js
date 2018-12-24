/**
 * FileName: customer-pwd.component.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.12.04
 */

Tw.CustomerPwdComponent = function (rootEl, target) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._isCloseCallbackNeeded = false;
  this._pwdSuccess = false;
  this._target = target || '/main/home';

  // error when login
  this._loginErrorCode = {
    UNDER_3: 'ICAS3213',       // 고객보호비밀번호 오입력(3회 미만)
    ERROR_3: 'ICAS3212',       // 고객보호비밀번호 오입력(3회)
    ERROR_4: 'ICAS3215',       // 고객보호비밀번호 오입력 (4회)
    BLOCKED: 'ICAS3216'        // 고객보호비밀번호 잠김 (지점 내점 안내 노출)
  };

  this._lineChangeErrorCode = {
    ERROR_1: 'ICAS3481',       // 고객보호비밀번호 입력 오류 1회
    ERROR_2: 'ICAS3482',       // 고객보호비밀번호 입력 오류 2회
    ERROR_3: 'ICAS3483',       // 고객보호비밀번호 입력 오류 3회
    ERROR_4: 'ICAS3484',       // 고객보호비밀번호 입력 오류 4회
    BLOCKED: 'ICAS3215'        // 고객보호비밀번호 입력 오류 5회 (잠김예정)
  };

  if ( Tw.FormatHelper.isEmpty(rootEl) ) {
    this._isPopup = true;
    return;
  }

  this._isPopup = false;
  this.$container = rootEl;

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.CustomerPwdComponent.prototype = {

  _onPopupOpend: function ($layer) {
    this.$container = $layer;
    this.$container.find('.fe-svc-num').text(this._mdn);

    this._cachedElement();
    this._init();
    this._bindEvent();
  },
  _cachedElement: function () {
    this.$pwdWrap = this.$container.find('.fe-pw-wrap');
    this.$firstPwd = this.$container.find('.fe-first-pwd');
    this.$errMsg = this.$container.find('.fe-error-msg');
    this.$pwd = this.$container.find('input');
  },
  _init: function () {
    this._hideErrMsg();
    this._firstFocus();
    this._removeValue();
  },
  _bindEvent: function () {
    this.$pwdWrap.on('input', 'input', $.proxy(this._onInput, this));
  },
  _onInput: function (event) {
    var $target = $(event.currentTarget);

    this._hideErrMsg();
    this._setAsterisk($target);
    this._moveFocus($target);
  },
  _hideErrMsg: function () {
    this.$errMsg.hide();
  },
  _firstFocus: function () {
    this.$firstPwd.focus();
  },
  _removeValue: function () {
    this.$pwd.val('');
  },
  _setAsterisk: function ($target) {
    $target.parent().removeClass('active').addClass('entered');
  },
  _moveFocus: function ($target) {
    if ( $target.hasClass('fe-last') ) {
      this._requestLogin();
    } else {
      var $nextTarget = $target.parent().next();
      $nextTarget.addClass('active');
      $nextTarget.find('input').focus();
    }
  },
  _removePwd: function () {
    this.$pwd.val('');
  },
  _requestLogin: function () {
    var api = this._isPopup ? Tw.NODE_CMD.CHANGE_SESSION : Tw.NODE_CMD.LOGIN_SVC_PASSWORD;
    var data = { svcPwd: this._getPwd() };
    if ( this._isPopup ) {
      data.svcMgmtNum = this._serviceNumber;
    }
    this._apiService.request(api, data)
      .done($.proxy(this._onLoginReuestDone, this))
      .fail($.proxy(this._onError, this));
  },
  _getPwd: function () {
    var pwd = '';
    this.$pwd.each(function () {
      pwd += $(this).val().toString();
    });
    return pwd;
  },
  _onLoginReuestDone: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._onSuccess();
    } else {
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
        this.$errMsg.find('span').text(this._changeCount(this.$errMsg.text(), errCount));
        this.$errMsg.show();
      }

      if ( unexpectedError ) {
        this._onError(res);
      }
      this._initField();
    }
  },
  _changeCount: function (msg, count) {
    return msg.replace(/\d/, count);
  },
  _initField: function () {
    this.$pwdWrap.find('li').removeClass('entered');
    this.$firstPwd.parent().addClass('active');

    this._removeValue();
    this._firstFocus();
  },
  _onPwdPopupClosed: function () {
    if ( !this._isCloseCallbackNeeded ) {
      return;
    }
    if ( this._pwdSuccess ) {
      if ( this._isPopup ) {
        this._callback();
      }
    } else {
      if ( this._isPopup ) {
        this._goFailPage();
      }
    }
  },
  _onSuccess: function () {
    this._pwdSuccess = true;
    if ( this._isPopup ) {
      this._isCloseCallbackNeeded = true;
      this._popupService.close();
    } else {
      this._apiService.sendNativeSession(Tw.AUTH_LOGIN_TYPE.TID, $.proxy(this._successSetSession, this));
    }
  },
  _onError: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _successSetSession: function () {
    this._historyService.replaceURL(this._target);
  },
  _showFail: function () {
    this._pwdSuccess = false;
    if ( this._isPopup ) {
      this._isCloseCallbackNeeded = true;
      this._popupService.close();
    } else {
      this._goFailPage();
    }
  },
  _goFailPage: function () {
    this._historyService.replaceURL('/common/member/login/cust-pwdfail');
    // this._historyService.replaceURL('/common/tid/logout?target=/common/member/login/cust-pwdfail');
  },
  openLayer: function (mdn, serviceNumber, callback) {
    this._mdn = mdn;
    this._serviceNumber = serviceNumber;
    this._callback = callback;

    this._popupService.open({
        url: '/hbs/',
        hbs: 'CO_ME_01_02_02_02_02',
        layer: true
      },
      $.proxy(this._onPopupOpend, this),
      $.proxy(this._onPwdPopupClosed, this));
  }
};
