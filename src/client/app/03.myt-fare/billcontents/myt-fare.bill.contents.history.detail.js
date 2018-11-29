/**
 * FileName: myt-fare.bill.contents.history.detail.js
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */
Tw.MyTFareBillContentsHitstoryDetail = function (rootEl, data) {
  this.$container = rootEl;
  
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
  this._urlHelper = Tw.UrlHelper;

  this._params = this._urlHelper.getQueryParams();

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillContentsHitstoryDetail.prototype = {
  _init: function() {
    var renderedHTML;
    this.detailData = JSON.parse(Tw.UIService.getLocalStorage('detailData'));
    console.log(this.detailData);
    renderedHTML = this.$template.$detailWrap(this.detailData);
    this.$domWrapper.append(renderedHTML);
  },

  _cachedElement: function() {
    this.$domWrapper = this.$container.find('#fe-detail-wrap'); 
    this.$template = {
      $detailWrap: Handlebars.compile($('#fe-detail-contents').html())
    };
  },

  _bindEvent: function() {

  }
 
}