/**
 * FileName: myt-data.usage.total-sharing-data.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 10. 08.
 */

Tw.MyTDataUsageTotalSharingData = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;
  this._historyService = new Tw.HistoryService();
  this._options = options;

  this._init();
  this._cachedElement();
  this._bindEvent();
  this._rendered();
};

Tw.MyTDataUsageTotalSharingData.prototype = {
  _ERROR_CODE: {
    T_FAMILY_SHARE_NOT_JOINED: 'BLN0010'
  },
  _DATA_SHARING_PROD_ID: 'NA00003556',
  _dataGiftSum: 0,
  _tFamilySharingErrCode: null,

  _init: function () {
    this._myTDataUsageDataShare = new Tw.MyTDataUsageDataShare($('#fe-data-share'));
    this._hashService.initHashNav($.proxy(this._onHashChange, this));
  },

  _onHashChange: function (hash) {
    if ( hash.raw && hash.raw === 'data-share-popup' ) {
      this._myTDataUsageDataShare.open();
    } else {
      this._myTDataUsageDataShare.close();
    }
  },

  _cachedElement: function () {
    this._$tfamilySharing = this.$container.find('.fe-tfamily-sharing');
    this._$dataSharing = this.$container.find('.fe-data-sharing');
    this._$dataGift = this.$container.find('.fe-data-gift');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-tfamily-sharing button', $.proxy(this._onClickBtnTFamilySharing, this));
    this.$container.on('click', '.fe-data-gift button', $.proxy(this._onClickBtnDataGift, this));
    this.$container.on('click', '.fe-data-sharing button', $.proxy(this._onClickBtnDataSharing, this));
  },

  _rendered: function () {
    this._reqTFamilySharing();
    this._reqDataGifts();
    if ( this._options.dataSharingJoined === 'Y' ) {
      this._reqDataSharing();
    }
  },

  _reqTFamilySharing: function () {
    this._apiService.requestArray([
      { command: Tw.API_CMD.BFF_01_0005 },
      { command: Tw.API_CMD.BFF_06_0044 }
    ]).done($.proxy(this._onDoneTFamilySharing, this))
      .fail($.proxy(this._onFailReq, this));

    // this._onDoneTFamilySharing({
    //   'code': '00',
    //   'msg': 'success',
    //   'result': {
    //     'total': '0',
    //     'used': '20000',
    //     'remained': '0',
    //     'adultYn': 'Y',
    //     'mbrList': [
    //       {
    //         'svcNum': '****',
    //         'svcMgmtNum': '3',
    //         'custNm': '한정남',
    //         'repYn': 'N',
    //         'prodId': '99991231',
    //         'prodNm': '23595920180830103216NA00005958패밀리',
    //         'shrblYn': '',
    //         'shared': '0',
    //         'limitedYn': 'N',
    //         'limitation': ''
    //       },
    //       {
    //         'svcNum': '****',
    //         'svcMgmtNum': '3',
    //         'custNm': '박윤심',
    //         'repYn': 'N',
    //         'prodId': '99991231',
    //         'prodNm': '23595920180830103216NA00005955스몰',
    //         'shrblYn': '',
    //         'shared': '0',
    //         'limitedYn': 'N',
    //         'limitation': ''
    //       },
    //       {
    //         'svcNum': '****',
    //         'svcMgmtNum': '3',
    //         'custNm': '한희진',
    //         'repYn': 'N',
    //         'prodId': '99991231',
    //         'prodNm': '23595920180830103216NA00005627주말엔 팅 세이브',
    //         'shrblYn': '',
    //         'shared': '0',
    //         'limitedYn': 'N',
    //         'limitation': ''
    //       }
    //     ]
    //   }
    // });

    // this._onDoneTFamilySharing({
    //   'traceId': 'a34b10e0012dd7af',
    //   'spanId': 'a34b10e0012dd7af',
    //   'clientDebugMessage': 'a34b10e0012dd7af*',
    //   'msg': '오류 입니다.',
    //   'orgDebugMessage': 'BLN0011',
    //   'hostname': 'bff-spring-mobile-7d89d75d67-zxwrq',
    //   'code': 'BLN0011',
    //   'orgHostname': 'core-balance-deployment-84648b4d5c-kzwjq',
    //   'orgAppName': 'core-balance',
    //   'appName': 'bff-spring-mobile',
    //   'orgSpanId': '31ca5eb98ef897db',
    //   'debugMessage': '200 '
    // });

  },

  _reqDataGifts: function () {
    var today = new Date();
    this._apiService.request(Tw.API_CMD.BFF_06_0018, {
      fromDt: Tw.DateHelper.getShortDateWithFormat(today, 'YYYYMM01'),
      toDt: Tw.DateHelper.getShortDateWithFormat(today, 'YYYYMMDD'),
      type: '1'
    })
      .done($.proxy(this._onDoneDataGifts, this))
      .fail($.proxy(this._onFailReq, this));

    // this._onDoneDataGifts({
    //   'code': '00',
    //   'msg': 'success',
    //   'result': [
    //   ]
    // });

    // this._onDoneDataGifts({
    //   'traceId':'19a84460192be56f',
    //   'spanId':'19a84460192be56f',
    //   'clientDebugMessage':'19a84460192be56f*',
    //   'msg':'요청이 실패했습니다.',
    //   'hostname':'bff-spring-mobile-7d89d75d67-gdvjx',
    //   'code':'BFF0001',
    //   'orgHostname':'bff-spring-mobile-7d89d75d67-gdvjx',
    //   'appName':'bff-spring-mobile',
    //   'cause':'Hystrix circuit short-circuited and is OPEN',
    //   'debugMessage':'GET//core-{msName}/** short-circuited and fallback failed.'
    // });

  },

  _reqDataSharing: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0004)
      .done($.proxy(this._onDoneDataSharing, this))
      .fail($.proxy(this._onFailReq, this));

    // this._onDoneDataSharing({
    //   'code': '00',
    //   'msg': 'success',
    //   'result': {
    //     'data': {
    //       'used': '0'
    //     },
    //     'childList': [
    //       {
    //         'svcNum': '****',
    //         'svcMgmtNum': '7265407272',
    //         'feeProdId': 'NA00004046',
    //         'feeProdNm': 'LTE함께쓰기Basic(스마트폰)',
    //         'auditDtm': '20160303'
    //       }
    //     ]
    //   }
    // });
  },

  _onDoneTFamilySharing: function (svcInfoResp, tFamilySharingResp) {
    if (
      svcInfoResp.code === Tw.API_CODE.CODE_00 &&
      tFamilySharingResp.code === Tw.API_CODE.CODE_00
    ) {
      var data = this._getSharedData(svcInfoResp.result.svcMgmtNum, tFamilySharingResp.result.mbrList);
      this._$tfamilySharing.show();
      this._setDataTxt(this._$tfamilySharing, Tw.FormatHelper.convDataFormat(data, Tw.DATA_UNIT.GB));
    } else {
      this._tFamilySharingErrCode = tFamilySharingResp.code;
      if ( this._tFamilySharingErrCode === this._ERROR_CODE.T_FAMILY_SHARE_NOT_JOINED ) { // T가족모아 가입 가능한 요금제이나 미가입
        this._$tfamilySharing.show();
        this._$tfamilySharing.find('.data-txt').text(Tw.MYT_DATA_TOTAL_SHARING_DATA.JOIN_T_FAMILY_SHARING);
      }
    }
  },

  _onDoneDataGifts: function (resp) {
    var usedData;
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._dataGiftSum = _.reduce(resp.result, function (memo, data) {
        return memo + parseInt(data.dataQty, 10);
      }, 0);
      usedData = Tw.FormatHelper.convDataFormat(this._dataGiftSum, Tw.DATA_UNIT.MB);
    } else {
      usedData = Tw.FormatHelper.convDataFormat(0, Tw.DATA_UNIT.MB);
    }
    this._setDataTxt(this._$dataGift, usedData);
  },

  _onDoneDataSharing: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.data ) {
        var usedData = Tw.FormatHelper.convDataFormat(resp.result.data.used, Tw.DATA_UNIT.KB);
        this._setDataTxt(this._$dataSharing, usedData);
      }
    }
  },

  _onFailReq: function (err) {
    console.log(err);
  },

  _setDataTxt: function ($el, usedData) {
    $el.find('.data-txt').text(
      Tw.MYT_DATA_TOTAL_SHARING_DATA.USED_DATA_PREFIX +
      usedData.data + (usedData.unit || '') +
      Tw.MYT_DATA_TOTAL_SHARING_DATA.USED_DATA_SUFFIX
    );
  },

  _onClickBtnTFamilySharing: function () {
    if ( !this._tFamilySharingErrCode ) { // 성공 : T가족모아 메인 페이지로 이동
      this._historyService.goLoad('/myt/data/family');
    } else if ( this._tFamilySharingErrCode === this._ERROR_CODE.T_FAMILY_SHARE_NOT_JOINED ) { // T가족모아 가입 가능한 요금제이나 미가입
      this._popupService.openOneBtTypeB(
        Tw.ALERT_MSG_MYT_DATA.JOIN_ONLY_CUSTOMER_CENTER_T,
        Tw.ALERT_MSG_MYT_DATA.JOIN_ONLY_CUSTOMER_CENTER_C,
        [{
          style_class: 'fe-call-customer-center',
          txt: Tw.ALERT_MSG_MYT_DATA.CALL_CUSTOMER_CENTER
        }],
        'type1',
        $.proxy(this._tFamilyPopupOpened, this)
      );
    }
  },

  _tFamilyPopupOpened: function () {
    // $layer.on('click', '.fe-call-customer-center', $.proxy(this._goSubmain, this));
  },

  _onClickBtnDataGift: function () {
    if ( this._dataGiftSum <= 0 ) { // 0이면 T끼리 데이터 선물하기 페이지
      this._historyService.goLoad('/myt/data/gift');
    }
    else {

    }
  },

  _onClickBtnDataSharing: function () {
    if ( this._options.dataSharingJoined === 'Y' ) {
      this._historyService.goHash('data-share-popup');
    } else {
      this._historyService.goLoad('/product/detail/' + this._DATA_SHARING_PROD_ID); // LTE 데이터 함께쓰기 상품원장 상세 페이지로 이동
    }
  },

  _getSharedData: function (svcMgmtNum, list) {
    if ( !_.size(list) ) {
      return;
    }
    return _.reduce(_.where(list, {
      svcMgmtNum: svcMgmtNum
    }), function (memo, data) {
      return memo + parseInt(data.shared, 10);
    }, 0);
  }
};
