/**
 * FileName: myt.usage.pattern.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.30
 *
 */

Tw.MyTUsagePattern = function ($element) {
  var self = this;
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._rendered();
  this._bindEvent();

  setTimeout(function () {
    self._initialize();
  }, 200);
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
    var chart_data3 = {
      caption: '표제목',//숨겨진표에 사용 접근성관련이슈
      tf_txt: '평균값',//숨겨진표에 사용 접근성관련이슈
      td_txt: '각항목값',//숨겨진표에 사용 접근성관련이슈
      co_p: ['#d6dbe5', '/img/chart/pattern2.gif'],//배경관련 색상및 패턴이미지 경로
      txt_co: '#757575',//글자 색상
      sale_co: '#325ec1',//할인 글자 색상
      da_arr: [
        {
          na: '3월',//각 항목 타이틀
          data: [113030],//사용량 배열 및 단일값 가능
          sale_data: [22055]//할인 배열 및 단일값 가능
        }, {
          na: '4월',
          data: [87280],
          sale_data: [22055]
        }, {
          na: '5월',
          data: [75510],
          sale_data: [22055]
        }
      ]
    };

    this.$container.find('.tab1-tab').chart({
      type: 'bar', //basic, bar, circle
      container: 'can-box3', //클래스명 String
      h: 250, //세로크기
      x_name: '(단위:원)', //x축 이름
      min: 0, //Min크기
      max: 250, //Max크기
      spd: 0.05, //애니메이션 속도
      guide_num: 0, //가이드 갯수
      data: chart_data3 //데이터 obj
    });
  },

  _onChangeLinker: function (event) {
    var $target = event.target.id === 'tab2'? $(event.target) : $(event.target).parent();

    if ( $target.attr('id') === 'tab2' ) {
      if(!this._initSecondtab) {
        var chart_data1 = {
          caption: '3월,4월,5월 3개월평균 문자사용량',//숨겨진표에 사용 접근성관련이슈
          tf_txt: '평균값',//숨겨진표에 사용 접근성관련이슈
          td_txt: '각 개월 사용량',//숨겨진표에 사용 접근성관련이슈
          line_co: '#00a49a',
          txt_co: '#757575',
          da_arr: [
            {
              na: '3월',//각 항목 타이틀
              data: [5]//배열 평균값으로 전달
            }, {
              na: '4월',
              data: [0]
            }, {
              na: '5월',
              data: [13]
            }
          ]
        };
        this.$container.find('.tab2-tab').chart({
          type: 'basic', //basic, basic_1, bar, circle
          container: 'can-box1', //클래스명 String
          h: 250, //세로크기
          x_name: '(단위:건수)', //x축 이름
          min: 0, //Min크기
          max: 250, //Max크기
          spd: .05, //애니메이션 속도
          guide_num: 1, //가이드 갯수
          decimal: 0, //소숫점자리
          data: chart_data1 //데이터 obj
        });
        this._initSecondtab = true;
      }
    }
  }
};