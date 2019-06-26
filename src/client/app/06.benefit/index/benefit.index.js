/**
 * @file benefit.index.js
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018-10-26
 */
/**
 * @class
 * @desc 혜택 할인 Index
 * @param {Object} rootEl - dom 객체
 * @param {JSON} svcInfo
 * @param {String} bpcpServiceId
 * @param {String} eParam
 */
Tw.BenefitIndex = function (rootEl, svcInfo, bpcpServiceId, eParam) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(this.$container, '/benefit/submain/participation');
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();
  this._isLogin = !Tw.FormatHelper.isEmpty(svcInfo);
  this._svcInfo = svcInfo;
  this._svcMgmtNum = svcInfo && svcInfo.svcMgmtNum ? svcInfo.svcMgmtNum : '';
  this._bpcpServiceId = bpcpServiceId;
  this._eParam = eParam;
  this._init();
};

Tw.BenefitIndex.prototype = {
  /**
   * @function
   * @desc 최초 실행
   */
  _init: function () {
    this._initVariables();
    this._bindEvent();
    this._registerHelper();
    this._allRequest();
    if (!Tw.FormatHelper.isEmpty(this._bpcpServiceId)) {
      this._initBpcp();
    }
  },

  /**
   * @function
   * @desc BPCP 최초 호출
   */
  _initBpcp: function() {
    this._bpcpService.open(this._bpcpServiceId);
    history.replaceState(null, document.title, location.origin + '/benefit/submain/participation');
  },

  /**
   * @function
   * @desc 초기값 설정
   */
  _initVariables: function () {
    this.$benefitArea = this.$container.find('#fe-my-benefit-area');
    this.$benefitListArea = this.$container.find('#fe-benefit-list-area');
    this.$membership = this.$container.find('#fe-membership');
    this.$categoryTab = this.$container.find('#fe-category'); // 카테고리 탭
    this.$point = this.$container.find('#fe-point');
    this.$benefit = this.$container.find('#fe-benefit');
    this.$list = this.$container.find('#fe-list');
    this.$prodListArea = this.$container.find('#fe-prod-list-area');
    this.$showDiscountBtn = this.$container.find('#fe-show-discount'); // 할인금액 보기 버튼
    this.$clearBtn = this.$container.find('#fe-clear'); // 할인금액 보기 초기화 버튼

    // 결합할인금액 미리보기 > (인터넷, 이동전화, TV) 설정
    this.$internetType = this.$container.find('[data-name="inetTypCd"]'); // 인터넷
    this.$mblPhonLineCnt = this.$container.find('[data-name="mblPhonLineCnt"]'); // 이동전화
    this.$btvUseYn = this.$container.find('[data-name="btvUseYn"]'); // TV
    this.$discountResult = this.$container.find('#fe-discount-result');
    this.$discountAmt = this.$container.find('#fe-discount-amt');
    this.$withTax = this.$container.find('#fe-with-tax');
    this.$useCondition = this.$container.find('#fe-use-condition'); // 이용조건
    this.$combinationPreview = this.$container.find('#fe-combination-preview');
    this.$anotherPage = this.$container.find('#fe-another-page');
    this._G1 = 'G1'; // Giga code값
  },
  /**
   * @function
   * @desc 이벤트 설정
   */
  _bindEvent: function () {
    // this.$categoryTab.find('button').on('click', $.proxy(this._onClickCategory, this));
    this.$container.on('click', '[data-url]', $.proxy(this._goUrl, this));
    this.$container.on('change', '[data-check-disabled]', $.proxy(this._onCheckDisabled, this));
    this.$container.on('click', '.fe-plus, .fe-minus', $.proxy(this._onVariations, this));
    this.$internetType.on('click', $.proxy(this._checkStateLine, this));
    this.$showDiscountBtn.on('click', $.proxy(this._reqDiscountAmt, this));
    this.$container.on('click', '[data-benefit-id]', $.proxy(this._onClickProduct, this)); // 카테고리 하위 리스트 클릭
    this.$clearBtn.on('click', $.proxy(this._previewClear, this)); // 결합할인금액 미리보기 초기화
    
    this.$container.on('click', '.fe-agree', $.proxy(this._modAgree, this));  // T world 광고정보수신동의 활성화 처리
    this.$container.on('click', '.fe-show-detail', $.proxy(this._showAgreeDetail, this));   // T world 광고정보수신동의 약관 상세보기
    this.$container.on('click', '.fe-close', $.proxy(this._closeAgree, this));   // T world 광고정보수신동의 배너 닫기
  },

  /**
   * @function
   * @desc API 요청모음
   */
  _allRequest: function () {
    // 미 로그인, 준회원, 유선인 경우 [혜택/할인] 리스트만 조회한다.
    if (!this._isAbleDiscountInfoReq()) {
      this._switchTab(this._convertPathToCategory());
    } else {
      this._reqMyBenefitDiscountInfo();
    }
  },

  /**
   * @function
   * @desc 카테고리 아이디에 해당하는 탭 위치로 스크롤
   * @param {String} categoryId
   */
  _setScrollLeft: function (categoryId) {
    var $target = this.$categoryTab.find('[data-category="' + categoryId + '"]').parent();
    var x = parseInt($target.position().left, 10);
    var parentLeft = parseInt(this.$categoryTab.position().left, 10);
    this.$categoryTab.find('ul').scrollLeft(x - parentLeft);
  },

  /**
   * @function
   * @desc 리스트 내의 카테고리 클릭 시 해당 상품 원장으로 이동
   * 예외 case
   * + 외부 브라우저로 띄우기
   *  무엇이든 될 수 있는0(TW20000014)
   *  T 아너스 클럽(TW20000018)
   * + in app 으로 띄우기
   *  데이터 충전소(TW20000019) : 이건 BPCP 호출
   * @param {Object} e
   */
  _onClickProduct: function (e) {
    var _benefitId = $(e.currentTarget).data('benefitId');
    if (['TW20000014', 'TW20000018'].indexOf(_benefitId) > -1) {
      var externalUrl = {
        TW20000014 : Tw.OUTLINK.BECOME_ANYTHING,
        TW20000018 : Tw.OUTLINK.T_HONORS_CLUB
      };
      this._alertCharge(externalUrl[_benefitId]);
    } else if ('TW20000019' === _benefitId) {
      this._bpcpService.open(Tw.OUTLINK.DATA_COUPON.DATA_FACTORY);
    } else {
      location.href= '/product/callplan?prod_id=' + _benefitId;
    }
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 활성화 처리
   */
  _modAgree: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0022, {twdAdRcvAgreeYn: 'Y'})
      .done(function (){
        $('#agree-banner-area').hide();
      })
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 약관 상세보기
   */
  _showAgreeDetail: function () {
    Tw.CommonHelper.openTermLayer2('03');
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 배너 닫기
   */
  _closeAgree: function () {
    $('#agree-banner-area').hide();
  },

  /**
   * @function
   * @desc 과금발생 알러트
   * @param {String} _href - 이동할 url
   */
  _alertCharge: function (_href) {
    if (Tw.FormatHelper.isEmpty(_href)) {
      return;
    }

    // app 이 아니면 알러트 제외
    if (!Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.openUrlExternal(_href);
    } else {
      Tw.CommonHelper.showDataCharge($.proxy(function(){
        Tw.CommonHelper.openUrlExternal(_href);
      },this));
    }
  },

  /**
   * @function
   * @desc 인터넷 회선 선택에 따른, 이동전화 증/감(+,-) 버튼 Disabled 처리함.
   * @param {Object} e
   */
  _checkStateLine: function (e) {
    var $this = $(e.currentTarget);
    var $lineCnt = this.$mblPhonLineCnt;
    var _cnt = $lineCnt.text();
    var $addBtn = this.$container.find('.plus');

    var fnAddBtnDisabled = function (bool) {
      $addBtn.prop('disabled', bool);
      if (bool) {
        $addBtn.addClass('disabled');
      } else {
        $addBtn.removeClass('disabled');
      }
    };

    // Giga 선택시
    if ($this.val() === this._G1) {
      if (_cnt < 5) {
        fnAddBtnDisabled(false);
      } else {
        fnAddBtnDisabled(true);
      }
    } else {
      if (_cnt >= 4) {
        $lineCnt.text(4);
        fnAddBtnDisabled(true);
      } else {
        fnAddBtnDisabled(false);
      }
    }

  },

  /**
   * @function
   * @desc 이동전화 회선 증/감 클릭 이벤트
   * @param {Object} e
   */
  _onVariations: function (e) {
    var $this = $(e.currentTarget);
    var $lineCnt = this.$mblPhonLineCnt;
    var _cnt = $lineCnt.text();
    $this.siblings('button').prop('disabled', false).removeClass('disabled');

    // 감소 클릭
    if ($this.hasClass('fe-minus')) {
      var _minCnt = 1;
      $lineCnt.text(_cnt-- < _minCnt ? _minCnt : _cnt);
      if (_cnt <= _minCnt) {
        $this.prop('disabled', true).addClass('disabled');
      }
    }
    // 증가 클릭
    else {
      // 광랜 4회선, Giga : 5회선
      var _maxCnt = this.$internetType.filter(':checked').val() === this._G1 ? 5 : 4;
      $lineCnt.text(_cnt++ > _maxCnt ? _maxCnt : _cnt);
      if (_cnt >= _maxCnt) {
        $this.prop('disabled', true).addClass('disabled');
      }
    }
  },

  /**
   * @function
   * @desc '할인금액 보기' 버튼 disabled 체크 (인터넷 & TV 가 체크 되어야 활성화)
   */
  _onCheckDisabled: function () {
    var isDisabled = false;
    this.$container.find('[data-check-disabled]').each(function () {
      if ($(this).find('input:radio:checked').val() === undefined) {
        isDisabled = true;
        return false;
      }
    });

    this.$showDiscountBtn.toggleClass('disabled',isDisabled).prop('disabled', isDisabled);
  },

  /**
   * @function
   * @desc 페이지 이동
   * @param {Object} e
   */
  _goUrl: function (e) {
    window.location.href = $(e.currentTarget).data('url');
  },

  /**
   * @function
   * @desc 핸들바스 파일에서 사용할 펑션 등록
   */
  _registerHelper: function () {
    Handlebars.registerHelper('numComma', function(val){
      return Tw.FormatHelper.isEmpty(val) ? val:Tw.FormatHelper.addComma(val.toString());
    });
    Handlebars.registerHelper('isEmpty', function (val, options) {
      return Tw.FormatHelper.isEmpty(val) ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('isNotEmpty', function (val, options) {
      return !Tw.FormatHelper.isEmpty(val) ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('cdn', function(val){
      return Tw.Environment.cdn + val;
    });
    Handlebars.registerHelper('isNaN', function(val, options){
      return isNaN(val) ? options.fn(this) : options.inverse(this);
    });
  },

  /**
   * @function
   * @desc 나의 혜택/할인 요청 가능여부
   * @returns {boolean}
   */
  _isAbleDiscountInfoReq: function () {
    return !(!this._isLogin || this._svcInfo.svcAttrCd === '' || ['S1','S2','S3'].indexOf(this._svcInfo.svcAttrCd) > -1);
  },

  /**
   * @function
   * @desc 상단 > 나의 혜택.할인 정보 API들 호출 (9개 호출해서 계산)
   */
  _reqMyBenefitDiscountInfo: function () {
    this.$benefitArea.removeClass('none');
    this._apiService.requestArray([
      {command: Tw.API_CMD.BFF_11_0001},
      {command: Tw.API_CMD.BFF_07_0041},
      {command: Tw.API_CMD.BFF_05_0132},
      {command: Tw.API_CMD.BFF_05_0175},
      {command: Tw.API_CMD.BFF_05_0120},
      {command: Tw.API_CMD.BFF_05_0115},
      {command: Tw.API_CMD.BFF_05_0106},
      {command: Tw.API_CMD.BFF_05_0094},
      {command: Tw.API_CMD.BFF_05_0196},
      {command: Tw.API_CMD.BFF_03_0021} // T world 동의여부 조회
    ]).done($.proxy(this._successMyBenefitDiscountInfo, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc _reqMyBenefitDiscountInfo 성공 콜백
   * 상단 > 나의 혜택.할인 정보 값 설정
   */
  _successMyBenefitDiscountInfo: function () {
    var data = {
      membership: '',
      point: 0,
      benefitDiscount: 0
    };

    var countPoint = function (resp1, targets) {
      if (resp1.code === Tw.API_CODE.CODE_00) {
        targets.forEach(function (o) {
          data.point += Number(resp1.result[o]);
        });
      }
    };

    var resp;
    // 멤버십 등급
    if ((resp = arguments[0]).code === Tw.API_CODE.CODE_00) {
      data.membership = Tw.MEMBERSHIP_GRADE[resp.result.mbrGrCd];
    }

    // 포인트 합산 시작
    countPoint(arguments[1], ['availPt', 'availTPt']); // OK 캐쉬백 & T 포인트
    countPoint(arguments[2], ['usblPoint']); // 레인보우포인트
    countPoint(arguments[3], ['muPoint']); // 무약정 플랜
    countPoint(arguments[4], ['usblPoint']); // 현역플랜 포인트
    countPoint(arguments[5], ['usblPoint']); // 쿠키즈팅 포인트
    // 포인트 합산 시작 끝

    // 혜택.할인 건수 시작
    if ((resp = arguments[6]).code === Tw.API_CODE.CODE_00) {
      // 요금할인
      data.benefitDiscount += resp.result.priceAgrmtList.length;
      // 요금할인- 복지고객
      data.benefitDiscount += (resp.result.wlfCustDcList && resp.result.wlfCustDcList.length > 0) ? resp.result.wlfCustDcList.length : 0;
    }
    // 결합할인
    if ((resp = arguments[7]).code === Tw.API_CODE.CODE_00) {
      var resp1 = resp.result;
      if (resp1.prodNm.trim() !== '') {
        data.benefitDiscount += Number(resp1.etcCnt) + 1;
      }
    }
    // 장기가입 혜택 건수
    if ((resp = arguments[8]).code === Tw.API_CODE.CODE_00) {
      // 장기가입 쿠폰
      data.benefitDiscount += (resp.result.benfList && resp.result.benfList.length > 0) ? 1 : 0;
      // 장기가입 요금
      data.benefitDiscount += (resp.result.dcList && resp.result.dcList.length > 0) ? resp.result.dcList.length : 0;
    }
    // 혜택.할인 건수 끝
    // T world 광고성 정보 수신동의(선택) 여부
    if ((resp = arguments[9]).code === Tw.API_CODE.CODE_00) {
      if (resp.result.twdAdRcvAgreeYn === 'Y') {
        this._apiService.request(Tw.API_CMD.BFF_03_0022, {twdAdRcvAgreeYn: 'N'});
      } else {
        $('#agree-banner-area').show();
      }
    }

    this.$membership.text(data.membership);
    this.$point.prepend(Tw.FormatHelper.addComma(data.point.toString()));
    this.$benefit.text(this.$benefit.text() + ' ' + data.benefitDiscount + Tw.BENEFIT.INDEX.COUNT_SUFFIX);

    // DV001-18387 : 상단 나의혜택 할인영역이 먼저 노출 후 하단 혜택 리스트 노출한다.
    this._switchTab(this._convertPathToCategory());
  },

  /**
   * @function
   * @desc 카테고리 '탭' 선택
   * @param {String} categoryId
   */
  _switchTab: function (categoryId) {
    // 모두 체크해제 , 현재 탭 활성화
    this.$categoryTab.find('[data-category]').removeClass('on').attr('aria-selected', false);
    this.$categoryTab.find('[data-category="{0}"]'.replace('{0}', categoryId)).addClass('on').attr('aria-selected', true);

    this._reqProductList(categoryId);
    this.$combinationPreview.addClass('none');
    this.$discountResult.addClass('none');

    // 결합할인 클릭 이라면 '결합할인금액 미리보기' 노출
    if (categoryId === 'F01422') {
      this.$combinationPreview.removeClass('none');
    }
  },

  /**
   * @function
   * @desc URL 마지막 Path 에 해당하는 카테고리 아이디 반환
   * @returns {String}
   */
  _convertPathToCategory : function () {
    var categoryId = {
      'discount'      : 'F01421',
      'combinations'  : 'F01422',
      'long-term'     : 'F01423',
      'participation' : 'F01424',
      'submain'       : ''
    };
    return categoryId[Tw.UrlHelper.getLastPath()];
  },

  /**
   * @function
   * @desc 상품 리스트 조회요청
   * @param {String} category
   */
  _reqProductList: function (category) {
    this._apiService
      .request(Tw.API_CMD.BFF_10_0054, {
        idxCtgCd: 'F01400',
        benefitCtgCd: category,
        searchListCount: 50
      })
      .done($.proxy(this._successProductList, this, category))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc 더보기 버튼 없는경우 nogaps-top / 더보기 버튼 있는경우 nogaps
   * @param {int} nextCount - 다음 리스트 카운트
   * @returns {string}  - 클래스 이름
   */
  _getCssMore: function (nextCount) {
    return nextCount < 1 ? 'nogaps-top' : 'nogaps';
  },

  /**
   * @function
   * @desc _reqProductList() 성공시 콜백
   * @param {String} category
   * @param {JSON} resp
   */
  _successProductList: function (category, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      this._onFail(resp);
      return;
    }

    this.$list.empty();
    /**
     * 리스트 수신 후 처리순서
     * 1. 혜택/할인 리스트 노출
     * 2. [다른 페이지를 찾고 계신가요?] 노출
     * 3. 현재 탭으로 스크롤 이동
     */
    this.$benefitListArea.removeClass('none');
    this.$anotherPage.removeClass('none');
    this._setScrollLeft(this._convertPathToCategory());

    // 더보기 설정
    this._moreViewSvc.init({
      list: resp.result.list,
      btnMore: this.$container.find('.btn-more'),
      callBack: $.proxy(this._renderList, this, category),
      isOnMoreView: true
    });
  },

  /**
   * @function
   * @desc 상품 리스트 렌더
   * @param {String} category
   * @param {JSON} res
   */
  _renderList: function (category, res) {
    var source = $('#productList').html();
    this.$prodListArea.removeClass('nogaps-top').addClass(this._getCssMore(res.nextCnt));
    var template = Handlebars.compile(source);
    var output = template({
      list: res.list,
      category: category
    });
    this.$list.append(output);
  },

  /**
   * @function
   * @desc 할인금액 보기 조회 요청
   */
  _reqDiscountAmt: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_10_0039, {
        inetTypCd: this.$internetType.filter(':checked').val(),
        mblPhonLineCnt: this.$mblPhonLineCnt.text(),
        btvUseYn: this.$btvUseYn.filter(':checked').val()
      })
      .done($.proxy(this._successDiscountAmt, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc 할인금액 보기 조회 요청 성공시
   * @param {JSON} resp
   */
  _successDiscountAmt: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      this._onFail(resp);
      return;
    }
    // 버튼명 토글 해준다. (할인금액보기 <-> 초기화)
    this.$showDiscountBtn.addClass('none');
    this.$clearBtn.removeClass('none').attr('aria-pressed', true);
    this.$clearBtn.focus();
    var _data = resp.result;
    // 데이터가 없을때
    if (Tw.FormatHelper.isEmpty(_data)) {
      return;
    }

    this.$discountAmt.text(_data.dcPhrsCtt);
    this.$withTax.text(_data.dcPhrsAddDesc);
    this.$useCondition.html(_data.useCondHtmlCtt);
    this.$discountResult.removeClass('none');
  },

  /**
   * @function
   * @desc 할인금액 미리보기 선택값 초기화
   */
  _previewClear: function() {
    // 인터넷
    this.$container.find('#fe-preview-internet li').removeClass('checked')
      .attr('aria-checked', false)
      .find('[name="inetTypCd"]').prop('checked', false);
    // 이동전화
    this.$mblPhonLineCnt.text('1');
    this.$container.find('.fe-minus').addClass('disabled').prop('disabled', true);
    this.$container.find('.fe-plus').removeClass('disabled').prop('disabled', false);
    // TV
    this.$container.find('#fe-preview-tv li').removeClass('checked')
      .attr('aria-checked', false)
      .find('[name="btvUseYn"]').prop('checked', false);

    // 버튼명 토글 해준다. (할인금액보기 <-> 초기화)
    this.$showDiscountBtn.removeClass('none').attr('aria-pressed', true);
    this.$clearBtn.addClass('none');
    this._onCheckDisabled();
    // 접근성 이슈(disable button에 focus 안 됨) -> 결합할인 타이틀로 focus
    this.$container.find('#fe-combination-title').eq(0).focus();
  },

  /**
   * @function
   * @desc API Fail
   * @param {JSON} err
   */
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};
