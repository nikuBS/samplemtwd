/**
 * FileName: myt.bill.hotbill.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018.07.02
 */
Tw.MyTBillHotBill = function (rootEl) {
  this.SVC_TYPE = { MOBILE: 'M1', TPOCKET: 'M3' };

  this._children = null;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._history.init();
  this._cachedElement();
  this._bindEvent();
  this._billInfoAvailable = this.$amount.length > 0; //서버날짜로 일 별 노출조건 세팅해서 내려옴
  if ( this._billInfoAvailable ) {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
    this._resTimerID = setTimeout(this._getBillResponse(), 500);
    Handlebars.registerHelper('isBill', function (val, options) {
      return (Tw.MyTBillHotBill.NO_BILL_FIELDS.indexOf(val) < 0 ) ? options.fn(this) : options.inverse(this);
    });
  } else {
    //PocketFi 1일에 요금조회 불가 & 7일까지만 전월요금 조회 가능
    //따라서 _billInfoAvailable 에선 무조건 show 조건 충족
    this.$btPreviousBill.show();
  }
};

Tw.MyTBillHotBill.prototype = {
  _cachedElement: function () {
    this.$billMenu = this.$container.find('#billAccordion');
    this.$amount = this.$container.find('.payment-all em');
    this.$period = this.$container.find('.payment-all > .term');
    this.$memberInfo = this.$container.find('.use-family');
    this.$numOfMembers = this.$memberInfo.find('[title] strong');
    this.$btPreviousBill = this.$container.find('#previousBill');
  },

  _bindEvent: function () {
    this.$container.on('click', '.use-family', $.proxy(this._showChildrenChoice, this));
    this.$container.on('click', '#previousBill', $.proxy(this._showPreviousBill, this));
  },

  _getBillResponse: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, { gubun: 'G' })
      .done($.proxy(this._onReceivedBillData, this))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },

  _onReceivedBillData: function (resp) {
    if ( this._resTimerID ) {
      clearTimeout(this._resTimerID);
    }

    if ( resp.result && resp.result.isSuccess === 'Y' ) {
      this._svcAttrCd = this.$container.find('.info-type').attr('data-type');
      var billData = resp.result.hotBillInfo;
      //자녀 회선 메뉴는 매월 1일과 자녀회선 없을 시 비노출
      //TODO 오늘 날짜 가져오는 방법 공통 로직 여부 논의 필요
      if ( resp.result.isChildAvailableYN === 'Y' ) {
        this._children = resp.result.retChildList;
      }

      var day = parseInt(resp.result.stdDateHan.match(/(\d+)\uC77C/i)[1], 10);
      if ( day > 1 && this._children && this._svcAttrCd !== this.SVC_TYPE.TPOCKET ) {
        this.$memberInfo.show();
        //TODO 자녀수
        this.$numOfMembers.text(this._children.length);
      }

      Tw.Logger.info('Day: ' + day + ' CODE:' + this._svcAttrCd);
      if ( this._svcAttrCd === this.SVC_TYPE.MOBILE ) {
        //핸드폰: 9일부터 전월요금보기 보이기
        if ( day >= 9 ) {
          this.$btPreviousBill.show();
        }
      } else if ( this._svcAttrCd === this.SVC_TYPE.TPOCKET ) {
        //PocketFi: 7일까지 전월요금보기 보이기
        if ( day <= 7 ) {
          this.$btPreviousBill.show();
        }
      } else {
        this.$btPreviousBill.show();
      }

      if ( this._billInfoAvailable ) {
        this.$amount.text(billData.tot_open_bal2);
        //yyyy년mm월dd일 -> yyyy.mm.dd
        var strPeriod = resp.result.termOfHotBill
          .replace(/[\uB144\uC6D4]/gi, '.')
          .replace(/[\uC77C:&nbsp;:]/gi, '')
          .replace('~', ' ~ ');
        this.$period.text(strPeriod);
        var group = Tw.MyTBillHotBill.arrayToGroup(billData.record1, 'inv_amt2', Tw.MyTBillHotBill.NO_BILL_FIELDS);
        this._renderBillGroup(group);
      }
    } else {
      this._onErrorReceivedBillData();
    }
    skt_landing.action.loading.off({ ta: '.container' });
  },

  _onErrorReceivedBillData: function () {
    //TODO error alert 공통모듈
    this._popupService.openAlert(Tw.MSG_MYT.HOTBILL_FAIL_REQUEST, Tw.MSG_MYT.HOTBILL_FAIL_REQUEST_TITLE, function () {
      location.href = '/myt';
    });
  },

  /**
   * renders an accordion menu with a bill data grouped by attributes
   * @param   bill data object
   * @returns null
   */
  _renderBillGroup: function (group) {
    var source = $('#tmplBillGroup').html();
    var template = Handlebars.compile(source);
    var output = template({ billItems: group });
    this.$billMenu.append(output);
    skt_landing.widgets.widget_accordion2();
  },

  _showChildrenChoice: function (e) {
    e.preventDefault();
    var members = [];
    var item = null;
    //자녀가 없을 경유 메뉴 접근 불가
    if ( this._children.length === 1 ) {
      location.href = '/myt/bill/hotbill/child?svcMgmtNum=' + this._children[0].svcMgmtNum;
    } else {
      this._children.forEach(function (member) {
        item = {
          attr: 'id=' + member.svcMgmtNum,
          text: member.svcNum + (member.childEqpMdNm ? '(' + member.childEqpMdNm + ')' : '')
        };
        members.push(item);
      });
      this._popupService.openChoice(Tw.MSG_MYT.HOTBILL_MEMBER_POPUP_TITLE, members, 'type1', $.proxy(this._onOpenChildrenChoice, this));
    }
  },

  _onOpenChildrenChoice: function ($popup) {
    $popup.one('click', '.popup-choice-list button', $.proxy(this._onClickChildButton, this));
  },

  _onClickChildButton: function (e) {
    location.href = '/myt/bill/hotbill/child?svcMgmtNum=' + e.target.id;
  },

  _showPreviousBill: function () {
    event.preventDefault();
  }
};


