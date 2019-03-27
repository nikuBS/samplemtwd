/**
 * FileName: myt-join.wire.modify.address.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.10.15
 */
Tw.MyTJoinWireModifyAddress = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(rootEl);
  if(this.resData.resDataInfo.coClCd !== 'B'){
    this._backAlert = new Tw.BackAlert(rootEl, true);
  }

  this._init();


  this.addressFormData = {
    bldTypNm: '',               // 건물유형명

    zip: '',                    // 설치장소 변경후 우편번호
    basAddr: '',                // 설치장소 변경후 기본 주소
    dtlAddr: '',                // 설치장소 변경후 상세주소

    mvDt: '',                   // 이사일자 (YYYYMMDD)
    stopPrefrDt: '',            // 중단희망일자 (YYYYMMDD)
    setPrefrDt: '',             // 설치희망일자 (YYYYMMDD)

    cntcPrefrMblPhonNum: '',    // 휴대폰 번호
    cntcPrefrPhonNum: '',       // 일반전화 번호

    reqSiteClCd: '03',          // 요청사이트구분 (01:T-WORLD, 02:SKB사이버고객센터, 03:모바일 T)
    reqrNm: this.resData.mbrNm  // 신청인명

  };

};

Tw.MyTJoinWireModifyAddress.prototype = {
  _init: function () {
    if(this.resData.resDataInfo.coClCd === 'B'){
      // sk브로드밴드인 경우 팝업 변경 (myt-join공통함수로 처리)
      (new Tw.MyTJoinCommon()).openSkbdAlertOnInit(this._history);

      return;
    }
    this._cachedElement();
    this._bindEvent();
  },
  _cachedElement: function () {

    this.$select_building= $('[data-target="select_building"]'); // 건물 유형

    this.$select_house_input= $('[data-target="select_house_input"]'); // 이사 날짜

    this.$select_stop_input= $('[data-target="select_stop_input"]'); // 중단 희망 날짜

    this.$select_install_input= $('[data-target="select_install_input"]'); // 설치 희망 날짜

    this.$input_hp= $('[data-target="input_hp"]'); // 휴대폰 번호
    this.$input_phone= $('[data-target="input_phone"]'); // 일반전화 (선택항목)

    this.$submitApply= $('[data-target="submitApply"]'); // 신청하기 버튼

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="select_building"]', $.proxy(this.select_buildingEvt, this));

    this.$container.on('change', '[data-target="select_house_input"]', $.proxy(this.select_house_input_changeEvt, this));

    this.$container.on('change', '[data-target="select_stop_input"]', $.proxy(this.select_stop_input_changeEvt, this));

    this.$container.on('change', '[data-target="select_install_input"]', $.proxy(this.select_install_input_changeEvt, this));

    this.$container.on('keyup', '[data-target="input_hp"]', $.proxy(this.input_hpEvt, this));
    this.$container.on('keyup', '[data-target="input_phone"]', $.proxy(this.input_phoneEvt, this));

    this.$container.on('click', '[data-target="submitApply"]', $.proxy(this.$submitApplyEvt, this));

    this.$container.on('click', '#btnPostSearch', $.proxy(this._addr_search_clickEvt, this));
    this.$container.on('change', '.fe-main-address', $.proxy(this._formValidateionChk, this));
    this.$container.on('change', '.fe-detail-address', $.proxy(this._formValidateionChk, this));
    this.$container.on('click', '#btn_hp_del', $.proxy(this._formValidateionChk, this));

    this.$container.on('click', '#page-prev-step', $.proxy(this._closeCheck, this));

    new Tw.InputFocusService(this.$container, $('[data-target="submitApply"]'));
  },

  //--------------------------------------------------------------------------[EVENT]
  _closeCheck: function(){
    this._backAlert.onClose();

    // if(this.addressFormData.bldTypNm ||
    //   this.addressFormData.basAddr ||
    //   this.addressFormData.mvDt ||
    //   this.addressFormData.stopPrefrDt ||
    //   this.addressFormData.setPrefrDt ||
    //   $('[data-target="input_hp"]').val() ||
    //   $('[data-target="input_phone"]').val()) {
    //
    //   this._popupService.openConfirmButton(
    //     Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
    //     Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
    //     $.proxy(function(){
    //       this._history.goLoad('/myt-join/submain');
    //     }, this),
    //     null,
    //     Tw.BUTTON_LABEL.NO,
    //     Tw.BUTTON_LABEL.YES);
    // } else {
    //   this._history.goBack();
    // }
  },

  $submitApplyEvt: function(event) {
    Tw.Logger.info('[신청하기]', event);

    this.addressFormData.cntcPrefrMblPhonNum = this._noDash( this.addressFormData.cntcPrefrMblPhonNum );
    this.addressFormData.mvDt = this._noDash( this.addressFormData.mvDt );
    this.addressFormData.setPrefrDt = this._noDash( this.addressFormData.setPrefrDt );
    this.addressFormData.stopPrefrDt = this._noDash( this.addressFormData.stopPrefrDt );

    var param = this.addressFormData;

    Tw.Logger.info('[param]', param);


    this._chgWireAddrInfo(param);

  },

  input_hpEvt: function(event) {
    var tempNum = this._onFormatHpNum(event);

    if(!Tw.ValidationHelper.isCellPhone($('[data-target="input_hp"]').val())){  //
      this.addressFormData.cntcPrefrMblPhonNum = '';
      $('#spanHpValid').text(Tw.VALIDATE_MSG_MYT_DATA.V9).show().attr('aria-hidden', false);
    } else {
      this.addressFormData.cntcPrefrMblPhonNum = tempNum;
      $('#spanHpValid').text('').hide().attr('aria-hidden', true);
    }
    this._formValidateionChk();
    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },

  input_phoneEvt: function(event) {
    var tempNum = this._onFormatHpNum(event);
    this.addressFormData.cntcPrefrPhonNum = tempNum;
    this._formValidateionChk();
    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },

  select_buildingEvt: function(event) {
    Tw.Logger.info('[건물유형클릭]', event);
    var $target = $(event.currentTarget); // 클릭 한 버튼
    var hbsName = 'actionsheet_select_a_type';
    var hashName = 'select_building';

    // '단독주택', '아파트', '공통주택', '일반건물', '지하', '사서함', '임시건물', '비건물'
    // Tw.MYT_JOIN_WIRE_MODIFY_ADDRESS.BUILDING
    var data = [{
      list: []
    }];

    var listData = _.map(Tw.MYT_JOIN_WIRE_MODIFY_ADDRESS.BUILDING, function (item, idx) {
      Tw.Logger.info('[건물유형 IDX]', idx);
      return {
        value: item,
        option: '',
        attr: 'data-value="' + item + '", data-target="selectBtn"'
      };
    });

    data[0].list = listData;

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data,
        title: Tw.MYT_FARE_BILL_GUIDE_PPS.POP_TITLE_TYPE_0
      },
      $.proxy(this.select_buildingEvtOpen, this, $target),
      $.proxy(this.select_buildingEvtClose, this, $target),
      hashName);
  },

  //--------------------------------------------------------------------------[SVC]
  // 건물 유형
  select_buildingEvtOpen: function( $target, $layer ) {
    // Tw.Logger.info('[팝업 open > $target > 클릭한 버튼]', $target);
    // Tw.Logger.info('[팝업 open > $layer > 레이어 팝업]', $layer);

    var building = this.addressFormData.bldTypNm;
    var indexOfVal = Tw.MYT_JOIN_WIRE_MODIFY_ADDRESS.BUILDING.indexOf(building);

    if ( indexOfVal !== -1 ) { // 존재할때 실행 체크
      Tw.Logger.info('[건물 유형 존재할때 실행]', indexOfVal );
      $layer.find('.chk-link-list > li').eq(indexOfVal).find('button')
        .addClass('checked')
        .find('input[type=radio]').prop('checked', true);
    }

    //팝업 속 버튼을 클릭했을 때
    $layer.on('click', '[data-target="selectBtn"]', $.proxy( function(event) {
      var $targetChild = $(event.currentTarget);
      var tempDataVal = $targetChild.attr('data-value');
      this.addressFormData.bldTypNm = tempDataVal;
      $target.text( tempDataVal );

      $layer.find('.chk-link-list li > button').removeClass('checked');
      $targetChild.addClass('checked')
        .find('input[type=radio]').prop('checked', true);
      this._popupService.close();

    }, this));

  },
  select_buildingEvtClose: function() {
    Tw.Logger.info('[팝업 close > select_buildingEvtClose]');
    this._formValidateionChk();
    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },

  // 이사 날짜
  select_house_input_changeEvt: function () {
    Tw.Logger.info('[select_house_input_changeEvt]');

    $('#fe-err-no-movdt').hide().attr('aria-hidden', true);
    if(!this.$select_house_input.val()){
      $('#fe-err-no-movdt').show().attr('aria-hidden', false);
    }

    var tempDt = this.$select_house_input.val();

    this.$select_house_input.val( tempDt );
    this.addressFormData.mvDt = tempDt;

    this._formValidateionChk();
    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },

  // 중단 희망 날짜
  select_stop_input_changeEvt: function () {
    Tw.Logger.info('[select_stop_input_changeEvt]');

    $('#fe-err-no-stopdt').hide().attr('aria-hidden', true);
    if(!this.$select_stop_input.val()){
      $('#fe-err-no-stopdt').show().attr('aria-hidden', false);
      this.addressFormData.stopPrefrDt = '';
      return;
    }

    var curDt = Tw.DateHelper.getCurrentDateTime('YYYY-MM-DD');
    var sttDt = Tw.DateHelper.getShortDateWithFormatAddByUnit(curDt, 1, 'day', 'YYYY-MM-DD', 'YYYY-MM-DD');
    var tempDt = this.$select_stop_input.val();
    tempDt = (tempDt < sttDt ? sttDt : tempDt);

    this.$select_stop_input.val( tempDt );
    this.addressFormData.stopPrefrDt = tempDt;

    this._formValidateionChk();
    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },

  // 설치 희망 날짜
  select_install_input_changeEvt: function () {
    // Tw.Logger.info('[select_install_input_changeEvt]');

    $('#fe-err-no-instdt').hide().attr('aria-hidden', true);
    if(!this.$select_install_input.val()){
      $('#fe-err-no-instdt').show().attr('aria-hidden', false);
      this.addressFormData.setPrefrDt = '';
      return;
    }

    var curDt = Tw.DateHelper.getCurrentDateTime('YYYY-MM-DD');
    var sttDt = Tw.DateHelper.getShortDateWithFormatAddByUnit(curDt, 1, 'day', 'YYYY-MM-DD', 'YYYY-MM-DD');
    var endDt = Tw.DateHelper.getShortDateWithFormatAddByUnit(curDt, 14, 'day', 'YYYY-MM-DD', 'YYYY-MM-DD');
    var tempDt = this.$select_install_input.val();
    Tw.Logger.info('[설치희망날짜]', tempDt, sttDt, endDt);

    // 범위에포함되야함?
    this.$select_install_input.val( tempDt );
    this.addressFormData.setPrefrDt = tempDt;

    //유효성 체크
    if ( this._dateChkBetween(tempDt, sttDt, endDt) ) {
      Tw.Logger.info('[범위에 포함]');
      this.$select_install_input.val( tempDt );
      this.addressFormData.setPrefrDt = tempDt;

    } else {
      Tw.Logger.info('[범위에 포함 안됨!!]', this.$select_install_input);
      tempDt = (tempDt > endDt ? endDt : sttDt);
      this.$select_install_input.val(tempDt);
      this.addressFormData.setPrefrDt = tempDt;
    }

    this._formValidateionChk();
    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },
  // 우편번호 찾기
  _addr_search_clickEvt: function(event){
    new Tw.CommonPostcodeMain(this.$container, $(event.target), $.proxy(this._addr_search_success_callback, this));
  },
  // 주소 - 우편번호 찾기 완료 시
  _addr_search_success_callback: function(resp){
    if(!resp || !resp.main) return;
    $('.fe-zip', this.$container).val(resp.zip);
    $('.fe-main-address', this.$container).val(resp.main);
    $('.fe-detail-address', this.$container).val(resp.detail);
    this.addressFormData.zip     = resp.zip;
    this.addressFormData.basAddr = resp.main;
    this.addressFormData.dtlAddr = resp.detail;
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

    var tempObj = this.addressFormData;

    try {
      _.map(tempObj, function( item, key ) {

        Tw.Logger.info('[ addressFormData > _.map > '+ key +']', item, Tw.FormatHelper.isEmpty(item));

        if ( key !== 'cntcPrefrPhonNum' ) { //일반전화가 아닐때
          if ( key === 'cntcPrefrMblPhonNum' ) { // 휴대폰
            if(!Tw.ValidationHelper.isCellPhone($('[data-target="input_hp"]').val())){  //
              throw new Error('break');
            }
          } else {
            if ( Tw.FormatHelper.isEmpty(item) ) {
              Tw.Logger.info('[값을 입력하세요.]', key);
              throw new Error('break');
            }
          }

        }

        if( key === 'basAddr' && item !== $('.fe-main-address', this.$container).val()){
          throw new Error('break');
        }

      });

    } catch(e) {
      if(e.message === 'break'){
        //break successful
        Tw.Logger.info('[catch > break]', e);
        this.$submitApply.attr('disabled', true);
        return;
      }
    }

    Tw.Logger.info('[유효성 체크 완료]');

    this.$submitApply.attr('disabled', false);


  },

  //--------------------------------------------------------------------------[API]
  _chgWireAddrInfo: function (param) {
    Tw.CommonHelper.startLoading('.container', 'grey');

    return this._apiService.request(Tw.API_CMD.BFF_05_0163, param)
      .done($.proxy(this._chgWireAddrInfoInit, this))
      .fail(function (err) {
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });
  },
  _chgWireAddrInfoInit: function (res) {
    Tw.CommonHelper.endLoading('.container');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('[결과] _chgWireAddrInfoInit', res);
      // 성공시 2_A35 alert 노출
      // 설치장소 변경 신청이 완료되었습니다. 빠른 시일 내에 신청내역 확인을 위해 상담원이 연락 드리겠습니다. 감사합니다
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