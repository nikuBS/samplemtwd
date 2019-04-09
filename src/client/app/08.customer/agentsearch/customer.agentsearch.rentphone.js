/**
 * @file 임대폰 매장 리스트 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2019-02-14
 */

/**
 * @constructor
 * @param  {Object} root - 최상위 elem
 * @param  {String} list - 임대폰 매장 리스트
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

  this._categoryCode = { // SB와 맞추기 위한 하드코딩
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

  /**
   * @function
   * @desc 카네고리 선택 시 actionsheet 노출
   */
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

  /**
   * @function
   * @desc 지역선택 actionsheet 화면 관련 처리, 이벤트 바인딩 등
   * @param  {Object} $root - actionsheet 의 최상위 elem
   */
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

  /**
   * @function
   * @desc 지역 선택 완료 시 해당 지역에 따른 filtering 결과 화면에 표시
   */
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

  /**
   * @function
   * @desc 더보기 선택시 추가 리스트 노출
   */
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

  /**
   * @function
   * @desc 임대폰 매장의 정보를 화면에 표시하기 위한 markup으로 변경
   * @param  {Object} item 각 임대폰 매장의 정보 객체
   */
  _getItemCompiled: function (item) {
    return '<li class="fe-shop" data-id="' + item.locCode +'"><dl class="type02">' +
      '<dt>' + item.storeName + '</dt>' +
      '<dd>' + item.searchAddr + '<br>' + item.jibunAddr +
      '<a href="tel://' + item.tel + '" class="bt-tel">' +
      '<span role="img" class="blind">매장으로 전화하기</span></a></dd></dl></li>';
  },

  /**
   * @function
   * @desc 매장 클릭 시 각 매장의 상세화면으로 이동
   * @param  {Object} e - click event
   */
  _onShopClicked: function (e) {
    var code = $(e.currentTarget).data('id');
    this._historyService.goLoad('/customer/agentsearch/detail?code=' + code);
  },

  /**
   * @function
   * @desc 링크를 외부 브라우저로 연결
   * @param  {Object} e - click event
   */
  _onExternalLink: function (e) {
    var url = e.currentTarget.href;
    Tw.CommonHelper.openUrlExternal(url);

    return false;
  }
};
