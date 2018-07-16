/**
 * FileName: recharge.ting.history.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeTingHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeTingHistory.prototype = {
  DEFAULT_LIST_COUNT: 20,
  tab1_searchType: '0',
  tab1_searchPeriod: '-3',
  tab1_listIndex: 0,
  tab1_list: [],
  tab2_searchType: '0',
  tab2_searchPeriod: '-3',
  tab2_listIndex: 0,
  tab2_list: [],

  _init: function () {
    this._fetchData();
  },

  _cachedElement: function () {
    this.$wrap_gift_history = $('#wrap_gift_history');
    this.tpl_ting_item_history = Handlebars.compile($('#tpl_ting_item_history').text());
    this.tpl_ting_item_no_history = Handlebars.compile($('#tpl_ting_item_no_history').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '.bt-dropdown.small', $.proxy(this.openWidget, this));
    this.$container.on('click', '.search_condition button', $.proxy(this._onSelectCondition, this));
  },

  _fetchData: function () {
    var nCurrentTabIndex = this._getCurrentTabIndex();

    if ( nCurrentTabIndex === 0 ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0026, {
        type: this.tab1_searchType,
        fromDt: Tw.DateHelper.getCurrentShortDate(),
        endDt: Tw.DateHelper.getShortDateWithFormatAddByUnit(new Date(), this.tab1_searchPeriod, 'month', 'YYYYMMDD')
      }).done($.proxy(this._onSuccessFetchData, this));
    }

    if ( nCurrentTabIndex === 1 ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0027, {
        type: this.tab2_searchType,
        fromDt: Tw.DateHelper.getCurrentShortDate(),
        endDt: Tw.DateHelper.getShortDateWithFormatAddByUnit(new Date(), this.tab2_searchPeriod, 'month', 'YYYYMMDD')
      }).done($.proxy(this._onSuccessFetchData, this));
    }
  },

  _onSuccessFetchData: function (response) {
    var nCurrentTabIndex = this._getCurrentTabIndex();
    var res = {
      code: '00',
      msg: 'success',
      result: [{
        opDt: '20180508',
        amt: '1000',
        svcNum: '01062**50**',
        custNm: '홍*동',
        opClCd: '2',
        opClNm: '후불선물충전'
      }, {
        opDt: '20180507',
        amt: '5000',
        svcNum: '01062**50**',
        custNm: '홍*동',
        opClCd: '1',
        opClNm: '후불선물충전'
      }]
    };

    if ( res.code === Tw.API_CODE.CODE_00 ) {

      if ( res.result.length === 0 ) {
        this._renderNoList();
        return false;
      }

      if ( nCurrentTabIndex === 0 ) {
        this.tab1_list = response.result;
        this._renderList(this._parseHistoryData(res.result));
        return false;
      }

      if ( nCurrentTabIndex === 1 ) {
        this.tab2_list = response.result;
        this._renderList(this._parseHistoryData(res.result));
        return false;
      }

    }
  },

  _renderNoList: function () {
    var wrapHistoryResult = $('li[aria-selected="true"]').find('.inner');
    wrapHistoryResult.html(this.tpl_ting_item_no_history());
    wrapHistoryResult.siblings('.gift-bt-more').hide();
  },

  _parseHistoryData: function (list) {
    return $.each(list, function (index, item) {
      item.isSender = item.opClCd === '1' ? true : false;
      item.opDt = Tw.DateHelper.getShortDateWithFormat(item.opDt, 'YYYY.MM.DD');
      item.svcNum = Tw.FormatHelper.conTelFormatWithDash(item.svcNum);
      item.amt = Tw.FormatHelper.addComma(item.amt);
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
    }

    if ( nCurrentTabIndex === 1 ) {
      this.tab2_searchType = $searchType.val();
      this.tab2_searchPeriod = $searchPeriod.val();
    }

    this._popupService.close();

    var $btn_dropdown = $($('.bt-dropdown.small').get(nCurrentTabIndex));
    $btn_dropdown.text(sType + ' · ' + sPeriod);

    this._fetchData();
  },

  _renderList: function (list) {
    var html = this.tpl_ting_item_history({ list: list });
    this.$wrap_gift_history.html(html);
  },

  openWidget: function () {
    var nCurrentTabIndex = this._getCurrentTabIndex();

    var typeOption = [{
      checked: false,
      value: '0',
      text: Tw.POPUP_PROPERTY.ALL
    }, {
      checked: false,
      value: '1',
      text: Tw.POPUP_PROPERTY.SEND
    }, {
      checked: false,
      value: '2',
      text: Tw.POPUP_PROPERTY.RECEIVE
    }];

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
  }
};