Tw.MyTBillHotBill.NO_BILL_FIELDS = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];
/**
 * converts an array of objects to object grouped by multiple attributes
 * @param data :  object array
 * @param fieldAmout inv_amt2: 당월 , inv_amt1: 전월, etc.
 *
 * @returns grouped object
 */
Tw.MyTBillHotBill.arrayToGroup = function(data, fieldAmount){
  // var self = this;
  var amount = 0;
  var noVAT = false;
  var is3rdParty = false;
  var group = {};
  var DEFAULT_DESC_VISIBILITY = true;
  var groupInfoFields = Tw.MyTBillHotBill.NO_BILL_FIELDS;

  data.forEach(function (item) {
    noVAT = false;
    is3rdParty = false;
    var groupL = item.bill_itm_lcl_nm;
    var groupS = item.bill_itm_scl_nm;

    if ( !group[groupL] ) {
      group[groupL] = { total: 0, showDesc: DEFAULT_DESC_VISIBILITY };
      if ( groupL === '미납요금' ) {
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

    amount = parseInt(item[fieldAmount].replace(/,/g, ''), 10);
    group[groupL].total += amount;
    group[groupL][groupS].total += amount;

    var bill_item = {
      name: item.bill_itm_nm.replace(/[*#]/g, ''),
      amount: item[fieldAmount].replace(/(\d)(?=(\d{3})+$)/gi, '$1,'),
      noVAT: item.bill_itm_nm.indexOf('*') > -1 ? true : false,
      is3rdParty: item.bill_itm_nm.indexOf('#') > -1 ? true : false,
      discount: amount < 0 ? true : false
    };
    group[groupL][groupS].items.push($.extend({}, bill_item));
    bill_item.amount = item[fieldAmount];
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
        itemS.total = itemS.total.toString().replace(/(\d)(?=(\d{3})+$)/gi, '$1,');
      }
      itemL.discount = itemL.total < 0 ? true : false;
      itemL.total = itemL.total.toString().replace(/(\d)(?=(\d{3})+$)/gi, '$1,');
    });
  });
  return group;
};