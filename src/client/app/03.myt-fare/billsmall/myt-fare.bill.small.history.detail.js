/**
 * FileName: myt-fare.bill.contents.history.detail.js
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */
Tw.MyTFareBillSmallHitstoryDetail = function (rootEl, data, updateFunc) {
  this.$container = rootEl;
  this.data = data;
  this.updateFunc = updateFunc;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillSmallHitstoryDetail.prototype = {
  _init: function() {
    this.rootPathName = this._historyService.pathname;
  },

  _cachedElement: function() {
    this.$showBlockList = this.$container.find('#fe-btn-view-block'); // 차단내역 보기 버튼
    this.$setBlock = this.$container.find('#fe-btn-set-block'); // 차단내역 보기 버튼

  },

  _bindEvent: function() {
    // 차단하기
    this.$setBlock.on('click', $.proxy(this._setBillBlock, this));
  
    // 차단내역으로 이동
    this.$showBlockList.on('click', $.proxy(this._moveBlockList, this));
  },

  _moveBlockList: function() {
    this._historyService.replaceURL('/myt-fare/bill/small/block');
  },

  // 차단하기
  _setBillBlock: function(e) {
    this._popupService.openModalTypeA(
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.TITLE,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.MSG,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.BUTTON,
      $.proxy(function(){},this),
      $.proxy(this._execBillBlock,this),
      null,
      'confirmBlock',
      $(e.currentTarget)
    );
    // this.detailData
  },

  _execBillBlock: function() {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_05_0082, {
      idPg: this.data.idpg,
      tySvc: this.data.tySvc,
      cpCode: this.data.cpCode,
      state: 'A'
    })
        .done($.proxy(this._successBillBlock, this))
        .fail($.proxy(this._failBillBlock,this));
  },

  _successBillBlock: function(resq) {
    if(resq.code !== Tw.API_CODE.CODE_00) {
      this._failBillBlock(resq);
      return Tw.Error(resq.code, resq.msg).pop();
    }
    // 차단완료
    Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.BLOCK);
    
    // view 
    this.$setBlock.addClass('none').attr('aria-hidden', true)
    this.$showBlockList.removeClass('none').attr('aria-hidden', false);
    if (this.$container.find('.fe-block-state').length) {
      this.$container.find('.fe-block-state').text(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TYPE.A1);
    }

    // data update
    this.updateFunc(this.data.plainTime, this.data.listId, {
      cpState:'A1',
      blockState:Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TYPE.A1,
      isBlocked:true
    });
  },

  _failBillBlock: function(e) {
    Tw.Logger.info(e);
  }
 
};
