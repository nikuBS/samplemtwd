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
  },

  _init: function () {
    this._setPageInfo();
    this._getData();
  },

  _setPageInfo: function () {
    this.useTemplate = this.defaultListTemplate;

    this.apiName = Tw.API_CMD.BFF_07_0039;

    this.withdrawalStopTemplateName = 'PA_06_04_L01';

    this.autoPaymentApplyURL = '/payment/auto';
  },

  _getData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption).done($.proxy(this._setData, this)).error($.proxy(this._apiError, this));
    } else {
      // TODO : history replace
    }
  },

  _setData: function (res) {
    console.log(res, res.result.length);
    if (res.code !== Tw.API_CODE) this.common._apiError(res);

    if (res.result.length) {

      res.result.map($.proxy(function (o) {
        o.isPoint = true;

        // rainbow : rbpChgRsnCdNm '신청취소', '신청', '청구반영'
        // ocb, tp : payClNm '취소', '수납'

        // o.isReserved = o.rbpChgRsnCdNm === Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_APPLY;
        // o.isPayCompleted = o.payClNm === Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_RECEIVE_OK ||
        //     o.rbpChgRsnCdNm === Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_REQUEST_DONE;
        // o.isCanceled = o.payClNm === Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_CANCEL ||
        //     o.rbpChgRsnCdNm === Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_REQUEST_CANCEL;
        //
        // o.reqDate = this._dateHelper.getShortDateWithFormat(o.opDt || o.reqDt, 'YYYY.MM.DD');
        // o.chargeName = o.chargeName || o.prodNameTxt;
        // o.reqAmt = Tw.FormatHelper.addComma(o.ppayAmt || o.rbpPt);
        // o.isCancelAble = o.cancleYn === 'Y';
        // o.listId = i;

      }, this));

    } else {
      res.autoPaymentApplyURL = this.autoPaymentApplyURL;
    }

    var list = new this.common.listWithTemplate();
    list._init(res, this.$listWrapper, {
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

  addListButtonHandler: function () {

  },

  appendListCallBack: function () {
    if (this.result.length) {
      this.$listWrapper.addClass('nogaps-btm');
    }
    this.addListButtonHandler();
  },

  _apiError: function (res) {
    Tw.Logger.error(res.msg);
  }

  /*  자동납부 통합인출 서비스 해지 신청 팝업

  popup.open({
    hbs:'PA_06_04_L01'// hbs의 파일명
  });
  */
};
