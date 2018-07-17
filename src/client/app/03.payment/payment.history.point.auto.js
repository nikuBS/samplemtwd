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

    this.$tabTriggerWrappers = this.$container.find('.tab-linker li');

    this.$ocbListWrapper = this.$container.find('#tab1-tab');
    this.$tPointListWrapper = this.$container.find('#tab2-tab');
    this.$rainbowListWrapper = this.$container.find('#tab3-tab');

    this.$subDetailAccoOver = this.$container.find('.acco-cover');

    this.listWrapperTemplate = $('#list-wrapper');
    this.defaultPointTemplate = $('#list-default');
    this.rainbowPointTemplate = $('#list-rainbow');
    this.emptyListTemplate = $('#list-empty');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);

    $(window).on('hashchange', $.proxy(this.tabChangeHandler, this));
  },

  _init: function () {

    this._updateCurrentPoint();
    this._initTabUI();

    // this._initSubDescUI();
  },

  _updateCurrentPoint: function() {
    this.currentPoint = this._hash._currentHashNav || 'ocb';
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

  _initTabUI: function () {
    switch(this.currentPoint) {
      case 'ocb' :
        this.$tabTriggerWrappers.eq(0).attr('aria-selected', true);
        break;
      case 'tpoint' :
        this.$tabTriggerWrappers.eq(1).attr('aria-selected', true);
        break;
      case 'rainbow' :
        this.$tabTriggerWrappers.eq(2).attr('aria-selected', true);
        break;
      default:
        break;
    }
    this._setPageInfo();
    this._getHistoryData();
  },

  _getHistoryData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, {}).done($.proxy(this._setHistoryData, this)).error($.proxy(this._apiError, this));
    } else {
      // TODO : history replace
    }
  },

  _setHistoryData: function (res) {
    if (res.code !== Tw.API_CODE.CODE_00) return this._apiError(res);

    if (res.result.payHist.length || res.result.reqHist.length) {

      res.result = _.chain().union(res.result.reqHist, res.result.payHist).sortBy(function (obj) {
        return (this.currentPoint !== 'rainbow') ? (obj.procDt || obj.opDt) : (obj.procDt || obj.out1InvDt);
      }, this).value().reverse();

      res.result.map($.proxy(function (o) {

        o.reqDate = this._dateHelper.getShortDateWithFormat(o.procDt || o.opDt, 'YYYY.MM.DD');
        o.storeName = o.opSaleOrgIdNm || o.opSaleOrgNm;

        if (o.reqClCdNm) {
          switch (o.reqClCdNm) {
            case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_APPLY :
              o.isApply = true;
              break;
            case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_CHANGE :
              o.isChange = true;
              break;
            case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_QUIT :
            case Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_REQUEST_CANCEL :
              o.isQuit = true;
              break;
            default:
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
    }, 10, '.contents-info-list .bt-more');
  },

  tabChangeHandler: function() {
    this._updateCurrentPoint();
    this._setPageInfo();
    this._getHistoryData();
    // this._initSubDescUI();
  },

  _initSubDescUI: function() {
    this.$subDetailAccoOver.addClass('none');
    switch(this.currentPoint) {
      case 'ocb':
        this.$subDetailAccoOver.eq(0).removeClass('none');
        break;
      case 'tpoint':
        this.$subDetailAccoOver.eq(1).removeClass('none');
        break;
      case 'rainbow':
        this.$subDetailAccoOver.eq(2).removeClass('none');
        break;
      default:
        break;
    }
  },

  _getPointTypeForURL: function () {
    return this.common.parse_query_string(window.location.search.substring(1)).point;
  },

  _apiError: function (res) {
    Tw.Logger.error(res.msg);
    return false;
  }
};
