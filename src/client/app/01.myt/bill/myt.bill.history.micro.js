/**
 * FileName: myt.bill.history.micro.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.26
 */

Tw.MyTBillHistoryMicro = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.MyTBillHistoryCommon(rootEl);

  this.hashList = [];

  this.apiName = Tw.API_CMD.BFF_05_0079;
  this.getBlindDataAPI = Tw.API_CMD.BFF_05_0093;
  this.getMonthlyLimitAPI = Tw.API_CMD.BFF_07_0073;
  this.updateUseMicroPayAPI = Tw.API_CMD.BFF_05_0083;
  this.getUsingPasswordAPI = Tw.API_CMD.BFF_05_0085;

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.MyTBillHistoryMicro.prototype = {
  _init: function () {
    this._getTabHash();
    this.paymentTypeArr = [];

    this.isMicroPayListEmpty = false;
    this.isBlindListEmpty = false;

    this.baseURL = '/myt/bill/history/micro/';

    // 1년 전으로 설정
    // this.fromYYYYMM = this._dateHelper.getShortDateWithFormatAddByUnit(new Date(), -12, 'months', 'YYYYMM');
    // this.currentYYYYMM = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMM');

    // 7월로 설정
    // this.fromYYYYMM = this._dateHelper.getShortDateWithFormatAddByUnit(new Date(), -1, 'months', 'YYYYMM');
    this.currentYYYYMM = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMM');

    // todate : currentDay
    var fromDate = (this.fromYYYYMM || this.currentYYYYMM) + '01';
    var toDate = this.currentYYYYMM + this._dateHelper.getEndOfMonth(this.currentYYYYMM, 'DD', 'YYYYMM');

    _.each(Tw.PAYMENT_TYPE, $.proxy(function (o, i) {
      o = (o === Tw.PAYMENT_TYPE.TOTAL) ? Tw.MSG_MYT.HISTORY_TXT_04 + ' ' + o : o;
      this.paymentTypeArr.push({text: o, key: i});
    }, this));

    // todate : currentDay

    this.apiOption = {
      fromdate: fromDate,
      todate: toDate
    };

    this.common._setTab(this._tabChangeCallback, this, this.hashList, this.$tabTriggerWrapper);
    this.getLimit = new Tw.MyTBillHistoryCommon.GetLimit();

    this.search = new Tw.MyTBillHistoryCommon.Search(this.$container, this.$searchElement, {
        defaultMonth: {
          title: Tw.POPUP_TITLE.PERIOD_SELECT,
          separator: 'search-pay-default-month',
          data: this._getChoiceDataMonth(12).map(function(o, i) {
            return { text : o, key : i };
          })
        },
        paymentType: {
          title: Tw.POPUP_TITLE.PAYMENT_TYPE_SELECT,
          separator: 'search-pay-type',
          data: this.paymentTypeArr,
          callback: $.proxy(this._selectedPayType, this)
        }
      },
      'days',
      365,
      $.proxy(this._goSearch, this));

    this._getData();
  },

  _cachedElement: function () {
    this.$tabTriggerWrapper = this.$container.find('.tab-linker li');
    this.$usageLimitCheckTrigger = this.$container.find('.usage-top .bt-link-tx');

    this.$detailCurrentUsageLimitWrapper = this.$container.find('#fe-current-month-usage');
    this.$detailMicroPay = this.$container.find('#fe-micropay-usage');
    this.$detailMicroPayRest = this.$container.find('#fe-micropay-rest-limit');
    this.$limitChangeBtn = this.$container.find('#fe-current-month-usage .contents-btn li button').eq(0);
    this.$limitDetailBtn = this.$container.find('#fe-current-month-usage .contents-btn li button').eq(1);
    this.$microPayUseSwitch = this.$container.find('.usage-list .btn-switch .switch-style');
    this.$microPayUseSwitchInput = this.$microPayUseSwitch.find('input');
    this.$microPayUseSwitchTitle = this.$microPayUseSwitch.parentsUntil('.txt').siblings('.state-txt');

    this.$payPasswordChkBtn = this.$container.find('.usage-list .fe-chk-password-btn');
    this.$payPasswordChkIndicator = this.$payPasswordChkBtn.find('.txt');

    this.$searchElementCustom = {
      $usageTotalDesc: this.$container.find('#fe-usage-total-desc'),
      $usageTotalCount: this.$container.find('#fe-usage-total-desc .num'),
      $usageTotalAmount: this.$container.find('#fe-usage-total-desc em'),
      $blindTotalDesc: this.$container.find('#fe-blind-total-desc'),
      $blindTotalCount: this.$container.find('#fe-blind-total-desc .num')
    };

    this.$searchElement = {
      $termOpener: this.$container.find('.list-top .select-left button'),
      $paymentTypeSelector: this.$container.find('.list-top .select-right button'),
      $monthlyCustomTermSelector: this.$container.find('.widget-box.radio .select-list li input'),
      $monthSelector: this.$container.find('.history-inquiry > .bt-dropdown'),
      $customTermSelector: this.$container.find('.history-inquiry .tube-list input'),
      $customTermSelectInput: this.$container.find('.history-inquiry .date-selcet input'),
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

    this.$contentWrapper = this.$container.find('.tab-contents > ul > li');
  },

  _bindDOM: function () {
    this.$usageLimitCheckTrigger.on('click', $.proxy(this._checkUsageLimitCurrentMonth, this));
    this.$limitChangeBtn.on('click', $.proxy(this.common._goLoad, this.common, Tw.URL_PATH.MYT_PAY_MICRO_LIMIT_CHANGE));
    this.$limitDetailBtn.on('click', $.proxy(this.common._goLoad, this.common, Tw.URL_PATH.MYT_PAY_MICRO_LIMIT_DETAIL));
    this.$microPayUseSwitchInput.on('click', $.proxy(this._changeMicroPayUse, this));
    this.$payPasswordChkBtn.on('click', $.proxy(this._movePayPasswordPage, this));

    // this.$searchElement.$paymentTypeSelector.on('click', $.proxy(this._selectPayType, this));
    // this.$searchElement.$monthSelector.on('click', $.proxy())

  },

  _getData: function () {
    if (this.getUsingPasswordAPI) {
      this._apiService.request(this.getUsingPasswordAPI, {})
          .done($.proxy(this._updatePasswordUseState, this))
          .error($.proxy(this.common._apiError, this.common));
    }

    this._updateListData();
  },

  _updateListData: function () {
    var dataUpdateMethod;

    if(!this.usedMicroPayList) {
      dataUpdateMethod = this._checkPreRender;
    } else {
      dataUpdateMethod = this._updateData;
    }

    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption)
          .done($.proxy(dataUpdateMethod, this))
          .error($.proxy(this.common._apiError, this.common));
    }
  },

  _initData: function (res) {
    this.useMicroPayUseFlag = res.rtnUseYn;
    this.isUseMicroPay = this._isUseMicroPay();
    this.isUseNextDaySMS = res.nextDaySMSYn === 'Y';
    this.isUsePayPassword = res.cpmsYn === 'Y';

    this.passRelateURL = (this.isUsePayPassword) ? Tw.URL_PATH.MYT_PAYPASS_SET : Tw.URL_PATH.MYT_PAYPASS_INFO;
    this.passRelateTxt = (this.isUsePayPassword) ? Tw.MSG_MYT.HISTORY_TXT_01 : Tw.MSG_MYT.HISTORY_TXT_02;
  },

  _filterHistory: function (res, blindRes) {
    // console.log('[_filterHistory]', res, blindRes);
    if (!_.isEmpty(res)) {
      res = res.reverse();
    }

    if (!!blindRes && !_.isEmpty(blindRes)) {
      this.blindHistoies = blindRes.reverse();
    }

    this.usageHistories = res ? _.filter(res, $.proxy(function (o) {
      return o.cpState.substr(0, 1) !== 'A';
    })) : [];
    this.blindHistoies = this.blindHistoies || [];
  },

  _setData: function (blindResponse) {
    var blindRes = blindResponse.result;

    if (!this.useMicroPayUseFlag) {
      this._initData(this.usedMicroPayList.result);
    }

    this._filterHistory(this.usedMicroPayList.result.histories, blindRes.cpHistories);

    if (_.isEmpty(this.usageHistories)) {
      this.isMicroPayListEmpty = true;
    }
    if (_.isEmpty(this.blindHistoies)) {
      this.isBlindListEmpty = true;
    }

    this._updateUsageListData();
    this._initBlindListData();

    this._setSubInfoUI();
    this._updateListUI();
    this._setBlindListUI();
  },

  _updateData: function (res) {
    this._filterHistory(res.result.histories);

    this.isMicroPayListEmpty = _.isEmpty(this.usageHistories);

    this._updateUsageListData();
    this._updateListUI();
    this._updateListSubInfo();
  },

  _updateUsageListData: function () {
    this.usageHistoriesTotalAmt = 0;
    if (!_.isEmpty(this.usageHistories)) {
      this.usageHistories.map($.proxy(function (o, i) {
        this.usageHistoriesTotalAmt += parseInt(o.sumPrice, 10);
        o.listId = i;
        o.payDate = this._dateHelper.getShortDateWithFormat(o.useDate, 'YYYY.MM.DD');
        o.sumPrice = Tw.FormatHelper.addComma(o.sumPrice);
        o.paymentType = this.common._getPaymentType(o.payMethod);

        o.linkHREF = this.baseURL + 'detail?type=0' +
            '&cpCode=' + o.cpCode +
            '&tySvc=' + o.tySvc +
            '&idpg=' + o.idpg +
            '&rtnUseYn=' + this.useMicroPayUseFlag +
            '&wapYn=' + o.wapYn +
            '&useDate=' + o.useDate +
            '&cpTel=' + o.cpTel +
            '&serviceName=' + o.serviceName +
            '&sumPrice=' + o.sumPrice +
            '&payMethod=' + o.payMethod +
            '&payMethodType=' + o.paymentType +
            '&cpName=' + o.cpName +
            '&cpState=' + o.cpState +
            '&pgName=' + o.pgName;
      }, this));
      this.usageHistoriesTotalAmt = Tw.FormatHelper.addComma(this.usageHistoriesTotalAmt.toString());
    }
  },

  _initBlindListData: function () {
    if (!_.isEmpty(this.blindHistoies)) {
      this.blindHistoies.map($.proxy(function (o, i) {
        this._getBlindState(o);

        o.listId = i;
        o.serviceName = o.cpName;
        o.requestDate = this._dateHelper.getShortDateWithFormat(o.useDate, 'YYYY.MM.DD');
        o.presentDate = this._dateHelper.getShortDateWithFormat(o.applyMonth, 'YYYY.MM.DD');

        o.linkHREF = this.baseURL + 'detail?type=1' +
            '&useDate=' + o.useDate +
            // '&cpTel=' + o.cpTel +
            //         '&rtnUseYn=' + this.useMicroPayUseFlag +
            //         '&wapYn=' + o.wapYn +
            //         '&payMethod=' + o.payMethod +
            //         '&payMethodType=' + o.paymentType +
            '&cpCode=' + o.cpCode +
            '&tySvc=' + o.tySvc +
            '&idpg=' + o.idpg +
            '&cpName=' + o.cpName +
            '&cpState=' + o.cpState +
            '&pgName=' + o.pgName;
      }, this));
    }
  },

  _getBlindState: function (obj) {
    var appDate = this._dateHelper.getShortDateWithFormat(obj.applyMonth, 'YYYYMM');
    var curDate = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMM');

    if (appDate < curDate) {
      // 차단중
      obj.cpState = Tw.MYT_HISTORY_CPSTATE.A0;
      obj.blindState = Tw.MYT_HISTORY_CPSTATE_KOR.A0;
    } else {
      // 다음달 차단 예정
      obj.cpState = Tw.MYT_HISTORY_CPSTATE.A1;
      obj.blindState = Tw.MYT_HISTORY_CPSTATE_KOR.A1;
    }
  },

  _isUseMicroPay: function () {
    switch (this.useMicroPayUseFlag) {
      case '0':
      case '2':
      case '6':
        return true;
      default:
        return false;
    }
  },

  _checkPreRender: function (res) {
    this.usedMicroPayList = this.usedMicroPayList || res;
    switch (res.code) {
      case Tw.API_CODE.CODE_00:
        if (!this.blindHistories) {
          this._apiService.request(this.getBlindDataAPI, {})
              .done($.proxy(this._setData, this))
              .error($.proxy(this.common._apiError, this.common));
        } else {
          this._setData();
        }
        break;
      default:
        return this.common._apiError(res);
    }
  },

  _setSubInfoUI: function () {
    this.$microPayUseSwitchInput.attr('checked', this.isUseMicroPay);
    this._changeMicroPayUse(this.$microPayUseSwitchInput);

    this.$payPasswordChkIndicator.html(this.passRelateTxt);
    this._updateListSubInfo();
  },

  _updateListSubInfo: function () {
    if (!this.isMicroPayListEmpty) {
      this.$searchElementCustom.$usageTotalCount.html(this.usageHistories.length);
      this.$searchElementCustom.$usageTotalAmount.html(this.usageHistoriesTotalAmt);
      this.$searchElementCustom.$usageTotalDesc.removeClass('none');
    } else {
      this.$searchElementCustom.$usageTotalDesc.addClass('none');
    }
    if (!this.isBlindListEmpty) {
      this.$searchElementCustom.$blindTotalCount.html(this.blindHistoies.length);
      this.$searchElementCustom.$blindTotalDesc.removeClass('none');
    } else {
      this.$searchElementCustom.$blindTotalDesc.addClass('none');
    }
  },

  _setBlindListUI: function () {
    if (_.isEmpty(this.blindHistoies)) {
      this.$template.$domBlindListWrapper.addClass('type2');
    }

    var blindList = new Tw.MyTBillHistoryCommon.ListWithTemplate(this.$container);
    blindList._init({result: this.blindHistoies}, this.$template.$domBlindListWrapper, {
      list: this.$template.$listBlind,
      wrapper: this.$template.$listWrapper,
      empty: this.$template.$listBlindEmpty
    }, {
      setIndex: function (option) {
        return option.fn(this);
      }
    }, {
      list: 'listElement',
      restButton: 'restCount'
    }, 10, '.bt-more', '.list-inner', $.proxy(this._appendListCallBack, this));
  },

  _updateListUI: function () {
    var usageList = new Tw.MyTBillHistoryCommon.ListWithTemplate(this.$container);
    usageList._init({result: this.usageHistories}, this.$template.$domUsageListWrapper, {
      list: this.$template.$listDefault,
      wrapper: this.$template.$listWrapper,
      empty: this.$template.$listEmpty
    }, {
      setIndex: function (option) {
        return option.fn(this);
      }
    }, {
      list: 'listElement',
      restButton: 'restCount'
    }, 10, '.bt-more', '.list-inner', $.proxy(this._appendListCallBack, this));
  },

  _goSearch: function (startYYYYMMDD, endYYYYMMDD) {

    // console.log(this, this.search, startYYYYMMDD, endYYYYMMDD, paymentType, this.fromYYYYMM, this.currentYYYYMM);
    this.apiOption.fromdate = startYYYYMMDD;
    this.apiOption.todate = endYYYYMMDD;

    this._getData();
  },

  _appendListCallBack: function () {
    // if (this.result.length) {
    //   this.$listWrapper.parent().addClass('nogaps-btm');
    // }
    this._addListButtonHandler();
  },

  _addListButtonHandler: function () {
    // this.$container.find('.detail-btn').off().on('click', '.fe-btn', $.proxy(this._listButtonHandler, this));
  },

  _listButtonHandler: function () {
    // this.currentIndex = $(e.target).data('list-id');
    // var selectedList = this.result[this.currentIndex];
    // this._apiService.request(this.api_detailName, selectedList.detailOption).done(
    //     $.proxy(this.detailSuccess, this, selectedList)).error($.proxy(this.common._apiError, this.common));
  },

  _movePayPasswordPage: function () {
    // if(!this.passRelateURL) {
    //   this.common._apiError({code:'SB-ERR', msg:'No Page : Not Sprint#6'});
    //   return false;
    // }
    this.common._goLoad(this.passRelateURL);
  },

  _changeMicroPayUse: function (e) {
    if (!e.target) {
      this._changeSwitchUI(e);
    } else {
      var desc = this.isUseMicroPay ? Tw.MSG_MYT.HISTORY_ALERT_A1 : Tw.MSG_MYT.HISTORY_ALERT_A2;

      this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, desc, null, null,
          $.proxy(this._updateMicroPayUse, this, e),
          null);
    }
  },

  _updateMicroPayUse: function (e) {
    this._popupService.close();
    this._apiService.request(this.updateUseMicroPayAPI, {rtnUseYn: this.useMicroPayUseFlag})
        .done($.proxy(this._updateMicroPayUseCallback, this, e))
        .error($.proxy(this.common._apiError, this.common));
  },

  _updateMicroPayUseCallback: function (e, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.isUseMicroPay = !this.isUseMicroPay;
      this._changeSwitchUI(e);
    } else {
      this.common._apiError(res);
    }
  },

  _selectedPayType: function () {
    var currentID = this.$searchElement.$paymentTypeSelector.attr('id');
    this.apiOption.payMethod = Tw.PAYMENT_TYPE_CODE[_.last(currentID.split('-'))];

    this._getData();
  },

  _getChoiceDataMonth: function (term) {
    var choiceData = [];
    for (var k = 0; k <= term; k++) {
      choiceData.push(this._dateHelper.getShortDateWithFormatAddByUnit(this.currentYYYYMM, k * -1, 'months', Tw.DATE_FORMAT.YYYYDD_TYPE_1, 'YYYYMM'));
    }
    return choiceData;
  },

  _updatePasswordUseState: function () {

  },

  _getTabHash: function () {
    this.$tabTriggerWrapper.each($.proxy(function (i, o) {
      this.hashList.push($(o).find('a').attr('href').split('#')[1]);
    }, this));
  },

  _tabChangeCallback: function () {
    // console.log(this.common.currentTab);
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

  _changeSwitchUI: function (e) {
    var currentChecked = !!$(e.target || e).attr('checked');
    currentChecked = e.target ? !currentChecked : currentChecked;

    if (e.target) {
      $(e.target).attr('checked', currentChecked);
    }
    this.$microPayUseSwitch.attr('aria-checked', currentChecked);
    this.$microPayUseSwitch.parent().toggleClass('on', currentChecked);
    this.$microPayUseSwitchTitle.toggleClass('tx-red', !currentChecked);
    this.$microPayUseSwitchTitle.html(currentChecked ? Tw.MSG_MYT.HISTORY_TXT_01 : Tw.MSG_MYT.HISTORY_TXT_03);
  }

};
