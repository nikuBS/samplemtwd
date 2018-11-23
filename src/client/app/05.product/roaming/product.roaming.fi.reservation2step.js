/**
 * FileName: product.roaming.fi.reservation2step.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.13
 */

Tw.ProductRoamingFiReservation2step = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._popupService = new Tw.PopupService();
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiReservation2step.prototype = {
  countryArr : [],

  _cachedElement: function() {
    this.$btnPopupClose = this.$container.find('.bt-slice');
    this.$btnCountryLink = this.$container.find('.link-area > .bt-link-tx');
    this.$btnTermsAgree = this.$container.find('.comp-list-layout');
    this.$openAgreeView = this.$container.find('.agree-view');
    //this.$inputTel = this.$container.find('#flab01'); //기존 공통 Dash
  },

  _bindEvent: function() {
    this.$btnPopupClose.on('click', $.proxy(this._handleFiReservation, this));
    this.$btnCountryLink.on('click', $.proxy(this._addVisitCountry, this));
    this.$container.on('click', '#visitList .bt-alone', $.proxy(this._removeVisitCountry, this));
    this.$container.on('click', 'button[id=flab04],button[id=flab05]', $.proxy(this._openLocationPop, this));
    this.$btnTermsAgree.on('click', $.proxy(this._changeCheck, this));
    this.$openAgreeView.on('click', $.proxy(this._openAgreeView, this));
    this.$container.on('click', '#goLink', $.proxy(this._goRoamingCenter, this));
    this.$container.on('blur', '#flab01', $.proxy(this._insertDashPhone, this));
    this.$container.on('click', '#flab01', $.proxy(this._removeDashPhone, this));
    //this.$inputTel.on('change', $.proxy(Tw.InputHelper.insertDashCellPhone, this, this.$inputTel)); //기존 공통 대쉬
  },

  _goRoamingGuide: function() {
    this._historyService.replaceURL('/product/roaming/fi/guide');
  },

  _handleFiReservation: function() {
    var expbranchnm = 'ab';
    var bootnm = 'ab';
    var nationCode = ["BRA", "MNG", "USA", "GUM", "MYS"];
    var params = {
      'rentFrom': '20181225',
      'rentTo': '20181227',
      'impbranch': 'A100110000',
      'expbranch': 'A100110000',
      'expbranchnm': expbranchnm,
      'hsrsvrcvdtm': '20181224',
      'boothcode': '1000004047',
      'boothnm': bootnm,
      'phonemdlcd': 'A00B',
      'contphonenum': '01220822349',
      'romingTypCd': '28',
      'nationcode': nationCode,
      'type': 'I'
    };
    this._apiService.request(Tw.API_CMD.BFF_10_0065, params).done($.proxy(this._handleSuccessFiReservation, this));
  },

  _handleSuccessFiReservation: function() {
    this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A10.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A10.TITLE);
  },
  _addVisitCountry: function(e){
    //console.log(e.target.innerText);

    //추가된 국가가 5개이상이면 리턴처리
    if(this.countryArr.length > 4){
      return;
    }

    //중복되는 국가는 추가안함
    if(this.countryArr.indexOf(e.target.innerText) < 0){
      this.countryArr.push(e.target.innerText);

      $('#visitList').append(
        '<li id="' + (this.countryArr.length-1) + '">\n' +
        '<span class="title">' + this.countryArr[this.countryArr.length-1] + '</span>\n' +
        '<span class="tx-cont"><div class="bt-alone"><button class="bt-line-gray1">삭제</button></div></span>\n' +
        '</li>'
      );
    }

    this._changeCheck();
  },
  _removeVisitCountry : function(e){
    //console.log($(e.target).parents('.tx-cont').siblings('.title').text());
    var removeName = $(e.target).parents('.tx-cont').siblings('.title').text();
    this.countryArr.splice(this.countryArr.indexOf(removeName),1);
    $(e.target).parents('li').remove();

    this._changeCheck();
  },
  _openLocationPop : function(e){
    var selected = e.target;
    var title = '';
    var data = [];

    if(selected.id === 'flab04'){
      //수령 장소 선택
      title = Tw.POPUP_TPL.ROAMING_RECEIVE_PLACE.title;
      data = Tw.POPUP_TPL.ROAMING_RECEIVE_PLACE.data;
    }else{
      //반납 장소 선택
      title = Tw.POPUP_TPL.ROAMING_RETURN_PLACE.title;
      data = Tw.POPUP_TPL.ROAMING_RETURN_PLACE.data;
    }

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: title,
        data: data
      },
      $.proxy(this._onActionSheetOpened, this, selected)
    );
  },

  _onActionSheetOpened: function (selected, $root) {
    $root.on('click', '.hbs-card-type', $.proxy(this._onActionSelected, this, selected));
  },

  _onActionSelected: function (selected, e) {
    if($('.hbs-card-type').hasClass('checked')){
      $('.hbs-card-type').removeClass('checked');
    }
    $(e.target).parents('li').find('button').addClass('checked');
    if(selected.id === 'flab04'){
      $(selected).text($(e.target).parents('li').find('.info-value').text());
    }else{
      $(selected).text($(e.target).parents('li').find('.info-value').text());
    }

    this._popupService.close();
  },

  _openAgreeView: function(){
    this._popupService.open({
      hbs: 'RM_14_02_02_01',
      layer: true
    },$.proxy(this._onAgreePopOpened, this), null, 'agree');

  },

  _onAgreePopOpened: function($root) {
    $root.on('click', '#agreeBtn', $.proxy(this._clickConfirmBtn, this));
  },

  _changeCheck: function() {
    if(this.countryArr.length > 0){
      var countryCheck = true;
    }
    setTimeout(function(){
      if($('#check1').hasClass('checked') && $('#check2').hasClass('checked') && countryCheck ){
        $('.bt-red1 button').removeAttr('disabled');
      }else{
        $('.bt-red1 button').attr('disabled','disabled');
      }
    });
  },

  _goRoamingCenter: function() {
    this._historyService.goLoad('/product/roaming/info/center');
  },

  _insertDashPhone: function() {
    var phoneNum = $('#flab01').val().replace(/[^0-9]/gi, '');
    var hypenPhoneNum = this._phoneHypen(phoneNum);
    $('#flab01').val(hypenPhoneNum);
  },

  _phoneHypen: function(phoneNum) {
    var tmp = '';

    if( phoneNum.length < 4){
      return phoneNum;
    }else if(phoneNum.length < 7){
      tmp += phoneNum.substr(0, 3);
      tmp += '-';
      tmp += phoneNum.substr(3);
      return tmp;
    }else if(phoneNum.length < 11){
      tmp += phoneNum.substr(0, 3);
      tmp += '-';
      tmp += phoneNum.substr(3, 3);
      tmp += '-';
      tmp += phoneNum.substr(6);
      return tmp;
    }else{
      tmp += phoneNum.substr(0, 3);
      tmp += '-';
      tmp += phoneNum.substr(3, 4);
      tmp += '-';
      tmp += phoneNum.substr(7);
      return tmp.substr(0,13);
    }
    return phoneNum;
  },

  _removeDashPhone: function() {
    var phoneNum = $('#flab01').val().replace(/\-/gi, '');
    $('#flab01').val(phoneNum);
  },

  _clickConfirmBtn: function() {
    $('#check1').addClass('checked');
    $('#check1').attr('aria-checked', 'true');
    $('#check1').find('input').attr('checked','checked');

    this._changeCheck();
    this._popupService.close();
  }
};