/**
 * FileName: common.biometrics.terms.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.13
 */

Tw.CommonBiometricsTerms = function (rootEl, target) {
  this.$container = rootEl;
  this._target = target;

  this._historyService = new Tw.HistoryService();

  this._bindEvent();
};

Tw.CommonBiometricsTerms.prototype = {
  _bindEvent: function () {
    this.$allCheck = this.$container.find('#fe-check-all');
    this.$childChecks = this.$container.find('.fe-check-child');
    this.$btConfirm = this.$container.find('#fe-bt-confirm');

    this.$allCheck.on('change', $.proxy(this._onClickAllCheck, this));
    this.$childChecks.on('change', $.proxy(this._onClickChildCheck, this));
    this.$btConfirm.on('click', $.proxy(this.onClickConfirm, this));
  },
  _onClickAllCheck: function ($event) {
    var $currentTarget = $($event.currentTarget);
    if ( $currentTarget.is(':checked') ) {
      this._checkElement(this.$childChecks);
    } else {
      this._uncheckElement(this.$childChecks);
    }
    this._enableBtns();
  },
  _onClickChildCheck: function () {
    this._checkAll();
    this._enableBtns();
  },
  onClickConfirm: function () {
    this._historyService.goLoad('/common/biometrics/cert?target=' + this._target);
  },
  _checkElement: function ($element) {
    $element.prop('checked', true);
    $element.parent().addClass('checked');
    $element.parent().attr('aria-checked', true);
  },
  _uncheckElement: function ($element) {
    $element.prop('checked', false);
    $element.parent().removeClass('checked');
    $element.parent().attr('aria-checked', false);
  },
  _checkAll: function () {
    var allLength = this.$childChecks.length;
    var selectedLength = this.$childChecks.filter(':checked').length;
    if ( allLength === selectedLength ) {
      this._checkElement(this.$allCheck);
    } else {
      this._uncheckElement(this.$allCheck);
    }
  },
  _enableBtns: function () {
    var selectedLength = this.$childChecks.filter(':checked').length;
    if ( selectedLength === 0 ) {
      this.$btConfirm.attr('disabled', true);
    } else {
      this.$btConfirm.attr('disabled', false);
    }
  }
};
