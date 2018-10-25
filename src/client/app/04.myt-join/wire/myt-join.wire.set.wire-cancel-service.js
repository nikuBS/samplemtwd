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

  },
  _cachedElement: function () {

    this.infoLi= $('[data-target="infoLi"]'); // 안내사항 확인
    this.productLi= $('[data-target="productLi"]'); // 해지신청상품

  },
  _bindEvent: function () {
    this.infoLi.on('click', 'input[type=checkbox]', $.proxy(this.$infoLi, this));
    this.productLi.on('click', 'input[type=checkbox]', $.proxy(this.$productLiEvt, this));

  },
  //--------------------------------------------------------------------------[EVENT]
  $infoLi: function(event) {
    this._infoConfirm(event);
  },
  $productLiEvt: function(event) {
    this.dataModel.productList =  this._productChkConfirm(event); // 선택한 항목을 배열에 저장
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