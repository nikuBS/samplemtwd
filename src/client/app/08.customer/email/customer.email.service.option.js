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
    this.tpl_service_direct_order = Handlebars.compile($('#tpl_service_direct_order').html());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-select-brand', $.proxy(this._getDirectBrand, this));
    this.$container.on('click', '.fe-select-device', $.proxy(this._getDirectDevice, this));
    this.$container.on('click', '.fe-search-order', $.proxy(this._getOrderInfo, this));
    this.$container.on('click', '.fe-select-order', $.proxy(this._setOrderNumber, this));
    this.$container.on('click', '.fe-wrap_direct_order .popup-closeBtn', $.proxy(this._closeDirectOrder, this));
    this.$container.on('click', '.fe-wrap_direct_order input[type="checkbox"]', $.proxy(this._disabledCheckbox, this));
  },

  _disabledCheckbox: function (e) {
    $('.fe-wrap_direct_order li.checked').each(function (nIndex, elChecked) {
      if ( !$(e.currentTarget).closest('li.checked').is($(elChecked)) ) {
        $(elChecked).removeClass('checked');
      }
    });

    $('.fe-select-order').prop('disabled', false);
  },

  _setOrderNumber: function (e) {
    var orderNumber = $('.fe-wrap_direct_order li.checked .fe-order-number').text();
    $('.fe-text_order').val(orderNumber);
    this._closeDirectOrder();
  },

  _getOrderInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0016, { svcDvcClCd: 'M' })
      .done($.proxy(this._onSuccessOrderInfo, this));
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

  _onSuccessOrderInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.$container.append(this.tpl_service_direct_order(res.result));
      skt_landing.widgets.widget_init('.fe-wrap_direct_order');
    } else {
      Tw.Error(res.code, res.msg).pop();
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
  },

  _closeDirectOrder: function () {
    $('.fe-wrap_direct_order').remove();
  }
};