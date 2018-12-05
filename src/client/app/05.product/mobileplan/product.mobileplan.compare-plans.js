/**
 * FileName: product.mobileplan.compare-plans.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.11.26
 */
Tw.ProductMobilePlanComparePlans = function (data) {
  this.$container = $('.wrap');
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._data = data;
  this._init();
};

Tw.ProductMobilePlanComparePlans.prototype = {
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._initChart();
  },
  _initVariables: function () {

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-join-url]', $.proxy(this._goJoinUrl, this));
  },

  // 가입하기 페이지 이동
  _goJoinUrl: function (e) {
    var joinUrl = $(e.currentTarget).data('joinUrl');
    if (Tw.FormatHelper.isEmpty(joinUrl)) {
      return;
    }
    Tw.CommonHelper.startLoading('.container','grey',true);

    this._apiService.request(Tw.API_CMD.BFF_10_0007, {
      joinTermCd: '01'
    }, null, Tw.UrlHelper.getQueryParams().prodId)
      .done($.proxy(this._goJoinDone, this, joinUrl));
  },

  _goJoinDone: function(href, resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._onFail(resp);
    }

    this._historyService.goLoad(href + 'prod_id=' + Tw.UrlHelper.getQueryParams().prodId);
  },

  // 차트 생성
  _initChart: function () {
    /*
        prdname : 종류
        legend : 범례
        data_arry.u : 단위
        data_arry.v : 숫자, '무제한', '기본제공'
        data_arry.v2 : 숫자, '무제한', '기본제공'
    */
    // 상단 > 데이터 차트
    var _data = this._data;
    this.$container.chart2({ // 숫자
      target:'.chart1',
      type:'circle',
      unit : 'GB',
      prdname : _data.prodNames,
      data_arry : [
        {
          t : _data.recentAvgTxt,
          v : Number(_data.avg)
        },
        {
          t : _data.recentMaxTxt,
          v : Number(_data.max)
        },
        {
          t : _data.prodNames[1],
          v : !isNaN(_data.targetSupply) ? parseFloat(_data.targetSupply):_data.targetSupply
        }
      ]
    });
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
