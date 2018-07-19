/**
 * FileName: payment.history.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.06
 */

Tw.PaymentHistoryCommon = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this._popupService = Tw.Popup;

  this.URLS = ['/payment/history', '/payment/history/realtime', '/payment/history/auto',
    '/payment/history/auto/unitedwithdrawal', '/payment/history/point/reserve', '/payment/history/point/auto'];

  this._init();
};

Tw.PaymentHistoryCommon.prototype = {
  _init: function () {
    this.titles = Tw.MSG_PAYMENT.HISTORY_MENU.split(',');

    this.paymentTypePopupValues = {
      title: Tw.MSG_PAYMENT.HISTORY_MENU_TITLE,
      menus: _.map(this.URLS, $.proxy(function (url, key) {
        return {
          attr: 'class="hbs-menu-list"',
          text: this.titles[key]
        };
      }, this))
    };
  },

  parse_query_string: function(query) {
    var vars = query.split('&');
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      var key = decodeURIComponent(pair[0]);
      var value = decodeURIComponent(pair[1]);
      if (typeof query_string[key] === 'undefined') {
        query_string[key] = decodeURIComponent(value);
      } else if (typeof query_string[key] === 'string') {
        var arr = [query_string[key], decodeURIComponent(value)];
        query_string[key] = arr;
      } else {
        query_string[key].push(decodeURIComponent(value));
      }
    }
    return query_string;
  },

  _normalizeNumber: function (num) {
    return num.replace(/(^0+)/, '');
  },

  setMenuChanger: function (target) {
    if(target)
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

  _goLoad: function (url) {
    location.href = url;
  },

  _apiError: function (err) {
    Tw.Logger.error(err.code, err.msg);
  }
};

Tw.PaymentHistoryCommon.prototype.listWithTemplate = function () {
};

Tw.PaymentHistoryCommon.prototype.listWithTemplate.prototype = {
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

    $(this.listTemplate(this.data)).insertBefore(target.parent());
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

