/**
 * FileName: myt.bill.history.contents.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.26
 */

Tw.MyTBillHistoryContents = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.MyTBillHistoryCommon(rootEl);

  this.hashList = [];
  this.helpListHbsName = 'MY_02_03_05_L03';
  this.apiName = Tw.API_CMD.BFF_05_0064;
  this.getMonthlyLimitAPI = Tw.API_CMD.BFF_05_0080;

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.MyTBillHistoryContents.prototype = {
  _init: function () {
    this._getTabHash();

    this.usageRequestTitle = 'Request';
    this.usageRequestCounter = 0;

    this.baseURL = '/myt/bill/history/contents/';

    // 7월로 설정
    // this.fromYYYYMM = this._dateHelper.getShortDateWithFormatAddByUnit(new Date(), -12, 'months', 'YYYYMM');
    // this.currentYYYYMM = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMM');
    this.currentYYYYMM = this._dateHelper.getShortDateWithFormatAddByUnit(new Date(), -1, 'months', 'YYYYMM');

    this.apiOption = {
      'fromdate': (this.fromYYYYMM || this.currentYYYYMM) + '01',
      'todate': this.currentYYYYMM + this._dateHelper.getEndOfMonth(this.currentYYYYMM, 'DD', 'YYYYMM'),
      'monthGubun': 'M'
    };

    this.common._setTab(this._tabChangeCallback, this, this.hashList, this.$tabTriggerWrapper);
    this._updateEnvironment();
    this._getData();
  },

  _cachedElement: function () {
    this.$tabTriggerWrapper = this.$container.find('.tab-linker li');
    this.$usageLimitCheckTrigger = this.$container.find('.usage-top .bt-link-tx');
    this.$contentsHelpCenterTrigger = this.$container.find('.bt-contents-guide button');

    this.$detailCurrentUsageLimitWrapper = this.$container.find('#fe-current-month-usage');
    this.$detailMicroPay = this.$container.find('#fe-micropay-usage');
    this.$detailMicroPayRest = this.$container.find('#fe-micropay-rest-limit');
    this.$limitChangeBtn = this.$container.find('#fe-current-month-usage .contents-btn li button').eq(0);
    this.$limitDetailBtn = this.$container.find('#fe-current-month-usage .contents-btn li button').eq(1);

    this.$searchElement = {
      $usageTotalDesc: this.$container.find('#fe-usage-total-desc'),
      $usageTotalCount: this.$container.find('#fe-usage-total-desc span'),
      $usageTotalAmount: this.$container.find('#fe-usage-total-desc em'),
      $blindTotalDesc: this.$container.find('#fe-blind-total-desc'),
      $blindTotalCount: this.$container.find('#fe-blind-total-desc span'),
      $termOpener: this.$container.find('.list-top .select-left button'),
      $paymentTypeSelector: this.$container.find('.list-top .select-right button'),
      $monthlyCustomTermSelector: this.$container.find('.widget-box.radio .select-list li input'),
      $monthSelector: this.$container.find('.history-inquiry > .bt-dropdown'),
      $customTermSelector: this.$container.find('.history-inquiry .tube-list'),
      $customTermStartSelector: this.$container.find('.history-inquiry .date-selcet button').eq(0),
      $customTermEndSelector: this.$container.find('.history-inquiry .date-selcet button').eq(1),
      $searchBtn: this.$container.find('.history-inquiry .contents-btn button')
    };

    this.$template = {
      $listWrapper: this.$container.find('#list-wrapper'),
      $listDefault: this.$container.find('#list-default'),
      $listBlind: this.$container.find('#list-blind'),
      $listEmpty: this.$container.find('#list-empty'),
      $listBlindEmpty: this.$container.find('#list-blind-empty'),
      $detailUsage: this.$container.find('#detail-usage'),
      $detailBlind: this.$container.find('#detail-blind'),
      $domUsageListWrapper: this.$container.find('#tab1-tab .history-list'),
      $domBlindListWrapper: this.$container.find('#tab2-tab .history-list')
    };
  },

  _bindDOM: function () {
    this.$usageLimitCheckTrigger.on('click', $.proxy(this._checkUsageLimitCurrentMonth, this));

    this.$limitChangeBtn.on('click', $.proxy(this.common._goLoad, this.common, Tw.URL_PATH.MYT_PAY_CONTENTS_LIMIT_CHANGE));
    this.$limitDetailBtn.on('click', $.proxy(this.common._goLoad, this.common, Tw.URL_PATH.MYT_PAY_CONTENTS_LIMIT_DETAIL));

    this.$contentsHelpCenterTrigger.on('click', $.proxy(this._openHelpCenterLayer, this));
    // MYT_PAY_CONTENTS_LIMIT_CHANGE
    // MYT_PAY_CONTENTS_LIMIT_DETAIL
  },

  _checkUsageLimitCurrentMonth: function() {
    this._apiService.request(this.getMonthlyLimitAPI, {
      gubun: this.usageRequestTitle,
      requestCnt: this.usageRequestCounter
    })
        .done($.proxy(this._pre_checkUsageLimitCurrentMonth, this))
        .error($.proxy(this._apiError, this));
  },

  _pre_checkUsageLimitCurrentMonth: function (res) {
    if (this.usageRequestCounter === 0) {
      this.usageRequestTitle = 'Done';
      this.usageRequestCounter++;
      this._checkUsageLimitCurrentMonth();
    } else if (this.usageRequestCounter === 1) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this._success_checkUsage(res);
      } else {
        this.usageRequestTitle = 'Retry';
        this.usageRequestCounter++;
        this._checkUsageLimitCurrentMonth();
      }
    } else {
      this.common._apiError(res);
    }
  },

  _success_checkUsage: function (res) {
    this.$usageLimitCheckTrigger.hide();
    this.$detailCurrentUsageLimitWrapper.removeClass('none');
    this.$detailMicroPay.html(Tw.FormatHelper.addComma(res.result.tmthUseAmt));
    this.$detailMicroPayRest.html(Tw.FormatHelper.addComma(res.result.remainUseLimit));
  },

  _getTabHash: function () {
    this.$tabTriggerWrapper.each($.proxy(function (i, o) {
      this.hashList.push($(o).find('a').attr('href').split('#')[1]);
    }, this));
  },

  _tabChangeCallback: function () {
    // this._updateEnvironment();
  },

  _updateEnvironment: function () {
    switch(this.common.currentTab) {
      case this.hashList[0] :

        break;
      case this.hashList[1] :
        break;
      default :
        break;
    }
  },

  _getData: function() {
    console.log('_getData', this.apiName, this.apiOption);
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption)
          .done($.proxy(this._setData, this))
          .error($.proxy(this._apiError, this));
    } else {
      // TODO : history replace
    }
  },

  _setData: function(res) {
    if(res.code === Tw.API_CODE.CODE_00) {

      console.log(res);

    } else {
      this.common._apiError(res);
    }
  },

  _setListUI: function() {
    var list = new this.common.listWithTemplate();
    list._init({result: this.result}, this.$listWrapper, {
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
    }, 10, '.contents-info-list .bt-more', '', $.proxy(this._appendListCallBack, this));
  },

  _appendListCallBack: function () {
    if (this.result.length) {
      this.$listWrapper.parent().addClass('nogaps-btm');
    }
    this._addListButtonHandler();
  },

  _addListButtonHandler: function () {
    this.$container.find('.detail-btn').off().on('click', '.fe-btn', $.proxy(this._listButtonHandler, this));
  },

  _listButtonHandler: function (e) {
    this.currentIndex = $(e.target).data('list-id');
    var selectedList = this.result[this.currentIndex];
    this._apiService.request(this.api_detailName, selectedList.detailOption).done(
        $.proxy(this.detailSuccess, this, selectedList)).error($.proxy(this._apiError, this));
  },

  _openHelpCenterLayer: function () {
    this._popupService.open({
      hbs: this.helpListHbsName
    }, $.proxy(function($o) {
      $o.find('.footer-wrap .bt-blue1 button').on('click', this._popupService.close);
      $o.find('.detail-list li:last-child a').attr('href', Tw.URL_PATH.CONTETNS_YOUTUBE_HELP_URL);
    }, this));

  },

  
  _setListMonthlyByTable: function() {
    
  },
  
  _setListMonthlyByGraph: function () {

  }

};
