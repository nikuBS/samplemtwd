/**
 * FileName: myt-fare.bill.hotbill
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 9. 20.
 */
Tw.MyTFareHotBill = function (rootEl, params) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.NUM_OF_ITEMS = 20;
  this._historyService = new Tw.HistoryService();
  this._commonHelper = Tw.CommonHelper;
  this.childSvcMgmtNum = Tw.UrlHelper.getQueryParams().child || null;
  this._isPrev = Tw.UrlHelper.getLastPath() === 'prev';
  this._lines = params.lines;
  this._init();
};

Tw.MyTFareHotBill.prototype = {
  /**
   * Initialize this page.
   * @private
   */
  _init: function () {
    this._idxLastItem = 0;
    this._cachedElement();
    this._bindEvent();
    this._getSvcInfo();
    if ( this._lines.length > 0 ) {
      this._renderLines();
      this.$container.on('click', '[data-id="fe-other-line"]', $.proxy(this._onClickLine, this));
    }

    if ( this.$amount.length > 0 ) {//서버날짜로 일 별 노출조건 세팅해서 내려옴
      this._sendBillRequest(this.childSvcMgmtNum);
      this._billInfoAvailable = true;
      Handlebars.registerHelper('isBill', function (val, options) {
        return (Tw.MyTFareHotBill.NO_BILL_FIELDS.indexOf(val) < 0) ? options.fn(this) : options.inverse(this);
      });
    }
  },
  /**
   * Cache elements for binding events.
   * @private
   */
  _cachedElement: function () {
    this.$amount = this.$container.find('#fe-total');
    this.$period = this.$container.find('#fe-period');
    this.$preBill = this.$container.find('#fe-bt-prev');
    this.$btMore = this.$container.find('#fe-bt-more');
    this.$lineList = this.$container.find('#fe-line-info');
  },
  /**
   * Bind events to elements.
   * @private
   */
  _bindEvent: function () {
    this.$preBill.on('click', $.proxy(this._onClickPreBill, this));
    this.$container.on('click', '#fe-bt-more', $.proxy(this._renderLines, this));
  },
  /**
   * Get the service information.
   * @private
   */
  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successSvcInfo, this))
      .fail($.proxy(this._failSvcInfo, this));
  },
  /**
   * Success callback for _getSvcInfo
   * @param resp
   * @private
   */
  _successSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = resp.result;
    }
  },
  /**
   * Error callback for _getSvcInfo
   * @param resp
   * @private
   */
  _failSvcInfo: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  },
  /**
   * Success callback for _sendBillRequest.
   * 실시간 이용요금 생성 요청 후 자료를 다시 조회한다.(대기시간 필요: 전월 5초, 당월 2.5초)
   * @param childSvcMgmtNum
   * @param resp
   * @private
   */
  _getBillResponse: function (childSvcMgmtNum, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      setTimeout($.proxy(function () {
        var params = { count: this._requestCount++ };
        if ( this._isPrev ) {
          params.gubun = 'Q';
        } else if ( childSvcMgmtNum ) {
          params.childSvcMgmtNum = childSvcMgmtNum;
        }
        this._apiService
          .request(Tw.API_CMD.BFF_05_0022, params)
          .done($.proxy(this._onReceivedBillData, this, childSvcMgmtNum))
          .fail($.proxy(this._onErrorReceivedBillData, this));
      }, this), this._isPrev ? 5000 : 2500);

    } else {
      this._onErrorReceivedBillData(resp);
    }
  },
  /**
   * Request to create the hot-bill data.
   * @param child 자녀 svcInfo(Service Information): 자녀 실시간 요금 조회 시
   * @private
   */
  _sendBillRequest: function (child) {
    Tw.CommonHelper.startLoading('.fe-loading-bill', 'white');
    this._requestCount = 0;
    var params = { count: this._requestCount++ };

    if ( this._isPrev ) {
      params.gubun = 'Q';
    } else if ( child ) {
      params.childSvcMgmtNum = child.svcMgmtNum;
    }

    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, params)
      .done($.proxy(this._getBillResponse, this, child))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },

  /**
   * Success callback for _getBillResponse
   * @param child
   * @param resp
   * @private
   */
  _onReceivedBillData: function (child, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( !resp.result || !resp.result.hotBillInfo ) {
        this._getBillResponse(child, resp);
        return;
      }
      var billData = resp.result.hotBillInfo[0];

      if ( this._billInfoAvailable ) {
        // 서버에서 받은 데이터 formatting
        var total = this._isPrev ? billData.totOpenBal1 : billData.totOpenBal2;
        this.$amount.text(total + Tw.CURRENCY_UNIT.WON);
        var fromDt = Tw.DateHelper.getShortDateWithFormat(
          this._isPrev ? resp.result.beforeFromDt : resp.result.fromDt, 'YYYY.M.D.'
        );
        var toDt = Tw.DateHelper.getShortDateWithFormat(
          this._isPrev ? resp.result.beforeToDt : resp.result.toDt, 'YYYY.M.D.'
        );
        this.$period.text(this.$period.text() + fromDt + ' ~ ' + toDt);
        var fieldInfo = {
          lcl: 'billItmLclNm',
          scl: 'billItmSclNm',
          name: 'billItmNm',
          value: this._isPrev ? 'invAmt1' : 'invAmt2'
        };
        var group = Tw.MyTFareHotBill.arrayToGroup(billData.record1, fieldInfo);

        Tw.CommonHelper.endLoading('.fe-loading-bill');
        this._renderBillGroup(group, false, this.$container);
      }
    } else {
      if ( resp.code === Tw.MyTFareHotBill.CODE.ERROR.NO_BILL_REQUEST_EXIST ) {
        //Hotbill 요청 내역 존재하지 않는 애러일 경우 재요청한다
        this._sendBillRequest();
        return;
      }
      this._onErrorReceivedBillData(resp);
    }
  },
  /**
   * 요금 정보를 아코디언 메뉴에 표시한다.
   * @param group the bill data grouped by categories.
   * @param child
   * @param wrapper the element which to append the accordion menu.
   * @private
   */
  _renderBillGroup: function (group, child, wrapper) {
    var source = $('#tmplBillGroup').html();
    var template = Handlebars.compile(source);
    var output = template({ billItems: group });
    var $menu = wrapper.find('[data-role="fe-bill-menu"]');
    $menu.empty();
    $menu.append(output);
    if ( !child ) {
      skt_landing.widgets.widget_accordion(wrapper);
    }
  },
  /**
   * Error callback for API requests(_onErrorReceivedBillData, _onReceivedBillData)
   * @param resp
   * @private
   */
  _onErrorReceivedBillData: function (resp) {
    Tw.CommonHelper.endLoading('.fe-loading-bill');
    if ( resp.code === Tw.MyTFareHotBill.CODE.ERROR.BILL_NOT_AVAILABLE ) {
      Tw.Error(resp.code, Tw.HOTBILL_ERROR.ZINVE8106).replacePage();
    } else if ( resp.code === Tw.MyTFareHotBill.CODE.ERROR.BIIL_NOT_REQUESTED ) {
      Tw.Error(resp.code, Tw.HOTBILL_ERROR.ZINVE8888).replacePage();
    } else {
      // 애러시 노출되는 항목이 없어 alert 후 goBack 처리 필요. 공통함수(Tw.Error) 사용 불가.
      this._popupService.openAlert(resp.msg, resp.code, null, $.proxy(this._goBackOnError, this));
    }
  },
  /**
   * Go to the previous page on Error.
   * @private
   */
  _goBackOnError: function () {
    this._historyService.goBack();
  },
  /**
   * Render other(child) lines.
   * @private
   */
  _renderLines: function () {
    var items = this._lines.slice(this._idxLastItem, this._idxLastItem + this.NUM_OF_ITEMS);
    var source = $('#fe-list-template').html();
    var template = Handlebars.compile(source);
    var output = template({ list: items });
    this.$lineList.append(output);

    // 다른회선 요금 조회
    _.each(items, $.proxy(this._sendBillRequestOtherLine, this));

    this._idxLastItem += this.NUM_OF_ITEMS;
    var moreItems = this._lines.length - this._idxLastItem;
    if ( moreItems > 0 ) {
      this.$btMore.show();
      this.$btMore.attr('aria-hidden', false);
    } else {
      this.$btMore.hide();
      this.$btMore.attr('aria-hidden', true);
    }
  },
  /**
   * Request to create the hot-bill data for other(child) lines.
   * @param line
   * @private
   */
  _sendBillRequestOtherLine: function (line) {
    // 임시 로딩 제거 - 조회중 텍스트로 표시
    // Tw.CommonHelper.startLoading('[data-num="' + line.svcMgmtNum + '"] .price', 'white');
    line.count = 0;
    var params = { count: line.count++ };
    params.childSvcMgmtNum = line.svcMgmtNum;

    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, params)
      .done($.proxy(this._getBillResponseOtherLine, this, line))
      .fail($.proxy(this._onErrorOtherLine, this));
  },
  /**
   * Success callback for _sendBillRequestOtherLine
   * @param line
   * @param resp
   * @private
   */
  _getBillResponseOtherLine: function (line, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      setTimeout($.proxy(function () {
        var params = { count: line.count++ };
        params.childSvcMgmtNum = line.svcMgmtNum;
        this._apiService
          .request(Tw.API_CMD.BFF_05_0022, params)
          .done($.proxy(this._onReceiveBillOtherLine, this, line))
          .fail($.proxy(this._onErrorOtherLine, this));
      }, this), this._isPrev ? 5000 : 2500);

    } else {
      this._onErrorOtherLine(line, resp);
    }
  },
  /**
   * Success callback for _getBillResponseOtherLine
   * @param line
   * @param resp
   * @private
   */
  _onReceiveBillOtherLine: function (line, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( !resp.result || !resp.result.hotBillInfo ) {
        this. _onErrorOtherLine(line, resp);
        return;
      }

      var bill = resp.result.hotBillInfo[0].totOpenBal2;
      this.$lineList.find('[data-num="' + line.svcMgmtNum + '"] .price').text(bill + Tw.CURRENCY_UNIT.WON);
      // 임시 로딩 제거 - 조회중 텍스트로 표시
      // Tw.CommonHelper.endLoading('[data-num="' + line.svcMgmtNum + '"] .price', 'white');
    } else {
      this._onErrorOtherLine(line, resp);
    }
  },
  /**
   * Error callback for _getBillResponseOtherLine
   * @param line
   * @param resp
   * @private
   */
  _onErrorOtherLine: function (line, resp) {
    if ( line.count === 1 ) {
      // 2번 시도 필요
      this._getBillResponseOtherLine(line, resp);
    } else {
      // 임시 로딩 제거 - 조회중 텍스트로 표시
      // Tw.CommonHelper.endLoading('[data-num="' + line.svcMgmtNum + '"] .price', 'white');
      this.$lineList.find('[data-num="' + line.svcMgmtNum + '"] .price').text(Tw.MYT_HOTBILL_FAIL);
    }
  },
  /**
   * Event listener for the button click on [data-id="fe-other-line"](다른회선 요금).
   * 다른 회선: 선택회선 변경
   * 자녀회선: 자녀 실시간 이용요금 페이지로 이동
   * @param e
   * @private
   */
  _onClickLine: function (e) {
    var idx = e.currentTarget.getAttribute('data-idx');
    var targetSvc = this._lines[idx];
    if ( targetSvc.child ) {
      this._onClickChild(targetSvc);
    } else {
      this._confirmSwitchLine(targetSvc, $(e.currentTarget));
    }
  },
  /**
   * Event listener for the button click on $preBill(전월요금보기)
   * @private
   */
  _onClickPreBill: function () {
    this._historyService.goLoad('/myt-fare/bill/hotbill/prev');
  },

  /**
   * 자녀회선 클릭 시 자녀 실시간 이용요금으로 이동.
   * @param target
   * @private
   */
  _onClickChild: function (target) {
    this._historyService.goLoad('/myt-fare/bill/hotbill/child?child=' + target.svcMgmtNum);
  },
  /**
   * 다른 회선 클릭 시 회선변경 확인.
   * @param target the selected line
   * @private
   */
  _confirmSwitchLine: function (target, event) {
    this._popupService.openSwitchLine(this._svcInfo, target,Tw.REMNANT_OTHER_LINE.BTNAME, null,
      $.proxy(this._requestSwitchLine, this, target), null, null, null, $(event.currentTarget) );
  },
  /**
   * Request to switch the current line.
   * @param target
   * @private
   */
  _requestSwitchLine: function (target) {
    var lineComponent = new Tw.LineComponent();
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container');
    lineComponent.changeLine(target.svcMgmtNum, target.svcNum, $.proxy(this._onChangeSessionSuccess, this));
  },
  /**
   * Success callback for _requestSwitchLine.
   * @private
   */
  _onChangeSessionSuccess: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._commonHelper.toast(Tw.REMNANT_OTHER_LINE.TOAST);
    }
    this._historyService.reload();
  }
};

