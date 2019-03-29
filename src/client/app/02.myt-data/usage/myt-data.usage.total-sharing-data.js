/**
 * MenuName: 나의 데이터/통화 > 실시간 잔여량 > 통합공유데이터
 * FileName: myt-data.usage.total-sharing-data.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 10. 08.
 * Summary: 통합공유데이터 조회(T가족공유 데이터, T끼리 데이터 선물하기, 데이터 함께쓰기)
 */

/**
 * T끼리 선물하기 + 데이터 함께쓰기 사용량 계산
 * @param object: {
      reqList: [{
        command,
        params,
        done: function() {}
      }],
      done: function() {}
    }
 */
Tw.SharedDataUsedCalculation = function (options) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._reqList = this._options.reqList;
  this._done = this._options.done;
  this._request();
};

Tw.SharedDataUsedCalculation.prototype = {
  _request: function () {
    var reqList = this._reqList;
    this._apiService.requestArray(reqList).done(
      $.proxy(function () {
        var totalSum = 0;
        for ( var i = 0; i < reqList.length; i++ ) {
          var resp = arguments[i];
          if ( reqList[i].done ) {
            reqList[i].done(resp);
          }

          if ( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result ) {
            totalSum += 0;
            this._popupService.openAlert(resp.msg, resp.code);
            continue;
          }

          switch ( reqList[i].command.path ) {
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
                function (memo, data) {
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
              if ( resp.result.data ) {
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
        if ( this._done ) {
          this._done(totalSumConv);
        }
      }, this)
    );
  }
};

Tw.MyTDataUsageTotalSharingData = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._options = options;

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
  _DATA_SHARING_POPUP_HBS: 'DC_01_01_01_01',
  _dataSharingList: null,

  _cachedElement: function () {
    this._$sharedDataUsed = this.$container.find('#sharedDataUsed');
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
    if ( this._options.dataSharingJoined === 'Y' ) {
      reqList.push({
        command: Tw.API_CMD.BFF_05_0004,
        params: {},
        done: $.proxy(this._onDoneDataSharing, this)
        // error: $.proxy(this._onFailReq, this)
      });
    }
    new Tw.SharedDataUsedCalculation({
      reqList: reqList,
      done: $.proxy(function (totalSumConv) {
        // [DV001-6336] 기본제공 데이터 존재 && 가족모아데이터가 가능한 상품(T/O플랜 등)이 아닌 경우
        // T끼리데이터선물 + 데이터 함께쓰기 사용량을 합쳐서 통합공유 데이터 영역의 사용량에 표시
        if ( _.size(this._$sharedDataUsed) ) {
          this._$sharedDataUsed.text(totalSumConv.data + totalSumConv.unit);
        }
      }, this)
    });
  },

  /**
   * svcInfo, T가족모아 구성원 정보 조회
   * @private
   */
  _reqTFamilySharing: function () {
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

  /**
   * svcInfo, T가족모아 구성원 정보 조회 성공
   * @param svcInfoResp
   * @param tFamilySharingResp
   * @private
   */
  _onDoneTFamilySharing: function (svcInfoResp, tFamilySharingResp) {
    if ( svcInfoResp.code === Tw.API_CODE.CODE_00 && tFamilySharingResp.code === Tw.API_CODE.CODE_00 ) {
      // [DV001-5460] mbrList 에서 본인레코드 (서비스관리번호로) 선택, 그중 shared(공유데이터GB)
      var data = this._getSharedData(svcInfoResp.result.svcMgmtNum, tFamilySharingResp.result.mbrList);
      this._$tfamilySharing.show();
      this._$tfamilySharing.attr('aria-hidden','false');
      this._setDataTxt(this._$tfamilySharing, Tw.FormatHelper.convDataFormat(data, Tw.DATA_UNIT.GB));
    } else {
      this._tFamilySharingErrCode = tFamilySharingResp.code;
      if ( this._tFamilySharingErrCode === this._ERROR_CODE.T_FAMILY_SHARE_NOT_JOINED ) {
        // T가족모아 가입 가능한 요금제이나 미가입
        this._$tfamilySharing.show();
        this._$tfamilySharing.attr('aria-hidden','false');
        this._$tfamilySharing.find('.fe-data-txt').text(Tw.MYT_DATA_TOTAL_SHARING_DATA.JOIN_T_FAMILY_SHARING);
      } else {
        this._$tfamilySharing.hide();
        this._$tfamilySharing.attr('aria-hidden','true');
      }
    }
  },

  /**
   * svcInfo, T가족모아 구성원 정보 조회 실패
   * @private
   */
  _onFailTFamilySharing: function () {
    this._$tfamilySharing.hide();
  },

  /**
   * T끼리 선물하기 조회 성공 - 데이터 합산 후 노출
   * @param resp
   * @private
   */
  _onDoneDataGifts: function (resp) {
    var usedData;
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._dataGiftSum = _.reduce(
        resp.result,
        function (memo, data) {
          return memo + parseInt(data.dataQty, 10);
        },
        0
      );
      if ( this._dataGiftSum < 1 ) {
        usedData = Tw.FormatHelper.customDataFormat(this._dataGiftSum, Tw.DATA_UNIT.MB, Tw.DATA_UNIT.KB);
      } else {
        usedData = Tw.FormatHelper.convDataFormat(this._dataGiftSum, Tw.DATA_UNIT.MB);
      }
    } else {
      usedData = Tw.FormatHelper.convDataFormat(0, Tw.DATA_UNIT.MB);
    }
    this._setDataTxt(this._$dataGift, usedData);
  },

  /**
   * 데이터 함께쓰기 조회 성공
   * @param resp
   * @private
   */
  _onDoneDataSharing: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.data ) {
        var usedData = Tw.FormatHelper.convDataFormat(resp.result.data.used, Tw.DATA_UNIT.KB);
        this._setDataTxt(this._$dataSharing, usedData);
      }
      if (resp.result.childList && resp.result.childList.length  > 0) {
        this._dataSharingList = resp.result.childList;
      }
    }
  },

  _onFailReq: function (err) {
    console.log(err);
  },

  /**
   * 엘리먼트에 데이터 표시
   * @param $el
   * @param usedData
   * @private
   */
  _setDataTxt: function ($el, usedData) {
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

  /**
   * T가족공유 데이터 버튼 클릭시 호출
   * @private
   */
  _onClickBtnTFamilySharing: function () {
    if ( !this._tFamilySharingErrCode ) {
      // 성공 : T가족모아 메인 페이지로 이동
      this._historyService.goLoad('/myt-data/familydata');
    } else if ( this._tFamilySharingErrCode === this._ERROR_CODE.T_FAMILY_SHARE_NOT_JOINED ) {
      // T가족모아 가입 가능한 요금제이나 미가입
      this._historyService.goLoad('/product/callplan?prod_id=NA00006031');
    }
  },

  _tFamilyPopupOpened: function () {
    // $layer.on('click', '.fe-call-customer-center', $.proxy(this._goSubmain, this));
  },

  /**
   * T끼리 데이터 선물하기 버튼 클릭시 호출
   * @private
   */
  _onClickBtnDataGift: function () {
    if ( this._dataGiftSum <= 0 ) {
      // 0이면 T끼리 데이터 선물하기 페이지
      this._historyService.goLoad('/myt-data/giftdata');
    } else {
      this._historyService.goLoad('/myt-data/history?filter=data-gifts');
    }
  },

  /**
   * 데이터 함께쓰기 버튼 클릭시 호출
   * @private
   */
  _onClickBtnDataSharing: function () {
    if ( this._options.dataSharingJoined === 'Y' ) {
      // this._historyService.goHash('datashare_P');
      // 데이터 함께쓰기 팝업 노출
      if (this._dataSharingList && this._dataSharingList.length > 0) {
        this._openDataSharingPopup(this._dataSharingList);
      } else {
        this._apiService.request(Tw.API_CMD.BFF_05_0004)
          .done($.proxy(this._reqDataSharingsDone, this))
          .fail($.proxy(this._reqDataSharingsFail, this));
      }
    } else {
      // this._historyService.goLoad('/product/callplan?prod_id=' + this._DATA_SHARING_PROD_ID); // LTE 데이터 함께쓰기 상품원장 상세 페이지로 이동
      this._historyService.goLoad('/common/search?keyword=' + Tw.MYT_DATA_TOTAL_SHARING_DATA.SEARCH_KEYWORD);
    }
  },

  /**
   * list 에서 본인레코드의 공유데이터 반환
   * @param svcMgmtNum
   * @param list
   * @private
   */
  _getSharedData: function (svcMgmtNum, list) {
    var data = _.find(list, {
      svcMgmtNum: svcMgmtNum
    });
    return data ? parseInt(data.shared, 10) : 0;
  },

  /**
   * 데이터 함께쓰기 조회 성공
   * @param resp
   * @private
   */
  _reqDataSharingsDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var dataSharingList = resp.result && resp.result.childList;
      if ( dataSharingList && dataSharingList.length > 0 ) {
        // 데이터 함께쓰기 팝업 열기
        this._openDataSharingPopup(dataSharingList);
      }
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  /**
   * 데이터 함께쓰기 조회 실패
   * @param resp
   * @private
   */
  _reqDataSharingsFail: function (resp) {
    this._popupService.openAlert(resp.msg, resp.code);
  },

  /**
   * 데이터 함께쓰기 팝업 열기
   * @param dataSharingList
   * @private
   */
  _openDataSharingPopup: function(dataSharingList) {
    var _dataSharingList = _.map(dataSharingList, function (data) {
      return {
        feeProdNm: data.feeProdNm,
        svcNum: Tw.FormatHelper.getDashedCellPhoneNumber(data.svcNum),
        auditDtm: Tw.DateHelper.getShortDate(data.auditDtm),
        svcMgmtNum: data.svcMgmtNum
      };
    });
    var option = {
      hbs: this._DATA_SHARING_POPUP_HBS,
      layer: true,
      children: _dataSharingList
    };
    Tw.Popup.open(option, $.proxy(function ($layer) {
      // 데이터 함께쓰기 자회선 사용량 조회
      $layer.find('.fe-btn-used-data').click($.proxy(this._onClickBtnDataSharingUsedData, this));
    }, this), null, 'datashare', this.$container.find('.fe-data-sharing button'));
  },

  /**
   * 데이터 함께쓰기 자회선 사용량 조회
   * @param event
   * @private
   */
  _onClickBtnDataSharingUsedData: function (event) {
    event.preventDefault();
    var targetSelector = $(event.target);
    var svcMgmtNum = targetSelector.data('svcmgmtnum');
    this._apiService.request(Tw.API_CMD.BFF_05_0009, { cSvcMgmtNum: svcMgmtNum })
      .done($.proxy(this._reqDataSharingDetailDone, this, targetSelector))
      .fail($.proxy(this._reqDataSharingDetailFail, this));
  },

  /**
   * 데이터 함께쓰기 자회선 사용량 조회 성공
   * @param targetSelector
   * @param resp
   * @private
   */
  _reqDataSharingDetailDone: function (targetSelector, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._drawChild(targetSelector, resp);
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  /**
   * 데이터 함께쓰기 자회선 사용량 조회 실패
   * @param resp
   * @private
   */
  _reqDataSharingDetailFail: function (resp) {
    this._popupService.openAlert(resp.msg, resp.code);
  },

  /**
   * 데이터 함께쓰기 자회선 사용량 표시
   * @param targetSelector
   * @param resp
   * @private
   */
  _drawChild: function (targetSelector, resp) {
    var used = Tw.FormatHelper.convDataFormat(resp.result.used, Tw.DATA_UNIT.KB);
    var $feUsedDataResult = targetSelector.closest('.datatogether-li-state').find('.fe-used-data-result');
    $feUsedDataResult.find('.fe-data').text(used.data);
    $feUsedDataResult.find('.fe-unit').text(used.unit);
    $feUsedDataResult.show();
    targetSelector.parent().hide();
  }
};
