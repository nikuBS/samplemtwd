/**
 * FileName: product.mobileplan.join.0plan-sm.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.01.10
 */

Tw.ProductMobileplanJoin0planSm = function(rootEl, prodId, displayId, sktProdBenfCtt, isOverPayReqYn, useOptionProdId, isComparePlanYn) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._isOverPayReq = isOverPayReqYn === 'Y';
  this._isComparePlan = isComparePlanYn === 'Y';
  this._sktProdBenfCtt = window.unescape(sktProdBenfCtt);
  this._useOptionProdId = useOptionProdId;
  this._isSetOverPayReq = false;
  this._overpayRetryCnt = 0;
  this._startTime = null;
  this._confirmOptions = {};

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductMobileplanJoin0planSm.prototype = {

  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$btnTimeSelect = this.$container.find('.fe-btn_time_select');
    this.$msg = this.$container.find('.fe-msg');
    this.$hour = this.$container.find('.fe-hour');
  },

  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnSetupOk.on('click', $.proxy(this._reqOverpay, this));
    this.$btnTimeSelect.on('click', $.proxy(this._openTimeSelectPop, this));
  },

  _enableSetupButton: function(e) {
    if ($(e.currentTarget).val() === 'NA00006163') {
      this.$btnTimeSelect.prop('disabled', false).removeAttr('disabled');
      this.$msg.removeClass('disabled');
    } else {
      this.$btnTimeSelect.prop('disabled', true).attr('disabled');
      this.$msg.addClass('disabled');
    }

    if ($(e.currentTarget).val() === 'NA00006163' && Tw.FormatHelper.isEmpty(this._startTime)) {
      this.$btnSetupOk.prop('disabled', true).attr('disabled');
      return;
    }

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
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
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      autoJoinBenefitList: this._confirmOptions.preinfo.toProdInfo.chgSktProdBenfCtt,
      autoTermBenefitList: this._confirmOptions.preinfo.frProdInfo.chgSktProdBenfCtt,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0 ||
        this._confirmOptions.installmentAgreement.isInstallAgreement),
      isInstallmentAgreement: this._confirmOptions.installmentAgreement.isInstallAgreement,
      isMobilePlan: true,
      isNoticeList: true,
      isComparePlan: this._isComparePlan,
      noticeList: $.merge(this._confirmOptions.preinfo.termNoticeList, this._confirmOptions.preinfo.joinNoticeList),
      joinTypeText: Tw.PRODUCT_TYPE_NM.CHANGE,
      typeText: Tw.PRODUCT_CTG_NM.PLANS,
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A2,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: this.$container.find('.widget-box.radio input[type="radio"]:checked').parent().find('.mtext').text()
      }],
      downgrade: this._getDowngrade()
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

  _openTimeSelectPop: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data: [
        {
          'list': $.proxy(this._getTimeList, this)
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindTimePopup, this), null, 'select_time_select', this.$btnTimeSelect);
  },

  _getTimeList: function() {
    var resultList = [];

    for(var i = 5; i <= 21; i++) {
      var strHour = (i < 10 ? '0' + i : i).toString();
      resultList.push({
        'label-attr': 'id="ra' + i + '"',
        'txt': strHour,
        'radio-attr': 'id="ra' + i + '" data-time="' + strHour + '" ' + (this._startTime === strHour ? 'checked' : '')
      });
    }

    return resultList;
  },

  _bindTimePopup: function($popupContainer) {
    $popupContainer.on('click', '[data-time]', $.proxy(this._setTime, this));
  },

  _setTime: function(e) {
    var time = $(e.currentTarget).data('time').toString(),
      endTime = parseInt(time, 10) + 3;

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    this.$btnTimeSelect.html(time + ' ' + Tw.PERIOD_UNIT.HOUR + $('<div\>').append(this.$btnTimeSelect.find('.ico')).html());
    this.$hour.text(time + Tw.PERIOD_UNIT.HOUR + '~' + (endTime < 10 ? '0' + endTime : endTime) + Tw.PERIOD_UNIT.HOUR);

    this.$msg.show().attr('aria-hidden', 'false');
    this.$msg.removeClass('disabled');

    this._startTime = time;
    this._popupService.close();
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
      .done($.proxy(this._resOverpay, this))
      .fail(Tw.CommonHelper.endLoading('.container'));
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
        var convDataAmt = Tw.ProductHelper.convDataAmtIfAndBas(resp.result.dataIfAmt, resp.result.dataBasAmt);

        overpayResults = $.extend(overpayResults, {
          isDataOvrAmt: isDataOvrAmt,
          isVoiceOvrAmt: isVoiceOvrAmt,
          isSmsOvrAmt: isSmsOvrAmt,
          dataIfAmt: Tw.FormatHelper.addComma(convDataAmt.dataIfAmt) + convDataAmt.unit,
          dataBasAmt: Tw.FormatHelper.addComma(convDataAmt.dataBasAmt) + convDataAmt.unit,
          dataOvrAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.dataOvrAmt)),
          voiceIfAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.voiceIfAmt)),
          voiceBasAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.voiceBasAmt)),
          voiceOvrAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.voiceOvrAmt)),
          smsIfAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.smsIfAmt)),
          smsBasAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.smsBasAmt)),
          smsOvrAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.smsOvrAmt)),
          ovrTotAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.ovrTotAmt))
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

    var joinOptionVal = this.$container.find('.widget-box.radio input[type="radio"]:checked').val();

    this._apiService.request(Tw.API_CMD.BFF_10_0008, {
      option: Tw.FormatHelper.isEmpty(this._useOptionProdId) ?
        joinOptionVal : joinOptionVal + ',' + this._useOptionProdId
    }, {}, [this._prodId]).done($.proxy(this._procConfirmRes, this))
      .fail(Tw.CommonHelper.endLoading('.container'));
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
        applyStaTm: optProdId === 'NA00006163' ? this._startTime + '00' : '',
        optProdId: optProdId,
        svcProdGrpId: ''
      };

    this._apiService.request(Tw.API_CMD.BFF_10_0012, reqParams,
      {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail(Tw.CommonHelper.endLoading('.container'));
  },

  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    setTimeout($.proxy(this._openSuccessPop, this), 100);
  },

  _getBasicText: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked'),
      txt = $checked.parent().find('.mtext').text() + '<br>';

    if ($checked.val() === 'NA00006163') {
      txt += this.$msg.text();
    } else {
      txt += $checked.data('desc');
    }

    return txt;
  },

  _openSuccessPop: function() {
    var completeData = {
      prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
      prodId: this._prodId,
      basicTxt: this._getBasicText(),
      prodNm: this._confirmOptions.preinfo.toProdInfo.prodNm,
      typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
      isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
      basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
        Tw.DATE_UNIT.MONTH_S + this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
    };

    this._popupService.open({
      hbs: 'complete_product',
      data: completeData
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
    $popupContainer.focus();
  },

  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
