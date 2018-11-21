/**
 * FileName: product.roaming.info.center.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.12
 */

Tw.ProductRoamingInfoCenter = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductRoamingInfoCenter.prototype = {
  _init: function() {
    for( var i=1; i<=14; i++){
      $('#center'+i).hide();
    }
    $('#center1').show();
  },

  _cachedElement: function() {
    this.$btnPopupClose = this.$container.find('.widget');
    this.$btnDropdown = this.$container.find('.cont-box > #flab04');
  },

  _bindEvent: function() {
    this.$btnPopupClose.on('click', $.proxy(this._goRoamingGuide, this));
    this.$btnDropdown.on('click', $.proxy(this._openTypeSelectPopup, this));
  },

  _goRoamingGuide: function(e) {
    var centerArr = Tw.ROAMING_CENTER;
    var selectCenter;

    for(var i=0; i<centerArr.length; i++){
      if( e.target.title === centerArr[i]){
        selectCenter = i+1;
      }
    }

    for(var j=1; j<=14; j++){
      if(j === selectCenter){
        $('#center'+j).show();
      }else{
        $('#center'+j).hide();
      }
    }

  },

  _openTypeSelectPopup: function () {
    //팝업 타입 및 데이터 추가 필요
  },

  _onOpenChoicePopup: function () {
    //$layer.on('click', '.popup-choice-list', $.proxy(this._onSelectBillGuideType, this, $target));
  },

  _reload: function() {
    this._historyService.reload();
  }

};
