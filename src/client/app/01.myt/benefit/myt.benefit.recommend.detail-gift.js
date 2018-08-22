/**
 * FileName: myt.benefit.recommend.detail-gift.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.08.21
 * Info:
 */
Tw.MytBenefitRecommendDetailGift = function (rootEl, resData) {
  this.thisMain = this;
  this.resData = resData;
  this.init = this._init;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.bffListData = null;
  this.proDataObj = null;
  this.sendTot = null;
  this.receiveTot = null;

  this._init();
};

Tw.MytBenefitRecommendDetailGift.prototype = {
  _init: function () {
    Tw.Logger.info('[Client Init]');
    Tw.Logger.info('[resData.reqQuery]', this.resData.reqQuery);

    if (this.resData.reqQuery.type === 'A') {
      this._getDetailList();

    } else {

    }


  },
  _cachedElement: function () {
    this.$sendTotArea = $('[data-target="sendTotArea"]');
    this.$receiveTotArea = $('[data-target="receiveTotArea"]');
  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="addBtn"]', $.proxy(this._addView, this));

  },
  _proData: function() {
    var refillObj = _.groupBy( this.bffListData, function(item) {
      if (item.giftType === '1') {
        return 'send';
      } else if( item.giftType === '2' ) {
        return 'receive';
      }
    });
    this.proDataObj = refillObj;
    Tw.Logger.info('[_proData]', this.proDataObj);

    var sendTotNum = 0;
    var receiveTotNum = 0;

    if ( !Tw.FormatHelper.isEmpty(this.proDataObj.send)) {
      for (var i=0; i < this.proDataObj.send.length; i++) {
        sendTotNum += Number(this.proDataObj.send[i].dataQty);
      }
    }

    if ( !Tw.FormatHelper.isEmpty(this.proDataObj.receive)) {
      for (var a=0; a < this.proDataObj.receive.length; a++) {
        receiveTotNum += Number(this.proDataObj.send[a].dataQty);
      }
    }
    // Tw.Logger.info('[sendTotNum]', sendTotNum);
    // Tw.Logger.info('[receiveTotNum]', receiveTotNum);
    this.sendTot = Tw.FormatHelper.addComma( String(sendTotNum) );
    this.receiveTot = Tw.FormatHelper.addComma( String(receiveTotNum) );
    // Tw.Logger.info('[sendTot]', this.sendTot);
    // Tw.Logger.info('[receiveTot]', this.receiveTot);

  },
  _ctrlInit: function() {
    this._cachedElement();
    this.$sendTotArea.html('선물하기 : ' + this.sendTot + 'MB');
    this.$receiveTotArea.html('선물받기 : ' + this.receiveTot + 'MB');

  },
  //--------------------------------------------------------------------------[service]

  //--------------------------------------------------------------------------[api]
  _getDetailList: function() {
    // $.ajax('http://localhost:3000/mock/recommend.BFF_05_00018.json')
    //   .done($.proxy(function(resp){
    //     if ( resp.code === Tw.API_CODE.CODE_00 ) {
    //         Tw.Logger.info('[BFF_06_0018]', resp);
    //         this.bffListData = resp.result;
    //         this._proData();
    //         this._ctrlInit();
    //     }
    //   }, this))
    //   .fail(function(err) {
    //     Tw.Logger.info(err);
    //   });

    Tw.Logger.info('[fromDt]', moment().set('date', 1).format('YYYYMMDD'));
    Tw.Logger.info('[toDt]', Tw.DateHelper.getCurrentShortDate());

    // var param = {
    //   fromDt: '20160101',
    //   toDt: '20180801',
    //   giftType: '0'
    // };
    var param = {
      fromDt: moment().set('date', 1).format('YYYYMMDD'),
      toDt: Tw.DateHelper.getCurrentShortDate(),
      giftType: '0'
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0018, param)
      .done($.proxy(function(resp){

        if ( resp.code === Tw.API_CODE.CODE_00 ) {
          Tw.Logger.info('[BFF_06_0018]', resp);
          this.bffListData = resp.result;
          this._proData();
          this._ctrlInit();
        } else {
          this._popupService.openAlert(resp.msg, resp.code);
        }

      }, this))
      .fail(function(err){
        Tw.Logger.info('[err]', err);
        this._popupService.openAlert(err.msg, err.code);
      });
  },
  //--------------------------------------------------------------------------[공통]
  _serverErrPopup: function() {
    if ( this.resData.errBol ) {
      Tw.Logger.info('[_serverErrPopup]');
      this._popupService.openAlert(this.resData.errObj[0].msg, this.resData.errObj[0].code);
    }
  },
  _onOpenSelectPopup: function () {
    //$('.popup-info').addClass('scrolling');
  },
  _goHistory: function () {
    this._goLoad('/recharge/cookiz/history');
  },
  _goBack: function () {
    this._history.go(-1);
  },
  _goLoad: function (url) {
    location.href = url;
  },
  _go: function (hash) {
    window.location.hash = hash;
  },
  _getSelClaimDtBtn: function (str) {
    return moment(str).add(1, 'days').format(Tw.DATE_FORMAT.YYYYDD_TYPE_0);
  },
  _getSelPeriod: function(str) {
    var startDate = moment(str).format('YYYY.MM') + '.01';
    var endDate = moment(str).format('YYYY.MM.DD');
    return startDate + ' ~ ' + endDate;
  }
};
