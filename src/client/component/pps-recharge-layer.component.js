/**
 * @file pps-recharge-layer.component.js
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.11.20
 *
 */

Tw.PPSRechargeLayer = function ($element) {
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this.data = {}; // 초기화
  this._initialize();
};

Tw.PPSRechargeLayer.prototype = {

  _initialize: function () {
    this.defaultUrl = 'recharge/prepaid';
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
          if ( _.isEmpty(autoVoice.result) ) {
            this.data.autoVoice = null;
          }
          else {
            this.data.autoVoice = autoVoice.result;
          }
        }
        if ( autoData.code === Tw.API_CODE.CODE_00 ) {
          if ( _.isEmpty(autoData.result) ) {
            this.data.autoData = null;
          }
          else {
            this.data.autoData = autoData.result;
          }
        }
        this._openPopup();
      }, this));
  },

  _openPopup: function () {
    var data = [];
    data.push({
      title: Tw.POPUP_TPL.PPS_CHARGE_DATA.VOICE,
      list: [{
        option: 'once-voice',
        txt: Tw.POPUP_TPL.PPS_CHARGE_DATA.ONCE
      }, {
        option: !this.data.autoVoice ? 'auto-voice' : 'auto-change-voice',
        txt: !this.data.autoVoice ? Tw.POPUP_TPL.PPS_CHARGE_DATA.AUTO : Tw.POPUP_TPL.PPS_CHARGE_DATA.AUTO_CHANGE
      }]
    });
    data.push({
      title: Tw.POPUP_TPL.PPS_CHARGE_DATA.DATA,
      list: [{
        option: 'once-data',
        txt: Tw.POPUP_TPL.PPS_CHARGE_DATA.ONCE
      }, {
        option: !this.data.autoData ? 'auto-data' : 'auto-change-data',
        txt: !this.data.autoData ? Tw.POPUP_TPL.PPS_CHARGE_DATA.AUTO : Tw.POPUP_TPL.PPS_CHARGE_DATA.AUTO_CHANGE
      }]
    });

    this._popupService.open({
        hbs: 'DC_09',// hbs의 파일명
        layer: true,
        title: Tw.POPUP_TPL.PPS_CHARGE_DATA.TITLE,
        data: data
      }, $.proxy(this._onPopupOpened, this),
      $.proxy(this._onPopupClosed, this), 'prepaid');
  },

  // DC_O9 팝업 호출 후
  _onPopupOpened: function ($container) {
    this.$popupContainer = $container;
    var items = $container.find('li');
    for ( var i = 0; i < items.length; i++ ) {
      var item = items.eq(i);
      var classNm = item.attr('class').replace('type1', '').trim();
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
    this.$popupContainer.find('.fe-common-back').on('click', function () {
      window.history.back();
    });
  },

  // DC_09 팝업 close 이후 처리 부분
  _onPopupClosed: function () {
    var $target = this.$popupContainer.find('[data-url]');
    if ( $target.length > 0 ) {
      this.$popupContainer.off('click');
      this._historyService.goLoad($target.attr('data-url'));
    }
  },

  // DC_09 팝업내 아이템 선택시 이동
  _onClickOnce: function (name, event) {
    var $target = $(event.target);
    var url = this.defaultUrl + '/data'; // default - data
    if ( name === 'once-voice' ) {
      url = this.defaultUrl + '/voice';
    }
    $target.attr('data-url', url);
    this._popupService.close();
  },

  _onClickAuto: function (name, event) {
    var $target = $(event.target);
    var url = this.defaultUrl + '/data-auto'; // default - data
    if ( name === 'auto-voice' ) {
      url = this.defaultUrl + '/voice-auto';
    }
    $target.attr('data-url', url);
    this._popupService.close();
  },

  _onClickAutoChange: function (name, event) {
    var $target = $(event.target);
    var url = this.defaultUrl + '/data-auto'; // default - data
    if ( name === 'auto-change-voice' ) {
      url = this.defaultUrl + '/voice-auto';
    }
    $target.attr('data-url', url);
    this._popupService.close();
  }
};