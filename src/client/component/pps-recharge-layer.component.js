/**
 * FileName: pps-recharge-layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.11.20
 *
 */

Tw.PPSRechargeLayer = function ($element) {
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this.data = {}; // 초기화
  this._initialize();
};

Tw.PPSRechargeLayer.prototype = {

  _initialize: function () {
    this._ppsChargeRequest();
  },
  // api request
  _ppsChargeRequest: function () {
    var apiList = [
      { command: Tw.API_CMD.BFF_06_0055, params: {} },
      { command: Tw.API_CMD.BFF_06_0060, params: {} }
    ];
    this._apiService.requestArray(apiList)
      .done($.proxy(function (autoVoice, autoData) {
        if ( autoVoice.code === Tw.API_CODE.CODE_00 ) {
          if ( !_.isEmpty(autoVoice.result) ) {
            this.data.autoVoice = autoVoice.result;
          }
          else {
            this.data.autoVoice = null;
          }
        }
        if ( autoData.code === Tw.API_CODE.CODE_00 ) {
          if ( !_.isEmpty(autoVoice.result) ) {
            this.data.autoData = autoData.result;
          }
          else {
            this.data.autoData = null;
          }
        }
        this._openPopup();
      }, this));
  },

  _openPopup: function () {
    var data = [];
    data.push({
      type: Tw.POPUP_TPL.PPS_CHARGE_DATA.VOICE,
      list: [{
        option: 'once-voice',
        value: Tw.POPUP_TPL.PPS_CHARGE_DATA.ONCE
      }, {
        option: this.data.autoVoice ? 'auto-voice' : 'auto-change-voice',
        value: this.data.autoVoice ? Tw.POPUP_TPL.PPS_CHARGE_DATA.AUTO : Tw.POPUP_TPL.PPS_CHARGE_DATA.AUTO_CHANGE
      }]
    });
    data.push({
      type: Tw.POPUP_TPL.PPS_CHARGE_DATA.VOICE,
      list: [{
        option: 'once-data',
        value: Tw.POPUP_TPL.PPS_CHARGE_DATA.ONCE
      }, {
        option: this.data.autoData ? 'auto-data' : 'auto-change-data',
        value: this.data.autoData ? Tw.POPUP_TPL.PPS_CHARGE_DATA.AUTO : Tw.POPUP_TPL.PPS_CHARGE_DATA.AUTO_CHANGE
      }]
    });

    this._popupService.open({
        hbs: 'DC_09',// hbs의 파일명
        layer: true,
        title: Tw.POPUP_TPL.PPS_CHARGE_DATA.TITLE,
        data: data
      }, $.proxy(this._onPopupOpened, this),
      $.proxy(this._onPopupClosed, this), 'DC_09');
  },

  // DC_O9 팝업 호출 후
  _onPopupOpened: function ($container) {
    this.$popupContainer = $container;
    var items = $container.find('li');
    for ( var i = 0; i < items.length; i++ ) {
      var item = items.eq(i);
      var classNm = item.attr('class');
      switch ( classNm ) {
        case 'once-voice':
          item.on('click', $.proxy(this._onClickOnce, this, classNm));
          break;
        case 'once-data':
          item.on('click', $.proxy(this._onClickOnce, this, classNm));
          break;
        case 'auto-voice':
          item.on('click', $.proxy(this._onClickAuto, this, classNm));
          break;
        case 'auto-change-voice':
          item.on('click', $.proxy(this._onClickAutoChange, this, classNm));
          break;
        case 'auto-data':
          item.on('click', $.proxy(this._onClickAuto, this, classNm));
          break;
        case 'auto-change-data':
          item.on('click', $.proxy(this._onClickAutoChange, this, classNm));
          break;
      }
    }
  },

  // DC_09 팝업 close 이후 처리 부분
  _onPopupClosed: function () {
    var $target = this.$popupContainer.find('[data-url]');
    if ( $target.length > 0 ) {
      this._historyService.goLoad($target.attr('data-url'));
    }
  },

  // DC_09 팝업내 아이템 선택시 이동
  _onClickOnce: function (event, name) {
    var $target = $(event.target);
    var url = ''; // default - data
    if ( name === 'once-voice' ) {

    }
    $target.attr('data-url', url);
    this._popupService.close();
  },

  _onClickAuto: function (event) {
    var $target = $(event.target);
    var url = ''; // default - data
    if ( name === 'auto-voice' ) {

    }
    $target.attr('data-url', url);
    this._popupService.close();
  },

  _onClickAutoChange: function (event) {
    var $target = $(event.target);
    var url = ''; // default - data
    if ( name === 'auto-change-voice' ) {

    }
    $target.attr('data-url', url);
    this._popupService.close();
  }
};