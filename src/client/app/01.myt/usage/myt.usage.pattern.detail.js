/**
 * FileName: myt.usage.pattern.detail.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.03
 *
 */

Tw.MyTUsagePatternDetail = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._basFee = params.data.basFee;
  this._domTcFee = params.data.domTcFee;
  this._dataTcFee = params.data.dataTcFee;
  this._infoUseFee = params.data.infoUseFee;
  this._optFee = params.data.optFee;
  this._msgUseFee = params.data.msgUseFee;
  this._suplSvcUseFee = params.data.suplSvcUseFee;
  this._othrCoUseFee = params.data.othrCoUseFee;
  this._empty = params.data.empty;
  this._defaultChartSetting = {
    min: 0, //Min크기
    max: 150, //Max크기
    spd: 0.05, //애니메이션 속도
    h: 150, //세로크기
    type: Tw.MSG_MYT.USAGE_PATTERN.TYPE.BAR_1,
    x_name: Tw.MSG_MYT.USAGE_PATTERN.UNIT.WON,
    guide_num: 0
  };
  this._defaultChartData = {
    caption: Tw.MSG_MYT.USAGE_PATTERN.CAPTION,//숨겨진표에 사용 접근성관련이슈
    tf_txt: Tw.MSG_MYT.USAGE_PATTERN.TF,//숨겨진표에 사용 접근성관련이슈
    td_txt: Tw.MSG_MYT.USAGE_PATTERN.TD,//숨겨진표에 사용 접근성관련이슈
    txt_co: Tw.MSG_MYT.USAGE_PATTERN.COLOR.TEXT
  };
  this._rendered();
  this._bindEvent();

  setTimeout($.proxy(this._initialize, this), 200);
};

