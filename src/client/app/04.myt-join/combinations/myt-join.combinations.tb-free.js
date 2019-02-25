/**
 * FileName: myt-join.product.combinations.tb-free.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.01
 */

Tw.MyTJoinCombinationsTBFree = function(rootEl, svcInfo) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._member = svcInfo;

  this.$container = rootEl;
  this.bindEvent();
};

Tw.MyTJoinCombinationsTBFree.prototype = {
  bindEvent: function() {
    this.$container.on('click', '.fe-benefit', $.proxy(this._openChangeBenefitPopup, this));
  },

  _openChangeBenefitPopup: function(e) {
    this.$changeBtn = $(e.target);
    this._bIdx = e.target.getAttribute('data-index');
    this._benefit = e.target.getAttribute('data-benefit');

    this._popupService.open(
      {
        hbs: 'MS_07_01_04_01_0' + this._bIdx,
        name: this._member.mbrNm,
        number: this._member.svcNum,
        benefit: this._bIdx === '1' ? this._benefit === '2053-DAT1G' : this._benefit
      },
      $.proxy(this._handleOpenChangeBenefitPopup, this),
      null,
      'benefit' + this._bIdx
    );
  },

  _handleOpenChangeBenefitPopup: function($layer) {
    $layer.on('click', '.bt-red1', $.proxy(this._submitChangeBenefit, this, $layer));

    if (this._bIdx === '2') {
      var $input = $layer.find('input');
      var $error = $layer.find('.val-txt');
      var $submitBtn = $layer.find('.bt-red1 button');
      $input.on('click', $.proxy(this._removeDash, this, $input));
      $input.on('focusout', $.proxy(this._handleFocusoutInput, this, $input, $error));
      $input.on('keyup', $.proxy(this._handleTypeInput, this, $input, $error, $submitBtn));
    }
  },

  _submitChangeBenefit: function($layer) {
    var value = '',
      code = 0;

    if (this._bIdx === '1') {
      code = 6;
      value = $layer.find('li[aria-checked="true"]').data('code');

      if (this._benefit === value) {
        var ALERT = Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A11;
        return this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
      }
    } else {
      code = 5;
      value = $layer
        .find('#flab01')
        .val()
        .replace(/-/g, '');

      if (this._benefit === value) {
        return this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A13.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A13.TITLE);
      }
    }

    this._benefit = value;

    this._apiService
      .request(Tw.API_CMD.BFF_05_0135, {
        chgOpCd: code,
        benefitVal: value
      })
      .done($.proxy(this._successChangeBenefit, this));
  },

  _successChangeBenefit: function(resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      var ALERT = Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A12;
      var parent = this.$changeBtn
        .parent()
        .contents()
        .filter(function() {
          return this.nodeType === 3;
        })[0];

      this.$changeBtn.attr('data-benefit', this._benefit);
      if (this._bIdx === '1') {
        parent.textContent = parent.textContent.replace(/.+\s/, Tw.MYT_JOIN_TB_FREE_BENEFIT[this._benefit] + ' ');
      } else {
        parent.textContent = parent.textContent.replace(/[0-9\-\*]+/, this._benefit);
      }

      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, $.proxy(this._closePopup, this));
    } else if (resp.code === 'PRD0024') {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A14.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A14.TITLE);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _closePopup: function() {
    this._popupService.close();
  },

  _validPhoneNumber: function(value, $error) {
    var number = value.replace(/-/g, '');

    if (number.indexOf('010') === 0) {
      if (number.length !== 11) {
        this._setInvalidInput($error, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V18);
        return false;
      }
    } else if (number.length !== 11 && number.length !== 10) {
      this._setInvalidInput($error, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V18);
      return false;
    }

    if (!Tw.ValidationHelper.isCellPhone(number)) {
      this._setInvalidInput($error, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V9);
      return false;
    } else {
      if (!$error.hasClass('none')) {
        $error.addClass('none');
      }
      return true;
    }
  },

  _handleFocusoutInput: function($input, $error) {
    var value = $input.val(),
      isValid = this._validPhoneNumber(value, $error);

    $input.attr('type', 'text');
    if (isValid) {
      $input.val(Tw.FormatHelper.getDashedCellPhoneNumber(value));
    }
  },

  _setInvalidInput: function($error, msg) {
    if ($error.hasClass('none')) {
      $error.removeClass('none');
    }
    $error.text(msg);
  },

  _removeDash: function($input) {
    $input.val(($input.val() || '').replace(/-/g, ''));
    $input.attr('type', 'number');
  },

  _handleTypeInput: function($input, $error, $submitBtn) {
    var value = $input.val(),
      validLenth = value.indexOf('010') === 0 ? 11 : 10;

    if (this._isCheckedLen && (!value || !value.length)) {
      this._isCheckedLen = false;
    } else if (!this._isCheckedLen && value.length === validLenth) {
      this._isCheckedLen = true;
    }

    if (this._isCheckedLen && this._validPhoneNumber(value, $error)) {
      $submitBtn.removeAttr('disabled');
    } else {
      $submitBtn.attr('disabled', true);
    }
  }
};
