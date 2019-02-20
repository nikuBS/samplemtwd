Tw.ValidationService = function (rootEl, submitBtn) {
  this.$container = rootEl;
  this.$submitBtn = submitBtn;
  this.$disabled = true;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  this._bindEvent();
};

Tw.ValidationService.prototype = {
  _bindEvent: function () {
    this.$container.find('.cancel').on('click', $.proxy(this._setButtonAbility, this, false));
    this.$container.find('input.fe-only-number:visible').on('keyup', $.proxy(this._checkNumber, this));
    this.$container.find('input.required-input-field:visible').on('keyup', $.proxy(this.checkIsAbled, this));
    this.$container.find('input.required-input-field:visible').on('blur', $.proxy(this.checkValidation, this));
  },
  checkIsAbled: function () {
    this.$container.find('input.required-input-field:visible').each($.proxy(this._checkNull, this,
      $.proxy(this._setButtonAbility, this)));

    if (!this.$disabled) {
      this.$container.find('.fe-required-select:visible').each($.proxy(this._checkNull, this,
        $.proxy(this._setButtonAbility, this)));
    }
  },
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
  _setButtonAbility: function (isValid) {
    if (isValid) {
      this.$submitBtn.removeAttr('disabled');
      this.$disabled = false;
    } else {
      this.$submitBtn.attr('disabled', 'disabled');
      this.$disabled = true;
    }
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  checkValidation: function (event) {
    var $target = $(event.currentTarget);
    var $messageTarget = this._getMessageTarget($target);
    var label = Tw.VALIDATION_LABEL[$target.attr('data-valid-label').toUpperCase()];
    var message = '';
    var isValid = false;

    if (this._isEmpty($target)) {
      message = this._getEmptyMessage(label);
    } else if (this._isWrong($target)) {
      message = this._getWrongMessage(label);
    } else {
      isValid = true;
    }

    if ($target.hasClass('fe-point')) {
      message = this._getPointMessage($target);
      if (Tw.FormatHelper.isEmpty(message)) {
        isValid = true;
      } else {
        isValid = false;
      }
    }

    if (isValid) {
      $messageTarget.hide();
    } else {
      $messageTarget.text(message).show();
    }
  },
  _isEmpty: function ($target) {
    return Tw.FormatHelper.isEmpty($target.val());
  },
  _isWrong: function ($target) {
    var isWrong = $target.val().length < $target.attr('minLength');

    if (!isWrong) {
      if ($target.hasClass('fe-card-number')) {
        this._getCardCode($target);
      } else if ($target.hasClass('fe-card-y')) {
        isWrong = !this._validation.checkYear($target);
      } else if ($target.hasClass('fe-card-m')) {
        isWrong = !this._validation.checkMonth($target, this.$container.find('.fe-card-y'));
      }
    }
    return isWrong;
  },
  _getMessageTarget: function ($target) {
    var $messageTarget = $target.parent().siblings('.fe-error-msg');
    if ($target.attr('data-valid-label') === 'expiration') {
      $messageTarget = $target.parents('.fe-exp-wrap').siblings('.fe-error-msg');
    }
    return $messageTarget;
  },
  _getEmptyMessage: function (label) {
    var message = label;
    if (label === Tw.VALIDATION_LABEL.EXPIRATION || label === Tw.VALIDATION_LABEL.BIRTH) {
      message += Tw.VALIDATION_LABEL.U;
    } else {
      message += Tw.VALIDATION_LABEL.R;
    }
    message += Tw.VALIDATION_LABEL.MESSAGE_EMPTY;
    return message;
  },
  _getWrongMessage: function (label) {
    var message = label;
    if (label === Tw.VALIDATION_LABEL.EXPIRATION || label === Tw.VALIDATION_LABEL.BIRTH) {
      message += Tw.VALIDATION_LABEL.I;
    } else {
      message += Tw.VALIDATION_LABEL.G;
    }
    message += Tw.VALIDATION_LABEL.MESSAGE_WRONG;
    return message;
  },
  _getCardCode: function ($target) {
    this._apiService.request(Tw.API_CMD.BFF_07_0068, { cardNum: $.trim($target.val()).substr(0, 6) })
      .done($.proxy(this._getSuccess, this, $target))
      .fail($.proxy(this._getFail, this, $target));
  },
  _getSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var cardCode = res.result.bankCardCoCd;
      var cardName = res.result.cardNm;

      $target.attr({ 'data-code': cardCode, 'data-name': cardName });
      $target.parent().siblings('.fe-error-msg').hide();

      if (Tw.FormatHelper.isEmpty(cardCode)) {
        this._getFail($target);
      }
    } else {
      this._getFail($target);
    }
  },
  _getFail: function ($target) {
    $target.parent().siblings('.fe-error-msg').empty().text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V28).show();
  },
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
  isAllValid: function () {
    if (this.$container.find('.fe-error-msg').is(':visible')) {
      var $target = this.$container.find('.fe-error-msg:visible').first();
      var $inputTarget = $target.siblings('.input').find('input.required-input-field');
      if ($target.text().indexOf(Tw.VALIDATION_LABEL.EXPIRATION) !== -1) {
        $inputTarget = this.$container.find('.fe-card-y');
      }
      $inputTarget.focus();
      return false;
    } else if (this.$container.find('.fe-bank-error-msg').is(':visible')) {
      this.$container.find('.select-bank').focus();
      return false;
    }
    return true;
  }
};