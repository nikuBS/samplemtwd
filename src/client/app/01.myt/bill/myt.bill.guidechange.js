/**
 * FileName: myt.bill.guidechange.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
Tw.MyTBillGuidechange = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._bindEvent();
};

Tw.MyTBillGuidechange.prototype = {
  _bindEvent: function () {
      this.$container.on('click','.swiper-slide', $.proxy(this._changeFlicking,this) );
      this.$container.on('click','._sel-preview', $.proxy(this._openPreview, this) );
      // this.$container.on('click','._sel-preview', $.proxy(this._openPreview, this, {'test':'hello'}) );
  },

  // 하단 안내서 플리킹 클릭 이벤트
  _changeFlicking : function(e){
      // Tw.Logger.log('[## TEST] ', '_changeFlicking call' );
      this.billType = $(e.currentTarget).data('billType');
      this.$container.find('._sel-desc').text(this.billType.desc);
      this.$container.find('._sel-nm').text(this.billType.chgBtnNm);
  },
  
  // 미리보기 클릭 이벤트
  _openPreview : function () {
      // Tw.Logger.log('[## TEST] ', 'preview call ', JSON.stringify(billList) );
      this._popupService.open({
          hbs:'MY_03_03_01_L01',
          data : {}
      }, $.proxy(this._test,this));
  },

};