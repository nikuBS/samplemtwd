/**
 * FileName: product.join.common-confirm.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.09
 */

Tw.ProductCommonConfirm = function(isPopup, rootEl, data, applyCallback) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._comparePlans = new Tw.ProductMobilePlanComparePlans();

  this._data = this._convData(data);
  this._isApply = false;
  this._isPopup = isPopup;
  this._applyCallback = applyCallback;

  if (isPopup) {
    this._openPop();
  } else {
    this._setContainer(false, rootEl);
    this._getOverpay();
  }
};

Tw.ProductCommonConfirm.prototype = {

  _cachedElement: function() {
    this.$btnApply = this.$container.find('.fe-btn_apply');
    this.$btnCancelJoin = this.$container.find('.fe-btn_cancel_join');
    this.$btnAgreeView = this.$container.find('.fe-btn_agree_view');
    this.$btnCloseConfirm = this.$container.find('.fe-btn_close_confirm');
    this.$btnComparePlans = this.$container.find('.fe-btn_compare_plans');
    this.$btnTipView = this.$container.find('.fe-btn_tip_view');

    this.$agreeWrap = this.$container.find('.fe-agree_wrap');
    this.$checkboxAgreeAll = this.$container.find('.fe-checkbox_agree_all');
    this.$checkboxAgreeItem = this.$container.find('.fe-checkbox_agree_item');
    this.$overpayGuide = this.$container.find('.fe-overpay_guide');
    this.$overpayWrap = this.$container.find('.fe-overpay_wrap');
    this.$overpayResult = this.$container.find('.fe-overpay_result');
    this.$overPayTmpl = this.$container.find('#fe-templ-plans-overpay');

    if (this._data.isWireplan) {
      this.$btnSelectTerminateCause = this.$container.find('.fe-btn_select_terminate_cause');
    }

    this._bindEvent();
  },

  _bindEvent: function() {
    this.$btnApply.on('click', $.proxy(this._openConfirmAlert, this));
    this.$btnAgreeView.on('click', $.proxy(this._openAgreePop, this));
    this.$btnCancelJoin.on('click', $.proxy(this._joinCancel, this));
    this.$btnCloseConfirm.on('click', $.proxy(this._closePop, this));
    this.$btnComparePlans.on('click', $.proxy(this._openComparePlans, this));
    this.$btnTipView.on('click', $.proxy(this._openTipView, this));

    this.$checkboxAgreeAll.on('change', $.proxy(this._agreeAllToggle, this));
    this.$checkboxAgreeItem.on('change', $.proxy(this._agreeItemToggle, this));

    if (this._data.isWireplan && this._data.isTerm) {
      this.$btnSelectTerminateCause.on('click', $.proxy(this._openSelectTerminateCause, this));
    }

    this._init();
  },

  _init: function() {
    if (this._data.isWirePlan) {
      this._termRsnCd = null;
    }

    if (this.$agreeWrap.length < 1) {
      this._toggleApplyBtn(true);
    }

    if (this.$overPayTmpl.length > 0) {
      this._template = Handlebars.compile(this.$overPayTmpl.html());
    }

    this._confirmAlert = this._data.confirmAlert || Tw.ALERT_MSG_PRODUCT.ALERT_3_A3;
  },

  _convData: function(data) {
    return $.extend(data, {
      isNoticeList: data.isMobilePlan || data.noticeList && data.noticeList.length > 0
    });
  },

  _openTipView: function(e) {
    var $btn = $(e.currentTarget);
    this._popupService.open({
      'pop_name': 'type_tx_scroll',
      'title': $btn.data('title'),
      'title_type': 'sub',
      'cont_align':'tl',
      'contents': $btn.parent().find('.fe-tip_view_html').html(),
      'bt_b': [{
        style_class:'pos-left fe-btn_close',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._bindTipView, this));

    e.preventDefault();
    e.stopPropagation();
  },

  _bindTipView: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_close', $.proxy(this._closeTipView, this));
  },

  _closeTipView: function() {
    this._popupService.close();
  },

  _openPop: function() {
    this._popupService.open($.extend(this._data, {
      hbs: 'product_common_confirm',
      layer: true,
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN
    }), $.proxy(this._setContainer, this, true), $.proxy(this._closePop, this), 'join_confirm');
  },

  _setContainer: function(isPopup, $container) {
    this.$container = $container;

    this._cachedElement();

    if (this._data.isWidgetInit) {
      skt_landing.widgets.widget_init();
    }
  },

  _joinCancel: function() {
    var alert = this._data.isTerm ? Tw.ALERT_MSG_PRODUCT.ALERT_3_A74 : Tw.ALERT_MSG_PRODUCT.ALERT_3_A1;

    this._popupService.openModalTypeATwoButton(alert.TITLE, alert.MSG, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES,
      $.proxy(this._bindJoinCancelPopupEvent, this), null, $.proxy(this._bindJoinCancelPopupCloseEvent, this));
  },

  _bindJoinCancelPopupEvent: function($popupContainer) {
    $popupContainer.find('.tw-popup-closeBtn').on('click', $.proxy(this._setCancelFlag, this));
  },

  _setCancelFlag: function() {
    this._cancelFlag = true;
  },

  _bindJoinCancelPopupCloseEvent: function() {
    if (!this._cancelFlag) {
      return;
    }

    if(this._data.setInfo) {
      // 할인프로그램 상품인 경우 예외 처리 (Edit: KIM inHwan)
      return this._historyService.replaceURL('/product/callplan/'+this._data.setInfoProdId);
    }

    if (!this._isPopup) {
      return this._historyService.goBack();
    }

    this._historyService.go(-2);
  },

  _getOverpay: function() {
    if (this._data.isOverPayReqYn !== 'Y') {
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0010)
      .done($.proxy(this._setOverpay, this));
  },

  _setOverpay: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      this.$overpayGuide.show();
      return;
    }

    var isDataOvrAmt = parseFloat(resp.result.dataOvrAmt) > 0,
      isVoiceOvrAmt = parseFloat(resp.result.voiceOvrAmt) > 0,
      isSmsOvrAmt = parseFloat(resp.result.smsOvrAmt) > 0;

    if (!isDataOvrAmt && !isVoiceOvrAmt && !isSmsOvrAmt) {
      return;
    }

    this.$overpayResult.html(this._template($.extend(resp.result, {
      isDataOvrAmt: isDataOvrAmt,
      isVoiceOvrAmt: isVoiceOvrAmt,
      isSmsOvrAmt: isSmsOvrAmt
    })));

    this.$overpayWrap.show();
  },

  _openSelectTerminateCause: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list': this._data.preinfo.termRsnList.map($.proxy(this._getTermRsn, this))
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindSelectTerminateCause, this), null, 'select_term_rsn_cd');
  },

  _getTermRsn: function(item, idx) {
    return {
      'label-attr': 'id="ra' + idx + '"',
      'txt': item.rsnNm,
      'radio-attr': 'id="ra' + idx + '" data-rsn_txt="' + item.rsnNm + '" data-term_rsn_cd="' + item.rsnCd +
        '" ' + ($.trim(this._termRsnCd) === $.trim(item.rsnCd) ? 'checked' : '')
    };
  },

  _bindSelectTerminateCause: function($popupContainer) {
    $popupContainer.on('click', '[data-term_rsn_cd]', $.proxy(this._setTermRsnCd, this));
  },

  _setTermRsnCd: function(e) {
    var $elem = $(e.currentTarget);

    this._termRsnCd = $elem.data('term_rsn_cd');
    this.$btnSelectTerminateCause.html($elem.data('rsn_txt') +
      $('<div\>').append(this.$btnSelectTerminateCause.find('.ico')).html());
    this._procApplyBtnActivate();

    this._popupService.close();
  },

  _agreeAllToggle: function() {
    var isAllCheckboxChecked = this.$checkboxAgreeAll.is(':checked');

    this.$checkboxAgreeItem.prop('checked', isAllCheckboxChecked);
    this.$checkboxAgreeItem.parents('.fe-checkbox_style').toggleClass('checked', isAllCheckboxChecked)
      .attr('aria-checked', isAllCheckboxChecked);

    this._procApplyBtnActivate();
  },

  _agreeItemToggle: function() {
    var isCheckboxItemChecked = this.$container.find('.fe-checkbox_agree_item:not(:checked)').length < 1;

    this.$checkboxAgreeAll.prop('checked', isCheckboxItemChecked);
    this.$checkboxAgreeAll.parents('.fe-checkbox_style').toggleClass('checked', isCheckboxItemChecked)
      .attr('aria-checked', isCheckboxItemChecked);

    this._procApplyBtnActivate();
  },

  _procApplyBtnActivate: function() {
    this._toggleApplyBtn(this.$container.find('.fe-checkbox_agree_need:not(:checked)').length < 1);
  },

  _openAgreePop: function(e) {
    var $parent = $(e.currentTarget).parent();
    this._popupService.open({
      hbs: 'FT_01_03_L01',
      data: {
        title: $parent.find('.mtext').text(),
        html: $parent.find('.fe-agree_full_html').html()
      }
    }, $.proxy(this._bindAgreePop, this, $parent), null, 'agree_pop');
  },

  _bindAgreePop: function($wrap, $popupContainer) {
    $popupContainer.find('.fe-btn_ok').on('click', $.proxy(this._setAgreeAndclosePop, this, $wrap));
  },

  _openComparePlans: function() {
    this._comparePlans.openCompare(this._data.preinfo.toProdInfo.prodId);
  },

  _setAgreeAndclosePop: function($wrap) {
    if (!$wrap.find('input[type=checkbox]').is(':checked')) {
      $wrap.find('input[type=checkbox]').trigger('click');
    }

    this._closePop();
  },

  _closePop: function() {
    if (this._data.selType)  {
      setTimeout($.proxy(function () {
        this._historyService.goBack();
        // this._historyService.replaceURL('/benefit/submain/detail/select-contract?prod_id=NA00004430&type='+ this._data.selType);
      }, this), 100);
    }
    else {
      this._popupService.close();
    }
  },

  _openConfirmAlert: function() {
    this._popupService.openModalTypeATwoButton(this._confirmAlert.TITLE, this._confirmAlert.MSG, this._confirmAlert.BUTTON,
      Tw.BUTTON_LABEL.CLOSE, null, $.proxy(this._setConfirmAlertApply, this), null, 'join_confirm_alert');
  },

  _setConfirmAlertApply: function() {
    this._popupService.close();
    setTimeout($.proxy(this._doCallback, this), 100);
  },

  _toggleApplyBtn: function(toggle) {
    if (this._data.isWireplan && this._data.isTerm) {
      toggle = !Tw.FormatHelper.isEmpty(this._termRsnCd);
    }

    if (toggle) {
      this.$btnApply.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnApply.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _doCallback: function() {
    var callbackParams = {};

    if (this._data.isWireplan && this._data.isTerm) {
      callbackParams.termRsnCd = this._termRsnCd;
    }

    this._applyCallback(callbackParams);
  }

};
