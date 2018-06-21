/**
 * FileName: recharge.gift.history.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.06.19
 */
Tw.MytGiftHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
  this._$init();
};

Tw.MytGiftHistory.prototype = {
  _$init: function () {
    this.currentTabMethod = 'present';    // request : 조르기
    this.data = {};
    this.searchCondition = {
      now: null,
      old: {},
      type: 0,
      isAutoSent: false,
      selectedTermIndex: 1,
      terms: []
    };
    this.presentContentWrapper.hide();
    this.requestContentWrapper.hide();

    this.$termOptions.map((function (i, o) {
      this.searchCondition.terms.push(o.value);
    }).bind(this));
    this.searchCondition.now = this.getCurrentDate();
    this.presentViewMore.hide();
    this.requestViewMore.hide();

    // this.getDataList(this.searchCondition.terms[3], this.searchCondition.now, this.searchCondition.type, this.initData);
    this.getDataList('', '', '0', this.initData);
    // this.getDataList(this.searchCondition.terms[this.searchCondition.selectedTermIndex], this.searchCondition.now, this.searchCondition.type, this.initData);
  },
  _cachedElement: function () {
    this.$document = $(document);

    this.$widgetWrapper = $('.widget-box.select');
    this.$tabLinker = $('.tab-linker');
    this.$tabChanger = $('.tab-linker a');
    this.$termOptions = $('#tab1 .inner .contents-info-list .widget select:nth-of-type(2) option');

    this.presentContainer = $('#tab1');
    this.presentContentWrapper = this.presentContainer.find('.inner .result-history');
    this.presentCounter = this.presentContainer.find('.ti-desc em');
    this.presentViewMore = this.presentContainer.find('.bt-more');
    this.presentRestCounter = this.presentViewMore.find('span');

    this.requestContainer = $('#tab2');
    this.requestContentWrapper = this.requestContainer.find('.inner .result-history');
    this.requestCounter = this.requestContainer.find('.ti-desc em');
    this.requestViewMore = this.requestContainer.find('.bt-more');
    this.requestRestCounter = this.requestViewMore.find('span');

    this.listTemplete = Handlebars.compile($('#list-template').html());
    this.presentEmptyTemplete = Handlebars.compile($('#present-empty-template').html());
    this.requestEmptyTemplete = Handlebars.compile($('#request-empty-template').html());
  },

  _bindEvent: function () {
    this.$widgetWrapper.on('click', 'button', $.proxy(this.openSelectPopupProcess, this));
    this.$tabLinker.on('click', 'a', $.proxy(this.changeTab, this));

    this.presentViewMore.off('click').on('click', $.proxy(this.appendNextPageToList, this));
    this.requestViewMore.off('click').on('click', $.proxy(this.appendNextPageToList, this));
  },

  initData: function (res) {

    // console.log(res, this.mockHistory, this.mockRequest);
    // res = res.result.length ? res : this.currentTabMethod === 'present' ? this.mockHistory : this.mockRequest;

    if (res.code !== '00' && res.msg !== 'success') {
      console.log('error', res);
      return false;
    }
    console.log(res);
    if (res.result && res.result.length) {
      var currentRes = this.searchCondition.isAutoSent ? res.filteredData : res.result;
      this.data[this.currentTabMethod] = {
        list: currentRes,
        renderList: currentRes.slice().splice(0, 20),
        length: currentRes.length,
        maxPage: (currentRes.length % 20 > 0) ? parseInt(currentRes.length / 20, 10) + 1 : parseInt(currentRes.length / 20, 10),
        restDataCount: currentRes.length - 20,
        currentPage: 0,
        removeCount: 0
      };
    }
    this.initUiFromData();
  },

  searchData: function(res) {
    if(this.searchCondition.isAutoSent && this.currentTabMethod === 'present') {
      var filtered = [];
      res.result.map(function(arr) {
        if(arr.regularGiftType === 'GC') {
          console.log(arr);
          filtered.push(arr);
        }
      });
      res.filteredData = filtered;
      console.log('filteredData', res.filteredData);
    };
    this.data[this.currentTabMethod] = undefined;
    this[this.currentTabMethod + 'Container'].find('.noresult').remove();
    this.initData(res);
  },

  updateListData: function () {
    var currentData = this.data[this.currentTabMethod];

    currentData.currentPage = currentData.currentPage + 1;
    currentData.renderList = currentData.list.slice().splice(20 * currentData.currentPage - 1, 20);
    currentData.restDataCount = currentData.restDataCount - 20;

    this.updateListUI();
  },

  updateListUI: function () {
    var currentData = this.data[this.currentTabMethod];

    this[this.currentTabMethod + 'ContentWrapper'].append(this.getTemplate(this.listTemplete, this.data[this.currentTabMethod]));
    this[this.currentTabMethod + 'RestCounter'].text('(' + this.data[this.currentTabMethod].restDataCount + ')');

    if (currentData.currentPage === currentData.maxPage - 1) {
      this[this.currentTabMethod + 'ViewMore'].hide();
    }
  },

  initUiFromData: function () {
    if (this.data[this.currentTabMethod] !== undefined && this.data[this.currentTabMethod].length) {
      this[this.currentTabMethod + 'Container'].find('.inner').show();
      this[this.currentTabMethod + 'Container'].find('.ti-desc').show();
      this[this.currentTabMethod + 'Counter'].text(this.data[this.currentTabMethod].length);
      this[this.currentTabMethod + 'ContentWrapper'].show();

      this[this.currentTabMethod + 'ContentWrapper'].append(this.getTemplate(this.listTemplete, this.data[this.currentTabMethod]));

      if (this.data[this.currentTabMethod].restDataCount > 0) {
        this[this.currentTabMethod + 'RestCounter'].text('(' + this.data[this.currentTabMethod].restDataCount + ')');
        this[this.currentTabMethod + 'ViewMore'].show()
      }
      if (this.currentTabMethod === 'request') {
        this.addRequstListDeleteHandler();
      }
    } else {
      this[this.currentTabMethod + 'Container'].find('.ti-desc').hide();
      this[this.currentTabMethod + 'ContentWrapper'].hide();
      if (this.currentTabMethod === 'present') {
        this[this.currentTabMethod + 'Container'].find('.contents-info-list').append(this.presentEmptyTemplete());
      } else {
        this[this.currentTabMethod + 'Container'].find('.contents-info-list').append(this.requestEmptyTemplete());
      }
    }
  },

  appendNextPageToList: function () {
    this.updateListData();
  },

  addRequstListDeleteHandler: function () {
    this[this.currentTabMethod + 'ContentWrapper'].on('click', '.btn-cancel', (function (e) {
      var selectedRequestLi = ($(e.currentTarget).parents('li'))[0],
          selectedEvent     = e;

      skt_landing.action.popup.open({
        'title': '조르기 삭제안내',
        'close_bt': true,
        'contents': '선택하신 조르기 내역을 삭제하시겠습니까? 삭제할 경우 해당 정보는 복구하실 수 없습니다.',
        'bt_num': 'two',
        'type': [{class: 'bt-white2', txt: '취소'},
          {class: 'bt-red1', txt: '확인'}]
      });
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
    this._apiService.request(Tw.API_CMD.BFF_06_0011, JSON.stringify({opDtm: val})).done($.proxy(this.removeRequestHandler, this, domElement));
  },

  removeRequestHandler: function (target, res) {
    var currentData = this.data[this.currentTabMethod];
    if (res.code === '00') {
      $(target).remove();
      currentData.removeCount++;
      currentData.list.splice($(target).data('listIndex'), 1);
      currentData.length = currentData.length - 1;
      this[this.currentTabMethod + 'Counter'].text(currentData.length);
    }
    skt_landing.action.popup.close();
  },

  getTemplate: function (t, d) {
    var _this = this;

    Handlebars.registerHelper('setIndex', function (option) {
      this.listIndex = option.data.key + _this.data[_this.currentTabMethod].currentPage * 20;
      return option.fn(this);
    });

    Handlebars.registerHelper('conditionClass', function (giftType) {
      if (giftType === '1') {
        return 'arrow-receive';
      } else {
        return 'arrow-send';
      }
    });

    Handlebars.registerHelper('conditionTel', function (svcNum) {
      return _this.convertTelFormat(svcNum);
    });

    Handlebars.registerHelper('isBig1G', function (val) {
      var convertDataFormat = Tw.FormatHelper.customDataFormat(this.dataQty, 'MB', 'GB');
      if (this.dataQty < 1024) {
        this.dataQtyTrans = Tw.FormatHelper.addComma(this.dataQty) + 'MB';
        return val.fn(this);
      } else {
        this.dataQtyTrans = convertDataFormat.data + convertDataFormat.unit;
        this.dataQtyConvert = Tw.FormatHelper.addComma(this.dataQty) + 'MB';
        return val.inverse(this);
      }
    });

    Handlebars.registerHelper('isAuto', function (option) {
      if (this.regularGiftType === 'GC') {
        return option.fn(this);
      } else {
        return option.inverse(this);
      }
    });

    Handlebars.registerHelper('isRequest', function (option) {
      if (_this.currentTabMethod !== 'present' && this.giftType === '2') {
        return option.fn(this);
      } else {
        return option.inverse(this);
      }
    });

    return t(d);
  },

  getCurrentDate: function () {
    var dateNow = new Date($.now());
    return dateNow.getFullYear() + ('0' + (dateNow.getMonth() + 1)).slice(-2) + ('0' + (dateNow.getDate())).slice(-2);
  },

  convertTelFormat: function (v) {
    var ret = v.trim();
    return ret.substring(0, 3) + '-' + ret.substring(3, ret.length - 4) + '-' + ret.substring(ret.length - 4);
  },

  openSelectPopupProcess: function (e) {

    if ($(e.target).attr('id') === 'term-set') {
      this.currentPopupKeyWord = 'term';
      var tempTimer = window.setTimeout((function () {
        this.setPrevSearchCondition();
        this.$optionViewAutoSent = $('.popup .select-option input');
        this.popupViewAutoSentToggle(this.searchCondition.type);

        this.$optionViewAutoSent.attr('checked', this.searchCondition.isAutoSent);
        if (this.searchCondition.isAutoSent) {
          $(this.$optionViewAutoSent.parent()).addClass('checked');
        }

        this.$optionViewAutoSent.on('change', (function (e) {
          this.searchCondition.isAutoSent = this.$optionViewAutoSent.is(':checked');
        }).bind(this));

        $('.tube-list-ti .tube-list').map((function (index, options) {
          $(options).on('click', 'label', (function (e) {
            this.updateSearchOption(index, $(options).find('label').index(e.target.parentNode));
          }).bind(this));
        }).bind(this));

        window.clearTimeout(tempTimer);
      }).bind(this), 50);
    } else if($(e.target).attr('id') === 'line-set') {
      this.currentPopupKeyWord = 'line';
    }

    this.$document.one('click', '.popup .popup-blind', $.proxy(this.hidePopup, this));

    this.addClosePopupHandler();
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

  resetSearchCondition: function(){
    this.searchCondition.type = 0;
    this.searchCondition.selectedTermIndex = 1;
    this.searchCondition.isAutoSent = false;
  },

  popupViewAutoSentToggle: function (type) {
    if (type !== 1)
      this.$optionViewAutoSent.parent().hide();
    else
      this.$optionViewAutoSent.parent().show();
  },

  _initLineInfo: function () {
    this._getLineInfo(this._setLineList);
  },

  _getLineInfo: function (callback) {
    this._apiService.request(Tw.API_CMD.BFF_03_0003, {svcCtg: 'M'}).done($.proxy(callback, this));
  },

  _setLineList: function (lines) {
    this.lineList.lines = lines.result;
    this.lineList.current = lines.result[0];
    this.lineList.selectedIndex = $(this.lineList.lines).index(this.lineList.current);
    // this.getPresentList();
  },

  getDataList: function (fromDt, toDt, giftType, callback) {
    if (this.currentTabMethod === 'present') {
      this._apiService.request(Tw.API_CMD.BFF_06_0018, {
        fromDt: fromDt,
        toDt: toDt,
        giftType: giftType
      }).done($.proxy(callback, this));
    } else if (this.currentTabMethod === 'request') {
      this._apiService.request(Tw.API_CMD.BFF_06_0010, {
        fromDt: fromDt,
        toDt: toDt,
        requestType: giftType
      }).done($.proxy(callback, this));
    }
  },

  updatePopupSelectedLine: function () {

  },
  updatePopupSelectedSearch: function () {

  },

  updateSelectedLine: function (e) {
    this.lineList.tempSelectedLineIndex = this.popupLineList.index(e.target.parentNode);
  },

  setPopupCurrentLine: function () {
    $(this.popupLineList[this.lineList.selectedIndex]).addClass('focus checked');
  },

  addClosePopupHandler: function () {
    this.$document.one('click', '.popup-closeBtn', $.proxy(this.cancelUpdateCurrentLine, this));
    this.$document.one('click', '.select-submit', $.proxy(this.popupCommandOk, this));
  },

  popupCommandOk: function () {
    if(this.currentPopupKeyWord !== 'line') {
      // console.log(this.searchCondition);
      this[this.currentTabMethod + 'ContentWrapper'].empty();
      this[this.currentTabMethod + 'ViewMore'].hide();
      this.getDataList(this.searchCondition.terms[this.searchCondition.selectedTermIndex], this.searchCondition.now, this.searchCondition.type, this.searchData);
      // this.getDataList(this.searchCondition.terms[this.searchCondition.selectedTermIndex], this.searchCondition.now, this.searchCondition.)
    }
  },

  updateCurrentLine: function () {
    this.lineList.selectedIndex = this.lineList.tempSelectedLineIndex || this.lineList.selectedIndex;
  },

  cancelUpdateCurrentLine: function () {
    this.resetPrevSearchCondition();
  },

  hidePopup: function () {
    this.resetPrevSearchCondition();
    skt_landing.action.popup.close();
  },

  updateSearchOption: function (type, option) {
    if (type === 0) {
      this.popupViewAutoSentToggle(option);
      if (option !== 1) {
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

  changeTab: function (e) {
    e.preventDefault();
    this.resetSearchCondition();
    this[this.currentTabMethod + 'ViewMore'].hide();
    if (this.$tabChanger.index(e.target) === 0) {

      if (this.currentTab === 0) return false;
      this.currentTab = 0;
      this.currentTabMethod = 'present';
      this.presentContentWrapper.empty();
      this.getDataList('', '', '0', this.initData);
      this.requestContainer.find('.noresult').remove();

    } else {

      if (this.currentTab === 1) return false;
      this.currentTab = 1;
      this.currentTabMethod = 'request';
      this.requestContentWrapper.empty();
      this.getDataList('', '', '0', this.initData);
      this.presentContainer.find('.noresult').remove();

    }
  },

  mockRequest: {
    'code': '00',
    'msg': 'success',
    'result':
        [
          {
            'opDtm': '201706022121212',
            'dataQty': '500',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '4248',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'GC'
          },
          {
            'opDtm': '20170601',
            'dataQty': '500',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'GD'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'svcNum': '01062**50**',
            'giftType': '2',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'GC'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'GD'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'G1'
          }
        ]
  },

  mockHistory: {
    'code': '00',
    'msg': 'success',
    'result':
        [
          {
            'opDtm': '20170701',
            'dataQty': '500',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '4248',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'GC'
          },
          {
            'opDtm': '20170601',
            'dataQty': '500',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'GD'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'custName': '김*나',
            'svcNum': '01062**50**',
            'giftType': '2',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'GC'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '2',
            'regularGiftType': 'GD'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'custName': '김*나',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'custName': '김*나',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'custName': '김*나',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'custName': '김*나',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'custName': '김*나',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'custName': '김*나',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'custName': '김*나',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170701',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170621',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170601',
            'dataQty': '1024',
            'custName': '김*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170520',
            'dataQty': '1024',
            'custName': '유*진',
            'svcNum': '01040**08**',
            'giftType': '1',
            'regularGiftType': 'G1'
          },
          {
            'opDtm': '20170415',
            'dataQty': '1024',
            'custName': '김*나',
            'svcNum': '01062**50**',
            'giftType': '1',
            'regularGiftType': 'G1'
          }
        ]
  }

};
