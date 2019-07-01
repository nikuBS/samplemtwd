/**
 * @file myt-fare.bill.skpay.agree.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 * Annotation: SK pay 가입
 */

Tw.MyTFareBillSkpayAgree = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this.data = params.data;
  this._render();
  this._bindEvent();
};

Tw.MyTFareBillSkpayAgree.prototype = {
  _render: function () {
    this.$joinBtn = this.$container.find('[data-id=join-btn]');
    this.$cancelBtn = this.$container.find('[data-id=cancel-btn]');
    this.$agreeAll = this.$container.find('[data-id=agree-all]');
    this.$agreeMan = this.$container.find('[data-id=agree-man]');
    this.$agreeSel = this.$container.find('[data-id=agree-sel]');
    this.$agreeViewBtn = this.$container.find('button.agree-view');
  },

  _bindEvent: function () {
    this.$container.on('click', $.proxy(this._onClickContainer, this));
    this.$joinBtn.on('click', $.proxy(this._onClickJoinBtn, this));
    this.$cancelBtn.on('click', $.proxy(this._onClickCancelBtn, this));
    this.$agreeAll.on('change', $.proxy(this._onClickAgreeAll, this));
    this.$agreeMan.on('change', $.proxy(this._onClickAgreeMan, this));
    this.$agreeSel.on('change', $.proxy(this._onClickAgreeSel, this));
    this.$agreeViewBtn.on('click', $.proxy(this._onClickAgreeViewBtn, this));
  },
  /**
   * 모두 동의 항목 선택시 콜백
   * @param event
   * @private
   */
  _onClickAgreeAll: function (event) {
    var isChecked =  $(event.currentTarget).hasClass('checked');
    if(isChecked){
        this.$agreeMan.addClass('checked');
        this.$agreeMan.attr('aria-checked', true);
        this.$agreeMan.find('input').prop('checked', true);
        this.$agreeSel.addClass('checked');
        this.$agreeSel.attr('aria-checked', true);
        this.$agreeSel.find('input').prop('checked', true);
    } else {
      this.$agreeMan.removeClass('checked');
      this.$agreeMan.attr('aria-checked', false);
      this.$agreeMan.find('input').prop('checked', false);
      this.$agreeSel.removeClass('checked');
      this.$agreeSel.attr('aria-checked', false);
      this.$agreeSel.find('input').prop('checked', false);
    }
  },
  /**
   * 필수 동의 항목 선택시 콜백
   * @param event
   * @private
   */
  _onClickAgreeMan: function (event) {
    var isChecked =  $(event.currentTarget).hasClass('checked');
    if(isChecked && this.$agreeSel.hasClass('checked')){
      this.$agreeAll.addClass('checked');
      this.$agreeAll.attr('aria-checked', true);
      this.$agreeAll.find('input').prop('checked', true);
    } else {
      this.$agreeAll.removeClass('checked');
      this.$agreeAll.attr('aria-checked', false);
      this.$agreeAll.find('input').prop('checked', false);
    }
  },
  /**
   * 선택 동의 항목 선택시 콜백
   * @param event
   * @private
   */
  _onClickAgreeSel: function (event) {
    var isChecked =  $(event.currentTarget).hasClass('checked');
    if(isChecked && this.$agreeMan.hasClass('checked')){
      this.$agreeAll.addClass('checked');
      this.$agreeAll.attr('aria-checked', true);
      this.$agreeAll.find('input').prop('checked', true);
    } else {
      this.$agreeAll.removeClass('checked');
      this.$agreeAll.attr('aria-checked', false);
      this.$agreeAll.find('input').prop('checked', false);
    }
  },
    /**
   * 필수 동의 시에만 버튼 활성화
   * @param event
   * @private
   */
  _onClickContainer: function () {
    if(this.$agreeMan.hasClass('checked')){
      this.$joinBtn.removeAttr('disabled');
    } else {
      this.$joinBtn.attr('disabled', 'disabled');
    }
  },
  /**
   * Event listener for the button click on [data-id=join-btn](가입하기)
   * @returns {boolean}
   * @private
   */
  _onClickJoinBtn: function () {
    this._skpayMndtAgree = 'N';
    this.skpaySelAgree = 'N';
    if(this.$agreeMan.hasClass('checked')){
      this._skpayMndtAgree = 'Y';
    }
    if(this.$agreeSel.hasClass('checked')){
      this.skpaySelAgree = 'Y';
    }
    var date = {
      skpayMndtAgree: this._skpayMndtAgree,
      skpaySelAgree: this.skpaySelAgree,
      gbn: 'I'
    };
    this._apiService.request(Tw.API_CMD.BFF_07_0096, date)
      .done($.proxy(this._skpayAgreeSuccess, this))
      .fail($.proxy(this._skpayAgreeFail, this));
  },
      /**
   * @function
   * @desc 제 3자 동의 조회 API 응답 처리 (성공)
   * @param res
   */
  _skpayAgreeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/skpay');
    } else {
      this._skpayAgreeFail(res);
    }
  },
  /**
   * @function
   * @desc 제 3자 동의 조회 API 응답 처리 (실패)
   */
  _skpayAgreeFail: function (res) {
    this._err = {
      code: res.code,
      msg: res.msg
    };
    Tw.Error(this._err.code, this._err.msg).pop(); // 에러 시 공통팝업 호출
  },
    /**
   * @function
   * @desc 취소 시 이번 페이지로 이동
   */
  _onClickCancelBtn: function () {
    this._historyService.resetHistory(-1);
  },
  /**
   * 이용/약관 동의 더보기 클릭 콜백
   * @param event
   * @private
   */
  _onClickAgreeViewBtn: function (event) {
    this.$agreeViewTarget = $(event.currentTarget);
    var type = this.$agreeViewTarget.attr('data-type');
    // 멤버십 약관관련 팝업
    new Tw.MyTFareBillSkpayAgreeLayer({
      $element: this.$container,
      callback: $.proxy(this._agreeViewCallback, this)
    }).open(type, event);
  },
  /**
   * 약관 페이지에서 약관 동의 시 콜백
   * @private
   */
  _agreeViewCallback: function () {
    var type = this.$agreeViewTarget.attr('data-type');
    if(type === '77'){
      this.$agreeMan.addClass('checked');
      this.$agreeMan.attr('aria-checked', true);
      this.$agreeMan.find('input').prop('checked', true);
      this.$agreeMan.trigger('change');
    } else if(type === '78'){
      this.$agreeSel.addClass('checked');
      this.$agreeSel.attr('aria-checked', true);
      this.$agreeSel.find('input').prop('checked', true);
      this.$agreeSel.trigger('change');
    }
      this.$container.trigger('click');
  }
};