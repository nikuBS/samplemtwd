/**
 * @file myt-fare.bill.small.block.js
 * @author Lee kirim (kirim@sk.com)
 * @since 2018. 11. 29
 */
Tw.MyTFareBillSmallBlock = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  
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
    this.$domWrapper.find('.on-tx').on('click',$.proxy(this._UnBlockThis,this)); // 해제하기
    // 차단하기는 리스트에서 해제된 내역 불러와 지지 않으므로 토글 할 수 없음
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
    );
  },

  _cancelBlock: function() {
    this._popupService.close();
  },
  
  _execUnBlock: function() {
    this.$li.find('.btn-switch.type1').removeClass('on');
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_05_0082, {
      idPg: this.blockData.idpg,
      tySvc: this.blockData.tySvc,
      cpCode: this.blockData.cpCode,
      state: 'C'
    })
        .done($.proxy(this._successUnBlock, this))
        .fail($.proxy(this._failBlock,this));
  },

  _successUnBlock: function(resq) {
    if(resq.code !== Tw.API_CODE.CODE_00) {
      this._failBlock(resq);
      Tw.Error(resq.code, resq.msg).pop();
      this.$li.find('.btn-switch.type1').addClass('on');
    } else {
      // 해제완료
      Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.REVOCATION);
      this.$li.remove();
      //  데이터 변경
      this.data.payHistoryCnt = parseFloat(this.data.payHistoryCnt) - 1;
      this.$container.find('.ti-caption-gray .num em').text(this.data.payHistoryCnt);
      // 0건이 되면
      if(!this.data.payHistoryCnt) {
        this.$domWrapper.append(this.$template.$emptyList());
      }
    }
  },

  _failBlock: function(e) {
    Tw.Logger.info(e);
  }

 
};
