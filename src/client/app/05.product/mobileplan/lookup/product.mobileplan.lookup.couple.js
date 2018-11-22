/**
 * FileName: product.mobileplan.lookup.couple.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.11.14
 */

Tw.ProductMobileplanSettingBandYT = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._render();
  this._bindEvent();
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

  _onClickOkBtn: function () {
    this._popupService.openModalTypeA(this.data.title, Tw.ALERT_MSG_COMMON.CHANGE, Tw.PRODUCT_TYPE_NM.CHANGE,
      null, $.proxy(this._onSetBandYT, this), null);
  },

  _onChangeRadioBox: function (event) {
    var $target = $(event.target);
    // TODO: 임시 상품 코드명 사용 중, API 정상 동작 후 처리 필요!
    this.info = $target.attr('data-info');
  },

  _onSetBandYT: function() {
    // TODO: 설정 API 미개발, 정상 동작 후 처리 필요
    this._historyService.go(-2);
  }
};
