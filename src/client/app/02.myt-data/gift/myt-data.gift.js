/**
 * @file myt-data.gift.js
 * @author Hakjoon Sim (hakjoon.simk@sk.com)
 * @since 2018.10.08
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
  LIMITED_GIFT_USAGE_QTY: 500, // 기본 잔여 데이터 500MB

  _init: function () {
    // If there is hash #auto, show second tab(auto gift)
    if ( window.location.hash === '#auto' ) { // 자동선물
      this._goAutoGiftTab();
      $('.fe-request_sending_data').hide();
      $('.fe-request_sending_auto').show();
    }else{ // 바로선물
      $('.fe-request_sending_auto').hide();
      $('.fe-request_sending_data').show();

      this.reqCnt = 0;
      this.currentRemainDataInfo = null;
      this._getRemainDataInfo();
    }
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
    this.$remainTxt = $('.fe-txt-remain');
    this.$remainBtn = $('.fe-btn-remain');
    this.$wrapSuccessRemainApi = $('.fe-remain-api');
    this.$wrapErrorRemainApi = $('.fe-err-api');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-available_product', $.proxy(this._onClickShowAvailableProduct, this));
    this.$container.on('click', '.fe-close-available_product', $.proxy(this._hideAvailableProduct, this));
    this.$container.on('click', '.fe-show-more-amount', $.proxy(this._onShowMoreData, this));
    this.$inputImmediatelyGift.on('focus', $.proxy(this._onLoadRecently, this));
    // this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));
    this.$container.on('currentRemainDataInfo', $.proxy(this._currentRemainDataInfo, this));
    this.$remainBtn.on('click', $.proxy(this._getRemainDataInfo, this));
  },

  _getRemainDataInfo: function (e) {
    var $target = e ? $(e.currentTarget) : null;
    this.$remainBtn.hide();
    this.$remainTxt.show();

    setTimeout(function () {
      this._apiService.request(Tw.API_CMD.BFF_06_0014, { reqCnt: this.reqCnt })
        .done($.proxy(this._onSuccessRemainDataInfo, this, $target));
    }.bind(this), 3000);
  },

  _currentRemainDataInfo: function () {
    return this.currentRemainDataInfo ? this.currentRemainDataInfo : null;
  },

  _onSuccessRemainDataInfo: function ($target, res) {
    // MOCK DATA
    // var mockDataQty = '900';
    // var mockData = Tw.FormatHelper.convDataFormat(mockDataQty, 'MB');
    // this.currentRemainDataInfo = mockDataQty;
    // this.$remainQty.text(mockData.data + mockData.unit);
    // this._setAmountUI(Number(mockDataQty));

    // if ( Number(this.reqCnt) > 3 ) {
    //   this._remainApiError($target);
    //   return;
    // }

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var result = res.result;
      if ( result.giftRequestAgainYn === 'N' ) {
        if ( Tw.FormatHelper.isEmpty(result.dataRemQty) ) {
          this._remainApiError($target);
        } else if ( Number(result.dataRemQty) < this.LIMITED_GIFT_USAGE_QTY ) {
          this.$container.trigger('showUnableGift', 'GFT0004');
        } else {
          // API DATA SUCCESS
          this._remainApiSuccess();
          var apiDataQty = res.result.dataRemQty;
          var dataQty = Tw.FormatHelper.convDataFormat(apiDataQty, 'MB');
          this.currentRemainDataInfo = apiDataQty;
          this.$remainQty.text(dataQty.data + dataQty.unit);
          this._setAmountUI(Number(apiDataQty));
        }
      } else {
        this.reqCnt = result.reqCnt;
        this._getRemainDataInfo($target);
      }
    } else if ( res.code === 'GFT0004' ) {
      this.$container.trigger('showUnableGift', res.code);
    } else {
      this.$container.trigger('showUnableGift', res.code);
      // Tw.Error(res.code, res.msg).pop();
    }
  },

  _remainApiError: function ($target) {
    this.$wrapSuccessRemainApi.hide();
    this.$wrapErrorRemainApi.show();
    this.$remainBtn.show();
    this.$remainTxt.hide();
    // this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A217, null, null, null, null, $target);
  },

  _remainApiSuccess: function () {
    this.$wrapSuccessRemainApi.show();
    this.$wrapErrorRemainApi.hide();
    this.$remainBtn.hide();
    this.$remainTxt.show();
  },

  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);
      var nInputMount = Number($input.val());
      if ( nLimitMount - nInputMount < this.LIMITED_GIFT_USAGE_QTY) {
        $input.prop('disabled', true);
        $input.parent().parent().addClass('disabled');
      } else {
        $input.prop('disabled', false);
        $input.parent().parent().removeClass('disabled');
      }
    };

    this.$wrap_data_select_list.find('input').each($.proxy(fnCheckedUI, this));
  },

  _onLoadRecently: function () {
    if (this.recentGiftSentList && this.recentGiftSentList.length > 0) {
      this._drawRecentSentList();
      return;
    }
    this._apiService.request(Tw.API_CMD.BFF_06_0018, {
      fromDt: Tw.DateHelper.getPastYearShortDate(),
      toDt: Tw.DateHelper.getCurrentShortDate(),
      type: '1'
    }).done($.proxy(this._onSuccessRecently, this));
  },

  _onSuccessRecently: function (res) {
    var tempContactList = [];

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var contactList = res.result;

      var list = _.filter(contactList, function (contact) {
        if ( contact.giftType === 'G1' && tempContactList.indexOf(contact.svcNum) === -1 ) {
          tempContactList.push(contact.svcNum);
          return true;
        }
        return false;
      });

      var filteredList = list.splice(0, 3).map(function (item) {
        return $.extend(item, { svcNum: Tw.FormatHelper.conTelFormatWithDash(item.svcNum) });
      });
      this.recentGiftSentList = filteredList;
      if (this.recentGiftSentList && this.recentGiftSentList.length > 0) {
        this._drawRecentSentList();
      }
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _drawRecentSentList: function() {
    this.$recent_tel.html(this.tpl_recently_gift({ contactList: this.recentGiftSentList }));
    this.$recent_tel.show();
  },

  _hideRecently: function () {
    this.$recent_tel.hide();
  },

  _goAutoGiftTab: function () {
    this.$container.find('#tab1').attr('aria-selected', false).find('a').attr('aria-selected', false);
    this.$container.find('#tab2').attr('aria-selected', true).find('a').attr('aria-selected', true);
  },

  _onShowMoreData: function (e) {
    var $btn_show_data = $(e.currentTarget);

    $btn_show_data.closest('.data-gift-wrap').find('li').show();
    $btn_show_data.remove();
    $('.fe-more-focus').focus(); //웹 접근성 강제 초점 이동
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
    $('.fe-layer_available_product').scrollTop(0);
    $('.fe-layer_available_product').css('position', 'fixed');
  },

  _hideAvailableProduct: function () {
    this.wrap_available_product.hide();
  },

  _stepBack: function (e) {
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
      Tw.BUTTON_LABEL.YES,
      $(e.currentTarget)
    );
  }
};
