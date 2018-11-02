/**
 * FileName: product.join.t-plus
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

Tw.ProductJoinTplus = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._render();
  this._bindEvent();
};

Tw.ProductJoinTplus.prototype = {

  _render: function () {
    this.$longDiscount = this.$container.find('[data-id=plus-example]');
    this.$plusExample = this.$container.find('[data-id=long-discount]');
    this.$okBtn = this.$container.find('[data-id=btn-ok]');
  },

  _bindEvent: function () {
    this.$longDiscount.on('click', $.proxy(this._onLongDiscountClicked, this));
    this.$plusExample.on('click', $.proxy(this._onPlusExampleClicked, this));
    this.$okBtn.on('click', $.proxy(this._onOkBtnClicked, this));
  },

  _onLongDiscountClicked: function() {
    this._popupService.open({
      hbs:'BS_03_02_01_02',
      layer: true
    }, null, null, 'BS_03_02_01_02');
  },

  _onPlusExampleClicked: function() {
    this._popupService.open({
      hbs:'BS_03_02_01_03',
      layer: true,
      info: this.data.svcInfo
    }, null, null, 'BS_03_02_01_03');
  },

  _onOkBtnClicked: function() {
    this._historyService.goBack();
  }
};