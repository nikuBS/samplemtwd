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
  this._bindElementEvt();
  this._nativeService = Tw.Native;
  this._addedList = [];
  this._prodRedisInfo = JSON.parse(prodRedisInfo);
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._apiService = Tw.Api;

};

Tw.ProductRoamingJoinRoamingCombine.prototype = {

  _bindElementEvt : function () {
      this.$container.on('keyup', '#input_phone', $.proxy(this._activateAddBtn, this));
      this.$container.on('blur', '#input_phone', $.proxy(this._inputBlurEvt, this));
      this.$container.on('focus', '#input_phone', $.proxy(this._inputFocusEvt, this));
      this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
      this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this, 'CHK'));
      this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
      this.$inputElement = this.$container.find('#input_phone');
      this.$addBtn = this.$container.find('#add_list');
      this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._goBack,this));
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
        //this._activateAddBtn();
    },
    _inputFocusEvt : function(){
        var tempVal = this.$inputElement.val().replace(/\-/g,'');
        this.$inputElement.attr('maxlength','11');
        this.$inputElement.val(tempVal);
    },

  _addPhoneNumOnList : function () {
      if(this._addedList.length>=5){
          this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.TITLE);
          return;
      }
      var reuqestPhoneNum = this.$inputElement.val().replace(/\-/g,'');
      if(this._requestOrder('CHK',reuqestPhoneNum)){
          if(this._requestOrder('add',reuqestPhoneNum)){
              console.log('go to setting/roaming-combine');
              this._historyService.goLoad('/product/roaming/setting/roaming-combine?prodId='+this._prodId);
          }
      }
      this._clearInput();
  },
  _requestOrder : function(requestType,phoneNum){

        var requestValue = {
            svcOpClCd : '',
            startDtm : this._prodBffInfo.startdtm,
            endDtm : this._prodBffInfo.enddtm,
            childSvcNum : '',
            delChildSvcMgmtNum : ''
        };
      requestValue.svcOpClCd = requestType === 'CHK'?requestType:'CHG';
        if(requestType === 'remove'){
            requestValue.delChildSvcMgmtNum = phoneNum;
        }else{
            requestValue.childSvcNum = phoneNum;
        }

        this._apiService.request(Tw.API_CMD.BFF_10_0084, requestValue, {},this._prodId).
        done($.proxy(function (res) {
            return res.code === Tw.API_CODE.CODE_00;
        }, this)).fail($.proxy(function (err) {
            return false;
        }, this));
  },

  _showPhoneBook : function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._phoneBookCallBack,this));
  },
  _phoneBookCallBack : function(res){
      if (res.resultCode === Tw.NTV_CODE.CODE_00) {
          var number = res.params.phoneNumber;
          this.$inputElement.val(number);
      }
  },
    _activateAddBtn : function () {

    if(this.$inputElement.val().length>=10){
        this.$addBtn.removeAttr('disabled');
    }else{
        this.$addBtn.attr('disabled','disabled');
    }

  },
  _goBack : function(){
        this._historyService.goBack();
  }






};
