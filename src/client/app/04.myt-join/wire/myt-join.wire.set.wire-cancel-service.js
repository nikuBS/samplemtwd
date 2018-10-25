/**
 * FileName: myt-join.wire.set.wire-cancel-service.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.10.15
 */
Tw.MyTJoinWireSetWireCancelService = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.formData = {
    svcMgmtNumArr: '',
    acntNumArr: '',
    grpIdArr: '',
    termPrefrDy: '',
    visitCntcNum: ''
  };


  this.dataModel = {
    infoConfirmBol: false,      // 안내사항 확인
    productList: [],            // 해지신청상품 리스트
    TerminationDtStr: '',       // 해지 요청일
    hpAndTelTypeStr: 'hp',      // 연락 가능한 연락처 체크 타입
    phoenNmStr: '',             // 연락 가능한 연락처
    memberPhoneBol: false       // 회원정보 등록된 연락처 체크
  };

  // 회원정보 등록된 연락처
  this.memberPhoneObj = {
    hp: null,
    tel: null
  };

  this._init();

};

Tw.MyTJoinWireSetWireCancelService.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._memberPhoneSet();
    Tw.Logger.info('[dataModel]', this.dataModel);
  },
  _cachedElement: function () {

    this.infoLi= $('[data-target="infoLi"]'); // 안내사항 확인
    this.productLi= $('[data-target="productLi"]'); // 해지신청상품
    this.hpAndTelType= $('[data-target="hpAndTelType"]');
    this.select_Termination_input= $('[data-target="select_Termination_input"]');
    this.input_hp= $('[data-target="input_hp"]');
    this.phoneLi= $('[data-target="phoneLi"]'); // 회원정보 등록된 연락
    this.$submitApply= $('[data-target="submitApply"]'); // 신청하기 버튼

  },
  _bindEvent: function () {
    this.infoLi.on('click', 'input[type=checkbox]', $.proxy(this.$infoLiEvt, this));
    this.productLi.on('click', 'input[type=checkbox]', $.proxy(this.$productLiEvt, this));

    this.hpAndTelType.on('click', 'input:radio[name=radio1]', $.proxy(this.hpAndTelTypeEvt, this));

    this.$container.on('change', '[data-target="select_Termination_input"]', $.proxy(this.select_Termination_inputEvt, this));
    this.$container.on('keyup', '[data-target="input_hp"]', $.proxy(this.input_hpEvt, this));
    this.phoneLi.on('click', 'input[type=checkbox]', $.proxy(this.phoneLiEvt, this));

    this.$container.on('click', '[data-target="submitApply"]', $.proxy(this.$submitApplyEvt, this));


  },
  //--------------------------------------------------------------------------[EVENT]
  $submitApplyEvt: function(event) {
    Tw.Logger.info('[신청하기]', event);
    // var param = this.addressFormData;
    // this._chgWireAddrInfo(param);

  },

  $infoLiEvt: function(event) {
    this._infoConfirm(event);

    this._formValidateionChk();
    Tw.Logger.info('[dataModel]', this.dataModel);
  },
  $productLiEvt: function(event) {
    this.dataModel.productList =  this._productChkConfirm(event); // 선택한 항목을 배열에 저장

    this._formValidateionChk();
    Tw.Logger.info('[dataModel]', this.dataModel);
  },

  // 해지 요청일
  select_Termination_inputEvt: function () {
    Tw.Logger.info('[해지 요청일]');
    var curDt = Tw.DateHelper.getCurrentDateTime('YYYY-MM-DD');
    var startDt = Tw.DateHelper.getShortDateWithFormatAddByUnit(curDt, 2, 'day', 'YYYY-MM-DD', 'YYYY-MM-DD');
    var endDt = Tw.DateHelper.getShortDateWithFormatAddByUnit(curDt, 30, 'day', 'YYYY-MM-DD', 'YYYY-MM-DD');
    var tempDt = this.select_Termination_input.val();
    Tw.Logger.info('[해지 요청일]', tempDt, startDt, endDt);

    //유효성 체크
    if ( this._dateChkBetween(tempDt, startDt, endDt) ) {
      Tw.Logger.info('[범위에 포함]');

      this.select_Termination_input.val( tempDt );
      this.dataModel.TerminationDtStr = tempDt;

    } else {
      Tw.Logger.info('[범위에 포함 안됨!!]', this.select_Termination_input);
      this.select_Termination_input.val('');
    }

    this._formValidateionChk();
    Tw.Logger.info('[dataModel]', this.dataModel);
  },

  // 연락처 입력
  input_hpEvt: function(event) {
    var tempNum = this._onFormatHpNum(event);
    this.dataModel.phoenNmStr = tempNum;

    this._formValidateionChk();
    Tw.Logger.info('[dataModel]', this.dataModel);
  },

  phoneLiEvt: function(event) {
    if ( this.dataModel.memberPhoneBol ) {
      this.dataModel.memberPhoneBol = false;
      return;
    } else {
      this.dataModel.memberPhoneBol = true;
    }

    Tw.Logger.info('[회원정보 등록된 연락처]', event);


    if ( this.dataModel.hpAndTelTypeStr === 'hp' ) {
      Tw.Logger.info('[휴대폰 타입]');

      if ( Tw.FormatHelper.isEmpty( this.memberPhoneObj.hp ) ) { // 값이 없을 경우
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A35.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A68.TITLE, null,
          $.proxy(function(){
            // this._goLoad('/myt/join/wire/history');
          }, this));
      } else { // 값이 있을 경우
        this.dataModel.phoenNmStr = this.memberPhoneObj.hp;
        this.input_hp.val( this._phoneStrToDash( this.memberPhoneObj.hp ) );
      }

    } else if ( this.dataModel.hpAndTelTypeStr === 'tel' ) {
      Tw.Logger.info('[일반전화 타입]');
      if ( Tw.FormatHelper.isEmpty( this.memberPhoneObj.tel ) ) { // 값이 없을 경우
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A35.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A68.TITLE, null,
          $.proxy(function(){
            // this._goLoad('/myt/join/wire/history');
          }, this));
      } else { // 값이 있을 경우
        this.dataModel.phoenNmStr = this.memberPhoneObj.tel;
        this.input_hp.val( this._phoneStrToDash( this.memberPhoneObj.tel) );
      }

    }
    // Tw.Logger.info('[memberPhoneObj]', this.memberPhoneObj);
    // Tw.Logger.info('[dataModel]', this.dataModel);

    this._formValidateionChk();
    Tw.Logger.info('[dataModel]', this.dataModel);

  },

  /*
  * 연락 가능한 연락 타입 체크
  * 타입체크 값이 변경 될때 마다 초기화 될 항목이 있다.
  * 1. 전화번호 입력 input 초기화 : this.dataModel.phoenNmStr
  * 2. 회원정보 등록된 연락처 체크 초기화 : this.dataModel.memberPhoneBol
   */
  hpAndTelTypeEvt: function() {
    var tempVal = this.hpAndTelType.find('input:radio[name=radio1]:checked').val();
    this.dataModel.hpAndTelTypeStr = tempVal;

    this.dataModel.phoenNmStr = '';
    this.input_hp.val('');

    this.phoneLi.removeClass('checked');
    this.phoneLi.find('input[type=checkbox]').attr('checked', false);
    this.dataModel.memberPhoneBol = false;


    Tw.Logger.info('[연락 가능한 연락처 타입]', this.dataModel);
  },

  //--------------------------------------------------------------------------[SVC]
  /*
  * 안내사항 확인
   */
  _infoConfirm : function(event) {
    Tw.Logger.info('[안내사항 확인 이벤트]', event);
    var tempBol = this.infoLi.find('input[type=checkbox]').is(':checked'); // 체크 상태 여부

    if ( tempBol ) {
      this.dataModel.infoConfirmBol = true;
    } else {
      this.dataModel.infoConfirmBol = false;
    }

    Tw.Logger.info('[안내사항 확인 이벤트 end]', this.dataModel.infoConfirmBol);

  },



  /*
  * 해지신청상품 체크상태 확인
  * return array
   */
  _productChkConfirm: function(event) {
    Tw.Logger.info('[해지신청상품 체크상태 확인]', event);
    var tempList = [];
    var wireList = [];

    this.productLi.each( function( idx ) {
      var tempBol = $(this).find('input[type=checkbox]').is(':checked');
      if ( tempBol ) {
        tempList.push(idx);
      }
    });

    Tw.Logger.info('[tempList]', tempList);

    if (tempList.length > 0) {
      for(var i=0, len=tempList.length; i<len; i++) {
        wireList.push( this.resData.resDataInfo.wireList[tempList[i]] );
      }
    }

    Tw.Logger.info('[wireList]', wireList);

    return wireList;
  },

  /*
  * 회원정보 등록된 연락처 셋팅
  * 무선번호 경우 : actRepYn : 'Y'
  * 유선번호 경우 : actRepYn : 'Y', svcGr : 'P'
   */
  _memberPhoneSet: function() {
    // Tw.Logger.info('[회원정보 등록된 연락처 셋팅]');
    var hpList = this.resData.allSvc.M;
    var telList = this.resData.allSvc.S;

    if ( !Tw.FormatHelper.isEmpty(hpList) ) {
      _.map(hpList, $.proxy( function(item){
        if ( item.actRepYn === 'Y' ) {
          Tw.Logger.info('[item.svcNum]', item.svcNum);
          this.memberPhoneObj.hp = item.svcNum;
        }
      }, this));
    }

    if ( !Tw.FormatHelper.isEmpty(telList) ) {
      _.map(telList, $.proxy( function(item){
        if ( item.actRepYn === 'Y' && item.svcGr === 'P' ) {
          this.memberPhoneObj.tel = item.svcNum;
        }
      }, this));
    }
    Tw.Logger.info('[회원정보 등록된 연락처 셋팅 완료]', this.memberPhoneObj);
  },
  //--------------------------------------------------------------------------[Validation]
  /*
  * @param {string} date, {string} date, {string} date
  * @return boolean
   */
  _dateChkBetween: function($search, $betweenStart, $betweenEnd) {
    var search = $search;
    var betweenStart = $betweenStart;
    var betweenEnd = $betweenEnd;
    return moment(search).isBetween(betweenStart, betweenEnd, null, '[)');
  },

  /*
  * Form Validation
   */
  _formValidateionChk: function() {

    Tw.Logger.info('[유효성 체크 시작]');
    var tempObj = this.dataModel;

    try {
      _.map(tempObj, function( item, key ) {

        Tw.Logger.info('[ formData > _.map > '+ key +']', item, Tw.FormatHelper.isEmpty(item));

        if ( key === 'infoConfirmBol' ) { // 안내사항 확인
          if ( item === false ) {
            Tw.Logger.info('[값을 입력하세요.]', key);
            throw new Error('break');
          }
        }

        if( key === 'productList' ) { // 해지신청상품 리스트
          if ( item.length === 0 ) {
            Tw.Logger.info('[값을 입력하세요.]', key);
            throw new Error('break');
          }
        }

        if( key === 'TerminationDtStr' ) { // 해지 요청일
          if ( Tw.FormatHelper.isEmpty(item) ) {
            Tw.Logger.info('[값을 입력하세요.]', key);
            throw new Error('break');
          }
        }

        if( key === 'phoenNmStr' ) { // 연락 가능한 연락처
          if ( Tw.FormatHelper.isEmpty(item) ) {
            Tw.Logger.info('[값을 입력하세요.]', key);
            throw new Error('break');
          }
        }

      });

    } catch(e) {
      if(e.message === 'break'){
        //break successful
        Tw.Logger.info('[catch > break]', e);
        this.$submitApply.attr('disabled', true);
      }
      return;
    }

    Tw.Logger.info('[유효성 체크 완료]');

    this.$submitApply.attr('disabled', false);


  },

  //--------------------------------------------------------------------------[API]



  //--------------------------------------------------------------------------[COM]
  _noDash: function(str) {
    str = String(str);
    return str.split('-').join('');
  },
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  },
  _comUnComma: function (str) {
    str = String(str);
    // return str.replace(/[^\d]+/g, '');
    return str.replace(/,/g, '');
  },
  _phoneStrToDash: function (str) {
    var strVal = String(str);
    return strVal.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  },
  _goBack: function () {
    this._history.go(-1);
  },
  _goLoad: function (url) {
    location.href = url;
  },
  _go: function (hash) {
    this._history.setHistory();
    window.location.hash = hash;
  },
  // 휴대폰/일반전화 입력 시 자동 하이픈 넣기
  _onFormatHpNum : function (e) {
    var _$this = $(e.currentTarget);
    var data = this._noDash(_$this.val());
    var returnVal;

    //숫자,대시를 제외한 값이 들어 같을 경우
    if ( Tw.ValidationHelper.regExpTest(/[^\d-]/g, data) ) {
      returnVal = data.replace(/[^\d-]/g, ''); // 숫자가 아닌 문자 제거
      Tw.Logger.info('[returnVal 1]', returnVal);
      _$this.val(returnVal);
      return returnVal;

    } else {
      var rexTypeA = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/g;
      returnVal = data.replace(rexTypeA, '$1-$2-$3');
      Tw.Logger.info('[returnVal 2]', returnVal);
      _$this.val(returnVal);
      return returnVal;
    }

  }

};