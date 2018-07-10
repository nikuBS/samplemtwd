/**
 * FileName: myt.bill.guidechange.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
Tw.MyTBillGuidechange = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._bindEvent();
};

Tw.MyTBillGuidechange.prototype = {
  _bindEvent: function () {
      // 하단 안내서 플리킹 클릭 시 이벤트
      this.$container.on('click','.swiper-slide', $.proxy(this._changeFlicking,this) );
  },

  _changeFlicking : function(e){
      var billType = $(e.currentTarget).data('billType');
      // Tw.Logger.log('[## TEST] ', $(e.currentTarget).attr('class') );
      this.$container.find('._sel-desc').text(billType.desc);
      this.$container.find('._sel-nm').text(billType.chgBtnNm);
  }


};