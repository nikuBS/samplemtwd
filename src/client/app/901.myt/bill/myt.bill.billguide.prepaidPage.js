/**
 * FileName: myt.bill.billguide.prepaidPage.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.08
 * Info: PPS(선불폰)
 */

Tw.mytBillBillguidePrepaidPage = function (rootEl, resData) {
  this.thisMain = this;
  this.resData = resData;
  this.TYPE = {
    DATA: 'used',
    VOICE: 'rate'
  };
  this._field = '';//data, voice type
  this.PER_PAGE = 5; //리스트 아이템 노출 최대수
  this.NUM_OF_PAGES = 5;//페이지 번호 노출 최대수

  switch ( resData.ppsInfo.ppsPlan ) {
    case 'dataPlan':
      this._field = this.TYPE.DATA; //data
      break;
    case 'voicePlan':
      this._field = this.TYPE.VOICE;//voice
      break;
    case 'voiceDataPlan':
      this._field = this.TYPE.VOICE;
      break;
  }

  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._hashService = Tw.Hash;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.dateObj = {
    selArr: [],
    termNum: 2,
    startDt: null,
    endDt: null
  };
  this._init();
  this._bindEvent();
};

Tw.mytBillBillguidePrepaidPage.prototype = {
  _init: function () {
    this._hashService.initHashNav($.proxy(this._onHashChange, this));

    this.dateObj.startDt = moment().subtract(2, 'months');
    this.dateObj.endDt = moment();

    for ( var i = this.dateObj.termNum, len = 0; i >= len; i-- ) {
      var tempDateFormat = moment().subtract(i, 'months').format('YYYYMM');
      this.dateObj.selArr.push(tempDateFormat);
    }

    this._cachedElement();

    this.$startDtBtn.text(this.dateObj.startDt.format('YYYY.MM'));
    this.$startDtBtn.attr('data-info', this.dateObj.startDt.format('YYYYMM'));

    this.$endDtBtn.text(this.dateObj.endDt.format('YYYY.MM'));
    this.$endDtBtn.attr('data-info', this.dateObj.endDt.format('YYYYMM'));

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="startDtBtn"]', $.proxy(this._selPopOpen, this));
    this.$container.on('click', '[data-target="endDtBtn"]', $.proxy(this._selPopOpen, this));
    this.$container.on('click', '[data-target="getListBtn"]', $.proxy(this._getList, this));
  },
  _queryInit: function () {

  },
  _cachedElement: function () {
    this.$startDtBtn = $('[data-target="startDtBtn"]');
    this.$endDtBtn = $('[data-target="endDtBtn"]');
    this.$listWrapper = $('.payment-select');
  },
  //--------------------------------------------------------------------------[이벤트 | 팝업]
  _selPopOpen: function (event) {
    var $target = $(event.currentTarget);
    var tempArr = this.dateObj.selArr;
    var arrOption = [];
    for ( var i = 0, len = tempArr.length; i < len; i++ ) {
      arrOption.push({
        'attr': 'data-info="' + tempArr[i] + '"',
        text: this._getSelBtn(tempArr[i])
      });
    }
    this._popupService.openChoice(Tw.POPUP_TITLE.PERIOD_SELECT, arrOption, 'type1', $.proxy(this._selPopOpenEvt, this, $target));
  },
  _selPopOpenEvt: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._selPopOpenEvtExe, this, $target, $layer));
  },
  _selPopOpenEvtExe: function ($target, $layer, event) {
    var curTg = $(event.currentTarget);
    var tg = $target;
    var dataTemp = curTg.find('button').attr('data-info');
    tg.text(curTg.text());
    tg.attr('data-info', dataTemp);
    this._popupService.close();
    //this._goLoad('/myt/bill/billguide?invDt='+ dataTemp);
  },
  //--------------------------------------------------------------------------[api]
  _getList: function () {
    console.info('[_getList]');

    this._cachedElement();

    var tempParam = {
      startMM: this.$startDtBtn.attr('data-info'),
      endMM: this.$endDtBtn.attr('data-info')
    };

    console.info('[tempParam]', tempParam);

    this._apiService.request(Tw.API_CMD.BFF_05_0014, tempParam)
      .done($.proxy(function (resp) {
        this._getListOutput(resp.result);
      }, this))
      .fail(function () {
      });
  },
  //--------------------------------------------------------------------------[공통]
  _getListOutput: function (dataList) {
    var self = this;
    this._ppsList = dataList;
    _.each(this._ppsList, function (item) {
      if ( self._field === self.TYPE.DATA && parseInt(item[self._field], 10) < 0 ) {
        item.value = '-';
        item.showUnit = false;
      } else {
        item.value = item[self._field];
        item.showUnit = true;
      }
      item.usedDt = moment(item.usedDt, 'YYYYMMDD').format('YYYY.MM.DD');
    });
    this.totalPage = Math.ceil(this._ppsList.length / this.PER_PAGE); //1부터 시작

    Handlebars.registerHelper('for', function (from, to, incr, block) {
      var accum = '';
      for ( var i = from; i <= to; i += incr )
        accum += block.fn(i);
      return accum;
    });

    Handlebars.registerHelper('if_eq', function (v1, v2, options) {
      if ( v1 === v2 ) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    this._renderList(1);
  },

  _renderList: function (page) {
    //페이지 설정
    var startPage, endPage;
    this.currentPage = parseInt(page, 10);
    if ( this.currentPage - (this.NUM_OF_PAGES >> 1) <= 1 ) {//less than 5
      startPage = 1;
      endPage = Math.min(this.NUM_OF_PAGES, this.totalPage);
    } else if ( this.currentPage + (this.NUM_OF_PAGES >> 1) >= this.totalPage ) {//more than total-5
      endPage = this.totalPage;
      startPage = Math.max(this.totalPage - this.NUM_OF_PAGES + 1, 1);
    } else {
      startPage = Math.max(1, this.currentPage - (this.NUM_OF_PAGES >> 1));
      endPage = Math.min(this.totalPage, this.currentPage + (this.NUM_OF_PAGES >> 1));
    }
    var offset = this.PER_PAGE * (this.currentPage - 1);
    var options = {
      page: { from: startPage, to: endPage, current: this.currentPage },
      items: this._ppsList.slice(offset, offset + this.PER_PAGE),
      unit: this._field === this.TYPE.VOICE ? '원' : 'MB',
      disablePrev: startPage <= 1,
      disableNext: endPage >= this.totalPage
    };

    //rendering
    var source = $('#ppsBillList').html();
    var template = Handlebars.compile(source);
    var output = template(options);
    this.$listWrapper.empty();
    this.$listWrapper.append(output);

    //binding event
    this.$listWrapper.find('a.prev').on('click', $.proxy(this._onClickPrev, this));
    this.$listWrapper.find('a.next').on('click', $.proxy(this._onClickNext, this));
    this.$listWrapper.find('a[href="#' + this.currentPage + '"]').addClass('active');

  },
  _getSelClaimDtBtn: function (str) {
    return moment(str).add(1, 'days').format(Tw.DATE_FORMAT.YYYYDD_TYPE_0);
  },
  _getSelBtn: function (str) {
    return moment(str).add(1, 'days').format('YYYY.MM');
  },
  _onHashChange: function (hash) {
    if ( hash.raw ) {
      this._renderList(hash.raw);
    }
  },
  _onClickNext: function (e) {
    e.preventDefault();
    window.location.hash = this.currentPage + 1;

  },
  _onclickPrev: function (e) {
    e.preventDefault();
    window.location.hash = this.currentPage - 1;
  }
};
