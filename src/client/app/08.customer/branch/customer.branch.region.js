/**
 * FileName: customer.branch.region.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerBranchRegion = function (rootEl, currentGu, regions, callback) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._completeCallback = callback;

  this._regions = regions;
  this._currentGu = currentGu;

  this._cacheElements();
  this._init();
  this._bindEvents();
};

Tw.CustomerBranchRegion.prototype = {
  _init: function () {
    if (!Tw.FormatHelper.isEmpty(this._regions)) {
      this._onRegionsDone();
      return;
    }

    this._apiService.requestAjax(Tw.AJAX_CMD.GET_TMAP_AREASCODE, {
      version: 1,
      count: 8000,
      page: 1,
      areaTypCd: '01',
      largeCdFlag: 'Y',
      middleCdFlag: 'Y',
      appKey: Tw.TMAP.APP_KEY
    }).done($.proxy(function (res) {
      this._regions = res.areaCodeInfo.poiAreaCodes;
      this._onRegionsDone();
    }, this)).fail(function (err) {
      Tw.Error(err.code, err.msg).pop();
    });
  },
  _cacheElements: function () {
    this.$btDropdown = this.$container.find('.bt-dropdown');
    this.$areaList = this.$container.find('.tube-list');
  },
  _bindEvents: function () {
    this.$btDropdown.on('click', $.proxy(this._onDropDownClicked, this));
    this.$container.on('click', '.bt-red1', $.proxy(this._onComplete, this));
  },
  _onRegionsDone: function () {
    var districtName = '';
    var largeCd = '';
    var middleCd = '';
    if (!Tw.FormatHelper.isEmpty(this._currentGu)) {
      var matchedMiddle = _.filter(this._regions, $.proxy(function (item) {
        return this._currentGu === item.districtName;
      }, this));
      var matched = _.filter(this._regions, function (item) {
        return item.areaDepth === 'L' && item.largeCd === matchedMiddle[0].largeCd;
      });

      if (!Tw.FormatHelper.isEmpty(matched)) {
        districtName = matched[0].districtName;
        largeCd = matched[0].largeCd;
        middleCd = matchedMiddle[0].middleCd;
      } else {
        districtName = this._regions[0].districtName;
        largeCd = this._regions[0].largeCd;
      }
    } else {
      districtName = this._regions[0].districtName;
      largeCd = this._regions[0].largeCd;
    }

    this.$btDropdown.text(districtName);
    this.$btDropdown.val(largeCd);
    this._onLargeAreaChanged(largeCd, middleCd);
  },
  _onDropDownClicked: function () {
    var currentLargeCd = this.$btDropdown.val();
    var regionList = _.map(_.filter(this._regions, function (region) {
      return region.areaDepth === 'L';
    }), function (region) {
      var ret = { value: region.districtName, attr: 'value="' + region.largeCd + '"' };
      if (region.largeCd === currentLargeCd) {
        ret.option = 'checked';
      }
      return ret;
    });

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.BRANCH.SELECT_REGION,
      data: [{ list: regionList }]
    }, $.proxy(function (root) {
      root.on('click', 'button', $.proxy(function (e) {
        this._popupService.close();
        this.$btDropdown.text($(e.currentTarget).find('.info-value').text());
        this.$btDropdown.val(e.currentTarget.value);
        this._onLargeAreaChanged(e.currentTarget.value);
      }, this));
    }, this));
  },
  _onLargeAreaChanged: function (largeCode, middleCode) {
    this.$areaList.empty();

    var filteredList = _.filter(this._regions, function (item) {
      return item.areaDepth === 'M' && item.largeCd === largeCode &&
        item.districtName.indexOf(' ') === -1;
    }).sort(function (a, b) {
      if (a.districtName > b.districtName) return 1;
      if (a. districtName < b.districtName) return -1;
      return 0;
    });
    this.$areaList.append(_.reduce(filteredList, function (memo, item) {
      return memo + Tw.REGION_LIST_ITEM.getItem(item.districtName, item.middleCd);
    }, ''));

    skt_landing.widgets.widget_init('.container-wrap');
    if (Tw.FormatHelper.isEmpty(middleCode)) {
      this.$areaList.find('li:first').click();
    } else {
      this.$areaList.find('input[value="' + middleCode + '"]').click();
    }
  },
  _onComplete: function () {
    var middleName = this.$areaList.find('li[aria-checked="true"]').text();
    this._completeCallback(this.$btDropdown.val(), middleName, this._regions);
  }
};
