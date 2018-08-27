/**
 * FileName: customer.faq.info.common.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.14
 */

Tw.CustomerFaqInfoCommon = function (rootEl, serviceId, selectData, selectedIndex) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this.current = _.last(this._history.pathname.split('/'));
  this.serviceId = serviceId;
  this._selectData = selectData ? JSON.parse(selectData) : {};
  this._selectedIndex = parseInt(selectedIndex, 10);

  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerFaqInfoCommon.prototype = {
  _init: function () {
    if (this._selectData.title) {
      this.$selectOpenTrigger.eq(0).text(this._selectData.subDepth[this._selectedIndex].title);
      this.$selectOpenTrigger.eq(0).data('current', this._selectedIndex);
      this.$selectOpenTrigger.eq(0).data('pageId', this.serviceId);
    }
  },

  _cachedElement: function () {
    this.$selectOpenTrigger = this.$container.find('.bt-dropdown.big');
    this.$linkMoveTirgger = this.$container.find('.bt-box');
  },

  _bindEvent: function () {
    this.$selectOpenTrigger.on('click', $.proxy(this._selectOpenHandler, this));
    if (this.$linkMoveTirgger.length && this._isServiceInfoMain()) {
      this.$linkMoveTirgger.on('click', $.proxy(this._moveSelectedHandler, this));
    }
  },

  _selectOpenHandler: function (e) {
    var selectedMoveButton = $(e.target).closest('span').siblings('.bt-box'),
        index              = this.$selectOpenTrigger.index(e.currentTarget),
        dataSet            = null,
        trigger            = $(e.target),
        handler            = null;

    if (selectedMoveButton.length && this._isServiceInfoMain()) {
      dataSet = Tw.POPUP_TPL.CUSTOMER_SERVICE_INFO_CHOICE;
      handler = this._setMoveURL;
    } else {
      if (!this._selectData.title) {
        // 사이트 이용안내 TypeA 케이스
        dataSet = Tw.POPUP_TPL.CUSTOMER_SITE_INFO_TYPEA_CHOICE;
        handler = this._changeContent;
      } else {
        dataSet = this._setCaseSelectorByData(this._selectData);
        handler = this._moveURL;
      }
    }

    this._popupService.open({
      hbs: 'select',
      title: dataSet[index].title,
      select: [dataSet[index]],
      bt_num: 'one',
      type: [{
        style_class: 'bt-red1',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._choiceOpenHandler, this, trigger, handler));
  },

  _setCaseSelectorByData: function (data) {

    _.map(data.subDepth, $.proxy(function(o, k) {
      o.text = o.title;
      o.checked = false;
      o.value = o.serviceId;

      if (k === this._selectedIndex) {
       o.checked = true;
      }
    }, this));
    data.options = data.subDepth;
    return [data];
  },

  _moveURL: function (target, e) {
    var selectedInput = $(e.currentTarget);

    this._popupService.close();
    if(!selectedInput.data('current') && !selectedInput.data('pageId')) {
      return false;
    } else {
      // console.log(selectedInput.data('current'), selectedInput.data('pageId'));
      // pageId = pageId + '?category=' + category + '&subCategory=' + subCategory + '&contentsIndex=' + current;
      this._moveServiceInfoURL(
          selectedInput.data('pageId') + '?category=' + target.data('category') +
          '&subCategory=' + target.data('subCategory') +
          '&contentsIndex=' + selectedInput.data('current')
      );
    }
  },

  _setMoveURL: function (target, e) {
    this._popupService.close();
    target.text($(e.currentTarget).data('text'));
    target.data('id', $(e.currentTarget).data('pageId'));
    target.data('current', $(e.currentTarget).data('current'));
  },

  _changeContent: function (target, e) {
    this._popupService.close();
    target.text($(e.currentTarget).data('text'));
    target.data('current', $(e.currentTarget).data('current'));
  },

  _moveSelectedHandler: function (e) {
    var index       = this.$linkMoveTirgger.index(e.currentTarget),
        target      = $(this.$selectOpenTrigger[index]),
        pageId      = target.data('id'),
        category    = target.data('category'),
        subCategory = target.data('subCategory'),
        current     = target.data('current') || 0;

    if (!pageId) {
      pageId = Tw.POPUP_TPL.CUSTOMER_SERVICE_INFO_CHOICE[index].options[0].value;
    }

    pageId = pageId + '?category=' + category + '&subCategory=' + subCategory + '&contentsIndex=' + current;

    this._moveServiceInfoURL(pageId);
  },

  _isServiceInfoMain: function (current) {
    return (current || this.current) === 'service-info';
  },

  _isSiteInfoMain: function (current) {
    return (current || this.current) === 'site-info';
  },

  _choiceOpenHandler: function (target, handler, e) {
    var inputs     = $(e).find('input[type=radio]'),
        confirmBtn = $(e).find('.bt-red1');

    $(inputs.get(target.data('current') || 0)).attr('checked', 'checked');

    inputs.on('change', function (e) {
      confirmBtn.data('current', inputs.index(e.target));
      confirmBtn.data('pageId', $(e.target).val());
      confirmBtn.data('text', $(e.target).parent().text().trim());
    });

    confirmBtn.on('click', $.proxy(handler, this, target));
  },

  _moveServiceInfoDetail: function (e) {
    var target = $(e.target).parent().siblings().find('.bt-dropdown');
    var pageId      = target.data('id'),
        category    = target.data('category'),
        subCategory = target.data('subCategory');

    if (!pageId) {
      var index = this.categorySelector.index($(e.target).parents('.service-guide-sel'));
      pageId = Tw.POPUP_TPL.CUSTOMER_SERVICE_INFO_CHOICE[index].options[0].value;
    }
    pageId = pageId + '?category=' + category + '&subCategory=' + subCategory;

    this._moveServiceInfoURL(pageId);
  },

  _moveServiceInfoURL: function (pageQuery) {
    // pageQuery에 pageID가 넘어오기 때문에 pageID 삭제 처리
    var paths = this._history.pathname.split('/');

    if (!this._isServiceInfoMain() && !this._isSiteInfoMain()) {
      paths.splice(-1);
    }
    paths = paths.join('/');

    if (pageQuery) {
      this._history.goLoad(paths + '/' + pageQuery);
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
