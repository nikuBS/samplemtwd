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
    localStorage.setItem(label, value);
  },

  _getValueFromLD: function (label) {
    return localStorage.getItem(label);
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

  _apiError: function (err) {
    Tw.Logger.error(err.code, err.msg);
    var msg = Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg;
    this._popupService.openAlert(msg);
    return false;
  }
};

Tw.MyTBillHistoryCommon.ListWithTemplate = function () {
  this.common = new Tw.MyTBillHistoryCommon();
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
      $(this.listTemplate(this.data)).insertBefore(this.$container.find(this.listWrapperSelector));
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

Tw.MyTBillHistoryCommon.SearchComboListUI = function (dom, selectUITitle, separatorName, data) {
  this.common = new Tw.MyTBillHistoryCommon();

  this.target = dom;
  this.selectUITitle = selectUITitle;
  this.data = data;
  this.separatorName = separatorName;
};

Tw.MyTBillHistoryCommon.SearchComboListUI.prototype = {
  _init: function (event) {
    this.currentTarget = event.currentTarget;
    this.listData = [];

    this._setListData();
    this._openComboListUI();
  },

  _setListData: function () {
    for (var i = 0; i < this.data.length; i++) {
      var listObj = {
        attr: 'class="hbs-' + this.separatorName + '" id=' + this.separatorName + '-' + this.data[i].key,
        text: this.data[i].text
      };
      this.listData.push(listObj);
    }
  },

  _openComboListUI: function () {
    this.common._popupService.openChoice(this.selectUITitle, this.listData, '', $.proxy(this._onOpenList, this));
  },

  _onOpenList: function ($layer) {
    $layer.on('click', '.hbs-' + this.separatorName, $.proxy(this._getSelectedList, this));
  },

  _getSelectedList: function (event) {
    var $selectedList = this.target;
    var $target = $(event.currentTarget);
    $selectedList.attr('id', $target.attr('id'));
    $selectedList.text($target.text());
    this.common._popupService.close();
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
    } else if (this.usageRequestCounter === 1) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this.callback(res);
      } else {
        console.log('[myt/bill/history/limit] Retry');
        this.usageRequestTitle = 'Retry';
        this.usageRequestCounter++;
        this._get_init_usageRequest();
      }
    } else {
      this.common._apiError(res);
    }
  },

  _apiError: function (res) {
    this.common._apiError(res);
  }
};


