/**
 * FileName: myt.bill.history.common.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.26
 */

Tw.MyTBillHistoryCommon = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._init();
};

Tw.MyTBillHistoryCommon.prototype = {
  _init: function () {
    // TODO : 검색 기간 설정 관련 레이어 처리
    // TODO : 검색 관련 공통 처리
  },

  _setTab: function (context, callback, hashList, hashTriggerList) {
    var index;

    this.currentTab = this._hash._currentHashNav || hashList[0];
    index = hashList.indexOf(this.currentTab);

    if (index < 0) {
      this.currentTab = hashList[0];
      this._forceRefreshWithHash(this.currentTab);
    }

    hashTriggerList.eq(index).attr('aria-selected', true);

    $(window).on('hashchange', $.proxy(this._tabChangeHandler, this, callback, context));
  },

  _forceRefreshWithHash: function (hash) {
    this._history.goHash(hash);
    this.currentTab = hash;
  },

  _tabChangeHandler: function (context, callback) {
    if (this._hash._currentHashNav !== this.currentTab) {
      this.currentTab = this._hash._currentHashNav;
      $.proxy(callback, context)();
    }
  },

  parse_query_string: function () {
    return Tw.UrlHelper.getQueryParams();
  },

  getObjetToParamStr: function (obj) {
    if (!_.isObject(obj)) {
      return '';
    } else {
      var params = '?';
      _.mapObject(obj, function (value, key) {
        params = params + key + '=' + value + '&';
      });
      return params.substr(0, params.length - 1);
    }
  },

  _normalizeNumber: function (num) {
    return num.replace(/(^0+)/, '');
  },

  setMenuChanger: function (target) {
    if (target)
      target.on('click', $.proxy(this.openPaymentTypePopup, this));
  },

  setPaymentTypePopupOpener: function ($container) {
    this.choiceButtons = $container.find('.popup-choice button');
    $container.on('click', '.hbs-menu-list', $.proxy(this.selectedTypeHandler, this));
  },

  selectedTypeHandler: function (e) {
    var index = $(this.choiceButtons).index($(e.target));
    this._popupService.close();
    this._goLoad(this.URLS[index]);
  },

  openPaymentTypePopup: function () {
    this._popupService.openChoice(
        this.paymentTypePopupValues.title, this.paymentTypePopupValues.menus,
        '', $.proxy(this.setPaymentTypePopupOpener, this));
  },

  _setValueToLD: function (label, value) {
    Tw.UIService.setLocalStorage(label, value);
  },

  _getValueFromLD: function (label) {
    return Tw.UIService.getLocalStorage(label);
  },

  _goLoad: function (url) {
    this._history.goLoad(url);
  },

  _getPaymentType: function (flag) {
    switch (flag) {
      case '01':
        return Tw.PAYMENT_TYPE.NORMAL;
      case '02':
        return Tw.PAYMENT_TYPE.PACKAGE;
      case '03':
        return Tw.PAYMENT_TYPE.AUTO;
      case '04':
        return Tw.PAYMENT_TYPE.EASY;
      case '05':
        return Tw.PAYMENT_TYPE.COMPLAX;
      default:
        this._apiError();
        break;
    }
  },

  _apiError: function (err, callback) {
    Tw.Logger.error(err.code, err.msg);
    var msg = Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg;
    this._popupService.openAlert(msg, Tw.POPUP_TITLE.NOTIFY, callback, callback);
    return false;
  }
};

Tw.MyTBillHistoryCommon.ListWithTemplate = function (rootEL) {
  this.common = new Tw.MyTBillHistoryCommon(rootEL);
  this.$container = this.common.$container;
};

