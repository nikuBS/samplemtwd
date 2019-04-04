/**
 * @file 위치정보 이용동의 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-11
 */

/**
 * @class
 * @param (Object) rootEl - 최상위 element
 */

Tw.MainMenuSettingsLocation = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cacheElements();
  this._bindEvents();
};

Tw.MainMenuSettingsLocation.prototype = {
  _cacheElements: function () {
    this.$term = this.$container.find('input');
  },
  _bindEvents: function () {
    this.$term.on('change', $.proxy(this._onTermChanged, this));
    this.$container.on('click', '#fe-view', $.proxy(this._onLink, this));
  },

  /**
   * @function
   * @desc 이용동의 on/off 변경시 BFF로 요청
   * @param  {Object} e click event
   */
  _onTermChanged: function (e) {
    var data = {
      twdLocUseAgreeYn: e.target.checked ? 'Y' : 'N'
    };

    this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
      .done($.proxy(function (res) {
        if (res.code !== Tw.API_CODE.CODE_00) {
          this._onTermFail(res);
        } else {
          var msg = data.twdLocUseAgreeYn === 'Y' ?
            Tw.SETTING_LOCATION.AGREE : Tw.SETTING_LOCATION.DISAGREE;
          Tw.CommonHelper.toast(msg);
        }
      }, this))
      .fail($.proxy(this._onTermFail, this));
  },

  /**
   * @function
   * @desc BFF 요청 실패 시 라디오 버튼 다시 변경전으로 복구
   * @param  {Object} err
   */
  _onTermFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
    var checked = !!this.$term.attr('checked');
    this.$term.attr('checked', !checked);
  },

  /**
   * @function
   * @desc 약관 상세 레이어 팝업으로 보여줌
   */
  _onLink: function () {
    // Tw.CommonHelper.openUrlInApp(
      // 'http://m2.tworld.co.kr/normal.do?serviceId=S_PUSH0011&viewId=V_MEMB2005&stplTypCd=15',
      // null,
      // Tw.COMMON_STRING.TERM
  //  );
    Tw.CommonHelper.openTermLayer2(15);
  }
};
