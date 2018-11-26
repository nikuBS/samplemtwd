/**
 * FileName: product.mobileplan.setting.bandYT.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.11.14
 */

Tw.ProductMobileplanSettingBandYT = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._render();
  this._bindEvent();
  this._initialize();
};

Tw.ProductMobileplanSettingBandYT.prototype = {

  _render: function () {
    this.$okBtn = this.$container.find('[data-id=ok]');
    this.$radioBox = this.$container.find('.fe-radio-box');
  },

  _bindEvent: function () {
    this.$okBtn.on('click', $.proxy(this._onClickOkBtn, this));
    this.$radioBox.on('change', $.proxy(this._onChangeRadioBox, this));
  },

  _initialize: function () {
    if ( this.data.bandyt.useOptionProdId ) {
      this.$radioBox.find('input[data-info=' + this.data.bandyt.useOptionProdId + ']').trigger('click');
    }
    else {
      this.$radioBox.find('input').eq(0).trigger('click');
    }
  },

  _onClickOkBtn: function () {
    this._popupService.openModalTypeA(this.data.title, Tw.ALERT_MSG_COMMON.CHANGE, Tw.PRODUCT_TYPE_NM.CHANGE,
      null, $.proxy(this._onSetBandYT, this), null);
  },

  _onChangeRadioBox: function (event) {
    var $target = $(event.target);
    this.info = $target.attr('data-info');
  },

  _onSetBandYT: function () {
    // TODO: 서버 오류로 추후 기능 테스트 필요!
    this._apiService.request(Tw.API_CMD.BFF_10_0035, { addCd: this.info }, {}, this.data.prodId)
      .done($.proxy(this._onSuccessJoinAddition, this))
      .fail($.proxy(this._onFailJoinAddtion, this));
  },

  _onSuccessJoinAddition: function () {
    this._historyService.go(-2);
  },

  _onFailJoinAddtion: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  }
};
