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

  this._popupService.open({
    hbs: 'BS_05_01_01_01',
    layer: true,
    list: familyList || []
  }, $.proxy(this._init, this), $.proxy(this._closePop), 'explain_pop');
};

Tw.ProductJoinReservationExplain.prototype = {

  _init: function($popupContainer) {
    this.$container = $popupContainer;
    this._cachedElement();
    this._bindEvent();
    this._familyType = null;

    if (this.$familyList.find('li').length > 0) {
      this.$familyWrap.show();
    }
  },

  _cachedElement: function() {
    this.$familyWrap = this.$container.find('.fe-family_wrap');
    this.$familyList = this.$container.find('.fe-family_list');

    this.$btnFamilyType = this.$container.find('.fe-btn_family_type');
  },

  _bindEvent: function() {
    this.$btnFamilyType.on('click', $.proxy(this._openFamilyTypePop, this));
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

  _bindFamilyTypePop: function($popupContainer) {
    $popupContainer.on('click', '[data-family_type]', $.proxy(this._setFamilyType, this));
  },

  _setFamilyType: function(e) {
    this._familyType = $(e.currentTarget).data('family_type');
    this.$btnFamilyType.text(Tw.FAMILY_TYPE[this._familyType.toUpperCase()] + $('<div\>').append(this.$btnSelectCombine.find('.ico')).html());
    this._popupService.close();
  },

  _closePop: function() {}
};

