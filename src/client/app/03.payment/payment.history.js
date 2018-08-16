/**
 * FileName: payment.history.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.02
 */

Tw.PaymentHistory = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.PaymentHistoryCommon(rootEl);

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.PaymentHistory.prototype = {
  _cachedElement: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');

    this.$listWrapper = this.$container.find('#fe-list-wrapper');
    this.$refundListWrapper = this.$container.find('#fe-refund-request-wrapper');

    this.listWrapperTemplate = $('#list-wrapper');
    this.defaultListTemplate = $('#list-default');
    this.emptyListTemplate = $('#list-empty');

    this.refundListWrapperTemplate = $('#refund-request-wrapper');
    this.refundListTemplate = $('#list-refund');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);
  },

  _init: function () {
    this.STRING = {
      REFUND_DETAIL: 'PA_06_07_L02'
    };
    this.apiName = Tw.API_CMD.BFF_07_0030;
    this.emptyURL = '/payment/point';

    this.countOverPaid = 0;
    if (!this.common._getValueFromLD('overpay_close_time')) {
      this.common._setValueToLD('overpay_close_time', '');
    }

    this._getData();
  },

  _getData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption).done($.proxy(this._setData, this)).error($.proxy(this._apiError, this));
    }
  },

  isSubResultsOk: function (res) {
    if (res === undefined || res === null) return false;
    return !_.isEmpty(res.paymentRecord) || !_.isEmpty(res.refundRecord);
  },

  unionRelativeResult: function (payment, refund) {
    return _.chain().union(payment, refund).sortBy(function (obj) {
      return obj.opDt || obj.opDt1;
    }, this).value().reverse();
  },

  checkHasAccountRegistrable: function (data) {
    data.map($.proxy(function (o) {
      if (!o.effStaDt) {
        o.isOverPaid = true;
        this.countOverPaid++;
      }
    }, this));
  },

  _setData: function (res) {

    if (res.code !== Tw.API_CODE.CODE_00) return this._apiError(res);

    // paymentRecord : 납부내역
    // refundRecord : 환불 대상 내역

    // refundPaymentRecord : 환불한 내역

    // res = this.dummy;

    if (this.isSubResultsOk(res.result)) {

      if (!_.isEmpty(res.result.refundRecord)) {
        this.checkHasAccountRegistrable(res.result.refundRecord);
      }

      this.defaultResult = this.unionRelativeResult(res.result.paymentRecord, res.result.refundRecord);

      this.customerName = res.result.custName;

      this.defaultResult.map($.proxy(function (o, i) {

        o.listId = i;
        o.date = this._dateHelper.getShortDateWithFormat(o.opDt || o.opDt1, 'YYYY.MM.DD', 'YYYYMMDD');

        o.reqAmount = Tw.FormatHelper.addComma(this.common._normalizeNumber(o.payAmt || o.svcBamt));
        o.amount = o.reqAmount;
        o.reqYYYYMM = this._dateHelper.getShortDateWithFormatAddByUnit(
            o.invDt || o.opDt1, 1, 'months', 'YYYY.MM', 'YYYYMMDD');
        o.reqYYYYMMDD_start = this._dateHelper.getShortDateWithFormat(o.reqYYYYMM, 'YYYY.MM.DD', 'YYYY.MM');
        o.reqYYYYMMDD_end = this._dateHelper.getEndOfMonth(o.reqYYYYMM, 'YYYY.MM.DD', 'YYYY.MM');
        o.reqType = o.isOverPaid ? 'SERVER VALUE ERROR' : o.payMthdCdNm;
        o.isPoint = !o.reqType.indexOf(Tw.PAYMENT_STRING.POINT) ? true : false;

      }, this));

    } else {
      this.defaultResult = {
        removeURL: this.emptyURL
      };
    }

    if (!_.isEmpty(res.result.refundPaymentRecord)) {
      // set refund(환불한 내역) list value 설정
      this.refundResult = res.result.refundPaymentRecord;
      this.refundResult.map($.proxy(function (o, i) {
        o.listId = i;

        o.inProcess = null;
        o.date = null;
        o.amount = null;
      }, this));
    }

    if (this.countOverPaid) {
      this.openOverPaidPopup();
    }

    this._setListUI(
        this.defaultResult, '',
        this.$listWrapper,
        this.defaultListTemplate,
        this.listWrapperTemplate,
        this.emptyListTemplate, 10, '.contents-info-list .bt-more',
        $.proxy(this.paymentListCallBack, this));

    if (this.refundResult && this.refundResult.length) {
      this._setListUI(
          this.refundResult, 'list2',
          this.$refundListWrapper,
          this.refundListTemplate,
          this.refundListWrapperTemplate,
          '', 10, '#fe-refund-request-wrapper .acco-inner-btn-more .bt-more',
          $.proxy(this.refundListCallBack, this));
    }
  },

  openOverPaidPopup: function () {
    if (!this.common._getValueFromLD('overpay_close_time') || this._isOverPayPopupOpen()) {
      this.common._setValueToLD('overpay_close_time', '');
      this._popupService.open({
            'title': Tw.POPUP_TITLE.OVER_PAY,
            'close_bt': true,
            'title2': this.customerName +
            Tw.MSG_PAYMENT.HISTORY_OVER_PAY.SUBTITLE + ' ' + this.countOverPaid +
            Tw.MSG_PAYMENT.HISTORY_OVER_PAY.SUBTITLE_SUB,
            'contents': Tw.MSG_PAYMENT.HISTORY_OVER_PAY.CONTENTS,
            'type': [{
              style_class: 'bt-red1',
              href: 'submit',
              txt: Tw.MSG_PAYMENT.HISTORY_OVER_PAY.BUTTON_TEXT
            }],
            'contents_b': Tw.POPUP_TPL.HISTORY_OVER_PAY_POPUP
          },
          $.proxy(this._overPayLayerOpenCallback, this));
    }
  },

  _isOverPayPopupOpen: function () {
    var current = new Date().getTime();

    return (current - this.common._getValueFromLD('overpay_close_time') > (24 * 60 * 60 * 1000));
  },

  _overPayLayerOpenCallback: function () {
    this.$container.on('click', '.popup .bt-red1 button', $.proxy(this._set_pageMoveHandler, this));
    this.$container.on('click', '.popup .checkbox input', $.proxy(this._set_popupClose24hours, this));
  },

  _set_pageMoveHandler: function () {
    this._popupService.close();
    this.common._goLoad('/payment/history/excesspay');
  },

  _set_popupClose24hours: function (e) {
    if ($(e.target).attr('checked')) {
      this.common._setValueToLD('overpay_close_time', new Date().getTime());
      this._popupService.close();
    }
  },

  _setListUI: function (data, partial, listWrapper, listTemplate, wrapperTemplate, emptyTemplate, count, btnMoreSelector, callback) {
    var list = new this.common.listWithTemplate();
    list._init({result: data}, listWrapper, {
      list: listTemplate,
      wrapper: wrapperTemplate,
      empty: emptyTemplate
    }, {
      setIndex: function (option) {
        return option.fn(this);
      }
    }, {
      partial: partial,
      list: 'listElement',
      restButton: 'restCount'
    }, count, btnMoreSelector, '', $.proxy(callback, this));
  },

  paymentListCallBack: function () {
    if (this.defaultResult !== undefined && this.defaultResult.length) {
      this.$listWrapper.parent().addClass('nogaps-btm');
    }
    this.$container.find('#fe-list-wrapper .detail-btn').off().on('click', '.fe-btn', $.proxy(this.defaultListButtonHandler, this));
  },

  defaultListButtonHandler: function (e) {

    var current = this.defaultResult[$(e.target).data('list-id')];

    // 환불계좌 등록 process
    this.common._goLoad('/payment/history/excesspay/account?total=' + current.svcBamt +
        '&recCnt=1&svcMgmtNum=' + current.svcMgmtNum + '&bamtClCd=' + current.bamtClCd);
  },

  refundListCallBack: function () {
    this.$container.find('#fe-refund-request-wrapper').off().on(
        'click', '.fe-btn', $.proxy(this.refundListButtonHandler, this));
    skt_landing.widgets.widget_init();
  },

  refundListButtonHandler: function (e) {
    var index = $(e.target).data('list-id');

    this._popupService.open({
      hbs: this.STRING.REFUND_DETAIL,
      data: this.refundResult[index]
    }, $.proxy(function ($layer) {
      $layer.on('click', '.bt-blue1 button', $.proxy(function () {
        this._popupService.close();
      }, this));
    }, this));
  },

  _moveReceiptPage: function (e) {
    this._popupService.close();
    if ($(e.target).hasClass('cash')) {
      this.common._goLoad('/payment/history/receipt/cash');
    } else {
      this.common._goLoad('/payment/history/receipt/tax');
    }
  },

  _apiError: function (err) {
    this.common._apiError(err);
  }
};
