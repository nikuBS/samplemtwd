/**
 * @file product.roaming.setting.roaming-auto.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.03
 */
/**
 * @class
 * @desc 로밍 종료일 자동설정 가입 페이지
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {String} prodTypeInfo - 상품 원장 정보
 * @param {Object} prodApiInfo – 상품 상세 정보
 * @param {Object} svcNum - 유저 전화번호
 * @param {String} prodId - 상품 id
 * @param {String} expireDate - 상품 서비스 기간
 * @returns {void}
 */
Tw.ProductRoamingJoinRoamingAuto = function (rootEl,prodTypeInfo,prodApiInfo,svcNum,prodId,expireDate) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodTypeInfo = JSON.parse(prodTypeInfo);
  this._prodApiInfo = prodApiInfo;
  this._svcNum = svcNum;
  this._prodId = prodId;
  this._expireDate = expireDate;
  this.$tooltipHead = this.$container.find('#tip_head');
  this.$tooltipBody = this.$container.find('#tip_body');
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this._dateSelectRange = 30;
  this._twoMonthFlag = false;
  this._currentDate = Tw.DateHelper.getCurrentShortDate();
  this._init();
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('#do_confirm'));
};

Tw.ProductRoamingJoinRoamingAuto.prototype = {
  /**
   * @function
   * @member
   * @desc 초기화 함수
   * @returns {void}
   */
  _init : function () {
    this._tooltipInit(this._prodId,this.$tooltipHead,this.$tooltipBody);
    if(this._twoMonthFlag){
      // this._dateSelectRange = -1*(Tw.DateHelper.getDiffByUnit(this._currentDate,
      //   Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,2,'month',this._dateFormat,this._dateFormat),'day'));
      this._dateSelectRange = 60;
      this.$container.find('#aria-dateset1').text(Tw.ROAMING_RANGE_OPTION_STR.TWO_MONTH);
    }else{
      this.$container.find('#aria-dateset1').text(Tw.ROAMING_RANGE_OPTION_STR.ONE_MONTH);
    }
    this._bindBtnEvents();
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
    this.$container.on('click','.bt-fixed-area #do_confirm',$.proxy(this._confirmInformationSetting, this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this._historyService));
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
    var nowValue = $(eventObj.currentTarget).text().trim();
    var dateArr = this._getDateArrFromToDay(this._dateSelectRange);
    var convertedArr = this._convertDateArrForActionSheet(dateArr,'data-name="'+$(eventObj.currentTarget).attr('id')+'"',nowValue);
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
    var changeTarget = this.$container.find('#'+dateAttr);
    changeTarget.text(dateValue);
    changeTarget.removeClass('placeholder');
    changeTarget.attr('data-number',dateValue.replace(/\.|\ /g, ''));
    changeTarget.attr('data-idx',$selectedTarget.parents('li').index());
    this._validateDateValue();
    this._popupService.close();
  },
  /**
   * @function
   * @member
   * @desc 선택한 날짜 검증
   * @returns {void}
   */
  _validateDateValue : function(){
    var startDateElement = this.$container.find('#start_date');
    var startTimeElement = this.$container.find('#start_time');
    var startDate = startDateElement.attr('data-number');
    var startTime = startTimeElement.attr('data-number');
    var endDateElement = this.$container.find('#end_date');
    var endTimeElement = this.$container.find('#end_time');
    var startDateValidationResult = false;
    // var endDateValidationResult = false;
    //시작일 날짜, 시간 입력시
    if(!isNaN(startDate)&&!isNaN(startTime)){
      startDateValidationResult = this._validateTimeValueAgainstNow(startDate,startTime,'start');
    }
    //시작일 정상 입력 했을 경우
    if(startDateValidationResult){
      this.$container.find('.bt-fixed-area button').removeAttr('disabled');
      //종료일 자동 설정
      var expireDate = parseInt(this._expireDate,10) + parseInt(startDateElement.attr('data-idx'),10);
      var endDate = Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,expireDate,'days',this._showDateFormat,this._dateFormat);
      endDateElement.text(endDate);
      endDateElement.attr('data-number',Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,
        expireDate,'days',this._dateFormat,this._dateFormat));
      endTimeElement.text(startTime);
    }else{
      //시작일 정상 입력 아닐 경우
      this.$container.find('.bt-fixed-area button').attr('disabled','disabled');
      endDateElement.text(Tw.POPUP_TITLE.SELECT);
      endTimeElement.text(Tw.POPUP_TITLE.SELECT);
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
  _openSelectDatePop: function (data,title,targetEvt) {
    this._popupService.open({
        hbs: 'actionsheet01',// hbs의 파일명
        layer: true,
        title: title,
        data: data,
        btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._bindActionSheetElementEvt, this),
      $.proxy(function () {
        //$(targetEvt.currentTarget).focus();
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
    Tw.CommonHelper.startLoading('.popup-page', 'white');
    var completePopupData = {
      prodNm : data.prodNm,
      processNm : Tw.PRODUCT_TYPE_NM.JOIN,
      isBasFeeInfo : data.prodFee,
      typeNm : data.prodType,
      settingType : data.processNm,
      btnNmList : [Tw.ROAMING_JOIN_STRING.MY_ROAMING_STATE]
    };
    //로밍 함께쓰기 상품은 회선설정 가능하도록
    if(containerData._prodId==='NA00005690'||containerData._prodId==='NA00005693'){
      completePopupData.btnNmList.unshift(Tw.ROAMING_JOIN_STRING.COMBINE_LINE);
    }
    //가입 API 요청
    apiService.request(Tw.API_CMD.BFF_10_0084, data.userJoinInfo, {},[data.prodId]).
    done($.proxy(function (res) {
      Tw.CommonHelper.endLoading('.popup-page');
      if(res.code===Tw.API_CODE.CODE_00){
        containerData._popupService.open({
            hbs: 'complete_product_roaming',
            layer: true,
            data : completePopupData
          },
          $.proxy(containerData._bindCompletePopupBtnEvt,this,containerData),
          $.proxy(containerData._goPlan,containerData),
          'complete');
      }else{
        //실패시 노티 출력
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
      }
    }, this)).fail($.proxy(function (err) {
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
    $(args2).on('click','.btn-floating',$.proxy(args1._popupService.closeAll,args1._popupService));
    //로밍 데이터 함께쓰기일 경우 회선 설정 이동 가능 하도록
    if(args1._prodId==='NA00005690'||args1._prodId==='NA00005693'){
      $(args2).on('click','#btn0.btn-round2',$.proxy(args1._goSetting,args1));
      $(args2).on('click','#btn1.btn-round2',$.proxy(args1._goMyInfo,args1));
    }else{
      $(args2).on('click','.btn-round2',$.proxy(args1._goMyInfo,args1));
    }
  },
  /**
   * @function
   * @member
   * @desc 나의 로밍 이용현황 이동 함수
   * @returns {void}
   */
  _goMyInfo : function(){
    //로밍요금제 , 로밍 부가서비스에 맞춰 페이지 이동
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
   * @desc 회선 설정페이지 이동 함수
   * @returns {void}
   */
  _goSetting : function(){
    this._popupService.closeAllAndGo('/product/roaming/setting/roaming-combine?prod_id='+this._prodId);
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
      null,null,$(evt.currentTarget));
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
    //가입 API호출 데이터
    var userJoinInfo = {
      'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
      'svcEndDt' : this.$container.find('#end_date').attr('data-number'),
      'svcStartTm' : this.$container.find('#start_time').attr('data-number'),
      'svcEndTm' : this.$container.find('#start_time').attr('data-number'),
      'startEndTerm' : this._expireDate
    };
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
      agreeCnt : this._agreeCnt,
      joinType : 'auto'
    };
    //정보확인 팝업 출력
    new Tw.ProductRoamingJoinConfirmInfo(this.$container,data,this._doJoin,this._showCancelAlart,'confirm_data',this,null,evt);
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
  }

};
