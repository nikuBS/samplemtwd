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
 * @param {Array} filters
 */
Tw.BenefitIndex = function (rootEl, svcInfo, bpcpServiceId, eParam, filters) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(this.$container, '/benefit/submain/participation');
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();
  this._isLogin = !Tw.FormatHelper.isEmpty(svcInfo);
  this._svcInfo = svcInfo;
  this._svcMgmtNum = svcInfo && svcInfo.svcMgmtNum ? svcInfo.svcMgmtNum : '';
  this._svcNum = svcInfo && svcInfo.svcNum ? svcInfo.svcNum : '';
  this._bpcpServiceId = bpcpServiceId;
  this._filters = filters;
  this._agreePopup = null;

  this._isAdult = false;
  this._userId = null;
  this._loginType = '';

  this._data = '';
  this._categoryListArray = [];

  this.defaultRequestUrls = [
    { command: Tw.API_CMD.BFF_07_0041 }, // ocbcard-info-check-show(오케이캐시백)
    { command: Tw.API_CMD.BFF_05_0132 }, // rainbow-points(레인보우포인트)
    { command: Tw.API_CMD.BFF_05_0175 }, // no-contract-plan-points (무약정플랜)
    // OP002-7146 혜택할인 변경 myT에서 받고 있는 혜택과 연동 요금할인으로 데이터 이동
    { command: Tw.API_CMD.BFF_05_0106 }, // bill-discounts (요금할인)
    { command: Tw.API_CMD.BFF_05_0094 }, // combination-discounts (결합할인)
    { command: Tw.API_CMD.BFF_05_0196 } // loyalty-benefits (장기가입혜택)
  ];
  this.defaultRequestUrls_T = this.defaultRequestUrls.concat([
    { command: Tw.API_CMD.BFF_11_0001 }, // /bypass/core-membership/v1/card/home
    { command: Tw.API_CMD.BFF_05_0115 }, // /bypass/core-bill/v1/cookiz-ting-points
    { command: Tw.API_CMD.BFF_03_0021 } // /bypass/core-auth/v1/tworld-term-agreements
  ]);
  this._benefitInfo = {
    ocb: null, rainbow: null, noplan: null, bill: null, combination: null, loyalty: null, membership: null, cookiz: null, tworld: null
  };
  this._init();
};

