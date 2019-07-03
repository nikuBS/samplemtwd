/**
 * @file 모바일 부가서비스 > 넘버플러스2
 * @author
 * @since 2019-07-04
 */

/**
 * @class
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 * @oaram {String} prodId 상품ID
 * @param {String} displayId 화면ID
 * @param {String} mobileplanId 요금제ID
 */
Tw.ProductMobileplanAddJoinNumberPlus2nd = function (rootEl, prodId, displayId, mobileplanId) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this.$container = rootEl;
  this._prodId = prodId;
  this._displayId = displayId;
  this._checkedSvnNum = null;
  this._confirmOptions = {};

  this._cachedElement();
  this._bindEvent();
};

Tw.ProductMobileplanAddJoinNumberPlus2nd.prototype = {

  /**
   * @member (Object)
   * @prop {Array} addlist 추가된 연락처 list
   */
  _data: {
    addList: []
  },

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    //this.$btnNativeContactList = this.$container.find('.fe-btn_native_contact');
    this.$btnWishNum = this.$container.find('.fe-btn_wish_num');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$wishNumList = this.$container.find('.fe-line_wrap');
    this.$wishList = this.$container.find('#fe-wish_list');
    this.$wishBox = this.$container.find('#listBox');
    this.$svcNumTotal = this.$container.find('#svcNumTotal');

    this.$checkedLineBox = this.$container.find('.fe-line_wrap2');
    this.$selectedNum = this.$container.find('.fe-line_list');
    
    this.$emptyWrap = this.$container.find('.fe-empty_wrap');
    this.$inputNumber = this.$container.find('.fe-num_input');

    this.$checkedLineTemp = Handlebars.compile($('#fe-templ-line_item').html());
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$selectedNum.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));
    //this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$btnWishNum.on('click', $.proxy(this._wishNum, this));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));

    
    this.$container.on('click', '#listBox li', $.proxy(this._clickSvcNum, this));

    this.$container.on('change', 'input[name="svcNums"]', $.proxy(this._changeSvcNum, this));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  /**
   * @function
   * @desc 넘버플러스II 희망번호 삭제
   * @returns {*|void}
   */
  _delNum: function(e){
    this._checkedSvnNum = null;

    this.$btnSetupOk.prop('disabled', true);
    this.$checkedLineBox.addClass('none');
    this.$selectedNum.empty();
    this._showEmptyResult();

  },

  /**
   * @function
   * @desc 넘버플러스II 희망번호 조회
   * @returns {*|void}
   */
  _wishNum: function () {
    if(this._checkedSvnNum){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A97.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A97.TITLE);
      return;
    }

    if (this.$inputNumber.val().length < 4) {
      return;
    }

    var wishPhoneNum = this.$inputNumber.val();
    this._apiService.request(Tw.API_CMD.BFF_10_0118, {
      wishPhoneNum: wishPhoneNum
    }).done($.proxy(this._onDoneWishNumList, this));
  },

  /**
   * @function
   * @desc 넘버플러스II 희망번호 조회 성공
   * @param resp - API 응답 값
   */
  _onDoneWishNumList: function (resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      this._popupService.openAlert(resp.msg, resp.code);
      this._showEmptyResult();
      return;
    }
    var list = this._getWishNumList(resp);
    if (list.length <= 0) {
      this._showEmptyResult();
    } else {
      this._drowWishNumList(list);
    }
  },

  /**
   * @function
   * @desc 넘버플러스II 희망번호 검색결과 없는 경우 노출
   */
  _showEmptyResult: function() {
    this.$wishBox.empty();
    this.$svcNumTotal.text('0').closest('.cont-box').show();
    this.$wishNumList.hide();
    this.$emptyWrap.show();
  },

  /**
   * @function
   * @desc API result 리턴
   * @param {JSON} resp
   * @returns {JSON}
   */
  _getResult: function (resp) {
    return resp.result;
  },

  /**
   * @function
   * @desc API result 리턴
   * @param {JSON} resp
   * @returns {JSON}
   */
  _changeSvcNum: function(e){
    this.$btnSetupOk.attr('disabled', false);
  },

  _clickSvcNum: function(e){
    var $elm = $($(e.currentTarget).find('input'))
    $elm.prop('checked', !$elm.prop('checked')).trigger('change');
  },

  /**
   * @function
   * @desc 넘버플러스II 희망번호 리스트 반환
   * @param {JSON} resp
   * @returns {ArrayList}
   */
  _getWishNumList: function (resp) {
    var result = this._getResult(resp);
    var list = result.phoneLineList;
    return _.map(list, function (item) {
      item.svcNumDash = Tw.FormatHelper.conTelFormatWithDash(item.svcNum);
      return item;
    });
  },

  /**
   * @function
   * @desc 넘버플러스II 희망번호 리스트 제공
   * @param {ArrayList} list
   */
  _drowWishNumList: function (list) {
    var source = this.$wishList.html();
    var template = Handlebars.compile(source);
    var html = [];
    this.$wishBox.empty();

    html = list.map(function(e){
      return template(e);
    });

    this.$wishBox.html(html.join(''));
    this.$svcNumTotal.text(list.length).closest('.cont-box').show();
    this.$wishNumList.show();
    this.$emptyWrap.hide();
  },

  /**
   * @function
   * @desc 회선 입력란 keyup|input Event 시
   * @param e - keyup|input Event
   */
  _detectInputNumber: function (e) {
    if (Tw.InputHelper.isEnter(e)) {
      this.$btnWishNum.trigger('click');
      return;
    }

    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9]/g, ''));

    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    if (this.$wishNumList.length < 1) {
      return this._toggleSetupButton(this.$inputNumber.val().length > 0);
    }

    this._toggleClearBtn();
    this._toggleNumAddBtn();
  },

  /**
   * @function
   * @desc 회선 추가 버튼 토글
   */
  _toggleNumAddBtn: function () {
    if (this.$inputNumber.val().length > 3) {
      this.$btnWishNum.removeAttr('disabled').prop('disabled', false);
      this.$btnWishNum.parent().removeClass('bt-gray1').addClass('bt-blue1');
    } else {
      this.$btnWishNum.attr('disabled', 'disabled').prop('disabled', true);
      this.$btnWishNum.parent().removeClass('bt-blue1').addClass('bt-gray1');
    }
  },

  /**
   * @function
   * @desc 설정 완료 버튼 토글
   * @param isEnable - 활성화 여부
   */
  _toggleSetupButton: function (isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 회선 입력란 blur Event
   * @param e - blur Event
   */
  _blurInputNumber: function () {
    this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
  },

  /**
   * @function
   * @desc 회선 입력란 focus Event
   * @param e - focus Event
   */
  _focusInputNumber: function () {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  /**
   * @function
   * @desc 삭제 버튼 클릭 시 동작 정의
   */
  _clearNum: function () {
    this.$inputNumber.val('');
    this.$btnClearNum.hide().attr('aria-hidden', 'true');
    this._toggleNumAddBtn();
  },

  /**
   * @function
   * @desc 회선 번호 입력 란 삭제 버튼 display none|block 처리
   * @param $elem - 삭제 버튼
   */
  _toggleClearBtn: function () {
    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show().attr('aria-hidden', 'false');
    } else {
      this.$btnClearNum.hide().attr('aria-hidden', 'true');
    }
  },

  /**
   * @function
   * @desc 가입처리에 필요한 회선번호 포맷 산출
   * @param number - 회선번호
   * @returns {{serviceNumber1: string, serviceNumber3: string, serviceNumber2: string}}
   */
  _getServiceNumberFormat: function (number) {
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
   * @desc API 요청시 필요한 회선번호 포맷 산출
   * @returns {Array}
   */
  _getSvcNumList: function () {
    var resultList = [];

    this.$selectedNum.find('li').each(function (index, item) {
      resultList.push(this._getServiceNumberFormat($(item).data('num')));
    }.bind(this));

    return resultList;
  },

  /**
   * @function
   * @desc 정보확인 데이터 변환
   * @param result - 정보확인 데이터
   * @returns {any | this | {isOverpayResult}}
   */
  _convConfirmOptions: function (result) {
    this._confirmOptions = Tw.ProductHelper.convAdditionsJoinTermInfo(result);

    $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0),
      isMobilePlan: false,
      noticeList: this._confirmOptions.preinfo.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId]
      }]
    });

    return this._confirmOptions;
  },

  /**
   * @function
   * @desc 설정완료 API 요청
   */
  _procConfirm: function () {
    this.$btnSetupOk.prop('disabled', true);
    var checkSvcNum = $('input[name="svcNums"]:checked');

    if(checkSvcNum.size() < 1 && !this._checkedSvnNum){
      this.$btnSetupOk.prop('disabled', false);
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A96.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A96.TITLE);
      return;
    }
    
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this.$btnSetupOk.prop('disabled', false);
    this._checkedSvnNum = this._checkedSvnNum||checkSvcNum.val();

    this._apiService.request(Tw.API_CMD.BFF_10_0017, {
      joinTermCd: '01',
      optSvcNums: this._checkedSvnNum
    }, {}, [this._prodId])
    .done($.proxy(this._procConfirmRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 설정완료 API 응답 값 처리, 공통 정보확인 팝업 호출
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procConfirmRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this.$inputNumber.val('');
    this._showEmptyResult();
    this.$svcNumTotal.closest('.cont-box').hide();
    this.$emptyWrap.hide();
    this.$checkedLineBox.removeClass('none');
    this.$selectedNum.html(this.$checkedLineTemp({nunber: this._checkedSvnNum, numMask: Tw.FormatHelper.conTelFormatWithDash(this._checkedSvnNum)}));

    new Tw.ProductCommonConfirm(true, null, this._convConfirmOptions(resp.result), $.proxy(this._prodConfirmOk, this));
  },

  /**
   * @function
   * @desc 정보확인 공통 컴포넌트 콜백 & 가입 처리 API 요청
   */
  _prodConfirmOk: function () {
    var checkSvcNum = $('input[name="svcNums"]:checked');
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0018, {
      svcNumList: [
        {
          "serviceNumber1" : this._checkedSvnNum.substr(0,3),
          "serviceNumber2" : this._checkedSvnNum.substr(3,4),
          "serviceNumber3" : this._checkedSvnNum.substr(7)
        }
      ]
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 가입 처리 API 응답
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procJoinRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_10_0038, {
      scrbTermCd: 'S'
    }, {}, [this._prodId]).done($.proxy(this._isVasTerm, this));
  },

  /**
   * @function
   * @desc 가입유도팝업 조회 API 응답 값
   * @param resp - API 응답 값
   * @returns {*}
   */
  _isVasTerm: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openVasTermPopup(resp.result);
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function () {
    if (!this._isResultPop) {
      return;
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN}],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
          this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  /**
   * @function
   * @desc 완료팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindJoinResPopup: function ($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료팝업내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 가입유도팝업 실행
   * @param respResult - 가입유도팝업 API 응답 값
   */
  _openVasTermPopup: function (respResult) {
    var popupOptions = {
      hbs: 'MV_01_02_02_01',
      bt: [
        {
          style_class: 'unique fe-btn_back',
          txt: Tw.BUTTON_LABEL.CLOSE
        }
      ]
    };

    if (respResult.prodTmsgTypCd === 'H') {
      popupOptions = $.extend(popupOptions, {
        editor_html: Tw.CommonHelper.replaceCdnUrl(respResult.prodTmsgHtmlCtt)
      });
    }

    if (respResult.prodTmsgTypCd === 'I') {
      popupOptions = $.extend(popupOptions, {
        img_url: respResult.rgstImgUrl,
        img_src: Tw.Environment.cdn + respResult.imgFilePathNm
      });
    }

    this._isResultPop = true;
    this._popupService.open(popupOptions, $.proxy(this._bindVasTermPopupEvent, this), $.proxy(this._openSuccessPop, this), 'vasterm_pop');
  },

  /**
   * @function
   * @desc 가입유도팝업 이벤트 바인딩
   * @param $popupContainer - 가입유도팝업 컨테이너 레이어
   */
  _bindVasTermPopupEvent: function ($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 가입유도팝업 내 닫기 버튼 클릭 시
   */
  _closeAndOpenResultPopup: function () {
    this._isResultPop = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 가입유도팝업 내 닫기 버튼 클릭 시
   */
  _onClosePop: function () {
    this._historyService.goBack();
  }

};
