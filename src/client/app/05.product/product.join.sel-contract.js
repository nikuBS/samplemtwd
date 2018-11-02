/**
 * FileName: product.join.sel-contract.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

Tw.ProductJoinSelContract = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._render();
  this._bindEvent();
};

Tw.ProductJoinSelContract.prototype = {

  _render: function () {
    this.$radioGroup = this.$container.find('[data-id=radio-group]');
    this.$okBtn = this.$container.find('[data-id=btn-ok]');
  },

  _bindEvent: function () {
    this.$radioGroup.on('click', 'li', $.proxy(this._onRadioGroupClicked, this));
    this.$okBtn.on('click', $.proxy(this._onOkBtnClicked, this));
  },

  _onRadioGroupClicked: function (evt) {
    // 아이템 선택 시 버튼 enable 처리
    if ( !this._isEnable ) {
      var $target = $(evt.target).parents('li');
      var checked = $target.attr('aria-checked');
      if ( checked === 'true') {
        this._isEnable = true;
        this.$okBtn.removeAttr('disabled');
      }
    }
  },

  _onOkBtnClicked: function () {
    if ( this.data.type === 'input' ) {
      // 가입 인 경우
    }
    else {
      // 설정 인 경
    }
  }
};