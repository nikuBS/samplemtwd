/**
 * @file product.join.t-plus
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.10.22
 *
 */

Tw.BenefitTPlusSales = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._render();
  this._bindEvent();
};

Tw.BenefitTPlusSales.prototype = {

  _initialize: function() {
  },

  _render: function () {
    this.$plusExample = this.$container.find('[data-id=plus-example]');
    this.$longDiscount = this.$container.find('[data-id=long-discount]');
    this.$okBtn = this.$container.find('[data-id=btn-ok]');
  },

  _bindEvent: function () {
    this.$longDiscount.on('click', $.proxy(this._onLongDiscountClicked, this));
    this.$plusExample.on('click', $.proxy(this._onPlusExampleClicked, this));
    this.$okBtn.on('click', $.proxy(this._onOkBtnClicked, this));
  },

  _onLongDiscountClicked: function () {
    this._popupService.open({
      hbs: 'BS_03_02_01_03',
      layer: true,
      info: this.data.svcInfo
    }, null, null, 'long_discount');
  },

  _onPlusExampleClicked: function () {
    this._popupService.open({
      hbs: 'BS_03_02_01_02',
      layer: true
    }, null, null, 'tplus-example');
  },

  _onOkBtnClicked: function () {
    if ( this.data.isJoin ) {
      this._historyService.goBack();
    }
    else {
      // page 이동
      this._historyService.goLoad('/benefit/submain/detail/dis-pgm/input?prod_id=' + this.data.prodId);
    }
  }
};