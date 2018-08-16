/**
 * FileName: payment.history.realtime.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.04
 */
Tw.PaymentHistoryRealtime = function (rootEl) {
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

Tw.PaymentHistoryRealtime.prototype = {
  _cachedElement: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');

    this.$listWrapper = this.$container.find('#fe-list-wrapper');

    this.listWrapperTemplate = $('#list-wrapper');
    this.defaultListTemplate = $('#list-default');
    this.emptyListTemplate = $('#list-empty');

    this.useTemplate = this.defaultListTemplate;
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);
  },

  _init: function () {
    this.STRING = {
      HBS_OCB: 'PA_06_02_L01',
      HBS_TPOINT: 'PA_06_02_L02',
      HBS_BANK: 'PA_06_02_L03',
      HBS_CARD: 'PA_06_02_L04'
    };
    this.apiName = Tw.API_CMD.BFF_07_0035;
    this.api_detailName = Tw.API_CMD.BFF_07_0036;
    this.api_getCtzBizNum = Tw.API_CMD.BFF_07_0017;
    this.emptyURL = '/payment/point';

    this._isPersonalCompany();
  },

  _isPersonalCompany: function () {
    if (this.api_getCtzBizNum) {
      this._apiService.request(this.api_getCtzBizNum)
          .done($.proxy(function (res) {
            if (res.code !== Tw.API_CODE.CODE_BIL0018) {
              this.isCompany = true;
            } else {
              this.isPersonal = true;
            }
            this._getData();
          }, this))
          .error($.proxy(this._apiError, this));
    }
  },

  _getData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption).done($.proxy(this._setData, this)).error($.proxy(this._apiError, this));
    }
  },

  _setData: function (res) {

    if (res.code !== Tw.API_CODE.CODE_00) return this._apiError(res);
    this.result = res.result.realTimePaymentRecord;

    if (this.result.length) this.result.map($.proxy(function (o, i) {

      o.listId = i;
      o.paymentReqDate = this._dateHelper.getShortDateWithFormat(o.opDt, 'YYYY.MM.DD', 'YYYYMMDD');
      o.reqDate = this._dateHelper.getShortDateWithFormat(o.reqDtm, 'YYYY.MM.DD', 'YYYYMMDD');
      o.resDate = this._dateHelper.getShortDateWithFormat(o.resDtm, 'YYYY.MM.DD', 'YYYYMMDD');
      this.getDataPaymentType(o);
      o.svcNum = Tw.FormatHelper.getFormattedPhoneNumber(o.svcNum);
      o.paymentName = o.cardCdNm;
      o.payAmt = Tw.FormatHelper.addComma(this.common._normalizeNumber(o.payAmt));
      o.isFinish = !!o.cardProcNm;
      o.detailOption = {
        opDt: o.opDt || o.resDtm,
        payOpTm: o.payOpTm
      };

      o.isPersonal = this.isPersonal;

    }, this)); else {
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

  getDataPaymentType: function (o) {
    switch (o.settleWayCd) {
      case '10' :
        o.isOCB = true;
        break;
      case '11' :
        o.isTpoint = true;
        break;
      case '41' :
        o.isBank = true;
        break;
      case '02' :
        o.isCard = true;
        break;
      default :
        break;
    }
  },

  _getStatusCode: function (o, drwErrCdNm) {
    switch (drwErrCdNm) {
      case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_WITHDRAWAL_BEFORE :
        o.isBefore = true;
        break;
      case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_WITHDRAWAL_ING :
        o.isIng = true;
        break;
      case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_WITHDRAWAL_OK :
        o.isDone = true;
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

  getCurrentHBS_TEXT: function (data) {
    if (data.isOCB) {
      return this.STRING.HBS_OCB;
    }
    if (data.isTpoint) {
      return this.STRING.HBS_TPOINT;
    }
    if (data.isBank) {
      return this.STRING.HBS_BANK;
    }
    if (data.isCard) {
      return this.STRING.HBS_CARD;
    }
  },

  listButtonHandler: function (e) {
    this.currentIndex = $(e.target).data('list-id');
    var selectedList = this.result[this.currentIndex];
    this._apiService.request(this.api_detailName, selectedList.detailOption).done(
        $.proxy(this.detailSuccess, this, selectedList)).error($.proxy(this._apiError, this));
  },

  detailSuccess: function (oData, res) {

    var data = res.result.realTimePaymentRecord[0];
    data.payAmt = Tw.FormatHelper.addComma(this.common._normalizeNumber(data.payAmt));
    data.reqDate = oData.isBank ?
        this._dateHelper.getShortDateWithFormat(data.invDt, 'YYYY.MM.DD') :
        this._dateHelper.getShortDateWithFormat(data.reqDtm, 'YYYY.MM.DD', 'YYYYMMDDhhmmss');
    data.invDt = this._dateHelper.getShortDateWithFormat(
        data.invDt, Tw.MSG_PAYMENT.HISTORY_DATE_YYYYMM_CASE, 'YYYYMMDD');
    data.cardProcNm = Tw.MSG_PAYMENT.HISTORY_TEXT_PAYMENT + (data.cardProcNm === 'Y' ?
            Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_DONE :
            Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_CANCEL
    );
    data.resDate = this._dateHelper.getShortDateWithFormat(data.resDtm, 'YYYY.MM.DD', 'YYYYMMDDhhmmss');
    data.paymentName = data.cardCdNm;

    this._popupService.open({
          hbs: this.getCurrentHBS_TEXT(oData),
          data: data
        },
        $.proxy(this.detailOpenCallback, this));
  },

  detailOpenCallback: function ($layer) {
    $layer.on('click', '.bt-blue1 button', $.proxy(this._popupService.close, this));
    if (this.result[this.currentIndex].isBank) {
      $layer.on('click', '.fe-btn', $.proxy(this._moveReceiptPage, this));
    }
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
