/**
 * FileName: myt.benefit.military-point-history.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 28.
 */
Tw.MyTBenefitMilitaryPointHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._dateHelper = Tw.DateHelper;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;
  this._formatHelper = Tw.FormatHelper;

  this.LIST_SIZE = 20; //리스트 아이템 노출 최대수

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTBenefitMilitaryPointHistory.prototype = {
  _init: function () {
    this._items = null;
    this._currentPage = 0;
    this._pageWidget = new Tw.MytBenefitPointPage('fe-points-list');
    this._requestHistoryData();
  },

  _onHashChange: function (hash) {
    if ( hash.raw && this._items ) {
      // this._requestHistoryData(hash.raw);
      this._renderList(hash.raw);
    }
  },

  _cachedElement: function () {
    this.$listWrapper = this.$container.find('#fe-points-list-wrapper');
    this.$sectionNoItem = this.$container.find('.fe-no-point');
  },

  _bindEvent: function () {
    this.$listWrapper.on('click', 'a.prev:not(.disabled)', $.proxy(this._onClickPrev, this));
    this.$listWrapper.on('click', 'a.next:not(.disabled)', $.proxy(this._onClickNext, this));

  },

  _requestHistoryData: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0121, {})
      .done($.proxy(this._onHistoryDataReceived, this))
      .fail(function () {
      });
  },

  _onHistoryDataReceived: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.length < 1 ) {
        this.$listWrapper.empty();
        this.$sectionNoItem.show();
      } else {
        var hash = this._hashService.initHashNav($.proxy(this._onHashChange, this));
        this._currentPage = hash || 1;
        this._totalPage = Math.ceil(resp.result.length / this.LIST_SIZE);

        this._items = $.extend(true, [], resp.result);
        this._parseData(this._items);
        this._renderList(this._currentPage);
      }
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },

  _parseData: function (data) {
    var self = this;
    _.each(data, function (item) {
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

  _renderList: function (page) {
    this.$sectionNoItem.hide();
    this.$listWrapper.empty();
    var idx = (page - 1) * this.LIST_SIZE;
    var items = this._items.slice(idx, idx + this.LIST_SIZE);
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