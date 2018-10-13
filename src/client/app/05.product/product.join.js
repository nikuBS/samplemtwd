/**
 * FileName: product.join.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

Tw.ProductJoin = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._template = Handlebars.compile($('#fe-templ-plans-overpay').html());
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductJoin.prototype = {

  _data: {
    tplanProdId: '',
    asgnNumList: []
  },

  _init: function() {
    if (this.$joinSetup.length < 1) {
      this.$joinConfirmLayer.show();
    }

    if (this.$joinSetup.length > 0) {
      this._bindSettingEvent();
    }

    this._prodId = this.$container.data('prod_id');
    this._displayGroup = this.$container.data('display_group');

    if (this.$agreeWrap.length < 1) {
      this.$btnJoin.removeAttr('disabled').prop('disabled', false);
    }

    if (this._displayGroup === 'plans') {
      this._getOverpay();
    }
  },

  _cachedElement: function() {
    this.$joinSetup = this.$container.find('.fe-join_setup');
    this.$joinConfirmLayer = this.$container.find('.fe-join_confirm');
    this.$confirmSettingInfo = this.$container.find('.fe-confirm_setting_info');
    this.$agreeWrap = this.$container.find('.fe-agree_wrap');
    this.$overpayGuide = this.$container.find('.fe-overpay_guide');
    this.$overpayWrap = this.$container.find('.fe-overpay_wrap');
    this.$overpayResult = this.$container.find('.fe-overpay_result');
    this.$prodMoney = this.$container.find('.fe-prod_money');

    this.$btnJoinSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$btnBackToSetup = this.$container.find('.fe-btn_back_to_setup');
    this.$btnComparePlans = this.$container.find('.fe-btn_compare_plans');
    this.$btnJoinCancel = this.$container.find('.fe-btn_join_cancel');
    this.$btnJoin = this.$container.find('.fe-btn_join');
    this.$btnAgreeShow = this.$container.find('.fe-btn_agree_view');

    this.$checkboxAgreeAll = this.$container.find('.fe-checkbox_agree_all');
    this.$checkboxAgreeItem = this.$container.find('.fe-checkbox_agree_item');
  },

  _bindEvent: function() {
    this.$confirmSettingInfo.on('click', $.proxy(this._showSetupLayer, this));

    this.$btnJoinSetupOk.on('click', $.proxy(this._showConfirmLayer, this));
    this.$btnBackToSetup.on('click', $.proxy(this._showSetupLayer, this));
    this.$btnComparePlans.on('click', $.proxy(this._openComparePlans, this));
    this.$btnJoinCancel.on('click', $.proxy(this._joinCancel, this));
    this.$btnJoin.on('click', $.proxy(this._openJoinConfirm, this));
    this.$btnAgreeShow.on('click', $.proxy(this._openAgreePop, this));

    this.$checkboxAgreeAll.on('change', $.proxy(this._agreeAllToggle, this));
    this.$checkboxAgreeItem.on('change', $.proxy(this._agreeItemToggle, this));
  },

  _bindSettingEvent: function() {
    switch (this.$joinSetup.data('id')) {
      case 'MP_02_02_03_01':
        this.$container.on('change', '.widget-box.radio input[type="radio"]', $.proxy(this._enableTplanSetupButton, this));
        break;
      case 'MP_02_02_03_05':
        break;
      case 'MP_02_02_03_11':
        break;
    }
  },

  _enableTplanSetupButton: function(e) {
    this._data.tplanProdId = $(e.currentTarget).val();
    this.$btnJoinSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  _showConfirmLayer: function() {
    this._setDataForConfirmLayer();
    this.$joinSetup.hide();
    this.$joinConfirmLayer.show();
    $(window).scrollTop(0);
  },

  _showSetupLayer: function() {
    this.$joinConfirmLayer.hide();
    this.$joinSetup.show();
    $(window).scrollTop(0);
  },

  _openComparePlans: function() {
    this._popupService.open({
      hbs: 'MP_02_02_01',
      data: {}
    }, null, null, 'compare_plans');
  },

  _joinCancel: function() {
    this._popupService.openModalTypeA(Tw.ALERT_MSG_PRODUCT.ALERT_3_A1.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A1.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A1.BUTTON, $.proxy(this._bindJoinPopupEvent, this));
  },

  _bindJoinPopupEvent: function($popupContainer) {
    $popupContainer.find('.tw-popup-closeBtn').on('click', $.proxy(this._goBack, this));
  },

  _goBack: function() {
    this._historyService.goBack();
  },

  _setDataForConfirmLayer: function() {
    switch (this.$joinSetup.data('id')) {
      case 'MP_02_02_03_01':
        this.$confirmSettingInfo.text(this.$joinSetup.find('.widget-box.radio input[type="radio"]:checked').attr('title'));
        break;
    }
  },

  _agreeAllToggle: function() {
    var isAllCheckboxChecked = this.$checkboxAgreeAll.is(':checked');

    this.$checkboxAgreeItem.prop('checked', isAllCheckboxChecked);
    this.$checkboxAgreeItem.parents('.fe-checkbox_style').toggleClass('checked', isAllCheckboxChecked)
      .attr('aria-checked', isAllCheckboxChecked);

    this._enableBtnJoin();
  },

  _agreeItemToggle: function() {
    var isCheckboxItemChecked = this.$container.find('.fe-checkbox_agree_item:not(:checked)').length < 1;

    this.$checkboxAgreeAll.prop('checked', isCheckboxItemChecked);
    this.$checkboxAgreeAll.parents('.fe-checkbox_style').toggleClass('checked', isCheckboxItemChecked)
      .attr('aria-checked', isCheckboxItemChecked);

    this._enableBtnJoin();
  },

  _openAgreePop: function(e) {
    var $parent = $(e.currentTarget).parent();
    this._popupService.open({
      hbs: 'PFT_01_03_L01',
      data: {
        title: $parent.find('.mtext').text(),
        html: $parent.find('.fe-agree_full_html').text()
      }
    }, null, null, 'agree_pop');
  },

  _enableBtnJoin: function() {
    if (this.$container.find('.fe-checkbox_agree_need:not(:checked)').length > 0) {
      this.$btnJoin.attr('disabled', 'disabled').prop('disabled', true);
    } else {
      this.$btnJoin.removeAttr('disabled').prop('disabled', false);
    }
  },

  _getOverpay: function() {
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

    this.$overpayResult.html(this._template(Object.assign(resp.result, {
      isDataOvrAmt: isDataOvrAmt,
      isVoiceOvrAmt: isVoiceOvrAmt,
      isSmsOvrAmt: isSmsOvrAmt
    })));

    this.$overpayWrap.show();
  },

  _openJoinConfirm: function() {
    this._popupService.openModalTypeA(Tw.ALERT_MSG_PRODUCT.ALERT_3_A2.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A2.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A2.BUTTON, null, $.proxy(this._procJoin, this));
  },

  _procJoin: function() {
    // @todo 인증 필요한 경우 처리
    var auth = false;
    if ( auth ) {
      return this._procAUth();
    }

    this._procJoinReq();
  },

  _procAUth: function() {
    // @todo auth
    var authResult = {
      code: '00'
    };

    if ( authResult.code !== Tw.API_CODE.CODE_00 ) {
      Tw.Error(authResult.code, authResult.msg).pop();
    } else {
      this._procJoinReq();
    }
  },

  _procJoinReq: function() {
    switch (this._displayGroup) {
      case 'plans':
        this._apiService.request(Tw.API_CMD.BFF_10_0012, {
          asgnNumList: this._data.asgnNumList,
          optProdId: this._data.tplanProdId,
          svcProdGrpId: this.$joinConfirmLayer.data('svc_prod_grp_id')
        }, {}, this._prodId).done($.proxy(this._procJoinRes, this));

        this._successData = {
          prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
          mytPage: 'fee-plan'
        };
        break;
      case 'additions':
        this._apiService.request(this.$joinConfirmLayer.data('join_bff'), {
        }, {}, this._prodId).done($.proxy(this._procJoinRes, this));

        this._successData = {
          prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
          mytPage: 'additions'
        };
        break;
    }
  },

  _procJoinRes: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).page();
    }

    var isProdMoney = this.$prodMoney && (this.$prodMoney.length > 0);

    this._popupService.open({
      hbs: 'DC_05_01_end_01_product',
      data: Object.assign(this._successData, {
        prodId: this._prodId,
        prodNm: this.$joinConfirmLayer.data('prod_nm'),
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: isProdMoney,
        basFeeInfo: isProdMoney ? this.$prodMoney.text() : ''
      })
    }, $.proxy(this._bindJoinResPopup, this), null, 'join_success');
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._goProductDetail, this));
  },

  _goProductDetail: function() {
    this._historyService.goLoad('/product/detail/' + this._prodId);
  }

};
