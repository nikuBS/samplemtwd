/**
 * @file 지점 검색 옵션 변경 레이어팝업 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-26
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 * @param  {Object} currentOptions - 현재 선택된 옵션 내용
 * @param  {Function} applyCallback - 옵션 변경 완료 후 호출할 callback
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

  /**
   * @function
   * @desc 현재 선택된 옵션을 화면에 반영
   */
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

  /**
   * @function
   * @desc 전체/지점/대리점 옵션 변경시 처리
   * @param  {Object} e - click event
   */
  _onStoreTypeChanged: function (e) {
    this._newOptions.storeType = e.currentTarget.value;
  },

  /**
   * @function
   * @desc TpremiumStore, 임대폰 등등 옵션 값 변경 시 처리
   * @param  {Object} e - click event
   */
  _onCategoryChanged: function (e) {
    if (!!$(e.currentTarget).attr('checked')) {
      this._newOptions[e.currentTarget.value] = 'Y';
    } else {
      delete this._newOptions[e.currentTarget.value];
    }
  },

  /**
   * @function
   * @desc 옵션 변경 완료 후 callback 호출
   */
  _onApply: function () {
    this._popupService.close();
    setTimeout($.proxy(function () {
      if (_.isEqual(this._currentOptions, this._newOptions)) {
        this._applyCallback(false);
      } else {
        this._applyCallback(this._newOptions);
      }
    }, this), 100);
  },

  /**
   * @function
   * @desc 취소버튼 선택 시 레이어 팝업 닫음
   */
  _onClose: function () {
    /*  취소확인 팝업 삭제
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
    */

    this._popupService.close();
  }
};
