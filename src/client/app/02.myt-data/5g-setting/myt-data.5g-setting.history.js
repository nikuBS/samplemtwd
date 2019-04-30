/**
 * @file 5g 시간설정 내역
 * @author anklebreaker
 * @since 2019-04-05
 */

/**
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 */
Tw.MyTData5gSettingHistory = function (rootEl, historyInfo) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);

  historyInfo = JSON.parse(window.unescape(historyInfo));
  this._brwsDt = historyInfo.brwsDt;
  this._searchDateList = historyInfo.searchDateList;

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTData5gSettingHistory.prototype = {

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnSelect = this.$container.find('.bt-select');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$btnSelect.on('click', $.proxy(this._search, this));
  },

  /**
   * @function
   * @desc 월별 검색 액션시트 오픈
   */
  _search: function (e) {
    var listData = this._searchDateList.map($.proxy(function (item, i) {
      return {
        'label-attr': 'for=ra' + i, 'txt': item.text,
        'radio-attr': 'id="ra' + i + '" name="selectFilter" value="' + item.value + '"' + (this._brwsDt === item.value ? ' checked' : '')
      };
    }, this));
    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: [{list: listData}],
        btnfloating: {
          'attr': 'type="button"',
          'class': 'tw-popup-closeBtn',
          'txt': Tw.BUTTON_LABEL.CLOSE
        }
      }, $.proxy(this._onOpenActionsheet, this),
      null, 'select_filter', $(e.currentTarget));
  },

  /**
   * @function
   * @desc 액션시트 select callback
   */
  _onOpenActionsheet: function () {
    $('.ac-list').on('change', $.proxy(function (e) {
      this._historyService.replaceURL('?brwsDt=' + e.target.value);
    }, this));
  }

};
