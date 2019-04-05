/**
 * @file myt-fare.bill.contents.monthly.js
 * @author Lee kirim (kirim@sk.com)
 * @since 2018. 11. 29
 */
Tw.MyTFareBillContentsMonthly = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  
  this._apiService = Tw.Api;

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillContentsMonthly.prototype = {
  _init: function() {
    var renderedHTML;
    
    renderedHTML = this.$template.$monthContent(
      $.extend(this.data, {
        useTipID: 'MF_07_01_02', // 팁 아이디
        useTipLink: 'MF_07_01_02_tip_01' // 팁
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
