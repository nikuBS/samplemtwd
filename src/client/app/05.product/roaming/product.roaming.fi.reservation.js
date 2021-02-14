/**
 * @file product.roaming.fi.reservation.js
 * @desc T로밍 > boro Box 예약
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.11.13
 * 2021.02 바로박스 개선 OP002-11941 JongGu Kim(jmsk80@softworks.co.kr)
 */

Tw.ProductRoamingFiReservation = function(rootEl, resData) {
  this.resData = JSON.parse(window.unescape(resData));
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._cachedElement();
  this._bindEvent();

  this._init(this.resData.formatDate.minDate);
  this._svcInfo = this.resData.svcInfo;
  this._pageInfo = this.resData.pageInfo;
  this._formatDate = this.resData.formatDate;
};

Tw.ProductRoamingFiReservation.prototype = {
  countryArr : [],
  sdate : '',
  edate : '',
  _cachedElement: function() {
    
//    this.$btnCountryLink = this.$container.find('.link-area > .bt-link-tx');
//    this.$btnCountryLink = this.$container.find('.visit-country-popup-value > [role=tabpanel] > li');
    this.$btnTermsAgree = this.$container.find('.comp-list-layout');
    
    this.$inputSdate = this.$container.find('#flab02');
    this.$inputEdate = this.$container.find('#flab03');

    this.$inputProdType = this.$container.find('#flab06'); //바로박스 상품타입
    this.$btnStep2 = this.$container.find('#fe-step2'); //step2 이동
    this.$btnStep3 = this.$container.find('#fe-step3'); //step3 이동
  },

  _bindEvent: function() {
    
    //this.$btnCountryLink.on('click', $.proxy(this._addVisitCountry, this));
    this.$container.on('click', '#visitList .bt-alone', $.proxy(this._removeVisitCountry, this));
    this.$container.on('click', 'button[id=flab04],button[id=flab05]', $.proxy(this._openLocationPop, this));
    this.$btnTermsAgree.on('click', $.proxy(this._changeCheck, this));
    this.$container.on('click', '#goLink', $.proxy(this._goRoamingCenter, this));
    this.$container.on('blur', '#flab01', $.proxy(this._insertDashPhone, this));
    this.$container.on('click', '#flab01', $.proxy(this._removeDashPhone, this));
    this.$container.on('keyup paste', '#flab01', $.proxy(this._changeCheck, this, 'keyup'));
    this.$container.on('change', '#flab01', $.proxy(this._changeCheck, this));
    this.$container.on('click', '.cancel', $.proxy(this._changeCheck, this));


    this.$container.on('click', 'button[id=flab06]', $.proxy(this._openProdTypePop, this)); //국가선택팝업 / 바로박스상품 선택 리스트팝업
    this.$container.on('click', 'button[id=flab07]', $.proxy(this._clickCountry, this));  //국가선택팝업 표시버튼
    this.$container.on('click', 'button[id=fe-step2]', $.proxy(this._clickStep2, this));  //step2 이동버튼
    this.$container.on('click', 'button[id=fe-step3]', $.proxy(this._clickStep3, this));  //step3 이동버튼
  //  this.$container.on('click', 'button[id=fe-register]', $.proxy(this._clickComplate, this));  //step4 완료화면 이동버튼 테스트용
    
  },

  /**
   * @function
   * @desc 값 초기화
   * @param minDate - 예약 가능한 최소 날짜
   * @private
   */
  _init: function(minDate) {
    //다른 화면에서 돌아올 경우 값 상태 초기화
    
    this.$inputSdate.val(minDate);
    this.$inputEdate.val(minDate);
    
    this._initStep1();
    $("#fe-step2box").hide();
    $("#fe-step3box").hide();
    $("#fe-step1box").show();
    $("#fe-step2btn").hide();
    $("#fe-step3btn").hide();
    $("#fe-step1btn").show();

  },

  _initStep1: function(){
    $('#visitListEmpty').show();
    $('#visitList').hide();
  },
  _initStep2: function(){

  },
  _initStep3: function(){

  },

  /**
   * @function
   * @desc 예약하기 버튼 선택
   * @param e
   * @returns {*|void}
   * @private
   */
  _searchCountryCode: function(e){ //국가코드 가져오기 및 유효성 검사

    // 임대시작일 또는 반납일이 일요일 + 대구 황금점일 경우 Alert 호출 (휴무일)
    if ( this.$inputReceive.attr('data-booth') === '1430452300' ) {
      if ( Tw.DateHelper.getDayOfWeek(this.$inputSdate.val()) === '일' || Tw.DateHelper.getDayOfWeek(this.$inputEdate.val()) === '일' ) {
        return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A95.MSG,
          Tw.ALERT_MSG_PRODUCT.ALERT_3_A95.TITLE, null, null, null, $(e.currentTarget));
      }
    }
    var inputNumber = this.$inputPhone.val();

    //핸드폰 번호 형식이 아닐 경우 Alert 호출
    if (!Tw.ValidationHelper.isCellPhone(inputNumber)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE, null, null, null, $(e.currentTarget));
    }



    Tw.CommonHelper.startLoading('.popup-page', 'grey', true);
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
    // var expbranchnm = this.$inputReturn.text();
    var expbranchnm = this.$inputReceive.text();
    var boothcode = this.$inputReceive.attr('data-booth');
    var boothnm = this.$inputReceive.text();
    // var impbranch = this.$inputReceive.attr('data-center');
    // var expbranch = this.$inputReturn.attr('data-center');
    var expbranch = this.$inputReceive.attr('data-center');
    var impbranch = this.$inputReturn.attr('data-center');
    var nationCode = countryArr;
    var rentFrom = this.$inputSdate.val().replace(/\-/gi, '');
    var rentTo = this.$inputEdate.val().replace(/\-/gi, '');
    var contphonenum = this.$inputPhone.val().replace(/\-/gi, '');
    var date = new Date();
    var hsrsvrcvdtm = date.toISOString().substring(0,10).replace(/\-/gi, '');

    // 수령장소 기본 값(인천공항 1터미널 3층 F카운터) 세팅, 처음에 액션시트 한번도 선택하지 않고 기본값으로 할때는 해당 속성들이 없기 때문에 임의로 api 넘길 값들을 셋팅
    if(boothcode === null || boothcode === undefined){
      boothcode = '1000004045'; // 인천공항 1터미널 3층 로밍센터(F 카운터)
      // boothcode = '1000004047';  // 인천공항 1터미널 3층 로밍센터(H 카운터)
      // impbranch = 'A100110000';
      expbranch = 'A100110000';
      // 액션시트 선택하지 않았을때 예약 완료 페이지에 기본으로 넘길 id 값, 인천공항 1터미널 3층 로밍센터(F 카운터)
      this.selectIdx = 0;
      // this.selectIdx = 1;
    }

    // 반납장소 기본 값(인천공항 1터미널 1층) 세팅
    if(impbranch === null || impbranch === undefined){
    // if(expbranch === null || expbranch === undefined){
      // expbranch = 'A100110000';
      impbranch = 'A100110000';
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
  //  console.log('params>>',params);
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
    Tw.CommonHelper.endLoading('.container');
    // console.log('res code'+res);
    // console.log('code'+res.code);
    // console.log('msg'+res.msg);
    // console.log('phonenum >'+res.phonenum);
    // console.log('rentfrom >'+res.rentfrom);
    // console.log('rentto >'+res.rentto);
    // console.log('this.countryArr >'+this.countryArr);
    var result = res.result;
    if(res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/product/roaming/fi/reservation-complete?selectIdx=' + this.selectIdx+'&rentfrom='+result.rentfrom+'&rentto='+result.rentto+'&countryArr='+this.countryArr+'&boothCd='+result.boothCode);
    }else{
      this._onFail(res);
    }
  },
  _clickComplate: function(res){ //레이어 테스트
      this._historyService.replaceURL('/product/roaming/fi/reservation-complete?selectIdx=' + 1);
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

      $('#visitList > ul').append(
        '<li id="' + (this.countryArr.length-1) + '">\n' +
        '<span class="title">' + this.countryArr[this.countryArr.length-1] + '</span>\n' +
        '<span class="tx-cont"><div class="bt-alone"><button class="bt-line-gray1">삭제</button></div></span>\n' +
        '</li>'
      );
    }
    /*
    else{
    //  this._popupService.openAlert('이미 선택된 국가입니다.','알림', null, null, null, $(e.currentTarget)); // 기획컨펌필요
      return;
    }
    */
    //this._popupService.openAlert('추가되었습니다.','알림', null, null, null, $(e.currentTarget)); //기획컨펌필요
    this._changeCheckStep1();
    this._popupService.close();
  
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

    this._changeCheckStep1();
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

  _changeCountry: function(prodType){
    $("#areaGlobal").hide();
    $("#areaJapan").hide();
    $("#areaUsa").hide();
    $("#areaAsia").hide();
    if(prodType == 'global'){
      $("#areaGlobal").show();
    }else if(prodType == 'japan'){
      $("#areaJapan").show();
    }else if(prodType == 'usa'){
      $("#areaUsa").show();
    }else if(prodType == 'asia'){
      $("#areaAsia").show();
    }

  },



  /**
   * @function
   * @desc 국가선택 / barobox 상품선택 Action Sheet Open
   * @param e
   * @private
   */
  _openProdTypePop : function(e){
    var selected = e.target;
    var data = [];

    //상품 선택 --jgmik 임시
    data = Tw.POPUP_TPL.ROAMING_FI_PRODUCT;
    var baroboxProdNm = $(selected).text();
  
    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetOpened, this, selected, baroboxProdNm), null, null, $(e.currentTarget)
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

      //약도 이미지 및 영업시간 변경
      var imgUrl = $('#fe-receive-img').attr('src');
      var startLen = imgUrl.lastIndexOf('/');
      var cdnUrl = imgUrl.substring(0,startLen+1);
      $('#fe-receive-img').attr('src', cdnUrl + $(e.target).parents('label').attr('data-img') + '.png')
      $('#fe-receive-officehour').html($(e.target).parents('label').attr('data-officehour'));

      // 기본 반환장소 설정 (대구 황금점만 해당)
      // TODO: 반납 버튼 ID 하드코딩
      if( $(e.target).parents('label').attr('return-set') == "1" ) {
        this.$inputReturn.text($(e.target).parents('label').attr('return-value')); // 반납 센터명 출력
        this.$inputReturn.attr('data-center',$(e.target).parents('label').attr('return-data-center')); // 반납 센터코드 설정

        var returnImgUrl = $('#fe-return-img').attr('src');
        var returnStartLen = returnImgUrl.lastIndexOf('/');
        var returnCdnUrl = returnImgUrl.substring(0,returnStartLen+1);
        $('#fe-return-img').attr('src', returnCdnUrl + $(e.target).parents('label').attr('return-data-img') + '.png')
        $('#fe-return-officehour').html($(e.target).parents('label').attr('return-data-officehour'));
        this.$inputReturn.attr('disabled',true);
      } else {
        if ( this.$inputReturn.attr('disabled') == "disabled" ) {
          // 기본(Default) 반환장소로 변경하고 disabled 해제
          this.$inputReturn.text('인천공항 1터미널 1층 로밍센터'); // 반납 센터명 출력
          this.$inputReturn.attr('data-center','A100110000'); // 반납 센터코드 설정
  
          var defaultReturnImgUrl = $('#fe-return-img').attr('src');
          var defaultReturnStartLen = defaultReturnImgUrl.lastIndexOf('/');
          var defaultReturnCdnUrl = defaultReturnImgUrl.substring(0,defaultReturnStartLen+1);
          $('#fe-return-img').attr('src', defaultReturnCdnUrl + 'place-img-01-1' + '.png')
          $('#fe-return-officehour').html('<strong>업무시간</strong> | 업무시간 : 9-10 출구 : 06:00 ~ 22:00 / 5-6 출구 : 24시간');
        }
        this.$inputReturn.attr('disabled',false);
      }

    }else if(selected.id === 'flab06'){      //상품선택
      var text = $(e.target).parents('label').attr('value');
      var baroboxProdTypeCd = $(e.target).parents('label').attr('baroboxProdTypeCd');

      $(selected).text(text); 
      $(selected).attr('baroboxProdTypeCd',baroboxProdTypeCd);
    //  console.log('prodNm=>'+text+' , cd=>'+baroboxProdTypeCd );
      this._changeCountry( baroboxProdTypeCd );

    }else{

      $(selected).text($(e.target).parents('label').attr('value')); //센터명 출력
      $(selected).attr('data-center',$(e.target).parents('label').attr('data-center'));

      //약도 이미지 및 영업시간 변경
      var imgUrl1 = $('#fe-return-img').attr('src');
      var startLen1 = imgUrl1.lastIndexOf('/');
      var cdnUrl1 = imgUrl1.substring(0,startLen1+1);
      $('#fe-return-img').attr('src', cdnUrl1 + $(e.target).parents('label').attr('data-img') + '.png');
      $('#fe-return-officehour').html($(e.target).parents('label').attr('data-officehour'));
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
  //step1 화면 상태체크
  _changeCheckStep1: function(state) {
    if(this.countryArr.length >0){
      $('#visitListEmpty').hide();
      $('#visitList').show();
      $('#fe-step2').attr("disabled",false);
    }else{
      $('#visitListEmpty').show();
      $('#visitList').hide();
      $('#fe-step2').attr("disabled",true);
    }
    // 5개 국가 선택시 국가추가버튼 disabled 처리
    // if(this.countryArr.length > 4){
    //   $('#flab07').attr("disabled",true);
    // }else{
    //   $('#flab07').attr("disabled",false);

    // }
  },
  //
  _changeCheckStep2: function(state) {
    this.sdate = this.$inputSdate.val();
    this.edate = this.$inputEdate.val();
  
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

    // if(this.$inputSdate.val() === '' || this.$inputEdate.val() === ''){
    //   dateCheck = false;
    // }

    // if(this.countryArr.length > 0){
       var countryCheck = true;
    // }
    var self = this;
    setTimeout(function(){
      var inputPhoneCheck = '';

      if(self.$inputPhone.val().length > 0){
        inputPhoneCheck = true;
      }else{
        inputPhoneCheck = false;
      }

      // 이용약관 동의 체크, 국가 선택, 핸드폰 번호 입력, 예약 시작/종료일 모두 체크 되어야만 하단 버튼 활성화
      if(self.$agreeCheckOne.hasClass('checked') && countryCheck && inputPhoneCheck && dateCheck){
        self.$btnRegister.removeAttr('disabled');
    
      }else{
        self.$btnRegister.attr('disabled','disabled');
      }
      
      // console.log('checked          '+ self.$agreeCheckOne.hasClass('checked'));
      // console.log('countryCheck     '+ countryCheck);
      // console.log('inputPhoneCheck  '+ inputPhoneCheck);
      // console.log('dateCheck        '+ dateCheck);

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
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code, err.msg).pop();
  },

  _clickStep2: function () {
   
   // Tw.CommonHelper.startLoading('.container', 'grey', true);
   // this._historyService.goLoad('/product/roaming/fi/reservation?step=2');
    //stepArea
    //   var source = $('#reservation-step2').html();
    //   console.log('source html >>'+source);
    //   var template = Handlebars.compile(source);
    // //  alert("!!!!! template   =>"+template);
    //   var wrapper = this.$container;
    //   var output = template({ svcInfo: this._svcInfo,formatDate:this._formatDate });
    //   var $menu = wrapper.find('[data-role="fe-roaming-step-menu"]');
    //   console.log('$menu >>',$menu);
    //   $menu.empty();
    //   $menu.append(output);
    $("#fe-step1box").hide();
    $("#fe-step1btn").hide();
    $("#fe-step2box").show();
    $("#fe-step2btn").show();
 
    this.$inputSdate = this.$container.find('#flab02');
    this.$inputEdate = this.$container.find('#flab03');

      // this.$container.on('change', '#flab02', $.proxy(this._changeCheck, this));
      // this.$container.on('change', '#flab03', $.proxy(this._changeCheck, this));
  },

  _clickStep3: function(e){

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


  //  Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._changeCheckStep2();
  //   console.log('_clickStep3');
  //   console.log('_sdate >>'+this.sdate);
  //   console.log('_edate >>'+this.edate);
  //   var source = $('#reservation-step3').html();

  //   var template = Handlebars.compile(source);
  // //  alert("!!!!! template   =>"+template);
  //   var wrapper = this.$container;
  //   var output = template({ test: 'test' });
  //   var $menu = wrapper.find('[data-role="fe-roaming-step-menu"]');
  //   console.log('$menu >>',$menu);
  //   $menu.empty();
  //   $menu.append(output);
    

    $("#fe-step2box").hide();
    $("#fe-step2btn").hide();
    $("#fe-step3box").show();
    $("#fe-step3btn").show();

    //
    this.$inputPhone = this.$container.find('#flab01');
    this.$agreeCheckOne = this.$container.find('#fe-check1');
    this.$inputPhone.val('');

    this.$openAgreeView = this.$container.find('.agree-view');
    this.$openAgreeView.on('click', $.proxy(this._openAgreeView, this));

    this.$btnRegister = this.$container.find('#fe-register');
    this.$btnRegister.click(_.debounce($.proxy(this._searchCountryCode, this), 500));

    this.$inputReceive = this.$container.find('#flab04');
    this.$inputReturn = this.$container.find('#flab05');

    var self = this;
    setTimeout(function(){
      self.$agreeCheckOne.attr('aria-checked', false);
      self.$agreeCheckOne.removeClass('checked');
      self.$agreeCheckOne.find('input').prop('checked', false);
    },50);

  },

  _clickCountry: function(e){
    var selected = e.target;
    if(this.countryArr.length > 4){
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A88.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A88.TITLE, null, null, null, $(e.currentTarget));

    }
    var data = [];
    this._popupService.open({
        hbs: 'RM_14_01_01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetCountryOpened, this, selected, 'test'), null, null, $(e.currentTarget)
    );
  },
  _onActionSheetCountryOpened: function($root,a,b){
    // console.log( 'callback >>',$root );
    // console.log( 'callback a>>',a );
    // console.log( 'callback b>>',b );
    // console.log( 'container class >>'+this.$container.class );
    // console.log( 'container class >>'+this.$container.attr('class') );
    
    this.$btnCountryLink = this.$container.find('li[role="tabpanel"] > div > ul > li');

    // this.$btnCountryLink.each(function(info){
    //   console.log('info2', info);
    // });

    this.$btnCountryLink.on('click', $.proxy(this._addVisitCountry, this));
  },
  toString: function(){
    return 'reservation:script';
  }
};
