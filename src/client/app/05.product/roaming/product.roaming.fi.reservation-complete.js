/**
 * @file product.roaming.fi.reservation-complete.js
 * @desc T로밍 > baro Box 예약 완료 페이지
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.11.16
 */

Tw.ProductRoamingFiReservationComplete = function(rootEl,resData,cdn) {
  this.resData = JSON.parse(window.unescape(resData));
  this.$container = rootEl;
  this.cdn =cdn;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductRoamingFiReservationComplete.prototype = {

  _cachedElement: function() {
    this.$btnGoInquire = this.$container.find('#fe-go-inquire');
    this.$btnOk = this.$container.find('#fe-ok');
  },

  _bindEvent: function() {
    this.$btnGoInquire.on('click', $.proxy(this._goRoamingFiInquire, this));
  //  this.$btnOk.on('click', $.proxy(this._goRoamingFiInquire, this));
  },

  /**
   * @function
   * @desc T파이 임대 화면으로 이동
   * @private
   */
  _goRoamingFiInquire: function() {
    this._historyService.replaceURL('/product/roaming/fi/inquire'); // 히스토리를 남기지 않기 위해 replaceURL 사용
  },
  /**
   * @function
   * @desc T파이 임대 화면으로 이동
   * @private
   */
  _goRoamingFiInquire: function() {
    this._historyService.replaceURL('/product/roaming/fi/inquire'); // 히스토리를 남기지 않기 위해 replaceURL 사용
  },
  _init: function(){
    var info =Tw.ROAMING_RECEIVE_CODE[this.resData.rentInfo.boothCd];
    $("#fe-officehour").html(  info.officeHour);
    $("#fe-centerNm").html(info.name);
    $("#fe-centerImg").attr('src',this.cdn+'/img/product/'+info.img+'.png');
    $("#fe-centerImg").attr('alt',info.name);
  }
};