Tw.BenefitIndex.prototype = {
  /**
   * @function
   * @desc 최초 실행
   */
  _init: function () {
    Tw.Logger.info('[_init] 호출', '');

    this._initVariables();
    this._bindEvent();
    this._registerHelper();

    // 혜택/할인 카테고리 리스트 조회
    this._apiService.request(Tw.API_CMD.BFF_10_0033, {}, {}, ['F01420'])
      .done($.proxy(function (res) {
        Tw.Logger.info('[_init] BFF_10_0033 호출 결과', res);
        if (res.code === Tw.API_CODE.CODE_00) {
          if (res.result.filters.length > 0) {
            var source = $('#benefitCategoryList').html();
            var template = Handlebars.compile(source);

            var categoryListArray1 = [];
            var categoryListArray2 = [];
            for ( var idx = 0; idx < res.result.filters.length; idx++ ) {
              var filter = res.result.filters[idx];
              this._categoryListArray.push(filter);

              if (idx < 5) {
                categoryListArray1.push(filter);
              } else {
                categoryListArray2.push(filter);
              }
            }

            Tw.Logger.info('[_init] 전체 카테고리 리스트', this._categoryListArray);
            if (!Tw.FormatHelper.isEmpty(categoryListArray1)) {
              this.$categoryTab.find('#fe-category-list_1').append(template({
                list: categoryListArray1
              }));
            }
            if (!Tw.FormatHelper.isEmpty(categoryListArray2)) {
              this.$container.find('#fe-btn-more-category').attr('style', '');
              // this.$container.find('#fe-btn-more-category').removeAttribute('style');
              this.$categoryTab.removeClass('short');
              this.$categoryTab.find('#fe-category-list_2').append(template({
                list: categoryListArray2
              }));
            }
            // 환경변수 로딩이 완료된 이후 혜택할인 관련 API 호출되도록 수정
            if (!Tw.Environment.init) {
              $(window).on(Tw.INIT_COMPLETE, $.proxy(this._allRequest, this));
            } else {
              this._allRequest();
            }
            if (!Tw.FormatHelper.isEmpty(this._bpcpServiceId)) {
              this._initBpcp();
            }
          }
        }
      }, this))
      .fail(function (err) {
        // BFF_08_0080 API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
        Tw.Logger.info(err.code, err.msg);
      });

    if (!Tw.FormatHelper.isEmpty(this._bpcpServiceId)) {
      this._initBpcp();
    }
  },

  /**
   * @function
   * @desc BPCP 최초 호출
   */
  _initBpcp: function () {
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
    this.$anotherPage = this.$container.find('#fe-another-page');
    this._G1 = 'G1'; // Giga code값

    this.$agreePopup = $('body .popup.tw-popup');
  },
  /**
   * @function
   * @desc 이벤트 설정
   */
  _bindEvent: function () {
    // this.$categoryTab.find('button').on('click', $.proxy(this._onClickCategory, this));
    this.$container.on('click', '[data-url]', $.proxy(this._goUrl, this));
    this.$container.on('click', '[data-category]', $.proxy(this._onCategory, this));
    this.$container.on('change', '[data-check-disabled]', $.proxy(this._onCheckDisabled, this));
    this.$container.on('click', '.fe-plus, .fe-minus', $.proxy(this._onVariations, this));
    this.$internetType.on('click', $.proxy(this._checkStateLine, this));
    this.$showDiscountBtn.on('click', $.proxy(this._reqDiscountAmt, this));
    this.$container.on('click', '[data-benefit-id]', $.proxy(this._onClickProduct, this)); // 카테고리 하위 리스트 클릭
    this.$clearBtn.on('click', $.proxy(this._previewClear, this)); // 결합할인금액 미리보기 초기화

    this.$container.on('change', '.fe-agree', $.proxy(this._modAgree, this));  // T world 광고정보수신동의 활성화 처리
    this.$container.on('click', '.fe-pop-agree', $.proxy(this._modAgree, this));  // T world 광고정보수신동의 활성화 처리 (팝업)
    this.$container.on('click', '.fe-show-detail', $.proxy(this._showAgreeDetail, this));   // T world 광고정보수신동의 약관 상세보기
    this.$container.on('click', '.fe-pop-show-detail', $.proxy(this._showAgreeDetail, this));   // T world 광고정보수신동의 약관 상세보기
    this.$container.on('click', '.fe-close', $.proxy(function () {
      $('#agree-banner-area').hide();
    }, this));   // T world 광고정보수신동의 배너 닫기
    this.$container.on('click', '.fe-pop-close', $.proxy(this._onCloseAgreePopup, this));   // T world 광고정보수신동의 팝업 닫기
    this.$container.on('click', '.fe-pop-hide', $.proxy(this._hideTwdAdRcvAgreePop, this));   // T world 광고정보수신동의 팝업 다음에 보기 처리

    this.$agreePopup.on('click', '.fe-pop-close', $.proxy(this._onCloseAgreePopup, this));   // T world 광고정보수신동의 팝업 닫기
    this.$agreePopup.on('click', '.fe-pop-show-detail', $.proxy(this._showAgreeDetail, this));   // T world 광고정보수신동의 약관 상세보기
    this.$agreePopup.on('click', '.fe-pop-hide', $.proxy(this._hideTwdAdRcvAgreePop, this));   // T world 광고정보수신동의 팝업 하루동안 보지않기 처리
    this.$agreePopup.on('click', '.fe-pop-agree', $.proxy(this._modAgree, this));  // T world 광고정보수신동의 활성화 처리 (팝업)
  },

  /**
   * @function
   * @desc API 요청모음
   */
  _allRequest: function () {
    Tw.Logger.info('[_allRequest] 호출', '');
    // 미 로그인, 준회원, 유선인 경우 [혜택/할인] 리스트만 조회한다.
    if (!this._isAbleDiscountInfoReq()) {
      // TO-DO 미로그인, 준회원, 유선인 경우에 대한 처리 필요
      // this._switchTab(this._convertPathToCategory());
      this._reqProductList(['']);
    } else {
      this._loginType = this._svcInfo.loginType;

      // 간편로그인인 경우 만 나이 계산 API (BFF_08_0080) 호출 시 BE 단에 에러로그 발생하므로 예외 처리
      if (this._loginType !== 'S') {
        this._userId = this._svcInfo.userId;

        // 성인인지 여부 (만 14세 이상) 체크
        this._apiService.request(Tw.API_CMD.BFF_08_0080, {})
          .done($.proxy(function (res) {
            if (res.code === Tw.API_CODE.CODE_00) {
              if (res.result.age >= 14) {
                this._isAdult = true;
              }
            }
            // BFF_08_0080 API 호출 시 API code 가 정상으로 넘어오지 않더라도 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
          }, this))
          .fail(function (error) {
            // BFF_08_0080 API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
            Tw.Logger.info(error.code, error.msg);
          });
      }
      this._reqMyBenefitDiscountInfo();
    }
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
    var externalUrl = {
      TW20000014: Tw.OUTLINK.BECOME_ANYTHING,
      TW20000018: Tw.OUTLINK.T_HONORS_CLUB,
      TW20000028: '/myt-data/giftdata',
      TW20000029: '/membership/membership_info/mbrs_0001',
      TW20000031: '/myt-data/recharge/coupon'
    };
    if (['TW20000014', 'TW20000018'].indexOf(_benefitId) > -1) {
      this._alertCharge(externalUrl[_benefitId]);
    } else if ('TW20000019' === _benefitId) {
      this._bpcpService.open(Tw.OUTLINK.DATA_COUPON.DATA_FACTORY);
    } else if (['TW20000028', 'TW20000029', 'TW20000031'].indexOf(_benefitId) > -1) {
      location.href = externalUrl[_benefitId];
    } else {
      location.href = '/product/callplan?prod_id=' + _benefitId;
    }
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 활성화 처리 (팝업)
   */
  _modAgree: function (event) {
    var $target = $(event.currentTarget);
    this._apiService.request(Tw.API_CMD.BFF_03_0022, { twdAdRcvAgreeYn: 'Y' })
      .done($.proxy(function () {
        $('#agree-banner-area').hide();
        // 팝업인 경우
        if ($target.hasClass('fe-pop-agree')) {
          this._onCloseAgreePopup();
        }
        Tw.Popup.toast('수신동의가 완료되었습니다.');
      }, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 약관 상세보기
   */
  _showAgreeDetail: function (event) {
    var $target = $(event.currentTarget);
    if ($target.hasClass('fe-pop-show-detail')) {
      // 팝업인 경우
      this._onCloseAgreePopup();
    }
    Tw.CommonHelper.openTermLayer2('03');
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 팝업 하루동안 보지않기 처리
   */
  _hideTwdAdRcvAgreePop: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._setLocalStorage('hideTwdAdRcvAgreePop', this._userId, 365 * 10);
    } else {
      this._setCookie('hideTwdAdRcvAgreePop', this._userId, 365 * 10);
    }
    this._onCloseAgreePopup();
  },

  /**
   * @function
   * @desc 다음에 보기 처리 (Native localstorage 영역에 저장, 반영구적으로 비노출)
   */
  _setLocalStorage: function (key, userId, expiredays) {
    var keyName = key + '_' + userId;  // ex) hideTwdAdRcvAgreePop_shindh
    var today = new Date();

    today.setDate(today.getDate() + expiredays);

    Tw.CommonHelper.setLocalStorage(keyName, JSON.stringify({
      // expireTime: Tw.DateHelper.convDateFormat(today)
      expireTime: today
    }));
  },

  /**
   * @function
   * @desc 다음에 보기 쿠키 처리 (반영구적으로 비노출)
   */
  _setCookie: function (key, userId, expiredays) {
    var cookieName = key + '_' + userId;  // ex) hideTwdAdRcvAgreePop_shindh
    var today = new Date();

    today.setDate(today.getDate() + expiredays);

    document.cookie = cookieName + '=Y; path=/; expires=' + today.toGMTString() + ';';
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
      Tw.CommonHelper.showDataCharge($.proxy(function () {
        Tw.CommonHelper.openUrlExternal(_href);
      }, this));
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

    this.$showDiscountBtn.toggleClass('disabled', isDisabled).prop('disabled', isDisabled);
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
   * @desc 페이지 이동
   * @param {Object} e
   */
  _onCategory: function (e) {
    // '#전체' 카테고리
    var defaultTarget = this.$categoryTab.find('[data-category=""]');
    var selectedCategoryArray = [];
    if (defaultTarget.hasClass('on')) {
      // 기존에 전체 선택되어 상태
      defaultTarget.removeClass('on').attr('aria-selected', false);
    }
    _.each(this.$categoryTab.find('.on'), $.proxy(function (target) {
      var $target = $(target);
      selectedCategoryArray.push($target.data('category'));
    }, this));
    Tw.Logger.info('[_onCategory] 기 선택된 카테고리ID 리스트 갯수', selectedCategoryArray.length, '기 선택된 카테고리ID 리스트', selectedCategoryArray);

    // #전체 를 선택하는 경우
    if ($(e.currentTarget).data('category') === '') {
      Tw.Logger.info('[_onCategory] #전체 카테고리 선택하고자 하는 경우', '');

      // 현재 선택 활성화된 카테고리에 대해서 선택 비활성화 처리
      this.$categoryTab.find('.on').removeClass('on').attr('aria-selected', false);

      // [선택된 카테고리 리스트] 초기화 후 '#전체' 카테고리만 추가
      selectedCategoryArray = this._removeCategory(selectedCategoryArray, 'ALL');
    } else {
      // 그 외 특정 카테고리를 선택하는 경우
      for ( var idx = 0; this._categoryListArray.length > idx; idx++ ) {
        var categoryItem = this._categoryListArray[idx];
        if ($(e.currentTarget).data('category') === categoryItem.prodFltId) {

          // 해당 카테고리가 선택되어 있는 상태에서 한번 더 클릭하여 선택 해제하는 경우
          if (this._checkSelected(categoryItem.prodFltId)) {
            Tw.Logger.info('[_onCategory] #' + categoryItem.prodFltNm + ' 카테고리 선택해제하고자 하는 경우', '');

            // 해당 카테고리 선택 비활성화 처리
            $(e.currentTarget).removeClass('on').attr('aria-selected', false);
            // [선택된 카테고리 리스트] 에서 '#요금할인(F01421)' 제거
            selectedCategoryArray = this._removeCategory(selectedCategoryArray, categoryItem.prodFltId);
            Tw.Logger.info('[_onCategory] 선택된 카테고리ID 리스트', selectedCategoryArray);
          }
          // 해당 카테고리가 선택되지 않은 상태에서 클릭하여 선택하는 경우
          else {
            Tw.Logger.info('[_onCategory] #' + categoryItem.prodFltNm + ' 카테고리 선택하고자 하는 경우', '');

            // 해당 카테고리 선택 활성화 처리
            $(e.currentTarget).addClass('on').attr('aria-selected', true);

            // [선택된 카테고리 리스트] 에 '#요금할인(F01421)' 추가
            selectedCategoryArray.push($(e.currentTarget).data('category'));
            Tw.Logger.info('[_onCategory] 선택된 카테고리ID 리스트', selectedCategoryArray);
          }
        }
      }
    }

    if (Tw.FormatHelper.isEmpty(selectedCategoryArray)) {
      this.$container.find('#selected_category').val('');
    } else {
      var tempStr = '';
      for ( var selectedIdx = 0; selectedIdx < selectedCategoryArray.length; selectedIdx++ ) {
        var selectedCategoryItem = selectedCategoryArray[selectedIdx];
        if (selectedIdx < selectedCategoryArray.length - 1) {
          tempStr += selectedCategoryItem + '|';
        } else {
          tempStr += selectedCategoryItem;
        }
      }
      this.$container.find('#selected_category').val(tempStr);
    }
    // [선택된 카테고리 리스트] 에 등록된 카테고리에 매핑된 컨텐츠들을 모두 가져온다.
    this._reqProductList(selectedCategoryArray);
  },

  /**
   * @function
   * @desc 카테고리 선택 활성화 여부 체크
   * @param {String} category
   */
  _checkSelected: function (category) {
    var _checkSelected = false;
    if (this.$categoryTab.find('[data-category="' + category + '"]').hasClass('on')) {
      _checkSelected = true;
    }
    return _checkSelected;
  },

  /**
   * @function
   * @desc 카테고리 선택 비활성화 처리
   * @param {Array} categoryArray - 활성화되어 있는 카테고리 리스트
   * @param {String} category - 비활성화 하고자하는 카테고리 코드
   */
  _removeCategory: function (categoryArray, category) {
    Tw.Logger.info('[_removeCategory] 활성화되어 있는 카테고리 코드 리스트', categoryArray);
    Tw.Logger.info('[_removeCategory] 비활성화 하고자하는 카테고리 코드', category);

    var tempStr = this.$container.find('#selected_category').val();

    // 카테고리 리스트 전체 비우기
    if (category === 'ALL') {
      categoryArray.splice(0, categoryArray.length);
    } else {
      // 카테고리 리스트 배열에서 특정 카테고리 항목 제거
      Tw.Logger.info('[_removeCategory] 카테고리 리스트 배열에서 특정 카테고리 항목 제거', '');
      var idx = categoryArray.indexOf(category);
      // categoryArray.splice(idx, idx + 1);
      categoryArray.splice(idx, 1);
      Tw.Logger.info('[_removeCategory] 카테고리 특정 카테고리 비활성화 후 활성화된 카테고리 코드 리스트', categoryArray);

      if (tempStr.indexOf(category) > -1) {
        tempStr = tempStr.replace(category, '');

        if (tempStr.indexOf('||') > -1) {
          tempStr = tempStr.replace('||', '|');
        }

        this.$container.find('#selected_category').val(tempStr);
      }
    }

    // 활성화된 카테고리가 존재하지 않을 경우 default 로 '#전체' 카테고리를 리스트에 추가
    if (Tw.FormatHelper.isEmpty(categoryArray)) {
      Tw.Logger.info('[_removeCategory] 활성화된 카테고리가 존재하지 않을 경우 default 로 "#전체" 카테고리를 리스트에 추가', '');
      categoryArray.push('');

      this.$categoryTab.find('[data-category=""]').addClass('on').attr('aria-selected', true);
    }

    return categoryArray;
  },

  /**
   * @function
   * @desc 핸들바스 파일에서 사용할 펑션 등록
   */
  _registerHelper: function () {
    Handlebars.registerHelper('numComma', function (val) {
      return Tw.FormatHelper.isEmpty(val) ? val : Tw.FormatHelper.addComma(val.toString());
    });
    Handlebars.registerHelper('isEmpty', function (val, options) {
      return Tw.FormatHelper.isEmpty(val) ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('isNotEmpty', function (val, options) {
      return !Tw.FormatHelper.isEmpty(val) ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('cdn', function (val) {
      return Tw.Environment.cdn + val;
    });
    Handlebars.registerHelper('isNaN', function (val, options) {
      return isNaN(val) ? options.fn(this) : options.inverse(this);
    });
  },

  /**
   * @function
   * @desc 나의 혜택/할인 요청 가능여부
   * @returns {boolean}
   */
  _isAbleDiscountInfoReq: function () {
    return !(!this._isLogin || this._svcInfo.svcAttrCd === '' || ['S1', 'S2', 'S3'].indexOf(this._svcInfo.svcAttrCd) > -1);
  },

  /**
   * @function
   * @desc 상단 > 나의 혜택.할인 정보 API들 호출 (9개 호출해서 계산)
   */
  _reqMyBenefitDiscountInfo: function () {
    this.$benefitArea.removeClass('none');
    // 간편로그인인 경우 하기 3개 API 호출 시 BE 단에 에러로그 발생하므로 아예 호출하지 않도록 수정
    // - 멤버십 등급 조회 API (BFF_11_0001)
    // - 쿠키즈팅 포인트 정보 조회 API (BFF_05_0115)
    // - T world 동의여부 조회 API (BFF_03_0021))
    if (this._loginType === 'S') {
      this._apiService.requestArray(this.defaultRequestUrls)
        .done($.proxy(this._successMyBenefitDiscountInfo, this))
        .fail($.proxy(this._onFail, this));
    } else {
      this._apiService.requestArray(this.defaultRequestUrls_T)
        .done($.proxy(this._successMyBenefitDiscountInfo, this))
        .fail($.proxy(this._onFail, this));
    }
  },
  /**
   * @function
   * @desc _reqMyBenefitDiscountInfo 성공 콜백
   * 상단 > 나의 혜택.할인 정보 값 설정
   */
  _successMyBenefitDiscountInfo: function () {
    for ( var idx = 0; idx < arguments.length; idx++ ) {
      if (arguments[idx].code === Tw.API_CODE.CODE_00) {
        this._benefitInfo[Object.keys(this._benefitInfo)[idx]] = arguments[idx].result;
      }
    }
    var data = {
      membership: '',
      point: 0,
      benefitDiscount: 0
    };
    // 포인트 합산
    data.point += Number(this._benefitInfo.ocb.availPt);// OK 캐쉬백 & T 포인트
    data.point += Number(this._benefitInfo.ocb.availTPt);
    data.point += Number(this._benefitInfo.rainbow.usblPoint); // 레인보우포인트
    data.point += Number(this._benefitInfo.noplan.muPoint); // 무약정 플랜
    // 할인-혜택
    if (this._benefitInfo.bill) {
      data.benefitDiscount += this._benefitInfo.bill.priceAgrmtList.length; // 요금할인
      // 복지혜택 가입 여부 확인
      data.benefitDiscount +=
        (this._benefitInfo.bill.wlfCustDcList && this._benefitInfo.bill.wlfCustDcList.length > 0) ?
          this._benefitInfo.bill.wlfCustDcList.length : 0; // 요금할인 - 복지고객
      // 클럽
      data.benefitDiscount += this._benefitInfo.bill.clubYN ? 1 : 0;
      // 척척
      data.benefitDiscount += this._benefitInfo.bill.chucchuc ? 1 : 0;
      // T끼리플러스
      data.benefitDiscount += this._benefitInfo.bill.tplus ? 1 : 0;
      // 선물하기
      data.benefitDiscount += this._benefitInfo.bill.dataGiftYN ? 1 : 0;
      // 특화혜택
      data.benefitDiscount += this._benefitInfo.bill.thigh5 ? 1 : 0;
      data.benefitDiscount += this._benefitInfo.bill.kdbthigh5 ? 1 : 0;
    }
    // 결합할인
    if (this._benefitInfo.combination && this._benefitInfo.combination.prodNm.trim().length > 0) {
      data.benefitDiscount += Number(this._benefitInfo.combination.etcCnt) + 1;
    }
    // 장기가입 요금
    data.benefitDiscount +=
      (this._benefitInfo.bill.longjoin && this._benefitInfo.loyalty.dcList.length > 0) ?
        this._benefitInfo.loyalty.dcList.length : 0;
    // }
    // 데이터 리필 - 리필쿠폰
    data.benefitDiscount +=
      (this._benefitInfo.loyalty.benfList && this._benefitInfo.loyalty.benfList.length > 0) ? 1 : 0;
    // 혜택.할인 건수 끝
    // 간편로그인인 경우
    if (this._loginType !== 'S') {
      // 멤버십 등급 조회 API 호출하지 않으므로 아래 로직도 수행하지 않도록 처리
      // 쿠키즈팅 포인트 정보 조회 API 호출하지 않으므로 아래 로직도 수행하지 않도록 처리
      // T world 동의여부 조회 API 호출하지 않으므로 아래 로직도 수행하지 않도록 처리
      if (this._benefitInfo.membership) {
        data.membership = Tw.MEMBERSHIP_GRADE[this._benefitInfo.membership.mbrGrCd];
      }
      if (this._benefitInfo.cookiz) {
        data.point += Number(this._benefitInfo.cookiz.usblPoint); // 쿠키즈팅 포인트
      }
      // T world 광고성 정보 수신동의(선택) 여부
      if (this._benefitInfo.tworld && this._benefitInfo.tworld.twdAdRcvAgreeYn === 'N') {
        if (this._isAdult) {
          $('#agree-banner-area').show();
          // 모바일App
          if (Tw.BrowserHelper.isApp()) {
            var storedData = JSON.parse(Tw.CommonHelper.getLocalStorage('hideTwdAdRcvAgreePop_' + this._userId));
            if (Tw.FormatHelper.isEmpty(storedData)) {
              // 최초 접근시 또는 다음에 보기 체크박스 클릭하지 않은 경우
              this._onOpenAgreePopup();
            } else {
              var now = Tw.DateHelper.convDateFormat(new Date());
              if (Tw.DateHelper.convDateFormat(storedData.expireTime) < now) {
                // 만료시간이 지난 데이터 일 경우 광고 정보 수신동의 팝업 노출
                this._onOpenAgreePopup();
              }
            }
          } else {
            // 모바일웹 - 다음에 보기 처리 이력이 존재하지 않는 경
            if (Tw.CommonHelper.getCookie('hideTwdAdRcvAgreePop_' + this._userId) === null) {
              // 광고 정보 수신동의 팝업 노출
              this._onOpenAgreePopup();
            }
          }
        }
      }
    }
    this.$membership.text(data.membership);
    this.$point.prepend(Tw.FormatHelper.addComma(data.point.toString()));
    this.$benefit.text(this.$benefit.text() + ' ' + data.benefitDiscount + Tw.BENEFIT.INDEX.COUNT_SUFFIX);

    this._data = data;

    // DV001-18387 : 상단 나의혜택 할인영역이 먼저 노출 후 하단 혜택 리스트 노출한다.
    this._reqProductList(['']);
  },
  /**
   * @function
   * @desc 상품 리스트 조회요청
   * @param {Array} categoryArray
   */
  _reqProductList: function (categoryArray) {
    Tw.Logger.info('[_reqProductList] [선택된 카테고리 리스트]', categoryArray);
    Tw.Logger.info('[_reqProductList] [Dom 에 저장되어 있는 선택했던 카테고리 리스트]', this.$container.find('#selected_category').val());
    Tw.Logger.info('[_reqProductList] [url에 포함된 카테고리 코드]', this._filters.filters);

    if (this.$container.find('#selected_category').val() !== '') {
      var tempStr = this.$container.find('#selected_category').val();
      categoryArray = tempStr.split('|');
    } else {
      if (!Tw.FormatHelper.isEmpty(this._filters)) {
        if (this._filters.filters.indexOf(',') > -1) {
          categoryArray = this._filters.filters.split(',');
        } else {
          categoryArray = [];
          categoryArray.push(this._filters.filters);
        }
        history.replaceState({}, '혜택/할인 < 혜택/할인', '/benefit/submain');
        this._filters = '';
      }
    }

    var requestCommand = [];
    var param = { command: Tw.API_CMD.BFF_10_0054 };
    // 최초 접속시 (#전체 / 별도 선택된 카테고리가 없는 경우)
    if (Tw.FormatHelper.isEmpty(categoryArray) || categoryArray[0] === '') {
      Tw.Logger.info('[_reqProductList] 최초 접속시', categoryArray);
      param.params = { idxCtgCd: 'F01400', benefitCtgCd: '', searchListCount: 50 };
      requestCommand.push(param);
      Tw.Logger.info('[_reqProductList] requestCommand', requestCommand);
    } else {
      // 특정 카테고리가 선택된 경우
      Tw.Logger.info('[_reqProductList] 특정 카테고리가 선택된 경우', categoryArray);
      var selectedCategoryString = '';
      for ( var idx = 0; idx < categoryArray.length; idx++ ) {
        var selectCategory = categoryArray[idx];
        Tw.Logger.info('[_reqProductList] ' + idx + '번째 선택된 카테고리 코드', selectCategory);
        param = { command: Tw.API_CMD.BFF_10_0054 };
        param.params = { idxCtgCd: 'F01400', benefitCtgCd: selectCategory, searchListCount: 50 };
        // Tw.Logger.info('[_reqProductList] ' + idx + '번째 param.params', param.params);

        requestCommand.push(param);
        // requestCommand[idx] = param;

        // Tw.Logger.info('[_reqProductList] ' + idx + '번째 requestCommand', requestCommand[idx]);
        // 다른 페이지에서 특정 카테고리를 선택된 채로 호출하거나 특정 카테고리가 선택된 상태에서
        // 상품 상세로 이동 후 뒤로가기 시 기존 선택된 상태를 유지하기 위해서
        // 선택된 카테고리 정보를 hidden 개체에 설정
        if (idx < categoryArray.length - 1) {
          selectedCategoryString = selectedCategoryString + selectCategory + '|';
        } else {
          selectedCategoryString = selectedCategoryString + selectCategory;
        }

        if (!this.$categoryTab.find('[data-category="' + selectCategory + '"]').hasClass('on')) {
          this.$categoryTab.find('[data-category="' + selectCategory + '"]').addClass('on').attr('aria-selected', true);

          if (this.$categoryTab.find('[data-category="' + selectCategory + '"]').parents('ul').attr('id') === 'fe-category-list_2') {
            this.$container.find('#fe-category-2nd').attr('style', 'display: block;');
            this.$container.find('#fe-btn-more-category').attr('class', 'bt-toggle open').attr('aria-pressed', 'true');
          }
        }
      } // end for
      this.$categoryTab.find('[data-category=""]').removeClass('on').attr('aria-selected', false);
      Tw.Logger.info('[_reqProductList] requestCommand', requestCommand);

      this.$container.find('#selected_category').val(selectedCategoryString);
      Tw.Logger.info('[_reqProductList] this.$container.find("#selected_category").val() : ', this.$container.find('#selected_category').val());
    }

    this._apiService.requestArray(requestCommand)
      // .done($.proxy(this._successProductList, this, categoryArray))
      .done($.proxy(this._successProductList, this))
      .fail($.proxy(this._onFail, this));
  },
  /**
   * @function
   * @desc _reqProductList() 성공시 콜백
   * @param {Object} response
   */
  _successProductList: function (response) {
    // arguments  처리할 필요가 없고 인자값으로 문자열을 받지 않고 있 코드 수정 - KimInHwan
    Tw.Logger.info('[_successProductList] response', response);
    Tw.Logger.info('[_successProductList] arguments', arguments);
    Tw.Logger.info('[_successProductList] arguments.length', arguments.length);

    if (arguments.length > 0) {
      var mergedResult = [];

      for ( var idx = 0; idx < arguments.length; idx++ ) {
        var argumentObj = arguments[idx];

        if (argumentObj.code !== Tw.API_CODE.CODE_00 ) {
          this._onFail(argumentObj);
          return;
        }

        for ( var i = 0; i < argumentObj.result.list.length; i++ ) {
          var benefitFltNmList = [];
          var benefitObj = argumentObj.result.list[i];
          if (benefitObj.benefitFltNm && benefitObj.benefitFltNm.indexOf(',') > -1) {
            var benefitFltNmArray = benefitObj.benefitFltNm.split(',');
            for ( var j = 0; j < benefitFltNmArray.length; j++ ) {
              benefitFltNmList.push({ benefitFltNmObj: benefitFltNmArray[j] });
            }
          } else {
            benefitFltNmList.push({ benefitFltNmObj: benefitObj.benefitFltNm });
          }
          benefitObj.useYn = (benefitObj.useYn === '사용중');
          benefitObj.benefitFltNm = benefitFltNmList;
          // 데이터리필, 데이터선물하기 표기
          var dataRecharged = ['TW20000031', 'TW20000028'].indexOf(benefitObj.benefitId);
          if (dataRecharged > -1) {
            if (this._benefitInfo.loyalty) {
              if (dataRecharged === 0) {
                benefitObj.useYn = (this._benefitInfo.loyalty.benfList && this._benefitInfo.loyalty.benfList.length > 0);
              }
            }
            if (this._benefitInfo.bill) {
              if (dataRecharged === 1) {
                benefitObj.useYn = (this._benefitInfo.bill.dataGiftYN);
              }
            }
          }
          // 요금할인 표기
          if (this._benefitInfo.bill && this._benefitInfo.bill.priceAgrmtList.length > 0) {
            for ( var j = 0; j < this._benefitInfo.bill.priceAgrmtList.length; j++ ) {
              var billBenefit = this._benefitInfo.bill.priceAgrmtList[j];
              // T 지원금 예외
              var supportBenefit = ['TSupportAgree'].indexOf(billBenefit.prodId) > -1;
              if (supportBenefit && benefitObj.benefitId === 'TW20000015') {
                benefitObj.useYn = true;
              } else {
                if (billBenefit.prodId === benefitObj.benefitId) {
                  benefitObj.useYn = true;
                }
              }
            }
          }
          // 클럽할인
          var clubBenefit = ['TW20000032'].indexOf(benefitObj.benefitId) > -1;
          if (this._benefitInfo.bill && this._benefitInfo.bill.clubYN && clubBenefit) {
            benefitObj.useYn = this._benefitInfo.bill.clubYN;
          }
          // 척척할인
          var chucchucBenefit = ['NA00005696'].indexOf(benefitObj.benefitId) > -1;
          if (this._benefitInfo.bill && this._benefitInfo.bill.chucchuc && chucchucBenefit) {
            benefitObj.useYn = this._benefitInfo.bill.chucchuc;
          }
          // T끼리 할인
          var tplusBenefit = ['TW00000058'].indexOf(benefitObj.benefitId) > -1;
          if (this._benefitInfo.bill && this._benefitInfo.bill.tplus && tplusBenefit ) {
            benefitObj.useYn = this._benefitInfo.bill.tplus;
          }
          //특화혜택 표기
          var specialBenefit = ['NC00000079', 'NC00000081', 'TW20000027'].indexOf(benefitObj.benefitId);
          if (specialBenefit > -1) {
            if (this._benefitInfo.bill) {
              benefitObj.useYn = (this._benefitInfo.bill.thigh5 || this._benefitInfo.bill.kdbthigh5);
            }
          }
          // 장기고객할인
          var longJoiner = ['TW00000061'].indexOf(benefitObj.benefitId);
          if (longJoiner > -1) {
            if (this._benefitInfo.bill) {
              benefitObj.useYn = (this._benefitInfo.bill.longjoin);
            }
          }
          // 복지고객할인
          var welfare = ['TW20000016'].indexOf(benefitObj.benefitId);
          if (welfare > -1) {
            if (this._benefitInfo.bill) {
              benefitObj.useYn = (this._benefitInfo.bill.wlfCustDcList.length > 0);
            }
          }
          mergedResult.push(benefitObj);
        }
      }
    }


    Tw.Logger.info('[_successProductList] mergedResult', mergedResult);
    mergedResult = Tw.FormatHelper.removeDuplicateElement(mergedResult);
    Tw.Logger.info('[_successProductList] mergedResult (중복제거) ', mergedResult);
    this.$list.empty();     // #fe-list
    /**
     * 리스트 수신 후 처리순서
     * 1. 혜택/할인 리스트 노출
     * 2. [다른 페이지를 찾고 계신가요?] 노출
     * 3. 현재 탭으로 스크롤 이동
     */
    this.$benefitListArea.removeClass('none');  // #fe-benefit-list-area (혜택/할인 리스트)
    this.$anotherPage.removeClass('none');      // #fe-another-page (다른 페이지를 찾고 계신가요)
    this._renderList(mergedResult);
  },

  /**
   * @function
   * @desc 상품 리스트 렌더
   * @param {Array} categoryArray
   */
  _renderList: function (categoryArray) {
    // 사용하지 않는 인자 값 제거 및 타입이 명확하지 않아 수정
    var source = $('#productList').html();
    var template = Handlebars.compile(source);

    var output = template({
      list: categoryArray
    });
    this.$list.append(output);

    // 웹접근성 위배사항 수정
    // 새창으로 열리는 링크의 경우 titla="새창" 추가
    for (var i = 0; i < this.$list[0].children.length; i++) {
      var benefitObj = $(this.$list[0].children[i]).find('a');
      var benefitId = benefitObj.attr('data-benefit-id');

      if (['TW20000014', 'TW20000018'].indexOf(benefitId) > -1) {
        benefitObj.attr('title', '새창');
      }
    }
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
  _previewClear: function () {
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
   * @param {Object} err
   */
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },

  /**
   * @function
   * @desc 광고성정보수신동의 팝업 open
   */
  _onOpenAgreePopup: function () {
    this.$agreePopup.removeClass('none');
  },

  /**
   * @function
   * @desc 광고성정보수신동의 팝업 close
   */
  _onCloseAgreePopup: function () {
    this.$agreePopup.addClass('none');
  }
};
