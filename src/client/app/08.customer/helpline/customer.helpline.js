/**
 * FileName: customer.helpline.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.25
 */

Tw.CustomerHelpline = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerHelpline.prototype = {
  _init: function () {
    this._availableTimes = this.$btnTime.data('available-times');
    this._reservationTime = this._availableTimes[0];
    this._reservationType = 0;
  },

  _bindEvent: function () {
    this.$container.on('click', '.form-cell button', $.proxy(this._openSelectPopup, this));
  },

  _cachedElement: function () {
    this.$btnType = this.$container.find('#fe-btn-type');
    this.$btnArea = this.$container.find('#fe-btn-area');
    this.$btnTime = this.$container.find('#fe-btn-time');
  },

  _openSelectPopup: function (e) {
    var target = e.currentTarget;
    if (target.id === 'fe-btn-type') {
      this._openSelectTypePopup();
    } else if (target.id === 'fe-btn-area') {
      this._openSelectAreaPopup();
    } else if (target.id === 'fe-btn-time') {
      this._openSelectTimePopup();
    }
  },

  _openSelectTypePopup: function () {
    this._popupService.open({
      'hbs': 'select',
      'title': Tw.POPUP_TITLE.SET_HELPLINE_TYPE,
      'select': [
        {
          'options': [
            { 'title': Tw.HELPLINE_TYPE.GENERAL, checked: this._reservationType == 0, value: 0, text: Tw.HELPLINE_TYPE.GENERAL },
            { 'title': Tw.HELPLINE_TYPE.ROAMING, checked: this._reservationType == 1, value: 1, text: Tw.HELPLINE_TYPE.ROAMING },
            { 'title': Tw.HELPLINE_TYPE.QUALITY, checked: this._reservationType == 2, value: 2, text: Tw.HELPLINE_TYPE.QUALITY }
          ]
        },
      ],
      'bt_num': 'one',
      'type': [{
        style_class: 'bt-red1',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._handleSelectType, this));
  },

  _openSelectAreaPopup: function () {
    this._popupService.open({
      'hbs': 'choice',
      'title': Tw.POPUP_TITLE.SET_HELPLINE_AREA,
      'close_bt': true,
      'list': [
        { 'attr': 'data-area-code="1"', text: Tw.HELPLINE_AREA.CAPITAL },
        { 'attr': 'data-area-code="5"', text: Tw.HELPLINE_AREA.CENTER },
        { 'attr': 'data-area-code="4"', text: Tw.HELPLINE_AREA.EAST },
        { 'attr': 'data-area-code="3"', text: Tw.HELPLINE_AREA.DAEGU },
        { 'attr': 'data-area-code="2"', text: Tw.HELPLINE_AREA.BUSAN },
      ]
    }, $.proxy(this._handleSelectArea, this));
  },

  _openSelectTimePopup: function () {
    var times = this._availableTimes.map($.proxy(this._getTimeData, this));

    this._popupService.open({
      'hbs': 'select',
      'title': Tw.POPUP_TITLE.SET_HELPLINE_TIME,
      'select': [{ 'options': times }],
      'bt_num': 'one',
      'type': [{
        style_class: 'bt-red1',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._handleSelectTime, this));
  },

  _handleSelectType: function ($layer) {
    $layer.on('click', '.btn-box button', $.proxy(this._handleConfirmType, this, $layer));
  },

  _handleSelectArea: function ($layer) {
    $layer.on('click', '.popup-choice-list button', $.proxy(this._handleAreaClick, this));
  },

  _handleSelectTime: function ($layer) {
    $layer.on('click', '.btn-box button', $.proxy(this._handleConfirmTime, this, $layer));
  },

  _handleAreaClick: function (e) {
    var selectedArea = e.target.getAttribute('data-area-code');

    if (selectedArea !== this._reservationArea) {
      this._reservationArea = selectedArea;
      this.$btnArea.text(e.target.innerText);
      this.$btnArea.removeClass('placeholder');
    }
    this._popupService.close();
  },

  _handleConfirmTime: function ($layer) {
    var selectedTime = $layer.find('.select-list li.checked input').attr('value');

    if (selectedTime !== this._reservationTime) {
      this._reservationTime = selectedTime;
      this.$btnTime.text(selectedTime + ':00');
    }
    this._popupService.close();
  },

  _handleConfirmType: function ($layer) {
    var selectedItem = $layer.find('.select-list li.checked input');
    var selectedType = selectedItem.attr('value');

    if (selectedType !== this._reservationType) {
      this._reservationType = selectedType;
      this.$btnType.text(selectedItem.attr('title'));
    }
    this._popupService.close();
  },

  _getTimeData: function (time) {
    return {
      title: time + Tw.TIME_UNIT.HOUR,
      checked: time === this._reservationTime,
      value: time,
      text: time + ':00'
    };
  }
}