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
    this.usageRequestTitle = 'Request';
    this.usageRequestCounter = 0;
    this.paymentTypeArr = [];

    this.baseURL = '/myt/bill/history/micro/';

    // 7월로 설정
    // this.fromYYYYMM = this._dateHelper.getShortDateWithFormatAddByUnit(new Date(), -12, 'months', 'YYYYMM');
    // this.currentYYYYMM = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMM');
    this.currentYYYYMM = this._dateHelper.getShortDateWithFormatAddByUnit(new Date(), -1, 'months', 'YYYYMM');

    _.each(Tw.PAYMENT_TYPE, $.proxy(function (o, i) {
      o = (o === Tw.PAYMENT_TYPE.TOTAL) ? Tw.MSG_MYT.HISTORY_TXT_04 + ' ' + o : o;
      this.paymentTypeArr.push({text: o, key: i});
    }, this));

    this.apiOption = {
      'fromdate': (this.fromYYYYMM || this.currentYYYYMM) + '01',
      'todate': this.currentYYYYMM + this._dateHelper.getEndOfMonth(this.currentYYYYMM, 'DD', 'YYYYMM')
    };

    this.common._setTab(this._tabChangeCallback, this, this.hashList, this.$tabTriggerWrapper);
    this.getLimit = new this.common.getLimit();

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

    this.$contentWrapper = this.$container.find('.tab-contents > ul > li');
  },

  _bindDOM: function () {
    this.$usageLimitCheckTrigger.on('click', $.proxy(this._checkUsageLimitCurrentMonth, this));
    this.$limitChangeBtn.on('click', $.proxy(this.common._goLoad, this.common, Tw.URL_PATH.MYT_PAY_MICRO_LIMIT_CHANGE));
    this.$limitDetailBtn.on('click', $.proxy(this.common._goLoad, this.common, Tw.URL_PATH.MYT_PAY_MICRO_LIMIT_DETAIL));
    this.$microPayUseSwitchInput.on('click', $.proxy(this._changeMicroPayUse, this));
    this.$payPasswordChkBtn.on('click', $.proxy(this._movePayPasswordPage, this));

    this.$searchElement.$paymentTypeSelector.on('click', $.proxy(this._selectPayType, this));
    // this.$searchElement.$monthSelector.on('click', $.proxy())

  },

  _selectPayType: function (evt) {
    (new this.common.searchComboListUI(
        this.$searchElement.$paymentTypeSelector,
        Tw.POPUP_TITLE.PAYMENT_TYPE_SELECT,
        'search-pay-type',
        this.paymentTypeArr
    ))._init(evt);
  },

  _getTabHash: function () {
    this.$tabTriggerWrapper.each($.proxy(function (i, o) {
      this.hashList.push($(o).find('a').attr('href').split('#')[1]);
    }, this));
  },

  _tabChangeCallback: function () {
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

  _getData: function () {
    if(this.getUsingPasswordAPI) {
      this._apiService.request(this.getUsingPasswordAPI, {})
          .done($.proxy(this._updatePasswordUseState, this))
          .error($.proxy(this._apiError, this));
    }

    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption)
          .done($.proxy(this._checkPreRender, this))
          .error($.proxy(this._apiError, this));
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

  _setData: function (res) {
    console.log('[_setData]', res);
    if (!this.useMicroPayUseFlag) {
      this._initData(res);
    }

    this._filterHistory(res.histories);

    if (res.histories !== undefined && res.histories.length) {
      this.isListEmpty = false;

      // TODO : data setting for Template
      if (!_.isEmpty(this.usageHistories)) {
        this.usageHistories.map($.proxy(function (o, i) {
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
      }

      if (!_.isEmpty(this.blindHistoies)) {
        this.blindHistoies.map($.proxy(function (o, i) {
          o.listId = i;
          o.serviceName = null;
          o.requestDate = this._dateHelper.getShortDateWithFormat(o.useDate, 'YYYY.MM.DD');
          o.presentDate = this._dateHelper.getShortDateWithFormat(o.useDate, 'YYYY.MM.DD');

          o.blindState = this._getBlindState(o);

          o.linkHREF = this.baseURL + 'detail?type=1' +
              '&useDate=' + o.useDate +
              '&cpTel=' + o.cpTel +
              '&serviceName=' + o.serviceName +

              '&cpCode=' + o.cpCode +
              '&tySvc=' + o.tySvc +
              '&idpg=' + o.idpg +
              '&rtnUseYn=' + this.useMicroPayUseFlag +
              '&wapYn=' + o.wapYn +
              '&payMethod=' + o.payMethod +
              '&payMethodType=' + o.paymentType +
              '&cpName=' + o.cpName +
              '&cpState=' + o.cpState +
              '&pgName=' + o.pgName;
        }, this));
      }

    } else {
      this.isListEmpty = true;
    }

    this._setSubInfoUI();
    this._setListUI();
  },

  _getBlindState: function (obj) {
    console.log(obj);
    // return obj;
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

  _filterHistory: function (res) {
    this.usageHistories = res ? _.filter(res, $.proxy(function (o) {
      return o.cpState.substr(0, 1) !== 'A';
    })) : [];
    this.blindHistoies = res ? _.filter(res, $.proxy(function (o) {
      return o.cpState.substr(0, 1) === 'A';
    }, this)) : [];
  },

  _checkPreRender: function (res) {
    console.log('[_checkPreRender]', res);
    switch (res.code) {
      case Tw.API_CODE.CODE_00:
        this._setData(res.result);
        break;
      default:
        return this.common._apiError(res);
    }

  },

  _setSubInfoUI: function () {
    this.$microPayUseSwitchInput.attr('checked', this.isUseMicroPay);
    this._changeMicroPayUse(this.$microPayUseSwitchInput);

    this.$payPasswordChkIndicator.html(this.passRelateTxt);
    if (!this.isListEmpty) {
      this.$searchElement.$usageTotalDesc.show();
    }
  },

  _setListUI: function () {
    if (_.isEmpty(this.blindHistoies.length)) {
      this.$template.$domBlindListWrapper.addClass('type2');
    }
    var usageList = new this.common.listWithTemplate();
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
    }, 10, '#tab1-tab .history-list .bt-more', '', $.proxy(this._appendListCallBack, this));

    var blindList = new this.common.listWithTemplate();
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
    }, 10, '#tab2-tab .history-list .bt-more', '', $.proxy(this._appendListCallBack, this));
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
    //     $.proxy(this.detailSuccess, this, selectedList)).error($.proxy(this._apiError, this));
  },

  _movePayPasswordPage: function () {
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
    this._apiService.request(this.updateUseMicroPayAPI, { rtnUseYn: this.useMicroPayUseFlag })
        .done($.proxy(this._updateMicroPayUseCallback, this, e))
        .error($.proxy(this._apiError, this));
  },

  _updateMicroPayUseCallback: function (e, res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      this.isUseMicroPay = !this.isUseMicroPay;
      this._changeSwitchUI(e);
    } else {
      this.common._apiError(res);
    }
  },

  _updatePasswordUseState: function () {

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
