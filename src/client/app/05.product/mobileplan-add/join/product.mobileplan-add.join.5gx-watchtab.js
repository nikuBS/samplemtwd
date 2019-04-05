/**
 * @file product.mobileplan-add.join.5gx-watchtab.js
 * @author ankle breaker (byunma@sk.com)
 * @since 2019.04.05
 */

Tw.ProductMobileplanAddJoin5gxWatchtab = function (rootEl, prodId, displayId, mobileplanId) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this.$container = rootEl;
  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = {};

  if (mobileplanId === 'NA00006404') {
    this._maxLine = 0;
    this._overMaxlineAlert = Tw.ALERT_MSG_PRODUCT.ALERT_3_A91;
  } else if (mobileplanId === 'NA00006405') {
    this._maxLine = 1;
    this._overMaxlineAlert = Tw.ALERT_MSG_PRODUCT.ALERT_3_A92;
  }
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductMobileplanAddJoin5gxWatchtab.prototype = {

  _data: {
    addList: []
  },

  _cachedElement: function () {
    this.$btnNativeContactList = this.$container.find('.fe-btn_native_contact');
    this.$btnAddNum = this.$container.find('.fe-btn_add_num');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineWrap = this.$container.find('.fe-line_wrap');
    this.$inputNumber = this.$container.find('.fe-num_input');

    this._combinationTemplate = Handlebars.compile($('#fe-templ-line_item').html());
  },

  _bindEvent: function () {
    this.$lineList.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$btnAddNum.on('click', $.proxy(this._addNum, this));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));
    this.$btnSetupOk.on('click', $.proxy(this._procConfirm, this));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },


  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, this._onContact.bind(this));
  },

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

    if (this.$lineList.find('li').length > this._maxLine) {
      return this._popupService.openAlert(this._overMaxlineAlert.MSG,
        this._overMaxlineAlert.TITLE);
    }

    if (!Tw.ValidationHelper.isCellPhone(number) || this._data.addList.indexOf(number) !== -1) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    this._data.addList.push(number);
    this.$lineList.append(this._combinationTemplate({
      number: number,
      numMask: Tw.FormatHelper.conTelFormatWithDash(number)
    }));

    this._clearNum();
    this._toggleSetupButton(true);
    this.$lineWrap.show().attr('aria-hidden', 'false');
  },

  _delNum: function (e) {
    var $item = $(e.currentTarget).parents('li');

    this._data.addList.splice(this._data.addList.indexOf($item.data('num')), 1);

    $item.remove();
    if (this.$lineList.find('li').length < 1) {
      this.$lineWrap.hide().attr('aria-hidden', 'true');
      this._toggleSetupButton(false);
    }
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

    if (this.$lineWrap.length < 1) {
      return this._toggleSetupButton(this.$inputNumber.val().length > 0);
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

  _toggleSetupButton: function (isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
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

  _getSvcNumList: function () {
    var resultList = [];

    this.$lineList.find('li').each(function (index, item) {
      resultList.push(this._getServiceNumberFormat($(item).data('num')));
    }.bind(this));

    return resultList;
  },

  _convConfirmOptions: function (result) {
    this._confirmOptions = Tw.ProductHelper.convAdditionsJoinTermInfo(result);

    $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0),
      isMobilePlan: false,
      noticeList: this._confirmOptions.preinfo.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId]
      }]
    });

    return this._confirmOptions;
  },

  _procConfirm: function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0017, {
      joinTermCd: '01',
      optSvcNums: this._data.addList.join(',')
    }, {}, [this._prodId])
    .done($.proxy(this._procConfirmRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _procConfirmRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    new Tw.ProductCommonConfirm(true, null, this._convConfirmOptions(resp.result), $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0018, {
      svcNumList: this._getSvcNumList()
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _procJoinRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_10_0038, {
      scrbTermCd: 'S'
    }, {}, [this._prodId]).done($.proxy(this._isVasTerm, this));
  },

  _isVasTerm: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openVasTermPopup(resp.result);
  },

  _openSuccessPop: function () {
    if (!this._isResultPop) {
      return;
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN}],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
          this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function ($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _openVasTermPopup: function (respResult) {
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

  _bindVasTermPopupEvent: function ($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndOpenResultPopup: function () {
    this._isResultPop = true;
    this._popupService.close();
  },

  _onClosePop: function () {
    this._historyService.goBack();
  }

};
