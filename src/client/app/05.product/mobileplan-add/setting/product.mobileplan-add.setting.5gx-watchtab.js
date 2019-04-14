/**
 * @file 부가서비스 5gx 워치tab 설정변경
 * @author anklebreaker
 * @since 2019-04-11
 */

/**
 * @class
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 * @oaram {String} prodId 상품ID
 * @param {String} displayId 화면ID
 * @param {String} svcProdGrpId 서비스상품그룹ID
 */
Tw.ProductMobileplanAddSetting5gxWatchtab = function (rootEl, prodId, displayId, svcProdGrpId, mobileplanId) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this.$container = rootEl;
  this._prodId = prodId;
  this._displayId = displayId;
  this._svcProdGrpId = svcProdGrpId;
  this._maxLine = mobileplanId === 'NA00006405' ? 2 : 1;

  this._cachedElement();
  this._bindEvent();
  this._showAndHideAddButton();
};

Tw.ProductMobileplanAddSetting5gxWatchtab.prototype = {

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnNativeContactList = this.$container.find('.fe-btn_native_contact');
    this.$btnAddNum = this.$container.find('.fe-btn_add_num');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineWrap = this.$container.find('.fe-line_wrap');
    this.$inputNumber = this.$container.find('.fe-num_input');
    this.$divInput = this.$container.find('.fe-div_input');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$lineList.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$btnAddNum.on('click', $.proxy(this._addNum, this));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  /**
   * @function
   * @desc 주소록 버튼 클릭
   */
  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  /**
   * @function
   * @desc 주소록 callback
   * @param res
   */
  _onContact: function (res) {
    if (res.resultCode !== Tw.NTV_CODE.CODE_00) {
      return;
    }
    this.$inputNumber.val(res.params.phoneNumber);
    this._toggleClearBtn();
    this._toggleNumAddBtn();
    this._blurInputNumber();
  },

  _addNum: function () {
    if (this.$inputNumber.val().length < 10) {
      return;
    }

    var number = this.$inputNumber.val().replace(/-/gi, '');

    if (!Tw.ValidationHelper.isCellPhone(number)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A93.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A93.MSG,
      Tw.BUTTON_LABEL.CONFIRM, Tw.BUTTON_LABEL.CANCEL, null,
      $.proxy(this._addNumReq, this, number));
  },

  _addNumReq: function (number) {
    this._popupService.close();

    if (!Tw.ValidationHelper.isCellPhone(number)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0020, {
      svcProdGrpId: this._svcProdGrpId,
      svcNumList: [this._getServiceNumberFormat(number)]
    }, {}, [this._prodId])
    .done($.proxy(this._addDelNumRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _addDelNumRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._historyService.replaceURL('/product/callplan?prod_id=' + this._prodId);
  },

  _delNum: function (e) {
    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A94.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A94.MSG,
      Tw.BUTTON_LABEL.CONFIRM, Tw.BUTTON_LABEL.CANCEL, null,
      $.proxy(this._delNumReq, this, $(e.currentTarget).data('svc_mgmt_num')));
  },

  _delNumReq: function (svcMgmtNum) {
    this._popupService.close();

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0019, {
      chldSvcMgmtNum: svcMgmtNum,
      svcProdGrpId: this._svcProdGrpId
    }, {}, [this._prodId]).done($.proxy(this._addDelNumRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _detectInputNumber: function (e) {
    if (Tw.InputHelper.isEnter(e)) {
      this.$btnAddNum.trigger('click');
      return;
    }

    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9]/g, ''));

    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    this._toggleClearBtn();
    this._toggleNumAddBtn();
  },

  _toggleNumAddBtn: function () {
    if (this.$inputNumber.val().length > 9) {
      this.$btnAddNum.removeAttr('disabled').prop('disabled', false);
      this.$btnAddNum.parent().removeClass('bt-gray1').addClass('bt-blue1');
    } else {
      this.$btnAddNum.attr('disabled', 'disabled').prop('disabled', true);
      this.$btnAddNum.parent().removeClass('bt-blue1').addClass('bt-gray1');
    }
  },

  _blurInputNumber: function () {
    this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
  },

  _focusInputNumber: function () {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  _clearNum: function () {
    this.$inputNumber.val('');
    this.$btnClearNum.hide().attr('aria-hidden', 'true');
    this._toggleNumAddBtn();
  },

  _toggleClearBtn: function () {
    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show().attr('aria-hidden', 'false');
    } else {
      this.$btnClearNum.hide().attr('aria-hidden', 'true');
    }
  },

  _getServiceNumberFormat: function (number) {
    if (number.length === 10) {
      return {
        serviceNumber1: number.substr(0, 3),
        serviceNumber2: number.substr(3, 3),
        serviceNumber3: number.substr(6, 4)
      };
    }

    return {
      serviceNumber1: number.substr(0, 3),
      serviceNumber2: number.substr(3, 4),
      serviceNumber3: number.substr(7, 4)
    };
  },

  _showAndHideAddButton: function () {
    if (this._maxLine === this.$lineList.find('li').length) {
      this.$divInput.hide();
    } else {
      this.$divInput.show();
    }
  }
};
