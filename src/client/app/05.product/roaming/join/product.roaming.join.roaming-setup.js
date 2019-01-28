/**
 * FileName: product.roaming.setting.roaming-setup.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.11.28
 */

Tw.ProductRoamingJoinRoamingSetup = function (rootEl,prodTypeInfo,prodApiInfo,svcInfo,prodId) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodTypeInfo = JSON.parse(prodTypeInfo);
  this._prodApiInfo = prodApiInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this.$serviceTipElement = this.$container.find('.tip-view.set-service-range');
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this._currentDate = Tw.DateHelper.getCurrentShortDate();
  this._bindBtnEvents();
  this._tooltipInit(prodId);
};

Tw.ProductRoamingJoinRoamingSetup.prototype = {
  _bindBtnEvents: function () {
    this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
    this.$container.on('click', '.bt-dropdown.time', $.proxy(this._btnTimeEvent, this));
    this.$container.on('click','.bt-fixed-area #do_confirm',$.proxy(this._confirmInformationSetting, this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this._historyService));
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
    var nowValue = $(eventObj.currentTarget).text().trim();
    var dateArr = this._getDateArrFromToDay(30);
    var convertedArr = this._convertDateArrForActionSheet(dateArr,'data-name="'+$(eventObj.currentTarget).attr('id')+'"',nowValue);
    var actionSheetData = this._makeActionSheetDate(convertedArr);
    if(nowValue.length<10){
      actionSheetData[0].list[0].option = 'checked';
    }
    actionSheetData[0].list[0].value+= ' ('+Tw.SELECTED_DATE_STRING.TODAY+')';
    this._openSelectDatePop(actionSheetData,'');
  },
  _btnTimeEvent : function(eventObj){
    var nowValue = $(eventObj.currentTarget).text().trim();
    var timeArr = this._getTimeArr();
    var convertedArr = this._convertDateArrForActionSheet(timeArr,'data-name="'+$(eventObj.currentTarget).attr('id')+'"',nowValue);
    var actionSheetData = this._makeActionSheetDate(convertedArr);
    this._openSelectDatePop(actionSheetData,'');
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
    if(startValue>=endValue){
      var $errorsElement;
      if(selectedTimeTypeId.indexOf('end')>-1){
        $errorsElement = this.$container.find('.error-txt.end');
        $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_END);
      }else{
        $errorsElement = this.$container.find('.error-txt.start');
        $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_END_EVT_START);
      }
      $errorsElement.removeClass('none');
    }else{
      returnValue = true;
    }
    return returnValue;
  },
  _openSelectDatePop: function (data,title) {
    this._popupService.open({
        hbs: 'actionsheet_select_a_type',// hbs의 파일명
        layer: true,
        title: title,
        data: data
      },
      $.proxy(this._bindActionSheetElementEvt, this),
      null,
      'select_date');
  },
  _doJoin : function(data,apiService,historyService,$containerData){
    apiService.request(Tw.API_CMD.BFF_10_0084, data.userJoinInfo, {},[data.prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        var completePopupData = {
          prodNm : data.prodNm,
          isBasFeeInfo : data.prodFee,
          typeNm : data.prodType,
          settingType : data.processNm,
          btnNmList : [Tw.BENEFIT.DISCOUNT_PGM.SELECTED.FINISH.LINK_TITLE]
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
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.ERROR);
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.ERROR);
    }, this));
  },
  _bindCompletePopupBtnEvt : function($args1,$args2){
    $($args2).on('click','.btn-round2',$.proxy($args1._goMyInfo,$args1));
    $($args2).on('click','.btn-floating',$.proxy($args1._goPlan,$args1));
  },
  _goMyInfo : function(){
    var targetUrl = this._prodTypeInfo.prodTypCd==='H_P'?'/product/roaming/my-use':'/product/roaming/my-use#add';
    this._historyService.goLoad(targetUrl);
  },
  _goPlan : function () {
    this._popupService.closeAll();
    this._historyService.goBack();
  },
  _showCancelAlart : function (){
    var alert = Tw.ALERT_MSG_PRODUCT.ALERT_3_A1;
    this._popupService.openModalTypeATwoButton(alert.TITLE, alert.MSG, Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null,
      $.proxy(this._goPlan,this),
      null);
  },
  _bindCancelPopupEvent : function (popupLayer) {
    $(popupLayer).on('click','.pos-left>button',$.proxy(this._goPlan,this));
  },
  _confirmInformationSetting : function () {
    var startDtIdx = parseInt(this.$container.find('#start_date').attr('data-idx'),10);
    var endDtIdx = parseInt(this.$container.find('#end_date').attr('data-idx'),10);

    var userJoinInfo = {
      'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
      'svcEndDt' : this.$container.find('#end_date').attr('data-number'),
      'svcStartTm' : this.$container.find('#start_time').attr('data-number'),
      'svcEndTm' : this.$container.find('#end_time').attr('data-number'),
      'startEndTerm' : String(endDtIdx - startDtIdx + 1)
    };

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
    new Tw.ProductRoamingJoinConfirmInfo(this.$container,data,this._doJoin,this._showCancelAlart,'confirm_data',this);

  },
  _tooltipInit : function (prodId) {

    switch (prodId) {
      case 'NA00004088':
      case 'NA00004299':
      case 'NA00004326':
      case 'NA00005047':
      case 'NA00005502':
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
  }


};
