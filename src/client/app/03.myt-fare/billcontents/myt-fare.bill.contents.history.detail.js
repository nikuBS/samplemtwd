/**
 * FileName: myt-fare.bill.contents.history.detail.js
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */
Tw.MyTFareBillContentsHitstoryDetail = function (rootEl, data) {
  this.$container = rootEl;
  
  this._historyService = new Tw.HistoryService(rootEl);
  
  this._params = Tw.UrlHelper.getQueryParams();

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillContentsHitstoryDetail.prototype = {
  _init: function() {
    var renderedHTML;
    this.detailData = JSON.parse(Tw.UIService.getLocalStorage('detailData'));
    
    if(this.detailData){
      renderedHTML = this.$template.$detailWrap(this.detailData);
      this.$domWrapper.append(renderedHTML);
    }
    // 곧바로 상세 url를 치고 들어와서 조회된 데이터가 없을 시 
    else{
      renderedHTML = this.$template.$emptyContent({});
      this.$domWrapper.after(renderedHTML);
      this.$domWrapper.hide();
    }
  },

  _cachedElement: function() {
    this.$domWrapper = this.$container.find('#fe-detail-wrap'); 
    this.$template = {
      $detailWrap: Handlebars.compile($('#fe-detail-contents').html()),
      $emptyContent: Handlebars.compile($('#fe-empty-contents').html())
    };
  },

  _bindEvent: function() {

  }
 
}