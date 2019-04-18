/**
 * @file customer.email.service.option.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.10.29
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
    this.listLimit = 20; // 한번에 더 보기 갯수 (리스트에서 사용)
  },

  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    this.tpl_service_direct_order = Handlebars.compile($('#tpl_service_direct_order').html());
  },

  _bindEvent: function () {
    this.$wrap_tpl_service.on('click', '.fe-select-line', $.proxy(this._selectLine, this));
    // this.$container.on('click', '[data-svcmgmtnum]', $.proxy(this._selectLineCallback, this));
    this.$container.on('click', '.fe-select-brand', $.proxy(this._getDirectBrand, this)); // 브랜드 선택 (다이렉트 케이스)
    this.$container.on('click', '.fe-select-device', $.proxy(this._getDirectDevice, this));
    this.$container.on('click', '.fe-search-order', $.proxy(this._getOrderInfo, this)); // 주문조회 버튼 (다이렉트 케이스)
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
    this._onWebAccessPopup($layer);
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

  // 주문조회 API
  _getOrderInfo: function (e) {
    this._apiService.request(Tw.API_CMD.BFF_08_0016, { svcDvcClCd: 'M' })
      .done($.proxy(this._onSuccessOrderInfo, this, $(e.currentTarget)))
      .fail($.proxy(this._error, this));
  },

  // 브랜드 조회
  _getDirectBrand: function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $elTarget = $(e.currentTarget);

    this._apiService.request(Tw.API_CMD.BFF_08_0015)
      .done($.proxy(this._onSuccessDirectBrand, this, $elTarget))
      .fail($.proxy(this._error, this));
  },

  _getDirectDevice: function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $elTarget = $(e.currentTarget);

    if ( $('.fe-select-brand').data('brandcd') ) {
      this._apiService.request(Tw.API_CMD.BFF_08_0015, { brandCd: $('.fe-select-brand').data('brandcd') })
        .done($.proxy(this._onSuccessDirectDevice, this, $elTarget))
        .fail($.proxy(this._error, this));
    }
  },

  _onSuccessOrderInfo: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var htOrderInfo = this._convertOrderInfo(res.result || {});
      this._popupService.open($.extend({
          hbs: 'CS_04_01_L03',
          layer: true,
        }, htOrderInfo),
        $.proxy(this._handleOrderCallback, this),
        null,
        'OrderInfo',
        $target
      );
      skt_landing.widgets.widget_init('.fe-wrap_direct_order');
    } else {
      Tw.Error(res.code, res.msg).pop(null, $target);
    }
  },

  _convertOrderInfo: function (list) {
    var htOrderList = $.extend({}, list, { isMoreListShop: false, isMoreListUsed: false });

    if (list.listShop && list.listShop.length > this.listLimit ) {
      htOrderList.isMoreListShop = true;
    }

    if (list.listUsed && list.listUsed.length > this.listLimit ) {
      htOrderList.isMoreListUsed = true;
    }

    return htOrderList;
  },

  // 더 보기
  _onShowMoreList: function (e) {
    var $elTarget = $(e.currentTarget);
    var $elTabPanel = $elTarget.closest('[role=tabpanel]');
    var leftLength = $elTabPanel.find('.list-comp-input.none').length - this.listLimit;

    this._setListStatus.show($elTabPanel.find('.list-comp-input.none').slice(0, this.listLimit));

    if (leftLength <= 0) {
      $elTarget.remove();
    }
  },

  _handleOrderCallback: function ($tempWrap) {
    // 주문조회 팝업 후
    // 20개 까지 리스트 노출
    this._setListStatus.show($tempWrap.find('#tab1-tab .list-comp-input').slice(0, this.listLimit));
    this._setListStatus.show($tempWrap.find('#tab2-tab .list-comp-input').slice(0, this.listLimit));
    
    $tempWrap.on('click', 'li.checkbox', $.proxy(this._selectOrder, this, $tempWrap)); // 체크이벤트 
    $tempWrap.on('click', '.fe-select-order', $.proxy(this._setOrderNumber, this, $tempWrap)); // 적용하기 버튼
    $tempWrap.on('click', '.fe-direct-more', $.proxy(this._onShowMoreList, this)) // 더보기 버튼
  },

  // 주문조회 선택
  _selectOrder: function ($tempWrap, e) {
    var $target = $(e.currentTarget);
    if ($target.is('.checked')) {
      // 선택된 주문 해제
      this._checkBox.uncheck($target);
      // 버튼 비활성화
      $('.fe-select-order', $tempWrap).prop('disabled', true);
    } else {
      // 선택된 주문 외 해제
      this._checkBox.uncheck($tempWrap.find('li.checkbox.checked'));
      // 선택된 주문 선택
      this._checkBox.check($target);
      // 버튼 활성화
      $('.fe-select-order', $tempWrap).prop('disabled', false);
    }
  },

  // 주문조회 적용하기
  _setOrderNumber: function ($tempWrap, e) {
    var orderNumber = $('li.checked .fe-order-number', $tempWrap).text();
    $('.fe-text_order', this.$container).val(orderNumber);
    $('.fe-text_order', this.$container).trigger('change');
    this._popupService.close();
  },

  // 주문조회 체크박스 
  _checkBox: {
    check: function ($target) {
      return $target.addClass('checked').find('input[type=checkbox]').prop('checked', true);
    },
    uncheck: function ($target) {
      return $target.removeClass('checked').find('input[type=checkbox]').prop('checked', false);
    }
  },

  // 주문조회 show / hide
  _setListStatus: {
    show: function ($target) {
      return $target.removeClass('none').attr('aria-hidden', false);
    },
    hide: function ($target) {
      return $target.addClass('none').attr('aria-hidden', true);
    }
  },

  _onSuccessDirectBrand: function ($elButton, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var fnSelectBrand = function (item, index) {
        return {
          txt: item.brandNm, 
          'radio-attr': 'data-index="' + index + '" data-brandCd="'+ item.brandCd +'"' + 
                      ($elButton.text() === item.brandNm ? ' checked' : ''),
          'label-attr': ' '
        };
      };

      this._popupService.open({
          hbs: 'actionsheet01',
          layer: true,
          // title: Tw.CUSTOMER_EMAIL.ACTION_TYPE.SELECT_BRAND,
          data: [{ list: res.result.map($.proxy(fnSelectBrand, this)) }],
          btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE }
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
      var resultList = res.result || [];
      var fnSelectDevice = function (item, index) {
        return {
          txt: item.modelNickName, 
          'radio-attr': 'data-index="' + index + '" data-phoneid="'+ item.phoneId +'"' + 
                      ($elButton.text() === item.modelNickName ? ' checked' : ''),
          'label-attr': ' '
        };
      };

      this._popupService.open({
          hbs: 'actionsheet01',
          layer: true,
          // title: Tw.CUSTOMER_EMAIL.ACTION_TYPE.SELECT_BRAND,
          btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
          data: [{ list: resultList.map($.proxy(fnSelectDevice, this)) }],
          btnmore: (resultList.length > Tw.DEFAULT_LIST_COUNT) ? { attr: 'class="fe-btn-more"', txt: Tw.BUTTON_LABEL.MORE } : false
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
    $layer.on('change', 'li input', $.proxy(this._setSelectedBrand, this, $target));
    this._onWebAccessPopup($layer);
  },

  _selectDevicePopupCallback: function ($target, $layer) {
    // 더보기 케이스 고려
    var nMaxList = Tw.DEFAULT_LIST_COUNT;
    if ( $layer.find('li').size() > nMaxList ) {
      $layer.find('li').slice(nMaxList).hide();
      $layer.on('click', '.fe-btn-more', $.proxy(this._onShowMoreDevice, this, $layer));
    }

    // 체인지 이벤트
    $layer.on('change', 'li input', $.proxy(this._setSelectedDevice, this, $target));
    this._onWebAccessPopup($layer);
  },

  _onShowMoreDevice: function ($layer) {
    if ( $layer.find('li').not(':visible').size() !== 0 ) {
      $layer.find('li').not(':visible').slice(0, Tw.DEFAULT_LIST_COUNT).show();
    }

    if ( $layer.find('li').not(':visible').size() === 0 ) {
      $layer.find('.btn-more').hide();
    }
  },

  _setSelectedBrand: function ($target, el) {
    var $el = $(el.currentTarget);
    var prev_txt = $target.text();
    this._popupService.close();

    $target.text($el.parents('li').find('.txt').text().trim());
    $target.data('brandcd', $el.data('brandcd'));

    if (prev_txt !== $target.text()) {
      this.$container.find('.fe-select-device').removeData('phoneid').text(Tw.CUSTOMER_EMAIL.ACTION_TYPE.SELECT_DEVICE);
    }
  },

  _setSelectedDevice: function ($target, el) {
    var $el = $(el.currentTarget);
    $target.data('phoneid', $el.data('phoneid'));
    $target.text($el.parents('li').find('.txt').text().trim());
    this._popupService.close();
  },

  _error: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  
  /**
   * @function [웹접근성]
   * @param {element} $layer 팝업액션시트 dom객체
   */
  _onWebAccessPopup: function ($layer) {
    $layer.on('click', 'li', $.proxy(this._onCommonClickService, this));
    this._onCommonFocus($layer);
  },

  _onCommonFocus: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); 
  },

  _onCommonClickService: function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).siblings().find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true).trigger('change');
  },
  // end 웹접근성
};