/**
 * @file myt-fare.bill.small.monthly.js
 * @author Lee kirim (kirim@sk.com)
 * @since 2018. 11. 29
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

  _cachedElement: function() {
    this.$domWrapper = this.$container.find('#fe-monthly-wrap'); 
    this.$template = {
      $monthContent: Handlebars.compile($('#fe-month-contents').html())
    };
  },

  _bindEvent: function() {

  }
 
};
