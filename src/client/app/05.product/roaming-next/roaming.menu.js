/**
 * @file roaming.menu.js
 * @desc T로밍 서브메뉴들에서 로밍모드일 때 표시되는 메뉴
 */

Tw.RoamingMenu = function (rootEl) {
  this.$container = rootEl;
  this.$switchOffIndex = 0;
  this.$switchOffTimer = null;
  this.bindEvents();
};

Tw.RoamingMenu.prototype = {
  install: function () {
    // 로밍모드 on/off 여부에 따라 좌상단 메뉴 설치
    var container = this.$container;
    $('#header').hide();

    var roamOff = Tw.CommonHelper.getSessionStorage('ROAMING_OFF');
    var mcc = Tw.CommonHelper.getSessionStorage('ROAMING_MCC');

    if (mcc && mcc !== '450' && roamOff !== 'Y') {
      $('#appbar .menu').on('click', function () {
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
      var menu = new Tw.MenuComponent();
      $('#appbar .menu').on('click', function () {
        menu._onGnbBtnClicked();
      });
    }
  },
  bindEvents: function() {
    $(document).on('click', '#roamingMenu .mode .switch', $.proxy(this.confirmOff, this));
    $(document).on('click', '#roamingMenu .sticky-menu .menu.home', $.proxy(this.showHome, this));
    $(document).on('click', '#roamingMenu .sticky-menu .menu.myuse', $.proxy(this.showMyServices, this));
    $(document).on('click', '#roamingMenu .logout-anchor', $.proxy(this.logout, this));
  },
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
  showHome: function () {
    var mcc = Tw.CommonHelper.getSessionStorage('ROAMING_MCC');
    if (mcc) {
      document.location.href = '/product/roaming/on?mcc=' + mcc;
    }
  },
  showMyServices: function () {
    document.location.href = '/product/roaming/my-use';
  },
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
  switchOff: function () {
    Tw.CommonHelper.setSessionStorage('ROAMING_OFF', 'Y');
    Tw.CommonHelper.setCookie('ROAMING_MCC', '0', -1);

    this.dismiss('dialogOff');
    var id = 'roamingOff';
    var template = Handlebars.compile($('#tpl-switch-off').html());
    document.getElementById('roamingMenu').innerHTML += template({id: id});
    $('#roamingOff').show();
    var circles = $('#roamingOff .progress span');
    var T = this;
    this.$switchOffTimer = setInterval(function () {
      if (T.$switchOffIndex > 0) {
        circles[T.$switchOffIndex - 1].className = 'circle off';
      }
      circles[T.$switchOffIndex].className = 'circle on';
      T.$switchOffIndex += 1;
      if (T.$switchOffIndex >= 4) {
        clearInterval(T.$switchOffTimer);
        setTimeout(function () {
          document.location.href = '/product/roaming';
        }, 250);
      }
    }, 500);
    return false;
  },
  logout: function () {
    var tidLanding = new Tw.TidLandingComponent();
    tidLanding.goLogout();
    return false;
  },
  checkInterceptMenu: function () {
    var turnOff = Tw.CommonHelper.getSessionStorage('ROAMING_OFF');
    var mcc = Tw.CommonHelper.getSessionStorage('ROAMING_MCC');
    if (mcc && mcc !== '450' && turnOff !== 'Y') {
      this.openRoamingMenu();
      return true;
    }
    return false;
  },
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

function checkInterceptMenu() {
  new Tw.RoamingMenu(null).checkInterceptMenu();
}
