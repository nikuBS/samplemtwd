/**
 * MenuName: 나의 가입정보 > 약정할인/기기상환 정보(MS_09)
 * @file myt-join.info.discount.js
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.10.04
 * Summary: 약정정보, 기기상환 정보 출력 화면
 * @param {Object} params
 * @param {jQuery} params.$element
 */
Tw.MyTJoinInfoDiscount = function (params) {
  Tw.Logger.info('[Server Res Data]', params.data);

  this.$container = params.$element;
  this.resData = params.data;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);

  this._init();
};

Tw.MyTJoinInfoDiscount.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();

    // var title = '타이틀11';
    // var contents = '<div class="testCon" >컨텐츠11</div>';
    // var linlList = [{ style_class: 'testCon', txt: '링크리스트' }];
    // var btName = '확인';
    // var noticeList = [{ tit: 'noticeList tit', con: 'noticeList con' }];
    // var list = [
    //   {
    //     attr: 'class="hbs-menu-list"',
    //     text: '001_텍스트'
    //   },
    //   {
    //     attr: 'class="hbs-menu-list"',
    //     text: '002_텍스트'
    //   }
    // ];

    // this._popupService.openTypeA(title, contents);
    // this._popupService.openOneBtTypeB(title, contents, linlList);

    // this._popupService.openAlert(contents, title, btName);
    // this._popupService.openConfirm(contents, title, btName);

    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    /* this._lineComponent = */
    new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  },
  _cachedElement: function () {
    // this.$entryTpl = $('#fe-entryTpl');
    // this.$dateSelect= $('[data-target="dateSelect"]');

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="monBtn"]', $.proxy(this._monthBtnEvt, this));
    this.$container.on('click', '[data-target="detailList"]', $.proxy(this._detailListEvt, this)); // 월별상세할인내역
    this.$container.on('click', 'button.fe-prod-btn', $.proxy(this._productMove, this));

  },
  //--------------------------------------------------------------------------[EVENT]
  // 상품 정보로 이동
  _productMove: function (e) {
    var $target = $(e.currentTarget);
    var prodId = $target.attr('data-id');
    if ( prodId ) {
      this._history.goLoad('/product/callplan?prod_id=' + prodId);
    }
    else {
      // 상품코드가 나오지 않은 아이템
      this._popupService.openAlert('TBD (상품코드가 현재 없습니다.)');
    }
  },
  _detailListEvt: function (e) {
    var $target = $(e.currentTarget);
    Tw.Logger.info('[svcAgrmtDcId]', $target.attr('data-value'));

    var dataValObj = JSON.parse($target.attr('data-value'));

    Tw.Logger.info('[dataValObj]', dataValObj);

    var param = $.param(dataValObj);

    Tw.Logger.info('[dataValObj > param]', param);

    this._goLoad('/myt-join/myplancombine/infodiscount/month?' + param);

  },
  _monthBtnEvt: function (e) {
    // Tw.Logger.info('[버튼 클릭]', e);
    var $target = $(e.currentTarget);
    this.selectMonthVal = $target.attr('data-value');

    // Tw.Logger.info('[선택 값]', this.selectMonthVal);

    var param = {
      startDt: this._getPeriod(this.selectMonthVal, 'YYYYMMDD').startDt,
      endDt: this._getPeriod(this.selectMonthVal, 'YYYYMMDD').endDt
    };

    // Tw.Logger.info('[버튼 클릭 > param]', param);
    this._getCallGiftInfo(param);
  },
  _popupCloseBtEvt: function () {
    this._goLoad('/myt-fare/billguide/guide');
  },
  //--------------------------------------------------------------------------[API]
  _getCallGiftInfo: function (param) {
    return this._apiService.request(Tw.API_CMD.BFF_05_0045, param).done($.proxy(this._getCallGiftInfoInit, this));
  },
  _getCallGiftInfoInit: function (res) {

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var resObj = this._svcToTimeObj(res.result.callData);
      this.$dateSelect.hide();

      if ( resObj.totalSec === 0 ) {
        // Tw.Logger.info('[콜기프트 > 이용내역이 없습니다. ]', resObj.totalSec);
        this.$dataResult.hide();
        this.$noData.show();
      }
      else {
        this.$dataResult.show();
        this.$noData.hide();
      }

      var resData = {
        hh: resObj.hh,
        mm: resObj.mm,
        ss: resObj.ss,
        startDt: this._getPeriod(this.selectMonthVal, 'YYYY.MM.DD').startDt,
        endDt: this._getPeriod(this.selectMonthVal, 'YYYY.MM.DD').endDt
      };

      this._svcHbDetailList(resData, this.$dataResult, this.$entryTpl);
    }

  },

  //--------------------------------------------------------------------------[SVC]

  _svcHbDetailList: function (resData, $jqTg, $hbTg) {
    var jqTg = $jqTg;
    var hbTg = $hbTg;
    var source = hbTg.html();
    var template = Handlebars.compile(source);
    var data = {
      resData: resData
    };
    var html = template(data);
    jqTg.append(html);
  },

  //--------------------------------------------------------------------------[COM]
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  },
  _comUnComma: function (str) {
    str = String(str);
    // return str.replace(/[^\d]+/g, '');
    return str.replace(/,/g, '');
  },
  _phoneStrToDash: function (str) {
    var strVal = String(str);
    return strVal.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  },
  _goBack: function () {
    this._history.go(-1);
  },
  _goLoad: function (url) {
    location.href = url;
  },
  _go: function (hash) {
    this._history.setHistory();
    window.location.hash = hash;
  }

};

