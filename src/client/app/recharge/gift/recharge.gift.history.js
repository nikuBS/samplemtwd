Tw.MytGiftHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
  this._$init();
};

Tw.MytGiftHistory.prototype = {
  _$init: function() {
    this.currentTabMethod = 'present';    // request : 조르기
    this.searchCondition = {
      now : null,
      old : {},
      type: 0,
      isAutoSent: false,
      selectedTermIndex: 1,
      terms: []
    };
    this.presentContentWrapper.hide();
    this.requestContentWrapper.hide();

    this.$termOptions.map((function(i, o){
      this.searchCondition.terms.push(o.value);
    }).bind(this));
    this.searchCondition.now = this.getCurrentDate();

    this.getPresentList(this.searchCondition.terms[this.searchCondition.selectedTermIndex], this.searchCondition.now, this.searchCondition.type, this.initedPresent);
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
    // this.present
    this.requestContainer = $('#tab2');
    this.requestContentWrapper = this.requestContainer.find('.inner .result-history');

    this.presentTemplete = Handlebars.compile($('#present-template').html());
    this.requestTempelete = Handlebars.compile($('#request-template').html());
    this.presentEmptyTemplete = Handlebars.compile($('#present-empty-template').html());
    this.requestEmptyTempelete = Handlebars.compile($('#request-empty-template').html());
  },

  _bindEvent: function () {
    this.$widgetWrapper.on('click', 'button', $.proxy(this.openSelectPopupProcess, this));
    this.$tabLinker.on('click', 'a', $.proxy(this.changeTab, this));

  },

  getCurrentDate: function() {
    var dateNow = new Date($.now());
    return dateNow.getFullYear() + ('0' + (dateNow.getMonth() + 1)).slice(-2) + ('0' + (dateNow.getDate())).slice(-2);
  },

  initedPresent: function(res) {
    var _this = this;

    console.log(res, this.mockHistory);
    res = res.result.length ? res : this.mockHistory;

    if(res.code !== '00' && res.msg !== 'success') {
      console.log('error', res);
      return false;
    }
    if(res.result.length) {
      this.data = {
        presents : res.result,
        length : res.result.length,
        pages : res.result / 4
      };
      this.presentCounter.text(this.data.presents.length);
      this.presentContentWrapper.show();

      Handlebars.registerHelper('conditionClass', function (giftType) {
        if(giftType === '1') {
          return 'arrow-receive';
        } else {
          return 'arrow-send';
        }
      });

      Handlebars.registerHelper('conditionTel', function (svcNum) {
        return _this.convertTelFormat(svcNum);
      });

      Handlebars.registerHelper('isBig1G', function(val) {
        var convertDataFormat = Tw.FormatHelper.convDataFormat(this.dataQty, 'MB');
        if(this.dataQty < 1024) {
          this.dataQty = convertDataFormat['data']+convertDataFormat['unit'];
          return val.fn(this);
        } else {
          this.dataQtyConvert = _this.addComma(this.dataQty) + 'MB';
          this.dataQty = convertDataFormat['data'].split('.')[0]+convertDataFormat['unit'];
          return val.inverse(this);
        }
      });

      Handlebars.registerHelper('isAuto', function(option) {
        if(this.regularGiftType === 'GC') {
          return option.fn(this);
        } else {
          return option.inverse(this);
        }
      });

      

      this.presentContentWrapper.append(this.presentTemplete(this.data));
    } else {
      this.presentContainer.append(this.presentEmptyTemplete());
    }
  },

  addComma: function(v) {
    return v.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  convertTelFormat: function(v) {
    var ret = v.trim();
    return ret.substring(0, 3) + '-' + ret.substring(3, ret.length - 4) + '-' + ret.substring(ret.length - 4);
  },

  openSelectPopupProcess: function (e) {

    if ($(e.target).attr('id') === 'term-set') {
      var tempTimer = window.setTimeout((function () {
        this.setPrevSearchCondition();
        this.$optionViewAutoSent = $('.popup .select-option input');
        this.popupViewAutoSentToggle(this.searchCondition.type);

        this.$optionViewAutoSent.attr('checked', this.searchCondition.isAutoSent);
        if(this.searchCondition.isAutoSent) {
          $(this.$optionViewAutoSent.parent()).addClass('checked');
        }

        this.$optionViewAutoSent.on('change', (function(e) {
          this.searchCondition.isAutoSent = this.$optionViewAutoSent.is(':checked');
        }).bind(this));

        $('.tube-list-ti .tube-list').map((function(index, options) {
          $(options).on('click', 'label', (function(e) {
            this.updateSearchOption(index, $(options).find('label').index(e.target.parentNode));
          }).bind(this));
        }).bind(this));

        window.clearTimeout(tempTimer);
      }).bind(this), 50);
    }

    this.$document.one('click', '.popup .popup-blind', $.proxy(this.hidePopup, this));

    this.addClosePopupHandler();
  },

  setPrevSearchCondition: function() {
    this.searchCondition.old.type = this.searchCondition.type;
    this.searchCondition.old.term = this.searchCondition.selectedTermIndex;
    this.searchCondition.old.isAutoSent = this.searchCondition.isAutoSent;
  },

  resetPrevSearchCondition: function() {
    this.searchCondition.type = this.searchCondition.old.type;
    this.searchCondition.selectedTermIndex = this.searchCondition.old.term;
    this.searchCondition.isAutoSent = this.searchCondition.old.isAutoSent;
  },

  popupViewAutoSentToggle: function(type) {
    if(type !== 1)
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

  getPresentList: function (fromDt, toDt, giftType, callback) {
    this._apiService.request(Tw.API_CMD.BFF_06_0018, {
      fromDt: fromDt,
      toDt: toDt,
      giftType: giftType
    }).done($.proxy(callback, this));
  },

  getrequestList: function () {
    if (this.lineList.current) {

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

  popupCommandOk: function() {

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
    if(type===0) {
      this.popupViewAutoSentToggle(option);
      if(option!==1) {
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
    if (this.$tabChanger.index(e.target) === 0) {

      if (this.currentTab === 0) return false;
      this.currentTab = 0;
      console.log("선물 내역보기");

    } else {

      if (this.currentTab === 1) return false;
      this.currentTab = 1;
      console.log("조르기 내역보기");

    }
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
