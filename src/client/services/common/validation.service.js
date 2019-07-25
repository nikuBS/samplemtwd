/**
 * @namespace
 * @desc 요금납부 등 input field가 중복되는 화면의 validation check 공통 서비스
 * @param rootEl
 * @param submitBtn
 * @param change
 * @param isAuto
 */
Tw.ValidationService = function (rootEl, submitBtn, change, isAuto) {
  this.$container = rootEl;
  this.$submitBtn = submitBtn;
  this.$disabled = true;
  this.$expirationTarget = null;
  this.$isAuto = isAuto;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  if (Tw.FormatHelper.isEmpty(change)) {
    this.bindEvent();
  }
};

Tw.ValidationService.prototype = {
  /**
   * @function
   * @desc event binding
   */
  bindEvent: function () {
    this.$container.find('.cancel').on('click', $.proxy(this._setButtonAbility, this, false));
    this.$container.find('input.fe-only-number:visible').on('keyup', $.proxy(this._checkNumber, this));
    this.$container.find('input.required-input-field:visible').on('keyup', $.proxy(this.checkIsAbled, this));
    this.$container.find('input.required-input-field:visible').on('blur', $.proxy(this.checkValidation, this));
  },
  /**
   * @function
   * @desc null check and 버튼 활성화/비활성화 처리
   */
  checkIsAbled: function () {
    this.$container.find('input.required-input-field:visible:not(:disabled)').each($.proxy(this._checkNull, this,
      $.proxy(this._setButtonAbility, this)));

    if (!this.$disabled) {
      this.$container.find('.fe-required-select:visible:not(:disabled)').each($.proxy(this._checkNull, this,
        $.proxy(this._setButtonAbility, this)));
    }
  },
  /**
   * @function
   * @desc check null
   * @param callback
   * @param idx
   * @param target
   * @returns {boolean}
   */
  _checkNull: function (callback, idx, target) {
    var $target = $(target);
    var isNull = Tw.FormatHelper.isEmpty($target.val());

    if (target.tagName !== 'INPUT') {
      isNull = Tw.FormatHelper.isEmpty($target.attr('id'));
    }

    if (isNull) {
      callback(false);
      return false;
    }
    callback(true);
  },
  /**
   * @function
   * @desc 버튼 활성화 처리
   * @param isValid
   */
  _setButtonAbility: function (isValid) {
    if (this.$submitBtn === undefined) {
      this.$submitBtn = this.$container.find('.fe-pay:visible');
    }

    if (isValid) {
      this.$submitBtn.removeAttr('disabled');
      this.$disabled = false;
    } else {
      this.$submitBtn.attr('disabled', 'disabled');
      this.$disabled = true;
    }
  },
  /**
   * @function
   * @desc 숫자만 입력
   * @param event
   */
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  /**
   * @function
   * @desc check validation
   * @param event
   */
  checkValidation: function (event) {
    var $target = $(event.currentTarget);
    var $messageTarget = this._getMessageTarget($target);
    var label = Tw.VALIDATION_LABEL[$target.attr('data-valid-label').toUpperCase()];
    var message = '';
    var isValid = false;

    // get message
    if (this._isEmpty($target)) {
      message = this._getEmptyMessage(label);
    } else if (this._isWrong($target)) {
      message = this._getWrongMessage(label);
    } else {
      isValid = true;
    }

    if ($target.hasClass('fe-card-number') && $target.val().indexOf('*') === -1 && $target.val() !== this.$cardNumber) {
      $target.attr('data-code', '');
    }

    if ($target.hasClass('fe-point')) {
      message = this._getPointMessage($target);
      if (Tw.FormatHelper.isEmpty(message)) {
        isValid = true;
      } else {
        isValid = false;
      }
    }

    if ($target.hasClass('fe-phone-number')) {
      isValid = this._validation.checkMoreLength($target, 10);
      if (!isValid) {
        message = Tw.ALERT_MSG_MYT_FARE.ALERT_2_V18;
      }

      if (isValid) {
        isValid = this._validation.isCellPhone($target.val());
        if (!isValid) {
          message = Tw.ALERT_MSG_MYT_FARE.ALERT_2_V9;
        }
      }
    }

    if ($target.hasClass('fe-prepay-amount')) {
      isValid = false;
      var _prepayAmount = $target.val();
      if (!this._validation.checkIsAvailablePoint(_prepayAmount, this.$container.find('.fe-max-amount').attr('id'))) {
        message = Tw.ALERT_MSG_MYT_FARE.ALERT_2_V10;
      } else if (!this._validation.checkIsMore(_prepayAmount, 9999)) {
        message = Tw.ALERT_MSG_MYT_FARE.TEN_THOUSAND;
      } else if (!this._validation.checkMultiple(_prepayAmount, 10000)) {
        message = Tw.ALERT_MSG_MYT_FARE.TEN_THOUSAND;
      } else {
        isValid = true;
      }
    }

    if (isValid) {
      $messageTarget.hide();
      $messageTarget.attr('aria-hidden', 'true');
    } else {
      $messageTarget.text(message).show();
      $messageTarget.attr('aria-hidden', 'false');
    }
  },
  /**
   * @function
   * @desc isEmpty
   * @param $target
   * @returns {boolean}
   */
  _isEmpty: function ($target) {
    return Tw.FormatHelper.isEmpty($target.val());
  },
  /**
   * @function
   * @desc isWrong
   * @param $target
   * @returns {boolean}
   */
  _isWrong: function ($target) {
    var isWrong = true;

    if ($target.hasClass('fe-card-y') || $target.hasClass('fe-card-m')) {
      isWrong = this._expirationValid(isWrong);
    } else {
      isWrong = $target.val().length < $target.attr('minLength');

      if (!isWrong) {
        if ($target.hasClass('fe-card-number') && $target.val().indexOf('*') === -1) {
          this._getCardCode($target);
        } else if ($target.hasClass('fe-birth')) {
          isWrong = !this._validation.isBirthday($target.val());
        }
      }
    }
    return isWrong;
  },
  /**
   * @function
   * @desc check expiration
   * @param isWrong
   * @returns {*}
   */
  _expirationValid: function (isWrong) {
    var cardY = this.$container.find('.fe-card-y');
    var cardM = this.$container.find('.fe-card-m');

    if (this._isEmpty(cardY) || this._isEmpty(cardM)) {
      return false;
    }

    isWrong = this._validation.isYearInvalid(cardY);

    if (isWrong) {
      this.$expirationTarget = cardY;
      return isWrong;
    }

    isWrong = this._validation.isMonthInvalid(cardM);

    if (isWrong) {
      this.$expirationTarget = cardM;
      return isWrong;
    }

    isWrong = !this._validation.checkExpiration(cardY, cardM);
    if (isWrong) {
      this.$expirationTarget = cardY;
    } else {
      this.$expirationTarget = null;
    }
    return isWrong;
  },
  /**
   * @function
   * @desc get message target
   * @param $target
   * @returns {this | *}
   */
  _getMessageTarget: function ($target) {
    var $messageTarget = $target.parent().siblings('.fe-error-msg');
    if ($target.attr('data-valid-label') === 'expiration' || $target.attr('data-err-target') === 'fe-exp-wrap') {
      $messageTarget = $target.parents('.fe-exp-wrap').siblings('.fe-error-msg');
    }
    return $messageTarget;
  },
  /**
   * @function
   * @desc get empty message
   * @param label
   * @returns {*}
   */
  _getEmptyMessage: function (label) {
    var message = label;
    if (label === Tw.VALIDATION_LABEL.EXPIRATION || label === Tw.VALIDATION_LABEL.BIRTH || label === Tw.VALIDATION_LABEL.PREPAY) {
      message += Tw.VALIDATION_LABEL.U;
    } else {
      message += Tw.VALIDATION_LABEL.R;
    }
    message += Tw.VALIDATION_LABEL.MESSAGE_EMPTY;
    return message;
  },
  /**
   * @function
   * @desc get wrong message
   * @param label
   * @returns {*}
   */
  _getWrongMessage: function (label) {
    var message = label;
    if (label === Tw.VALIDATION_LABEL.EXPIRATION || label === Tw.VALIDATION_LABEL.BIRTH || label === Tw.VALIDATION_LABEL.PREPAY) {
      message += Tw.VALIDATION_LABEL.I;
    } else {
      message += Tw.VALIDATION_LABEL.G;
    }
    message += Tw.VALIDATION_LABEL.MESSAGE_WRONG;
    return message;
  },
  /**
   * @function
   * @desc 카드번호 앞 6자리로 카드사 조회 API 호출
   * @param $target
   */
  _getCardCode: function ($target) {
    this._apiService.request(Tw.API_CMD.BFF_07_0068, { cardNum: $.trim($target.val()).substr(0, 6) })
      .done($.proxy(this._getSuccess, this, $target))
      .fail($.proxy(this._getFail, this, $target));
  },
  /**
   * @function
   * @desc 카드사 조회 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _getSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var cardCode = res.result.prchsCardCd;
      var cardName = res.result.prcchsCardNm;

      if (this.$isAuto) {
        cardCode = res.result.bankCardCoCd;
        cardName = res.result.cardNm;
      }

      if (Tw.FormatHelper.isEmpty(cardCode)) {
        this._getFail($target);
      } else {
        $target.attr({'data-code': cardCode, 'data-name': cardName});
        $target.parent().siblings('.fe-error-msg').hide().attr('aria-hidden', 'true');

        this.$cardNumber = $target.val();
      }
    } else {
      this._getFail($target);
    }
  },
  /**
   * @function
   * @desc 카드사 조회 API 응답 처리 (실패)
   * @param $target
   */
  _getFail: function ($target) {
    $target.parent().siblings('.fe-error-msg').empty().text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V28).show().attr('aria-hidden', 'false');
    this.$cardNumber = '';
  },
  /**
   * @function
   * @desc get point message
   * @param $target
   * @returns {string}
   */
  _getPointMessage: function ($target) {
    var $isSelectedPoint = this.$container.find('.fe-select-point').attr('id');
    var className = '.fe-cashbag-point';
    if ( $isSelectedPoint === Tw.PAYMENT_POINT_VALUE.T_POINT ) {
      className = '.fe-t-point';
    }

    var message = '';
    if (!this._validation.checkIsAvailablePoint($target.val(),
        parseInt(this.$container.find(className).attr('id'), 10))) {
      message = Tw.ALERT_MSG_MYT_FARE.ALERT_2_V27;
    } else if (!this._validation.checkIsMore($target.val(), 1000)) {
      message = Tw.ALERT_MSG_MYT_FARE.ALERT_2_V8;
    } else if (!this._validation.checkIsTenUnit($target.val())) {
      message = Tw.ALERT_MSG_MYT_FARE.TEN_POINT;
    }

    return message;
  },
  /**
   * @function
   * @desc 모든 유효성 검증 완료 체크
   * @returns {boolean}
   */
  isAllValid: function () {
    if (this.$container.find('.fe-error-msg').is(':visible')) {
      var $target = this.$container.find('.fe-error-msg:visible').first();
      var $inputTarget = $target.siblings('.input').find('input.required-input-field');
      if ($target.text().indexOf(Tw.VALIDATION_LABEL.EXPIRATION) !== -1) {
        $inputTarget = this.$expirationTarget;
      }

      if ($inputTarget !== null) {
        $inputTarget.focus();
      }
      return false;
    } else if (this.$container.find('.fe-bank-error-msg').is(':visible')) {
      this.$container.find('.select-bank').focus();
      return false;
    }

    if (this.$container.find('.fe-card-number').is(':visible')) {
      if (!Tw.FormatHelper.isEmpty(this.$container.find('.fe-card-number').attr('data-code')) ||
        this.$container.find('.fe-card-number').val().indexOf('*') !== -1) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  },
  /**
   * @function
   * @desc 버튼 비활성화 return
   * @returns {boolean}
   */
  getDisabled: function () {
    return this.$disabled;
  }
};
