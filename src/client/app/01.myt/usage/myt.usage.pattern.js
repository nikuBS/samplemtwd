/**
 * FileName: myt.usage.pattern.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.30
 *
 */

Tw.MyTUsagePattern = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._chartFeeData = params.chartFeeData;
  this._chartCTData = params.chartCTData;
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
    var chart_data3 = { // 데이터 확인 후 제거 예정
      caption: Tw.MSG_MYT.USAGE_PATTERN.CAPTION,//숨겨진표에 사용 접근성관련이슈
      tf_txt: Tw.MSG_MYT.USAGE_PATTERN.TF,//숨겨진표에 사용 접근성관련이슈
      td_txt: Tw.MSG_MYT.USAGE_PATTERN.BAR_CHART.TD,//숨겨진표에 사용 접근성관련이슈
      co_p: Tw.MSG_MYT.USAGE_PATTERN.BAR_CHART.CO,//배경관련 색상및 패턴이미지 경로
      txt_co: Tw.MSG_MYT.USAGE_PATTERN.TXT,//글자 색상
      sale_co: Tw.MSG_MYT.USAGE_PATTERN.BAR_CHART.SALE,//할인 글자 색상
      da_arr: [
        {
          na: this._chartFeeData[2][0],//각 항목 타이틀
          data: [this._chartFeeData[2][1]],//사용량 배열 및 단일값 가능
          sale_data: [this._chartFeeData[2][2]]//할인 배열 및 단일값 가능
        }, {
          na: this._chartFeeData[1][0],
          data: [this._chartFeeData[1][1]],//사용량 배열 및 단일값 가능
          sale_data: [this._chartFeeData[1][2]]//할인 배열 및 단일값 가능
        }, {
          na: this._chartFeeData[0][0],
          data: [this._chartFeeData[0][1]],//사용량 배열 및 단일값 가능
          sale_data: [this._chartFeeData[0][2]]//할인 배열 및 단일값 가능
        }
      ]
    };
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
        var chart_data1 = {
          caption: Tw.MSG_MYT.USAGE_PATTERN.CAPTION,//숨겨진표에 사용 접근성관련이슈
          tf_txt: Tw.MSG_MYT.USAGE_PATTERN.TF,//숨겨진표에 사용 접근성관련이슈
          td_txt: Tw.MSG_MYT.USAGE_PATTERN.LINE_CHART.TD,//숨겨진표에 사용 접근성관련이슈
          line_co: Tw.MSG_MYT.USAGE_PATTERN.LINE_CHART.LINE,//라인색상
          txt_co: Tw.MSG_MYT.USAGE_PATTERN.TXT,//글자색상
          da_arr:[
            {
              na: this._chartCTData[2][0],
              data:[this._chartCTData[2][1]]//배열 평균값으로 전달
            },{
              na:this._chartCTData[1][0],
              data:[this._chartCTData[1][1]]
            },{
              na:this._chartCTData[0][0],
              data:[this._chartCTData[0][1]]
            }
          ]
        }
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