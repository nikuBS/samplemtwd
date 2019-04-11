/**
 * @file product.roaming.setting.roaming-auto.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.03
 */
/**
 * @class
 * @desc 로밍 종료일 자동설정 설정 변경 페이지
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {String} prodTypeInfo - 상품 원장 정보
 * @param {Object} prodBffInfo – 상품 상세 정보
 * @param {String} prodId - 상품 id
 * @param {String} expireDate - 상품 서비스 기간
 * @returns {void}
 */
Tw.ProductRoamingSettingRoamingAuto = function (rootEl,prodTypeInfo,prodBffInfo,prodId,expireDate) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._prodTypeInfo = JSON.parse(prodTypeInfo);
  this._prodBffInfo = prodBffInfo;
  this._prodId = prodId;
  this._expireDate = expireDate;
  this._apiService = Tw.Api;
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this.$tooltipHead = this.$container.find('#tip_head');
  this.$tooltipBody = this.$container.find('#tip_body');
  this._twoMonthFlag = false;
  this._dateSelectRange = 30; //시작일 기본 출력 범위 30일
  this._currentDate = Tw.DateHelper.getCurrentShortDate();
  this.$serviceTipElement = this.$container.find('.tip-view.set-service-range');
  this._init();
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('#do_setting'));
};

