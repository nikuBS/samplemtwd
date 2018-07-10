/**
 * FileName: myt.bill.hotbill.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018.07.02
 */
Tw.MyTBillHotBill = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._history.init();
  this._cachedElement();
  this._bindEvent();
  /*jshint quotmark: double */
  this.record = [
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "월정액",
      "bill_itm_nm": "월정액",
      "bill_itm_cd": "AA1",
      "inv_amt1": "0",
      "inv_amt2": "31,495"
    },
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "옵션요금제",
      "bill_itm_nm": "안심옵션 프리미엄",
      "bill_itm_cd": "DUV",
      "inv_amt1": "0",
      "inv_amt2": "7,200"
    },
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "옵션요금제",
      "bill_itm_nm": "안심옵션 프리미엄2#",
      "bill_itm_cd": "DUV",
      "inv_amt1": "0",
      "inv_amt2": "2,200"
    },
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "국내통화료",
      "bill_itm_nm": "음성통화료",
      "bill_itm_cd": "AA2",
      "inv_amt1": "0",
      "inv_amt2": "33,200"
    },
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "문자이용료",
      "bill_itm_nm": "안심문자",
      "bill_itm_cd": "ASC",
      "inv_amt1": "0",
      "inv_amt2": "810"
    },
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "요금할인",
      "bill_itm_nm": "무약정플랜 포인트할인",
      "bill_itm_cd": "ED9",
      "inv_amt1": "0",
      "inv_amt2": "-1"
    },
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "요금할인",
      "bill_itm_nm": "레인보우포인트결제",
      "bill_itm_cd": "A5P",
      "inv_amt1": "0",
      "inv_amt2": "-53"
    },
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "부가가치세(세금)*",
      "bill_itm_nm": "부가세총액*",
      "bill_itm_cd": "A15",
      "inv_amt1": "0",
      "inv_amt2": "7,720"
    },
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "부가가치세(세금)*",
      "bill_itm_nm": "레인보우p 할인부가세*",
      "bill_itm_cd": "EDA",
      "inv_amt1": "0",
      "inv_amt2": "-5"
    },
    {
      "bill_itm_lcl_nm": "통신서비스요금",
      "bill_itm_scl_nm": "부가가치세(세금)*",
      "bill_itm_nm": "T렌탈대여요금부가세*",
      "bill_itm_cd": "DV9",
      "inv_amt1": "0",
      "inv_amt2": "3,290"
    },
    {
      "bill_itm_lcl_nm": "부가사용금액",
      "bill_itm_scl_nm": "부가서비스이용료",
      "bill_itm_nm": "oksusu 프리",
      "bill_itm_cd": "ECF",
      "inv_amt1": "0",
      "inv_amt2": "4,500"
    },
    {
      "bill_itm_lcl_nm": "부가사용금액",
      "bill_itm_scl_nm": "T렌탈이용금액",
      "bill_itm_nm": "T렌탈대여요금",
      "bill_itm_cd": "DQS",
      "inv_amt1": "0",
      "inv_amt2": "32,900"
    },
    {
      "bill_itm_lcl_nm": "단말기할부금",
      "bill_itm_scl_nm": "분할상환금",
      "bill_itm_nm": "단말기분할상환금*",
      "bill_itm_cd": "C44",
      "inv_amt1": "0",
      "inv_amt2": "9,700"
    },
    {
      "bill_itm_lcl_nm": "단말기할부금",
      "bill_itm_scl_nm": "분할상환금",
      "bill_itm_nm": "단말분할상환수수료*",
      "bill_itm_cd": "C46",
      "inv_amt1": "0",
      "inv_amt2": "940"
    }
  ];
  /*jshint quotmark: single */
  Handlebars.registerHelper('isBill', function (val, options) {
    return (val !== 'total' && val !== 'noVAT'&& val !== 'is3rdParty') ? options.fn(this) : options.inverse(this);
  });
  this._makeBillGroup();
  this._renderBillGroup();
};

Tw.MyTBillHotBill.prototype = {
  _cachedElement: function () {
    this.$billMenu = this.$container.find('#billAccordion');
  },

  _bindEvent: function () {
    this.$container.on('click', '.use-family', $.proxy(this._openFamilyMemberSelect, this));
    this.$container.on('click', '#previousBill', $.proxy(this._showPreviousBill, this));
  },

  _makeBillGroup: function () {
    var self = this;
    var amount = 0;
    var noVAT = false;
    var is3rdParty = false;

    this._group = {};
    this._groupPrev = {};
    this.record.forEach(function (item) {
      noVAT = false;
      is3rdParty = false;
      var groupL = item.bill_itm_lcl_nm;
      var groupS = item.bill_itm_scl_nm;

      if ( !self._group[groupL] ) {
        self._group[groupL] = { total: 0 };
        self._groupPrev[groupL] = { total: 0 };
      }

      if ( !self._group[groupL][groupS] ) {
        if ( groupS.indexOf('*') > -1 ) {
          groupS = groupS.replace(/\*/g, '');
          noVAT = true;
        } else if ( groupS.indexOf('#') > -1 ) {
          groupS = groupS.replace(/#/g, '');
          is3rdParty = true;
        }
        self._group[groupL][groupS] = { items: [], total: 0, noVAT: noVAT, is3rdParty: is3rdParty };
        self._groupPrev[groupL][groupS] = { items: [], total: 0, noVAT: noVAT, is3rdParty: is3rdParty };
      }

      amount = parseInt(item.inv_amt2.replace(/,/g, ''), 10);
      self._group[groupL].total += amount;
      self._group[groupL][groupS].total += amount;

      amount = parseInt(item.inv_amt1.replace(/,/g, ''), 10);
      self._groupPrev[groupL].total += amount;
      self._groupPrev[groupL][groupS].total += amount;

      //아이템 이름과  소분류가 같은 경우 2depth 보여주지 않음
      if ( groupS !== item.bill_itm_nm ) {
        var bill_item = {
          name: item.bill_itm_nm.replace(/[*#]/g, ''),
          amount: item.inv_amt2,
          noVAT: item.bill_itm_nm.indexOf('*') > -1 ? true : false,
          is3rdParty: item.bill_itm_nm.indexOf('#') > -1 ? true : false
        };

        self._group[groupL][groupS].items.push($.extend({}, bill_item));

        bill_item.amount = item.inv_amt1;
        self._groupPrev[groupL][groupS].items.push(bill_item);
      }

    });
  },

  _renderBillGroup: function () {
    var source = $('#tmplBillGroup').html();
    var template = Handlebars.compile(source);
    var output = template({ billItems: this._group });
    this.$billMenu.append(output);
    // skt_landing.action.loading.off({ta:'.load-area'});
  },

  _openFamilyMemberSelect: function () {
    event.preventDefault();
    //TODO popup open 시 list-tag 설정 가능하도록
    var members = [
      { 'attr': 'href="/myt/bill/hotbill/child"', text: '010-12**-81**(GALAXY S7 32G) 1' },
      { 'attr': 'href="/bill/hotbill/child"', text: '010-12**-81**(GALAXY S7 32G) 234' },
      { 'attr': 'href="/bill/hotbill/child"', text: '010-12**-81**(GALAXY S7 32G) 5' },
      { 'attr': 'href="/bill/hotbill/child"', text: '010-12**-81**(GALAXY S7 32G) 67' },
      { 'attr': 'href="/bill/hotbill/child"', text: '010-12**-81**(GALAXY S7 32G) 89010' }
    ];
    this._popupService.openChoice('자녀 선택', members, 'type1');
  },

  _showPreviousBill: function(){
    event.preventDefault();
  }
};