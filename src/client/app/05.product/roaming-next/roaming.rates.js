/**
 * @file roaming.rates.js
 * @desc T로밍 > 국가별 이용요금 조회
 * @author 황장호
 * @since 2020-09-30
 */

Tw.RoamingRates = function (rootEl, nations, meta, lastQuery) {
  this.$container = rootEl;
  // 로밍 지원여부 데이터
  this.roamingMeta = meta;
  // 마지막 쿼리 데이터
  this.lastQuery = lastQuery;

  // 로밍 지원 타입 (Object 형태)
  this.manageType = [];
  // 로밍 지원 타입 (텍스트 형태)
  this.typeTxt = [];
  // BFF 요청시 넘길 파라미터
  this.reqParams = {};

  if (!Tw.Environment.init) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this.afterInit, this));
  } else {
    this.afterInit();
  }
  new Tw.RoamingMenu(rootEl).install();

  var baseDiv = '#roamingRates';
  // 일정선택 팝업 모듈 초기화
  this.$schedule = new Tw.RoamingSchedules(rootEl, nations, baseDiv, function () {
    $('#nationsDialog').css('display', 'none');
    $(baseDiv).css('display', 'block');
    $(baseDiv).addClass('wrap');
  });
  // 국가 검색 창에서, 특정 국가 선택시 실행될 콜백 준비
  this.$schedule.installNationSearch(this.sendQuery, baseDiv);

  this.bindEvents();
};

