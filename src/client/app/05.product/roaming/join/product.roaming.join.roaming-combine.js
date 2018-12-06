/**
 * FileName: product.roaming.join.roaming-combine.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 * ID : RM_11_01_02_07
 */

Tw.ProductRoamingJoinRoamingCombine = function (rootEl,prodRedisInfo,prodBffInfo,svcInfo,prodId) {

  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');
  this._bindElementEvt();
  this._nativeService = Tw.Native;
  this._addedList = [];
  this._changeList();
  this._prodRedisInfo = prodRedisInfo;
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._apiService = Tw.Api;
};

Tw.ProductRoamingJoinRoamingCombine.prototype = {

  _bindElementEvt : function () {
      this.$container.on('keyup', '#input_phone', $.proxy(this._changeInputValue, this));
      this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
      this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this));
      this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
      this.$inputElement = this.$container.find('#input_phone');
      this.$addBtn = this.$container.find('#add_list');
      this.$confirmBtn = this.$container.find('#confirm_info');
  },

  _clearInput : function(){
      this.$inputElement.val('');
  },
  _changeInputValue : function(){
      var replaceVal = this.$inputElement.val().replace(/\-/g,'');
      replaceVal = replaceVal.substr(0,11);
      var changedPhoneNum = Tw.StringHelper.phoneStringToDash(replaceVal);
      this.$inputElement.val(changedPhoneNum);
      this._activateAddBtn();
  },
  _addPhoneNumOnList : function () {
      if(this._addedList.length>=5){
          this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.TITLE);
          return;
      }

      var tempPhoneNum = this.$inputElement.val().split('-');
      var phoneObj = {
          'serviceNumber1' : tempPhoneNum[0],
          'serviceNumber2' : tempPhoneNum[1],
          'serviceNumber3' : tempPhoneNum[2]
      };



      this._addedList.push(phoneObj);
      this._activateConfirmBtn();
      this._clearInput();
      this._changeList();

      // var requestValue = {
      //     'svcNumList' : [phoneObj]
      // };

      // this._apiService.request(Tw.API_CMD.BFF_10_0084, requestValue, {},this._prodId).
      // done($.proxy(function (res) {
      //     console.log('success');
      //     console.log(res);
      //
      //     this._addedList.push(phoneObj);
      //     this._activateConfirmBtn();
      //     this._clearInput();
      //     this._changeList();
      //
      // }, this)).fail($.proxy(function (err) {
      //     console.log('fail');
      //     console.log(err);
      // }, this));


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
    console.log('_showPhoneBook  called');
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._phoneBookCallBack,this));
  },
  _phoneBookCallBack : function(res){
      if (res.resultCode === Tw.NTV_CODE.CODE_00) {
          var number = res.params.phoneNumber;
          this.$inputElement.val(number);
      }
  },
    _activateAddBtn : function () {

    if(this.$inputElement.val().length>=12){
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
  // _confirmInfo : function () {
  //     console.log('_confirmInfo called');
  // },
  _makeTemplate : function (phoneNum,idx) {
      var template = '<li class="list-box">';
          template+='<div class="list-ico"><span class="ico type5">이</span></div>';
          template+='<p class="list-text">';
          template+='<span class="mtext">이*름</span>';
          template+='<span class="stext gray">'+phoneNum.serviceNumber1+'-'+phoneNum.serviceNumber2+'-'+phoneNum.serviceNumber3+'</span>';
          template+='</p>';
          template+='<div class="list-btn">';
          template+='<div class="bt-alone"><button data-idx="'+idx+'" class="bt-line-gray1">삭제</button></div>';
          template+='</div>';
          template+='</li>';
       this.$container.find('.comp-box').append(template);
  },
  _removeOnList : function ($args) {

      var selectedIndex = parseInt($($args).attr('data-idx'),10);
      this._addedList.splice(selectedIndex,1);
      this._changeList();
  },
  _bindRemoveEvt : function () {
      this.$container.find('.list-btn button').on('click',$.proxy(this._removeOnList,this));
  },
  _sortingSettingData : function (inputData) {

      for(var i=0;i<inputData.length;i++){
          var tempArr = this._convertPhoneNumFormat(inputData[i].svcNum).split('-');
          inputData[i] = {
              'serviceNumber1' : tempArr[0],
              'serviceNumber2' : tempArr[1],
              'serviceNumber3' : tempArr[2]
          };
      }
      console.log(inputData);
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
  }

};
