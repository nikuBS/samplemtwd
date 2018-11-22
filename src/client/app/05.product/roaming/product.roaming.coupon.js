/**
 * FileName: product.roaming.coupon.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.09
 */

Tw.ProductRoamingCoupon = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingCoupon.prototype = {

  _cachedElement: function() {
    this.$btnAlarmApply = this.$container.find('.fe-btn_alarm_apply');
    this.$btnTerminate = this.$container.find('#inquire-btn');
  },

  _bindEvent: function() {
    this.$btnAlarmApply.on('click', $.proxy(this._alarmApply, this));
    this.$btnTerminate.on('click', $.proxy(this._goTerminate, this));
    this.$container.on('click', '#coupon-buy-btn', $.proxy(this._onViewclicked, this));
    this.$container.on('click', '#coupon-register-btn', $.proxy(this._onViewclicked, this));
    this.$container.on('click', '#coupon-inquire-btn', $.proxy(this._onViewclicked, this));
  },

  _alarmApply: function() {
    this._apiService.request(Tw.API_CMD.BFF_05_0126, {})
      .done($.proxy(this._applyResult, this));
  },

  _applyResult: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A39.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A39.TITLE, null, $.proxy(this._reload, this));
  },

  _goTerminate: function() {
    this._historyService.replaceURL('/product/roaming/fi/inquire');
  },

  _reload: function() {
    this._historyService.reload();
  },

  _onActionSheetOpened: function (selected, $root) {
    $root.on('click', '.hbs-card-type', $.proxy(this._onActionSelected, this));
  },

  _onActionSelected: function (e) {
    if($('.hbs-card-type').hasClass('checked')){
      $('.hbs-card-type').removeClass('checked');
    }

    $(e.target).parents('li').find('button').addClass('checked');
  },

  _onViewclicked: function (e) {

    e.preventDefault();
    e.stopPropagation();

    var selected = e.target;
    var hashName = '';
    var hbs = '';

    if(selected.id === 'coupon-buy-btn'){
      hashName = 'buy';
      hbs = 'RM_13_01';
    }else if(selected.id === 'coupon-register-btn'){
      hashName = 'regist';
      hbs = 'RM_13_02';
    }else if(selected.id === 'coupon-inquire-btn'){
      hashName = 'inquire';
      hbs = 'RM_13_03';
    }

    this._popupService.open({
        hbs: hbs,
        layer: true,
        data: Tw.POPUP_TPL.ROAMING_RETURN_PLACE
      },
      $.proxy(this._onActionSheetOpened, this, selected),
      $.proxy(this._onActionSheetClosed, this, selected), hashName);
  },

  _onActionSheetClosed: function () {
    this._popupService.close();
  }
};
