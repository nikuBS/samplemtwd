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
    this._resTimerID = setTimeout(this._getBillResponse(Tw.MyTBillHotBill.PARAM.TYPE.CURRENT), 500);
    Handlebars.registerHelper('isBill', function (val, options) {
      return (Tw.MyTBillHotBill.NO_BILL_FIELDS.indexOf(val) < 0 ) ? options.fn(this) : options.inverse(this);
    });
  }
};

Tw.MyTBillHotBill.prototype = {
  _cachedElement: function () {
    this.$billMenu = this.$container.find('#billAccordion');
    this.$amount = this.$container.find('.payment-all em');
    this.$period = this.$container.find('.payment-all > .term');
    this.$memberInfo = this.$container.find('.use-family');
    this.$memberTitle = this.$memberInfo.find('[title]');
    this.$numOfMembers = this.$memberInfo.find('[title] strong');
    this.$btPreviousBill = this.$container.find('#previousBill');
  },

  _bindEvent: function () {
    this.$container.on('click', '.use-family', $.proxy(this._showChildrenChoice, this));
    this.$container.on('click', '#previousBill', $.proxy(this._showPreviousBill, this));
  },

  _getBillResponse: function (gubun) {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, { gubun: gubun || Tw.MyTBillHotBill.PARAM.TYPE.CURRENT })
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
        var type = this._svcAttrCd === this.SVC_TYPE.MOBILE ? '휴대폰' : 'T Pocket-Fi';
        Tw.MyTBillHotBill.openPrevBillPopup(resp, this._svcNum, type);
      } else {
        this._svcAttrCd = this.$container.find('.info-type').attr('data-type');
        this._svcNum = this.$container.find('.info-type').attr('data-num');
        var billData = resp.result.hotBillInfo;
        this._preBillAvailable = (billData.bf_mth_yn === 'Y');
        //자녀 회선 메뉴는 매월 1일과 자녀회선 없을 시 비노출
        //TODO 오늘 날짜 가져오는 방법 공통 로직 여부 논의 필요
        if ( resp.result.isChildAvailableYN === 'Y' ) {
          this._children = resp.result.retChildList;
        }

        var day = parseInt(resp.result.stdDateHan.match(/(\d+)\uC77C/i)[1], 10);
        if ( day > 1 && this._children && this._svcAttrCd !== this.SVC_TYPE.TPOCKET ) {
          this.$memberInfo.show();
          if ( this._children.length === 1 ) {
            var contesnts = this.$memberTitle.contents();
            if ( contesnts && contesnts.length > 3 ) {
              contesnts[0].nodeValue = contesnts[0].nodeValue.replace(/\(/, '');
              contesnts[2].nodeValue = '';
            } else {
              Tw.Logger.error('[MyTBillHotBill] Fail to hiding information of the num of children members.');
            }
          } else {
            this.$numOfMembers.text(this._children.length);
          }
        }

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
      location.href = '/myt/bill/hotbill/child?childSvcMgmtNum=' + this._children[0].svcMgmtNum;
    } else {
      this._children.forEach(function (member) {
        item = {
          attr: 'id=' + member.svcMgmtNum,
          text: Tw.FormatHelper.getFormattedPhoneNumber(member.svcNum) + (member.childEqpMdNm ? '(' + member.childEqpMdNm + ')' : '')
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
    location.href = '/myt/bill/hotbill/child?childSvcMgmtNum=' + e.target.id;
  },

  _showPreviousBill: function () {
    event.preventDefault();
    if ( this._preBillAvailable ) {
      var self = this;
      skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
      this._apiService
        .request(Tw.API_CMD.BFF_05_0035, { gubun: Tw.MyTBillHotBill.PARAM.TYPE.PREVIOUS })
        .done(function () {
          self._resTimerID = setTimeout(self._getBillResponse(Tw.MyTBillHotBill.PARAM.TYPE.PREVIOUS), 500);
        })
        .fail($.proxy(this._onErrorReceivedBillData, this));
    } else {
      this._popupService.open({
        hbs: 'MY_03_01_01_L03_case',
        data: { svcNum: this._svcNum, svcType: this._svcAttrCd === this.SVC_TYPE.MOBILE ? '휴대폰' : 'T Pocket-Fi' }
      });
    }
  }
};


Tw.MyTBillHotBill.NO_BILL_FIELDS = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];
Tw.MyTBillHotBill.PARAM = {
  TYPE: {
    CURRENT: 'G',
    PREVIOUS: 'Q'
  }
};
/**
 * converts an array of objects to object grouped by multiple attributes
 * @param data :  object array
 * @param fieldInfo 대분류, 소분류, 이름, 금액을 포함하는 object
 *
 * @returns grouped object
 */
Tw.MyTBillHotBill.arrayToGroup = function (data, fieldInfo) {
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
    var groupL = item[fieldInfo.lcl];
    var groupS = item[fieldInfo.scl];

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

Tw.MyTBillHotBill.openPrevBillPopup = function (resp, num, type) {
  var strPeriod = Tw.MyTBillHotBill.getFormattedPeriod(resp.result.termOfHotBill);
  var billData = resp.result.hotBillInfo;
  var fieldInfo = {
    lcl: 'bill_itm_lcl_nm',
    scl: 'bill_itm_scl_nm',
    name: 'bill_itm_nm',
    value: 'inv_amt1'
  };
  var group = Tw.MyTBillHotBill.arrayToGroup(billData.record1, fieldInfo, Tw.MyTBillHotBill.NO_BILL_FIELDS);

  var data = {
    amount: billData.tot_open_bal1,
    period: strPeriod,
    type: type,
    svcNum: num
  };

  Tw.Popup.open({
    hbs: 'MY_03_01_01_L03',
    data: data,
    billItems: group
  });

};

/**
 * yyyy년mm월dd일 -> yyyy.mm.dd
 * @param strPeriod ex)yyyy년mm월dd일~yyyy년mm월dd일
 * @returns yyyy.mm.dd ~ yyyy.mm.dd
 */
Tw.MyTBillHotBill.getFormattedPeriod = function (strPeriod) {
  return Tw.StringHelper.replaceDateNotaionWithoDot(strPeriod).replace('~', ' ~ ');
};
