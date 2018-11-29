/**
 * FileName: myt-data.familydata.share.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.29
 */

Tw.MyTDataFamilyShare = function(rootEl) {
  this.$container = rootEl;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyShare.prototype = {
  _init: function() {
    this._shareAmount = this.$amountInput.data('share-amount');
  },

  _cachedElement: function() {
    this.$amountInput = this.$container.find('span.input input');
    this.$submitBtn = this.$container.find('.bt-red1 button');
    this.$error = this.$container.find('.pb10');
  },

  _bindEvent: function() {
    this.$container.on('click', '.btn-type01', $.proxy(this._addShareData, this));
    this.$amountInput.on('focusout', $.proxy(this._validateShareAmount, this));
    this.$amountInput.on('keyup', $.proxy(this._handleChangeAmount, this));
  },

  _addShareData: function(e) {
    var value = e.currentTarget.getAttribute('data-value');

    if (value === 'all') {
      this.$amountInput.val(this._shareAmount);
    } else {
      this.$amountInput.val(Number(this.$amountInput.val()) + Number(value));
    }

    this._validateShareAmount();

    this.$submitBtn.attr('disabled', false);
  },

  _validateShareAmount: function() {
    var value = Number(this.$amountInput.val());

    if (!value) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.V17);
      this.$error.removeClass('none');
    } else if (value > this._shareAmount) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.V16);
      this.$error.removeClass('none');
    } else {
      if (!this.$error.hasClass('none')) {
        this.$error.addClass('none');
      }
    }
  },

  _handleChangeAmount: function(e) {
    var value = e.currentTarget.value;

    if (!value || value == 0) {
      this.$submitBtn.attr('disabled', true);
    } else {
      this.$submitBtn.attr('disabled', false);
    }
  }
};
