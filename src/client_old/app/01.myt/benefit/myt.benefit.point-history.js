/**
 * FileName: myt.benefit.point-history.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 14.
 */
Tw.MyTBenefitPointHistory = function (rootEl, type) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._dateHelper = Tw.DateHelper;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;
  this._formatHelper = Tw.FormatHelper;
  this._pointType = type;

  this.LIST_SIZE = 20; //리스트 아이템 노출 최대수

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTBenefitPointHistory.prototype = {
  _init: function () {
    var hash = this._hashService.initHashNav($.proxy(this._onHashChange, this));

    this.today = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYY-MM-DD');
    var selectedPeriod = $(':input:radio[name=selectdate1]:checked').attr('data-month');
    this._setPeriod(selectedPeriod);

    this._currentPage = 0;
    this._pageWidget = new Tw.MytBenefitPointPage('fe-points-list');
    this._requestHistoryData(hash || 1);
  },

  _onHashChange: function (hash) {
    if ( hash.raw ) {
      this._requestHistoryData(hash.raw);
    }
  },

  _cachedElement: function () {
    this.$fromDate = this.$container.find('input[data-type="from"]');
    this.$toDate = this.$container.find('input[data-type="to"]');
    this.$listWrapper = this.$container.find('#fe-points-list-wrapper');
    this.$sectionNoItem = this.$container.find('.fe-no-point');
    this.$btPeriod = this.$container.find('#fe-bt-period');
    this.$earnPoint = this.$container.find('#fe-earn-point');
    this.$usedPoint = this.$container.find('#fe-used-point');
    this.$detailSearch = this.$container.find('#fe-detail-search');
  },

  _bindEvent: function () {
    this.$container.on('change', '.fe-period input', $.proxy(this._onChangePeriod, this));
    this.$container.on('click', 'button[data-id="search"]', $.proxy(this._requestHistoryData, this, null));
    this.$container.on('click', '#fe-expiring-points', $.proxy(this._openExpiringPointPopup, this));

    this.$listWrapper.on('click', 'a.prev:not(.disabled)', $.proxy(this._onClickPrev, this));
    this.$listWrapper.on('click', 'a.next:not(.disabled)', $.proxy(this._onClickNext, this));

  },

  _onChangePeriod: function (e) {
    var month = e.target.getAttribute('data-month');
    this._setPeriod(month);
  },

  _setPeriod: function (months) {
    this.$toDate.val(this.today);
    var strFrom = this._dateHelper.getPastShortDate(months + Tw.DATE_UNIT.MONTH);
    strFrom = this._dateHelper.getShortDateWithFormat(strFrom, 'YYYY-MM-DD');
    this.$fromDate.val(strFrom);
  },

  _requestHistoryData: function (page) {
    if(this._checkInputValicatioin()) {
      if ( page !== this._currentPage ) {
        page = page || 1;
        var params = {
          fromDt: this.$fromDate.val().replace(/-/g, ''),
          toDt: this.$toDate.val().replace(/-/g, ''),
          page: page,
          size: this.LIST_SIZE
        };

        var API = this._pointType === Tw.POINT_TYPE.RAINBOW ? Tw.API_CMD.BFF_05_0100 : Tw.API_CMD.BFF_05_0122;
        this._apiService.request(API, params)
          .done($.proxy(this._onHistoryDataReceived, this, page))
          .fail(function () {
          });
      }
    }
  },

  _checkInputValicatioin: function(){
    var sdate = this.$fromDate.val();
    var edate = this.$toDate.val();

    // 시작일이 유효한 일자가 아닐경우
    if(_.isEmpty(sdate)){
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_INFO_A03, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._invalidDate, this, this.$fromDate));
      return false;
    }
    // 죵료일이 유효한 일자가 아닐경우
    if(_.isEmpty(edate)){
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_INFO_A04, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._invalidDate, this, this.$toDate));
      return false;
    }
    // 시작일이 종료일보다 클 경우
    var diff = this._dateHelper.getDiffByUnit(sdate, edate, 'days');
    if ( diff > 0 ) {
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_INFO_A01, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._invalidDate, this, this.$fromDate));
      return false;
    }
    return true;
  },

  _invalidDate : function ($selector) {
    this._popupService.close();
    // 포커스 이동
    setTimeout(function(){
      $selector.trigger('click');
    },500);
  },


  _onHistoryDataReceived: function (page, resp) {
    if ( this.$detailSearch.css('display') !== 'none' ) {
      this.$btPeriod.click();
    }

    this.$btPeriod.text((this.$fromDate.val() + ' ~ ' + this.$toDate.val()).replace(/-/g, '.'));
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if(this._pointType === Tw.POINT_TYPE.RAINBOW) {
        this.$usedPoint.text(this._formatHelper.addComma(resp.result.usdPoint));
        this.$earnPoint.text(this._formatHelper.addComma(resp.result.erndPoint));
      }

      if ( resp.result.history.length < 1 ) {
        this.$listWrapper.empty();
        this.$sectionNoItem.show();
      } else {
        this._currentPage = parseInt(page, 10);
        this._totalPage = Math.ceil(resp.result.totRecCnt / this.LIST_SIZE);
        this._parseData(resp.result);
        this._renderList(this._currentPage, resp.result.history);
      }
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },

  _parseData: function (data) {
    var self = this;
    _.each(data.history, function (item) {
      item.opDt = self._dateHelper.getShortDateWithFormat(item.opDt, 'YYYY.MM.DD');
      item.point = self._formatHelper.addComma(item.point);
      switch ( item.opClCd ) {
        case 'E':
          item.opClDesc = Tw.NO_CONTRACT_TYPE.SAVE;
          break;
        case 'U':
          item.opClDesc = Tw.NO_CONTRACT_TYPE.USE;
          break;
        case 'X':
          item.opClDesc = Tw.NO_CONTRACT_TYPE.EXTINCTION;
          break;
      }
    });
  },

  _renderList: function (page, items) {
    this.$sectionNoItem.hide();
    this.$listWrapper.empty();
    this._pageWidget.renderList(page, this._totalPage, items, this.$listWrapper);
  },

  _onClickPrev: function (e) {
    e.preventDefault();
    window.location.hash = this._currentPage - 1;

  },
  _onClickNext: function (e) {
    e.preventDefault();
    window.location.hash = this._currentPage + 1;
  },

  _openExpiringPointPopup: function (e) {
    e.preventDefault();
    this._apiService.request(Tw.API_CMD.BFF_05_0132, {})
      .done($.proxy(function (resp) {

        this._exprdPoint = this._formatHelper.addComma(resp.result.exprdPoint);
        this._popupService.open({
          hbs: 'MY_04_04_01_L02',
          data: {
            exprdPoint: this._exprdPoint,
            currentMonth: this._dateHelper.getCurrentDateTime('MM'),
            currentYear: this._dateHelper.getCurrentDateTime('YYYY')
          }
        });

      }, this))
      .fail(function () {
      });
  }
};