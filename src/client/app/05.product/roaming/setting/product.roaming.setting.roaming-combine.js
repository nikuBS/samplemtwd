/**
 * FileName: product.roaming.setting.roaming-combine.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 * ID : RM_11_01_02_07
 */

Tw.ProductRoamingSettingRoamingCombine = function (rootEl,prodRedisInfo,prodBffInfo,svcInfo,prodId) {

  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._bindElementEvt();
  this._nativeService = Tw.Native;
  this._prodRedisInfo = JSON.parse(prodRedisInfo);
  this._prodBffInfo = prodBffInfo;
  this._combineListTemplate = Handlebars.compile(this.$container.find('#combine_list_template').html());
  this._addedList = this._sortingSettingData(this._prodBffInfo.togetherMemList);
  this._changeList();
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._apiService = Tw.Api;
};

Tw.ProductRoamingSettingRoamingCombine.prototype = {

  _bindElementEvt : function () {
    this.$container.on('keyup', '#input_phone', $.proxy(this._activateAddBtn, this));
    this.$container.on('focus', '#input_phone', $.proxy(this._inputFocusEvt, this));
    this.$container.on('blur', '#input_phone', $.proxy(this._inputBlurEvt, this));
    this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
    this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this));
    this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this));
    this.$inputElement = this.$container.find('#input_phone');
    this.$addBtn = this.$container.find('#add_list');
    this.$confirmBtn = this.$container.find('#confirm_info');
  },

  _clearInput : function(){
    this.$inputElement.val('');
    this._activateAddBtn();
  },
  _inputBlurEvt : function(){
    var tempVal = this.$inputElement.val();
    tempVal = Tw.StringHelper.phoneStringToDash(tempVal);
    this.$inputElement.attr('maxlength','13');
    this.$inputElement.val(tempVal);
  },
  _inputFocusEvt : function(){
    var tempVal = this.$inputElement.val().replace(/\-/g,'');
    this.$inputElement.attr('maxlength','11');
    this.$inputElement.val(tempVal);
  },
  _addPhoneNumOnList : function () {
    if(this._addedList.length>=5){
      this._openAlart(Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.TITLE);
      return;
    }
    var reuqestPhoneNum = this.$inputElement.val().replace(/\-/g,'');
    var phonReg = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
    if(phonReg.test(reuqestPhoneNum)){
      if(this._requestOrder('add',reuqestPhoneNum)){
        this._historyService.reload();
      }
    }else{
      this._openAlart(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }
  },
  _requestOrder : function(requestType,phoneNum){
    var requestValue = {};
    if(requestType === 'remove'){
      requestValue.delChildSvcMgmtNum = phoneNum;
    }else{
      requestValue.childSvcNum = phoneNum;
      requestValue.startDtm = this._prodBffInfo.startdtm;
      requestValue.endDtm = this._prodBffInfo.enddtm;
      requestValue.useDays = String(moment().diff(moment(this._prodBffInfo.startdtm,'YYYYMMDDHHmm'),'days'));
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0092, requestValue, {},[this._prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        return true;
      }else{
        if(res.code==='PRD0027'){
          this._openAlart(Tw.ALERT_MSG_PRODUCT.ALERT_3_A19.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A19.TITLE);
        }else{
          this._openAlart(res.msg,Tw.POPUP_TITLE.ERROR);
        }
        return false;
      }
    }, this)).fail($.proxy(function (err) {
      this._openAlart(err.msg,Tw.POPUP_TITLE.ERROR);
      return false;
    }, this));
  },
  _changeList : function(){
    this.$container.find('.list-box').remove();
    for(var i=0;i<this._addedList.length;i++){
      this._makeTemplate(this._addedList[i].custNm,this._addedList[i].svcNum,i);
    }

    if(this._addedList.length<=0){
      this.$container.find('.list_contents').hide();
    }else{
      this.$container.find('.list_contents').show();
    }
    this._activateAddBtn();
    this._bindRemoveEvt();
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
      this.$inputElement.val('');
      this.$inputElement.val(inputVal.replace(/[^0-9]/g,''));
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
  _makePhoneNumDash : function (val) {
    return val.replace(/(^02.{0}|^01.{1}|[0-9*]{3})([0-9*]+)([0-9*]{4})/, '$1-$2-$3');
  },
  _makeTemplate : function (name,phoneNum,idx) {
    var listData  = {
      name : name,
      phoneNum : this._makePhoneNumDash(phoneNum),
      idx : idx
    };
    this.$container.find('.comp-box').append(this._combineListTemplate({listData : listData}));
  },
  _removeOnList : function (targetEvt) {
    var selectedIdx = $(targetEvt.currentTarget).data('idx');
    selectedIdx = parseInt(selectedIdx,10);
    var reuqestPhoneNum = this._addedList[selectedIdx].svcMgmtNum;
    if(this._addedList.length<=1){
      this._openAlart(Tw.ALERT_MSG_PRODUCT.ALERT_NUMBER_MIN);
    }else {
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE,
        $.proxy(function () {
          if(this._requestOrder('remove',reuqestPhoneNum)){
            this._historyService.reload();
          }
        },this),
        null,
        Tw.BUTTON_LABEL.CLOSE,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON);
    }
  },
  _bindRemoveEvt : function () {
    this.$container.find('.list-btn button').on('click',$.proxy(this._removeOnList,this));
  },
  _sortingSettingData : function (inputData) {
    var tempArr = [];
    for(var i=0;i<inputData.length;i++){
      if(inputData[i].childYn===true){
        tempArr.push(inputData[i]);
      }
    }
    return tempArr;
  },
  _openAlart : function (msg,title) {
    this.$addBtn.css('pointer-events','none');
    this._popupService.openAlert(
      msg,
      title,
      null,
      $.proxy(function () {
        this.$addBtn.css('pointer-events','all');
      },this)
    );
  }


};
