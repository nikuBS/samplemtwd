/**
 * FileName: payment.history.receipt.cash.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */
Tw.PaymentHistoryReceiptCash = function (rootEl) {
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

Tw.PaymentHistoryReceiptCash.prototype = {
  _cachedElement: function () {
    this.$listWrapper = this.$container.find('#fe-list-wrapper');

    this.listWrapperTemplate = $('#list-wrapper');
    this.defaultListTemplate = $('#list-default');
    this.emptyListTemplate = $('#list-empty');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);
  },

  _init: function () {
    this._setPageInfo();
    this._getData();
  },

  _setPageInfo: function () {
    this.useTemplate = this.defaultListTemplate;
    // API 안나오는 경우 지난 데이터(6개월 이전)
    // this.apiOption = {
    //   frmDt: '20101111',
    //   toDt: '20201111'
    // };

    this.apiName = Tw.API_CMD.BFF_07_0004;
  },

  _getData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption).done($.proxy(this._setData, this)).error($.proxy(this._apiError, this));
    }
  },

  _setData: function (res) {
    if (res.code !== Tw.API_CODE.CODE_00) return this._apiError(res);

    this.result = res.result;

    if (this.result.length) {
      this.result.map($.proxy(function (o) {
        o.dealDate = this._dateHelper.getShortDateWithFormat(o.opDt, 'YYYY.MM.DD', 'YYYYMMDD');
        o.svcNumber = o.svcNum;
        o.receiptedAmount = Tw.FormatHelper.addComma(this.common._normalizeNumber(o.opAmt));
      }, this));
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

  _apiError: function (err) {
    this.common._apiError(err);
  }
};
