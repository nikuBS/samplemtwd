/**
 * @file roaming.main.js
 * @desc T로밍
 */

Tw.RoamingMain = function (rootEl, popularNations, nations, banners) {
  this.$container = rootEl;
  this.$popularNations = popularNations;
  this.$banners = banners;
  var baseDiv = '#roamingMain';

  if (!Tw.Environment.init) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this.afterInit, this));
  } else {
    this.afterInit();
    // this._getTosAdminRoamingBanner();
  }
  new Tw.RoamingMenu(rootEl).install();

  // 일정선택 팝업 컴포넌트
  this.$schedule = new Tw.RoamingSchedules(rootEl, nations, baseDiv, function() {
    $('#nationsDialog').css('display', 'none');
    $('#scheduleDialog').css('display', 'none');
    $(baseDiv).css('display', 'block');
    $(baseDiv).addClass('wrap');
  });
  this.$schedule.installNationSearch(this.$schedule.openScheduleDialog, baseDiv);

  this.bindEvents();
};

Tw.RoamingMain.prototype = {
  bindEvents: function () {
    this.$container.find('.fe-show-nations').on('click', $.proxy(this._openNationsDialog, this));
    this.$container.find('.field-container .search').on('click', $.proxy(this.$schedule.searchNation, this.$schedule));
    this.$container.find('.search-form').on('submit', $.proxy(this._handleSearchSubmit, this));
  },
  _handleSearchSubmit: function() {
    return this.$schedule.searchNation();
  },
  _openNationsDialog: function() {
    this.$schedule.openNationsDialog();
    return false;
  },
  afterInit: function() {
    this.fillPopularNations();
    this.beautifyCurrentUse();
    this.setupBanners();
  },
  beautifyCurrentUse: function () {
    // 상단 이용중인 카드의 '~외 1건' colorize
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
  fillPopularNations: function () {
    // 인기 여행지 6개 데이터 준비
    var template = Handlebars.compile($('#tpl-nation-card').html());
    var cdn = Tw.Environment.cdn;

    for (var i = 0; i < this.$popularNations.length; i++) {
      var item = this.$popularNations[i];
      var imageUrl = cdn + item.mblBtnImg;
      if (!item.mblBtnImg) {
        imageUrl = null;
      }
      var cell = template({
        name: item.countryNameKor,
        code: item.countryCode,
        imageUrl: imageUrl,
        imageAlt: item.mblBtnImgAltCtt,
      });
      $('#pc' + (i + 1)).html(cell);
    }
    this.$container.find('div.pn').on('click', $.proxy(this._handlePopularNation, this));
  },
  _handlePopularNation: function(e) {
    var code = e.currentTarget.getAttribute('data-code');
    var name = e.currentTarget.getAttribute('data-name');
    this.$schedule.openScheduleDialog(code, name, null, this.$schedule.$baseDiv);
  },
  setupBanners: function() {
    // 어드민 배너 준비
    if ($('#fe-banner-t').length) {
      new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, this.$banners, 'T', 'M');
    }
  }
};
