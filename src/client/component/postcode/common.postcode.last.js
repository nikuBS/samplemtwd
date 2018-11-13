/**
 * FileName: common.postcode.last.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.13
 */

Tw.CommonPostcodeLast = function ($container, $addressObject) {
  this.$container = $container;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._inputHelper = Tw.InputHelper;

  this._init($addressObject);
};

Tw.CommonPostcodeLast.prototype = {
  _init: function ($addressObject) {
    this._popupService.open({
        hbs: 'CO_UT_05_04_03'
      },
      $.proxy(this._onLastEvent, this, $addressObject),
      $.proxy(this._saveAddress, this),
      'post0003'
    );
  },
  _onLastEvent: function ($addressObject, $layer) {
    this.$layer = $layer;

    this._setInitTab($addressObject);
    this._initVariables($addressObject.tabId);
    this._initData($addressObject);
    this._bindEvent();
  },
  _saveAddress: function () {
    if (this.$isNext) {
      this.$container.find('.fe-zip').val(this.$saveAddress.zip);
      this.$container.find('.fe-main-address').val(this.$saveAddress.main);
      this.$container.find('.fe-detail-address').val(this.$saveAddress.detail);
    }
  },
  _setInitTab: function ($addressObject) {
    var $selectedTarget = this.$layer.find('#' + $addressObject.tabId);
    $selectedTarget.attr('aria-selected', 'true');
    $selectedTarget.siblings().attr('aria-selected', 'false');
    $selectedTarget.siblings().attr('aria-disabled', 'true');
  },
  _initVariables: function ($targetId) {
    this._selectedTabId = $targetId;
    this.$isNext = false;
    this.$selectedTab = this.$layer.find('#' + $targetId + '-tab');
    this.$saveBtn = this.$selectedTab.find('.fe-save');
    this.$saveAddress = {};
  },
  _initData: function ($addressObject) {
    this.$selectedTab.find('.fe-main').text($addressObject.main);
    this.$selectedTab.find('.fe-number').text($addressObject.number);
    this.$selectedTab.find('.fe-building').text($addressObject.building);
    this.$selectedTab.find('.fe-zip').text($addressObject.zip);
  },
  _bindEvent: function () {
    this.$layer.on('keyup', '.fe-address', $.proxy(this._checkIsAbled, this));
    this.$layer.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$layer.on('click', '.fe-prevent li', $.proxy(this._preventDefault, this));
    this.$layer.on('click', '.fe-save', $.proxy(this._save, this));
  },
  _checkIsAbled: function (event) {
    var $address = $(event.currentTarget).val();
    if (Tw.FormatHelper.isEmpty($.trim($address))) {
      this.$saveBtn.attr('disabled', 'disabled');
    } else {
      this.$saveBtn.removeAttr('disabled');
    }
  },
  _preventDefault: function (event) {
    event.preventDefault();
  },
  _save: function () {
    this.$isNext = true;
    this.$saveAddress = {
      zip: $.trim(this.$selectedTab.find('.fe-zip').text()),
      main: $.trim(this.$selectedTab.find('.fe-main').text()) + ' ' +
        $.trim(this.$selectedTab.find('.fe-number').text()),
      detail: $.trim(this.$selectedTab.find('.fe-building').text()) + ' ' +
        $.trim(this.$selectedTab.find('.fe-address').val())
    };
    this._popupService.close();
  }
};