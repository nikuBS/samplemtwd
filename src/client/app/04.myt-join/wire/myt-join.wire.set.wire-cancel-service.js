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
    memberPhoneBol: false,      // 회원정보 등록된 연락처 체크
    dcRefdSearch:false          // 할인반환금 조회 여부
  };

  // 회원정보 등록된 연락처
  this.memberPhoneObj = {
    hp: null,
    tel: null
  };

  this.cancelFeeInfo = null;

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
    // this.$saleRepaymentInfo= $('[data-target="saleRepaymentInfo"]'); // 할인반환금 조회 버튼

    this.dataLoading= $('[data-target="dataLoading"]');
    this.outputDtArea= $('[data-target="outputDtArea"]');
    this.outputArea= $('[data-target="outputArea"]');

    this.$entryTpl = $('#fe-entryTpl');
    this.$entryTplDate = $('#fe-entryTplDate');

  },
  _bindEvent: function () {
    this.infoLi.on('click', $.proxy(this.$infoLiEvt, this));
    this.productLi.on('click', 'input[type=checkbox]', $.proxy(this.$productLiEvt, this));
    this.hpAndTelType.on('click', 'input:radio[name=radio1]', $.proxy(this.hpAndTelTypeEvt, this));
    this.$container.on('input', '[data-target="select_Termination_input"]', $.proxy(this.select_Termination_inputEvt, this));
    this.$container.on('keyup', '[data-target="input_hp"]', $.proxy(this.input_hpEvt, this));
    this.phoneLi.on('click', 'input[type=checkbox]', $.proxy(this.phoneLiEvt, this));
    this.$container.on('click', '[data-target="submitApply"]', $.proxy(this.$submitApplyEvt, this));
    this.$container.on('click', '[data-target="saleRepaymentInfo"]', $.proxy(this.saleRepaymentInfoEvt, this));
    this.$container.on('click', '#btn_hp_del', $.proxy(this._formValidateionChk, this));

    this.$container.on('click', '#page-prev-step', $.proxy(this._closeCheck, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _closeCheck: function(){

    if(this.dataModel.productList > 0 ||
      this.dataModel.TerminationDtStr ||
      $('[data-target="input_hp"]').val()) {

      this._popupService.openConfirm(
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
        $.proxy(function(){
          this._history.goLoad('/myt-join/submain_w');
        }, this));
    } else {
      this._history.goBack();
    }
  },
  /*
  * 할인반환금 조회
   */
  saleRepaymentInfoEvt: function() {
    this._getWireCancelFee();
  },

  /*
  * this.dataModel 을 이용해 this.formData 에 맞는 데이터로 매치한다.
  * this.formData 완료되면 해지 신청하기 api 진행
   */
  $submitApplyEvt: function() {
    Tw.Logger.info('[dataModel]', this.dataModel);
    Tw.Logger.info('[formData]', this.formData);

    var tempSvcList = [];
    var tempAcntList = [];
    var tempGrpList = [];

    _.map( this.dataModel.productList, $.proxy( function( item ){
      tempSvcList.push( item.SVC_MGMT_NUM );
      tempAcntList.push( item.ACNT_NUM );
      tempGrpList.push( item.GRP_ID );
    }, this));

    this.formData.svcMgmtNumArr = tempSvcList.join(';');
    this.formData.acntNumArr = tempAcntList.join(';');
    this.formData.grpIdArr = tempGrpList.join(';');
    this.formData.termPrefrDy = this._noDash( this.dataModel.TerminationDtStr );
    this.formData.visitCntcNum = this.dataModel.phoenNmStr;

    if( !this.dataModel.dcRefdSearch ){
      // 할인 반환금을 조회해 주세요.
      // this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V54);
      $('#span-err-dcrefund').show();
      return;
    }

    Tw.Logger.info('[dataModel]', this.dataModel);
    Tw.Logger.info('[formData]', this.formData);

    var param = this.formData;
    this._setWireCancel(param);

  },

  $infoLiEvt: function() {
    var tempBol = this.infoLi.find('input[type=checkbox]').is(':checked'); // 체크 상태 여부

    if(!tempBol){
      this._popupService.open(
        { hbs: 'MS_04_08_L01' },
        $.proxy(function ($root) {
          $root.on('click', '.bt-red1', $.proxy(function(){
            this._popupService.close();
            this.infoLi.attr('aria-checked', true);
            this.infoLi.addClass('checked');
            this.infoLi.find('input[type=checkbox]').prop('checked', true);
            $('#span-err-guide').hide();
            this.dataModel.infoConfirmBol = true;
            this._formValidateionChk();
          }, this));
          Tw.Logger.info('[dataModel]', this.dataModel);
        }, this),
        null,
        'cancel-info'
      );

    } else {
      this.dataModel.infoConfirmBol = false;
      this.infoLi.attr('aria-checked', false);
      this.infoLi.removeClass('checked');
      this.infoLi.find('input[type=checkbox]').attr('checked', false);
      $('#span-err-guide').show();
    }

  },
  $productLiEvt: function(event) {
    if(this.productLi.find('input[type=checkbox]:checked').length === 0){
      $('#span-err-prod').show();
    } else {
      $('#span-err-prod').hide();
    }

    this.dataModel.productList =  this._productChkConfirm(event); // 선택한 항목을 배열에 저장

    this._formValidateionChk();
    Tw.Logger.info('[dataModel]', this.dataModel);
  },

  // 해지 요청일
  select_Termination_inputEvt: function () {

    if(this.select_Termination_input.val().length === 0){
      $('#span-err-date').show();
    } else {
      $('#span-err-date').hide();
    }
    Tw.Logger.info('[해지 요청일]');
    var curDt = Tw.DateHelper.getCurrentDateTime('YYYY-MM-DD');
    var startDt = Tw.DateHelper.getShortDateWithFormatAddByUnit(curDt, 2, 'day', 'YYYY-MM-DD', 'YYYY-MM-DD');
    var endDt = Tw.DateHelper.getShortDateWithFormatAddByUnit(curDt, 30, 'day', 'YYYY-MM-DD', 'YYYY-MM-DD');
    var tempDt = this.select_Termination_input.val();
    Tw.Logger.info('[해지 요청일]', tempDt, startDt, endDt);

    //유효성 체크
    tempDt = this._dateChkBetween(tempDt, startDt, endDt);
    this.select_Termination_input.val( tempDt );
    this.dataModel.TerminationDtStr = tempDt;

    this._formValidateionChk();
    Tw.Logger.info('[dataModel]', this.dataModel);
  },

  // 연락처 입력
  input_hpEvt: function(event) {
    var tempNum = this._onFormatHpNum(event);

    if(Tw.ValidationHelper.isCellPhone($('[data-target="input_hp"]').val()) ||
       Tw.ValidationHelper.isTelephone($('[data-target="input_hp"]').val())){  //
      this.dataModel.phoenNmStr = tempNum;
      $('#spanHpValid').text('');
    } else {
      this.dataModel.phoenNmStr = '';
      if(this.hpAndTelType.find('input:radio[name=radio1]:checked').val() === 'hp'){
        $('#spanHpValid').text(Tw.VALIDATE_MSG_MYT_DATA.V9);
      }
    }
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
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A68.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A68.TITLE, null,
          $.proxy(function(){
            this.uncheckPhoneLi();
          }, this));
      } else { // 값이 있을 경우
        this.dataModel.phoenNmStr = this.memberPhoneObj.hp;
        this.input_hp.val( this._phoneStrToDash( this.memberPhoneObj.hp ) );
      }

    } else if ( this.dataModel.hpAndTelTypeStr === 'tel' ) {
      Tw.Logger.info('[일반전화 타입]');
      if ( Tw.FormatHelper.isEmpty( this.memberPhoneObj.tel ) ) { // 값이 없을 경우
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A68.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A68.TITLE, null,
          $.proxy(function(){
            this.uncheckPhoneLi();
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

  uncheckPhoneLi: function(){
    this.phoneLi.attr('aria-checked', false);
    this.phoneLi.removeClass('checked');
    this.phoneLi.find('input[type=checkbox]').attr('checked', false);
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

    this.uncheckPhoneLi();
    this.dataModel.memberPhoneBol = false;

    $('#spanHpValid').text('');
    Tw.Logger.info('[연락 가능한 연락처 타입]', this.dataModel);
    this._formValidateionChk();
  },

  //--------------------------------------------------------------------------[SVC]
  /*
  * 안내사항 확인

  _infoConfirm : function(event) {
    Tw.Logger.info('[안내사항 확인 이벤트]', event);
    var tempBol = this.infoLi.find('input[type=checkbox]').is(':checked'); // 체크 상태 여부

    if ( tempBol ) {
      this.dataModel.infoConfirmBol = true;
    } else {
      this.dataModel.infoConfirmBol = false;
    }

    Tw.Logger.info('[안내사항 확인 이벤트 end]', this.dataModel.infoConfirmBol);

  }, */



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
    if(!this.resData.allSvc) return;
    var hpList = this.resData.allSvc.m;
    var telList = this.resData.allSvc.s;

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

    if(!this.memberPhoneObj.hp && !this.memberPhoneObj.tel){
      $('#span-err-noregcontr').show();
    }

    Tw.Logger.info('[회원정보 등록된 연락처 셋팅 완료]', this.memberPhoneObj);
  },

  _svcHbDetailList: function (resData, $jqTg, $hbTg) {
    var jqTg = $jqTg; // 뿌려지는 영역
    var hbTg = $hbTg; // 템플릿
    jqTg.empty();
    var source = hbTg.html();
    var template = Handlebars.compile(source);
    var data = {
      resData: resData
    };
    var html = template(data);
    jqTg.append(html);
  },

  //--------------------------------------------------------------------------[Validation]
  /*
  * @param {string} date, {string} date, {string} date
  * @return boolean
   */
  _dateChkBetween: function($search, $betweenStart, $betweenEnd) {
    if(moment($search).isBefore($betweenStart)){
      if ( Tw.BrowserHelper.isIos() ) {
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A202.MSG);
      }
      return $betweenStart;
    }
    if(moment($search).isAfter($betweenEnd)){
      if ( Tw.BrowserHelper.isIos() ) {
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A202.MSG);
      }
      return $betweenEnd;
    }
    return $search;
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

          if(!$('[data-target="input_hp"]').val()){
            Tw.Logger.info('[값을 입력하세요.]', key);

            throw new Error('break');
          }

          var nType = $('[data-target="hpAndTelType"] input:radio[name=radio1]:checked').val();

          if(nType === 'hp'){
            if(!Tw.ValidationHelper.isCellPhone($('[data-target="input_hp"]').val())){
              $('#spanHpValid').text(Tw.VALIDATE_MSG_MYT_DATA.V9);
              Tw.Logger.info('[값을 입력하세요.]', key);
              throw new Error('break');
            }
          } else if(nType === 'tel'){
            if(!Tw.ValidationHelper.isTelephone($('[data-target="input_hp"]').val())){
              $('#spanHpValid').text(Tw.MYT_JOIN_WIRE_CANCEL_SERVICE.INVALID_PHONE);
              Tw.Logger.info('[값을 입력하세요.]', key);
              throw new Error('break');
            }
          }

          $('#spanHpValid').text('');
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
  _getWireCancelFee: function() {
    Tw.Logger.info('[할인반환금조회]');
    // var thisMain = this;
    this.dataLoading.show();
    $('#span-err-dcrefund').hide();

    // $.ajax('http://localhost:3000/mock/wire.BFF_05_0173.json')
    //   .done(function (resp) {
    //     Tw.Logger.info(resp);
    //     thisMain.dataLoading.hide();
    //     thisMain._getWireCancelFeeInit(resp);
    //   })
    //   .fail(function (err) {
    //     Tw.Logger.info(err);
    //   });

    return this._apiService.request(Tw.API_CMD.BFF_05_0173).done($.proxy(this._getWireCancelFeeInit, this));

  },
  _getWireCancelFeeInit: function(res) {
    this.dataLoading.hide();

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('[결과1] _getWireCancelFeeInit', res);
      this.dataModel.dcRefdSearch = true;
      this.cancelFeeInfo = res.result;

      _.map( this.cancelFeeInfo.penaltyInfo, $.proxy( function( item ){
        item.brchAmt = this._comComma( item.brchAmt );
      }, this));

      this.cancelFeeInfo.chargeInfo.colAmt = this._comComma( this.cancelFeeInfo.chargeInfo.colAmt );
      this.cancelFeeInfo.chargeInfo.hbAmt = this._comComma( this.cancelFeeInfo.chargeInfo.hbAmt );
      this.cancelFeeInfo.chargeInfo.totAmt = this._comComma( this.cancelFeeInfo.chargeInfo.totAmt );

      // Tw.Logger.info('[cancelFeeInfo]', this.cancelFeeInfo);
      this._svcHbDetailList(this.cancelFeeInfo, this.outputArea, this.$entryTpl);

      // 날짜정보 넣기
      var textDtObj = {
        dtInfo : Tw.DateHelper.getShortDateNoDot(this.cancelFeeInfo.reqDate)
      };
      this._svcHbDetailList(textDtObj, this.outputDtArea, this.$entryTplDate);

    } else if ( res.code === 'ZINVE8888' ) {
      this._popupService.openAlert(Tw.MYT_JOIN_WIRE_CANCEL_SERVICE.NO_DC_REFUND);
      this.dataModel.dcRefdSearch = true;
    }
  },

  _setWireCancel: function (param) {
    Tw.Logger.info('[해지신청 진행]', param);
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    return this._apiService.request(Tw.API_CMD.BFF_05_0174, param)
      .done($.proxy(this._setWireCancelInit, this))
      .fail(function (err) {
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });
  },
  _setWireCancelInit: function (res) {
    Tw.CommonHelper.endLoading('.container');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('[결과] _setWireCancelInit', res);

      this.cancelFeeInfo = res.result;

      // this._popupService.afterRequestSuccess('/myt-join/submain_w', '/myt-join/submain_w', null,
      //   Tw.MYT_JOIN_WIRE_SET_WIRE_CANCEL_SEVICE.TERMINATION_COMPLETE, null);

      this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A35.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A35.TITLE, null,
        $.proxy(function(){
          this._goLoad('/myt-join/submain/wire/history');
        }, this));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },


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
    this._history.goBack();
  },
  _goLoad: function (url) {
    this._history.goLoad(url);
  },
  _go: function (hash) {
    this._history.goHash(hash);
    // this._history.setHistory();
    // window.location.hash = hash;
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