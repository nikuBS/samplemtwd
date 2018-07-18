/**
 * FileName: recharge.cookiz.history.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.09
 */

Tw.RechargeCookizHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeCookizHistory.prototype = {
  DEFAULT_LIST_COUNT: 20,
  tab1_searchType: '0',
  tab1_searchPeriod: '-3',
  tab1_listIndex: 20,
  tab1_list: [],
  tab2_searchType: '0',
  tab2_searchPeriod: '-3',
  tab2_listIndex: 20,
  tab2_list: [],

  _init: function () {
    this._fetchData();
  },

  _cachedElement: function () {
    this.$wrap_gift_history = $('#wrap_cookiz_recharge_history');
    this.$wrap_gift_block_history = $('#wrap_cookiz_recharge_auth_history');
    this.tpl_ting_item_history = Handlebars.compile($('#tpl_cookiz_recharge_history').text());
    this.tpl_ting_item_no_history = Handlebars.compile($('#tpl_ting_item_no_history').text());
    this.tpl_ting_item_block_history = Handlebars.compile($('#tpl_cookiz_recharge_auth_history').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '.bt-dropdown.small', $.proxy(this.openWidget, this));
    this.$container.on('click', '.tab-linker button', $.proxy(this._onChangeTab, this));
    this.$container.on('click', '.gift-bt-more', $.proxy(this._onClickMoreButton, this));
    this.$container.on('click', '.search_condition button', $.proxy(this._onSelectCondition, this));
    this.$container.on('click', '.btn_refundable', $.proxy(this._cancelRecharge, this));
  },

  _onClickMoreButton: function () {
    if ( this._getCurrentTabIndex() === 0 ) {
      this.tab1_listIndex = this.tab1_listIndex + this.DEFAULT_LIST_COUNT;
      this._renderList(this.tab1_list.slice(0, this.tab1_listIndex));
    }

    if ( this._getCurrentTabIndex() === 1 ) {
      this.tab2_listIndex = this.tab2_listIndex + this.DEFAULT_LIST_COUNT;
      this._renderList(this.tab2_list.slice(0, this.tab2_listIndex));
    }
  },

  _renderMoreButton: function () {
    var nCurrentTabIndex = this._getCurrentTabIndex();
    var elBtnMore = $('.gift-bt-more')[nCurrentTabIndex];

    if ( nCurrentTabIndex === 0 ) {
      if ( this.tab1_list.length <= this.DEFAULT_LIST_COUNT ) {
        $(elBtnMore).hide();
      } else {
        this._drawRemainCounter(elBtnMore, this.tab1_listIndex, this.tab1_list.length);
      }
    }

    if ( nCurrentTabIndex === 1 ) {
      if ( this.tab2_list.length <= this.DEFAULT_LIST_COUNT ) {
        $(elBtnMore).hide();
      } else {
        this._drawRemainCounter(elBtnMore, this.tab2_listIndex, this.tab2_list.length);
      }
    }
  },

  _drawRemainCounter: function (elBtnMore, listIndex, length) {
    if ( listIndex > length ) {
      $(elBtnMore).hide();
    } else {
      $(elBtnMore).find('.num').text(length - listIndex);
      $(elBtnMore).show();
    }
  },

  _onChangeTab: function () {
    this._fetchData();
  },

  _fetchData: function () {
    var nCurrentTabIndex = this._getCurrentTabIndex();

    if ( nCurrentTabIndex === 0 ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0032, {
        type: this.tab1_searchType,
        fromDt: Tw.DateHelper.getShortDateWithFormatAddByUnit(new Date(), this.tab1_searchPeriod, 'month', 'YYYYMMDD'),
        toDt: Tw.DateHelper.getCurrentShortDate()
      }).done($.proxy(this._onSuccessFetchData, this));
    }

    if ( nCurrentTabIndex === 1 ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0033, {
        fromDt: Tw.DateHelper.getShortDateWithFormatAddByUnit(new Date(), this.tab2_searchPeriod, 'month', 'YYYYMMDD'),
        toDt: Tw.DateHelper.getCurrentShortDate()
      }).done($.proxy(this._onSuccessFetchData, this));
    }
  },

  _onSuccessFetchData: function (res) {
    var nCurrentTabIndex = this._getCurrentTabIndex();
    if ( res.code === Tw.API_CODE.CODE_00 ) {

      if ( res.result.length === 0 ) {
        this._renderNoList();
        return false;
      }

      if ( nCurrentTabIndex === 0 ) {
        res = $.extend(true, [], res);
        this.tab1_list = res.result;
        this._renderList(this._parseHistoryData(this.tab1_list.slice(0, this.tab1_listIndex)));
      }

      if ( nCurrentTabIndex === 1 ) {
        res = $.extend(true, [], res);
        this.tab2_list = res.result;
        this._renderList(this._parseHistoryData(this.tab2_list.slice(0, this.tab2_listIndex)));
      }

      var $wrap_count = $($('.contents-info-list .num')[nCurrentTabIndex]);
      $wrap_count.text(res.result.length);
    }
  },

  _renderNoList: function () {
    var nCurrentTabIndex = this._getCurrentTabIndex();

    var wrapHistoryResult = $('li[aria-selected="true"]').find('.inner');
    wrapHistoryResult.siblings('.gift-bt-more').hide();

    if ( nCurrentTabIndex === 0 ) {
      wrapHistoryResult.html(this.tpl_ting_item_no_history({ content: Tw.MSG_GIFT.COOKIZ_NO_HISTORY }));
    }

    if ( nCurrentTabIndex === 1 ) {
      wrapHistoryResult.html(this.tpl_ting_item_no_history({ content: Tw.MSG_GIFT.COOKIZ_NO_AUTH_HISTORY }));
    }
  },

  _parseHistoryData: function (list) {
    return $.each(list, function (index, item) {
      item.amt = item.amt ? Tw.FormatHelper.addComma(item.amt) : '';
      item.topUpLimit = item.topUpLimit ? Tw.FormatHelper.addComma(item.topUpLimit) : '';
      item.opDt = Tw.DateHelper.getShortDateWithFormat(item.opDt, 'YYYY.MM.DD');
    });
  },

  _onSelectCondition: function () {
    var nCurrentTabIndex = this._getCurrentTabIndex();
    var $searchType = $('.wrap_search_type').find('input:checked');
    var $searchPeriod = $('.wrap_search_period').find('input:checked');

    var sType = $searchType.parent().text().trim();
    var sPeriod = $searchPeriod.parent().text().trim();

    if ( nCurrentTabIndex === 0 ) {
      this.tab1_searchType = $searchType.val();
      this.tab1_searchPeriod = $searchPeriod.val();
      this.tab1_listIndex = this.DEFAULT_LIST_COUNT;
    }

    if ( nCurrentTabIndex === 1 ) {
      this.tab2_searchType = $searchType.val();
      this.tab2_searchPeriod = $searchPeriod.val();
      this.tab2_listIndex = this.DEFAULT_LIST_COUNT;
    }

    this._popupService.close();

    var $wrap_tab_contents = $($('.tab-contents [role="tabpanel"]').get(nCurrentTabIndex));
    var $btn_dropdown = $wrap_tab_contents.find('.bt-dropdown.small');
    $btn_dropdown.text(sType + ' · ' + sPeriod);

    this._fetchData();
  },

  _renderList: function (list) {
    var parsedList = this._parseHistoryData(list);
    var nCurrentTabIndex = this._getCurrentTabIndex();

    if ( nCurrentTabIndex === 0 ) {
      this.$wrap_gift_history.html(this.tpl_ting_item_history({ list: parsedList }));
    }

    if ( nCurrentTabIndex === 1 ) {
      this.$wrap_gift_block_history.html(this.tpl_ting_item_block_history({ list: parsedList }));
    }

    this._renderMoreButton();
  },

  openWidget: function () {
    var nCurrentTabIndex = this._getCurrentTabIndex();

    var typeOption = [];

    if ( nCurrentTabIndex === 0 ) {
      typeOption = [{
        checked: false,
        value: '0',
        text: Tw.POPUP_PROPERTY.ALL
      }, {
        checked: false,
        value: '1',
        text: Tw.RECHARGE_TYPE.RECHARGE
      }, {
        checked: false,
        value: '2',
        text: Tw.RECHARGE_TYPE.CANCEL
      }];
    } else {
      typeOption = [{
        checked: false,
        value: '0',
        text: Tw.POPUP_PROPERTY.ALL
      }, {
        checked: false,
        value: '1',
        text: Tw.RECHARGE_TYPE.CHANGE
      }, {
        checked: false,
        value: '2',
        text: Tw.RECHARGE_TYPE.BLOCK
      }];
    }

    var periodOption = [{
      checked: false,
      value: '-1',
      text: Tw.DATE_UNIT.ONE_MONTH
    }, {
      checked: false,
      value: '-3',
      text: Tw.DATE_UNIT.THREE_MONTH
    }, {
      checked: false,
      value: '-6',
      text: Tw.DATE_UNIT.SIX_MONTH
    }, {
      checked: false,
      value: '-12',
      text: Tw.DATE_UNIT.ONE_YEAR
    }];

    var context = this;

    typeOption = $.each(typeOption, function (key, item) {
      if ( nCurrentTabIndex === 0 && context.tab1_searchType === item.value ) {
        item.checked = true;
      }

      if ( nCurrentTabIndex === 1 && context.tab2_searchType === item.value ) {
        item.checked = true;
      }

      return item;
    });

    periodOption = $.each(periodOption, function (key, item) {
      if ( nCurrentTabIndex === 0 && context.tab1_searchPeriod === item.value ) {
        item.checked = true;
      }

      if ( nCurrentTabIndex === 1 && context.tab2_searchPeriod === item.value ) {
        item.checked = true;
      }

      return item;
    });

    this._popupService.open({
      hbs: 'select',
      title: Tw.POPUP_TITLE.CHANGE_SEARCH_CONDITION,
      multiplex: true,
      select: [{
        title: 'Type',
        style_class: 'three wrap_search_type',
        options: typeOption
      }, {
        title: Tw.POPUP_PROPERTY.PERIOD,
        style_class: 'two wrap_search_period',
        options: periodOption
      }],
      bt_num: 'one',
      type: [{
        style_class: 'bt-red1 search_condition',
        txt: Tw.BUTTON_LABEL.SELECT
      }]
    });
  },

  _getCurrentTabIndex: function () {
    var $currentTab = $('[aria-selected="true"]').first();
    return $('[role=tablist]').children().index($currentTab);
  },

  _cancelRecharge: function () {
    this._popupService.openAlert(Tw.MSG_GIFT.COOKIZ_A02);
  }
};