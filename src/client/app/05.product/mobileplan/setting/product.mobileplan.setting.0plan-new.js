/**
 * @file 상품 > 모바일요금제 > 설정 > 0플랜 슈퍼히어로 설정
 * @author junho kwon (yamanin1@partner.sk.com)
 * @since 2019-5-14
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면 ID
 * @param currentOptionProdId - 현재 옵션 상품코드
 */
 Tw.ProductMobileplanSetting0planNew = function(rootEl, prodId, displayId, currentOptionProdId, Yn_6520, Yn_6577, isUnderAge19) {
    // 컨테이너 레이어 선언
    this.$container = rootEl;
  
    // 공통 모듈 선언
    this._popupService = Tw.Popup;
    this._nativeService = Tw.Native;
    this._apiService = Tw.Api;
    this._historyService = new Tw.HistoryService();
    this._historyService.init();
  
    // 공통 변수 선언
    this._prodId = prodId;
    this._displayId = displayId;
    this._currentOptionProdId = currentOptionProdId;  //현제 설정된 옵션코드 값
    this._Yn_6520 = Yn_6520;
    this._Yn_6577 = Yn_6577;
    this._isUnderAge19 = isUnderAge19; //미성년자 여부
  
    // Element 캐싱
    this._cachedElement();
  
    // 이벤트 바인딩
    this._bindEvent();
  
    // 최초 동작
    this._init();
  };
  
  Tw.ProductMobileplanSetting0planNew.prototype = {
  
    /**
     * @function
     * @desc 최초 동작
     */
    _init: function() {

      if (this._historyService.isBack()) {
        this._historyService.goBack();
      }
  

    //◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎  
    //테스트 부가서비스 가입 목록  실 배포시 삭제 ◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎ 222222
    this._apiService.request(Tw.API_CMD.BFF_05_0222)  
    .done($.proxy((res)=>{
    console.log("=============================="+res.result)
    }));

    this._apiService.request(Tw.API_CMD.BFF_05_0040, {}, {}, ['NA00006621'])  
    .done($.proxy((res)=>{
    console.log("</br</br>================6521 : "+res.result.isAdditionUse)
    }));


    console.log("</br</br>================현재 설정 값 : "  + this._currentOptionProdId);
    //◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎


      //옵션이 설정된 값이 없으면,  
      if (Tw.FormatHelper.isEmpty(this._currentOptionProdId)) {
        return;
      }
  
      this.$container.find('input[value="' + this._currentOptionProdId + '"]').trigger('click');

      if ( this._isUnderAge19 ) {
        this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A100.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A100.TITLE);
      }


    
    },
  
    /**
     * @function
     * @desc Element 캐싱
     */
    _cachedElement: function() {
      this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
      this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    },
  
    /**
     * @function
     * @desc 이벤트 바인딩
     */
    _bindEvent: function() {
      this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
      this.$btnSetupOk.on('click', _.debounce($.proxy(this._procSetupOk, this), 500));
    },
  
    /**
     * @function
     * @desc 설정 완료 버튼 활성화
     */
    _enableSetupButton: function() {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    },
  
    /**
     * @function
     * @desc 설정완료 버튼 클릭 시, 설정 변경 API 요청
     * @returns {*|void}
     */
    _procSetupOk: function() {
      var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');
  
      if (this._currentOptionProdId === $checked.val()) {
        return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
      }
  
    // 19세 미만일 경우 선택한 부가옵션과 연계된 부가서비스에 가입되어 있지 않으면 가입 불가 + Alert 발생
    if ( this._isUnderAge19 ) {
        if (($checked.val() === 'NA00007298' && this._Yn_6520 === 'N') || ($checked.val() === 'NA00007298' && this._Yn_6577 === 'N')) {
          return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A101.MSG);
        }
    }
      
      //부가서비스 옵션 설정 처리
      Tw.CommonHelper.startLoading('.container', 'grey', true);
      this._apiService.request(Tw.API_CMD.BFF_10_0035, { addCd: '2' }, {}, ['aaaaaa'])
        .done($.proxy(this._procSetupOkRes, this))
        .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
    },
  
    /**
     * @function
     * @desc 설정 완료 API 응답 처리 & 인증팝업 노출여부 체크(인증팝업 불필요시 완료팝업 실행)
     * @param resp - API 응답 값
     * @returns {*}
     */
     _procSetupOkRes: function(resp) {

        var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');          
        Tw.CommonHelper.endLoading('.container');
    
        if (resp.code !== Tw.API_CODE.CODE_00) {
          return Tw.Error(resp.code, resp.msg).pop();
        }
        //선택한 값 이 T맴버십 VIP 6164일 경우 완료 팝업후 프로세스 종료
        if( ('NA00006164' === $checked.val())){
          this._isResultPop = true;
          return this._openSuccessPop();
        }
    
        //70%할인(7298)일 경우, 기가입된 부가서비스 목록 api  호출.
        this._apiService.request(Tw.API_CMD.BFF_05_0222)  
         .done($.proxy(this._secondProdChk, this))
      },
  
  /**
     * @function
     * @desc 부가서비스 목록
     * @param resp - API 응답 값
     * @returns  resp.result.addProdPayList : flo  ,   resp.result.disProdList : wavve
     */
   _secondProdChk: function(resp){
      isProdId  = new Array("NA00006520", "NA00006577", "NA00006578", "NA00006521"); //조건 기준이되는 wavve, flo
      Arr_obj   = resp.result.addProdPayList.concat(resp.result.disProdList); //wavve,flo 노드를 합쳐준다   

      //기가입된 부가서비스 목록에서 isProdId 필터링 해준다.  
      arrCnt = Arr_obj.filter(function(val) {
        return isProdId.indexOf(val.linkProdId) !== -1;
      });
      
      if(arrCnt.length === 4){ // 기가입 모두일 경우, 옵션 변경처리 후 완료 팝업 프로스세스 종ㄹㅅ
        this._isResultPop = true;
        return this._openSuccessPop();
      }else{    //인증 유도 팝업 오픈
        Tw.CommonHelper.startLoading('.container', 'grey', true);
        this._openAddCertifyPopup();
      }
  },
    /**
     * @function
     * @desc 완료 팝업 실행
     */
    _openSuccessPop: function() {
      if (!this._isResultPop) {
        return;
      }
  
      this._popupService.open({
        hbs: 'complete_product',
        data: {
          prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
          typeNm: Tw.PRODUCT_TYPE_NM.CHANGE
        }
      }, $.proxy(this._bindSuccessPopup, this), $.proxy(this._onClosePop, this), 'save_setting_success');
    },
  
    /**
     * @function
     * @desc 완료 팝업 이벤트 바인딩
     * @param $popupContainer
     */
    _bindSuccessPopup: function($popupContainer) {
      $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
      $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
    },
  
    /**
     * @function
     * @desc 완료 팝업 내 A 하이퍼링크 핸들링
     * @param e - A 하이퍼링크 클릭 이벤트
     */
    _closeAndGo: function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if($(e.currentTarget).hasClass('fe-link-external')
        && $(e.currentTarget).attr('href').indexOf('#') !== 0) {
        this._confirmExternalUrl(e);
        this._popupService.close();
      } else {
        this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
      }
    },
  
    /**
     * @function
     * @desc 인증유도팝업 실행
     */
    _openAddCertifyPopup: function () {
      var popupOptions;
      
      popupOptions = {
        hbs: 'MV_01_02_02_01_case01',
        editor_html : '<div class="tod-popbenf-inwrap"><img src="'+Tw.Environment.cdn+'/img/product/img-sms-flowavve2.png" alt="사용을 원하시는 FLO 앤 데이터, wavve 앤 데이터 부가서비스 가입을 하셔야 할인 혜택이 적용됩니다." class="vt" style="width:100%"></div>',
        bt: [
          {
            style_class: 'unique fe-btn_back',
            txt: '확인'
          }
        ]
      };
      this._isResultPop = true;
      this._popupService.open(popupOptions, $.proxy(this._bindAddCertifyPopupEvent, this), $.proxy(this._openSuccessPop, this), 'addcertify_pop');
    },
  
    /**
     * @function
     * @desc 인증유도팝업 이벤트 바인딩
     * @param $popupContainer - 인증유도팝업 컨테이너 레이어
     */
    _bindAddCertifyPopupEvent: function ($popupContainer) {
      $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
      $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
      new Tw.XtractorService(this.$container);
    },
  
    /**
     * @function
     * @desc 인증유도팝업 내 닫기 버튼 클릭 시
     */
    _closeAndOpenResultPopup: function () {
      this._isResultPop = true;
      this._popupService.close();
    },
  
    /**
     * @function
     * @desc 완료 팝업내 닫기 버튼 클릭 시
     */
    _closePop: function() {
      this._popupService.close();
    },
  
    /**
     * @function
     * @desc 완료 팝업 종료 시
     */
    _onClosePop: function() {
      this._historyService.goBack();
    },
  
    /**
     * @function
     * @desc 외부 링크 지원
     * @param e - 클릭 이벤트
     * @returns {*|void}
     */
    _confirmExternalUrl: function(e) {
  
      e.preventDefault();
      e.stopPropagation();
  
      if (!Tw.BrowserHelper.isApp()) {
        return this._openExternalUrl($(e.currentTarget).attr('href'));
      }
  
      Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
    },
  
    /**
     * @function
     * @desc 외부 링크 실행
     * @param href - 링크 값
     */
    _openExternalUrl: function(href) {
      Tw.CommonHelper.openUrlExternal(href);
    }
  
  };
  