/**
 * FileName: product.mobileplan.join.tplan.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.09
 */

Tw.ProductMobileplanJoinTplan = function(rootEl, prodId, displayId, sktProdBenfCtt, isOverPayReqYn, isComparePlanYn, watchInfo) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._prodId = prodId;
  this._displayId = displayId;
  this._isOverPayReq = isOverPayReqYn === 'Y';
  this._isComparePlan = isComparePlanYn === 'Y';
  this._sktProdBenfCtt = window.unescape(sktProdBenfCtt);
  this._watchInfo = Tw.FormatHelper.isEmpty(watchInfo) ? null : JSON.parse(watchInfo);
  this._isSetOverPayReq = false;
  this._overpayRetryCnt = 0;
  this._smartWatchLine = null;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductMobileplanJoinTplan.prototype = {

  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnSetupOk.on('click', $.proxy(this._reqOverpay, this));
  },

  _enableSetupButton: function(e) {
    if ($(e.currentTarget).val() === 'NA00006116') {
      return this._selectSmartWatchItem();
    } else {
      this._smartWatchLine = null;
    }

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  _selectSmartWatchItem: function() {
    this._isDisableSmartWatchLineInfo = false;
    this._smartWatchLine = null;

    if (this._watchInfo.watchCase === 'C' || this._watchInfo.watchSvcList.length < 1 || true) {
      return this._popupService.openConfirmButton(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A73.TITLE,
        $.proxy(this._enableSmartWatchLineInfo, this), $.proxy(this._procClearSmartWatchLineInfo, this), Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    }

    if (this._watchInfo.watchCase === 'B' && this._watchInfo.watchSvcList.length > 1) {
      return this._openSmartWatchLineSelectPopup();
    }

    if (this._watchInfo.watchCase === 'A') {
      return true;
    }

    this._smartWatchLine = this._watchInfo.watchSvcList[0].watchSvcNum;
    return true;
  },

  _enableSmartWatchLineInfo: function() {
    this._isDisableSmartWatchLineInfo = true;
    this._popupService.close();
  },

  _procClearSmartWatchLineInfo: function() {
    if (this._isDisableSmartWatchLineInfo) {
      return;
    }

    this._clearSelectItem();
  },

  _openSmartWatchLineSelectPopup: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'title': Tw.POPUP_TITLE.TPLAN_SMARTWATCH,
          'list': this._watchInfo.watchSvcList.map($.proxy(this._getSmartWatchLineList, this))
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindSmartWatchLineSelectPopup, this), null, 'select_smart_watch_line_pop');
  },

  _getSmartWatchLineList: function(item, idx) {
    return {
      'label-attr': 'id="ra' + idx + '"',
      'txt': Tw.FormatHelper.conTelFormatWithDash(item.watchSvcNumMask),
      'radio-attr': 'id="ra' + idx + '" data-num="' + item.watchSvcNum + '" ' + (this._smartWatchLine === item.watchSvcNum ? 'checked' : '')
    };
  },

  _bindSmartWatchLineSelectPopup: function($popupContainer) {
    $popupContainer.on('click', '[data-num]', $.proxy(this._setSmartWatchLine, this));
  },

  _setSmartWatchLine: function(e) {
    this._smartWatchLine = $(e.currentTarget).data('num');
    this._popupService.close();
  },

  _clearSelectItem: function() {
    var $elem = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    $elem.prop('checked', false);
    $elem.parents('.radiobox').removeClass('checked').attr('aria-checked', 'false');
  },

  _convConfirmOptions: function(result) {
    this._confirmOptions = Tw.ProductHelper.convPlansJoinTermInfo(result);

    $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      svcProdNm: this._confirmOptions.preinfo.frProdInfo.prodNm,
      svcProdBasFeeInfo: this._confirmOptions.preinfo.frProdInfo.basFeeInfo,
      toProdName: this._confirmOptions.preinfo.toProdInfo.prodNm,
      isNumberBasFeeInfo: !this._confirmOptions.preinfo.toProdInfo.basFeeInfo.isNaN,
      toProdBasFeeInfo: this._confirmOptions.preinfo.toProdInfo.basFeeInfo.value,
      toProdDesc: this._sktProdBenfCtt,
      isJoinTermProducts: (!Tw.FormatHelper.isEmpty(this._confirmOptions.preinfo.autoJoinList) ||
        !Tw.FormatHelper.isEmpty(this._confirmOptions.preinfo.autoTermList)),
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      autoJoinBenefitList: this._confirmOptions.preinfo.toProdInfo.chgSktProdBenfCtt,
      autoTermBenefitList: this._confirmOptions.preinfo.frProdInfo.chgSktProdBenfCtt,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0),
      isMobilePlan: true,
      isComparePlan: this._isComparePlan,
      noticeList: $.merge(this._confirmOptions.preinfo.termNoticeList, this._confirmOptions.preinfo.joinNoticeList),
      joinTypeText: Tw.PRODUCT_TYPE_NM.CHANGE,
      typeText: Tw.PRODUCT_CTG_NM.PLANS,
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A2,
      downgrade: this._getDowngrade(),
      settingSummaryTexts: [{
        spanClass: 'val',
        text: this.$container.find('.widget-box.radio input[type="radio"]:checked').attr('title')
      }]
    });

    return this._confirmOptions;
  },

  _getDowngrade: function() {
    if (Tw.FormatHelper.isEmpty(this._confirmOptions.downgrade) || Tw.FormatHelper.isEmpty(this._confirmOptions.downgrade.guidMsgCtt)) {
      return null;
    }

    return {
      isHtml: this._confirmOptions.downgrade.htmlMsgYn === 'Y',
      guidMsgCtt: this._confirmOptions.downgrade.guidMsgCtt
    };
  },

  _reqOverpay: function() {
    if (!this._isOverPayReq || this._isSetOverPayReq) {
      this._confirmOptions = $.extend(this._confirmOptions, { isOverPayError: true });
      return this._procConfirm();
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._overpayRetryCnt++;
    this._isSetOverPayReq = true;
    this._apiService.request(Tw.API_CMD.BFF_10_0010)
      .done($.proxy(this._resOverpay, this));
  },

  _resOverpay: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (['ZEQPN0002', 'ZORDN3598'].indexOf(resp.code) !== -1 && this._overpayRetryCnt < 3) { // 최대 3회까지 재조회 시도
      this._isSetOverPayReq = false;
      return this._reqOverpay();
    }

    var overpayResults = {
      isOverpayResult: resp.code === Tw.API_CODE.CODE_00
    };

    if (overpayResults.isOverpayResult) {
      var isDataOvrAmt = parseFloat(resp.result.dataOvrAmt) > 0,
        isVoiceOvrAmt = parseFloat(resp.result.voiceOvrAmt) > 0,
        isSmsOvrAmt = parseFloat(resp.result.smsOvrAmt) > 0;

      if (!isDataOvrAmt && !isVoiceOvrAmt && !isSmsOvrAmt) {
        overpayResults.isOverpayResult = false;
      } else {
        overpayResults = $.extend(overpayResults, {
          isDataOvrAmt: isDataOvrAmt,
          isVoiceOvrAmt: isVoiceOvrAmt,
          isSmsOvrAmt: isSmsOvrAmt,
          dataIfAmt: resp.result.dataIfAmt,
          dataBasAmt: resp.result.dataBasAmt,
          dataOvrAmt: Math.ceil(resp.result.dataOvrAmt),
          voiceIfAmt: Math.ceil(resp.result.voiceIfAmt),
          voiceBasAmt: Math.ceil(resp.result.voiceBasAmt),
          voiceOvrAmt: Math.ceil(resp.result.voiceOvrAmt),
          smsIfAmt: Math.ceil(resp.result.smsIfAmt),
          smsBasAmt: Math.ceil(resp.result.smsBasAmt),
          smsOvrAmt: Math.ceil(resp.result.smsOvrAmt),
          ovrTotAmt: Math.ceil(resp.result.ovrTotAmt)
        });
      }
    }

    this._confirmOptions = $.extend(this._confirmOptions, {
      isOverpayResult: overpayResults.isOverpayResult,
      overpay: overpayResults
    });

    this._procConfirm();
  },

  _procConfirm: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0008, {
      option: this.$container.find('.widget-box.radio input[type="radio"]:checked').val()
    }, {}, [this._prodId]).done($.proxy(this._procConfirmRes, this));
  },

  _procConfirmRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    new Tw.ProductCommonConfirm(true, null, this._convConfirmOptions(resp.result), $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    var optProdId = this.$container.find('.widget-box.radio input[type="radio"]:checked').val(),
      reqParams = {
        asgnNumList: [],
        optProdId: optProdId,
        svcProdGrpId: ''
      };

    if (!Tw.FormatHelper.isEmpty(this._smartWatchLine) && optProdId === 'NA00006116') {
      reqParams = $.extend(reqParams, {
        optWatchNum: this._smartWatchLine
      });
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0012, reqParams,
      {}, [this._prodId]).done($.proxy(this._procJoinRes, this));
  },

  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    setTimeout($.proxy(this._openSuccessPop, this), 100);
  },

  _openSuccessPop: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    var completeData = {
      prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
      mytPage: 'myplan',
      btClass: 'item-two',
      prodId: this._prodId,
      prodNm: this._confirmOptions.preinfo.toProdInfo.prodNm,
      typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
      isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
      basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
        this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : '',
      isSmartWatch: $checked.val() === 'NA00006116'
    };

    if ($checked.val() === 'NA00006116') {
      completeData = $.extend(completeData, {
        basicTxt: Tw.FormatHelper.isEmpty(this._smartWatchLine) ? Tw.POPUP_CONTENTS.TPLAN_WATCH_NON_LINE :
          Tw.POPUP_CONTENTS.TPLAN_WATCH + Tw.FormatHelper.getFormattedPhoneNumber(this._smartWatchLine)
      });
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: completeData
    }, null, $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
