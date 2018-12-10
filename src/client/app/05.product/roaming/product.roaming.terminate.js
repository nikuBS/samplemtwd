/**
 * FileName: product.roaming.terminate.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.06
 */

Tw.ProductRoamingTerminate = function (rootEl,prodBffInfo,svcInfo,prodId,prodRedisInfo) {
    this.$rootContainer = rootEl;
    this._page = false;
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;
    this._historyService = new Tw.HistoryService(this.$rootContainer);
    this._svcInfo = svcInfo;
    this._prodId = prodId;
    this._prodBffInfo = JSON.parse(prodBffInfo);
    this._prodRedisInfo = prodRedisInfo;
    this._page = true;
    this._bindPopupElementEvt();
};

Tw.ProductRoamingTerminate.prototype = {

    _bindPopupElementEvt : function () {
        this._$allAgreeElement = this.$rootContainer.find('.all.checkbox>input');
        this._$individualAgreeElement = this.$rootContainer.find('.individual.checkbox>input');

        this.$rootContainer.on('click','#do_confirm',$.proxy(this._doJoin,this));
        if(this._prodBffInfo.showStipulation===false){
            this.$rootContainer.find('#do_confirm').removeAttr('disabled');
        }else{
            this.$rootContainer.on('click','.all.checkbox>input',$.proxy(this._allAgree,this));
            this.$rootContainer.on('click','.individual.checkbox>input',$.proxy(this._agreeCheck,this));
        }
        this.$rootContainer.on('click','.prev-step',$.proxy(this._doCancel,this));
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
        var $joinBtn = this.$rootContainer.find('#do_confirm');
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
        this._popupService.openModalTypeA(Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.BUTTON, null, $.proxy(this._confirmInfo,this));
    },
    _confirmInfo : function () {

        var completePopupData = {
            prodNm : this._prodRedisInfo.prodNm,
            processNm : Tw.PRODUCT_TYPE_NM.TERMINATE,
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

        this._apiService.request(Tw.API_CMD.BFF_10_0086, {}, {},this.prodId).
        done($.proxy(function (res) {

            if(res===Tw.API_CODE.CODE_00){
                var completePopupData = {
                    prodNm : this._prodRedisInfo.prodNm,
                    processNm : PRODUCT_TYPE_NM.TERMINATE,
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
    _bindCompletePopupBtnEvt : function($args1,$args2){
        $($args2).on('click','.btn-round2',$.proxy($args1._goMyInfo,$args1));
        $($args2).on('click','.btn-floating',$.proxy($args1._goBack,$args1));
    },
    _goMyInfo : function(){
        this._historyService.goLoad('/product/roaming/my-use');
    },
    _goBack : function(){
        this._historyService.goLoad('/product/callplan/'+this._prodId);
    }
};