/**
 * FileName: membership.my.update.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.12.21
 */

Tw.MembershipMyUpdate = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.MembershipMyUpdate.prototype = {

  _cachedElement: function() {
    this.$searchZip = this.$container.find('#fe-search-zip');
    this.$firstPhone = this.$container.find('#fe-ph-first');
    //this.$container.on('change keyup paste', '#fe-phone2', $.proxy(this._validationCheck, this));
    //this.$container.on('change keyup paste', '#fe-phone3', $.proxy(this._validationCheck, this));
    this.$container.on('blur', '#fe-ph-second', $.proxy(this._validationCheck, this));
    this.$container.on('blur', '#fe-ph-third', $.proxy(this._validationCheck, this));
  },

  _bindEvent: function() {
    this.$searchZip.on('click', $.proxy(this._searchZip, this)); // 우편번호 검색
    this.$firstPhone.on('click', $.proxy(this._openPhoneActionSheet, this));
  },

  _searchZip: function () {
    new Tw.CommonPostcodeMain(this.$container, $.proxy(this._callBackSearchZip, this));
  },

  _callBackSearchZip: function (resp) {
    this._setAddrData({
      zip: resp.zip,
      basAddr: resp.main,
      dtlAddr: resp.detail
    });
  },

  // 기타(우편) 데이터 설정
  _setAddrData: function (data) {
    //this.$container.find('#fe-no-addr-area').addClass('none');
    //this._addrArea.addClass('none');

    if (Tw.FormatHelper.isEmpty(data.zip)) {
      this.$container.find('#fe-no-addr-area').removeClass('none');
    } else {
      this._addrArea.removeClass('none').find('input[name="zip"]').val(data.zip);
      this._addrArea.find('input[name="basAddr"]').val(data.basAddr);
      this._addrArea.find('input[name="dtlAddr"]').val(data.dtlAddr);
    }

    //this._onDisableSubmitButton();
  },

  _openPhoneActionSheet: function(e) {
    var selected = e.target;

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',// hbs의 파일명
      layer: true,
      data: Tw.PHONE_NUMS
    }, $.proxy(this._onActionSheetOpened, this, selected));
  },

  _onActionSheetOpened: function(selected, $root) {
    $root.on('click', '.hbs-card', $.proxy(this._onActionSelected, this, selected));
  },

  _onActionSelected: function(selected, e) {
    if($('.hbs-card').hasClass('checked')){
      $('.hbs-card').removeClass('checked');
    }
    $(e.target).parents('li').find('button').addClass('checked');

    $(selected).val($(e.target).parents('li').find('.info-value').text());
    $(selected).text($(e.target).parents('li').find('.info-value').text());
    $(selected).data('type', $(e.target).parents('li').find('button').attr('data-type'));

    this._popupService.close();
  },

  _validationCheck: function() {
    if(this.$firstPhone.data('type') === 'ph' || this.$firstPhone.data('type') === undefined){
      //벨리데이션 추가
    }

    if(this.$firstPhone.data('type') === 'area'){
      //벨리데이션 추가
    }
  }

};
