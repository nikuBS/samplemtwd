/**
 * FileName: myt-fare.bill.small.block.js
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */
Tw.MyTFareBillSmallBlock = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  console.log(this.data);
  
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillSmallBlock.prototype = {
  _init: function() {
    var renderedHTML;
    if(!this.data.cpHistories.length){
      renderedHTML = this.$template.$emptyList();
    }else{
      renderedHTML = this.$template.$blockContents(this.data);
    }
    this.$domWrapper.append(renderedHTML);
    
  },

  _cachedElement: function() {
    this.$domWrapper = this.$container.find('#fe-block-list'); 
    this.$template = {
      $blockContents: Handlebars.compile($('#fe-block-contents').html()),
      $emptyList: Handlebars.compile($('#list-empty').html())
    };
  },

  _bindEvent: function() {
    // this.$domWrapper.find('.fe-block-check').on('click',$.proxy(this._UnBlockThis,this)); // 해제하기
    // this.$domWrapper.find('.on-tx').on('click',$.proxy(this._UnBlockThis,this)); // 해제하기
    this.$domWrapper.find('.off-tx').on('click',$.proxy(this._BlockThis,this)); // 차단하기
  },

  _UnBlockThis: function(e) {
    e.stopPropagation();
    this.$li = this.$domWrapper.find('li').filter(function(){ return $(this).data('listId') === $(e.currentTarget).data('listId'); });
    this.blockData = this.data.cpHistories[$(e.currentTarget).data('listId')];
    // 해제하기
    this._popupService.openModalTypeA(
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A95.TITLE,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A95.MSG,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A95.BUTTON,
      $.proxy(function(){},this),
      $.proxy(this._execUnBlock,this),
      $.proxy(this._cancelBlock,this),
      'confirmBlock'
    )

    // 차단해제
    // console.log(e.currentTarget.value, "해제")
    // this._execBlock(this.data[e.currentTarget.value], 'C');
  },

  _BlockThis: function(e) {
    e.stopPropagation();
    this.$li = this.$domWrapper.find('li').filter(function(){ return $(this).data('listId') === $(e.currentTarget).data('listId'); });
    this.blockData = this.data.cpHistories[$(e.currentTarget).data('listId')];
    // 차단하기
    this._popupService.openModalTypeA(
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.TITLE,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.MSG,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.BUTTON,
      $.proxy(function(){},this),
      $.proxy(this._execBlock,this),
      $.proxy(this._cancelBlock,this),
      'confirmBlock'
    )
    // this._execBlock(this.data[$(e.currentTarget).data('listId')], 'A');
  },

  _cancelBlock: function() {
    this._popupService.close();
  },

  _execBlock: function() {
    console.log('clickclick')
    this.$li.find('.btn-switch.type1').addClass('on');
    this._apiService.request(Tw.API_CMD.BFF_05_0082, {
      idpg: this.blockData.idpg,
      tySvc: this.blockData.tySvc,
      cpCode: this.blockData.cpCode,
      state: 'A'
    })
        .done($.proxy(this._successBlock, this))
        .fail($.proxy(this._failBlock,this));
  },

  _successBlock: function() {
    // 차단완료
    this._popupService.close();
    Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.BLOCK);
  },

  _execUnBlock: function() {
    console.log('uclickuclick')
    this.$li.find('.btn-switch.type1').removeClass('on');
    this._apiService.request(Tw.API_CMD.BFF_05_0082, {
      idpg: this.blockData.idpg,
      tySvc: this.blockData.tySvc,
      cpCode: this.blockData.cpCode,
      state: 'C'
    })
        .done($.proxy(this._successUnBlock, this))
        .fail($.proxy(this._failBlock,this));
  },

  _successUnBlock: function() {
    // 해제완료
    this._popupService.close();
    Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.REVOCATION);
  },

  _failBlock: function(e) {
    Tw.Logger.info(e);
  }

 
}