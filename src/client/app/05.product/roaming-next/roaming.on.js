/**
 * @file roaming.on.js
 * @desc T로밍 > 로밍모드
 * @author 황장호
 * @since 2020-09-30
 */

Tw.RoamingModeOn = function (rootEl, country, currentTariff, usage, loginAvailable) {
  if (Tw.CommonHelper.getSessionStorage('ROAMING_OFF') === 'Y') {
    // 로밍모드 명시적 OFF 이면 로밍메인으로 튕김
    document.location.href = '/product/roaming';
    return;
  }
  // 아래 코드는 확인사살. product.roaming-mode.js 에서 SessionStorage 에 값을 넣었으나,
  // 메인을 거치지 않고 진입한 특수 케이스를 커버해주기 위해 다시 넣는다.
  // 예를들어 주소창에 직접 $host/product/roaming/on?mcc=222 이렇게 입력해서 들어오는 경우가 있다.
  Tw.CommonHelper.setSessionStorage('ROAMING_MCC', country.mcc);

  // 쿠키도 구워 놓는 이유는 BE 인증세션에 MCC 전달하기 위함이며 그 외에는 사용하지 않음.
  // FIXME: 현재는 로그인 없이 로밍모드를 사용하지 못하여, 로그인 시 BE가 MCC를 전달 받을 기회가 없다.
  //        그러므로 OP002-10123 를 폐기하고 ROAMING_MCC 를 쿠키에 굽지 않아야 깔끔하다.
  Tw.CommonHelper.setCookie('ROAMING_MCC', country.mcc);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.$country = country;
  this.$currentTariff = currentTariff;
  this.$usage = usage;
  this.$loginAvailable = loginAvailable;
  // this._commonHelper = Tw.CommonHelper;
  this.cachedElement();
  this.bindEvents();
  this.$menu = new Tw.RoamingMenu(rootEl);
  this.$menu.install();

  var baseDiv = '#roamingOn';
  this.$baseDiv = baseDiv;
  this.$schedule = new Tw.RoamingSchedules(rootEl, {}, baseDiv, function() {
    $('#scheduleDialog').css('display', 'none');
    $(baseDiv).css('display', 'block');
    $(baseDiv).addClass('wrap');
  });

  this.fillBackgroundImage();
  this.setup();

  // 로그인 true && 가입된 요금제 그룹이 없거나 null, 요금제 가입 했지만 이용중이 아닐때 실행 또는 요금제 가입 했지만 이용중이면서 그룹이 2,4,8이 아닐때 스크롤 이벤트 처리
  // if (loginAvailable  && ((currentTariff && usage.phone.roUseTariffNow && !(currentTariff.group === 2 || currentTariff.group === 4 || currentTariff.group === 8)))) {
  if (loginAvailable && (Tw.FormatHelper.isEmpty(currentTariff) || currentTariff === 'null' || currentTariff && !usage.phone.roUseTariffNow || 
  (currentTariff && usage.phone.roUseTariffNow && !(currentTariff.group === 2 || currentTariff.group === 4 || currentTariff.group === 8)))) {
    this.initScrollSms(); // T로밍 SMS/MMS 사용 요금 안내의 실시간 문자 요금 조회를 위한 스크롤 이벤트 함수
  }
  // $.proxy(this.initScrollSms(), this); // T로밍 SMS/MMS 사용 요금 안내의 실시간 문자 요금 조회를 위한 스크롤 이벤트 함수
};

