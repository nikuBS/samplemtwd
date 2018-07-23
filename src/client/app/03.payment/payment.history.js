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
    this.refundListTemplate = $('list-refund');
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

    this._getData();
  },

  _getData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption).done($.proxy(this._setData, this)).error($.proxy(this._apiError, this));
    } else {
      // TODO : history replace
    }
  },

  isSubResultsOk: function (res) {
    if (res === undefined || res === null) return false;
    return _.isEmpty(res.paymentRecord) || _.isEmpty(res.refundRecord);
  },

  unionRelativeResult: function (payment, refund) {
    return _.chain().union(payment, refund).sortBy(function (obj) {
      return obj.opDt || obj.opDt1;
    }, this).value().reverse();
  },

  checkHasAccountRegistrable: function (data) {
    data.map($.proxy(function (o) {
      if(!o.effStaDt) {
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

    // console.log(res.result.paymentRecord, res.result.refundRecord);

    if (this.isSubResultsOk(res.result)) {

      if (!_.isEmpty(res.result.refundRecord)) {
        this.checkHasAccountRegistrable(res.result.refundRecord);
      }

      this.defaultResult = this.unionRelativeResult(res.result.paymentRecord, res.result.refundRecord);
      // console.log(this.defaultResult);

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

    if(this.countOverPaid) {
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

  openOverPaidPopup: function() {
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
        'contents_b': '<div class=\'widget pop-btm-area\'>' +
        '<div class=\'widget-box check\'><ul class=\'select-list\' role=\'group\'>' +
        '<li class=\'checkbox type01\' role=\'checkbox\' aria-checked=\'false\'>' +
        '<input type=\'checkbox\' name=\'checkbox\' title=\''+
        Tw.MSG_PAYMENT.HISTORY_OVER_PAY.CHECK_TEXT +
        '\'>' + Tw.MSG_PAYMENT.HISTORY_OVER_PAY.CHECK_TEXT + '</li></ul></div></div>'
      });
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

  defaultListButtonHandler: function () {

    // this.currentIndex = $(e.target).data('list-id');

    // 환불계좌 등록 process
    this.common._goLoad('/payment/history/excesspay');
  },

  refundListCallBack: function () {
    this.$container.find('#fe-refund-request-wrapper').off().on(
        'click', '.fe-btn', $.proxy(this.refundListButtonHandler, this));
  },

  refundListButtonHandler: function (e) {
    var index = $(e.target).data('list-id');

    this._popupService.open({
      hbs: this.STRING.REFUND_DETAIL,
      data: this.refundResult[index]
    }, function () {
    });
  },

  _moveReceiptPage: function (e) {
    this._popupService.close();
    if ($(e.target).hasClass('cash')) {
      this.common._goLoad('/payment/history/receipt/cash');
    } else {
      this.common._goLoad('/payment/history/receipt/tax');
    }
  },

  _apiError: function (res) {
    Tw.Logger.error(res.msg);
    this.$listWrapper.html('<br /><span style=\"color:red;\"><b>ERROR: </b>' + res.msg + '</span>');
    return false;
  },

  dummy: {
    'code': '00',
    'msg': 'success',
    'result': {
      'occursCnt': 12,
      'custName': '김OO',
      'custTel': '01011112222',
      'recCnt': '00001',
      'recCnt1': '00012',
      'recCnt2': '00001',
      'recCnt3': '00000',
      'repYn': 'Y',
      'autoTrnsfYn': 'Y',
      'mtYn': 'N',
      'errCd': '',
      'respMsg': '',
      'paymentRecord': [
        {
          'opDt': '20180409',
          'payAmt': '000000000026790',
          'invDt': '20170831',
          'invAmt': '000000000026790',
          'payMthdCd': '20',
          'svcCnt': '001'
        }
      ],
      'refundRecord': [
        {
          'svcMgmtNum': '',
          'svcCd': '',
          'bamtClCd': '',
          'opDt1': '',
          'svcBamt': '',
          'effStaDt': '',
          'rfndBankCd': '',
          'rfndBankNm': '',
          'rfndBankNum': '',
          'rfndDpstrNm': '김OO'
        }
      ],
      'refundPaymentRecord': [
        {
          'rfndReqDt': '',
          'ovrPay': '',
          'rfndObjAmt': '',
          'sumAmt': '',
          'effStaDt1': '',
          'bankCd': '',
          'rfndBankNm1': '',
          'rfndBankNum1': '',
          'msg': ''
        }
      ]
    }
  }
  /*
    과납 안내 관련 팝업
    popup.open({
      'title': '과납 안내 드립니다.',
      'close_bt': true,
      'title2': '홍길동님의<br />휴대폰 요금 3건이 과납되었습니다.',
      'contents': '<strong>환불받으실 금액을 확인</strong>하시고<br /> 환불 받을 계좌를 등록해 주세요!',
      'bt_num':'',
      'type': [{
        class: 'bt-red1',
        href: 'submit',
        txt: '과납금액확인하기'
       }],
       'contents_b': '<div class='widget pop-btm-area'>' +
        '<div class='widget-box check'><ul class="select-list" role="group">' +
        '<li class="checkbox type01" role="checkbox" aria-checked="false">' +
        '<input type="checkbox" name="checkbox" title="하루동안 보지 않기"> 하루동안 보지 않기</li></ul></div></div>'
      });
    */


  /* 환불 처리 내역 상세 팝업
      popup.open({
          hbs:'PA_06_07_L02'// hbs의 파일명
      });

   */
};
