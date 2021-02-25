/**
 * @file roaming.tariffs.js
 * @desc T로밍 > 요금제 목록
 * @author 황장호
 * @since 2020-09-30
 */

Tw.RoamingTariffs = function (rootEl, groups, nations) {
  this.$container = rootEl;
  // 컨트롤러로부터 받은 요금제 그룹 정보
  this.$groups = groups;
  // 요금제 그룹별 앵커탭 좌표 데이터
  this.$groupMetas = {};
  // 앵커탭 스크롤 감시 여부
  this.$scrollMonitor = true;
  // 현재 선택된 앵커탭
  this.$selectedAnchor = null;
  var baseDiv = '#roamingTariffs';

  if (!Tw.Environment.init) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this.afterInit, this));
  } else {
    this.afterInit();
  }
  new Tw.RoamingMenu(rootEl).install();

  // 하단 '국가 별 요금제 찾기' 에서 사용할 일정선택 팝업
  this.$schedule = new Tw.RoamingSchedules(rootEl, nations, baseDiv, function () {
    $('#nationsDialog').css('display', 'none');
    $('#scheduleDialog').css('display', 'none');
    $(baseDiv).css('display', 'block');
    $(baseDiv).addClass('wrap');
  });
  // '전체 국가 보기' 다이얼로그에서 특정 국가 선택시 실행될 콜백 설치
  this.$schedule.installNationSearch(this.$schedule.openScheduleDialog, baseDiv);

  this.bindEvents();
};

