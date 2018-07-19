/**
 * FileName: payment.history.point.reserve.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.04
 */
Tw.PaymentHistoryPointReserve = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.PaymentHistoryCommon(rootEl);
  this.STRING = {};

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.PaymentHistoryPointReserve.prototype = {
  _cachedElement: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');

    this.$tabTriggerWrappers = this.$container.find('.tab-linker li');

    this.$ocbListWrapper = this.$container.find('#tab1-tab');
    this.$tPointListWrapper = this.$container.find('#tab2-tab');
    this.$rainbowListWrapper = this.$container.find('#tab3-tab');

    this.$subDetailAccoOver = this.$container.find('.acco-cover');

    this.listWrapperTemplate = $('#list-wrapper');
    this.defaultPointTemplate = $('#list-default');
    this.emptyListTemplate = $('#list-empty');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);

    $(window).on('hashchange', $.proxy(this.tabChangeHandler, this));
  },

  _init: function () {

    this._updateCurrentPoint();
    this._initTabUI();

    this._initSubDescUI();
  },

  _updateCurrentPoint: function () {
    this.currentPoint = this._hash._currentHashNav || 'ocb';
    if (this.currentPoint !== 'ocb' && this.currentPoint !== 'tpoint' && this.currentPoint !== 'rainbow') {
      this.currentPoint = 'ocb';
    }
  },

  _setPageInfo: function () {
    this.currentData = {};
    this.useTemplate = this.defaultPointTemplate;

    this.apiName = Tw.API_CMD.BFF_07_0058;
    this.apiReserveCancelName = Tw.API_CMD.BFF_07_0047;

    switch (this.currentPoint) {
      case 'ocb':
        this.$listWrapper = this.$ocbListWrapper;
        this.pointTitle = Tw.MSG_PAYMENT.HISTORY_POINT_TITLE_OCB;
        this.apiOption = {ptClCd: Tw.MSG_PAYMENT.HISTORY_POINT_CODE_OCB};
        this.detailTemplateFileName = 'PA_06_05_L01';
        this.STRING.CLOSE = Tw.MSG_PAYMENT.HISTORY_A03;
        this.STRING.CLOSE_FINISH = Tw.MSG_PAYMENT.HISTORY_A03_01;
        break;
      case 'tpoint':
        this.$listWrapper = this.$tPointListWrapper;
        this.pointTitle = Tw.MSG_PAYMENT.HISTORY_POINT_TITLE_TPOINT;
        this.apiOption = {ptClCd: Tw.MSG_PAYMENT.HISTORY_POINT_CODE_TPOINT};
        this.detailTemplateFileName = 'PA_06_05_L02';
        this.STRING.CLOSE = Tw.MSG_PAYMENT.HISTORY_A04;
        this.STRING.CLOSE_FINISH = Tw.MSG_PAYMENT.HISTORY_A04_01;
        break;
      case 'rainbow':
        this.apiName = Tw.API_CMD.BFF_07_0059;
        this.apiReserveCancelName = Tw.API_CMD.BFF_07_0050;
        this.$listWrapper = this.$rainbowListWrapper;
        this.pointTitle = Tw.MSG_PAYMENT.HISTORY_POINT_TITLE_RAINBOW;
        this.detailTemplateFileName = 'PA_06_05_L03';
        this.STRING.CLOSE = Tw.MSG_PAYMENT.HISTORY_A05;
        this.STRING.CLOSE_FINISH = Tw.MSG_PAYMENT.HISTORY_A05_01;
        break;
      default:
        Tw.Logger.error('Wrong Excess');
        break;
    }
    this.emptyURL = '/payment/point';
  },

  _initTabUI: function () {
    switch (this.currentPoint) {
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

    if (res.result.length) {

      res.result.map($.proxy(function (o, i) {
        o.isPoint = true;

        o.isReserved = o.rbpChgRsnCdNm === Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_RESERVE_DONE;
        o.isPayCompleted = o.payClNm === Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_RECEIVE_DONE ||
            o.rbpChgRsnCdNm === Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_RECEIVE_DONE;
        o.isCanceled = o.payClNm === (Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_CANCEL + Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_DONE) ||
            o.rbpChgRsnCdNm === (Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_CANCEL + Tw.MSG_PAYMENT.HISTORY_PROCESS_TYPE_DONE);

        o.reqDate = this._dateHelper.getShortDateWithFormat(o.opDt || o.reqDt, 'YYYY.MM.DD');
        o.chargeName = o.chargeName || o.prodNameTxt;
        o.reqAmt = Tw.FormatHelper.addComma(o.ppayAmt || o.rbpPt);
        o.isCancelAble = o.cancleYn === 'Y';
        o.listId = i;

        console.log(o);

      }, this));

      this.currentData = res.result;
      if (this.currentPoint !== 'rainbow') {
        this._getRecentIndex();
      }

    } else {
      res.pointTitle = this.pointTitle;
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
    }, 10, '.contents-info-list .bt-more', '', $.proxy(this.addListButtonHandler, this));
  },

  tabChangeHandler: function () {
    if (this._hash._currentHashNav !== this.currentPoint) {
      this._updateCurrentPoint();
      this._setPageInfo();
      this._getData();
      this._initSubDescUI();
    }
  },

  _getRecentIndex: function () {
    var reserveCancelableIndex = (_.find(this.currentData, function (o) {
      return o.cancleYn === 'Y';
    }));
    this.reserveCancelableIndex = !reserveCancelableIndex ? null : reserveCancelableIndex.listId;
  },

  _canReserveCancel: function (index) {
    if (this.currentPoint === 'rainbow') return true;
    if (this.reserveCancelableIndex === index) return true;
    return false;
  },

  addListButtonHandler: function () {
    this.$container.find('.detail-btn').off().on('click', '.fe-btn', $.proxy(this.listButtonHandler, this));
  },

  listButtonHandler: function (e) {
    var index = $(e.target).data('list-id');

    if ($(e.target).hasClass('point-color')) {
      if (this._canReserveCancel(index)) {
        this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, this.STRING.CLOSE, '',
            null,
            $.proxy(this.reserveCancelConfirmCallBack, this),
            $.proxy(this.reserveCancelCloseCallBack, this, this.currentData[index]));
      } else {
        this._popupService.openAlert(
            Tw.MSG_PAYMENT.HISTORY_A10,
            Tw.POPUP_TITLE.NOTIFY
        );
      }

    } else {
      this._popupService.open({
            hbs: this.detailTemplateFileName,
            data: this.currentData[index]
          },
          $.proxy(this.detailOpenCallback, this));
    }
  },

  reserveCancelConfirmCallBack: function () {
    this.isPopupConfimClicked = true;
    this._popupService.close();
  },

  reserveCancelCloseCallBack: function (data) {
    if (this.isPopupConfimClicked) {

      if (this.currentPoint !== 'rainbow') {
        this._reserveCancel({
          ptClCd: this.apiOption.ptClCd,
          opDt: data.opDt,
          payOpTm: data.payOpTm
        });
      } else {
        this._reserveCancel({
          rbpSerNum: data.rbpSerNum
        });
      }
    }
  },

  detailOpenCallback: function ($layer) {
    $layer.on('click', '.bt-blue1 button', $.proxy(this._popupService.close, this));
  },

  reserveCancelConfirmFinishCallBack: function () {
    this._popupService.close();
  },

  reserveCancelConfirmFinishCloseCallBack: function () {
    this._setPageInfo();
    this._getData();
  },

  _reserveCancel: function (option) {
    this._apiService.request(this.apiReserveCancelName, option).done($.proxy(this._reserveCancelHandler, this)).error($.proxy(function () {
          this._apiError();
          this._popupService.close();
        }, this
    ));
  },

  _reserveCancelHandler: function () {
    this._popupService.openAlert(
        this.STRING.CLOSE_FINISH,
        Tw.POPUP_TITLE.NOTIFY,
        $.proxy(this.reserveCancelConfirmFinishCallBack, this),
        $.proxy(this.reserveCancelConfirmFinishCloseCallBack, this)
    );
    this.isPopupConfimClicked = false;
  },

  _initSubDescUI: function () {
    this.$subDetailAccoOver.addClass('none');
    switch (this.currentPoint) {
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
    this.$listWrapper.html('<br /><div style=\"color:red;padding:1.8rem;\"><b>SERVER ERROR : </b>' + res.msg + '</div>');
    return false;
  }

};
