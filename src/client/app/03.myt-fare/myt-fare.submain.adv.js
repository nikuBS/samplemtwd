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
  this.common = new Tw.MyTFareSubMainCommon(params);
  this._init();
  // 배너 관련 통계 이벤트(xtractor)
  // new Tw.XtractorService(this.$container);
};

Tw.MyTFareSubMainAdv.prototype = {

  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._getTosAdminMytFareBanner();
    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    // this._lineComponent = new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
    this._makeEid();
  },

  /**
   * @function
   * @desc 통계코드 data attr 생성
   * @private
   */
  _makeEid: function () {
    var builder = this.common.makeEid();
    var getEidOfLineType = builder.getEidOfLineType;
    builder.setEid('month', '28', getEidOfLineType('46', '93')) // 당월 선택
      .setEid('detailBill', '29', getEidOfLineType('47', '94')) // 요금 상세 내역
      .setEid('skbroadband', '30', '48') // SK 브로드밴드
      .setEid('miri', '31', getEidOfLineType('49', '95')); // 미리 납부하신 금액 MIRI

    var miriEid = {
      stg: '32',
      prd: getEidOfLineType('50', '96')
    };
    // 미납요금 있을때
    if ($('[data-make-eid="unPaid"]').length) {
      miriEid.stg = '33';
      miriEid.prd = getEidOfLineType('51', '97');
    }

    builder.setEid('charge', miriEid.stg, miriEid.prd) // 요금 납부
      .setEid('unPaid', '34', getEidOfLineType('52', '98')) // 미납요금 납부
      .setEid('realtime', '35', '53') // 실시간 이용요금 납부
      .setEid('mobileCharge', '36', '54') // 휴대폰 결제
      .setEid('contentsBill', '37', '55') // 콘텐츠 이용료
      .setEid('mobileChangeLimit', '38', '56') // 휴대폰 결제 한도변경
      .setEid('contentsChangeLimit', '39', '57') // 콘텐츠 한도변경
      .setEid('agreeJoin', '40', '58') // 휴대폰 결제 이용동의 상품가입
      .setEid('recentPay', '42', getEidOfLineType('59', '99')) // 최근 납부내역(납부/청구정보 영역에서 사용)
      .setEid('payMethod', '41', getEidOfLineType('60', '100')) // 납부방법
      .setEid('billType', '43', getEidOfLineType('61', '101')) // 요금 안내서 유형
      .setEid('contact', '44', getEidOfLineType('62', '102')) // 주소/연락처
      .setEid('child', '45', '63') // 자녀회선 정보
      .setEid('bank', '46', getEidOfLineType('64', '103')) // 은행자동납부 배너
      .setEid('counsel', '47', getEidOfLineType('65', '104')) // 가입상담 예약 배너
      .setEid('recentBillTip', '48', getEidOfLineType('69', '108')) // 최근 청구요금 내역 tip
      .setEid('benefit', '49', '70') // 나의 혜택/할인
      .setEid('membership', '50', '71') // 멤버십 등급
      .setEid('annualBenefit', '51', '72') // 연간 누적 혜택
      .setEid('benefitDiscount', '52', '73') // 혜택 할인
      .setEid('pause', '53', getEidOfLineType('74', '109')) // 일시정지/해제
      .setEid('password', '54', '75') // 고객보호 비밀번호 서비스
      .setEid('pattern', '55', '76') // 데이터/음성/문자 월 사용패턴
      .setEid('recentPay2', '58', getEidOfLineType('79', '112')) // 최근납부내역2 (조회/신청 서비스 영역에서 사용)
      .setEid('tos', '59', getEidOfLineType('80', '113')) // TOS배너
      .setEid('data', '60', getEidOfLineType('81', '114', '90')) // 나의 데이터통화
      .setEid('join', '61', getEidOfLineType('82', '115', '91')) // 나의 가입정보
      .setEid('fare', '62', getEidOfLineType('83', '116', '92')) // 나의 요금제/부가상품
      .setEid('combination', '63', getEidOfLineType('84', '117')) // 나의 결합상품
      .setEid('paymentHistory', '64', getEidOfLineType('85', '118')) // 요금납부내역 조회
      .setEid('realtimeRemain', '65', '86') // 실시간 잔여량
      .setEid('contract', '66', '87') // 약정할인/기기상환 정보
      .setEid('ppsHistory', '67', '88') // 내역조회
      .setEid('ppsTos', '', '89') // TOS 배너
      .setEid('dcRefund', '', '119') // 할인 반환금 조회
      .setEid('searchBenefit', '', '120') // 사은품 조회
      .setEid('ableService', '', '121') // 서비스 가능지역 조회
      .setEid('myCombineProduct', '', '122') // 내게 맞는 결합상품 찾기
      .build(); // 내역조회

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
        this.$container.find('[data-id=banners-empty]').addClass('none');
        this.$container.find('[data-id=banners]').addClass('none');
      }
    }, this));

    // new Tw.XtractorService(this.$container);
  },

  // 배너 ui 처리
  _successDrawBanner: function () {
    var $bannerList = this.$container.find('[data-id=banner-list]');
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.resetHeight($bannerList[0]);
    }
  },


  _goLoad: function (event) {
    event.preventDefault();
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
