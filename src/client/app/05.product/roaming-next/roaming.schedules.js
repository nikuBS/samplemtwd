/**
 * @file roaming.schedules.js
 * @desc 일정선택 팝업창에서 사용하는 스크립트 모음.
 *       로밍메인, 요금제목록, 국가별 로밍요금제 조회에서 사용된다.
 */

Tw.RoamingSchedules = function (rootEl, nations, baseDiv, closeCallback) {
  this.$container = rootEl;
  this.$nations = nations;
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
  bindEvents: function () {
    $('#scheduleConfirm').on('click', $.proxy(this.tryConfirm, this));
    $('#scheduleDialog .header .close').on('click', $.proxy(this.closeScheduleDialog, this));
    $('#nationsDialog .header .close').on('click', $.proxy(this._closeDialog, this));
  },
  afterInit: function () {

  },
  _closeDialog: function() {
    this.$closeCallback();
    $(document).scrollTop(this._baseLastScrollTop);
  },
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
      $('#scheduleDialog .banner').attr('src', '');
      $.get('/product/roaming?queryBg=' + code, function (data) {
        if (data.backgroundUrl) {
          var cdn = Tw.Environment.cdn;
          $('#scheduleDialog .banner').attr('src', cdn + data.backgroundUrl);
        }
      });
    } else {
      $('#scheduleDialog .banner').attr('src', topBannerUrl);
    }
    $('#target-nation').html(name);
    $('#target-nation').attr('data-code', code);
    $('div#calendar').daterangepicker({
      element: $('div#calendar'),
      parentEl: 'div#calendar',
      minDate: moment().add(1, 'days').format('YYYY-MM-DD'),
      maxDate: moment().add(90, 'days').format('YYYY-MM-DD')
    }, $.proxy(this._handleDatePick, this));
  },
  _handleDatePick: function(start, end) {
    $('#scheduleDialog #calendarGuide').css('display', 'none');

    var today = moment();
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
      this.showDateGuide(start.format('M월 D일'), '오는 날을 선택하세요', '.active.start-date.available');
    }
  },
  closeScheduleDialog: function () {
    $('#scheduleDialog').removeClass('wrap');
    this.$closeCallback();
    $(document).scrollTop(this._baseLastScrollTop);
  },
  showDateGuide: function (title, message, selector) {
    // 가는날 선택 시 말풍선 렌더링
    setTimeout(function () {
      var dateCells = document.querySelectorAll(selector);
      if (!dateCells || dateCells.length < 1) {
        return;
      }
      var dateCell;
      for (var i=0; i<dateCells.length; i++) {
        var cell = dateCells[i];
        if (cell.className.indexOf('off') >= 0) {
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
      var y = rect.top; // 스크롤 상태 반영
      y -= 70;
      x -= 35;

      if (x < 10) {
        x = 10;
        $('#scheduleDialog #calendarGuide .tail').css('left', '13px');
      } else if (x + 128 + 10 > window.innerWidth) {
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
  tryConfirm: function () {
    // 하단 '추천 요금제 확인' 버튼 눌렀을 때
    var classes = $('#scheduleConfirm').attr('class');
    if (classes.indexOf('not-prepared') >= 0) {
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
    this._history.goLoad('/product/roaming/offer?code=' + countryCode +
      '&from=' + startDate.format('YYYYMMDD') +
      '&to=' + endDate.format('YYYYMMDD'));
  },
  installNationSearch: function (selectionCb, baseDiv) {
    // 국가 검색 auto complete 설치
    if (!selectionCb) {
      throw new Error('Selection callback should not be null');
    }
    this.$onSelectCallback = selectionCb;

    this.prepareNations();
    var allNations = this.$allNations;
    var proxy = this;
    $('#nation-search').autocomplete({
      source: function (req, res) {
        var term = req.term.toLowerCase().trim();
        if (term.length >= 1) {
          var suggestions = [];
          for (var i=0; i<allNations.length; i++) {
            var nation = allNations[i];
            if (nation.countryNameKor.indexOf(term) === 0 ||
              nation.countryNameEng.toLowerCase().indexOf(term) === 0) {
              var index = nation.countryNameKor.indexOf(term);
              if (index < 0) {
                index = nation.countryNameEng.toLowerCase().indexOf(term);
              }
              suggestions.push({
                label: nation.countryNameKor,
                value: nation.countryNameKor,
                code: nation.countryCode,
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
      minLength: 1,
      focus: function (event, ui) {
        if (ui.item && ui.item.code) {
          $('#nation-search').val(ui.item.label);
          $('#nation-search').blur();
          selectionCb.apply(proxy, [ui.item.code, ui.item.label, null, baseDiv]);
          return false;
        }
        return false;
      },
      select: function (event, ui) {
        $('#nation-search').blur();
        selectionCb.apply(proxy, [ui.item.code, ui.item.label, null, baseDiv]);
      }
    });
    this.setupNationsDialog();
  },
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
  setupNationsDialog: function () {
    var menuItems = $('#nationsDialog .menu li button');
    menuItems.on('click', $.proxy(this._onClickNationGroup, this));
  },
  _onClickNationGroup: function(e) {
    this.onClickNationGroup(e.currentTarget);
  },
  onClickNationGroup: function (menu) {
    $('#nationsDialog .menu li button').removeClass('active');
    menu.className = 'active';
    var selectedNations = this.$nations[menu.id];
    var targetList = $('#nationsDialog .content ul');
    targetList.html('');

    var onSelectCallback = this.$onSelectCallback;
    var THIS = this;
    for (var i = 0; i<selectedNations.length; i++) {
      var nation = selectedNations[i];
      var li = document.createElement('li');
      var bt = document.createElement('button');
      bt.setAttribute('role', 'link');
      bt.setAttribute('title', nation.countryNameKor);
      bt.onclick = function (e) {
        var nationName = e.target.innerText;
        var nationCode = e.target.getAttribute('data-country');
        onSelectCallback.apply(THIS, [nationCode, nationName, null, '#nationsDialog']);
      };
      bt.innerText = nation.countryNameKor;
      bt.setAttribute('data-country', nation.countryCode);
      li.appendChild(bt);
      targetList.append(li);
    }
  },
  searchNation: function () {
    var name = $('#nation-search').val();
    if (name.trim().length == 0) {
      Tw.Popup.openAlert('국가명을 입력해주세요', '국가 검색');
      $('#nation-search').focus();
      return false;
    }
    name = name.trim();
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
  openNationsDialog: function () {
    this._baseLastScrollTop = $(document).scrollTop();
    this.onClickNationGroup(document.getElementById('EUR'));
    $(this.$baseDiv).css('display', 'none');
    $('#nationsDialog').css('display', 'block');
  }
};
