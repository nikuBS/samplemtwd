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
    this.$workTimeBtn = this.$container.find('.bt-link-tx');

  },

  _bindEvent: function() {
    this.$btnPopupClose.on('click', $.proxy(this._handleFiReservation, this));
    this.$btnCountryLink.on('click', $.proxy(this._addVisitCountry, this));
    this.$container.on('click', '#visitList .bt-alone', $.proxy(this._removeVisitCountry, this));
    this.$container.on('click', 'button[id=flab04]', $.proxy(this._openLocationPop, this));
    this.$btnTermsAgree.on('click', $.proxy(this._checkAgree, this));
    this.$openAgreeView.on('click', $.proxy(this._openAgreeView, this));
    this.$workTimeBtn.on('click', $.proxy(this._openInfoCenter, this));
  },

  _goRoamingGuide: function() {
    this._historyService.replaceURL('/product/roaming/fi/guide');
  },

  _handleFiReservation: function() {
    var expbranchnm = '';
    var bootnm = '';
    var nationCode = ['MYS','USA','','',''];
    var params = {
      'rentFrom': '20181225',
      'rentTo': '20181227',
      'impbranch': 'A100110000',
      'expbranch': 'A100110000',
      'expbranchnm': expbranchnm,
      'hsrsvrcvdtm': '20181224',
      'boothcode': '1000004045',
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
    console.log(e.target.innerText);

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
  },
  _removeVisitCountry : function(e){
    //console.log($(e.target).parents('.tx-cont').siblings('.title').text());
    var removeName = $(e.target).parents('.tx-cont').siblings('.title').text();
    this.countryArr.splice(this.countryArr.indexOf(removeName),1);
    $(e.target).parents('li').remove();
  },
  _openLocationPop : function(e){
    var selected = e.target;

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.POPUP_TPL.ROAMING_RETURN_PLACE.title,
        data: Tw.POPUP_TPL.ROAMING_RETURN_PLACE.data
      },
      $.proxy(this._onActionSheetOpened, this, selected),
      $.proxy(this._onActionSheetClosed, this, selected));
  },
  _checkAgree : function(){
    setTimeout(function(){
      if($('#check1').hasClass('checked') && $('#check2').hasClass('checked')){
        $('.bt-red1 button').removeAttr('disabled');
      }else{
        $('.bt-red1 button').attr('disabled','disabled');
      }
    });

  },
  _onActionSheetOpened: function (selected, $root) {
    $root.on('click', '.hbs-card-type', $.proxy(this._onActionSelected, this));
  },
  _onActionSelected: function (e) {
    if($('.hbs-card-type').hasClass('checked')){
      $('.hbs-card-type').removeClass('checked');
    }
    $(e.target).parents('li').find('button').addClass('checked');
  },

  _openAgreeView: function(){
    this._popupService.open({
        hbs: 'RM_14_02_02_01',
        layer: true
      },null,$.proxy(this._onAgreePopClosed, this), 'agree');

  },
  _onAgreePopClosed: function() {
    this._popupService.close();
  },
  _openInfoCenter: function() {

  }
};