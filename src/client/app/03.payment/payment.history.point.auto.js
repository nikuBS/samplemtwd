/**
 * FileName: payment.history.point.auto.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */
Tw.PaymentHistoryPointAuto = function (rootEl) {
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

Tw.PaymentHistoryPointAuto.prototype = {
  _cachedElement: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');

    this.$ocbListWrapper = this.$container.find('#tab1-tab');
    this.$tPointListWrapper = this.$container.find('#tab2-tab');
    this.$rainbowListWrapper = this.$container.find('#tab3-tab');

    this.listWrapperTemplate = $('#list-wrapper');
    this.defaultPointTemplate = $('#list-default');
    this.rainbowPointTemplate = $('#list-rainbow');
    this.emptyListTemplate = $('#list-empty');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);
  },

  _init: function () {

    this.currentPoint = this._hash._currentHashNav || 'ocb';
    this._setPageInfo();

    this._getHistoryData();
  },

  _setPageInfo: function () {
    this.useTemplate = this.currentPoint !== 'rainbow' ? this.defaultPointTemplate : this.rainbowPointTemplate;

    switch (this.currentPoint) {
      case 'tpoint':
        this.apiName = Tw.API_CMD.BFF_07_0006;
        this.$listWrapper = this.$tPointListWrapper;
        this.pointTitle = Tw.MSG_PAYMENT.HISTORY_POINT_TITLE_TPOINT;
        this.pointAutoPayURL = '/payment/point';
        break;
      case 'rainbow':
        this.apiName = Tw.API_CMD.BFF_07_0007;
        this.$listWrapper = this.$rainbowListWrapper;
        this.pointTitle = Tw.MSG_PAYMENT.HISTORY_POINT_TITLE_RAINBOW;
        this.pointAutoPayURL = '/payment/point';
        break;
      case 'ocb':
        this.apiName = Tw.API_CMD.BFF_07_0005;
        this.$listWrapper = this.$ocbListWrapper;
        this.pointTitle = Tw.MSG_PAYMENT.HISTORY_POINT_TITLE_OCB;
        this.pointAutoPayURL = '/payment/point';
        break;
      default:
        Tw.Logger.error('Wrong Excess');
        break;
    }
  },

  _getHistoryData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, {}).done($.proxy(this._setHistoryData, this)).error($.proxy(this._apiError, this));
    } else {
      // TODO : history replace
    }
  },

  _setHistoryData: function (res) {
    if (res.code !== Tw.API_CODE) this.common._apiError(res);
    console.log('[payment/history/auto', res, res.result);

    // TODO : dummy data -> API 연동 후 삭제
    res = (res.result.payHist.length || res.result.reqHist.length) ? res : this.apiName === 'rainbow' ? this.dummy.rainbow : this.dummy.defaultData;

    if (res.result.payHist.length || res.result.reqHist.length) {

      // TODO : data 처리(포인트 포메팅, 날짜 포메팅)

      res.result = _.chain().union(res.result.reqHist, res.result.payHist).sortBy(function (obj) {
        return (this.currentPoint !== 'rainbow') ? (obj.procDt || obj.opDt) : (obj.procDt || obj.out1InvDt);
      }, this).value().reverse();

      res.result.map($.proxy(function (o) {

        o.reqDate = this._dateHelper.getShortDateWithFormat(o.procDt || o.opDt, 'YYYY.MM.DD');
        o.storeName = o.opSaleOrgIdNm || o.opSaleOrgNm;

        if (o.reqClCdNm) {
          switch (o.reqClCdNm) {
            case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_APPLY :
              break;
            case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_CHANGE :
              break;
            case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_QUIT :
            case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_CANCEL :
              break;
          }
          o.reqEndDate = this._dateHelper.getShortDateWithFormat(o.endDt, 'YYYY.MM.DD');
          o.reqAmt = Tw.FormatHelper.addComma(o.reqAmt);
        } else {
          o.isFinish = true;
          o.ppayAmt = Tw.FormatHelper.addComma(o.ppayAmt);
          o.ppayBamt = Tw.FormatHelper.addComma(o.ppayBamt);
        }
      }, this));

    } else {
      res.pointTitle = this.pointTitle;
      res.pointAutoPayURL = this.pointAutoPayURL;
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
    }, 10, '.contents-info-list .bt-more', '.inner .payment-detail-wrap');
  },

  _apiError: function (res) {
    console.log(res.msg);
  },

  dummy: {
    defaultData: {
      'code': '00',
      'msg': 'success',
      'result': {
        'reqHist': [
          {
            'reqClCdNm': '신청',
            'procDt': '20180323',
            'endDt': '20190323',
            'reqAmt': '1000',
            'cardNum': '123************',
            'opSaleOrgIdNm': 'T월드 모바일 웹'
          },
          {
            'reqClCdNm': '해지',
            'procDt': '20180423',
            'endDt': '20190423',
            'reqAmt': '1000',
            'cardNum': '123************',
            'opSaleOrgIdNm': 'T월드 모바일 웹'
          },
          {
            'reqClCdNm': '해지',
            'procDt': '20180523',
            'endDt': '20190523',
            'reqAmt': '1000',
            'cardNum': '123************',
            'opSaleOrgIdNm': 'T월드 모바일 웹'
          },
          {
            'reqClCdNm': '변경',
            'procDt': '20180623',
            'endDt': '20190623',
            'reqAmt': '1000',
            'cardNum': '123************',
            'opSaleOrgIdNm': 'T월드 모바일 웹'
          },
          {
            'reqClCdNm': '신청',
            'procDt': '20180627',
            'endDt': '20190627',
            'reqAmt': '1000',
            'cardNum': '123************',
            'opSaleOrgIdNm': 'T월드 모바일 웹'
          },
          {
            'reqClCdNm': '해지',
            'procDt': '20180703',
            'endDt': '20190703',
            'reqAmt': '1000',
            'cardNum': '123************',
            'opSaleOrgIdNm': 'T월드 모바일 웹'
          }
        ],
        'payHist': [
          {
            'payOpTm': '20180703090102',
            'opDt': '20180703',
            'ppayAmt': '1000',
            'ppayBamt': '6000',
            'opSaleOrgNm': 'T월드 모바일 웹'
          },
          {
            'payOpTm': '20180629090102',
            'opDt': '20180629',
            'ppayAmt': '1000',
            'ppayBamt': '6000',
            'opSaleOrgNm': 'T월드 모바일 웹'
          },
          {
            'payOpTm': '20180523090102',
            'opDt': '20180523',
            'ppayAmt': '1000',
            'ppayBamt': '6000',
            'opSaleOrgNm': 'T월드 모바일 웹'
          },
          {
            'payOpTm': '20180423090102',
            'opDt': '20180423',
            'ppayAmt': '1000',
            'ppayBamt': '6000',
            'opSaleOrgNm': 'T월드 모바일 웹'
          },
          {
            'payOpTm': '20180323090102',
            'opDt': '20180323',
            'ppayAmt': '1000',
            'ppayBamt': '6000',
            'opSaleOrgNm': 'T월드 모바일 웹'
          },
          {
            'payOpTm': '20180223090102',
            'opDt': '20180223',
            'ppayAmt': '1000',
            'ppayBamt': '6000',
            'opSaleOrgNm': 'T월드 모바일 웹'
          }

        ]
      }
    },
    rainbow: {
      'code': '00',
      'msg': 'success',
      'result': {
        'reqHist': [
          {
            'procDt': '20180702',
            'reqChgNm': '음성통화료',
            'reqClCdNm': '신청취소',
            'opSaleOrgIdNm': '모바일 Tworld'
          },
          {
            'procDt': '20180621',
            'reqChgNm': '음성통화료',
            'reqClCdNm': '변경',
            'opSaleOrgIdNm': '모바일 Tworld'
          },
          {
            'procDt': '20180523',
            'reqChgNm': '음성통화료',
            'reqClCdNm': '신청',
            'opSaleOrgIdNm': '모바일 Tworld'
          },
          {
            'procDt': '20180413',
            'reqChgNm': '음성통화료',
            'reqClCdNm': '신청취소',
            'opSaleOrgIdNm': '모바일 Tworld'
          },
          {
            'procDt': '20180403',
            'reqChgNm': '음성통화료',
            'reqClCdNm': '신청',
            'opSaleOrgIdNm': '모바일 Tworld'
          },
          {
            'procDt': '20180323',
            'reqChgNm': '음성통화료',
            'reqClCdNm': '신청변경',
            'opSaleOrgIdNm': '모바일 Tworld'
          },
          {
            'procDt': '20180223',
            'reqChgNm': '음성통화료',
            'reqClCdNm': '신청취소',
            'opSaleOrgIdNm': '모바일 Tworld'
          },
          {
            'procDt': '20180220',
            'reqChgNm': '음성통화료',
            'reqClCdNm': '신청',
            'opSaleOrgIdNm': '모바일 Tworld'
          }
        ],
        'payHist': [
          {
            'out1InvDt': '20180703',
            'out1UseAmt': '1000',
            'out1OpOrgNm': 'T월드 모바일 웹'
          },
          {
            'out1InvDt': '20180623',
            'out1UseAmt': '1000',
            'out1OpOrgNm': 'T월드 모바일 웹'
          },
          {
            'out1InvDt': '20180523',
            'out1UseAmt': '1000',
            'out1OpOrgNm': 'T월드 모바일 웹'
          },
          {
            'out1InvDt': '20180423',
            'out1UseAmt': '1000',
            'out1OpOrgNm': 'T월드 모바일 웹'
          },
          {
            'out1InvDt': '20180323',
            'out1UseAmt': '1000',
            'out1OpOrgNm': 'T월드 모바일 웹'
          },
          {
            'out1InvDt': '20180227',
            'out1UseAmt': '1000',
            'out1OpOrgNm': 'T월드 모바일 웹'
          },
          {
            'out1InvDt': '20180223',
            'out1UseAmt': '1000',
            'out1OpOrgNm': 'T월드 모바일 웹'
          }
        ]
      }
    }
  }
};
