/**
 * @file [소액결제-월별내역]
 * @author Lee kirim
 * @since 2018-11-29
 */

 /**
 * @class 
 * @desc 월별내역 리스트를 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.bill.small.monthly.controlloer.ts 로 부터 전달되어 온 정보
 */
Tw.MyTFareBillSmallMonthly = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  
  this._apiService = Tw.Api;

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillSmallMonthly.prototype = {
  /**
   * @function
   * @desc 데이터 렌더링
   */
  _init: function() {
    var renderedHTML;
    
    renderedHTML = this.$template.$monthContent(
      $.extend(this.data, {
        userTipID:'MF_06_01_03', // 팁 화면 아이디
        useTipLink:'MF_06_01_03_tip_01' // 팁
      })
    );
    this.$domWrapper.append(renderedHTML);
    
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.bill.small.monthly.html 참고
   */
  _cachedElement: function() {
    this.$domWrapper = this.$container.find('#fe-monthly-wrap'); 
    this.$template = {
      $monthContent: Handlebars.compile($('#fe-month-contents').html())
    };
  },

  _bindEvent: function() {

  }
 
};
