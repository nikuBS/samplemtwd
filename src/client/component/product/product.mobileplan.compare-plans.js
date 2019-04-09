/**
 * @file product.mobileplan.compare-plans.js
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018-11-26
 */

/**
 * @class
 * @desc 상품 > 요금제 > 리스트 > 요금제 비교하기
 */
Tw.ProductMobilePlanComparePlans = function () {

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._isOpen = false;
  this.openerEvent = null;
};

Tw.ProductMobilePlanComparePlans.prototype = {

  /**
   * @function
   * 요금제 비교하기 팝업생성
   * @param prodId    : 상품ID
   * @param isShowBtn : 하단 [요금제 가입하기] 버튼 노출유무
   * @param e
   */
  openCompare: function (prodId, isShowBtn, e) {
    // 이미 팝업을 호출 했다면 안 띄운다. window.location.hash 대신 변수를 사용한 이유는 빠르게 여러번 호출 될 경우 hash 값이 공백으로 와서 변수로 대체함.
    if (this._isOpen) {
      return;
    }
    this.openerEvent = e;
    this._isShowBtn = isShowBtn === undefined ? true : isShowBtn;
    this._isOpen = true;
    this._prodId = prodId;
    var callAll = function (currentProdId, basicInfo) {
      this._apiService.requestArray([
        {command: Tw.API_CMD.BFF_05_0091, params: {}}, // 최근 사용량 조회
        {command: Tw.NODE_CMD.GET_PRODUCT_INFO, params: {prodId: prodId}}, // Redis 상품원장 조회
        {
          command: Tw.NODE_CMD.GET_PRODUCT_COMPARISON, params: {
            beforeId: currentProdId,
            afterId: prodId
          }
        } // Redis 컨텐츠 조회
      ])
        .done($.proxy(this._successOnInit, this, basicInfo))
        .fail($.proxy(this._onFail, this));
    };

    // 상품원장 - 상품기본정보 조회. ( requestArray pathVariables 안되는거 같아서 이거 실행 후 나머지 실행한다. )
    var callBasicInfo = function (currentProdId) {
      this._apiService.request(Tw.API_CMD.BFF_10_0001, {prodExpsTypCd: 'P'}, {}, [prodId])
        .done($.proxy(function (resp) {
          if (!this._apiError(resp)) {
            callAll.call(this, currentProdId, resp);
          }
        }, this));
    };

    // 현재 세션 조회
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO)
      .done($.proxy(function (resp) {
        if (!this._apiError(resp)) {
          callBasicInfo.call(this, resp.result.prodId);
        }
      }, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc API 에러 유무
   * @returns {boolean}
   */
  _apiError: function () {
    var $this = this;
    var rs = false;
    $.each(arguments, function (k, v) {
      if (v.code !== Tw.API_CODE.CODE_00) {
        $this._onFail(v);
        rs = true;
        return false;
      }
    });

    return rs;
  },

  /**
   * @function
   * @desc openCompare.callAll() 펑션 호출 성공시 콜백함수
   * @param {JSON} basicInfo     : 상품기본정보(BFF_10_0001) 리턴값
   * @param {JSON} recentUsage   : 최근사용량(BFF_05_0091) 리턴값
   * @param {JSON} prodRedisInfo : redis 상품원장(GET_PRODUCT_INFO) 리턴값
   * @param {JSON} contents      : resit 컨텐츠 조회(GET_PRODUCT_COMPARISON) 리턴값
   */
  _successOnInit: function (basicInfo, recentUsage, prodRedisInfo, contents) {
    if (this._apiError(basicInfo, prodRedisInfo, contents)) return;
    // BIL0070 : 최근 사용량 데이터 없음
    if ( [Tw.API_CODE.CODE_00, 'BIL0070'].indexOf(recentUsage.code) === -1) {
      this._onFail(recentUsage);
      return;
    }

    var msgs = Tw.PRODUCT_MOBILEPLAN_COMPARE_PLANS;
    prodRedisInfo = this._parseProduct(prodRedisInfo.result);

    // hbs(MP_02_02_01)사용할 데이터 생성
    var _data = {
      data: {
        prodNames: [msgs.MY_DATA_TXT, prodRedisInfo.prodNm],
        recentAvgTxt: msgs.RECENT_AVG_TXT.replace('{0}', msgs.USAGE_TXT),
        recentMaxTxt: msgs.RECENT_MAX_TXT.replace('{0}', msgs.USAGE_TXT),
        avg: 0,
        max: 0,
        targetSupply: prodRedisInfo.basOfrGbDataQtyCtt
      },
      contents: contents.result.guidMsgCtt,
      joinUrl: this._getJoinUrl(basicInfo).linkUrl
    };

    var openPopup = function(param){
      this._popupService.open({
          hbs: 'MP_02_02_01',
          layer: true,
          data: param
        },
        $.proxy(this._afterComparePop, this, param),
        $.proxy(this._closeComparePop, this),
        'compare',
        $(this.openerEvent.currentTarget)
      );
    };

    // 아래 조건에 만족하면 기본 데이터로 팝업 띄운다.
    if (!recentUsage.result || !recentUsage.result.data || recentUsage.result.data.length < 1) {
      openPopup.call(this, _data);
      return;
    }

    var sum = 0, max = 0;
    // 최대 사용량 구하기
    recentUsage.result.data.forEach(function(o) {
      var totalUsage = parseFloat(o.totalUsage);
      sum += parseFloat(totalUsage);
      if (totalUsage > max) {
        max = totalUsage;
      }
    });

    var dataSize = recentUsage.result.data.length;
    var monthText = msgs.MONTH_TXT.replace('{0}', dataSize);

    $.extend(_data.data, {
      recentAvgTxt: msgs.RECENT_AVG_TXT.replace('{0}', monthText),
      recentMaxTxt: msgs.RECENT_MAX_TXT.replace('{0}', monthText),
      avg: Tw.FormatHelper.customDataFormat(sum / dataSize, Tw.DATA_UNIT.KB, Tw.DATA_UNIT.GB).data, // 3개월 평균 값
      max: Tw.FormatHelper.customDataFormat(max, Tw.DATA_UNIT.KB, Tw.DATA_UNIT.GB).data // 3개월중 최대 사용값
    });

    openPopup.call(this, _data);
  },

  /**
   * @function
   * @desc MP_02_02_01 팝업 생성이후 콜백함수
   * @param {JSON} _data - 차트 생성 전달 데이터
   * @param {Object} $layer
   */
  _afterComparePop: function (_data, $layer) {
    // [요금제 가입하기] 버튼 노출/비노출
    if (!this._isShowBtn) {
      $layer.find('#fe-btn-change').addClass('none');
      $layer.removeClass('fixed-bottom');
    }
    // [요금제 가입하기] 버튼 클릭 이벤트
    $layer.on('click', '[data-join-url]', $.proxy(this._goJoinUrl, this));
    this._initChart($layer, _data);
    // 화면이 아래로 떨어져서 위로 붙여준다.
    setTimeout(function () {
      $layer.scrollTop(0);
    }, 50);
  },

  /**
   * @function
   * @desc MP_02_02_01 팝업 생성이후 close 시 콜백함수
   */
  _closeComparePop: function () {
    this._isOpen = false;
  },

  /**
   * @function
   * @desc 요금제 데이타 파싱
   * @param {JSON} productInfo
   * @returns {JSON} productInfo
   */
  _parseProduct: function (productInfo) {
    if (Tw.FormatHelper.isEmpty(productInfo) || Tw.FormatHelper.isEmpty(productInfo.summary)) {
      return {
        prodNm: '',
        basOfrGbDataQtyCtt: 0,
        basOfrVcallTmsCtt: 0,
        basOfrCharCntCtt: 0
      };
    }

    var isValid = function (value) {
      return !(Tw.FormatHelper.isEmpty(value) || ['0', '-'].indexOf(value) !== -1);
    };

    var product = productInfo.summary;
    // 어드민에서 "데이터 제공량" 등록 시 basOfrGbDataQtyCtt(GB),basOfrMbDataQtyCtt(MB) 둘 중, 하나에 등록한다고 함..
    if (!isValid(product.basOfrGbDataQtyCtt)) {
      if (isValid(product.basOfrMbDataQtyCtt)) {
        product.basOfrGbDataQtyCtt = Tw.FormatHelper.customDataFormat(product.basOfrMbDataQtyCtt, Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB).data;
      } else {
        product.basOfrGbDataQtyCtt = 0;
      }
    }
    return product;
  },

  /**
   * @function
   * @desc 가입 페이지 URL 반환
   * @param {JSON} basicInfo
   * @returns {JSON} - 수신한 가입 url
   */
  _getJoinUrl: function(basicInfo) {
    var res = {
      linkNm: '',
      linkUrl: ''
    };
    if (!basicInfo.result.linkBtnList || basicInfo.result.linkBtnList.length < 1) {
      return res;
    }
    var joinUrlArr = _.filter(basicInfo.result.linkBtnList, function (item) {
      return item.linkTypCd === 'SC';
    });

    return joinUrlArr[0] || res;
  },

  /**
   * @function
   * @desc 무선상품 가입 사전체크 API 호출
   * @param {Object} e
   */
  _goJoinUrl: function (e) {
    var joinUrl = $(e.currentTarget).data('joinUrl');
    if (Tw.FormatHelper.isEmpty(joinUrl)) {
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0007, {
      joinTermCd: '01'
    }, null, [this._prodId])
      .done($.proxy(this._goJoinDone, this, joinUrl))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc _goJoinUrl 성공 콜백함수(성공시 가입하기 페이지로 이동)
   * @param {String} href
   * @param {JSON} resp
   */
  _goJoinDone: function (href, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._onFail(resp);
    }

    this._historyService.replaceURL(href + '?prod_id=' + this._prodId);
  },

  /**
   * @function
   * @desc 현재 요금제와 비교 요금제 차트 생성
   * @param {Object} $layer
   * @param {JSON} data - 차트 생성할 데이터
   */
  _initChart: function ($layer, data) {
    /*
        prdname : 종류
        legend : 범례
        data_arry.u : 단위
        data_arry.v : 숫자, '무제한', '기본제공'
        data_arry.v2 : 숫자, '무제한', '기본제공'
    */
    // 상단 > 데이터 차트
    var _data = data.data;
    $layer.chart2({ // 숫자
      target: '.chart1',
      type: 'circle',
      unit: 'GB',
      prdname: _data.prodNames,
      data_arry: [
        {
          t: _data.recentAvgTxt,
          v: Number(_data.avg)
        },
        {
          t: _data.recentMaxTxt,
          v: Number(_data.max)
        },
        {
          t: _data.prodNames[1],
          v: !isNaN(_data.targetSupply) ? parseFloat(_data.targetSupply) : _data.targetSupply
        }
      ]
    });
  },

  /**
   * @function
   * @desc API Fail
   * @param {JSON} err
   */
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }

};
