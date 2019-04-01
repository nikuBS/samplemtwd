/**
 * FileName: product.roaming.join.confirm-info.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.11.30
 */

Tw.ProductRoamingJoinConfirmInfo = function (rootEl,data,doJoinCallBack,closeCallBack,hash,rootData,pageProdId,targetEvt) {
  this.$rootContainer = rootEl;
  this._page = hash === null;
  this._popupData = this._arrangeAgree(data);
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$rootContainer);
  this._showDateFormat = 'YYYY. MM. DD.';
  this._dateFormat = 'YYYYMMDD';
  this._focusService = new Tw.InputFocusService(rootEl, this.$rootContainer.find('#do_join'));
  if(this._page){
    this._$popupContainer = this.$rootContainer;
    this._prodTypeInfo = rootData;
    this._prodId = pageProdId;
    this._pageInit();
  }else{
    this._callTarget = targetEvt;
    this._doJoinCallBack = doJoinCallBack;
    this._popupInit(hash);
    this._rootData = rootData;
    this._closeCallback = closeCallBack;
  }
};

Tw.ProductRoamingJoinConfirmInfo.prototype = {
  _pageInit : function () {
    if(isNaN(this._popupData.preinfo.reqProdInfo.basFeeInfo)){
      this.$rootContainer.find('.tx-bold.vbl').text(this._popupData.preinfo.reqProdInfo.basFeeInfo);
      this.$rootContainer.find('#tex').hide();
    }else{
      this.$rootContainer.find('.tx-bold.vbl').text(this._convertPrice(this._popupData.preinfo.reqProdInfo.basFeeInfo));
    }
    this._bindPopupElementEvt(this.$rootContainer);
    this.$tooltipList = this.$rootContainer.find('#tooltip_list');
    this._tooltipTemplate = Handlebars.compile(this.$rootContainer.find('#tooltip_template').html());
    this._tooltipInit(this._prodId,this._prodTypeInfo.prodTypCd);
  },
  _popupInit : function (hash) {
    if(isNaN(this._popupData.prodFee)){
      this._popupData.showTex = false;
    }else{
      this._popupData.prodFee = this._convertPrice(this._popupData.prodFee);
      this._popupData.showTex = true;
    }
    this._openConfirmRoamingInfoPopup(this._popupData,hash);
  },
  _openConfirmRoamingInfoPopup : function (data,hash) {
    data.toolTipData = this._tooltipInit(data.prodId,data.prodType===(Tw.NOTICE.ROAMING+' '+Tw.PRODUCT_CTG_NM.PLANS)?'H_P':'');
    this._popupService.open({
      hbs: 'RM_11_01_01_02',
      layer: true,
      data : data
    },$.proxy(this._popupOpenCallback,this),
      $.proxy(function () {
        //this.$rootContainer.find('#do_confirm').focus();
        this.$rootContainer.find('.fe-main-content').attr('aria-hidden',false);
      },this),hash,$(this._callTarget.currentTarget));
  },
  _popupOpenCallback : function($poppContainer){
    this._$popupContainer = $poppContainer;
    this._bindPopupElementEvt($poppContainer);
    this._currentDate = Tw.DateHelper.getCurrentShortDate();
    var setingInfo;
    if(this._popupData.joinType==='setup'){
      setingInfo = Tw.DateHelper.getShortDateWithFormat(this._popupData.userJoinInfo.svcStartDt,
        this._showDateFormat,this._dateFormat)+' '+this._popupData.userJoinInfo.svcStartTm+':00';
      setingInfo+= ' ~ '+Tw.DateHelper.getShortDateWithFormat(this._popupData.userJoinInfo.svcEndDt,
        this._showDateFormat,this._dateFormat)+' '+this._popupData.userJoinInfo.svcEndTm+':00';
    }else if(this._popupData.joinType==='auto'){
      setingInfo = Tw.DateHelper.getShortDateWithFormat(this._popupData.userJoinInfo.svcStartDt,
        this._showDateFormat,this._dateFormat)+' '+this._popupData.userJoinInfo.svcStartTm+':00';
    }else if(this._popupData.joinType==='begin'){
      setingInfo = Tw.DateHelper.getShortDateWithFormat(this._popupData.userJoinInfo.svcStartDt,
        this._showDateFormat,this._dateFormat);
    }else if(this._popupData.joinType==='alarm'){
      setingInfo = Tw.ROAMING_JOIN_STRING.LINE_NUM.replace(':number',this._popupData.userJoinInfo.svcNumList.length);
    }
    this._$popupContainer.find('.term').text(setingInfo);
  },
  _bindPopupElementEvt : function (popupObj) {
    var $popupLayer = $(popupObj);
    this._$allAgreeElement = this._$popupContainer.find('.all.checkbox>input');
    this._$individualAgreeElement = this._$popupContainer.find('.individual.checkbox>input');
    $popupLayer.on('click','#do_join',$.proxy(this._doJoin,this));
    $popupLayer.on('click','.agree-view',$.proxy(this._showDetailContent,this));
    $popupLayer.on('click','.tip-view-btn.bff',$.proxy(this._showBffToolTip,this));
    if(this._popupData.agreeCnt<=0){
      this._$popupContainer.find('#do_join').removeAttr('disabled');
    }else{
      $popupLayer.on('click','.all.checkbox>input',$.proxy(this._allAgree,this));
      $popupLayer.on('click','.individual.checkbox>input',$.proxy(this._agreeCheck,this));
    }
    if(this._page){
      $popupLayer.on('click','.prev-step',$.proxy(this._showCancelAlart,this));
    }else{
      if(this._closeCallback){
        $popupLayer.on('click','.prev-step',$.proxy(this._closeCallback,this._rootData));
      }else{
        $popupLayer.on('click','.prev-step',$.proxy(this._showCancelAlart,this));
      }
    }
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
  _doJoin : function (evt) {
    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A3.TITLE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A3.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A3.BUTTON, Tw.BUTTON_LABEL.CLOSE,
      null,
      $.proxy(this._confirmInfo,this,evt),
      $.proxy(this._resetAriaHidden,this,evt),null,$(evt.currentTarget));
  },
  _confirmInfo : function (evt) {
    this._popupService.close();
    setTimeout($.proxy(function () {
      if(this._page===true){
        this._excuteJoin(evt);
      }else{
        this._doJoinCallBack(this._popupData,this._apiService,this._historyService,this._rootData,evt);
      }
    },this),100);
  },
  _excuteJoin : function (evt) {
    var userJoinInfo = {
      'svcStartDt' : '{}',
      'svcEndDt' : '{}',
      'svcStartTm' : '{}',
      'svcEndTm' : '{}',
      'startEndTerm' : '{}'
    };



    this._apiService.request(Tw.API_CMD.BFF_10_0084, userJoinInfo, {},[this._prodId]).
    done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00){
        var completePopupData = {
          prodNm : this._popupData.preinfo.reqProdInfo.prodNm,
          processNm : Tw.PRODUCT_TYPE_NM.JOIN,
          isBasFeeInfo : this._convertPrice(this._popupData.preinfo.reqProdInfo.basFeeInfo),
          typeNm : Tw.NOTICE.ROAMING+' '+(this._prodTypeInfo.prodTypCd==='H_P'?Tw.PRODUCT_CTG_NM.PLANS:Tw.PRODUCT_CTG_NM.ADDITIONS),
          settingType : Tw.PRODUCT_TYPE_NM.JOIN,
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

      } else {
        this._popupService.openAlert(
            res.msg,
            Tw.POPUP_TITLE.NOTIFY,null,
            $.proxy(this._resetAriaHidden,this,evt),
            null,
            $(evt.currentTarget)
        );
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(
          err.msg,
          Tw.POPUP_TITLE.NOTIFY,null,
          $.proxy(this._resetAriaHidden,this,evt),
          null,
          $(evt.currentTarget));
    }, this));

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
        $.proxy(this._resetAriaHidden,this,targetEvt), 'agree_pop',$currentTarget);
  },
  _bindDetailAgreePopupEvt : function (popEvt){
    $(popEvt).on('click','.fe-btn_ok',$.proxy(this._detailAgreePopupEvt,this));
  },
  _detailAgreePopupEvt : function (){
    var $agreeElement = this._$popupContainer.find('.'+this._nowShowAgreeType);
    if($agreeElement.attr('checked')!=='checked'){
      $agreeElement.trigger('click');
    }
    $agreeElement.promise().done($.proxy(function(){
      setTimeout($.proxy(this._historyService.goBack,this._historyService),300);
    },this));
  },
  _arrangeAgree : function(data){
    var targetObj;
    data.agreeCnt = 0;
    if(this._page){
      targetObj = data.stipulationInfo;
      data.agreeCnt = this._countAgree(targetObj);
      data.stipulationInfo = targetObj;
      if(data.agreeCnt<=1){
        this.$rootContainer.find('#all_agree').hide();
      }
    }else{
      targetObj = data.autoInfo.stipulationInfo;
      data.agreeCnt = this._countAgree(targetObj);
      data.autoInfo.stipulationInfo = targetObj;
    }
    return data;
  },
  _countAgree : function (dataObj) {
    var agreeCnt = 0;
    Object.keys(dataObj).map(function(objectKey) {
      if(objectKey.indexOf('AgreeYn')>=0){
        agreeCnt = dataObj[objectKey] === 'Y'?agreeCnt+1:agreeCnt;
      }
    });
    return agreeCnt;
  },
  _bindCompletePopupEvt : function (popupObj) {
    $(popupObj).on('click','.btn-round2',$.proxy(this._goMyInfo,this));
    $(popupObj).on('click','.btn-floating',$.proxy(this._popupService.closeAll,this._popupService));
  },
  _goBack : function(){
    this._popupService.close();
    this._historyService.goBack();
  },
  _goMyInfo : function(){
    var targetUrl = this._prodTypeInfo.prodTypCd==='H_P'?'/product/roaming/my-use':'/product/roaming/my-use#add';
    this._popupService.closeAllAndGo(targetUrl);
  },
  _showCancelAlart : function (evt){
    var alert = Tw.ALERT_MSG_PRODUCT.ALERT_3_A1;
    this._popupService.openModalTypeATwoButton(alert.TITLE, alert.MSG, Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null,
      $.proxy(this._goPlan,this),
      $.proxy(this._resetAriaHidden,this,evt),null,$(evt.currentTarget));
  },
  _bindCancelPopupEvent : function (popupLayer) {
    $(popupLayer).on('click','.pos-left>button',$.proxy(this._goPlan,this));
  },
  _goPlan : function () {
    this._popupService.closeAll();
    setTimeout($.proxy(this._historyService.goBack,this._historyService),0);
  },
  _tooltipInit : function (prodId,type) {
    this._totalTipObj = {
      RM_11_01_01_02_tip_03_01 : {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00004299','NA00004326']
      },
      RM_11_01_01_02_tip_03_02 : {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00004941','NA00004942']
      },
      RM_11_01_01_02_tip_03_03 : {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00005137','NA00005138']
      },
      RM_11_01_01_02_tip_03_04 : {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00005632','NA00005634','NA00005635']
      },
      RM_11_01_01_02_tip_03_05 : {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00005821']
      },
      RM_11_01_01_02_tip_03_06 : {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00005821']
      },
      RM_11_01_01_02_tip_03_07: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00003015']
      },
      RM_11_01_01_02_tip_03_08: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00003015']
      },
      RM_11_01_01_02_tip_03_09: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00004229','NA00004230','NA00004231','NA00005167']
      },
      RM_11_01_01_02_tip_03_10: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00005252','NA00005300','NA00005505']
      },
      RM_11_01_01_02_tip_03_11: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00003178','NA00003177','NA00004226']
      },
      RM_11_01_01_02_tip_03_12: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00003178','NA00003177','NA00004226']
      },
      RM_11_01_01_02_tip_03_13: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00006046','NA00006048','NA00006038','NA00006040','NA00005900']
      },
      RM_11_01_01_02_tip_03_14: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00006046','NA00006048','NA00006038','NA00006040','NA00005900']
      },
      RM_11_01_01_02_tip_03_15: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00006050','NA00006052','NA00006042','NA00006044','NA00005902']
      },
      RM_11_01_01_02_tip_03_16: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00006050','NA00006052','NA00006042','NA00006044','NA00005902']
      },
      RM_11_01_01_02_tip_03_17: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00005699']
      },
      RM_11_01_01_02_tip_03_18: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00005699']
      },
      RM_11_01_01_02_tip_03_19: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00005898']
      },
      RM_11_01_01_02_tip_03_20: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00005898']
      },
      RM_11_01_01_02_tip_03_21: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00005691','NA00005694','NA00005690','NA00005693','NA00005692','NA00005695']
      },
      RM_11_01_01_02_tip_03_22: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00005691','NA00005694','NA00005690','NA00005693','NA00005692','NA00005695']
      },
      RM_11_01_01_02_tip_03_28: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00003196','NA00004088','NA00004833','NA00005049','NA00005047','NA00005048','NA00005501','NA00005502']
      },
      RM_11_01_01_02_tip_03_30: {
        tipTitle : Tw.TOOLTIP_TITLE.SERVICE_START_GUIDE,
        target : ['NA00005633']
      },
      RM_11_01_01_02_tip_03_33: {
        tipTitle : Tw.TOOLTIP_TITLE.SERVICE_START_GUIDE,
        target : ['NA00003196','NA00005049','NA00005501','NA00006486']
      },
      RM_11_01_01_02_tip_03_34: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00003196','NA00004088','NA00004833','NA00005049','NA00005047','NA00005048']
      },
      TC000032: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00005501','NA00005502']
      },
      TC000033: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00006486','NA00006487','NA00006488']
      },
      TC000034: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00006486','NA00006487','NA00006488','NA00005633']
      },
      TC000035: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00006489','NA00006490','NA00006491','NA00006492','NA00006493','NA00006494','NA00006495','NA00006496','NA00006497','NA00006498','NA00006499','NA00006500']
      },
      TC000036: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00006489','NA00006490','NA00006491','NA00006492','NA00006493','NA00006494','NA00006495','NA00006496','NA00006497','NA00006498','NA00006499','NA00006500']
      },
      TC000039: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_USE_GUIDE,
        target : ['NA00006229','NA00006226']
      },
      TC000040: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00006229']
      },
      TC000041: {
        tipTitle : Tw.TOOLTIP_TITLE.ROAMING_PAY_GUIDE,
        target : ['NA00006226']
      }
    };

    var tooltipArr = [];

    for(var _key in this._totalTipObj){
      if(this._totalTipObj[_key].target.indexOf(prodId)>-1){
        tooltipArr.push({ tipId : _key, tipTitle : this._totalTipObj[_key].tipTitle });
      }
    }
    if(type==='H_P'){
      tooltipArr.push({ tipId : 'TC000030', tipTitle : Tw.TOOLTIP_TITLE.ROAMING_COMMON_GUIDE });
    }

    if(this._page){
      if(tooltipArr.length<=0&&this._popupData.preinfo.joinNoticeList.length<=0){
        this.$rootContainer.find('.tip_container').hide();
        return;
      }
      _.each(tooltipArr,$.proxy(function (data) {
        this.$tooltipList.append(this._tooltipTemplate({tipData : data}));
      },this));
    }else{
      return tooltipArr;
    }
  },
  _showBffToolTip : function (evt) {
    var $target = $(evt.currentTarget);
    var tooltipData = $target.data();
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
    },null,$.proxy(this._resetAriaHidden,this,evt),null,$target);
  },
  _convertPrice : function (priceVal) {
    if(!isNaN(priceVal)){
      priceVal = Tw.FormatHelper.addComma(priceVal)+Tw.CURRENCY_UNIT.WON;
    }
    return priceVal;
  },
  _resetAriaHidden : function (evt) {
    if(this._page){
      this.$rootContainer.find('.fe-main-content').attr('aria-hidden',false);
    }else{
      $(evt.delegateTarget).attr('aria-hidden',false);
    }
  }
};
