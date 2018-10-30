/**
 * FileName: product.join-reservation.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.30
 */

Tw.ProductJoinReservation = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._prodIdList = ['NH00000103', 'NA00002040', 'NH00000133', 'NH00000084'];

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductJoinReservation.prototype = {

  _init: function() {
    this._prodId = this.$container.data('prod_id');
    this._isEtcProd = this._prodIdList.indexOf(this._prodId) === -1;

    if (this.$agreeWrap.length < 1) {
      this._toggleApplyBtn(true);
    }
  },

  _cachedElement: function() {
    this.$reservName = this.$container.find('#formInput01');
    this.$reservNumber = this.$container.find('#formInput02');
    this.$agreeWrap = this.$container.find('.fe-agree_wrap');
    this.$btnAgreeView = this.$container.find('.fe-btn_agree_view');
    this.$btnApply = this.$container.find('.fe-btn_apply');
    this.$btnInputCancel = this.$container.find('.fe-btn_cancel');
    this.$btnSelectProduct = this.$container.find('.fe-btn_select_product');
  },

  _bindEvent: function() {
    this.$reservName.on('keyup input', $.proxy(this._toggleInputCancelBtn, this));
    this.$reservNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$btnAgreeView.on('click', $.proxy(this._openAgreePop, this));
    this.$btnApply.on('click', $.proxy(this._procApply, this));
    this.$btnInputCancel.on('click', $.proxy(this._procClearInput, this));
    this.$btnSelectProduct.on('click', $.proxy(this._openSelectProductPop, this));
    this.$agreeWrap.on('change', 'input[type=checkbox]', $.proxy(this._procAgreeCheck, this));
  },

  _openSelectProductPop: function() {
    this._popupService.open({
      hbs: 'actionsheet_select_b_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_RESERVATION_COMBINE_PRODUCT,
      data: [{
        'type': Tw.PRODUCT_COMBINE_PRODUCT.GROUP_PERSONAL,
        'list': [
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.GROUP_PERSONAL_ITEMS.NH00000103.TITLE,
            explain: Tw.PRODUCT_COMBINE_PRODUCT.GROUP_PERSONAL_ITEMS.NH00000103.EXPLAIN,
            option: (this._prodId === 'NH00000103') ? 'checked' : '', attr: 'data-prod_id="NH00000103"'
          }
        ]
      },
      {
        'type': Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY,
        'list': [
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY_ITEMS.NA00002040.TITLE,
            explain: Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY_ITEMS.NA00002040.EXPLAIN,
            option: (this._prodId === 'NA00002040') ? 'checked' : '', attr: 'data-prod_id="NA00002040"'
          },
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY_ITEMS.NA00000133.TITLE,
            explain: Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY_ITEMS.NA00000133.EXPLAIN,
            option: (this._prodId === 'NA00000133') ? 'checked' : '', attr: 'data-prod_id="NA00000133"'
          },
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY_ITEMS.NA00000084.TITLE,
            explain: Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY_ITEMS.NA00000084.EXPLAIN,
            option: (this._prodId === 'NA00000084') ? 'checked' : '', attr: 'data-prod_id="NA00000084"'
          },
          {
            value: Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY_ITEMS.ETC.TITLE,
            option: (!Tw.FormatHelper.isEmpty(this._prodId) && this._isEtcProd) ? 'checked' : '',
            attr: 'data-prod_id="' + (Tw.FormatHelper.isEmpty(this._prodId) ? 'etc' : this._prodId) + '"'
          }
        ]
      }]
    }, $.proxy(this._categoryPopupBindEvent, this), $.proxy(this._goCategory, this), 'inifinity_category_popup');
  },

  _openAgreePop: function(e) {
    var $agreeItem = $(e.currentTarget).parents('li');
    this._popupService.open({
      hbs: 'FT_01_03_L01',
      data: {
        title: $agreeItem.find('.fe-agree_title').text(),
        html: $agreeItem.find('.fe-agree_full_html').html()
      }
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
  },

  _procAgreeCheck: function() {
    this._toggleApplyBtn(this.$agreeWrap.find('input[type=checkbox]:not(:checked)').length < 1);
  },

  _detectInputNumber: function(e) {
    this.$reservNumber.val(this.$reservNumber.val().replace(/[^0-9.]/g, ''));
    if (this.$reservNumber.val().length > 11) {
      this.$reservNumber.val(this.$reservNumber.val().substr(0, 11));
    }

    this._toggleInputCancelBtn(e);
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

  _procApply: function() {}

};
