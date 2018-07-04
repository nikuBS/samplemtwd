/**
 * FileName: recharge.gift.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.06.22
 */

Tw.RechargeGift = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
};

Tw.RechargeGift.prototype = {
  _cachedElement: function () {
    this.$btn_change = this.$container.find('#line-set');
    this.$wrap_gift_count = this.$container.find('#wrap_gift_count');
    this.$wrap_request_count = this.$container.find('#wrap_request_count');
    this.tpl_gift_count = Handlebars.compile(this.$container.find('#tpl_gift_count').text());
    this.tpl_remain_data = Handlebars.compile(this.$container.find('#tpl_remain_data').text());
    this.tpl_request_count = Handlebars.compile(this.$container.find('#tpl_request_count').text());
  },

  _bindEvent: function () {
    this.$container.on('updateLineInfo', $.proxy(this.updateLineInfo, this));
    this.$container.on('click', '.my-data', $.proxy(this.showRemainData, this));
    this.$container.on('click', '.btn_process', $.proxy(this.goToProcess, this));
    this.$container.on('click', '.bt-link-tx', $.proxy(this.openPriceList, this));
    this.$container.on('click', '.tab-linker a', $.proxy(this.changeTabMenu, this));
    this.$container.on('click', '.popup-closeBtn', $.proxy(this.closePriceList, this));
  },

  changeTabMenu: function (e) {
    var elTab = $(e.currentTarget);
    var elWrapperTab = $('.tab-linker a');

    if ( elWrapperTab.index(elTab) == 0 ) {
      $('.notify.tab1').show();
      $('.notify.tab2').hide();
    }

    if ( elWrapperTab.index(elTab) == 1 ) {
      $('.notify.tab1').hide();
      $('.notify.tab2').show();
    }
  },

  updateLineInfo: function (e, params) {
    this.lineList = params.lineList;
    this.lineInfo = params.lineInfo;
    this.$btn_change.text(this.lineInfo.svcNum);

    this._apiService.request(Tw.API_CMD.BFF_06_0015, {})
      .done($.proxy(this.onSuccessProvider, this));

    this._apiService.request(Tw.API_CMD.BFF_06_0010, {
      svcMgmtNum: this.lineInfo.svcMgmtNum,
      requestType: 0,
      fromDt: Tw.DateHelper.getCurrentShortDate(),
      toDt: Tw.DateHelper.getCurrentShortDate()
    }).done($.proxy(this.onSuccessRequest, this));
  },

  onSuccessProvider: function (res) {
    var result = res.result;
    result.familyMemberYn = result.familyMemberYn == 'Y' ? true : false;
    result.goodFamilyMemberYn = result.goodFamilyMemberYn == 'Y' ? true : false;

    this.$wrap_gift_count.html(this.tpl_gift_count(result));
  },

  onSuccessRequest: function (res) {
    var maxRequestCount = 30;
    var requestCount = res.result;
    var remainCount = maxRequestCount - requestCount;

    this.$wrap_request_count.html(this.tpl_request_count({ remainCount: remainCount }));
  },

  showRemainData: function (e) {
    var $wrap_remain_data = $(e.currentTarget).closest('.gift-box-info-list');

    // this._apiService.request(Tw.API_CMD.BFF_06_0014, { reqCnt: 3 })
    //   .done(function (res) {
    //   }.bind(this));

    // TODO : fetch data && binding
    var response = {
      "code": "00",
      "msg": "success",
      "result": {
        "reqCnt": "1",
        "giftRequestAgainYn": "Y",
        "dataRemQty": "700"
      }
    }

    $wrap_remain_data.html(this.tpl_remain_data(response.result));
  },

  goToProcess: function (e) {
    var processType = $(e.currentTarget).data('type');

    if ( processType === 'members' ) {
      location.href = '/recharge/gift/process/members#step1';
    }

    if ( processType === 'family' ) {
      location.href = '/recharge/gift/process/family#step1';
    }

    if ( processType === 'request' ) {
      location.href = '/recharge/gift/process/request#step1';
    }
  },

  openPriceList: function () {
    this._popupService.openGiftProduct();

    $(document.body).css('height', 'auto');
    $(document.body).css('overflow-y', 'hidden');
    $(window).scrollTop(0);
  },

  closePriceList: function () {
    $(document.body).css('height', 'auto');
    $(document.body).css('overflow-y', 'auto');
  }
};
