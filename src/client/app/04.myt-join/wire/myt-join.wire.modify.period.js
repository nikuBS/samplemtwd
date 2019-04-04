/**
 * MenuName: 나의가입정보(인터넷/집전화/IPTV) > 약정기간 변경
 * @file myt-join.wire.modify.period.js
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018. 10. 19.
 * Summary: 유선 약정기간 변경
 */

Tw.MyTJoinWireModifyPeriod = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-btn-request'));

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTJoinWireModifyPeriod.prototype = {
  _URL: {
    MAIN: '/myt-join/submain',
    COMPLETE: '/myt-join/submain/wire/modifyperiod/complete'
  },
  _LOADING_POPUP_HBS: 'MS_04_06_L01',
  _MAXSIMUM_INTERVAL_CNT: 2,          // 결과조회 최대 호출 카운트
  _REQUEST_INTERVAL_TIME: 5000,       // 호출 대기 시간(5초)
  _PHONE_NUMS: [
    {
      list: [
        { value: '010', attr: 'data-phone="010"' },
        { value: '011', attr: 'data-phone="011"' },
        { value: '016', attr: 'data-phone="016"' },
        { value: '017', attr: 'data-phone="017"' },
        { value: '018', attr: 'data-phone="018"' },
        { value: '019', attr: 'data-phone="019"' }
      ]
    }
  ],
  _TEL_NUMS: [
    {
      list: [
        { value: '02', attr: 'data-tel="02"' },
        { value: '031', attr: 'data-tel="031"' },
        { value: '032', attr: 'data-tel="032"' },
        { value: '033', attr: 'data-tel="033"' },
        { value: '041', attr: 'data-tel="041"' },
        { value: '042', attr: 'data-tel="042"' },
        { value: '043', attr: 'data-tel="043"' },
        { value: '044', attr: 'data-tel="044"' },
        { value: '051', attr: 'data-tel="051"' },
        { value: '052', attr: 'data-tel="052"' },
        { value: '053', attr: 'data-tel="053"' },
        { value: '054', attr: 'data-tel="054"' },
        { value: '055', attr: 'data-tel="055"' },
        { value: '061', attr: 'data-tel="061"' },
        { value: '062', attr: 'data-tel="062"' },
        { value: '063', attr: 'data-tel="063"' },
        { value: '064', attr: 'data-tel="064"' },
        { value: '070', attr: 'data-tel="070"' },
        { value: '0502', attr: 'data-tel="0502"' },
        { value: '0504', attr: 'data-tel="0504"' },
        { value: '0505', attr: 'data-tel="0505"' },
        { value: '0506', attr: 'data-tel="0506"' }
      ]
    }
  ],
  _intervalCnt: 0,
  _periodSelectPopupOpened: false,
  _loadingPopupOpened: false,
  _agreementsPenaltyError: false,
  _periodPopupTplList: null,
  _phonePopupTplList: null,
  _telPopupTplList: null,
  _clickedTerm: '',
  _selectedTerm: '',
  _phoneNum: '',
  // _isDirty: false,

  _cachedElement: function () {
    this._$main = this.$container.find('#main');
    this._$btnSelectPeriod = this._$main.find('.fe-btn-select-period');
    this._$agreementsPenaltyResult = this._$main.find('.fe-agreements-penalty-result');
    this._$useMthCnt = this._$agreementsPenaltyResult.find('.fe-use-mth-cnt');
    this._$termBrchAmt = this._$agreementsPenaltyResult.find('.fe-term-brch-amt');
    this._$fePhone1 = this._$main.find('.fe-phone1');
    this._$fePhone2 = this._$main.find('.fe-phone2');
    this._$fePhone3 = this._$main.find('.fe-phone3');
    this._$feTel1 = this._$main.find('.fe-tel1');
    this._$feTel2 = this._$main.find('.fe-tel2');
    this._$feTel3 = this._$main.find('.fe-tel3');
    this._$btnRequest = this._$main.find('.fe-btn-request');
    this._$selectPeriodErr = this._$main.find('.fe-select-period-err');
    this._$selectPhoneErr = this._$main.find('.fe-select-phone-err');

    this._$confirm = this.$container.find('#confirm');
    this._$labelPhone = this._$confirm.find('.fe-label-phone');
    this._$labelTel = this._$confirm.find('.fe-label-tel');
    this._$btnSubmit = this._$confirm.find('.fe-btn-submit');
  },

  _bindEvent: function () {
    this._$btnSelectPeriod.on('click', $.proxy(this._onClickBtnSelectPeriod, this));
    this._$btnRequest.on('click', $.proxy(this._onClickBtnRequest, this));
    this._$btnSubmit.on('click', $.proxy(this._onClickBtnSubmit, this));
    this._$fePhone1.on('click', $.proxy(this._onClickPhone1, this));
    this._$fePhone2.on('input', $.proxy(this._onKeyupInputPhone, this));
    this._$fePhone3.on('input', $.proxy(this._onKeyupInputPhone, this));
    this._$feTel1.on('click', $.proxy(this._onClickTel1, this));
    this._$feTel2.on('input', $.proxy(this._onKeyupInputPhone, this));
    this._$feTel3.on('input', $.proxy(this._onKeyupInputPhone, this));
    // this.$container.on('click', '.fe-btn-back', $.proxy(this._onClickBtnBack, this));
  },

  _init: function () {
    // SK브로드밴드 가입자의 경우 얼럿 && 화면 진입안됨
    if ( this._options.isBroadbandJoined === 'Y' ) {
      (new Tw.MyTJoinCommon()).openSkbdAlertOnInit(this._historyService);
    }
    // 약정기간정보 세팅
    this._periodPopupTplList = Tw.POPUP_TPL.MYT_JOIN_WIRE_MODIFY_PERIOD[0].list;
    // 휴대폰번호 세팅
    this._phonePopupTplList = this._PHONE_NUMS[0].list;

    // this._setSelectPopup(this._periodPopupTplList, this._options.beforeTerm);
  },

  /**
   * term에 해당하는 약정정보 반환
   * @param term
   * @return {Object}
   * @private
   */
  _getPeriodTermCnt: function (term) {
    return _.find(this._periodPopupTplList, {
      value: term
    }).cnt;
  },

  /**
   * list에서 term에 해당하는 item 선택
   * @param list
   * @param term
   * @private
   */
  _setSelectPopup: function (list, term) {
    _.each(list, function (item) {
      item.option = item.value === term ? 'checked' : '';
    });
  },

  /**
   * 미리보기 출력
   * @private
   */
  _showPreview: function () {
    var telNumber = this._getTelNumber();
    if ( (this._$feTel1.data('tel') || this._$feTel2.val() || this._$feTel3.val()) &&
      Tw.FormatHelper.isEmpty(telNumber) ) {
      this._popupService.openAlert(Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ALERT.TEL_NUM_ERROR);
      return;
    }
    this._$labelPhone.text(this._getCellphoneNumber());
    this._$labelTel.text(telNumber);
    this._go('confirm');
  },

  /**
   * term에 해당하는 기간선택
   * @param term
   * @private
   */
  _selectPeriod: function (term) {
    this._$btnSelectPeriod.text(term);
    this._selectedTerm = term;
  },

  /**
   * 위약금 조회 팝업 열기
   * @private
   */
  _showLoadingPopup: function () {
    if ( this._loadingPopupOpened ) {
      return;
    }
    this._popupService.open({
      hbs: this._LOADING_POPUP_HBS,
      ico: true,
      layer: true,
      title: Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.LOADING_POPUP.TITLE,
      contents: Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.LOADING_POPUP.CONTENTS
    }, $.proxy(this._loadingPopupOpenCallback, this), $.proxy(this._loadingPopupCloseCallback, this), 'inquiring');
  },

  /**
   * 위약금 조회 팝업 열림 세팅
   * @private
   */
  _loadingPopupOpenCallback: function () {
    this._loadingPopupOpened = true;
  },

  /**
   * 위약금 조회 팝업 닫힘 callback
   * @private
   */
  _loadingPopupCloseCallback: function () {
    if ( this._agreementsPenaltyError ) {
      this._popupService.openAlert(Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ERROR_ALERT.CONTENTS,
        Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ERROR_ALERT.TITLE); //에러
      this._agreementsPenaltyError = false;
    } else {
      if ( this._periodSelectPopupOpened ) {
        this._popupService.close();
      }
    }
  },

  /**
   * 위약금 조회 팝업 닫기
   * @private
   */
  _hideLoadingPopup: function () {
    if ( this._loadingPopupOpened ) {
      this._popupService.close();
      this._loadingPopupOpened = false;
    }
  },

  /**
   * 기간선택 액션시트 오픈시 호출
   * @param $container
   * @private
   */
  _periodSelectPopupOpenCallback: function ($container) {
    this._periodSelectPopupOpened = true;
    $container.find('li button').click($.proxy(function (event) {
      this._clickedTerm = $.trim($(event.currentTarget).text());
      this._reqAgreementsPenalty();
    }, this));
  },

  _periodSelectPopupCloseCallback: function () {
    this._periodSelectPopupOpened = false;
  },

  /**
   * 휴대폰 선택 액션시트 오픈시 호출
   * @param $container
   * @private
   */
  _phoneSelectPopupOpenCallback: function ($container) {
    $container.find('li button').click($.proxy(function (event) {
      var $target = $(event.currentTarget);
      var text = $.trim($target.text());
      this._setSelectPopup(this._phonePopupTplList, text);
      this._$fePhone1.text(text);
      this._$fePhone1.data('phone', $target.data('phone'));
      this._popupService.close();
      this._setRequestBtnStatus();
      // this._isDirty = true;
    }, this));
  },

  /**
   * 일반전화 선택 액션시트 오픈시 호출
   * @param $container
   * @private
   */
  _telSelectPopupOpenCallback: function ($container) {
    $container.find('li button').click($.proxy(function (event) {
      var $target = $(event.currentTarget);
      var text = $.trim($target.text());
      this._setSelectPopup(this._telPopupTplList, text);
      this._$feTel1.text(text);
      this._$feTel1.data('tel', $target.data('tel'));
      this._popupService.close();
      this._setRequestBtnStatus();
      // this._isDirty = true;
    }, this));
  },

  /**
   * 위약금조회 api호출
   * @private
   */
  _reqAgreementsPenalty: function () {
    this._showLoadingPopup();
    this._apiService.request(Tw.API_CMD.BFF_05_0141, {
      'requestCnt': this._intervalCnt
    }).done($.proxy(this._reqAgreementsPenaltyDone, this))
      .fail($.proxy(this._reqAgreementsPenaltyError, this));
  },

  /**
   * 위약금조회 성공시 호출
   * @param resp
   * @private
   */
  _reqAgreementsPenaltyDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      // 처음 요청
      if ( this._intervalCnt <= 0 ) {
        ++this._intervalCnt;
        // 5초 대기후 재요청
        window.setTimeout($.proxy(this._reqAgreementsPenalty, this), this._REQUEST_INTERVAL_TIME);
      } else {
        var result = resp.result;
        // 에러
        if ( !result ) {
          this._popupService.openAlert(resp.msg, resp.code, null, $.proxy(this._openAlertCloseCallback, this));
          return;
        }
        // result.useMthCnt 값이 없으면
        if ( Tw.FormatHelper.isEmpty(result.useMthCnt) ) {
          // 마지막 요청이면 에러 얼럿
          if ( this._intervalCnt === this._MAXSIMUM_INTERVAL_CNT ) {
            window.setTimeout($.proxy(this._reqAgreementsPenaltyError, this), this._REQUEST_INTERVAL_TIME);
          } else {
            // 두번째 요청 이면 경우 5초 대기후 재요청
            ++this._intervalCnt;
            window.setTimeout($.proxy(this._reqAgreementsPenalty, this), this._REQUEST_INTERVAL_TIME);
          }
        } else {
          // result.useMthCnt값이 있으면 성공
          window.setTimeout($.proxy(this._reqAgreementsPenaltySuccess, this, resp.result), this._REQUEST_INTERVAL_TIME);
        }
      }
    } else {
      this._popupService.openAlert(resp.msg, resp.code, null, $.proxy(this._openAlertCloseCallback, this));
    }
  },

  /**
   * 에러얼럿 닫을때 호출
   * @private
   */
  _openAlertCloseCallback: function () {
    this._hideLoadingPopup();
  },

  /**
   * 위약금 조회 요청 실패시 호출
   * @private
   */
  _reqAgreementsPenaltyError: function () {
    this._intervalCnt = 0;
    this._agreementsPenaltyError = true;
    this._hideLoadingPopup();
  },

  /**
   * 위약금 조회 요청 성공시 호출 - 위약금 정보 출력
   * @param agreementsPenalty
   * @private
   */
  _reqAgreementsPenaltySuccess: function (agreementsPenalty) {
    this._setSelectPopup(this._periodPopupTplList, this._clickedTerm);
    this._selectPeriod(this._clickedTerm);
    var beforeCnt = this._getPeriodTermCnt(this._options.beforeTerm);
    var selectedCnt = this._getPeriodTermCnt(this._selectedTerm);
    var termBrchAmt = (selectedCnt >= beforeCnt) ? '0' : agreementsPenalty.termBrchAmt;
    this._intervalCnt = 0;
    this._hideLoadingPopup();
    this._$useMthCnt.text(agreementsPenalty.useMthCnt);
    this._$termBrchAmt.text(Tw.FormatHelper.addComma(termBrchAmt));
    this._$agreementsPenaltyResult.show();
    this._setRequestBtnStatus();
    // this._isDirty = true;
  },

  /**
   * 입력받은 휴대폰번호 반환
   * @return xxx-xxxx-xxxx (String)
   * @private
   */
  _getCellphoneNumber: function () {
    return this._$fePhone1.data('phone') + '-' + this._$fePhone2.val() + '-' + this._$fePhone3.val();
  },

  /**
   * 입력받은 일반전화 번호 반환
   * @return xx-xxxx-xxxx (String)
   * @private
   */
  _getTelNumber: function () {
    var tel = this._$feTel1.data('tel') + '-' + this._$feTel2.val() + '-' + this._$feTel3.val();
    var isValidTel = Tw.ValidationHelper.isTelephone(tel);
    return isValidTel ? tel : '';
  },

  /**
   * 신청하기 버튼 선택가능 상태 변경
   * @return xx-xxxx-xxxx (String)
   * @private
   */
  _setRequestBtnStatus: function () {
    var isValidCellPhone = Tw.ValidationHelper.isCellPhone(this._getCellphoneNumber());
    var propDisabled = (!!this._selectedTerm && isValidCellPhone) ? false : true;
    this._$btnRequest.prop('disabled', propDisabled);
    this._setErrTxtStatus(isValidCellPhone);
  },

  /**
   * 유효성 에러 텍스트 노출
   * @param isValidCellPhone
   * @private
   */
  _setErrTxtStatus: function(isValidCellPhone) {
    if (isValidCellPhone) {
      this._$selectPhoneErr.hide();
    } else {
      this._$selectPhoneErr.show();
    }
    if (this._selectedTerm) {
      this._$selectPeriodErr.hide();
    } else {
      this._$selectPeriodErr.show();
    }
  },

  /**
   * 기간선택 버튼 클릭 시 호출
   * @private
   */
  _onClickBtnSelectPeriod: function () {
    // 스마트 다이렉트 인 경우 중단
    if ( this._options.smartDirectYn === 'Y' ) {
      this._popupService.openAlert(Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ALERT['2_A67']);
      return;
    }
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',// hbs의 파일명
      layer: true,
      title: Tw.POPUP_TITLE.AGREED_PERIOD,
      data: Tw.POPUP_TPL.MYT_JOIN_WIRE_MODIFY_PERIOD
    }, $.proxy(this._periodSelectPopupOpenCallback, this), $.proxy(this._periodSelectPopupCloseCallback, this), 'selectperiod');
  },

  /**
   * 신청하기 버튼 클릭 시 호출 - 미리보기 출력
   * @private
   */
  _onClickBtnRequest: function () {
    // 세트 상품인 경우 중단
    if ( this._options.grpProdYn === 'Y' ) {
      this._popupService.openAlert(Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ALERT['2_A37']);
      return;
    }
    this._showPreview(2);
  },

  /**
   * 신청완료 버튼 클릭 시 호출
   * @private
   */
  _onClickBtnSubmit: function () {
    var reqParams = {
      'beforeTerm': this._options.beforeTerm,
      'dcNm': this._options.dcNm,
      'termEndDt': this._options.termEndDt,
      'afterTerm': this._selectedTerm
    };
    var phoneNum = this._$labelPhone.text();
    var telNum = this._$labelTel.text();
    if ( !Tw.FormatHelper.isEmpty(phoneNum) ) {
      reqParams.phoneNum = phoneNum;
    }
    if ( !Tw.FormatHelper.isEmpty(telNum) ) {
      reqParams.normalNum = telNum;
    }
    // 유선 약정기간변경 api호출
    this._apiService.request(Tw.API_CMD.BFF_05_0142, reqParams)
      .done($.proxy(this._reqAgreementsSubmitDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  /**
   * 첫번재 휴대폰번호 버튼 클릭 시 호출
   * @private
   */
  _onClickPhone1: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ACTION_SHEET_TITLE.CELL_PHONE,
      data: this._PHONE_NUMS
    }, $.proxy(this._phoneSelectPopupOpenCallback, this));
  },

  /**
   * 첫번재 일반전화번호 버튼 클릭 시 호출
   * @private
   */
  _onClickTel1: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ACTION_SHEET_TITLE.TEL,
      data: this._TEL_NUMS
    }, $.proxy(this._telSelectPopupOpenCallback, this));
  },

  /**
   * 전화번호 input에 keyup이벤트 발생시 호출
   * @param event
   * @private
   */
  _onKeyupInputPhone: function (event) {
    this._phoneNum = $(event.currentTarget).val();
    this._setRequestBtnStatus();
  },

  /**
   * 유선 약정기간변경 완료 성공
   * @param resp
   * @private
   */
  _reqAgreementsSubmitDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL(this._URL.COMPLETE);
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  /**
   * 유선 약정기간변경 완료 실패
   * @param err
   * @private
   */
  _reqFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },

  /**
   * hash변경
   * @param hash
   * @private
   */
  _go: function (hash) {
    window.location.hash = hash;
  }

  // _isDirtyFn: function() {
  //   if (this._isDirty) {
  //     return true;
  //   }
  //   if (this._$fePhone2.val() || this._$fePhone3.val() || this._$feTel2.val() || this._$feTel3.val()) {
  //     return true;
  //   }
  //   return false;
  // }

  // _onClickBtnBack: function() {
  //   if (!this._isDirtyFn()) {
  //     this._historyService.goBack();
  //     return;
  //   }
  //   this._popupService.openConfirmButton(Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG, Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
  //     $.proxy($.proxy(function () {
  //       this._popupService.close();
  //       this._historyService.goBack();
  //     }, this), this), null, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  // }

};