Tw.MyTUsagePatternDetail.prototype = {
  _initialize: function () {
    this._initFeeCharts();
  },

  //element event bind
  _bindEvent: function () {
    this.$dropdownBtn.on('click', $.proxy(this._openDropdownPopup, this));
  },

  // set selector
  _rendered: function () {
    this.$basFee = this.$container.find('#fe-basfee');
    this.$domTcFee = this.$container.find('#fe-domtcfee');
    this.$dataTcFee = this.$container.find('#fe-datatcfee');
    this.$infoUseFee = this.$container.find('#fe-infousefee');
    this.$optFee = this.$container.find('#fe-optfee');
    this.$msgUseFee = this.$container.find('#fe-msgusefee');
    this.$suplSvcUseFee = this.$container.find('#fe-suplsvcusefee');
    this.$othrCoUseFee = this.$container.find('#fe-othrcousefee');

    // 항목 리스트 버튼
    this.$dropdownBtn = this.$container.find('.bt-dropdown');
  },

  _initFeeCharts: function () {
    if ( !this._empty.domTcFee ) {
      var domTcFeeChart = $.extend({
        co_p: Tw.MSG_MYT.USAGE_PATTERN.COLOR.BACK_1,
        da_arr: [
          {
            na: this._domTcFee[2][0],
            data: [this._domTcFee[2][1]]
          }, {
            na: this._domTcFee[1][0],
            data: [this._domTcFee[1][1]]
          }, {
            na: this._domTcFee[0][0],
            data: [this._domTcFee[0][1]]
          }
        ]
      }, this._defaultChartData);
      this.$container.chart($.extend({
        container: 'can-box2', //클래스명 String
        data: domTcFeeChart //데이터 obj
      }, this._defaultChartSetting));
    }
    if ( !this._empty.dataTcFee ) {
      var dataTcFeeChart = $.extend({
        co_p: Tw.MSG_MYT.USAGE_PATTERN.COLOR.BACK_3,
        da_arr: [
          {
            na: this._dataTcFee[2][0],
            data: [this._dataTcFee[2][1]]
          }, {
            na: this._dataTcFee[1][0],
            data: [this._dataTcFee[1][1]]
          }, {
            na: this._dataTcFee[0][0],
            data: [this._dataTcFee[0][1]]
          }
        ]
      }, this._defaultChartData);
      this.$container.chart($.extend({
        container: 'can-box3', //클래스명 String
        data: dataTcFeeChart //데이터 obj
      }, this._defaultChartSetting));
    }
    if ( !this._empty.infoUseFee ) {
      var infoUseFeeChart = $.extend({
        co_p: Tw.MSG_MYT.USAGE_PATTERN.COLOR.BACK_2,
        da_arr: [
          {
            na: this._infoUseFee[2][0],
            data: [this._infoUseFee[2][1]]
          }, {
            na: this._infoUseFee[1][0],
            data: [this._infoUseFee[1][1]]
          }, {
            na: this._infoUseFee[0][0],
            data: [this._infoUseFee[0][1]]
          }
        ]
      }, this._defaultChartData);
      this.$container.chart($.extend(this._defaultChartSetting, {
        container: 'can-box4', //클래스명 String
        data: infoUseFeeChart //데이터 obj
      }, this._defaultChartSetting));
    }
    if ( !this._empty.optFee ) {
      var optFeeChart = $.extend({
        co_p: Tw.MSG_MYT.USAGE_PATTERN.COLOR.BACK_3,
        da_arr: [
          {
            na: this._optFee[2][0],
            data: [this._optFee[2][1]]
          }, {
            na: this._optFee[1][0],
            data: [this._optFee[1][1]]
          }, {
            na: this._optFee[0][0],
            data: [this._optFee[0][1]]
          }
        ]
      }, this._defaultChartData);
      this.$container.chart($.extend(this._defaultChartSetting, {
        container: 'can-box5', //클래스명 String
        data: optFeeChart //데이터 obj
      }));
    }
    if ( !this._empty.msgUseFee ) {
      var msgUseFeeChart = $.extend({
        co_p: Tw.MSG_MYT.USAGE_PATTERN.COLOR.BACK_4,
        da_arr: [
          {
            na: this._msgUseFee[2][0],
            data: [this._msgUseFee[2][1]]
          }, {
            na: this._msgUseFee[1][0],
            data: [this._msgUseFee[1][1]]
          }, {
            na: this._msgUseFee[0][0],
            data: [this._msgUseFee[0][1]]
          }
        ]
      }, this._defaultChartData);
      this.$container.chart($.extend(this._defaultChartSetting, {
        container: 'can-box6', //클래스명 String
        data: msgUseFeeChart //데이터 obj
      }));
    }
    if ( !this._empty.suplSvcUseFee ) {
      var suplSvcUseFeeChart = $.extend({
        co_p: Tw.MSG_MYT.USAGE_PATTERN.COLOR.BACK_2,
        da_arr: [
          {
            na: this._suplSvcUseFee[2][0],
            data: [this._suplSvcUseFee[2][1]]
          }, {
            na: this._suplSvcUseFee[1][0],
            data: [this._suplSvcUseFee[1][1]]
          }, {
            na: this._suplSvcUseFee[0][0],
            data: [this._suplSvcUseFee[0][1]]
          }
        ]
      }, this._defaultChartData);
      this.$container.chart($.extend(this._defaultChartSetting, {
        container: 'can-box7', //클래스명 String
        data: suplSvcUseFeeChart //데이터 obj
      }));
    }
    if ( !this._empty.othrCoUseFee ) {
      var othrCoUseFeeChart = $.extend({
        co_p: Tw.MSG_MYT.USAGE_PATTERN.COLOR.BACK_2,
        da_arr: [
          {
            na: this._othrCoUseFee[2][0],
            data: [this._othrCoUseFee[2][1]]
          }, {
            na: this._othrCoUseFee[1][0],
            data: [this._othrCoUseFee[1][1]]
          }, {
            na: this._othrCoUseFee[0][0],
            data: [this._othrCoUseFee[0][1]]
          }
        ]
      }, this._defaultChartData);
      this.$container.chart($.extend(this._defaultChartSetting, {
        container: 'can-box8', //클래스명 String
        data: othrCoUseFeeChart //데이터 obj
      }));
    }
    if ( !this._empty.basFee ) {
      var basFeeChart = $.extend({
        co_p: Tw.MSG_MYT.USAGE_PATTERN.COLOR.BACK_3,
        da_arr: [
          {
            na: this._basFee[2][0],
            data: [this._basFee[2][1]]
          }, {
            na: this._basFee[1][0],
            data: [this._basFee[1][1]]
          }, {
            na: this._basFee[0][0],
            data: [this._basFee[0][1]]
          }
        ]
      }, this._defaultChartData);
      this.$container.chart($.extend(this._defaultChartSetting, {
        container: 'can-box1', //클래스명 String
        data: basFeeChart //데이터 obj
      }));
    }
  },

  _popupOpend: function ($layer) {
    $layer.on('click', '.popup-choice-list button', $.proxy(this._onClickDropDownItem, this));
  },

  _onClickDropDownItem: function (event) {
    var $target = $(event.target);
    var index = parseInt($target.attr('data-index'), 10);

    this._showFeeChart(index);
    this._popupService.close();
  },

  _openDropdownPopup: function () {
    this._popupService.openChoice(Tw.POPUP_TITLE.SET_HELPLINE_ITEM, [
      { 'attr': 'data-index="0"', text: Tw.MSG_MYT.USAGE_PATTERN.DETAIL_ITEMS.ALL },
      { 'attr': 'data-index="1"', text: Tw.MSG_MYT.USAGE_PATTERN.DETAIL_ITEMS.BAS },
      { 'attr': 'data-index="2"', text: Tw.MSG_MYT.USAGE_PATTERN.DETAIL_ITEMS.DOM },
      { 'attr': 'data-index="3"', text: Tw.MSG_MYT.USAGE_PATTERN.DETAIL_ITEMS.DATA },
      { 'attr': 'data-index="4"', text: Tw.MSG_MYT.USAGE_PATTERN.DETAIL_ITEMS.INFO },
      { 'attr': 'data-index="5"', text: Tw.MSG_MYT.USAGE_PATTERN.DETAIL_ITEMS.OPT },
      { 'attr': 'data-index="6"', text: Tw.MSG_MYT.USAGE_PATTERN.DETAIL_ITEMS.MSG },
      { 'attr': 'data-index="7"', text: Tw.MSG_MYT.USAGE_PATTERN.DETAIL_ITEMS.SUPL },
      { 'attr': 'data-index="8"', text: Tw.MSG_MYT.USAGE_PATTERN.DETAIL_ITEMS.OTHR }
    ], '', $.proxy(this._popupOpend, this), null);
  },

  _showFeeChart: function (index) {
    switch ( index ) {
      case 0: // 전체
        this.$basFee.show();
        this.$domTcFee.show();
        this.$dataTcFee.show();
        this.$infoUseFee.show();
        this.$optFee.show();
        this.$msgUseFee.show();
        this.$suplSvcUseFee.show();
        this.$othrCoUseFee.show();
        break;
      case 1:
        this.$basFee.show();
        this.$domTcFee.hide();
        this.$dataTcFee.hide();
        this.$infoUseFee.hide();
        this.$optFee.hide();
        this.$msgUseFee.hide();
        this.$suplSvcUseFee.hide();
        this.$othrCoUseFee.hide();
        break;
      case 2:
        this.$basFee.hide();
        this.$domTcFee.show();
        this.$dataTcFee.hide();
        this.$infoUseFee.hide();
        this.$optFee.hide();
        this.$msgUseFee.hide();
        this.$suplSvcUseFee.hide();
        this.$othrCoUseFee.hide();
        break;
      case 3:
        this.$basFee.hide();
        this.$domTcFee.hide();
        this.$dataTcFee.show();
        this.$infoUseFee.hide();
        this.$optFee.hide();
        this.$msgUseFee.hide();
        this.$suplSvcUseFee.hide();
        this.$othrCoUseFee.hide();
        break;
      case 4:
        this.$basFee.hide();
        this.$domTcFee.hide();
        this.$dataTcFee.hide();
        this.$infoUseFee.show();
        this.$optFee.hide();
        this.$msgUseFee.hide();
        this.$suplSvcUseFee.hide();
        this.$othrCoUseFee.hide();
        break;
      case 5:
        this.$basFee.hide();
        this.$domTcFee.hide();
        this.$dataTcFee.hide();
        this.$infoUseFee.hide();
        this.$optFee.show();
        this.$msgUseFee.hide();
        this.$suplSvcUseFee.hide();
        this.$othrCoUseFee.hide();
        break;
      case 6:
        this.$basFee.hide();
        this.$domTcFee.hide();
        this.$dataTcFee.hide();
        this.$infoUseFee.hide();
        this.$optFee.hide();
        this.$msgUseFee.show();
        this.$suplSvcUseFee.hide();
        this.$othrCoUseFee.hide();
        break;
      case 7:
        this.$basFee.hide();
        this.$domTcFee.hide();
        this.$dataTcFee.hide();
        this.$infoUseFee.hide();
        this.$optFee.hide();
        this.$msgUseFee.hide();
        this.$suplSvcUseFee.show();
        this.$othrCoUseFee.hide();
        break;
      case 8:
        this.$basFee.hide();
        this.$domTcFee.hide();
        this.$dataTcFee.hide();
        this.$infoUseFee.hide();
        this.$optFee.hide();
        this.$msgUseFee.hide();
        this.$suplSvcUseFee.hide();
        this.$othrCoUseFee.show();
        break;
    }
  }
};