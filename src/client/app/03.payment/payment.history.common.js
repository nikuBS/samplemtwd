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
    var menus = _.map(this.URLS, function (url, key) {
      return {
        attr: '',
        text: titles[key]
      };
    });

    this.paymentTypePopupValues = {
      title: Tw.MSG_PAYMENT.HISTORY_MENU_TITLE,
      menus: menus
    };
  },

  setListWithTempalte: function (wrapper, template, helper, perPage, viewMoreSelector, elementSelector, callBack) {
    var compiler = Handlebars.compile,
      data = this.currentData;
    /*
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
    perPage : page 당 list 수
    callBack : viewMore 내부처리, callBack 내부 버튼등 처리를 위한 이벤트 바인딩등
    */

    if(!data || !_.isObject(data)) {
      Tw.Logger.error('[payment/point/common] template : data error');
      return false;
    }
    if(!template || !_.isObject(template)) {
      Tw.Logger.error('[payment/point/common] common/template : template error');
      return false;
    }

    this.listWrapperTemplate = template.wrapper ? compiler(template.wrapper.html()) : null;
    this.listTemplate = template.list ? compiler(template.list.html()) : null;
    this.emptyTemplate = template.empty ? compiler(template.empty.html()) : null;

    if(!data.result.length) {
      return this.emptyTemplate(data);
    }

    if(helper && _.isObject(helper)) {
      _.mapObject(helper, function(f, key) {
        Handlebars.registerHelper(key, f);
      });
    }

    data.perPage = perPage;
    data.currentPage = 0;

    if(data.result.length > perPage) {
      data.pages = data.result.slice(perPage * data.currentPage, perPage);
      data.restCount = data.result.length - perPage;
      wrapper.on('click', viewMoreSelector, $.proxy(this.viewMoreHandler, this));
    }

    Handlebars.registerPartial('list', this.listTemplate(data));
    wrapper.empty().append(this.listWrapperTemplate(data));

    if(callBack) callBack();

  },

  viewMoreHandler: function (e) {
    e.preventDefault();
    this.appendNextPage($(e.target));
  },

  appendNextPage: function(target) {
    var data = this.currentData;
    data.currentPage++;
    data.pages = data.result.slice(data.perPage * data.currentPage, ( data.currentPage + 1) * data.perPage);

    $(this.listTemplate(data)).insertBefore(target.parent());
    if(data.result.length <= data.perPage * (data.currentPage + 1)) {
      target.hide();
    }
    this.updateRestCounter(target);
  },

  updateRestCounter: function(target) {
    var data = this.currentData;

    target.find('span em').text(data.result.length - (data.currentPage + 1) * data.perPage);
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