Tw.RoamingRates.prototype = {
  /**
   * 이벤트 핸들러
   */
  bindEvents: function () {
    // '전체 국가 보기' 클릭
    this.$container.find('.fe-show-nations').on('click', $.proxy(this._openNationsDialog, this));
    // 국가 검색 창 돋보기 클릭
    this.$container.find('.field-container .search').on('click', $.proxy(this.searchNationRate, this));
    // 국가 검색 창 onSubmit
    $('#searchForm').on('submit', $.proxy(this.searchNationRate, this));
    // '로밍 시 국가별 주의 사항'
    this.$container.find('.attentionHead').on('click', $.proxy(this.toggleAttention, this));
    // 툴팁 핸들러
    this.$container.find('.tip, .tip-view, .tip-view-btn').on('click', $.proxy(this._showTip, this));   //웹접근성  .tip => tip-view 변경, 혹실몰라 기존클래스 냅뒀음.

    // 요금 더보기 핸들러
    this.$container.find('.opener').on('click', $.proxy(this._divOpen, this));
    // 요금 닫기 핸들러
    this.$container.find('.closer').on('click', $.proxy(this._divClose, this));
    //웹접근성 레프트 gnb 슬라이딩 메뉴, 닫기  
    this.$container.find('#common-menu button#fe-close').on('click', $.proxy(this._closeGnb, this)); 
  },

  //웹접근성 
  //로밍 메인에서 gnb 메뉴 닫기 클릭시 햄버거에 focus    
  _closeGnb: function() {
    setTimeout(function () {
      $("span.icon-gnb-menu").focus();
    },300);  
 },
  /**
   * 전체 국가 목록 링크 핸들러
   * @returns {boolean}
   * @private
   */
  _openNationsDialog: function() {
    this.$schedule.openNationsDialog();
    return false;
  },
  /**
   * 요금 더보기 핸들러
   * @param e EventObject
   * @private
   */
  _divOpen: function(e) {
    var section = e.currentTarget.getAttribute('data-section');
    this.divExpand(section);
  },
  /**
   * 요금 닫기 핸들러
   * @param e EventObject
   * @private
   */
  _divClose: function(e) {
    var section = e.currentTarget.getAttribute('data-section');
    this.divCollapse(section);
  },
  /**
   * 모듈 초기화 후 후속처리
   */
  afterInit: function () {
    // 전화번호 포매팅
    var numberContainer = document.getElementById('svcNum');
    if (numberContainer) {
      var number = numberContainer.innerText;
      if (number.length === 11) {
        numberContainer.innerText =
          number.substring(0, 3) + '-' +
          number.substring(3, 7) + '-' +
          number.substring(7);
      }
    }
    if (this.roamingMeta) {
      this.setupResult(this.roamingMeta);
    }
  },
  /**
   * 국가 선택 다이얼로그에서 특정 국가를 선택하여 요율 조회를 시작
   * @param code 국가 코드
   * @param name 국가 이름
   */
  sendQuery: function (code, name) {
    $('#searchForm input[name="code"]').val(code);
    $('#searchForm input[name="nm"]').val(name);
    $('#searchForm').submit();
  },
  /**
   * 검색 핸들러.
   * #searchForm code 가 준비됐으면 바로 검색을 하고,
   * 그렇지 않으면 autocomplete 국가 검색을 수행.
   */
  searchNationRate: function () {
    if ($('#searchForm input[name="code"]').val().length === 3) {
      return true;
    }
    return this.$schedule.searchNation();
  },
  /**
   * '로밍 시 국가별 주의 사항' 토글 핸들러
   */
  toggleAttention: function () {
    var imagePrefix = Tw.Environment.cdn + '/img/product/roam/ico_';
    var imageSuffix = '.svg';
    $('.attentionBody').toggle('blind', {}, 250, function () {
      var info = $('.attentionBody')[0];
      $('.attentionHead img.toggle').attr(
        'src',
        imagePrefix + (info.style.display === 'none' ? 'expand' : 'collapse') + imageSuffix
      );
    });
  },
  /**
   * 요율 정보 더보기 핸들러
   * @param id 각 요율 섹션
   */
  divExpand: function (id) {
    $('#' + id + ' .opener').css('display', 'none');
    $('#' + id + ' .rateBody').toggle('blind', {}, 250, function () {
    });
  },
  /**
   * 요율 정보 닫기 핸들러
   * @param id 각 요율 섹션
   */
  divCollapse: function (id) {
    $('#' + id + ' .rateBody').toggle('blind', {}, 250, function () {
      $('#' + id + ' .opener').css('display', 'block');
    });
  },
  /**
   * 요율 정보 BFF_10_0061 응답을 처리하는 핵심 함수.
   * roaming/product.roaming.search-result.js 기존 코드로부터 복사했다.
   *
   * @param meta BFF_10_0061 응답 JSON
   */
  setupResult: function (meta) {
    $('#fe-guamsaipan-pop').on('click', '.fe-close', function () {
      $('#fe-guamsaipan-pop').addClass('none');
    });

    var type = {     // 로밍 서비스 방식
      lte: 0,      // LTE
      wcdma: 1,    // 3G
      cdma: 2,     // 2G
      gsm: 3,      // GSM
      rent: 4      // 임대
    };
    this.reqParams = {
      countryCd: this.lastQuery.countryCd,
      manageType: '',                           // 로밍 서비스 방식
      showDailyPrice: 'N'                       // 로밍서비스방식이 임대로밍 인경우는 Y , 나머지는 N
    };
    this.managerType = [];
    this.typeTxt = [];

    // 국가별 이용가능 서비스 리스트 생성
    if (meta.iPoPhone) {    // 단말기 가능폰 확인
      if (meta.iPoPhone === '0') {   // 지원가능 서비스 없는 경우
        if (meta.eqpMthdCd === 'W') {   // wcdma+gsm
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma]);
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm]);
        } else if (meta.eqpMthdCd === 'D') { // cdma
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma]);
        } else {
          if (meta.lte > 0 && meta.iLtePhone !== '' && meta.iLtePhone !== 'N') {
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.lte].txt);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.lte]);
          }
          if (meta.wcdma > 0) {
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma].txt);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma]);
          }
          if (meta.cdma > 0) {
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma].txt);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma]);
          }
          if (meta.gsm > 0) {
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm].txt);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm]);
          }
        }
      } else {
        if (meta.lte > 0 && meta.iLtePhone !== '' && meta.iLtePhone !== 'N') {
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.lte].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.lte]);
        }

        if (meta.iPoPhone === '1' && meta.wcdma > 0) {    // WCDMA Only
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma]);
        } else if (meta.iPoPhone === '2' && meta.wcdma > 0 && meta.gsm > 0) { // WCDMA+GSM
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma]);
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm]);
        } else if (meta.iPoPhone === '4' && meta.wcdma > 0 && meta.cdma > 0) { // WCDMA+CDMA
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma]);
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma]);
        } else if (meta.iPoPhone === '3' && meta.gsm > 0 && meta.cdma > 0) { // GSM+CDMA(SIM자동 로밍)
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma]);
          this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm].txt);
          this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm]);
        }
      }
    } else {
      if (meta.lte > 0 && meta.iLtePhone !== '' && meta.iLtePhone !== 'N') {
        this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.lte].txt);
        this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.lte]);
      }
      if (meta.wcdma > 0) {
        this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma].txt);
        this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.wcdma]);
      }
      if (meta.cdma > 0) {
        this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma].txt);
        this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.cdma]);
      }
      if (meta.gsm > 0) {
        this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm].txt);
        this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.gsm]);
      }
    }

    // 임대 로밍 서비스가 가능한 경우
    if (meta.rent > 0) {
      this.reqParams.showDailyPrice = 'Y';
      this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[type.rent].txt);
      this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[type.rent]);
    } else {
      this.reqParams.showDailyPrice = 'N';
    }

    // 이용가능 서비스가 있는 경우 로밍 요금 조회 요청.
    if (this.manageType.length > 0) {
      // 3G 자동로밍 선택이 가능할 경우 기본 노출로 설정
      var defaultType = 0;
      for (var key in this.manageType) {
        if (this.manageType[key].type === 'W') {
          defaultType = key;
        }
      }
      this.reqParams.manageType = this.manageType[defaultType].type;
      $('#availableServices').text(this.typeTxt.join(', '));

      // 아래 XHR 은 BFF_10_0058 이다.
      $.get('/bypass/core-product/v1/roaming/country-rate?' +
        'countryCode=' + this.lastQuery.countryCd + '&manageType=' + this.reqParams.manageType +
        '&showDailyPrice=' + this.reqParams.showDailyPrice, $.proxy(this.fillRateProperties, this));
    } else {
      // alert('이용 가능한 서비스가 없습니다');
    }
  },
  /**
   * BFF_10_0058 응답값을 받아 요율 정보 데이터들을 채운다.
   * roaming/product.roaming.search-result.js 의 _handleSuccessRateResult 내용을 복사했다.
   *
   * @param resp BFF_10_0058 응답 JSON
   */
  fillRateProperties: function (resp) {
    var popupPresented = false;
    // 괌/사이판 팝업
    if (['GUM', 'MNP'].indexOf(this.reqParams.countryCd) >= 0) {
      $('#fe-guamsaipan-pop').removeClass('none');
      popupPresented = true;
    }
    
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }
    var _result = resp.result;
    _result.countryCd = this.lastQuery.countryCd;

    var typeIndex = null;
    for (var idx in this.manageType) {
      if (this.manageType[idx].type === this.reqParams.manageType) {
        typeIndex = idx;
      } else {
      }
    }

    // noticeParam 은 기존코드 복사 중 함께 복사 되었으나, 최종값을 사용하지 않는다.
    var noticeParam = {
      voiceShown: true,   // 음성통화 수신 요금 안내 노출 여부
      ableShown: true,
      attentionShown: false,  // 로밍 시 국가별 주의사항 노출 여부
      svcAttention: _result.svcAttention, // 로밍 시 국가별 주의 사항 내용
      hanaroMtCharge: _result.hanaroMtCharge, // 음성통화 수신 요금 sk브로드밴드
      dacomMtCharge: _result.dacomMtCharge,   // 음성통화 수신 요금 LG U+
      ktMtCharge: _result.ktMtCharge,         // 음성통화 수신 요금 KT
      onseMtCharge: _result.onseMtCharge      // 음성통화 수신 요금 세종텔레콤
    };

    // svcAttention 내용 대치. 현재는 PC웹 기준의 HTML fragment 가 와서 살며시 대치한다. (2020-10-05 추가)
    noticeParam.svcAttention = noticeParam.svcAttention.replace(
      /국제전화사업자선택 <a .*?<\/a>/,
      '<p><a class="lo" href="/product/callplan?prod_id=TW61000002">국제전화 사업자 선택 자세히 보기</a></p>');

    if (this.reqParams.manageType === 'L') {  // 서비스 방식이 LTE인 경우
      _result.lteShown = true;    // LTE 안내 사항 노출 및 음성 '서비스 이용 불가' 문구 변경
      noticeParam.voiceShown = false;
    } else if (this.reqParams.manageType === '') { // 서비스 방식이 임대로밍 인 경우
      _result.rentShown = true;   // 임대로밍 안내사항 노출
    } else if (this.reqParams.manageType === 'C') {   // 서비스 방식이 2G인 경우
      if (_result.dMoChargeMin) {       //데이터 이용료가 있는 경우
        _result.cdmaUnit = true;
        _result.mTxtCharge = _result.dMoChargeMin;
        _result.mMtmCharge = _result.dMoChargeMin;
      }
    }

    var chargeWhenConnected = ['CAN', 'MEX']; // 통화가 연결된 후 요금 청구되는 국가 리스트
    if (chargeWhenConnected.indexOf(_result.countryCd) !== -1) {
      _result.isChargeWhenConnected = true;
    }

    if (_result.ableAreaType === 'A') {   // 이용가능 지역 상세보기 여부
      noticeParam.ableShown = false;
    }

    _result.dMoChargeMin = Number(_result.dMoChargeMin);    // 데이터 이용료
    _result.mTxtCharge = Number(_result.mTxtCharge);       // MMS-텍스트 발신
    _result.mMtmCharge = Number(_result.mMtmCharge);       // MMS 멀티미디어 발신
    noticeParam.attentionShown = (_result.svcAttention) ? true : false;

    if (typeIndex === null || typeIndex === '') {
      typeIndex = -1;
    }

    // var currentType = this.manageType[typeIndex].txt; // 현재 선택된 서비스명 e.g. '3G 자동로밍'

    $('#attentionList').html(noticeParam.svcAttention);

    if (_result.dMoChargeMin) {
      $('#dataCharge').html(_result.dMoChargeMin + '원');
    } else {
      $('#dataCharge').html('-');
    }

    if (_result.vIntChargeMin) {
      $('#voiceChargeOut').html(_result.vIntChargeMin + '원');
    } else {
        $('#voiceChargeOut').html('-');
    }

    if (_result.vMoChargeMin) {
      $('#voiceChargeLocal').html(_result.vMoChargeMin + '원');
    } else {
      $('#voiceChargeLocal').html('-');
    }

    if (_result.vMtChargeMin) {
      $('#voiceChargeIncoming').html(_result.vMtChargeMin + '원');
    } else {
      $('#voiceChargeIncoming').html('-');
    }

    $('#voiceSKB').html(_result.hanaroMtCharge || '-');
    $('#voiceLGU').html(_result.dacomMtCharge || '-');
    $('#voiceKT').html(_result.ktMtCharge || '-');
    $('#voiceOS').html(_result.onseMtCharge || '-');
    $('#voiceAddon').html(_result.suplSvcNm);

    if (_result.sMoChargeMin) {
      $('#smsOut').html(_result.sMoChargeMin + '원');
    } else {
      $('#smsOut').html('-');
    }

    if (_result.mTxtCharge) {
      $('#mmsTextOut').html(_result.mTxtCharge + '원');
    } else {
      $('#mmsTextOut').html('-');
    }

    if (_result.mMtmCharge) {
      $('#mmsMediaOut').html(_result.mMtmCharge + '원');
    } else {
      $('#mmsMediaOut').html('-');
    }

    $('#mmsTextOutUnit').text(_result.cdmaUnit ? '패킷' : '건');
    $('#mmsMediaOutUnit').text(_result.cdmaUnit ? '패킷' : '건');

    // 서비스 국가가 러시아이고, 3G인 경우 안내팝업 호출
    if (this.reqParams.manageType === 'W' && this.reqParams.countryCd === 'RUS') {
      Tw.Popup.close();
      Tw.Popup.open({
        hbs: 'RM_10',
        layer: true
      }, function (l) {
        l.on('click', '.bt-red1', Tw.Popup.close);
        l.on('click', '.fe-rm-center', function () {
          Tw.Popup.close();
          setTimeout(function () {
            window.location.href = '/product/roaming/info/center';
          }, 300);
        });
      }, null, null, $(event.currentTarget));
      popupPresented = true;
    }

    // 팔라우, 세이셸, 마다가스카르의 국가의 경우 공지팝업 호출
    if (_result.dablYn === 'Y') {
      var popupDesc = _result.dablCtt;

      Tw.Popup.open({
        'pop_name': 'type_tx_scroll',
        'title': Tw.ROAMING_ERROR.TITLE,
        'title_type': 'sub',
        'cont_align': 'tl',
        'contents': popupDesc,
        'bt_b': Tw.ROAMING_ERROR.BUTTON
      }, null, Tw.Popup.close, null, $(event.currentTarget));
      popupPresented = true;
    }

    // 검색 결과 division 으로 자동 스크롤. 단, 팝업이 뜬 경우는 제외한다.
    var resultY = this.$container.find('.rate-result').offset().top;
    if (resultY && !popupPresented) {
      $([document.documentElement, document.body]).animate({
        scrollTop: resultY - 50 // 50px 는 appbar 의 높이
      }, 180, function () {});
    }
  }
};
