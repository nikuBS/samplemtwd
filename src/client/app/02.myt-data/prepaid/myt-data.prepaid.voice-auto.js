/**
 * @file myt-data.prepaid.voice.auto.js
 * @desc 선불폰 음성 자동충전
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.11.16
 */

/**
 * @namespace
 * @desc 선불폰 음성 자동 충전 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTDataPrepaidVoiceAuto = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();
  this._backAlert = new Tw.BackAlert(rootEl, true);
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-request-recharge'));

  this._firstChange = true;
  this._firstBlur = true;

  this._cachedElement();
  this._init();
};

Tw.MyTDataPrepaidVoiceAuto.prototype = {
  /**
   * @function
   * @desc get pps info
   */
  _init: function () {
    this.amt = $('.fe-select-amount').attr('data-amount');
    this.chargeCd = $('.fe-charge-wrap:visible .fe-charge').attr('data-amount');

    this._getPpsInfo();
  },

  /**
   * @function
   * @desc 변수 초기화
   */
  _cachedElement: function () {
    this.$request_recharge_auto = $('.fe-request-recharge');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
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
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-unsubscribe-auto-recharge', $.proxy(this._onClickUnsubscribeAutoRecharge, this));
    this.$container.on('click', '.fe-popup-close', $.proxy(this._stepBack, this));
    this.$container.on('click', 'li.fe-template-type', $.proxy(this._changeRechargeType, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowAmount, this));
    this.$container.on('click', '.fe-select-date', $.proxy(this._onShowDate, this));
    this.$container.on('click', '.fe-select-remain-amount', $.proxy(this._onShowRemainAmount, this));
    this.$container.on('change', '.fe-select-expire', $.proxy(this._validateExpireDate, this, 'change'));
    this.$container.on('blur', '.fe-select-expire', $.proxy(this._validateExpireDate, this, 'blur'));
    this.$container.on('change input blur click', '.fe-wrap-template [required]', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-request-recharge', $.proxy(this._requestRechargeAuto, this));
    this.$container.on('keyup', 'input[type=tel]', $.proxy(this._checkMaxLength, this));
    this.$container.on('keyup blur', '.fe-card-number', $.proxy(this._validateCard, this));
    this.$container.on('keyup blur', '.fe-card-y', $.proxy(this._validateExpired, this));
    this.$container.on('keyup blur', '.fe-card-m', $.proxy(this._validateExpired, this));
  },

  /**
   * @function
   * @desc set data
   * @param result
   */
  _setData: function (result) {
    var dataText = 0;
    if (!Tw.FormatHelper.isEmpty(result.prodAmt) && result.prodAmt !== '0') {
      dataText = Tw.FormatHelper.addComma(result.prodAmt);
    }
    this.$container.find('.fe-amount').text(dataText);

    this.$container.find('.fe-from-date').text(Tw.DateHelper.getShortDate(result.obEndDt));
    this.$container.find('.fe-to-date').text(Tw.DateHelper.getShortDate(result.inbEndDt));
    this.$container.find('.fe-remain-date').text(Tw.DateHelper.getShortDate(result.numEndDt));
  },

  /**
   * @function
   * @desc 신용카드 유효성 검증
   * @param e
   */
  _validateCard: function (e) {
    var $cardNumber = $(e.currentTarget);

    if ($cardNumber.val().indexOf('*') === -1) {
      var $error = $(e.currentTarget).closest('li').find('.error-txt');
      $error.addClass('blind').attr('aria-hidden', 'true');

      if (!this._validation.checkMoreLength($cardNumber, 15)) {
        $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
        $($error.get(1)).addClass('blind').attr('aria-hidden', 'true');
      } else {
        this._getCardInfo(e);
      }

      if ($cardNumber.val() === '') {
        $($error.get(0)).addClass('blind').attr('aria-hidden', 'true');
        $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
      }
    }
  },

  /**
   * @function
   * @desc 카드번호 앞 6자리로 카드사 정보 조회
   * @param e
   * @param param
   */
  _getCardInfo: function (e, param) {
    var cardNumber = $('.fe-card-number');

    var isValid = this._validation.checkMoreLength(cardNumber, 15);

    if ( isValid ) {
      var htParams = {
        cardNum: $.trim(cardNumber.val()).substr(0, 6)
      };

      this._apiService.request(Tw.API_CMD.BFF_06_0065, htParams)
        .done($.proxy(this._getCardCode, this, e, param));
    }
  },

  /**
   * @function
   * @desc 카드사 정보 조회 응답 처리
   * @param e
   * @param htParams
   * @param res
   */
  _getCardCode: function (e, htParams, res) {
    var cardNumber = $('.fe-card-number');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      if (!Tw.FormatHelper.isEmpty(htParams)) {
        this._recharge(htParams, e);
      } else {
        if (Tw.InputHelper.isEnter(e)) {
          this.$container.find('.fe-card-y').focus();
        }
      }
    } else {
      var $credit_error = cardNumber.closest('li').find('.error-txt').get(2);
      $($credit_error).removeClass('blind').attr('aria-hidden', 'false');
      this.$request_recharge_auto.prop('disabled', true);

      if (Tw.InputHelper.isEnter(e)) {
        this.$container.find('.fe-card-y').focus();
      }
    }
  },

  /**
   * @function
   * @desc 유효기간 유효성 검증
   * @param e
   */
  _validateExpired: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    var cardY = $('.fe-card-y');
    var cardM = $('.fe-card-m');

    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( cardY.val() === '' || cardM.val() === '' ) {
      $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
    } else if ( !(this._validation.checkMoreLength(cardY, 4) && this._validation.checkMoreLength(cardM, 2) &&
      this._validation.checkYear(cardY) && this._validation.checkMonth(cardM, cardY)) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  /**
   * @function
   * @desc datepicker 날짜 세팅 시 현재날짜 이전 여부 체크
   * @param type
   * @param e
   */
  _validateExpireDate: function (type, e) {
    var isAndroid = Tw.BrowserHelper.isAndroid();
    var isIos = Tw.BrowserHelper.isIos();
    var isNotFirst = false;

    if (isIos) {
      if (type === 'change') {
        isNotFirst = !this._firstChange;
      }

      if (type === 'blur') {
        isNotFirst = !this._firstBlur;
      }
    }

    if (isAndroid || isNotFirst) {
      var $target = $(e.currentTarget);
      var $error = $target.closest('li').find('.error-txt');

      if (Tw.DateHelper.isBefore($target.val())) {
        this._popupService.openAlert(Tw.MYT_DATA_PREPAID.INVALID_DATE, null, null, null, null, $target);
        $target.val(Tw.DateHelper.getTomorrowDate());
      }

      if (!$target.val()) {
        $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
      } else {
        $($error.get(0)).addClass('blind').attr('aria-hidden', 'true');
      }
    }

    if (isIos) {
      if (type === 'change') {
        this._firstChange = false;
      }

      if (type === 'blur') {
        this._firstBlur = false;
      }
    }
  },

  /**
   * @function
   * @desc max length 적용
   * @param e
   */
  _checkMaxLength: function (e) {
    Tw.InputHelper.inputNumberMaxLength(e.currentTarget);
  },

  /**
   * @function
   * @desc 충전 형태 변경
   */
  _changeRechargeType: function () {
    this._firstChange = true;
    this._firstBlur = true;

    var chargeWrap = this.$container.find('.fe-charge-wrap:visible');
    chargeWrap.siblings().removeClass('none').attr({ 'aria-hidden': 'false', 'required': '' });
    chargeWrap.addClass('none').attr('aria-hidden', 'true').removeClass('required');

    this.chargeCd = chargeWrap.siblings().find('.fe-charge').attr('data-amount');

    this._checkIsAbled();
  },

  /**
   * @function
   * @desc actionsheet data 생성 (날짜별)
   * @param e
   */
  _onShowDate: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectDate = function ($elButton, item) {
      return {
        value: item.text,
        option: $elButton.text().trim() === item.text ? 'checked' : '',
        attr: 'data-value=' + item.chargeCd
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_DATE.list.map($.proxy(fnSelectDate, this, $elButton)) }]
      },
      $.proxy(this._selectPopupCallback, this, [$elButton, true]),
      null, null, $elButton
    );
  },

  /**
   * @function
   * @desc actionsheet data 생성 (금액별)
   * @param e
   */
  _onShowRemainAmount: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectDate = function (item) {
      return {
        value: item.text,
        option: $elButton.text().trim() === item.text ? 'checked' : '',
        attr: 'data-value=' + item.chargeCd
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_RECHARGE_AMOUNT.list.map($.proxy(fnSelectDate, this)) }]
      },
      $.proxy(this._selectPopupCallback, this, [$elButton, true]),
      null, null, $elButton
    );
  },

  /**
   * @function
   * @desc actionsheet 생성 (충전금액)
   * @param e
   */
  _onShowAmount: function (e) {
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
      $.proxy(this._selectPopupCallback, this, [$elButton, false]),
      null, null, $elButton
    );
  },

  /**
   * @function
   * @desc actionsheet event binding
   * @param arrParams
   * @param $layer
   */
  _selectPopupCallback: function (arrParams, $layer) {
    $layer.on('click', 'li', $.proxy(this._setSelectedValue, this, arrParams));
    $layer.on('click', '.tw-popup-closeBtn', $.proxy(this._validSelectedValue, this, arrParams));
  },

  /**
   * @function
   * @desc actionsheet 선택된 값이 있는지 체크
   * @param $elButton
   */
  _validSelectedValue: function ($elButton) {
    var $error = $($elButton[0]).siblings('.error-txt');
    if (!$error.hasClass('error-txt')) {
      $error = $($elButton[0]).parent().siblings('.error-txt');
    }
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( Tw.FormatHelper.isEmpty($($elButton[0]).attr('data-amount')) ) {
      $error.removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  /**
   * @function
   * @desc actionsheet 선택된 값 처리
   * @param arrParams
   * @param e
   */
  _setSelectedValue: function (arrParams, e) {
    var $target = arrParams[0];
    var isChargeCd = arrParams[1];
    if ( isChargeCd ) {
      this.chargeCd = $(e.currentTarget).find('button').attr('data-value');
    }

    this._popupService.close();
    $target.text($(e.currentTarget).text());
    $target.attr('data-amount', $(e.currentTarget).find('button').attr('data-value'));

    this._validSelectedValue($target);
    this._checkIsAbled();
  },

  /**
   * @function
   * @desc 버튼 활성화 여부 체크
   */
  _checkIsAbled: function () {
    if ( !Tw.FormatHelper.isEmpty($('.fe-select-amount').attr('data-amount')) && !Tw.FormatHelper.isEmpty(this.chargeCd) &&
      !Tw.FormatHelper.isEmpty($('.fe-select-expire').val()) && !Tw.FormatHelper.isEmpty($('.fe-card-number').val()) &&
      !Tw.FormatHelper.isEmpty($('.fe-card-y').val()) && !Tw.FormatHelper.isEmpty($('.fe-card-m').val()) ) {
      this.$request_recharge_auto.prop('disabled', false);
    } else {
      this.$request_recharge_auto.prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 유효성 검증 후 충전
   * @param e
   */
  _requestRechargeAuto: function (e) {
    var isValid = this._validation.checkMoreLength($('.fe-card-number'), 15) &&
      this._validation.checkLength($('.fe-card-y').val(), 4) &&
      this._validation.checkLength($('.fe-card-m').val(), 2) &&
      this._validation.checkYear($('.fe-card-y')) &&
      this._validation.checkMonth($('.fe-card-m'), $('.fe-card-y'));

    if (isValid) {
      if (this.chargeCd || this.amt) {
        var htParams = {
          amt: $('.fe-select-amount').attr('data-amount'),
          chargeCd: this.chargeCd,
          endDt: $('.fe-select-expire').val().replace(/-/g, ''),
          cardNum: $('.fe-card-number').val(),
          expireYY: $('.fe-card-y').val().substr(2, 2),
          expireMM: $('.fe-card-m').val(),
          maskedYn: ''
        };

        if ($('.fe-hidden').val() !== '') {
          if ($.trim($('.fe-card-number').val()) === $('.fe-hidden').val()) {
            htParams.maskedYn = 'Y';
          }
        }

        if ($('.fe-card-number').val().indexOf('*') === '-1') {
          this._getCardInfo(htParams, e, 'recharge');
        } else {
          this._recharge(htParams, e);
        }
      }
    }
  },

  /**
   * @function
   * @desc 충전 API 호출
   * @param htParams
   * @param e
   */
  _recharge: function (htParams, e) {
    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_06_0054, htParams)
      .done($.proxy(this._onCompleteRechargeAuto, this, $(e.currentTarget)))
      .fail($.proxy(this._fail, this, $(e.currentTarget)));
  },

  /**
   * @function
   * @desc 충전 API 응답 처리
   * @param $target
   * @param res
   */
  _onCompleteRechargeAuto: function ($target, res) {
    var htParams = {
      amt: $('.fe-select-amount').attr('data-amount'),
      chargeCd: this.chargeCd,
      endDt: $('.fe-select-expire').val().replace(/-/g, '')
    };
    // this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=auto&' + $.param(htParams));

    var type = 'auto';
    var btn = this.$container.find('.fe-request-recharge');

    if (btn.text() === Tw.BUTTON_LABEL.CHANGE) {
      type = 'change';
    }

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=' + type + '&' + $.param(htParams));
    } else {
      this._fail($target, res);
    }
  },

  /**
   * @function
   * @desc API error 처리
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.CommonHelper.endLoading('.popup-page');
    Tw.Error(err.code, err.msg).pop(null, $target);
  },

  _onClickUnsubscribeAutoRecharge: function (e) {
    this._popupService.openModalTypeA(
      Tw.MYT_DATA_PREPAID.A70_TITLE,
      Tw.MYT_DATA_PREPAID.A70_CONTENT,
      Tw.MYT_DATA_PREPAID.A70_BTN_CONFIRM,
      null,
      $.proxy(this._unsubscribeAutoRecharge, this, $(e.currentTarget)),
      $.proxy(this._closeUnsubscribeAutoRecharge, this),
      null,
      null,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc close popup
   */
  _closeUnsubscribeAutoRecharge: function () {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 자동충전 해지
   * @param $target
   */
  _unsubscribeAutoRecharge: function ($target) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0057, {})
      .done($.proxy(this._onSuccessUnsubscribe, this, $target));
  },

  /**
   * @function
   * @desc 해지 완료
   * @param $target
   * @param res
   */
  _onSuccessUnsubscribe: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=cancel');
    } else {
      Tw.Error(res.code, res.msg).pop(null, $target);
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