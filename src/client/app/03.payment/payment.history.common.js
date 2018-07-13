/**
 * FileName: payment.history.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.06
 */

Tw.PaymentHistoryCommon = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);


  this.URLS = ['/payment/history', '/payment/history/immediate', '/payment/history/auto',
    '/payment/history/auto/unitedwithdrawal', '/payment/history/point/reserve', '/payment/history/point/auto'];

  this._init();
};

Tw.PaymentHistoryCommon.prototype = {
  _init: function () {
    var titles = Tw.MSG_PAYMENT.HISTORY_MENU.split(',');

    this.paymentTypePopupValues = {
      title: Tw.MSG_PAYMENT.HISTORY_MENU_TITLE,
      menus: _.map(this.URLS, function (url, key) {
        return {
          attr: '',
          text: titles[key]
        };
      })
    };
  },

  setMenuChanger: function (target) {
    target.on('click', $.proxy(this.openPaymentTypePopup, this));
  },

  setPaymentTypePopupOpener: function ($container) {
    this.choiceButtons = $container.find('.popup-choice button');
    this.choiceButtons.on('click', $.proxy(this.selectedTypeHandler, this));
  },

  selectedTypeHandler: function (e) {
    var index = $(this.choiceButtons).index(e.target);

    Tw.Popup.close();
    this._goLoad(this.URLS[index]);
  },

  openPaymentTypePopup: function () {
    Tw.Popup.openChoice(this.paymentTypePopupValues.title, this.paymentTypePopupValues.menus, false, $.proxy(this.setPaymentTypePopupOpener, this));
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

  // _buildListUI: function() {
  //   this.updateNextPageData();
  //   if (this.data.result.length > this.perPage) {
  //
  //     this.data[this.restButtonTemplateKeyword] = this.getRestCounter();
  //     this.wrapper.on('click', this.viewMoreSelector, $.proxy(this.viewMoreHandler, this));
  //   } else {
  //     this.data.initialMoreData = false;
  //   }
  //
  //   Handlebars.registerPartial('list', this.listTemplate(this.data));
  //   this.wrapper.append(this.listWrapperTemplate(this.data));
  //   if(this.data.initialMoreData) {
  //     $(this.listTemplate(this.data)).insertBefore(this.wrapper.find(this.viewMoreSelector).parent());
  //   } else {
  //     this.wrapper.find(this.listWrapperSelector).append(this.listTemplate(this.data));
  //   }
  //
  //   if (this.callBack) this.callBack();
  // },

  _buildListUI: function () {
    this.updateNextPageData();
    Handlebars.registerPartial('list', this.listTemplate(this.data));

    if (this.data.result.length > this.perPage) {
      this.data.initialMoreData = true;
      this.data[this.restButtonTemplateKeyword] = this.getRestCounter();
      this.wrapper.on('click', this.viewMoreSelector, $.proxy(this.viewMoreHandler, this));
    } else {
      this.data.initialMoreData = false;
    }
    console.log('[payment/history/common]', this.data);

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
    return !this.data.result.length;
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

