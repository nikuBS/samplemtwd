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
  this.getMonthlyLimitAPI = Tw.API_CMD.BFF_07_0073;

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.MyTBillHistoryContents.prototype = {
  _init: function () {
    this._getTabHash();

    this.isMonthlySet = false;

    this.baseURL = '/myt/bill/history/contents/';

    // 1년 전으로 설정
    // this.fromYYYYMM = this._dateHelper.getShortDateWithFormatAddByUnit(new Date(), -12, 'months', 'YYYYMM');
    // this.currentYYYYMM = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMM');

    // 7월로 설정
    // this.fromYYYYMM = this._dateHelper.getShortDateWithFormatAddByUnit(new Date(), -1, 'months', 'YYYYMM');
    this.currentYYYYMM = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMM');

    // todate : currentDay
    var fromDate = (this.fromYYYYMM || this.currentYYYYMM) + '01';
    var toDate = this.currentYYYYMM + this._dateHelper.getEndOfMonth(this.currentYYYYMM, 'DD', 'YYYYMM');

    this.apiOption = {
      fromdate: fromDate,
      todate: toDate,
      monthGubun: 99
    };

    this.common._setTab(this._tabChangeCallback, this, this.hashList, this.$tabTriggerWrapper);
    this.getLimit = new Tw.MyTBillHistoryCommon.GetLimit();

    this.search = new Tw.MyTBillHistoryCommon.Search(this.$searchElement, {
          defaultMonth: {
            title: Tw.POPUP_TITLE.PERIOD_SELECT,
            separator: 'search-pay-default-month',
            data: this._getChoiceDataMonth(7).map(function(o, i) {
              return { text : o, key : i };
            })
          }
        },
        $.proxy(this._goSearch, this));

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
    this.$monthlyModeSwitcher = this.$container.find('#tab2-tab .btn-switch input');

    this.$searchElementCustom = {
      $usageTotalDesc: this.$container.find('#fe-usage-total-desc'),
      $usageTotalCount: this.$container.find('#fe-usage-total-desc span'),
      $usageTotalAmount: this.$container.find('#fe-usage-total-desc em')
    };

    this.$searchElement = {
      $termOpener: this.$container.find('.list-top .select-left button'),
      $monthlyCustomTermSelector: this.$container.find('.widget-box.radio .select-list li input'),
      $monthSelector: this.$container.find('.history-inquiry > .bt-dropdown'),
      $customTermSelector: this.$container.find('.history-inquiry .tube-list input'),
      $customTermStartSelector: this.$container.find('.history-inquiry .date-selcet button').eq(0),
      $customTermEndSelector: this.$container.find('.history-inquiry .date-selcet button').eq(1),
      $searchBtn: this.$container.find('.history-inquiry .contents-btn button')
    };

    this.$template = {
      $listWrapper: this.$container.find('#list-wrapper'),
      $listDefault: this.$container.find('#list-default'),
      $listEmpty: this.$container.find('#list-empty'),
      $domUsageListWrapper: this.$container.find('#tab1-tab .history-list'),

      $monthlyAverageTotal: this.$container.find('#tab2-tab .avarage-fee span'),
      $monthlyWrapper: this.$container.find('#tab2-tab .history-list'),
      $monthlyByTable: this.$container.find('#list-monthly-table'),
      $monthlyByGraph: this.$container.find('#list-monthly-graph')
    };
  },

  _bindDOM: function () {
    this.$usageLimitCheckTrigger.on('click', $.proxy(this._checkUsageLimitCurrentMonth, this));

    this.$limitChangeBtn.on('click', $.proxy(this.common._goLoad, this.common, Tw.URL_PATH.MYT_PAY_MICRO_LIMIT_CHANGE));
    this.$limitDetailBtn.on('click', $.proxy(this.common._goLoad, this.common, Tw.URL_PATH.MYT_PAY_MICRO_LIMIT_DETAIL));

    this.$contentsHelpCenterTrigger.on('click', $.proxy(this._openHelpCenterLayer, this));
    this.$monthlyModeSwitcher.on('change', $.proxy(this._changeCurrentMonthly, this));
    // MYT_PAY_CONTENTS_LIMIT_CHANGE
    // MYT_PAY_CONTENTS_LIMIT_DETAIL
  },

  _checkUsageLimitCurrentMonth: function () {
    this.getLimit._init(this.getMonthlyLimitAPI, $.proxy(this._success_checkUsage, this));
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
    switch (this.common.currentTab) {
      case this.hashList[0] :

        break;
      case this.hashList[1] :
        break;
      default :
        break;
    }
  },

  _getData: function () {
    // console.log('_getData', this.apiName, this.apiOption);
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption)
          .done($.proxy(this._setData, this))
          .error($.proxy(this._apiError, this));
    } else {
      // TODO : history replace
    }
  },

  _setData: function (res) {
    // console.log('[setData] ', res);
    if (res.code === Tw.API_CODE.CODE_00) {

      this.contentsList = res.result.useConAmtDetailList ? res.result.useConAmtDetailList.reverse() : [];
      if (!this.isMonthlySet) {
        this.monthlyList = res.result.useConAmtMonthList ? res.result.useConAmtMonthList.reverse() : [];
      }

      // this.contentsList.push({
      //   'payDate': '2018.04.23',
      //   'payFlag': '구글플레이콘텐츠*',
      //   'useServiceNm': '구**레**텐*',
      //   'useServiceCompany': '구글페이 080-234-0051',
      //   'useCharge': '2,200',
      //   'deductionCharge': '2,200'
      // });

      this._updateUseData();

    } else {
      this.common._apiError(res);
    }
  },

  _updateUseData: function () {

    if (!_.isEmpty(this.contentsList)) {
      var splitedCompanyName;

      this.contentsList.map($.proxy(function (o, i) {
        splitedCompanyName = o.useServiceCompany.split(' ');

        o.listId = i;
        o.useChargeFormed = parseInt(Tw.FormatHelper.removeComma(o.useCharge), 10);
        o.deductionChargeFormed = parseInt(Tw.FormatHelper.removeComma(o.deductionCharge), 10);
        // o.paymentTotal = Tw.FormatHelper.addComma((o.useChargeFormed - o.deductionChargeFormed).toString())
        o.paymentTotal = o.useCharge;

        o.useServiceCompanyTel = _.last(splitedCompanyName);
        splitedCompanyName.splice(splitedCompanyName.length - 1);
        o.useServiceCompany = splitedCompanyName.join(' ');

        o.linkHREF = this.baseURL + 'detail?type=2' +
            '&payDate=' + o.payDate +
            '&payFlag=' + o.payFlag +
            '&useServiceCompany=' + o.useServiceCompany +
            '&cpTel=' + o.useServiceCompanyTel +
            '&serviceName=' + o.useServiceNm +
            '&paymentTotal=' + o.paymentTotal +
            '&deductionCharge=' + o.deductionCharge +
            '&useCharge=' + o.useCharge;
      }, this));
    }

    if (!_.isEmpty(this.monthlyList) && !this.isMonthlySet) {
      // 'invDt': '201802',
      //  'totUsed': '0.0',월별이용금액
      //  'totDeduc': '0.0',      공제액
      //  'totInvamt': '0.0'이용금액 - 공제액
      var monthlyHighest = 0;
      this.monthlyAverage = 0;
      this.monthlyHighestIndex = null;
      this.monthlyList.map($.proxy(function (o, i) {
        o.listId = i;

        o.formedInvDt = this._dateHelper.getShortDateWithFormat(o.invDt, 'M', 'YYYYMM');
        o.totalUse = parseInt(Tw.FormatHelper.removeComma(o.totUsed), 10);
        // o.totalUse = parseInt(Tw.FormatHelper.removeComma(o.totInvamt), 10);
        o.formedTotalUse = Tw.FormatHelper.addComma(o.totalUse.toString());

        if (monthlyHighest < o.totalUse) {
          monthlyHighest = o.totalUse;
          this.monthlyHighestIndex = i;
        }
        o.isHightest = false;

        this.monthlyAverage += o.totalUse;
      }, this));
      this.monthlyList.map($.proxy(function (o, i) {
        if (this.monthlyHighestIndex !== null) {
          if (this.monthlyHighestIndex === i) {
            o.isHightest = true;
          }
        }
        o.percentVal = monthlyHighest ? Math.round(o.totalUse * 100 / monthlyHighest) : 50;
      }, this));
      this.monthlyAverage = Tw.FormatHelper.addComma(Math.round(this.monthlyAverage / 6).toString());
    }

    this._updateUsageTotalUI();
    this._updateListUI();
    if (!this.isMonthlySet) {
      this._updateMonthlyUI();
    }
  },

  _updateUsageTotalUI: function () {
    if (!_.isEmpty(this.contentsList)) {
      this.$searchElementCustom.$usageTotalDesc.removeClass('none');
      this.$searchElementCustom.$usageTotalCount.html(this.contentsList.length);
      this.$searchElementCustom.$usageTotalAmount.html(
          Tw.FormatHelper.addComma(this._getTotalAmountUsageList().toString())
      );
    } else {
      this.$searchElementCustom.$usageTotalDesc.addClass('none');
      this.$searchElementCustom.$usageTotalCount.html('');
      this.$searchElementCustom.$usageTotalAmount.html('');
    }
  },

  _getChoiceDataMonth: function (term) {
    var choiceData = [];
    for (var k = 0; k <= term; k++) {
      choiceData.push(this._dateHelper.getShortDateWithFormatAddByUnit(this.currentYYYYMM, k * -1, 'months', Tw.DATE_FORMAT.YYYYDD_TYPE_1, 'YYYYMM'));
    }
    return choiceData;
  },

  _goSearch: function (startYYYYMMDD, endYYYYMMDD, paymentType) {

    // console.log(this, this.search, startYYYYMMDD, endYYYYMMDD, paymentType, this.fromYYYYMM, this.currentYYYYMM);
    this.apiOption.fromdate = startYYYYMMDD;
    this.apiOption.todate = endYYYYMMDD;

    this._getData();
  },

  _updateListUI: function () {
    this._setListUI(this.contentsList, this.$template.$domUsageListWrapper,
        {
          list: this.$template.$listDefault,
          wrapper: this.$template.$listWrapper,
          empty: this.$template.$listEmpty
        }, null,
        {
          list: 'listElement',
          restButton: 'restCount'
        },
        10, '.bt-more', '.list-inner', this._updateListCallback);
  },

  _updateListCallback: function () {

  },

  _setListUI: function (data, listWrapper, objTemplate, objHelper, objKey,
                        perPage, moreSelector, listWrapperSelector, callback) {
    var list = new Tw.MyTBillHistoryCommon.ListWithTemplate();
    list._init({result: data}, listWrapper, {
      list: objTemplate.list,
      wrapper: objTemplate.wrapper,
      empty: objTemplate.empty
    }, objHelper, {
      list: objKey.list,
      restButton: objKey.restButton
    }, perPage, moreSelector, listWrapperSelector, $.proxy(callback, this));
  },

  _appendListCallBack: function () {
    // if (this.result.length) {
    //   this.$listWrapper.parent().addClass('nogaps-btm');
    // }
    // this._addListButtonHandler();
  },

  _addListButtonHandler: function () {
    // this.$container.find('.detail-btn').off().on('click', '.fe-btn', $.proxy(this._listButtonHandler, this));
  },

  _listButtonHandler: function () {
    // this.currentIndex = $(e.target).data('list-id');
    // var selectedList = this.result[this.currentIndex];
    // this._apiService.request(this.api_detailName, selectedList.detailOption).done(
    //     $.proxy(this.detailSuccess, this, selectedList)).error($.proxy(this._apiError, this));
  },

  _updateMonthlyUI: function () {
    this.$template.$monthlyAverageTotal.html(this.monthlyAverage);

    // console.log(this.monthlyList);
    var monthlyByTableTemplate = Handlebars.compile(this.$template.$monthlyByTable.html());
    var monthlyByGraphTemplate = Handlebars.compile(this.$template.$monthlyByGraph.html());
    var monthlyByTable = monthlyByTableTemplate({listElement: this.monthlyList});
    var monthlyByGraph = monthlyByGraphTemplate({listElement: this.monthlyList});

    this.$template.$monthlyWrapper.append(monthlyByTable);
    this.$template.$monthlyWrapper.append(monthlyByGraph);

    this.$template.$monthlyByTableWrapper = this.$template.$monthlyWrapper.find('#fe-pay-history-by-table');
    this.$template.$monthlyByGraphWrapper = this.$template.$monthlyWrapper.find('#fe-pay-history-by-graph');
  },

  _openHelpCenterLayer: function () {
    this._popupService.open({
      hbs: this.helpListHbsName
    }, $.proxy(function ($o) {
      $o.find('.footer-wrap .bt-blue1 button').on('click', this._popupService.close);
      $o.find('.detail-list li:last-child a').attr('href', Tw.URL_PATH.CONTETNS_YOUTUBE_HELP_URL);
    }, this));

  },

  _getTotalAmountUsageList: function () {
    var amount = 0;
    this.contentsList.map(function (o) {
      amount = amount + parseInt(Tw.FormatHelper.removeComma(o.useCharge), 10);
    });
    return amount;
  },

  _changeCurrentMonthly: function (e) {
    switch (this.$monthlyModeSwitcher.index($(e.target))) {
      case 0:
        this.$template.$monthlyByTableWrapper.removeClass('none');
        this.$template.$monthlyByGraphWrapper.addClass('none');
        break;
      case 1:
        this.$template.$monthlyByTableWrapper.addClass('none');
        this.$template.$monthlyByGraphWrapper.removeClass('none');
        break;
      default:
        break;
    }
  },


  _setListMonthlyByTable: function () {

  },

  _setListMonthlyByGraph: function () {

  }

};
