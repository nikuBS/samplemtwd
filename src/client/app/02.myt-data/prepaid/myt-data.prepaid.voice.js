/**
 * FileName: myt-data.prepaid.voice.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.14
 */

Tw.MyTDataPrepaidVoice = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidVoice.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$wrapExampleCard = $('.fe-wrap-example-card');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-close-example-card', $.proxy(this._onCloseExampleCard, this));
    this.$container.on('click', '.fe-btn-show-example', $.proxy(this._onShowExampleCard, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowSelectAmount, this));
  },

  _onShowSelectAmount: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectAmount = function (item) {
      return {
        value: item.title,
        option: false,
        attr: 'data-value=' + item.value
      };
    };
    if (this.$cardNumber.val() !== '') {
      this._apiService.request(Tw.API_CMD.BFF_07_0024, { cardNum: $.trim(this.$cardNumber.val()).substr(0, 6) })
        .done($.proxy(this._getSuccess, this))
        .fail($.proxy(this._getFail, this));
    }
    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_AMOUNT.list.map($.proxy(fnSelectAmount, this)) }]
      },
      $.proxy(this._selectPopupCallback, this, $elButton),
      null
    );
  },

  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedValue, this, $target));
  },

  _setSelectedValue: function ($target, e) {
    this._popupService.close();
    $target.text($(e.currentTarget).text());
    $target.data('amount', $(e.currentTarget).data('value'));
  },

  _onCloseExampleCard: function () {
    this.$wrapExampleCard.hide();
  },

  _onShowExampleCard: function () {
    this.$wrapExampleCard.show();
  }
};