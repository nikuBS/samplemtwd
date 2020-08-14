/**
 * @file A/S 센터 상세화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-11-01
 */


/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 * @param  {Object} location - 해당 A/S센터의 위치값
 */
Tw.CustomerAgentsearchRepairDetail = function (rootEl, location, isLogin) {
  this.$container = rootEl;
  this._location = location;

  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this.tmapComponent = new Tw.TmapMakerComponent();

  this._dataChargeConfirmed = false;
  this.isLogin = (isLogin === 'true');

  $(window).on(Tw.INIT_COMPLETE, $.proxy(function () { // INIT_COMPLETE 이벤트 발생 후 나머지 처리
    this._showDataChargePopupIfNeeded();
  }, this));
};

Tw.CustomerAgentsearchRepairDetail.prototype = {

  /**
   * @function
   * @desc Tmap 보여주기 위해 과금팝업 발생시키고 동의 시 지도 표시
   */
  _showDataChargePopupIfNeeded: function () {
    if (Tw.BrowserHelper.isApp()) {
      var confirmed = false;
      if(this.isLogin) {
        if(!Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH')) {  // 과금팝업 동의 쿠키 값 받아올수 없을때
          Tw.CommonHelper.showDataCharge(
            $.proxy(function () {
              confirmed = true;
              Tw.CommonHelper.setCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH', 'Y');
              this._cacheElements();
              this._showMap();
            }, this),
            $.proxy(function () {
              if (!confirmed) {
                this._historyService.goBack();
                return;
              }
            }, this)
          );
        } else {  // 로그인 이면서 과금 팝업 쿠키값 받아 올수 있을때
          this._cacheElements();
          this._showMap();
        }
      } else {  // 비로그인
        Tw.CommonHelper.showDataCharge(
          $.proxy(function () {
            confirmed = true;
            this._cacheElements();
            this._showMap();
          }, this),
          $.proxy(function () {
            if (!confirmed) {
              this._historyService.goBack();
              return;
            }
          }, this)
        );
      }
    } else {  // 앱이 아닐때
      this._cacheElements();
      this._showMap();
    }
  },
  _cacheElements: function () {
    this.$tmapBox = this.$container.find('#fe-map-box');
  },

  /**
   * @function
   * @desc Tmap 통해 지도 표시하고 해당 지점 위치를 marker 로 표시
   */
  _showMap: function () {
    var position = {
      latitude: this._location.latitude,
      longitude: this._location.longitude
    };
    // Tmap 생성
    this.tmapComponent.makeTmap($.extend({
      id: this.$tmapBox.attr('id'),
      width: '100%',
      height: this.$tmapBox.width() + 'px'
    }, position)).makeMarker($.extend({
      width: 24
    }, position));
  }
};