Tw.MyTBillHistoryCommon.ListWithTemplate.prototype = {
  _init: function (data, wrapper, template, helper, keyword, perPage, viewMoreSelector, listWrapperSelector, callBack) {

    this.compiler = Handlebars.compile;

    this.data = data;
    this.wrapper = wrapper;

    this.template = template;
    this.helper = helper;
    this.particalKeyword = keyword.partial || 'list';
    this.listTemplateKeyword = keyword.list;
    this.restButtonTemplateKeyword = keyword.restButton;
    this.viewMoreSelector = viewMoreSelector;
    this.listWrapperSelector = listWrapperSelector;

    this.perPage = perPage;
    this.currentPage = 0;
    this.callBack = callBack;

    /*
    data
    wrapper : 리스트 삽입 wrapper
    template = {
      wrapper :
      list :
      empty :
    }
    helper = {
      wrapper :
      list :
      empty :
    }
    keyword = {
      handlebar template 매칭된 키워드
      ex) {{#each page}}
      list : page
      restCount : restCount
    }
    perPage : page 당 list 수
    callBack
    */

    if (!data || !_.isObject(data)) {
      Tw.Logger.error('[payment/point/common] template : data error');
      return false;
    }
    if (!template || !_.isObject(template)) {
      Tw.Logger.error('[payment/point/common] common/template : template error');
      return false;
    }

    this._setTemplate();

    if (!this._isEmptyList()) {
      this._setHelper();
      this._buildListUI();
    } else {
      this._buildEmptyUI();
    }
  },

  _setTemplate: function () {
    this.listWrapperTemplate = this.template.wrapper ? this.compiler(this.template.wrapper.html()) : null;
    this.listTemplate = this.template.list ? this.compiler(this.template.list.html()) : null;
    this.emptyTemplate = this.template.empty ? this.compiler(this.template.empty.html()) : null;
  },

  _setHelper: function () {
    if (this.helper && _.isObject(this.helper)) {
      _.mapObject(this.helper, function (f, key) {
        Handlebars.registerHelper(key, f);
      });
    }
  },

  _buildListUI: function () {
    this.updateNextPageData();
    Handlebars.registerPartial(this.particalKeyword, this.listTemplate(this.data));

    if (this.data.result.length > this.perPage) {
      this.data.initialMoreData = true;
      this.data[this.restButtonTemplateKeyword] = this.getRestCounter();
      this.wrapper.off().on('click', this.viewMoreSelector, $.proxy(this.viewMoreHandler, this));
    } else {
      this.data.initialMoreData = false;
    }

    this.wrapper.empty().append(this.listWrapperTemplate(this.data));

    if (this.callBack) this.callBack();
  },

  _appendNextListUI: function (target) {
    this.currentPage++;
    this.updateNextPageData();

    if (!this.listWrapperSelector) {
      $(this.listTemplate(this.data)).insertBefore(target.parent());
    } else {

      this.listWrapper = this.listWrapper || this.wrapper.find(this.listWrapperSelector);

      if (this.listWrapper.length) {
        this.isULOL = (this.listWrapper.get(0).nodeName === 'UL') || (this.listWrapper.get(0).nodeName === 'OL');
      }

      if (!this.isULOL)
        $(this.listTemplate(this.data)).insertBefore(this.$container.find(this.listWrapperSelector));
      else
        this.listWrapper.append(this.listTemplate(this.data));
    }

    if (this.data.result.length <= this.perPage * (this.currentPage + 1)) {
      target.hide();
    }

    if (this.callBack) this.callBack();

    this.updateRestCounter(target);
  },

  _isEmptyList: function () {
    return this.data.result !== undefined && !this.data.result.length;
  },

  _buildEmptyUI: function () {
    this.wrapper.empty().append(this.emptyTemplate(this.data));
  },

  viewMoreHandler: function (e) {
    e.preventDefault();
    this._appendNextListUI($(e.target));
  },

  updateNextPageData: function () {
    this.data[this.listTemplateKeyword] = this.data.result.slice(
        this.perPage * this.currentPage,
        !this.currentPage ? this.perPage : (this.currentPage + 1) * this.perPage);
  },

  getRestCounter: function () {
    return this.data.result.length - (this.currentPage + 1) * this.perPage;
  },

  updateRestCounter: function (target) {
    target.find('span em').text(this.getRestCounter());
  }
};

