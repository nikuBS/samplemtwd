/**
 * FileName: myt.bill.history.micro.password.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.26
 */

Tw.MyTBillHistoryMicroPassword = function (rootEl, current, isUsePassword) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.common = new Tw.MyTBillHistoryCommon(rootEl);

  this.isFull = [];

  if (isUsePassword !== 'NC' && isUsePassword !== 'AC') {
    this._apiError({code: isUsePassword});
    return false;
  }
  this.isUsePassword = isUsePassword;

  if (this.isUsePassword === 'AC') {
    this.moveURL = Tw.URL_PATH.MYT_PAYPASS_SET;
    this.apiName = Tw.API_CMD.BFF_05_0087;
  } else if (this.isUsePassword === 'NC') {
    this.moveURL = Tw.URL_PATH.MYT_BILL_HISTORY_MICRO;
    this.apiName = Tw.API_CMD.BFF_05_0086;
  }

  if (Tw.UIService.getLocalStorage('pastP')) {
    this.pastP = Tw.UIService.getLocalStorage('pastP');
    Tw.UIService.setLocalStorage('pastP', '');
  }

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.MyTBillHistoryMicroPassword.prototype = {
  _init: function () {
    this.index = 0;

    _.each(this.inputs, $.proxy(function () {
      this.isFull.push(false);
    }, this));
  },

  _cachedElement: function () {
    this.inputs = this.$container.find('input[type="password"]');
    this.submitBtn = this.$container.find('.contents-btn .bt-red1 button');
    this.headerBackBtn = this.$container.find('.header .close-step');
  },

  _bindDOM: function () {
    this.inputs.on('focus', $.proxy(this._handleFocus, this));
    this.inputs.on('blur', $.proxy(this._handleBlur, this));
    this.inputs.on('keyup', $.proxy(this._handleChange, this));

    this.submitBtn.on('click', $.proxy(this._handleConfirm, this));
    this.headerBackBtn.on('click', $.proxy(this._handleBack, this));
  },

  _handleFocus: function () {

  },

  _handleBlur: function (e) {
    var current = $(e.target);
    if (!current.length)
      current.attr('type', 'text');
  },

  _handleChange: function (e) {
    var current = $(e.target).get(0),
        index   = this.inputs.index(current);

    if (current.value.length === 6) {
      this.isFull[index] = true;
    } else {
      this.isFull[index] = false;
    }

    if (_.reduce(this.isFull, function (memo, current) {
      return memo && current;
    })) {
      this.submitBtn.attr('disabled', false);
    } else {
      this.submitBtn.attr('disabled', true);
    }
  },

  _handleConfirm: function () {

    var currentPS, newPS, confirmPS;

    if (this.isUsePassword === 'AC') {
      currentPS = this.inputs[0].value;
      this.index = 1;
    }
    newPS = this.inputs[this.index].value;
    confirmPS = this.inputs[this.index + 1].value;

    if (currentPS && currentPS === newPS) {
      this.common._popupService.openAlert(Tw.MSG_MYT.HISTORY_ALERT_VC004, Tw.POPUP_TITLE.NOTIFY, null, $.proxy(function () {
        this._resetDefault();
      }, this));
      return false;
    }

    if (newPS !== confirmPS) {
      this.common._popupService.openAlert(Tw.MSG_MYT.HISTORY_ALERT_A24, Tw.POPUP_TITLE.NOTIFY, null, $.proxy(function () {
        this._resetDefault();
      }, this));
      return false;
    }

    if (Tw.FormatHelper.is6digitPassSameNumber(newPS)) {
      this.common._popupService.openAlert(Tw.MSG_MYT.HISTORY_ALERT_A23, Tw.POPUP_TITLE.NOTIFY, null, $.proxy(function () {
        this._resetDefault();
      }, this));
      return false;
    }

    if (Tw.FormatHelper.is6digitPassSolidNumber(newPS)) {
      this.common._popupService.openAlert(Tw.MSG_MYT.HISTORY_ALERT_A22, Tw.POPUP_TITLE.NOTIFY, null, $.proxy(function () {
        this._resetDefault();
      }, this));
      return false;
    }

    this._apiService.request(this.apiName, {
      oldPassword: currentPS || '',
      modifyPassword1: newPS,
      modifyPassword2: confirmPS
    })
        .done($.proxy(this._responseCallback, this))
        .error($.proxy(this._responseCallback, this));
  },

  _responseCallback: function (res) {
    var message;

    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.customerInfo.resultCd === 'CHK-P') {
        message = res.result.returnMessage;
      }

      switch (res.result.returnCode) {
        case 'VC006':
          message = Tw.MSG_MYT.HISTORY_ALERT_VC006;
          break;
        case 'VC007':
          message = Tw.MSG_MYT.HISTORY_ALERT_VC007;
          break;
        case 'VS000':
          message = Tw.MSG_MYT.HISTORY_ALERT_A26;
          this.common._popupService.openAlert(message, Tw.POPUP_TITLE.NOTIFY, null, $.proxy(function () {
            this.common._popupService.close();
            this.common._history.goLoad(this.moveURL);
          }, this));
          return false;
        default:
          break;
      }

      this.common._popupService.openAlert(message, Tw.POPUP_TITLE.NOTIFY, null, $.proxy(function () {
        this._resetAll();
      }, this));
    } else {
      this._apiError(res);
    }
  },

  _resetAll: function () {
    this.inputs[0].value = '';
    this.isFull[0] = false;
    this._resetDefault();
  },

  _resetDefault: function () {
    for (var k = this.index, len = this.inputs.length; k < len; k++) {
      this.isFull[k] = false;
      this.inputs[k].value = '';
    }
    this.submitBtn.attr('disabled', true);
    return false;
  },

  _handleBack: function () {
    this.common._popupService.openConfirm(
        Tw.POPUP_TITLE.CONFIRM, Tw.MSG_MYT.HISTORY_ALERT_A21, '',
        null,
        $.proxy(function () {
          this._popupService.close();
          this._history.goBack();
        }, this.common), null);

  },

  _apiError: function (err, callback) {
    Tw.Logger.error(err.code, err.msg);
    var msg = Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg;
    this._popupService.openAlert(msg, Tw.POPUP_TITLE.NOTIFY, callback, callback);
    return false;
  }
};
