/**
 * @file product.roaming.setting.roaming-alarm.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.05
 * ID : RM_11_01_02_01
 */

Tw.ProductRoamingSettingRoamingAlarm = function (rootEl,prodTypeInfo,prodBffInfo,svcInfo,prodId) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
  this._addedList = this._sortingSettingData(prodBffInfo.combinationLineList);
  this._prodTypeInfo = prodTypeInfo;
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._apiService = Tw.Api;
  this._init();
  this._showAuthState = false;
  //this._changeList();
};

Tw.ProductRoamingSettingRoamingAlarm.prototype = {
  _init : function () {
    if(!Tw.BrowserHelper.isApp()){
      this.$container.find('#phone_book').hide();
    }
    this._bindElementEvt();
  },
  _bindElementEvt : function () {
    this.$container.on('click','.fe-btn_del_num',$.proxy(this._removeEvt,this));
    this.$inputElement = this.$container.find('#input_phone');
    this.$addBtn = this.$container.find('#add_list');
    this.$confirmBtn = this.$container.find('#confirm_info');
    this.$alarmTemplate = this.$container.find('#alarm_template');
    this.$container.on('keyup', '#input_phone', $.proxy(this._activateAddBtn, this));
    this.$container.on('blur', '#input_phone', $.proxy(this._inputBlurEvt, this));
    this.$container.on('focus', '#input_phone', $.proxy(this._inputFocusEvt, this));
    this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
    this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this));
    this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this));
    this.$container.on('click','.fe-bt-masking-alert',$.proxy(this._openAuthAlert,this));
  },
  _clearInput : function(){
    this.$inputElement.val('');
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
    if(!Tw.FormatHelper.isPhoneNum(phoneObj.serviceNumber1+phoneObj.serviceNumber2+phoneObj.serviceNumber3)){
      this._openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE,evt);
      return;
    }
    var requestValue = {
      'svcNumList' : [phoneObj]
    };
    this._apiService.request(Tw.API_CMD.BFF_10_0020, requestValue, {},[this._prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        this._historyService.reload();
      }else{
        this._openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,evt);
      }
    }, this)).fail($.proxy(function (err) {
      this._openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,evt);
    }, this));
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
  _openAlert : function (msg,title,evt) {
    this._popupService.openAlert(
      msg,
      title,
      null,
      $.proxy(function () {
        this.$addBtn.removeAttr('style');
        //$(evt.currentTarget).focus();
        this.$container.find('.fe-main-content').attr('aria-hidden',false);
      }, this),null,$(evt.currentTarget)
    );
    if(!this.$addBtn.attr('disabled')){
      this.$addBtn.css({'pointer-events':'none','background':'#3b98e6'});
    }
  },
  _makeTemplate : function (phoneNum,idx) {
    var maskedPhoneNum = {
      'serviceNumber1' : phoneNum.serviceNumber1,
      'serviceNumber2' : phoneNum.serviceNumber2.substring(0,(phoneNum.serviceNumber2.length-2))+'**',
      'serviceNumber3' : phoneNum.serviceNumber3.substring(0,2)+'**'
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
      $.proxy(function () {
        //$(btnEvt.currentTarget).focus();
        this.$container.find('.fe-main-content').attr('aria-hidden',false);
      },this),
      Tw.BUTTON_LABEL.CLOSE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON,$(btnEvt.currentTarget));
  },
  _removeOnList : function (evt) {
    var $target = $(evt.currentTarget);
    //var selectedIndex = $target.data('idx');
    var selectedIndex = $target.parents('li').index();
    var requestValue = {
      'svcNumList' : [this._addedList[selectedIndex]]
    };
    this._apiService.request(Tw.API_CMD.BFF_10_0019, requestValue, {},[this._prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        this._addedList.splice(selectedIndex,1);
        $target.parents('li').remove();
      }else{
        this._openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,evt);
      }
    }, this)).fail($.proxy(function (err) {
      this._openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,evt);
    }, this));
  },
  _bindRemoveEvt : function () {
    //this.$container.find('.fe-btn_del_num').on('click',$.proxy(this._removeEvt,this));
  },
  _sortingSettingData : function (inputData) {
    for(var i=0;i<inputData.length;i++){
      if(!inputData[i].svcNumMask){
        return;
      }
      var tempArr = inputData[i].svcNumMask.split('-');
      inputData[i] = {
        'serviceNumber1' : tempArr[0],
        'serviceNumber2' : tempArr[1],
        'serviceNumber3' : tempArr[2]
      };
    }
    return inputData;
  },
  _convertPhoneNumFormat : function (phoneString) {
    var returnVal='';
    var cutIdx = [3,7];
    if(phoneString.length<11){
      cutIdx[1] = cutIdx[1]-1;
    }
    for(var i=0;i<phoneString.length;i++){
      if(i===cutIdx[0]||i===cutIdx[1]){
        returnVal+='-';
      }
      returnVal+=phoneString.charAt(i);
    }
    return returnVal;
  },
  _openAuthAlert : function (evt) {
    this._popupService.openConfirmButton(
      Tw.PRODUCT_AUTH_ALERT_STR.MSG,
      Tw.PRODUCT_AUTH_ALERT_STR.TITLE,
      $.proxy(this._showAuth,this),
      $.proxy(function () {
        if(!this._showAuthState){
          //$(evt.currentTarget).focus();
          this.$container.find('.fe-main-content').attr('aria-hidden',false);
        }else{
          this._showAuthState = false;
        }
      },this),
      Tw.BUTTON_LABEL.CANCEL,
      Tw.BUTTON_LABEL.CONFIRM,$(evt.currentTarget));
  },
  _showAuth : function () {
    this._showAuthState = true;
    this._popupService.close();
    $('.fe-bt-masking').trigger('click');
  }

};
