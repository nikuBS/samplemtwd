/**
 * FileName: product.mobileplan.compare-plans.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.11.26
 */
Tw.ProductMobilePlanComparePlans = function (data) {
  this.$container = $('.wrap');
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
          v : $.isNumeric(_data.targetSupply) ? parseFloat(_data.targetSupply):_data.targetSupply
        }
      ]
    });
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
