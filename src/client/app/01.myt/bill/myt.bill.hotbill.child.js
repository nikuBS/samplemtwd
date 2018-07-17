/**
 * FileName: myt.bill.hotbill.child.js.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 7. 9.
 */
Tw.MyTBillHotBillChild = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._history.init();
  this._cachedElement();
  this._bindEvent();

  skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
  this.childSvcMgmtNum = Tw.UrlHelper.getQueryParams().childSvcMgmtNum;
  this._resTimerID = setTimeout(this._getBillResponse(Tw.MyTBillHotBill.PARAM.TYPE.CURRENT, this.childSvcMgmtNum), 500);
  Handlebars.registerHelper('isBill', function (val, options) {
    return (Tw.MyTBillHotBill.NO_BILL_FIELDS.indexOf(val) < 0 ) ? options.fn(this) : options.inverse(this);
  });
};

Tw.MyTBillHotBillChild.prototype = {
  _cachedElement: function () {
    this.$billMenu = this.$container.find('#childBillAccordion');
    this.$amount = this.$container.find('.payment-all em');
    this.$period = this.$container.find('.payment-all > .term');
  },

  _bindEvent: function () {
    this.$container.on('click', '.use-family', $.proxy(this._openFamilyMemberSelect, this));
  },

  _getBillResponse: function (gubun, childNum) {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, {
        gubun: gubun || this.PARAM.TYPE.CURRENT,
        childSvcMgmtNum: childNum
      })
      .done($.proxy(this._onReceivedBillData, this))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },

  _onReceivedBillData: function (resp) {
    if ( this._resTimerID ) {
      clearTimeout(this._resTimerID);
      this._resTimerID = null;
    }

    if ( resp.result && resp.result.isSuccess === 'Y' ) {
      if ( resp.result.gubun === Tw.MyTBillHotBill.PARAM.TYPE.PREVIOUS ) {
        // var type = this._svcAttrCd === this.SVC_TYPE.MOBILE ? '휴대폰' : 'T Pocket-Fi';
        Tw.MyTBillHotBill.openPrevBillPopup(resp, this._svcNum, 'M1');
      } else {
        this._svcAttrCd = this.$container.find('.info-type').attr('data-type');
        this._svcNum = this.$container.find('.info-type').attr('data-num');
        var billData = resp.result.hotBillInfo;
        //TODO 자녀 회선 select widget

        this.$amount.text(billData.tot_open_bal2);
        var strPeriod = Tw.MyTBillHotBill.getFormattedPeriod(resp.result.termOfHotBill);
        this.$period.text(strPeriod);
        var fieldInfo = {
          lcl: 'bill_itm_lcl_nm',
          scl: 'bill_itm_scl_nm',
          name: 'bill_itm_nm',
          value: 'inv_amt2'
        };
        var group = Tw.MyTBillHotBill.arrayToGroup(billData.record1, fieldInfo);
        this._renderBillGroup(group);
      }
    } else {
      this._onErrorReceivedBillData();
    }
    skt_landing.action.loading.off({ ta: '.container' });
  },

  _renderBillGroup: function (group) {
    var source = $('#tmplBillGroup').html();
    var template = Handlebars.compile(source);
    var output = template({ billItems: group });
    this.$billMenu.append(output);
    skt_landing.widgets.widget_accordion2();
  }
};