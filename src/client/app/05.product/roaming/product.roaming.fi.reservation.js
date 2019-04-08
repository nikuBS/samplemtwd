/**
 * @file product.roaming.fi.reservation.js
 * @desc T로밍 > boro Box 예약
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.11.13
 */

Tw.ProductRoamingFiReservation = function(rootEl, minDate) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._cachedElement();
  this._bindEvent();
  this._init(minDate);

};

Tw.ProductRoamingFiReservation.prototype = {
  countryArr : [],

  _cachedElement: function() {
    this.$btnRegister = this.$container.find('#fe-register');
    this.$btnCountryLink = this.$container.find('.link-area > .bt-link-tx');
    this.$btnTermsAgree = this.$container.find('.comp-list-layout');
    this.$openAgreeView = this.$container.find('.agree-view');
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
    this.$container.on('change', '#flab02', $.proxy(this._changeCheck, this));
    this.$container.on('change', '#flab03', $.proxy(this._changeCheck, this));
  },

  /**
   * @function
   * @desc 값 초기화
   * @param minDate - 예약 가능한 최소 날짜
   * @private
   */
  _init: function(minDate) {
    //다른 화면에서 돌아올 경우 값 상태 초기화
    this.$inputPhone.val('');
    this.$inputSdate.val(minDate);
    this.$inputEdate.val(minDate);
    var self = this;
    setTimeout(function(){
      self.$agreeCheckOne.attr('aria-checked', false);
      self.$agreeCheckTwo.attr('aria-checked', false);
      self.$agreeCheckOne.removeClass('checked');
      self.$agreeCheckTwo.removeClass('checked');
      self.$agreeCheckOne.find('input').prop('checked', false);
      self.$agreeCheckTwo.find('input').prop('checked', false);
    },50);
  },

  /**
   * @function
   * @desc 예약하기 버튼 선택
   * @param e
   * @returns {*|void}
   * @private
   */
  _searchCountryCode: function(e){ //국가코드 가져오기 및 유효성 검사
    var inputNumber = this.$inputPhone.val();

    //핸드폰 번호 형식이 아닐 경우 Alert 호출
    if (!Tw.ValidationHelper.isCellPhone(inputNumber)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE, null, null, null, $(e.currentTarget));
    }

    //시작일을 종료일 이후로 설정할 경우 Alert 호출
    if (Tw.DateHelper.getDifference(this.$inputEdate.val(), this.$inputSdate.val()) < 0) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A84.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A84.TITLE, null, null, null, $(e.currentTarget));
    }

    //시작일이 minDate(이틀 뒤)보다 작게 설정할 경우 Alert 호출
    var getMinDate = this.$inputSdate.attr('min');
    if (Tw.DateHelper.getDifference(getMinDate, this.$inputSdate.val()) > 0) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A85.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A85.TITLE, null, null, null, $(e.currentTarget));
    }

    //국가코드 조회 API 호출
    this._apiService.request(Tw.API_CMD.BFF_10_0060, {keyword : ''})
      .done($.proxy(this._handleSuccessSearchCountry, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc 한글로된 국가 배열을 코드 배열로 교체
   * @param res
   * @private
   */
  _handleSuccessSearchCountry: function(res){
    if(res.code === Tw.API_CODE.CODE_00) {
      var allCountryCode = res.result;
      var countyArr = this.countryArr.map(function(x){return x;});

      allCountryCode.forEach(function(key){
        if(countyArr.indexOf(key.countryNm) >= 0){
          countyArr.splice(countyArr.lastIndexOf(key.countryNm),1,key.countryCode);
        }
      });

      this._handleFiReservation(countyArr); //국가코드 가져온 후 예약하기 함수 호출
    }else{
      this._onFail(res);
    }
  },

  /**
   * @function
   * @desc BFF_10_0065(new) 로밍> T파이 임대 > T파이 예약 신청 API Request
   * @param countryArr - 국가 코드 배열
   * @private
   */
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

    // 수령장소 기본 값(인천공항 1터미널 3층 F카운터) 세팅
    if(boothcode === null || boothcode === undefined){
      boothcode = '1000004045';
      impbranch = 'A100110000';
      this.selectIdx = 0;
    }

    // 반납장소 기본 값(인천공항 1터미널 1층) 세팅
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

    this._apiService.request(Tw.API_CMD.BFF_10_0065, params)
      .done($.proxy(this._handleSuccessFiReservation, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc BFF_10_0065(new) 로밍> T파이 임대 > T파이 예약 신청 API Response
   * @param res
   * @private
   */
  _handleSuccessFiReservation: function(res){
    if(res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/product/roaming/fi/reservation-complete?selectIdx=' + this.selectIdx);
    }else{
      this._onFail(res);
    }
  },

  /**
   * @function
   * @desc 방문국가 선택
   * @param e
   * @returns {*|void}
   * @private
   */
  _addVisitCountry: function(e){
    //추가된 국가가 5개 이상이면 Alert 호출 
    if(this.countryArr.length > 4){
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A88.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A88.TITLE, null, null, null, $(e.currentTarget));
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

  /**
   * @function
   * @desc 방문국가 삭제
   * @param e
   * @private
   */
  _removeVisitCountry : function(e){
    var removeName = $(e.target).parents('.tx-cont').siblings('.title').text();
    this.countryArr.splice(this.countryArr.indexOf(removeName),1);
    $(e.target).parents('li').remove();

    this._changeCheck();
  },

  /**
   * @function
   * @desc 수령 장소 선택, 반납 장소 선택 Action Sheet Open
   * @param e
   * @private
   */
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
      $.proxy(this._onActionSheetOpened, this, selected, currentCenter), null, null, $(e.currentTarget)
    );

  },

  /**
   * @function
   * @desc 수령 장소 선택, 반납 장소 선택 Action Sheet Open Callback
   * @param selected
   * @param currentCenter - 선택한 장소 명
   * @param $layer
   * @private
   */
  _onActionSheetOpened: function (selected, currentCenter, $layer) {
    $('li.type1').each(function(){
      if($(this).find('label').attr('value') === currentCenter){
        $(this).find('input[type=radio]').prop('checked', true);
      }
    });
    $layer.find('[name="r2"]').on('click', $.proxy(this._onActionSelected, this, selected));

    // 닫기 버튼 클릭
    $layer.one('click', '#fe-back', this._popupService.close);
  },

  /**
   * @function
   * @desc 수령 장소 선택, 반납 장소 선택 Action Sheet 값 선택
   * @param selected
   * @param e
   * @private
   */
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
      var imgUrl1 = $('#fe-return-img').attr('src');
      var startLen1 = imgUrl1.lastIndexOf('/');
      var cdnUrl1 = imgUrl1.substring(0,startLen1+1);
      $('#fe-return-img').attr('src', cdnUrl1 + $(e.target).parents('label').attr('data-img') + '.png');
    }

    this._popupService.close();
  },

  /**
   * @function
   * @desc 개인 정보 수집 이용동의 약관 전문 팝업 Open
   * @param e
   * @private
   */
  _openAgreeView: function(e){
    this._popupService.open({
      hbs: 'RM_14_02_02_01',
      layer: true
    },$.proxy(this._onAgreePopOpened, this), null, 'agree', $(e.currentTarget));

  },

  _onAgreePopOpened: function($root) {
    $root.on('click', '#agreeBtn', $.proxy(this._clickConfirmBtn, this));
  },

  /**
   * @function
   * @desc 정보수정 하단 버튼 활성화/비활성화 처리
   * @param state - 발생한 event 종류
   * @private
   */
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

      // 이용약관 동의 체크, 국가 선택, 핸드폰 번호 입력, 예약 시작/종료일 모두 체크 되어야만 하단 버튼 활성화
      if(self.$agreeCheckOne.hasClass('checked') && self.$agreeCheckTwo.hasClass('checked') && countryCheck && inputPhoneCheck && dateCheck){
        self.$btnRegister.removeAttr('disabled');
      }else{
        self.$btnRegister.attr('disabled','disabled');
      }
    },0);
  },

  /**
   * @function
   * @desc T로밍센터로 이동
   * @private
   */
  _goRoamingCenter: function() {
    this._historyService.goLoad('/product/roaming/info/center');
  },

  /**
   * @function
   * @desc 핸드폰 번호 하이픈('-') 생성
   * @private
   */
  _insertDashPhone: function() {
    // 9자리 이하 : 010-000-000, 10자리 이하 : 010-000-0000, 11자리 이하 010-0000-0000
    var phoneNum = this.$inputPhone.val().replace(/\-/gi, '');
    var hypenPhoneNum = Tw.FormatHelper.getDashedCellPhoneNumber(phoneNum);
    this.$inputPhone.val(hypenPhoneNum);
  },

  /**
   * @function
   * @desc Event listener for the button click on '#flab01'(핸드폰 번호 입력)
   * @private
   */
  _removeDashPhone: function() {
    var phoneNum = this.$inputPhone.val().replace(/\-/gi, '');
    this.$inputPhone.val(phoneNum);
  },

  /**
   * @function
   * @desc 개인 정보 수집 이용동의 약관 전문 팝업에서 확인버튼 선택
   * @private
   */
  _clickConfirmBtn: function() {
    this.$agreeCheckOne.addClass('checked');
    this.$agreeCheckOne.attr('aria-checked', 'true');
    this.$agreeCheckOne.find('input').attr('checked','checked');

    this._changeCheck();
    this._popupService.close();
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};