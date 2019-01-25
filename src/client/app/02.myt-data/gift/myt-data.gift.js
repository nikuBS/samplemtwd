/**
 * FileName: myt-data.gift.js
 * Author: Hakjoon Sim (hakjoon.simk@sk.com)
 * Date: 2018.10.08
 */

Tw.MyTDataGift = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGift.prototype = {
  _init: function () {
    // If there is hash #auto, show second tab(auto gift)
    if ( window.location.hash === '#auto' ) {
      this._goAutoGiftTab();
    }

    this.reqCnt = 0;
    this.currentRemainDataInfo = null;
    this._getRemainDataInfo();
  },

  _cachedElement: function () {
    this.$recent_tel = this.$container.find('.recently-tel');
    this.$inputImmediatelyGift = this.$container.find('.fe-input_immediately_gift');
    this.wrap_available_product = this.$container.find('.fe-layer_available_product');
    this.tpl_recently_gift = Handlebars.compile($('#tpl_recently_gift').html());
    this.tpl_available_product = Handlebars.compile($('#tpl-available-product').html());
    this.$wrap_auto_select_list = $('.fe-auto_select_list');
    this.$wrap_data_select_list = $('.fe-immediately_data_select_list');
    this.$remainQty = $('.fe-remain_data');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-available_product', $.proxy(this._onClickShowAvailableProduct, this));
    this.$container.on('click', '.fe-close-available_product', $.proxy(this._hideAvailableProduct, this));
    this.$container.on('click', '.fe-show-more-amount', $.proxy(this._onShowMoreData, this));
    this.$inputImmediatelyGift.on('focus', $.proxy(this._onLoadRecently, this));
    this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));
    this.$container.on('currentRemainDataInfo', $.proxy(this._currentRemainDataInfo, this));
  },

  _getRemainDataInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0014, { reqCnt: this.reqCnt }).done($.proxy(this._onSuccessRemainDataInfo, this));
  },

  _currentRemainDataInfo: function () {
    return this.currentRemainDataInfo ? this.currentRemainDataInfo : null;
  },

  _onSuccessRemainDataInfo: function (res) {
    // MOCK DATA
    var mockDataQty = '900';
    var mockData = Tw.FormatHelper.convDataFormat(mockDataQty, 'MB');
    this.currentRemainDataInfo = mockDataQty;
    this.$remainQty.text(mockData.data + mockData.unit);
    this._setAmountUI(Number(mockDataQty));


    if ( this.reqCnt > 3 ) {
      // TODO: Alert get Info error
      // then, go back to submain
    }

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var result = res.result;
      // if ( result.giftRequestAgainYn === 'N' ) {
      //   // API DATA
      //   var apiDataQty = res.result.dataRemQty;
      //   var dataQty = Tw.FormatHelper.convDataFormat(apiDataQty, 'MB');
      //   this.currentRemainDataInfo = apiDataQty;
      //   this.$remainQty.text(dataQty.data + dataQty.unit);
      //   this._setAmountUI(Number(apiDataQty));
      // } else {
      //   this.reqCnt = this.reqCnt + 1;
      //
      //   setTimeout(function () {
      //     this._getReceiveUserInfo();
      //   }.bind(this), 3000);
      // }
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);
      if ( Number($input.val()) > nLimitMount ) {
        $input.prop('disabled', true);
        $input.parent().parent().addClass('disabled');
      } else {
        $input.prop('disabled', false);
        $input.parent().parent().removeClass('disabled');
      }
    };

    this.$wrap_data_select_list.find('input').each(fnCheckedUI);
    this.$wrap_auto_select_list.find('input').each(fnCheckedUI);
  },

  _onLoadRecently: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0018, {
      fromDt: Tw.DateHelper.getPastYearShortDate(),
      toDt: Tw.DateHelper.getCurrentShortDate(),
      giftType: 'G1'
    }).done($.proxy(this._onSuccessRecently, this));
  },

  _onSuccessRecently: function (res) {
    var tempContactList = [];

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var contactList = res.result;

      var list = _.filter(contactList, function (contact) {
        if ( tempContactList.indexOf(contact.svcNum) === -1 ) {
          tempContactList.push(contact.svcNum);
          return true;
        }
        return false;
      });

      var filteredList = list.splice(0, 3).map(function (item) {
        return $.extend(item, { svcNum: Tw.FormatHelper.conTelFormatWithDash(item.svcNum) });
      });

      this.$recent_tel.html(this.tpl_recently_gift({ contactList: filteredList }));
      this.$recent_tel.show();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _hideRecently: function () {
    this.$recent_tel.hide();
  },

  _goAutoGiftTab: function () {
    var $tab1 = this.$container.find('#tab1');
    var $tab2 = this.$container.find('#tab2');
    $tab1.attr('aria-selected', false);
    $tab2.attr('aria-selected', true);
  },

  _onShowMoreData: function (e) {
    var $btn_show_data = $(e.currentTarget);

    $btn_show_data.closest('.data-gift-wrap').find('li').show();
    $btn_show_data.remove();
  },

  _onClickShowAvailableProduct: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0066, { type: 'G', giftBefPsblYn: 'Y' })
      .done($.proxy(this._onSuccessAvailableProduct, this));
  },

  _onSuccessAvailableProduct: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var sortedList = Tw.FormatHelper.purifyPlansData(res.result);

      this.wrap_available_product.html(
        this.tpl_available_product({ sortedList: sortedList })
      );

      this._showAvailableProduct();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _showAvailableProduct: function () {
    this.wrap_available_product.show();
  },

  _hideAvailableProduct: function () {
    this.wrap_available_product.hide();
  },

  _stepBack: function () {
    var confirmed = false;
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy(function () {
        confirmed = true;
        this._popupService.close();
      }, this),
      $.proxy(function () {
        if ( confirmed ) {
          this._historyService.goBack();
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES
    );
  }
};