Tw.MyTBillHistoryCommon.GetLimit = function () {

  this.common = new Tw.MyTBillHistoryCommon();

  this.usageRequestTitle = 'Request';
  this.usageRequestCounter = 0;
};

Tw.MyTBillHistoryCommon.GetLimit.prototype = {
  _init: function (API_CMD, callback) {
    this.API_CMD = API_CMD;
    this.callback = callback;

    this._get_init_usageRequest();
  },

  _get_init_usageRequest: function () {
    this.common._apiService.request(this.API_CMD, {
      gubun: this.usageRequestTitle,
      requestCnt: this.usageRequestCounter
    })
        .done($.proxy(this._pre_checkUsageLimitCurrentMonth, this))
        .error($.proxy(this.common._apiError, this));
  },

  _pre_checkUsageLimitCurrentMonth: function (res) {
    if (this.usageRequestCounter === 0) {
      this.usageRequestTitle = 'Done';
      this.usageRequestCounter++;
      this._get_init_usageRequest();
    } else if (this.usageRequestCounter === 1 || this.usageRequestCounter === 2) {
      if (res.code === Tw.API_CODE.CODE_00) {
        // console.log('------', res);
        this.callback(res);
      } else {
        // console.log('[myt/bill/history/limit] Retry', res);
        this.usageRequestTitle = 'Retry';
        this.usageRequestCounter++;
        this._get_init_usageRequest();
      }
    } else {
      this.common._apiError(res);
    }
  },

  _apiError: function (err, callback) {
    this.common._apiError(err, callback);
  }
};

Tw.MyTBillHistoryCommon.Search = function (rootEl, obj, comboUIObj, limitKeyword, limitDate, searchCallback, customTermSelectCallback) {
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.MyTBillHistoryCommon(rootEl);

  this.$elements = obj;
  this.comboUI = comboUIObj;
  this.searchCallback = searchCallback;
  this.limitKeyword = limitKeyword;
  this.limitDate = limitDate;
  this._customTermSelectCallback = customTermSelectCallback;

  this.hasPaymentType = !!this.$elements.$paymentTypeSelector;

  if (this.hasPaymentType) {
    this.paymentType = new Tw.MyTBillHistoryCommon.Search.ComboListUI(
        this.$elements.$paymentTypeSelector,
        this.comboUI.paymentType.title,
        this.comboUI.paymentType.separator,
        this.comboUI.paymentType.data,
        this.comboUI.paymentType.callback
    );
  }
  this.defaultMonth = new Tw.MyTBillHistoryCommon.Search.ComboListUI(
      this.$elements.$monthSelector,
      this.comboUI.defaultMonth.title,
      this.comboUI.defaultMonth.separator,
      this.comboUI.defaultMonth.data
  );

  this._cachedElement();
  this._bindDOM();
  this._init();

};

