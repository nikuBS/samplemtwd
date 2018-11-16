/**
 * FileName: myt-data.prepaid.voice.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.14
 */

Tw.MyTDataPrepaidVoice = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
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
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    // this.$selectAmount =
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-close-example-card', $.proxy(this._onCloseExampleCard, this));
    this.$container.on('click', '.fe-btn-show-example', $.proxy(this._onShowExampleCard, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowSelectAmount, this));
    this.$container.on('click', '.fe-request-prepaid-card', $.proxy(this._onRequestPrepaidCard, this));
    this.$container.on('change', '.fe-input_credit', $.proxy(this._validateCreditCard, this));
    this.$container.on('change input blur click', '#tab1-tab [required]', $.proxy(this._validatePrepaidCard, this));
    this.$container.on('change input blur click', '#tab2-tab [required]', $.proxy(this._validateCreditCard, this));
  },

  _validatePrepaidCard: function () {
    var arrValid = $.map($('#tab1-tab [required]'), function (item) {
      if ( $(item).val().length !== 0 ) {
        return true;
      }

      return false;
    });

    var isValid = !_.contains(arrValid, false);

    if ( isValid ) {
      $('.fe-request-prepaid-card').prop('disabled', false);
    } else {
      $('.fe-request-prepaid-card').prop('disabled', true);
    }
    return isValid;
  },

  _validateCreditCard: function () {
    // if ( this.$cardNumber.val() !== '' ) {
    //   this._apiService.request(Tw.API_CMD.BFF_06_0065, { cardNum: $.trim(this.$cardNumber.val()).substr(0, 6) })
    //     .done($.proxy(this._getCardInfo, this));
    // }
  },

  _onRequestPrepaidCard: function () {
    var htParams = {
      cardNum : $('.fe-prepaid-card').val(),
      serialNum: $('.fe-prepaid-serial').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0052, htParams)
      .done($.proxy(this._getCardInfo, this));
  },

  _getCardInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _isValidCreditCard: function () {
    return true;
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