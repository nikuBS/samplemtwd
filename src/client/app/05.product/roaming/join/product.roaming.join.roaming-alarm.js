/**
 * FileName: product.roaming.join.roaming-alarm.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 */

Tw.ProductRoamingJoinRoamingAlarm = function (rootEl,prodRedisInfo,prodBffInfo,svcInfo,prodId) {

  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._bindElementEvt();
  this._nativeService = Tw.Native;
  this._addedList = [];
  this._changeList();
  this._prodRedisInfo = JSON.parse(prodRedisInfo);
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
};

Tw.ProductRoamingJoinRoamingAlarm.prototype = {

  _bindElementEvt : function () {
    this.$container.on('keyup', '#input_phone', $.proxy(this._activateAddBtn, this));
    this.$container.on('blur', '#input_phone', $.proxy(this._inputBlurEvt, this));
    this.$container.on('focus', '#input_phone', $.proxy(this._inputFocusEvt, this));
    this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
    this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this));
    this.$container.on('click', '#confirm_info', $.proxy(this._confirmInformationSetting, this));
    this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
    this.$inputElement = this.$container.find('#input_phone');
    this.$addBtn = this.$container.find('#add_list');
    this.$confirmBtn = this.$container.find('#confirm_info');
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
    tempVal = Tw.StringHelper.phoneStringToDash(tempVal);
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
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A7.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A7.TITLE);
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
    this._addedList.push(phoneObj);
    this._activateConfirmBtn();
    this._clearInput();
    this._changeList();
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
    if(inputVal.length>0&&isNaN(inputEvt.key)){
      this.$inputElement.val(inputVal.replace(/[^0-9]/g,''));
      this.$inputElement.blur();
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
    var maskedPhoneNum = {
      serviceNumber1 : phoneNum.serviceNumber1,
      serviceNumber2 : phoneNum.serviceNumber2.substring(0,2)+'**',
      serviceNumber3 : phoneNum.serviceNumber3.substring(0,2)+'**'
    };
    var templateData = { phoneData : { phoneNum : maskedPhoneNum, idx : idx } };
    var handlebarsTemplate = Handlebars.compile(this.$alarmTemplate.html());
    this.$container.find('#alarm_list').append(handlebarsTemplate(templateData));
  },
  _removeOnList : function (args) {
    var selectedIndex = parseInt($(args).attr('data-idx'),10);
    this._addedList.splice(selectedIndex,1);
    this._changeList();
  },
  _bindRemoveEvt : function () {
    this.$container.find('.list-btn button').on('click',$.proxy(this._removeOnList,this));
  },
  _doJoin : function(data,apiService,historyService,$containerData){


    apiService.request(Tw.API_CMD.BFF_10_0018, data.userJoinInfo, {},[data.prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        var completePopupData = {
          prodNm : data.prodNm,
          processNm : Tw.PRODUCT_TYPE_NM.JOIN,
          isBasFeeInfo : data.prodFee,
          typeNm : data.svcType,
          settingType : (data.svcType+' '+data.processNm),
          btnNmList : [Tw.BENEFIT.DISCOUNT_PGM.SELECTED.FINISH.LINK_TITLE]
        };
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
  _bindCompletePopupBtnEvt : function(args1,args2){
    $(args2).on('click','.btn-round2',$.proxy(args1._goMyInfo,args1));
    $(args2).on('click','.btn-floating',$.proxy(args1._goPlan,args1,-3));
  },
  _goMyInfo : function(){
    this._historyService.goLoad('/product/roaming/my-use');
  },
  _goBack : function(){
    this._historyService.goBack();
  },
  _goPlan : function (idx) {
    this._historyService.go(idx);
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
      'svcNumList' : this._addedList
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
      autoInfo : this._prodBffInfo,
      showStipulation : Object.keys(this._prodBffInfo.stipulationInfo).length>0,
      joinType : 'alarm'
    };

    new Tw.ProductRoamingJoinConfirmInfo(this.$container,data,this._doJoin,null,'confirm_data',this);

  }


};