Tw.MyTBillHistoryCommon.Search.prototype = {
  _init: function () {
    this._resetCustomSelector();
    this.isByDay = false;
    this.isByMonth = true;

    this.currentYYMMDD = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMMDD');
    this.$elements.$customTermSelectInput.css({position: 'absolute', left: '-1000em'});
    this.$elements.$customTermSelectInput.removeClass('none');

    this.currentYYYYMM = this._dateHelper.getShortDateWithFormat(
        this.defaultMonth.data[this.defaultMonth.selectedIndex].text, 'YYYYMM',
        Tw.DATE_FORMAT.YYYYDD_TYPE_1);
    this.currentYYYYMMDD = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMMDD');
    this.customSearchStartYYYYMMDD_formed = this._dateHelper.getShortDateWithFormatAddByUnit(
        this.currentYYYYMMDD, -10, 'days', Tw.DATE_FORMAT.YYYYMMDD_TYPE_0
    );
    this.customSearchEndYYYYMMDD_formed = this._dateHelper.getShortDateWithFormat(
        this.currentYYYYMMDD, Tw.DATE_FORMAT.YYYYMMDD_TYPE_0
    );
    this.customSearchStartYYYYMMDD_input = this._dateHelper.getShortDateWithFormat(
        this.customSearchStartYYYYMMDD_formed, Tw.DATE_FORMAT.YYYYMMDD_TYPE_1, Tw.DATE_FORMAT.YYYYMMDD_TYPE_0
    );
    this.customSearchEndYYYYMMDD_input = this._dateHelper.getShortDateWithFormat(
        this.customSearchEndYYYYMMDD_formed, Tw.DATE_FORMAT.YYYYMMDD_TYPE_1, Tw.DATE_FORMAT.YYYYMMDD_TYPE_0
    );
    this.customLimitYYYYMMDD_formed = this._dateHelper.getShortDateWithFormatAddByUnit(
        this.currentYYYYMMDD, this.limitDate * -1, this.limitKeyword, Tw.DATE_FORMAT.YYYYMMDD_TYPE_0
    );
  },

  _cachedElement: function () {
    this.$tubeListWrapper = this.$elements.$customTermSelector.closest('.widget');
    this.$customTermWrapper = this.$elements.$customTermStartSelector.parent();
  },

  _bindDOM: function () {
    if (this.hasPaymentType) {
      this.$elements.$paymentTypeSelector.on('click', $.proxy(this.paymentType._openComboListUI, this.paymentType));
    }
    this.$elements.$monthlyCustomTermSelector.on('change', $.proxy(this._changeSearchType, this));
    this.$elements.$monthSelector.on('click', $.proxy(this.defaultMonth._openComboListUI, this.defaultMonth));
    if (this._customTermSelectCallback) {
      this.$elements.$customTermSelector.on('change', $.proxy(this._customTermSelectCallback, this));
    } else {
      this.$elements.$customTermSelector.on('change', $.proxy(this._updateCustomTerm, this));
    }

    this.$elements.$searchBtn.on('click', $.proxy(this._searchBtnHandler, this));
    this.$elements.$customTermSelectInput.on('change', $.proxy(this._updateCurrentDateSelect, this));

    this.$elements.$customTermStartSelector.on('click', $.proxy(this._focusDatePicker, this, 'S'));
    this.$elements.$customTermEndSelector.on('click', $.proxy(this._focusDatePicker, this, 'E'));
  },

  _resetCustomSelector: function () {
    this.$elements.$customTermSelector.each(function (i, o) {
      var parent = $(o).parent();
      parent.attr('aria-checked', false);
      parent.removeClass('checked');
      $(o).attr('checked', false);
    });
    this.$customTermWrapper.addClass('none');
    this.termKeyword = '';
    this.termText = '';
    this.termSearchKeyword = '';
    this.termValue = null;
  },

  _searchBtnHandler: function () {
    var startYYYYMMDD;
    var endYYYYMMDD;
    var indicatorText = '';
    var paymentType;
    if (this.paymentType) {
      paymentType = Tw.PAYMENT_TYPE_CODE[_.last(this.paymentType.searchpaytype.split('-'))];
    }

    // console.log(this.termText, this.termSearchKeyword);

    if (this.isByMonth) {
      indicatorText = this.defaultMonth.data[this.defaultMonth.selectedIndex].text;

      if (this.defaultMonth.selectedIndex === '0') {
        startYYYYMMDD = this.currentYYYYMM + '01';
        endYYYYMMDD = this._dateHelper.getEndOfMonth(this.currentYYYYMM, 'YYYYMMDD', 'YYYYMM');
      } else {
        startYYYYMMDD = this._dateHelper.getShortDateWithFormat(
            this.defaultMonth.data[this.defaultMonth.selectedIndex].text, 'YYYYMMDD', Tw.DATE_FORMAT.YYYYDD_TYPE_1);
        endYYYYMMDD = this._dateHelper.getEndOfMonth(startYYYYMMDD, 'YYYYMMDD');
      }
    } else {
      if (this.termSearchKeyword !== 'custom') {
        indicatorText = this.termText;
        startYYYYMMDD = this._dateHelper.getShortDateWithFormatAddByUnit(
            this.currentYYMMDD, this.termValue * -1, this.termSearchKeyword, 'YYYYMMDD');
        endYYYYMMDD = this.currentYYMMDD;
      } else {
        indicatorText = (this.customSearchStart || this.customSearchStartYYYYMMDD_formed) + ' ~ ' +
            (this.customSearchEnd || this.customSearchEndYYYYMMDD_formed);

        startYYYYMMDD = (this.customSearchStart || this.customSearchStartYYYYMMDD_formed).replace(/\./g, '');
        endYYYYMMDD = (this.customSearchEnd || this.customSearchEndYYYYMMDD_formed).replace(/\./g, '');
        var days = Math.abs(this._dateHelper.getDiffByUnit(startYYYYMMDD, endYYYYMMDD, this.limitKeyword));

        if (endYYYYMMDD > this.currentYYYYMMDD) {
          this.common._popupService.openAlert(
              Tw.MSG_MYT.HISTORY_ALERT_A11, Tw.POPUP_TITLE.NOTIFY,
              $.proxy(this.common._popupService.close, this.common), null);
          this.$elements.$customTermEndSelector.val(this.customSearchEndYYYYMMDD_input);
          this.$elements.$customTermEndSelector.text(this.customSearchEndYYYYMMDD_formed);
          return false;
        }

        if (days > this.limitDate) {
          if (startYYYYMMDD > endYYYYMMDD) {
            this.common._popupService.openAlert(
                Tw.MSG_MYT.HISTORY_ALERT_A8, Tw.POPUP_TITLE.NOTIFY,
                $.proxy(this.common._popupService.close, this.common), null);
            this.$elements.$customTermStartSelector.val(this.customSearchStartYYYYMMDD_input);
            this.$elements.$customTermStartSelector.text(this.customSearchStartYYYYMMDD_formed);
            return false;
          }

          var str = Tw.MSG_MYT.HISTORY_ALERT_A9.replace(Tw.DATE_FORMAT.YYYYMMDD_TYPE_0, this.customLimitYYYYMMDD_formed);
          this.common._popupService.openAlert(
              str, Tw.POPUP_TITLE.NOTIFY,
              $.proxy(this.common._popupService.close, this.common), null);
          this.$elements.$customTermStartSelector.val(this.customSearchStartYYYYMMDD_input);
          this.$elements.$customTermStartSelector.text(this.customSearchStartYYYYMMDD_formed);
          this.$elements.$customTermEndSelector.val(this.customSearchEndYYYYMMDD_input);
          this.$elements.$customTermEndSelector.text(this.customSearchEndYYYYMMDD_formed);
          return false;
        }
      }
    }

    this._updateCurrentIndicator(indicatorText);
    this.$elements.$termOpener.click();

    this.searchCallback(startYYYYMMDD, endYYYYMMDD, paymentType);
  },

  _changeSearchType: function (e) {
    var index = this.$elements.$monthlyCustomTermSelector.index($(e.target));
    switch (index) {
      case 0:
        this.isByMonth = true;
        this.isByDay = false;
        break;
      case 1:
        this.isByMonth = false;
        this.isByDay = true;
        break;
      default:
        break;
    }
    this._resetCustomSelector();
    this._updateSearchSubOption();
  },

  _updateCustomTerm: function (e) {
    var index = this.$elements.$customTermSelector.index($(e.target));
    switch (index) {
      case 0:
        this.termText = $(e.target).parent().text();
        this.termSearchKeyword = 'weeks';
        break;
      case 1:
      case 2:
      case 3:
        this.termText = $(e.target).parent().text();
        this.termSearchKeyword = 'months';
        break;
      case 4:
        this.termText = $(e.target).parent().text();
        this.termSearchKeyword = 'years';
        break;
      case 5:
        this.termText = $(e.target).parent().text();
        this.termSearchKeyword = 'custom';
        break;
      default:
        break;
    }
    switch (index) {
      case 0:
      case 1:
      case 4:
        this.termValue = 1;
        break;
      case 2:
        this.termValue = 3;
        break;
      case 3:
        this.termValue = 6;
        break;
      case 5:
        this.termKeyword = 'custom';
        break;
      default:
        break;
    }
    this._updateSearchCustomSubOption(index);
  },

  _updateSearchSubOption: function () {
    if (this.isByDay) {
      this.$elements.$monthSelector.addClass('none');
      this.$tubeListWrapper.removeClass('none');

      this.$elements.$customTermSelector.eq(0).parent().attr('aria-checked', true);
      this.$elements.$customTermSelector.eq(0).parent().addClass('checked');
      this.$elements.$customTermSelector.eq(0).attr('checked', true);
      this.termText = this.$elements.$customTermSelector.eq(0).parent().text();
      this.termValue = 1;
      this.termSearchKeyword = 'weeks';
    } else {
      this.$elements.$monthSelector.removeClass('none');
      this.$tubeListWrapper.addClass('none');
    }
  },

  _focusDatePicker: function (keyword) {
    this.$elements.$customTermSelectInput.data('keyword', keyword);
    if (keyword === 'S') {
      this.$elements.$customTermSelectInput.val(this.customSearchStartYYYYMMDD_input);
    } else {
      this.$elements.$customTermSelectInput.val(this.customSearchEndYYYYMMDD_input);
    }
    if (Tw.BrowserHelper.isIos) {
      this.$elements.$customTermSelectInput.focus();
    } else {
      this.$elements.$customTermSelectInput.click();
    }

  },

  _updateSearchCustomSubOption: function (index) {
    if (index === 5) {
      this.$elements.$customTermStartSelector.text(this.customSearchStartYYYYMMDD_formed);
      this.$elements.$customTermEndSelector.text(this.customSearchEndYYYYMMDD_formed);
      this.$customTermWrapper.removeClass('none');
    } else {
      this.$customTermWrapper.addClass('none');
    }
  },

  _updateCurrentDateSelect: function (e) {
    var element = $(e.target),
        value   = this._dateHelper.getShortDateWithFormat(element.val(), Tw.DATE_FORMAT.YYYYMMDD_TYPE_0);

    if (element.data('keyword') === 'S') {
      this.customSearchStart = value;
      this.$elements.$customTermStartSelector.text(value);
    } else {
      this.customSearchEnd = value;
      this.$elements.$customTermEndSelector.text(value);
    }
  },

  _updateCurrentIndicator: function (text) {
    this.$elements.$termOpener.text(text);
  }
};

