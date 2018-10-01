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

  /*this._cachedElement();
  this._bindEvent();
  this._sendBillRequest();
  this._billInfoAvailable = this.$amount.length > 0; //서버날짜로 일 별 노출조건 세팅해서 내려옴
  if ( this._billInfoAvailable ) {
    this._startGetBillResponseTimer(Tw.MyTFareHotBill.PARAM.TYPE.CURRENT);
    Handlebars.registerHelper('isBill', function (val, options) {
      return (Tw.MyTFareBillHotBill.NO_BILL_FIELDS.indexOf(val) < 0 ) ? options.fn(this) : options.inverse(this);
    });
  }*/
};

Tw.MyTFareHotBill.prototype = {
  _cachedElement: function () {
    this.$billMenu = this.$container.find('#fe-billAccordion');
    this.$amount = this.$container.find('.payment-all em');
    this.$period = this.$container.find('.payment-all > .term');
    this.$memberInfo = this.$container.find('.use-family');
    this.$memberTitle = this.$memberInfo.find('[title]');
    this.$numOfMembers = this.$memberInfo.find('[title] strong');
    this.$btPreviousBill = this.$container.find('#fe-previousBill');
  },

  _bindEvent: function () {
    this.$container.on('click', '.use-family', $.proxy(this._showChildrenChoice, this));
    this.$container.on('click', '#fe-previousBill', $.proxy(this._showPreviousBill, this));
  },

  _getBillResponse: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, { count: this._requestCount++ })
      .done($.proxy(this._onReceivedBillData, this))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },

  _sendBillRequest: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, {
        count: 0
      })
      .done($.proxy(this._startGetBillResponseTimer, this))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },

  _startGetBillResponseTimer: function () {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
    this._requestCount = 1;
    this._resTimerID = setTimeout($.proxy(this._getBillResponse, this), 2500);
  },

  _onReceivedBillData: function (resp) {
    if ( !_.isEmpty(resp.result) ) {
      if ( this._resTimerID ) {
        clearTimeout(this._resTimerID);
        this._resTimerID = null;
      }
    }

    if ( resp.result && resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.gubun && resp.result.gubun === Tw.MyTFareBillHotBill.PARAM.TYPE.PREVIOUS ) {
        var type = (this._svcAttrCd === this.SVC_TYPE.MOBILE) ? '휴대폰' : 'T Pocket-Fi';
        //전월요금 없음
        if ( resp.result.bf_mth_yn === 'Y' && resp.result.hotBillInfo.tot_open_bal1 === '0' && resp.result.hotBillInfo.tot_dedt_bal1 === '0' ) {
          this._popupService.open({
            hbs: 'MY_03_01_01_L03_case',
            data: { svcNum: this._svcNum, svcType: type }
          });
        } else {
          Tw.MyTFareBillHotBill.openPrevBillPopup(resp, this._svcNum, type);
        }
      } else {
        this._svcAttrCd = this.$container.find('.info-type').attr('data-type');
        this._svcNum = this.$container.find('.info-type').attr('data-num');
        var billData = resp.result.hotBillInfo[0];
        //자녀 회선 메뉴는 매월 1일과 자녀회선 없을 시 비노출
        //TODO 오늘 날짜 가져오는 방법 공통 로직 여부 논의 필요
        if ( resp.result.isChildAvailableYN === 'Y' ) {
          this._children = resp.result.retChildList;
        }

        /*       var day = parseInt(resp.result.stdDateHan.match(/(\d+)\uC77C/i)[1], 10);
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
               }*/

        if ( this._billInfoAvailable ) {
          this.$amount.text(billData.tot_open_bal2);
          // var strPeriod = Tw.MyTBillHotBill.getFormattedPeriod(resp.result.termOfHotBill);

          this.$period.text(resp.result.term);
          var fieldInfo = {
            lcl: 'billItmLclNm',
            scl: 'billItmSclNm',
            name: 'billItmNm',
            value: 'invAmt2'
          };
          var group = Tw.MyTFareBillHotBill.arrayToGroup(billData.record1, fieldInfo);
          this._renderBillGroup(group);
        }
      }
    } else {
      if ( resp.code === Tw.MyTFareBillHotBill.CODE.ERROR.NO_BILL_REQUEST_EXIST ) {
        //Hotbill 요청 내역 존재하지 않는 애러일 경우 재요청한다
        this._sendBillRequest();
        return;
      }
      this._onErrorReceivedBillData(resp);
    }
    skt_landing.action.loading.off({ ta: '.container' });
  },

  _onErrorReceivedBillData: function (resp) {
    /* Tw.Logger.error('[Myt > Bill > HotBill]');
     Tw.Logger.error(e);

     //TODO error alert 공통모듈
     this._popupService.openAlert(Tw.MSG_MYT.HOTBILL_FAIL_REQUEST, Tw.MSG_MYT.HOTBILL_FAIL_REQUEST_TITLE, function () {
       location.href = '/myt';
     });*/

    Tw.Error(resp.code, resp.msg).pop();
  }
};

