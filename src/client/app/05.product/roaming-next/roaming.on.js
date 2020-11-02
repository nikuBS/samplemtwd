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
  this.$country = country;
  this.$currentTariff = currentTariff;
  this.$usage = usage;
  this.$loginAvailable = loginAvailable;
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
};

Tw.RoamingModeOn.prototype = {
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
    var localDate = moment(timestamp).add(timezoneOffset, 'hour');

    var id = 'dialogUsage';
    var template = Handlebars.compile($('#tpl-dialog-usage').html());
    document.getElementById('modals').innerHTML += template({
      id: id,
      prodId: prodId,
      prodNm: prodNm,
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
  }
};