/**
 * 서버 요금 데이터 중 제외 항목 정의.
 * @type {string[]}
 */
Tw.MyTFareHotBill.NO_BILL_FIELDS = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];

/**
 * Bill 정보 생성 없이 조회 시 애러코드
 * @type {{ERROR: {NO_BILL_REQUEST_EXIST: string}}}
 */
Tw.MyTFareHotBill.CODE = {
  ERROR: {
    NO_BILL_REQUEST_EXIST: 'ZINVN8888',
    BILL_NOT_AVAILABLE: 'ZINVE8106',
    BIIL_NOT_REQUESTED: 'ZINVE8888'
  }
};
/**
 * Create a grouped data by the bill category.
 * @param data the array of bill data
 * @param fieldInfo
 * @return a grouped bill data
 */
Tw.MyTFareHotBill.arrayToGroup = function (data, fieldInfo) {
  // var self = this;
  var amount = 0;
  var noVAT = false;
  var is3rdParty = false;
  var group = {};
  var DEFAULT_DESC_VISIBILITY = true;
  var groupInfoFields = Tw.MyTFareHotBill.NO_BILL_FIELDS;

  data.forEach(function (item) {
    noVAT = false;
    is3rdParty = false;
    var groupL = item[fieldInfo.lcl];
    var groupS = item[fieldInfo.scl];

    if ( !group[groupL] ) {
      group[groupL] = { total: 0, showDesc: DEFAULT_DESC_VISIBILITY };
      if ( groupL === Tw.HOTBILL_UNPAID_TITLE ) {
        group[groupL].showDesc = false;
      }
    }

    if ( groupS.indexOf('*') > -1 ) {
      groupS = groupS.replace(/\*/g, '');
      noVAT = true;
    } else if ( groupS.indexOf('#') > -1 ) {
      groupS = groupS.replace(/#/g, '');
      is3rdParty = true;
    }

    if ( !group[groupL][groupS] ) {
      group[groupL][groupS] = { items: [], total: 0, noVAT: noVAT, is3rdParty: is3rdParty };
    }

    amount = Tw.StringHelper.parseCommaedStringToInt(item[fieldInfo.value]);
    group[groupL].total += amount;
    group[groupL][groupS].total += amount;

    var bill_item = {
      name: item[fieldInfo.name].replace(/[*#]/g, ''),
      amount: Tw.StringHelper.commaSeparatedString(item[fieldInfo.value]),
      noVAT: item[fieldInfo.name].indexOf('*') > -1,
      is3rdParty: item[fieldInfo.name].indexOf('#') > -1,
      discount: amount < 0
    };
    group[groupL][groupS].items.push($.extend({}, bill_item));
    bill_item.amount = item[fieldInfo.value];
  });

  //아이템 이름과 소분류가 같은 경우 2depth 보여주지 않음
  $.each(group, function (key1, itemL) {
    $.each(itemL, function (key2, itemS) {
      if ( groupInfoFields.indexOf(key2) < 0 ) {
        if ( itemS.items.length === 1 && itemS.items[0].name === key2 ) {
          itemS.items.splice(0,1);
        }
        itemS.discount = itemS.total < 0;
        itemS.total = Tw.StringHelper.commaSeparatedString(itemS.total);
      }
      itemL.discount = itemL.total < 0;
      itemL.total = Tw.StringHelper.commaSeparatedString(itemL.total);
    });
  });
  return group;
};