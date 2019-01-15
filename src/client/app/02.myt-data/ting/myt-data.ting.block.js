/**
 * FileName: myt-data.ting.block.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.18
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
    this._getBlockInfo();
  },

  _cachedElement: function () {
    this.tpl_block_item = Handlebars.compile($('#tpl-ting-block-item').html());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-ting-block', $.proxy(this._openTingBlock, this));
    this.$container.on('click', '.fe-close-wrap-ting-block', $.proxy(this._hideTingBlock, this));
    this.$container.on('click', '.fe-request-ting-block', $.proxy(this._onShowBlockPopup, this));
  },

  _getBlockInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0027, {}).done($.proxy(this._onSuccessBlockHistory, this));
  },

  _onSuccessBlockHistory: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var blockList = res.result;

      $('.fe-wrap-block-list').html(this.tpl_block_item({ block_list: blockList }));

      if ( blockList.length !== 0 ) {
        $('.fe-wrap-block-history').show();
        $('.fe-block-history-empty').hide();
      } else {
        $('.fe-wrap-block-history').hide();
        $('.fe-block-history-empty').show();
      }

    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onShowBlockPopup: function () {
    this._popupService.openModalTypeA(
      Tw.MYT_DATA_TING.A81_TITLE,
      Tw.MYT_DATA_TING.A81_CONTENT,
      Tw.MYT_DATA_TING.A81_BTN_CONFIRM,
      null,
      $.proxy(this._unsubscribeAutoRecharge, this),
      $.proxy(this._closeUnsubscribeAutoRecharge, this)
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
      // this._popupService.openAlert(Tw.MYT_DATA_TING.SUCCESS_BLOCK, null, null, $.proxy(this._goToMytMain, this));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _goToMytMain: function () {
    this._historyService.replaceURL('/myt-data/submain');
  },

  _openTingBlock: function () {
    $('.fe-wrap-ting-block').show();
  },

  _hideTingBlock: function () {
    $('.fe-wrap-ting-block').hide();
  }
};