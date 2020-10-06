/**
 * @file roaming.countries.tariff.js
 * @desc T로밍 > 요금제 추천 > '서비스 이용 가능 국가' 팝업
 */

Tw.RoamingCountriesTariff = function (rootEl) {
  this.$container = rootEl;
  this._baseLastScrollTop = 0;

  // 가나다순과 대륙목록은 변하지 않는 값이여서 미리 준비.
  this.menus = {
    byConsonant: [
      {label: 'ㄱ', code: 'ga'}, {label: 'ㄴ', code: 'na'}, {label: 'ㄷ', code: 'da'},
      {label: 'ㄹ', code: 'ra'}, {label: 'ㅁ', code: 'ma'}, {label: 'ㅂ', code: 'ba'},
      {label: 'ㅅ', code: 'sa'}, {label: 'ㅇ', code: 'oa'}, {label: 'ㅈ', code: 'ja'},
      {label: 'ㅊ', code: 'cha'}, {label: 'ㅋ', code: 'ka'}, {label: 'ㅌ', code: 'ta'},
      {label: 'ㅍ', code: 'pa'}, {label: 'ㅎ', code: 'ha'}
    ],
    byContinent: [
      {label: '유럽', code: 'eur'},
      {label: '아시아', code: 'asp'},
      {label: '미주', code: 'amc'},
      {label: '오세아니아', code: 'ocn'},
      {label: '중동', code: 'met'},
      {label: '아프리카', code: 'afr'}
    ]
  };
  this.currentSortBy = 'byConsonant'; // 가나다순이면 byConsonant, 대륙별이면 byContinent.
  this.data = {
    byConsonant: [],
    byContinent: []
  };

  this.baseDiv = '#roamingTariffOffer';
  this.bindEvents();
};

Tw.RoamingCountriesTariff.prototype = {
  bindEvents: function () {
    var root = $('#countriesDialog');
    root.find('.header .close').on('click', $.proxy(this._handleClose, this));
    root.find('.sortBy .by').on('click', $.proxy(this._handleSort, this));
    root.find('.tariffBox .dropdown').on('change', $.proxy(this._handleChange, this));
  },
  _handleSort: function(e) {
    this.sortBy(e.currentTarget);
  },
  _handleChange: function(e) {
    this.onChangeTariff(e.currentTarget);
  },
  _handleClose: function() {
    this.closeCountries();
  },
  showCountries: function (defaultProdId) {
    // `defaultProdId` 요금제 사용이 가능한 국가 목록을 가져온다.
    // wt=1 을 함께 보냈으므로, 이용가능한 모든 요금제 목록도 함께 가져온다.
    $.get('/product/roaming/offer?prodId=' + defaultProdId + '&wt=1',
      $.proxy(this._handleData, this, defaultProdId)
    );
    return false;
  },
  _handleData: function(defaultProdId, data) {
    this.fillTariffs(data.tariffs, defaultProdId);
    this.fillCountries(data.items.consonant, data.items.continent);

    this._baseLastScrollTop = $(document).scrollTop();
    $(this.baseDiv).css('display', 'none');
    $('#countriesDialog').css('display', 'block');
    this.adjustScrollContainer();
  },
  closeCountries: function () {
    $('#countriesDialog').css('display', 'none');
    $(this.baseDiv).css('display', 'block');
    $(document).scrollTop(this._baseLastScrollTop);
  },
  fillTariffs: function (items, selectedProdId) {
    // 화면 상단 이용요금제 dropdown 박스에 요금제 목록을 채운다.
    var select = document.querySelector('.tariffBox .dropdown');
    select.innerHTML = '';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var opt = document.createElement('option');
      opt.innerText = item.prodNm;
      opt.value = item.prodId;
      if (item.prodId === selectedProdId) {
        opt.selected = true;
      }
      select.appendChild(opt);
    }
  },
  fillCountries: function (byConsonant, byContinent) {
    // 가나다별, 대륙별 국가 데이터들을 업데이트한다.
    if (!byConsonant || !byContinent) {
      this.data.byConsonant = [];
      this.data.byContinent = [];
      this.fillGroups();
      document.getElementById('itemList').innerHTML = '';
      return;
    }
    this.data.byConsonant = byConsonant;
    this.data.byContinent = byContinent;
    this.fillGroups();
  },
  fillGroups: function () {
    // this.data.byConsonant, this.data.byContinent 기준으로, 화면 좌측의 그룹 목록을 생성한다
    var groupList = document.getElementById('groupList');
    groupList.innerHTML = '';

    var proxy = this;
    for (var i = 0; i < this.menus[this.currentSortBy].length; i++) {
      var menu = this.menus[this.currentSortBy][i];

      var dataset = this.data[this.currentSortBy][menu.code];
      if (!dataset || dataset.length === 0) {
        continue;
      }

      var li = document.createElement('li');
      li.id = 'group-' + menu.code;
      li.innerText = menu.label;
      li.setAttribute('data-code', menu.code);
      li.onclick = function (e) {
        var code = e.target.getAttribute('data-code');
        proxy.fillItems(code);
      };
      groupList.appendChild(li);
    }

    var firstChild = document.getElementById('groupList').firstChild;
    if (firstChild) {
      var firstCode = firstChild.getAttribute('data-code');
      this.fillItems(firstCode);
    }
  },
  fillItems: function (code) {
    // this.currentSortBy 기준으로, 화면 우측의 국가명을 채운다.
    $('#groupList li').removeClass('active');
    $('#group-' + code).addClass('active');

    var ul = document.getElementById('itemList');
    ul.innerHTML = '';

    var l = this.data[this.currentSortBy][code];
    for (var i = 0; i < l.length; i++) {
      var li = document.createElement('li');
      li.innerText = l[i].countryNm;
      ul.appendChild(li);
    }
  },
  sortBy: function (element) {
    $('.sortBy .by').removeClass('active');
    $('#' + element.id).addClass('active');
    this.currentSortBy = element.id;
    this.fillGroups();
  },
  onChangeTariff: function (element) {
    var prodId = element.options[element.selectedIndex].value;
    var proxy = this;
    // 요금제 변경시 해당 요금제에 해당하는 국가들 목록을 가져온다.
    // 이때는 wt=1 이 없으므로, 결과값에 tariffs 는 없고 items 만 온다.
    $.get('/product/roaming/offer?prodId=' + prodId, function (data) {
      proxy.fillCountries(data.items.consonant, data.items.continent);
    });
  },
  adjustScrollContainer: function () {
    // 동적으로 항목이 바뀜에 따라 중앙 스크롤 컨테이너의 크기를 재조정한다.
    var body = document.querySelector('#countriesDialog');
    var scroller = document.querySelector('.scroller');
    var containerHeight = body.offsetHeight - scroller.offsetTop;
    scroller.style.height = containerHeight + 'px';
  }
};
