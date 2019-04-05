/**
 * FileName: product.roaming.join.roaming-alarm.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 */

Tw.ProductRoamingJoinRoamingAlarm = function (rootEl,prodTypeInfo,prodBffInfo,svcInfo,prodId) {

  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
  this._addedList = [];
  this._prodTypeInfo = JSON.parse(prodTypeInfo);
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this.$mainContent = this.$container.find('.fe-main-content');
  this._init();
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('#do_confirm'));
};

Tw.ProductRoamingJoinRoamingAlarm.prototype = {
  _init : function () {
    if(!Tw.BrowserHelper.isApp()){
      this.$container.find('#phone_book').hide();
    }
    this._bindElementEvt();
    this._changeList();
  },
  _bindElementEvt : function () {
    this.$container.on('keyup', '#input_phone', $.proxy(this._activateAddBtn, this));
    this.$container.on('blur', '#input_phone', $.proxy(this._inputBlurEvt, this));
    this.$container.on('focus', '#input_phone', $.proxy(this._inputFocusEvt, this));
    this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
    this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this));
    this.$container.on('click', '#do_confirm', $.proxy(this._confirmInformationSetting, this));
    this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
    this.$inputElement = this.$container.find('#input_phone');
    this.$addBtn = this.$container.find('#add_list');
    this.$confirmBtn = this.$container.find('#do_confirm');
    this.$alarmTemplate = this.$container.find('#alarm_template');
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._goBack,this));
  },
  _clearInput : function(){
    this.$inputElement.val('');
    this.$inputElement.trigger('keyup');
    this._activateAddBtn();
  },
  _inputBlurEvt : function(){
    var tempVal = this.$inputElement.val();
    tempVal = Tw.FormatHelper.addLineCommonPhoneNumberFormat(tempVal);
    this.$inputElement.attr('maxlength','13');
    this.$inputElement.val(tempVal);
    //this._activateAddBtn();
  },
  _inputFocusEvt : function(){
    var tempVal = this.$inputElement.val().replace(/\-/g,'');
    this.$inputElement.attr('maxlength','11');
    this.$inputElement.val(tempVal);
  },
  _addPhoneNumOnList : function (evt) {
    if(this._addedList.length>=5){
      this._openAlert(
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A7.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A7.TITLE,evt);
      return;
    }
    var targetValue = this.$inputElement.val();
    if(targetValue.indexOf('-')<0){
      targetValue = Tw.FormatHelper.addLineCommonPhoneNumberFormat(targetValue);
    }
    var tempPhoneNum = targetValue.split('-');
    //var phonReg = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
    var phoneObj = {
      'serviceNumber1' : tempPhoneNum[0],
      'serviceNumber2' : tempPhoneNum[1],
      'serviceNumber3' : tempPhoneNum[2]
    };
    for(var i=0;i<this._addedList.length;i++){
      if((this._addedList[i].serviceNumber1+this._addedList[i].serviceNumber2+this._addedList[i].serviceNumber3) ===
        (phoneObj.serviceNumber1+phoneObj.serviceNumber2+phoneObj.serviceNumber3)){
        this._openAlert(Tw.ROAMING_JOIN_STRING.DUPLICATE_LINE,Tw.POPUP_TITLE.NOTIFY,evt);
        return;
      }
    }
    if(!Tw.FormatHelper.isPhoneNum(phoneObj.serviceNumber1+phoneObj.serviceNumber2+phoneObj.serviceNumber3)){
      this._openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE,evt);
      return;
    }
    this._addedList.push(phoneObj);
    this._activateConfirmBtn();
    this._clearInput();
    this._changeList();
    this.$inputElement.blur();
  },
  _changeList : function(){
    this.$container.find('.list-box').remove();
    for(var i=0;i<this._addedList.length;i++){
      this._makeTemplate(this._addedList[i],i);
    }
    this._bindRemoveEvt();
    this._activateAddBtn();
    if(this._addedList.length<=0){
      this.$container.find('.list_contents').hide();
    }else{
      this.$container.find('.list_contents').show();
    }
    this.$inputElement.blur();
  },
  _showPhoneBook : function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._phoneBookCallBack,this));
  },
  _phoneBookCallBack : function(res){
    if (res.resultCode === Tw.NTV_CODE.CODE_00) {
      this.$inputElement.val(res.params.phoneNumber.replace(/\-/g,''));
      this.$inputElement.trigger('keyup');
      this.$inputElement.blur();
    }
  },
  _activateAddBtn : function (inputEvt) {
    if(inputEvt&&Tw.InputHelper.isEnter(inputEvt)){
      this.$addBtn.trigger('click');
    }
    var inputVal = this.$inputElement.val();
    var numReg = /[^0-9]/g;
    if(inputVal.length>0&&numReg.test(inputVal)){
      var changedValue = inputVal.replace(numReg,'');
      this.$inputElement.blur();
      this.$inputElement.val('');
      this.$inputElement.val(changedValue);
      this.$inputElement.focus();
      if(changedValue.length<=0){
        this.$container.find('.cancel').trigger('click');
      }
    }
    if(this.$inputElement.val().length>=10){
      this.$addBtn.removeAttr('disabled');
    }else{
      this.$addBtn.attr('disabled','disabled');
    }
    this._activateConfirmBtn();
  },
  _activateConfirmBtn : function () {
    if(this._addedList.length>=1){
      this.$confirmBtn.removeAttr('disabled');
    }else{
      this.$confirmBtn.attr('disabled','disabled');
    }
  },

  _makeTemplate : function (phoneNum,idx) {
    var maskedPhoneNum = {
      serviceNumber1 : phoneNum.serviceNumber1,
      serviceNumber2 : phoneNum.serviceNumber2,
      serviceNumber3 : phoneNum.serviceNumber3
    };
    var templateData = { phoneData : { phoneNum : maskedPhoneNum, idx : idx } };
    var handlebarsTemplate = Handlebars.compile(this.$alarmTemplate.html());
    this.$container.find('#alarm_list').append(handlebarsTemplate(templateData));
  },
  _removeEvt : function (btnEvt) {
    if(this._addedList.length<=1){
      this._openAlert(null,Tw.ALERT_MSG_PRODUCT.ALERT_NUMBER_MIN,btnEvt);
      return;
    }
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE,
      $.proxy(function () {
        this._popupService.close();
        this._removeOnList(btnEvt);
      },this),
      $.proxy(this._resetAriaHidden,this),
      Tw.BUTTON_LABEL.CLOSE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON,$(btnEvt.currentTarget));
  },
  _removeOnList : function (args) {
    var selectedIndex = parseInt($(args.currentTarget).attr('data-idx'),10);
    this._addedList.splice(selectedIndex,1);
    this._changeList();
  },
  _bindRemoveEvt : function () {
    this.$container.find('.list-btn button').on('click',$.proxy(this._removeOnList,this));
  },
  _doJoin : function(data,apiService,historyService,$containerData,target){


    apiService.request(Tw.API_CMD.BFF_10_0018, data.userJoinInfo, {},[data.prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        var completePopupData = {
          prodNm : data.prodNm,
          processNm : Tw.PRODUCT_TYPE_NM.JOIN,
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
        $containerData._openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,target);
      }
    }, this)).fail($.proxy(function (err) {
      $containerData._openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,target);
    }, this));
  },
  _bindCompletePopupBtnEvt : function(args1,args2){
    $(args2).on('click','.btn-round2',$.proxy(args1._goMyInfo,args1));
    $(args2).on('click','.btn-floating',$.proxy(args1._popupService.closeAll,args1._popupService));
  },
  _goMyInfo : function(){
    var targetUrl = this._prodTypeInfo.prodTypCd==='H_P'?'/product/roaming/my-use':'/product/roaming/my-use#add';
    this._popupService.closeAllAndGo(targetUrl);
  },
  _goBack : function(){
    this._historyService.goBack();
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
      $.proxy(this._resetAriaHidden,this),null,$(evt.currentTarget));
  },
  _openAlert : function (msg,title,evt) {
    this._popupService.openAlert(
      msg,
      title,
      null,
      $.proxy(function () {
        this.$addBtn.removeAttr('style');
        this._resetAriaHidden();
      }, this),null,$(evt.currentTarget)
    );
    if(!this.$addBtn.attr('disabled')){
      this.$addBtn.css({'pointer-events':'none','background':'#3b98e6'});
    }
  },
  _bindCancelPopupEvent : function (popupLayer) {
    $(popupLayer).on('click','.pos-left>button',$.proxy(this._goPlan,this));
  },
  _confirmInformationSetting : function (evt) {
    var userJoinInfo = {
      'svcNumList' : this._addedList
    };

    var data = {
      popupTitle : Tw.PRODUCT_TYPE_NM.JOIN,
      userJoinInfo : userJoinInfo,
      prodId : this._prodId,
      svcNum : Tw.FormatHelper.getDashedCellPhoneNumber(this._svcInfo.svcNum),
      processNm : Tw.PRODUCT_TYPE_NM.JOIN,
      prodType : Tw.NOTICE.ROAMING+' '+(this._prodTypeInfo.prodTypCd==='H_P'?Tw.PRODUCT_CTG_NM.PLANS:Tw.PRODUCT_CTG_NM.ADDITIONS),
      prodNm : this._prodBffInfo.preinfo.reqProdInfo.prodNm,
      prodFee : this._prodBffInfo.preinfo.reqProdInfo.basFeeInfo,
      description : this._prodBffInfo.preinfo.reqProdInfo.prodSmryDesc,
      autoInfo : this._prodBffInfo,
      showStipulation : Object.keys(this._prodBffInfo.stipulationInfo).length>0,
      joinType : 'alarm'
    };

    new Tw.ProductRoamingJoinConfirmInfo(this.$container,data,this._doJoin,this._showCancelAlart,'confirm_data',this,null,evt);

  },
  _resetAriaHidden : function () {
    this.$mainContent.attr('aria-hidden',false);
  }


};