Tw.MyTBillHistoryCommon.Search.ComboListUI = function (dom, selectUITitle, separatorName, data, callback) {
  this.common = new Tw.MyTBillHistoryCommon();

  this.target = dom;
  this.selectUITitle = selectUITitle;
  this.data = data;
  this.separatorName = separatorName;
  this.callback = callback;
  this.separatorKeyword = this.separatorName.split('-').join('');

  this._init();
};

Tw.MyTBillHistoryCommon.Search.ComboListUI.prototype = {
  _init: function () {
    this.listData = [];

    this._setListData();
  },

  _setListData: function () {
    for (var i = 0; i < this.data.length; i++) {
      var listObj = {
        attr: 'class="hbs-' + this.separatorName + '" id=' + this.separatorName + '-' + this.data[i].key,
        text: this.data[i].text
      };
      this.listData.push(listObj);
    }
    this[this.separatorKeyword] = _.last(this.listData[0].attr.split('='));
    this.selectedIndex = 0;
  },

  _openComboListUI: function () {
    this.common._popupService.openChoice(this.selectUITitle, this.listData, '', $.proxy(this._onOpenList, this));
  },

  _onOpenList: function ($layer) {
    $layer.on('click', '.hbs-' + this.separatorName, $.proxy(this._getSelectedList, this));
  },

  _getSelectedList: function (event) {
    var $target = $(event.currentTarget);
    this.target.attr('id', $target.attr('id'));
    this.target.text($target.text());
    this[this.separatorKeyword] = $target.attr('id');
    this.selectedIndex = _.last($target.attr('id').split('-'));

    this.common._popupService.close();
    if (this.callback)
      this.callback();
  }
};

