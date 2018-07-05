/**
 * FileName: recharge.gift.history.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.06.19
 */
Tw.RechargeGiftHistory = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this._init();
  // this._cachedElement();
  // this._bindEvent();
};

Tw.RechargeGiftHistory.prototype = {

  _init: function () {

    this.current = this._hash._currentHashNav || 'gift';
    this.dateNow = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMMDD');

    this._getListData(this._dateHelper.getShortDateWithFormatAddByUnit(this.dateNow, -1, 'years', 'YYYYMMDD'), this.dateNow, 0, function (res) {
      console.log(res);
    });

    // TODO : 검색은 확인 버튼 바인딩을 통해 checked input 값을 가져와서 사용.
    // TODO : 이전 검색 선택 값 어떻게? => 필요한가?
    // TODO : 탭 변경시 검색값 default?
    // TODO : 검색 Trigger button innerText 변경

    var _search = (function () {
      var terms = [
        this._dateHelper.getShortDateWithFormatAddByUnit(this.dateNow, -1, 'months', 'YYYYMMDD'),
        this._dateHelper.getShortDateWithFormatAddByUnit(this.dateNow, -3, 'months', 'YYYYMMDD'),
        this._dateHelper.getShortDateWithFormatAddByUnit(this.dateNow, -6, 'months', 'YYYYMMDD'),
        this._dateHelper.getShortDateWithFormatAddByUnit(this.dateNow, -1, 'years', 'YYYYMMDD')
      ];
      var setDefault = function () {

      };
      var setOption = function () {

      };

      var resetOption = function () {

      };
      return {
        defaultLabel: null,
        terms: terms,
        setDefault: setDefault,
        setOption: setOption,
        resetOption: resetOption
      };
    }.bind(this))();

    Tw.Logger.log(_search);

    // TODO : 데이터 있는 경우 템플릿 렌더링, 없는 경우 Empty 템플릿
    // TODO : 데이터 페이지 수로 분할(by current)
    //    this.listTemplete = Handlebars.compile($('#list-template').html());
    //     this.presentEmptyTemplete = Handlebars.compile($('#present-empty-template').html());
    //     this.requestEmptyTemplete = Handlebars.compile($('#request-empty-template').html());

    this.ListGeneratorWithHandlebar = function (dataSet, perPage, template, handlebarHelper, wrapperDOM, viewMoreDom) {
      if ( (!_.isObject(dataSet) || arguments.length < 6) || !_.isFunction(handlebarHelper) ) {
        Tw.Logger.error('[ListGenerator ERROR]');
        return false;
      }
      this.data = dataSet;
      this.perPage = perPage;
      this.template = template;
      this.wrapper = wrapperDOM;
      this.helper = handlebarHelper;
      this.viewTrigger = viewMoreDom;

      this._init();
    };

    this.ListGeneratorWithHandlebar.prototype = {
      _init: function () {

      },

      getNextPage: function () {

      },

      appendPage: function () {
        this.getNextPage();
        this.wrapper.append();
      }
    };

    new this.ListGeneratorWithHandlebar({}, 20, 11, function () {
    }, 2, 35);
    // _search.setOption();

    // this.data = {};
    // this.searchCondition = {
    //   now: null,
    //   old: {},
    //   type: 0,
    //   isAutoSent: false,
    //   selectedTermIndex: 1,
    //   terms: []
    // };
    // this.requestDeletePopup = {
    //   'title': Tw.POPUP_TITLE.REQUEST_DELETE,
    //   'close_bt': true,
    //   'contents': Tw.MSG_RECHARGE.REQUEST_DELETE,
    //   'bt_num': 'two',
    //   'type': [{class: 'bt-white2', txt: Tw.BUTTON_LABEL.CANCEL},
    //     {class: 'bt-red1', txt: Tw.BUTTON_LABEL.CONFIRM}]
    // };
    // this.presentContentWrapper.hide();
    // this.requestContentWrapper.hide();
    //
    // this[this.currentTab + 'TermSelect'].find('option').map((function (i, o) {
    //   this.searchCondition.terms.push(o.value);
    // }).bind(this));

    //
    // this.presentViewMore.hide();
    // this.requestViewMore.hide();
    //

    //
    // initHashNav($.proxy(this._hashInit, this));
  },

  _hashInit: function (hash) {
    switch ( hash.base ) {
      case 'request' :
        this.$tabChanger.eq(1).click();
        break;
      case 'gift' :
        this.$tabChanger.eq(0).click();
        break;
      default :
        this.$tabChanger.eq(0).click();
    }
  },

  _cachedElement: function () {
    this.$document = $(document);

    this.$lineSelect = $('#line-set + .select-info select');

    this.$widgetWrapper = $('.widget-box.select');
    this.$tabLinker = $('.tab-linker');
    this.$tabChanger = $('.tab-linker button');

    this.presentContainer = $('#tab1');
    this.presentContentWrapper = this.presentContainer.find('.inner .result-history');
    this.presentCounter = this.presentContainer.find('.ti-desc em');
    this.presentViewMore = this.presentContainer.find('.bt-more');
    this.presentRestCounter = this.presentViewMore.find('span');
    this.presentTermSelect = $('#tab1 .inner .contents-info-list .widget select:nth-of-type(2)');


    this.requestContainer = $('#tab2');
    this.requestContentWrapper = this.requestContainer.find('.inner .result-history');
    this.requestCounter = this.requestContainer.find('.ti-desc em');
    this.requestViewMore = this.requestContainer.find('.bt-more');
    this.requestRestCounter = this.requestViewMore.find('span');
    this.requestTermSelect = $('#tab2 .inner .contents-info-list .widget select:nth-of-type(2)');

    this._setTemplateWithDOM();
  },

  _setTemplateWithDOM: function () {
    this.listTemplete = Handlebars.compile($('#list-template').html());
    this.presentEmptyTemplete = Handlebars.compile($('#present-empty-template').html());
    this.requestEmptyTemplete = Handlebars.compile($('#request-empty-template').html());
  },

  _bindEvent: function () {
    this.$widgetWrapper.on('click', 'button', $.proxy(this.openSelectPopupProcess, this));
    this.$tabLinker.on('click', 'button', $.proxy(this.changeTab, this));

    this.$document.on('updateLineInfo', $.proxy(this.updateLineInfo, this));

    // this.presentViewMore.off('click').on('click', $.proxy(this.appendNextPagesToList, this));
    // this.requestViewMore.off('click').on('click', $.proxy(this.appendNextPagesToList, this));
  },

  _getListData: function (fromDt, toDt, type, callback) {

    console.log(this.current, fromDt, toDt, type, callback);
    if (this.current === 'gift') {
      this._apiService.request(Tw.API_CMD.BFF_06_0018, {
        fromDt: fromDt,
        toDt: toDt,
        giftType: type
      }).done($.proxy(callback, this));
    } else if ( this.current === 'request' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0010, {
        fromDt: fromDt,
        toDt: toDt,
        requestType: type
      }).done($.proxy(callback, this));
    }
  },

  setData: function (res) {
    if ( res.code !== '00' && res.msg !== 'success' ) {
      return false;
    }
    if ( res.result ) {
      var currentRes = this.searchCondition.isAutoSent ? res.filteredData : res.result;
      this.data[this.currentTab] = {
        list: currentRes,
        renderList: currentRes.slice().splice(0, 20),
        length: currentRes.length,
        maxPage: currentRes.length ? (currentRes.length % 20 > 0) ?
          parseInt(currentRes.length / 20, 10) + 1 : parseInt(currentRes.length / 20, 10) : 0,
        restDataCount: currentRes.length ? currentRes.length - 20 : 0,
        currentPage: 0,
        removeCount: 0
      };
    }
    this.initUiFromData();
  },

  updateLineInfo: function (e, params) {
    console.log(e, params);
  },

  setSearchBtn: function (type, term) {
    var targetBtn = this[this.currentTab + 'Container'].find('.bt-dropdown.small'),
        subSelect = targetBtn.siblings().find('select'),
        text      = '',
        spCode    = ' · ';

    subSelect.each(function (t) {
      $(this).find('option').attr('selected', null).eq(t ? term : type).attr('selected', 'selected');
      text += !t ? $(this).find('option').eq(type).text() + spCode : $(this).find('option').eq(term).text();
    });
    targetBtn.text(text);
  },

  searchData: function (res) {
    if ( this.searchCondition.isAutoSent && this.currentTab === 'gift' ) {
      var filtered = [];
      res.result.map(function (arr) {
        if ( arr.regularGiftType === 'GC' ) {
          filtered.push(arr);
        }
      });
      res.filteredData = filtered;
    }

    this.data[this.currentTab] = undefined;
    this[this.currentTab + 'Container'].find('.noresult').remove();
    this.setData(res);
  },

  updateListData: function () {
    var currentData = this.data[this.currentTab];

    currentData.currentPage = currentData.currentPage + 1;
    currentData.renderList = currentData.list.slice().splice(20 * currentData.currentPage - 1, 20);
    currentData.restDataCount = currentData.restDataCount - 20;

    this.updateListUI();
  },

  updateListUI: function () {
    var currentData = this.data[this.currentTab];

    this[this.currentTab + 'ContentWrapper'].append(this.getTemplate(this.listTemplete, this.data[this.currentTab]));
    this[this.currentTab + 'RestCounter'].text('(' + this.data[this.currentTab].restDataCount + ')');

    if ( currentData.currentPage === currentData.maxPage - 1 ) {
      this[this.currentTab + 'ViewMore'].hide();
    }
  },

  initUiFromData: function () {
    if ( this.data[this.currentTab] !== undefined && this.data[this.currentTab].length ) {
      this[this.currentTab + 'Container'].find('.inner').show();
      this[this.currentTab + 'Container'].find('.ti-desc').show();
      this[this.currentTab + 'Counter'].text(this.data[this.currentTab].length);
      this[this.currentTab + 'ContentWrapper'].show();

      this[this.currentTab + 'ContentWrapper'].append(this.getTemplate(this.listTemplete, this.data[this.currentTab]));

      if ( this.data[this.currentTab].restDataCount > 0 ) {
        this[this.currentTab + 'RestCounter'].text('(' + this.data[this.currentTab].restDataCount + ')');
        this[this.currentTab + 'ViewMore'].show();
      }
      if ( this.currentTab === 'request' ) {
        this.addRequstListDeleteHandler();
      }
    } else {
      this[this.currentTab + 'Container'].find('.ti-desc').hide();
      this[this.currentTab + 'ContentWrapper'].hide();
      if ( this.currentTab === 'gift' ) {
        this[this.currentTab + 'Container'].find('.contents-info-list').append(this.presentEmptyTemplete());
      } else {
        this[this.currentTab + 'Container'].find('.contents-info-list').append(this.requestEmptyTemplete());
      }
    }
  },

  appendNextPagesToList: function () {
    this.updateListData();
  },

  addRequstListDeleteHandler: function () {
    this[this.currentTab + 'ContentWrapper'].on('click', '.btn-cancel', (function (e) {
      var selectedRequestLi = ($(e.currentTarget).parents('li'))[0],
          selectedEvent     = e;

      skt_landing.action.popup.open(this.requestDeletePopup);
      var tempTimer = window.setTimeout((function () {
        $('.popup .btn-box .bt-white2').on('click', 'button', function () {
          event.preventDefault();
          skt_landing.action.popup.close();
        });
        $('.popup .btn-box .bt-red1').on('click', 'button', (function () {
          event.preventDefault();

          this.removeSelectedRequest($(selectedEvent.target).data('opdtm'), selectedRequestLi);
        }).bind(this));
        window.clearTimeout(tempTimer);
      }).bind(this), 50);
      this.$document.one('click', '.popup .popup-blind', $.proxy(this.hidePopup, this));
    }).bind(this));
  },

  removeSelectedRequest: function (val, domElement) {
    this._apiService.request(Tw.API_CMD.BFF_06_0011, JSON.stringify({ opDtm: val })).done($.proxy(this.removeRequestHandler, this, domElement));
  },

  removeRequestHandler: function (target, res) {
    var currentData = this.data[this.currentTab];
    if ( res.code === '00' ) {
      $(target).remove();
      currentData.removeCount++;
      currentData.list.splice($(target).data('listIndex'), 1);
      currentData.length = currentData.length - 1;
      this[this.currentTab + 'Counter'].text(currentData.length);
    }
    skt_landing.action.popup.close();
  },

  getTemplate: function (t, d) {
    var _this = this;

    Handlebars.registerHelper('setIndex', function (option) {
      this.listIndex = option.data.key + _this.data[_this.currentTab].currentPage * 20;
      return option.fn(this);
    });

    Handlebars.registerHelper('conditionClass', function (giftType) {
      if ( giftType === '1' ) {
        return 'arrow-receive';
      } else {
        return 'arrow-send';
      }
    });

    Handlebars.registerHelper('conditionTel', function (svcNum) {
      return Tw.FormatHelper.conTelFormatWithDash(svcNum);
    });

    Handlebars.registerHelper('isBig1G', function (val) {
      var convertDataFormat = Tw.FormatHelper.customDataFormat(this.dataQty, Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB);
      if ( this.dataQty < 1024 ) {
        this.dataQtyTrans = Tw.FormatHelper.addComma(this.dataQty) + Tw.DATA_UNIT.MB;
        return val.fn(this);
      } else {
        this.dataQtyTrans = convertDataFormat.data + convertDataFormat.unit;
        this.dataQtyConvert = Tw.FormatHelper.addComma(this.dataQty) + Tw.DATA_UNIT.MB;
        return val.inverse(this);
      }
    });

    Handlebars.registerHelper('isAuto', function (option) {
      if ( this.regularGiftType === 'GC' ) {
        return option.fn(this);
      } else {
        return option.inverse(this);
      }
    });

    Handlebars.registerHelper('isRequest', function (option) {
      if ( _this.currentTab !== 'gift' && this.giftType === '2' ) {
        return option.fn(this);
      } else {
        return option.inverse(this);
      }
    });

    return t(d);
  },

  openSelectPopupProcess: function (e) {
    if ( $(e.target).attr('id') === 'term-set' ) {
      this.currentPopupKeyWord = 'term';
      this.searchPopupHandler();
    } else if ( $(e.target).attr('id') === 'line-set' ) {
      this.currentPopupKeyWord = 'line';
    }

    this.$document.one('click', '.popup .popup-blind', $.proxy(this.hidePopup, this));

    this.addClosePopupHandler();
  },

  // _getLineInfo: function (callback) {
  //   this._apiService.request(Tw.API_CMD.BFF_03_0003_C, {svcCtg: 'M'}).done($.proxy(callback, this));
  // },

  // _setLineList: function (res) {
  //   console.log(res);
  // this.lineList.lines = lines.result;
  // this.lineList.current = lines.result[0];
  // this.lineList.selectedIndex = $(this.lineList.lines).index(this.lineList.current);
  // this.getPresentList();
  // },

  addClosePopupHandler: function () {
    this.$document.one('click', '.popup-closeBtn', $.proxy(this.cancelUpdateCurrentLine, this));
    this.$document.one('click', '.select-submit', $.proxy(this.popupCommandOk, this));
  },

  popupCommandOk: function () {
    if ( this.currentPopupKeyWord !== 'line' ) {
      this.resetCurrentContents();
    }
    // 회선 변경시, 검색 실행시 내역 조회 재실행
    this.getListData(this.searchCondition.terms[this.searchCondition.selectedTermIndex],
      this.searchCondition.now, this.searchCondition.type, this.searchData);
    this.currentPopupKeyWord = '';
  },

  cancelUpdateCurrentLine: function () {
    this.currentPopupKeyWord = '';
    this.resetPrevSearchCondition();
  },

  hidePopup: function () {
    this.currentPopupKeyWord = '';
    this.resetPrevSearchCondition();
    skt_landing.action.popup.close();
  },

  searchPopupHandler: function () {
    var tempTimer = window.setTimeout((function () {

      this.setPrevSearchCondition();

      this.$optionViewAutoSent = $('.popup .select-option input');
      this.popupViewAutoSentToggle(this.searchCondition.type);

      this.$optionViewAutoSent.on('change', (function () {
        this.searchCondition.isAutoSent = this.$optionViewAutoSent.is(':checked');
      }).bind(this));

      $('.tube-list-ti .tube-list').map((function (index, options) {
        $(options).on('click', 'label', (function (e) {
          this.updateSearchOption(index, $(options).find('label').index(e.target.parentNode));
        }).bind(this));
      }).bind(this));

      window.clearTimeout(tempTimer);
    }).bind(this), 50);
  },

  updateSearchOption: function (type, option) {
    if ( type === 0 ) {
      this.popupViewAutoSentToggle(option);
      if ( option !== 1 ) {
        this.$optionViewAutoSent.parent().hide();
        this.$optionViewAutoSent.attr('checked', false);
        $(this.$optionViewAutoSent.parent()).removeClass('checked');
        this.searchCondition.isAutoSent = false;
      }
      this.searchCondition.type = option;
    } else {
      this.searchCondition.selectedTermIndex = option;
    }
  },

  popupViewAutoSentToggle: function (type) {
    if ( type !== 1 ) {
      this.$optionViewAutoSent.parent().hide();
    } else {
      this.$optionViewAutoSent.attr('checked', this.searchCondition.isAutoSent);
      if ( this.searchCondition.isAutoSent ) {
        $(this.$optionViewAutoSent.parent()).addClass('checked');
      }
      this.$optionViewAutoSent.parent().show();
    }
  },

  setPrevSearchCondition: function () {
    this.searchCondition.old.type = this.searchCondition.type;
    this.searchCondition.old.term = this.searchCondition.selectedTermIndex;
    this.searchCondition.old.isAutoSent = this.searchCondition.isAutoSent;
  },

  resetPrevSearchCondition: function () {
    this.searchCondition.type = this.searchCondition.old.type;
    this.searchCondition.selectedTermIndex = this.searchCondition.old.term;
    this.searchCondition.isAutoSent = this.searchCondition.old.isAutoSent;
  },

  resetSearchCondition: function () {
    this.searchCondition.type = 0;
    this.searchCondition.selectedTermIndex = 1;
    this.searchCondition.isAutoSent = false;
  },

  changeTab: function (e) {
    e.preventDefault();
    this.resetSearchCondition();
    if ( this.$tabChanger.index(e.target) === 0 ) {
      // if (this.currentTab === 'gift') return false;
      this.currentTab = 'gift';
    } else {
      // if (this.currentTab === 'request') return false;
      this.currentTab = 'request';
    }
    this.setSearchBtn(0, 1);
    this.resetCurrentContents();
    this.getListData(this.searchCondition.now, this.searchCondition.terms[this.searchCondition.selectedTermIndex], '0', this.setData);
    this[this.currentTab + 'Container'].find('.noresult').remove();
  },

  resetCurrentContents: function () {
    this[this.currentTab + 'ViewMore'].hide();
    this[this.currentTab + 'ContentWrapper'].empty();
  }

};
