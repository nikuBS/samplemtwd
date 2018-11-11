/**
 * FileName: customer.email.service.option.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailServiceOption = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailServiceOption.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-select-brand', $.proxy(this._getDirectBrand, this));
    this.$container.on('click', '.fe-select-device', $.proxy(this._getDirectDevice, this));
  },

  _getDirectBrand: function (e) {
    var $elTarget = $(e.currentTarget);

    this._apiService.request(Tw.API_CMD.BFF_08_0015)
      .done($.proxy(this._onSuccessDirectBrand, this, $elTarget));
  },

  _getDirectDevice: function (e) {
    var $elTarget = $(e.currentTarget);

    if ( $('.fe-select-brand').data('brandcd') ) {
      this._apiService.request(Tw.API_CMD.BFF_08_0015, { brandCd: $('.fe-select-brand').data('brandcd') })
        .done($.proxy(this._onSuccessDirectDevice, this, $elTarget));
    }
  },

  _onSuccessDirectBrand: function ($elButton, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var fnSelectBrand = function (item) {
        return {
          value: item.brandNm,
          option: false,
          attr: 'data-brandCd=' + item.brandCd
        };
      };

      this._popupService.open({
          hbs: 'actionsheet_select_a_type',
          layer: true,
          title: Tw.CUSTOMER_EMAIL.ACTION_TYPE.SELECT_BRAND,
          data: [{ list: res.result.map($.proxy(fnSelectBrand, this)) }]
        },
        $.proxy(this._selectPopupCallback, this, $elButton),
        null
      );

    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onSuccessDirectDevice: function ($elButton, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var fnSelectDevice = function (item) {
        return {
          value: item.modelNickName,
          option: false,
          attr: 'data-phoneid=' + item.phoneId
        };
      };

      this._popupService.open({
          hbs: 'actionsheet_select_a_type',
          layer: true,
          title: Tw.CUSTOMER_EMAIL.ACTION_TYPE.SELECT_BRAND,
          data: [{ list: res.result.map($.proxy(fnSelectDevice, this)) }]
        },
        $.proxy(this._selectDevicePopupCallback, this, $elButton),
        null
      );

    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '[data-brandcd]', $.proxy(this._setSelectedBrand, this, $target));
  },

  _selectDevicePopupCallback: function ($target, $layer) {
    $layer.on('click', '[data-phoneid]', $.proxy(this._setSelectedDevice, this, $target));
  },

  _setSelectedBrand: function ($target, el) {
    this._popupService.close();

    $target.text($(el.currentTarget).text().trim());
    $target.data('brandcd', $(el.currentTarget).data('brandcd'));
  },

  _setSelectedDevice: function ($target, el) {
    this._popupService.close();
    $target.data('phoneid', $(el.currentTarget).data('phoneid'));
    $target.text($(el.currentTarget).text().trim());
  }
};