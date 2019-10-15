/**
 * @file product.roaming.setting.roaming-setup.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.03
 */
/**
 * @class
 * @desc 로밍 시작일 종료일 설정case 정보 변경 페이지
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {String} prodTypeInfo - 상품 원장 정보
 * @param {Object} prodBffInfo – 상품 상세 정보
 * @param {String} prodId - 상품 id
 * @returns {void}
 */
Tw.ProductRoamingSettingRoamingSetup = function (rootEl,prodTypeInfo,prodBffInfo,prodId,isCustomGuidedProd,customGuide) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodTypeInfo = JSON.parse(prodTypeInfo);
  this._prodBffInfo = prodBffInfo;
  this._prodId = prodId;
  this._isCustomGuidedProd = isCustomGuidedProd;
  this._customGuide = customGuide;
  this._apiService = Tw.Api;
  this.$serviceTipElement = this.$container.find('.tip-view.set-service-range');
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this._init();
  this._bindBtnEvents();
  this._tooltipInit(prodId);
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('#do_change'));
};

Tw.ProductRoamingSettingRoamingSetup.prototype = {
  /**
   * @function
   * @member
   * @desc 초기화
   * @returns {void}
   */
  _init : function(){
    this._currentDate = Tw.DateHelper.getCurrentShortDate();
    var startDateObj = Tw.DateHelper.convDateFormat(this._prodBffInfo.svcStartDt);
    var endDateObj = Tw.DateHelper.convDateFormat(this._prodBffInfo.svcEndDt);
    var startDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcStartDt,this._showDateFormat,this._dateFormat);
    var endDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcEndDt,this._showDateFormat,this._dateFormat);
    var startTime = this._prodBffInfo.svcStartTm;
    var endTime = this._prodBffInfo.svcEndTm;
    var startDateIdx = Tw.DateHelper.getDiffByUnit(this._currentDate,startDateObj,'day');
    var endDateIdx = Tw.DateHelper.getDiffByUnit(this._currentDate,endDateObj,'day');
    startDateIdx = parseInt(startDateIdx,10) * -1;
    endDateIdx = parseInt(endDateIdx,10) * -1;
    this.$container.find('#start_date').text(startDate);
    this.$container.find('#start_date').attr('data-number',this._prodBffInfo.svcStartDt);
    this.$container.find('#start_date').attr('data-idx',startDateIdx);
    this.$container.find('#end_date').text(endDate);
    this.$container.find('#end_date').attr('data-number',this._prodBffInfo.svcEndDt);
    this.$container.find('#end_date').attr('data-idx',endDateIdx);
    this.$container.find('#start_time').text(startTime);
    this.$container.find('#start_time').attr('data-number',this._prodBffInfo.svcStartTm);
    this.$container.find('#end_time').text(endTime);
    this.$container.find('#end_time').attr('data-number',this._prodBffInfo.svcEndTm);
    this._checkSelectedEndDate(this._prodBffInfo.svcEndDt);
    this._validateTimeValueAgainstNow(this._prodBffInfo.svcStartDt,startTime,'checkStartPrd');
  },
  /**
   * @function
   * @member
   * @desc 종료된 상품인지 확인
   * @returns {void}
   */
  _checkSelectedEndDate : function (endDate) {
    if(this._currentDate>=endDate){
      this.$container.find('.bt-dropdown').attr('disabled','disabled').removeAttr('aria-haspopup');
      this.$container.find('#do_change').attr('disabled','disabled');
    }
  },
  /**
   * @function
   * @member
   * @desc 이벤트 바인딩
   * @returns {void}
   */
  _bindBtnEvents: function () {
    this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
    this.$container.on('click', '.bt-dropdown.time', $.proxy(this._btnTimeEvent, this));
    this.$container.on('click','.bt-fixed-area #do_change',_.debounce($.proxy(this._changeInformationSetting, this),500));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this));
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
   * @returns {Array}
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
    this._openSelectDatePop(actionSheetData,'',eventObj);
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
    this._openSelectDatePop(actionSheetData,'',eventObj);
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
    // $(eventObj.delegateTarget).find('button').removeClass('checked');
    // $(eventObj.currentTarget).addClass('checked');
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

    if(!isNaN(startDate)&&!isNaN(startTime)){
      startDateValidationResult = this._validateTimeValueAgainstNow(startDate,startTime,'start');
    }


    if(!isNaN(endDate)&&!isNaN(endTime)){
      endDateValidationResult = this._validateTimeValueAgainstNow(endDate,endTime,'end');
    }
    if(!isNaN(endDate)){
      var $endErrElement = this.$container.find('.error-txt.end');
      if(endDate<=this._currentDate){
        endDateValidationResult = false;
        $endErrElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_DATE);
        if($endErrElement.hasClass('none')){
          $endErrElement.removeClass('none');
        }
      }else{
        $endErrElement.addClass('none');
      }
    }
    if(startDateValidationResult&&endDateValidationResult){
      allDateValidatioinResult = this._validateRoamingTimeValue(startDate,startTime,endDate,endTime,selectedDateTypeId);
    }
    if(startDateValidationResult&&endDateValidationResult&&allDateValidatioinResult){
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
    if(className==='checkStartPrd'){
      var prdTime = parseInt(paramDate+''+paramTime,10);
      var currentTime = parseInt(this._currentDate+''+Tw.DateHelper.getCurrentDateTime('HH'),10);
      if(prdTime>currentTime){
        returnValue = true;
      }else{
        this.$container.find('.bt-dropdown').attr('disabled','disabled').removeAttr('aria-haspopup');
        this.$container.find('#do_change').attr('disabled','disabled');
        this.$container.find('.error-txt.start').text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_STARTED_PRD);
        this.$container.find('.error-txt.start').removeClass('none');
      }
    }else if((paramDate<=this._currentDate)&&(parseInt(paramTime,10)<parseInt(Tw.DateHelper.getCurrentDateTime('HH'),10))){
      $errorsElement.removeClass('none');
      $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_START_TIME);
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
    if(startValue>=endValue){
      if(selectedTimeTypeId.indexOf('end')>-1){
        $errorsElement = this.$container.find('.error-txt.end');
        $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_END);
      }else{
        $errorsElement = this.$container.find('.error-txt.start');
        $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_START);
      }
      $errorsElement.removeClass('none');
    }else if((Tw.DateHelper.getDiffByUnit(startDataObj,endDateObj,'day')*-1)>30){
      $errorsElement = this.$container.find('.error-txt.end');
      $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.OVER_30_DAYS);
      $errorsElement.removeClass('none');
    }else{
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
  _openSelectDatePop: function (data,title,evt) {
    this._popupService.open({
        hbs: 'actionsheet01',// hbs의 파일명
        layer: true,
        title: title,
        data: data,
        btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._bindActionSheetElementEvt, this),
      $.proxy(function () {
        this.$container.find('.fe-main-content').attr('aria-hidden',false);
      },this),
      'select_date',$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 설정정보 변경 요청 함수
   * @param {Object} targetEvt 이벤트 객체
   * @returns {void}
   */
  _changeInformationSetting : function (targetEvt) {
    var startDtIdx = parseInt(this.$container.find('#start_date').attr('data-idx'),10);
    var endDtIdx = parseInt(this.$container.find('#end_date').attr('data-idx'),10);

    var userSettingInfo = {
      'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
      'svcEndDt' : this.$container.find('#end_date').attr('data-number'),
      'svcStartTm' : this.$container.find('#start_time').attr('data-number'),
      'svcEndTm' : this.$container.find('#end_time').attr('data-number'),
      'startEndTerm' : String(endDtIdx - startDtIdx)
    };
    if(
        userSettingInfo.svcStartDt===this._prodBffInfo.svcStartDt&&
        userSettingInfo.svcEndDt===this._prodBffInfo.svcEndDt&&
        userSettingInfo.svcStartTm===this._prodBffInfo.svcStartTm&&
        userSettingInfo.svcEndTm===this._prodBffInfo.svcEndTm
    ){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE,null,null,null,$(targetEvt.currentTarget));
      return;
    }
    Tw.CommonHelper.startLoading('.popup-page', 'white');
    this._apiService.request(Tw.API_CMD.BFF_10_0085, userSettingInfo, {},[this._prodId]).
    done($.proxy(function (res) {
      Tw.CommonHelper.endLoading('.popup-page');
      if(res.code===Tw.API_CODE.CODE_00){
        this._showCompletePopup(this._prodBffInfo,targetEvt);
      }else{
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
      }
    }, this)).
    fail($.proxy(function (err) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
    }, this));
  },
  /**
   * @function
   * @member
   * @desc 완료 팝업 출력 함수
   * @param {Object} data 변경된 설정 정보
   * @param {Object} targetEvt 이벤트 객체
   * @returns {void}
   */
  _showCompletePopup : function(data,targetEvt){
    var completePopupData = {
      prodNm : data.prodNm,
      processNm : Tw.PRODUCT_TYPE_NM.SETTING,
      isBasFeeInfo : this._convertPrice(data.prodFee),
      typeNm : Tw.NOTICE.ROAMING+' '+(this._prodTypeInfo.prodTypCd==='H_P'?Tw.PRODUCT_CTG_NM.PLANS:Tw.PRODUCT_CTG_NM.ADDITIONS),
      btnNmList : []
    };
    this._popupService.open({
        hbs: 'complete_product_roaming',
        layer: true,
        data : completePopupData
      },
      $.proxy(this._bindCompletePopupBtnEvt,this),
      $.proxy(this._goPlan,this),
      'complete');
  },
  /**
   * @function
   * @member
   * @desc 완료 팝업 이벤트 바인딩
   * @param {Object} args1 바닥페이지 객체
   * @param {Object} args2 완료 팝업 element 객체
   * @returns {void}
   */
  _bindCompletePopupBtnEvt : function (popupEvt) {
    $(popupEvt).on('click','.btn-floating.btn-style2',$.proxy(this._popupService.closeAll,this._popupService));
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
   * @desc 상품별 툴팁 출력 구분
   * @param {String} prodId 상품 id
   * @param {Object} $tooltipHead 화면 상단 툴팁 jquery 객체
   * @param {Object} $tooltipBody 화면 하단 툴팁 jquery 객체
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
   * @desc 가격 comma 추가 함수
   * @param {String} priceVal 상품 가격
   * @returns {String}
   */
  _convertPrice : function (priceVal) {
    if(!isNaN(priceVal)){
      priceVal = Tw.FormatHelper.addComma(priceVal)+Tw.CURRENCY_UNIT.WON;
    }
    return priceVal;
  }
};
