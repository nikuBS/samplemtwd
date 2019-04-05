/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV B끼리 무료 통화 대상자 조회(MS_04_02)
 * FileName: myt-join.wire.feeCallCheck.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.10.15
 * Summary: B끼리 무료 통화 대상자 조회
 */
Tw.MyTJoinWireFreeCallCheck = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);

  this._init();

};

Tw.MyTJoinWireFreeCallCheck.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();


  },
  /**
   * element cache
   * @private
   */
  _cachedElement: function () {
    // this.$entryTpl = $('#fe-entryTpl');
    this.$inputPhone = $('[data-target="inputPhone"]');
    this.$lookupBtn = $('[data-target="lookupBtn"]');

  },
  /**
   * event bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('keyup', '[data-target="inputPhone"]', $.proxy(this._onFormatHpNum, this));
    this.$container.on('focusout', '[data-target="inputPhone"]', $.proxy(this._onFocusoutFormatHpNum, this));
    this.$container.on('click', '[data-target="lookupBtn"]', $.proxy(this._lookupBtnEvt, this));

    this.$container.on('click', '.prev-step', $.proxy(this._closeCheck, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  /**
   * close 버튼 클릭시
   * 입력대상 체크(주석처리)
   * @private
   */
  _closeCheck: function(){
    this._history.goLoad('/myt-join/submain');

    //if($('[data-target="inputPhone"]').val()) {
    //
    //  this._popupService.openConfirm(
    //    Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
    //    Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
    //    $.proxy(function(){
    //      this._history.goLoad('/myt-join/submain');
    //    }, this));
    //} else {
    //  this._history.goBack();
    //}
  },

  /**
   * 조회버튼 클릭 -> 조회
   * @param event
   * @private
   */
  _lookupBtnEvt: function(event) {
    Tw.Logger.info('[_lookupBtnEvt]', this.$inputPhone.val(), event );
    // var $target = $(event.currentTarget);
    var phoneNm = this._vdPhoneNm( this.$inputPhone.val() );
    if(!phoneNm) {
      return;
    }
    var phoneNmArr = phoneNm.split('-');
    Tw.Logger.info('[phoneNmArr]', phoneNmArr);
    var param = {
      tel01: phoneNmArr[0],
      tel02: phoneNmArr[1],
      tel03: phoneNmArr[2]
    };
    this._freeCallCheckInfo(param);
  },
  //--------------------------------------------------------------------------[API]
  /**
   * 무료통화 대상자 조회
   * @param param
   * @returns {*}
   * @private
   */
  _freeCallCheckInfo: function (param) {

    return this._apiService.request(Tw.API_CMD.BFF_05_0160, param).done($.proxy(this._freeCallCheckInfoInit, this));

    // var thisMain = this;
    // $.ajax('http://localhost:3000/mock/wire.BFF_05_0160.json')
    //   .done(function (resp) {
    //     Tw.Logger.info(resp);
    //     thisMain._freeCallCheckInfoInit(resp);
    //   })
    //   .fail(function (err) {
    //     Tw.Logger.info(err);
    //   });

  },
  /**
   * 무료통화대상자 조회 결과 처리
   * @param res
   * @private
   */
  _freeCallCheckInfoInit: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('[결과] _freeCallCheckInfoInit', res);

      // freeCallYn : "Y", noChargeYn : "Y" 중 하나라도 "N"이 나오면 해당 문구를 보여줘야한다.
      if (res.result.freeCallYn === 'N' || res.result.noChargeYn === 'N') {
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A80.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A80.TITLE);

      } else {

        this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A201.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A201.TITLE);
      }
    }
  },
  //--------------------------------------------------------------------------[SVC]
  _resultTextAreaView: function() {

  },
  //--------------------------------------------------------------------------[Validation]
  _vdPhoneNm:function( $phoneNm ) {
    Tw.Logger.info('[휴대폰 유효성 체크]', $phoneNm);
    $('#fe-err-no-phonenum').hide().attr('aria-hidden', true);
    $('#fe-err-not-phonenum').hide().attr('aria-hidden', true);

    var phoneNm = $phoneNm;

    if(!phoneNm){
      $('#fe-err-no-phonenum').show().attr('aria-hidden', false);
      return;
    }

    if(!Tw.ValidationHelper.isCellPhone(phoneNm) && !Tw.ValidationHelper.isTelephone(phoneNm)){
      // this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V9);
      $('#fe-err-not-phonenum').show().attr('aria-hidden', false);
      //this._popupService.openAlert(Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ALERT.TEL_NUM_ERROR);
      return;
    }
    // phoneNm = this._noDash( phoneNm ); // 대시 삭제
    Tw.Logger.info('[휴대폰 유효성 체크 결과]', phoneNm);
    return phoneNm;
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

    if(_$this.val()){
      $('#fe-err-no-phonenum').hide().attr('aria-hidden', true);
      $('#fe-err-not-phonenum').hide().attr('aria-hidden', true);
    }

    var data = this._noDash(_$this.val());
    var returnVal;

    //숫자,대시를 제외한 값이 들어 같을 경우
    if ( Tw.ValidationHelper.regExpTest(/[^\d-]/g, data) ) {
      returnVal = data.replace(/[^\d-]/g, ''); // 숫자가 아닌 문자 제거
      Tw.Logger.info('[returnVal 1]', returnVal);
      _$this.val(returnVal);

    } else {
      var rexTypeA = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/g;
      returnVal = data.replace(rexTypeA, '$1-$2-$3');
      Tw.Logger.info('[returnVal 2]', returnVal);
      _$this.val(returnVal);
    }

  },

  _onFocusoutFormatHpNum: function() {
    this._vdPhoneNm( this.$inputPhone.val() );
  }

};