/**
 * @file roaming.guide.index.js
 * @desc T로밍 > T로밍안내 인덱스
 */

Tw.RoamingGuideIndex = function (rootEl, pageInfo) {
  this.$container = rootEl;
  this.baseDiv = '#roamingGuide';
  this.pageInfo = pageInfo;
  this.baseLastScrollTop = 0;

  // pointsStart, pointsDiff 는 '상황 별 포인트' 횡스크롤 swipe event를 감지하기 위한 변수이다.
  this.pointsStart = {};
  this.pointsDiff = {};

  this.checklistByState = this.dataByState();
  this.checklistByTag = this.dataByTag();

  new Tw.RoamingMenu(rootEl).install();
  this.setup();
  this.bindEvents();
};

Tw.RoamingGuideIndex.prototype = {
  bindEvents: function () {
    this.$container.find('.subs .sub.documents').on('click', $.proxy(this.showDocuments, this));
    this.$container.find('.point .item').on('click', $.proxy(this._handleChecklist, this));
    this.$container.find('.slick-dots li button').on('click', $.proxy(this._handleSlickDots, this));
    $(document).on('click', '.guide-dialog .appbar .close', $.proxy(this._handleClose, this));
    $(document).on('click', '.card ul li.toggleItem', $.proxy(this._handleToggleItem, this));
    $(document).on('click', '.card li.toggleItem .description', $.proxy(this._handleStop, this));
    $(document).on('click', '#checklistDialog .tabs .tab', $.proxy(this._handleSelectTab, this));
    $(document).on('click', 'span.tag', $.proxy(this._handleTag, this));
  },
  _handleChecklist: function(e) {
    var itemId = e.currentTarget.getAttribute('data-checklist');
    this.showChecklist(itemId);
  },
  _handleSlickDots: function(e) {
    var stateId = e.currentTarget.getAttribute('text');
    this.showPoints(e.currentTarget, 'state' + stateId);
  },
  _handleToggleItem: function(e) {
    this.toggleCheckItem(e.currentTarget);
  },
  _handleStop: function(e) {
    e.stopPropagation();
  },
  _handleSelectTab: function(e) {
    var tabId = e.currentTarget.getAttribute('data-tabid');
    this.selectTab(tabId);
  },
  _handleTag: function(e) {
    var tagId = e.currentTarget.getAttribute('data-id');
    var command = e.currentTarget.getAttribute('data-command');

    if (command === 'filterTag') {
      this.filterTag('tag-' + tagId);
    }
    if (command === 'showChecklist') {
      this.showChecklist('tag-' + tagId);
    }
  },
  _handleClose: function() {
    this.closeDialog();
  },
  setup: function() {
    var subsWidth = $('.card .subs').width();
    var itemWidth = $('.card .sub').width();
    var gap = Math.floor((subsWidth - (itemWidth * 3)) / 2);
    $('.card .sub.mr').css({
      marginRight: gap
    });

    var list = '';
    var i = 0;
    var template;
    var checklist;

    // '로밍 시 꼭 알아야 할 상황 별 포인트' 데이터 준비
    list = '';
    template = Handlebars.compile($('#tpl-state-card').html());
    for (i=0; i<this.checklistByState.length; i++) {
      checklist = this.checklistByState[i];
      list += template(checklist);
    }
    $('.card .points').html(list);

    // '필수 점검 리스트' 데이터 준비
    list = '';
    template = Handlebars.compile($('#tpl-tag-card').html());
    for (i=0; i<this.checklistByTag.length; i++) {
      checklist = this.checklistByTag[i];
      list += template(checklist);
    }
    $('.card .tags').html(list);

    // 최상단 배너 데이터 준비
    if ($('#fe-banner-t').length) {
      var banners = [
        {bnnrFilePathNm: '/img/product/roam/guide_top_baro.png', imgLinkUrl: '/product/roaming/info/barocall', bnnrExpsSeq: '1'},
        {bnnrFilePathNm: '/img/product/roam/guide_top_securet.png', imgLinkUrl: '/product/roaming/info/secure-troaming', bnnrExpsSeq: '2'},
        {bnnrFilePathNm: '/img/product/roam/guide_top_guam.png', imgLinkUrl: '/product/roaming/info/guamsaipan', bnnrExpsSeq: '3'},
        {bnnrFilePathNm: '/img/product/roam/guide_top_product.png', imgLinkUrl: '/product/roaming/fee-info', bnnrExpsSeq: '4'}
      ];
      for (i=0; i<banners.length; i++) {
        var b = banners[i];
        b.imgLinkTrgtClCd = '1';
        b.chnlClCd = '05';
        b.bnnrLocCd = 'T';
      }
      new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, banners, 'T', 'M', function(e) {
        var dataIndex = e.currentTarget.getAttribute('data-idx');
        if (dataIndex === '0') {
          $('.main-slide-banner .slick-dots').css('overflow', 'inherit');
        }
      });
    }

    // '로밍 이용 가이드' 다이얼로그 안의 문서 다운로드 링크 준비
    $('#downloadSmart').on('click', function() {
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.SMART_GUIDE,'');
    });
    $('#downloadPartner').on('click', function() {
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.SMART_PARTNER_GUIDE,'');
    });
    $('#downloadRental').on('click', function() {
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.RENTAL_GUIDE,'');
    });

    // '로밍 시 꼭 알아야 할 상황 별 포인트' 횡스크롤 swipe event 감지
    var proxy = this;
    $('.card .points').on('touchstart', function(e) {
      var event = e.originalEvent.touches[0];
      proxy.pointsStart.x = event.clientX;
      proxy.pointsStart.y = event.clientY;
    });
    $('.card .points').on('touchmove', function(e) {
      var event = e.originalEvent.touches[0];
      proxy.pointsDiff.x = event.clientX - proxy.pointsStart.x;
      proxy.pointsDiff.y = event.clientY - proxy.pointsStart.y;

      if (proxy.pointsDiff.x > 20) {
        e.preventDefault();
      }
    });
    $('.card .points').on('touchend', function() {
      if (proxy.pointsDiff.x < -100) {
        proxy.nextPoint();
      }
      if (proxy.pointsDiff.x > 100) {
        proxy.prevPoint();
      }
    });

    // QueryString `reqItem` 접근 케이스
    var match = /\?reqItem=([A-Za-z0-9]+)/.exec(document.location.href);
    if (match) {
      var reqItem = match[1];
      if (reqItem === 'lost') {
        setTimeout(function() {
          proxy.showChecklist('state-02-04');
        }, 350);
      }
    }
  },
  nextPoint: function () {
    // 상황별 포인트 swipe left 감지
    var current = $('#slickPoints li.slick-active');
    var next = current.attr('data-next');
    if (next) {
      var source = $('#slickPoints li:eq(' + (next - 1) + ') button')[0];
      this.showPoints(source, 'state' + next);
    }
  },
  prevPoint: function () {
    // 상황별 포인트 swipe right 감지
    var current = $('#slickPoints li.slick-active');
    var prev = current.attr('data-prev');
    if (prev) {
      var source = $('#slickPoints li:eq(' + (prev - 1) + ') button')[0];
      this.showPoints(source, 'state' + prev);
    }
  },
  showPoints: function (e, checklistId) {
    // 상황별 포인트, 횡스크롤로 현재 선택된 포인트 카드 표시
    $('#slickPoints li').removeClass('slick-active');
    $(e.parentElement).addClass('slick-active');

    var offsetLeft = $('#' + checklistId)[0].offsetLeft;
    $('#roamingGuide .points').animate({
      scrollLeft: offsetLeft - 20
    }, 180, null);
  },
  showChecklist: function (itemId) {
    // '출국 전 필수확인' 다이얼로그 표시 후, `itemId` 포커스
    this.hideBaseDiv();

    if (itemId.match('state-.*')) {
      this.selectTab('state');
      this.toggleCheckItemImpl(itemId);

      setTimeout(function () {
        var itemOffset = $('#checklistDialog #' + itemId).offset();
        $('#checklistDialog').animate({
          scrollTop: itemOffset.top - 60
        }, 200, function () {
          $('#checklistDialog #' + itemId + ' .title').effect('highlight', {}, 2000);
        });
      }, 200);
    }
    if (itemId.match('tag-.*')) {
      this.selectTab('tag');
      this.filterTag(itemId);
    }
    $('#checklistDialog').css('display', 'block');
  },
  filterTag: function (tagId) {
    var activeId = $('.tags .active').attr('id');
    if (activeId === 'chip-' + tagId) {
      $('.tags .tag').removeClass('active');
      $('.checklist .tag-panel').css('display', 'block');
    } else {
      $('.tags .tag').removeClass('active');
      $('.tags #chip-' + tagId).addClass('active');
      $('.checklist .tag-panel').css('display', 'none');
      $('.checklist #' + tagId).css('display', 'block');
    }
  },
  toggleCheckItem: function (source) {
    // 설명 아코디언 toggle
    this.toggleCheckItemImpl(source.id);
  },
  toggleCheckItemImpl: function (itemId) {
    var content = $('.guide-contents .' + itemId).html();
    var descId = '#' + itemId + ' .description';
    $(descId).html(content);

    var imagePrefix = Tw.Environment.cdn + '/img/product/roam/ico_';
    $(descId).toggle(200, 'swing', function () {
      var info = $(descId)[0];
      var hidden = info.style.display === 'none';
      $('#' + itemId + ' .arrow').attr('src', imagePrefix + (hidden ? 'expand' : 'collapse') + '.svg');
    });
  },
  selectTab: function (tabId) {
    $('.tab').removeClass('active');
    $('.tab.' + tabId).addClass('active');

    // state, tag
    var list = '';
    var template = '';
    var i;
    var checklist;
    if (tabId === 'state') {
      template = Handlebars.compile($('#tpl-state-panel').html());
      for (i=0; i<this.checklistByState.length; i++) {
        checklist = this.checklistByState[i];
        list += template(checklist);
      }
    }
    if (tabId === 'tag') {
      template = Handlebars.compile($('#tpl-tags').html());
      list += template({items: this.checklistByTag});

      template = Handlebars.compile($('#tpl-tag-panel').html());
      for (i=0; i<this.checklistByTag.length; i++) {
        checklist = this.checklistByTag[i];
        list += template(checklist);
      }
    }
    $('#checklistDialog .checklist').html(list);
  },
  showDocuments: function () {
    this.hideBaseDiv();
    $('#documentsDialog').css('display', 'block');
  },
  hideBaseDiv: function() {
    this.baseLastScrollTop = $(document).scrollTop();
    $(this.baseDiv).css('display', 'none');
  },
  showBaseDiv: function() {
    $(this.baseDiv).css('display', 'block');
    $(document).scrollTop(this.baseLastScrollTop);
  },
  closeDialog: function() {
    $('#documentsDialog').css('display', 'none');

    $('#checklistDialog').scrollTop(0);
    $('#checklistDialog .checklist').html('');
    $('#checklistDialog').css('display', 'none');

    this.showBaseDiv();
  },
  dataByState: function() {
    return [{
      title: '출국 전 준비',
      subtitle: 'POINT 1',
      id: 'state1',
      items: [
        {title: 'T로밍 요금제 가입은 필수', id: '01-01', no: '01'},
        {title: '로밍과 현지 유심(USIM)의 차이', id: '01-02', no: '02'},
        {title: 'LTE 로밍 설정', id: '01-03', no: '03'},
        {title: '로밍 중 데이터 사용을 원치 않으시면?', id: '01-04', no: '04'}
      ]
    }, {
      title: '현지에서',
      subtitle: 'POINT 2',
      id: 'state2',
      items: [
        {title: '로밍 요금제 가입을 잊었어요', id: '02-01', no: '01'},
        {title: '로밍 이용 요금과 안내 문구 확인', id: '02-02', no: '02'},
        {title: '통화가 안 된다면?', id: '02-03', no: '03'},
        {title: '휴대폰/유심(USIM)을 분실했어요', id: '02-04', no: '04'}
      ]
    }, {
      title: '귀국 후',
      subtitle: 'POINT 3',
      id: 'state3',
      items: [
        {title: '한국에 왔는데 3G/LTE 접속이 안 돼요', id: '03-01', no: '01'},
        {title: '곧 여행/출장을 또 가신다면?', id: '03-02', no: '02'}
      ]
    }];
  },
  dataByTag: function() {
    return [{
      name: '요금',
      id: '01',
      items: [
        {title: '요금 청구 / 부과 안내', id: '01-01'},
        {title: '요금제 안내', id: '01-02'}
      ]
    }, {
      name: '데이터 로밍',
      id: '02',
      items: [
        {title: '데이터 로밍 기본정보', id: '02-01'}
      ]
    }, {
      name: '전화 연결/통화 품질',
      id: '03',
      items: [
        {title: '전화 연결', id: '03-01'},
        {title: '통화 품질', id: '03-02'}
      ]
    }, {
      name: '스마트폰/태블릿 PC',
      id: '04',
      items: [
        {title: '스마트폰, 태블릿 PC 로밍 주의사항', id: '04-01'}
      ]
    }, {
      name: '분실',
      id: '05',
      items: [
        {title: '분실에 대한 안내', id: '05-01'}
      ]
    }, {
      name: '기타',
      id: '06',
      items: [
        {title: '항공로밍/T 로밍 크루즈', id: '06-01'}
      ]
    }];
  }
};
