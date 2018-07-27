/**
 * FileName: payment.history.excess-pay.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */
Tw.PaymentHistoryExcessPay = function (rootEl) {
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

Tw.PaymentHistoryExcessPay.prototype = {
  _cachedElement: function () {
    this.$listWrapper = this.$container.find('#fe-list-wrapper');
    this.$contentWrapper = this.$container.find('.container .cont-box.nobroder');
    this.$refund_total = this.$container.find('.cont-box .fe-total-amount');
    this.$refund_count = this.$container.find('.payment-detail-wrap .fe-total-count');
    this.$refund_request_btn = this.$container.find('.bt-blue1 .fe-selected-amount');
    this.$refund_request_sum = this.$refund_request_btn.find('span');

    this.listWrapperTemplate = $('#list-wrapper');
    this.defaultListTemplate = $('#list-default');
  },

  _bindDOM: function () {
    this.$refund_request_btn.on('click', $.proxy(this.refundReqestHandler, this));
  },

  _init: function () {
    this.apiName = Tw.API_CMD.BFF_07_0030;

    this.selected = {
      count: 0,
      svcMgmtNum: [],
      bamtClCd: []
    };

    this._getData();
  },

  _getData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption).done($.proxy(this._setData, this)).error($.proxy(this._apiError, this));
    } else {
      // TODO : history replace
    }
  },

  _setData: function (res) {

    if (res.code !== Tw.API_CODE.CODE_00) return this._apiError(res);

    // res = this.dummy;

    if (res.result.refundRecord.length) {
      this.result = res.result.refundRecord;

      this.selected.count = res.result.refundRecord.length;

      this.result.map($.proxy(function (o) {
        o.reqDate = this._dateHelper.getShortDateWithFormat(o.opDt1, 'YYYY.MM.DD', 'YYYYMMDD');
        o.reqAmount = Tw.FormatHelper.addComma(this.common._normalizeNumber(o.svcBamt));

        this.selected.svcMgmtNum.push(o.svcMgmtNum);
        this.selected.bamtClCd.push(o.bamtClCd);
      }, this));

      this.setRefundInfo();

      this._setListUI(this.result, '',
          this.$listWrapper,
          this.defaultListTemplate,
          this.listWrapperTemplate,
          '', 10, '.contents-info-list .bt-more', '#overPaidListWrapper',
          $.proxy(this.refundListCallback, this));
    }
  },

  refundListCallback: function () {
    if (this.result.length > 10) {
      this.$contentWrapper.addClass('nogaps-btm');
    }
    skt_landing.widgets.widget_init();
    this.$container.on('click', '.widget-box .select-list li.checkbox', $.proxy(this._set_selected, this));

  },

  _set_selected: function (e) {
    var target = $(e.target),
        id     = target.parent().data('list-id');

    if (!target.attr('checked')) {
      this.totalAmt -= this.result[id].nomal_svcBamt;
      this.selected.count--;
      this.selected.svcMgmtNum[id] = null;
      this.selected.bamtClCd[id] = null;
    } else {
      this.selected.count++;
      this.totalAmt += this.result[id].nomal_svcBamt;
      this.selected.svcMgmtNum[id] = this.result[id].svcMgmtNum;
      this.selected.bamtClCd[id] = this.result[id].bamtClCd;
    }

    this.$refund_request_sum.html(Tw.FormatHelper.addComma(this.totalAmt.toString()));
  },

  setRefundInfo: function () {
    this.totalAmt = 0;
    this.result.map($.proxy(function (o, i) {
      o.listId = i;
      o.nomal_svcBamt = parseInt(this.common._normalizeNumber(o.svcBamt), 10);
      this.totalAmt += o.nomal_svcBamt;
    }, this));
    this.$refund_total.html(Tw.FormatHelper.addComma(this.totalAmt.toString()));
    this.$refund_count.html(this.result.length);
    this.$refund_request_sum.html(Tw.FormatHelper.addComma(this.totalAmt.toString()));
  },

  _setListUI: function (data, partial, listWrapper, listTemplate, wrapperTemplate, emptyTemplate, count,
                        btnMoreSelector, listWrapperSelector, callback) {
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
    }, count, btnMoreSelector, listWrapperSelector, $.proxy(callback, this));
  },

  _normalizeArray: function (arr) {
    return _.filter(arr, function (n) {
      return n !== null;
    });
  },

  refundReqestHandler: function () {
    if (!this.totalAmt) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.HISTORY_A09);
    } else {
      this.common._goLoad('/payment/history/excesspay/account?total=' + this.totalAmt +
          '&recCnt=' + this.selected.count +
          '&svcMgmtNum=' + this._normalizeArray(this.selected.svcMgmtNum) +
          '&bamtClCd=' + this._normalizeArray(this.selected.bamtClCd));
    }
  },

  _apiError: function (err) {
    this.common._apiError(err);
  }
};
