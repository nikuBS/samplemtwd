/**
 * FileName: product.roaming.setting.roaming-auto.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.03
 */

Tw.ProductRoamingJoinRoamingAuto = function (rootEl,prodRedisInfo,prodApiInfo,svcInfo,prodId,expireDate) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodRedisInfo = JSON.parse(prodRedisInfo);
  this._prodApiInfo = prodApiInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._expireDate = expireDate;
  this.$tooltipHead = this.$container.find('#tip_head');
  this.$tooltipBody = this.$container.find('#tip_body');
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this._currentDate = Tw.DateHelper.getCurrentShortDate();
  this._tooltipInit(prodId,this.$tooltipHead,this.$tooltipBody);
  this._bindBtnEvents();
};

Tw.ProductRoamingJoinRoamingAuto.prototype = {
  _bindBtnEvents: function () {
    this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
    this.$container.on('click', '.bt-dropdown.time', $.proxy(this._btnTimeEvent, this));
    this.$container.on('click','.bt-fixed-area #do_confirm',$.proxy(this._confirmInformationSetting, this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._showCancelAlart,this));
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
    var changeTarget = this.$container.find('#'+dateAttr);
    changeTarget.text(dateValue);
    changeTarget.removeClass('placeholder');
    changeTarget.attr('data-number',dateValue.replace(/\.|\ /g, ''));
    changeTarget.attr('data-idx',$selectedTarget.parent().index());
    this._validateDateValue();
    this._popupService.close();
  },
  _validateDateValue : function(){
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
      var expireDate = parseInt(this._expireDate,10) + parseInt(startDateElement.attr('data-idx'),10);
      var endDate = Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,expireDate,'days',this._showDateFormat,this._dateFormat);
      endDateElement.text(endDate);
      endDateElement.attr('data-number',Tw.DateHelper.getShortDateWithFormatAddByUnit(this._currentDate,expireDate,'days',this._dateFormat,this._dateFormat));
      endTimeElement.text(startTime);
    }else{
      this.$container.find('.bt-fixed-area button').attr('disabled','disabled');
      endDateElement.text(Tw.POPUP_TITLE.SELECT);
      endTimeElement.text(Tw.POPUP_TITLE.SELECT);
    }

  },
  _validateTimeValueAgainstNow : function(paramDate,paramTime,className){
    var returnValue = false;
    var $errorsElement = this.$container.find('.error-txt.'+className);
    if((paramDate===this._currentDate)&&(parseInt(paramTime,10)<=parseInt(Tw.DateHelper.getCurrentDateTime('HH'),10))){
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
  _openSelectDatePop: function (data,title) {
    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: title,
        data: data
      },
      $.proxy(this._bindActionSheetElementEvt, this),
      null,
      'select_date');
  },
  _doJoin : function(data,apiService,historyService,$containerData){
    var completePopupData = {
      prodNm : data.prodNm,
      processNm : Tw.PRODUCT_TYPE_NM.JOIN,
      isBasFeeInfo : data.prodFee,
      typeNm : data.svcType,
      settingType : (data.svcType+' '+data.processNm),
      btnNmList : [Tw.BENEFIT.DISCOUNT_PGM.SELECTED.FINISH.LINK_TITLE]
    };
    if($containerData._prodId==='NA00005690'||$containerData._prodId==='NA00005693'){
      completePopupData.btnNmList.unshift(Tw.ROAMING_COMBINE_LINE_STRING.COMBINE_LINE);
    }
    apiService.request(Tw.API_CMD.BFF_10_0084, data.userJoinInfo, {},[data.prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        this._popupService.open({
            hbs: 'complete_product_roaming',
            layer: true,
            data : completePopupData
          },
          $.proxy($containerData._bindCompletePopupBtnEvt,this,$containerData),
          null,
          'complete');
      }else{
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.ERROR);
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.ERROR);
    }, this));
  },
  _bindCompletePopupBtnEvt : function($args1,$args2){
    $($args2).on('click','.btn-floating',$.proxy($args1._goPlan,$args1,-3));

    if($args1._prodId==='NA00005690'||$args1._prodId==='NA00005693'){
      $($args2).on('click','#btn0.btn-round2',$.proxy($args1._goSetting,$args1));
      $($args2).on('click','#btn1.btn-round2',$.proxy($args1._goMyInfo,$args1));
    }else{
      $($args2).on('click','.btn-round2',$.proxy($args1._goMyInfo,$args1));
    }
  },
  _goMyInfo : function(){
    this._historyService.goLoad('/product/roaming/my-use');
  },
  _goPlan : function (idx) {
    this._historyService.go(idx);
  },
  _goSetting : function(){
    this._historyService.goLoad('/product/roaming/join/roaming-combine?prod_id='+this._prodId);
  },
  _showCancelAlart : function (){
    var alert = Tw.ALERT_MSG_PRODUCT.ALERT_3_A1;
    this._popupService.openModalTypeATwoButton(alert.TITLE, alert.MSG, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES,
      $.proxy(this._bindCancelPopupEvent,this),
      $.proxy(this._popupService.close,this),
      null);
  },
  _bindCancelPopupEvent : function (popupLayer) {
    $(popupLayer).on('click','.pos-left>button',$.proxy(this._goPlan,this,-1));
  },
  _confirmInformationSetting : function () {

    var userJoinInfo = {
      'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
      'svcEndDt' : this.$container.find('#end_date').attr('data-number'),
      'svcStartTm' : this.$container.find('#start_time').attr('data-number'),
      'svcEndTm' : this.$container.find('#start_time').attr('data-number'),
      'startEndTerm' : this._expireDate
    };

    var data = {
      popupTitle : Tw.PRODUCT_TYPE_NM.JOIN,
      userJoinInfo : userJoinInfo,
      prodId : this._prodId,
      svcNum : Tw.FormatHelper.getDashedCellPhoneNumber(this._svcInfo.svcNum),
      processNm : Tw.PRODUCT_TYPE_NM.JOIN,
      prodType : Tw.NOTICE.ROAMING+' '+Tw.PRODUCT_CTG_NM.PLANS,
      svcType : Tw.PRODUCT_CTG_NM.ADDITIONS,
      prodNm : this._prodRedisInfo.prodNm,
      prodFee : this._prodRedisInfo.basFeeInfo,
      description : this._prodRedisInfo.prodSmryDesc,
      autoInfo : this._prodApiInfo,
      agreeCnt : this._agreeCnt,
      joinType : 'auto'
    };

    new Tw.ProductRoamingJoinConfirmInfo(this.$container,data,this._doJoin,null,'confirm_data',this);
  },
  _tooltipInit : function (prodId,$tooltipHead,$tooltipBody) {
    switch (prodId) {
      case 'NA00005252':
      case 'NA00005300':
      case 'NA00005505':
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
      case 'NA00005900':
      case 'NA00006050':
      case 'NA00006052':
      case 'NA00006042':
      case 'NA00006044':
      case 'NA00005902':
      case 'NA00005699':
      case 'NA00005898':
      case 'NA00006226':
      case 'NA00006229':
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
        $tooltipHead.find('button').attr('id','TC000007');
        $tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000008');
        break;
      case 'NA00005901':
        $tooltipHead.find('button').attr('id','TC000009');
        $tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000008');
        break;
      case 'NA00006041':
      case 'NA00006047':
        $tooltipHead.find('button').attr('id','RM_11_01_02_05_tip_01_04');
        $tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000008');
        break;
      case 'NA00005903':
        $tooltipHead.find('button').attr('id','TC000009');
        this.$container.find('.tip_body_container').hide();
        break;
      case 'NA00005747':
        $tooltipHead.find('button').attr('id','TC000009');
        $tooltipBody.find('span').text(Tw.TOOLTIP_TITLE.ROAMING_SERVICE_CAUTION);
        $tooltipBody.find('button').attr('id','TC000010');
        break;
      case 'NA00005301':
        $tooltipHead.find('button').attr('id','TC000011');
        this.$container.find('.tip_body_container').hide();
        break;
    }
  }

};
