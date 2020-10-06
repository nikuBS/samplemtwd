/**
 * @file roaming.tariffs.js
 * @desc T로밍 > 요금제 목록
 */

Tw.RoamingTariffs = function (rootEl, groups, nations) {
  this.$container = rootEl;
  this.$groups = groups;
  this.$groupMetas = {};
  this.$scrollMonitor = true;
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
  this.$schedule.installNationSearch(this.$schedule.openScheduleDialog, baseDiv);

  this.bindEvents();
};

Tw.RoamingTariffs.prototype = {
  bindEvents: function () {
    this.$container.find('.fe-show-nations').on('click', $.proxy(this._openNationsDialog, this));
    this.$container.find('.field-container .search').on('click', $.proxy(this.$schedule.searchNation, this.$schedule));
    this.$container.find('.search-form').on('submit', $.proxy(this.$schedule.searchNation, this.$schedule));
  },
  _openNationsDialog: function() {
    this.$schedule.openNationsDialog();
    return false;
  },
  afterInit: function() {
    this.$imagePrefix0 = Tw.Environment.cdn + '/img/product/roam/';
    this.$imagePrefix = Tw.Environment.cdn + '/img/product/roam/tab_0';
    this.fillTariffs();
    this.initScrollAnchors();
    this.followAnchor();
  },
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
  followAnchor: function () {
    // 다른 페이지에서 hash link 로 들어왔을 때의 처리
    var i0 = document.location.href.lastIndexOf('#');
    if (i0 !== -1) {
      var hash = document.location.href.substring(i0 + 1);
      if (hash.length > 1) {
        this.showGroupImpl('group-' + hash, 'a-group-' + hash);
      }
    }
  },
  _handleScroll: function(e) {
    // 스크롤 감지하여 상단 앵커탭 상태 업데이트
    if (!this.$scrollMonitor)
      return;

    var anchors = $('.header .anchors');
    var scrollTop = $(window).scrollTop();
    if (scrollTop > 63) {
      anchors.css({position: 'fixed', left: 0, right: 0, top: 50, height: 94});

      for (var i=0; i<Object.keys(this.$groupMetas).length; i++) {
        var k = Object.keys(this.$groupMetas)[i];
      // for (var k of Object.keys(this.$groupMetas)) {
        var meta = this.$groupMetas[k];
        if (scrollTop > meta.top - 200 && scrollTop < meta.top - 200 + meta.height) {
          var thatId = 'a-' + k;
          $('.header .anchor').each($.proxy(this._handleAnchor, this, thatId));
          break;
        }
      }
    } else {
      anchors.css('position', 'static');
    }
  },
  _handleAnchor: function(thatId, i, val) {
    var state = val.id === thatId ? 'on' : 'off';
    $('#' + val.id + ' img').attr('src', this.$imagePrefix + (i + 1) + '_' + state + '.png');
    if (state === 'on' && this.$selectedAnchor !== thatId) {
      var offsetLeft = val.offsetLeft - 20;
      $('.anchors').scrollLeft(offsetLeft);
      this.$selectedAnchor = thatId;
    }
  },
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
  showGroup: function (event) {
    // 요금제 그룹 선택시
    var e = event.currentTarget;
    var groupId = e.id.substring(2);
    this.showGroupImpl(groupId, e.id);
  },
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
