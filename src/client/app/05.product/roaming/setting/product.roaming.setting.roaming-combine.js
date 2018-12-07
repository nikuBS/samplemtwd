/**
 * FileName: product.roaming.setting.roaming-alarm.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 * ID : RM_11_01_02_01
 */

Tw.ProductRoamingSettingRoamingCombine = function (rootEl,prodRedisInfo,prodBffInfo,svcInfo,prodId,prodSettingInfo) {

  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');
  this._bindElementEvt();
  this._nativeService = Tw.Native;
  this._addedList = this._sortingSettingData(prodSettingInfo.togetherMemList);
  this._changeList();
  this._prodRedisInfo = prodRedisInfo;
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._apiService = Tw.Api;
  this._prodSettingInfo = prodSettingInfo;
};

Tw.ProductRoamingSettingRoamingCombine.prototype = {

  _bindElementEvt : function () {
      this.$container.on('keyup', '#input_phone', $.proxy(this._activateAddBtn, this));
      this.$container.on('focus', '#input_phone', $.proxy(this._inputFocusEvt, this));
      this.$container.on('blur', '#input_phone', $.proxy(this._inputBlurEvt, this));
      this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
      this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this));
      this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
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
          this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.TITLE);
          return;
      }
      var reuqestPhoneNum = this.$inputElement.val().replace(/\-/g,'');
      if(this._requestOrder('CHK',reuqestPhoneNum)){
         if(this._requestOrder('add',reuqestPhoneNum)){
            console.log('refresh');
         }
      }

  },
  _requestOrder : function(requestType,phoneNum){

      var reqestValue = {
          svcOpClCd : '',
          startDtm : this._prodSettingInfo.startdtm,
          endDtm : this._prodSettingInfo.enddtm,
          childSvcNum : '',
          delChildSvcMgmtNum : ''
      };
      reqestValue.svcOpClCd = requestType === 'CHK'?requestType:'CHG';
      if(requestType === 'remove'){
          reqestValue.delChildSvcMgmtNum = phoneNum;
      }else{
          reqestValue.childSvcNum = phoneNum;
      }
      console.log(reqestValue);

      return true;
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
      this._activateConfirmBtn();
  },
  _activateConfirmBtn : function () {
    if(this._addedList.length>=1){
        this.$confirmBtn.removeAttr('disabled');
    }else{
        this.$confirmBtn.attr('disabled','disabled');
    }
  },
  _makeTemplate : function (name,phoneNum,idx) {
      var template = '<li class="list-box">';
          template+='<div class="list-ico"><span class="ico type5">이</span></div>';
          template+='<p class="list-text">';
          template+='<span class="mtext">'+name+'</span>';
          template+='<span class="stext gray">'+phoneNum+'</span>';
          template+='</p>';
          template+='<div class="list-btn">';
          template+='<div class="bt-alone"><button class="bt-line-gray1" id="list'+idx+'" data-idx="'+idx+'">삭제</button></div>';
          template+='</div>';
          template+='</li>';
       this.$container.find('.comp-box').append(template);
  },
  _removeOnList : function ($args) {
      var selectedIdx = $args.currentTarget.attributes['data-idx'].nodeValue;
      selectedIdx = parseInt(selectedIdx,10);
      var reuqestPhoneNum = this._addedList[selectedIdx].svcNum;

      if(this._requestOrder('CHK',reuqestPhoneNum)){
          if(this._requestOrder('remove',reuqestPhoneNum)){
              console.log('refresh');
          }
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
  }


};
