/**
 * FileName: recharge.ting.history.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeTingHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeTingHistory.prototype = {
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0026, {
      type: this.searchType,
      fromDt: Tw.DateHelper.getCurrentShortDate,
      endDt: Tw.DateHelper.getShortDateWithFormatAddByUnit(new Date(), this.searchPeriod, 'month', 'YYYYMMDD')
    })
      .done(function () {
        // TODO: Activate Block
      })
      .fail($.proxy(this._sendFail, this));
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.select-submit', $.proxy(this.onConfirm, this));
    this.$container.on('click', '.bt-dropdown.small', $.proxy(this.openWidget, this));
    this.$container.on('click', '.search_condition', $.proxy(this._onSelectCondition, this));
  },

  onConfirm: function () {

  },

  _onSelectCondition: function () {
    this.searchType = $('.wrap_search_type').find('input:checked').val();
    this.searchPeriod = $('.wrap_search_period').find('input:checked').val();


  },

  openWidget: function () {
    skt_landing.action.popup.open({
      hbs: 'select',
      title: Tw.POPUP_TITLE.CHANGE_SEARCH_CONDITION,
      multiplex: true,
      close_bt: true,
      select: [{
        title: 'Type',
        class: 'three wrap_search_type',
        options: [
          {
            checked: true,
            value: '0',
            text: Tw.POPUP_PROPERTY.ALL
          },
          {
            checked: false,
            value: '1',
            text: Tw.POPUP_PROPERTY.SEND
          },
          {
            checked: false,
            value: '2',
            text: Tw.POPUP_PROPERTY.RECEIVE
          }
        ]
      }, {
        title: Tw.POPUP_PROPERTY.PERIOD,
        class: 'two wrap_search_period',
        options: [
          {
            checked: true,
            value: '-1',
            text: Tw.DATE_UNIT.ONE_MONTH
          }, {
            checked: false,
            value: '-3',
            text: Tw.DATE_UNIT.THREE_MONTH
          }, {
            checked: false,
            value: '-6',
            text: Tw.DATE_UNIT.SIX_MONTH
          }, {
            checked: false,
            value: '-12',
            text: Tw.DATE_UNIT.ONE_YEAR
          }
        ]
      }],
      bt_num: 'one',
      type: [{
        class: 'bt-red1 search_condition',
        href: '',
        txt: Tw.BUTTON_LABEL.SELECT
      }]
    });
  },

  _onSuccessGetProvider: function () {
  },

  _sendFail: function () {
  }
};