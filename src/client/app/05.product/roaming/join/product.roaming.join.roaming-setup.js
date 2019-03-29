/**
 * FileName: product.roaming.setting.roaming-setup.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.11.28
 */

Tw.ProductRoamingJoinRoamingSetup = function (rootEl,prodTypeInfo,prodApiInfo,svcInfo,prodId,isPromotion) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodTypeInfo = JSON.parse(prodTypeInfo);
  this._prodApiInfo = prodApiInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this.$serviceTipElement = this.$container.find('.tip-view-btn.set-service-range');
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this._isPromotion = isPromotion;
  this._currentDate = Tw.DateHelper.getCurrentShortDate();
  this._bindBtnEvents();
  this._tooltipInit(prodId);
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('#do_confirm'));
};

Tw.ProductRoamingJoinRoamingSetup.prototype = {
  _bindBtnEvents: function () {
    this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
    this.$container.on('click', '.bt-dropdown.time', $.proxy(this._btnTimeEvent, this));
    this.$container.on('click','.bt-fixed-area #do_confirm',$.proxy(this._confirmInformationSetting, this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this._historyService));
    if(this._isPromotion){
      this._numReg = /[^0-9]/g;
      this._validatedGiftPhoneNum = '010';
      this._promotionValidState = true;
      this.$container.on('click','.fe-selected-number.head',$.proxy(this._showPhoneHeadSelector,this));
      this.$container.on('keyup','.fe-selected-number',$.proxy(function () {
        this._promotionValidState = false;
      },this));
      this.$container.on('click','#fe_request_gift',$.proxy(this._requestGiftData,this));
      this.$container.on('keyup','.fe-selected-number.fe-input-number',$.proxy(this._checkGiftNum,this));
      this.$giftNumberInput = this.$container.find('.fe-selected-number');
      this._numberHeadArr = [
        {option : '' , value : '010' , attr : 'data-number=010'},
        {option : '' , value : '011' , attr : 'data-number=011'},
        {option : '' , value : '017' , attr : 'data-number=017'},
        {option : '' , value : '016' , attr : 'data-number=016'},
        {option : '' , value : '018' , attr : 'data-number=018'},
        {option : '' , value : '019' , attr : 'data-number=019'}
      ];
    }
  },
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
  _convertDateArrForActionSheet : function(dateArr,attr,nowValue){
    var returnArr = [];
    for(var i=0;i<dateArr.length;i++){
      returnArr.push({'value':dateArr[i],'option':nowValue===dateArr[i]?'checked':'','attr':attr});
    }
    return returnArr;
  },
  _getTimeArr : function(){
    var timeArr = [];
    for(var i=0;i<24;i++){
      timeArr.push(i<10?'0'+i:''+i);
    }
    return timeArr;
  },
  _makeActionSheetDate : function(data){
    var returnActionSheetData = [
      {
        'list': data
      }
    ];
    return returnActionSheetData;
  },
  _btnDateEvent : function(eventObj){
    if(this._historyService.getHash()==='#select_date_P'){
      return;
    }
    var $currentTarget = $(eventObj.currentTarget);
    var nowTargetId = $currentTarget.attr('id');
    var nowValue = $currentTarget.text().trim();
    var dateArr = this._getDateArrFromToDay(nowTargetId==='end_date'?60:30);
    var convertedArr = this._convertDateArrForActionSheet(dateArr,'data-name="'+nowTargetId+'"',nowValue);
    var actionSheetData = this._makeActionSheetDate(convertedArr);
    if(nowValue.length<10){
      actionSheetData[0].list[0].option = 'checked';
    }
    actionSheetData[0].list[0].value+= ' ('+Tw.SELECTED_DATE_STRING.TODAY+')';
    this._openSelectDatePop(actionSheetData,'',eventObj);
  },
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

  _bindActionSheetElementEvt : function($layer){
    $layer.on('click', '.chk-link-list button', $.proxy(this._actionSheetElementEvt, this));
    //$layer.on('click', '.popup-closeBtn', $.proxy(this._actionSheetCloseEvt, this));
  },
  _actionSheetElementEvt : function(eventObj){
    $(eventObj.delegateTarget).find('button').removeClass('checked');
    $(eventObj.currentTarget).addClass('checked');
    this._actionSheetCloseEvt(eventObj);
  },
  _actionSheetCloseEvt : function(eventObj){
    var $selectedTarget = $(eventObj.delegateTarget).find('.chk-link-list button.checked');
    var dateValue = $selectedTarget.text().trim().substr(0,13);
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
    changeTarget.attr('data-idx',$selectedTarget.parent().index());
    this._validateDateValue(changeTarget.attr('id'));
    this._popupService.close();
  },
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
      if(endDate===this._currentDate){
        endDateValidationResult = false;
        $endErrElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_DATE);
        if($endErrElement.hasClass('none')){
          $endErrElement.removeClass('none');
        }
      }else{
        $endErrElement.addClass('none');
      }
    }
    if(!isNaN(endDate)&&!isNaN(startDate)){
      if(endDate<=startDate){
        if(selectedDateTypeId.indexOf('end')>-1){
          endDateValidationResult = false;
          this.$container.find('.error-txt.end').removeClass('none').text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_END);
          if(!this.$container.find('.error-txt.start').hasClass('none')){
            this.$container.find('.error-txt.start').addClass('none');
          }
        }else{
          startDateValidationResult = false;
          this.$container.find('.error-txt.start').removeClass('none').text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_START);
          if(!this.$container.find('.error-txt.end').hasClass('none')){
            this.$container.find('.error-txt.end').addClass('none');
          }
        }
      }else{
        this.$container.find('.error-txt.start').addClass('none');
        this.$container.find('.error-txt.end').addClass('none');
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
  _validateTimeValueAgainstNow : function(paramDate,paramTime,className){
    var returnValue = false;
    var $errorsElement = this.$container.find('.error-txt.'+className);
    if((paramDate===this._currentDate)&&(parseInt(paramTime,10)<=parseInt(Tw.DateHelper.getCurrentDateTime('HH'),10))){
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
  _openSelectDatePop: function (data,title,targetEvt) {
    this._popupService.open({
        hbs: 'actionsheet_select_a_type',// hbs의 파일명
        layer: true,
        title: title,
        data: data
      },
      $.proxy(this._bindActionSheetElementEvt, this),
      $.proxy(function () {
        this.$container.find('.fe-main-content').attr('aria-hidden',false);
      },this),
      'select_date',$(targetEvt.currentTarget));
  },
  _doJoin : function(data,apiService,historyService,$containerData,targetEvt){
    apiService.request(Tw.API_CMD.BFF_10_0084, data.userJoinInfo, {},[data.prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        var completePopupData = {
          prodNm : data.prodNm,
          isBasFeeInfo : data.prodFee,
          typeNm : data.prodType,
          settingType : data.processNm,
          btnNmList : [Tw.ROAMING_JOIN_STRING.MY_ROAMING_STATE]
        };
        $containerData._popupService.open({
            hbs: 'complete_product_roaming',
            layer: true,
            data : completePopupData
          },
          $.proxy($containerData._bindCompletePopupBtnEvt,this,$containerData),
          $.proxy($containerData._goPlan,$containerData),
          'complete');
      }else{
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
    }, this));
  },
  _bindCompletePopupBtnEvt : function($args1,$args2){
    $($args2).on('click','.btn-round2',$.proxy($args1._goMyInfo,$args1));
    $($args2).on('click','.btn-floating',$.proxy($args1._popupService.closeAll,$args1._popupService));
  },
  _goMyInfo : function(){
    var targetUrl = this._prodTypeInfo.prodTypCd==='H_P'?'/product/roaming/my-use':'/product/roaming/my-use#add';
    this._popupService.closeAllAndGo(targetUrl);
  },
  _goPlan : function () {
    this._popupService.closeAll();
    setTimeout($.proxy(this._historyService.goBack,this._historyService),0);
  },
  _showCancelAlart : function (evt){
    var alert = Tw.ALERT_MSG_PRODUCT.ALERT_3_A1;
    this._popupService.openModalTypeATwoButton(alert.TITLE, alert.MSG, Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null,
      $.proxy(this._goPlan,this),
      null,$(evt.currentTarget));
  },
  _bindCancelPopupEvent : function (popupLayer) {
    $(popupLayer).on('click','.pos-left>button',$.proxy(this._goPlan,this));
  },
  _confirmInformationSetting : function (evt) {
    var startDtIdx = parseInt(this.$container.find('#start_date').attr('data-idx'),10);
    var endDtIdx = parseInt(this.$container.find('#end_date').attr('data-idx'),10);

    var userJoinInfo = {
      'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
      'svcEndDt' : this.$container.find('#end_date').attr('data-number'),
      'svcStartTm' : this.$container.find('#start_time').attr('data-number'),
      'svcEndTm' : this.$container.find('#end_time').attr('data-number'),
      'startEndTerm' : String(endDtIdx - startDtIdx + 1)
    };

    if(this._isPromotion===true){
      var giftNum = this._getGiftNum();
      if(giftNum.length===3){
        this._promotionValidState = true;
        this._validatedGiftPhoneNum = giftNum;
        delete userJoinInfo.bnftSvcNum;
      }else{
        userJoinInfo.bnftSvcNum = giftNum;
      }

      if(this._validatedGiftPhoneNum!==giftNum||this._promotionValidState===false){
        this._popupService.openAlert(null,Tw.ALERT_MSG_PRODUCT.ALERT_3_A90.TITLE,null,null,null,$(evt.currentTarget));
        return;
      }
    }
    var data = {
      popupTitle : Tw.PRODUCT_TYPE_NM.JOIN,
      userJoinInfo : userJoinInfo,
      prodId : this._prodId,
      svcNum : Tw.FormatHelper.getDashedCellPhoneNumber(this._svcInfo.svcNum),
      processNm : Tw.PRODUCT_TYPE_NM.JOIN,
      prodType : Tw.NOTICE.ROAMING+' '+(this._prodTypeInfo.prodTypCd==='H_P'?Tw.PRODUCT_CTG_NM.PLANS:Tw.PRODUCT_CTG_NM.ADDITIONS),
      prodNm : this._prodApiInfo.preinfo.reqProdInfo.prodNm,
      prodFee : this._prodApiInfo.preinfo.reqProdInfo.basFeeInfo,
      description : this._prodApiInfo.preinfo.reqProdInfo.prodSmryDesc,
      autoInfo : this._prodApiInfo,
      showStipulation : Object.keys(this._prodApiInfo.stipulationInfo).length>0,
      joinType : 'setup'

    };
    new Tw.ProductRoamingJoinConfirmInfo(this.$container,data,this._doJoin,this._showCancelAlart,'confirm_data',this,null,evt);

  },
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
  _getGiftNum : function () {
    var phoneHead = $(this.$giftNumberInput[0]).text();
    var phoneMiddle = $(this.$giftNumberInput[1]).val();
    var phoneTail = $(this.$giftNumberInput[2]).val();
    return phoneHead+''+phoneMiddle+''+phoneTail;
  },
  _showPhoneHeadSelector : function (targetEvt) {
    var $target = $(targetEvt.currentTarget);
    var nowValue = $target.text();
    for(var idx in this._numberHeadArr){
      if(this._numberHeadArr[idx].value===nowValue){
        this._numberHeadArr[idx].option = 'checked';
      }else{
        this._numberHeadArr[idx].option = '';
      }
    }
    this._popupService.open({
          hbs: 'actionsheet_select_a_type',// hbs의 파일명
          layer: true,
          data: [{list : this._numberHeadArr}]
        },
        $.proxy(this._bindNumberSelectorEvt,this),
        $.proxy(function () {
          this.$container.find('.fe-main-content').attr('aria-hidden',false);
        },this),
        null,$target);
  },
  _bindNumberSelectorEvt : function (targetEvt) {
    $(targetEvt).on('click', '.chk-link-list button', $.proxy(function (evt) {
      this.$container.find('.fe-selected-number.head').text($(evt.currentTarget).data('number'));
      this._validatedGiftPhoneNum = this._getGiftNum();
      this._popupService.close();
    }, this));
  },
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
  }
};
