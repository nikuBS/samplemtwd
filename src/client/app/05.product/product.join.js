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
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductJoin.prototype = {

  _data: {
    tplanProdId: '',
    asgnNumList: [],
    addList: []
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

    if (this.$overPayTmpl.length > 0) {
      this._template = Handlebars.compile(this.$overPayTmpl.html());
    }

    if (this.$combinationItemTmpl.length > 0) {
      this._combinationTemplate = Handlebars.compile(this.$combinationItemTmpl.html());
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
    this.$confirmSettingInfoWrap = this.$container.find('.fe-confirm_setting_info_wrap');

    this.$overPayTmpl = this.$container.find('#fe-templ-plans-overpay');
    this.$combinationItemTmpl = this.$container.find('#fe-templ-combination_item');

    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$btnBackToSetup = this.$container.find('.fe-btn_back_to_setup');
    this.$btnComparePlans = this.$container.find('.fe-btn_compare_plans');
    this.$btnJoinCancel = this.$container.find('.fe-btn_join_cancel');
    this.$btnJoin = this.$container.find('.fe-btn_join');
    this.$btnAgreeShow = this.$container.find('.fe-btn_agree_view');
    this.$btnAddNum = this.$container.find('.fe-btn_add_num');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnAddressBook = this.$container.find('.fe-btn_address_book');

    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineWrap = this.$container.find('.fe-line_wrap');
    this.$inputNumber = this.$container.find('.fe-num_input');

    this.$checkboxAgreeAll = this.$container.find('.fe-checkbox_agree_all');
    this.$checkboxAgreeItem = this.$container.find('.fe-checkbox_agree_item');
  },

  _bindEvent: function() {
    this.$confirmSettingInfo.on('click', $.proxy(this._showSetupLayer, this));

    this.$btnSetupOk.on('click', $.proxy(this._showConfirmLayer, this));
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
      case 'MP_02_02_03_01':  // Data 인피니티
        this.$container.on('change', '.widget-box.radio input[type="radio"]', $.proxy(this._setTplanData, this));
        break;
      case 'MP_02_02_03_11':  // Ttab 요금제 가입
      case 'MP_02_02_03_05':  // 데이터 함께쓰기
      case 'MV_02_02_01': // 내폰끼리 결합
        this.$btnAddNum.on('click', $.proxy(this._addNum, this));
        this.$lineList.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));
        this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
        this.$btnAddressBook.on('click', $.proxy(this._openAppAddressBook, this));
        this.$inputNumber.on('keydown', $.proxy(this._detectInputNumber, this));
        break;
    }
  },

  _setTplanData: function(e) {
    this._data.tplanProdId = $(e.currentTarget).val();
    this._toggleSetupButton(true);
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _showConfirmLayer: function() {
    if (this.$inputNumber.length > 0 && this.$lineWrap.length < 1) {
      if (!Tw.ValidationHelper.isCellPhone(this.$inputNumber.val())) {
        return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_FRONT_VALIDATE_NUM.MSG,
          Tw.ALERT_MSG_PRODUCT.ALERT_FRONT_VALIDATE_NUM.TITLE);
      }
    }

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
    this._popupService.close();
  },

  _setDataForConfirmLayer: function() {
    var confirmSettingInfo = '';

    switch (this.$joinSetup.data('id')) {
      case 'MP_02_02_03_01':
        confirmSettingInfo = this.$joinSetup.find('.widget-box.radio input[type="radio"]:checked').attr('title');
        break;
      case 'MV_02_02_01':
      case 'MP_02_02_03_05':
      case 'MP_02_02_03_11':
        confirmSettingInfo = Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this.$joinSetup.data('id')] + ' ' + this._data.addList.length +
          Tw.PRODUCT_JOIN_SETTING_AREA_CASE.LINE;
        break;
    }

    if (Tw.FormatHelper.isEmpty(confirmSettingInfo)) {
      this.$confirmSettingInfoWrap.hide();
    } else {
      this.$confirmSettingInfo.text(confirmSettingInfo);
    }
  },

  _agreeAllToggle: function() {
    var isAllCheckboxChecked = this.$checkboxAgreeAll.is(':checked');

    this.$checkboxAgreeItem.prop('checked', isAllCheckboxChecked);
    this.$checkboxAgreeItem.parents('.fe-checkbox_style').toggleClass('checked', isAllCheckboxChecked)
      .attr('aria-checked', isAllCheckboxChecked);

    this._toggleBtnJoin(this.$container.find('.fe-checkbox_agree_need:not(:checked)').length > 0);
  },

  _agreeItemToggle: function() {
    var isCheckboxItemChecked = this.$container.find('.fe-checkbox_agree_item:not(:checked)').length < 1;

    this.$checkboxAgreeAll.prop('checked', isCheckboxItemChecked);
    this.$checkboxAgreeAll.parents('.fe-checkbox_style').toggleClass('checked', isCheckboxItemChecked)
      .attr('aria-checked', isCheckboxItemChecked);

    this._toggleBtnJoin(this.$container.find('.fe-checkbox_agree_need:not(:checked)').length > 0);
  },

  _openAgreePop: function(e) {
    var $parent = $(e.currentTarget).parent();
    this._popupService.open({
      hbs: 'FT_01_03_L01',
      data: {
        title: $parent.find('.mtext').text(),
        html: $parent.find('.fe-agree_full_html').text()
      }
    }, $.proxy(this._bindAgreePop, this), null, 'agree_pop');
  },

  _bindAgreePop: function($popupContainer) {
    $popupContainer.find('.fe-btn_ok').on('click', $.proxy(this._closeAgreePop, this));
  },

  _closeAgreePop: function() {
    this._popupService.close();
  },

  _toggleBtnJoin: function(isDisable) {
    if (isDisable) {
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

  _openAppAddressBook: function() {
    this._nativeService.send('getContact', {}, $.proxy(this._setAppAddressBook, this));
  },

  _setAppAddressBook: function(res) {
    if (Tw.FormatHelper.isEmpty(res.params.phoneNumber)) {
      return;
    }

    this.$inputNumber.val(res.params.phoneNumber);
  },

  _addNum: function() {
    var number = this.$inputNumber.val();

    if (this.$lineList.find('li').length > 3) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.TITLE);
    }

    if (!Tw.ValidationHelper.isCellPhone(number) || this._data.addList.indexOf(number) !== -1) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_FRONT_VALIDATE_NUM.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_FRONT_VALIDATE_NUM.TITLE);
    }

    this._data.addList.push(number);
    this.$lineList.append(this._combinationTemplate({
      number: number,
      numMask: Tw.FormatHelper.getFormattedPhoneNumber(number)
    }));

    this._clearNum();
    this._toggleSetupButton(true);
    this.$lineWrap.show();
  },

  _delNum: function(e) {
    var $item = $(e.currentTarget).parents('li');

    this._data.addList.splice(this._data.addList.indexOf($item.data('num')), 1);

    $item.remove();
    if (this.$lineList.find('li').length < 1) {
      this.$lineWrap.hide();
      this._toggleSetupButton(false);
    }
  },

  _detectInputNumber: function() {
    if (this.$lineWrap.length < 1) {
      return this._toggleSetupButton(this.$inputNumber.val().length > 0);
    }

    this._toggleClearBtn();
  },

  _clearNum: function() {
    this.$inputNumber.val('');
    this.$btnClearNum.hide();
  },

  _toggleClearBtn: function() {
    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show();
    } else {
      this.$btnClearNum.hide();
    }
  },

  _getServiceNumberFormat: function(number) {
    if (number.length === 10) {
      return {
        serviceNumber1: number.substr(0, 3),
        serviceNumber2: number.substr(3, 3),
        serviceNumber3: number.substr(6, 4)
      };
    }

    return {
      serviceNumber1: number.substr(0, 3),
      serviceNumber2: number.substr(3, 4),
      serviceNumber3: number.substr(7, 4)
    };
  },

  _openJoinConfirm: function() {
    this._popupService.openModalTypeA(Tw.ALERT_MSG_PRODUCT.ALERT_3_A2.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A2.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A2.BUTTON, null, $.proxy(this._procJoin, this));
  },

  _procJoin: function() {
    this._popupService.close();

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
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    switch (this._displayGroup) {
      case 'plans':
        if (this.$inputNumber.length > 0) {
          this._data.asgnNumList.push(this.$inputNumber.val());
        }

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
        var additionsJoinBffCode = this.$joinSetup.length > 0 ? 'BFF_10_0018' : 'BFF_10_0035',
          params = this._getAdditionsParams();

        this._apiService.request(Tw.API_CMD[additionsJoinBffCode], params, {}, this._prodId).done($.proxy(this._procJoinRes, this));

        this._successData = {
          prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
          mytPage: 'additions'
        };
        break;
    }
  },

  _getAdditionsParams: function() {
    var resultParams = {};

    if (this.$joinSetup.length < 1) {
      return resultParams;
    }

    switch(this.$joinSetup.data('id')) {
      case 'MV_02_02_01':
        resultParams = {
          svcNumList: this._getSvcNumList()
        };
        break;
    }

    return resultParams;
  },

  _getSvcNumList: function() {
    var resultList = [];

    this.$lineList.find('li').each(function(index, item) {
      resultList.push(this._getServiceNumberFormat($(item).data('num')));
    }.bind(this));

    return resultList;
  },

  _procJoinRes: function(resp) {
    skt_landing.action.loading.off({ ta: '.container' });

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

    // @todo SvcInfo Refresh
    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._goProductDetail, this));
  },

  _goProductDetail: function() {
    this._popupService.close();
    this._historyService.goLoad('/product/detail/' + this._prodId);
  }

};
