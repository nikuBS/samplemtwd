/**
 * @file product.roaming.fi.guide.js
 * @desc T로밍 > baro Box 임대
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.11.07
 */

Tw.ProductRoamingFiGuide = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiGuide.prototype = {

  _cachedElement: function() {
    this.$btnInquire = this.$container.find('#inquire-btn');
    this.$btnReservation = this.$container.find('#reservation-btn');
    this.$btnProduct = this.$container.find('.product-infolink');
    this.$btnDataPopup = this.$container.find('.data-popup-btn');
    this.$dataPopup = this.$container.find('#data-popup');
    this.$popfocus = this.$container.find('#pop_focus');  //웹접근성
    
  },

  _bindEvent: function() {
    this.$btnInquire.on('click', $.proxy(this._goInquire, this));
    this.$btnReservation.on('click', $.proxy(this._goReservation, this));
    this.$btnProduct.on('click', $.proxy(this._goProductPage, this));
    this.$btnDataPopup.on('click', $.proxy(this._togglePopup, this));

    this.$container.on('click', 'button[id=flab07]', $.proxy(this._clickCountry, this));  //국가선택팝업 표시버튼
    this.$container.on('click', 'button[id=flab06]', $.proxy(this._openProdTypePop, this)); //국가선택팝업 / 바로박스상품 선택 리스트팝업

    this.$popfocus.on('click', $.proxy(this._popfocus, this));
    //웹접근성 레프트 gnb 슬라이딩 메뉴, 닫기  
    this.$container.find('#common-menu button#fe-close').on('click', $.proxy(this._closeGnb, this)); 
  },

  //웹접근성 
  //로밍 메인에서 gnb 메뉴 닫기 클릭시 햄버거에 focus    
  _closeGnb: function() {
    setTimeout(function () {
      $("a.icon-gnb-menu").focus();
    },300);  
 },
 
  /**
   * @function
   * @desc baro Box 예약 페이지 이동
   * @private
   */
  _goReservation: function() {
    this._historyService.goLoad('/product/roaming/fi/reservation');
  },

  /**
   * @function
   * @desc baro Box 조회/취소 페이지 이동
   * @private
   */
  _goInquire: function() {
    this._historyService.goLoad('/product/roaming/fi/inquire');
  },

  /**
   * @function
   * @desc baro Box 이용 가능 요금제 상세 페이지 이동
   * @param e - event 객체
   * @private
   */
  _goProductPage: function(e) {
    //baro Box 이용 가능 요금제 상세 페이지 이동
    var productId = $(e.target).parents('button').attr('id') === undefined ? $(e.target).attr('id') : $(e.target).parents('button').attr('id');
    this._historyService.goLoad('/product/callplan?prod_id=' + productId);
  },

  /**
   * @function
   * @desc 데이터 사용 예시 팝업 토글
   * @private
   */
  _togglePopup: function() {
    this.$dataPopup.toggle();

    setTimeout(function(){  //웹접근성
      $('#pop_focus').focus();
    },500)

  },

  /**
   * @desc  웹접근성 데이터 사용 팝업시  focus
   */
  _popfocus: function() {
    setTimeout(function(){
      $('#data-popup h1').focus();
    },500)
  },

  _reload: function() {
    this._historyService.reload();
  },  
  _clickCountry: function(e){
    var selected = e.target;
    var data = [];
    this._popupService.open({
        hbs: 'RM_14_01_01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetCountryOpened, this, selected, 'test'), null, null, $(e.currentTarget)
    );
  },
  _onActionSheetCountryOpened: function($root,a,b){
  },

    /**
   * @function
   * @desc 국가선택 / barobox 상품선택 Action Sheet Open
   * @param e
   * @private
   */
  _openProdTypePop : function(e){
    var selected = e.target;
    var data = [];

    //상품 선택 --jgmik 임시
    data = Tw.POPUP_TPL.ROAMING_FI_PRODUCT;
    var baroboxProdNm = $(selected).text();
  //  console.log("baroboxProdNm>>", baroboxProdNm);

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetOpened, this, selected, baroboxProdNm), null, null, $(e.currentTarget)
    );


  },  
  /**
   * @function
   * @desc 수령 장소 선택, 반납 장소 선택 Action Sheet Open Callback
   * @param selected
   * @param currentCenter - 선택한 장소 명
   * @param $layer
   * @private
   */
  _onActionSheetOpened: function (selected, currentCenter, $layer) {

    $('li.type1').each(function(){
      if($(this).find('label').attr('value') === currentCenter){
        $(this).find('input[type=radio]').prop('checked', true);
      }
    });
    $layer.find('[name="r2"]').on('click', $.proxy(this._onActionSelected, this, selected));

    // 닫기 버튼 클릭
    $layer.one('click', '#fe-back', this._popupService.close);


  },
 /**
   * @function
   * @desc 수령 장소 선택, 반납 장소 선택 Action Sheet 값 선택
   * @param selected
   * @param e
   * @private
   */
  _onActionSelected: function (selected, e) {

    var text = $(e.target).parents('label').attr('value');
    var baroboxProdTypeCd = $(e.target).parents('label').attr('baroboxProdTypeCd');

    $(selected).text(text); 
    $(selected).attr('baroboxProdTypeCd',baroboxProdTypeCd);
  //  console.log('prodNm=>'+text+' , cd=>'+baroboxProdTypeCd );
    this._changeCountry( baroboxProdTypeCd );

    this._popupService.close();
  },
  _changeCountry: function(prodType){
    $("#areaGlobal").hide();
    $("#areaJapan").hide();
    $("#areaUsa").hide();
    $("#areaAsia").hide();
    if(prodType == 'global'){
      $("#areaGlobal").show();
    }else if(prodType == 'japan'){
      $("#areaJapan").show();
    }else if(prodType == 'usa'){
      $("#areaUsa").show();
    }else if(prodType == 'asia'){
      $("#areaAsia").show();
    }
  },
};
