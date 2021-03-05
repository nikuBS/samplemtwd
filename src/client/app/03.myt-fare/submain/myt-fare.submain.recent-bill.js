/**
 * MenuName: 나의 요금 서브메인(최근 청구(이용) 영역)
 * @file myt-fare.submain.recent-bill.js
 * @author 양정규
 * @since 2020.12.24
 */
Tw.MyTFareSubMainRecentBill = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.common = new Tw.MyTFareSubMainCommon(params);
  this._init();
};

Tw.MyTFareSubMainRecentBill.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._makeChart();
  },

  /**
   * element cache
   * @private
   */
  _cachedElement: function () {
    this._contents = this.$container.find('.fe-contents'); // 컨텐츠 영역
    this._chartList = this.$container.find('.fe-chart-list'); // 차트 리스트 영역
    this._chartTempl = Handlebars.compile( $('#fe-chart-templ').html()); // 차트 템플릿
    this._legendTempl = Handlebars.compile( $('#fe-legend-templ').html()); // 범례 템플릿
  },

  /**
   * even bind
   * @private
   */
  _bindEvent: function () {
    // this.$container.on('click', '[data-change-limit]', $.proxy(this._changeLimit, this));
  },

  /**
   * @function
   * @desc 청구(이용) 데이터
   * @private
   */
  _getClaimData: function () {
    var data = this.data,
      self = this,
      eDate = data.claimDt,
      sDate = Tw.DateHelper.getEndOfMonSubtractDate(eDate, 2, 'YYYYMMDD'),
      isRep = data.type !== 'UF', // 대표청구 여부
      claimList = isRep ? data.claim.billInvAmtList : data.usage.usedAmtList;
    if (Tw.FormatHelper.isEmptyArray(claimList)) {
      return claimList;
    }

    claimList = _.reduce(claimList, function (acc, item) {
      if (!Tw.DateHelper.isBetween(item.invDt, sDate, eDate)) {
        return acc;
      }
      acc.push({
        date: item.invDt,
        claim: self._getIntNumber(item.invAmt),
        discount: self._getIntNumber(item.dcAmt)
      });
      return acc;
    }, []);
    // 리스트는 최대 3개까지
    claimList = _.sortBy(claimList, 'date').slice(0, 3);

    return claimList;
  },

  _makeChart: function () {
    var self = this;
    var datas = this._getClaimData();
    if (Tw.FormatHelper.isEmptyArray(datas)) {
      return;
    }

    var max = _.sortBy(datas, 'claim').reverse()[0].claim,
      totalDef = {
        sum: 0,
        cnt: 0
      };
    var claimTotal = $.extend({}, totalDef),
      dcTotal = $.extend({}, totalDef);

    if (max < 1) {
      max = _.sortBy(datas, 'discount').reverse()[0].discount;
      if (max < 1) {
        return;
      }
      max = max < 10000 ? 10000 : max * 2;
    }

    var calData = _.map(datas, function (item) {
      var claim = item.claim, discount = item.discount;
      item.month = self._recentChartDate(item.date);
      item.claimH = claim ? (claim / max) * 100 : 0;
      item.dcH = claim > discount ? (discount ? (discount / max) * 100 : 0) : 0;
      item.claim = Tw.FormatHelper.addComma(claim);
      item.discount = claim > discount ? Tw.FormatHelper.addComma(discount) : 0;
      claimTotal.sum += self._getIntNumber(claim);
      claimTotal.cnt += claim > 0 ? 1 : 0;
      dcTotal.sum += self._getIntNumber(discount);
      dcTotal.cnt += discount > 0 ? 1 : 0;
      return item;
    });

    var claimAvg = claimTotal.cnt ? parseInt(claimTotal.sum / claimTotal.cnt, 10) : 0,
      dcAvg = dcTotal.cnt ? parseInt(dcTotal.sum / dcTotal.cnt, 10) : 0;

    this._render(this._chartList, this._chartTempl, {list:calData}); // 그래프 렌더링
    this._render(this._contents, this._legendTempl, { // 그래프 및에 범례
      claimAvg : Tw.FormatHelper.addComma(claimAvg),
      dcAvg : Tw.FormatHelper.addComma(dcAvg)
    });
    this.$container.removeClass('none');
    if (claimTotal.sum > 0) {
      this._averageArea(calData);
    }
    this._makeEid();
  },

  /**
   * @function
   * @desc 할인영역 표시
   * @param discounts
   * @private
   */
  _averageArea: function (discounts) {
    if(this.data.type === 'UF') {
      return;
    }
    // 데이터는 높이값 100%기준으로 계산
    var chartData = _.reduce(discounts, function (acc, cur){
      if (cur.dcH < 1) {
        return acc;
      }
      acc.push(cur.dcH);
      return acc;
    }, []);
    // var chartData = [40, 0];
    var halfCir = $('.discount-point').height() / 2,
      $chart = $('#svg-chart'),
      baseWidth = $chart.width(),
      baseHeight = $chart.height(),
      targetWidth = baseWidth / chartData.length,
      path1, path2, lastPosition;

    // 2개 이상인 경우만 도형을 그려준다.
    if (chartData.length > 1) {
      path1 = 'M';
      path2 = 'M' + (targetWidth / 2) + ' ' + baseHeight + '';

      chartData.forEach(function (target, index) {
        // dash 옵션 추가
        path1 = path1 + ((targetWidth * index) + (targetWidth / 2) ) + ' ' + (baseHeight * ((100 - target ) / 100) - halfCir) + ' ';
        // area 옵션 추가
        lastPosition =  ((targetWidth * index) + (targetWidth / 2) + 1);
        path2 = path2 + ' L' + lastPosition + ' ' + (baseHeight * ((100 - target ) / 100) + 1 - halfCir) + ' ';
      });

      path2 = path2 + ' L' + lastPosition + ' ' + baseHeight +' Z';
      $('.chart-dash').attr('d', path1);
      $('.chart-area').attr('d', path2);
      // viewBox 크기 설정
      $chart[0].setAttribute('viewBox', '0 0 ' + baseWidth + ' ' + baseHeight);
    }
  },

  _render: function (target, template, param) {
    target.append(template(param));
  },

  // 최근사용요금 월표시 (당해년 제외 년월로 표시)
  _recentChartDate: function (date) {
    var curYear = new Date().getFullYear();
    var nextMonth = Tw.DateHelper.AddMonth(date);
    var inputYear = Tw.DateHelper.convDateFormat(nextMonth).getFullYear();
    return Tw.DateHelper.getShortKoreanAfterMonth(date, (curYear !== inputYear));
  },

  /**
   * @function
   * @desc 문자형 숫자에서 숫자만 추출하여 다시 int형으로 반환
   * @param value
   * @return {number}
   * @private
   */
  _getIntNumber: function (value) {
    value = Tw.StringHelper.getOnlyNumber(value);
    return parseInt(value, 10);
  },

  /**
   * @function
   * @desc 통계코드 data attr 생성
   * @private
   */
  _makeEid: function () {
    var builder = this.common.makeEid();
    var getEidOfLineType = builder.getEidOfLineType;
    builder.setEid('recentBill0', '68', getEidOfLineType('66', '105')) // 최근 청구요금내역 1
      .setEid('recentBill1', '69', getEidOfLineType('67', '106')) // 최근 청구요금내역 2
      .setEid('recentBill2', '70', getEidOfLineType('68', '107')) // 최근 청구요금내역 3
      .build();
  }

};
