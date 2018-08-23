/**
 * FileName: myt.benefit.recommend.detail-refill.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.08.21
 * Info:
 */
Tw.MytBenefitRecommendDetailRefill = function (rootEl, resData) {
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

  this._init();
};

Tw.MytBenefitRecommendDetailRefill.prototype = {
  _init: function () {
    Tw.Logger.info('[Client Init]');
    Tw.Logger.info('[resData.reqQuery]', this.resData.reqQuery);

    if (this.resData.reqQuery.type === 'A') {
      this._getDetailList();

    } else {

    }


  },
  _cachedElement: function () {
    this.$refillCpArea = $('[data-target="refillCpArea"]');
    this.$LtsCpArea = $('[data-target="LtsCpArea"]');
  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="addBtn"]', $.proxy(this._addView, this));

  },
  _proData: function() {
    var refillObj = _.groupBy( this.bffListData, function(item) {
      if (item.copnOperStCd === 'A10') {
        return 'A10';
      } else if( item.copnOperStCd === 'A20' || item.copnOperStCd === 'A14' ) {
        return 'A20';
      }

    });
    this.proDataObj = refillObj;
    Tw.Logger.info('[_proData]', this.proDataObj);
  },
  _ctrlInit: function() {

    // var totCpLen = this.bffListData.length;
    // this._cachedElement();
    // this.$refillCpArea.html('리필 쿠폰 : 총 ' + totCpLen + '매');

    if ( !Tw.FormatHelper.isEmpty(this.proDataObj.A10)) {
      Tw.Logger.info('[_ctrlInit isEmpty A10]');
      var cpLenA10 = this.proDataObj.A10.length;
      this._cachedElement();
      this.$LtsCpArea.html('장기가입 쿠폰 : ' + cpLenA10 + '매');
    }

    if ( !Tw.FormatHelper.isEmpty(this.proDataObj.A20)) {
      Tw.Logger.info('[_ctrlInit isEmpty A20]');
      var cpLenA20 = this.proDataObj.A20.length;
      this._cachedElement();
      this.$LtsCpArea.html('리필 쿠폰 : ' + cpLenA20 + '매');
    }

  },
  //--------------------------------------------------------------------------[service]

  //--------------------------------------------------------------------------[api]
  _getDetailList: function() {
    this._apiService.request(Tw.API_CMD.BFF_06_0001)
      .done($.proxy(function(resp){

        if ( resp.code === Tw.API_CODE.CODE_00 ) {
          Tw.Logger.info('[BFF_06_0001]', resp);
          this.bffListData = resp.result;

          this._proData();
          this._ctrlInit();

        } else {
          Tw.Error(resp.code, resp.msg).pop();
          // this._popupService.openAlert(resp.msg, resp.code);
        }

      }, this))
      .fail(function(err){
        Tw.Logger.info('[err]', err);
        Tw.Error(err.code, err.msg).pop();
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
