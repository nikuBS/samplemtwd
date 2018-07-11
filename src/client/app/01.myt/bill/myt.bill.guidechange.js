/**
 * FileName: myt.bill.guidechange.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
Tw.MyTBillGuidechange = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._popupService = Tw.Popup;
  this._bindEvent();
};

Tw.MyTBillGuidechange.prototype = {
  _bindEvent: function () {
      // 하단 안내서 플리킹 클릭 이벤트
      this.$container.on('click','.swiper-slide', $.proxy(this._changeFlicking,this) );
      this.$container.on('click','._sel-preview', $.proxy(this._openPreview,this) );
  },

  _changeFlicking : function(e){
      var billType = $(e.currentTarget).data('billType');
      // Tw.Logger.log('[## TEST] ', $(e.currentTarget).attr('class') );
      this.$container.find('._sel-desc').text(billType.desc);
      this.$container.find('._sel-nm').text(billType.chgBtnNm);
  },
  
  // 미리보기 클릭_
  _openPreview : function (e) {
      Tw.Logger.log('[## TEST] ', $(e.currentTarget).attr('class') );
      this._popupService.open({
          hbs:'MY_03_03_01_L01'// hbs의 파일명
      });
  }  


};