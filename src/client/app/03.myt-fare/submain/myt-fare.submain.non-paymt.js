/**
 * FileName: myt-fare-submain.non-paymt.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.02
 *
 */

Tw.MyTFareSubMainNonPayment = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.data = params.data;
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.MyTFareSubMainNonPayment.prototype = {

  _rendered: function () {
    if ( this.data.possibleDay ) {
      // 납부가능일 선택
      this.$day = this.$container.find('[data-id=day]');
    }
    if ( this.data.suspension ) {
      // 이용정지 해제
      this.$susp = this.$container.find('[data-id=susp]');
    }
  },

  _bindEvent: function () {
    if ( this.data.possibleDay ) {
      this.$day.on('click', $.proxy(this._onClickedDay, this));
    }
    if ( this.data.suspension ) {
      this.$susp.on('click', $.proxy(this._onClickedSuspension, this));
    }
  },

  _onClickedDay: function() {
    // TODO: 화면작업 후 처리
  },

  _onClickedSuspension: function() {
    // TODO: publishing 완료 후 작업
    //this._popupService.openModalTypeA()
  }
};
