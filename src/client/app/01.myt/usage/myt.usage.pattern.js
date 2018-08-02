/**
 * FileName: myt.usage.pattern.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.30
 *
 */

Tw.MyTUsagePattern = function ($element) {
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._defaultChartSetting = {
    min: 0, //Min크기
    max: 250, //Max크기
    spd: 0.05, //애니메이션 속도
    h: 250 //세로크기
  };
  this._rendered();
  this._bindEvent();

  setTimeout($.proxy(this._initialize, this), 200);
};

Tw.MyTUsagePattern.prototype = {
  //element event bind
  _bindEvent: function () {
    this.$tabLinker.on('click', 'li', $.proxy(this._onChangeLinker, this));
  },

  // set selector
  _rendered: function () {
    this.$tabLinker = this.$container.find('.tab-linker');
  },

  _initialize: function () {
    //test data
    var chart_data3 = Tw.MSG_MYT.USAGE_PATTERN.BAR_CHART.TEST;
    var setting = {
      type: 'bar', //basic, bar, circle
      container: 'can-box3', //클래스명 String
      x_name: Tw.MSG_MYT.USAGE_PATTERN.BAR_CHART.X, //x축 이름
      guide_num: 0, //가이드 갯수
      data: chart_data3 //데이터 obj
    };
    this.$container.find('.tab1-tab').chart($.extend(setting, this._defaultChartSetting));
  },

  _onChangeLinker: function (event) {
    var $target = event.target.id === 'tab2'? $(event.target) : $(event.target).parent();

    if ( $target.attr('id') === 'tab2' ) {
      if(!this._initSecondtab) {
        var chart_data1 = Tw.MSG_MYT.USAGE_PATTERN.LINE_CHART.TEST;
        var setting = {
          type: 'basic', //basic, basic_1, bar, circle
          container: 'can-box1', //클래스명 String
          x_name: Tw.MSG_MYT.USAGE_PATTERN.LINE_CHART.X, //x축 이름
          guide_num: 1, //가이드 갯수
          decimal: 0, //소숫점자리
          data: chart_data1 //데이터 obj
        };
        this.$container.find('.tab2-tab').chart($.extend(setting, this._defaultChartSetting));
        this._initSecondtab = true;
      }
    }
  }
};