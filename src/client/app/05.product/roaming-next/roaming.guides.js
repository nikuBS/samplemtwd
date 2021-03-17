/**
 * @file roaming.guides.jsㄹ
 * @desc T로밍 > T로밍안내 서브 페이지들 공용 클래스
 *       이용안내 페이지들에서 반복하여 사용되는 JS 함수들이 모여있다.
 *
 * @author 황장호
 * @since 2020-09-25
 */

Tw.RoamingGuides = function (rootEl, pageInfo) {
  this.$container = rootEl;
  // 현재 선택된 앵커탭
  this.selectedAnchor = null;
  // 스크롤 모니터링 여부
  this.scrollMonitor = true;
  // 상단 앱바 높이 (Immutable)
  this.appbarHeight = 50;
  // Dialog 표시 직전 scrollTop
  this.baseLastScrollTop = 0;
  this.pageInfo = pageInfo;
  this.baseDiv = '#roamingGuide';
  this.bindEvents();
  new Tw.RoamingMenu(rootEl).install(); 
};

Tw.RoamingGuides.prototype = {
  /**
   * 이벤트 핸들러
   */
  bindEvents: function () {
    var proxy = this;
    // Q&A 핸들러
    this.$container.find('.qna .q').on('click', $.proxy(this._handleQna, this));
    this.$container.find('.links .link').on('click', $.proxy(this._handleLink, this));
    // baro 통화, 이용 가능 여부 확인
    this.$container.find('#available .button').on('click', $.proxy(this.queryBaroAvailable, this));
    // baro 통화, 다이얼로그 처리
    $(document).on('click', '#baroTariffs .appbar .close', function() {
      $('#baroTariffs').css('display', 'none');
      proxy.showBaseDiv();
    });
    // baro 통화, 탭 전환
    $(document).on('click', '#baroTariffs .tabs .tab', function(e) {
      var tabId = e.currentTarget.getAttribute('data-tabid');
      proxy.selectBaroTab(tabId);
    });
    // T로밍센터 탭 전환
    $(document).on('click', '.center .tabs .tab', function(e) {
      e.preventDefault();
      var tabId = e.currentTarget.getAttribute('data-tabid');
      $('.tabs .tab').removeClass('active');
      $('.tabs .tab').attr('aria-selected', false);
      $('.tabs .tab.' + tabId).attr('aria-selected', true).addClass('active');

      $('.tab-body').hide();
      $('#' + tabId).show();
    });
    // T로밍센터, 터미널 선택 ActionSheet
    this.$container.find('#terminal').on('click', $.proxy(this.openTerminalActionSheet, this));
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

  _handleQna: function(e) {

    //웹접근성 baro q&a
    str_aria = ( $(e.currentTarget).find('a').attr('aria-pressed') =='false') ? 'true' : 'false';
    $(e.currentTarget).find('a').attr('aria-pressed',str_aria);

    this.toggleQna(e.currentTarget);
  },
  _handleLink: function(e) {
    var command = e.currentTarget.getAttribute('data-command');
    if (command === 'showCountries') {
      // 이용안내 > 자동로밍 (M000532) '이용 가능 국가 보기' 팝업 연결
      Tw.Popup.open({
        hbs: 'RM_16_02_01_01',
        title: Tw.POPUP_TITLE.ROAMING_SERVICE_COUNTRY
      });
      return false;
    }
    if (command === 'showTariffs') {
      // 이용안내 > baro 통화 (M001879) '혜택 대상 로밍 요금제 확인하기' 링크
      this.showBaroTariffs();
    }
  },
  /**
   * 특정 앵커탭이 선택된 상태로 전환.
   *
   * @param target 선택할 앵커탭의 selector.
   */
  showAnchor: function (target) {
    // 지정된 target active 클래스 추가
    $('.anchors a').removeClass('active');
    $(target).addClass('active');

    $('.anchors').css({
      position: 'fixed', left: 0, right: 0,
      top: this.appbarHeight,
      height: $('.anchors').height()
    });
    $('.anchorsShadow').css({display: 'block'});

    var offset = $(target).data('offset');
    var proxy = this;
    proxy.scrollMonitor = false;
    $([document.documentElement, document.body]).animate({
      scrollTop: offset.top - offset.topMargin + 5
    }, 180, function () {
      proxy.scrollMonitor = true;
    });

    //웹접근성 바로통화, 이용 가능 여부 조회, 이용방법 안내 띠메뉴 이영 가능 여부 조회 focus
    if($(target).attr('href') == '#howto'){    // 이용방법안내만  image 라.....
      obj_id = $(target).attr("href");
      $(obj_id +' img').focus();
    } else{ //바로통화 / 이용가능여부조회
      obj_id = $(target).attr("href");
      $(obj_id +' h2').focus();
    }
  },
  /**
   * 해당 페이지에 앵커탭이 있는지 검사하고, 앵커탭 존재시 각 앵커의 좌표와 높이를 계산하고
   * 스크롤를 검사하여 앵커탭을 자동으로 전환하도록 이벤트 핸들러를 설치.
   */
  prepareAnchorTabs: function () {
    // offset().top: 앵커탭 y 좌표
    var thresholdY = $('.anchors').offset().top - this.appbarHeight;
    var topMargin = this.appbarHeight + $('.anchors').height();

    var proxy = this;
    var as = $('.anchors a');
    var anchorHandler = function(e) {
      // var meta = $(e.target).data('meta');
      proxy.showAnchor(e.target);
      e.preventDefault();
    };
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      var anchorId = $(a).attr('href');
      var id = anchorId.substring(1);
      var anchor = document.getElementById(id);
      // 각 앵커탭의 body 좌표값들을 저장
      $(a).data('offset', {top: anchor.offsetTop, height: anchor.offsetHeight, topMargin: topMargin});
      $(a).data('meta', {id: id});
      $(a).on('click', anchorHandler);
    }

    var anchorsHeight = $('.anchors').height();
    var anchors = $('.anchors');
    var shadow = $('.anchorsShadow');
    // 스크롤 검사
    $(window).scroll(function () {
      if (!proxy.scrollMonitor) {
        // 스크롤 애니메이션 처리 중에는 검사하지 않음
        return;
      }
      var scrollTop = $(window).scrollTop();
      if (scrollTop > thresholdY) {
        // 스크롤이 thresholdY 보다 크면, 앵커탭이 fixed 로 노출되는 케이스
        anchors.css({position: 'fixed', left: 0, right: 0, top: proxy.appbarHeight, height: anchorsHeight, transform: 'inherit'});
        shadow.css({display: 'block'});

        var selectedA;
        var as = $('.anchors a');
        for (var i = 0; i < as.length; i++) {
          var a = as[i];
          var offset = $(a).data('offset');
          if (scrollTop > offset.top - topMargin) {
            selectedA = a;
          }
        }
        // 반복적으로 호출되면 성능에 문제가 될 수 있으므로, 이미 선택된 앵커인 경우 실행 금지
        if (selectedA && proxy.selectedAnchor !== selectedA.href) {
          proxy.selectedAnchor = selectedA.href;
          $('.anchors a').removeClass('active');
          $(selectedA).addClass('active');
        }
      } else {
        var position = $('#contents').css('position');
        if (position === 'fixed') {
          // 공통팝업이 떠 있는지 확인.
          // 공통팝업이 떠 있는 경우, transform 속성이 켜 있다.
          var tf = $('#contents').css('transform');
          // translate 값을 가져와서,
          var match = /([\-0-9]+)\)/.exec(tf);
          if (match) {
            var y = parseInt(match[1], 10);
            // translatedY 만큼 거꾸로 밀어서, 앵커탭이 깨지지 않게 보정
            anchors.css({transform: 'translate(0px, ' + Math.abs(y) + 'px)', top: -10});
          }
        } else {
          // scrollTop < thresholdY 케이스에는, 앵커탭 position static 으로 정상 상태이다.
          anchors.css({position: 'static', transform: 'inherit'});
          // anchorShadow 는 fixed 상태일 때 요소들이 밀리지 않게 하는 것이므로 static 일 때는 노출할 필요가 없다.
          shadow.css({display: 'none'});
        }
      }
    });
  },
  /**
   * Q&A 접고 피는 등 (아코디언) 이벤트 발생 시 앵커탭의 좌표가 전부 변하므로,
   * 이 경우 앵커탭 요소의 좌표를 모두 재계산 한다.
   */
  updateAnchorsOffset: function () {
    var as = $('.anchors a');
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      var anchorId = $(a).attr('href');
      var id = anchorId.substring(1);
      var anchor = document.getElementById(id);
      var data = $(a).data('offset');
      data.top = anchor.offsetTop;
      data.height = anchor.offsetHeight;
      $(a).data('offset', data);
    }
  },
  /**
   * Q&A 아코디언 구현. 앵커탭과 함께 엮여 있으므로 퍼블리싱 공통요소를 사용할 수 없다.
   *
   * @param source 이벤트를 발생시킨 source element (q)
   */
  toggleQna: function (source) {
    var proxy = this;
    var cdn = Tw.Environment.cdn;
    $(source).next().toggle('blind', {}, 250, function () {
      if ($(source).next().css('display') === 'block') {
        $(source).find('.arrow').attr('src', cdn + '/img/product/roam/ico_collapse.svg');
      } else {
        $(source).find('.arrow').attr('src', cdn + '/img/product/roam/ico_expand.svg');
      }
      proxy.updateAnchorsOffset();
    });
  },
  /**
   * baro 통화 이용 가능 여부 조회 response handler.
   * @param resp /svcInfo 응답 JSON
   */
  processSvcInfo: function (resp) {
    if (resp && resp.code === '00') {
      $('.available-result').css('display', 'none');
      Tw.Api.request(Tw.API_CMD.BFF_10_0182, {gubunCd: '01'}, {}, [])
        .done($.proxy(this.processBaroAvailable, this));
    } else {
      new Tw.TidLandingComponent().goLogin('/product/roaming/info/barocall');
    }
  },
  /**
   * baro 통화 이용 가능 여부 조회
   */
  queryBaroAvailable: function(e) {
    e.preventDefault();
    Tw.Api.request(Tw.NODE_CMD.GET_SVC_INFO, {}).done($.proxy(this.processSvcInfo, this));
  },
  /**
   * baro 통화 이용 가능 여부 조회 response handler.
   * @param resp BFF_10_0182 응답 JSON
   */
  processBaroAvailable: function (resp) {
    var result = resp.result;
    if ((result.baroPlanYn === 'Y' && result.baroDeviceYn === 'Y' && result.baroVasYn === 'Y') ||
      result.baroItem4Yn === 'Y' || result.baroItem5Yn === 'Y') {
      $('.available-result.case1').css('display', 'block');
    } else if (result.baroItem6Yn === 'Y' || result.baroItem7Yn === 'Y') {
      $('.available-result.case2').css('display', 'block');
    } else {
      $('.available-result.case3').css('display', 'block');
    }
  },
  /**
   * 기존 화면의 Division 숨김.
   * 숨기기 직전에 scrollTop 을 저장한다.
   */
  hideBaseDiv: function() {
    this.baseLastScrollTop = $(document).scrollTop();
    $(this.baseDiv).css('display', 'none');
  },
  /**
   * 숨겼던 기존 화면 Division 복원.
   * 저장해뒀던 scrollTop 을 복원한다.
   */
  showBaseDiv: function() {
    $(this.baseDiv).css('display', 'block');
    $(document).scrollTop(this.baseLastScrollTop);
  },
  /**
   * baro 통화 탭 전환
   * @returns {boolean} preventDefaults 목적의 bool
   */
  showBaroTariffs: function() {
    this.hideBaseDiv();
    this.selectBaroTab('yes');
    $('#baroTariffs').css('display', 'block');
    return false;
  },
  /**
   * 이용안내 > baro 통화 > 'baro 통화 혜택 대상 로밍 요금제' 다이얼로그 내 탭
   * @param tabId
   */
  selectBaroTab: function(tabId) {
    $('.tab').removeClass('active');
    $('.tab.' + tabId).addClass('active');

    // yes, no
    var list = '';
    var p = {};
    var template = Handlebars.compile($('#tpl-tariff-list').html());
    if (tabId === 'yes') {
      p = {
        items: [
          {name: 'T로밍 함께쓰기 3GB', description: '기본 제공 데이터를 다 쓰면 데이터 사용 제한'},
          {name: 'T로밍 함께쓰기 6GB', description: '기본 제공 데이터를 다 쓰면 데이터 사용 제한'},
          {name: 'baro OnePass 300 기본형'},
          {name: 'baro OnePass 300 기간형'},
          {name: 'baro OnePass 600 기본형'},
          {name: 'baro OnePass 600 기간형'},
          {name: 'baro OnePass VIP 기본형'},
          {name: 'baro OnePass VIP 기간형'},
          {name: 'baro OnePass Data VIP 기본형'},
          {name: 'baro OnePass Data VIP 기간형'},
          {name: 'baro 3GB'},
          {name: 'baro YT 4GB'},
          {name: 'baro 4GB'},
          {name: 'baro YT 5GB'},
          {name: 'baro 5GB'},
          {name: 'baro 7GB'},
          {name: 'baro YT 8GB'},
          {name: 'T괌사이판 5천원'},
          {name: 'T괌사이판 국내처럼'},
          {name: 'T로밍 아시아패스'},
          {name: 'T로밍 아시아패스 YT'},
          {name: 'T로밍 한중일패스'},
          {name: 'T로밍 한중일패스 YT'},
          {name: 'T로밍 미주패스 3GB'},
          {name: 'T로밍 미주패스 6GB'},
          {name: 'T로밍 미주패스 YT 4GB'},
          {name: 'T로밍 미주패스 YT 7GB'},
          {name: 'T로밍 LongPass 2GB'},
          {name: 'T로밍 LongPass 3GB'},
          {name: 'T로밍 LongPass 5GB'},
          {name: '내집처럼 T로밍 중국 플러스'},
          {name: 'T로밍 실버 무한톡'},
          {name: 'T로밍 팅+무한톡'}
        ]
      };
      list += template(p);
    }
    if (tabId === 'no') {
      p = {
        items: [
          {name: '내집처럼 T로밍 중국'}
        ]
      };
      list += template(p);
    }
    $('#baroTariffs .tariffs').html(list);
  },
  /**
   * T로밍센터 > 터미널 변경하는 ActionSheet 선택시 핸들러
   * @param e EventObject
   */
  openTerminalActionSheet: function(e) {
    var proxy = this;
    Tw.Popup.open({
      hbs: 'actionsheet01',
      layer: true,
      data: [{
        title: '인천공항 1터미널',
        list: [
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="1"', txt: '인천공항 1터미널 3층' },
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="2"', txt: '인천공항 1터미널 1층' }
        ]
      }, {
        title: '인천공항 2터미널',
        list: [
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="3"', txt: '인천공항 2터미널 3층' },
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="4"', txt: '인천공항 2터미널 동편 입국심사장' }
        ]
      }],
      btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
    }, function() {
      var $layer = $('.actionsheet .container');
      var currentCenter = $('#terminal').text().trim();
      Tw.CommonHelper.focusOnActionSheet($layer); // IOS에서 포커스 이동이 되지 않아 강제로 포커스 이동(웹접근성)

      $('li.type1').each(function(){
        if($(this).find('label').text().trim() === currentCenter){
          $(this).find('input[type=radio]').prop('checked', true);
        }
      });
      $layer.find('[name="r2"]').on('click', proxy.onSelectCenter);
      $layer.one('click', '#fe-back', Tw.Popup.close);
    }, null, null, $(e.currentTarget));
  },
  /**
   * T로밍센터, 액션시트 통해 터미널 변경 시 화면 처리
   * @param e EventObject
   */
  onSelectCenter: function(e) {
    var centerId = Number($(e.target).parents('label').attr('id'));
    var centerName = $(e.target).parents('label').find('.txt').text();
    $('#terminal .txt').text(centerName);
    $('#currentCenter').html($('#center' + centerId).html());
    Tw.Popup.close();
    $('#terminal').focus(); // 액션시트 선택 후 강제 포커스(웹접근성)
  }
};

