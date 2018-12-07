/**
 * FileName: product.roaming.join.confirm-info.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.11.30
 */

Tw.ProductRoamingJoinConfirmInfo = function (rootEl,data,doJoinCallBack,closeCallBack,hash,rootData) {
  this.$rootContainer = rootEl;
  this._popupData = data;
  this._page = false;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$rootContainer);
  if(doJoinCallBack===null){
      this._svcInfo = closeCallBack;
      this._$popupContainer = this.$rootContainer;
      this._prodId = hash;
      this._prodBffInfo = data;
      this._prodRedisInfo = rootData;
      this._page = true;
      this._bindPopupElementEvt(this.$rootContainer);
      //this._stipulationInit(this._prodBffInfo);
      return;
  }
  this._doJoinCallBack = doJoinCallBack;
  this._openConfirmRoamingInfoPopup(data,closeCallBack,hash);
  this._rootData = rootData;
};

Tw.ProductRoamingJoinConfirmInfo.prototype = {
    _openConfirmRoamingInfoPopup : function (data,closeCallBack,hash) {
        this._popupService.open({
            hbs: 'RM_11_01_01_02',
            layer: true,
            data : data
        },$.proxy(this._init,this),closeCallBack,hash);
    },
    _init : function($poppContainer){

        this._$popupContainer = $poppContainer;
        this._bindPopupElementEvt($poppContainer);
        var setingInfo;
         if(this._popupData.joinType==='setup'){
             setingInfo = moment(this._popupData.userJoinInfo.svcStartDt,'YYYYMMDD').format('YYYY. MM. DD')+' '+this._popupData.userJoinInfo.svcStartTm+':00';
             setingInfo+= ' ~ '+moment(this._popupData.userJoinInfo.svcEndDt,'YYYYMMDD').format('YYYY. MM. DD')+' '+this._popupData.userJoinInfo.svcEndTm+':00';
         }else if(this._popupData.joinType==='auto'){
             setingInfo = moment(this._popupData.userJoinInfo.svcStartDt,'YYYYMMDD').format('YYYY. MM. DD')+' '+this._popupData.userJoinInfo.svcStartTm+':00';
         }else if(this._popupData.joinType==='begin'){
             setingInfo = moment(this._popupData.userJoinInfo.svcStartDt,'YYYYMMDD').format('YYYY. MM. DD');
         }else if(this._popupData.joinType==='alarm'){

             for(var i=0;i<this._popupData.userJoinInfo.svcNumList.length;i++){
                 if(i>=2){
                     break;
                 }else{
                     setingInfo=this._popupData.userJoinInfo.svcNumList[i].serviceNumber1+'-';
                     setingInfo+=this._popupData.userJoinInfo.svcNumList[i].serviceNumber2+'-';
                     setingInfo+=this._popupData.userJoinInfo.svcNumList[i].serviceNumber3;
                 }
             }
         }

        this._$popupContainer.find('.term').text(setingInfo);

    },
    _bindPopupElementEvt : function ($popupContainer) {
        this._$allAgreeElement = this._$popupContainer.find('.all.checkbox>input');
        this._$individualAgreeElement = this._$popupContainer.find('.individual.checkbox>input');

        $($popupContainer).on('click','#do_join',$.proxy(this._doJoin,this));
        if(this._popupData.showStipulation===false){
            this._$popupContainer.find('#do_join').removeAttr('disabled');
        }else{
            $($popupContainer).on('click','.all.checkbox>input',$.proxy(this._allAgree,this));
            $($popupContainer).on('click','.individual.checkbox>input',$.proxy(this._agreeCheck,this));
        }
        $($popupContainer).on('click','.prev-step',$.proxy(this._doCancel,this));
    },
    _doCancel : function(){
        this._popupService.close();
    },
    _allAgree : function(){
        var nowAllAgree = this._$allAgreeElement.attr('checked');
        for(var i=0;i<this._$individualAgreeElement.length;i++){
            if(nowAllAgree!==$(this._$individualAgreeElement[i]).attr('checked')){
                $(this._$individualAgreeElement[i]).trigger('click');
            }
        }
    },
    _agreeCheck : function () {
        var $joinBtn = this._$popupContainer.find('#do_join');
        for(var i=0;i<this._$individualAgreeElement.length;i++){
            if($(this._$individualAgreeElement[i]).attr('checked')!=='checked'){
                $joinBtn.attr('disabled','disabled');
                this._forceChange(this._$allAgreeElement,false);
                return;
            }
        }
        $joinBtn.removeAttr('disabled');
        this._forceChange(this._$allAgreeElement,'checked');
    },
    _forceChange : function ($element,value) {
        if(value==='checked'){
            if(!$element.parent().hasClass(value)){
                $element.parent().addClass(value);
            }
        }else{
            $element.parent().removeClass('checked');
        }
        $element.attr('checked',value==='checked'?true:false);
        $element.parent().attr('aria-checked',value==='checked'?true:false);
    },
    _doJoin : function () {
        this._popupService.openModalTypeA(Tw.ALERT_MSG_PRODUCT.ALERT_3_A3.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A3.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A3.BUTTON, null, $.proxy(this._confirmInfo,this));
    },
    _confirmInfo : function () {
        if(this._page===true){
            this._excuteJoin();
        }else{
            this._doJoinCallBack(this._popupData,this._apiService,this._historyService,this._rootData);
        }
    },
    _excuteJoin : function () {
        var userJoinInfo = {
            'svcStartDt' : {},
            'svcEndDt' : {},
            'svcStartTm' : {},
            'svcEndTm' : {},
            'startEndTerm' : {}
        };



        this._apiService.request(Tw.API_CMD.BFF_10_0084, userJoinInfo, {},this.prodId).
        done($.proxy(function (res) {
            if(res.code===Tw.API_CODE.CODE_00){
                var completePopupData = {
                    prodNm : this._prodRedisInfo.prodNm,
                    processNm : Tw.PRODUCT_TYPE_NM.JOIN,
                    isBasFeeInfo : this._prodRedisInfo.baseFeeInfo,
                    typeNm : Tw.PRODUCT_CTG_NM.ADDITIONS,
                    settingType : Tw.PRODUCT_CTG_NM.ADDITIONS+' '+Tw.PRODUCT_TYPE_NM.JOIN,
                    btnNmList : ['나의 가입정보 확인']
                };
                this._popupService.open({
                        hbs: 'complete_product_roaming',
                        layer: true,
                        data : completePopupData
                    },
                    $.proxy(this._bindCompletePopupEvt,this),
                    null,
                    'complete');

            }
        }, this)).fail($.proxy(function (err) {

        }, this));

    },
    _bindCompletePopupEvt : function ($args) {
        $($args).on('click','.btn-round2',this._goMyInfo);
        $($args).on('click','.btn-floating',this._goBack);
    },
    _goBack : function(){
        this._popupService.close();
        this._historyService.goBack();
    },
    _goMyInfo : function () {
        this._historyService.goLoad('/product/roaming/my-use');
    }
};