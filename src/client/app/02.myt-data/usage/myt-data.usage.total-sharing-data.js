/**
 * FileName: myt-data.usage.total-sharing-data.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 10. 08.
 */
Tw.SharedDataUsedCalculation = function(options) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._reqList = this._options.reqList;
  this._done = this._options.done;
  this._request();
};

Tw.SharedDataUsedCalculation.prototype = {
  _request: function() {
    var reqList = this._reqList;
    this._apiService.requestArray(reqList).done(
      $.proxy(function() {
        var totalSum = 0;
        for (var i = 0; i < reqList.length; i++) {
          var resp = arguments[i];
          if (reqList[i].done) {
            reqList[i].done(resp);
          }

          if (!resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result) {
            totalSum += 0;
            this._popupService.openAlert(resp.msg, resp.code);
            continue;
          }

          switch (reqList[i].command.path) {
            case Tw.API_CMD.BFF_06_0018.path:
              // resp = {
              //   'code': '00',
              //   'msg': 'success',
              //   'result': [
              //     {
              //       'opDtm': '20170701',
              //       'dataQty': '3',
              //       'custNm': '김*진',
              //       'svcNum': '01062**50**',
              //       'type': '1',
              //       'giftType': 'GC'
              //     }
              //   ]
              // };
              // MB
              var sum = _.reduce(
                resp.result,
                function(memo, data) {
                  return memo + parseInt(data.dataQty, 10);
                },
                0
              );
              sum = sum * 1024; // KB로 변환
              totalSum += sum;
              break;
            case Tw.API_CMD.BFF_05_0004.path:
              // resp = {
              //   'code': '00',
              //   'msg': 'success',
              //   'result': {
              //     data : {
              //       used : '2048'
              //     },
              //     childList : [{
              //       svcNum : '010-45**-12**',
              //       svcMgmtNum : '7200XXXX',
              //       feeProdId : '상품ID',
              //       feeProdNm : 'LTE함께쓰기Basic',
              //       auditDtm : '20150113'
              //     }]
              //   }
              // };
              // KB
              if (resp.result.data) {
                totalSum += parseInt(resp.result.data.used, 10);
              } else {
                totalSum += 0;
              }
              break;
            default:
              break;
          }
        }
        var totalSumConv = Tw.FormatHelper.convDataFormat(totalSum, Tw.DATA_UNIT.KB);
        if (this._done) {
          this._done(totalSumConv);
        }
      }, this)
    );
  }
};

