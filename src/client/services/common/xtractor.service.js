/**
 * @class
 * @param $container
 * @param isNotSwipeBanner
 */
Tw.XtractorService = function($container, isNotSwipeBanner) {
  this.$container = $container;
  this._isNotSwipeBanner = isNotSwipeBanner || false;    // Swipe 형태의 배너가 아닌, 화면 노출 즉시 노출통계(BV) 를 수집해야 하는 경우 true 로 호출 필요.

  // Log
  Tw.Logger.info('[Xtractor] init container', this.$container);

  // Init
  setTimeout($.proxy(this._init, this), 500);
};

Tw.XtractorService.prototype = {
  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    this._loggedList = window.XTRACTOR_LOGGED_LIST = window.XTRACTOR_LOGGED_LIST? window.XTRACTOR_LOGGED_LIST : [];
    this._isScript1 = (window.XtractorEvent && window.XtractorEvent.xtrEvent);
    this._isScript2 = (window.XtractorScript && window.XtractorScript.xtrCSDummy);

    this._bindBC();
    this._observeTransition();
    this._initScroll();

    if (this._isNotSwipeBanner) {
      this._onLoadBV2();
    }
  },

  _initScroll: function () {
    $(window).scroll($.proxy(function () {
      this._onLoadBV();
    }, this));
    this._onLoadBV();
  },

  /**
   * @function
   * @desc 화면에 실제 노출되는 배너에 대한 노출통계 수집을 위한 처리
   */
  _observeTransition: function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    var _this = this;
    var viewElms = [];
    var isRun = false;
    var viewRunner = function(){
        if(isRun){
          return;
      }
      isRun = true;
      var _viewElms = viewElms;
      viewElms = [];

      _viewElms.forEach(function(elem){
          // 여기에 처리하고자 하는 액션을 구현
          _this._sendBV(elem);
      });
      isRun = false;
    };

    // 배너를 불러오기 이전에 observer 가 먼저 생성되므로 disconnect 처리를 먼저 해준 후 observer 를 재 생성한다.
    if(window.ELEMENT_OBSERVER){
      window.ELEMENT_OBSERVER.disconnect();
    }

    var observer = window.ELEMENT_OBSERVER = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes') {
          if(viewElms.indexOf(mutation.target) === -1){
              viewElms.push(mutation.target);
          }
          setTimeout(viewRunner, 100);
        }
      });
    });

    $('[data-xt_action="BN"],[data-xt_action="BV"]').each(function(a,b){
        observer.observe(b, {
          attributes: true //configure it to listen to attribute changes
        });
    });
  },

  /**
   * @function
   * @desc 노출 처리
   */
  _onLoadBV: function() {
    _.each(this.$container.find('[data-xt_action="BN"],[data-xt_action="BV"]'), $.proxy(this._sendBV, this));
  },

  /**
   * @function
   * @desc 노출 처리
   */
  _onLoadBV2: function() {
    _.each(this.$container.find('[data-xt_action="BV"]'), $.proxy(this._sendBV2, this));
  },

  /**
   * @function
   * @desc 클릭 이벤트 바인딩
   */
  _bindBC: function() {
    this.$container.off('mousedown', $.proxy(this._sendBC, this))
      .on('mousedown', '[data-xt_action="BN"],[data-xt_action="BC"],[data-xt_action2="BC"]', $.proxy(this._sendBC, this));
  },

  /**
   * @function
   * @desc 노출 이벤트 수행
   * @param elem - 노출 선언된 객체
   * @returns {boolean}
   */
  _sendBV: function(elem) {
    var $elem = $(elem);

    var bannerType = $elem.data('xt_action');

    var scrollTop = $(window).scrollTop();  // 현재 스크롤의 Top
    var scrollBottom = scrollTop + $(window).height();  // 현재 스크롤의 Bottom

    var objTop = $elem.offset().top;    // 배너 객체의 Top
    var objBottom = objTop + $elem.innerHeight();   // 배너 객체의 Bottom

    /* TOS Banner */
    if (bannerType === 'BN') {
      var BannerArgs = {
        CMPGN_NUM: $elem.data('xt_cmpgn_num'),
        EXEC_SCHD_NUM: $elem.data('xt_schd_num'),
        CELL_NUM: $elem.data('xt_cell_num'),
        MSG_SER_NUM: $elem.data('xt_msg_ser_num'),
        ACTION: 'Exp'
      };

      if (!Tw.FormatHelper.isEmpty(BannerArgs.CMPGN_NUM) &&
        !Tw.FormatHelper.isEmpty(BannerArgs.EXEC_SCHD_NUM) &&
        !Tw.FormatHelper.isEmpty(BannerArgs.CELL_NUM) &&
        !Tw.FormatHelper.isEmpty(BannerArgs.MSG_SER_NUM)) {
          if (scrollTop < objTop && scrollBottom > objBottom) {
            if ($elem.hasClass('slick-current') || $elem.hasClass('slick-active')) {
              this._sendXtrEvent($.param(BannerArgs));
            }
          }
      }
    }

    /* 어드민 배너 */
    if (bannerType === 'BV') {
      var E_ID = $elem.data('xt_eid'),
          CS_ID = $elem.data('xt_csid');

      if (!Tw.FormatHelper.isEmpty(E_ID) && !Tw.FormatHelper.isEmpty(CS_ID)) {
        // 배너 객체가 현재 화면 내에 들어올 경우 logView 함수 호출
        if (scrollTop < objTop && scrollBottom > objBottom) {
          // MLS 배너의 경우 slick-current, slick-active 속성이 없으므로 E_ID 네이밍으로 필터링 함...
          if (E_ID.indexOf('MLS') > -1) {
            this.logView(E_ID, CS_ID);
          } else {
            if ($elem.hasClass('slick-current') || $elem.hasClass('slick-active')) {
              this.logView(E_ID, CS_ID);
            }
          }
        } else {
          if ($elem.data('type') === 'chatbotitem') {
            this.logView(E_ID, CS_ID);
          }
        }
      }
    }
  },


  /**
   * @function
   * @desc 노출 이벤트 수행
   * @param elem - 노출 선언된 객체
   * @returns {boolean}
   */
  _sendBV2: function (elem) {
    var $elem = $(elem);

    var E_ID = $elem.data('xt_eid');
        // CS_ID = $elem.data('xt_csid');

    // if (!Tw.FormatHelper.isEmpty(E_ID) && !Tw.FormatHelper.isEmpty(CS_ID)) {
    if (!Tw.FormatHelper.isEmpty(E_ID)) {
      this.logView(E_ID, '');
    }
  },

  /**
   * @function
   * @desc 클릭 이벤트 수행
   * @param e - 클릭 이벤트
   * @returns {boolean}
   */
  _sendBC: function(e) {
    var $elem = $(e.currentTarget);
    var bannerType = $elem.data('xt_action');
    var bannerType2 = $elem.data('xt_action2');

    /* TOS Banner */
    if (bannerType === 'BN') {

      var BannerArgs = {
        CMPGN_NUM: $elem.data('xt_cmpgn_num'),
        EXEC_SCHD_NUM: $elem.data('xt_schd_num'),
        CELL_NUM: $elem.data('xt_cell_num'),
        MSG_SER_NUM: $elem.data('xt_msg_ser_num'),
        ACTION: 'Clk'
      };

      if (!Tw.FormatHelper.isEmpty(BannerArgs.CMPGN_NUM) &&
        !Tw.FormatHelper.isEmpty(BannerArgs.EXEC_SCHD_NUM) &&
        !Tw.FormatHelper.isEmpty(BannerArgs.CELL_NUM) &&
        !Tw.FormatHelper.isEmpty(BannerArgs.MSG_SER_NUM)) {
        this._sendXtrEvent($.param(BannerArgs));
      }
    }

    /* 어드민 Banner */
    if (bannerType === 'BC' || bannerType2 === 'BC') {
      var E_ID = $elem.data('xt_eid'),
          CS_ID = $elem.data('xt_csid');

      if (!Tw.FormatHelper.isEmpty(E_ID) && !Tw.FormatHelper.isEmpty(CS_ID)) {
        this.logClick(E_ID, CS_ID);
      }
    }
  },

  /**
   * @function
   * @desc 클릭 통계 수행
   * @param E_ID - Xtractor E_ID
   * @param CS_ID - Xtractor CS_ID
   * @returns {*|boolean}
   */
  logClick: function(E_ID, CS_ID) {
    return this._sendXtrCSDummy(E_ID, CS_ID, 'BC');
  },

  /**
   * @function
   * @desc 노출 통계 수행
   * @param E_ID - Xtractor E_ID
   * @param CS_ID - Xtractor CS_ID
   * @returns {*|boolean}
   */
  logView: function(E_ID, CS_ID) {
    return this._sendXtrCSDummy(E_ID, CS_ID, 'BV');
  },

  /**
   * @function
   * @desc 노출 이벤트 영역 직접 호출
   * @param $wrap - BV노출 이벤트를 처리할 영역
   */
  sendBVWrap: function($wrap) {
    _.each($wrap.find('[data-xt_action="BV"]'), $.proxy(this._sendBV, this));
  },

  /**
   * @function
   * @desc Xtractor CS 통계 수행
   * @param E_ID - Xtractor E_ID
   * @param CS_ID - Xtractor CS_ID
   * @param ACTION - Xtractor ACTION
   * @returns {boolean}
   */
  _sendXtrCSDummy: function(E_ID, CS_ID, ACTION) {
    var key = E_ID + '|' + CS_ID + '|' + ACTION;

    if (!this._isScript2) {
      Tw.Logger.warn('[Xtractor] Logger is failed. Xtractor script is not found.');
      return false;
    }

    if (this._loggedList.indexOf(key) !== -1) {
      // Tw.Logger.info('[Xtractor] this key already logged.');   // scroll 이벤트 때문에 너무 많이 발생하므로 주석 처리
        return false;
    }

    try {
      window.XtractorScript.xtrCSDummy(E_ID, CS_ID, ACTION);
      this._loggedList.push(key);
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * @function
   * @desc Xtractor Event
   * @returns {boolean}
   */
  _sendXtrEvent: function(param) {
    if (!this._isScript1) {
      Tw.Logger.warn('[Xtractor] Logger is failed. Xtractor script is not found.');
      return false;
    }

    if (this._loggedList.indexOf(param) !== -1) {
      Tw.Logger.info('[Xtractor] this param already logged.');
      return false;
    }

    try {
      window.XtractorEvent.xtrEvent(param);
      this._loggedList.push(param);
    } catch (e) {
      console.log(e);
    }
  }

};
