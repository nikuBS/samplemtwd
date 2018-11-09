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
    // TODO: 현재 가입하기 API 에서 사용 중인 필드가 현재 SB 문서와 일치하지 않아 문의 중
    var params = {
      mbr_typ_cd: '0', // T 멤버십 리더스카드 만 발급 중
      card_isue_typ_cd: '1' // 모바일 카드
    };
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
    this._apiService.request(Tw.API_CMD.BFF_11_0011, params)
      .done($.proxy(this._onSuccessJoinMembership, this))
      .fail($.proxy(this._onFailJoinMembership, this));
  },

  _onSuccessJoinMembership: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.afterRequestSuccess('/membership/submain', '/membership/mymembership/history',
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.LINK_TITLE, Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.TITLE,
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.CONTENT);
      // TODO: 가입하기 완료 후 TPay 팝업 노출
      // 완료 팝업이 뜬 이후에 T Pay 관련 팝업 띄우기 위함
      setTimeout(this._tpayPopup.open, 500);
    }
    else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _onFailJoinMembership: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  }
};