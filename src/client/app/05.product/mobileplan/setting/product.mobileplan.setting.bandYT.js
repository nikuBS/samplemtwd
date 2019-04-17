/**
 * @file 상품 > 모바일요금제 > 설정 > Band YT 요금제
 * @author Kim In Hwan
 * @since 2018-11-14
 */

/**
 * @class
 * @desc 요금제 > 리스트 > 상품상세 > 정보입력/설정/변경 > 데이터 옵션 설정_Band YT
 * @param {JSON} params
 */
Tw.ProductMobileplanSettingBandYT = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._render();
  this._bindEvent();
  this._initialize();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductMobileplanSettingBandYT.prototype = {

  /**
   * @function
   * @desc 렌더
   */
  _render: function () {
    this.$okBtn = this.$container.find('[data-id=ok]');
    this.$radioBox = this.$container.find('.fe-radio-box');
  },
  /**
   * @function
   * @desc 바인드 이벤트 설정
   */
  _bindEvent: function () {
    this.$okBtn.on('click', _.debounce($.proxy(this._onClickOkBtn, this), 500));
    this.$radioBox.on('change', $.proxy(this._onChangeRadioBox, this));
  },
  /**
   * @function
   * @desc 초기 설정
   */
  _initialize: function () {
    if ( this.data.bandyt.useOptionProdId ) {
      this.$radioBox.find('input[data-info=' + this.data.bandyt.useOptionProdId + ']').trigger('click');
    }
    else {
      this.$radioBox.find('input').eq(0).trigger('click');
    }
  },
  /**
   * @function
   * @desc 버튼 클릭 이벤트
   */
  _onClickOkBtn: function () {
    this._onSetBandYT();
  },
  /**
   * @function
   * @desc 라디오버튼 변경 이벤트
   * @param {Object} event
   */
  _onChangeRadioBox: function (event) {
    var $target = $(event.target);
    this.info = $target.attr('data-info');
  },
  /**
   * @function
   * @desc 무선 부가상품 가입 처리
   */
  _onSetBandYT: function () {
    if ( this.info === this.data.bandyt.useOptionProdId ) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    // 무선 부가상품 가입 처리
    // http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=81527169
    Tw.CommonHelper.startLoading('.wrap', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0035, { addCd: '2' }, {}, [this.info])
      .done($.proxy(this._onSuccessJoinAddition, this))
      .fail($.proxy(this._onFailJoinAddtion, this));
  },
  /**
   * @function
   * @desc _onSetBandYT() 성공 콜백
   * @param {Object} resp
   */
  _onSuccessJoinAddition: function (resp) {
    Tw.CommonHelper.endLoading('.wrap');

    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
        typeNm: Tw.PRODUCT_TYPE_NM.CHANGE
      }
    }, $.proxy(this._bindSuccessPopup, this), $.proxy(this._onClosePop, this), 'save_setting_success');
  },
  /**
   * @function
   * @desc _onSetBandYT() 실패 콜백
   * @param {Object} resp
   */
  _onFailJoinAddtion: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  },
  /**
   * @function
   * @desc _onSuccessJoinAddition() 로드 후 바인딩 이벤트
   * @param {Object} $popupContainer
   */
  _bindSuccessPopup: function ($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },
  /**
   * @function
   * @desc 팝업 닫기 및 url 이동
   * @param {Object} e
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },
  /**
   * @function
   * @desc 팝업 닫기
   */
  _closePop: function () {
    this._popupService.close();
  },
  /**
   * @function
   * @desc 뒤로가기
   */
  _onClosePop: function () {
    this._historyService.goBack();
  }
};
