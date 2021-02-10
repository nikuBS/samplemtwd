/**
 * @file roaming.guide.index.js
 * @desc T로밍 > T로밍안내 인덱스
 * @author 황장호
 * @since 2020-09-30
 */

Tw.RoamingGuideIndex = function (rootEl, pageInfo) {
  this.$container = rootEl;
  this.baseDiv = '#roamingGuide';
  this.pageInfo = pageInfo;
  // 기존 화면의 window.scrollTop
  this.baseLastScrollTop = 0;

  // pointsStart, pointsDiff 는 '상황 별 포인트' 횡스크롤 swipe event 를 감지하기 위한 변수이다.
  this.pointsStart = {};
  this.pointsDiff = {};

  // 상황별 포인트 Q&A 분류/질문 데이터
  this.checklistByState = this.dataByState();
  // 카테고리별 포인트 Q&A 분류/질문 데이터
  this.checklistByTag = this.dataByTag();

  new Tw.RoamingMenu(rootEl).install();
  this.setup();
  this.bindEvents();
};

Tw.RoamingGuideIndex.prototype = {
  /**
   * 이벤트 핸들러
   */
  bindEvents: function () {
    // '로밍 이용 가이드' 핸들러
    this.$container.find('.subs .sub.documents').on('click', $.proxy(this.showDocuments, this));
    // 상황별 포인트 클릭 핸들러
    this.$container.find('.point .item').on('click', $.proxy(this._handleChecklist, this));
    // 상황별 포인트 횡스크롤 slick dots 핸들러
    this.$container.find('.slick-dots li button').on('click', $.proxy(this._handleSlickDots, this));
    // 내부 다이얼로그 close 핸들러
    $(document).on('click', '.guide-dialog .appbar .close', $.proxy(this._handleClose, this));
    // '출국 전 필수 확인' 다이얼로그, 상황별 데이터 토글 핸들러
    $(document).on('click', '.card ul li.toggleItem', $.proxy(this._handleToggleItem, this));
    // '출국 전 필수 확인' 다이얼로그, 상황별 데이터, 내용부분 토글을 방지하기 위한 핸들러
    $(document).on('click', '.card li.toggleItem .description', $.proxy(this._handleStop, this));
    // '출국 전 필수 확인' 다이얼로그, 탭 전환 핸들러
    $(document).on('click', '#checklistDialog .tabs .tab', $.proxy(this._handleSelectTab, this));
    // 카테고리 선택 핸들러
    $(document).on('click', 'button.tag,a.tag', $.proxy(this._handleTag, this));
    //웹접근성 팝업 닫기 이전 포커스
    $(document).on('click', '#checklistDialog .close #dialog_close', $.proxy(this._dialog_close, this));
    //웹접근성 레프트 gnb 슬라이딩 메뉴, 닫기  
    this.$container.find('#common-menu button#fe-close').on('click', $.proxy(this._closeGnb, this)); 
  },

  //웹접근성 
  //로밍 메인에서 gnb 메뉴 닫기 클릭시 햄버거에 focus    
  _closeGnb: function() {
    setTimeout(function () {
      $("span.icon-gnb-menu").focus();
    },300);  
 },
    //웹접근성 팝업창 닫기 이전 포커스
    //e.substring(0,3) :tag #해시테그 , 그 외 출국전 ...분기처리
  _dialog_close: function(e) {

    var itemId = e.currentTarget.getAttribute('data-tabid');

    if(itemId.substring(0,3)==='tag') {  //#해시테그
      setTimeout(function(){
        $('.tags a[data-id="'+ itemId.substring(4,6) +'"]').focus();
      },500);
    }else{  //출국전 안내 
      setTimeout(function(){
        $('li[data-checklist='+ itemId +']').focus();
      },500);
    }
  },

  /**
   * '출국 전 필수 확인' 다이얼로그 띄우는 핸들러.
   * showChecklist 함수를 호출한다.
   *
   * @param e EventObject
   * @private
   */
  _handleChecklist: function(e) {
    var itemId = e.currentTarget.getAttribute('data-checklist');
    this.showChecklist(itemId);
  },
  /**
   * 상황별 포인트 횡스크롤 slick dots 핸들러
   * @param e EventObject
   * @private
   */
  _handleSlickDots: function(e) {
    var stateId = e.currentTarget.getAttribute('text');
    this.showPoints(e.currentTarget, 'state' + stateId);
  },
  /**
   * '출국 전 필수 확인' 다이얼로그 내 내용 toggle 핸들러
   * @param e EventObject
   * @private
   */
  _handleToggleItem: function(e) {
    this.toggleCheckItem(e.currentTarget);
  },
  /**
   * '출국 전 필수 확인' 다이얼로그 내 내용 toggle 방지 핸들러
   * @param e EventObject
   * @private
   */
  _handleStop: function(e) {
    e.stopPropagation();
  },
  /**
   * '출국 전 필수 확인' 다이얼로그 내 탭 선택 핸들러
   * @param e EventObject
   * @private
   */
  _handleSelectTab: function(e) {
    var tabId = e.currentTarget.getAttribute('data-tabid');
    this.selectTab(tabId);

    $('#checklistDialog .tabs').find('button').each(function(index,item){  //텝 웹접근성 aria 반전
      st =  $(this).hasClass('active') ? 'true' :'false';
      $(this).attr('aria-selected',st);    
     });
  },
  /**
   * 필수 점검 리스트 '카테고리' 핸들러
   * @param e EventObject
   * @private
   */
  _handleTag: function(e) {
    var tagId = e.currentTarget.getAttribute('data-id');
    var command = e.currentTarget.getAttribute('data-command');

    // '출국 전 필수 확인' 다이얼로그 내 카테고리 command
    if (command === 'filterTag') {
      this.filterTag('tag-' + tagId);
    }
    // 필수 점검 리스트 섹션 내 카테고리 command
    if (command === 'showChecklist') {
      this.showChecklist('tag-' + tagId);
    }
  },
  /**
   * 다이얼로그 close 핸들러
   * @private
   */
  _handleClose: function() {
    this.closeDialog();
  },
  /**
   * 화면 내 필요한 데이터들을 모두 채운다.
   */
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
    //202011 - 웹접근성 수정건 적용 : span 태그를 a태그로 변경 alt추가...
    if ($('#fe-banner-t').length) {
      var banners = [
        {bnnrFilePathNm: '/img/product/roam/guide_top_baro.png', imgLinkUrl: '/product/roaming/info/barocall', bnnrExpsSeq: '1', bnnrImgAltCtt : 'baro - 데이터 로밍 요금제에 가입하고 해외에서 한국으로 자유롭게 baro 통화하세요.'}, 
        {bnnrFilePathNm: '/img/product/roam/guide_top_securet.png', imgLinkUrl: '/product/roaming/info/secure-troaming', bnnrExpsSeq: '2', bnnrImgAltCtt : '자동안심 T로밍 - 과도한 요금이 청구되지 않도록 이용금을 제어해주는 SK테레콤만의 서비스'},
        {bnnrFilePathNm: '/img/product/roam/guide_top_guam.png', imgLinkUrl: '/product/roaming/info/guamsaipan', bnnrExpsSeq: '3', bnnrImgAltCtt : '괌,사이판 - 괌,사이판으로 여행 갈 때는 SK텔레콤만의 특별한 로밍혜택을 누려보세요'},
        {bnnrFilePathNm: '/img/product/roam/guide_top_product.png', imgLinkUrl: '/product/roaming/fee-info', bnnrExpsSeq: '4', bnnrImgAltCtt : '로밍 상품 이용안내 - 쉽고 편리하게 이용할 수 있는  SK텔레콤의 새로운 로밍 서비스를 소개합니다.'}
      ];
      for (i=0; i<banners.length; i++) {
        var b = banners[i];
        b.imgLinkTrgtClCd = '1';
        b.chnlClCd = '05';
        b.bnnrLocCd = 'T';
      }
      new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, banners, 'T', 'M', function(e) {
        var dataIndex = e.currentTarget.getAttribute('data-idx');
        // iOS 에서 slick-dots 미노출 되는 경우가 있어 이를 방지하기 위한 코드
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
  /**
   * 상황별 포인트 좌측 스와이프 감지 시
   */
  nextPoint: function () {
    var current = $('#slickPoints li.slick-active');
    var next = current.attr('data-next');
    if (next) {
      var source = $('#slickPoints li:eq(' + (next - 1) + ') button')[0];
      this.showPoints(source, 'state' + next);
    }
  },
  /**
   * 상황별 포인트 우측 스와이프 감지 시
   */
  prevPoint: function () {
    var current = $('#slickPoints li.slick-active');
    var prev = current.attr('data-prev');
    if (prev) {
      var source = $('#slickPoints li:eq(' + (prev - 1) + ') button')[0];
      this.showPoints(source, 'state' + prev);
    }
  },
  /**
   * 상황별 포인트, 현재 선택된 카드를 중앙에 표시하고 slick dots 싱크.
   *
   * @param e EventObject
   * @param checklistId 체크리스트 아이디로, state1, state2, state3 이렇게 3개가 있다.
   */
  showPoints: function (e, checklistId) {
    // 상황별 포인트, 횡스크롤로 현재 선택된 포인트 카드 표시
    $('#slickPoints li').removeClass('slick-active');
    $(e.parentElement).addClass('slick-active');

    var offsetLeft = $('#' + checklistId)[0].offsetLeft;
    $('#roamingGuide .points').animate({
      scrollLeft: offsetLeft - 20
    }, 180, null);
  },
  /**
   * '출국 전 필수 확인' 다이얼로그를 열고, itemId 포커스를 잡고 내용을 표시한다.
   * @param itemId 체크리스트 아이디 (state-01-01 형식)
   */
  showChecklist: function (itemId) {
    // '출국 전 필수확인' 다이얼로그 표시 후, `itemId` 포커스
    this.hideBaseDiv();

    // 상황별 포인트인 케이스
    if (itemId.match('state-.*')) {
      this.selectTab('state');
      this.toggleCheckItemImpl(itemId);

      // 다이얼로그 오픈 직후, 해당 itemId가 바로 보이도록 offset.top 계산하여 스크롤
      setTimeout(function () {
        var itemOffset = $('#checklistDialog #' + itemId).offset();
        $('#checklistDialog').animate({
          scrollTop: itemOffset.top - 60
        }, 200, function () {
          // 스크롤 직후, 2초동안 highlight 한다. (스펙에는 없었지만 사용성 개선 차원에서 넣음)
          $('#checklistDialog #' + itemId + ' .title').effect('highlight', {}, 2000);
        });
      }, 200);
    }
    // 카테고리별 케이스
    if (itemId.match('tag-.*')) {
      this.selectTab('tag');
      this.filterTag(itemId);
    }

    //웹접근성 닫기 버튼에 이전 포커스 id 값 넣어줌
    $('#checklistDialog .close #dialog_close').attr('data-tabId',itemId);
    // 웹접근성 수정건 적용  :출국전 안내사항 팝업, title 포커스
    setTimeout(function(){
      $('#'+itemId).find('.title').focus();
     // $('#'+itemId).find('.title').text('test');
    },500);
    

    $('#checklistDialog').css('display', 'block');
  },
  /**
   * '출국 전 필수 확인' 다이얼로그 내 특정 카테고리(태그) 핸들러
   * @param tagId 카테고리(태그) 아이디
   */
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
  /**
   * '출국 전 필수 확인' 다이얼로그 내 설명 toggle
   * @param source currentTarget
   */
  toggleCheckItem: function (source) {
    this.toggleCheckItemImpl(source.id);
  },
  /**
   * toggleCheckItem 과 동일하나 파라미터로 itemId를 바로 받는 구현체.
   * @param itemId 항목 아이디 (e.g. tag-02-01, state-01-01)
   */
  toggleCheckItemImpl: function (itemId) {
    var content = $('.guide-contents .' + itemId).html();
    var descId = '#' + itemId + ' .description';
    $(descId).html(content);

    var imagePrefix = Tw.Environment.cdn + '/img/product/roam/ico_';

    //웹접근성 aria toogle
    $('#' + itemId).attr('aria-pressed')=='true' ? $('#' + itemId).attr('aria-pressed','false') : $('#' + itemId).attr('aria-pressed','true'); 


    $(descId).toggle(200, 'swing', function () {
      var info = $(descId)[0];
      var hidden = info.style.display === 'none';
      $('#' + itemId + ' .arrow').attr('src', imagePrefix + (hidden ? 'expand' : 'collapse') + '.svg');
    });
  },
  /**
   * '출국 전 필수 확인' 다이얼로그 내 탭 전환 핸들러
   * @param tabId
   */
  selectTab: function (tabId) {
    $('.tab').removeClass('active');
    $('.tab.' + tabId).addClass('active');

    // state, tag
    var list = '';
    var template = '';
    var i;
    var checklist;
    if (tabId === 'state') {
      // 상황별 데이터를 생성
      template = Handlebars.compile($('#tpl-state-panel').html());
      for (i=0; i<this.checklistByState.length; i++) {
        checklist = this.checklistByState[i];
        list += template(checklist);
      }
    }
    if (tabId === 'tag') {
      // 카테고리별 데이터 생성
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
  /**
   * '로밍 이용 가이드' 다이얼로그 표시
   */
  showDocuments: function () {
    this.hideBaseDiv();
    $('#documentsDialog').css('display', 'block');
  },
  /**
   * 기존 화면 숨김
   */
  hideBaseDiv: function() {
    this.baseLastScrollTop = $(document).scrollTop();
    $(this.baseDiv).css('display', 'none');
  },
  /**
   * 기존 화면 복원
   */
  showBaseDiv: function() {
    $(this.baseDiv).css('display', 'block');
    $(document).scrollTop(this.baseLastScrollTop);
  },
  /**
   * 다이얼로그 close
   */
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
