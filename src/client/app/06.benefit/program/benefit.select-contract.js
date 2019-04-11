/**
 * @file product.join.sel-contract.js
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.10.22
 *
 */

Tw.BenefitSelectContract = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this.data.joinInfoTerm = params.joinInfoTerm;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._render();
  this._bindEvent();
  this._initialize();
};

Tw.BenefitSelectContract.prototype = {

  _render: function () {
    this.$radioGroup = this.$container.find('[data-id=radio-group]');
    this.$okBtn = this.$container.find('[data-id=btn-ok]');
  },

  _bindEvent: function () {
    this.$radioGroup.on('click', 'li', $.proxy(this._onRadioGroupClicked, this));
    this.$okBtn.on('click', _.debounce($.proxy(this._onOkBtnClicked, this), 500));
  },

  _initialize: function () {
    this.joinInfoTerm = $.extend(this.data.joinInfoTerm, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this.data.joinInfoTerm.preinfo.svcNumMask),
      toProdName: this.data.joinInfoTerm.preinfo.reqProdInfo.prodNm,
      toProdDesc: this.data.joinInfoTerm.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this.data.joinInfoTerm.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this.data.joinInfoTerm.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this.data.prodId) === -1,
      isAgreement: (this.data.joinInfoTerm.stipulationInfo && this.data.joinInfoTerm.stipulationInfo.existsCount > 0)
    });
    setTimeout($.proxy(function () {
      this.$radioGroup.find('li').closest('.checked').trigger('click');
    }, this), 100);
  },

  _onRadioGroupClicked: function (evt) {
    // 아이템 선택 시 버튼 enable 처리
    var $target = $(evt.currentTarget);
    var checked = $target.attr('aria-checked');
    this.selType = $target.attr('data-type');
    if ( !this._isEnable ) {
      if ( checked === 'true' ) {
        this._isEnable = true;
        this.$okBtn.removeAttr('disabled');
      }
    }
  },

  _onOkBtnClicked: function () {
    this._historyService.goLoad('/benefit/submain/detail/dis-pgm/input?prod_id=' + this.data.prodId + '&sel_type=' + this.selType);
  }
};