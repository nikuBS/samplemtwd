/**
 * FileName: myt-fare.bill.contents.history.detail.js
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */
Tw.MyTFareBillSmallHitstoryDetail = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);
  this._popupService = Tw.Popup;
  this._params = Tw.UrlHelper.getQueryParams();

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillSmallHitstoryDetail.prototype = {
  _init: function() {
    this.rootPathName = this._historyService.pathname;

    var renderedHTML;
    
    this.detailData = this.data; //JSON.parse(Tw.CommonHelper.getLocalStorage('detailData'));
    
    if(this.detailData){
      renderedHTML = this.$template.$detailWrap(this.detailData);
      this.$domWrapper.append(renderedHTML);
    }
    // 곧바로 상세 url를 치고 들어와서 조회된 데이터가 없을 시 
    else{
      renderedHTML = this.$template.$emptyContent({});
      this.$domWrapper.after(renderedHTML);
      this.$domWrapper.hide();
    }
  },

  _cachedElement: function() {
    this.$domWrapper = this.$container.find('#fe-detail-wrap'); 
    this.$template = {
      $detailWrap: Handlebars.compile($('#fe-detail-contents').html()),
      $emptyContent: Handlebars.compile($('#fe-empty-contents').html())
    };
  },

  _bindEvent: function() {
    // 차단하기
    this.$domWrapper.find('#fe-btn-set-block').on('click',$.proxy(this._setBillBlock, this));
  
    // 차단내역으로 이동
    this.$domWrapper.find('#fe-btn-view-block').on('click',$.proxy(this._moveBlockList, this));
  },

  _moveBlockList: function() {
    this._historyService.goLoad('/myt-fare/bill/small/block');
  },

  // 차단하기
  _setBillBlock: function() {
    this._popupService.openModalTypeA(
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.TITLE,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.MSG,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.BUTTON,
      $.proxy(function(){},this),
      $.proxy(this._execBillBlock,this),
      $.proxy(this._cancelBillBlock,this),
      'confirmBlock'
    );
    // this.detailData
  },

  _execBillBlock: function() {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_05_0082, {
      idpg: this.detailData.idpg,
      tySvc: this.detailData.tySvc,
      cpCode: this.detailData.cpCode,
      state: 'A'
    })
        .done($.proxy(this._successBillBlock, this))
        .fail($.proxy(this._failBillBlock,this));
  },

  _cancelBillBlock: function() {
    this._popupService.close();
  },

  _successBillBlock: function(resq) {
    if(resq.code !== Tw.API_CODE.CODE_00) {
      this._failBillBlock(resq);
      return Tw.Error(resq.code, resq.msg).pop();
    }
    // 차단완료
    this._popupService.close();
    Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.BLOCK);
    // 
    $.extend(this.detailData,{
      cpState:'A1',
      blockState:Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TYPE.A1,
      isBlocked:true
    });
    // Tw.CommonHelper.setLocalStorage('detailData',JSON.stringify(this.detailData));

    this.$domWrapper.empty().append(this.$template.$detailWrap(this.detailData));
    this._bindEvent();
  },

  _failBillBlock: function(e) {
    Tw.Logger.info(e);
  }
 
};
