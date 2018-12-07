/**
 * FileName: product.roaming.join.roaming-alarm.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 */

Tw.ProductRoamingJoinRoamingAlarm = function (rootEl,prodRedisInfo,prodBffInfo,svcInfo,prodId) {

  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');
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

  _makeTemplate : function (phoneNum,idx) {
      var template = '<li class="list-box">';
          //template+='<div class="list-ico"><span class="ico type5">이</span></div>';
          template+='<p class="list-text">';
          //template+='<span class="mtext">이*름</span>';
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
   _doJoin : function(data,apiService,historyService,$containerData){


        apiService.request(Tw.API_CMD.BFF_10_0018, data.userJoinInfo, {},data.prodId).
        done($.proxy(function (res) {
            if(res.code===Tw.API_CODE.CODE_00){
                var completePopupData = {
                    prodNm : data.prodNm,
                    processNm : Tw.PRODUCT_TYPE_NM.JOIN,
                    isBasFeeInfo : data.prodFee,
                    typeNm : data.svcType,
                    settingType : (data.svcType+' '+data.processNm),
                    btnNmList : ['나의 가입정보 확인']
                };
                this._popupService.open({
                        hbs: 'complete_product_roaming',
                        layer: true,
                        data : completePopupData
                    },
                    $.proxy($containerData._bindCompletePopupBtnEvt,this,$containerData),
                    null,
                    'complete');
            }
        }, this)).fail($.proxy(function (err) {

        }, this));
   },
    _bindCompletePopupBtnEvt : function($args1,$args2){
        $($args2).on('click','.btn-round2',$.proxy($args1._goMyInfo,$args1));
        $($args2).on('click','.btn-floating',$.proxy($args1._goBack,$args1));
    },
    _goMyInfo : function(){
        this._historyService.goLoad('/product/roaming/my-use');
    },
    _goBack : function(){
        this._historyService.goLoad('/product/callplan/'+this._prodId);
    },
   _confirmInformationSetting : function () {
        var userJoinInfo = {
            'svcNumList' : this._addedList
        };

        var data = {
            popupTitle : Tw.PRODUCT_TYPE_NM.JOIN,
            userJoinInfo : userJoinInfo,
            prodId : this._prodId,
            svcNum : Tw.FormatHelper.getDashedCellPhoneNumber(this._svcInfo.showSvc),
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
