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

    for( var i=1; i<14; i++){
      $('#center'+i).hide();
    }
    $('#center1').show();
    this.presentId = 1;

  },

  _cachedElement: function() {
    this.$btnPopupClose = this.$container.find('.widget');
    this.$btnDropdown = this.$container.find('.cont-box > #flab04');
  },

  _bindEvent: function() {
    this.$btnPopupClose.on('click', $.proxy(this._goRoamingGuide, this));
    this.$btnDropdown.on('click', $.proxy(this._openActionsheet, this));
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
        this.presentId = j;
      }else{
        $('#center'+j).hide();
      }
    }

  },

  _openActionsheet: function (e) {
    var selected = e.target;
    var data = '';

    if(this.presentId === 1 || this.presentId === 2){
      data = Tw.POPUP_TPL.ROAMING_INFO_CENTER[0].data;
    }else if(this.presentId === 3 || this.presentId === 4){
      data = Tw.POPUP_TPL.ROAMING_INFO_CENTER[1].data;
    }else if(this.presentId === 7 || this.presentId === 8){
      data = Tw.POPUP_TPL.ROAMING_INFO_CENTER[2].data;
    }else if(this.presentId === 10 || this.presentId === 11){
      data = Tw.POPUP_TPL.ROAMING_INFO_CENTER[3].data;
    }

    var currentCenter = $(selected).text();

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetOpened, this, currentCenter)
    );

  },

  _onActionSheetOpened: function (currentCenter, $layer) {
    $('li.type1').each(function(){
      if($(this).find('label').text().trim() === currentCenter){
        $(this).find('input[type=radio]').prop('checked', true);
      }
    })
    $layer.find('[name="r2"]').on('click', $.proxy(this._onSelectCenter, this));

    // 닫기 버튼 클릭
    $layer.one('click', '#fe-back', this._popupService.close);
  },

  _onSelectCenter: function (e) {
    var centerId = Number($(e.target).parents('label').attr('id'));

    for(var k=1; k<=14; k++){
      if(k === centerId){
        $('#center'+k).show();
        this.presentId = k;
      }else{
        $('#center'+k).hide();
      }
    }

    this._popupService.close();
  }

};
