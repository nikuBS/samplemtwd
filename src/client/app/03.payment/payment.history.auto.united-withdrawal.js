/**
 * FileName: payment.history.auto.united-withdrawal.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.04
 */
Tw.PaymentHistoryAutoUnitedWithdrawal = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.PaymentHistoryCommon(rootEl);

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.PaymentHistoryAutoUnitedWithdrawal.prototype = {
  _cachedElement: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');

    this.$listWrapper = this.$container.find('#fe-list-wrapper');
    this.$withdrawalStopButtonWrapper = this.$container.find('#fe-quit-process');

    this.listWrapperTemplate = $('#list-wrapper');
    this.defaultListTemplate = $('#list-default');
    this.emptyListTemplate = $('#list-empty');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);

    this.$withdrawalStopButtonWrapper.on('click', $.proxy(this._goAutoWithdrawalStop, this));
  },

  _init: function () {
    this._setPageInfo();
    this._getData();
  },

  _setPageInfo: function () {
    this.useTemplate = this.defaultListTemplate;

    this.apiName = Tw.API_CMD.BFF_07_0039;
    this.stopWithdrawapApiName = Tw.API_CMD.BFF_07_0040;

    this.STRING = {
      HBS_WITHDRAWAL: 'PA_06_04_L01'
    };

    this.emptyURL = '/payment/auto';
  },

  _getData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption).done($.proxy(this._setData, this)).error($.proxy(this._apiError, this));
    }
  },

  _setData: function (res) {

    if (res.code !== Tw.API_CODE.CODE_00) return this._apiError(res);

    this.result = res.result.integratedDrawalRecord;

    if (this.result.length) {

      this.$withdrawalStopButtonWrapper.removeClass('none');

      this.result.map($.proxy(function (o) {

        o.reqDate = this._dateHelper.getShortDateWithFormat(o.drwDt, 'YYYY.MM.DD');
        o.reqAmt = Tw.FormatHelper.addComma(this.common._normalizeNumber(o.drwAmt));

      }, this));

    } else {
      this.result.removeURL = this.emptyURL;
    }

    var list = new this.common.listWithTemplate();
    list._init({result: this.result}, this.$listWrapper, {
      list: this.useTemplate,
      wrapper: this.listWrapperTemplate,
      empty: this.emptyListTemplate
    }, {
      setIndex: function (option) {
        return option.fn(this);
      }
    }, {
      list: 'listElement',
      restButton: 'restCount'
    }, 10, '.contents-info-list .bt-more', '', $.proxy(this.appendListCallBack, this));
  },

  appendListCallBack: function () {
    if (this.result.length) {
      this.$listWrapper.parent().addClass('nogaps-btm');
    }
  },

  _goAutoWithdrawalStop: function () {
    this._popupService.open({
          hbs: this.STRING.HBS_WITHDRAWAL
        },
        $.proxy(this.callBack_autoWithdrawalStopOpen, this));
  },

  callBack_autoWithdrawalStopOpen: function ($layer) {
    $layer.find('.bt-blue1 button').on('click', $.proxy(this.checkAndGoStopWithdrawal, this, $layer.find('.input input')));
  },

  checkAndGoStopWithdrawal: function (input) {
    if (this.checkFormatEmpty($(input).val())) {
      this._popupService.openAlert(
          Tw.MSG_PAYMENT.AUTO_A03,
          Tw.POPUP_TITLE.NOTIFY,
          '', $.proxy(function () {
            input.focus();
          }, this));
    } else {
      this.sendRequestStop($(input).val());
    }
  },

  sendRequestStop: function (value) {
    this._apiService.request(this.stopWithdrawapApiName, {
      rfndBankNum: value
    }).done($.proxy(this.stopWithdrawalSucess, this)).error($.proxy(this._apiError, this));
  },

  stopWithdrawalSucess: function (res) {
    if (res.code === '00') {
      this._popupService.openAlert(
          Tw.MSG_PAYMENT.HISTORY_A02,
          Tw.POPUP_TITLE.NOTIFY,
          '', $.proxy(function () {
            this._popupService.close();
          }, this));
    } else {
      this._popupService.openAlert(
          Tw.MSG_PAYMENT.HISTORY_A02_01 + '(' + res.msg + ')',
          Tw.POPUP_TITLE.NOTIFY,
          '', $.proxy(function () {
            this._popupService.close();
          }, this));
    }
  },

  checkFormatEmpty: function (v) {
    if (v === null || v === undefined) return true;
    return !v.replace(/^\s+/g, '').length;
  },

  _apiError: function (err) {
    this.common._apiError(err);
  }
};
