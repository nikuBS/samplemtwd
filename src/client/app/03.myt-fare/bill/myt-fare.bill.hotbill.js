/**
 * FileName: myt-fare.bill.hotbill
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 9. 20.
 */
Tw.MyTFareHotBill = function (rootEl) {
  this.SVC_TYPE = { MOBILE: 'M1', TPOCKET: 'M3' };
  this._children = null;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._history.init();

  this._cachedElement();
  this._bindEvent();
  this._sendBillRequest();

  if ( this.$amount.length > 0 ) {//서버날짜로 일 별 노출조건 세팅해서 내려옴
    this._billInfoAvailable = true;
    Handlebars.registerHelper('isBill', function (val, options) {
      return (Tw.MyTFareHotBill.NO_BILL_FIELDS.indexOf(val) < 0) ? options.fn(this) : options.inverse(this);
    });

    this._apiService.request(Tw.NODE_CMD.GET_CHILD_INFO, {})
      .done($.proxy(this._successRegisterLineList, this));
    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
      .done($.proxy(this._successRegisterLineList, this));


    var APIs = [
      { command: Tw.NODE_CMD.GET_CHILD_INFO, params: {} },
      { command: Tw.NODE_CMD.GET_ALL_SVC, params: {} },
      { command: Tw.NODE_CMD.GET_SVC_INFO, params: {} }
    ];
    this.lines = [];
    this._apiService.requestArray(APIs)
      .done($.proxy(function (children, svcs, svcInfo) {
        if ( children.code === Tw.API_CODE.CODE_00 ) {
          this.lines = children.result;
        }
        if ( svcs.code === Tw.API_CODE.CODE_00 ) {
          this.lines = this.lines.concat(svcs.result[Tw.LINE_NAME.MOBILE].filter(function (svc) {
            return ['M1', 'M3'].indexOf(svc.svcAttrCd) > -1;
          }));
          _.reject(this.lines, { svcMgmtNum: svcInfo.svcMgmtNum });
        }
      }));
  }
};

Tw.MyTFareHotBill.prototype = {
  _cachedElement: function () {
    this.$billMenu = this.$container.find('#fe-billAccordion');
    this.$amount = this.$container.find('#fe-total');
    this.$period = this.$container.find('#fe-period');
    this.$unpaid = this.$container.find('#fe-unpaid-bill');
    this.$unpaidAmount = this.$container.find('#fe-unpaid-amount');
  },

  _bindEvent: function () {
  },

  _getBillResponse: function () {
    console.log(this._requestCount);
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, { count: this._requestCount++ })
      .done($.proxy(this._onReceivedBillData, this))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },

  _sendBillRequest: function () {
    skt_landing.action.loading.on({ ta: '.loading' });
    this._requestCount = 0;
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, {
        count: this._requestCount++
      })
      .done($.proxy(this._getBillResponse, this))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },


  _onReceivedBillData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( !resp.result || !resp.result.hotBillInfo ) {
        this._getBillResponse();
        return;
      }
      // this._svcAttrCd = this.$container.find('.info-type').attr('data-type');
      // this._svcNum = this.$container.find('.info-type').attr('data-num');
      var billData = resp.result.hotBillInfo[0];
      if ( this._billInfoAvailable ) {
        this.$amount.text(billData.totOpenBal2);
        this.$period.text(this.$period.text() + resp.result.term);
        var fieldInfo = {
          lcl: 'billItmLclNm',
          scl: 'billItmSclNm',
          name: 'billItmNm',
          value: 'invAmt2'
        };
        var group = Tw.MyTFareHotBill.arrayToGroup(billData.record1, fieldInfo);
        if ( group[Tw.HOTBILL_UNPAID_TITLE] ) {
          this.$unpaid.show();
          this.$unpaidAmount.text(group[Tw.HOTBILL_UNPAID_TITLE].total);
          delete group[Tw.HOTBILL_UNPAID_TITLE];
        }
        this._renderBillGroup(group);
      }
    } else {
      if ( resp.code === Tw.MyTFareHotBill.CODE.ERROR.NO_BILL_REQUEST_EXIST ) {
        //Hotbill 요청 내역 존재하지 않는 애러일 경우 재요청한다
        this._sendBillRequest();
        return;
      }
      this._onErrorReceivedBillData(resp);
    }
    skt_landing.action.loading.off({ ta: '.loading' });
  },

  _renderBillGroup: function (group) {
    var source = $('#tmplBillGroup').html();
    var template = Handlebars.compile(source);
    var output = template({ billItems: group });
    this.$billMenu.empty();
    this.$billMenu.append(output);
    skt_landing.widgets.widget_accordion();
  },

  _onErrorReceivedBillData: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
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

    if ( !group[groupL][groupS] ) {
      if ( groupS.indexOf('*') > -1 ) {
        groupS = groupS.replace(/\*/g, '');
        noVAT = true;
      } else if ( groupS.indexOf('#') > -1 ) {
        groupS = groupS.replace(/#/g, '');
        is3rdParty = true;
      }
      group[groupL][groupS] = { items: [], total: 0, noVAT: noVAT, is3rdParty: is3rdParty };
    }

    amount = Tw.StringHelper.parseCommaedStringToInt(item[fieldInfo.value]);
    group[groupL].total += amount;
    group[groupL][groupS].total += amount;

    var bill_item = {
      name: item[fieldInfo.name].replace(/[*#]/g, ''),
      amount: Tw.StringHelper.commaSeparatedString(item[fieldInfo.value]),
      noVAT: item[fieldInfo.name].indexOf('*') > -1 ? true : false,
      is3rdParty: item[fieldInfo.name].indexOf('#') > -1 ? true : false,
      discount: amount < 0 ? true : false
    };
    group[groupL][groupS].items.push($.extend({}, bill_item));
    bill_item.amount = item[fieldInfo.value];
  });

  //아이템 이름과 소분류가 같은 경우 2depth 보여주지 않음
  $.each(group, function (key1, itemL) {
    $.each(itemL, function (key2, itemS) {
      // if ( self.NO_BILL_FIELDS.indexOf(key2) < 0 ) {
      if ( groupInfoFields.indexOf(key2) < 0 ) {
        if ( itemS.items.length === 1 && itemS.items[0].name === key2 ) {
          delete itemS.items[0];
        }
        itemS.discount = itemS.total < 0 ? true : false;
        itemS.total = Tw.StringHelper.commaSeparatedString(itemS.total);
      }
      itemL.discount = itemL.total < 0 ? true : false;
      itemL.total = Tw.StringHelper.commaSeparatedString(itemL.total);
    });
  });
  return group;
};