// overriding
Tw.MyTJoinInfoDiscountAdv = function () {
  Tw.MyTJoinInfoDiscount.apply(this, arguments);
};
Tw.MyTJoinInfoDiscountAdv.prototype = Object.create(Tw.MyTJoinInfoDiscount.prototype);
Tw.MyTJoinInfoDiscountAdv.prototype.constructor = Tw.MyTJoinInfoDiscountAdv;
Tw.MyTJoinInfoDiscountAdv.prototype._cachedElement = function() {
  Tw.MyTJoinInfoDiscount.prototype._cachedElement.call(this);
  this.$feeBtn = this.$container.find('[data-id=fee]');
  this.$deviceBtn = this.$container.find('[data-id=device]');
  this.$deviceBuyBtn = this.$container.find('[data-id=device-buy]');
};
Tw.MyTJoinInfoDiscountAdv.prototype._bindEvent = function () {
  Tw.MyTJoinInfoDiscount.prototype._bindEvent.call(this);
  // accordion widget 처리
  this.$container.on('click', '.have-sub > a', $.proxy(function (event) {
    event.preventDefault();
    var $target = $(event.currentTarget);
    $target.parent().toggleClass('open');
    $target.attr('aria-pressed', $target.parent().hasClass('open'));
  }, this));
  // 3/11 배포 이후 BE 개발 완료 후 진행 - 납부회차 팝업
  // this.$feeBtn.on('click', _.debounce($.proxy(this._openDaysPopup, this), 500));
  // this.$deviceBtn.on('click', _.debounce($.proxy(this._openDaysPopup, this), 500));
  // this.$deviceBuyBtn.on('click', _.debounce($.proxy(this._openDaysPopup, this), 500));
};
Tw.MyTJoinInfoDiscountAdv.prototype._init = function () {
  this._cachedElement();
  this._bindEvent();
  // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
  /* this._lineComponent = */
  // new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  // 오퍼통계코드 추가
  new Tw.XtractorService(this.$container);
  // 약정할인금액 그래프 깨지는 문제 수정 건
  var disHorizonBar = this.$container.find('.horizon-bar-wrap');
  if ( disHorizonBar.length ) {
    $(window).on('resize load', function () {
      // 여러개 그래프가 있는 경우
      $.each(disHorizonBar, function(idx){
        var barBubble = disHorizonBar.eq(idx).find('.bar-bubble');
        var bar = disHorizonBar.eq(idx).find('.bar');
        bar.width() < barBubble.outerWidth() ?
          barBubble.addClass('left') : barBubble.removeClass('left');
      });
    });
  }
};
Tw.MyTJoinInfoDiscountAdv.prototype._openDaysPopup = function(event) {
  var $target = $(event.currentTarget);
  var id = $target.data('id');
  var itemTarget = $target.data('target');
  var selectItem = null;
  var defaultPopupOpt = {
    title: '', //'총 24회 중<br><strong>13회 납부 완료</strong>',
    title_type: 'sub2',
    cont_align: 'tl',
    contents: '',
    bt_b: [{
      style_class:'bt-red1 pos-right',
      txt: '확인'
    }]
  };
  if (id === 'device-buy') {
    // TODO: 총 회차 정보만 알 수 있어 API 개발 완료되면 기능 추가
    // defaultPopupOpt.cont_align = 'warning';
    // defaultPopupOpt.contents =
    //   '기기 할부금은 하루 단위로 계산되기 때문에 할부 개월 수보다 할부 청구 횟수가 1회 더 많을 수 있습니다.';
    // selectItem = this.resData.commDataInfo.repaymentInfo.find(function(item) {
    //   return item.titNm === itemTarget;
    // });
    // if (selectItem) {
    //   defaultPopupOpt.title = '총 24회 중<br><strong>13회 납부 완료</strong>';
    // }
  } else {
    defaultPopupOpt.notice_has = 'none';
    if (id === 'fee') {
      selectItem = this.resData.commDataInfo.feeInfo.find(function(item) {
        return (item.prodId === itemTarget && item.paymentCount);
      });
    }
    if (selectItem) {
      defaultPopupOpt.title = '<strong>'+ selectItem.paymentCount +'회 납부 완료</strong>';
    }
  }
  // 값이 있는 경우
  if (selectItem) {
    this._popupService.open(defaultPopupOpt, $.proxy(function ($popup) {
      this.popupCloseBtn = $popup.find('.pos-right button');
      this.popupCloseBtn.on('click', this._popupService.close);
    }, this), $.proxy(function() {
      this.popupCloseBtn.off('click');
    }, this));
  }
  return false;
};
