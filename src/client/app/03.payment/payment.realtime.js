/**
 * FileName: payment.realtime.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.23
 */

Tw.PaymentRealtime = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.common = new Tw.Common();
  this.historyObj = {};
  this.historyName = 'realtime';
  this.pathname = window.location.pathname;

  this._init();
  this._bindEvent();
};

Tw.PaymentRealtime.prototype = {
  _init: function () {
    // page 진입 시 history push call
    Tw.History.push(this.historyObj, this.historyName);
  },
  _bindEvent: function () {
    this.$container.on('click', '.btn', $.proxy(this._toggleEvent, this));
    this.$container.on('click', '.complete', $.proxy(this._setHistory, this));
    this.$window.on('hashchange', $.proxy(this._hashChangeEvent, this));
  },
  _setHistory: function (event) {
    if ($(event.target).hasClass('complete')) {
      this.$container.addClass('complete');

      // 마지막 페이지 진입했을 경우 history replace call
      Tw.History.replace(this.historyObj, this.historyName);
    }
  },
  _hashChangeEvent: function () {
    this._showAndHide();
    this._resetHistory(); // history reset event
  },
  _showAndHide: function () {
    var id = window.location.hash;
    if (Tw.FormatHelper.isEmpty(id)) id = '#main';

    var $selector = this.$container.find(id);
    $selector.siblings().hide();
    $selector.show();
  },
  _resetHistory: function () {
    if (this._isReturedMain() && this._isCompleted()) {
      var len = -(history.length - 3);
      Tw.History.go([len]);
    }
  },
  _isReturedMain: function () {
    return Tw.FormatHelper.isEmpty(window.location.hash);
  },
  _isCompleted: function () {
    return this.$container.hasClass('complete');
  },
  _toggleEvent: function (event) {
    this.common.toggle($(event.currentTarget));
  }
};