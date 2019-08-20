/**
 * @file myt-data.prepaid.voice.js
 * @desc 선불폰 음성 1회 충전
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.11.14
 */

/**
 * @namespace
 * @desc 선불폰 음성 1회 충전 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTDataPrepaidVoice = function (rootEl, skpayInfo) {
  this.$container = rootEl;
  this.skpayInfo = (skpayInfo) ? skpayInfo.skpayInfo : undefined;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();
  this._backAlert = new Tw.BackAlert(rootEl, true);
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-request:visible'));

  this._cachedElement();
  this._init();
};

Tw.MyTDataPrepaidVoice.prototype = {
  /**
   * @function
   * @desc 변수 초기화
   */
  _cachedElement: function () {
    this.$wrapExampleCard = this.$container.find('.fe-wrap-example-card');
    this.$btnRequestCreditCard = this.$container.find('.fe-request-credit-card');
    this.$btnRequestPrepaidCard = this.$container.find('.fe-request-prepaid-card');
    this.$btnRequestSKpay = this.$container.find('.fe-request-skpay');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPwd = this.$container.find('.fe-card-pw');
    this.$prepaid_card = this.$container.find('.fe-prepaid-card');
    this.$prepaid_serial = this.$container.find('.fe-prepaid-serial');
    this.$creditAmount = this.$container.find('.fe-select-amount');
    this.$skpayAmount = this.$container.find('.fe-select-amount-skpay');
  },

  /**
   * @function
   * @desc get pps info and get email address
   */
  _init: function () {
    this._getPpsInfo();
    this._getEmailAddress();
  },

  /**
   * @function
   * @desc PPS info API 호출
   */
  _getPpsInfo: function () {
    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_05_0013, {})
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },

  /**
   * @function
   * @desc PPS info API 응답 처리 (성공)
   * @param res
   */
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._bindEvent();
      this._setData(res.result);
    } else {
      this._getFail(res);
    }
  },

  /**
   * @function
   * @desc PPS info API 응답 처리 (실패)
   * @param err
   */
  _getFail: function (err) {
    Tw.CommonHelper.endLoading('.popup-page');
    Tw.Error(err.code, err.msg).replacePage();
  },

  /**
   * @function
   * @desc email address API 호출
   */
  _getEmailAddress: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0061, {})
      .done($.proxy(this._emailSuccess, this))
      .fail($.proxy(this._emailFail, this));
  },

  /**
   * @function
   * @desc email address API 응답 처리 (성공)
   * @param res
   */
  _emailSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$emailAddress = res.result.email;
    } else {
      this._emailFail();
    }
  },

  /**
   * @function
   * @desc email address API 응답 처리 (실패)
   * @param err
   */
  _emailFail: function () {
    this.$emailAddress = '';
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-tab-wrap > li', $.proxy(this._changeTab, this));
    this.$container.on('click', '.fe-popup-close', $.proxy(this._stepBack, this));
    this.$container.on('click', '.fe-close-example-card', $.proxy(this._onCloseExampleCard, this));
    this.$container.on('click', '.fe-btn-show-example', $.proxy(this._onShowExampleCard, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowSelectAmount, this));
    this.$container.on('click', '.fe-select-amount-skpay', $.proxy(this._onShowSelectAmount, this));
    this.$container.on('click', '.fe-request-prepaid-card', $.proxy(this._requestPrepaidCard, this));
    this.$container.on('click', '.fe-request-credit-card', $.proxy(this._validateCreditCard, this));
    this.$container.on('click', '.fe-request-skpay', $.proxy(this._skpayPopDetail, this));
    this.$container.on('click', '.fe-prepaid-voice-cancel', $.proxy(this._closePrepaidPopup, this));
    this.$container.on('click', '.fe-prepaid-complete', $.proxy(this._requestCreditCard, this));
    this.$container.on('click', '.fe-skpay-complete', $.proxy(this._requestSKpay, this));
    this.$container.on('change input blur click', '#tab1-tab [required]', $.proxy(this._checkSkpayIsAbled, this));
    this.$container.on('change input blur click', '#tab2-tab [required]', $.proxy(this._validatePrepaidCard, this));
    this.$container.on('change input blur click', '#tab3-tab [required]', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', 'input[type=tel]', $.proxy(this._checkMaxLength, this));
    this.$cardNumber.on('keyup blur', $.proxy(this._validateCard, this));
    this.$cardY.on('keyup blur', $.proxy(this._validateExpired, this));
    this.$cardM.on('keyup blur', $.proxy(this._validateExpired, this));
    this.$cardPwd.on('keyup blur', $.proxy(this._validatePwd, this));
    this.$prepaid_card.on('keyup blur', $.proxy(this._validatePrepaidNumber, this));
    this.$prepaid_serial.on('keyup blur', $.proxy(this._validatePrepaidSerial, this));
  },

  /**
   * @function
   * @desc tab change (SK pay/선불카드/신용카드)
   * @param event
   */
  _changeTab: function (event) {
    var $target = $(event.currentTarget);
    $target.find('a').attr('aria-selected', 'true');
    $target.siblings().find('a').attr('aria-selected', 'false');

    if ($target.attr('id') === 'tab1') {
      this.$container.find('.fe-tab1-btn').show();
      this.$container.find('.fe-tab2-btn').hide();
      this.$container.find('.fe-tab3-btn').hide();
    } else if ($target.attr('id') === 'tab2') {
      this.$container.find('.fe-tab1-btn').hide();
      this.$container.find('.fe-tab2-btn').show();
      this.$container.find('.fe-tab3-btn').hide();
    } else {
      this.$container.find('.fe-tab1-btn').hide();
      this.$container.find('.fe-tab2-btn').hide();
      this.$container.find('.fe-tab3-btn').show();
    }
  },

  /**
   * @function
   * @desc set data
   * @param result
   */
  _setData: function (result) {
    var data = 0, dataText = 0;
    if (!Tw.FormatHelper.isEmpty(result.prodAmt) && result.prodAmt !== '0') {
      data = result.prodAmt;
      dataText = Tw.FormatHelper.addComma(result.prodAmt);
    }
    this.$container.find('.fe-remain-amount').attr('data-remain-amount', data).text(dataText);

    this.$container.find('.fe-from-date').text(Tw.DateHelper.getShortDate(result.obEndDt));
    this.$container.find('.fe-to-date').text(Tw.DateHelper.getShortDate(result.inbEndDt));
    this.$container.find('.fe-remain-date').text(Tw.DateHelper.getShortDate(result.numEndDt));
  },

  /**
   * @function
   * @desc 선불카드 번호 유효성 검증
   * @param e
   */
  _validatePrepaidNumber: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( Tw.FormatHelper.isEmpty(this.$prepaid_card.val()) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
    } else if ( !this._validation.checkMoreLength(this.$prepaid_card, 10) ) {
      $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  /**
   * @function
   * @desc 선불카드 시리얼넘버 유효성 검증
   * @param e
   */
  _validatePrepaidSerial: function (e) {
    Tw.InputHelper.inputNumberAndAlphabet(e.target);

    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( Tw.FormatHelper.isEmpty(this.$prepaid_serial.val()) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
    } else if ( !this._validation.checkMoreLength(this.$prepaid_serial, 10) ) {
      $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  /**
   * @function
   * @desc 신용카드 번호 유효성 검증
   * @param e
   */
  _validateCard: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( !this._validation.checkMoreLength(this.$cardNumber, 15) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
      $($error.get(1)).addClass('blind').attr('aria-hidden', 'true');
    } else {
      this._getCardInfo();
    }

    if ( this.$cardNumber.val() === '' ) {
      $($error.get(0)).addClass('blind').attr('aria-hidden', 'true');
      $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  /**
   * @function
   * @desc 신용카드번호 앞 6자리로 카드사 조회 API 호출
   */
  _getCardInfo: function () {
    var isValid = this._validation.checkMoreLength(this.$cardNumber, 15);

    if ( isValid ) {
      var htParams = {
        cardNum: $.trim(this.$cardNumber.val()).substr(0, 6)
      };

      this._apiService.request(Tw.API_CMD.BFF_06_0065, htParams)
        .done($.proxy(this._getCardCode, this));
    }
  },

  /**
   * @function
   * @desc 신용카드번호 앞 6자리로 카드사 조회 응답 처리
   * @param res
   */
  _getCardCode: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
    } else {
      var $credit_error = this.$cardNumber.closest('li').find('.error-txt').get(2);
      $($credit_error).removeClass('blind').attr('aria-hidden', 'false');
      this.$btnRequestCreditCard.prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 유효기간 유효성 검증
   * @param e
   */
  _validateExpired: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( this.$cardY.val() === '' || this.$cardM.val() === '' ) {
      $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
    } else if ( !(this._validation.checkMoreLength(this.$cardY, 4) && this._validation.checkMoreLength(this.$cardM, 2) &&
      this._validation.checkYear(this.$cardY) && this._validation.checkMonth(this.$cardM, this.$cardY)) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  /**
   * @function
   * @desc password 유효성 검증
   * @param e
   */
  _validatePwd: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( this.$cardPwd.val() === '' ) {
      $error.removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  /**
   * @function
   * @desc maxLength 적용
   * @param e
   */
  _checkMaxLength: function (e) {
    Tw.InputHelper.inputNumberMaxLength(e.currentTarget);
  },

  /**
   * @function
   * @desc input null check 후 버튼 활성화/비활성화 처리
   */
  _checkIsAbled: function () {
    if ( this.$creditAmount.data('amount') && this.$cardNumber.val() !== '' &&
      this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPwd.val() !== '' ) {
      this.$btnRequestCreditCard.prop('disabled', false);
    } else {
      this.$btnRequestCreditCard.prop('disabled', true);
    }
  },
  /**
   * @function
   * @desc input null check 후 버튼 활성화/비활성화 처리
   */
  _checkSkpayIsAbled: function () {
    if ( this.$skpayAmount.data('amount')) {
      this.$btnRequestSKpay.prop('disabled', false);
    } else {
      this.$btnRequestSKpay.prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 신용카드번호 6자리로 카드사 정보 조회
   * @param e
   */
  _validateCreditCard: function (e) {
    var $elButton = $(e.currentTarget);
    var isValid = this._validation.checkMoreLength(this.$cardNumber, 15) &&
      this._validation.checkLength(this.$cardY.val(), 4) &&
      this._validation.checkLength(this.$cardM.val(), 2) &&
      this._validation.checkYear(this.$cardY) &&
      this._validation.checkMonth(this.$cardM, this.$cardY);

    if ( isValid ) {
      var htParams = {
        cardNum: $.trim(this.$cardNumber.val()).substr(0, 6)
      };

      this._apiService.request(Tw.API_CMD.BFF_06_0065, htParams)
        .done($.proxy(this._getCreditCardInfo, this, $elButton));
    }
  },
    /**
   * @function
   * @desc SK pay 결제 준비
   * @param e
   */
  _skpayPopDetail: function (e) {
    var $elButton = $(e.currentTarget);
    var previousAmount = Number($('.fe-remain-amount').data('remainAmount'));
    var rechargeAmount = Number($('.fe-select-amount-skpay').data('amount'));
    var afterAmount = previousAmount + rechargeAmount;
    this.amountInfo = {
      previousAmount: previousAmount,
      afterAmount: afterAmount,
      rechargeAmount: rechargeAmount
    };
    this._popupService.open({
      hbs: 'DC_09_01_02',
      layer: true,
      data: {
        previousAmount: Tw.FormatHelper.addComma(previousAmount.toString()),
        afterAmount: Tw.FormatHelper.addComma(afterAmount.toString()),
        rechargeAmount: Tw.FormatHelper.addComma(rechargeAmount.toString()),
        emailAddress: this.$emailAddress
      }
    }, null, null, null, $elButton);
  },
    /**
   * @function
   * @desc SK Pay 결제 요청
   */
  _requestSKpay: function (e) {
    if ($('.fe-sms').is(':checked')) {
      this.skpayInfo.sms = 'Y';
    } else {
      this.skpayInfo.sms = 'N';
    }
    if ($('.fe-email').is(':checked')) {
      this.skpayInfo.email = 'Y';
    } else {
      this.skpayInfo.email = 'N';
    }
    this.skpayInfo.previousAmount = Number($('.fe-remain-amount').data('remainAmount'));
    this.skpayInfo.rechargeAmount = Number($('.fe-select-amount-skpay').data('amount'));
    this.skpayInfo.afterAmount = this.skpayInfo.previousAmount + this.skpayInfo.rechargeAmount;
    new Tw.MyTDataPrepaySKPaySdk({
      $element: this.$container,
      data : {
        skpayInfo: this.skpayInfo,
        title: 'voice',
        requestSum: this.skpayInfo.rechargeAmount
      }
    }).goSkpay(e);
  },
  /**
   * @function
   * @desc 필수 input field check 및 버튼 활성화/비활성화 처리
   * @returns {boolean}
   */
  _validatePrepaidCard: function () {
    var arrValid = $.map($('#tab2-tab [required]'), function (elInput) {
      if ( $(elInput).val().length !== 0 ) {
        return true;
      }
      return false;
    });

    var isValid = !_.contains(arrValid, false);

    if ( isValid ) {
      this.$btnRequestPrepaidCard.prop('disabled', false);
    } else {
      this.$btnRequestPrepaidCard.prop('disabled', true);
    }

    return isValid;
  },

  /**
   * @function
   * @desc 선불카드 조회 API 호출
   * @param e
   */
  _requestPrepaidCard: function (e) {
    var $elButton = $(e.currentTarget);
    var htParams = {
      cardNum: $('.fe-prepaid-card').val(),
      serialNum: $('.fe-prepaid-serial').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0067, htParams)
      .done($.proxy(this._getPrepaidCardInfo, this, $elButton));
  },

  /**
   * @function
   * @desc 신용카드 충전내역 확인
   * @param $elButton
   * @param res
   */
  _getCreditCardInfo: function ($elButton, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var result = res.result;
      var previousAmount = Number($('.fe-remain-amount').data('remainAmount'));
      var rechargeAmount = Number($('.fe-select-amount').data('amount'));
      var afterAmount = previousAmount + rechargeAmount;
      this.amountInfo = {
        previousAmount: previousAmount,
        afterAmount: afterAmount,
        rechargeAmount: rechargeAmount
      };

      this._popupService.open({
        hbs: 'DC_09_01_01',
        layer: true,
        data: {
          cardNumber: this.$cardNumber.val(),
          cardCompany: result.prchsCardName,
          previousAmount: Tw.FormatHelper.addComma(previousAmount.toString()),
          afterAmount: Tw.FormatHelper.addComma(afterAmount.toString()),
          rechargeAmount: Tw.FormatHelper.addComma(rechargeAmount.toString()),
          emailAddress: this.$emailAddress
        }
      }, null, $.proxy(this._afterRecharge, this), null, $elButton);
    } else if ( res.code === 'BIL0080' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.INVALID_CARD, null, null, null, null, $elButton);
    } else {
      Tw.Error(res.code, res.msg).pop(null, $elButton);
    }
  },

  /**
   * @function
   * @desc 선불카드 충전내역 확인
   * @param $elButton
   * @param resp
   */
  _getPrepaidCardInfo: function ($elButton, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var previousAmount = Number(resp.result.curAmt);
      var rechargeAmount = Number(resp.result.cardAmt);
      var afterAmount = previousAmount + rechargeAmount;
      this.amountInfo = {
        previousAmount: previousAmount,
        afterAmount: afterAmount,
        rechargeAmount: rechargeAmount
      };

      this._popupService.open({
        hbs: 'DC_09_01_01',
        layer: true,
        data: {
          cardNumber: $('.fe-prepaid-card').val(),
          cardCompany: Tw.PREPAID_VOICE.PREPAID_CARD,
          previousAmount: Tw.FormatHelper.addComma(previousAmount.toString()),
          afterAmount: Tw.FormatHelper.addComma(afterAmount.toString()),
          rechargeAmount: Tw.FormatHelper.addComma(rechargeAmount.toString())
        }
      }, null, $.proxy(this._afterRecharge, this), null, $elButton);
    } else if ( resp.code === 'BIL0102' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.INVALID_CARD, null, null, null, null, $elButton);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $elButton);
    }
  },

  /**
   * @function
   * @desc 금액 선택 actionsheet 생성
   * @param e
   */
  _onShowSelectAmount: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectAmount = function ($elButton, item) {
      return {
        value: item.text,
        option: $elButton.text().trim() === item.text ? 'checked' : '',
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_AMOUNT.list.map($.proxy(fnSelectAmount, this, $elButton)) }]
      },
      $.proxy(this._selectPopupCallback, this, $elButton),
      $.proxy(this._validSelectedValue, this, $elButton),
      null,
      $elButton
    );
  },

  /**
   * @function
   * @desc actionsheet event binding
   * @param $target
   * @param $layer
   */
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', 'li', $.proxy(this._setSelectedValue, this, $target));
    // $layer.on('click', '.tw-popup-closeBtn', $.proxy(this._validSelectedValue, this, $target));
  },

  /**
   * @function
   * @desc actionsheet 선택된 값 있는지 체크 및 에러메시지 노출
   * @param $elButton
   */
  _validSelectedValue: function ($elButton) {
    var $error = $($elButton).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( Tw.FormatHelper.isEmpty($($elButton).attr('data-amount')) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  /**
   * @function
   * @desc actionsheet 선택된 값 처리
   * @param $target
   * @param e
   */
  _setSelectedValue: function ($target, e) {
    this._popupService.close();
    $target.text($(e.currentTarget).text());
    $target.attr('data-amount', $(e.currentTarget).find('button').attr('data-value'));

    this._validSelectedValue($target);
    this._checkIsAbled();
    this._checkSkpayIsAbled();
  },

  /**
   * @function
   * @desc show example card
   */
  _onShowExampleCard: function () {
    this.$wrapExampleCard.show();
  },

  /**
   * @function
   * @desc close example card popup
   */
  _onCloseExampleCard: function () {
    this.$wrapExampleCard.hide();
  },

  /**
   * @function
   * @desc close prepaid card popup
   */
  _closePrepaidPopup: function () {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 신용카드 선불폰 충전 API 호출
   * @param e
   */
  _requestCreditCard: function (e) {
    var htParams = {
      amt: Number($('.fe-select-amount').data('amount')).toString(),
      cardNum: this.$cardNumber.val(),
      expireYY: this.$cardY.val().substr(2,2),
      expireMM: this.$cardM.val(),
      pwd: this.$cardPwd.val()
    };

    if ($('.fe-sms').is(':checked')) {
      htParams.smsYn = 'Y';
    }

    if ($('.fe-email').is(':checked')) {
      htParams.emailYn = 'Y';
    }

    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_06_0053, htParams)
      .done($.proxy(this._onCompleteRechargeByCreditCard, this, $(e.currentTarget)))
      .fail($.proxy(this._fail, this, $(e.currentTarget)));
  },

  /**
   * @function
   * @desc 신용카드 충전 API 응답 처리
   * @param $target
   * @param res
   */
  _onCompleteRechargeByCreditCard: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._rechargeSuccess = true;
      this._popupService.close();
    } else {
      this._fail($target, res);
    }
  },

  /**
   * @function
   * @desc API Error 처리
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.CommonHelper.endLoading('.popup-page');
    this._rechargeFail = true;
    this._err = {
      code: err.code,
      msg: err.msg
    };
    this._popupService.close();
  },

  /**
   * @function
   * @desc 충전완료 페이지로 이동 및 에러 처리
   */
  _afterRecharge: function () {
    if (this._rechargeSuccess) {
      this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=voice&' + $.param(this.amountInfo));
    } else if (this._rechargeFail) {
      Tw.Error(this._err.code, this._err.msg).pop();
    }
  },

  /**
   * @function
   * @desc X 버튼 클릭 시 닫기 처리 (공통 confirm)
   */
  _stepBack: function () {
    this._backAlert.onClose();
  }
};