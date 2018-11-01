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
    this.$container.on('click', $.proxy(this._onClickContainer, this));
    this.$joinBtn.on('click', $.proxy(this._onClickJoinBtn, this));
    this.$tAgreeCheckBox.on('click', $.proxy(this._onClickTAgreeCheckbox, this));
    this.$tAgreeItems.on('mousedown', $.proxy(this._onClickTAgreeItems, this));
    if ( this.data.isOkCashBag ) {
      this.$cAgreeCheckBox.on('click', $.proxy(this._onClickCAgreeCheckbox, this));
      this.$cAgreeItems.on('mousedown', $.proxy(this._onClickCAgreeItems, this));
    }
  },

  _onClickTAgreeCheckbox: function (event) {
    var checked = ($(event.target).parents('[role=checkbox]').attr('aria-checked') === 'true');
    this._tAllCheck = checked;
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
    var checked = ($(event.target).parents('[role=checkbox]').attr('aria-checked') === 'true');
    this._cAllCheck = checked;
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

  _onClickTAgreeItems: function (/*event*/) {
    if ( this._tAllCheck ) {
      this.$tAgreeCheckBox.removeClass('checked').attr('aria-checked', 'false');
      this.$tAgreeCheckBox.find('input').removeAttr('checked');
      this._tAllCheck = false;
      this.$tAgreeItems.trigger('click');
    }
  },

  _onClickCAgreeItems: function (/*event*/) {
    if ( this._cAllCheck ) {
      this.$cAgreeCheckBox.removeClass('checked').attr('aria-checked', 'false');
      this.$cAgreeCheckBox.find('input').removeAttr('checked');
      this._cAllCheck = false;
      this.$cAgreeItems.trigger('click');
    }
  },

  _onClickContainer: function () {
    var $items = this.$container.find('[aria-checked=true]:not(.all)');
    var array = [];
    $items.each(function (index) {
      if ( $items.eq(index).attr('data-id') && $items.eq(index).attr('data-id').match(/L_/gi).length > 0 ) {
        array.push($items.eq(index));
      }
    });
    // 필수 항목 모두 체크되야 가입하기 버튼 활성화
    if ( this.data.isOkCashBag && array.length === 4 ) {
      this.$joinBtn.removeAttr('disabled');
    }
    else {
      if ( array.length === 2 ) {
        this.$joinBtn.removeAttr('disabled');
      }
      else {
        this.$joinBtn.attr('disabled', 'disabled');
      }
    }
  },

  _onClickJoinBtn: function () {
    var $items = this.$container.find('[aria-checked=true]');
    // var options = {};
    for ( var i = 0; i < $items.length; i++ ) {
      var $item = $items.eq(i);
      switch ( $item.attr('data-type') ) {
        case 'svc':
          break;
        case 'psi':
          break;
        case 'ad':
          break;
        case 'bsi':
          break;
        case 'sms':
          break;
        case 'pad':
          break;
        case 'ovc':
          break;
        case 'odi':
          break;
        case 'mak':
          break;
      }
    }
    // TODO: 가입하기 완료 후 팝업 노출
    // this._apiService.request();
    //  this._tpayPopup.open();
  }
};