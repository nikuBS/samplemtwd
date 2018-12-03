/**
 * FileName: myt-fare.bill.small.monthly.js
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
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
      Object.assign(this.data,{
        useTipLink:'MF_06_01_03_tip_01' // 팁
      })
    );
    this.$domWrapper.append(renderedHTML);
    
  },

  _cachedElement: function() {
    this.$domWrapper = this.$container.find('#fe-monthly-wrap'); 
    this.$template = {
      $monthContent: Handlebars.compile($('#fe-month-contents').html()),
    };
  },

  _bindEvent: function() {

  }
 
}