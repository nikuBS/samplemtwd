/**
 * @file
 * @author Kim InHwan
 * @since 2018-09-17
 */

var skipIdList = ['POT10', 'POT20', 'DDZ25', 'DDZ23', 'DD0PB', 'DD3CX', 'DD3CU', 'DD4D5', 'LT'];


/**
 * @class
 * @desc MyT > 나의 데이터/통화
 * @param {Object} params
 * @param {jQuery} params.$element
 * @param {Object} params.data
 */
Tw.MyTDataSubMainAdv = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(this.$container, '/myt-data/submain');
  this._historyService = new Tw.HistoryService(this.$container);
  this._bpcpServiceId = this.data.bpcpServiceId;
  // this._eParam = this.data.eParam;
  this._svcMgmtNum = this.data.svcInfo.svcMgmtNum;
  this._tidLanding = new Tw.TidLandingComponent();
  if (this.data.immCharge) {
    this._readOnlyProductIdList = ['NA00000138', 'NA00000719', 'NA00000720', 'NA00001901', 'NA00002244', 'NA00002373',
      'NA00002494', 'NA00002549', 'NA00002572', 'NA00002573', 'NA00002597', 'NA00002604', 'NA00002605', 'NA00002606',
      'NA00002865', 'NA00002867', 'NA00002887', 'NA00002974', 'NA00003018', 'NA00003311', 'NA00003312', 'NA00003314',
      'NA00003315', 'NA00003316', 'NA00003317', 'NA00003318', 'NA00003320', 'NA00003321', 'NA00003322', 'NA00003323',
      'NA00003324', 'NA00003325', 'NA00003326', 'NA00003327', 'NA00003328', 'NA00003329', 'NA00003362', 'NA00003368',
      'NA00003369', 'NA00003370', 'NA00003371', 'NA00003420', 'NA00003427', 'NA00003458', 'NA00003696', 'NA00003856',
      'NA00003857', 'NA00003858', 'NA00003859', 'NA00003860', 'NA00003861', 'NA00003862', 'NA00003863', 'NA00003864',
      'NA00003865', 'NA00003866', 'NA00003867', 'NA00003868', 'NA00003869', 'NA00003870', 'NA00003871', 'NA00003872',
      'NA00003873', 'NA00003874', 'NA00003875', 'NA00003886', 'NA00003887', 'NA00003888', 'NA00003889', 'NA00004142',
      'NA00004143', 'NA00004185', 'NA00004283', 'NA00004284', 'NA00004324', 'NA00004325', 'NA00004341', 'NA00004342',
      'NA00004410', 'NA00004435', 'NA00004655', 'NA00004725', 'NA00004726', 'NA00004778', 'NA00004779', 'NA00004846',
      'NA00004951', 'NA00004968', 'NA00004969', 'NA00005000', 'NA00005032', 'NA00005033', 'NA00005037', 'NA00005061',
      'NA00005062', 'NA00005063', 'NA00005064', 'NA00005065', 'NA00005066', 'NA00005073', 'NA00005084', 'NA00005109',
      'NA00005173', 'NA00005205', 'NA00005246', 'NA00005306', 'NA00005307', 'NA00005326', 'NA00005330', 'NA00005381',
      'NA00005382', 'NA00005509', 'NA00005510', 'NA00005511', 'NA00005723', 'NA00005736', 'NA00005806', 'NA00005848',
      'NA00005849', 'NA00005876', 'NA00005880']
    this.immChargeData= {
      ting: null,
      etc: null,
      limit: null,
      _isLimited: false
    };
    this._getImmRechargeData();
  }
  this._menuId = this.data.pageInfo.menuId;
  this._giftReqCnt = 0;
  this._giftLimitedGiftUsageQty = 500; // 기본 잔여 데이터 500MB
  this._isGiftData = false;
  this._isRequestGiftData = false;
  this._rendered();
  this._bindEvent();
  this._initialize();
  // 배너 관련 통계 이벤트(xtractor)
  new Tw.XtractorService(this.$container);
};