Tw.MyTDataUsageTotalSharingData = function(rootEl, options) {
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
  // _DATA_SHARING_PROD_ID: 'NA00003556',
  _dataGiftSum: 0,
  _tFamilySharingErrCode: null,

  _init: function() {
    this._myTDataUsageDataShare = new Tw.MyTDataUsageDataShare($('#fe-data-share'));
    this._hashService.initHashNav(_.debounce($.proxy(this._onHashChange, this), 700, true));
  },

  _onHashChange: function(hash) {
    if (hash.raw && hash.raw === 'datashare_P') {
      this._myTDataUsageDataShare.open();
    } else {
      this._myTDataUsageDataShare.close();
    }
  },

  _cachedElement: function() {
    this._$sharedDataUsed = this.$container.find('#sharedDataUsed');
    this._$tfamilySharing = this.$container.find('.fe-tfamily-sharing');
    this._$dataSharing = this.$container.find('.fe-data-sharing');
    this._$dataGift = this.$container.find('.fe-data-gift');
  },

  _bindEvent: function() {
    this.$container.on('click', '.fe-tfamily-sharing button', $.proxy(this._onClickBtnTFamilySharing, this));
    this.$container.on('click', '.fe-data-gift button', $.proxy(this._onClickBtnDataGift, this));
    this.$container.on('click', '.fe-data-sharing button', $.proxy(this._onClickBtnDataSharing, this));
  },

  _rendered: function() {
    this._reqTFamilySharing();

    var reqList = [];
    var today = new Date();
    // T끼리 선물하기
    reqList.push({
      command: Tw.API_CMD.BFF_06_0018,
      params: {
        fromDt: Tw.DateHelper.getShortDateWithFormat(today, 'YYYYMM01'),
        toDt: Tw.DateHelper.getShortDateWithFormat(today, 'YYYYMMDD'),
        type: '1'
      },
      done: $.proxy(this._onDoneDataGifts, this)
      // error: $.proxy(this._onFailReq, this)
    });
    // 데이터 함께쓰기
    if (this._options.dataSharingJoined === 'Y') {
      reqList.push({
        command: Tw.API_CMD.BFF_05_0004,
        params: {},
        done: $.proxy(this._onDoneDataSharing, this)
        // error: $.proxy(this._onFailReq, this)
      });
    }
    new Tw.SharedDataUsedCalculation({
      reqList: reqList,
      done: $.proxy(function(totalSumConv) {
        if (_.size(this._$sharedDataUsed)) {
          // T/O플랜아님 && 기본제공데이터 존재
          this._$sharedDataUsed.text(totalSumConv.data + totalSumConv.unit);
        }
      }, this)
    });
  },

  _reqTFamilySharing: function() {
    this._apiService
      .requestArray([{ command: Tw.NODE_CMD.GET_SVC_INFO }, { command: Tw.API_CMD.BFF_06_0044 }])
      .done($.proxy(this._onDoneTFamilySharing, this))
      .fail($.proxy(this._onFailTFamilySharing, this));

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

  _onDoneTFamilySharing: function(svcInfoResp, tFamilySharingResp) {
    if (svcInfoResp.code === Tw.API_CODE.CODE_00 && tFamilySharingResp.code === Tw.API_CODE.CODE_00) {
      var data = this._getSharedData(svcInfoResp.result.svcMgmtNum, tFamilySharingResp.result.mbrList);
      this._$tfamilySharing.show();
      this._setDataTxt(this._$tfamilySharing, Tw.FormatHelper.convDataFormat(data, Tw.DATA_UNIT.GB));
    } else {
      this._tFamilySharingErrCode = tFamilySharingResp.code;
      if (this._tFamilySharingErrCode === this._ERROR_CODE.T_FAMILY_SHARE_NOT_JOINED) {
        // T가족모아 가입 가능한 요금제이나 미가입
        this._$tfamilySharing.show();
        this._$tfamilySharing.find('.fe-data-txt').text(Tw.MYT_DATA_TOTAL_SHARING_DATA.JOIN_T_FAMILY_SHARING);
      } else {
        this._$tfamilySharing.hide();
      }
    }
  },

  _onFailTFamilySharing: function() {
    this._$tfamilySharing.hide();
  },

  _onDoneDataGifts: function(resp) {
    var usedData;
    if (resp.code === Tw.API_CODE.CODE_00) {
      this._dataGiftSum = _.reduce(
        resp.result,
        function(memo, data) {
          return memo + parseInt(data.dataQty, 10);
        },
        0
      );
      if (this._dataGiftSum < 1) {
        usedData = Tw.FormatHelper.customDataFormat(this._dataGiftSum, Tw.DATA_UNIT.MB, Tw.DATA_UNIT.KB);
      } else {
        usedData = Tw.FormatHelper.convDataFormat(this._dataGiftSum, Tw.DATA_UNIT.MB);
      }
    } else {
      usedData = Tw.FormatHelper.convDataFormat(0, Tw.DATA_UNIT.MB);
    }
    this._setDataTxt(this._$dataGift, usedData);
  },

  _onDoneDataSharing: function(resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      if (resp.result.data) {
        var usedData = Tw.FormatHelper.convDataFormat(resp.result.data.used, Tw.DATA_UNIT.KB);
        this._setDataTxt(this._$dataSharing, usedData);
      }
    }
  },

  _onFailReq: function(err) {
    console.log(err);
  },

  _setDataTxt: function($el, usedData) {
    $el
      .find('.fe-data-txt')
      .html(
        '<strong>' +
          Tw.MYT_DATA_TOTAL_SHARING_DATA.USED_DATA_PREFIX +
          usedData.data +
          (usedData.unit || '') +
          '</strong>' +
          Tw.MYT_DATA_TOTAL_SHARING_DATA.USED_DATA_SUFFIX
      );
  },

  _onClickBtnTFamilySharing: function() {
    if (!this._tFamilySharingErrCode) {
      // 성공 : T가족모아 메인 페이지로 이동
      this._historyService.goLoad('/myt-data/familydata');
    } else if (this._tFamilySharingErrCode === this._ERROR_CODE.T_FAMILY_SHARE_NOT_JOINED) {
      // T가족모아 가입 가능한 요금제이나 미가입
      this._historyService.goLoad('/product/callplan?prod_id=NA00006031');
    }
  },

  _tFamilyPopupOpened: function() {
    // $layer.on('click', '.fe-call-customer-center', $.proxy(this._goSubmain, this));
  },

  _onClickBtnDataGift: function() {
    if (this._dataGiftSum <= 0) {
      // 0이면 T끼리 데이터 선물하기 페이지
      this._historyService.goLoad('/myt-data/giftdata');
    } else {
      this._historyService.goLoad('/myt-data/history?filter=data-gifts');
    }
  },

  _onClickBtnDataSharing: function() {
    if (this._options.dataSharingJoined === 'Y') {
      this._historyService.goHash('datashare_P');
    } else {
      // this._historyService.goLoad('/product/callplan?prod_id=' + this._DATA_SHARING_PROD_ID); // LTE 데이터 함께쓰기 상품원장 상세 페이지로 이동
      this._historyService.goLoad('/common/search?keyword='+Tw.MYT_DATA_TOTAL_SHARING_DATA.SEARCH_KEYWORD);
    }
  },

  _getSharedData: function(svcMgmtNum, list) {
    var data = _.find(list, {
      svcMgmtNum: svcMgmtNum
    });
    return data ? parseInt(data.shared, 10) : 0;
  }
};