Tw.RoamingModeOn.prototype = {

  /**
   * @function
   * @desc Cache elements for binding events.
   * @returns {void}
   */
  cachedElement: function () {
    this.elemBillSmsArea = this.$container.find('.fe-bill-sms-area'); // T로밍 SMS/MMS 사용 요금 안내 카드 영역의 실시간 요금 노출하는 영역과 조회중 노출하는 영역을 함께 쓰는 클래스
    this.elemBillSms = this.$container.find('#fe-bill-sms'); // 조회 후 문자 실시간 문자 요금 적용할 부분
  },

  /**
   * 이벤트 핸들러
   */
  bindEvents: function () {
    // 하단 정보 카드 토글
    $('.card-toggle .toggle').on('click', $.proxy(this.toggleInfo, this));
  },
  /**
   * 높은 디자인 요구사항을 맞추기 위해 들어간 함수.
   * 기기별로 조금씩 이미지가 다르게 표시될 필요가 없다면 불필요하다.
   */
  fillBackgroundImage: function () {
    // 국가 배경 이미지를 적절히 crop 하여 배치
    // 각 배경 이미지들은 어드민에 있어서, 이미지 비율이 일정할 것이라 신뢰할 수 없기 때문에,
    // 아래와 같이 width / height aspectRatio를 계산하고, 넘치는 부분에 대해 crop 한다.
    var url = this.$country.backgroundUrl;
    var backgroundImage = new Image();
    backgroundImage.onload = function () {
      var container = document.getElementById('roamingOn');
      var scaleFactor = this.height / this.width;

      var width = container.clientWidth;
      if (width > 480) {
        // 기기 너비가 아무리 넓어도 480px 넘는 경우를 지원할 이유가 없어서 480px 에서 커트
        // 커트하지 않으면, 배경이미지가 화면을 꽉 채운다. (물론 PC웹에서만)
        // 테블릿은 고려하지 않았다.
        width = 480;
      }

      var realHeight = Math.floor(width * scaleFactor);
      var offsetY = 0;
      if (realHeight > 400) {
        // 배경이미지가 상단으로부터 400px 이상 표시되지 않는 것이 디자인 요구사항이라 아래와 같이 커트
        offsetY = 400 - realHeight;
      }

      container.style.backgroundImage = 'url(\'' + url + '\')';
      container.style.backgroundRepeat = 'no-repeat';
      container.style.backgroundSize = width + 'px ' + realHeight + 'px';
      container.style.backgroundPositionY = offsetY + 'px';
    };
    backgroundImage.src = url;
  },
  /**
   * 진입팝업모달이 표시될 필요가 있는지 확인하여 팝업 노출
   */
  checkLandingPopup: function () {
    // 진입팝업 표시
    var lsValue = Tw.CommonHelper.getLocalStorage('ROAMING_POPUP');
    if (lsValue) {
      // LocalStorage 는 '오늘 하루 안보기' 했을 경우에만 사용
      // 공통함수 getLocalStorageExpire는 timezone 정보가 무시되는 버그가 있어 아래와 같이 자체 구현하였다.
      var expireTime = moment(JSON.parse(lsValue).expireTime);
      if (expireTime.diff(moment()) > 0) {
        return;
      }
      Tw.CommonHelper.removeLocalStorage('ROAMING_POPUP');
    }
    if (Tw.CommonHelper.getSessionStorage('ROAMING_POPUP')) {
      // SessionStorage 는 일반적으로 닫았을 때
      return;
    }

    // 로그인 했고, 로밍 가능한 국가인 경우
    if (this.$loginAvailable) {
      // 이용중인 요금제가 없을 때
      if (!this.$currentTariff) {
        this.showWelcome();
      }
      // 요금제가 있고, 아직 이용예정일 경우 사용시간 변경 팝업
      if (this.$currentTariff && this.$currentTariff.startDate && this.$currentTariff.status === 0) {
        this.showTariff(
          this.$currentTariff.prodId,
          this.$currentTariff.prodNm,
          moment(this.$currentTariff.startDate).toDate().getTime(),
          parseInt(this.$country.timezoneOffset, 10)
        );
      }
    }
  },
  /**
   * '추천 요금제 보기' 버튼 클릭 핸들러
   * @param e EventObject
   * @private
   */
  _handleOffer: function(e) {
    this.$schedule.openScheduleDialog(
      this.$country.code,
      this.$country.name,
      this.$country.backgroundMiniUrl,
      this.$baseDiv
    );
    e.stopPropagation();
  },
  /**
   * 화면 데이터 초기화 함수
   */
  setup: function() {
    var target = '/product/roaming';
    var landing = new Tw.TidLandingComponent();

    $('#login').on('click', function(e) {
      landing.goLogin(target);
      e.stopPropagation();
    });
    $('#slogin').on('click', function(e) {
      landing.goSLogin(target);
      e.stopPropagation();
    });
    $('#signup').on('click', function(e) {
      landing.goSignup();
      e.stopPropagation();
    });
    $('#offer').on('click', $.proxy(this._handleOffer, this));

    var now = moment();
    if (now.utcOffset() !== 540) { // 한국이 아니면 utcOffset 조정
      now = now.add(540 - now.utcOffset(), 'minutes');
    }
    // 화면 상단 국내 시각 표시
    $('#timeKorea').html(now.format('YYYY. M. D. HH:mm'));
    // 화면 상단 현지 시각 표시
    $('#timeLocal').html(now.add(this.$country.timezoneOffset, 'hours').format('YYYY. M. D. HH:mm'));

    // 요금제 기간에 따라 1) 이용예정 2) 이용중 3) 이용완료 로 상태가 나뉘며,
    // 이 상태값에 따라 UI 처리
    var status = 1;
    if (this.$currentTariff && this.$currentTariff.status === 2) {
      status = 2;
      this.markAsDone();
    }
    if (this.$currentTariff && this.$currentTariff.status === 0) {
      status = 0;
      this.markAsReserved();
    }

    var proxy = this;
    setTimeout(function() {
      proxy.checkLandingPopup();
    }, 500);

    if (document.getElementById('chart-data')) {
      // 차트 생성
      var chartData = new ProgressBar.Circle('#chart-data', {
        easing: 'easeInOut',
        strokeWidth: 7,
        color: status === 2 ? '#999999' : '#607dff'
      });
      var chartPhone = new ProgressBar.Circle('#chart-phone', {
        easing: 'easeInOut',
        strokeWidth: 7,
        color: status === 2 ? '#999999': '#7e82ff'
      });

      if (this.$usage.data && this.$usage.baro) {
        var dataUsage = this.$usage.data;
        var baroUsage = this.$usage.baro;

        if (dataUsage.code) {
          if (dataUsage.code === '-') {
            // 오류 발생시, 에러코드가 '-' 이면, 메시지를 차트 내부에 표시하고
            $('#dataMessage').html(dataUsage.msg);
          } else {
            // 그렇지 않으면 에러코드 자체를 표시한다.
            $('#dataMessage').html(dataUsage.code);
          }
          chartData.animate(1.0);
          setTimeout(function () {
            var measuredHeight = document.getElementById('dataMessage').offsetHeight;
            if (measuredHeight > 0) {
              document.getElementById('dataMessage').style.top = ((100 - measuredHeight) / 2 + 1) + 'px';
            }
          }, 150);

          $('#dataChartContainer .label').html('');
          $('#dataChartContainer .value-max').html('');
        } else if (dataUsage.used) {
          chartData.animate(parseFloat(dataUsage.used) / parseFloat(dataUsage.total));
        }

        if (baroUsage.code) {
          $('#baroMessage').html(baroUsage.code);
          chartPhone.animate(1.0);
          setTimeout(function () {
            var measuredHeight = document.getElementById('baroMessage').offsetHeight;
            if (measuredHeight > 0) {
              document.getElementById('baroMessage').style.top = ((100 - measuredHeight) / 2 + 1) + 'px';
            }
          }, 150);
          $('#phoneChartContainer .label').html('');
          $('#phoneChartContainer .value-max').html('');
        } else {
          chartPhone.animate(1.0);
        }
      }
    }
  },
  /**
   * 이용 완료인 경우, 카드 전체를 회색으로 표시
   */
  markAsDone: function () {
    $('#content .data-usages h2').css('color', '#999999');
    $('#content .data-usages h4').css('color', '#999999');
    $('#content .data-usages .status').css('color', '#999999');
    $('#content .data-usages .value').css('color', '#999999');
    $('#content .data-usages .value-max').css('color', '#999999');
    $('#content .data-usages .message').css('color', '#999999');
    $('#content .data-usages .label').css('color', '#999999');
  },
  /**
   * 이용 예정인 경우, status를 회색으로 표시
   */
  markAsReserved: function () {
    $('#content .data-usages .status').css('color', '#999999');
  },
  /**
   * 하단 콜센터 토글 핸들러
   * @param e EventObject
   */
toggleInfo: function (e) {
    e = e.currentTarget;
    var id = e.parentElement.id;
    var imagePrefix = Tw.Environment.cdn + '/img/product/roam/ico_';
    var imageSuffix = '.svg';
    $('#' + id + ' .info').toggle('blind', {}, 250, function () {
      var info = $('#' + id + ' .info')[0];
      var hidden = info.style.display === 'none';
      $('#' + id + ' .toggle img').attr('src', imagePrefix + (hidden ? 'expand' : 'collapse') + imageSuffix);
      $('#' + id + ' .curtain').css('display', hidden ? 'block' : 'none');
    });
  },
  /**
   * 진입팝업 - 요금제 가입 유도 모달 표시
   */
  showWelcome: function () {
    // 진입팝업 표시
    var id = 'dialogWelcome';
    var template = Handlebars.compile($('#tpl-dialog-welcome').html());
    document.getElementById('modals').innerHTML += template({id: id});
    $(document).on('click', '#' + id + ' .buttons a', $.proxy(this._handleWelcome, this));
    $(document).on('click', '#' + id + ' .content .today', $.proxy(this._handleCloseToday, this, id));
    this.$menu.showModal(id, this.preventSession, 'modals');
  },
  /**
   * 진입팝업에서 '나에게 맞는 요금제 보기' 선택시
   * @private
   */
  _handleWelcome: function() {
    this.$menu.dismiss('dialogWelcome', 'modals', this.preventSession);
    this.$schedule.openScheduleDialog(this.$country.code, this.$country.name,
      this.$country.backgroundMiniUrl, this.$baseDiv);
  },
  /**
   * 모달 close 핸들러
   * @param dialogId 다이얼로그 id
   * @private
   */
  _handleClose: function(dialogId) {
    this.$menu.dismiss(dialogId, 'modals', this.preventSession);
  },
  /**
   * 모달 close 핸들러 (오늘 하루 보지 않기)
   * @param dialogId 다이얼로그 id
   * @private
   */
  _handleCloseToday: function(dialogId) {
    this.$menu.dismiss(dialogId, 'modals', this.preventToday);
  },
  /**
   * 진입팝업 - 이용 예정인 케이스의 모달 표시
   * @param prodId 요금제 원장 id
   * @param prodNm 요금제 이름
   * @param timestamp 요금제 시작일
   * @param timezoneOffset 한국과의 시차 (시간)
   */
  showTariff: function (prodId, prodNm, timestamp, timezoneOffset) {
    // 진입팝업 (이용예정) 표시
    var baseDate = moment(timestamp);
    if (baseDate.utcOffset() !== 540) { // 한국이 아니면 utcOffset 조정
      baseDate.add(540 - baseDate.utcOffset(), 'minutes');
    }
    var localDate = moment(baseDate).add(timezoneOffset, 'hours');

    var id = 'dialogUsage';
    // var changeUrl = '/product/roaming/setting/roaming-auto'

    // 개시일/종료일 성정하는 요금제 목록
    // if (Tw.ROAMING_CHANGE_PROD_ID.indexOf(prodId) !== -1) {
    //   changeUrl = '/product/roaming/setting/roaming-setup';
    // }
    
    var template = Handlebars.compile($('#tpl-dialog-usage').html());
    // this.$currentTariff.changeDate 은 요금제 설정 변경 url
    document.getElementById('modals').innerHTML += template({
      id: id,
      prodId: prodId,
      prodNm: prodNm,
      changeDate: this.$currentTariff.changeDate,
      timeLocal: localDate.format('YY.MM.DD HH') + '시',
      timeKorea: baseDate.format('YY.MM.DD HH') + '시'
    });
    $(document).on('click', '#' + id + ' .buttons a', $.proxy(this._handleClose, this, id));
    $(document).on('click', '#' + id + ' .content .today', $.proxy(this._handleCloseToday, this, id));
    this.$menu.showModal(id, this.preventSession, 'modals');
  },
  /**
   * 진입팝업을 정상적으로 닫았을 때
   */
  preventSession: function () {
    // 팝업 닫을 때
    Tw.CommonHelper.setSessionStorage('ROAMING_POPUP', 'NO');
  },
  /**
   * 진입팝업을 '오늘 하루 안보기' 통해 닫을 때
   */
  preventToday: function () {
    // LocalStorage 코드에 버그가 생겼을 때 팝업이 계속 뜨는 것을 방지하기 위한 방어코드
    Tw.CommonHelper.setSessionStorage('ROAMING_POPUP', 'NO');

    // setLocalStorageExpire 공통함수에 timezone이 무시되는 버그가 발견되어, 아래와 같이 자체 구현하였다.
    var due = moment().add(1, 'day').hours(0).minutes(0).seconds(0);
    Tw.CommonHelper.setLocalStorage('ROAMING_POPUP', JSON.stringify({
      value: 'NO',
      expireTime: due.toDate()
    }));
  },

  /**
   * 스크롤 감지하여 BFF API 호출
   */
  initScrollSms: function () {

    var scrolling = true; // 스크롤 할때마다 BFF API를 호출하지 않기 위하여
    $(window).on('scroll', $.proxy(function () {  // 스크롤 이벤트

      if (scrolling && this.checkSmsTag(this.elemBillSmsArea)) { // 
        // 실시간 SMS 요금 확인을 위한 BFF APi 호출 함수 호출(여러번?)
        $.proxy(this.requestBillSms(), this);
        // 로딩바 이미지 시작

        scrolling = false;
      }

    }, this)); // end of 스크롤 이벤트


  },

  /**
   * @function
   * @desc Scroll 내린 지점을 계산하여 리턴(SMS 실시간 요금 조회 API 호출을 위하여)
   * @param elm 실시간 문자 요금 조회 영역
   * @private
   */
  checkSmsTag: function(element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height() / 1.2;
    var elemTop = element.eq(1).offset().top; // fe-bill-sms-area 클래스의 두번째꺼 선택해야만 offset top 값이 정상적으로 나옴
    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
},

  /**
   * @function
   * @desc 실시간 SMS 요금 조회 요청 (count:0)
   * @private
   */
  requestBillSms: function() {
    // 로딩바 시작
    Tw.CommonHelper.startLoading('.rm-mod-loading', true);
    this._requestCount = 0;
    var params = { count: this._requestCount++ }; // 최초 요청시 count:0으로 요청, 1:결과확인 (API 문서 참조할 것), gubun 인풋값은 디폴트 당월

    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, params)
      .done($.proxy(this.getBillSmsResponse, this))
      .fail($.proxy(this.onErrorReceivedBillData, this));

  },

  /**
   * @function
   * @desc 실시간 SMS 요금 조회 결과보기 (count:1 이상), 결과보기용, (대기시간 필요: 전월 5초, 당월 2.5초), 최대 count:4까지 호출 후 결과 없으면 에러코드 리턴됨
   * @param resp count:0 일때 빈객체
   * @private
   */
  getBillSmsResponse: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      setTimeout($.proxy(function () {
        var params = { count: this._requestCount++ }; // 최초 요청 후 count:1 이상이 입력 됨(결과보기)

        this._apiService
          .request(Tw.API_CMD.BFF_05_0022, params)
          .done($.proxy(this.onReceivedBillData, this))
          .fail($.proxy(this.onErrorReceivedBillData, this));
      }, this), 2500);

    } else {
      this._onErrorReceivedBillData(resp);  // 
    }
  },

  /**
   * @function
   * @desc 실시간 SMS 요금 조회 최종 결과
   * @param resp count:1 이상 일때의 실제 결과 데이터 값
   * @private
   */
  onReceivedBillData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( !resp.result || !resp.result.hotBillInfo || !resp.result.hotBillInfo[0].record1 ) {
        this.getBillSmsResponse(resp); // 최대 count:4까지 호출 후 결과 없으면 에러코드 리턴됨
        return;
      }
      var billData = resp.result.hotBillInfo[0].record1;

        var smsBill = _.find(billData, function(item) {
          return (item.billItmSclNm === '로밍서비스이용료') && (item.billItmNm === '로밍문자발신요금') ;
        });

        // var smsBill = _.find(billData, function(item) {  // 테스트용_실시간 문자 요금을 받아 올 수 없기 때문에
        //   return (item.billItmSclNm === '부가가치세(세금)*') && (item.billItmNm === '부가세총액*') // 임시로 데이터통화료 로 테스트??
        // });


        Tw.CommonHelper.endLoading('.rm-mod-loading'); // 로딩바 종료
        if (smsBill && smsBill.invAmt2) {
          $.proxy(this._renderBillGroup(smsBill.invAmt2), this);  // 화면에 그려주기
        } else {
          $.proxy(this._renderBillGroup(false), this);  // API 리턴값의 비교항목 "로밍서비스이용료" 와 "로밍문자발신요금"가 없을 때 false로 전달
        }
        
      // }
    } else {  // resp.code !== '00'이 아닌 경우
      this._onErrorReceivedBillData(resp);
    }
  },

  /**
   * @function
   * @desc 실시간 SMS 요금 정보를 문자 조회 중 영역에 노출
   * @param sms sms 요금
   * @private
   */
  _renderBillGroup: function (smsBill) {
    // 찾은 금액으로 해당 요금 보여주고 영역 노출 시키기
    this.elemBillSmsArea.toggle();  // 조회 중 영역 없애고 실시간 문자 요금 영역 노출
    // this.elemBillSms.text(smsBill + '원'); // 조회 후 문자 실시간 문자 요금 적용
    smsBill ? this.elemBillSms.text(smsBill + '원') : this.elemBillSms.text('0원'); // 조회 후 문자 실시간 문자 요금 적용, smsBill이 false이면 0원노출
    // $('.fe-sms-box').html('서버 오류로 조회되지 않습니다.') //
  },

  /**
   * @function
   * @desc Error callback for API requests(_onErrorReceivedBillData, _onReceivedBillData)
   * @param resp
   * @private
   */
  _onErrorReceivedBillData: function (resp) {
    Tw.CommonHelper.endLoading('.rm-mod-loading');
    this.elemBillSmsArea.toggle();  // 조회 중 영역 없애고 실시간 문자 요금 영역 노출
    this.elemBillSms.addClass('rm-tx-color fs13').text('현재 실시간 사용요금 조회가 불가합니다.');
    // this.elemBillSms.text('현재 실시간 사용요금 조회가 불가합니다.'); // API 조회 실패 시 노출되는 내용
    // if ( resp.code === 'ZINVE8106' ) {  // ZINVE8106: BILL_NOT_AVAILABLE
    //   Tw.Error(resp.code, Tw.HOTBILL_ERROR.ZINVE8106).replacePage();
    // } else if ( resp.code === 'ZINVE8888' ) { // ZINVE8888: BIIL_NOT_REQUESTED
    //   Tw.Error(resp.code, Tw.HOTBILL_ERROR.ZINVE8888).replacePage();
    // } else {
      // 애러시 노출되는 항목이 없어 alert 후 goBack 처리 필요. 공통함수(Tw.Error) 사용 불가.
    // this._popupService.openAlert(Tw.ROAMING_ERROR.ON_SMSBILL.MSG, Tw.ROAMING_ERROR.ON_SMSBILL.TITLE, null, $.proxy(this._goBackOnError, this));
    // }
    // this.elemBillSms.text(smsBill + '원'); // 조회 후 문자 실시간 문자 요금 적용
  },

  /**
   * @function
   * @desc Go to the previous page on Error.
   * @private
   */
  // _goBackOnError: function () {
  //   this._historyService.goBack();
  // }


};
