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

  _cachedElement: function () {
    this.$amount = this.$container.find('#fe-total');
    this.$period = this.$container.find('#fe-period');
    this.$preBill = this.$container.find('#fe-bt-prev');
    this.$btMore = this.$container.find('#fe-bt-more');
    this.$lineList = this.$container.find('#fe-line-info');
  },

  _bindEvent: function () {
    this.$preBill.on('click', $.proxy(this._onClickPreBill, this));
  },

  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successSvcInfo, this))
      .fail($.proxy(this._failSvcInfo, this));
  },

  _successSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = resp.result;
    }
  },

  _failSvcInfo: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  },

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


  _onReceivedBillData: function (child, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( !resp.result || !resp.result.hotBillInfo ) {
        this._getBillResponse();
        return;
      }
      var billData = resp.result.hotBillInfo[0];

      if ( this._billInfoAvailable ) {
        var total = this._isPrev ? billData.totOpenBal1 : billData.totOpenBal2;
        this.$amount.text(total);
        var fromDt = Tw.DateHelper.getShortDateWithFormat(
          this._isPrev ? resp.result.beforeFromDt : resp.result.fromDt, 'YYYY.MM.DD.'
        );
        var toDt = Tw.DateHelper.getShortDateWithFormat(
          this._isPrev ? resp.result.beforetoDt : resp.result.toDt, 'YYYY.MM.DD.'
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

  _onErrorReceivedBillData: function (resp) {
    Tw.CommonHelper.endLoading('.fe-loading-bill');
    // 애러시 노출되는 항목이 없어 alert 후 goBack 처리 필요. 공통함수(Tw.Error) 사용 불가.
    this._popupService.openAlert(resp.msg, resp.code, null, $.proxy(this._goBackOnError, this) );
  },

  _goBackOnError: function(){
    this._historyService.goBack();
  },

  _renderLines: function () {
    var items = this._lines.slice(this._idxLastItem, this._idxLastItem + this.NUM_OF_ITEMS);
    var source = $('#fe-list-template').html();
    var template = Handlebars.compile(source);
    var output = template({ list: items });
    this.$lineList.append(output);
    this._idxLastItem += this.NUM_OF_ITEMS;
    var moreItems = this._lines.length - this._idxLastItem;
    if ( moreItems > 0 ) {
      this.$btMore.show();
      this.$btMore.find('span').text('(' + moreItems + ')');
    } else {
      this.$btMore.hide();
    }
  },

  _onClickLine: function (e) {
    var idx = e.currentTarget.getAttribute('data-idx');
    var targetSvc = this._lines[idx];
    if ( targetSvc.child ) {
      this._onClickChild(targetSvc);
    } else {
      this._confirmSwitchLine(targetSvc);
    }
  },

  _onClickPreBill: function () {
    this._historyService.goLoad('/myt-fare/bill/hotbill/prev');
  },

  _onClickChild: function (target) {
    this._historyService.goLoad('/myt-fare/bill/hotbill/child?child=' + target.svcMgmtNum);
  },

  _confirmSwitchLine: function (target) {
    var defaultLineInfo = Tw.FormatHelper.getDashedCellPhoneNumber(this._svcInfo.svcNum.replace(/-/g, '')) + ' ' +
      (_.isEmpty(this._svcInfo.nickNm) ? this._svcInfo.eqpMdlNm : this._svcInfo.nickNm );
    var selectLineInfo = Tw.FormatHelper.getDashedCellPhoneNumber(target.svcNum.replace(/-/g, '')) + ' ' +
      (_.isEmpty(target.nickNm) ? target.eqpMdlNm : target.nickNm );
    this._popupService.openModalTypeA(Tw.REMNANT_OTHER_LINE.TITLE,
      defaultLineInfo + Tw.MYT_TPL.DATA_SUBMAIN.SP_TEMP + selectLineInfo,
      Tw.REMNANT_OTHER_LINE.BTNAME, null, $.proxy(this._requestSwitchLine, this, target), null);
  },

  _requestSwitchLine: function (target) {
    var lineComponent = new Tw.LineComponent();
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container');
    lineComponent.changeLine(target.svcMgmtNum, null, $.proxy(this._onChangeSessionSuccess, this));
  },

  _onChangeSessionSuccess: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._commonHelper.toast(Tw.REMNANT_OTHER_LINE.TOAST);
    }
    this._historyService.reload();
  }
};

Tw.MyTFareHotBill.NO_BILL_FIELDS = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];
Tw.MyTFareHotBill.CODE = {
  ERROR: {
    NO_BILL_REQUEST_EXIST: 'ZINVN8888'
  }
};

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

    // 빠지는 부분이 발생하여 아래와 같이 groupS 체크하는 부분 상위로 이동 (Edit: Kiminhwan)
    if ( groupS.indexOf('*') > -1 ) {
      groupS = groupS.replace(/\*/g, '');
      noVAT = true;
    }
    else if ( groupS.indexOf('#') > -1 ) {
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
          delete itemS.items[0];
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