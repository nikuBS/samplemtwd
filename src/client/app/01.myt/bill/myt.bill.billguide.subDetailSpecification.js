/**
 * FileName: myt.bill.billguide.subDetailSpecification.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.16
 * Info: 통합청구 대표 > 상세요금 내역
 */

Tw.mytBillBillguideSubDetailSpecification = function (rootEl) {
  this.NUM_OF_ITEMS = 2;
  this.init = this._init;
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');
  this._init();
};

Tw.mytBillBillguideSubDetailSpecification.prototype = {
  _init: function () {
    Tw.Logger.info('[Tw.mytBillBillguideSubDetailSpecification 초기화]');
    this.$billMenu = this.$container.find('#billMenu');
    this.$btMoreWrapper = this.$container.find('.bt-more-wrapper');
    this.$btSelectService = this.$container.find('.bt-dropdown');
    this._bindEvent();
    this._getDetailSpecification();
  },
  _bindEvent: function () {
    this.$btMoreWrapper.on('click', 'button', $.proxy(this._onClickMore, this));
    this.$btSelectService.on('click', $.proxy(this._onClickSelectService, this));

  },
  //--------------------------------------------------------------------------[api]
  _getDetailSpecification: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0036, { detailYn: 'Y' })
      .done($.proxy(this._onDetailDataReset, this))
      .fail();
  },

  //--------------------------------------------------------------------------[공통]
  // _onOpenSelectPopup: function () {
  //   //$('.popup-info').addClass('scrolling');
  // },
  // _goHistory: function () {
  //   this._goLoad('/recharge/cookiz/history');
  // },
  // _goBack: function () {
  //   this._history.go(-1);
  // },
  // _goLoad: function (url) {
  //   location.href = url;
  // },
  // _go: function (hash) {
  //   window.location.hash = hash;
  // },
  // _getSelClaimDtBtn: function (str) {
  //   return moment(str).add(1, 'days').format('YYYY년 MM월');
  // },
  _onDetailDataReset: function (resp) {
    var self = this;
    Tw.Logger.info(resp);
    this._svcBillGroups = this._getGrouppedBillData(resp.result);
    this._services = [];
    resp.result.paidAmtMonthSvcNum.forEach(function (svc) {
      var item = {
        attr: 'id=' + svc.svcMgmtNum,
        text: svc.name,
        id: svc.svcMgmtNum
      };
      self._services.push(item);
    });
    this._countLeftItem = this._svcBillGroups.length;
    this._renderBillGroup(this._svcBillGroups.slice(0, this.NUM_OF_ITEMS));
    //총합계
    this.$container.find('[data-id="total"]').text(Tw.StringHelper.commaSeparatedString(this._sumOfSvcs));
    //조회년월
    var date = moment(resp.result.invDt);
    this.$container.find('[data-id="year"]').text(date.format('YYYY'));
    this.$container.find('[data-id="month"]').text(date.format('M'));

  },
  _getGrouppedBillData: function (result) {
    var self = this;
    var svcInfo = result.paidAmtMonthSvcNum;
    var groupBySvc = _.groupBy(result.paidAmtDetailInfo, 'svcMgmtNum');
    var detailGroups = [];
    self._sumOfSvcs = 0;
    $.each(groupBySvc, function (svcMgmtNum, svc) {
      var item = { svcMgmtNum: svcMgmtNum };
      var fieldInfo = {
        lcl: 'billItmLclNm',
        scl: 'billItmSclNm',
        name: 'billItmNm',
        value: 'invAmt'
      };
      item.billItems = Tw.MyTBillHotBill.arrayToGroup(svc, fieldInfo);
      item.svcInfo = _.findWhere(svcInfo, { svcMgmtNum: svcMgmtNum });
      item.svcTotal = _.reduce(item.billItems, function (sum, item) {
        return sum + parseInt(item.total.replace(/,/gi, ''), 10);
      }, 0);
      self._sumOfSvcs += item.svcTotal;
      item.svcTotal = Tw.StringHelper.commaSeparatedString(item.svcTotal);
      item.svcNm = svc[0].svcNm;
      item.svcInfoNm = svc[0].svcInfoNm;
      detailGroups.push(item);
    });
    return detailGroups;
  },

  _renderBillGroup: function (groups, onlyService) {
    Handlebars.registerHelper('isBill', function (val, options) {
      return (Tw.MyTBillHotBill.NO_BILL_FIELDS.indexOf(val) < 0 ) ? options.fn(this) : options.inverse(this);
    });
    var source = $('#tmplSvcBillGroup').html();
    var template = Handlebars.compile(source);
    var output = template({ paidAmtDetailInfo: groups, onlyService: onlyService });
    if ( onlyService ) {
      this.$billMenu.find('>div:not(:last-child)').remove();
      this.$btMoreWrapper.hide();
    } else {
      this._countLeftItem = Math.max(this._countLeftItem - this.NUM_OF_ITEMS, 0);
      if ( this._countLeftItem > 0 ) {
        this.$btMoreWrapper.find('span').text('(' + this._countLeftItem + ')');
        this.$btMoreWrapper.show();
      } else {
        this.$btMoreWrapper.hide();
      }
    }
    $(output).insertBefore(this.$btMoreWrapper);

    skt_landing.widgets.widget_accordion2();
  },

  _onClickMore: function () {
    var idxFrom = this._svcBillGroups.length - this._countLeftItem;
    this._renderBillGroup(this._svcBillGroups.slice(idxFrom, idxFrom + this.NUM_OF_ITEMS));
  },

  _onClickSelectService: function () {
    //TODO 전체보기
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_PRODUCT, this._services, 'type1', $.proxy(this._onOpenSelectPopup, this));
  },

  _onOpenSelectPopup: function ($popup) {
    $popup.on('click', 'button', $.proxy(this._onClickPopupButton, this));
  },

  _onClickPopupButton: function (e) {
    var self = this;
    var service = e.target.id;
    var selectedService = _.find(this._svcBillGroups, { svcMgmtNum: service });
    if ( selectedService.prodName ) {
      this._renderOnlyService(selectedService);
    } else {
      //TODO parameter
      this._apiService
        .request(Tw.API_CMD.BFF_05_0041, { svcMgmtNum: service })
        .done(function (resp) {
          selectedService.prodName = resp.result.prodName;
          self.$btSelectService.text(e.target.textContent);
          self._renderOnlyService(selectedService);
        })
        .fail();
    }
    this._popupService.close();
  },
  _renderOnlyService: function (service) {
    // service.showProdName = true;
    this._renderBillGroup([service], true);
  }
};
