/**
 * FileName: product.roaming.setting.roaming-auto.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.03
 */

Tw.ProductRoamingSettingRoamingAuto = function (rootEl,prodTypeInfo,prodBffInfo,svcInfo,prodId,expireDate) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._prodTypeInfo = JSON.parse(prodTypeInfo);
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._expireDate = expireDate;
  this._apiService = Tw.Api;
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this.$tooltipHead = this.$container.find('#tip_head');
  this.$tooltipBody = this.$container.find('#tip_body');
  this._twoMonthFlag = false;
  this._dateSelectRange = 30;
  this._currentDate = Tw.DateHelper.getCurrentShortDate();
  this.$serviceTipElement = this.$container.find('.tip-view.set-service-range');
  this._init();
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('#do_setting'));
};

Tw.ProductRoamingSettingRoamingAuto.prototype = {
  _init : function(){
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
    var startDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcStartDt,this._showDateFormat,this._dateFormat);
    var endDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcEndDt,this._showDateFormat,this._dateFormat);
    var startTime = this._prodBffInfo.svcStartTm;
    var endTime = this._prodBffInfo.svcEndTm;
    this.$container.find('#start_date').text(startDate);
    this.$container.find('#start_date').attr('data-number',this._prodBffInfo.svcStartDt);
    this.$container.find('#end_date').text(endDate);
    this.$container.find('#end_date').attr('data-number',this._prodBffInfo.svcEndDt);
    this.$container.find('#start_time').text(startTime);
    this.$container.find('#start_time').attr('data-number',this._prodBffInfo.svcStartTm);
    this.$container.find('#end_time').text(endTime);
    this.$container.find('#end_time').attr('data-number',this._prodBffInfo.svcEndTm);
    this._checkSelectedEndDate(this._prodBffInfo.svcEndDt);
    this._validateTimeValueAgainstNow(this._prodBffInfo.svcStartDt,startTime,'checkStartPrd');
  },
  _checkSelectedEndDate : function (endDate) {
    if(this._currentDate>=endDate){
      this.$container.find('.bt-dropdown').attr('disabled','disabled');
      this.$container.find('#do_setting').attr('disabled','disabled');
    }
  },
  _bindBtnEvents: function () {
    this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
    this.$container.on('click', '.bt-dropdown.time', $.proxy(this._btnTimeEvent, this));
    this.$container.on('click','.bt-fixed-area #do_setting',$.proxy(this._settingInformationSetting, this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this));
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
    var changeTarget = this.$container.find('#'+dateAttr);
    changeTarget.text(dateValue);
    changeTarget.removeClass('placeholder');
    changeTarget.attr('data-number',dateValue.replace(/\.|\ /g, ''));
    changeTarget.attr('data-idx',$selectedTarget.parent().index());
    this._validateDateValue(eventObj.currentTarget.dataset.name);
    this._popupService.close();
  },
  _validateDateValue : function(targetId){
    var startDateElement = this.$container.find('#start_date');
    var startTimeElement = this.$container.find('#start_time');
    var startDate = startDateElement.attr('data-number');
    var startTime = startTimeElement.attr('data-number');
    var endDateElement = this.$container.find('#end_date');
    var endTimeElement = this.$container.find('#end_time');
    var startDateValidationResult = false;
    // var endDateValidationResult = false;

    if(!isNaN(startDate)&&!isNaN(startTime)){
      startDateValidationResult = this._validateTimeValueAgainstNow(startDate,startTime,'start');
    }

    if(startDateValidationResult){
      this.$container.find('.bt-fixed-area button').removeAttr('disabled');
    }else{
      this.$container.find('.bt-fixed-area button').attr('disabled','disabled');
    }
    var expireDate = parseInt(this._expireDate,10) + parseInt(startDateElement.attr('data-idx'),10);
    var endDate = Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,expireDate,'days',this._showDateFormat,this._dateFormat);
    if(targetId==='start_date'){
      endDateElement.attr('data-number',Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,
          expireDate,'days',this._dateFormat,this._dateFormat));
      endDateElement.text(endDate);
    }else{
      endTimeElement.text(startTime);
      endTimeElement.attr('data-number',startTime);
    }

  },
  _validateTimeValueAgainstNow : function(paramDate,paramTime,className){
    var returnValue = false;
    var $errorsElement = this.$container.find('.error-txt.'+className);
    if(className==='checkStartPrd'){
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
  _settingInformationSetting : function (targetEvt) {

    var userSettingInfo = {
      'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
      'svcEndDt' : this.$container.find('#end_date').attr('data-number'),
      'svcStartTm' : this.$container.find('#start_time').attr('data-number'),
      'svcEndTm' : this.$container.find('#end_time').attr('data-number'),
      'startEndTerm' : this._expireDate
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


    this._apiService.request(Tw.API_CMD.BFF_10_0085, userSettingInfo, {},[this._prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        this._showCompletePopup(this._prodBffInfo,targetEvt);
      }else{
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
      }
    }, this)).
    fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(targetEvt.currentTarget));
    }, this));
  },
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
  _bindCompletePopupBtnEvt : function (popupEvt) {
    $(popupEvt).on('click','.btn-floating.btn-style2',$.proxy(this._popupService.closeAll,this._popupService));
  },
  _goPlan : function () {
    this._popupService.closeAll();
    setTimeout($.proxy(this._historyService.goBack,this._historyService),0);
  },
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
  _convertPrice : function (priceVal) {
    if(!isNaN(priceVal)){
      priceVal = Tw.FormatHelper.addComma(priceVal)+Tw.CURRENCY_UNIT.WON;
    }
    return priceVal;
  }



};
