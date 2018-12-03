/**
 * FileName: product.roaming.info.guide.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.11.30
 */

Tw.ProductRoamingJoinConfirmInfo = function (rootEl,data,doJoinCallBack,closeCallBack,hash) {
  this.$rootContainer = rootEl;
  this._popupService = Tw.Popup;
  this._doJoinCallBack = doJoinCallBack;
  this._popupData = data;
  this._openConfirmRoamingInfoPopup(data,closeCallBack,hash);
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$rootContainer);
};

Tw.ProductRoamingJoinConfirmInfo.prototype = {
    _openConfirmRoamingInfoPopup : function (data,closeCallBack,hash) {
        this._popupService.open({
            hbs: 'RM_11_01_01_02',
            layer: true,
            data : data
        },$.proxy(this._bindPopupElementEvt,this),closeCallBack,hash);


    },

    _bindPopupElementEvt : function ($poppContainer) {
        this._$popupContainer = $poppContainer;
        this._$allAgreeElement = this._$popupContainer.find('.all.checkbox>input');
        this._$individualAgreeElement = this._$popupContainer.find('.individual.checkbox>input');
        $($poppContainer).on('click','#do_join',$.proxy(this._doJoin,this));
        if(this._popupData.showStipulation==false){
            this._$popupContainer.find('#do_join').removeAttr('disabled');
        }else{
            $($poppContainer).on('click','.all.checkbox>input',$.proxy(this._allAgree,this));
            $($poppContainer).on('click','.individual.checkbox>input',$.proxy(this._agreeCheck,this));
        }
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
        this._doJoinCallBack(this._popupData,this._apiService,this._historyService);
    }


};
