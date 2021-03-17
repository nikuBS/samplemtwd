/**
 * @file 요금제, 부가서비스, 인터넷/전화/IPTV 서브메인 < 상품
 * @author Jiyoung Jo
 * @since 2018.12.07
 */

Tw.ProductSubmain = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._xTractorService = new Tw.XtractorService(rootEl);

  this._menuId = menuId;
  //this._getTosBanner();
  this._getTosAdminProductBanner();
  this._cachedElement();
  this._bindEvent();

  this._setCoachMark();
  this._showRenewal();
};

Tw.ProductSubmain.prototype = {
  /**
   * @function
   * @desc 로그인시 element 변수 초기화
   * @return {void}
   * @private
   */
  _cachedElement: function () {
    // 광고성 정보 수신동의 배너
    this.$adRcvAgreeBanner = this.$container.find('#fe-ad-rcv-agree-banner');
  },
  
  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$container.on('click', '.fe-go-plan', this._goPlan);
    this.$container.on('click', '.fe-home-external', $.proxy(this._onClickExternal, this));

    // 광고성 정보 수신동의 배너 이벤트
    this.$container.on('click', '#fe-bt-close-ad-rcv-agree-banner', $.proxy( function() { this.$adRcvAgreeBanner.addClass('none'); }, this ));
    this.$container.on('click', '#fe-bt-on-ad-rcv-agree-banner', $.proxy(this._onClickAgreeAdRcv, this));
    this.$container.on('click', '#fe-bt-detail-ad-rcv-agree-banner', $.proxy( function() { Tw.CommonHelper.openTermLayer2('03'); }, this ));
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
    var result = [{ target: 'T', banner: banner1 },
      { target: 'C' }
    ];

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
          admBanner.result.banners.filter(function(admbnr){
            return admbnr.bnnrLocCd === row.target;
          }).map(function(admbnr){
            admbnr.kind = Tw.REDIS_BANNER_TYPE.ADMIN;
            admbnr.bnnrImgAltCtt = admbnr.bnnrImgAltCtt.replace(/<br>/gi, ' ');
            return admbnr;
          })
        );
      }
    });
    this._drawTosAdminProductBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminProductBanner: function (banners) {
    banners.forEach($.proxy(function (bnr) {
      if (bnr.banner.result.bltnYn === 'N') {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }

      if (!Tw.FormatHelper.isEmpty(bnr.banner.result.summary)
        && bnr.banner.result.imgList.length > 0) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, bnr.banner.result.prtyTp, $.proxy(this._successDrawBanner, this));
      } else {
        if (bnr.banner.bnnrLocCd === 'T') {
          this.$container.find('#fe-header-t').remove();
          this.$container.find('#fe-banner-t').remove();
        } else if (bnr.banner.bnnrLocCd === 'C') {
          this.$container.find('#fe-header-c').remove();
          this.$container.find('#fe-banner-c').remove();
        }
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
   * @function
   * @desc 외부 브라우저 랜딩 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickExternal: function ($event) {
    var url = $($event.currentTarget).data('url');
      Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 광고성 정보 수신동의 클릭(동의) 처리
   * @return {void}
   * @private
   */
  _onClickAgreeAdRcv: function() {
    this._apiService.request(Tw.API_CMD.BFF_03_0022, { twdAdRcvAgreeYn:'Y' })
      .done($.proxy(this._successAgreeAdRcv, this));
  },

  _successAgreeAdRcv: function() {
    this._popupService.toast(Tw.TOAST_TEXT.RCV_AGREE);
    this.$adRcvAgreeBanner.addClass('none');
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
  },

  /**
   * @function
   * @desc 코치마크 처리
   * @private
   */
  _setCoachMark: function () {
    new Tw.CoachMark(this.$container, '.fe-coach-total', '.fe-coach-total-target', Tw.NTV_STORAGE.COACH_PRODUCT_MOBILEPLAN_TOTAL);
  },

  /**
   * Renewal 페이지 이동 안내 띠 노출 
   * 2021. 02. 17 knkim
   */
  _showRenewal: function() {
    var url = window.location.pathname;
    if ( url != '/product/mobileplan' ) {
      return;
    }

    var html = 
      '<div class="h-person h-plan-beta">' + 
        '<button data-url="/product/renewal/mobileplan" class="icon-gnb-person" aria-label="요금제 beta -새로운 요금제 화면을 만나보세요." data-xt_eid="CMMA_A4_B15-20" data-xt_csid="NO" data-xt_action="BC">' + 
          '<span class="person-btn-wrap">' + 
            '<span class="inner-btn"></span>' + 
            '<span class="btn-comment"><span class="txt">새로운 요금제 화면을 만나보세요.</span></span>' + 
          '</span>' + 
        '</button>' + 
      '</div>';

    this.$container.find('.h-serarch').before(html);
    this._initPersonAction();
  },

  /**
   * Renewal 버튼에 대한 애니메이션 설정
   * 2021. 02. 17 knkim
   */
  _initPersonAction: function () {
    var personTimer = null, hideTimer1 = null, hideTimer2 = null;
    var personIcoClickYN = Tw.CommonHelper.getSessionStorage('PERSON_ICO_CLICKED'); // 한번 이상 개인화 진입 아이콘 클릭
    if ( personIcoClickYN === 'Y' ) {
      $('.h-person').removeClass('show');
      $('.h-person .btn-comment').hide();
    }

    function personAction() {
      clearTimeout(personTimer);
      clearTimeout(hideTimer1);
      clearTimeout(hideTimer2);

      personTimer = setTimeout(function () {
        $('.h-person').addClass('show');
        hideTimer1 = setTimeout(function () {
          $('.h-person').removeClass('show');
          hideTimer2 = setTimeout(function () {
            $('.h-person .btn-comment').hide();
          }, 1000);
        }, 3000);
      }, 500);
    }

    $(window).on('scroll', function () {
      if ( $(this).scrollTop() === 0 ) {
        if ( personIcoClickYN !== 'Y' ) {
          personAction();
        }
      } else {
        if ( personIcoClickYN !== 'Y' ) {
          $('.h-person .btn-comment').show();  //2020.05.13 추가
        }
        $('.h-person').removeClass('show');
      }
    });
    if ( personIcoClickYN !== 'Y' ) {
      personAction();
    }
  },

};
