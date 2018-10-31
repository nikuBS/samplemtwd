/**
 * FileName: benefit.membership.join.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.29
 *
 */

Tw.MyTBenefitMembershipJoin = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._tpayPopup = new Tw.TPayJoinLayerPopup(this.$container);
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this.data = params.data;
  this._render();
  this._bindEvent();
};

Tw.MyTBenefitMembershipJoin.prototype = {

  _render: function () {
    this.$joinBtn = this.$container.find('[data-id=join-btn]');
    this.$tAgreeCheckBox = this.$container.find('[data-id=all-agree-t]');
    this.$tAgreeItems = this.$container.find('[data-role=TL]');
    if ( this.data.isOkCashBag ) {
      this.$cAgreeCheckBox = this.$container.find('[data-id=all-agree-c]');
      this.$cAgreeItems = this.$container.find('[data-role=CL]');
    }
  },

  _bindEvent: function () {
    this.$joinBtn.on('click', $.proxy(this._onClickJoinBtn, this));
    this.$tAgreeCheckBox.on('click', $.proxy(this._onClickTAgreeCheckbox, this));
    this.$tAgreeItems.on('click', $.proxy(this._onClickTAgreeItems, this));
    if ( this.data.isOkCashBag ) {
      this.$cAgreeCheckBox.on('click', $.proxy(this._onClickCAgreeCheckbox, this));
      this.$cAgreeItems.on('click', $.proxy(this._onClickCAgreeItems, this));
    }
  },

  _onClickTAgreeCheckbox: function (event) {
    var $target = $(event.target).parents('[role=checkbox]');
    var checked = ($target.attr('aria-checked') === 'true');
    for ( var i = 0; i < this.$tAgreeItems.length; i++ ) {
      var item = this.$tAgreeItems.eq(i);
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

  _onClickCAgreeCheckbox: function (event) {
    var $target = $(event.target).parents('[role=checkbox]');
    var checked = ($target.attr('aria-checked') === 'true');
    for ( var i = 0; i < this.$cAgreeItems.length; i++ ) {
      var item = this.$cAgreeItems.eq(i);
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

  _onClickTAgreeItems: function (event) {
    var $target = $(event.target).parents('[role=checkbox]');
    var checked = ($target.attr('aria-checked') === 'true');
    if ( checked ) {
      $target.removeClass('checked').attr('aria-checked', 'false');
      $target.find('input').removeAttr('checked');
      this.$tAgreeCheckBox.removeClass('checked').attr('aria-checked', 'false');
      this.$tAgreeCheckBox.find('input').removeAttr('checked');
    }
  },

  _onClickCAgreeItems: function (event) {
    var $target = $(event.target).parents('[role=checkbox]');
    var checked = ($target.attr('aria-checked') === 'true');
    if ( checked ) {
      $target.removeClass('checked').attr('aria-checked', 'false');
      $target.find('input').removeAttr('checked');
      this.$cAgreeCheckBox.removeClass('checked').attr('aria-checked', 'false');
      this.$cAgreeCheckBox.find('input').removeAttr('checked');
    }
  },

  _onClickJoinBtn: function () {
    // TODO: 가입하기 완료 후 팝업 노출
    // this._apiService.request();
    //  this._tpayPopup.open();
  }
};