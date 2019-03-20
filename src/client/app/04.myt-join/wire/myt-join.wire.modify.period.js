/**
 * FileName: myt-join.wire.modify.period.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 10. 19.
 */

Tw.MyTJoinWireModifyPeriod = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');

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
    // this.$container.on('click', '.fe-btn-back', $.proxy(this._onClickBtnBack, this));
  },

  _init: function () {
    if ( this._options.isBroadbandJoined === 'Y' ) {
      (new Tw.MyTJoinCommon()).openSkbdAlertOnInit(this._historyService);
    }
    this._periodPopupTplList = Tw.POPUP_TPL.MYT_JOIN_WIRE_MODIFY_PERIOD[0].list;
    this._phonePopupTplList = this._PHONE_NUMS[0].list;

    // this._setSelectPopup(this._periodPopupTplList, this._options.beforeTerm);
  },

  _getPeriodTermCnt: function (term) {
    return _.find(this._periodPopupTplList, {
      value: term
    }).cnt;
  },

  _setSelectPopup: function (list, term) {
    _.each(list, function (item) {
      item.option = item.value === term ? 'checked' : '';
    });
  },

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

  _selectPeriod: function (term) {
    this._$btnSelectPeriod.text(term);
    this._selectedTerm = term;
  },

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

  _loadingPopupOpenCallback: function () {
    this._loadingPopupOpened = true;
  },

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

  _hideLoadingPopup: function () {
    if ( this._loadingPopupOpened ) {
      this._popupService.close();
      this._loadingPopupOpened = false;
    }
  },

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

  _telSelectPopupOpenCallback: function ($container) {
    $container.find('li button').click($.proxy(function (event) {
      var $target = $(event.currentTarget);
      var text = $.trim($target.text());
      this._setSelectPopup(this._telPopupTplList, text);
      this._$feTel1.text(text);
      this._$feTel1.data('tel', $target.data('tel'));
      this._popupService.close();
      // this._isDirty = true;
    }, this));
  },

  _reqAgreementsPenalty: function () {
    this._showLoadingPopup();
    this._apiService.request(Tw.API_CMD.BFF_05_0141, {
      'requestCnt': this._intervalCnt
    }).done($.proxy(this._reqAgreementsPenaltyDone, this))
      .fail($.proxy(this._reqAgreementsPenaltyError, this));
  },

  _reqAgreementsPenaltyDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( this._intervalCnt <= 0 ) {
        ++this._intervalCnt;
        window.setTimeout($.proxy(this._reqAgreementsPenalty, this), this._REQUEST_INTERVAL_TIME);
      } else {
        var result = resp.result;
        if ( !result ) {
          this._popupService.openAlert(resp.msg, resp.code, null, $.proxy(this._openAlertCloseCallback, this));
          return;
        }
        // result.useMthCnt = '';
        if ( Tw.FormatHelper.isEmpty(result.useMthCnt) ) {
          if ( this._intervalCnt === this._MAXSIMUM_INTERVAL_CNT ) {
            window.setTimeout($.proxy(this._reqAgreementsPenaltyError, this), this._REQUEST_INTERVAL_TIME);
          } else {
            ++this._intervalCnt;
            window.setTimeout($.proxy(this._reqAgreementsPenalty, this), this._REQUEST_INTERVAL_TIME);
          }
        } else {
          window.setTimeout($.proxy(this._reqAgreementsPenaltySuccess, this, resp.result), this._REQUEST_INTERVAL_TIME);
        }
      }
    } else {
      this._popupService.openAlert(resp.msg, resp.code, null, $.proxy(this._openAlertCloseCallback, this));
    }
  },

  _openAlertCloseCallback: function () {
    this._hideLoadingPopup();
  },

  _reqAgreementsPenaltyError: function () {
    this._intervalCnt = 0;
    this._agreementsPenaltyError = true;
    this._hideLoadingPopup();
  },

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

  _getCellphoneNumber: function () {
    return this._$fePhone1.data('phone') + '-' + this._$fePhone2.val() + '-' + this._$fePhone3.val();
  },

  _getTelNumber: function () {
    var tel = this._$feTel1.data('tel') + '-' + this._$feTel2.val() + '-' + this._$feTel3.val();
    var isValidTel = Tw.ValidationHelper.isTelephone(tel);
    return isValidTel ? tel : '';
  },

  _setRequestBtnStatus: function () {
    var isValidCellPhone = Tw.ValidationHelper.isCellPhone(this._getCellphoneNumber());
    var propDisabled = (!!this._selectedTerm && isValidCellPhone) ? false : true;
    this._$btnRequest.prop('disabled', propDisabled);
    // this._setErrTxtStatus(isValidCellPhone);
  },

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

  _onClickBtnSelectPeriod: function () {
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

  _onClickBtnRequest: function () {
    if ( this._options.grpProdYn === 'Y' ) {
      this._popupService.openAlert(Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ALERT['2_A37']);
      return;
    }
    this._showPreview(2);
  },

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
    this._apiService.request(Tw.API_CMD.BFF_05_0142, reqParams)
      .done($.proxy(this._reqAgreementsSubmitDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  _onClickPhone1: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ACTION_SHEET_TITLE.CELL_PHONE,
      data: this._PHONE_NUMS
    }, $.proxy(this._phoneSelectPopupOpenCallback, this));
  },

  _onClickTel1: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ACTION_SHEET_TITLE.TEL,
      data: this._TEL_NUMS
    }, $.proxy(this._telSelectPopupOpenCallback, this));
  },

  _onKeyupInputPhone: function (event) {
    this._phoneNum = $(event.currentTarget).val();
    this._setRequestBtnStatus();
  },

  _reqAgreementsSubmitDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL(this._URL.COMPLETE);
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  _reqFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },

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

