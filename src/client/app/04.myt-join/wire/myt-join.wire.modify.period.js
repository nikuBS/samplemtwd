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
    MAIN: '/myt/join'
  },
  _LOADING_POPUP_HBS: 'MS_04_06_L01',
  _MAXSIMUM_INTERVAL_CNT: 2,          // 결과조회 최대 호출 카운트
  _REQUEST_INTERVAL_TIME: 5000,       // 호출 대기 시간(5초)
  _intervalCnt: 0,
  _periodSelectPopupOpened: false,
  _loadingPopupOpened: false,
  _agreementsPenaltyError: false,
  _periodPopupTplList: null,
  _clickedTerm: '',
  _selectedTerm: '',
  _phoneNum: '',

  _cachedElement: function () {
    this._$main = this.$container.find('#main');
    this._$btnSelectPeriod = this._$main.find('.fe-btn-select-period');
    this._$agreementsPenaltyResult = this._$main.find('.fe-agreements-penalty-result');
    this._$useMthCnt = this._$agreementsPenaltyResult.find('.fe-use-mth-cnt');
    this._$termBrchAmt = this._$agreementsPenaltyResult.find('.fe-term-brch-amt');
    this._$inputPhone = this._$main.find('.fe-input-phone');
    this._$inputTel = this._$main.find('.fe-input-tel');
    this._$btnRequest = this._$main.find('.fe-btn-request');

    this._$step1 = this.$container.find('#step1');
    this._$labelPhone = this._$step1.find('.fe-label-phone');
    this._$labelTel = this._$step1.find('.fe-label-tel');
    this._$btnSubmit = this._$step1.find('.fe-btn-submit');
  },

  _bindEvent: function () {
    this._$btnSelectPeriod.on('click', $.proxy(this._onClickBtnSelectPeriod, this));
    this._$btnRequest.on('click', $.proxy(this._onClickBtnRequest, this));
    this._$btnSubmit.on('click', $.proxy(this._onClickBtnSubmit, this));
    this._$inputPhone.on('keyup', $.proxy(this._onKeyupInputPhone, this));
  },

  _init: function () {
    this._periodPopupTplList = Tw.POPUP_TPL.MYT_JOIN_WIRE_MODIFY_PERIOD[0].list;
    this._setPeriodSelectPopup(this._options.beforeTerm);
  },

  _getPeriodTermCnt: function (term) {
    return _.find(this._periodPopupTplList, {
      value: term
    }).cnt;
  },

  _setPeriodSelectPopup: function (term) {
    _.each(this._periodPopupTplList, function (item) {
      item.option = item.value === term ? 'checked' : '';
    });
  },

  _showPreview: function () {
    var phoneWithDash = this._getFormattedNumber(this._$inputPhone.val());
    var telWithDash = this._getFormattedNumber(this._$inputTel.val());
    this._$labelPhone.text(phoneWithDash);
    this._$labelTel.text(telWithDash);
    this._go('step1');
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
    }, $.proxy(this._loadingPopupOpenCallback, this), $.proxy(this._loadingPopupCloseCallback, this));
  },

  _loadingPopupOpenCallback: function() {
    this._loadingPopupOpened = true;
  },

  _loadingPopupCloseCallback: function() {
    if ( this._agreementsPenaltyError ) {
      this._popupService.openAlert(Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ERROR_ALERT.CONTENTS,
        Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ERROR_ALERT.TITLE, Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.ERROR_ALERT.BT_NAME); //에러
      this._agreementsPenaltyError = false;
    } else {
      if (this._periodSelectPopupOpened) {
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

  _periodSelectPopupCloseCallback: function() {
    this._periodSelectPopupOpened = false;
  },

  _reqAgreementsPenalty: function () {
    this._showLoadingPopup();
    this._apiService.request(Tw.API_CMD.BFF_05_0141, {
      'requestCnt': this._intervalCnt
    }).done($.proxy(this._reqAgreementsPenaltyDone, this))
      .fail($.proxy(this._reqFail, this));
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

  _openAlertCloseCallback: function() {
    this._hideLoadingPopup();
  },

  _reqAgreementsPenaltyError: function () {
    this._intervalCnt = 0;
    this._agreementsPenaltyError = true;
    this._hideLoadingPopup();
  },

  _reqAgreementsPenaltySuccess: function (agreementsPenalty) {
    this._setPeriodSelectPopup(this._clickedTerm);
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
  },

  _getFormattedNumber: function (tel) {
    return tel.replace(/(^02.{0}|^01.{1}|[0-9*]{3})([0-9*]+)([0-9*]{4})/, '$1-$2-$3');
  },

  _setRequestBtnStatus: function () {
    var propDisabled = (!!this._selectedTerm && !!this._phoneNum) ? false : true;
    this._$btnRequest.prop('disabled', propDisabled);
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
    }, $.proxy(this._periodSelectPopupOpenCallback, this), $.proxy(this._periodSelectPopupCloseCallback, this));
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

  _onKeyupInputPhone: function (event) {
    this._phoneNum = $(event.currentTarget).val();
    this._setRequestBtnStatus();
  },

  _reqAgreementsSubmitDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      // 나의 가입정보 메인[MS]이동 후 토스트
      // Tw.CommonHelper.toast(Tw.MYT_JOIN_WIRE_MODIFY_PERIOD.TOAST);
      // this._historyService.replaceURL(this._URL.MAIN);
      // TODO: 완료 팝업
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  _go: function (hash) {
    window.location.hash = hash;
  }

};

