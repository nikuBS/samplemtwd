/**
 * @file benefit.my-benefit.rainbow-point.js
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018-11-02
 */
/**
 * @class
 * @desc 할인/혜택 > 나의 할인 혜택 > 레인보우 포인트
 * @param {Object} rootEl
 * @param {JSON} options
 */
Tw.BenefitMyBenefitRainbowPoint = function (rootEl, options) {
  this.$container = rootEl;
  this._options = options;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._page = 1;
  // Element 캐싱
  this._cachedElement();
  this._bindEvent();
  this._init();
};
Tw.BenefitMyBenefitRainbowPoint.prototype = {

  _init: function() {
    var totRecCnt = this.$lineList.data('list-cnt');
    var totRecPage = totRecCnt / 100;
    var requestArrayParams = [];

    if (totRecCnt % 100 > 0) {
      totRecPage += 1;
    }
    
    // [OP002-8973] 조회기간에 대한 제한 삭제 
    // var toDt = Tw.DateHelper.getShortDateWithFormat(Tw.DateHelper.getCurrentShortDate(), 'YYYYMMDD');
    // var fromDt = Tw.DateHelper.getShortDateWithFormatAddByUnit(toDt, -12, 'month', 'YYYYMMDD');

    for (var idx = 2; idx <= totRecPage; idx++) {
      var param = { command: Tw.API_CMD.BFF_05_0100 };
      // param.params = { fromDt: fromDt, toDt: toDt, size: 100, page: idx };
      param.params = { size: 100, page: idx };
      requestArrayParams.push(param);
    }

    if (!Tw.FormatHelper.isEmpty(requestArrayParams)) {
      this._apiService.requestArray(requestArrayParams)
        .done($.proxy(this._addRainbowHistories, this))
        .fail($.proxy(this._onFail, this));
    }
  },

  /**
   * @function
   * @desc Api 호출 성공시 콜백
   * @param {Object} response
   */
  _addRainbowHistories: function() {
    var mergedResult = [];
    
    for (var i = 0; i < arguments.length; i++) {
      var argumentsObj = arguments[i];

      for (var idx = 0; idx < argumentsObj.result.history.length; idx++) {
        var rainbowHistoryObj = argumentsObj.result.history[idx];

        rainbowHistoryObj.opDt = Tw.DateHelper.getShortDate(rainbowHistoryObj.opDt);
        
        if (rainbowHistoryObj.opClCd === 'E') {
          rainbowHistoryObj.opClNm = '적립';
        } else if (rainbowHistoryObj.opClCd === 'U') {
          rainbowHistoryObj.opClNm = '사용';
        } else if (rainbowHistoryObj.opClCd === 'X') {
          rainbowHistoryObj.opClNm = '소멸';
        }
        
        mergedResult.push(rainbowHistoryObj);
      }      
    }

    var source = $('#rainbowHistoryList').html();
    var template = Handlebars.compile(source);

    var output = template({
      list: mergedResult
    });

    this.$lineList.append(output);
  },

  /**
   * @function
   * @desc API Fail
   * @param {Object} err
   */
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$lineList = this.$container.find('.list-comp-lineinfo');
    this.$btnMore = this.$container.find('.fe-btn_more');
  },
  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-anchor-go-adjustment', $.proxy(this._onClickAnchor, this, !this._options.isMultiLineToAdjustment, '2_A15'));
    this.$container.on('click', '.fe-anchor-go-transfer', $.proxy(this._onClickAnchor, this, !this._options.isMultiLineToTransfer, '2_A16'));
    this.$btnMore.on('click', $.proxy(this._showMoreList, this));
  },
  /**
   * @function
   * @desc 알러트
   * @param {boolean} cond
   * @param {String} alertMsgKey
   */
  _onClickAnchor: function (cond, alertMsgKey) {
    if ( cond ) {
      event.preventDefault();
      this._popupService.openAlert(
        Tw.BENEFIT_MY_BENEFIT_RAINBOW_POINT[alertMsgKey],
        null,
        null,
        null,
        null,
        $(event.target)
      );
    }
  },

  /**
   * @function
   * @desc 더보기 버튼 클릭 시
   */
  _showMoreList: function() {
    var idxLimit = ++this._page * 10;
    $.each(this.$lineList.find('li'), function(idx, elem) {
      if (idx >= idxLimit) {
        return false;
      }

      $(elem).show().attr('aria-hidden', 'false');
    });

    if (this.$lineList.find('li:not(:visible)').length < 1) {
      this.$btnMore.remove();
    }
  }

};

