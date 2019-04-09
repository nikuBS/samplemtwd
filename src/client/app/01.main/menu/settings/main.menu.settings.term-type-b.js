/**
 * @file 약관 세부화면 페이지 처리
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018-10-11
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 */
Tw.MainMenuSettingsTermTypeB = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._bindEvents();
};

Tw.MainMenuSettingsTermTypeB.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '#fe-btn-view', $.proxy(this._onViewClicked, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._onExternalLink, this));
  },

  /**
   * @function
   * @desc 약관보기 클릭시 BFF로 약관 내용 조회하여 화면에 출력
   * @param  {Object} e - click event
   */
  _onViewClicked: function (e) {
    var viewId = e.currentTarget.value;
    this._apiService.request(Tw.API_CMD.BFF_08_0059, {
      svcType: 'MM',
      serNum: viewId
    }).done($.proxy(function (res) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this._popupService.open({
          hbs: 'HO_04_05_01_02_01',
          title: res.result.title,
          content: res.result.content,
          nogaps: viewId === '71' ? true : false  // '트래픽 관리 정보 공개양식' 인 경우 nogaps class 적용
        });
      } else {
        Tw.Error(res.code, res.msg).pop();
      }
    }, this)).fail(function (err) {
      Tw.Error(err.code, err.msg).pop();
    });
  },

  /**
   * @function
   * @desc 외부 브라우저로 링크 열기
   * @param  {Object} e - click event
   */
  _onExternalLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    Tw.CommonHelper.openUrlExternal(url);

    return false;
  }
};