Tw.RoamingTariffs.prototype = {
  /**
   * 이벤트 핸들러
   */
  bindEvents: function () {
    // '전체 국가 보기' 링크
    this.$container.find('.fe-show-nations').on('click', $.proxy(this._openNationsDialog, this));
    // 국가 검색 돋보기 링크
    this.$container.find('.field-container .search').on('click', $.proxy(this.$schedule.searchNation, this.$schedule));
    // 국가 검색 form onSubmit
    this.$container.find('.search-form').on('submit', $.proxy(this.$schedule.searchNation, this.$schedule));
    //T로밍 요금제, 스크롤 베너 웹접근성 포커스
    this.$container.find('#contents [data-img]').on('click', this._tabfocus);
    //웹접근성 레프트 gnb 슬라이딩 메뉴, 닫기  
    $('#common-menu button#fe-close').on('click', $.proxy(this._closeGnb, this)); 
  },

  //웹접근성 
  //로밍 메인에서 gnb 메뉴 닫기 클릭시 햄버거에 focus    
  _closeGnb: function() {
    setTimeout(function () {
      $("span.icon-gnb-menu").focus();
    },300);  
 },

  /**
   * 상단 슬라이딩 베너 클릭시 웹접근성 포커스
   * @private
   */
  _tabfocus: function(e) {  
    var ix = $(this).index('[data-img]');
             $('#groups').find('.group .summary h2').eq(ix).focus();  
  },

  /**
   * '전체 국기 보기' 링크 핸들러
   * @private
   */
  _openNationsDialog: function() {
    this.$schedule.openNationsDialog();
    return false;
  },
  /**
   * Tw 모듈 초기화 직후 실행
   */
  afterInit: function() {
    this.$imagePrefix0 = Tw.Environment.cdn + '/img/product/roam/';
    this.$imagePrefix = Tw.Environment.cdn + '/img/product/roam/tab_0';
    this.fillTariffs();
    this.initScrollAnchors();
    this.followAnchor();
  },
  /**
   * 앵커탭 좌표들을 계산하여 groupMetas 에 offset top, height 데이터 보관
   */
  initScrollAnchors: function () {
    // 상단 앵커탭 좌표 계산
    for (var i=0; i<Object.keys(this.$groupMetas).length; i++) {
      var k = Object.keys(this.$groupMetas)[i];
      var div = document.getElementById(k);
      if (div) {
        this.$groupMetas[k].top = div.offsetTop;
        this.$groupMetas[k].height = div.offsetHeight;
      }
    }

    $(window).scroll($.proxy(this._handleScroll, this));

    var anchors = $('.header .anchor');
    anchors.on('click', $.proxy(this.showGroup, this));
  },
  /**
   * 타 페이지에서 hash link 로 진입했을 때의 처리
   */
  followAnchor: function () {
    var i0 = document.location.href.lastIndexOf('#');
    if (i0 !== -1) {
      var hash = document.location.href.substring(i0 + 1);
      if (hash.length > 1) {
        this.showGroupImpl('group-' + hash, 'a-group-' + hash);
      }
    }
  },
  /**
   * 스크롤 이벤트 핸들러.
   * 앵커탭 상태 업데이트 용도.
   * @private
   */
  _handleScroll: function() {
    // 스크롤 감지하여 상단 앵커탭 상태 업데이트
    if (!this.$scrollMonitor)
      return;
    // NOTE: thresholdY = 63, topMargin = 200

    var anchors = $('.header .anchors');
    var scrollTop = $(window).scrollTop();
    // 앵커탭이 floating 되야하는 지점
    if (scrollTop > 63) {
      anchors.css({position: 'fixed', left: 0, right: 0, top: 50, height: 94});

      for (var i=0; i<Object.keys(this.$groupMetas).length; i++) {
        var k = Object.keys(this.$groupMetas)[i];
        var meta = this.$groupMetas[k];
        // 200px 이 빠지는 이유는, 앵커바디 상단에 가려지는 영역이 200px 이기 때문이다.
        if (scrollTop > meta.top - 200 && scrollTop < meta.top - 200 + meta.height) {
          var thatId = 'a-' + k;
          // 상단 앵커탭을 선택된 상태로 변경
          $('.header .anchor').each($.proxy(this._handleAnchor, this, thatId));
          break;
        }
      }
    } else {
      anchors.css('position', 'static');
    }
  },
  /**
   * 스크롤 되어 특정 앵커탭을 선택된 상태로 변경
   * @param thatId 앵커탭 id. (a-group-T0000078 형식)
   * @param i 앵커탭 index
   * @param val 앵커탭 jquery object
   * @private
   */
  _handleAnchor: function(thatId, i, val) {
    var state = val.id === thatId ? 'on' : 'off';
    $('#' + val.id + ' img').attr('src', this.$imagePrefix + (i + 1) + '_' + state + '.png');
    if (state === 'on' && this.$selectedAnchor !== thatId) {
      // 선택된 앵커탭이 화면이 노출되도록 스크롤
      var offsetLeft = val.offsetLeft - 20; // 20은 padding-left
      $('.anchors').scrollLeft(offsetLeft);
      this.$selectedAnchor = thatId;
    }
  },
  /**
   * 특정 앵커탭이 사용자 액션으로 선택됐을 때.
   * _handleAnchor 와 동작이 거의 같으나 횡스크롤시 애니메이션 되는 것만이 유일한 차이다.
   *
   * @param anchorId 앵커탭 id (a-group-T0000078 형식)
   * @param i 앵커탭 index
   * @param val 앵커탭 jquery object
   * @private
   */
  _handleAnchorAnimated: function(anchorId, i, val) {
    var state = val.id === anchorId ? 'on' : 'off';
    $('#' + val.id + ' img').attr('src', this.$imagePrefix + (i + 1) + '_' + state + '.png');

    if (state === 'on') {
      var offsetLeft = val.offsetLeft - 20;
      // $('.anchors').scrollLeft(offsetLeft);
      $('.anchors').animate({
        scrollLeft: offsetLeft
      }, 180);
    }
  },
  /**
   * 특정 요금제 그룹 선택 시
   * @param event Event Object
   */
  showGroup: function (event) {
    // 요금제 그룹 선택시
    var e = event.currentTarget;
    var groupId = e.id.substring(2);
    this.showGroupImpl(groupId, e.id);
  },
  /**
   * 특정 요금제 그룹 선택 시
   * @param groupId 요금제 그룹 id
   * @param anchorId 앵커탭 그룹 id
   */
  showGroupImpl: function (groupId, anchorId) {
    $('.anchors').css({position: 'fixed', left: 0, right: 0, top: 50, height: 94});

    this.$scrollMonitor = false;
    var t = this;
    $([document.documentElement, document.body]).animate({
      scrollTop: this.$groupMetas[groupId].top - 200
    }, 180, function () {
      t.$scrollMonitor = true;
    });
    $('.header .anchor').each($.proxy(this._handleAnchorAnimated, this, anchorId));
  },
  /**
   * 컨트롤러로부터 받은 요금제 목록(this.$groups) 데이터로 UI 요소 생성.
   */
  fillTariffs: function () {
    // 그룹별로 요금제 목록 데이터 준비

    // 어드민에 등록되지 않은, 그룹별 은은한 배경이미지들
    var LOST_BANNERS = [
      {background: 'img_baro01.png'}, // baro
      {background: 'img_baro02.png'}, // OnePass 300/500
      {background: 'img_baro03.png'}, // OnePass VIP
      {background: 'img_baro04.png'}, // 괌사이판
      {background: 'img_baro05.png'} // LongPass
    ];

    var template = Handlebars.compile($('#tpl-tariff-group').html());
    var target = document.getElementById('groups');
    target.innerHTML = '';

    var i0 = 0;
    var i;
    for (i=0; i<this.$groups.length; i++) {
      var group = this.$groups[i];
      // top, height=0 초기화는 필수가 아니나 코드 가독성을 위해 적었다.
      this.$groupMetas['group-' + group.prodGrpId] = {top: 0, height: 0};

      target.innerHTML += template({
        id: group.prodGrpId,
        name: group.prodGrpNm,
        description: group.prodGrpDesc,
        background: this.$imagePrefix0 + LOST_BANNERS[i0].background,
        items: group.items.map(function (item) {
          var match = new RegExp('[0-9]+').exec(item.price);
          if (match) {
            item.price = item.price + '/' + item.duration + '일';
          }
          return {
            id: item.prodId,
            name: item.prodNm,
            price: item.price,
            data: item.data,
            phone: item.phone
          };
        })
      });
      i0 += 1;
    }

    i0 = 0;
    var anchors = $('.anchors .anchor');
    for (i=0; i<anchors.length; i++) {
      var anchor = anchors[i];
      anchor.id = 'a-group-' + this.$groups[i0].prodGrpId;
      i0 += 1;
    }
    this.$selectorAnchor = 'a-group-' + this.$groups[0].prodGrpId;
  }
};
