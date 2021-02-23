/**
 * MenuName: 나의 요금 > 서브메인(MF2)
 * @file myt-fare-submain.adv.js
 * @author 양정규
 * @since 2020.12.31
 * Summary: 나의요금 서브메인 고도화 js
 * Description:
 *   청구,사용요금 조회 - data.type이 UF인 경우 사용요금 조회 아닌 경우 청구요금 조회
 *   세금계산서,기부금내역 조회
 *   실시간 요금 조회 (매월 1일 미조회)
 */

Tw.MyTFareSubMainAdv = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this.data = params.data;
  this._menuId = this.data.pageInfo.menuId;
  this._init();
  // 배너 관련 통계 이벤트(xtractor)
  new Tw.XtractorService(this.$container);
};

Tw.MyTFareSubMainAdv.prototype = {

  _init: function () {
    this._makeEid();
    this._cachedElement();
    this._bindEvent();
    this._getTosAdminMytFareBanner();
    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    this._lineComponent = new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  },

  /**
   * @function
   * @desc 통계코드 data attr 생성
   * @private
   */
  _makeEid: function () {

    var eid = {};
    var setEid = function (key, stgEId, prdEid) {
      var preCode = 'CMMA_A3_B12-';
      eid[key] = preCode + (Tw.Environment.environment === 'prd' ? prdEid : stgEId);
    };

    setEid('month', '28', ''); // 당월 선택
    setEid('detailBill', '29', ''); // 요금 상세 내역
    setEid('skbroadband', '30', ''); // SK 브로드밴드
    setEid('miri', '31', ''); // 미리 납부하신 금액 MIRI

    var miriEid = {
      stg: '32',
      prd: ''
    };
    // 미납요금 있을때
    if (this.data.unPaidTotSum) {
      miriEid.stg = '33';
      miriEid.prd = '';
    }
    setEid('charge', miriEid.stg, miriEid.prd); // 요금 납부
    setEid('unPaid', '34', ''); // 미납요금 납부
    setEid('realtime', '35', ''); // 실시간 이용요금 납부
    setEid('mobileCharge', '36', ''); // 휴대폰 결제
    setEid('contentsBill', '37', ''); // 콘텐츠 이용료
    setEid('mobileChangeLimit', '38', ''); // 휴대폰 결제 한도변경
    setEid('contentsChangeLimit', '39', ''); // 콘텐츠 한도변경
    setEid('agreeJoin', '40', ''); // 휴대폰 결제 이용동의 상품가입
    setEid('recentPay', '42', ''); // 최근 납부내역(납부/청구정보 영역에서 사용)
    setEid('payMethod', '41', ''); // 납부방법
    setEid('billType', '43', ''); // 요금 안내서 유형
    setEid('contact', '44', ''); // 주소/연락처
    setEid('child', '45', ''); // 자녀회선 정보
    setEid('bank', '46', ''); // 은행자동납부 배너
    setEid('counsel', '47', ''); // 가입상담 예약 배너
    setEid('recentBillTip', '48', ''); // 최근 청구요금 내역 tip
    setEid('benefit', '49', ''); // 나의 혜택/할인
    setEid('membership', '50', ''); // 멤버십 등급
    setEid('annualBenefit', '51', ''); // 연간 누적 혜택
    setEid('benefitDiscount', '52', ''); // 혜택 할인
    setEid('pause', '53', ''); // 일시정지/해제
    setEid('password', '54', ''); // 고객보호 비밀번호 서비스
    setEid('pattern', '55', ''); // 데이터/음성/문자 월 사용패턴
    setEid('tax', '56', ''); // 세금계산서 재발행
    setEid('donation', '57', ''); // 기부금/후원금 납부내역
    setEid('recentPay2', '58', ''); // 최근납부내역2 (조회/신청 서비스 영역에서 사용)
    setEid('tos', '59', ''); // TOS배너
    setEid('data', '60', ''); // 나의 데이터통화
    setEid('join', '61', ''); // 나의 가입정보
    setEid('fare', '62', ''); // 나의 요금제/부가상품
    setEid('combination', '63', ''); // 나의 결합상품
    setEid('paymentHistory', '64', ''); // 요금납부내역 조회
    setEid('realtimeRemain', '65', ''); // 실시간 잔여량
    setEid('contract', '66', ''); // 약정할인/기기상환 정보
    setEid('ppsHistory', '67', ''); // 내역조회
    setEid('recentBill0', '68', ''); // 최근청구요금내역1
    setEid('recentBill1', '69', ''); // 최근청구요금내역2
    setEid('recentBill2', '70', ''); // 최근청구요금내역3

    $.each($('[data-make-eid]'), function (idx, item){
      var $item = $(item);
      var eidCd = eid[$item.data('make-eid')];
      if (eidCd) {
        $item.attr('data-xt_eid', eidCd)
          .attr('data-xt_csid', 'NO')
          .attr('data-xt_action', 'BC');
        $item.removeAttr('data-make-eid');
      }
    });
  },

  /**
   * element cache
   * @private
   */
  _cachedElement: function () {

  },

  /**
   * even bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '[data-url]', $.proxy(this._goLoad, this));
  },

  /**
   * @function
   * @desc 토스 배너 정보 요청
   * @private
   */
  _getTosAdminMytFareBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: '0009' } },
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._menuId } }
    ]).done($.proxy(this._successTosAdminMytFareBanner, this))
      .fail($.proxy(this._errorRequest, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리
   * @param resp
   * @private
   */
  _successTosAdminMytFareBanner: function (banner1, admBanner) {
    var result = [{ target: 'M', banner: banner1 }];

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
    });
    this._drawTosAdminMytFareBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminMytFareBanner: function (banners) {
    _.map(banners, $.proxy(function (bnr) {
      if ( bnr.banner.result.bltnYn === 'N' ) {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }

      if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) && bnr.banner.result.imgList.length > 0) {
        new Tw.BannerService(
          this.$container,
          Tw.REDIS_BANNER_TYPE.TOS_ADMIN,
          bnr.banner.result.imgList,
          bnr.target,
          bnr.banner.result.prtyTp,
          $.proxy(this._successDrawBanner, this)
        );
      } else {
        this.$container.find('[data-id=banners-empty]').hide();
        this.$container.find('[data-id=banners]').hide();
      }
    }, this));

    new Tw.XtractorService(this.$container);
  },

  // 배너 ui 처리
  _successDrawBanner: function () {
    var $bannerList = this.$container.find('[data-id=banner-list]');
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.resetHeight($bannerList[0]);
    }
  },


  _goLoad: function (event) {
    this._historyService.goLoad($(event.currentTarget).data('url'));
  },

  _errorRequest: function (resp) {
    if ( !resp ) {
      resp = {
        code: '',
        msg: Tw.ALERT_MSG_COMMON.SERVER_ERROR
      };
    }
    Tw.Error(resp.code, resp.msg).pop();
  }
};
