/**
 * @file product.roaming.setting.roaming-setup.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.11.28
 */
/**
 * @class
 * @desc 로밍 시작일 종료일 설정case 가입 페이지
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {String} prodTypeInfo - 상품 원장 정보
 * @param {Object} prodApiInfo – 상품 상세 정보
 * @param {Object} svcNum - 유저 전화번호
 * @param {String} prodId - 상품 id
 * @param {boolean} isPromotion - 프로모션 상품 구분
 * @returns {void}
 */
Tw.ProductRoamingJoinRoamingSetup = function (rootEl,prodTypeInfo,prodApiInfo,svcNum,prodId,isPromotion,isCustomGuidedProd,customGuide) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodTypeInfo = JSON.parse(prodTypeInfo);
  this._prodApiInfo = prodApiInfo;
  this._svcNum = svcNum;
  this._prodId = prodId;
  this.$serviceTipElement = this.$container.find('.tip-view-btn.set-service-range');
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this._isPromotion = isPromotion;
  this._isCustomGuidedProd = isCustomGuidedProd;
  this._customGuide = customGuide;
  this._currentDate = Tw.DateHelper.getCurrentShortDate();
  this._bindBtnEvents();
  this._tooltipInit(prodId);
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('#do_confirm'));
};

Tw.ProductRoamingJoinRoamingSetup.prototype = {
  /**
   * @function
   * @member
   * @desc 이벤트 바인딩
   * @returns {void}
   */
  _bindBtnEvents: function () { //이벤트 바인딩
    this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
    this.$container.on('click', '.bt-dropdown.time', $.proxy(this._btnTimeEvent, this));
    this.$container.on('click','.bt-fixed-area #do_confirm',$.proxy(this._confirmInformationSetting, this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this._historyService));
    if(this._isPromotion){  //프로모션 상품 관련 , 나중에 없어질 수 있음
      this._numReg = /[^0-9]/g;
      this._phoneInputState = false;
      this._validatedGiftPhoneNum = '010';
      this._promotionValidState = true;
      this.$container.on('click','.fe-selected-number.head',$.proxy(this._showPhoneHeadSelector,this));
      this.$container.on('focus','.fe-input-number',$.proxy(this._changeTextInputState,this,'focus'));
      this.$container.on('blur','.fe-input-number',$.proxy(this._changeTextInputState,this,'blur'));
      this.$container.on('keyup','.fe-selected-number',$.proxy(function () {
        this._promotionValidState = false;
      },this));
      this.$container.on('click','#fe_request_gift',$.proxy(this._requestGiftData,this));
      this.$container.on('keyup','.fe-selected-number.fe-input-number',$.proxy(this._checkGiftNum,this));
      this.$giftNumberInput = this.$container.find('.fe-selected-number');
      /*
      { 'label-attr': 'for=ra'+i, 'txt': dateArr[i],
      'radio-attr':'id="ra'+i+'" value="' + dateArr[i] + '" ' + (nowValue===dateArr[i] ? 'checked ' : '') }
        */
      // this._numberHeadArr = [
      //   {option : '' , value : '010' , attr : 'data-number=010'},
      //   {option : '' , value : '011' , attr : 'data-number=011'},
      //   {option : '' , value : '017' , attr : 'data-number=017'},
      //   {option : '' , value : '016' , attr : 'data-number=016'},
      //   {option : '' , value : '018' , attr : 'data-number=018'},
      //   {option : '' , value : '019' , attr : 'data-number=019'}
      // ];
      this._numberHeadArr = [
        { 'label-attr': 'for="ra1"', 'txt': '010',
          'radio-attr':'id="ra1" name="phoneHead" value="010" '},
        { 'label-attr': 'for="ra2"', 'txt': '011',
          'radio-attr':'id="ra2" name="phoneHead" value="011" '},
        { 'label-attr': 'for=ra3', 'txt': '017',
          'radio-attr':'id="ra3" name="phoneHead" value="017" '},
        { 'label-attr': 'for=ra4', 'txt': '016',
          'radio-attr':'id="ra4" name="phoneHead" value="016" '},
        { 'label-attr': 'for=ra5', 'txt': '018',
          'radio-attr':'id="ra5" name="phoneHead" value="018" '},
        { 'label-attr': 'for=ra6', 'txt': '019',
          'radio-attr':'id="ra6" name="phoneHead" value="019" '}
      ];
    }
  },
  /**
   * @function
   * @member
   * @desc 오늘 기준 날짜 배열 생성
   * @returns {Array}
   */
  _getDateArrFromToDay : function(range,format){
    var dateFormat = this._showDateFormat;
    var resultArr = [];
    if(format){
      dateFormat = format;
    }
    for(var i=0;i<range;i++){
      resultArr.push(Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,i,'days',dateFormat,this._dateFormat));
    }
    return resultArr;
  },
  /**
   * @function
   * @member
   * @desc 생성된 날짜 배열 액션시트 포맷으로 변경
   * @param {Array} dateArr - 날짜 배열
   * @param {String} attr - 속성
   * @param {String} nowValue - 선택된 값
   * @returns {Array}
   */
  _convertDateArrForActionSheet : function(dateArr,attr,nowValue){
    var returnArr = [];
    for(var i=0;i<dateArr.length;i++){
      //returnArr.push({'value':dateArr[i],'option':nowValue===dateArr[i]?'checked':'','attr':attr});
      returnArr.push({ 'label-attr': 'for=ra'+i, 'txt': dateArr[i],
        'radio-attr':'id="ra'+i+'" value="' + dateArr[i] + '" ' + (nowValue===dateArr[i] ? 'checked ' : '') + attr +' name="selectDate"'});
    }
    return returnArr;
  },
  /**
   * @function
   * @member
   * @desc 생성된 날짜 배열 액션시트 포맷으로 변경
   * @param {Array} dateArr - 날짜 배열
   * @param {String} attr - 속성
   * @param {String} nowValue - 선택된 값
   * @returns {Array}
   */
  _getTimeArr : function(){
    var timeArr = [];
    for(var i=0;i<24;i++){
      timeArr.push(i<10?'0'+i:''+i);
    }
    return timeArr;
  },
  /**
   * @function
   * @member
   * @desc 액션시트 데이터 생성
   * @param {Array} data - 액션시트 데이터
   * @returns {Array}
   */
  _makeActionSheetDate : function(data){
    var returnActionSheetData = [
      {
        'list': data
      }
    ];
    return returnActionSheetData;
  },
  /**
   * @function
   * @member
   * @desc 날짜 선택 액션시트 출력
   * @param {Object} eventObj - 이벤트 각체
   * @returns {void}
   */
  _btnDateEvent : function(eventObj){
    if(this._historyService.getHash()==='#select_date_P'){
      return;
    }
    var $currentTarget = $(eventObj.currentTarget);
    var selectableStartDateRange = this._customGuide.selectableStartDateRange || 30; // 기본 설정 가능한 시작일자 범위
    var nowTargetId = $currentTarget.attr('id');
    var nowValue = $currentTarget.text().trim();
    var dateArr = this._getDateArrFromToDay( nowTargetId === 'end_date' ? selectableStartDateRange + 30 : selectableStartDateRange );
    var convertedArr = this._convertDateArrForActionSheet(dateArr,'data-name="'+nowTargetId+'"',nowValue);
    var actionSheetData = this._makeActionSheetDate(convertedArr);
    if(nowValue.length<10){
      //actionSheetData[0].list[0].option = 'checked';
      actionSheetData[0].list[0]['radio-attr'] += 'checked';
    }
    actionSheetData[0].list[0].txt+= ' ('+Tw.SELECTED_DATE_STRING.TODAY+')';
    if(this._isPromotion&&this._phoneInputState){ //키패드 출력 상태일 경우 딜레이 500
      setTimeout($.proxy(function () {
        this._openSelectDatePop(actionSheetData,'',eventObj);
      },this),500);
    }else{
      this._openSelectDatePop(actionSheetData,'',eventObj);
    }
  },
  /**
   * @function
   * @member
   * @desc 날짜 선택 액션시트 출력
   * @param {Object} eventObj - 이벤트 각체
   * @returns {void}
   */
  _btnTimeEvent : function(eventObj){
    if(this._historyService.getHash()==='#select_date_P'){
      return;
    }
    var nowValue = $(eventObj.currentTarget).text().trim();
    var timeArr = this._getTimeArr();
    var convertedArr = this._convertDateArrForActionSheet(timeArr,'data-name="'+$(eventObj.currentTarget).attr('id')+'"',nowValue);
    var actionSheetData = this._makeActionSheetDate(convertedArr);
    if(this._isPromotion&&this._phoneInputState){ //키패드 출력 상태일 경우 딜레이 500
      setTimeout($.proxy(function () {
        this._openSelectDatePop(actionSheetData,'',eventObj);
      },this),500);
    }else{
      this._openSelectDatePop(actionSheetData,'',eventObj);
    }
  },
  /**
   * @function
   * @member
   * @desc 액션시트 이벤트 바인딩
   * @param {Object} $layer - 팝업 jquery 객체
   * @returns {void}
   */
  _bindActionSheetElementEvt : function($layer){
    Tw.CommonHelper.focusOnActionSheet($layer);
    $layer.on('click', '.cont-actionsheet input', $.proxy(this._actionSheetElementEvt, this));
    //$layer.on('click', '.popup-closeBtn', $.proxy(this._actionSheetCloseEvt, this));
  },
  /**
   * @function
   * @member
   * @desc 액션시트 선택 이벤트
   * @param {Object} eventObj - 이벤트 객체
   * @returns {void}
   */
  _actionSheetElementEvt : function(eventObj){
    this._actionSheetCloseEvt(eventObj);
  },
  /**
   * @function
   * @member
   * @desc 액션시트 close 이벤트
   * @param {Object} eventObj - 이벤트 객체
   * @returns {void}
   */
  _actionSheetCloseEvt : function(eventObj){
    var $selectedTarget = $(eventObj.currentTarget);
    var dateValue = $selectedTarget.val().trim().substr(0,13);
    var dateAttr = $selectedTarget.attr('data-name');
    var changeTarget;
    //changeTarget = this.$container.find('#'+dateAttr);
    if(dateAttr.indexOf('time')>=0){
      changeTarget = this.$container.find('.time');
    }else{
      changeTarget = this.$container.find('#'+dateAttr);
    }
    changeTarget.text(dateValue);
    changeTarget.removeClass('placeholder');
    changeTarget.attr('data-number',dateValue.replace(/\.|\ /g, ''));
    changeTarget.attr('data-idx',$selectedTarget.parents('li').index());
    this._validateDateValue(changeTarget.attr('id'));
    this._popupService.close();
  },
  /**
   * @function
   * @member
   * @desc 선택한 날짜 검증
   * @returns {void}
   */
  _validateDateValue : function(selectedDateTypeId){

    var startDate = this.$container.find('#start_date').attr('data-number');
    var startTime = this.$container.find('#start_time').attr('data-number');
    var endDate = this.$container.find('#end_date').attr('data-number');
    var endTime = this.$container.find('#end_time').attr('data-number');
    var startDateValidationResult = false;
    var endDateValidationResult = false;
    var allDateValidatioinResult = false;
    //종료일이 시작일보다 앞일경우
    if(!isNaN(endDate)&&!isNaN(startDate)){
      if(endDate<=startDate){
        if(selectedDateTypeId.indexOf('end')>-1){
          endDateValidationResult = false;
          this.$container.find('.error-txt.end').removeClass('none').text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_END);
        }else{
          startDateValidationResult = false;
          this.$container.find('.error-txt.start').removeClass('none').text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_START);
        }
        this.$container.find('.bt-fixed-area button').attr('disabled','disabled');
        return;
      }else{
        this.$container.find('.error-txt.start').addClass('none');
        this.$container.find('.error-txt.end').addClass('none');
      }
    }

    if(!isNaN(startDate)&&!isNaN(startTime)){
      startDateValidationResult = this._validateTimeValueAgainstNow(startDate,startTime,'start');
    }

    //종료일 선택 확인
    if(!isNaN(endDate)&&!isNaN(endTime)){
      endDateValidationResult = this._validateTimeValueAgainstNow(endDate,endTime,'end');
    }
    //종료일 선택시
    if(!isNaN(endDate)){
      var $endErrElement = this.$container.find('.error-txt.end');
      if(endDate===this._currentDate){  //종료일이 오늘일 경우
        endDateValidationResult = false;
        $endErrElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_DATE);
        if($endErrElement.hasClass('none')){
          $endErrElement.removeClass('none');
        }
      }else{
        $endErrElement.addClass('none');
      }
    }
    if(startDateValidationResult&&endDateValidationResult){ //시작일 종료일 입력 완료시
      //시작일 종료일 범위 체크
      allDateValidatioinResult = this._validateRoamingTimeValue(startDate,startTime,endDate,endTime,selectedDateTypeId);
    }
    if(startDateValidationResult&&endDateValidationResult&&allDateValidatioinResult){
      //모든 검사 통과시
      this.$container.find('.bt-fixed-area button').removeAttr('disabled');
    }else{
      this.$container.find('.bt-fixed-area button').attr('disabled','disabled');
    }

  },
  /**
   * @function
   * @member
   * @desc 현재 시간을 기준으로 시간 확인
   * @param {String} paramDate 선택한 날짜
   * @param {String} paramTime 선택한 시간
   * @param {String} className 선택한 시간 타입(시작일 , 종료일)
   * @returns {boolean}
   */
  _validateTimeValueAgainstNow : function(paramDate,paramTime,className){
    var returnValue = false;
    var $errorsElement = this.$container.find('.error-txt.'+className);
    if((paramDate===this._currentDate)&&(parseInt(paramTime,10)<parseInt(Tw.DateHelper.getCurrentDateTime('HH'),10))){
      if(className==='start'){
        $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_START_TIME);
      }else{
        $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_DATE);
      }
      $errorsElement.removeClass('none');
    }else{
      returnValue = true;
      if(!$errorsElement.hasClass('none')){
        $errorsElement.addClass('none');
      }
    }
    return returnValue;
  },
  /**
   * @function
   * @member
   * @desc 시작일이 종료일 이후인지 확인
   * @param {String} startDate 서비스 시작일
   * @param {String} startTime 서비스 시작 시간
   * @param {String} endDate 서비스 종료일
   * @param {String} endTime 서비스 종료 시간
   * @param {String} selectedTimeTypeId 선택한 시간 타입
   * @returns {boolean}
   */
  _validateRoamingTimeValue : function(startDate,startTime,endDate,endTime,selectedTimeTypeId){
    var returnValue = false;
    var startValue = parseInt(startDate+''+startTime,10);
    var endValue = parseInt(endDate+''+endTime,10);
    var startDataObj = Tw.DateHelper.convDateFormat(startValue);
    var endDateObj =Tw.DateHelper.convDateFormat(endValue);
    var $errorsElement;
    //시작일이 종료일보다 뒤일 경우
    if(startValue>=endValue){
      if(selectedTimeTypeId.indexOf('end')>-1){
        //종료일을 선택 했을 때
        $errorsElement = this.$container.find('.error-txt.end');
        $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_END);
      }else{
        //시작일을 선택 했을 때
        $errorsElement = this.$container.find('.error-txt.start');
        $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_START);
      }
      $errorsElement.removeClass('none');
    }else if((Tw.DateHelper.getDiffByUnit(startDataObj,endDateObj,'day')*-1)>30){
      //시작일과 종료일 차이가 30일 이상일 때
      $errorsElement = this.$container.find('.error-txt.end');
      $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.OVER_30_DAYS);
      $errorsElement.removeClass('none');
    }else{
      //정상
      returnValue = true;
    }
    return returnValue;
  },
  /**
   * @function
   * @member
   * @desc 액션시트 출력 함수
   * @param {Object} data 액션시트 데이터
   * @param {String} title 액션시트 타이틀
   * @param {Object} targetEvt 이벤트 객체
   * @returns {void}
   */
  _openSelectDatePop: function (data,title,targetEvt) {
    this._popupService.open({
        hbs: 'actionsheet01',// hbs의 파일명
        layer: true,
        data: data,
        btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._bindActionSheetElementEvt, this),
      $.proxy(function () {
        this.$container.find('.fe-main-content').attr('aria-hidden',false);
      },this),
      'select_date',$(targetEvt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 가입 요청 함수
   * @param {Object} data 바닥페이지 element Object
   * @param {Object} apiService 객체
   * @param {Object} historyService 객체
   * @param {Object} containerData 바닥페이지 객체
   * @param {Object} targetEvt 이벤트객체
   * @returns {void}
   */
  _doJoin : function(data,apiService,historyService,containerData,targetEvt){
    //가입 API 호출
    Tw.CommonHelper.startLoading('.popup-page', 'white');
    apiService.request(Tw.API_CMD.BFF_10_0084, data.userJoinInfo, {},[data.prodId]).
    done($.proxy(function (res) {
      Tw.CommonHelper.endLoading('.popup-page');
      if(res.code===Tw.API_CODE.CODE_00){
        var completePopupData = {
          prodNm : data.prodNm,
          isBasFeeInfo : data.prodFee,
          typeNm : data.prodType,
          settingType : data.processNm,
          btnNmList : [Tw.ROAMING_JOIN_STRING.MY_ROAMING_STATE]
        };
        //가입 완료 팝업 출력
        containerData._popupService.open({
            hbs: 'complete_product_roaming',
            layer: true,
            data : completePopupData
          },
          $.proxy(containerData._bindCompletePopupBtnEvt,this,containerData),
          $.proxy(containerData._goPlan,containerData),
          'complete');
      }else{
        //에러 노티 출력
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
      }
    }, this)).fail($.proxy(function (err) {
      //에러 노티 출력
      Tw.CommonHelper.endLoading('.popup-page');
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
    }, this));
  },
  /**
   * @function
   * @member
   * @desc 완료 팝업 이벤트 바인딩
   * @param {Object} args1 바닥페이지 객체
   * @param {Object} args2 완료 팝업 element 객체
   * @returns {void}
   */
  _bindCompletePopupBtnEvt : function(args1,args2){
    $(args2).on('click','.btn-round2',$.proxy(args1._goMyInfo,args1));
    $(args2).on('click','.btn-floating',$.proxy(args1._popupService.closeAll,args1._popupService));
  },
  /**
   * @function
   * @member
   * @desc 나의 로밍 이용현황 이동 함수
   * @returns {void}
   */
  _goMyInfo : function(){
    //로밍 요금제, 부가서비스에 맞춰 페이지 이동
    var targetUrl = this._prodTypeInfo.prodTypCd==='H_P'?'/product/roaming/my-use':'/product/roaming/my-use#add';
    this._popupService.closeAllAndGo(targetUrl);
  },
  /**
   * @function
   * @member
   * @desc 상품 가입 이전 페이지 이동 함수
   * @returns {void}
   */
  _goPlan : function () {
    this._popupService.closeAll();
    setTimeout($.proxy(this._historyService.goBack,this._historyService),0);
  },
  /**
   * @function
   * @member
   * @desc 상품 가입 취소 확인 팝업 출력
   * @param {Object} evt 이벤트객체
   * @returns {void}
   */
  _showCancelAlart : function (evt){
    var alert = Tw.ALERT_MSG_PRODUCT.ALERT_3_A1;
    this._popupService.openModalTypeATwoButton(alert.TITLE, alert.MSG, Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null,
      $.proxy(this._goPlan,this),
      null,$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 취소 확인 팝업 이벤트 바인딩
   * @param {Object} popupLayer 팝업 element 객체
   * @returns {void}
   */
  _bindCancelPopupEvent : function (popupLayer) {
    $(popupLayer).on('click','.pos-left>button',$.proxy(this._goPlan,this));
  },
  /**
   * @function
   * @member
   * @desc 정보확인 팝업 출력 함수
   * @param {String} evt 선택한 요소의 jQuery 객체 ( $(evt.currentTarget) )
   * @returns {void}
   */
  _confirmInformationSetting : function (evt) {
    var startDtIdx = parseInt(this.$container.find('#start_date').attr('data-idx'),10);
    var endDtIdx = parseInt(this.$container.find('#end_date').attr('data-idx'),10);

    var userJoinInfo = {  //가입 API 호출 데이터
      'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
      'svcEndDt' : this.$container.find('#end_date').attr('data-number'),
      'svcStartTm' : this.$container.find('#start_time').attr('data-number'),
      'svcEndTm' : this.$container.find('#end_time').attr('data-number'),
      'startEndTerm' : String(endDtIdx - startDtIdx + 1)
    };

    if(this._isPromotion===true){ //프로모션일 경우
      var giftNum = this._getGiftNum();
      if(giftNum.length===3){ //선물 할 번호 입력 안했을 경우
        this._promotionValidState = true;
        this._validatedGiftPhoneNum = giftNum;
        delete userJoinInfo.bnftSvcNum;
      }else{
        userJoinInfo.bnftSvcNum = giftNum;
      }
      //전화번호 확인 안했거나, 확인 한 번호가 아닐 경우
      if(this._validatedGiftPhoneNum!==giftNum||this._promotionValidState===false){
        this._popupService.openAlert(null,Tw.ALERT_MSG_PRODUCT.ALERT_3_A90.TITLE,null,null,null,$(evt.currentTarget));
        return;
      }
    }
    //정보확인 팝업 데이터
    var data = {
      popupTitle : Tw.PRODUCT_TYPE_NM.JOIN,
      userJoinInfo : userJoinInfo,
      prodId : this._prodId,
      svcNum : Tw.FormatHelper.getDashedCellPhoneNumber(this._svcNum),
      processNm : Tw.PRODUCT_TYPE_NM.JOIN,
      prodType : Tw.NOTICE.ROAMING+' '+(this._prodTypeInfo.prodTypCd==='H_P'?Tw.PRODUCT_CTG_NM.PLANS:Tw.PRODUCT_CTG_NM.ADDITIONS),
      prodNm : this._prodApiInfo.preinfo.reqProdInfo.prodNm,
      prodFee : this._prodApiInfo.preinfo.reqProdInfo.basFeeInfo,
      description : this._prodApiInfo.preinfo.reqProdInfo.prodSmryDesc,
      autoInfo : this._prodApiInfo,
      showStipulation : Object.keys(this._prodApiInfo.stipulationInfo).length>0,
      joinType : 'setup'

    };
    //정보확인 팝업 출력
    new Tw.ProductRoamingJoinConfirmInfo(this.$container,data,this._doJoin,this._showCancelAlart,'confirm_data',this,null,evt);

  },
  /**
   * @function
   * @member
   * @desc 상품별 툴팁 출력 구분
   * @param {String} prodId 상품 id
   * @returns {void}
   */
  _tooltipInit : function (prodId) {

    switch (prodId) {
      case 'NA00004088':
      case 'NA00004299':
      case 'NA00004326':
      case 'NA00005047':
      case 'NA00005502':
      case 'NA00004883':
      case 'NA00005048':
      case 'NA00006487':
      case 'NA00006488':
        this.$serviceTipElement.attr('id','RM_11_01_02_02_tip_01_01');
        break;
      case 'NA00004941':
      case 'NA00004942':
        this.$serviceTipElement.attr('id','RM_11_01_02_02_tip_01_02');
        this.$container.find('.cont-box.nogaps-btm').css('display','block');
        break;
      case 'NA00005137':
      case 'NA00005138':
        this.$serviceTipElement.attr('id','RM_11_01_02_02_tip_01_03');
        break;
      case 'NA00005632':
      case 'NA00005634':
      case 'NA00005635':
        this.$serviceTipElement.attr('id','RM_11_01_02_02_tip_01_04');
        break;
      case 'NA00005821':
        this.$serviceTipElement.attr('id','RM_11_01_02_02_tip_01_05');
        break;
    }
  },
  /**
   * @function
   * @member
   * @desc 프로모션 데이터 선물 전화번호 확인(프로모션 상품 only)
   * @param {Object} targetEvt 이벤트객체
   * @returns {void}
   */
  _requestGiftData : function (targetEvt) {
    var requestNum = this._getGiftNum();
    if(requestNum.length<=3){
      requestNum = '';
    }
    this._apiService.request(Tw.API_CMD.BFF_10_0175, { bnftSvcNum : requestNum }, {},[this._prodId])
      .done($.proxy(function (res) {
        if(res.code===Tw.API_CODE.CODE_00){
          this._popupService.openAlert(null,Tw.POPUP_TITLE.ROAMING_PROMOTION_SUCCESS,null,null,null,$(targetEvt.currentTarget));
          this._promotionValidState = true;
          this._validatedGiftPhoneNum = requestNum;
        }else{
          this._popupService.openAlert(null,res.msg,null,null,null,$(targetEvt.currentTarget));
          this._promotionValidState = false;
        }
      },this))
      .fail($.proxy(function (err) {
        this._popupService.openAlert(null,err.msg,null,null,null,$(targetEvt.currentTarget));
      },this));
  },
  /**
   * @function
   * @member
   * @desc 선물할 전화번호 가져오기(프로모션 상품 only)
   * @returns {void}
   */
  _getGiftNum : function () {
    var phoneHead = $(this.$giftNumberInput[0]).text();
    var phoneMiddle = $(this.$giftNumberInput[1]).val();
    var phoneTail = $(this.$giftNumberInput[2]).val();
    return phoneHead+''+phoneMiddle+''+phoneTail;
  },
  /**
   * @function
   * @member
   * @desc 선물할 전화번호 앞 3자리 선택 액션시트(프로모션 상품 only)
   * @param {Object} targetEvt 이벤트객체
   * @returns {void}
   */
  _showPhoneHeadSelector : function (targetEvt) {
    var $target = $(targetEvt.currentTarget);
    var nowValue = $target.text();
    for(var idx in this._numberHeadArr){
      if(this._numberHeadArr[idx].txt===nowValue){
        this._numberHeadArr[idx]['radio-attr'] += 'checked';
      }
    }
    this._popupService.open({
          hbs: 'actionsheet01',// hbs의 파일명
          layer: true,
          data: [{list : this._numberHeadArr}],
          btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
        },
        $.proxy(this._bindNumberSelectorEvt,this),
        $.proxy(function () {
          this.$container.find('.fe-main-content').attr('aria-hidden',false);
        },this),
        null,$target);
  },
  /**
   * @function
   * @member
   * @desc 전화번호 선택 액션시트 이벤트 바인딩(프로모션 상품 only)
   * @param {Object} targetEvt 이벤트객체
   * @returns {void}
   */
  _bindNumberSelectorEvt : function (targetEvt) {
    Tw.CommonHelper.focusOnActionSheet(targetEvt);
    $(targetEvt).on('click', '.cont-actionsheet input', $.proxy(function (evt) {
      this.$container.find('.fe-selected-number.head').text($(evt.currentTarget).val());
      this._validatedGiftPhoneNum = this._getGiftNum();
      this._popupService.close();
    }, this));
  },
  /**
   * @function
   * @member
   * @desc 선물할 전화번호가 모두 숫자인지 확인(프로모션 상품 only)
   * @param {Object} evt 이벤트객체
   * @returns {void}
   */
  _checkGiftNum : function (evt) {
    var $target = $(evt.currentTarget);
    var inputVal = $target.val();
    if(inputVal.length>0&&this._numReg.test(inputVal)){
      var changedValue = inputVal.replace(this._numReg,'');
      $target.blur();
      $target.val('');
      $target.val(changedValue);
      $target.focus();
      if(changedValue.length<=0){
        $target.next().trigger('click');
      }
    }
  },
  /**
   * @function
   * @member
   * @desc 전화번호 입력 키패드 출력 확인 (프로모션 상품 only)
   * @param {String} evtType 이벤트 타입
   * @returns {void}
   */
  _changeTextInputState : function (evtType) {
    if(evtType==='focus'){
      this._phoneInputState = true;
    }else if(evtType==='blur'){
      setTimeout($.proxy(function(){
        this._phoneInputState = false;
      },this),500);
    }
  }
};
