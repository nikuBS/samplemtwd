/**
 * @file biometrics.terms.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.13
 */

Tw.BiometricsTerms = function (userId) {
  this._callback = null;
  this._userId = userId;

  this._popupService = Tw.Popup;
};

Tw.BiometricsTerms.prototype = {
  RESULT: {
    COMPLETE: '00',
    CANCEL: '01'
  },
  open: function (callback) {
    this._callback = callback;
    this._popupService.open({
      hbs: 'MA_03_01_02_01_01',
      layer: true
    }, $.proxy(this._onOpenBioTerms, this), $.proxy(this._onCloseBioTerms, this), 'terms');
  },
  _onOpenBioTerms: function ($popupContainer) {
    this.$allCheck = $popupContainer.find('#fe-check-all');
    this.$childChecks = $popupContainer.find('.fe-check-child');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');

    this.$allCheck.on('change', $.proxy(this._onClickAllCheck, this));
    this.$childChecks.on('change', $.proxy(this._onClickChildCheck, this));
    this.$btConfirm.on('click', $.proxy(this.onClickConfirm, this));

    this._enableBtns();
  },
  _onCloseBioTerms: function () {
    if ( this._closeCode === this.RESULT.COMPLETE ) {
      setTimeout($.proxy(function () {
        var biometricsComplete = new Tw.BiometricsComplete();
        biometricsComplete.open(this._callback);
      }, this), 100);
    }
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
    var biometiricsCert = new Tw.BiometricsCert(this._userId);
    biometiricsCert.open(this._callback, $.proxy(this._onCloseCallback, this));
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
  },
  _onCloseCallback: function (code) {
    this._closeCode = code;
    this._popupService.close();
  }
};
