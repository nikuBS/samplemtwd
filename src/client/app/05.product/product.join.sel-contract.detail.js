/**
 * FileName: product.join.sel-contract.detail.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

Tw.ProductJoinSelContractDetail = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._render();
  this._bindEvent();
};

Tw.ProductJoinSelContractDetail.prototype = {

  _render: function () {
    this.$allCheckbox = this.$container.find('[data-id=all-chk]');
    this.$otherCheckbox = this.$container.find('[data-item=true]');
    this.$joinBtn = this.$container.find('[data-id=btn-join]');
  },

  _bindEvent: function () {
    this.$container.on('click', $.proxy(this._onClickContainer, this));
    this.$allCheckbox.on('click', $.proxy(this._onClickAllCheckbox, this));
    this.$otherCheckbox.on('mousedown', $.proxy(this._onMousdownOtherCheckbox, this));
    this.$joinBtn.on('click', $.proxy(this.__onJoinBtnClicked, this));
  },

  _onClickAllCheckbox: function (event) {
    var checked = ($(event.target).parents('[role=checkbox]').attr('aria-checked') === 'true');
    this._allCheck = checked;
    for ( var i = 0; i < this.$otherCheckbox.length; i++ ) {
      var item = this.$otherCheckbox.eq(i);
      var $input = item.find('input');
      if ( checked ) {
        item.addClass('checked');
        $input.attr('checked', 'checked');
      }
      else {
        item.removeClass('checked');
        $input.removeAttr('checked');
      }
      item.attr('aria-checked', checked);
    }
  },

  _onMousdownOtherCheckbox: function (/*event*/) {
    if ( this._allCheck ) {
      this.$allCheckbox.removeClass('checked').attr('aria-checked', 'false');
      this.$allCheckbox.find('input').removeAttr('checked');
      this._allCheck = false;
      this.$otherCheckbox.trigger('click');
    }
  },

  __onJoinBtnClicked: function () {
    // 가입하기
    this._popupService.openModalTypeA(Tw.ALERT_MSG_PRODUCT.ALERT_3_A3.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A3.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A3.BUTTON, null, $.proxy(this._onJoinPopupConfirm, this), null);
  },

  _onClickContainer: function () {
    var $items = this.$container.find('[aria-checked=true]:not(.all)');
    var array = [];
    $items.each(function (index) {
      if ( $items.eq(index).attr('data-id') && $items.eq(index).attr('data-id').match(/-chk/gi).length > 0 ) {
        array.push($items.eq(index));
      }
    });
    // 필수 항목 모두 체크되야 가입하기 버튼 활성화
    if ( array.length === 3 ) {
      this.$joinBtn.removeAttr('disabled');
    }
    else {
      this.$joinBtn.attr('disabled', 'disabled');
    }
  },

  _onJoinPopupConfirm: function () {
      this._apiService.request(Tw.API_CMD.BFF_10_0063, { svcAgrmtPrdCd: this.data.monthCode }, {}, this.data.prodId)
      .done($.proxy(this._onSuccessSeldisSet, this))
      .fail($.proxy(this._onErrorSeldisSet, this));
  },

  _onSuccessSeldisSet: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.afterRequestSuccess('/myt/join', '/product/join/' + this.data.prodId,
        '나의 가입정보 확인하기 >', '선택약정할인제도', '상품 가입 완료');
    }
    else {
      return Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _onErrorSeldisSet: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  }
};