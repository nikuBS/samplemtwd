/**
 * FileName: customer.agentsearch.rentphone.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2019.2.14
 */

Tw.CustomerAgentsearchRentPhone = function (root, list) {
  this.$container = root;
  this._list = JSON.parse(list);
  this._currentList = _.filter(this._list, function (item) {  // default 서울지역만 filter
    return item.orderDistrict === '1';
  });
  this._currentShowingCount = this._currentList.length > 20 ? 20 : this._currentList.length;
  this._currentCategoryCode = 1;
  this._categoryChanged = false;

  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._categoryCode = {
    1: '서울',
    2: '경기도',
    3: '강원도',
    4: '부산/울산/경남/경북/대구',
    5: '광주/전남/전북/대전/충남/충북',
    6: '제주'
  };

  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerAgentsearchRentPhone.prototype = {
  _cacheElements: function () {
    this.$listArea = this.$container.find('#fe-list');
    this.$btnCategory = this.$container.find('#fe-category');
    this.$resultCount = this.$container.find('#fe-count');
  },
  _bindEvents: function () {
    this.$btnCategory.on('click', $.proxy(this._onCategoryClicked, this));
    this.$container.on('click', '#fe-more', $.proxy(this._onMoreClicked, this));
    this.$container.on('click', '.fe-external-link', $.proxy(this._onExternalLink, this));
    this.$container.on('click', '.fe-shop', $.proxy(this._onShopClicked, this));
  },
  _onCategoryClicked: function () {
    var count = 1;
    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: [{
        list: _.map(this._categoryCode, $.proxy(function (item) {
          var ret = {
            'label-attr': 'for="ra' + count + '"',
            'radio-attr': 'id="ra' + count + '" name="r1" data-id="' + count + '"',
            txt: item
          };
          if (this._currentCategoryCode === count) {  // Check current selected category
            ret['radio-attr'] += ' checked';
          }
          count += 1;
          return ret;
        }, this))
      }],
      btnfloating: {
        attr: 'type="button"',
        txt: Tw.BUTTON_LABEL.CLOSE
      }
    }, $.proxy(this._onActionSheetOpened, this), $.proxy(this._onActionSheetClosed, this));
  },
  _onActionSheetOpened: function ($root) {
    $root.on('click', '.btn-floating', $.proxy(function () {
      this._popupService.close();
    }, this));
    $root.on('click', 'input[type=radio]', $.proxy(function (e) {
      var selected = $(e.currentTarget).data('id');
      this.$btnCategory.val(selected);
      this.$btnCategory.text(this._categoryCode[selected]);
      this._categoryChanged = true;
      this._popupService.close();
    }, this));
  },
  _onActionSheetClosed: function () {
    if (!this._categoryChanged) {
      return;
    }

    this._categoryChanged = false;
    var code = this.$btnCategory.val();
    this._currentList = _.filter(this._list, function (item) {
      return code === item.orderDistrict;
    });

    this._currentShowingCount = 0;
    this._currentCategoryCode = parseInt(this.$btnCategory.val(), 10);

    this.$resultCount.text(this._currentList.length);
    this.$listArea.empty();
    this.$container.find('.btn-more').removeClass('none');
    this._onMoreClicked();
  },
  _onMoreClicked: function () {
    var len = this._currentList.length - this._currentShowingCount > 20 ?
      this._currentShowingCount + 20 : this._currentList.length;

    var items = '';
    for (var i = this._currentShowingCount; i < len; i += 1) {
      items += this._getItemCompiled(this._currentList[i]);
    }

    this.$listArea.append(items);

    this._currentShowingCount = this._currentShowingCount + (len - this._currentShowingCount);
    if (this._currentShowingCount >= this._currentList.length) {
      this.$container.find('.btn-more').addClass('none');
    }
  },
  _getItemCompiled: function (item) {
    return '<li class="fe-shop" data-id="' + item.locCode +'"><dl class="type02">' +
      '<dt>' + item.storeName + '</dt>' +
      '<dd>' + item.searchAddr + '<br>' + item.jibunAddr +
      '<a href="tel://' + item.tel + '" class="bt-tel">' +
      '<span role="img" class="blind">매장으로 전화하기</span></a></dd></dl></li>';
  },
  _onShopClicked: function (e) {
    var code = $(e.currentTarget).data('id');
    this._historyService.goLoad('/customer/agentsearch/detail?code=' + code);
  },
  _onExternalLink: function (e) {
    var url = e.currentTarget.href;
    Tw.CommonHelper.openUrlExternal(url);

    return false;
  }
};
