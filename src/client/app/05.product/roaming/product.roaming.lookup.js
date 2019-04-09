/**
 * @file product.roaming.lookup.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.03
 */
/**
 * @class
 * @desc 로밍 시작일 종료일 조회 페이지
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {String} prodBffInfo- 상품 원장 정보
 * @param {Object} prodId  – 상품 id
 * @returns {void}
 */
Tw.ProductRoamingLookup = function (rootEl,prodBffInfo,prodId) {

  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);
  this._prodBffInfo = prodBffInfo;
  this.$serviceTipElement = this.$container.find('.tip-view-btn');
  this._showDateFormat = 'YYYY. MM. DD.';
  this._init();
  this._bindBtnEvents();
  this._tooltipInit(prodId);
};

Tw.ProductRoamingLookup.prototype = {
  /**
   * @function
   * @member
   * @desc 초기화
   * @returns {void}
   */
  _init : function(){
    var startDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcStartDt,this._showDateFormat,'YYYYMMDD');
    var endDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcEndDt,this._showDateFormat,'YYYYMMDD');
    this.$container.find('#start_date').text(startDate+' '+this._prodBffInfo.svcStartTm+':00');
    this.$container.find('#end_date').text(endDate+' '+this._prodBffInfo.svcEndTm+':00');
    if(isNaN(this._prodBffInfo.prodFee)){
      this.$container.find('.point').text(this._prodBffInfo.prodFee);
    }else{
      this.$container.find('.point').text(Tw.FormatHelper.addComma(this._prodBffInfo.prodFee+Tw.CURRENCY_UNIT.WON));
    }
  },
  /**
   * @function
   * @member
   * @desc 이벤트 바인딩
   * @returns {void}
   */
  _bindBtnEvents: function () {
    this.$container.on('click','.popup-closeBtn',$.proxy(this._goBack,this));
  },
  /**
   * @function
   * @member
   * @desc 뒤로가기
   * @returns {void}
   */
  _goBack : function () {
    this._history.goBack();
  },
  /**
   * @function
   * @member
   * @desc 상품별 툴팁 출력 구분
   * @param {String} prodId 상품 id
   * @returns {void}
   */
  _tooltipInit : function (prodId) {
    switch (prodId) {
      case 'NA00004088':
      case 'NA00005047':
      case 'NA00005502':
      case 'NA00004883':
      case 'NA00004326':
        this.$serviceTipElement.attr('id','RM_11_01_02_06_tip_01_01');
        break;
      case 'NA00005692':
      case 'NA00005695':
        this.$serviceTipElement.attr('id','RM_11_01_02_06_tip_01_02');
        break;
      case 'NA00005821':
        this.$serviceTipElement.attr('id','RM_11_01_02_06_tip_01_03');
        break;
      default:
        this.$serviceTipElement.hide();
        break;
    }
  }
};
