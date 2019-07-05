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
  //this._getTosBanner();
  this._getTosAdminProductBanner();
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
   * @function
   * @desc 토스 배너 정보 요청
   * @private
   */
  _getTosAdminProductBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: this._getBannerCode(Tw.UrlHelper.getLastPath()) } },
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._menuId } }
    ]).done($.proxy(this._successTosAdminProductBanner, this))
      .fail($.proxy(this._errorRequest, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리
   * @param resp
   * @private
   */
  _successTosAdminProductBanner: function (banner1, admBanner) {
    var result = [{ target: 'T', banner: banner1 }];

    result.forEach(function(row){
      if(row.banner && row.banner.code === Tw.API_CODE.CODE_00){
        if(!row.banner.result.summary){
          row.banner.result.summary = {target: row.target};  
        }
        row.banner.result.summary.kind = Tw.REDIS_BANNER_TYPE.TOS;
        row.banner.result.imgList = Tw.CommonHelper.setBannerForStatistics(row.banner.result.imgList, row.banner.result.summary);
      }else{
        row.banner = { result: {summary : { target: row.target }, imgList : [] } };
      }

      if(admBanner.code === Tw.API_CODE.CODE_00){
        row.banner.result.imgList = row.banner.result.imgList.concat( 
          admBanner.result.banners.map(function(admbnr){
            admbnr.kind = Tw.REDIS_BANNER_TYPE.ADMIN;
            admbnr.bnnrImgAltCtt = admbnr.bnnrImgAltCtt.replace(/<br>/gi, ' ');
            return admbnr;
          })
        );
      }
    })
    this._drawTosAdminProductBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminProductBanner: function (banners) {
    _.map(banners, $.proxy(function (bnr) {
      if ( bnr.banner.result.bltnYn === 'N' ) {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }
      
      if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) 
          && bnr.banner.result.imgList.length > 0) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, $.proxy(this._successDrawBanner, this));
      }else{
        this.$container.find('[data-id=banners-empty]').hide();
        this.$container.find('[data-id=banners]').hide();
      }
    }, this));
    
    new Tw.XtractorService(this.$container);

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
