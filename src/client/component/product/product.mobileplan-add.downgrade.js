/**
 * @file product.mobileplan-add.downgrade.js
 * @author kwon.junho (jihun202@sk.com)
 * @since 2019-04-18
 */

/**
 * @class Tw.ProductMobilePlanAddDowngrade
 * @desc 상품 > 요금제 > DG방어
 * @see 
 */
Tw.ProductMobilePlanAddDowngrade = function(rootEl, data, openEvent, confirmCallback, elseCallback){
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._bpcpService = Tw.Bpcp;
  this._xTractorService = new Tw.XtractorService(rootEl);

  this._data = data;
  this._openEvent = openEvent;
  this._confirmCallback = confirmCallback;
  this._elseCallback = elseCallback;
  this._2depthPopup = false;
  this._optionPopup = false;
  this._3depthPopup = false;
  this._prodPrType = this._getProdType();

  if(!this._hasDowngrade()){
    this._elseCallback();
    return;
  }
  this._before();
}

Tw.ProductMobilePlanAddDowngrade.prototype = {

    /**
     * @function
     * @desc 다운그레이드 방어 설정이 존재하는지 확인함
     * @return string - 다운그레이드 사용여부
     */
    _hasDowngrade: function(){
        return !!this._prodPrType;
    },

    /**
     * @function
     * @desc 다운그레이드 방어 설정명 조회
     * @return string - 다운그레이드 팝업 설정명
     */
    _getProdType: function(){
        for(var key in Tw.PRODUDT.PROMOTIONS){
            var promotion = Tw.PRODUDT.PROMOTIONS[key];

            if((promotion.PRODS||{})[this._data.prodId] && promotion.USED === 'Y'){
                return key;
            }
        }
        return null;
    },

    /**
     * @function
     * @desc 다운그레이드 방어에 필요한 데이터를 조회함
     * @return $.Deferred
     */
    _before: function(){
        var promotion = Tw.PRODUDT.PROMOTIONS[this._prodPrType];
        var data = this._data;
        $.when.apply($,
            promotion.BEFORE.map(function(e){
                var def = $.Deferred();
                e(data, def);
                return def.done(function(res){
                    $.extend(data, res);
                });
            })
        ).done($.proxy(this._when, this));
    },

    /**
     * @function
     * @desc 다운그레이드 방어 방식을 조회함
     */
    _when: function(){
        var promotion = Tw.PRODUDT.PROMOTIONS[this._prodPrType];
        var data = this._data;
        var dwonGradeType;
        for(var i = 0 ; i < promotion.WHEN.length; i++){
            var when = promotion.WHEN[i];
            dwonGradeType = when(this._data);
            if(dwonGradeType){
                break;
            }
        }
        
        if(dwonGradeType){
            (promotion.EXTEND||[]).forEach(function(e){
                $.extend(data, e(data));
            })
            this._then(dwonGradeType)
        }else{
            this._confirmCallback();
            //this._elseCallback();
        }

    },

    /**
     * @function
     * @desc 다운그레이드 방어를 실행함
     */
    _then: function(dwonGradeType){
        var promotion = Tw.PRODUDT.PROMOTIONS[this._prodPrType];
        var data = this._data;

        var actionType = promotion.THEN[dwonGradeType];

        if(actionType.action === 'POPUP'){
            this._popupService.open({
                hbs: actionType.hbs,
                titleNm: actionType.titleNm,
                xt: this._data.xt,
                titleClass: 'no-header color-type-CUSTOM',
                layer: true,
                cdn: Tw.Environment.cdn
            }, $.proxy(this._bindEventContentsPopup, this), $.proxy(this._onContentsClose, this), 'dg_contents', this._openEvent);
        }else if(actionType.action === 'POPUP2'){
            this._2depthPopup = false;
            this._optionPopup = false;
            this._popupService.open({
                hbs: actionType.hbs1,
                titleNm: actionType.titleNm1,
                xt: this._data.xt,
                titleClass: 'no-header color-type-CUSTOM',
                layer: true,
                cdn: Tw.Environment.cdn
            }, $.proxy(function($popupContainer){
                $popupContainer.on('click', '.fe-btn_close', $.proxy(this._onNextDepth, this, $popupContainer));
                $popupContainer.on('click', '.fe-btn_option', $.proxy(this._onOptionDepth, this, $popupContainer));
                $popupContainer.on('click', '.fe-btn_change', $.proxy(this._onChange, this));
                this._bindEvent($popupContainer);
                new Tw.XtractorService($popupContainer, true);
            }, this), $.proxy(this._dgSuccess, this, actionType), 'dg_1depth_contents', this._openEvent);

        }else if(actionType.action === 'POPUP3'){
            this._2depthPopup = false;
            this._optionPopup = false;
            this._3depthPopup = false;
            this._popupService.open({
                hbs: actionType.hbs1,
                titleNm: actionType.titleNm1,
                xt: this._data.xt,
                titleClass: 'no-header color-type-CUSTOM',
                layer: true,
                cdn: Tw.Environment.cdn
            }, $.proxy(function($popupContainer){
                $popupContainer.on('click', '.fe-btn_close', $.proxy(this._onNextDepth, this, $popupContainer));
                $popupContainer.on('click', '.fe-btn_option', $.proxy(this._onOptionDepth, this, $popupContainer));
                $popupContainer.on('click', '.fe-btn_3depth', $.proxy(this._on3depthDepth, this, $popupContainer));
                $popupContainer.on('click', '.fe-btn_change', $.proxy(this._onChange, this));
                this._bindEvent($popupContainer);
                new Tw.XtractorService($popupContainer, true);
            }, this), $.proxy(this._dgSuccess, this, actionType), 'dg_1depth_contents', this._openEvent);

        }
    },

    /**
     * @function
     * @desc 팝업이 2뎁스일경우 2뎁스 팝업을 호출함 or 옵션선택 팝업일 경우 호출함
     * @return $.Deferred
     */
    _dgSuccess: function(actionType) {
        if(this._2depthPopup){            
            setTimeout( $.proxy(function(){
                this._popupService.open({
                    hbs: actionType.hbs2,
                    titleNm: actionType.titleNm2,
                    titleClass: 'no-header color-type-CUSTOM',
                    layer: true,
                    cdn: Tw.Environment.cdn,
                    xt: this._data.xt
                }, $.proxy(this._bindEventContentsPopup, this), $.proxy(this._onContentsClose, this), 'dg_2depth_contents', this._openEvent);
            } , this), 500);
        }
        if(this._optionPopup){            
            setTimeout( $.proxy(function(){
                this._popupService.open({
                    hbs: actionType.hbs3,
                    titleNm: actionType.titleNm3,
                    titleClass: 'no-header color-type-CUSTOM',
                    layer: true,
                    cdn: Tw.Environment.cdn,
                    xt: this._data.xt
                }, $.proxy(function($popupContainer){
                    $popupContainer.on('click', '.fe-btn_3depth', $.proxy(this._on3depthDepth, this, $popupContainer));
                    $popupContainer.on('click', '.fe-btn_change', $.proxy(this._onChange, this));
                    this._bindEvent($popupContainer);
                    new Tw.XtractorService($popupContainer, true);
                }, this), $.proxy(this._dgSuccess2, this, actionType), 'dg_option_contents', this._openEvent);
            } , this), 500);
        }
    },

    /**
     * @function
     * @desc 팝업이 3뎁스일경우 3뎁스 팝업을 호출함
     * @return $.Deferred
     */
    _dgSuccess2: function(actionType) {
        if(this._3depthPopup){            
            setTimeout( $.proxy(function(){
                this._popupService.open({
                    hbs: actionType.hbs4,
                    titleNm: actionType.titleNm4,
                    titleClass: 'no-header color-type-CUSTOM',
                    layer: true,
                    cdn: Tw.Environment.cdn,
                    xt: this._data.xt
                }, $.proxy(this._bindEventContentsPopup, this), $.proxy(this._onContentsClose, this), 'dg_3depth_contents', this._openEvent);
            } , this), 500);
        }
    },

    /**
     * @function
     * @desc OK캐쉬백 지급 안내 팝업
     */
    _okCashbag: function(){
            this._popupService.open({
                hbs: 'RO_3_7',
                titleClass: 'no-header color-type-CUSTOM',
                layer: true,
                cdn: Tw.Environment.cdn
            }, $.proxy(this._bindEventContentsPopup, this), $.proxy(this._onContentsClose, this), 'dg_okcashbag_contents', this._openEvent);
    },

    /**
     * @function
     * @desc 이벤트 바인딩 - 최종 팝업에 대한 이벤트 바인딩
     * @param $popupContainer - 팝업 레이어
     */
    _bindEventContentsPopup: function($popupContainer) {
      $popupContainer.on('click', '.popup-closeBtn', $.proxy(this._onClose, this));
      $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._onClose, this));
      this.$contentsPopup = $popupContainer;
      this._bindEvent($popupContainer);
      new Tw.XtractorService($popupContainer);
    },

    /**
     * @function
     * @desc 이벤트 바인딩
     * @param $popupContainer - 팝업 레이어
     */
    _bindEvent: function($popupContainer) {
      $popupContainer.on('click', '.fe-btn_change', $.proxy(this._onChange, this));
      $popupContainer.on('click', '.fe-btn-link', $.proxy(this._onLink, this, $popupContainer));
      $popupContainer.on('click', '.fe-btn-linkProduct', $.proxy(this._onLinkProduct, this, $popupContainer));
      $popupContainer.on('click', '.fe-btn_close', $.proxy(this._onClose, this));
      $popupContainer.on('click', '.fe-btn_okcashbag', $.proxy(this._okCashbag, this));
      $popupContainer.on('click', '.bt-link-tx', $.proxy(this._onClickCharge, this));
      $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._onClose, this));
      this.$optionSelect = this.$container.find('.option-select');
    },

    /**
     * @function
     * @desc 과금 팝업 오픈 후 외부 브라우저 랜딩 처리
     * @param $event 이벤트 객체
     * @return {void}
     * @private
     */
    _onClickCharge: function ($event) {
        var url = $($event.currentTarget).data('url');
        if ( Tw.BrowserHelper.isApp() ) {
            Tw.CommonHelper.showDataCharge($.proxy(this._onClickExternal, this, $event));
        }else{
            Tw.CommonHelper.openUrlExternal(url);
        }
    },

    /**
     * @function
     * @desc 외부 브라우저 랜딩 처리
     * @param $event 이벤트 객체
     * @return {void}
     * @private
     */
    _onClickExternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
    },

    /**
     * @function
     * @desc 1뎁스 팝업을 종료하고 2뎁스 팝업을 생성할경우
     * @return $.Deferred
     */
    _onNextDepth: function($popupContainer) {
        this._2depthPopup = true;
        $popupContainer.find('.popup-closeBtn').trigger('click');
    },

    /**
     * @function
     * @desc 1뎁스 팝업을 종료하고 상품변경옵션 팝업을 생성할경우
     * @return $.Deferred
     */
    _onOptionDepth: function($popupContainer) {
        this._optionPopup = true;
        $popupContainer.find('.popup-closeBtn').trigger('click');
    },

    /**
     * @function
     * @desc 상품변경옵션 팝업을 종료하고 3뎁스 팝업을 생성할경우
     * @return $.Deferred
     */
    _on3depthDepth: function($popupContainer) {
        this._3depthPopup = true;
        $popupContainer.find('.popup-closeBtn').trigger('click');
    },

    /**
     * @function
     * @desc 이벤트 바인딩
     * @param $popupContainer - 팝업 레이어
     * @param e - 이벤트 요소
     */
    _onLink: function($popupContainer, e){
        e.preventDefault();
        var $link = $(e.currentTarget);
        var link = $link.attr('href');

        if (this._bpcpService.isBpcp(link)) {
          return this._bpcpService.open(link, this._data.svcMgmtNum, null);
        } else if (link.indexOf('http') !== -1) {
          Tw.CommonHelper.openUrlExternal(link);
        } else {
          window.location.href = link ;
        }
    },

    /**
     * @function
     * @desc 이벤트 바인딩
     * @param $popupContainer - 팝업 레이어
     * @param e - 이벤트 요소
     */
    _onLinkProduct: function($popupContainer, e){
        e.preventDefault();
        var $link = $(e.currentTarget);
        var link = $link.attr('href');
        var selectedProduct = this.$optionSelect.filter(':checked').val();
   
          window.location.href = link+selectedProduct ;
    },

    /**
     * @function
     * @desc DG 방어를 무시할경우 스텝을 실행함
     */
    _onChange: function(){
        this._2depthPopup = false;
        this._confirmCallback();
    },

    /**
     * @function
     * @desc 최종 팝업을 닫을때 모든 팝업을 정리함
     */
    _onContentsClose: function() {  
        
      this._popupService.close();
    },

    /**
     * @function
     * @desc 다음에 할게요. 클릭 시 요금제 리스트로 이동
     */
    _onClose: function() {
      this._popupService.closeAll();
    },


    /**
     * @function
     * @desc 팝업 내 Context 에 데이터 replace
     * @param context - hbs Context
     * @returns {*}
     */
    _replaceData: function(context) {
      context = context.replace(/{{name}}/gi, this._mbrNm);
      return context;
    }
}
