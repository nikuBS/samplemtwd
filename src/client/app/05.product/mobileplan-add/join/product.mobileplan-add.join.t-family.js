/**
 * @file product.mobileplan-add.join.t-family.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019.02.12
 */

Tw.ProductMobileplanAddJoinTFamily = function(rootEl, prodId, displayId, svcMgmtNum, confirmOptions) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._validation = Tw.ValidationHelper;
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-btn_check_join'));
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._index = 1;
  this._addData = null;
  this._prodId = prodId;
  this._svcMgmtNum = svcMgmtNum;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._svcMgmtNumList = [svcMgmtNum];

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }

  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
  this._init();
};

Tw.ProductMobileplanAddJoinTFamily.prototype = {

  _init: function() {
    if (this.$inputMyLine.data('group_rep_yn') === 'N') {
      this.$inputMyLine.attr('disabled', 'disabled').prop('disabled', true);
      return;
    }

    this.$inputMyLine.attr('checked', 'checked').prop('checked', true);
  },

  _cachedElement: function() {
    this.$inputNumber = this.$container.find('.fe-num_input');
    this.$inputBirth = this.$container.find('.fe-input_birth');
    this.$inputMyLine = this.$container.find('.fe-my_line');

    this.$groupList = this.$container.find('.fe-group_list');
    this.$layerIsJoinCheck = this.$container.find('.fe-is_join_check');
    this.$joinCheckProdNm = this.$container.find('.fe-join_check_prod_nm');
    this.$joinCheckResult = this.$container.find('.fe-join_check_result');
    this.$error0 = this.$container.find('.fe-error0');
    this.$error1 = this.$container.find('.fe-error1');

    this.$btnAddLine = this.$container.find('.fe-btn_add_line');
    this.$btnRetry = this.$container.find('.fe-btn_retry');

    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnCheckJoin = this.$container.find('.fe-btn_check_join');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');

    this._itemTemplate = Handlebars.compile($('#fe-templ-line_item').html());
  },

  _bindEvent: function() {
    this.$inputNumber.on('keyup input', $.proxy(this._detectInput, this, 11));
    this.$inputBirth.on('keyup input', $.proxy(this._detectInput, this, 8));

    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));

    this.$btnAddLine.on('click', $.proxy(this._addLine, this));
    this.$btnRetry.on('click', $.proxy(this._clearCheckInput, this));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnCheckJoin.on('click', $.proxy(this._procCheckJoinReq, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));

    this.$container.on('click', '.fe-btn_delete', $.proxy(this._onDeleteLineItem, this));
    this.$container.on('click', '.fe-line_check', $.proxy(this._onLineCheck, this));
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0)
    });
  },

  _detectInput: function(maxLength, e) {
    var $elem = $(e.currentTarget),
      elemVal = $elem.val();

    // input number 에 점(.) 입력 되는 것 차단
    $elem.val('');
    $elem.val(elemVal);

    // 숫자만 입력되도록 처리
    $elem.val($elem.val().replace(/[^0-9]/g, ''));

    if ($elem.val().length > maxLength) {
      $elem.val($elem.val().substr(0, maxLength));
    }

    this._checkError($elem);
    this._toggleClearBtn($elem);
    this._toggleJoinCheckBtn();
  },

  _checkError: function($elem) {
    if ($elem.hasClass('fe-num_input') && Tw.FormatHelper.isEmpty($elem.val())) {
      return this.$error0.hide().attr('aria-hidden', 'true');
    }

    if ($elem.hasClass('fe-num_input') && $elem.val().length < 9) {
      return this._setErrorText(this.$error0, Tw.PRODUCT_TFAMILY.LESS_LENGTH);
    }

    if ($elem.hasClass('fe-num_input') && !Tw.ValidationHelper.isCellPhone($elem.val())) {
      return this._setErrorText(this.$error0, Tw.PRODUCT_TFAMILY.WRONG_NUM);
    }

    if ($elem.hasClass('fe-num_input')) {
      this.$error0.hide().attr('aria-hidden', 'true');
    }

    if ($elem.hasClass('fe-input_birth') && Tw.FormatHelper.isEmpty(this.$inputBirth.val())) {
      return this.$error1.hide().attr('aria-hidden', 'true');
    }

    if ($elem.hasClass('fe-input_birth') && this.$inputBirth.val().length !== 8) {
      return this._setErrorText(this.$error1, Tw.PRODUCT_TFAMILY.WRONG_BIRTH);
    }

    if ($elem.hasClass('fe-input_birth')) {
      this.$error1.hide().attr('aria-hidden', 'true');
    }
  },

  _setErrorText: function ($elem, text) {
    $elem.text(text).show().attr('aria-hidden', 'false');
  },

  _toggleJoinCheckBtn: function() {
    if (this.$inputNumber.val().length > 9 && this.$inputBirth.val().length === 8) {
      this.$btnCheckJoin.removeAttr('disabled').prop('disabled', false);
      this.$btnCheckJoin.parent().removeClass('bt-gray1').addClass('bt-blue1');
    } else {
      this.$btnCheckJoin.attr('disabled', 'disabled').prop('disabled', true);
      this.$btnCheckJoin.parent().removeClass('bt-blue1').addClass('bt-gray1');
    }
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _blurInputNumber: function() {
    this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
  },

  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  _clearNum: function(e) {
    var $elem = $(e.currentTarget);

    $elem.parent().find('input').val('');
    $elem.hide().attr('aria-hidden', 'true');

    this._toggleJoinCheckBtn();

    setTimeout(function() {
      $elem.parents('li').find('.error-txt').hide().attr('aria-hidden', 'true');
    }.bind(this), 100);
  },

  _toggleClearBtn: function($elem) {
    if ($elem.val().length > 0) {
      $elem.parent().find('.fe-btn_clear_num').show().attr('aria-hidden', 'false');
    } else {
      $elem.parent().find('.fe-btn_clear_num').hide().attr('aria-hidden', 'true');
    }
  },

  _procCheckJoinReq: function() {
    if (!Tw.ValidationHelper.isCellPhone(this.$inputNumber.val()) || this.$inputBirth.val().length !== 8) {
      return;
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0172, {
      inputSvcNum: this.$inputNumber.val().replace(/-/gi, ''),
      inputBirthdate: this.$inputBirth.val()
    }).done($.proxy(this._procCheckJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _procCheckJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    this.$btnAddLine.parent().hide().attr('aria-hidden', 'true');
    this.$btnRetry.parent().hide().attr('aria-hidden', 'true');

    this.$layerIsJoinCheck.show().attr('aria-hidden', 'false');
    this.$joinCheckProdNm.text(Tw.PRODUCT_TFAMILY.NO_INFO);
    this.$layerIsJoinCheck.find('h3').focus();

    if (this.$groupList.find('li').length < 5) {
      this.$btnAddLine.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnAddLine.attr('disabled', 'disabled').prop('disabled', true);
    }

    if (resp.code !== Tw.API_CODE.CODE_00) {
      var resultText = !Tw.FormatHelper.isEmpty(Tw.PRODUCT_TFAMILY[resp.code]) ?
          Tw.PRODUCT_TFAMILY[resp.code] : resp.msg;

      if (resp.code === 'PRD0067') {
        this.$joinCheckProdNm.text((resp.result && Tw.FormatHelper.isEmpty(resp.result.prodNm) || !resp.result) ?
          Tw.PRODUCT_TFAMILY.NO_INFO : resp.result.prodNm);
      }

      this.$joinCheckResult.text(resultText);
      this.$btnRetry.parent().show().attr('aria-hidden', 'false');
      return;
    }

    if (this._svcMgmtNumList.indexOf(resp.result.svcMgmtNum) !== -1) {
      this.$joinCheckResult.text(Tw.PRODUCT_TFAMILY.IS_EXISTS);
      this.$btnRetry.parent().show().attr('aria-hidden', 'false');
      return;
    }

    this._addData = $.extend(resp.result, {
      svcNumNoMasq: this.$inputNumber.val().replace(/-/gi, '')
    });

    this.$joinCheckProdNm.text((resp.result && Tw.FormatHelper.isEmpty(resp.result.prodNm) || !resp.result) ?
      Tw.PRODUCT_TFAMILY.NO_INFO : resp.result.prodNm);
    this.$joinCheckResult.text(Tw.PRODUCT_TFAMILY.IS_JOIN);
    this.$btnAddLine.parent().show().attr('aria-hidden', 'false');
  },

  _addLine: function() {
    if (this.$groupList.find('li').length > 4) {
      return;
    }

    this._svcMgmtNumList.push(this._addData.svcMgmtNum.toString());
    this.$groupList.append(this._itemTemplate($.extend(this._addData, {
      svcNumDash: Tw.FormatHelper.conTelFormatWithDash(this._addData.svcNum),
      groupRepYn: Tw.FormatHelper.isEmpty(this._addData.groupRepYn) ? 'N' : this._addData.groupRepYn,
      isMe: this._addData.slfYn === 'Y',
      index: this._index++
    })));

    this._setDisableLine();
    this._clearCheckInput();
    this._checkSetupButton();
  },

  _setDisableLine: function() {
    this.$groupList.find('[data-group_rep_yn="N"]').attr('disabled', 'disabled').prop('disabled', true);
  },

  _clearCheckInput: function() {
    this.$inputNumber.val('');
    this.$inputBirth.val('');
    this.$btnClearNum.hide().attr('aria-hidden', 'true');
    this.$layerIsJoinCheck.hide().attr('aria-hidden', 'true');
    this._toggleJoinCheckBtn();
  },

  _onDeleteLineItem: function(e) {
    var $elem = $(e.currentTarget),
      $elemParent = $elem.parents('li.list-box'),
      svcMgmtNum = $elemParent.data('svc_mgmt_num');

    if (this._svcMgmtNumList.indexOf(svcMgmtNum.toString()) !== -1) {
      this._svcMgmtNumList.splice(this._svcMgmtNumList.indexOf(svcMgmtNum.toString()), 1);
    }

    $elemParent.remove();
    this._checkSetupButton();

    if (this.$groupList.find('li').length < 5) {
      this.$btnAddLine.removeAttr('disabled').prop('disabled', false);
    }
  },

  _onLineCheck: function(e) {
    var $elem = $(e.currentTarget);

    if ($elem.is(':checked')) {
      this.$groupList.find('.fe-line_check').removeAttr('checked').prop('checked', false);
      $elem.attr('checked', 'checked').prop('checked', true);
    }

    this._checkSetupButton();
  },

  _checkSetupButton: function() {
    this._toggleSetupButton(this.$groupList.find('li').length > 1);
  },

  _getSvcNumList: function() {
    var svcNumList = [];

    _.each(this.$groupList.find('li'), function(elem) {
      var $elem = $(elem);
      svcNumList.push({
        memberSvcMgmtNum: $elem.data('svc_mgmt_num'),
        groupRepYnChk: $elem.find('input[type=checkbox]').is(':checked') ? 'Y' : 'N'
      });
    });

    return svcNumList;
  },

  _procConfirm: function() {
    if (this.$groupList.find('input[type=checkbox]:checked').length < 1) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A76.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A76.TITLE);
    }

    new Tw.ProductCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: false,
      noticeList: this._confirmOptions.preinfo.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId] + ' ' +
          this.$groupList.find('li').length + Tw.PRODUCT_JOIN_SETTING_AREA_CASE.LINE
      }]
    }), $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0173, {
      memberSvcNumList: this._getSvcNumList()
    }, {}, []).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_10_0038, {
      scrbTermCd: 'S'
    }, {}, [this._prodId]).done($.proxy(this._isVasTerm, this));
  },

  _isVasTerm: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openVasTermPopup(resp.result);
  },

  _openSuccessPop: function() {
    if (!this._isResultPop) {
      return;
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{ link: '/myt-data/familydata', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.TFAMILY }],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        basicTxt: Tw.PRODUCT_TFAMILY.SUCCESS_GUIDE,
        isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
          this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _openVasTermPopup: function(respResult) {
    var popupOptions = {
      hbs: 'MV_01_02_02_01',
      bt: [
        {
          style_class: 'unique fe-btn_back',
          txt: Tw.BUTTON_LABEL.CLOSE
        }
      ]
    };

    if (respResult.prodTmsgTypCd === 'H') {
      popupOptions = $.extend(popupOptions, {
        editor_html: Tw.CommonHelper.replaceCdnUrl(respResult.prodTmsgHtmlCtt)
      });
    }

    if (respResult.prodTmsgTypCd === 'I') {
      popupOptions = $.extend(popupOptions, {
        img_url: respResult.rgstImgUrl,
        img_src: Tw.Environment.cdn + respResult.imgFilePathNm
      });
    }

    this._isResultPop = true;
    this._popupService.open(popupOptions, $.proxy(this._bindVasTermPopupEvent, this), $.proxy(this._openSuccessPop, this), 'vasterm_pop');
  },

  _bindVasTermPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndOpenResultPopup: function() {
    this._isResultPop = true;
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
