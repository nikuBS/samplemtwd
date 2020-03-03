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
Tw.BenefitIndex = function (rootEl, svcInfo, bpcpServiceId, eParam, filters) {
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
  this._filters = filters;
  this._agreePopup = null;

  this._isAdult = false;
  this._userId = null;
  this._loginType = '';

  this._data = '';
  this._categoryListArray = new Array();
  this._init();
};

Tw.BenefitIndex.prototype = {
  /**
   * @function
   * @desc 최초 실행
   */
  _init: function () {
    Tw.Logger.info('[_init] 호출', '');
    var _this = this;

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

          var categoryListArray1 = new Array();
          var categoryListArray2 = new Array();

          for (var idx in res.result.filters) {
            this._categoryListArray.push(res.result.filters[idx]);

            if (idx < 5) {
              categoryListArray1.push( res.result.filters[idx] );
            } else {
              categoryListArray2.push( res.result.filters[idx] );
            }
          }

          Tw.Logger.info('[_init] 전체 카테고리 리스트', this._categoryListArray);

          if ( !Tw.FormatHelper.isEmpty( categoryListArray1 ) ) {
            var output = template({
              list: categoryListArray1
            });
        
            this.$categoryTab.find('#fe-category-list_1').append(output);
          }
          if ( !Tw.FormatHelper.isEmpty( categoryListArray2 ) ) {
            var output = template({
              list: categoryListArray2
            });

            this.$container.find('#fe-btn-more-category').attr('style', '');
            // this.$container.find('#fe-btn-more-category').removeAttribute('style');
            this.$categoryTab.removeClass('short');
            this.$categoryTab.find('#fe-category-list_2').append(output);
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
      } else {
        // BFF_08_0080 API 호출 시 API code 가 정상으로 넘어오지 않더라도 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
        // Tw.Error(res.code, res.msg).pop();
        // return;
      }
    }, this))
    .fail(function (err) {
      // BFF_08_0080 API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
      // Tw.Error(err.code, err.msg).pop();
      // return;
    });

    // // 환경변수 로딩이 완료된 이후 혜택할인 관련 API 호출되도록 수정
    // if (!Tw.Environment.init) {
    //   $(window).on(Tw.INIT_COMPLETE, $.proxy(this._allRequest, this));
    // } else {
    //   this._allRequest();
    // }

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
    this.$container.on('click', '[data-category]', $.proxy(this._onCategory, this));
    this.$container.on('change', '[data-check-disabled]', $.proxy(this._onCheckDisabled, this));
    this.$container.on('click', '.fe-plus, .fe-minus', $.proxy(this._onVariations, this));
    this.$internetType.on('click', $.proxy(this._checkStateLine, this));
    this.$showDiscountBtn.on('click', $.proxy(this._reqDiscountAmt, this));
    this.$container.on('click', '[data-benefit-id]', $.proxy(this._onClickProduct, this)); // 카테고리 하위 리스트 클릭
    this.$clearBtn.on('click', $.proxy(this._previewClear, this)); // 결합할인금액 미리보기 초기화

    this.$container.on('change', '.fe-agree', $.proxy(this._modAgree, this));  // T world 광고정보수신동의 활성화 처리
    this.$container.on('click', '.fe-pop-agree', $.proxy(this._modAgreePop, this));  // T world 광고정보수신동의 활성화 처리 (팝업)
    this.$container.on('click', '.fe-show-detail', $.proxy(this._showAgreeDetail, this));   // T world 광고정보수신동의 약관 상세보기
    this.$container.on('click', '.fe-pop-show-detail', $.proxy(this._showAgreePopDetail, this));   // T world 광고정보수신동의 약관 상세보기
    this.$container.on('click', '.fe-close', $.proxy(this._closeAgree, this));   // T world 광고정보수신동의 배너 닫기
    this.$container.on('click', '.fe-pop-close', $.proxy(this._closeAgreePop, this));   // T world 광고정보수신동의 팝업 닫기
    this.$container.on('click', '.fe-pop-hide', $.proxy(this._hideTwdAdRcvAgreePop, this));   // T world 광고정보수신동의 팝업 다음에 보기 처리
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
      var categoryArray = new Array();
      categoryArray.push('');
      this._reqProductList_dev(categoryArray);
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
            } else {
              // BFF_08_0080 API 호출 시 API code 가 정상으로 넘어오지 않더라도 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
              // Tw.Error(res.code, res.msg).pop();
              // return;
            }
          }, this))
          .fail(function (err) {
            // BFF_08_0080 API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
            // Tw.Error(err.code, err.msg).pop();
            // return;
          });
      }

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
        TW20000014: Tw.OUTLINK.BECOME_ANYTHING,
        TW20000018: Tw.OUTLINK.T_HONORS_CLUB
      };
      this._alertCharge(externalUrl[_benefitId]);
    } else if ('TW20000019' === _benefitId) {
      this._bpcpService.open(Tw.OUTLINK.DATA_COUPON.DATA_FACTORY);
    } else if (['TW20000028', 'TW20000029', 'TW20000031'].indexOf(_benefitId) > -1) {
      var externalUrl = {
        TW20000028: '/myt-data/giftdata',
        TW20000029: '/membership/membership_info/mbrs_0001',
        TW20000031: '/myt-data/recharge/coupon'
      };

      location.href = externalUrl[_benefitId];
    } else {
      location.href = '/product/callplan?prod_id=' + _benefitId;
    }
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 활성화 처리
   */
  _modAgree: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0022, { twdAdRcvAgreeYn: 'Y' })
      .done($.proxy(function () {
        $('#agree-banner-area').hide();
        // $('#agree-popup-area').hide();
        var toastMsg = '수신동의가 완료되었습니다.';
        // Tw.CommonHelper.toast(toastMsg);
        Tw.Popup.toast(toastMsg);
      }, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 활성화 처리 (팝업)
   */
  _modAgreePop: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0022, { twdAdRcvAgreeYn: 'Y' })
      .done($.proxy(function () {
        $('#agree-banner-area').hide();
        // $('#agree-popup-area').hide();
        this._onCloseAgreePopup();
        var toastMsg = '수신동의가 완료되었습니다.';
        // Tw.CommonHelper.toast(toastMsg);
        Tw.Popup.toast(toastMsg);
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
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
   * @desc T world 광고정보수신동의 팝업 약관 상세보기
   */
  _showAgreePopDetail: function () {
    // $('#agree-popup-area').hide();
    this._onCloseAgreePopup();
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
   * @desc T world 광고정보수신동의 팝업 닫기
   */
  _closeAgreePop: function () {
    // $('#agree-popup-area').hide();
    this._onCloseAgreePopup();
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

    // $('#agree-popup-area').hide();
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

    var selectedCategoryArray =[];

    if(defaultTarget.hasClass('on')) {
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
    } 
    // 그 외 특정 카테고리를 선택하는 경우
    else {
      for (var idx in this._categoryListArray) {
        if ($(e.currentTarget).data('category') === this._categoryListArray[idx].prodFltId) {

          // 해당 카테고리가 선택되어 있는 상태에서 한번 더 클릭하여 선택 해제하는 경우
          if ( this._checkSelected(this._categoryListArray[idx].prodFltId) ) {
            Tw.Logger.info('[_onCategory] #' + this._categoryListArray[idx].prodFltNm + ' 카테고리 선택해제하고자 하는 경우', '');

            // 해당 카테고리 선택 비활성화 처리
            $(e.currentTarget).removeClass('on').attr('aria-selected', false);
            
            // [선택된 카테고리 리스트] 에서 '#요금할인(F01421)' 제거
            selectedCategoryArray = this._removeCategory(selectedCategoryArray, this._categoryListArray[idx].prodFltId);
            Tw.Logger.info('[_onCategory] 선택된 카테고리ID 리스트', selectedCategoryArray);
          }
          // 해당 카테고리가 선택되지 않은 상태에서 클릭하여 선택하는 경우
          else {
            Tw.Logger.info('[_onCategory] #' + this._categoryListArray[idx].prodFltNm + ' 카테고리 선택하고자 하는 경우', '');

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
      for (var idx in selectedCategoryArray) {
        if (idx < selectedCategoryArray.length - 1) {
          tempStr = tempStr + selectedCategoryArray[idx] + '|';
        } else {
          tempStr = tempStr + selectedCategoryArray[idx];
        }
      }
      this.$container.find('#selected_category').val(tempStr);
    }

    // [선택된 카테고리 리스트] 에 등록된 카테고리에 매핑된 컨텐츠들을 모두 가져온다.
    this._reqProductList_dev(selectedCategoryArray);
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
    } 
    // 카테고리 리스트 배열에서 특정 카테고리 항목 제거
    else {
      Tw.Logger.info('[_removeCategory] 카테고리 리스트 배열에서 특정 카테고리 항목 제거', '');
      var idx = categoryArray.indexOf(category);
      categoryArray.splice(idx, idx+1);
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
      this._apiService.requestArray([
        { command: Tw.API_CMD.BFF_07_0041 }, // /bypass/core-bill/v1/ocbcard-info-check-show
        { command: Tw.API_CMD.BFF_05_0132 }, // /bypass/core-bill/v1/rainbow-points
        { command: Tw.API_CMD.BFF_05_0175 }, // /bypass/core-bill/v1/no-contract-plan-points
        { command: Tw.API_CMD.BFF_05_0120 }, // /bypass/core-bill/v1/military-service-points
        { command: Tw.API_CMD.BFF_05_0106 }, // /bypass/core-modification/v1/bill-discounts
        { command: Tw.API_CMD.BFF_05_0094 }, // /bypass/core-modification/v1/combination-discounts
        { command: Tw.API_CMD.BFF_05_0196 } // /bypass/core-modification/v1/loyalty-benefits
      ]).done($.proxy(this._successMyBenefitDiscountInfo, this))
        .fail($.proxy(this._onFail, this));
    } else {
      this._apiService.requestArray([
        { command: Tw.API_CMD.BFF_07_0041 },
        { command: Tw.API_CMD.BFF_05_0132 },
        { command: Tw.API_CMD.BFF_05_0175 },
        { command: Tw.API_CMD.BFF_05_0120 },
        { command: Tw.API_CMD.BFF_05_0106 },
        { command: Tw.API_CMD.BFF_05_0094 },
        { command: Tw.API_CMD.BFF_05_0196 },
        { command: Tw.API_CMD.BFF_11_0001 }, // /bypass/core-membership/v1/card/home
        { command: Tw.API_CMD.BFF_05_0115 }, // /bypass/core-bill/v1/cookiz-ting-points
        { command: Tw.API_CMD.BFF_03_0021 } // /bypass/core-auth/v1/tworld-term-agreements
      ]).done($.proxy(this._successMyBenefitDiscountInfo, this))
        .fail($.proxy(this._onFail, this));
    }
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

    // 간편로그인인 경우 멤버십 등급 조회 API 호출하지 않으므로 아래 로직도 수행하지 않도록 처리
    if (this._loginType !== 'S') {
      // 멤버십 등급
      if ((resp = arguments[7]).code === Tw.API_CODE.CODE_00) {
        data.membership = Tw.MEMBERSHIP_GRADE[resp.result.mbrGrCd];
      }
    }    

    // 포인트 합산 시작
    countPoint(arguments[0], ['availPt', 'availTPt']); // OK 캐쉬백 & T 포인트
    countPoint(arguments[1], ['usblPoint']); // 레인보우포인트
    countPoint(arguments[2], ['muPoint']); // 무약정 플랜
    countPoint(arguments[3], ['usblPoint']); // 현역플랜 포인트

    // 간편로그인인 경우 쿠키즈팅 포인트 정보 조회 API 호출하지 않으므로 아래 로직도 수행하지 않도록 처리
    if (this._loginType !== 'S') {
      countPoint(arguments[8], ['usblPoint']); // 쿠키즈팅 포인트
    }
    // 포인트 합산 시작 끝

    // 혜택.할인 건수 시작
    if ((resp = arguments[4]).code === Tw.API_CODE.CODE_00) {
      // 요금할인
      data.benefitDiscount += resp.result.priceAgrmtList.length;
      // 요금할인- 복지고객
      data.benefitDiscount += (resp.result.wlfCustDcList && resp.result.wlfCustDcList.length > 0) ? resp.result.wlfCustDcList.length : 0;
    }
    // 결합할인
    if ((resp = arguments[5]).code === Tw.API_CODE.CODE_00) {
      var resp1 = resp.result;
      if (resp1.prodNm.trim() !== '') {
        data.benefitDiscount += Number(resp1.etcCnt) + 1;
      }
    }
    // 장기가입 혜택 건수
    if ((resp = arguments[6]).code === Tw.API_CODE.CODE_00) {
      // 장기가입 쿠폰
      data.benefitDiscount += (resp.result.benfList && resp.result.benfList.length > 0) ? 1 : 0;
      // 장기가입 요금
      data.benefitDiscount += (resp.result.dcList && resp.result.dcList.length > 0) ? resp.result.dcList.length : 0;
    }
    // 혜택.할인 건수 끝

    // 간편로그인인 경우 T world 동의여부 조회 API 호출하지 않으므로 아래 로직도 수행하지 않도록 처리
    if (this._loginType !== 'S') {
      // T world 광고성 정보 수신동의(선택) 여부
      if ((resp = arguments[9]).code === Tw.API_CODE.CODE_00) {
        if (resp.result.twdAdRcvAgreeYn === 'N') {

          if (this._isAdult) {
            $('#agree-banner-area').show();
            // 모바일App
            if (Tw.BrowserHelper.isApp()) {
              var storedData = Tw.CommonHelper.getLocalStorage('hideTwdAdRcvAgreePop_' + this._userId);

              // 최초 접근시 또는 다음에 보기 체크박스 클릭하지 않은 경우
              if (Tw.FormatHelper.isEmpty(storedData)) {
                // $('#agree-popup-area').show();
                this._onOpenAgreePopup();
                // return;
              }
              // 그 외 경우 처리
              else {
                storedData = JSON.parse(storedData);

                var now = new Date();
                now = Tw.DateHelper.convDateFormat(now);

                if (Tw.DateHelper.convDateFormat(storedData.expireTime) < now) { // 만료시간이 지난 데이터 일 경우
                  // console.log('만료시점이 지난 경우 (노출)');
                  // 광고 정보 수신동의 팝업 노출
                  // $('#agree-popup-area').show();
                  this._onOpenAgreePopup();
                } else {
                  // console.log('만료시점 이전인 경우 (비노출)');
                }
              }
            }
            // 모바일웹
            else {
              if (Tw.CommonHelper.getCookie('hideTwdAdRcvAgreePop_' + this._userId) !== null) {
                // console.log('다음에 보기 처리 이력 존재');              
              } else {
                // console.log('최초 접근시 또는 다음에 보기 체크박스 클릭하지 않은 경우 (노출)');
                // 광고 정보 수신동의 팝업 노출
                // $('#agree-popup-area').show();
                this._onOpenAgreePopup();
              }
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
    // this._switchTab(this._convertPathToCategory());
    
    // this.$categoryTab.find('[data-category]').removeClass('on').attr('aria-selected', false);
    // this.$categoryTab.find('[data-category="{0}"]'.replace('{0}', categoryId)).addClass('on').attr('aria-selected', true);

    var categoryArray = new Array();
    categoryArray.push('');
    this._reqProductList_dev(categoryArray);
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

    this._reqProductList_dev(categoryId);
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
  _convertPathToCategory: function () {
    var categoryId = {
      'discount': 'F01421',
      'combinations': 'F01422',
      'long-term': 'F01423',
      'participation': 'F01424',
      'purchase': 'F01714',
      'submain': ''
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
   * @desc 상품 리스트 조회요청
   * @param {String} category
   */
  _reqProductList_dev: function (categoryArray) {
    Tw.Logger.info('[_reqProductList_dev] [선택된 카테고리 리스트]', categoryArray);
    Tw.Logger.info('[_reqProductList_dev] [Dom 에 저장되어 있는 선택했던 카테고리 리스트]', this.$container.find('#selected_category').val());
    Tw.Logger.info('[_reqProductList_dev] [url에 포함된 카테고리 코드]', this._filters.filters);

    if (this.$container.find('#selected_category').val() !== '') {
      var tempStr = this.$container.find('#selected_category').val();

      categoryArray = tempStr.split('|');
    } else {
      if (!Tw.FormatHelper.isEmpty(this._filters)) {
        if (this._filters.filters.indexOf(',') > -1) {
          categoryArray = this._filters.filters.split(',');
        } else {
          categoryArray = new Array();
          categoryArray.push(this._filters.filters);
        }
        history.replaceState({}, '혜택/할인 < 혜택/할인', '/benefit/submain');
        this._filters = '';
      }
    }

    var requestCommand = [];

    // 최초 접속시 (#전체 / 별도 선택된 카테고리가 없는 경우)
    if (Tw.FormatHelper.isEmpty(categoryArray) || categoryArray[0] === '') {
      Tw.Logger.info('[_reqProductList_dev] 최초 접속시', categoryArray);

      var param = { command: Tw.API_CMD.BFF_10_0054 };
      param.params = { idxCtgCd: 'F01400', benefitCtgCd: '', searchListCount: 50 };
      
      requestCommand.push(param);
      Tw.Logger.info('[_reqProductList_dev] requestCommand', requestCommand);
    } 
    // 특정 카테고리가 선택된 경우
    else {
      Tw.Logger.info('[_reqProductList_dev] 특정 카테고리가 선택된 경우', categoryArray);

      var selectedCategoryString = '';

      for (var idx in categoryArray) {
        var param = { command: Tw.API_CMD.BFF_10_0054 };
        param.params = { idxCtgCd: 'F01400', benefitCtgCd: categoryArray[idx], searchListCount: 50 };
  
        requestCommand.push(param);

        // 다른 페이지에서 특정 카테고리를 선택된 채로 호출하거나 특정 카테고리가 선택된 상태에서 
        // 상품 상세로 이동 후 뒤로가기 시 기존 선택된 상태를 유지하기 위해서 
        // 선택된 카테고리 정보를 hidden 개체에 설정
        if (idx < categoryArray.length - 1) {
          selectedCategoryString = selectedCategoryString + categoryArray[idx] + '|';
        } else {
          selectedCategoryString = selectedCategoryString + categoryArray[idx];
        }

        if (!this.$categoryTab.find('[data-category="' + categoryArray[idx] + '"]').hasClass('on')) {
          this.$categoryTab.find('[data-category="' + categoryArray[idx] + '"]').addClass('on').attr('aria-selected', true);

          if (this.$categoryTab.find('[data-category="' + categoryArray[idx] + '"]').parents('ul').attr('id') === 'fe-category-list_2') {
            this.$container.find('#fe-category-2nd').attr('style', 'display: block;');
            this.$container.find('#fe-btn-more-category').attr('class', 'bt-toggle open').attr('aria-pressed', 'true');
          }
        }
      } // end for
      this.$categoryTab.find('[data-category=""]').removeClass('on').attr('aria-selected', false);
      Tw.Logger.info('[_reqProductList_dev] requestCommand', requestCommand);

      this.$container.find('#selected_category').val(selectedCategoryString);
      Tw.Logger.info('[_reqProductList_dev] this.$container.find("#selected_category").val() : ', this.$container.find('#selected_category').val());
    }

    this._apiService.requestArray(requestCommand)
      // .done($.proxy(this._successProductList_dev, this, categoryArray))
      .done($.proxy(this._successProductList_dev, this))
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
   * @desc _reqProductList() 성공시 콜백
   * @param {String} category
   * @param {JSON} resp
   */
  _successProductList_dev: function (categoryArray) {
    Tw.Logger.info('[_successProductList_dev] categoryArray', categoryArray);
    Tw.Logger.info('[_successProductList_dev] arguments', arguments);
    
    if (arguments.length > 0) {
      var mergedResult = [];
      
      for ( var idx = 0; idx < arguments.length; idx++ ) {
        if (arguments[idx].code !== Tw.API_CODE.CODE_00) {
          this._onFail(arguments[idx]);
          return;
        }

        for ( var i = 0; i < arguments[idx].result.list.length; i++ ) {
          var benefitFltNmList = [];
          var benefitObj = arguments[idx].result.list[i];

          if (benefitObj.benefitFltNm.indexOf(',') > -1) {
            var benefitFltNmArray = benefitObj.benefitFltNm.split(',');
            
            for (var j = 0; j < benefitFltNmArray.length; j++) {
              benefitFltNmList.push({benefitFltNmObj: benefitFltNmArray[j]});
            }
          } else {
            benefitFltNmList.push({benefitFltNmObj: benefitObj.benefitFltNm});
          }

          benefitObj.benefitFltNm = benefitFltNmList;
          mergedResult.push(benefitObj);
        }
                
        Tw.Logger.info('[_successProductList_dev] mergedResult', mergedResult);
      }

      mergedResult = Tw.FormatHelper.removeDuplicateElement(mergedResult);

      Tw.Logger.info('[_successProductList_dev] mergedResult (중복제거) ', mergedResult);

      this.$list.empty();     // #fe-list

      /**
       * 리스트 수신 후 처리순서
       * 1. 혜택/할인 리스트 노출
       * 2. [다른 페이지를 찾고 계신가요?] 노출
       * 3. 현재 탭으로 스크롤 이동
       */
      this.$benefitListArea.removeClass('none');  // #fe-benefit-list-area (혜택/할인 리스트)
      this.$anotherPage.removeClass('none');      // #fe-another-page (다른 페이지를 찾고 계신가요)

      this._renderList(categoryArray, mergedResult);
    }
  },

  /**
   * @function
   * @desc 상품 리스트 렌더
   * @param {String} category
   * @param {JSON} res
   */
  _renderList: function (categoryArray, res) {
    console.log('[_renderList] categoryArray : ' + categoryArray);

    var source = $('#productList').html();
    var template = Handlebars.compile(source);

    var output = template({
      list: res,
      category: categoryArray
    });

    this.$list.append(output);
    
    console.log(this.$list.find('li').length);
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
   * @param {JSON} err
   */
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },

  /**
   * @function
   * @desc 광고성정보수신동의 팝업 open
   */
  _onOpenAgreePopup: function() {
    var template = $('#fe-agree-popup'); // 각각의 메뉴 추가를 위한 handlebar template
    this._agreePopup = Handlebars.compile(template.html());
    this.$container.attr('aria-hidden', 'false');
    this.$container.find('#contents').after(this._agreePopup({ }));
    this._popupService._addHash(null, 'ad-info-agreement');
  },

  /**
   * @function
   * @desc 광고성정보수신동의 팝업 close
   */
  _onCloseAgreePopup: function () {
    this.$container.attr('aria-hidden', 'true');
    if ( window.location.hash.indexOf('ad-info-agreement') !== -1 ) {
      this._historyService.goBack();
    }
  }
};
