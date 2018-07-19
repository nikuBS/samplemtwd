/**
 * FileName: myt.bill.hotbill.child.js
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

  var childSvcMgmtNum = Tw.UrlHelper.getQueryParams().childSvcMgmtNum;
  this._startGetBillResponseTimer(Tw.MyTBillHotBill.PARAM.TYPE.CURRENT, childSvcMgmtNum);
  Handlebars.registerHelper('isBill', function (val, options) {
    return (Tw.MyTBillHotBill.NO_BILL_FIELDS.indexOf(val) < 0 ) ? options.fn(this) : options.inverse(this);
  });
};

Tw.MyTBillHotBillChild.prototype = {
  _cachedElement: function () {
    this.$billMenu = this.$container.find('#childBillAccordion');
    this.$amount = this.$container.find('.payment-all em');
    this.$period = this.$container.find('.payment-all > .term');
    this.$childSelect = this.$container.find('.bt-dropdown');
    this.$deviceInfo = this.$container.find('.device-info');
    this.$svcNum = this.$container.find('.svc-num');
    this.$btPreviousBill = this.$container.find('#previousBill');
  },

  _bindEvent: function () {
    if ( this.$childSelect ) {
      var strItems = this.$container.find('[data-items]').attr('data-items');
      this._children = JSON.parse(strItems);
      _.forEach(this._children, function (child) {
        child.svcNum = child.svcNum.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2**-$4**');
      });
    }
    this.$childSelect.on('click', $.proxy(this._showChildrenChoice, this));
    this.$btPreviousBill.on('click', $.proxy(this._showPreviousBill, this));
  },

  _getBillResponse: function (gubun, childNum) {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, {
        gubun: gubun || Tw.MyTBillHotBill.PARAM.TYPE.CURRENT,
        childSvcMgmtNum: childNum
      })
      .done($.proxy(this._onReceivedBillData, this, gubun, childNum))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },

  _sendBillRequest: function (gubun, childnum) {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0035, {
        gubun: gubun || Tw.MyTBillHotBill.PARAM.TYPE.CURRENT,
        childSvcMgmtNum: childnum
      })
      .done($.proxy(this._startGetBillResponseTimer, this, gubun, childnum))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },

  _startGetBillResponseTimer: function (gubum, num) {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
    this._resTimerID = setTimeout(this._getBillResponse(gubum, num), 500);
  },

  _onReceivedBillData: function (gubun, childNum, resp) {
    if ( this._resTimerID ) {
      clearTimeout(this._resTimerID);
      this._resTimerID = null;
    }

    if ( resp.result && resp.result.isSuccess === 'Y' ) {
      if ( resp.result.gubun === Tw.MyTBillHotBill.PARAM.TYPE.PREVIOUS ) {
        var type = this._svcAttrCd === this.SVC_TYPE.MOBILE ? '휴대폰' : 'T Pocket-Fi';
        //전월요금 없음
        if ( resp.result.bf_mth_yn === 'Y' && resp.result.hotBillInfo.tot_open_bal1 === '0' && resp.result.hotBillInfo.tot_dedt_bal1 === '0' ) {
          this._popupService.open({
            hbs: 'MY_03_01_01_L03_case',
            data: { svcNum: this._svcNum, svcType: type }
          });
        } else {
          Tw.MyTBillHotBill.openPrevBillPopup(resp, this._svcNum, type);
        }
      } else {
        var billData = resp.result.hotBillInfo;
        var day = parseInt(resp.result.stdDateHan.match(/(\d+)\uC77C/i)[1], 10);
        this._childSvcNum = resp.result.svcMgmtNum;
        var target = _.find(this._children, { svcMgmtNum: this._childSvcNum });
        this.$deviceInfo.text(target.childEqpMdNm);
        this.$svcNum.text(target.svcNum);
        //자녀 핸드폰: 7일까지 전월요금보기 보이기
        if ( day <= 7 ) {
          this.$btPreviousBill.show();
        }

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
      if ( resp.code === Tw.MyTBillHotBill.CODE.ERROR.NO_BILL_REQUEST_EXIST ) {
        //Hotbill 요청 내역 존재하지 않는 애러일 경우 재요청한다
        this._sendBillRequest(gubun, childNum);
        return;
      }
      this._onErrorReceivedBillData();
    }
    skt_landing.action.loading.off({ ta: '.container' });
  },

  _renderBillGroup: function (group) {
    var source = $('#tmplBillGroup').html();
    var template = Handlebars.compile(source);
    var output = template({ billItems: group });
    this.$billMenu.empty();
    this.$billMenu.append(output);
    skt_landing.widgets.widget_accordion2();
  },

  _showChildrenChoice: function () {
    var members = [];
    var item = null;
    this._children.forEach(function (member) {
      item = {
        attr: 'id=' + member.svcMgmtNum,
        text: member.svcNum + (member.childEqpMdNm ? '(' + member.childEqpMdNm + ')' : '')
      };
      members.push(item);
    });
    this._popupService.openChoice(Tw.MSG_MYT.HOTBILL_MEMBER_POPUP_TITLE, members, 'type1', $.proxy(this._onOpenChildrenChoice, this));
  },

  _showPreviousBill: function () {
    event.preventDefault();
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
    this._apiService
      .request(Tw.API_CMD.BFF_05_0035, {
        gubun: Tw.MyTBillHotBill.PARAM.TYPE.PREVIOUS,
        childSvcMgmtNum: this._childSvcNum
      })
      .done(function () {
        this._startGetBillResponseTimer(Tw.MyTBillHotBill.PARAM.TYPE.PREVIOUS, this._childSvcNum);
      })
      .fail($.proxy(this._onErrorReceivedBillData, this));

  },

  _onOpenChildrenChoice: function ($popup) {
    $popup.one('click', '.popup-choice-list button', $.proxy(this._onClickChildButton, this));
  },

  _onClickChildButton: function (e) {
    this._sendBillRequest(Tw.MyTBillHotBill.PARAM.TYPE.CURRENT, e.target.id);
    Tw.Popup.close();
  },

  _onErrorReceivedBillData: function (e) {
    Tw.Logger.error('[Myt > Bill > HotBill]');
    Tw.Logger.error(e);
    //TODO error alert 공통모듈
    this._popupService.openAlert(Tw.MSG_MYT.HOTBILL_FAIL_REQUEST, Tw.MSG_MYT.HOTBILL_FAIL_REQUEST_TITLE, function () {
      location.href = '/myt';
    });
  }
};