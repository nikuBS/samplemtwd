/**
 * @file 모바일 부가서비스 > 스마트콜Pick 설정
 * @author
 * @since 2019-09-30
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
Tw.ProductMobileplanAddSettingSmartCallPick = function (rootEl, prodId, vasPackCnt, smartCallPick) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this.$container = rootEl;
  this._prodId = prodId;
  this._vas_pack_cnt = vasPackCnt;
  this._smartCallPick = JSON.parse(window.unescape(smartCallPick));

  this._cachedElement();
  this._bindEvent();
  // 최초 동작
  this._init();
};

Tw.ProductMobileplanAddSettingSmartCallPick.prototype = {

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$clickCheckBox = this.$container.find('input[name=subprod]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$selectedCnt = this.$container.find('#selectedCnt');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$clickCheckBox.on('click', $.proxy(this._clickCheckBox, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function () {
    this._checkBoxCnt();
  },

  /**
   * @function
   * @desc 스마트콜Pick 개별상품 체크박스 체크/체크해제
   */
  _clickCheckBox: function () {
    this._checkBoxCnt();
  },

  /**
   * @function
   * @desc 스마트콜Pick 개별상품 체크박스 선택 값 카운팅
   */
  _checkBoxCnt: function () {
    var checkBoxCnt = $('input[name=subprod]:checked').length;
    this.$selectedCnt.text(checkBoxCnt);

  },

  /**
   * @function
   * @desc 설정완료 API 요청
   */
  _procConfirm: function () {
    this.$btnSetupOk.prop('disabled', true);
    var checkBoxCnt = $('input[name=subprod]:checked').length;
    
    if(checkBoxCnt !== 5){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A102.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A102.TITLE);
      return this.$btnSetupOk.prop('disabled', false);
    }
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this.$btnSetupOk.prop('disabled', false);

    //스마트콜Pick으로 사용중인 부가서비스와 체크한 부가서비스를 비교하여 추가/삭제 에 대한 설정API 요청
    var checkedProd = $('input[name=subprod]:checked').map(function(e){return this.value}).toArray();
    var usedProd = this._smartCallPick.filter(function(e) { return e.checked}).map(function(e){ return e.value});

    var addProd = checkedProd.filter(function(c){return usedProd.indexOf(c) === -1});
    var removeProd = usedProd.filter(function(c){return checkedProd.indexOf(c) === -1});
    var smartKitProdSetList = addProd.map(function(e){
      return {
        procCd: '01',
        prodId: e
      };
    }).concat(removeProd.map(function(e){
      return {
        procCd: '03',
        prodId: e
      };
    }));

    this._apiService.request(Tw.API_CMD.BFF_10_0186, {
      vasPackCnt: '0'+smartKitProdSetList.length,
      smartKitProdSetList: smartKitProdSetList
    })
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
    this._openSuccessPop();
  },

  /**
   * @function
   * @desc 완료팝업 실행
   */
  _openSuccessPop: function () {

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
        typeNm: Tw.PRODUCT_TYPE_NM.CHANGE
      }
    }, $.proxy(this._openResPopupEvent, this), $.proxy(this._onClosePop, this), 'save_setting_success');
  },

  /**
   * @function
   * @desc 완료팝업 이벤트 바인딩
   * @param $popupContainer - 완료팝업 컨테이너 레이어
   */
  _openResPopupEvent: function ($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
  },

  /**
   * @function
   * @desc 설정완료 팝업 내 닫기버튼 클릭 시
   */
  _closePop: function () {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료팝업 내 닫기 버튼 클릭 시
   */
  _onClosePop: function () {
    this._historyService.goBack();
  }

};
