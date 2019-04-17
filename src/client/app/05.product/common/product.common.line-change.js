/**
 * @file 상품 > 공통 > 회선변경 프로세스
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-01-17
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodTypCd - 상품 유형코드
 * @param pageMode - 변경/선택 여부
 * @param targetProdId - 이동할 상품코드
 * @param targetUrl - 이동할 주소
 * @param currentSvcMgmtNum - 현재 서비스관리번호
 */
Tw.ProductCommonLineChange = function(rootEl, prodTypCd, pageMode, targetProdId, targetUrl, currentSvcMgmtNum) {
  // 컨테이너 레이어
  this.$container = rootEl;
  // 공통 모듈 선언
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();
  // 공통 변수 선언
  this._prodTypCd = prodTypCd;
  this._pageMode = pageMode;
  this._targetProdId = targetProdId;
  this._targetUrl = targetUrl;
  this._currentSvcMgmtNum = currentSvcMgmtNum;
  this._svcMgmtNum = currentSvcMgmtNum;
  this._page = 1;
  // Element 캐싱
  this._cachedElement();
  // 이벤트 바인딩
  this._bindEvent();
  // 최초 실행
  this._init();
};

Tw.ProductCommonLineChange.prototype = {
  /**
   * @function
   * @desc 최초 실행
   */
  _init: function() {
    if (this._historyService.isBack()) {
      this._historyService.goBack();
    }

    if (this._pageMode === 'select' && this.$lineList.find('input[type=radio][value="' + this._svcMgmtNum + '"]').length > 0) {
      this.$lineList.find('input[type=radio][value="' + this._svcMgmtNum + '"]').trigger('click');
    }
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineRadio = this.$lineList.find('input[type=radio]');
    this.$btnMore = this.$container.find('.fe-btn_more');
    this.$btnOk = this.$container.find('.fe-btn_ok');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$lineRadio.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnMore.on('click', $.proxy(this._showMoreList, this));
    this.$btnOk.on('click', $.proxy(this._procApply, this));
  },

  /**
   * @function
   * @desc 완료 버튼 활성화
   */
  _enableSetupButton: function() {
    this.$btnOk.removeAttr('disabled').prop('disabled', false);
  },

  /**
   * @function
   * @desc 더보기 버튼 클릭 시
   */
  _showMoreList: function() {
    var idxLimit = ++this._page * 20;
    $.each(this.$lineList.find('li'), function(idx, elem) {
      if (idx > idxLimit) {
        return false;
      }

      $(elem).show().attr('aria-hidden', 'false');
    });

    if (this.$lineList.find('li:not(:visible)').length < 1) {
      this.$btnMore.remove();
    }
  },

  /**
   * @function
   * @desc 뒤로가기 실행
   */
  _goBack: function() {
    this._historyService.goBack();
  },

  /**
   * @function
   * @desc 완료 버튼 클릭 시, 현재 서비스관리번호와 다를경우 회선변경 호출
   * @returns {*|void}
   */
  _procApply: function() {
    var $checked = this.$lineList.find('input[type=radio]:checked');
    this._svcMgmtNum = $checked.val();
    this._svcNum = $checked.data('svc_num');

    if (this._svcMgmtNum !== this._currentSvcMgmtNum) {
      return this._procLineChange();
    }

    this._procPreCheck();
  },

  /**
   * @function
   * @desc 회선 변경 처리
   */
  _procLineChange: function() {
    var lineService = new Tw.LineComponent();
    lineService.changeLine(this._svcMgmtNum, this._svcNum, $.proxy(this._procPreCheck, this));
  },

  /**
   * @function
   * @desc 사전체크 API 확인
   * @returns {null|Tw.API_CMD.BFF_10_0164|{path, method}|Tw.API_CMD.BFF_10_0007|{path, method}|Tw.API_CMD.BFF_10_0119|{path, method}}
   * @private
   */
  _getPreCheckApi: function() {
    // 모바일 요금제, 모바일 부가서비스, 로밍 요금제, 로밍 부가서비스, 할인프로그램
    if (['AB', 'C', 'H_P', 'H_A', 'G'].indexOf(this._prodTypCd) !== -1) {
      return Tw.API_CMD.BFF_10_0007;
    }

    // 유선 부가서비스
    if (['E_I', 'E_P', 'E_T'].indexOf(this._prodTypCd) !== -1) {
      return Tw.API_CMD.BFF_10_0164;
    }

    // 결합상품
    if (this._prodTypCd === 'F') {
      return Tw.API_CMD.BFF_10_0119;
    }

    return null;
  },

  /**
   * @function
   * @desc 사전체크 API 요청
   * @returns {*|undefined}
   */
  _procPreCheck: function() {
    var preCheckApi = this._getPreCheckApi();

    if (Tw.FormatHelper.isEmpty(preCheckApi)) {
      return this._procPreCheckRes({ code: '00' });
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(preCheckApi, {}, null, [this._targetProdId])
      .done($.proxy(this._procPreCheckRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 사전체크 API 응답값 처리
   * @param resp - API 응답값
   * @returns {*}
   */
  _procPreCheckRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(null, resp.msg).pop();
    }

    if (this._prodTypCd === 'F' && resp.result.combiProdScrbYn !== 'N') {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.ALERT_ALREADY_PRODUCT).pop();
    }

    if (Tw.BrowserHelper.isIosChrome()) {
      window.history.replaceState(null, document.title, this._targetUrl);
    }

    this._historyService.replaceURL(this._targetUrl);
  }

};
