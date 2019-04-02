/**
 * FileName: customer.email.service.option.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailServiceOption = function (rootEl, allSvc) {
  this.allSvc = allSvc.allSvc;
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
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    this.tpl_service_direct_order = Handlebars.compile($('#tpl_service_direct_order').html());
  },

  _bindEvent: function () {
    this.$wrap_tpl_service.on('click', '.fe-select-line', $.proxy(this._selectLine, this));
    // this.$container.on('click', '[data-svcmgmtnum]', $.proxy(this._selectLineCallback, this));
    this.$container.on('click', '.fe-select-brand', $.proxy(this._getDirectBrand, this));
    this.$container.on('click', '.fe-select-device', $.proxy(this._getDirectDevice, this));
    this.$container.on('click', '.fe-search-order', $.proxy(this._getOrderInfo, this));
    this.$container.on('click', '.fe-select-order', $.proxy(this._setOrderNumber, this));
    this.$container.on('click', '.fe-wrap_direct_order .popup-closeBtn', $.proxy(this._closeDirectOrder, this));
    this.$container.on('click', '.fe-wrap_direct_order input[type="checkbox"]', $.proxy(this._disabledCheckbox, this));
    this.$container.on('click', '.fe-direct-more', $.proxy(this._onShowMoreList, this));
  },

  // 서비스문의 > 회선변경 
  _selectLine: function (e) {
    e.stopPropagation();
    e.preventDefault();
    // var $el = $(e.currentTarget);
    var category = this.$container.triggerHandler('getCategory');
    var lineList = [];

    if ( category.service.depth1 === 'CELL' ) {
      lineList = this.allSvc.m;
    }

    if ( category.service.depth1 === 'INTERNET' ) {
      lineList = this.allSvc.s;
    }

    var fnSelectLine = function (item, index) {
      var sItem;

      if ( item.svcGr === 'I' || item.svcGr === 'T' ) {
        sItem = item.addr;
      } else {
        sItem = Tw.FormatHelper.conTelFormatWithDash(item.svcNum);
      }

      return {
        txt: sItem, 
        'radio-attr': 'data-index="' + index + '" data-svcmgmtnum="'+ item.svcMgmtNum +'"' + 
                    ($('.fe-select-line').data('svcmgmtnum').toString() === item.svcMgmtNum ? ' checked' : ''),
        'label-attr': ' '
      };
    };

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        // title: Tw.CUSTOMER_VOICE.LINE_CHOICE,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: lineList.map($.proxy(fnSelectLine, this)) }]
      },
      $.proxy(this._handleSelectLineChange, this),
      null,
      null,
      $(e.currentTarget)
    );
  },

  // 서비스문의 > 회선변경 선택시
  _handleSelectLineChange: function ($layer) {
    $layer.on('change', 'li input', $.proxy(this._selectLineCallback, this));
  },

  // 서비스문의 > 회선변경 처리
  _selectLineCallback: function (e) {
    var $el = $(e.currentTarget);
    var nTabIndex = this.$container.triggerHandler('getTabIndex');
    if ( nTabIndex === 0 ) {
      $('#tab1-tab .fe-select-line').data('svcmgmtnum', $el.data('svcmgmtnum').toString());
      $('#tab1-tab .fe-select-line').text($el.parents('li').find('.txt').text().trim());
    } else {
      $('#tab2-tab .fe-quality-line').data('svcmgmtnum', $el.data('svcmgmtnum').toString());
      $('#tab2-tab .fe-quality-line').text($el.text().trim());
    }

    this._popupService.close();
  },

  _disabledCheckbox: function (e) {
    $('.fe-wrap_direct_order li.checked').each(function (nIndex, elChecked) {
      if ( !$(e.currentTarget).closest('li.checked').is($(elChecked)) ) {
        $(elChecked).removeClass('checked');
      }
    });

    $('.fe-select-order').prop('disabled', false);
  },

  _setOrderNumber: function () {
    var orderNumber = $('.fe-wrap_direct_order li.checked .fe-order-number').text();
    $('.fe-text_order').val(orderNumber);
    this._closeDirectOrder();
  },

  _getOrderInfo: function (e) {
    this._apiService.request(Tw.API_CMD.BFF_08_0016, { svcDvcClCd: 'M' })
      .done($.proxy(this._onSuccessOrderInfo, this, $(e.currentTarget)));
  },

  _getDirectBrand: function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $elTarget = $(e.currentTarget);

    this._apiService.request(Tw.API_CMD.BFF_08_0015)
      .done($.proxy(this._onSuccessDirectBrand, this, $elTarget));
  },

  _getDirectDevice: function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $elTarget = $(e.currentTarget);

    if ( $('.fe-select-brand').data('brandcd') ) {
      this._apiService.request(Tw.API_CMD.BFF_08_0015, { brandCd: $('.fe-select-brand').data('brandcd') })
        .done($.proxy(this._onSuccessDirectDevice, this, $elTarget));
    }
  },

  _onSuccessOrderInfo: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var htOrderInfo = this._convertOrderInfo(res.result);
      this.$container.append(this.tpl_service_direct_order(htOrderInfo));
      this._hideListItem();
      skt_landing.widgets.widget_init('.fe-wrap_direct_order');
    } else {
      Tw.Error(res.code, res.msg).pop(null, $target);
    }
  },

  _convertOrderInfo: function (list) {
    var htOrderList = $.extend({}, list, { isMoreListShop: false, isMoreListUsed: false });

    if ( list.listShop.length > 20 ) {
      htOrderList.isMoreListShop = true;
    }

    if ( list.listUsed.length > 20 ) {
      htOrderList.isMoreListUsed = true;
    }

    return htOrderList;
  },

  _onShowMoreList: function (e) {
    var elTarget = e.currentTarget;
    var elTabPanel = $(elTarget).closest('[role=tabpanel]');

    if ( elTabPanel.find('.list-comp-input').not(':visible').size() !== 0 ) {
      elTabPanel.find('.list-comp-input').not(':visible').slice(0, 20).show();
    }

    if ( elTabPanel.find('.list-comp-input').not(':visible').size() === 0 ) {
      elTarget.remove();
    }
  },

  _hideListItem: function () {
    $('#tab1-tab .list-comp-input').slice(20).hide();
    $('#tab2-tab .list-comp-input').slice(20).hide();
  },

  _onSuccessDirectBrand: function ($elButton, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var fnSelectBrand = function (item) {
        return {
          value: item.brandNm,
          option: $elButton.text() === item.brandNm ? 'checked' : '',
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
        null,
        null,
        $elButton
      );

    } else {
      Tw.Error(res.code, res.msg).pop(null, $elButton);
    }
  },

  _onSuccessDirectDevice: function ($elButton, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var fnSelectDevice = function (item) {
        return {
          value: item.modelNickName,
          option: $elButton.text() === item.modelNickName ? 'checked' : '',
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
        null, null, 
        $elButton
      );
    } else {
      Tw.Error(res.code, res.msg).pop(null, $elButton);
    }
  },

  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '[data-brandcd]', $.proxy(this._setSelectedBrand, this, $target));
  },

  _selectDevicePopupCallback: function ($target, $layer) {
    var nMaxList = 20;
    if ( $layer.find('li').size() > nMaxList ) {
      $layer.find('li').slice(nMaxList).hide();
      $layer.find('.btn-more').show();
      $layer.on('click', '.btn-more', $.proxy(this._onShowMoreDevice, this, $layer));
    }

    $layer.on('click', '[data-phoneid]', $.proxy(this._setSelectedDevice, this, $target));
  },

  _onShowMoreDevice: function ($layer) {
    if ( $layer.find('li').not(':visible').size() !== 0 ) {
      $layer.find('li').not(':visible').slice(0, 20).show();
    }

    if ( $layer.find('li').not(':visible').size() === 0 ) {
      $layer.find('.btn-more').hide();
    }
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
    // this._popupService.openConfirmButton(Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG, Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
    //   $.proxy($.proxy(function () {
    //     this._popupService.close();
    //     $('.fe-wrap_direct_order').remove();
    //   }, this), this), null, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  }
};