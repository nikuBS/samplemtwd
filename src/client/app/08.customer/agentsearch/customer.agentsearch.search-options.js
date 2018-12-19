/**
 * FileName: customer.agentsearch.search-options.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.26
 */

Tw.CustomerAgentsearchSearchOptions = function (rootEl, currentOptions, applyCallback) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;

  this._currentOptions = currentOptions;
  this._newOptions = {};

  this._applyCallback = applyCallback;

  this._init();
  this._bindEvents();
};

Tw.CustomerAgentsearchSearchOptions.prototype = {
  _init: function () {
    $.extend(true, this._newOptions, this._currentOptions);

    if (this._currentOptions.storeType !== 0) {
      this.$container.find('input[type="radio"][value=' + this._currentOptions.storeType + ']')
        .click();
    }

    for (var key in this._currentOptions) {
      if (key === 'storeType') {
        continue;
      }
      this.$container.find('input[type="checkbox"][value=' + key + ']').click();
    }
  },
  _bindEvents: function () {
    this.$container.on('change', 'input[type="radio"]', $.proxy(this._onStoreTypeChanged, this));
    this.$container.on('click', 'input[type="checkbox"]', $.proxy(this._onCategoryChanged, this));
    this.$container.on('click', '.bt-red1 button', $.proxy(this._onApply, this));
    this.$container.on('click', '#fe-bt-close', $.proxy(this._onClose, this));
  },
  _onStoreTypeChanged: function (e) {
    this._newOptions.storeType = e.currentTarget.value;
  },
  _onCategoryChanged: function (e) {
    if (!!$(e.currentTarget).attr('checked')) {
      this._newOptions[e.currentTarget.value] = 'Y';
    } else {
      delete this._newOptions[e.currentTarget.value];
    }
  },
  _onApply: function () {
    if (_.isEqual(this._currentOptions, this._newOptions)) {
      this._applyCallback(false);
    } else {
      this._applyCallback(this._newOptions);
    }
  },
  _onClose: function () {
    var confirmed = false;
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy(function () {
        confirmed = true;
        this._popupService.close();
      }, this),
      $.proxy(function () {
        if (confirmed) {
          this._popupService.close();
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES
    );
  }
};