Tw.MyTDataSubMainAdv.prototype = {
  _OTHER_LINE_MAX_COUNT: 20, // 다른 회선 최대 노출 카운트,
  /**
   * @function
   * @desc 초기값 설정
   */
  _rendered: function () {
    if (!Tw.BrowserHelper.isApp() && this._historyService.isBack()) {
      // this._historyService.reload();
      this._historyService.goLoad('/myt-data/submain');
    }
    // 실시간잔여 상세
    // this.$remnantBtn = this.$container.find('[data-id=remnant-detail]');
    // 즉시충전버튼
    if (this.data.immCharge) {
      this.$immChargeSection = this.$container.find('[data-id=immCharge]');
      if (!this.data.breakdownList || this.data.breakdownList.length === 0) {
        this.$immChargeSection.find('[data-id=history]').hide();
      }
    }
    // T끼리 데이터 선물 버튼
    if (this.data.present) {
      if (this.data.svcInfo.svcAttrCd === 'M2') {
        this.$presentBtn = this.$container.find('[data-id=present]');
      } else {
        this._isGiftData = true;
        this.$giftSection = this.$container.find('[data-id=gift-section]');
        this.$giftLoading = this.$giftSection.find('[data-id=gift-loading]');
        this.$giftText = this.$giftSection.find('[data-id=gift-text]');
        this.$giftRefreshBtn = this.$giftText.find('.re-check-btn');
        this.$giftWarningBox = this.$giftSection.find('.small-warning-box');
      }
    }
    // T가족모아 배너
    if (this.data.family) {
      this.$familymoaBanner = this.$container.find('[data-id=family-moa]');
    }
    this.$prepayContainer = this.$container.find('[data-id=prepay-container]');
    if (this.data.refill) {
      // this.$refillBtn = this.$container.find('[data-id=refill]');
      this.$refillSection = this.$container.find('[data-id=refill-section]');
      this.$refillBtnArea = this.$refillSection.find('.btn-area.short');
    }
    if (this.data.isBenefit) {
      this.$dataBenefitBtn = this.$container.find('[data-id=benefit]');
    }
    // this.$dataPesterBtn = this.$container.find('[data-id=pester]');
    if ( this.data.isWireLess ) {
      this.$recentUsage = this.$container.find('[data-id=recent_usage]');
    }
    // if ( this.data.breakdownList ) {
    //   this.$breakdownDetail = this.$container.find('[data-id=bd-container] .bt');
    // }
    if (this.data.otherLines.length > 0) {
      this.$otherLines = this.$container.find('[data-id=other-lines]');
      this.$moreTempleate = Handlebars.compile(Tw.MYT_TPL.DATA_SUBMAIN.MORE_LINE_TEMP);
      this.$childLineWidgetTemp = Handlebars.compile(Tw.MYT_TPL.DATA_SUBMAIN.NEW_CHILD_WIDGET);
      this.$childLineTempleate = Handlebars.compile(Tw.MYT_TPL.DATA_SUBMAIN.NEW_CHILD_LINE_TEMP);
      if (this.data.otherLines.length > 20) {
        this.$otherLinesMoreBtn = this.$otherLines.find('.btn-more button');
      }
    }
    this.$otherPages = this.$container.find('[data-id=other-pages]');

    if (!Tw.FormatHelper.isEmpty(this._bpcpServiceId)) {
      this._initBpcp();
    }
  },
  /**
   * @function
   * @desc 바인드 이벤트
   */
  _bindEvent: function () {
    // this.$remnantBtn.on('click', $.proxy(this._onRemnantDetail, this));
    if ( this.data.immCharge ) {
      this.$immChargeSection.on('click', 'li', $.proxy(this._onImmChargeDetail, this));
    }
    if (this.data.present) {
      if (this._isGiftData) {
        // T끼리 데이터 선물하기 영역 - 휴대폰인 경우
        this.$giftRefreshBtn.on('click', $.proxy(this._onGiftRefresh, this));
      } else {
        // PPS 인 경우
        this.$presentBtn.on('click', $.proxy(this._onTPresentDetail, this));
      }
    }
    // T가족모아 배너
    if (this.data.family) {
      this.$familymoaBanner.on('click', $.proxy(this._onFamilyMoaDetail, this));
    }
    if (this.data.refill) {
      // this.$refillBtn.on('click', $.proxy(this._onRefillDetail, this));
      this.$refillBtnArea.on('click', $.proxy(this._onRefillDetail, this));
    }
    if (this.data.isBenefit) {
      this.$dataBenefitBtn.on('click', $.proxy(this._onDataBenefitDetail, this));
    }
    // this.$dataPesterBtn.on('click', $.proxy(this._onDataPesterDetail, this));

    // if ( this.data.breakdownList ) {
    //   this.$breakdownDetail.on('click', $.proxy(this._onBreakdownListDetail, this));
    // }
    if (this.data.otherLines.length > 0) {
      this.$otherLines.on('click', $.proxy(this._onOtherLinesItemDetail, this));
      if (this.data.otherLines.length > 20) {
        this.$otherLinesMoreBtn.on('click', $.proxy(this._onOtherLinesMore, this));
      }
    }
    this.$otherPages.find('a').on('click', $.proxy(this._onOtherPages, this));
    this.$prepayContainer.on('click', 'li', $.proxy(this._onPrepayCoupon, this));

    if (this.data.isWireLess) {
      this.$recentUsage.find('.fe-tab-wrap').on('click', 'li', $.proxy(this._onTabClicked, this));
      this.$recentUsage.find('.head-tit').on('click', 'a', $.proxy(this._onClickRGraphHeader, this));
    }
  },

  // OP002-2921 [myT] (W-1907-136-01) [myT] 나의 데이터통화 페이지 내 최근 데이터 사용량(그래프) 개선 OP002-3438 Start
  /**
   * @function
   * @desc  내 최근 데이터 사용량 그래프 tab(data,voice,sms) change
   * @param event
   */
  _onTabClicked: function (event) {
    // 마우스로 LI를 클릭했을 때만, 발생시키기 위해
    if (event.originalEvent && event.target.tagName === 'LI') {
      var $target = $(event.target);
      if ($target.attr('aria-selected') !== 'true') {
        $target.children('a').trigger('click');
      }
    }
    event.preventDefault();
  },

  _onClickRGraphHeader: function(event) {
    var $target = $(event.currentTarget);
    if ($target.context.tagName.toLowerCase() === 'a') {
      this._historyService.goLoad('/myt-data/usage-pattern');
    }
    event.preventDefault();
  },

  /**
   * @function
   * @desc 초기설정
   */
  _initialize: function () {
    this._svcMgmtNumList = [];
    this._initScroll();
    //this._initBanners();
    this._getTosAdminMytDataBanner();

    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    this._lineComponent = new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  },

  /**
   * @function
   * @desc 토스 배너 정보 요청
   * @private
   */
  _getTosAdminMytDataBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: '0008' } },
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._menuId } }
    ]).done($.proxy(this._successTosAdminMytDataBanner, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리
   * @param resp
   * @private
   */
  _successTosAdminMytDataBanner: function (banner1, admBanner) {
    var result = [{ target: 'M', banner: banner1 }];

    result.forEach(function (row) {
      if (row.banner && row.banner.code === Tw.API_CODE.CODE_00) {
        if (!row.banner.result.summary) {
          row.banner.result.summary = { target: row.target };
        }
        row.banner.result.summary.kind = Tw.REDIS_BANNER_TYPE.TOS;
        row.banner.result.imgList = Tw.CommonHelper.setBannerForStatistics(row.banner.result.imgList, row.banner.result.summary);
      } else {
        row.banner = { result: { summary: { target: row.target }, imgList: [] } };
      }

      if (admBanner.code === Tw.API_CODE.CODE_00) {
        row.banner.result.imgList = row.banner.result.imgList.concat(
          admBanner.result.banners.map(function (admbnr) {
            admbnr.kind = Tw.REDIS_BANNER_TYPE.ADMIN;
            admbnr.bnnrImgAltCtt = admbnr.bnnrImgAltCtt.replace(/<br>/gi, ' ');
            return admbnr;
          })
        );
      }
    });
    this._drawTosAdminMytDataBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminMytDataBanner: function (banners) {
    _.map(banners, $.proxy(function (bnr) {
      if (bnr.banner.result.bltnYn === 'N') {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }

      if (!Tw.FormatHelper.isEmpty(bnr.banner.result.summary) && bnr.banner.result.imgList.length > 0) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN,
          bnr.banner.result.imgList, bnr.target, bnr.banner.result.prtyTp, $.proxy(this._successDrawBanner, this));
      } else {
        // this.$container.find('[data-id=banners-empty]').hide();
        this.$container.find('[data-id=banners]').hide();
      }
    }, this));

    new Tw.XtractorService(this.$container);

  },

  /**
   * @function
   * @desc 배너 설정유무
   * @returns {boolean}
   */
  _checkBanner: function (result) {
    return (result.bltnYn === 'N' || result.tosLnkgYn === 'Y');
  },
  /**
   * @function
   * @desc 컨테이너 높이 조정
   */
  _successDrawBanner: function () {
    this.$bannerList = this.$container.find('[data-id=banner-list]');
    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.resetHeight(this.$bannerList[0]);
    }
  },
  /**
   * @function
   * @desc this._checkScroll() 실행
   */
  _initScroll: function () {
    this._checkScroll();
    $(window).scroll($.proxy(function () {
      this._checkScroll();
    }, this));
  },
  /**
   * @function
   * @desc _initOtherLinesInfo() 실행
   */
  _checkScroll: function () {
    // 무선 회선인 경우에만 최근 사용량 그래프 노출 [OP002-4379]
    if (this.$recentUsage.length > 0 && !this._isRecentUsageRequested && this._elementScrolled(this.$recentUsage)) {
      this._requestRecentUsage();
    }

    if (this.data.otherLines.length > 0 && !this._isRequestOtherLinesInfo && this._elementScrolled(this.$otherLines)) {
      // var otherLinesLength = this.data.otherLines.length > this._OTHER_LINE_MAX_COUNT ? this._OTHER_LINE_MAX_COUNT : this.data.otherLines.length;
      var otherLinesLength = Math.min(this.data.otherLines.length, this._OTHER_LINE_MAX_COUNT);
      if (otherLinesLength > 0) {
        // setTimeout($.proxy(this._initOtherLinesInfo, this, 0, otherLinesLength), 200);
        this._initOtherLinesInfo(0, otherLinesLength);
      }
    }

    if (this._isGiftData && !this._isRequestGiftData && this._elementScrolled(this.$giftSection)) {
      // T끼리 선물하기 영역 lazy loading 추가
      this._getLteProdIds();
    }
  },
  /**
   * @function
   * @desc 파라미터로 넘긴 element 가 이동했는지
   * @param {Object} element
   * @returns {boolean}
   */
  _elementScrolled: function (element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = element.offset().top;
    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
  },
  /**
   * @function
   * @desc 데이터 사이즈 변환
   * @param {int} value
   * @returns {number}
   */
  __convertData: function (value) {
    return parseFloat((value / 1024 / 1024).toFixed(2));
  },
  /**
   * @function
   * @desc 음성 사이즈 변환
   * @param {int} value
   * @returns {number}
   */
  __convertVoice: function (value) {
    var voice = Tw.FormatHelper.convVoiceFormat(value);
    if (voice.hours > 0) {
      return (voice.hours * 60) + voice.min + ':' + voice.sec;
    }
    return voice.min + ':' + voice.sec;
  },
  /**
   * @function
   * @desc 포맷팅
   * @param {int} tmoaremained
   * @param {int} tmoatotal
   * @param {int} etcremained
   * @param {int} etctotal
   * @returns {JSON} result
   */
  __calculationData: function (tmoaremained, tmoatotal, etcremained, etctotal) {
    var result = {};
    var total = tmoatotal + etctotal;
    var totalRemained = tmoaremained + etcremained;
    result.showTotal = this.__convFormat(total.toString(), Tw.UNIT_E.DATA);
    result.showRemained = this.__convFormat(totalRemained.toString(), Tw.UNIT_E.DATA);
    result.showTmoaRemained = this.__convFormat(tmoaremained.toString(), Tw.UNIT_E.DATA);
    result.showEtcmoaRemained = this.__convFormat(etcremained.toString(), Tw.UNIT_E.DATA);
    result.tmoaRemainedRatio = Math.round(tmoaremained / total * 100);
    result.etcRemainedRatio = Math.round(etcremained / total * 100);
    result.totalRemainedRatio = Math.round(totalRemained / total * 100);
    return result;
  },
  /**
   * @function
   * @desc 포맷팅
   * @param {JSON} data
   */
  __convShowData: function (data) {
    data.isUnlimit = !_.isFinite(data.total);
    data.remainedRatio = 100;
    data.showUsed = this.__convFormat(data.used, data.unit);
    if (!data.isUnlimit) {
      data.showTotal = this.__convFormat(data.total, data.unit);
      data.showRemained = this.__convFormat(data.remained, data.unit);
      data.remainedRatio = Math.round((data.remained / data.total) * 100);
    }
  },
  /**
   * @function
   * @desc 해당 유형에 맞는 단위로 표현
   * @param {String} data
   * @param {String} unit
   * @returns {JSON} - ex {data:'1,000', unit:'원'}
   */
  __convFormat: function (data, unit) {
    switch ( unit ) {
      case Tw.UNIT_E.FEE:
        return Tw.FormatHelper.convSpDataFormat(data, Tw.UNIT[unit]);
      case Tw.UNIT_E.DATA:
        return Tw.FormatHelper.convDataFormat(data, Tw.UNIT[unit]);
      case Tw.UNIT_E.VOICE:
      case Tw.UNIT_E.VOICE_2:
      case Tw.UNIT_E.VOICE_3:
        return Tw.FormatHelper.convVoiceFormat(data);
      case Tw.UNIT_E.SMS:
      case Tw.UNIT_E.SMS_2:
        return Tw.FormatHelper.addComma(data);
      default:
    }
    return '';
  },
  /**
   * @function
   * @desc 데이터 파싱
   * @param {JSON} remnant
   * @returns {JSON}
   */
  __parseRemnantData: function (remnant) {
    var GDATA = remnant.gnrlData || [];
    var SDATA = remnant.spclData || [];
    var VOICE = remnant.voice || [];
    var SMS = remnant.sms || [];
    var tmoaRemained = 0;
    var tmoaTotal = 0;
    var etcRemained = 0;
    var etcTotal = 0;
    var result = {
      gdata: [],
      sdata: [],
      voice: [],
      sms: [],
      tmoa: []
    };
    if (GDATA.length > 0) {
      _.filter(
        GDATA,
        $.proxy(function (item) {
          // [OP002-4864] 정액 요금제 '원' 단위 위젯 미표기
          // 특정 요금(팅PLUS14/19/24/29) etc로 넘어오는 부분이 gnrlData 바뀌어 넘어오게 되어 예외처리 추가
          if (item.unit !== Tw.UNIT_E.FEE) {
            if (item.unlimit === '1' || item.unlimit === 'B' || item.unlimit === 'M') {
              result.totalLimit = true;
            }
            this.__convShowData(item);
            if (item.skipId === skipIdList[0] || item.skipId === skipIdList[1]) {
              result.tmoa.push(item);
              tmoaRemained += parseInt(item.remained || 0, 10);
              tmoaTotal += parseInt(item.total || 0, 10);
            } else {
              result.gdata.push(item);
              etcRemained += result.totalLimit ? 100 : parseInt(item.remained || 0, 10);
              etcTotal += result.totalLimit ? 100 : parseInt(item.total || 0, 10);
            }
          }
        }, this)
      );
      if (!result.totalLimit) {
        result.total = this.__calculationData(tmoaRemained, tmoaTotal, etcRemained, etcTotal);
      } else {
        result.total = {
          etcRemainedRatio: 100,
          totalRemainedRatio: 0
        };
      }
    }
    if (SDATA.length > 0) {
      _.filter(
        SDATA,
        $.proxy(function (item) {
          this.__convShowData(item);
          result.sdata.push(item);
        }, this)
      );
    }
    if (VOICE.length > 0) {
      _.filter(
        VOICE,
        $.proxy(function (item) {
          this.__convShowData(item);
          result.voice.push(item);
        }, this)
      );
    }
    if (SMS.length > 0) {
      _.filter(
        SMS,
        $.proxy(function (item) {
          this.__convShowData(item);
          result.sms.push(item);
        }, this)
      );
    }
    return result;
  },
  /**
   * @function
   * @desc 다른회선 정보반환
   * @param {String} number - svcMgmtNum
   * @returns {JSON}
   */
  __selectOtherLine: function (number) {
    var select = _.find(this.data.otherLines, function (item) {
      if (item.svcMgmtNum === number) {
        return item;
      }
    });
    return select;
  },
  /**
   * @function
   * @desc 파라미터의 서비스 유형 반환
   * @param {String} attrCd
   * @returns {String}
   */
  __selectSvcType: function (attrCd) {
    var clsNm = 'cellphone';
    if (['M3', 'M4'].indexOf(attrCd) > -1) {
      clsNm = 'tablet';
    }
    return clsNm;
  },

  /**
   * @function
   * @desc chart create
   */
  _requestRecentUsage: function () {
    this._isRecentUsageRequested = true;
    this._apiService.request(Tw.API_CMD.BFF_05_0091, {})
      .done($.proxy(this._successRequestRecentUsage, this))
      .fail($.proxy(this._errorRequestRecentUsage, this));
  },

  // OP002-2921 [myT] (W-1907-136-01) [myT] 나의 데이터통화 페이지 내 최근 데이터 사용량(그래프) 개선 OP002-3438 Start
  /**
   * @function
   * @desc tab 기본 선택
   */
  __selectRecentUsageTab: function (id) {
    var $tabs = this.$recentUsage.find('.tab-linker').children('ul');
    var $tabContents = this.$recentUsage.find('.tab-contents').children('ul');
    $tabs.children('li a').attr('aria-selected', false);
    $tabContents.children('li').attr('aria-selected', false);
    var tabId = '#graph-tab' + id;
    $tabs.children(tabId).attr('aria-selected', true); // 탭
    $tabContents.children(tabId + '-tab').attr('aria-selected', true); // 탭 내용
  },

  /**
   * @function
   * @desc 차트생성
   */
  _initRecentUsageChart: function () {
    var index;
    var item;
    var idTabSelect = '';
    var usage;
    var itemsDataChart = [];
    var itemsVoiceChart = [];
    var itemsSMSChart = [];
    // "데이터" 탭
    // [DVI001-13652] SKT 요청사항 (역순)
    if (this.data.recentUsage.data) {
      for ( index = this.data.recentUsage.data.length - 1; index >= 0; index -= 1 ) {
        item = this.data.recentUsage.data[index];
        usage = parseInt(item.totalUsage, 10);
        if (usage) {
          itemsDataChart.push({
            t: this._recentChartDate(item.invMth), // 각 항목 타이틀
            v: this.__convertData(usage) // 배열 평균값으로 전달
          });
        }
      }
    }
    this.$recentUsage.chart2({
      type: Tw.CHART_TYPE.BAR_5, //bar
      target: '.fe-tab-data', //클래스명 String
      average: true,
      // [DVI001-13652] SKT 요청사항
      average_place: '',
      unit: Tw.CHART_UNIT.GB, //x축 이름
      data_arry: itemsDataChart // data obj
    });
    if (itemsDataChart.length > 0) {
      idTabSelect = '1';
    }
    // "음성" 탭
    // [DVI001-13652] SKT 요청사항 (역순)
    if (this.data.recentUsage.voice) {
      for ( index = this.data.recentUsage.voice.length - 1; index >= 0; index -= 1 ) {
        item = this.data.recentUsage.voice[index];
        usage = parseInt(item.totalUsage, 10);
        if (usage) {
          itemsVoiceChart.push({
            t: this._recentChartDate(item.invMth), // 각 항목 타이틀
            v: this.__convertVoice(usage) // 배열 평균값으로 전달
          });
        }
      }
    }
    this.$recentUsage.chart2({
      type: Tw.CHART_TYPE.BAR_5, //bar
      target: '.fe-tab-voice', //클래스명 String
      average: true,
      // [DVI001-13652] SKT 요청사항
      average_place: '',
      unit: Tw.CHART_UNIT.TIME, //x축 이름
      data_arry: itemsVoiceChart // voice obj
    });
    if (itemsVoiceChart.length > 0) {
      if (!idTabSelect) {
        idTabSelect = '2';
      }
    }
    // "문자" 탭
    // [DVI001-13652] SKT 요청사항 (역순)
    if (this.data.recentUsage.sms) {
      for ( index = this.data.recentUsage.sms.length - 1; index >= 0; index -= 1 ) {
        item = this.data.recentUsage.sms[index];
        usage = parseInt(item.totalUsage, 10); // 배열 평균값으로 전달
        if (usage) {
          itemsSMSChart.push({
            t: this._recentChartDate(item.invMth), // 각 항목 타이틀
            v: usage
          });
        }
      }
    }
    this.$recentUsage.chart2({
      type: Tw.CHART_TYPE.BAR_5, //bar
      target: '.fe-tab-sms', //클래스명 String
      average: true,
      // [DVI001-13652] SKT 요청사항
      average_place: '',
      unit: Tw.CHART_UNIT.SMS, //x축 이름
      data_arry: itemsSMSChart // sms obj
    });
    if (itemsSMSChart.length > 0) {
      if (!idTabSelect) {
        idTabSelect = '3';
      }
    }
    // 데이터가 모두 없는 경우 미노출
    if (itemsDataChart.length === 0 && itemsVoiceChart.length === 0 && itemsSMSChart.length === 0) {
      this.$recentUsage.remove();
      this._isRecentUsageRequested = true;
      return false;
    }
    // 데이터가 존재하는 첫번째 탭을 활성화
    this.__selectRecentUsageTab(idTabSelect);
  },
  /**
   * @function
   * @desc 다른회선 정보
   * @param {int} from
   * @param {int} end
   */
  _initOtherLinesInfo: function (from, end) {
    this._isRequestOtherLinesInfo = true;
    var requestCommand = [];
    for ( var idx = from; idx < end; idx++ ) {
      this._svcMgmtNumList.push(this.data.otherLines[idx].svcMgmtNum);
      var param = { command: Tw.API_CMD.BFF_05_0001 };
      if (this.data.otherLines[idx].child) {
        param.params = { childSvcMgmtNum: this.data.otherLines[idx].svcMgmtNum };
      } else {
        // 간편로그인이 아닌 경우에만 다른회선잔여량도 포함시킨다.
        if (this.data.svcInfo.loginType !== Tw.AUTH_LOGIN_TYPE.EASY) {
          // 서버 명세가 변경됨 svcMgmtNum -> T-svcMgmtNum
          param.headers = { 'T-svcMgmtNum': this.data.otherLines[idx].svcMgmtNum };
        }
      }
      requestCommand.push(param);
    }
    if (requestCommand.length > 0) {
      this._apiService
        .requestArray(requestCommand)
        .done($.proxy(this._responseOtherLine, this))
        .fail($.proxy(this._errorRequest, this));
    } else {
      // 다른 회선 정보는 있지만 조회할 수 없는 경우 숨김
      this.$container.find('[data-id=empty-other-lines]').hide();
      this.$otherLines.hide();
    }
  },
  /**
   * @function
   * @desc _initOtherLinesInfo() 의 실시간 사용량 조회 성공 콜백
   */
  _responseOtherLine: function () {
    var list = [];
    if (arguments.length > 0) {
      for ( var idx = 0; idx < arguments.length; idx++ ) {
        var selectLine = this.__selectOtherLine(this._svcMgmtNumList[idx]);
        var data = {};
        if (arguments[idx].code === Tw.API_CODE.CODE_00) {
          var result = arguments[idx].result;
          // 집전화 정액제 상품
          if (result.balance) {
            if (result.balance[0]) {
              result.voice = [];
              result.voice.push(result.balance[0]);
            }
            if (result.balance[1]) {
              result.sms = [];
              result.sms.push(result.balance[1]);
            }
          }
          var item = this.__parseRemnantData(result);
          if (item.total) {
            data = {
              data: item.totalLimit ? Tw.COMMON_STRING.UNLIMIT : item.total.showRemained.data,
              unit: item.totalLimit ? '' : item.total.showRemained.unit
            };
          } else {
            if (item.sdata.length > 0) {
              data = {
                data: item.sdata[0].showRemained ? item.sdata[0].showRemained.data : item.sdata[0].remained,
                unit: item.sdata[0].showRemained ? item.sdata[0].showRemained.unit : ''
              };
            } else {
              if (item.voice.length > 0) {
                data = {
                  data: item.voice[0].showRemained.hours + Tw.VOICE_UNIT.HOURS + item.voice[0].showRemained.min + Tw.VOICE_UNIT.MIN,
                  unit: ''
                };
              } else {
                if (item.sms.length > 0) {
                  var smsTotalData = item.sms[0].total;
                  if (item.sms[0].isUnlimit && smsTotalData) {
                    var isStandard = smsTotalData === Tw.COMMON_STRING.STANDARD;
                    data = {
                      data: isStandard ? Tw.COMMON_STRING.UNLIMIT : smsTotalData,
                      unit: isStandard ? '' : Tw.SMS_UNIT
                    };
                  } else {
                    data = {
                      data: item.sms[0].showRemained,
                      unit: Tw.SMS_UNIT
                    };
                  }
                }
              }
            }
          }
        } else {
          data = {
            data: Tw.MYT_DATA_ERROR_CODE.DEFAULT,
            unit: ''
          };
        }
        data.first = idx === 0;
        data.index = idx;
        data.svcType = this.__selectSvcType(selectLine.svcAttrCd);
        data.length = arguments.length;
        data = _.extend(selectLine, data);
        list.push(data);
      }
    }
    this._svcMgmtNumList = [];
    console.log('###########', list);
    this._initOtherLineList(list);
  },
  /**
   * @function
   * @desc 다른회선 리스트
   * @param list
   */
  _initOtherLineList: function (list) {
    if (list.length > 0) {
      var childSwipeContainer = this.$container.find('.child-swiper-box.submain-swipe');
      var widgetTemp = this.$childLineWidgetTemp();
      childSwipeContainer.append(widgetTemp);
      for ( var i = 0; i < list.length; i++ ) {
        var $ul = this.$container.find('ul.my-line-info');
        var result = this.$moreTempleate(list[i]);
        $ul.append(result);
        var lineTemp = this.$childLineTempleate(list[i]);
        childSwipeContainer.find('.slider').append(lineTemp);
      }
      skt_landing.widgets.widget_slider6();
    }
  },

  /**
   * @function
   * @desc 최근데이터사용량 월표시 (당해년 제외 년월로 표시)
   * @param {String} date
   * @returns {string}
   */
  _recentChartDate: function (date) {
    var curYear = new Date().getFullYear();
    var inputYear = Tw.DateHelper.convDateFormat(date).getFullYear();
    return Tw.DateHelper.getShortKoreanMonth(date, (curYear !== inputYear));
  },
  /**
   * @function
   * @desc 즉시충전 상세보기
   */
  _onImmChargeDetail: function (event) {
    event.preventDefault();
    var $target = $(event.currentTarget);
    switch ( $target.data('id') ) {
      case 'history':
        this._historyService.goLoad('/myt-data/history');
        break;
      case 'ting':
        this._historyService.goLoad('/myt-data/recharge/ting');
        break;
      case 'data':
        this._onDataPesterDetail($target);
        break;
      case 'etc-wrap':
        this._historyService.goLoad('/myt-data/giftdata');
        break;
      case 'limit':
        this._historyService.goLoad('/myt-data/giftdata');
        break;
    }
  },

  /**
   * @function
   * @desc pps 인 경우 자동알람서비스 그 외 데이터선물하기
   */
  _onTPresentDetail: function () {
    if (this.data.svcInfo.svcAttrCd === 'M2') {
      // PPS 인 경우 자동알람서비스 - 190128 SB 기준 변경됨
      // 인증인 API 호출시 인증화면으로 넘어감으로 DC_09_05로 이동 - 재차 확인 필요
      this._historyService.goLoad('/myt-data/recharge/prepaid/alarm');
      // if ( Tw.BrowserHelper.isApp() ) {
      // }
      // else {
      //   // CO_UT_09_01 page 이동
      //   this._historyService.goLoad('/common/share/app-install/info');
      // }
    } else {
      this._historyService.goLoad('/myt-data/giftdata');
    }
    return false;
  },
  /**
   * @function
   * @desc T가족모아
   */
  _onFamilyMoaDetail: function () {
    // 공유 버튼
    this._historyService.goLoad('/myt-data/familydata/share');
    return false;
  },
  /**
   * @function
   * @desc 데이터 혜텍
   */
  _onDataBenefitDetail: function () {
    this._bpcpService.open(Tw.OUTLINK.DATA_COUPON.DATA_FACTORY);
    return false;
  },
  /**
   * @function
   * @desc 데이터 조르기
   * @param {Object} e
   */
  _onDataPesterDetail: function ($target) {
    if (Tw.BrowserHelper.isApp()) {
      //  2_A17 Alert 호출
      this._popupService.openModalTypeA(
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.TITLE,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.MSG,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.BUTTON,
        null,
        $.proxy(this._pesterDetailConfirm, this),
        null,
        null,
        null,
        $target
      );
    } else {
      this._goAppInfo($target);
    }
    return false;
  },
  /**
   * @function
   * @desc 서비스 이용안내 팝업
   * @param {Object} e
   */
  _goAppInfo: function ($target) {
    var isAndroid = Tw.BrowserHelper.isAndroid();
    this._popupService.open({
      'hbs': 'open_app_info',
      'isAndroid': isAndroid,
      'cdn': Tw.Environment.cdn
    }, $.proxy(this._onOpenTworld, this), null, null, $target);
  },
  /**
   * @function
   * @desc T월드 설치 페이지
   * @param $layer
   */
  _onOpenTworld: function ($layer) {
    new Tw.CommonShareAppInstallInfo($layer);
    return false;
  },
  /**
   * @function
   * @desc excel 기준 (조르기 : OS 내 페이지 공유화면 제공)
   */
  _pesterDetailConfirm: function () {
    this._popupService.close();
    // excel 기준 (조르기 : OS 내 페이지 공유화면 제공)
    var content = Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.TITLE + this.data.svcInfo.svcNum +
      Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.CONTENT + Tw.OUTLINK.TWORLD_DATA_PRESENT;
    Tw.CommonHelper.share(content);
  },

  /**
   * @function
   * @desc 리필쿠폰
   */
  _onRefillDetail: function (evt) {
    // this._historyService.goLoad('/myt-data/recharge/coupon?from=submain');
    evt.preventDefault();
    var $target = $(evt.target);
    if ($target.data('id') === 'refill-btn' || $target.data('id') === 'gift-btn') {
      var $data = $target.siblings('[data-id=usable-coupon]');
      var no = $data.data('value').split('::')[0];
      var name = $data.data('value').split('::')[1];
      var period = $data.data('value').split('::')[2];
      var gift = $data.data('value').split('::')[3];
      var tab = $target.data('id') === 'refill-btn' ? 'refill' : 'gift';
      this._historyService.goLoad(
        '/myt-data/recharge/coupon/use?tab=' + tab +'&no=' + no + '&name=' +
        name + '&period=' + period + '&gift=' + gift
      );
    }
  },

  // 충전/선물내역 상세
  // _onBreakdownListDetail: function () {
  //   this._historyService.goLoad('/myt-data/history');
  // },

  /**
   * @function
   * @desc 다른 회선 잔여량 상세
   * @param {Object} event
   */
  _onOtherLinesItemDetail: function (event) {
    var $target = $(event.target).parents('[data-svc-mgmt-num]'),
        mgmtNum = $target.attr('data-svc-mgmt-num'),
        number  = $target.attr('data-num'),
        isChild = $target.find('.icon-children').length > 0;
    if (mgmtNum) {
      if (isChild) {
        // 자녀회선
        this._historyService.goLoad('/myt-data/submain/child-hotdata?childSvcMgmtNum=' + mgmtNum);
        return false;
      } else {
        this.changeLineMgmtNum = mgmtNum;
        this.changeLineMdn = number;

        var target = _.find(this.data.otherLines, { svcMgmtNum: mgmtNum });
        this._popupService.openSwitchLine(this.data.svcInfo, target, Tw.REMNANT_OTHER_LINE.BTNAME, null,
          $.proxy(this._onChangeLineConfirmed, this), null, 'change_line', null, $target.find('button'));
      }
    }
  },
  /**
   * @function
   * @desc 다른 회선 더보기
   */
  _onOtherLinesMore: function () {
    var renderedListCnt = this.$otherLines.find('.my-line-info li').length;
    var gapCnt = this.data.otherLines.length - renderedListCnt;
    var isMore = false;
    if (gapCnt > this._OTHER_LINE_MAX_COUNT) {
      gapCnt = this._OTHER_LINE_MAX_COUNT;
      isMore = true;
    }
    var fromCnt = renderedListCnt;
    var endCnt = fromCnt + gapCnt;
    if (gapCnt > 0) {
      this._initOtherLinesInfo(fromCnt, endCnt);
      if (isMore) {
        this.$otherLines.find('.btn-more').show();
      } else {
        this.$otherLines.find('.btn-more').hide();
      }
    }
  },

  /**
   * @function
   * @desc 다른 회선 팝업에서 변경하기 눌렀을 경우
   */
  _onChangeLineConfirmed: function () {
    // 회선변경 API 호출
    this._popupService.close();
    var lineService = new Tw.LineComponent();
    lineService.changeLine(this.changeLineMgmtNum, this.changeLineMdn, $.proxy(this._onChangeSessionSuccess, this));
  },
  /**
   * @function
   * @desc 회선 변경 후 처리
   */
  _onChangeSessionSuccess: function () {
    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.toast(Tw.REMNANT_OTHER_LINE.TOAST);
    }
    setTimeout($.proxy(function () {
      this._historyService.reload();
    }, this), 500);
  },
  /**
   * @function
   * @desc url 이동
   * @param {Object} event
   */
  _onOtherPages: function (event) {
    var $target = $(event.currentTarget);
    var href = $target.attr('data-href');
    console.log('########################href ==> ', href);
    this._historyService.goLoad(href);
    return false;
  },
  /**
   * @function
   * @desc 선불쿠폰 이동
   * @param {Object} event
   */
  _onPrepayCoupon: function (event) {
    // var $target = $(event.currentTarget).find('button');
    var type = $(event.currentTarget).find('a').data('type');
    var url = '';
    switch ( type ) {
      case 'data':
        url = Tw.OUTLINK.DATA_COUPON.T_DATA;
        break;
      case 'coupon':
        url = Tw.OUTLINK.DATA_COUPON.T_COUPON;
        break;
      case 'oksusu':
        url = Tw.OUTLINK.DATA_COUPON.OKSUSU;
        break;
      case 'jeju':
        url = Tw.OUTLINK.DATA_COUPON.JEJU;
        break;
      case 'sdata':
        url = Tw.OUTLINK.DATA_COUPON.T_SHORT_DATA;
        break;
    }
    this._bpcpService.open(url);
    return false;
  },
  /**
   * @function
   * @desc _initRecentUsageChart() 실행
   * @param resp
   * @private
   */
  _successRequestRecentUsage: function (resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      // OP002-794: 집계중기간(매월 1일 ~ 12일경) 지난달 제외한 직전3개월 데이터로 표시함. 항상 노출로 변경
      this.data.recentUsage = resp.result;
      setTimeout($.proxy(this._initRecentUsageChart, this), 300);
    }
  },

  /**
   * @function
   * @desc _requestRecentUsage() error 콜백
   * @param resp
   * @private
   */
  _errorRequestRecentUsage: function (resp) {
    this.$container.find('[data-id=recent_usage]').remove();
    this._errorRequest(resp);
  },
  /**
   * @function
   * @desc 에러 팝업
   * @param resp
   * @private
   */
  _errorRequest: function (resp) {
    if (!resp) {
      resp = {
        code: '',
        msg: Tw.ALERT_MSG_COMMON.SERVER_ERROR
      };
    }
    Tw.Error(resp.code, resp.msg).pop();
  },
  /**
   * @function
   * @desc BPCP 초기화
   * @private
   */
  _initBpcp: function () {
    this._bpcpService.open(this._bpcpServiceId);
    history.replaceState(null, document.title, location.origin + '/myt-data/submain');
  },

  /**
   * 선물하기 500mb 이상 체크 미대상 요금제 조회
   */
  _getLteProdIds: function() {
    this._isRequestGiftData = true;
    this._apiService.request(Tw.API_CMD.BFF_01_0069, {
      property: 'str.ltegift.prodid'
    }).done($.proxy(function(resp) {
      if (resp.code === Tw.API_CODE.CODE_00) {
        // 'a/b/c' 형태로 전달
        this.unlimitProdIds = resp.result.split('/');
      } else {
        Tw.Logger.info('[API ERROR] getLteProdIds => ', resp);
        this.unlimitProdIds = [];
      }
      this._getGiftData();
    }, this));
  },

  /**
   * 선물하기 잔여데이터 조회
   * @private
   */
  _getGiftData: function () {
    if (this._isGiftData) {
      // 선물하기가 가능한경우
      if (this._isUnlimitProd()) {
        // 500mb 기본 제공량 데이터로 처리 할지 안할지 처리
        this._giftLimitedGiftUsageQty = 0;
      }
    }
    setTimeout(function () {
      this._apiService.request(Tw.API_CMD.BFF_06_0014, { reqCnt: this._giftReqCnt })
        .done($.proxy(this._onSuccessGiftDataInfo, this));
    }.bind(this), !this._giftReqCnt ? 0 : 3000);
  },
  /**
   * 선물하기 잔여데이터 조회 응답처리
   * @param res
   * @private
   */
  _onSuccessGiftDataInfo: function (res) {
    // MOCK RES DATA
    // var res = {
    //   'code': '00',
    //   'msg': 'success',
    //   'result': {
    //     'reqCnt': '0',
    //     'giftRequestAgainYn': 'N',
    //     'dataRemQty': '14263',
    //     'dataGiftPsblQty': '14263'
    //   },
    //   'loginType': 'T'
    // };
    var ERROR_CODE = {
      GFT0004: 'GFT0004',
      GFT0004_2: 'GFT0004_2'
    };
    var limitErrorCode = ERROR_CODE.GFT0004;
    if (this._isUnlimitProd()) {
      limitErrorCode = ERROR_CODE.GFT0004_2;
    }
    var code = res.code;
    if (code === Tw.API_CODE.CODE_00) {
      var result = res.result;
      // var apiDataQty = result.dataRemQty;
      // var dataQty = Tw.FormatHelper.convDataFormat(apiDataQty, 'MB');
      // OP002-6682 사용자에게 선물가능 한 용량이 아닌 잔여량으로 표시되어 수정(VOC)
      // 선물 가능 한 용량
      var apiDataQty = result.dataGiftPsblQty;
      var dataQty = Tw.FormatHelper.convDataFormat(apiDataQty, 'MB');
      if (result.giftRequestAgainYn === 'N') { // 재시도 가능여부 판단. N인경우 looping 중지, reqCnt 0부터 다시 요청
        this.$giftLoading.hide();
        this.$giftText.show();
        if (Tw.FormatHelper.isEmpty(apiDataQty)) {
          // 조회하기 버튼만 노출
          this.$giftRefreshBtn.show();
          // this.$giftText.find('span.large').addClass('em')
          //   .html(this._giftTextTemp('0', 'MB'));
        } else if (Number(result.dataRemQty) < this._giftLimitedGiftUsageQty) { // 데이터 잔여량이 기본 잔여 데이터(500mb)보다 작은 경우
          this.$giftWarningBox.show();
          this._unableGiftData(limitErrorCode);
          this.$giftText.find('span.large').addClass('em')
            .html(this._giftTextTemp(dataQty.data, dataQty.unit));
        } else {
          // API DATA SUCCESS
          this.$giftText.find('span.large').addClass('em')
            .html(this._giftTextTemp(dataQty.data, dataQty.unit));
        }
      } else {
        this._giftReqCnt = result.reqCnt; // 재시도 횟수
        this._getGiftData();
      }
    } else {
      this.$giftLoading.hide();
      this.$giftText.show();
      this.$giftRefreshBtn.show();
      this.$giftWarningBox.show();
      this.$giftText.find('span.large').addClass('em')
        .html(this._giftTextTemp('0', 'MB'));
      this._unableGiftData(code);
      // Tw.Error(res.code, res.msg).pop();
    }
  },
  /**
   * 선물하기 잔여데이터 표시
   * @param data
   * @param unit
   * @returns {string}
   * @private
   */
  _giftTextTemp: function (data, unit) {
    return data + '<span class="unit">' + unit + '</span>';
  },
  /**
   * 선물하기 에러메시지 노출 처리
   * @param code
   * @private
   */
  _unableGiftData: function (code) {
    var $warnningText = this.$giftWarningBox.find('.warning-txt');

    switch ( code ) {
      case 'GFT0001':
        $warnningText.html(Tw.MYT_DATA_GIFT.GFT0001);
        break;
      case 'GFT0002':
        $warnningText.html(Tw.MYT_DATA_GIFT.GFT0001);
        break;
      case 'GFT0003':
        $warnningText.html(Tw.MYT_DATA_GIFT.GFT0003);
        break;
      case 'GFT0004':
        $warnningText.html(Tw.MYT_DATA_GIFT.GFT0004);
        break;
      case 'GFT0004_2':
        $warnningText.html(Tw.MYT_DATA_GIFT.GFT0004_2);
        break;
      case 'GFT0005':
        $warnningText.html(Tw.MYT_DATA_GIFT.GFT0005);
        break;
      case 'GFT00013':
        $warnningText.html(Tw.MYT_DATA_GIFT.GFT0013);
        break;
      case 'ZORDC1020':
        $warnningText.html(Tw.MYT_DATA_GIFT.GFT0013);
        break;
      default:
        $warnningText.html(Tw.MYT_DATA_GIFT.DEFAULT);
        break;
    }
  },

  /**
   * 선물하기 재시도 버튼 이벤트
   * @private
   */
  _onGiftRefresh: function () {
    this.$giftText.find('span.large').removeClass('em')
      .html('');
    this.$giftWarningBox.find('.warning-txt');
    this.$giftWarningBox.hide();
    this.$giftRefreshBtn.hide();
    this.$giftText.hide();
    this.$giftLoading.show();
    this._giftReqCnt = 0;
    this._getGiftData();
  },

  /**
   * 무제한 요금제 체크
   * @returns {boolean}
   * @private
   */
  _isUnlimitProd: function () {
    return this.unlimitProdIds.indexOf(this.data.svcInfo.prodId) !== -1;
  },

  _getImmRechargeData: function () {
    var apiList = [
      { command: Tw.API_CMD.BFF_06_0020, params: {} },
      { command: Tw.API_CMD.BFF_06_0028, params: {} },
      { command: Tw.API_CMD.BFF_06_0034, params: {} },
      { command: Tw.API_CMD.BFF_05_0136, params: {} }
    ];
    this._apiService.requestArray(apiList)
      .done($.proxy(function (ting, etc, limit, optSvc) {
        if ( ting.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.ting = ting.result;
        }
        else if ( ting.code === Tw.API_CODE.ZPAYE0077 ) {
          // 팅 요금제 선물 차단 상태
          this.immChargeData.ting = null;
        }
        else {
          this.immChargeData.ting = ting;
        }
        if ( etc.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.etc = etc.result;
        } else {
          //  RCG0062: 팅/쿠키즈/안심음성 요금제 미사용중인 경우
          this.immChargeData.etc = null;
        }
        if ( optSvc.code === Tw.API_CODE.CODE_00 ) {
          // optProdList -> disProdList 합쳐짐 (BE 1/14 기준)
          if ( optSvc.result.disProdList && optSvc.result.disProdList.length > 0 ) {
            _.filter(optSvc.result.disProdList, $.proxy(function (item) {
              // 부가서비스
              if ( !this.immChargeData._isLimited ) {
                this.immChargeData._isLimited = (this._readOnlyProductIdList.indexOf(item.prodId) > -1);
              }
            }, this));
          }
        }
        // 해당요금제에 속해 있는 경우만 노출
        if ( this.immChargeData._isLimited ) {
          // API 정상 리턴시에만 충전방법에 데이터한도요금제 항목 노출 (DV001-4362)
          if ( limit.code === Tw.API_CODE.CODE_00 ) {
            this.immChargeData.limit = limit.result;
          }
          else {
            this.immChargeData.limit = null;
          }
        }
        /**
         * 데이터 셋팅 후 화면 처리
         */
        if (!this.immChargeData.ting) {
          // 팅 요금제 선물
          this.$immChargeSection.find('[data-id=ting]').hide();
        }
        if (!this.immChargeData.etc && !this.immChargeData.limit) {
          this.$immChargeSection.find('[data-id=etc-wrap]').hide();
        } else {
          if (!this.immChargeData.etc) {
            // 팅/쿠키즈/안심음성 요금제 사용중인 경우
            this.$immChargeSection.find('[data-id=etc]').hide();
          }
          if (!this.immChargeData.limit) {
            // 팅/쿠키즈/안심음성 요금제 사용중인 경우
            this.$immChargeSection.find('[data-id=limit]').hide();
          }
        }
      }, this));
  }
};
