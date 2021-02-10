/**
 * @file roaming.schedules.js
 * @desc 일정선택 팝업창에서 사용하는 스크립트 모음.
 *       로밍메인, 요금제목록, 국가별 로밍요금제 조회에서 사용된다.
 * @author 황장호
 * @since 2020-09-30
 */

/**
 * 생성자
 * @param rootEl Root Element
 * @param nations 대륙별 모든 국가
 * @param baseDiv 기존 화면 division id
 * @param closeCallback close callback
 * @constructor
 */
Tw.RoamingSchedules = function (rootEl, nations, baseDiv, closeCallback) {
  this.$container = rootEl;
  // 대륙별 모든 국가
  this.$nations = nations;
  // 대륙별 모든 국가를 flatten 한 목록
  this.$allNations = [];
  this.$baseDiv = baseDiv;
  this.$onSelectCallback = this.openScheduleDialog;
  this.$closeCallback = closeCallback;
  this._baseLastScrollTop = 0;

  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this.bindEvents();
};

Tw.RoamingSchedules.prototype = {
  /**
   * 이벤트 핸들러
   */
  bindEvents: function () {
    // 다이얼로그 최하단 '추천 요금제 확인' 버튼 링크
    $('#scheduleConfirm').on('click', $.proxy(this.tryConfirm, this));
    // 다이얼로그 닫기 버튼
    $('#scheduleDialog .header .close').on('click', $.proxy(this.closeScheduleDialog, this));
    // 전체 국가 보기 다이얼로그 닫기 버튼
    $('#nationsDialog .header .close').on('click', $.proxy(this._closeDialog, this));
    //여행할 나라 국가 클릭시 index 값 저장(웹접근성)
    $('#pc1, #pc2, #pc3, #pc4, #pc5, #pc6').on('click', $.proxy(this._clickfix, this)); 
  },
  /*
   * 국가별 6개 선택시, 달력 레이어 값(웹접근성)
   *data-ix 에 클릭한 국가 index 담아둠,
   */
  _clickfix: function(e) {
     var fix =e.currentTarget.getAttribute('fix')
     $('[data-ix]').attr('data-ix',fix);
  },

  /**
   * 전체 국가 보기 다이얼로그 닫기
   * @private
   */
  _closeDialog: function() {
    this.$closeCallback();
    //웹접근성
    $("[data-ix]").attr('data-ix','');  //index 값 초기화,
    $(".fe-show-nations").focus();  //전체국가 보기 닫기 , 웹접근성 추가
   // $(document).scrollTop(this._baseLastScrollTop);
  },
  /**
   * 일정 선택 다이얼로그 오픈
   * @param code 국가 코드
   * @param name 국가 이름
   * @param topBannerUrl 상단 이미지 배너 url
   * @param baseDiv 다이얼로그를 띄운 base division id
   */
  openScheduleDialog: function (code, name, topBannerUrl, baseDiv) {
    if (baseDiv !== '#nationsDialog') {
      this._baseLastScrollTop = $(document).scrollTop();
    }
    $('#scheduleDialog').css('display', 'block');
    $(baseDiv).css('display', 'none');
    $(baseDiv).removeClass('wrap');
    $('#scheduleDialog').addClass('wrap');
    $('#date-depart').html('-');
    $('#date-arrive').html('-');
    if (!topBannerUrl) {
      // 인기여행지 Redis 데이터에는 topBannerUrl 이 없어서 그때 그때 XHR로 조회
      $('#scheduleDialog .banner').attr('src', '');
      // 만약 topBannerUrl 이 없다면 XHR로 가져온다.
      $.get('/product/roaming?queryBg=' + code, function (data) {
        if (data.backgroundUrl) {
          var cdn = Tw.Environment.cdn;
          $('#scheduleDialog .banner').attr('src', cdn + data.backgroundUrl);
        }
      });
    } else {
      // 전체 국가 보기 다이얼로그에서 들어올 때는 존재하는 topBannerUrl 을 그대로 사용
      $('#scheduleDialog .banner').attr('src', topBannerUrl);
    }
    $('#target-nation').html(name);
    $('#target-nation').attr('data-code', code);
    $('div#calendar').daterangepicker({
      element: $('div#calendar'),
      parentEl: 'div#calendar',
      minDate: moment().add(1, 'days').format('YYYY-MM-DD'),
      // 가는 날은 오늘로부터 60일 이내이고, 오는 날은 가는 날로부터 30일이라, 최대 90일까지만 선택 가능
      maxDate: moment().add(90, 'days').format('YYYY-MM-DD')
    }, $.proxy(this._handleDatePick, this));

    //웹접그성 달력 오픈시 focus 지정
    $('#scheduleDialog .summary h1').focus();

    $(document).on('click', 'th.next,th.prev', function() {
      $('#calendarGuide').css('display', 'none');
    });
  },
  /**
   * 달력에서 날짜 선택 시
   * @param start 가는 날
   * @param end 오는 날 (null 일 수 있음)
   * @private
   */
  _handleDatePick: function(start, end) {
    $('#scheduleDialog #calendarGuide').css('display', 'none');

    var today = moment();
    // 가는 날이 60일 이내이고, 오는 날이 가는 날로부터 30일 이내인 것은 구혜선 수석이 알려준 스펙이다.
    if (start && start.diff(today, 'days') >= 60) {
      $('#scheduleConfirm').addClass('not-prepared');
      // showDateGuide('60일 이내만', '선택 가능합니다', '.active.start-date.available');
      Tw.Popup.openAlert('가는 날은 60일 이내만 가능합니다.', '일정 선택');
      return;
    }
    if (start && end) {
      if (end.diff(start, 'days') < 30) {
        $('#scheduleConfirm').removeClass('not-prepared');
      } else {
        $('#scheduleConfirm').addClass('not-prepared');
        // showDateGuide('30일 이상은', '선택하실 수 없습니다', '.active.end-date.available');
        Tw.Popup.openAlert('30일 이상은 선택하실 수 없습니다.', '일정 선택');
        return;
      }
    } else {
      $('#scheduleConfirm').addClass('not-prepared');
    }

    if (start) {
      $('#date-depart').html(start.format('YYYY. M. D.(dd)'));
    }
    if (end) {
      $('#date-arrive').html(end.format('YYYY. M. D.(dd)'));
    } else {
      $('#date-arrive').html('-');
    }

    if (start && !end) {
      // 가는 날만 선택했을 경우, 툴팁 표시
      this.showDateGuide(start.format('M월 D일'), '오는 날을 선택하세요', '.active.start-date.available');
    }
  },
  /**
   * 일정선택 다이얼로그 닫기
   */
  closeScheduleDialog: function () {

    $('#scheduleDialog').removeClass('wrap');
    this.$closeCallback();
    //$(document).scrollTop(this._baseLastScrollTop);

    //1~6개 국가 index 값.
    var fix = $('[data-ix]').attr('data-ix'); 

    switch(fix){
      case "1":
       obj ='#pc1 .pn';       
       break;

      case "2":
        obj ='#pc2 .pn';       
        break;

      case "3":
        obj ='#pc3 .pn';        
        break;

      case "4":
        obj ='#pc4 .pn';       
        break;

      case "5":
        obj ='#pc5 .pn';       
        break;

      case "6":
        obj ='#pc6 .pn';       
        break;

      case "7":
        obj ='.fe-show-nations';       //전체국가
        break;

      default:
        obj ='#btn_search2';  //국가검색 돋보기 아이콘
    }

    $("[data-ix]").attr('data-ix','');  //index 값 초기화,

    setTimeout(function(){
      $(obj).focus();   
     },200);   
  },

  /**
   * 가는 날 선택 시 표시될 작은 말풍선 레이어 표시
   *
   * @param title 레이어 상단 타이틀
   * @param message 하단 메시지
   * @param selector
   */
  showDateGuide: function (title, message, selector) {
    // 선택한 날짜가 DOM 적용될 때까지 setTimeout 으로 잠시 대기
    setTimeout(function () {
      var dateCells = document.querySelectorAll(selector);
      if (!dateCells || dateCells.length < 1) {
        return;
      }
      var dateCell;
      for (var i=0; i<dateCells.length; i++) {
        var cell = dateCells[i];
        if (cell.className.indexOf('off') >= 0) {
          // 비활성화 된 회색 일은 넘어간다.
          continue;
        }
        dateCell = cell;
        break;
      }
      if (!dateCell) {
        return;
      }
      // 현재 좌표에 따라 말풍선이 잘리지 않게 적절히 배치
      var rect = dateCell.getBoundingClientRect();
      var x = rect.left;
      var y = rect.top + $('.dialog').scrollTop(); // 스크롤 상태 반영
      // 선택한 날짜보다 70px 위, 35px 좌측을 기준 좌표로 삼는다.
      y -= 70;
      x -= 35;
      // .tail class는, 말풍선의 꼬리이다.

      if (x < 10) {
        // 말풍선이 화면 좌측을 넘어갈 경우, margin-left: 10px 보정
        x = 10;
        $('#scheduleDialog #calendarGuide .tail').css('left', '13px');
      } else if (x + 128 + 10 > window.innerWidth) {
        // 말풍선이 화면 우측을 넘어갈 경우, margin-right 보정.
        // 128은 말풍선의 너비
        x = window.innerWidth - 128 - 10;
        $('#scheduleDialog #calendarGuide .tail').css('left', '65px');
      } else {
        $('#scheduleDialog #calendarGuide .tail').css('left', '43px');
      }
      $('#scheduleDialog #calendarGuide .title').text(title);
      $('#scheduleDialog #calendarGuide .message').text(message);
      $('#scheduleDialog #calendarGuide').css('left', x + 'px');
      $('#scheduleDialog #calendarGuide').css('top', y + 'px');
      $('#scheduleDialog #calendarGuide').css('display', 'block');
    }, 200);
  },
  /**
   * '추천 요금제 확인' 클릭 핸들러
   * @returns {boolean}
   */
  tryConfirm: function () {
    var classes = $('#scheduleConfirm').attr('class');
    if (classes.indexOf('not-prepared') >= 0) {
      // 입력 조건이 불충분하면 무시
      return false;
    }

    var startDate = moment($('#date-depart').html(), 'YYYY.MM.DD');
    var endDate = moment($('#date-arrive').html(), 'YYYY.MM.DD');
    var diffDays = endDate.diff(startDate, 'days');
    if (diffDays >= 30) {
      Tw.Popup.openAlert('30일 이상은 선택하실 수 없습니다.', '일정 선택');
      return false;
    }
    var countryCode = $('#target-nation').attr('data-code');
    this.closeScheduleDialog();
    // 요금제 추천 페이지로 이동
    this._history.goLoad('/product/roaming/offer?code=' + countryCode +
      '&from=' + startDate.format('YYYYMMDD') +
      '&to=' + endDate.format('YYYYMMDD'));
  },
  /**
   * 현재 페이지(baseDiv)에 국가 검색 autocomplete 설치.
   * @param selectionCb 자동완성 레이어에서 국가 선택시 실행될 콜백
   * @param baseDiv 현재 페이지 division id
   */
  installNationSearch: function (selectionCb, baseDiv) {
    // 국가 검색 auto complete 설치
    if (!selectionCb) {
      throw new Error('Selection callback should not be null');
    }
    this.$onSelectCallback = selectionCb;

    this.prepareNations();
    var allNations = this.$allNations;
    var proxy = this;
    // https://jqueryui.com/autocomplete/
    $('#nation-search').autocomplete({
      // 국가 검색 로직
      source: function (req, res) {
        // 대소문자 무시
        var term = req.term.toLowerCase().trim();
        if (term.length >= 1) {
          var suggestions = [];
          for (var i=0; i<allNations.length; i++) {
            var nation = allNations[i];
            // 검색어 중간 포함은 막는다 (SB 참조)
            if (nation.countryNameKor.indexOf(term) === 0 ||
              nation.countryNameEng.toLowerCase().indexOf(term) === 0) {
              var index = nation.countryNameKor.indexOf(term);
              if (index < 0) {
                index = nation.countryNameEng.toLowerCase().indexOf(term);
              }
              suggestions.push({
                label: nation.countryNameKor, // jqueryui autocomplete 에서 사용
                value: nation.countryNameKor, // jqueryui autocomplete 에서 사용
                code: nation.countryCode, // 국가 코드
                index: index
              });
            }
          }
          // 정렬, index 값이 작고, 전체 길이 짧을수록 상단에 노출
          suggestions.sort(function (a, b) {
            return (a.index * 1000 + a.label.length) - (b.index * 1000 + b.label.length);
          });
          res(suggestions);
        }
      },
      // 최소 n글자 입력시에만 자동완성 레이어 노출
      minLength: 1,
      // 노출된 자동완성 레이어에서 특정 아이템(국가)를 방향키 등을 이용해 focus 만 잡혔을 때.
      // 모바일웹에서는 호출될 일이 없어서 이 콜백의 중요성은 상대적으로 낮다.
      // [공식문서] The default action is to replace the text field's value with the value of the focused item,
      //          though only if the event was triggered by a keyboard interaction.
      focus: function (event, ui) {
        if (ui.item && ui.item.code) {
          $('#nation-search').val(ui.item.label);
          // 아이폰에서 키보드 내려가도록 처리
          $('#nation-search').blur();
          selectionCb.apply(proxy, [ui.item.code, ui.item.label, null, baseDiv]);
          return false;
        }
        return false;
      },
      // 자동완성 레이어에서 특정 아이템(국가)를 선택(터치) 시.
      select: function (event, ui) {
        // 아이폰에서 키보드 내려가도록 처리
        $('#nation-search').blur();
        // jqueryui autocomplete focus 기본 동작은 선택된 값을 input value 에 채우기만 하므로,
        // 아래와 같이 selectionCallback 을 직접 호출
        selectionCb.apply(proxy, [ui.item.code, ui.item.label, null, baseDiv]);
      }
    });
    this.setupNationsDialog();
  },
  /**
   * 컨트롤러로부터 받은 국가 정보($nations)를 FE가 쓰기 쉽게 가공하여 $allNations 변수에 채움
   */
  prepareNations: function () {
    var all = [];
    var categories = Object.keys(this.$nations);
    for (var i = 0; i < categories.length; i += 1) {
      var category = categories[i];
      var items = this.$nations[category];
      all = all.concat(items);
    }
    all.sort();
    this.$allNations = all;
  },
  /**
   * 전체 국가 검색 다이얼로그 준비
   */
  setupNationsDialog: function () {
    var menuItems = $('#nationsDialog .menu li button');
    // 국가 그룹 선택 핸들러
    menuItems.on('click', $.proxy(this._onClickNationGroup, this));
  },
  /**
   * 국가 검색 다이얼로그 내에서 좌측 그룹 선택시
   * @param e EventObject
   * @private
   */
  _onClickNationGroup: function(e) {
    this.onClickNationGroup(e.currentTarget);
  },
  /**
   * 국가 검색 다이얼로그 내에서 좌측 그룹(대륙) 선택시
   * @param menu currentTarget element
   */
  onClickNationGroup: function (menu) {
    $('#nationsDialog .menu li button').removeClass('active');
    menu.className = 'active';
    var selectedNations = this.$nations[menu.id];
    var targetList = $('#nationsDialog .content ul');
    targetList.html('');

    var onSelectCallback = this.$onSelectCallback;
    var THIS = this;
    var clickHandler = function(e) {
      var nationName = e.target.innerText;
      var nationCode = e.target.getAttribute('data-country');
      onSelectCallback.apply(THIS, [nationCode, nationName, null, '#nationsDialog']);
    };
    for (var i = 0; i<selectedNations.length; i++) {
      var nation = selectedNations[i];

      if(i==0){
        $('#nationsDialog .content h2').text(nation.commCdValNm);
      }
      /**
       * <li>
       *   <button role="link" title="캐나다" data-country="CAN">캐나다</button>
       * </li>
       */
      var li = document.createElement('li');
      var bt = document.createElement('button');
      bt.setAttribute('role', 'link');
      bt.setAttribute('title', nation.countryNameKor);
      bt.onclick = clickHandler;
      bt.innerText = nation.countryNameKor;
      bt.setAttribute('data-country', nation.countryCode);
      li.appendChild(bt);
      targetList.append(li);
    }
  },
  /**
   * 국가 검색 버튼 클릭시
   */
  searchNation: function () {
    var name = $('#nation-search').val();
    if (name.trim().length === 0) {
      Tw.Popup.openAlert('국가명을 입력해주세요', '국가 검색');
      $('#nation-search').focus();
      return false;
    }
    name = name.trim();
    // 국가명으로부터 국가코드 복원을 위해 loop
    for (var i=0; i<this.$allNations.length; i++) {
      var item = this.$allNations[i];
      if (item.countryNameKor === name || item.countryNameEng.toLowerCase() === name.toLowerCase()) {
        $('#nation-search').blur();
        this.$onSelectCallback.apply(this, [item.countryCode, item.countryNameKor, null, this.$baseDiv]);
        return false;
      }
    }
    Tw.Popup.openAlert('해당 국가는 로밍 서비스 가능 국가가 아닙니다.', '국가 검색');
    return false;
  },
  /**
   * '전체 국가 보기' 다이얼로그 오픈
   */
  openNationsDialog: function () {
    this._baseLastScrollTop = $(document).scrollTop();
    this.onClickNationGroup(document.getElementById('EUR'));
    $(this.$baseDiv).css('display', 'none');
    $('#nationsDialog').css('display', 'block');

    //전체국가보기 달력 닫기 할 경우 이전 포커스(웹접근성)
    $('[data-ix]').attr('data-ix','7');
  }
};
