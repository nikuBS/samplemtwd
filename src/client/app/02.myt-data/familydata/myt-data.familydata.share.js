/**
 * FileName: myt-data.familydata.share.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.29
 */

Tw.MyTDataFamilyShare = function(rootEl) {
  this.$container = rootEl;

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTDataFamilyShare.prototype = {
  _cachedElement: function() {
    this.$amountInput = this.$container.find('.fe-amount');
    this.$submitBtn = this.$container.find('.fe-submit');
    this.$error = this.$container.find('.pb10');
    this.$pRemained = this.$container.find('p.pt4');
    this.$sRemained = this.$pRemained.find('.txt-c2');
  },

  _bindEvent: function() {
    this.$container.on('click', '.btn-type01', $.proxy(this._addShareData, this));
    this.$container.on('click', '.cancel', $.proxy(this._validateShareAmount, this));
    this.$amountInput.on('focusout', $.proxy(this._validateShareAmount, this));
    this.$amountInput.on('keyup', $.proxy(this._validateShareAmount, this));
  },

  _addShareData: function(e) {
    var value = e.currentTarget.getAttribute('data-value');

    if (value === 'all') {
      this.$amountInput.val(this.$amountInput.data('share-amount'));
    } else {
      this.$amountInput.val(Number(this.$amountInput.val()) + Number(value));
    }

    this._validateShareAmount();
  },

  _validateShareAmount: function() {
    var value = Number(this.$amountInput.val()),
      limit = Number(this.$amountInput.data('share-amount'));

    if (!value) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.V17);
      this.$error.removeClass('none');
      this.$sRemained.text(limit + Tw.DATA_UNIT.GB);
      this.$pRemained.removeClass('none');
      this._setDisableSubmit(true);
    } else if (value > limit) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.V16);
      this.$error.removeClass('none');
      this.$pRemained.addClass('none');
      this._setDisableSubmit(true);
    } else {
      if (!this.$error.hasClass('none')) {
        this.$error.addClass('none');
      }
      this.$sRemained.text(Number(limit - value) + Tw.DATA_UNIT.GB);
      this.$pRemained.removeClass('none');
      this._setDisableSubmit(false);
    }
  },

  _setDisableSubmit: function(disable) {
    disable !== !!this.$submitBtn.attr('disabled') && this.$submitBtn.attr('disabled', disable);
  }
};
