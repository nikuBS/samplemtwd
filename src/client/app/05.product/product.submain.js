/**
 * @file 요금제, 부가서비스, 인터넷/전화/IPTV 서브메인 < 상품
 * @author Jiyoung Jo
 * @since 2018.12.07
 */

Tw.ProductSubmain = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._xTractorService = new Tw.XtractorService(rootEl);

  this._menuId = menuId;
  this._getTosBanner();
  this._bindEvent();
};

Tw.ProductSubmain.prototype = {
  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$container.on('click', '.fe-go-plan', this._goPlan);
  },

  /**
   * @desc TOS 배너 가져옴
   * @private
   */
  _getTosBanner: function() {
    this._apiService.request(
      Tw.NODE_CMD.GET_BANNER_TOS, 
      { code: this._getBannerCode(Tw.UrlHelper.getLastPath()) }
    ).done($.proxy(this._successTosBanner, this));
  },

  /**
   * @desc TOS 배너 요청에 대한 응답 시
   * @param {object} resp 서버 응답
   * @private
   */
  _successTosBanner: function(resp) {
    if (this._checkTosBanner(resp)) {
      if (!Tw.FormatHelper.isEmpty(resp.result.summary)) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS, Tw.CommonHelper.setBannerForStatistics(resp.result.imgList, resp.result.summary), 'T');
      } else {
        this.$container.find('#fe-header-t').remove();
        this.$container.find('#fe-banner-t').remove();
      }
    } else {
      this._getAdminBanners(this._menuId);
    }
  },

  /**
   * @desc TOS 배너 노출 여부 확인
   * @param {object} tosBanner 서버 응답
   * @private
   */
  _checkTosBanner: function(tosBanner) {
    return tosBanner.code === Tw.API_CODE.CODE_00 && (tosBanner.result.bltnYn === 'N' || tosBanner.result.tosLnkgYn === 'Y');
  },

  /**
   * @desc TOS 배너 노출이 아닐 경우 admin 배너 가져옴
   * @param {string} menuId 해당 페이지 menu id
   * @private
   */
  _getAdminBanners: function(menuId) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: menuId }).done($.proxy(this._handleLoadBanners, this));
    // $.ajax('http://localhost:3000/mock/product.banners.json').done($.proxy(this._handleLoadBanners, this));
  },

  /**
   * @desc 배너 로딩
   * @param {object} resp 어드민 배너 응답
   */
  _handleLoadBanners: function(resp) {
    if (resp.result && resp.result.banners) {
      var topBanners = _.filter(resp.result.banners, function(banner) {
        return banner.bnnrLocCd === 'T';
      });

      if (topBanners.length > 0) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, topBanners, 'T');
      } else {
        this.$container.find('#fe-header-t').remove();
        this.$container.find('#fe-banner-t').remove();
      }

      if (Tw.UrlHelper.getLastPath() !== 'mobileplan') {
        var cBanners = _.filter(resp.result.banners, function(banner) {
          return banner.bnnrLocCd === 'C';
        });

        if (cBanners.length > 0) {
          new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, cBanners, 'C');
        } else {
          this.$container.find('#fe-header-c').remove();
          this.$container.find('#fe-banner-c').remove();
        }
      }
    }
  },

  /**
   * @desc 특정 단말에서 a 태그가 동작안하는 현상이 있어 js에서 url 랜딩하도록 수정
   * @param {Event} e 클릭 이벤트
   */
  _goPlan: function(e) {
    var url = e.currentTarget.getAttribute('data-url');
    if (url) {
      window.location.href = url;
    }
  },

  /**
   * @desc TOS 배너 코드 리턴
   * @returns {string} TOS 배너 코드
   * @private
   */
  TOS_BANNER_CODES: {
    'mobileplan': '0011',
    'mobileplan-add': '0012',
    'wireplan': '0013'
  },

  _getBannerCode: function(uri) {
    return this.TOS_BANNER_CODES[uri];
  }
};
