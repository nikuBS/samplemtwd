/**
 * FileName: product.join-reservation.explain.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.05
 */

Tw.ProductJoinReservationExplain = function(familyList, callback) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._callback = callback;

  this._familyList = [];
  this._fileList = [];

  this._fileTemplate = Handlebars.compile($('#fe-templ-reserv-file').html());
  this._familyTemplate = Handlebars.compile($('#fe-tmpl-reserv-family').html());

  this._popupService.open({
    hbs: 'BS_05_01_01_01',
    layer: true,
    list: familyList || []
  }, $.proxy(this._init, this), $.proxy(this._closePop), 'combine_explain');
};

Tw.ProductJoinReservationExplain.prototype = {

  _init: function($popupContainer) {
    this.$container = $popupContainer;
    this._cachedElement();
    this._bindEvent();
    this._familyType = null;
    this._doApply = false;

    if (this._familyList.length > 0) {
      this.$familyWrap.show();
    }

    this._procEnableApplyBtn();
  },

  _cachedElement: function() {
    this.$familyWrap = this.$container.find('.fe-family_wrap');
    this.$familyAddWrap = this.$container.find('.fe-family_add_wrap');
    this.$familyAddWrapNumber = this.$container.find('.fe-input_phone_number');
    this.$familyList = this.$container.find('.fe-family_list');
    this.$fileWrap = this.$container.find('.fe-file_wrap');
    this.$fileList = this.$container.find('.fe-file_list');

    this.$btnFamilyType = this.$container.find('.fe-btn_family_type');
    this.$btnFamilyAdd = this.$container.find('.fe-btn_family_add');
    this.$btnExplainApply = this.$container.find('.fe-btn_explain_apply');
  },

  _bindEvent: function() {
    this.$btnFamilyType.on('click', $.proxy(this._openFamilyTypePop, this));
    this.$btnExplainApply.on('click', $.proxy(this._procApply, this));
    this.$btnFamilyAdd.on('click', $.proxy(this._addFamily, this));
    this.$familyAddWrap.on('keyup input', 'input[type=text]', $.proxy(this._procEnableAddFamilyBtn, this));
  },

  _openFamilyTypePop: function() {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_FAMILY_TYPE,
      data: [{
        'list': [
          { value: Tw.FAMILY_TYPE.SPOUSE, option: (this._familyType === 'spouse') ? 'checked' : '', attr: 'data-family_type="spouse"' },
          { value: Tw.FAMILY_TYPE.CHILDREN, option: (this._familyType === 'children') ? 'checked' : '', attr: 'data-family_type="children"' },
          { value: Tw.FAMILY_TYPE.PARENTS, option: (this._familyType === 'parents') ? 'checked' : '', attr: 'data-family_type="parents"' },
          { value: Tw.FAMILY_TYPE.BROTHER, option: (this._familyType === 'brother') ? 'checked' : '', attr: 'data-family_type="brother"' },
          { value: Tw.FAMILY_TYPE.GRANDPARENTS, option: (this._familyType === 'grandparents') ? 'checked' : '',
            attr: 'data-family_type="grandparents"' },
          { value: Tw.FAMILY_TYPE.ME, option: (this._familyType === 'me') ? 'checked' : '', attr: 'data-family_type="me"' }
        ]
      }]
    }, $.proxy(this._bindFamilyTypePop, this), null, 'select_family_type');
  },

  _procEnableAddFamilyBtn: function() {
    if (Tw.FormatHelper.isEmpty(this._familyType) || this.$familyAddWrap.find('.fe-input_name').val().length < 1 ||
      this.$familyAddWrap.find('.fe-input_phone_number').val().length < 1) {
      return this._toggleBtn(this.$btnFamilyAdd, false);
    }

    this._toggleBtn(this.$btnFamilyAdd, true);
  },

  _addFamily: function() {
    if (!Tw.ValidationHelper.isCellPhone(this.$familyAddWrapNumber.val()) && !Tw.ValidationHelper.isTelephone(this.$familyAddWrapNumber.val())) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    this._toggleBtn(this.$btnFamilyAdd, this._familyList.length < 5);
  },

  _bindFamilyTypePop: function($popupContainer) {
    $popupContainer.on('click', '[data-family_type]', $.proxy(this._setFamilyType, this));
  },

  _setFamilyType: function(e) {
    this._familyType = $(e.currentTarget).data('family_type');
    this.$btnFamilyType.html(Tw.FAMILY_TYPE[this._familyType.toUpperCase()] + $('<div\>').append(this.$btnFamilyType.find('.ico')).html());
    this._popupService.close();
  },

  _procEnableApplyBtn: function() {
    if (this._familyList.length < 1 || this._fileList.length < 1) {
      this._toggleBtn(this.$btnExplainApply, true);
    }

    this._toggleBtn(this.$btnExplainApply, false);
  },

  _toggleBtn: function($btn, isEnable) {
    if (isEnable) {
      $btn.removeAttr('disabled').prop('disabled', false);
    } else {
      $btn.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _procApply: function() {
    this._doApply = true;
    this._popupService.close();
  },

  _closePop: function() {
    if (!this._doApply) {
      return;
    }

    this._callback({
      familyList: this._familyList,
      fileList: this._fileList
    });
  }
};

