/**
 * @file myt-join.suspend.js
 * @author Hyeryoun Lee
 * @since 2018-10-15
 */
/**
 * @class
 * @desc [장기/일시정지] 처리를 위한 class
 * @param {jQuery} rootEl - wrapper element
 * @param {Object} params - 회선 정보 등 서버에서 전달하는 값
 * @returns {void}
 */
Tw.MyTJoinSuspend = function (rootEl, params) {
  this.$container = rootEl;
  this._data = params;
  this._temp = null;
  this._long = null;
  this.TYPE = {
    TEMPORARY: '#temporary',
    LONG_TERM: '#long-term'
  };
  this._historyService = new Tw.HistoryService();
  this._historyService.init();
  this._popupService = Tw.Popup;
  this._cachedElement();
  this._bindEvent();
  this._checkUnused2gUser();
};

Tw.MyTJoinSuspend.prototype = {
  /**
   * @function
   * @desc Cache elements for binding events.
   * @returns {void}
   */
  _cachedElement: function () {
    this.$tabLinker = this.$container.find('.tab-linker a');
    this.$tabTemp = this.$container.find('[data-id="fe-tab-temporary"]');
    this.$tabLong = this.$container.find('[data-id="fe-tab-long-term"]');
  },
  /**
   * @function
   * @desc Bind events to elements.
   */
  _bindEvent: function () {
    this.$tabLinker.on('click', $.proxy(this._onTabChanged, this));
    this.$container.on('click', '.fe-bt-back', $.proxy(this._onClose, this));
    $(document).on('ready', $.proxy(this._setInitialTab, this));
  },
  /**
   * @function
   * @desc 2G 장기 미사용으로 이용정지 예약이 걸린 사용자 체크
   */
  _checkUnused2gUser: function () {
    if ( this._data.suspend.unused2gUser ) {
      this._popupService.openAlert( Tw.MYT_JOIN_SUSPEND.ERROR.UNUSED_2G_USER, null, null, $.proxy(this._goBack, this));
    }
  },
  /**
   * @function
   * @desc 뒤로가기 실행
   */
  _goBack: function() {
    this._historyService.goBack();
  },
  /**
   * @function
   * @desc URL hash로 초기 선택 탭 설정
   * 일시정지: '#temporary',
   * 장기일시정지: '#long-term'
   */
  _setInitialTab: function () {
    var type;
    if ( this._data.suspend.status ) {
      type = this.TYPE.LONG_TERM;
    } else {
      type = window.location.hash || this.TYPE.TEMPORARY;
      if ( Object.values(this.TYPE).indexOf(type) < 0 ) {
        type = this.TYPE.TEMPORARY;
      }
    }
    this.$tabLinker.filter('[href="' + type + '"]').click();
  },
  /**
   * @function
   * @desc Event listener for the button click on '.tab-linker button'(탭버튼)
   * @param e
   * @returns {boolean}
   */
  _onTabChanged: function (e) {
    var hash = e.target.getAttribute('href');
    if ( this._data.suspend.status && hash === this.TYPE.TEMPORARY ) {
      e.stopPropagation();
      return false;
    }
    this._setActiveTab(hash);
  },
  /**
   * @function
   * @desc 일시정지 타입별로 class 분리해서 관리
   * 일시정지: Tw.MyTJoinSuspendTemporary
   * 장기일시정지: Tw.MyTJoinSuspendLongTerm
   * @param type
   */
  _setActiveTab: function (type) {
    type = type.toLowerCase();
    this.$tabLinker.attr('aria-selected', false);
    this.$tabLinker.filter('[href="'+type+'"]').attr('aria-selected', true);
    switch ( type ) {
      case this.TYPE.TEMPORARY:
        if ( !this._temp ) {
          this._temp = new Tw.MyTJoinSuspendTemporary(this.$tabTemp);
        }
        this.$tabTemp.attr('aria-hidden', false);
        this.$tabLong.attr('aria-hidden', true);

        break;
      case this.TYPE.LONG_TERM:
        if ( !this._long ) {
          this._long = new Tw.MyTJoinSuspendLongTerm(this.$tabLong, this._data);
        }
        this.$tabTemp.attr('aria-hidden', true);
        this.$tabLong.attr('aria-hidden', false);
        break;
    }
  },


  _onClose: function () {
    this._historyService.goBack();
    // 입력값 있을 경우 확인창
    /*
    if ( (this._temp && this._temp.hasChanged()) || (this._long && this._long.hasChanged()) ) {
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
        $.proxy(function () {
          this._historyService.go(-2);
        }, this),
        null,
        Tw.BUTTON_LABEL.NO,
        Tw.BUTTON_LABEL.YES);
    } else {
      this._historyService.goBack();
    }
    */
  }
};
