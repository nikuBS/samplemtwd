/**
 * FileName: product.roaming.setting.roaming-alarm.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 * ID : RM_11_01_02_01
 */

Tw.ProductRoamingSettingRoamingAlarm = function (rootEl,prodRedisInfo,prodBffInfo,svcInfo,prodId) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._bindElementEvt();
  this._nativeService = Tw.Native;
  this._addedList = this._sortingSettingData(prodBffInfo.combinationLineList);
  this._prodRedisInfo = prodRedisInfo;
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._apiService = Tw.Api;
  this._changeList();
};

Tw.ProductRoamingSettingRoamingAlarm.prototype = {

  _bindElementEvt : function () {
    this.$inputElement = this.$container.find('#input_phone');
    this.$addBtn = this.$container.find('#add_list');
    this.$confirmBtn = this.$container.find('#confirm_info');
    this.$alarmTemplateOthers = this.$container.find('#alarm_template_others');
    this.$alarmTemplateUsers = this.$container.find('#alarm_template_users');
    this.$container.on('keyup', '#input_phone', $.proxy(this._activateAddBtn, this));
    this.$container.on('blur', '#input_phone', $.proxy(this._inputBlurEvt, this));
    this.$container.on('focus', '#input_phone', $.proxy(this._inputFocusEvt, this));
    this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
    this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this));
    this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this));
  },
  _clearInput : function(){
    this.$inputElement.val('');
    this._activateAddBtn();
  },
  _inputBlurEvt : function(){
    var tempVal = this.$inputElement.val();
    if(tempVal.length===7){
      tempVal = this._phoneForceChange(tempVal);
    }else{
      tempVal = Tw.StringHelper.phoneStringToDash(tempVal);
    }
    this.$inputElement.attr('maxlength','13');
    this.$inputElement.val(tempVal);
    //this._activateAddBtn();
  },
  _inputFocusEvt : function(){
    var tempVal = this.$inputElement.val().replace(/\-/g,'');
    this.$inputElement.attr('maxlength','11');
    this.$inputElement.val(tempVal);
  },

  _addPhoneNumOnList : function () {
    if(this._addedList.length>=5){
      this.$addBtn.css('pointer-events','none');
      this._popupService.openAlert(
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A7.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A7.TITLE,
        null,
        $.proxy(function () {
          this.$addBtn.css('pointer-events','all');
        },this)
      );
      return;
    }
    var tempPhoneNum = this.$inputElement.val().split('-');
    var phonReg = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
    var phoneObj = {
      'serviceNumber1' : tempPhoneNum[0],
      'serviceNumber2' : tempPhoneNum[1],
      'serviceNumber3' : tempPhoneNum[2]
    };
    if(!phonReg.test(phoneObj.serviceNumber1+phoneObj.serviceNumber2+phoneObj.serviceNumber3)){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
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
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.ERROR);
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.ERROR);
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
      this.$inputElement.val(res.params.phoneNumber);
      this.$inputElement.trigger('keyup');
      this._inputBlurEvt();
    }
  },
  _activateAddBtn : function (inputEvt) {
    var inputVal = this.$inputElement.val();
    var numReg = /[^0-9]/g;
    if(inputVal.length>0&&numReg.test(inputVal)){
      this.$inputElement.blur();
      this.$inputElement.val('');
      this.$inputElement.val(inputVal.replace(numReg,''));
      this.$inputElement.focus();
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
    var templateData;
    var handlebarsTemplate;
    var maskedPhoneNum = {
      'serviceNumber1' : phoneNum.serviceNumber1,
      'serviceNumber2' : phoneNum.serviceNumber2.substring(0,2)+'**',
      'serviceNumber3' : phoneNum.serviceNumber3.substring(0,2)+'**'
    };
    if(this._svcInfo.svcMgmtNum===phoneNum.svcMgmtNum){
      templateData = { phoneData : { phoneNum : maskedPhoneNum, idx : idx , mbrNm : this._svcInfo.mbrNm , firstNm : this._svcInfo.mbrNm.charAt(0) } };
      handlebarsTemplate = Handlebars.compile(this.$alarmTemplateUsers.html());
    }else{
      templateData = { phoneData : { phoneNum : maskedPhoneNum, idx : idx } };
      handlebarsTemplate = Handlebars.compile(this.$alarmTemplateOthers.html());
    }
    this.$container.find('#alarm_list').append(handlebarsTemplate(templateData));
  },
  _removeEvt : function (btnEvt) {
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE,
      $.proxy(function () {
        this._popupService.close();
        this._removeOnList(btnEvt);
      },this),
      null,
      Tw.BUTTON_LABEL.CLOSE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON);
  },
  _removeOnList : function ($args) {

    var selectedIndex = $args.currentTarget.attributes['data-idx'].nodeValue;
    var requestValue = {
      'svcNumList' : [this._addedList[selectedIndex]]
    };

    this._apiService.request(Tw.API_CMD.BFF_10_0019, requestValue, {},[this._prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        this._historyService.reload();
      }else{
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.ERROR);
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.ERROR);
    }, this));
  },
  _bindRemoveEvt : function () {
    this.$container.find('.list-btn button').on('click',$.proxy(this._removeEvt,this));
  },
  _sortingSettingData : function (inputData) {
    for(var i=0;i<inputData.length;i++){
      var tempArr = this._convertPhoneNumFormat(inputData[i].svcNum).split('-');
      inputData[i] = {
        'serviceNumber1' : tempArr[0],
        'serviceNumber2' : tempArr[1],
        'serviceNumber3' : tempArr[2],
        'svcMgmtNum' : inputData[i].svcMgmtNum
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
  _phoneForceChange : function (str) {
    return str.substring(0,3)+'-'+str.substring(3,str.length);
  }

};
