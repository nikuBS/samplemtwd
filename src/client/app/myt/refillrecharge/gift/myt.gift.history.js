Tw.MytGiftHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this.lineList = {};
  this.currentTabMethod = 'present';    // pester : 조르기
  this.currentPopupMethod = null;
  this.searchCondition = {
    type: 'total',
    isSent: false,
    selectedTermIndex: 2,
    terms: $('#dateSpectrum').text().split(',')
  };

  this._cachedElement();
  this._bindEvent();
  this._initLineInfo();
};

Tw.MytGiftHistory.prototype = {
  _cachedElement: function () {
    this.$document = $(document);
    this.$window = $(window);
    this.$lineChanger = $('.bt-dropdown.big');
    this.$termChanger = $('.bt-dropdown.small');
    this.$tabChanger = $('.tab-linker a');


    // this.$lineTrigger = $('#sort_type');
    // this.$loading = $('.loader');
    // this.$tabNaviTrigger = $('.tab-navi a');
    // this.$searchOptionTrigger = $('.searchOption');
  },

  _bindEvent: function () {
    this.$lineChanger.on('click', $.proxy(this.opnePopupProcess, this));
    this.$termChanger.on('click', $.proxy(this.opnePopupProcess, this));
    this.$tabChanger.off('click').on('click', $.proxy(this.changeTab, this));
    // this.$searchOptionTrigger.on('click', $.proxy(this.changeSearchOption, this));
    // this.$tabNaviTrigger.on('click', $.proxy(this.changeTab, this));
  },

  _initLineInfo: function () {
    this._getLineInfo(this._setLineList);
  },

  _getLineInfo: function (callback) {
    this._apiService.request(Tw.API_CMD.BFF_03_0003, {svcCtg: 'M'}).done($.proxy(callback, this));
  },

  _setLineList: function (lines) {
    this.lineList.lines = lines.result;
    this.lineList.current = lines.result[0];
    this.lineList.selectedIndex = $(this.lineList.lines).index(this.lineList.current);
    this.getPresentList();
  },

  getPresentList: function () {
    if (this.lineList.current) {
      this._apiService.request(Tw.API_CMD.BFF_06_0018, {
        fromDt: this.searchCondition.terms[0],
        toDt: this.searchCondition.terms[this.searchCondition.selectedTermIndex],
        giftType: '0'
      }).done($.proxy(function (res) {
        console.log('request present list :', res.result);
        var dummy = [
          {"opDtm": "20170701", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170621", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170601", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170520", "dataQty": "1024", "custName": "유*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170415", "dataQty": "1024", "custName": "김*나", "svcNum": "01062**50**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170701", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170621", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170601", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170520", "dataQty": "1024", "custName": "유*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170415", "dataQty": "1024", "custName": "김*나", "svcNum": "01062**50**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170701", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170621", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170601", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170520", "dataQty": "1024", "custName": "유*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170415", "dataQty": "1024", "custName": "김*나", "svcNum": "01062**50**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170701", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170621", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170601", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170520", "dataQty": "1024", "custName": "유*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170415", "dataQty": "1024", "custName": "김*나", "svcNum": "01062**50**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170701", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170621", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170601", "dataQty": "1024", "custName": "김*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170520", "dataQty": "1024", "custName": "유*진", "svcNum": "01040**08**", "giftType": "1", "regularGiftType": "G1"},
          {"opDtm": "20170415", "dataQty": "1024", "custName": "김*나", "svcNum": "01062**50**", "giftType": "1", "regularGiftType": "G1"}
          ];
      }, this));
    }
  },

  getPesterList: function () {
    if (this.lineList.current) {

    }
  },

  updatePopupSelectedLine: function () {

  },
  updatePopupSelectedSearch: function () {

  },

  opnePopupProcess: function (e) {
    this.currentPopupMethod = $(e.target);
    var popupTriggerId = this.currentPopupMethod.attr('id');

    if (popupTriggerId === 'line-set') {
      var tempTimer = window.setTimeout((function () {
        this.popupLineList = $('.popup .select-list label');
        this.setPopupCurrentLine();
        this.popupLineList.on('click', $.proxy(this.updateSelectedLine, this));
        window.clearTimeout(tempTimer);
      }).bind(this), 50);
      this.updatePopupSelectedLine();
    } else if (popupTriggerId === 'term-set') {
      this.updatePopupSelectedSearch();
    }

    this.$document.off('click').one('click', '.popup .popup-blind', $.proxy(this.hidePopup, this));


    this.addClosePopupHandler();
  },

  updateSelectedLine: function (e) {
    this.lineList.tempSelectedLineIndex = this.popupLineList.index(e.target.parentNode);
  },

  setPopupCurrentLine: function () {
    $(this.popupLineList[this.lineList.selectedIndex]).addClass('focus checked');
  },

  addClosePopupHandler: function () {
    this.$document.one('click', '.popup-closeBtn', $.proxy(this.cancelUpdateCurrentLine, this));
    this.$document.one('click', '.select-submit', $.proxy(this.updateCurrentLine, this));
  },

  updateCurrentLine: function () {
    this.lineList.selectedIndex = this.lineList.tempSelectedLineIndex || this.lineList.selectedIndex;
  },

  cancelUpdateCurrentLine: function () {
    console.log('cancel');
  },

  hidePopup: function () {
    skt_landing.action.popup.close();
  },

  changeSearchOption: function () {
  },

  changeTab: function (e) {
    e.preventDefault();
    if (this.$tabChanger.index(e.target) === 0) {

      if (this.currentTab === 0) return false;
      this.currentTab = 0;
      console.log("선물 내역보기");

    } else {

      if (this.currentTab === 1) return false;
      this.currentTab = 1;
      console.log("조르기 내역보기");

    }
    ;
  },

  $showLoading: function () {
    this._ui.$loading.show();
  },

  $hideLoading: function () {
    this._ui.$loading.hide();
  }

};
