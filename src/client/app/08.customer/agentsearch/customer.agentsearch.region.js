/**
 * @file 나와 가까운 지점 검색에서 위치변경 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-29
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 * @param  {String} currentDo - 현재 보여지고 있는 도 이름
 * @param  {String} currentGu - 현재 보여지고 있는 구 이름
 * @param  {Object} regions - tmap으로 부터 검색된 지역명 및 코드 담고 있는 객체
 * @param  {Function} callback - 위치변경 완료 후 호출할 callback
 */
Tw.CustomerAgentsearchRegion = function (rootEl, currentDo, currentGu, regions, callback) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._completeCallback = callback;

  this._regions = regions;
  this._currentDo = currentDo;
  this._currentGu = currentGu;

  this._cacheElements();
  this._bindEvents();
  this._init();
};

Tw.CustomerAgentsearchRegion.prototype = {

  /**
   * @function
   * @desc tmap으로 부터 regions 정보가 이전에 검색된 적이 있으면 caching된 데이터 활용, 그렇지 않은 경우 tmap으로 조회 요청
   */
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

  /**
   * @function
   * @desc 사용자가 선택할 수 있는 지역들을 리스팅
   */
  _onRegionsDone: function () {
    var districtName = '';
    var largeCd = '';
    var middleCd = '';
    if (!Tw.FormatHelper.isEmpty(this._currentGu) && !Tw.FormatHelper.isEmpty(this._currentDo)) {
      var matched = _.filter(this._regions, $.proxy(function (item) {
        if (item.areaDepth === 'L') {
          if (this._currentDo === item.districtName ||
              this._currentDo.indexOf(item.districtName) !== -1 ||
              (this._currentDo[0] + this._currentDo[2]).indexOf(item.districtName) !== -1) {
            return true;
          }
        }
        return false;
      }, this));

      if (!Tw.FormatHelper.isEmpty(matched)) {
        largeCd = matched[0].largeCd;
        districtName = matched[0].districtName;

        var matchedMiddle = _.filter(this._regions, $.proxy(function (item) {
          return matched[0].largeCd === item.largeCd && item.districtName === this._currentGu;
        }, this));

        if (!Tw.FormatHelper.isEmpty(matchedMiddle)) {
          middleCd = matchedMiddle[0].middleCd;
        }
      }
    }

    if (largeCd === '') {
      districtName = this._regions[0].districtName;
      largeCd = this._regions[0].largeCd;
    }

    this.$btDropdown.text(districtName);
    this.$btDropdown.val(largeCd);
    this._onLargeAreaChanged(largeCd, middleCd);
  },

  /**
   * @function
   * @desc 드랍다운 버튼 클릭 시 actionsheet 에 선택할 수 있는 최상위 지역명 노출
   */
  _onDropDownClicked: function () {
    var currentLargeCd = this.$btDropdown.val();
    var regionList = _.map(_.filter(this._regions, function (region) {
      return region.areaDepth === 'L';
    }), function (region) {
      var ret = {
        txt: region.districtName,
        'label-attr': 'id=' + region.largeCd,
        'radio-attr': 'id="' + region.largeCd + '" value="' + region.districtName + '" name="r2"'
      };
      if (region.largeCd === currentLargeCd) {
        ret['radio-attr'] = ret['radio-attr'] + ' checked';
      }
      return ret;
    });

    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: [{ list: regionList }],
      btnfloating : { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(function (root) {
      root.on('click', '.btn-floating', $.proxy(function () {
        this._popupService.close();
      }, this));
      root.on('click', 'input[type=radio]', $.proxy(function (e) {
        this._popupService.close();
        this.$btDropdown.text($(e.currentTarget).val());
        this.$btDropdown.val($(e.currentTarget).attr('id'));
        this._onLargeAreaChanged($(e.currentTarget).attr('id'));
      }, this));
    }, this), null, 'region');
  },

  /**
   * @function
   * @desc 최상위 지역명이 바뀐 경우 바뀐 지역에 해당하는 하위 지역들을 리스팅
   * @param  {String} largeCode - 선택된 최상위 지역 코드
   * @param  {String} middleCode - 비어 있을 경우 1번 지역을 선택된 상태로
   */
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

    var count = 1;
    this.$areaList.append(_.reduce(filteredList, function (memo, item) {
      var ret =  Tw.REGION_LIST_ITEM.getItem(item.districtName, item.middleCd);
      // 웹 접근성 관련 aria-labelledby field 추가
      ret = ret.replace(/aria-comp-radio/g, 'aria-comp-radio' + count);
      count += 1;
      return memo + ret;
    }, ''));

    $('.widget-box.tube').data('event', null);
    skt_landing.widgets.widget_init();
    if (Tw.FormatHelper.isEmpty(middleCode)) {
      this.$areaList.find('li:first').click();
    } else {
      this.$areaList.find('input[value="' + middleCode + '"]').click();
    }
  },

  /**
   * @function
   * @desc 지역변경 화면 하단 submit 클릭 시 바뀐 정보와 함께 callback 호출
   */
  _onComplete: function () {
    var middleName = this.$areaList.find('li[aria-checked="true"]').text();
    this._completeCallback(this.$btDropdown.val(), middleName, this._regions);
  }
};
