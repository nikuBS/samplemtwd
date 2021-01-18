/**
 * @file 요금제, 부가서비스, 인터넷/전화/IPTV 서브메인 < 상품
 * @author Kinam Kim
 * @since 2020. 12. 18
 */

Tw.ProductRenewalSubmain = function(rootEl, svcInfo, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._dateHelper = Tw.DateHelper;
  this._popupService = Tw.Popup;
  this._xTractorService = new Tw.XtractorService(rootEl);

  this._svcInfo = svcInfo;
  this._menuId = menuId;

  this._getTosAdminProductBanner(); // TOS Banner 조회

  this._cachedElement(); // 이벤트 객체 바인딩
  this._bindEvent(); // 이벤트 핸들링 바인딩

  // this._isShowAdRcvAgree(); // 개인정보 동의
  // this._compareProduct(); // 상품 비교

  // this._needPayment(); // 꼭 필요한 요금제 혜택
};

Tw.ProductRenewalSubmain.prototype = {
  
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

  /**
   * 개인정보 동의 여부 팝업 출력 여부
   */
  _isShowAdRcvAgree: function() {
    if( !this._svcInfo ) { // 비 로그인으로 접속했을 때
      return;
    }

    if( this._svcInfo.loginType === Tw.AUTH_LOGIN_TYPE.EASY ) { // 간편로그인으로 접속했을 때
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_03_0021, {})
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          if (res.result.twdInfoRcvAgreeYn === 'N') { // 개인정보 동의 여부
            this._showAdRcvAgreePopup();
          }
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  }, 

  /**
   * 개인정보 동의 여부 팝업 출력
   */
  _showAdRcvAgreePopup: function() {
    this._popupService.open({
      hbs: 'actionsheet_plan_ad',
      layer: true
    }
    , $.proxy(this._initOpenAdRcvAgreePopup, this)
    , $.proxy(this._initCloseAdRcvAgreePopup, this)
    , 'combine_explain');
  }, 

  /**
   * 개인정보 동의 여부 팝업이 출력될 때 초기 설정 값
   */
  _initOpenAdRcvAgreePopup: function($layer) {
    
    Tw.CommonHelper.focusOnActionSheet($layer);
    // $layer.on('click', '', $.proxy(this._setAdRcvAgree, this)); // 개인정보 수집에 대한 동의 버튼
    // $layer.on('click', '', $.proxy(this._setAdRcvDisagree, this)); // 개인정보 수집에 대한 비동의 버튼
  }, 

  /**
   * 개인정보 동의 여부 팝업이 종료될 때 초기 설정 값
   */
  _initCloseAdRcvAgreePopup: function($layer) {
    
    // 팝업을 닫는다면 비동의로 닫음 (기획 검토 필요)
    this._setAdRcvDisagree();

  }, 

  /**
   * 개인정보 수집에 대한 동의 버튼을 선택했을 시
   */
  _setAdRcvAgree: function() {
    this._apiService.request(Tw.API_CMD.BFF_03_0022, { twdAdRcvAgreeYn: 'Y' })
      .done(function () {
        var koreanToday = this._dateHelper.getFullKoreanDate(new Date())
        var toastMsg = koreanToday + '<br>개인정보 수집/이용에 동의하셨습니다.';
        Tw.CommonHelper.toast(toastMsg);
      })
      .fail($.proxy(function (err) {
        Tw.Error(err.code, err.msg).pop();
      }, this));
  }, 

  /**
   * 개인정보 수집에 대한 비동의 버튼을 선택했을 시
   */
  _setAdRcvDisagree: function() {

  }, 


  /**
   * 상품 비교
   */
  _compareProduct: function() {
    if( !this._svcInfo ) { // 비 로그인으로 접속했을 때
      return;
    }

    // TODO: 개발 필요
    
  },




  /**
   * 꼭 필요한 요금제 혜택
   */
  _needPayment: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: 'F01100' }) // 요금제 꼭 필요한 요금제 혜택 조회
      .done($.proxy(this._handleNeedPayment, this));
  },

  /**
   * 꼭 필요한 요금제 혜택 핸들러
   */
  _handleNeedPayment: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    console.log('####')
    console.log(resp);
    console.log('####')
  },







  /**
   * @function
   * @desc 토스 배너 로딩
   */
  _getTosAdminProductBanner: function() {
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
  _successTosAdminProductBanner: function (banner, admBanner) {
    var result = [
      { target: 'T', banner: banner },
      { target: 'C' }
    ];

    result.forEach(function(row) {
      if( row.banner && row.banner.code === Tw.API_CODE.CODE_00 ) {
        if( !row.banner.result.summary ) {
          row.banner.result.summary = { target: row.target };
        }
        row.banner.result.summary.kind = Tw.REDIS_BANNER_TYPE.TOS;
        row.banner.result.imgList = Tw.CommonHelper.setBannerForStatistics(row.banner.result.imgList, row.banner.result.summary);
      } else {
        row.banner = { 
          result: {
            summary : { 
              target: row.target 
            }, 
            imgList : [] 
          } 
        };
      }

      if( admBanner.code === Tw.API_CODE.CODE_00 ){
        row.banner.result.imgList = row.banner.result.imgList.concat( 
          admBanner.result.banners.filter(function(admbnr) {
            return admbnr.bnnrLocCd === row.target;
          }).map( function(admbnr) {
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
        this.$container.find('#fe-banner-t').parents('div.nogaps').addClass('none');
      }

      if (!Tw.FormatHelper.isEmpty(bnr.banner.result.summary) && bnr.banner.result.imgList.length > 0) {
        new Tw.BannerProductService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, bnr.banner.result.prtyTp);
        // new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, bnr.banner.result.prtyTp, $.proxy(this._successDrawBanner, this));
      } 
    }, this));
    
    new Tw.XtractorService(this.$container);

  },







  /**
   * @function
   * @desc 로그인시 element 변수 초기화
   * @return {void}
   * @private
   */
  _cachedElement: function () {    
    // this.$adRcvAgreeBanner = this.$container.find('#fe-ad-rcv-agree-banner'); // 광고성 정보 수신동의 배너 
    // this.$moreButton = this.$container.find('.more'); // 손실보전 혜택 더보기
    

  },
  
  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    // // 광고성 정보 수신동의 배너 이벤트
    // this.$container.on('click', '#fe-bt-close-ad-rcv-agree-banner', $.proxy( function() { this.$adRcvAgreeBanner.addClass('none'); }, this ));
    // this.$container.on('click', '#fe-bt-on-ad-rcv-agree-banner', $.proxy(this._onClickAgreeAdRcv, this));
    // this.$container.on('click', '#fe-bt-detail-ad-rcv-agree-banner', $.proxy( function() { Tw.CommonHelper.openTermLayer2('03'); }, this ));

    // 손실보전 혜택 더보기 이벤트
    this.$container.on('click', '.more', $.proxy(this._onClickMore, this));

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
   * 
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
   * @desc 손실보전 버튼 혜택 더 보기 클릭 이벤트
   * @return {void} 
   */
  _onClickMore: function() {
    $('.add-service-list li').css('display', 'block');
    $('.more').css('display', 'none');
  },

  
  /**
   * 코드 배너 리턴
   * @param {} uri 
   */
  _getBannerCode: function(uri) {
    return this.TOS_BANNER_CODES[uri];
  },

};
