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
Tw.ProductMobileplanAddSettingNumberPlus2nd = function (rootEl, prodId, displayId, mobileplanId) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this.$container = rootEl;
  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = {};

  this._cachedElement();
  this._bindEvent();
};

Tw.ProductMobileplanAddSettingNumberPlus2nd.prototype = {

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
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  /**
   * @function
   * @desc 회선 삭제 버튼 클릭 시
   * @param e - 회선 삭제 버튼 클릭 이벤트
   * @returns {*|void}
   */
  _delNum: function(e) {

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
    this._apiService.request(Tw.API_CMD.BFF_10_0022, {
      chldSvcMgmtNum: svcMgmtNum
    }, {}, [this._prodId]).done($.proxy(this._addDelNumRes, this))
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

    this._historyService.replaceURL('/product/callplan?prod_id=' + this._prodId);
  }
};
