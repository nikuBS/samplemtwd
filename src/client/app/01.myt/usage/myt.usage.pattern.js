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
  this._historyService = new Tw.HistoryService(this.$container);
  this._chartFeeData = params.data.chartFeeData;
  this._chartCTData = params.data.chartCTData;
  this._chartSmsData = params.data.chartSmsData;
  this._chartVoiceData = params.data.chartVoiceData;
  this._chartInVoiceData = params.data.chartInVoiceData;
  this._chartOutVoiceData = params.data.chartOutVoiceData;
  this._chartVidVoiceData = params.data.chartVidVoiceData;
  this._empty = params.data.empty;
  this._isTotal = params.data.isTotal;
  this._isPhone = params.data.isPhone;
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
    this.$detailBtn.on('click', 'button', $.proxy(this._onDetailMoveButton, this));
    if ( this._isPhone ) {
      this.$amtBtnContainer.on('click', 'button', $.proxy(this._onClickMoveButton, this));
    }
  },

  // set selector
  _rendered: function () {
    // 탭
    this.$tabLinker = this.$container.find('.tab-linker');
    // 세부이동버튼
    this.$detailBtn = this.$container.find('.list-link');
    // 데이터 사용량
    this.$cdataChartArea = this.$container.find('#fe-cdata-area');
    if ( this._isPhone ) {
      // 사용량 탭 내 이동 버튼
      this.$amtBtnContainer = this.$container.find('#amt-btn-grp');
      // 문자 사용량
      this.$smsChartArea = this.$container.find('#fe-sms-area');
      // 음성통화 사용량
      this.$voiceChartArea = this.$container.find('#fe-voice-area');
      // 음성통화 사용량
      this.$inVoiceChartArea = this.$container.find('#fe-invoice-area');
      // 음성통화 사용량
      this.$outVoiceChartArea = this.$container.find('#fe-outvoice-area');
      // 음성통화 사용량
      this.$vidVoiceChartArea = this.$container.find('#fe-vidvoice-area');
    }
  },

  _initialize: function () {
    if ( !this._empty.fee ) {
      this._initFeeChart();
    }
  },

  _onChangeLinker: function (event) {
    var $target = event.target.id === 'tab2' ? $(event.target) : $(event.target).parent();

    if ( $target.attr('id') === 'tab2' ) {
      if ( !this._initSecondtab ) {
        if ( !this._isTotal ) {
          this._initPatternChart();
          this._showPatternChart();
        }
        this._initSecondtab = true;
      }
    }
  },

  _onDetailMoveButton: function () {
    this._historyService.goLoad('/myt/usage/pattern/detail');
  },

  _onClickMoveButton: function (event) {
    var $target = $(event.target);
    var $titles = this.$amtBtnContainer.find('span');
    var $display = this.$amtBtnContainer.find('span:not(.blind)');
    var curIndex = parseInt($display.attr('data-index'), 10);
    if ( $target.hasClass('bt-prev') ) {
      //prev
      if ( curIndex === 0 ) {
        curIndex = 2;
      }
      else {
        --curIndex;
      }
    }
    else {
      // next
      if ( curIndex === 2 ) {
        curIndex = 0;
      }
      else {
        ++curIndex;
      }
    }
    this._showPatternChart(curIndex);
    this._initPatternChart(curIndex);
    $display.addClass('blind');
    $titles.siblings('[data-index="' + curIndex + '"]').removeClass('blind');
  },

  // 사용요금 차트 생성
  _initFeeChart: function () {
    var settingFee = {
      type: Tw.MSG_MYT.USAGE_PATTERN.TYPE.BAR, //basic, bar, circle
      container: 'can-box3', //클래스명 String
      x_name: Tw.MSG_MYT.USAGE_PATTERN.UNIT.TIME, //x축 이름
      guide_num: 0, //가이드 갯수
      data: {
        co_p: Tw.MSG_MYT.USAGE_PATTERN.COLOR.BACK,//배경관련 색상및 패턴이미지 경로
        txt_co: Tw.MSG_MYT.USAGE_PATTERN.COLOR.TEXT,//글자 색상
        sale_co: Tw.MSG_MYT.USAGE_PATTERN.COLOR.SALE,//할인 글자 색상
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
      } //데이터 obj
    };
    $.extend(settingFee, this._defaultChartSetting);
    this.$container.find('.tab1-tab').chart(settingFee);
  },

  // 사용량 차트 생성
  _initPatternChart: function (index) {
    switch ( index ) {
      case 1:
        if ( this._isPhone ) {
          if ( !this.voiceCreated ) {
            var defaultVoice = {
              caption: Tw.MSG_MYT.USAGE_PATTERN.CAPTION,//숨겨진표에 사용 접근성관련이슈
              tf_txt: Tw.MSG_MYT.USAGE_PATTERN.TF,//숨겨진표에 사용 접근성관련이슈
              td_txt: Tw.MSG_MYT.USAGE_PATTERN.TD,//숨겨진표에 사용 접근성관련이슈
              line_co: Tw.MSG_MYT.USAGE_PATTERN.COLOR.LINE_V,//라인색상
              txt_co: Tw.MSG_MYT.USAGE_PATTERN.COLOR.TEXT//글자색상
            };
            var defaultVoiceSetting = {
              type: Tw.MSG_MYT.USAGE_PATTERN.TYPE.BASIC_1, //basic, basic_1, bar, circle
              x_name: Tw.MSG_MYT.USAGE_PATTERN.UNIT.TIME, //x축 이름
              guide_num: 1, //가이드 갯수
              decimal: 0 //소숫점자리
            };
            $.extend(defaultVoiceSetting, this._defaultChartSetting);
            if ( !this._empty.voice ) {
              var voiceChart = $.extend({
                da_arr: [{
                  na: this._chartVoiceData[2][0],
                  data: [this._chartVoiceData[2][1]]//배열 평균값으로 전달
                }, {
                  na: this._chartVoiceData[1][0],
                  data: [this._chartVoiceData[1][1]]
                }, {
                  na: this._chartVoiceData[0][0],
                  data: [this._chartVoiceData[0][1]]
                }]
              }, defaultVoice);
              setTimeout($.proxy(function () {
                this.$container.find('.tab2-tab').chart($.extend(defaultVoiceSetting, {
                  container: 'can-box1', //클래스명 String
                  data: voiceChart //데이터 obj,
                }));
              }, this), 1200);
            }
            if ( !this._empty.inVoice ) {
              var inVoiceChart = $.extend({
                da_arr: [{
                  na: this._chartInVoiceData[2][0],
                  data: [this._chartInVoiceData[2][1]]//배열 평균값으로 전달
                }, {
                  na: this._chartInVoiceData[1][0],
                  data: [this._chartInVoiceData[1][1]]
                }, {
                  na: this._chartInVoiceData[0][0],
                  data: [this._chartInVoiceData[0][1]]
                }]
              }, defaultVoice);
              setTimeout($.proxy(function () {
                this.$container.find('.tab2-tab').chart($.extend(defaultVoiceSetting, {
                  container: 'can-box2', //클래스명 String
                  data: inVoiceChart //데이터 obj
                }));
              }, this), 700);
            }
            if ( !this._empty.outVoice ) {
              var outVoiceChart = $.extend({
                da_arr: [{
                  na: this._chartOutVoiceData[2][0],
                  data: [this._chartOutVoiceData[2][1]]//배열 평균값으로 전달
                }, {
                  na: this._chartOutVoiceData[1][0],
                  data: [this._chartOutVoiceData[1][1]]
                }, {
                  na: this._chartOutVoiceData[0][0],
                  data: [this._chartOutVoiceData[0][1]]
                }]
              }, defaultVoice);
              setTimeout($.proxy(function () {
                this.$container.find('.tab2-tab').chart($.extend(defaultVoiceSetting, {
                  container: 'can-box33', //클래스명 String
                  data: outVoiceChart //데이터 obj
                }));
              }, this), 500);
            }
            if ( !this._empty.vidVoice ) {
              var vidVoiceChart = $.extend({
                da_arr: [{
                  na: this._chartVidVoiceData[2][0],
                  data: [this._chartVidVoiceData[2][1]]//배열 평균값으로 전달
                }, {
                  na: this._chartVidVoiceData[1][0],
                  data: [this._chartVidVoiceData[1][1]]
                }, {
                  na: this._chartVidVoiceData[0][0],
                  data: [this._chartVidVoiceData[0][1]]
                }]
              }, defaultVoice);
              setTimeout($.proxy(function () {
                this.$container.find('.tab2-tab').chart($.extend(defaultVoiceSetting, {
                  container: 'can-box4', //클래스명 String
                  data: vidVoiceChart //데이터 obj
                }));
              }, this), 200);
            }
            this.voiceCreated = true;
          }
        }
        break;
      case 2:
        if ( this._isPhone ) {
          if ( !this.smsCreated ) {
            var defaultSms = {
              caption: Tw.MSG_MYT.USAGE_PATTERN.CAPTION,//숨겨진표에 사용 접근성관련이슈
              tf_txt: Tw.MSG_MYT.USAGE_PATTERN.TF,//숨겨진표에 사용 접근성관련이슈
              td_txt: Tw.MSG_MYT.USAGE_PATTERN.TD,//숨겨진표에 사용 접근성관련이슈
              line_co: Tw.MSG_MYT.USAGE_PATTERN.COLOR.LINE_S,//라인색상
              txt_co: Tw.MSG_MYT.USAGE_PATTERN.COLOR.TEXT//글자색상
            };
            var defaultSmsSetting = {
              type: Tw.MSG_MYT.USAGE_PATTERN.TYPE.BASIC, //basic, basic_1, bar, circle
              x_name: Tw.MSG_MYT.USAGE_PATTERN.UNIT.CASE, //x축 이름
              guide_num: 1, //가이드 갯수
              decimal: 0 //소숫점자리
            };
            $.extend(defaultSmsSetting, this._defaultChartSetting);
            if ( !this._empty.sms ) {
              var smsChart = $.extend({
                da_arr: [{
                  na: this._chartSmsData[2][0],
                  data: [this._chartSmsData[2][1]]//배열 평균값으로 전달
                }, {
                  na: this._chartSmsData[1][0],
                  data: [this._chartSmsData[1][1]]
                }, {
                  na: this._chartSmsData[0][0],
                  data: [this._chartSmsData[0][1]]
                }]
              }, defaultSms);
              this.$container.find('.tab2-tab').chart($.extend(defaultSmsSetting, {
                container: 'can-box-sms', //클래스명 String
                data: smsChart //데이터 obj
              }));
            }
            this.smsCreated = true;
          }
        }
        break;
      default:
        if ( !this.dataCreated ) {
          var defaultcData = {
            caption: Tw.MSG_MYT.USAGE_PATTERN.CAPTION,//숨겨진표에 사용 접근성관련이슈
            tf_txt: Tw.MSG_MYT.USAGE_PATTERN.TF,//숨겨진표에 사용 접근성관련이슈
            td_txt: Tw.MSG_MYT.USAGE_PATTERN.TD,//숨겨진표에 사용 접근성관련이슈
            line_co: Tw.MSG_MYT.USAGE_PATTERN.COLOR.LINE_B,//라인색상
            txt_co: Tw.MSG_MYT.USAGE_PATTERN.COLOR.TEXT//글자색상
          };
          var defaultcDataSetting = {
            type: Tw.MSG_MYT.USAGE_PATTERN.TYPE.BASIC, //basic, basic_1, bar, circle
            x_name: Tw.MSG_MYT.USAGE_PATTERN.UNIT.BYTE, //x축 이름
            guide_num: 1, //가이드 갯수
            decimal: 2 //소숫점자리
          };
          $.extend(defaultcDataSetting, this._defaultChartSetting);
          if ( !this._empty.cdata ) {
            var cDataChart = $.extend({
              da_arr: [{
                na: this._chartCTData[2][0],
                data: [this._chartCTData[2][1]]//배열 평균값으로 전달
              }, {
                na: this._chartCTData[1][0],
                data: [this._chartCTData[1][1]]
              }, {
                na: this._chartCTData[0][0],
                data: [this._chartCTData[0][1]]
              }]
            }, defaultcData);
            this.$container.find('.tab2-tab').chart($.extend(defaultcDataSetting, {
              container: 'can-box-cdata', //클래스명 String
              data: cDataChart //데이터 obj
            }));
          }
          this.dataCreated = true;
        }
        break;
    }
  },

  _showPatternChart: function (index) {
    switch ( index ) {
      case 1:
        this.$cdataChartArea.hide();
        if ( this._isPhone ) {
          this.$voiceChartArea.show();
          this.$inVoiceChartArea.show();
          this.$outVoiceChartArea.show();
          this.$vidVoiceChartArea.show();
          this.$smsChartArea.hide();
        }
        break;
      case 2:
        this.$cdataChartArea.hide();
        if ( this._isPhone ) {
          this.$voiceChartArea.hide();
          this.$inVoiceChartArea.hide();
          this.$outVoiceChartArea.hide();
          this.$vidVoiceChartArea.hide();
          this.$smsChartArea.show();
        }
        break;
      default:
        this.$cdataChartArea.show();
        if ( this._isPhone ) {
          this.$voiceChartArea.hide();
          this.$inVoiceChartArea.hide();
          this.$outVoiceChartArea.hide();
          this.$vidVoiceChartArea.hide();
          this.$smsChartArea.hide();
        }
        break;
    }
  }
};