/**
 * @file 데이터 시간설정 공통
 * @author 양정규
 * @since 2019-09-17
 */

/**
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 */
Tw.MyTData5gSetting = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._nativeService = Tw.Native;

  this._cachedElement();
  this._bindEvent();
  if ( !Tw.Environment.init ) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openIntro, this));
  } else {
    this._openIntro();
  }
};

Tw.MyTData5gSetting.prototype = {

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnHistory = this.$container.find('.fe-btn_history');
    this.$btnMyTdata = this.$container.find('.fe-btn_mytdata');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$btnHistory.on('click', $.proxy(this._historyService.goLoad, this, '/myt-data/5g-setting/history'));
    this.$btnMyTdata.on('click', $.proxy(this._historyService.goLoad, this, '/myt-join/myplan'));
  },

  /**
   * @function
   * @desc open intro popup
   */
  _openIntro: function () {
    if (localStorage['dont.again'] === 'do not again') {
      return;
    }
    this._popupService.open({
      url: '/hbs/',
      hbs: 'popup',
      'notice_has':'og-popup-intro',
      'cont_align':'tc',
      'contents': '<img src="'+ Tw.Environment.cdn+'/img/t_m5g/og_pop_intro.png" alt="5GX 0Plan 시간권으로 데이터를 이용하세요! 사용량 걱정 없이 원하는 시간만큼 쓰는 방법!" style="max-width:100%;">',
      'bt_b': [{
        style_class: 'pos-left',
        txt: '다시보지 않기'
      },{
        style_class: 'bt-red1 pos-right',
        txt: '시작하기'
      }]
    }, $.proxy(function () {
      $('.pos-left').on('click', function () {
        localStorage['dont.again'] = 'do not again';
        Tw.Popup.close();
      });
      $('.pos-right').on('click', Tw.Popup.close);
    }, this));
  }

};
