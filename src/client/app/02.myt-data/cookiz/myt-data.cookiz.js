/**
 * FileName: myt-data.cookiz.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataCookiz = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataCookiz.prototype = {
  _init: function () {
    // If there is hash #auto, show second tab(auto gift)
    if ( window.location.hash === '#auto' ) {
      this._goAutoTab();
      $('.fe-recharge_cookiz_immediately').hide();
      $('.fe-recharge_cookiz_monthly').show();
      
      //하단 버튼이 없을 경우 fixed-bottom 클래스 삭제
      if($('.fe-recharge_cookiz_monthly').length === 0 ){
        $('#fe-cookiz-wrap').removeClass('fixed-bottom');
      }else{
        $('#fe-cookiz-wrap').addClass('fixed-bottom');
      }
    }else{
      $('.fe-recharge_cookiz_monthly').hide();
      $('.fe-recharge_cookiz_immediately').show();
    }

    this._getReceiveUserInfo();
  },

  _cachedElement: function () {
    this.$btn_recharge_monthly = this.$container.find('.fe-recharge_cookiz_monthly');
    this.$btn_cancel_auto_recharge = this.$container.find('.fe-cancel_auto_recharge');
    this.$wrap_monthly_select_list = this.$container.find('.fe-cookiz_monthly_select_list');
    this.$btn_recharge_immediately = this.$container.find('.fe-recharge_cookiz_immediately');
    this.$wrap_immediately_select_list = this.$container.find('.fe-cookiz_immediately_select_list');
  },

  _bindEvent: function () {
    // this.$btn_recharge_monthly.on('click', $.proxy(this._rechargeMonthly, this));
    // this.$btn_recharge_immediately.on('click', $.proxy(this._rechargeImmediately, this));
    // this.$btn_cancel_auto_recharge.on('click', $.proxy(this._cancelMonthlyRecharge, this));
    // this.$wrap_monthly_select_list.on('click', $.proxy(this._onSelectMonthlyAmount, this));
    // this.$wrap_immediately_select_list.on('click', $.proxy(this._onSelectImmediatelyAmount, this));
  },

  // _onSelectImmediatelyAmount: function () {
  //   if ( this.$wrap_immediately_select_list.find('input:checked').size() !== 0 ) {
  //     this.$btn_recharge_immediately.prop('disabled', false);
  //   }
  // },
  //
  // _onSelectMonthlyAmount: function () {
  //   if ( this.$wrap_monthly_select_list.find('input:checked').size() !== 0 ) {
  //     this.$btn_recharge_monthly.prop('disabled', false);
  //   }
  // },

  _getReceiveUserInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0028, { childSvcMgmtNum: '' }).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var result = res.result;
      this._setAmountUI(Number(result.currentTopUpLimit));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);

      if ( Number($input.val()) > nLimitMount ) {
        $input.prop('disabled', true);
        $input.parent().addClass('disabled');
      }
    };

    this.$wrap_monthly_select_list.find('input').each(fnCheckedUI);
    this.$wrap_immediately_select_list.find('input').each(fnCheckedUI);
  },

  _goAutoTab: function () {
    this.$container.find('#tab1').attr('aria-selected', false).find('a').attr('aria-selected', false);
    this.$container.find('#tab2').attr('aria-selected', true).find('a').attr('aria-selected', true);
  }

  // _rechargeImmediately: function () {
  //   var htParams = {
  //     amt: this.$wrap_immediately_select_list.find('li.checked input').val()
  //   };
  //
  //   this._apiService.request(Tw.API_CMD.BFF_06_0029, htParams)
  //     .done($.proxy(this._onSuccessRechargeImmediately, this));
  // },
  //
  // _onSuccessRechargeImmediately: function (res) {
  //   if ( res.code === Tw.API_CODE.CODE_00 ) {
  //     this._historyService.replaceURL('/myt-data/recharge/cookiz/complete');
  //   } else {
  //     Tw.Error(res.code, res.msg).pop();
  //   }
  // },
  //
  // _rechargeMonthly: function () {
  //   var htParams = {
  //     amt: this.$wrap_monthly_select_list.find('li.checked input').val()
  //   };
  //
  //   this._apiService.request(Tw.API_CMD.BFF_06_0030, htParams)
  //     .done($.proxy(this._onSuccessRechargeMonthly, this));
  // },
  //
  // _onSuccessRechargeMonthly: function (res) {
  //   if ( res.code === Tw.API_CODE.CODE_00 ) {
  //     this._historyService.replaceURL('/myt-data/recharge/cookiz/complete');
  //   } else {
  //     Tw.Error(res.code, res.msg).pop();
  //   }
  // },
  //
  // _cancelMonthlyRecharge: function (e) {
  //   this._popupService.openModalTypeA(
  //     Tw.MYT_DATA_CANCEL_MONTHLY.TITLE,
  //     Tw.MYT_DATA_CANCEL_MONTHLY.CONTENTS,
  //     Tw.MYT_DATA_CANCEL_MONTHLY.BTN_NAME,
  //     null,
  //     $.proxy(this._cancelMonthly, this),
  //     null,
  //     null,
  //     null,
  //     $(e.currentTarget)
  //   );
  // },
  //
  // _cancelMonthly: function () {
  //   this._popupService.close();
  //   this._apiService.request(Tw.API_CMD.BFF_06_0031, {})
  //     .done($.proxy(this._onSuccessCancelRechargeMonthly, this));
  // },
  //
  // _onSuccessCancelRechargeMonthly: function (res) {
  //   if ( res.code === Tw.API_CODE.CODE_00 ) {
  //     this._historyService.reload();
  //   } else {
  //     Tw.Error(res.code, res.msg).pop();
  //   }
  // },

  // _validatePhoneNumber: function (sPhone) {
  //   if ( sPhone.length < 10 ) {
  //     Tw.Error(null, Tw.VALIDATE_MSG_MYT_DATA.V18).pop();
  //     return false;
  //   }
  //
  //   if ( !Tw.FormatHelper.isCellPhone(sPhone) ) {
  //     Tw.Error(null, Tw.VALIDATE_MSG_MYT_DATA.V9).pop();
  //     return false;
  //   }
  //
  //   return true;
  // }
};