/**
 * FileName: product.setting.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

Tw.ProductSetting = function(rootEl) {
  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductSetting.prototype = {

  _init: function() {
    this._prodId = this.$container.data('prod_id');
    this._displayId = this.$container.data('display_id');

    this._initByDisplayCase();
  },

  _initByDisplayCase: function() {
    switch(this._displayId) {
      case 'MP_02_02_03_01':
        this.$container.find('input[value="' + this.$container.find('#current_prod_id').val() + '"]').trigger('click');
        break;
    }
  },

  _cachedElement: function() {
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$btnSetupOk.on('click', $.proxy(this._saveData, this));
  },

  _saveData: function() {
    switch(this._displayId) {
      case 'MP_02_02_03_01':
        //
        break;
    }
  }

};
