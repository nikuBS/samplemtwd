Tw.MytGiftHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this.lineList = {};
  this.currentTabMethod = 'present';

  this._cachedElement();
  this._bindEvent();
  this._getLineInfo();
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

    this.$lineChanger.on('click', $.proxy(this.addPopupProcessHandler, this));
    this.$termChanger.on('click', $.proxy(this.addPopupProcessHandler, this));
    this.$tabChanger.off('click').on('click', $.proxy(this.changeTab, this));
    // this.$searchOptionTrigger.on('click', $.proxy(this.changeSearchOption, this));
    // this.$tabNaviTrigger.on('click', $.proxy(this.changeTab, this));
  },

  _getLineInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0003, {svcCtg: 'M'}).done($.proxy(this._setLineList, this));
  },

  _setLineList: function (lines) {
    this.lineList.lines = lines.result;
    this.lineList.current = lines.result[0];
    this.getPresentList();
  },

  getPresentList: function () {
    if(this.lineList.current) {
    }
  },

  getPesterList: function () {
    if(this.lineList.current) {

    }
  },

  addPopupProcessHandler: function () {
    this.$document.on('click', '.popup .popup-blind', $.proxy(this.hidePopup, this));
    console.log(this.lineList.current);
    this.addClosePopupHandler();
  },


  addClosePopupHandler: function() {
    this.$document.off('click').on('click', '.popup-closeBtn', $.proxy(this.cancelUpdateCurrentLine, this));
    this.$document.off('click').on('click', '.select-submit', $.proxy(this.updateCurrentLine, this));
  },

  updateCurrentLine: function(e) {

  },

  cancelUpdateCurrentLine: function(e) {

  },

  hidePopup: function () {
    skt_landing.action.popup.close();
  },

  changeSearchOption: function () {
  },

  changeTab: function (e) {
    e.preventDefault();
    if(this.$tabChanger.index(e.target) === 0) {

      if(this.currentTab === 0) return false;
      this.currentTab = 0;
      console.log("선물 내역보기");

    } else {

      if(this.currentTab === 1) return false;
      this.currentTab = 1;
      console.log("조르기 내역보기");

    };
  },

  $showLoading: function () {
    this._ui.$loading.show();
  },

  $hideLoading: function () {
    this._ui.$loading.hide();
  }

};
