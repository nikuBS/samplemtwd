/**
 * FileName: product.roaming.fi.reservation.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.13
 */

Tw.ProductRoamingFiReservation = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiReservation.prototype = {
  countryArr : [],

  _cachedElement: function() {
    this.$btnRegister = this.$container.find('#fe-register');
    this.$btnCountryLink = this.$container.find('.link-area > .bt-link-tx');
    this.$btnTermsAgree = this.$container.find('.comp-list-layout');
    this.$openAgreeView = this.$container.find('.agree-view');
    this.$btnPopupClose = this.$container.find('.popup-closeBtn');
    this.$agreeCheckOne = this.$container.find('#fe-check1');
    this.$agreeCheckTwo = this.$container.find('#fe-check2');
    this.$inputPhone = this.$container.find('#flab01');
    this.$inputSdate = this.$container.find('#flab02');
    this.$inputEdate = this.$container.find('#flab03');
    this.$inputReceive = this.$container.find('#flab04');
    this.$inputReturn = this.$container.find('#flab05');
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
    this.$container.on('keyup paste', '#flab01', $.proxy(this._changeCheck, this, 'keyup'));
    this.$container.on('change', '#flab01', $.proxy(this._changeCheck, this));
    this.$container.on('click', '.cancel', $.proxy(this._changeCheck, this));
    this.$btnPopupClose.on('click', $.proxy(this._goRoamingGuide, this));
    this.$container.on('change', '#flab02', $.proxy(this._changeCheck, this));
    this.$container.on('change', '#flab03', $.proxy(this._changeCheck, this));
  },

  _searchCountryCode: function(){
    var inputNumber = this.$inputPhone.val();
    if (!Tw.ValidationHelper.isCellPhone(inputNumber)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0060, {keyword : ''}).done($.proxy(this._handleSuccessSearchCountry, this));
  },

  _handleSuccessSearchCountry: function(res){
    //한글로된 국가 배열 -> 코드 배열로 교체
    if(res.code === Tw.API_CODE.CODE_00) {
      var allCountryCode = res.result;
      var countyArr = this.countryArr.map(function(x){return x;});

      allCountryCode.forEach(function(key){
        if(countyArr.indexOf(key.countryNm) >= 0){
          countyArr.splice(countyArr.lastIndexOf(key.countryNm),1,key.countryCode);
        }
      });

      this._handleFiReservation(countyArr);
    }else{
      this._onFail(res);
    }
  },

  _handleFiReservation: function(countryArr) {
    var expbranchnm = this.$inputReturn.text();
    var boothcode = this.$inputReceive.attr('data-booth');
    var boothnm = this.$inputReceive.text();
    var impbranch = this.$inputReceive.attr('data-center');
    var expbranch = this.$inputReturn.attr('data-center');
    var nationCode = countryArr;
    var rentFrom = this.$inputSdate.val().replace(/\-/gi, '');
    var rentTo = this.$inputEdate.val().replace(/\-/gi, '');
    var contphonenum = this.$inputPhone.val().replace(/\-/gi, '');
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
      this._historyService.replaceURL('/product/roaming/fi/reservation-complete?selectIdx=' + this.selectIdx);
    }else{
      this._onFail(res);
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
    var data = [];

    if(selected.id === 'flab04'){
      //수령 장소 선택
      data = Tw.POPUP_TPL.ROAMING_RECEIVE_PLACE;
    }else{
      //반납 장소 선택
      data = Tw.POPUP_TPL.ROAMING_RETURN_PLACE;
    }

    var currentCenter = $(selected).text();

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetOpened, this, selected, currentCenter)
    );

  },

  _onActionSheetOpened: function (selected, currentCenter, $layer) {
    $('li.type1').each(function(){
      if($(this).find('label').attr('value') === currentCenter){
        $(this).find('input[type=radio]').prop('checked', true);
      }
    })
    $layer.find('[name="r2"]').on('click', $.proxy(this._onActionSelected, this, selected));

    // 닫기 버튼 클릭
    $layer.one('click', '#fe-back', this._popupService.close);
  },

  _onActionSelected: function (selected, e) {

    if(selected.id === 'flab04'){
      $(selected).text($(e.target).parents('label').attr('value')); //센터명 출력
      $(selected).attr('data-center',$(e.target).parents('label').attr('data-center')); //부스코드를 data-code값에 넣기
      $(selected).attr('data-booth',$(e.target).parents('label').attr('data-booth'));
      this.selectIdx = Number($(e.target).parents('label').attr('id')) - 6; //예약 완료 페이지에 넘기는 값

      //약도 이미지 변경
      var imgUrl = $('#fe-receive-img').attr('src');
      var startLen = imgUrl.lastIndexOf('/');
      var cdnUrl = imgUrl.substring(0,startLen+1);
      $('#fe-receive-img').attr('src', cdnUrl + $(e.target).parents('label').attr('data-img') + '.png');
    }else{
      $(selected).text($(e.target).parents('label').attr('value')); //센터명 출력
      $(selected).attr('data-center',$(e.target).parents('label').attr('data-center'));

      //약도 이미지 변경
      var imgUrl = $('#fe-return-img').attr('src');
      var startLen = imgUrl.lastIndexOf('/');
      var cdnUrl = imgUrl.substring(0,startLen+1);
      $('#fe-return-img').attr('src', cdnUrl + $(e.target).parents('label').attr('data-img') + '.png');
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

  _changeCheck: function(state) {
    if(state === 'keyup'){
      if(this.$inputPhone.val().length > 11){
        this.$inputPhone.val(this.$inputPhone.val().substring(0,11));
      }
    }

    var dateCheck = true;

    if(this.$inputSdate.val() === '' || this.$inputEdate.val() === ''){
      dateCheck = false;
    }

    if(this.countryArr.length > 0){
      var countryCheck = true;
    }

    var self = this;
    setTimeout(function(){

      var inputPhoneCheck = '';

      if(self.$inputPhone.val().length > 0){
        inputPhoneCheck = true;
      }else{
        inputPhoneCheck = false;
      }

      if(self.$agreeCheckOne.hasClass('checked') && self.$agreeCheckTwo.hasClass('checked') && countryCheck && inputPhoneCheck && dateCheck){
        self.$btnRegister.removeAttr('disabled');
      }else{
        self.$btnRegister.attr('disabled','disabled');
      }
    },0);
  },

  _goRoamingCenter: function() {
    this._historyService.goLoad('/product/roaming/info/center');
  },

  _insertDashPhone: function() {
    //9자리 이하 : 010-000-000, 10자리 이하 : 010-000-0000, 11자리 이하 010-0000-0000
    var phoneNum = this.$inputPhone.val().replace(/\-/gi, '');
    var hypenPhoneNum = Tw.FormatHelper.getDashedCellPhoneNumber(phoneNum);
    this.$inputPhone.val(hypenPhoneNum);
  },

  _removeDashPhone: function() {
    var phoneNum = this.$inputPhone.val().replace(/\-/gi, '');
    this.$inputPhone.val(phoneNum);
  },

  _clickConfirmBtn: function() {
    this.$agreeCheckOne.addClass('checked');
    this.$agreeCheckOne.attr('aria-checked', 'true');
    this.$agreeCheckOne.find('input').attr('checked','checked');

    this._changeCheck();
    this._popupService.close();
  },

  _goRoamingGuide: function() {
    this._historyService.replaceURL('/product/roaming/fi/guide');
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};