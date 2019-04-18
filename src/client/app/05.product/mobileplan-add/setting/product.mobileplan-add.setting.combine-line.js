/**
 * @file 상품 > 모바일부가서비스 > 설정 > 내폰끼리결합
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-13
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면 ID
 * @param svcProdGrpId - 세션 그룹 ID
 */
Tw.ProductMobileplanAddSettingCombineLine = function(rootEl, prodId, displayId, svcProdGrpId) {
  // 컨테이너 레이어 선언
  this.$container = rootEl;

  // 공통 모듈 선언
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  // 공통 변수 선언
  this._prodId = prodId;
  this._displayId = displayId;
  this._svcProdGrpId = svcProdGrpId;

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();
};

Tw.ProductMobileplanAddSettingCombineLine.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineWrap = this.$container.find('.fe-line_wrap');
    this.$inputNumber = this.$container.find('.fe-num_input');

    this.$btnAddNum = this.$container.find('.fe-btn_add_num');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnAddressBook = this.$container.find('.fe-btn_address_book');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$btnAddNum.on('click', _.debounce($.proxy(this._addNum, this), 500));
    this.$lineList.on('click', '.fe-btn_del_num', _.debounce($.proxy(this._delNum, this), 500));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnAddressBook.on('click', $.proxy(this._openAppAddressBook, this));
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  /**
   * @function
   * @desc 주소록 열기 (Only App)
   */
  _openAppAddressBook: function() {
    this._nativeService.send('getContact', {}, $.proxy(this._setAppAddressBook, this));
  },

  /**
   * @function
   * @desc 주소록 콜백 처리 (by App)
   * @param res - App Callback
   */
  _setAppAddressBook: function(res) {
    if (Tw.FormatHelper.isEmpty(res.params.phoneNumber)) {
      return;
    }

    this.$inputNumber.val(res.params.phoneNumber);
    this._toggleClearBtn();
    this._toggleNumAddBtn();
    this._blurInputNumber();
  },

  /**
   * @function
   * @dsec 회선 번호 추가
   * @returns {*|void}
   */
  _addNum: function() {
    if (this.$inputNumber.val().length < 10) {
      return;
    }

    var number = this.$inputNumber.val().replace(/-/gi, '');

    if (!Tw.ValidationHelper.isCellPhone(number)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0020, {
      svcProdGrpId: this._svcProdGrpId,
      svcNumList: [this._getServiceNumberFormat(number)]
    }, {}, [this._prodId])
      .done($.proxy(this._addDelNumRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 회선 추가/삭제 API 응답 처리
   * @param resp - API 응답 값
   * @returns {*}
   */
  _addDelNumRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._historyService.reload();
  },

  /**
   * @function
   * @desc 회선 삭제 버튼 클릭 시
   * @param e - 회선 삭제 버튼 클릭 이벤트
   * @returns {*|void}
   */
  _delNum: function(e) {
    if (this.$lineList.find('li').length < 2) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A10.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A10.TITLE);
    }

    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON, Tw.BUTTON_LABEL.CLOSE, null,
      $.proxy(this._delNumReq, this, $(e.currentTarget).data('svc_mgmt_num')));
  },

  /**
   * @function
   * @desc 회선 삭제 API 요청
   * @param svcMgmtNum - 서비스관리번호
   */
  _delNumReq: function(svcMgmtNum) {
    this._popupService.close();

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0019, {
      chldSvcMgmtNum: svcMgmtNum
    }, {}, [this._prodId]).done($.proxy(this._addDelNumRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 회선입력란 keyup|input Event
   * @param e - keyup|input Event
   * @returns {*|void}
   */
  _detectInputNumber: function(e) {
    if (Tw.InputHelper.isEnter(e)) {
      this.$btnAddNum.trigger('click');
      return;
    }

    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9]/g, ''));

    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    if (this.$lineWrap.length < 1) {
      return this._toggleSetupButton(this.$inputNumber.val().length > 0);
    }

    this._toggleClearBtn();
    this._toggleNumAddBtn();
  },

  /**
   * @function
   * @desc 회선 추가 버튼 토글
   */
  _toggleNumAddBtn: function() {
    if (this.$inputNumber.val().length > 9) {
      this.$btnAddNum.removeAttr('disabled').prop('disabled', false);
      this.$btnAddNum.parent().removeClass('bt-gray1').addClass('bt-blue1');
    } else {
      this.$btnAddNum.attr('disabled', 'disabled').prop('disabled', true);
      this.$btnAddNum.parent().removeClass('bt-blue1').addClass('bt-gray1');
    }
  },

  /**
   * @function
   * @desc 설정 완료 버튼 토글
   * @param isEnable - 활성화 여부
   */
  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 회선 입력란 blur Event
   */
  _blurInputNumber: function() {
    this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
  },

  /**
   * @function
   * @desc 회선 입력란 focus Event
   */
  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  /**
   * @function
   * @desc 회선 입력란 내 삭제 버튼 클릭 시
   */
  _clearNum: function() {
    this.$inputNumber.val('');
    this.$btnClearNum.hide().attr('aria-hidden', 'true');
    this._toggleNumAddBtn();
  },

  /**
   * @function
   * @desc 회선 입력란 내 삭제 버튼 display none|block
   */
  _toggleClearBtn: function() {
    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show().attr('aria-hidden', 'false');
    } else {
      this.$btnClearNum.hide().attr('aria-hidden', 'true');
    }
  },

  /**
   * @function
   * @desc 회선 가입 API 요청을 위한 포맷 값 산출
   * @param number - 회선 번호
   * @returns {{serviceNumber1: string, serviceNumber3: string, serviceNumber2: string}}
   */
  _getServiceNumberFormat: function(number) {
    if (number.length === 10) {
      return {
        serviceNumber1: number.substr(0, 3),
        serviceNumber2: number.substr(3, 3),
        serviceNumber3: number.substr(6, 4)
      };
    }

    return {
      serviceNumber1: number.substr(0, 3),
      serviceNumber2: number.substr(3, 4),
      serviceNumber3: number.substr(7, 4)
    };
  },

  /**
   * @function
   * @desc 회선 가입 API 요청을 위한 포맷 값 산출
   * @returns {Array}
   */
  _getSvcNumList: function() {
    var resultList = [];

    this.$lineList.find('li').each(function(index, item) {
      resultList.push(this._getServiceNumberFormat($(item).data('num')));
    }.bind(this));

    return resultList;
  }

};
