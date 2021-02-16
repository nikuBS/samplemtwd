/**
 * @file roaming.countries.tariff.js
 * @desc T로밍 > 요금제 추천 > '서비스 이용 가능 국가' 팝업
 *       roaming.tariff.offer.js 모듈이 사용한다.
 * @author 황장호
 * @since 2020-09-30
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
  // 가나다순이면 byConsonant, 대륙별이면 byContinent.
  this.currentSortBy = 'byConsonant';
  // 대륙별, 가나다순으로 정리된 국가들이 들어있는 목록
  this.data = {
    byConsonant: [],
    byContinent: []
  };

  this.baseDiv = '#roamingTariffOffer';
  this.bindEvents();
};

Tw.RoamingCountriesTariff.prototype = {
  /**
   * 이벤트 핸들러
   */
  bindEvents: function () {
    var root = $('#countriesDialog');
    // 우상단 닫기 버튼
    root.find('.header .close').on('click', $.proxy(this._handleClose, this));
    // 대륙별, 가나다순 탭
    root.find('.sortBy .by').on('click', $.proxy(this._handleSort, this));
    // 최상단 요금제 목록 드롭다운이 변경됐을 때
    root.find('.tariffBox .dropdown').on('change', $.proxy(this._handleChange, this));
  },
  /**
   * 대륙별, 가나다순 변경
   * @param e JQuery EventObject
   * @private
   */
  _handleSort: function(e) {
    this.sortBy(e.currentTarget);
  },
  /**
   * 요금제 목록 변경 시
   * @param e JQuery EventObject
   * @private
   */
  _handleChange: function(e) {
    this.onChangeTariff(e.currentTarget);
  },
  /**
   * 다이얼로그 닫기
   * @private
   */
  _handleClose: function() {
    this.closeCountries();
  },
  /**
   * 요금제 추천(M00225) 화면에서 '서비스 이용가능 국가' 선택 시 한 번만 호출.
   *
   * @param defaultProdId 요금제 드롭다운에 기본 선택되어 있어야할 요금제의 원장 id
   */
  showCountries: function (defaultProdId) {
    // `defaultProdId` 요금제 사용이 가능한 국가 목록을 가져온다.
    // wt=1 (withTariffs) 을 함께 보냈으므로, 이용가능한 모든 요금제 목록도 함께 가져온다.
    $.get('/product/roaming/offer?prodId=' + defaultProdId + '&wt=1',
      $.proxy(this._handleData, this, defaultProdId)
    );
    return false;
  },
  /**
   * showCountries 에서 호출한 XHR JSON 응답 핸들러.
   *
   * @param defaultProdId 요금제 드롭다운에 기본 선택되어 있어야할 요금제의 원장 id
   * @param data 응답 JSON
   * @private
   */
  _handleData: function(defaultProdId, data) {
    this.fillTariffs(data.tariffs, defaultProdId);
    this.fillCountries(data.items.consonant, data.items.continent);

    this._baseLastScrollTop = $(document).scrollTop();
    $(this.baseDiv).css('display', 'none');
    $('#countriesDialog').css('display', 'block');
    this.adjustScrollContainer();
  },
  /**
   * 다이얼로그 닫기
   */
  closeCountries: function () {
    $('#countriesDialog').css('display', 'none');
    $(this.baseDiv).css('display', 'block');
    $(document).scrollTop(this._baseLastScrollTop);
  },
  /**
   * 화면 상단 요금제 dropdown 에 요금제 목록을 채운다.
   * @param items 요금제 목록 데이터
   * @param selectedProdId 현재 선택된 요금제의 원장 id
   */
  fillTariffs: function (items, selectedProdId) {
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
  /**
   * 국가 목록 데이터를 UI에 채워주는 함수.
   * 가나다별, 대륙별 국가 데이터를 업데이트 한다.
   *
   * @param byConsonant 가나다순 데이터
   * @param byContinent 대륙별 데이터
   */
  fillCountries: function (byConsonant, byContinent) {
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
  /**
   * 채워진 국가 데이터 기반으로 좌측의 그룹 목록을 생성한다.
   * this.data.byConsonant, this.data.byContinent 기준으로 화면 좌측의 그룹 목록을 생성.
   */
  fillGroups: function () {
    var groupList = document.getElementById('groupList');
    groupList.innerHTML = '';

    var proxy = this;
    var clickHandler = function(e) {
      // 각 그룹 요소 선택 시, 그룹 내 국가를 채우기 위해 fillItems 호출
      var code = e.target.getAttribute('data-code');
      proxy.fillItems(code);
    };
    // 현재 선택된 분류(currentSortBy)의 메뉴데이터로 루프
    for (var i = 0; i < this.menus[this.currentSortBy].length; i++) {
      var menu = this.menus[this.currentSortBy][i];

      // 해당 메뉴에 속한 데이터를 dataset 으로 준비
      var dataset = this.data[this.currentSortBy][menu.code];
      if (!dataset || dataset.length === 0) {
        continue;
      }

      // 그룹 데이터 li 요소 생성
      var li = document.createElement('li');
      li.id = 'group-' + menu.code;
      li.innerText = menu.label;
      li.setAttribute('data-code', menu.code);
      li.onclick = clickHandler;
      groupList.appendChild(li);
    }

    // 분류 전환 직후이므로, 그룹의 첫번째 요소를 클릭한 효과 구현
    var firstChild = document.getElementById('groupList').firstChild;
    if (firstChild) {
      var firstCode = firstChild.getAttribute('data-code');
      this.fillItems(firstCode);
    }
  },
  /**
   * 해당 그룹 code 에 속한 국가들을 UI 에 업데이트.
   *
   * @param code 그룹코드. 가나다순일 때는 ga, na, 대륙별일 때는 eur, asp.
   */
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
      // 서비스 이용가능 국가 목록 다이얼로그의 경우, 국가 클릭 시 아무런 변화가 없으므로 핸들러를 설치하지 않는다.
      ul.appendChild(li);
    }
  },
  /**
   * 가나다, 대륙별 탭 선택 시 핸들러
   * @param element EventObject
   */
  sortBy: function (element) {
    $('.sortBy .by').removeClass('active');
    $('#' + element.id).addClass('active');
    this.currentSortBy = element.id;
    this.fillGroups();
  },
  /**
   * 상단 요금제 dropdown 에서 값이 바뀌었을 때 호출되는 핸들러
   * @param element currentTarget element
   */
  onChangeTariff: function (element) {
    var prodId = element.options[element.selectedIndex].value;
    var proxy = this;
    // 요금제 변경시 해당 요금제에 해당하는 국가들 목록을 가져온다.
    // 이때는 wt(withTariffs)=1 이 없으므로, 결과값에 tariffs 는 없고 items 만 온다.
    $.get('/product/roaming/offer?prodId=' + prodId, function (data) {
      proxy.fillCountries(data.items.consonant, data.items.continent);
    });
  },
  /**
   * 동적으로 항목이 바뀜에 따라 중앙 스크롤 컨테이너의 크기를 재조정.
   */
  adjustScrollContainer: function () {
    var body = document.querySelector('#countriesDialog');
    var scroller = document.querySelector('.scroller');
    var containerHeight = body.offsetHeight - scroller.offsetTop;
    scroller.style.height = containerHeight + 'px';
  }
};
