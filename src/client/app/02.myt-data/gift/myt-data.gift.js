/**
 * @file myt-data.gift.js
 * @desc T끼리 데이터 선물 > 공통 기능 처리
 * @author Hakjoon Sim (hakjoon.simk@sk.com)
 * @since 2018.10.08
 */

Tw.MyTDataGift = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._svcInfo = JSON.parse(svcInfo);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGift.prototype = {
  limitedGiftUsageQty: 500, // 기본 잔여 데이터 500MB
  unlimitProdIds: [
    'NA00005957', // T플랜 라지
    'NA00005958', // T플랜 패밀리
    'NA00005959', // T플랜 인피니티
    'NA00006537', // T플랜 에센스
    'NA00006538', // T플랜 스페셜
    'NA00006539', // T플랜 맥스
    'NA00006157', // 0플랜 라지
    'NA00006401', // 0플랜 슈퍼히어로
    'NA00006403', // 5GX 스탠다드
    'NA00006404', // 5GX 프라임
    'NA00006405'  // 5GX 플래티넘
  ],
  /**
   * @function
   * @desc 바로 선물 / 자동 선물 화면 분기
   * @private
   */
  _init: function () {
    // If there is hash #auto, show second tab(auto gift)
    if ( window.location.hash === '#auto' ) { // 자동선물
      this._goAutoGiftTab();
      $('.fe-request_sending_data').hide();
      $('.fe-request_sending_auto').show();
    }else{ // 바로선물
      $('.fe-request_sending_auto').hide();
      $('.fe-request_sending_data').show();

      this.reqCnt = 0;
      this.currentRemainDataInfo = null;
      this._getRemainDataInfo();
    }
    if (this.unlimitProdIds.indexOf(this._svcInfo.prodId) !== -1) {
      this.limitedGiftUsageQty = 0;
    }
  },

  _cachedElement: function () {
    this.$recent_tel = this.$container.find('.recently-tel');
    this.$inputImmediatelyGift = this.$container.find('.fe-input_immediately_gift');
    this.wrap_available_product = this.$container.find('.fe-layer_available_product');
    this.tpl_recently_gift = Handlebars.compile($('#tpl_recently_gift').html());
    this.tpl_available_product = Handlebars.compile($('#tpl-available-product').html());
    this.$wrap_auto_select_list = $('.fe-auto_select_list');
    this.$wrap_data_select_list = $('.fe-immediately_data_select_list');
    this.$remainQty = $('.fe-remain_data');
    this.$remainTxt = $('.fe-txt-remain');
    this.$remainBtn = $('.fe-btn-remain');
    this.$wrapSuccessRemainApi = $('.fe-remain-api');
    this.$wrapErrorRemainApi = $('.fe-err-api');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-available_product', $.proxy(this._onClickShowAvailableProduct, this));
    this.$container.on('click', '.fe-close-available_product', $.proxy(this._hideAvailableProduct, this));
    this.$container.on('click', '.fe-show-more-amount', $.proxy(this._onShowMoreData, this));
    this.$inputImmediatelyGift.on('focus', $.proxy(this._onLoadRecently, this));
    // this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));
    this.$container.on('currentRemainDataInfo', $.proxy(this._currentRemainDataInfo, this));
    this.$remainBtn.on('click', $.proxy(this._getRemainDataInfo, this));
  },

  /**
   * @function
   * @desc BFF_06_0014 (new IA) T끼리데이터선물하기 잔여데이터 조회 API Request
   * @param e - 이벤트 객체
   * @private
   */
  _getRemainDataInfo: function (e) {
    var $target = e ? $(e.currentTarget) : null;
    this.$remainBtn.hide();
    this.$remainTxt.show();

    setTimeout(function () {
      this._apiService.request(Tw.API_CMD.BFF_06_0014, { reqCnt: this.reqCnt })
        .done($.proxy(this._onSuccessRemainDataInfo, this, $target));
    }.bind(this), 3000);
  },

  _currentRemainDataInfo: function () {
    return this.currentRemainDataInfo ? this.currentRemainDataInfo : null;
  },

  /**
   * @function
   * @desc BFF_06_0014 (new IA) T끼리데이터선물하기 잔여데이터 조회 API Response
   * @param $target
   * @param res
   */
  _onSuccessRemainDataInfo: function ($target, res) {
    // MOCK DATA
    // var mockDataQty = '900';
    // var mockData = Tw.FormatHelper.convDataFormat(mockDataQty, 'MB');
    // this.currentRemainDataInfo = mockDataQty;
    // this.$remainQty.text(mockData.data + mockData.unit);
    // this._setAmountUI(Number(mockDataQty));

    // if ( Number(this.reqCnt) > 3 ) {
    //   this._remainApiError($target);
    //   return;
    // }
    var code = res.code;
    if ( code === Tw.API_CODE.CODE_00 ) {
      var result = res.result;
      if ( result.giftRequestAgainYn === 'N' ) { // 재시도 가능여부 판단. N인경우 looping 중지, reqCnt 0부터 다시 요청
        if ( Tw.FormatHelper.isEmpty(result.dataRemQty) ) {
          this._remainApiError($target);
        } else if ( Number(result.dataRemQty) < this.limitedGiftUsageQty ) { // 데이터 잔여량이 기본 잔여 데이터(500mb)보다 작은 경우
          this.$container.trigger('showUnableGift', 'GFT0004');
        } else {
          // API DATA SUCCESS
          this._remainApiSuccess();
          var apiDataQty = res.result.dataRemQty;
          var dataQty = Tw.FormatHelper.convDataFormat(apiDataQty, 'MB');
          this.currentRemainDataInfo = apiDataQty;
          this.$remainQty.text(dataQty.data + dataQty.unit);
          this._setAmountUI(Number(apiDataQty));
        }
      } else {
        this.reqCnt = result.reqCnt; // 재시도 횟수
        this._getRemainDataInfo($target);
      }
    } else if ( code === 'GFT0004' ) {
      if (this.unlimitProdIds.indexOf(this._svcInfo.prodId) !== -1) {
        code = 'GFT0004_2';
      }
      this.$container.trigger('showUnableGift', code);
    } else {
      this.$container.trigger('showUnableGift', code);
      // Tw.Error(res.code, res.msg).pop();
    }
  },

  _remainApiError: function ($target) {
    this.$wrapSuccessRemainApi.hide();
    this.$wrapErrorRemainApi.show();
    this.$remainBtn.show();
    this.$remainTxt.hide();
    // this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A217, null, null, null, null, $target);
  },

  /**
   * @function
   * @desc 잔여량 데이터 API Response Success(잔여량 데이터 500mb 이상)
   * @private
   */
  _remainApiSuccess: function () {
    this.$wrapSuccessRemainApi.show();
    this.$wrapErrorRemainApi.hide();
    this.$remainBtn.hide();
    this.$remainTxt.show();
  },

  /**
   * @function
   * @desc 선물할 데이터량 영역 활성화/비활성화 세팅
   * @param nLimitMount - 잔여량 데이터
   * @private
   */
  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);
      var nInputMount = Number($input.val());
      if ( nLimitMount - nInputMount < this.limitedGiftUsageQty) { // [잔여량 데이터 - 선물할 데이터량]이 500mb보다 작으면 비활성화
        $input.prop('disabled', true);
        $input.parent().parent().addClass('disabled');
      } else {
        $input.prop('disabled', false);
        $input.parent().parent().removeClass('disabled');
      }
    };

    this.$wrap_data_select_list.find('input').each($.proxy(fnCheckedUI, this)); // 선물할 데이터량 each 함수 => 개별적으로 활성화/비활성화 처리
  },

  /**
   * @function
   * @desc 선물 받는 분 번호 영역 Focus
   * @private
   */
  _onLoadRecently: function () {
    if (this.recentGiftSentList && this.recentGiftSentList.length > 0) { // BFF_06_0018 API 호출된 후에는 저장된 데이터를 사용하여 불필요한 API 호출 방지
      this._drawRecentSentList();
      return;
    }
    this._apiService.request(Tw.API_CMD.BFF_06_0018, {
      fromDt: Tw.DateHelper.getPastYearShortDate(),
      toDt: Tw.DateHelper.getCurrentShortDate(),
      type: '1' // 1: 보낸이력 조회
    }).done($.proxy(this._onSuccessRecently, this));
  },

  /**
   * @function
   * @desc BFF_06_0018 (new IA) T끼리데이터선물하기 선물내역 API Response
   * @param res
   * @private
   */
  _onSuccessRecently: function (res) {
    var tempContactList = []; // 보낸 이력에서 중복된 번호를 체크하기 위한 Array

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var contactList = res.result;

      // 보낸 이력 중 선물 타입이 'G1' && 중복되지 않은 번호로 필터링
      var list = _.filter(contactList, function (contact) {
        if ( contact.giftType === 'G1' && tempContactList.indexOf(contact.svcNum) === -1 ) {
          tempContactList.push(contact.svcNum);
          return true;
        }
        return false;
      });

      // 필터링 된 번호들을 3개까지만 표기, svcNum 값에 Dash 추가
      var filteredList = list.splice(0, 3).map(function (item) {
        return $.extend(item, { svcNum: Tw.FormatHelper.conTelFormatWithDash(item.svcNum) });
      });
      this.recentGiftSentList = filteredList;
      if (this.recentGiftSentList && this.recentGiftSentList.length > 0) { // 보낸 이력이 있을 때만 _drawRecentSentList 함수 실행
        this._drawRecentSentList();
      }
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  /**
   * @function
   * @desc 최근 사용한 번호 영역 생성 및 노출
   * @private
   */
  _drawRecentSentList: function() {
    this.$recent_tel.html(this.tpl_recently_gift({ contactList: this.recentGiftSentList })); // 핸들바 템플릿 컴파일 후 데이터 바인딩
    this.$recent_tel.show();
  },

  /**
   * 쓰이지 않는 코드로 보임
   */
  _hideRecently: function () {
    this.$recent_tel.hide();
  },

  /**
   * @function
   * @desc 자동 선물으로 이동시 Tap 웹 접근성 처리
   * @private
   */
  _goAutoGiftTab: function () {
    this.$container.find('#tab1').attr('aria-selected', false).find('a').attr('aria-selected', false);
    this.$container.find('#tab2').attr('aria-selected', true).find('a').attr('aria-selected', true);
  },

  /**
   * @function
   * @desc 선물할 데이터양 더보기 버튼 선택
   * @param e
   * @private
   */
  _onShowMoreData: function (e) {
    var $btn_show_data = $(e.currentTarget);

    $btn_show_data.closest('.data-gift-wrap').find('li').show();
    $btn_show_data.remove();
    $('.fe-more-focus').focus(); // 웹 접근성 강제 초점 이동
  },

  /**
   * 선물 가능한 요금제 확인 관련 함수는 사용되지 않음
   * 선물 가능한 요금제 확인 => 별도의 페이지로 작성된 것으로 보임(myt-data.available)
   */
  _onClickShowAvailableProduct: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0066, { type: 'G', giftBefPsblYn: 'Y' })
      .done($.proxy(this._onSuccessAvailableProduct, this));
  },

  _onSuccessAvailableProduct: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var sortedList = Tw.FormatHelper.purifyPlansData(res.result);

      this.wrap_available_product.html(
        this.tpl_available_product({ sortedList: sortedList })
      );

      this._showAvailableProduct();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _showAvailableProduct: function () {
    this.wrap_available_product.show();
    $('.fe-layer_available_product').scrollTop(0);
    $('.fe-layer_available_product').css('position', 'fixed');
  },

  _hideAvailableProduct: function () {
    this.wrap_available_product.hide();
  },

  _stepBack: function (e) {
    var confirmed = false;
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy(function () {
        confirmed = true;
        this._popupService.close();
      }, this),
      $.proxy(function () {
        if ( confirmed ) {
          this._historyService.goBack();
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES,
      $(e.currentTarget)
    );
  }
};
