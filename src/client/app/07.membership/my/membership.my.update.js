/**
 * FileName: membership.my.update.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.12.21
 */

Tw.MembershipMyUpdate = function(rootEl, myInfoData) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._myInfoData = JSON.parse(myInfoData);
  this._cachedElement();
  this._bindEvent();
};

Tw.MembershipMyUpdate.prototype = {

  _cachedElement: function() {
    this.$searchZip = this.$container.find('#fe-search-zip');
    this.$firstPhone = this.$container.find('#fe-ph-first');
    this.$secondPhone = this.$container.find('#fe-ph-second');
    this.$thirdPhone = this.$container.find('#fe-ph-third');
    this.$receiptRadio = this.$container.find('#fe-radio');
    this._addrArea = this.$container.find('#fe-addr-area'); // 우편 주소 area
    this.$validation = this.$container.find('#fe-validation');
    //this.$container.on('blur', '#fe-phone2', $.proxy(this._validationCheck, this));
    //this.$container.on('blur', '#fe-phone3', $.proxy(this._validationCheck, this));
    //this.$container.on('click', '.fe-agree-check', $.proxy(this._agreeCheck, this));
    //this.$container.on('click', 'input[name=r1]', $.proxy(this._agreeCheck, this));
    //this.$container.on('click', '#chk8', $.proxy(this._agreeCheck, this));
    //this.$container.on('click', '#chk1', $.proxy(this._agreeCheck, this));
    this.$container.on('click', 'input[type=checkbox]', $.proxy(this._agreeCheck, this));
    this.$container.on('click', '#fe-update', $.proxy(this._requestUpdate, this));

  },

  _bindEvent: function() {
    this.$searchZip.on('click', $.proxy(this._searchZip, this)); // 우편번호 검색
    this.$firstPhone.on('click', $.proxy(this._openPhoneActionSheet, this));
    this.$secondPhone.on('blur', $.proxy(this._validationCheck, this));
    this.$thirdPhone.on('blur', $.proxy(this._validationCheck, this));
    this.$receiptRadio.on('click', $.proxy(this._selectReceipt, this));
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
    $('#fe-zip').val(data.zip);
    $('#fe-basAddr').val(data.basAddr);
    $('#fe-detAddr').val(data.dtlAddr);

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
      var secondLen = this.$secondPhone.val().length;
      var thirdLen = this.$thirdPhone.val().length;

      if(secondLen + thirdLen < 7){
        this.$validation.show();
      }else{
        this.$validation.hide();
      }
    }
  },

  _selectReceipt: function(e) {
    var id = e.target.id;

    if(id === 'radio1'){
      this._myInfoData.addrCd = '03';
    }else if(id === 'radio2'){
      this._myInfoData.addrCd = '04';
    }else{
      return;
    }
  },

  _agreeCheck: function(e) {
    var selected = e.target;

    if($(selected).attr('checked') === 'checked'){ //체크 해제
      $(selected).removeAttr('checked');

      if(selected.name === 'checkbox2'){
        $('.toggle-aggrement').hide();
      }

      if(selected.id === 'chk1'){ //OK 캐시백 모두 동의 해제
        $('#chk2').prop('checked', false);
        $('#chk3').prop('checked', false);
        $(selected).removeAttr('checked');
        $('#chk2').removeAttr('checked');
        $('#chk3').removeAttr('checked');
      }

      if(selected.id === 'chk2' || selected.id === 'chk3'){
        $('#chk1').prop('checked', false);
        $('#chk1').removeAttr('checked');
      }
    }else{ // 체크 설정
      $(selected).attr('checked','checked');

      if(selected.name === 'checkbox2'){
        $('.toggle-aggrement').show();
      }

      if(selected.id === 'chk1'){ //OK 캐시백 모두 동의 설정
        $('#chk2').prop('checked', true);
        $('#chk3').prop('checked', true);
        $('#chk2').attr('checked','checked');
        $('#chk3').attr('checked','checked');
      }

      if(selected.id === 'chk2' || selected.id === 'chk3'){
        if($('#chk2').attr('checked') === 'checked' && $('#chk3').attr('checked') === 'checked'){
          $('#chk1').prop('checked', true);
          $('#chk1').attr('checked','checked');
        }
      }
    }
  },

  _requestUpdate: function() {
    if(this._myInfoData.cardIsueTypCd === '0'){
      this._myInfoData.zip = $('#fe-zip').val();
      this._myInfoData.basAddr = $('#fe-basAddr').val();
      this._myInfoData.dtlAddr = $('#fe-detAddr').val();
      this._myInfoData.cntcNum1 = $('#fe-ph-first').val();
      this._myInfoData.cntcNum2 = $('#fe-ph-second').val();
      this._myInfoData.cntcNum3 = $('#fe-ph-third').val();
    }

    this._myInfoData.smsAgreeYn = $('#oka1').attr('checked') === 'checked' ? 'Y' : 'N';
    this._myInfoData.sktNewsYn = $('#oka2').attr('checked') === 'checked' ? 'Y' : 'N';
    this._myInfoData.sktTmYn = $('#oka3').attr('checked') === 'checked' ? 'Y' : 'N';

    if(this._myInfoData.ctzNumAgreeYn === 'N' && this._myInfoData.ocbAccumAgreeYn === 'N'){
      this._myInfoData.ctzNumAgreeYn = $('#chk1').attr('checked') === 'checked' ? 'Y' : 'N';
      this._myInfoData.ocbAccumAgreeYn = $('#chk2').attr('checked') === 'checked' ? 'Y' : 'N';
    }

    this._apiService.request(Tw.API_CMD.BFF_11_0012, this._myInfoData).done($.proxy(this._handleSuccessInfoUpdate, this));
  },

  _handleSuccessInfoUpdate: function(res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      //완료 페이지 이동
    }
  }


};
