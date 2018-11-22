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
  },

  _cachedElement: function () {
    // $('.fe-ting-block')
    // $('.fe-txt-block-status')
    //$('.fe-wrap-ting-block')
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-ting-block', $.proxy(this._openTingBlock, this));
    this.$container.on('click', '.fe-close-wrap-ting-block', $.proxy(this._hideTingBlock, this));

  },

  _getBlockInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0027, {}).done($.proxy(this._onSuccessBlockHistory, this));
  },

  _onSuccessBlockHistory: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // this._setAmountUI(Number(res.result.transferableAmt));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _openTingBlock: function (){
    $('.fe-wrap-ting-block').show();
  },

  _hideTingBlock: function (){
    $('.fe-wrap-ting-block').hide();
  }
};