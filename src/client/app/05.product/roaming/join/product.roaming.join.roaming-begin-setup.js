/**
 * @file product.roaming.setting.roaming-setup.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.03
 */

Tw.ProductRoamingJoinRoamingBeginSetup = function (rootEl,prodTypeInfo,prodApiInfo,svcInfo,prodId) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodTypeInfo = JSON.parse(prodTypeInfo);
  this._prodApiInfo = prodApiInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this._currentDate = Tw.DateHelper.getCurrentShortDate();
  this.$serviceTipElement = this.$container.find('.tip-view.set-service-range');
  this._tooltipInit(prodId);
  this._bindBtnEvents();
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('#do_confirm'));
};

Tw.ProductRoamingJoinRoamingBeginSetup.prototype = {
  _bindBtnEvents: function () {
    this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
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
    var dateArr = this._getDateArrFromToDay(30);
    var convertedArr = this._convertDateArrForActionSheet(dateArr,'data-name="'+$(eventObj.currentTarget).attr('id')+'"',nowValue);
    var actionSheetData = this._makeActionSheetDate(convertedArr);
    if(nowValue.length<10){
      actionSheetData[0].list[0].option = 'checked';
    }
    actionSheetData[0].list[0].value+= ' ('+Tw.SELECTED_DATE_STRING.TODAY+')';
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
    this._validateDateValue();
    this._popupService.close();
  },
  _validateDateValue : function(){
    var startDate = this.$container.find('#start_date').attr('data-number');



    if(!isNaN(startDate)){
      this.$container.find('.bt-fixed-area button').removeAttr('disabled');
    }else{
      this.$container.find('.bt-fixed-area button').attr('disabled','disabled');
    }

  },
  _validateTimeValueAgainstNow : function(paramDate,paramTime,className){
    var returnValue = false;
    var $errorsElement = this.$container.find('.error-txt.'+className);
    if((paramDate===this._currentDate)&&(parseInt(paramTime,10)<=parseInt(Tw.DateHelper.getCurrentDateTime('HH'),10))){
      $errorsElement.removeClass('none');
    }else{
      returnValue = true;
      if(!$errorsElement.hasClass('none')){
        $errorsElement.addClass('none');
      }
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
        //$(targetEvn.currentTarget).focus();
        this.$container.find('.fe-main-content').attr('aria-hidden',false);
      },this),
      'select_date',$(targetEvt.currentTarget));
  },
  _doJoin : function(data,apiService,historyService,$containerData,targetEvt){

    var completePopupData = {
      prodNm : data.prodNm,
      processNm : Tw.PRODUCT_TYPE_NM.JOIN,
      isBasFeeInfo : data.prodFee,
      typeNm : data.prodType,
      settingType : data.processNm,
      btnNmList : [Tw.ROAMING_JOIN_STRING.MY_ROAMING_STATE]
    };
    apiService.request(Tw.API_CMD.BFF_10_0084, data.userJoinInfo, {},[data.prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
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
      null,null,$(evt.currentTarget));
  },
  _bindCancelPopupEvent : function (popupLayer) {
    $(popupLayer).on('click','.pos-left>button',$.proxy(this._goPlan,this));
  },
  _confirmInformationSetting : function (evt) {


    var userJoinInfo = {
      'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
      'svcEndDt' : '{}',
      'svcStartTm' : '{}',
      'svcEndTm' : '{}',
      'startEndTerm' : '{}'
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
      joinType : 'begin'
    };

    new Tw.ProductRoamingJoinConfirmInfo(this.$container,data,this._doJoin,this._showCancelAlart,'confirm_data',this,null,evt);

  },
  _tooltipInit : function (prodId) {
    switch (prodId) {
      case 'NA00003015':
        this.$container.find('.cont-box.nogaps-btm').css('display','block');
        this.$serviceTipElement.attr('id','RM_11_01_02_03_tip_01_01');
        break;
      case 'NA00004229':
      case 'NA00004230':
      case 'NA00004231':
        this.$serviceTipElement.attr('id','RM_11_01_02_03_tip_01_02');
        break;
    }
  }



};
