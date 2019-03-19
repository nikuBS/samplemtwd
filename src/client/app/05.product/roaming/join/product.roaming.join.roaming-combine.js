/**
 * FileName: product.roaming.join.roaming-combine.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 * ID : RM_11_01_02_07
 */

Tw.ProductRoamingJoinRoamingCombine = function (rootEl,prodRedisInfo,prodBffInfo,svcInfo,prodId) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._nativeService = Tw.Native;
  this._prodRedisInfo = JSON.parse(prodRedisInfo);
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._apiService = Tw.Api;
  this._addedList = this._sortingSettingData(this._prodBffInfo.togetherMemList);
  this._init();

};

Tw.ProductRoamingJoinRoamingCombine.prototype = {
  _init : function () {
    if(!Tw.BrowserHelper.isApp()){
      this.$container.find('#phone_book').hide();
    }
    this._bindElementEvt();
  },
  _bindElementEvt : function () {
    this.$container.on('keyup', '#input_phone', $.proxy(this._activateAddBtn, this));
    this.$container.on('focus', '#input_phone', $.proxy(this._inputFocusEvt, this));
    this.$container.on('blur', '#input_phone', $.proxy(this._inputBlurEvt, this));
    this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
    this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this));
    this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
    this.$container.on('click','.list-btn .fe-remove',$.proxy(this._removeOnList,this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this._historyService));
    this.$inputElement = this.$container.find('#input_phone');
    this.$addBtn = this.$container.find('#add_list');
    this.$confirmBtn = this.$container.find('#confirm_info');
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
  },
  _inputFocusEvt : function(){
    var tempVal = this.$inputElement.val().replace(/\-/g,'');
    this.$inputElement.attr('maxlength','11');
    this.$inputElement.val(tempVal);
  },
  _addPhoneNumOnList : function (evt) {
    if(this._addedList.length>=4){
      this.$addBtn.css('pointer-events','none');
      this._openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.TITLE);
      return;
    }
    var reuqestPhoneNum = this.$inputElement.val().replace(/\-/g,'');
    //var phonReg = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
    if(Tw.FormatHelper.isPhoneNum(reuqestPhoneNum)){
      this._requestOrder('add',reuqestPhoneNum,evt);
    }else{
      this._openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE,evt);
    }
  },
  _requestOrder : function(requestType,phoneNum,targetEvt){
    var requestValue = {};
    if(requestType === 'remove'){
      requestValue.delChildSvcMgmtNum = phoneNum;
    }else{
      requestValue.childSvcNum = phoneNum;
      requestValue.startDtm = this._prodBffInfo.startdtm;
      requestValue.endDtm = this._prodBffInfo.enddtm;
      requestValue.useDays = Tw.DateHelper.getDiffByUnit(
        Tw.DateHelper.convDateFormat(),
        Tw.DateHelper.convDateFormat(this._prodBffInfo.startdtm),
        'days');
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0092, requestValue, {},[this._prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        if(requestType === 'remove'){
          var $target = $(targetEvt.currentTarget);
          this._addedList.splice($target.parents('li').index(),1);
          $target.parents('li').remove();
        }else{
          this._historyService.reload();
        }
      }else{
        if(res.code==='PRD0027'){
          this._openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A19.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A19.TITLE,targetEvt);
        }else{
          this._openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,targetEvt);
        }
      }
    }, this)).fail($.proxy(function (err) {
      this._openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,targetEvt);
    }, this));
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
    var $target = $(targetEvt.currentTarget);
    var selectedIdx = $target.parents('li').index();
    selectedIdx = parseInt(selectedIdx,10);
    var reuqestPhoneNum = this._addedList[selectedIdx].svcMgmtNum;
    if(this._addedList.length<=1){
      this._openAlert(null,Tw.ALERT_MSG_PRODUCT.ALERT_NUMBER_MIN);
    }else {
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE,
        $.proxy(function () {
          this._popupService.close();
          this._requestOrder('remove',reuqestPhoneNum,targetEvt);
        },this),
        function () {
          $target.focus();
        },
        Tw.BUTTON_LABEL.CLOSE,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON,$target);
    }
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
  _openAlert : function (msg,title,targetEvt) {
    this._popupService.openAlert(
      msg,
      title,
      null,
      $.proxy(function () {
        this.$addBtn.removeAttr('style');
        $(targetEvt.currentTarget).focus();
      }, this),null,$(targetEvt.currentTarget)
    );
    if(!this.$addBtn.attr('disabled')) {
      this.$addBtn.css({'pointer-events': 'none', 'background': '#3b98e6'});
    }
  },
  _openAuthAlert : function (evt) {
    this._popupService.openConfirmButton(
      Tw.PRODUCT_AUTH_ALERT_STR.MSG,
      Tw.PRODUCT_AUTH_ALERT_STR.TITLE,
      $.proxy(this._showAuth,this),
      null,
      Tw.BUTTON_LABEL.CANCEL,
      Tw.BUTTON_LABEL.CONFIRM,$(evt.currentTarget));
  },
  _showAuth : function () {
    this._popupService.close();
    $('.fe-bt-masking').trigger('click');
  }

};
