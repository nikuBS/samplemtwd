/**
 * FileName: product.roaming.fi.reservation2step.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.13
 */

Tw.ProductRoamingFiReservation2step = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiReservation2step.prototype = {
  countryArr : [],

  _cachedElement: function() {
    this.$btnRegister = this.$container.find('#fe-register');
    this.$btnCountryLink = this.$container.find('.link-area > .bt-link-tx');
    this.$btnTermsAgree = this.$container.find('.comp-list-layout');
    this.$openAgreeView = this.$container.find('.agree-view');
  },

  _bindEvent: function() {
    this.$btnRegister.on('click', $.proxy(this._searchCountryCode, this));
    this.$btnCountryLink.on('click', $.proxy(this._addVisitCountry, this));
    this.$container.on('click', '#visitList .bt-alone', $.proxy(this._removeVisitCountry, this));
    this.$container.on('click', 'button[id=flab04],button[id=flab05]', $.proxy(this._openLocationPop, this));
    this.$btnTermsAgree.on('click', $.proxy(this._changeCheck, this));
    this.$openAgreeView.on('click', $.proxy(this._openAgreeView, this));
    this.$container.on('click', '#goLink', $.proxy(this._goRoamingCenter, this));
    this.$container.on('blur', '#flab01', $.proxy(this._insertDashPhone, this));
    this.$container.on('click', '#flab01', $.proxy(this._removeDashPhone, this));
    this.$container.on('change keyup paste', '#flab01', $.proxy(this._changeCheck, this));
    this.$container.on('click', '.cancel', $.proxy(this._changeCheck, this));
  },

  _searchCountryCode: function(){
    this._apiService.request(Tw.API_CMD.BFF_10_0060, {keyword : ''}).done($.proxy(this._handleSuccessSearchCountry, this));
  },

  _handleSuccessSearchCountry: function(res){
    //한글로된 국가 배열 -> 코드 배열로 교체
    if(res.code === Tw.API_CODE.CODE_00) {
      var allCountryCode = res.result;
      var countyArr = this.countryArr.map(function(x){return x});

      allCountryCode.forEach(function(key){
        if(countyArr.indexOf(key.countryNm) >= 0){
          countyArr.splice(countyArr.lastIndexOf(key.countryNm),1,key.countryCode);
        }
      });

      this._handleFiReservation(countyArr);
    }
  },

  _handleFiReservation: function(countryArr) {
    var expbranchnm = $('#flab05').text();
    var boothcode = $('#flab04').attr('data-booth');
    var boothnm = $('#flab04').text();
    var impbranch = $('#flab04').attr('data-center');
    var expbranch = $('#flab05').attr('data-center');
    var nationCode = countryArr;
    var rentFrom = $('#flab02').val().replace(/\-/gi, '');
    var rentTo = $('#flab03').val().replace(/\-/gi, '');
    var contphonenum = $('#flab01').val().replace(/\-/gi, '');
    var date = new Date();
    var hsrsvrcvdtm = date.toISOString().substring(0,10).replace(/\-/gi, '');

    //수령장소 기본 값 세팅
    if(boothcode === null || boothcode === undefined){
      boothcode = '1000004045';
      impbranch = 'A100110000';
      this.selectIdx = 0;
    }

    //반납장소 기본 값 세팅
    if(expbranch === null || expbranch === undefined){
      expbranch = 'A100110000';
    }

    var params = {
      'rentFrom': rentFrom,
      'rentTo': rentTo,
      'impbranch': impbranch,
      'expbranch': expbranch,
      'expbranchnm': expbranchnm,
      'hsrsvrcvdtm': hsrsvrcvdtm,
      'boothcode': boothcode,
      'boothnm': boothnm,
      'phonemdlcd': 'A00B',
      'contphonenum': contphonenum,
      'romingTypCd': '28',
      'nationcode': nationCode,
      'type': 'I'
    };

    this._apiService.request(Tw.API_CMD.BFF_10_0065, params).done($.proxy(this._handleSuccessFiReservation, this));
  },

  _handleSuccessFiReservation: function(res){
    if(res.code === Tw.API_CODE.CODE_00) {
      this._historyService.goLoad('/product/roaming/fi/reservation3step?selectIdx=' + this.selectIdx);
    }
  },

  _addVisitCountry: function(e){
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

    for(var x in data[0].list){
      data[0].list[x].option = 'hbs-card-type';
      if(data[0].list[x].value === $(selected).text()){
        data[0].list[x].option = 'checked';
      }
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
      $(selected).text($(e.target).parents('li').find('.info-value').text()); //센터명 출력
      $(selected).attr('data-center',$(e.target).parents('button').attr('data-center')); //부스코드를 data-code값에 넣기
      $(selected).attr('data-booth',$(e.target).parents('button').attr('data-booth'));
      this.selectIdx = Number($(e.target).parents('button').attr('id')) - 6; //예약 완료 페이지에 넘기는 값
    }else{
      $(selected).text($(e.target).parents('li').find('.info-value').text());
      $(selected).attr('data-center',$(e.target).parents('button').attr('data-center'));
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
      var inputPhoneCheck = '';

      if($('#flab01').val().length > 0){
        inputPhoneCheck = true;
      }else{
        inputPhoneCheck = false;
      }

      if($('#check1').hasClass('checked') && $('#check2').hasClass('checked') && countryCheck && inputPhoneCheck){
        $('.bt-red1 button').removeAttr('disabled');
      }else{
        $('.bt-red1 button').attr('disabled','disabled');
      }
    },0);
  },

  _goRoamingCenter: function() {
    this._historyService.goLoad('/product/roaming/info/center');
  },

  _insertDashPhone: function() {
    //9자리 이하 : 010-000-000, 10자리 이하 : 010-000-0000, 11자리 이하 010-0000-0000
    var phoneNum = $('#flab01').val();
    var hypenPhoneNum = Tw.FormatHelper.getDashedCellPhoneNumber(phoneNum);
    $('#flab01').val(hypenPhoneNum);
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