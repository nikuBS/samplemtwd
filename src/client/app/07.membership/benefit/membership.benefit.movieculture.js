/**
 * FileName: membership.benefit.movieculture.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.30
 */

Tw.MembershipBenefitMovieCulture = function ($element) {
  this.PRODUCT_T_MEMBERSHIP = 'TW50000020';

  this.$container = $element;
  this._historyService = new Tw.HistoryService(this.$container);
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;
  this._bindEvent();
};

Tw.MembershipBenefitMovieCulture.prototype = {
  /**
   * event 바인딩
   * @private
   */
  _bindEvent: function () {
    $('#btnMovTicket').click($.proxy(this._goMovieTicketing, this));
    $('#btnFindTicket').click($.proxy(this._onClickFindTiketing, this));
  },

  /**
   * 영화예매하기 버튼 클릭시
   * @private
   */
  _goMovieTicketing: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._requestAppInfo();
    } else {
      this._historyService.goLoad(Tw.URL_PATH.MEMBERSHIP_MOVIE);
    }
  },

  /**
   * 컬쳐 예매조회 버튼 클릭시
   * @private
   */
  _onClickFindTiketing: function () {
    this._popupService.openConfirm(Tw.MEMBERSHIP.MOVIE_CULTURE_CONFIRM.TITLE,
      Tw.MEMBERSHIP.MOVIE_CULTURE_CONFIRM.MESSAGE, $.proxy(this._goFindTiketing, this), null);
  },

  _goFindTiketing: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._requestAppInfo();
    } else {
      this._historyService.goLoad(Tw.URL_PATH.MEMBERSHIP_CULTURE);
    }
  },

  _requestAppInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_10_0097, { prodExpsTypCd: 'P' }, {}, this.PRODUCT_T_MEMBERSHIP)
      .done($.proxy(this._onSuccessAppInfo, this))
      .fail($.proxy(this._failSvcInfo, this));
  },

  _onSuccessAppInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var app = resp.result;
      this._nativeService.send(
        Tw.NTV_CMD.IS_INSTALLED,
        {
          list: [
            {
              appKey: app.prodNm,
              scheme: app.lnkgAppScmCtt,
              package: app.lnkgAppPkgNm
            }
          ]
        },
        $.proxy(this._handleConfirmAppInstalled, this, app)
      );
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _failSvcInfo: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  },

  _handleConfirmAppInstalled: function (app, resp) {
    if ( resp.params && resp.params.list ) {
      var isInstalled = resp.params.list[0][app.prodNm];
      app.isInstalled = isInstalled || false;
    } else {
      app.isInstalled = false;
    }

    if ( app.isInstalled ) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_APP, { scheme: app.lnkgAppScmCtt, package: app.lnkgAppPkgNm });
    } else {
      var mvUrl = '/product/apps/app?appId=' + this.PRODUCT_T_MEMBERSHIP;
      this._historyService.goLoad(mvUrl);
    }
  }
};