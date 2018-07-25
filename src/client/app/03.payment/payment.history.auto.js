/**
 * FileName: payment.history.auto.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.04
 */
Tw.PaymentHistoryAuto = function (rootEl) {
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

Tw.PaymentHistoryAuto.prototype = {
  _cachedElement: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');

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

    this.STRING = {
      HBS_BANK: 'PA_06_03_L01',
      HBS_CARD: 'PA_06_03_L02'
    };

    this._getData();
  },

  _setPageInfo: function () {
    this.useTemplate = this.defaultListTemplate;

    this.apiName = Tw.API_CMD.BFF_07_0037;

    this.emptyURL = '/payment/auto';
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
    this.result = res.result.autoPaymentRecord;

    if (this.result.length) {

      this.result.map($.proxy(function (o, i) {
        o.isCard = this._isCard(o.bankCardCoCdNm);
        this._getStatusCodeAndColor(o, o.drwErrCdNm);

        o.reqDate = this._dateHelper.getShortDateWithFormat(o.lastInvDt, 'YYYY.MM.DD');

        o.drwYm = this._dateHelper.getShortDateWithFormat(o.drwYm + '01', 'YYYY.MM', 'YYYYMMDD');
        o.startDate = this._dateHelper.getShortDateWithFormatAddByUnit(o.drwYm, -1, 'months', 'YYYY.MM.DD', 'YYYY.MM');
        o.endDate = this._dateHelper.getEndOfMonth(o.startDate, 'YYYY.MM', 'YYYYMMDD');

        o.drwYm = o.invDtYm;
        o.startDate = o.lastInvDtFromTo.substr(0, 10);
        o.endDate = o.lastInvDtFromTo.substr(-10);
        o.type = o.tmthColClCdNm;

        o.drwAmt = Tw.FormatHelper.addComma(this.common._normalizeNumber(o.drwAmt)) || '0';
        o.drwReqAmt = Tw.FormatHelper.addComma(this.common._normalizeNumber(o.drwReqAmt));

        o.listId = i;


        // console.log(o);
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

  _getStatusCodeAndColor: function (o, drwErrCdNm) {
    switch (drwErrCdNm) {
      case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_WITHDRAWAL_BEFORE :
        o.isBefore = true;
        o.payStateColorClass = 'cancel-com';
        break;
      case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_WITHDRAWAL_ING :
        o.isIng = true;
        o.payStateColorClass = 'gray-com';
        break;
      case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_WITHDRAWAL_OK :
        o.isDone = true;
        o.payStateColorClass = 'payment-com';
        break;
      default :
        break;
    }
  },

  _isCard: function (bankCardCoCdNm) {
    return bankCardCoCdNm.indexOf(Tw.MSG_PAYMENT.HISTORY_AUTO_CARD_KEYWORD) > 0;
  },

  appendListCallBack: function () {
    if (this.result.length) {
      this.$listWrapper.parent().addClass('nogaps-btm');
    }
    this.addListButtonHandler();
  },

  addListButtonHandler: function () {
    this.$container.find('.detail-btn').off().on('click', '.fe-btn', $.proxy(this.listButtonHandler, this));
  },

  listButtonHandler: function (e) {
    var index = $(e.target).data('list-id');
    this._popupService.open({
          hbs: this.result[index].isCard ? this.STRING.HBS_CARD : this.STRING.HBS_BANK,
          data: this.result[index]
        },
        $.proxy(this.detailOpenCallback, this));
  },

  detailOpenCallback: function ($layer) {
    $layer.on('click', '.bt-blue1 button', $.proxy(this._popupService.close, this));
  },

  _apiError: function (err) {
    this.common._apiError(err);
  }
};
