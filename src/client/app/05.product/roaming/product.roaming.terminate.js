/**
 * FileName: product.roaming.terminate.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.06
 */

Tw.ProductRoamingTerminate = function (rootEl,prodBffInfo,svcInfo,prodId,prodTypeInfo) {
  this.$rootContainer = rootEl;
  this._page = false;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$rootContainer);
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._prodBffInfo = this._arrangeAgree(prodBffInfo);
  this._prodTypeInfo= prodTypeInfo;
  this._page = true;
  this.$mainContent = this.$rootContainer.find('.fe-main-content');
  this._init();
  this._bindPopupElementEvt();
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('#do_confirm'));
};

Tw.ProductRoamingTerminate.prototype = {
  _init : function (){
    if(isNaN(this._prodBffInfo.preinfo.reqProdInfo.basFeeInfo)){
      this.$rootContainer.find('#showTex').hide();
    }else{
      this.$rootContainer.find('.tx-bold.vbl').text(this._convertPrice(this._prodBffInfo.preinfo.reqProdInfo.basFeeInfo));
    }
  },
  _bindPopupElementEvt : function () {
    this._$allAgreeElement = this.$rootContainer.find('.all.checkbox>input');
    this._$individualAgreeElement = this.$rootContainer.find('.individual.checkbox>input');
    this.$rootContainer.on('click','.agree-view',$.proxy(this._showDetailContent,this));
    this.$rootContainer.on('click','#do_confirm',$.proxy(this._doJoin,this));
    this.$rootContainer.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._doCancel,this));
    this.$rootContainer.on('click','.tip-view-btn',$.proxy(this._showBffToolTip,this));
    if(this._prodBffInfo.agreeCnt<=0){
      this.$rootContainer.find('#do_confirm').removeAttr('disabled');
      this.$rootContainer.find('.agree-element').hide();
    }else{
      if(this._prodBffInfo.agreeCnt<2){
        this.$rootContainer.find('.all-agree').hide();
      }else{
        this.$rootContainer.on('click','.all.checkbox>input',$.proxy(this._allAgree,this));
      }
      this.$rootContainer.on('click','.individual.checkbox>input',$.proxy(this._agreeCheck,this));
    }
  },
  _doCancel : function(evt){
    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A74.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A74.MSG,
      Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null,
      $.proxy(this._goPlan,this),
      $.proxy(this._resetAriaHidden,this),null,$(evt.currentTarget));
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
  _doJoin : function (evt) {
    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.MSG,
      Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null,
      $.proxy(this._confirmInfo,this,evt),
      $.proxy(this._resetAriaHidden,this),null,$(evt.currentTarget));
  },
  _confirmInfo : function (evt) {
    this._popupService.close();

    this._apiService.request(Tw.API_CMD.BFF_10_0086, {}, {},[this._prodId]).
    done($.proxy(function (res) {

      if(res.code===Tw.API_CODE.CODE_00){
        var completePopupData = {
          prodNm : this._prodBffInfo.preinfo.reqProdInfo.prodNm,
          processNm : Tw.PRODUCT_TYPE_NM.TERMINATE,
          isBasFeeInfo : this._convertPrice(this._prodBffInfo.preinfo.reqProdInfo.basFeeInfo),
          typeNm : Tw.NOTICE.ROAMING+' '+(this._prodTypeInfo.prodTypCd==='H_P'?Tw.PRODUCT_CTG_NM.PLANS:Tw.PRODUCT_CTG_NM.ADDITIONS),
          settingType : Tw.PRODUCT_TYPE_NM.TERMINATE,
          btnNmList : [Tw.ROAMING_JOIN_STRING.MY_ROAMING_STATE]
        };
        this._popupService.open({
            hbs: 'complete_product_roaming',
            layer: true,
            data : completePopupData
          },
          $.proxy(this._bindCompletePopupEvt,this),
          $.proxy(this._goPlan,this),
          'complete');
      }else{
        this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,
            $.proxy(this._resetAriaHidden,this),null,$(evt.currentTarget));
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,
          $.proxy(this._resetAriaHidden,this),null,$(evt.currentTarget));
    }, this));

  },
  _bindCompletePopupEvt : function(popuEvt){
    $(popuEvt).on('click','.btn-round2',$.proxy(this._goMyInfo,this));
    $(popuEvt).on('click','.btn-floating',$.proxy(this._popupService.closeAll,this._popupService));
  },
  _goMyInfo : function(){
    this._popupService.closeAllAndGo('/product/roaming/my-use');
  },
  _goPlan : function(){
    this._popupService.closeAll();
    setTimeout($.proxy(this._historyService.goBack,this._historyService),0);
  },
  _arrangeAgree : function(data){
    var targetObj;
    data.agreeCnt = 0;
    targetObj = data.stipulationInfo;
    Object.keys(targetObj).map($.proxy(function(objectKey) {
      if(objectKey.indexOf('Ctt')>=0){
        targetObj[objectKey+'Tit'] = targetObj[objectKey].replace(/<([^>]+)>/ig,'');
        this.$rootContainer.find('.'+objectKey.replace('HtmlCtt','')+'.stext-c').text(targetObj[objectKey+'Tit']);
      }else if(objectKey.indexOf('AgreeYn')>=0){
        data.agreeCnt = targetObj[objectKey] === 'Y'?data.agreeCnt+1:data.agreeCnt;
      }
    },this));
    data.stipulationInfo = targetObj;
    return data;
  },
  _showDetailContent : function (targetEvt) {
    var $currentTarget = $(targetEvt.currentTarget);
    this._nowShowAgreeType = $currentTarget.data('type');
    this._popupService.open({
      hbs: 'FT_01_03_L01',
      data: {
        title: $currentTarget.data('tit'),
        html: $currentTarget.data('txt')
      }
    },$.proxy(this._bindDetailAgreePopupEvt,this),
      $.proxy(this._resetAriaHidden,this), 'agree_pop',$currentTarget);
  },
  _bindDetailAgreePopupEvt : function (popEvt){
    $(popEvt).on('click','.fe-btn_ok',$.proxy(this._detailAgreePopupEvt,this));
  },
  _detailAgreePopupEvt : function (){
    this._historyService.goBack();
    this.$rootContainer.find('input.'+this._nowShowAgreeType).trigger('click');
  },

  _convertPrice : function (priceVal) {
    if(!isNaN(priceVal)){
      priceVal = Tw.FormatHelper.addComma(priceVal)+Tw.CURRENCY_UNIT.WON;
    }
    return priceVal;
  },
  _showBffToolTip : function (evt) {
    var $target = $(evt.currentTarget);
    var tooltipData = $target.data();
    console.log(tooltipData.txt);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'popup',
      'title': tooltipData.tit,
      'btn-close':'btn-tooltip-close tw-popup-closeBtn',
      'title_type': 'tit-tooltip',
      'cont_align': 'tl',
      'tagStyle-div': 'div',
      'contents': tooltipData.txt,
      'tooltip': 'tooltip-pd'
    },null,$.proxy(this._resetAriaHidden,this),null,$target);
  },
  _resetAriaHidden : function () {
    this.$mainContent.attr('aria-hidden',false);
  }
};
