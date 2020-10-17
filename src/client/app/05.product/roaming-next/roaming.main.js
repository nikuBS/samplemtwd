/**
 * @file roaming.main.js
 * @desc T로밍 메인
 * @author 황장호
 * @since 2020-09-30
 */

/**
 * 생성자
 *
 * @param rootEl Root Element
 * @param popularNations 인기여행지 목록
 * @param nations 대륙별 전체 국가 목록
 * @param banners 배너 목록
 * @constructor
 */
Tw.RoamingMain = function (rootEl, popularNations, nations, banners) {
  this.$container = rootEl;
  this.$popularNations = popularNations;
  this.$banners = banners;
  var baseDiv = '#roamingMain';

  if (!Tw.Environment.init) {
    // INIT_COMPLETE 대기하는 이유는 BannerService가 Tw.init 에 의존성이 있기 때문이다.
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this.afterInit, this));
  } else {
    this.afterInit();
    // this._getTosAdminRoamingBanner();
  }
  new Tw.RoamingMenu(rootEl).install();

  // 일정선택 팝업 컴포넌트 초기화
  this.$schedule = new Tw.RoamingSchedules(rootEl, nations, baseDiv, function() {
    $('#nationsDialog').css('display', 'none');
    $('#scheduleDialog').css('display', 'none');
    $(baseDiv).css('display', 'block');
    $(baseDiv).addClass('wrap');
  });
  // '전체 국가 보기' 다이얼로그 내 특정 국가 선택시 실행되야 할 콜백함수 등록
  this.$schedule.installNationSearch(this.$schedule.openScheduleDialog, baseDiv);

  this.bindEvents();
};

Tw.RoamingMain.prototype = {
  bindEvents: function () {
    // '전체 국가 보기' 링크 선택
    this.$container.find('.fe-show-nations').on('click', $.proxy(this._openNationsDialog, this));
    // 국가 검색 창의 돋보기 선택
    this.$container.find('.field-container .search').on('click', $.proxy(this.$schedule.searchNation, this.$schedule));
    // 국가 검색 창의 onSubmit 핸들러
    this.$container.find('.search-form').on('submit', $.proxy(this._handleSearchSubmit, this));
  },
  /**
   * 국가 검색 창의 onSubmit 핸들러
   * @private
   */
  _handleSearchSubmit: function() {
    return this.$schedule.searchNation();
  },
  /**
   * '전체 국가 보기' 링크 핸들러
   * @private
   */
  _openNationsDialog: function() {
    this.$schedule.openNationsDialog();
    return false;
  },
  /**
   * 모듈 초기화.
   * 1) 인기여행지 데이터 처리
   * 2) 상단 현재 이용중인 요금제의 '~~ 외 2건' colorize
   * 3) 어드민 배너 처리
   */
  afterInit: function() {
    this.fillPopularNations();
    this.beautifyCurrentUse();
    this.setupBanners();
  },
  /**
   * 상단 현재 이용 중인 요금제의 '~~ 외 2건' colorize
   */
  beautifyCurrentUse: function () {
    var dom = document.getElementById('currentUseText');
    if (dom != null) {
      var text = dom.innerText;
      var match = new RegExp('[0-9]+건$').exec(text);
      if (match) {
        var html = text.substring(0, match.index) + '<span class="point">' + text.substring(match.index) + '</span>';
        dom.innerHTML = html;
      }
    }
  },
  /**
   * 인기 여행지 데이터 준비
   */
  fillPopularNations: function () {
    var template = Handlebars.compile($('#tpl-nation-card').html());
    var cdn = Tw.Environment.cdn;

    for (var i = 0; i < this.$popularNations.length; i++) {
      var item = this.$popularNations[i];
      var imageUrl = cdn + item.mblBtnImg;
      // mblBtnImg 가 없는 케이스는 없음. 방어코드.
      if (!item.mblBtnImg) {
        imageUrl = null;
      }
      var cell = template({
        name: item.countryNameKor,
        code: item.countryCode,
        imageUrl: imageUrl,
        imageAlt: item.mblBtnImgAltCtt
      });
      $('#pc' + (i + 1)).html(cell);
    }
    this.$container.find('div.pn').on('click', $.proxy(this._handlePopularNation, this));
  },
  /**
   * 인기 여행지 클릭 핸들러
   * @param e EventObject
   * @private
   */
  _handlePopularNation: function(e) {
    var code = e.currentTarget.getAttribute('data-code');
    var name = e.currentTarget.getAttribute('data-name');
    this.$schedule.openScheduleDialog(code, name, null, this.$schedule.$baseDiv);
  },
  /**
   * 어드민 배너 준비
   */
  setupBanners: function() {
    if ($('#fe-banner-t').length) {
      // FIXME: priority M 이면 admin > tos 인데, 정말로 tos 배너를 미표시해도 되는지 확인
      // FIXME: this.$banners의 chnlClCd를 지정해줘야하는게 아닐지. 모바일 전용 요청이 필요한가?
      new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, this.$banners, 'T', 'M');
    }
  }
};
