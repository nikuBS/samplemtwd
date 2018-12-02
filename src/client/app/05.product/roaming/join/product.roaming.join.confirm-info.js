/**
 * FileName: product.roaming.info.guide.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
 */

Tw.ProductRoamingJoinConfirmInfo = function (rootEl,data,doJoinCallBack,closeCallBack,hash) {
  this.$rootContainer = rootEl;
  this._popupService = Tw.Popup;
  this._doJoinCallBack = doJoinCallBack;
  this._openConfirmRoamingInfoPopup(data,closeCallBack,hash);
};

Tw.ProductRoamingJoinConfirmInfo.prototype = {
    _openConfirmRoamingInfoPopup : function (data,closeCallBack,hash) {
        this._popupService.open({
            hbs: 'RM_11_01_01_02',
            layer: true,
            data : data
        },$.proxy(this._bindPopupElementEvt,this),closeCallBack,hash);

        this._termAgreeCheck(data);
    },
    _termAgreeCheck : function (data) {
        if(!data.showStipulation){

        }
    },
    _bindPopupElementEvt : function ($poppContainer) {
        this._$poppContainer = $poppContainer;
        $($poppContainer).on('click','#do_join',$.proxy(this._doJoinCallBack,this));
        $($poppContainer).on('change','.checkbox>input',$.proxy(this._stipulationCheckEvt,this));
    },
    _stipulationCheckEvt : function ($args) {

    }
};
