/**
 * FileName: product.join.sel-contract.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

Tw.BenefitDisPgmSelContract = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._render();
  this._bindEvent();
  this._initialize();
};

Tw.BenefitDisPgmSelContract.prototype = {

  _render: function () {
    this.$radioGroup = this.$container.find('[data-id=radio-group]');
    this.$okBtn = this.$container.find('[data-id=btn-ok]');
  },

  _bindEvent: function () {
    this.$radioGroup.on('click', 'li', $.proxy(this._onRadioGroupClicked, this));
    this.$okBtn.on('click', $.proxy(this._onOkBtnClicked, this));
    // TODO: 할인반환금조회(#refund_info) 및 단말 위약금 조회(#cancel_fee) admin 작업처리
  },

  _initialize: function () {
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

  _onRadioGroupClicked: function (evt) {
    // 아이템 선택 시 버튼 enable 처리
    if ( !this._isEnable ) {
      var $target = $(evt.target).parents('li');
      var checked = $target.attr('aria-checked');
      if ( checked === 'true' ) {
        this._isEnable = true;
        this.selType = $target.attr('data-type');
        this.$okBtn.removeAttr('disabled');
      }
    }
  },

  _onOkBtnClicked: function () {
    new Tw.ProductCommonConfirm(true, this.$container, $.extend(this.joinInfoTerm, {
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.DISCOUNT_PROGRAM,
      isSelectedProgram: true,
      isContractPlan: this.data.isContractPlan,
      isAutoJoinTermList: true,
      setInfo: 'set-info',
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A2,
      settingSummaryTexts: [
        {
          spanClass: 'term',
          text: this.data.monthCode[this.selType] + Tw.DATE_UNIT.MONTH
        },
        {
          spanClass: 'date',
          text: this.data.monthDetail[this.selType]
        }]
    }), $.proxy(this._joinCompleteConfirm, this));
  },

  _joinCompleteConfirm: function() {
    this._popupService.afterRequestSuccess('/myt/join', '/benefit/callplan/' + this.data.prodId,
      Tw.BENEFIT.DISCOUNT_PGM.SELECTED.FINISH.LINK_TITLE, Tw.BENEFIT.DISCOUNT_PGM.SELECTED.FINISH.TITLE,
      Tw.BENEFIT.DISCOUNT_PGM.SELECTED.FINISH.CONTENT);
    /*this._apiService.request(Tw.API_CMD.BFF_10_0063, { svcAgrmtPrdCd: this.selType })
      .done($.proxy(this._onSuccessSeldisSet, this))
      .fail($.proxy(this._onErrorSeldisSet, this));*/
  },

  _onSuccessSeldisSet: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.afterRequestSuccess('/myt/join', '/benefit/callplan/' + this.data.prodId,
        Tw.BENEFIT.DISCOUNT_PGM.SELECTED.FINISH.LINK_TITLE, Tw.BENEFIT.DISCOUNT_PGM.SELECTED.FINISH.TITLE,
        Tw.BENEFIT.DISCOUNT_PGM.SELECTED.FINISH.CONTENT);
    }
    else {
      return Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _onErrorSeldisSet: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  }
};