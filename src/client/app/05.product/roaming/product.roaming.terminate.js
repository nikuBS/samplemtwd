/**
 * @file product.roaming.terminate.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.06
 */
/**
 * @class
 * @desc 로밍 상품 해지 페이지
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} prodBffInfo – 상품 상세 정보
 * @param {String} prodTypeInfo - 상품 원장 정보
 * @param {String} prodId - 상품 id
 * @returns {void}
 */
Tw.ProductRoamingTerminate = function (rootEl,prodBffInfo,prodId,prodTypeInfo) {
  this.$rootContainer = rootEl;
  this._page = false;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$rootContainer);
  this._prodId = prodId;
  this._prodBffInfo = this._arrangeAgree(prodBffInfo);
  this._prodTypeInfo= prodTypeInfo;
  this._page = true;
  this.$mainContent = this.$rootContainer.find('.fe-main-content');
  this._init();
  this._bindPopupElementEvt();
  this._focusService = new Tw.InputFocusService(rootEl, this.$rootContainer.find('#do_confirm'));
};

Tw.ProductRoamingTerminate.prototype = {
  /**
   * @function
   * @member
   * @desc 초기화
   * @returns {void}
   */
  _init : function (){
    if(isNaN(this._prodBffInfo.preinfo.reqProdInfo.basFeeInfo)){
      this.$rootContainer.find('#showTex').hide();
    }else{
      this.$rootContainer.find('.tx-bold.vbl').text(this._convertPrice(this._prodBffInfo.preinfo.reqProdInfo.basFeeInfo));
    }
  },
  /**
   * @function
   * @member
   * @desc 이벤트 바인딩
   * @returns {void}
   */
  _bindPopupElementEvt : function () {
    this._$allAgreeElement = this.$rootContainer.find('.all.checkbox>input');
    this._$individualAgreeElement = this.$rootContainer.find('.individual.checkbox>input');
    this.$rootContainer.on('click','.agree-view',$.proxy(this._showDetailContent,this));
    this.$rootContainer.on('click','#do_confirm',$.proxy(this._doJoin,this));
    this.$rootContainer.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._doCancel,this));
    this.$rootContainer.on('click','.tip-view-btn',$.proxy(this._showBffToolTip,this));
    if(this._prodBffInfo.agreeCnt<=0){
      this.$rootContainer.find('#do_confirm').removeAttr('disabled');
      this.$rootContainer.find('.agree-element').hide();
    }else{
      if(this._prodBffInfo.agreeCnt<2){
        this.$rootContainer.find('.all-agree').hide();
      }else{
        this.$rootContainer.on('click','.all.checkbox>input',$.proxy(this._allAgree,this));
      }
      this.$rootContainer.on('click','.individual.checkbox>input',$.proxy(this._agreeCheck,this));
    }
  },
  /**
   * @function
   * @member
   * @desc 해지 취소 확인 팝업 출력
   * @returns {void}
   */
  _doCancel : function(evt){
    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A74.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A74.MSG,
      Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null,
      $.proxy(this._goPlan,this),
      $.proxy(this._resetAriaHidden,this),null,$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 약관 전체동의 실행 함수
   * @returns {void}
   */
  _allAgree : function(){
    var nowAllAgree = this._$allAgreeElement.attr('checked');
    for(var i=0;i<this._$individualAgreeElement.length;i++){
      if(nowAllAgree!==$(this._$individualAgreeElement[i]).attr('checked')){
        $(this._$individualAgreeElement[i]).trigger('click');
      }
    }
  },
  /**
   * @function
   * @member
   * @desc 개별약관 동의 실행 함수
   * @returns {void}
   */
  _agreeCheck : function () {
    var $joinBtn = this.$rootContainer.find('#do_confirm');
    for(var i=0;i<this._$individualAgreeElement.length;i++){
      if($(this._$individualAgreeElement[i]).attr('checked')!=='checked'){
        $joinBtn.attr('disabled','disabled');
        this._forceChange(this._$allAgreeElement,false);
        return;
      }
    }
    $joinBtn.removeAttr('disabled');
    this._forceChange(this._$allAgreeElement,'checked');
  },
  /**
   * @function
   * @member
   * @desc 약관 상태 강제 변환 함수
   * @param {Object} $element 약관 요소 jQuery 객체
   * @param {Object} value 변환할 값
   * @returns {void}
   */
  _forceChange : function ($element,value) {
    if(value==='checked'){
      if(!$element.parent().hasClass(value)){
        $element.parent().addClass(value);
      }
    }else{
      $element.parent().removeClass('checked');
    }
    $element.attr('checked',value==='checked'?true:false);
    $element.parent().attr('aria-checked',value==='checked'?true:false);
  },
  /**
   * @function
   * @member
   * @desc 해지 실행 확인 팝업 출력
   * @param {Object} evt 이벤트 객체
   * @returns {void}
   */
  _doJoin : function (evt) {
    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.MSG,
      Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null,
      $.proxy(this._confirmInfo,this,evt),
      $.proxy(this._resetAriaHidden,this),null,$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 해지 실행 함수
   * @param {Object} evt 이벤트 객체
   * @returns {void}
   */
  _confirmInfo : function (evt) {
    this._popupService.close();

    this._apiService.request(Tw.API_CMD.BFF_10_0086, {}, {},[this._prodId]).
    done($.proxy(function (res) {

      if(res.code===Tw.API_CODE.CODE_00){
        var completePopupData = {
          prodNm : this._prodBffInfo.preinfo.reqProdInfo.prodNm,
          processNm : Tw.PRODUCT_TYPE_NM.TERMINATE,
          isBasFeeInfo : this._convertPrice(this._prodBffInfo.preinfo.reqProdInfo.basFeeInfo),
          typeNm : Tw.NOTICE.ROAMING+' '+(this._prodTypeInfo.prodTypCd==='H_P'?Tw.PRODUCT_CTG_NM.PLANS:Tw.PRODUCT_CTG_NM.ADDITIONS),
          settingType : Tw.PRODUCT_TYPE_NM.TERMINATE,
          btnNmList : [Tw.ROAMING_JOIN_STRING.MY_ROAMING_STATE]
        };
        this._popupService.open({
            hbs: 'complete_product_roaming',
            layer: true,
            data : completePopupData
          },
          $.proxy(this._bindCompletePopupEvt,this),
          $.proxy(this._goPlan,this),
          'complete');
      }else{
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,
            $.proxy(this._resetAriaHidden,this),null,$(evt.currentTarget));
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,
          $.proxy(this._resetAriaHidden,this),null,$(evt.currentTarget));
    }, this));

  },
  /**
   * @function
   * @member
   * @desc 해지 완료 팝업 버튼 이벤트 바인딩
   * @param {Object} 가입 완료 팝업 element
   * @returns {void}
   */
  _bindCompletePopupEvt : function(popuEvt){
    $(popuEvt).on('click','.btn-round2',$.proxy(this._goMyInfo,this));
    $(popuEvt).on('click','.btn-floating',$.proxy(this._popupService.closeAll,this._popupService));
  },
  /**
   * @function
   * @member
   * @desc 나의 로밍 현황 확인
   * @returns {void}
   */
  _goMyInfo : function(){
    this._popupService.closeAllAndGo('/product/roaming/my-use');
  },
  /**
   * @function
   * @member
   * @desc 원장 이동 함수
   * @returns {void}
   */
  _goPlan : function(){
    this._popupService.closeAll();
    setTimeout($.proxy(this._historyService.goBack,this._historyService),0);
  },
  /**
   * @function
   * @member
   * @desc 약관 초기화 함수
   * @param {Object} data 약관 데이터
   * @returns {Object}
   */
  _arrangeAgree : function(data){
    var targetObj;
    data.agreeCnt = 0;
    targetObj = data.stipulationInfo;
    Object.keys(targetObj).map($.proxy(function(objectKey) {
      if(objectKey.indexOf('Ctt')>=0){
        targetObj[objectKey+'Tit'] = targetObj[objectKey].replace(/<([^>]+)>/ig,'');
        this.$rootContainer.find('.'+objectKey.replace('HtmlCtt','')+'.stext-c').text(targetObj[objectKey+'Tit']);
      }else if(objectKey.indexOf('AgreeYn')>=0){
        data.agreeCnt = targetObj[objectKey] === 'Y'?data.agreeCnt+1:data.agreeCnt;
      }
    },this));
    data.stipulationInfo = targetObj;
    return data;
  },
  /**
   * @function
   * @member
   * @desc 약관 내용 팝업 출력
   * @param {Object} targetEvt 이벤트 객체
   * @returns {void}
   */
  _showDetailContent : function (targetEvt) {
    var $currentTarget = $(targetEvt.currentTarget);
    this._nowShowAgreeType = $currentTarget.data('type');
    this._popupService.open({
      hbs: 'FT_01_03_L01',
      data: {
        title: $currentTarget.data('tit'),
        html: $currentTarget.data('txt')
      }
    },$.proxy(this._bindDetailAgreePopupEvt,this),
      $.proxy(this._resetAriaHidden,this), 'agree_pop',$currentTarget);
  },
  /**
   * @function
   * @member
   * @desc 약관 팝업 확인 버튼 이벤트 바인딩
   * @param {Object} popEvt 이벤트 객체
   * @returns {void}
   */
  _bindDetailAgreePopupEvt : function (popEvt){
    $(popEvt).on('click','.fe-btn_ok',$.proxy(this._detailAgreePopupEvt,this));
  },
  /**
   * @function
   * @member
   * @desc 약관 상세 내용 팝업 확인 버튼 이벤트
   * @param {Object} 이벤트 객체
   * @returns {void}
   */
  _detailAgreePopupEvt : function (){
    var $agreeElement = this.$rootContainer.find('input.'+this._nowShowAgreeType);
    $agreeElement.trigger('click');
    $agreeElement.promise().done($.proxy(function(){
      setTimeout($.proxy(this._historyService.goBack,this._historyService),300);
    },this));
  },
  /**
   * @function
   * @member
   * @desc 가격 "원" or "무료" 처리
   * @param {String} priceVal 상품 가격
   * @returns {String}
   */
  _convertPrice : function (priceVal) {
    if(!isNaN(priceVal)){
      priceVal = Tw.FormatHelper.addComma(priceVal)+Tw.CURRENCY_UNIT.WON;
    }
    return priceVal;
  },
  /**
   * @function
   * @member
   * @desc bff서버에서 내려오는 상품 이용시 유의사항 출력 함수
   * @param {Object} evt 이벤트 객체
   * @returns {void}
   */
  _showBffToolTip : function (evt) {
    var $target = $(evt.currentTarget);
    var tooltipData = $target.data();
    console.log(tooltipData.txt);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'popup',
      'title': tooltipData.tit,
      'btn-close':'btn-tooltip-close tw-popup-closeBtn',
      'title_type': 'tit-tooltip',
      'cont_align': 'tl',
      'tagStyle-div': 'div',
      'contents': tooltipData.txt,
      'tooltip': 'tooltip-pd'
    },null,$.proxy(this._resetAriaHidden,this),null,$target);
  },
  /**
   * @function
   * @member
   * @desc 접근성 검사 관련 함수
   * @returns {void}
   */
  _resetAriaHidden : function () {
    this.$mainContent.attr('aria-hidden',false);
  }
};
