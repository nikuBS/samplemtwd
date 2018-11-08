/**
 * FileName: product.join.reservation.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.30
 */

Tw.ProductJoinReservation = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._prodIdList = ['NH00000103', 'NA00002040', 'NH00000133', 'NH00000084'];

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductJoinReservation.prototype = {

  _init: function() {
    this._typeCd = this.$container.data('type_cd');
    this._prodId = this.$container.data('prod_id');
    this._isEtcProd = !Tw.FormatHelper.isEmpty(this._prodId) && this._prodIdList.indexOf(this._prodId) === -1;

    if (this._typeCd === 'combine') {
      this._initCombineProduct();
    }
  },

  _initCombineProduct: function() {
    this.$combineWrap.show();
    if (Tw.FormatHelper.isEmpty(this._prodId)) {
      return;
    }

    if (this._prodId !== 'NH00000103') {
      setTimeout(function() {
        this.$combineExplain.attr('aria-disabled', false).removeClass('disabled');
        this.$combineExplain.find('input[type=checkbox]').removeAttr('disabled').prop('disabled', false);
      }.bind(this));
    }

    this.$combineSelected.prop('checked', true);
  },

  _cachedElement: function() {
    this.$reservName = this.$container.find('#formInput01');
    this.$reservNumber = this.$container.find('#formInput02');
    this.$agreeWrap = this.$container.find('.fe-agree_wrap');
    this.$combineSelected = this.$container.find('.fe-combine_selected');
    this.$combineExplain = this.$container.find('.fe-combine_explain');
    this.$combineWrap = this.$container.find('.fe-combine_wrap');
    this.$formData = this.$container.find('.fe-form_data');
    this.$btnAgreeView = this.$container.find('.fe-btn_agree_view');
    this.$btnApply = this.$container.find('.fe-btn_apply');
    this.$btnSelectTypeCd = this.$container.find('.fe-btn_select_type_cd');
    this.$btnSelectCombine = this.$container.find('.fe-btn_select_combine');
  },

  _bindEvent: function() {
    this.$container.on('keyup input', '.fe-input_name', $.proxy(this._toggleInputCancelBtn, this));
    this.$container.on('keyup input', '.fe-input_phone_number', $.proxy(this._detectInputNumber, this));
    this.$container.on('blur', '.fe-input_phone_number', $.proxy(this._blurInputNumber, this));
    this.$container.on('focus', '.fe-input_phone_number', $.proxy(this._focusInputNumber, this));
    this.$container.on('click', '.fe-btn_cancel', $.proxy(this._procClearInput, this));

    this.$btnAgreeView.on('click', $.proxy(this._openAgreePop, this));
    this.$btnApply.on('click', $.proxy(this._procApplyCheck, this));
    this.$btnSelectTypeCd.on('click', $.proxy(this._openTypeCdPop, this));
    this.$btnSelectCombine.on('click', $.proxy(this._openCombinePop, this));

    this.$combineSelected.on('change', $.proxy(this._changeCombineSelected, this));
    this.$agreeWrap.on('change', 'input[type=checkbox]', $.proxy(this._procEnableApplyCheck, this));
    this.$formData.on('keyup input', 'input', $.proxy(this._procEnableApplyCheck, this));
    this.$combineExplain.on('change', 'input[type=checkbox]', $.proxy(this._onChangeCombineExplain, this));
  },

  _openTypeCdPop: function() {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.PRODUCT_RESERVATION.title,
      data: [{
        'list': [
          { value: Tw.PRODUCT_RESERVATION.cellphone,
            option: this._typeCd === 'cellphone' ? 'checked' : '',
            attr: 'data-type_cd="cellphone"' },
          { value: Tw.PRODUCT_RESERVATION.internet,
            option: this._typeCd === 'internet' ? 'checked' : '',
            attr: 'data-type_cd="internet"' },
          { value: Tw.PRODUCT_RESERVATION.phone,
            option: this._typeCd === 'phone' ? 'checked' : '',
            attr: 'data-type_cd="phone"' },
          { value: Tw.PRODUCT_RESERVATION.tv,
            option: this._typeCd === 'tv' ? 'checked' : '',
            attr: 'data-type_cd="tv"' },
          { value: Tw.PRODUCT_RESERVATION.combine,
            option: this._typeCd === 'combine' ? 'checked' : '',
            attr: 'data-type_cd="combine"' }
        ]
      }]
    }, $.proxy(this._typeCdPopupBindEvent, this), $.proxy(this._typeCdPopupClose, this), 'type_cd_select');
  },

  _typeCdPopupBindEvent: function($popupContainer) {
    $popupContainer.on('click', '[data-type_cd]', $.proxy(this._setTypeCd, this));
  },

  _setTypeCd: function(e) {
    this._typeCd = $(e.currentTarget).data('type_cd');
    this._popupService.close();
  },

  _typeCdPopupClose: function() {
    if (this._typeCd !== 'combine') {
      this._resetCombineWrap();
      this.$combineWrap.hide();
    } else {
      this.$combineWrap.show();
    }

    this.$btnSelectTypeCd.text(Tw.PRODUCT_RESERVATION[this._typeCd]);
    this._historyService.replacePathName(window.location.pathname + '?type_cd=' + this._typeCd);
  },

  _resetCombineWrap: function() {
    this.$combineSelected.prop('checked', false);
    this.$combineSelected.parent().removeClass('checked').attr('aria-checked', false);
    this._changeCombineSelected();
  },

  _changeCombineSelected: function() {
    if (this.$combineSelected.is(':checked')) {
      return;
    }

    this._prodId = null;
    this._setBtnCombineTxt(Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NONE.TITLE);

    this.$combineExplain.attr('aria-disabled', true).addClass('disabled').removeClass('checked');
    this.$combineExplain.find('input[type=checkbox]').attr('disabled', 'disabled').prop('disabled', true)
      .prop('checked', false);
  },

  _openCombinePop: function() {
    this._popupService.open({
      hbs: 'actionsheet_select_b_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_RESERVATION_COMBINE_PRODUCT,
      data: [{
        'type': Tw.PRODUCT_COMBINE_PRODUCT.GROUP_PERSONAL,
        'list': [
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000103.TITLE,
            explain: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000103.EXPLAIN,
            option: (this._prodId === 'NH00000103') ? 'checked' : '', attr: 'data-prod_id="NH00000103"'
          }
        ]
      },
      {
        'type': Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY,
        'list': [
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NA00002040.TITLE,
            explain: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NA00002040.EXPLAIN,
            option: (this._prodId === 'NA00002040') ? 'checked' : '', attr: 'data-prod_id="NA00002040"'
          },
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000133.TITLE,
            explain: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000133.EXPLAIN,
            option: (this._prodId === 'NH00000133') ? 'checked' : '', attr: 'data-prod_id="NH00000133"'
          },
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000084.TITLE,
            explain: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000084.EXPLAIN,
            option: (this._prodId === 'NH00000084') ? 'checked' : '', attr: 'data-prod_id="NH00000084"'
          },
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.ETC.TITLE,
            option: (this._isEtcProd || this._prodId === 'ETC') ? 'checked' : '',
            attr: 'data-prod_id="' + (!Tw.FormatHelper.isEmpty(this._prodId) &&
            Tw.FormatHelper.isEmpty(Tw.PRODUCT_COMBINE_PRODUCT.ITEMS[this._prodId]) ? this._prodId : 'ETC') + '"'
          }
        ]
      }]
    }, $.proxy(this._bindCombinePop, this), $.proxy(this._setCombineResult, this), 'combine_select');
  },

  _bindCombinePop: function($popupContainer) {
    $popupContainer.on('click', '[data-prod_id]', $.proxy(this._setCombine, this));
  },

  _setCombine: function(e) {
    this.$combineSelected.prop('checked', true);
    this.$combineSelected.parent().addClass('checked').attr('aria-checked', true);
    this._prodId = $(e.currentTarget).data('prod_id');
    this._popupService.close();
  },

  _setCombineResult: function() {
    this._toggleCombineExplain();
    this._setBtnCombineTxt(this._getCombineProdNm());
  },

  _setBtnCombineTxt: function(txt) {
    this.$btnSelectCombine.html(txt + $('<div\>').append(this.$btnSelectCombine.find('.ico')).html());
  },

  _getCombineProdNm: function() {
    if (!Tw.FormatHelper.isEmpty(Tw.PRODUCT_COMBINE_PRODUCT.ITEMS[this._prodId])) {
      return Tw.PRODUCT_COMBINE_PRODUCT.ITEMS[this._prodId].TITLE;
    }

    return Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.ETC.TITLE;
  },

  _toggleCombineExplain: function() {
    if (this._prodId === 'NH00000103') {
      this.$combineExplain.removeClass('checked');
      this.$combineExplain.find('input[type=checkbox]').prop('checked', false).removeAttr('checked')
        .attr('disabled', 'disabled').prop('disabled', true);
      this.$combineExplain.attr('aria-disabled', true).addClass('disabled');
    } else {
      this.$combineExplain.find('input[type=checkbox]').removeAttr('disabled').prop('disabled', false);
      this.$combineExplain.attr('aria-disabled', false).removeClass('disabled');
    }
  },

  _openAgreePop: function() {
    this._popupService.open({
      hbs: 'FT_01_03_L01_case',
      layer: true
    }, $.proxy(this._bindAgreePop, this), null, 'agree_pop');
  },

  _bindAgreePop: function($popupContainer) {
    $popupContainer.find('.fe-btn_ok').on('click', $.proxy(this._closeAgreePop, this));
  },

  _closeAgreePop: function() {
    this._popupService.close();
  },

  _procClearInput: function(e) {
    var $btnCancel = $(e.currentTarget);
    $btnCancel.parent().find('input').val('');
    $btnCancel.removeClass('block');

    if ($btnCancel.hasClass('fe-clear_check')) {
      this._procEnableApplyCheck();
    }
  },

  _procEnableApplyCheck: function() {
    if (this.$agreeWrap.find('input[type=checkbox]:not(:checked)').length > 0) {
      return this._toggleApplyBtn(false);
    }

    if (this.$reservName.val().length < 1 || this.$reservNumber.val().length < 1) {
      return this._toggleApplyBtn(false);
    }

    this._toggleApplyBtn(true);
  },

  _detectInputNumber: function(e) {
    var $input = $(e.currentTarget);
    $input.val($input.val().replace(/[^0-9.]/g, ''));
    if ($input.val().length > 11) {
      $input.val($input.val().substr(0, 11));
    }

    this._toggleInputCancelBtn(e);
  },

  _blurInputNumber: function(e) {
    var $input = $(e.currentTarget);
    if (Tw.FormatHelper.isEmpty($input.val())) {
      return;
    }

    $input.val(Tw.FormatHelper.getDashedCellPhoneNumber($input.val()));
  },

  _focusInputNumber: function(e) {
    var $input = $(e.currentTarget);
    $input.val($input.val().replace(/-/gi, ''));
  },

  _toggleInputCancelBtn: function(e) {
    var $input = $(e.currentTarget);
    if ($input.val().length > 0) {
      $input.parent().find('.fe-btn_cancel').addClass('block');
    } else {
      $input.parent().find('.fe-btn_cancel').removeClass('block');
    }
  },

  _toggleApplyBtn: function(toggle) {
    if (toggle) {
      this.$btnApply.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnApply.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _procApplyCheck: function() {
    if (!Tw.ValidationHelper.isCellPhone(this.$reservNumber.val()) && !Tw.ValidationHelper.isTelephone(this.$reservNumber.val())) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    if (this._typeCd === 'combine' && !Tw.FormatHelper.isEmpty(this._prodId) &&
      this._prodId !== 'NH00000103' && !this.$combineExplain.find('input[type=checkbox]').is(':checked')) {
      this._isExplainFile = true;
      return this._popupService.openConfirm(Tw.ALERT_MSG_PRODUCT.ALERT_3_A31.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A31.TITLE, $.proxy(this._setNotExplainFile, this), $.proxy(this._procNotExplainFile, this));
    }

    if (this._typeCd === 'combine' && Tw.FormatHelper.isEmpty(this._prodId)) {
      this._isNotSelectCombine = true;
      return this._popupService.openConfirm(Tw.ALERT_MSG_PRODUCT.ALERT_JOIN_RESERVATION_NOT_COMBINE.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_JOIN_RESERVATION_NOT_COMBINE.TITLE,
        $.proxy(this._setNotSelectCombine, this), $.proxy(this._procNotSelectCombine, this));
    }

    if (this._typeCd === 'combine' && this.$combineExplain.find('input[type=checkbox]').is(':checked') &&
      !Tw.FormatHelper.isEmpty(this._prodId)) {
      return this._openExplainFilePop();
    }

    this._procApply();
  },

  _setNotExplainFile: function() {
    this._isExplainFile = false;
    this._popupService.close();
  },

  _procNotExplainFile: function() {
    if (this._isExplainFile) {
      return;
    }

    this._procApply();
  },

  _setNotSelectCombine: function() {
    this._isNotSelectCombine = false;
    this._popupService.close();
  },

  _procNotSelectCombine: function() {
    if (this._isNotSelectCombine) {
      return;
    }

    this._procApply();
  },

  _onChangeCombineExplain: function() {
    if (this.$combineExplain.find('input[type=checkbox]').is(':checked')) {
      this.$btnApply.text(Tw.BUTTON_LABEL.NEXT);
    } else {
      this.$btnApply.text(Tw.BUTTON_LABEL.APPLY);
    }
  },

  _openExplainFilePop: function() {
    // @todo Dummy Input
    new Tw.ProductJoinReservationExplain([], $.proxy(this._procApply, this));
  },

  _procApply: function(_combinationInfo) {
    var combinationInfo = _combinationInfo || null;
    // console.log(combinationInfo);
    // console.log('* procApply');
    //
    // this._apiService.request(Tw.API_CMD.BFF_10_0076, {
    // }).done($.proxy(this._procApplyResult, this));

    // @todo dummy result
    this._procApplyResult({
      code: Tw.API_CODE.CODE_00
    });
  },

  _procApplyResult: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open({
      hbs: 'complete_subtexts',
      text: Tw.PRODUCT_RESERVATION.success.text,
      subtexts: [
        Tw.PRODUCT_RESERVATION.success.subtext_product + this.$btnSelectTypeCd.text(),
        Tw.PRODUCT_RESERVATION.success.subtext_applyer + this.$reservName.val() + ' / ' + this.$reservNumber.val(),
        Tw.PRODUCT_RESERVATION.success.subtext_info
      ]
    }, null, $.proxy(this._closeSuccessPop, this));
  },

  _closeSuccessPop: function() {
    this._popupService.close();
  }

};
