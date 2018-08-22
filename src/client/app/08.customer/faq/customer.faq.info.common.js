/**
 * FileName: customer.faq.info.common.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.14
 */

Tw.CustomerFaqInfoCommon = function (rootEl, serviceId) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this.current = _.last(this._history.pathname.split('/'));
  this.serviceId = serviceId;

  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerFaqInfoCommon.prototype = {
  _init: function () {

    if (this.categorySelector) {
      this.choiceData = Tw.CUSTOMER_SERVICE_INFO_CHOICE;
    }
    // console.log(this.serviceId, this.current);
    // if (this.movePageButtonWrapper) {
    //   this.moveUrl = Tw.CUSTOMER_SERVICE_INFO_URL;
    //   this.moveByButtonPageID = [3315, 3316, null, 3320, 3321, 3727, 3722, 215];
    // }
  },

  _cachedElement: function () {
    this.categorySelector = $('.service-guide-sel');
    this.categorySelectorBtn = this.categorySelector.find('.bt-dropdown');
    // this.movePageButtonWrapper = $('.service-guide-link');
  },

  _bindEvent: function () {
    if (this.categorySelector) {
      this.categorySelector.on('click', '.bt-dropdown', $.proxy(this._openServiceInfoSelector, this));
      this.categorySelector.on('click', '.bt-box button', $.proxy(this._moveServiceInfoDetail, this));
    }
    // if (this.movePageButtonWrapper) {
    //   this.movePageButtonWrapper.on('click', 'button', $.proxy(this._movePageByLink, this));
    // }
  },

  _openServiceInfoSelector: function (e) {
    var trigger = $(e.target);
    var index = this.categorySelectorBtn.index(trigger);

    this._popupService.open({
      hbs: 'select',
      title: Tw.POPUP_TPL.CUSTOMER_SERVICE_INFO_CHOICE[index].title,
      multiplex: false,
      close_bt: true,
      select: [Tw.POPUP_TPL.CUSTOMER_SERVICE_INFO_CHOICE[index]],
      bt_num: 'one',
      type: [{
        style_class: 'bt-red1',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._choiceOpenHandler, this, trigger, index, this._setMoveUrl));
  },

  _choiceOpenHandler: function (target, index, handler, e) {
    var inputs = $(e).find('input[type=radio]'),
        confirmBtn = $(e).find('.bt-red1');

    $(inputs.get(target.data('current') || 0)).attr('checked', 'checked');

    inputs.on('change', function(e) {
      confirmBtn.data('current', inputs.index(e.target));
      confirmBtn.data('pageId', $(e.target).val());
      confirmBtn.data('text', $(e.target).parent().text().trim());
    });

    confirmBtn.on('click', $.proxy(handler, this, target));
  },

  _setMoveUrl: function (target, e) {
    this._popupService.close();
    target.text($(e.currentTarget).data('text'));
    target.data('id', $(e.currentTarget).data('pageId'));
    target.data('current', $(e.currentTarget).data('current'));
  },

  _moveServiceInfoDetail: function (e) {
    var pageId = $(e.target).parent().siblings().find('.bt-dropdown').data('id');
    if(!pageId) {
      var index = this.categorySelector.index($(e.target).parents('.service-guide-sel'));
      pageId = Tw.POPUP_TPL.CUSTOMER_SERVICE_INFO_CHOICE[index].options[0].value;
    }
    // console.log(pageId, e, Tw.POPUP_TPL.CUSTOMER_SERVICE_INFO_CHOICE);
    this._moveServiceInfoURL(pageId);
  },

  // _movePageByLink: function (e) {
  //   var index = this.movePageButtonWrapper.index($(e.currentTarget).parent());
  //   this._moveServiceInfoURL(this.moveByButtonPageID[index]);
  // },

  _moveServiceInfoURL: function(pageId) {
    if (pageId) {
      this._history.goLoad('/customer/faq/service-info/' + pageId);
    } else {
      return false;
    }
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

  _apiError: function (err, callback) {
    Tw.Logger.error(err.code, err.msg);
    var msg = Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg;
    this._popupService.openAlert(msg, Tw.POPUP_TITLE.NOTIFY, callback, callback);
    return false;
  }
};
