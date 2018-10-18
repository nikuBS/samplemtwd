/**
 * FileName: product.setting.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

Tw.ProductSetting = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductSetting.prototype = {

  _data: {},
  _successData: {},

  _init: function() {
    this._prodId = this.$container.data('prod_id');
    this._displayId = this.$container.data('display_id');

    this._initByDisplayCase();
    this._bindEventByDisplayCase();
  },

  _initByDisplayCase: function() {
    switch(this._displayId) {
      case 'MP_02_02_03_01':
      case 'MP_02_02_03_10':
      case 'MP_02_02_03_14':
        if (this._displayId === 'MP_02_02_03_01') {
          this._resultPage = '/product/infinity-benefit-usage-history';
        } else {
          this._resultPage = '/myt/join/product/fee-plans';
        }

        this._currentProdId = this.$container.find('#current_prod_id').val();
        this._updateApiCode = this.$container.find('#update_api_code').val();

        if (!Tw.FormatHelper.isEmpty(this._currentProdId)) {
          this.$container.find('input[value="' + this._currentProdId + '"]').trigger('click');
        }
        break;
      case 'MV_02_02_01':
        this._template = Handlebars.compile($('#fe-templ-combination_item').html());
        if (this.$lineList.find('li').length > 0) {
          this.$lineWrap.show();
        }
        break;
    }
  },

  _bindEventByDisplayCase: function() {
    switch(this._displayId) {
      case 'MP_02_02_03_01':
      case 'MP_02_02_03_10':
      case 'MP_02_02_03_14':
        this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
        break;
      case 'MV_02_02_01':
      case 'MP_02_02_03_05':
        this.$btnAddNum.on('click', $.proxy(this._addNum, this));
        this.$lineList.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));
        this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
        this.$btnAddressBook.on('click', $.proxy(this._openAppAddressBook, this));
        this.$inputNumber.on('keyup input', $.proxy(this._toggleClearBtn, this));
        this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
        this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));
        break;
    }
  },

  _enableSetupButton: function() {
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  _cachedElement: function() {
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$btnAddNum = this.$container.find('.fe-btn_add_num');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnAddressBook = this.$container.find('.fe-btn_address_book');

    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineWrap = this.$container.find('.fe-line_wrap');
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$inputNumber = this.$container.find('.fe-num_input');

    this.$prodNm = this.$container.find('#prod_nm');
  },

  _bindEvent: function() {
    this.$btnSetupOk.on('click', $.proxy(this._saveData, this));
  },

  _saveData: function() {
    var params = {},
      pathVariable = null;

    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    switch(this._displayId) {
      case 'MP_02_02_03_01':
      case 'MP_02_02_03_10':
      case 'MP_02_02_03_14':
        var $planSettingChecked = this.$container.find('.fe-product_radio_wrap input:checked');
        if (this._currentProdId === $planSettingChecked.val()) {
          return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
        }

        this._successData = {
          prodNm: $planSettingChecked.attr('title'),
          prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
          mytPage: 'fee-plan'
        };

        if (this._displayId === 'MP_02_02_03_01') {
          pathVariable = this._currentProdId;
          params = {
            beforeTDiyGrCd: this._currentProdId,
            afterTDiyGrCd: $planSettingChecked.val()
          };
        } else {
          pathVariable = $planSettingChecked.val();
          params = {addCd: '2'};
        }

        break;
      default:
        this._successData = {
          prodNm: this.$prodNm.length > 0 ? this.$prodNm.val() : ''
        };
        break;
    }

    this._apiService.request(Tw.API_CMD[this._updateApiCode], params,
      {}, pathVariable).done($.proxy(this._saveResult, this));
  },

  _saveResult: function(resp) {
    skt_landing.action.loading.off({ ta: '.container' });

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var isProdMoney = this.$prodMoney && (this.$prodMoney.length > 0);

    this._popupService.open({
      hbs: 'DC_05_01_end_01_product',
      data: $.extend(this._successData, {
        typeNm: Tw.PRODUCT_TYPE_NM.SETTING,
        isBasFeeInfo: isProdMoney,
        basFeeInfo: isProdMoney ? this.$prodMoney.text() : ''
      })
    }, $.proxy(this._bindSaveResPopup, this), null, 'save_setting_success');
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
    var number = this.$inputNumber.val().replace(/-/gi, '');

    if (!Tw.ValidationHelper.isCellPhone(number)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_FRONT_VALIDATE_NUM.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_FRONT_VALIDATE_NUM.TITLE);
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0020, {
      svcNumList: [this._getServiceNumberFormat(number)]
    }, {}, this._prodId)
      .done($.proxy(this._addDelNumRes, this));
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

  _delNum: function(e) {
    if (this.$lineList.find('li').length < 2) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A10.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A10.TITLE);
    }

    this._popupService.openModalTypeA(Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON, null, $.proxy(this._delNumReq, this, $(e.currentTarget).data('grp_id')));
  },

  _delNumReq: function(grpId) {
    this._apiService.request(Tw.API_CMD.BFF_10_0019, {
      chldSvcMgmtNum: grpId
    }, {}, this._prodId).done($.proxy(this._addDelNumRes, this));
  },

  _addDelNumRes: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._historyService.reload();
  },

  _clearNum: function() {
    this.$inputNumber.val('');
    this.$btnClearNum.hide();
    this._toggleNumAddBtn();
  },

  _toggleClearBtn: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9.]/g, ''));
    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show();
    } else {
      this.$btnClearNum.hide();
    }

    this._toggleNumAddBtn();
  },

  _toggleNumAddBtn: function() {
    if (this.$inputNumber.val().length > 0) {
      this.$btnAddNum.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnAddNum.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _blurInputNumber: function() {
    this.$inputNumber.val(Tw.FormatHelper.getDashedCellPhoneNumber(this.$inputNumber.val()));
  },

  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  _bindSaveResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._goProductDetail, this));
  },

  _goProductDetail: function() {
    this._historyService.goLoad(this._resultPage);
  }

};
