/**
 * @file 지점/대리점 찾기 메인 의 필터 처리
 * @author 양정규
 * @since 2020-07-16
 */
/**
 * @constructor
 * @param  {Object} options - 옵션
 */
Tw.CustomerAgentsearchFilter = function (options) {
  this._customerAgentsearch = options.customerAgentsearch;
  this._customerAgentsearchMap = this._customerAgentsearch.customerAgentsearchMap;
  this.$container = this._customerAgentsearch.$container;
  this.customerAgentsearchComponent = this._customerAgentsearch.customerAgentsearchComponent;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._query = Tw.UrlHelper.getQueryParams();
  this._selectedItem = undefined;
  this._init();
};

Tw.CustomerAgentsearchFilter.prototype = {

  /**
   * @function
   * @desc app인 경우 현재 위치 조회하고, mweb인 경우 약관 먼저 조회
   */
  _init: function () {
    this._cacheElements();
    this._bindEvents();
    this.customerAgentsearchComponent.registerHelper();
    this._selectedItem = $.extend({}, this._query);
  },

  _cacheElements: function () {
    this._reqOk = false;
  },

  _bindEvents: function () {
    this.$container.on('click', '.fe-options', $.proxy(this._openFilter, this)); // 필터 팝업 열기
  },

  /**
   * @function
   * @param e
   * @desc 매장속성 팝업 오픈
   */
  _openFilter: function (e) {
    this._popupService.open({
        hbs: 'CS2.2',
        layer: true
      }, $.proxy(this._openFilterCallback, this),
      $.proxy(this._closeCallback, this),
      null,
      $(e.currentTarget));
  },

  /**
   * @function
   * @param $layer
   * @desc 팝업 오픈 후 콜백함수
   */
  _openFilterCallback: function ($layer) {
    this.$form = $layer.find('#fe-form');
    this._checkedLastItems();
    $layer.on('click', '.fe-reset', $.proxy(this._reset, this));
    $layer.on('click', '.fe-select', $.proxy(this._onSelectShop, this));
    $layer.on('click', '.fe-close', $.proxy(this._closePop, this));
  },

  /**
   * @function
   * @desc 초기화
   */
  _reset: function(){
    this.$form[0].reset();
    this.$container.find('input[type="checkbox"]').prop('checked',false) // 모든 체크박스 체크해제
      .parent() // 부모로 이동하여 'checked' 클래스 제거 및 aria-checked false
      .removeClass('checked')
      .attr('aria-checked', false);
  },

  /**
   * @function
   * @desc 선택된 속성들 초기화
   */
  clearItems: function () {
    this._selectedItem = undefined;
  },

  /**
   * @function
   * @desc [매장 속성 선택] 매장 속성 조회.
   */
  _onSelectShop: function () {
    this._reqOk = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 팝업 닫고나서 매장 속성을 조회한다.
   */
  _closeCallback: function () {
    if (this._reqOk) {
      // #fe-form 데이터 JSON 으로 변환
      var data = _.reduce(this.$form.serializeArray(), function (m, o) {
        // 예약 상담 업무 (휴대폰일반, 유선/인터넷/TV, ADT캡스 보안) 중 한개라도 체크 했으면 T#예약(tSharpYn) 가능매장 조회.
        if (['mobile', 'wire', 'caps'].indexOf(o.name) > -1) {
          m.tSharpYn = o.value;
        }
        m[o.name] = o.value;
        return m;
      }, {});
      this._selectedItem = data;
      var instance = null;
      // 위치정보 미동의 했을땐 키워드 검색용 인스턴스를 사용.
      if (this._customerAgentsearchMap._isNotAgreeLocation){
        instance = this._customerAgentsearch;
      } else {
        instance = !this._customerAgentsearch.isKeywordSearch ? this._customerAgentsearchMap : this._customerAgentsearch;
      }
      // 전송 파라미터에 ['mobile', 'wire', 'caps'] 제거.(BFF 전송 시 쓸데없는 파라미터 제외하려고.)
      var param = _.clone(data);
      delete param.mobile;
      delete param.wire;
      delete param.caps;
      instance.filterSearchRequest(param);
    }
  },

  /**
   * @function
   * @desc 팝업 닫기
   */
  _closePop: function (){
    this._reqOk = false;
    this._popupService.close();
  },

  /**
   * @function
   * @param{array} items
   * @desc input 체크
   */
  _checkedLastItems: function () {
    if (!this._selectedItem) {
      return;
    }
    for (var key in this._selectedItem){
      var value = this._selectedItem[key];
      this.$form.find('input[name="'+ key +'"][value="'+ value +'"]').prop('checked', true);
    }
  }
};
