Tw.UIService = function () {
  this.historyService = new Tw.HistoryService();
  this.setBack();
  this.setForward();
  this.setReplace();
  this.setBackRefresh();
  this.setInputEvent();
  this.setNetfunnel();
};

Tw.UIService.prototype = {
  /**
   * @desc fe-common-back 클래스 가진 모든 element에 click event 바인딩(뒤로 가기)
   * @private
   */
  setBack: function () {
    /* 뒤로가기 추가 */
    $('.fe-common-back').on('click', function ($event) {
      Tw.Logger.info('[Common Back]');
      if ( Tw.BrowserHelper.isApp() && $($event.currentTarget).parent().data('history') <= 1 &&
        !(/\/main\/home/.test(location.href) || /\/main\/store/.test(location.href))) {
        this.historyService.replaceURL('/main/home');
      } else {
        this.historyService.goBack();
      }
    });
  },
  /**
   * @desc fe-common-forward 클래스 가진 모든 element에 click event 바인딩(앞으로 가기)
   * @private
   */
  setForward: function () {
    $('.fe-common-forward').on('click', function () {
      Tw.Logger.info('[Common Forward]');
      this.historyService.go(1);
    });
  },

  /**
   * @desc fe-replace-history 클래스 가진 모든 element에 click event 바인딩(replace history)
   * @private
   */
  setReplace: function () {
    $('.fe-replace-history').on('click', function ($event) {
      Tw.Logger.info('[Replace History]');
      this.historyService.replaceURL($event.currentTarget.href);
      return false;
    });
  },

  /**
   * @desc back 버튼으로 페이지 로딩 시
   * @private
   */
  setBackRefresh: function () {
    $(window).bind('pageshow', function ($event) {
      if ( $event.originalEvent.persisted || window.performance && window.performance.navigation.type === 2 ) {
        Tw.Logger.info('[Back Loaded]');
        // if ( $('.fe-back-reload').length > 0 ) {
        //   Tw.Logger.info('[Prev]', document.referrer);
        //   document.location.reload();
        // }
        //
        // if ( Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH) === 'Y' ) {
        //   Tw.Logger.info('[Line Refresh]', document.referrer);
        //   // if ( Tw.BrowserHelper.isApp() ) {
        //     document.location.reload();
        //   // }
        //   if ( /\/main\/home/.test(location.href) ) {
        //     Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'N');
        //   }
        // }
      }
    });
  },

  /**
   * @desc 인풋에 max length 입력 불가하도록 이벤트 바인딩
   * @private
   */
  setInputEvent: function () {
    $('input').on('input', $.proxy(this.setMaxValue, this));
  },

    /**
   * @desc 사용자가 인풋에 max length 이상 입력 시 지움
   * @private
   */
  setMaxValue: function (event) {
    var $target = $(event.currentTarget);
    var maxLength = $target.attr('maxLength');
    if ( $target.attr('maxLength') ) {
      if ( $target.val().length >= maxLength ) {
        $target.val($target.val().slice(0, maxLength));
      }
    }
  },

  /**
   * @desc a tag 로 페이지 이동시 특정 속성값 체크하여 netfunnel 적용하기 위한 이벤트처리
   * @private
   */
  setNetfunnel: function () {
    $('[data-netf-href]').on('click', function (event) {
      var href = $(event.currentTarget).attr('href');
      if (href) {
        event.preventDefault();
        this.historyService.goLoad(href);
      }
    });
    $('[data-netf-replace]').on('click', function (event) {
      var href = $(event.currentTarget).attr('href');
      if (href) {
        event.preventDefault();
        this.historyService.replaceURL(href);
      }
    });
  }
};
