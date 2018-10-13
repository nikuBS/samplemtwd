/**
 * FileName: product.setting.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

Tw.ProductSetting = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
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
        this._resultPage = '/product/infinity-benefit-usage-history';
        this._currentInfinityBenefitProdId = this.$container.find('#current_prod_id').val();
        this._updateApiCode = this.$container.find('#update_api_code').val();
        this.$container.find('input[value="' + this._currentInfinityBenefitProdId + '"]').trigger('click');
        break;
      case 'MP_02_02_03_14':
        this._resultPage = '/myt/join/product/fee-plans';
        this._currentOptionProdId = this.$container.find('#current_prod_id').val();
        this._updateApiCode = this.$container.find('#update_api_code').val();
        this.$container.find('input[value="' + this._currentOptionProdId + '"]').trigger('click');
        break;
    }
  },

  _bindEventByDisplayCase: function() {
    switch(this._displayId) {
      case 'MP_02_02_03_01':
        break;
    }
  },

  _cachedElement: function() {
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$btnSetupOk.on('click', $.proxy(this._saveData, this));
  },

  _saveData: function() {
    var params = {},
      pathVariable = null;

    switch(this._displayId) {
      case 'MP_02_02_03_01':
        var $benefitChecked = this.$container.find('.production-benefit-wrap input:checked');
        this._successData = {
          prodNm: $benefitChecked.attr('title'),
          prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
          mytPage: 'fee-plan'
        };

        params = {
          beforeTDiyGrCd: this._currentInfinityBenefitProdId,
          afterTDiyGrCd: $benefitChecked.val()
        };
        pathVariable = this._currentInfinityBenefitProdId;
        break;
      case 'MP_02_02_03_14':
        var $zeroPlanChecked = this.$container.find('.product_0plan_wrap input:checked');
        this._successData = {
          prodNm: $zeroPlanChecked.attr('title'),
          prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
          mytPage: 'fee-plan'
        };

        params = { addCd: '2' };
        pathVariable = $zeroPlanChecked.val();
        break;
    }

    this._apiService.request(Tw.API_CMD[this._updateApiCode], params,
      {}, pathVariable).done($.proxy(this._saveResult, this));
  },

  _saveResult: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var isProdMoney = this.$prodMoney && (this.$prodMoney.length > 0);

    this._popupService.open({
      hbs: 'DC_05_01_end_01_product',
      data: Object.assign(this._successData, {
        typeNm: Tw.PRODUCT_TYPE_NM.SETTING,
        isBasFeeInfo: isProdMoney,
        basFeeInfo: isProdMoney ? this.$prodMoney.text() : ''
      })
    }, $.proxy(this._bindSaveResPopup, this), null, 'save_setting_success');
  },

  _bindSaveResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._goProductDetail, this));
  },

  _goProductDetail: function() {
    this._historyService.goLoad(this._resultPage);
  }

};
