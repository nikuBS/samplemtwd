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

    this.STRING = {
      HBS_WITHDRAWAL: 'PA_06_04_L01'
    };

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

    res = {
      'code': '00',
      'msg': 'success',
      'result': {
        'recCnt': '',
        'recCnt1': '',
        'recCnt2': '',
        'idrwObjYn': 'Y',
        'idrwRejtYn': 'N',
        'dpstrRelCd': '010',
        'bankCd': '',
        'bankNm': '국민은행',
        'bankSerNum': '',
        'bankNum': '00000000000000',
        'm6ObjYn': 'Y',
        'idrwCnt': '0002',
        'idrwAmt': '000000000034560',
        'maxDrwYm': '201710',
        'selDrwYm': '201709',
        'errCd': '',
        'respMsg': '',
        'integratedDrawalRecord': [
          {
            'acntNum': '1111111111',
            'drwYm': '201709',
            'drwDt': '20170921',
            'reqSvcNum': '7257037325',
            'svcNum': '7257037325',
            'svcCd': 'I',
            'svcCdNm': '인터넷',
            'drwStCd': 'NR',
            'drwStCdNm': '정상인출',
            'drwErrCd': '00',
            'drwErrCdNm': 'EDI 정상인출',
            'drwAmt': '000000000020040',
            'drwAmtTyp': 'D',
            'payCyclCd': '3',
            'reqTs': '1',
            'tmthColClCd': '9',
            'bankNum': '91930201528450',
            'bankNm': '국민은행'
          },
          {
            'acntNum': '1111111111',
            'drwYm': '201709',
            'drwDt': '20170921',
            'reqSvcNum': '7257037325',
            'svcNum': '7257037325',
            'svcCd': 'I',
            'svcCdNm': '인터넷',
            'drwStCd': 'NR',
            'drwStCdNm': '정상인출',
            'drwErrCd': '00',
            'drwErrCdNm': 'EDI 정상인출',
            'drwAmt': '000000000020040',
            'drwAmtTyp': 'D',
            'payCyclCd': '3',
            'reqTs': '1',
            'tmthColClCd': '9',
            'bankNum': '91930201528450',
            'bankNm': '국민은행'
          }
        ]
      }
    };

    console.log(res);


    if (res.result.integratedDrawalRecord.length) {

      res.result.integratedDrawalRecord.map($.proxy(function (o) {
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
      res.removeURL = this.emptyURL;
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
      this.$listWrapper.parent().addClass('nogaps-btm');
    }
    this.addListButtonHandler();
  },

  _apiError: function (res) {
    Tw.Logger.error(res.msg);
    return false;
  }
};
