/**
 * @file roaming.menu.js
 * @desc T로밍 서브메뉴들에서 로밍모드일 때 표시되는 메뉴
 * @author 황장호
 * @since 2020-09-30
 */

Tw.RoamingMenu = function (rootEl) {
  this.$container = rootEl;
  this.$switchOffIndex = 0;
  this.$switchOffTimer = null;
  this.bindEvents();
};

Tw.RoamingMenu.prototype = {
  /**
   * 로밍모드 on/off 여부를 판단하여 좌상단 버거 메뉴 설치
   */
  install: function () {
    var container = this.$container;
    //$('#header').hide();   //웹접근성 작업으로 기존 소스 삭제

    var roamOff = Tw.CommonHelper.getSessionStorage('ROAMING_OFF');
    var mcc = Tw.CommonHelper.getSessionStorage('ROAMING_MCC');

    /**
     * MCC 값과 로밍모드 OFF 여부에 따라, 로밍모드 전용 메뉴를 보여줄지 기존 메뉴를 보여줄지 판단하는 부분.
     * 공통 스크립트의 경우 transform: translate(0px, -2100px) 식으로 스크롤바를 숨기지만,
     * 로밍모드 메뉴의 경우, 단순히 display: none으로 기존 화면($rootEl)을 숨긴다.
     */
    if (mcc && mcc !== '450' && roamOff !== 'Y') { // 해외여서 로밍모드 메뉴 출력
      $('#appbar .menu, #header').on('click', function () {  //  기존 appbar  => 공통 header 로 변경됨에 따라 #header 추가해줌
        $('#roamingMenu').css('display', 'block');
        container.css('display', 'none');

        $('#roamingMenu .header .login').on('click', function (e) {
          new Tw.TidLandingComponent().goLogin('/product/roaming');
          e.stopPropagation();
        });
      });
      $(document).on('click', '#roamingMenu .header .close', function () {
        $('#roamingMenu').css('display', 'none');
        $('#fe-close').click();
        container.css('display', 'inherit');
      });
      $('#common-menu').hide();
    } else {
      // 로밍모드가 아닐 경우, T 월드 기존 버거 메뉴를 열기 위해 _onGnbBtnClicked 호출
      // var menu = new Tw.MenuComponent();
      // $('#header').on('click', function () {
      //   menu._onGnbBtnClicked();
      // });
    }
  },
  /**
   * 이벤트 핸들러
   */
  bindEvents: function() {
    // 로밍모드 강제 OFF 핸들러
    $(document).on('click', '#roamingMenu .mode .switch', $.proxy(this.confirmOff, this));
    // 로밍모드 홈 링크
    $(document).on('click', '#roamingMenu .sticky-menu .menu.home', $.proxy(this.showHome, this));
    // 나의 T로밍 이용현황 링크
    $(document).on('click', '#roamingMenu .sticky-menu .menu.myuse', $.proxy(this.showMyServices, this));
    // 로그아웃 링크 (현재 사용되지 않음. SB 참조)
    $(document).on('click', '#roamingMenu .logout-anchor', $.proxy(this.logout, this));
  },
  /**
   * 로밍모드 메뉴 내의 작은 모달 다이얼로그를 닫았을 때
   *
   * @param id 다이얼로그 division id
   * @param container 다이얼로그를 포함하고 있는 컨테이너 id
   * @param callback 후처리 콜백
   */
  dismiss: function (id, container, callback) {
    $('#' + id).hide();
    if (!container) {
      container = 'roamingMenu';
    }
    document.getElementById(container).removeChild(document.getElementById(id));

    if (callback) {
      callback();
    }
  },
  /**
   * 작은 모달 다이얼로그 표시 (진입팝업 등)
   *
   * @param id 다이얼로그 division id
   * @param onDismiss 모달 close 콜백
   * @param container 모달을 포함하는 division id
   */
  showModal: function (id, onDismiss, container) {
    var t = this;
    $('#' + id).on('click', function (e) {
      if (e.target === document.getElementById(id)) {
        t.dismiss(id, container);
        if (onDismiss) {
          onDismiss();
        }
      }
    });
    $('#' + id + ' .close').on('click', function () {
      t.dismiss(id, container);
      if (onDismiss) {
        onDismiss();
      }
    });
    $('#' + id).show();
  },
  /**
   * 로밍모드 홈 링크 핸들러
   */
  showHome: function () {
    var mcc = Tw.CommonHelper.getSessionStorage('ROAMING_MCC');
    if (mcc) {
      document.location.href = '/product/roaming/on?mcc=' + mcc;
    }
  },
  /**
   * 나의 T로밍 이용현황 링크 핸들러
   */
  showMyServices: function () {
    document.location.href = '/product/roaming/my-use';
  },
  /**
   * 로밍모드 OFF 링크 핸들러. 정말로 OFF 할 것인지 묻는 모달 다이얼로그를 표시한다.
   */
  confirmOff: function () {
    var thumb = $('#thumb');
    thumb.removeClass('thumb-on');
    thumb.addClass('thumb-off');

    var id = 'dialogOff';
    var template = Handlebars.compile($('#tpl-dialog-off').html());
    document.getElementById('roamingMenu').innerHTML += template({id: id});

    $('#' + id + ' .buttons a').on('click', $.proxy(this.switchOff, this));

    this.showModal(id, function () {
      var thumb = $('#thumb');
      thumb.removeClass('thumb-off');
      thumb.addClass('thumb-on');
    });
  },
  /**
   * 로밍모드 OFF 시 호출.
   * ROAMING_OFF 에 Y 를 넣고, 로밍모드가 꺼지는 연출(#roamingOff)을 시작한다.
   */
  switchOff: function () {
    Tw.CommonHelper.setSessionStorage('ROAMING_OFF', 'Y');
    Tw.CommonHelper.setCookie('ROAMING_MCC', '0', -1);

    this.dismiss('dialogOff');
    var id = 'roamingOff';
    var template = Handlebars.compile($('#tpl-switch-off').html());
    document.getElementById('roamingMenu').innerHTML += template({id: id});
    // 로밍모드 종료 화면 표시
    $('#roamingOff').show();
    var circles = $('#roamingOff .progress span');
    var T = this;
    // 로밍모드 종료 화면의 애니메이션
    this.$switchOffTimer = setInterval(function () {
      if (T.$switchOffIndex > 0) {
        circles[T.$switchOffIndex - 1].className = 'circle off';
      }
      // 중앙의 원 4개가 차례대로 켜진다.
      circles[T.$switchOffIndex].className = 'circle on';
      T.$switchOffIndex += 1;
      if (T.$switchOffIndex >= 4) {
        clearInterval(T.$switchOffTimer);
        setTimeout(function () {
          // 다 켜지면, 로밍메인으로 이동
          document.location.href = '/product/roaming';
        }, 250);
      }
    }, 500);
    return false;
  },
  /**
   * 로그아웃 핸들러
   */
  logout: function () {
    var tidLanding = new Tw.TidLandingComponent();
    tidLanding.goLogout();
    return false;
  },
  /**
   * 공통 메뉴 오픈 시, 이를 가로채서 로밍모드 메뉴를 표시할 필요가 있는지 확인하는 함수.
   */
  checkInterceptMenu: function () {
    var turnOff = Tw.CommonHelper.getSessionStorage('ROAMING_OFF');
    var mcc = Tw.CommonHelper.getSessionStorage('ROAMING_MCC');
    if (mcc && mcc !== '450' && turnOff !== 'Y') {
      this.openRoamingMenu();
      return true;
    }
    return false;
  },
  /**
   * 로밍모드 메뉴 오픈
   */
  openRoamingMenu: function () {
    $('#roamingMenu').css('display', 'block');
    $('.wrap').css('display', 'none');
    $('#roamingMenu .header .login').on('click', function (e) {
      new Tw.TidLandingComponent().goLogin('/product/roaming');
      e.stopPropagation();
    });

    $(document).on('click', '#roamingMenu .header .close', function () {
      $('#roamingMenu').css('display', 'none');
      $('#fe-close').click();
      $('.wrap').css('display', 'inherit');
    });
  }
};

/**
 * client/component/menu.component.js 280라인에서 호출될 함수.
 * 공통 버거메뉴 오픈 시, 이를 가로채서 로밍모드 확인을 할 필요가 있는지 확인하는 함수.
 */
/*exported checkInterceptMenu */
function checkInterceptMenu() {
  new Tw.RoamingMenu(null).checkInterceptMenu();
}
