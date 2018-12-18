/**
 * FileName: product.join.t-plus
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
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
    this.joinInfoTerm = $.extend(this.data.joinInfoTerm, {
      svcNumMask: this.data.joinInfoTerm.preinfo.svcNumMask,
      toProdName: this.data.joinInfoTerm.preinfo.reqProdInfo.prodNm,
      toProdDesc: this.data.joinInfoTerm.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this.data.joinInfoTerm.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this.data.joinInfoTerm.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isAutoJoinTermList: (this.data.joinInfoTerm.preinfo.autoJoinList.length > 0 || this.data.joinInfoTerm.preinfo.autoTermList.length > 0),
      isAgreement: (this.data.joinInfoTerm.stipulationInfo && this.data.joinInfoTerm.stipulationInfo.stipulation.existsCount > 1)
    });
  },

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

  _onLongDiscountClicked: function () {
    this._popupService.open({
      hbs: 'BS_03_02_01_02',
      layer: true
    }, null, null, 'long_discount');
  },

  _onPlusExampleClicked: function () {
    this._popupService.open({
      hbs: 'BS_03_02_01_03',
      layer: true,
      info: this.data.svcInfo
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