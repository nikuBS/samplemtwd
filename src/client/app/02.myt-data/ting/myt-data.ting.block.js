/**
 * @file myt-data.ting.block.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.18
 */

Tw.MyTDataTingBlock = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataTingBlock.prototype = {
  _init: function () {
    this._hideListItem();
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-request-ting-block', $.proxy(this._onShowBlockPopup, this));
    this.$container.on('click', '.fe-history-more', $.proxy(this._onShowMoreList, this));
  },

  _onShowMoreList: function (e) {
    var elTarget = $(e.currentTarget);
    var elList = $('.fe-wrap-block-list li');

    if ( elList.not(':visible').size() !== 0 ) {
      elList.not(':visible').slice(0, 20).show();
    }

    if ( elList.not(':visible').size() === 0 ) {
      elTarget.hide();
    }
  },

  _hideListItem: function () {
    if ( $('.fe-wrap-block-list li').size() > 20 ) {
      $('.fe-history-more').show();
      $('.fe-wrap-block-list li').slice(20).hide();
    }
  },
  _onShowBlockPopup: function (e) {
    var $target = $(e.currentTarget);
    this._popupService.openModalTypeA(
      Tw.MYT_DATA_TING.A81_TITLE,
      Tw.MYT_DATA_TING.A81_CONTENT,
      Tw.MYT_DATA_TING.A81_BTN_CONFIRM,
      null,
      $.proxy(this._unsubscribeAutoRecharge, this),
      $.proxy(this._closeUnsubscribeAutoRecharge, this),
      null,
      null,
      $target
    );
  },

  _closeUnsubscribeAutoRecharge: function () {
    this._popupService.close();
  },

  _unsubscribeAutoRecharge: function () {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0021, {})
      .done($.proxy(this._onSuccessTingBlock, this));
  },

  _onSuccessTingBlock: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.toast(Tw.MYT_DATA_TING.SUCCESS_BLOCK);
      this._goToMytMain();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _goToMytMain: function () {
    this._historyService.replaceURL('/myt-data/submain');
  },

  _openTingBlock: function () {
    this._hideListItem();
  }
};