Tw.ProductRoamingSettingRoamingAuto.prototype = {
  /**
   * @function
   * @member
   * @desc 초기화 함수
   * @returns {void}
   */
  _init : function(){
    this._tooltipInit(this._prodId,this.$tooltipHead,this.$tooltipBody);  //툴팁 init
    if(this._twoMonthFlag){ //시작일 설정이 2달 일 경우
      // this._dateSelectRange = -1*(Tw.DateHelper.getDiffByUnit(this._currentDate,
      //   Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,2,'month',this._dateFormat,this._dateFormat),'day'));
      this._dateSelectRange = 60; //60일로 시작일 선택 범위 변경
      this.$container.find('#aria-dateset1').text(Tw.ROAMING_RANGE_OPTION_STR.TWO_MONTH); //시작일 선택 문구
    }else{
      this.$container.find('#aria-dateset1').text(Tw.ROAMING_RANGE_OPTION_STR.ONE_MONTH); //시작일 선택 문구
    }
    this._bindBtnEvents();
    var startDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcStartDt,this._showDateFormat,this._dateFormat); //설정된 시작일 변환
    var endDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcEndDt,this._showDateFormat,this._dateFormat); //설정된 종료일 변환
    var startTime = this._prodBffInfo.svcStartTm; //시작 시간
    var endTime = this._prodBffInfo.svcEndTm; //종료 시간
    //설정된 시간 속성 추가
    this.$container.find('#start_date').text(startDate);
    this.$container.find('#start_date').attr('data-number',this._prodBffInfo.svcStartDt);
    this.$container.find('#end_date').text(endDate);
    this.$container.find('#end_date').attr('data-number',this._prodBffInfo.svcEndDt);
    this.$container.find('#start_time').text(startTime);
    this.$container.find('#start_time').attr('data-number',this._prodBffInfo.svcStartTm);
    this.$container.find('#end_time').text(endTime);
    this.$container.find('#end_time').attr('data-number',this._prodBffInfo.svcEndTm);
    this._checkSelectedEndDate(this._prodBffInfo.svcEndDt); //이미 종료된 상품 체크
    this._validateTimeValueAgainstNow(this._prodBffInfo.svcStartDt,startTime,'checkStartPrd');  //이미 시작된 상품 체크
  },
  /**
   * @function
   * @member
   * @desc 종료된 상품 확인
   * @param endDate 상품 종료일
   * @returns {void}
   */
  _checkSelectedEndDate : function (endDate) {
    if(this._currentDate>=endDate){
      this.$container.find('.bt-dropdown').attr('disabled','disabled');
      this.$container.find('#do_setting').attr('disabled','disabled');
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
    this.$container.on('click','.bt-fixed-area #do_setting',_.debounce($.proxy(this._settingInformationSetting, this),500));
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
      returnArr.push({'value':dateArr[i],'option':nowValue===dateArr[i]?'checked':'','attr':attr});

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
    var nowValue = $(eventObj.currentTarget).text().trim();
    var dateArr = this._getDateArrFromToDay(this._dateSelectRange);
    var convertedArr = this._convertDateArrForActionSheet(dateArr,'data-name="'+$(eventObj.currentTarget).attr('id')+'"',nowValue);
    var actionSheetData = this._makeActionSheetDate(convertedArr);
    if(nowValue.length<10){
      actionSheetData[0].list[0].option = 'checked';
    }
    actionSheetData[0].list[0].value+= ' ('+Tw.SELECTED_DATE_STRING.TODAY+')';
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
    $layer.on('click', '.chk-link-list button', $.proxy(this._actionSheetElementEvt, this));
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
    $(eventObj.delegateTarget).find('button').removeClass('checked');
    $(eventObj.currentTarget).addClass('checked');
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
    var $selectedTarget = $(eventObj.delegateTarget).find('.chk-link-list button.checked');
    var dateValue = $selectedTarget.text().trim().substr(0,13);
    var dateAttr = $selectedTarget.attr('data-name');
    var changeTarget = this.$container.find('#'+dateAttr);
    changeTarget.text(dateValue);
    changeTarget.removeClass('placeholder');
    changeTarget.attr('data-number',dateValue.replace(/\.|\ /g, ''));
    changeTarget.attr('data-idx',$selectedTarget.parent().index());
    this._validateDateValue(eventObj.currentTarget.dataset.name);
    this._popupService.close();
  },
  /**
   * @function
   * @member
   * @desc 선택한 날짜 검증
   * @returns {void}
   */
  _validateDateValue : function(targetId){
    var startDateElement = this.$container.find('#start_date');
    var startTimeElement = this.$container.find('#start_time');
    var startDate = startDateElement.attr('data-number');
    var startTime = startTimeElement.attr('data-number');
    var endDateElement = this.$container.find('#end_date');
    var endTimeElement = this.$container.find('#end_time');
    var startDateValidationResult = false;
    // var endDateValidationResult = false;

    if(!isNaN(startDate)&&!isNaN(startTime)){ //시작일 , 시작 시간 설정 했을 경우
      startDateValidationResult = this._validateTimeValueAgainstNow(startDate,startTime,'start');
    }

    if(startDateValidationResult){  //시작일, 시간 설정 정상일 경우
      this.$container.find('.bt-fixed-area button').removeAttr('disabled');
    }else{  //시작일, 시간 설정 정상 아닐 경우
      this.$container.find('.bt-fixed-area button').attr('disabled','disabled');
    }
    var expireDate = parseInt(this._expireDate,10) + parseInt(startDateElement.attr('data-idx'),10);  //종료일 자동 설정
    var endDate = Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,expireDate,'days',this._showDateFormat,this._dateFormat);
    if(targetId==='start_date'){  //시작일 설정일 때
      endDateElement.attr('data-number',Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,
          expireDate,'days',this._dateFormat,this._dateFormat));
      endDateElement.text(endDate);
    }else{  //시작 시간 설정일 때
      endTimeElement.text(startTime);
      endTimeElement.attr('data-number',startTime);
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
    if(className==='checkStartPrd'){  //설정된 시작일이 오늘을 지났을 경우
      var prdTime = parseInt(paramDate+''+paramTime,10);
      var currentTime = parseInt(this._currentDate+''+Tw.DateHelper.getCurrentDateTime('HH'),10);
      if(prdTime>currentTime){
        returnValue = true;
      }else{
        this.$container.find('.bt-dropdown').attr('disabled','disabled');
        this.$container.find('#do_setting').attr('disabled','disabled');
        this.$container.find('.error-txt.start').text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_STARTED_PRD);
        this.$container.find('.error-txt.start').removeClass('none');
      }
    }else if((paramDate<=this._currentDate)&&(parseInt(paramTime,10)<=parseInt(Tw.DateHelper.getCurrentDateTime('HH'),10))){
      $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_START_TIME);
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
   * @returns {boolean}
   */
  _validateRoamingTimeValue : function(startDate,startTime,endDate,endTime){
    var returnValue = false;
    var startValue = parseInt(startDate+''+startTime,10);
    var endValue = parseInt(endDate+''+endTime,10);
    if(startValue>=endValue){
      var $errorsElement = this.$container.find('.error-txt.end');
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
        hbs: 'actionsheet_select_a_type',// hbs의 파일명
        layer: true,
        title: title,
        data: data
      },
      $.proxy(this._bindActionSheetElementEvt, this),
      $.proxy(function () {
        //$(evt.currentTarget).focus();
        this.$container.find('.fe-main-content').attr('aria-hidden',false);
      },this),
      'select_date',$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 설정 정보 변경 요청 함수
   * @param {Object} targetEvt 이벤트 객체
   * @returns {void}
   */
  _settingInformationSetting : function (targetEvt) {

    var userSettingInfo = {
      'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
      'svcEndDt' : this.$container.find('#end_date').attr('data-number'),
      'svcStartTm' : this.$container.find('#start_time').attr('data-number'),
      'svcEndTm' : this.$container.find('#end_time').attr('data-number'),
      'startEndTerm' : this._expireDate
    };
    if( //설정값 변동 없을경우 얼럿 출력
      userSettingInfo.svcStartDt===this._prodBffInfo.svcStartDt&&
      userSettingInfo.svcEndDt===this._prodBffInfo.svcEndDt&&
      userSettingInfo.svcStartTm===this._prodBffInfo.svcStartTm&&
      userSettingInfo.svcEndTm===this._prodBffInfo.svcEndTm
    ){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE,null,null,null,$(targetEvt.currentTarget));
      return;
    }


    this._apiService.request(Tw.API_CMD.BFF_10_0085, userSettingInfo, {},[this._prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){ //성공시 완료 팝업 출력
        this._showCompletePopup(this._prodBffInfo,targetEvt);
      }else{  //실패시 얼럿 출력
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
      }
    }, this)).
    fail($.proxy(function (err) {
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
  _tooltipInit : function (prodId,$tooltipHead,$tooltipBody) {
    switch (prodId) {
      case 'NA00006493':
      case 'NA00006494':
      case 'NA00006495':
      case 'NA00006496':
      case 'NA00006497':
      case 'NA00006498':
      case 'NA00006499':
      case 'NA00006500':
        $tooltipHead.find('button').attr('id','TC000037');
        this.$container.find('.tip_body_container').hide();
        this._twoMonthFlag = true;
        break;
      case 'NA00006489':
      case 'NA00006490':
      case 'NA00006491':
      case 'NA00006492':
        $tooltipHead.find('button').attr('id','TC000038');
        this.$container.find('.tip_body_container').hide();
        this._twoMonthFlag = true;
        break;
      case 'NA00005300':
      case 'NA00005505':
      case 'NA00005252':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_02');
        this.$container.find('.tip_body_container').hide();
        this._twoMonthFlag = true;
        break;
      case 'NA00005337':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_02');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00003178':
      case 'NA00003177':
      case 'NA00004226':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_03');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00006046':
      case 'NA00006048':
      case 'NA00006038':
      case 'NA00006040':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_04');
        this.$container.find('.tip_body_container').hide();
        this._twoMonthFlag = true;
        break;
      case 'NA00006050':
      case 'NA00006052':
      case 'NA00006042':
      case 'NA00006044':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_04');
        this.$container.find('.tip_body_container').hide();
        this._twoMonthFlag = true;
        break;
      case 'NA00005900':
        $tooltipHead.find('button').attr('id','TC000029');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00005699':
        $tooltipHead.find('button').attr('id','TC000029');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00005898':
        $tooltipHead.find('button').attr('id','TC000029');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00005902':
        $tooltipHead.find('button').attr('id','TC000029');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00006229':
        $tooltipHead.find('button').attr('id','TC000028');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00006226':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_04');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00006045':
      case 'NA00006053':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_04');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00005691':
      case 'NA00005694':
      case 'NA00005690':
      case 'NA00005693':
      case 'NA00005692':
      case 'NA00005695':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_01');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00006039':
      case 'NA00006049':
        $tooltipHead.find('button').attr('id','TC000007');
        //$tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000008');
        break;
      case 'NA00005901':
        $tooltipHead.find('button').attr('id','TC000009');
        //$tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000008');
        break;
      case 'NA00006041':
      case 'NA00006047':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_04');
        //$tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000008');
        break;
      case 'NA00005903':
        $tooltipHead.find('button').attr('id','TC000009');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00005747':
        $tooltipHead.find('button').attr('id','TC000009');
        //$tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000010');
        break;
      case 'NA00005301':
        $tooltipHead.find('button').attr('id','TC000011');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00006043':
      case 'NA00006051':
        //$tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000012');
        $tooltipHead.find('button').attr('id','TC000007');
        break;
      case 'NA00005899':
        //$tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000013');
        $tooltipHead.find('button').attr('id','TC000009');
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
