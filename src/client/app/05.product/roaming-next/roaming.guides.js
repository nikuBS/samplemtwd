/**
 * @file roaming.guides.js
 * @desc T로밍 > T로밍안내 서브 페이지들 공용 클래스
 */

Tw.RoamingGuides = function (rootEl, pageInfo) {
  this.$container = rootEl;
  this.selectedAnchor = null;
  this.scrollMonitor = true;
  this.appbarHeight = 50;
  this.baseLastScrollTop = 0;
  this.pageInfo = pageInfo;
  this.baseDiv = '#roamingGuide';

  this.tooltips = {};
  this.tooltipService = new Tw.TooltipService();

  this.bindEvents();
  new Tw.RoamingMenu(rootEl).install();
};

Tw.RoamingGuides.prototype = {
  bindEvents: function () {
    var proxy = this;
    this.$container.find('.qna .q').on('click', $.proxy(this._handleQna, this));
    this.$container.find('.links .link').on('click', $.proxy(this._handleLink, this));
    this.$container.find('#available .button').on('click', $.proxy(this.queryBaroAvailable, this));
    $(document).on('click', '#baroTariffs .appbar .close', function() {
      $('#baroTariffs').css('display', 'none');
      proxy.showBaseDiv();
    });
    $(document).on('click', '#baroTariffs .tabs .tab', function(e) {
      var tabId = e.currentTarget.getAttribute('data-tabid');
      proxy.selectBaroTab(tabId);
    });
    $(document).on('click', '.center .tabs .tab', function(e) {
      var tabId = e.currentTarget.getAttribute('data-tabid');
      $('.tabs .tab').removeClass('active');
      $('.tabs .tab.' + tabId).addClass('active');
      $('.tab-body').hide();
      $('#' + tabId).show();
    });
    this.$container.find('.tips .tip').on('click', $.proxy(this._handleTip, this));
    this.$container.find('#terminal').on('click', $.proxy(this.openTerminalActionSheet, this));
  },
  _handleQna: function(e) {
    this.toggleQna(e.currentTarget);
  },
  _handleLink: function(e) {
    var command = e.currentTarget.getAttribute('data-command');
    if (command === 'showCountries') {
      Tw.Popup.open({
        hbs: 'RM_16_02_01_01',
        title: Tw.POPUP_TITLE.ROAMING_SERVICE_COUNTRY
      });
      return false;
    }
    if (command === 'showTariffs') {
      this.showBaroTariffs();
    }
  },
  _handleTip: function(e) {
    var tipId = e.currentTarget.getAttribute('data-tip');
    this.showTip(e, tipId);
  },
  showTip: function (e, tipId) {
    this.tooltipService._openTip(this.tooltips[tipId], e.currentTarget);
  },
  collectTooltips: function (items) {
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      this.tooltips[item.mtwdTtipId] = {
        ttipTitNm: item.ttipTitNm,
        ttipCtt: item.ttipCtt,
        type: item.ttipPreTypCd
      };
    }
  },
  prepareTooltips: function () {
    var menuId = this.pageInfo.menuId;
    var proxy = this;
    Tw.Api.request(Tw.NODE_CMD.GET_TOOLTIP, {menuId: menuId}).done(function (r) {
      if (r.result && r.result.tooltip) proxy.collectTooltips(r.result.tooltip);
    });
  },
  showAnchor: function (target) {
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
  },
  prepareAnchorTabs: function () {
    var thresholdY = $('.anchors').offset().top - this.appbarHeight;
    var topMargin = this.appbarHeight + $('.anchors').height();

    var proxy = this;
    var as = $('.anchors a');
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      var anchorId = $(a).attr('href');
      var id = anchorId.substring(1);
      var anchor = document.getElementById(id);
      $(a).data('offset', {top: anchor.offsetTop, height: anchor.offsetHeight, topMargin: topMargin});
      $(a).data('meta', {id: id});
      $(a).on('click', function (e) {
        // var meta = $(e.target).data('meta');
        proxy.showAnchor(e.target);
        e.preventDefault();
      });
    }

    var anchorsHeight = $('.anchors').height();
    var anchors = $('.anchors');
    var shadow = $('.anchorsShadow');
    $(window).scroll(function () {
      if (!proxy.scrollMonitor) {
        return;
      }
      var scrollTop = $(window).scrollTop();
      if (scrollTop > thresholdY) {
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
        if (selectedA && proxy.selectedAnchor !== selectedA.href) {
          proxy.selectedAnchor = selectedA.href;
          $('.anchors a').removeClass('active');
          $(selectedA).addClass('active');
        }
      } else {
        var position = $('#contents').css('position');
        if (position === 'fixed') {
          // 팝업이 떠있는지 확인
          var tf = $('#contents').css('transform');
          var match = /([\-0-9]+)\)/.exec(tf);
          if (match) {
            var y = parseInt(match[1], 10);
            anchors.css({transform: 'translate(0px, ' + Math.abs(y) + 'px)', top: -10});
          }
        } else {
          anchors.css({position: 'static', transform: 'inherit'});
          shadow.css({display: 'none'});
        }
      }
    });
  },
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
  processSvcInfo: function (resp) {
    if (resp && resp.code === '00') {
      $('.available-result').css('display', 'none');
      Tw.Api.request(Tw.API_CMD.BFF_10_0182, {gubunCd: '01'}, {}, [])
        .done($.proxy(this.processBaroAvailable, this));
    } else {
      new Tw.TidLandingComponent().goLogin('/product/roaming/info/barocall');
    }
  },
  queryBaroAvailable: function() {
    Tw.Api.request(Tw.NODE_CMD.GET_SVC_INFO, {}).done($.proxy(this.processSvcInfo, this));
  },
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
  hideBaseDiv: function() {
    this.baseLastScrollTop = $(document).scrollTop();
    $(this.baseDiv).css('display', 'none');
  },
  showBaseDiv: function() {
    $(this.baseDiv).css('display', 'block');
    $(document).scrollTop(this.baseLastScrollTop);
  },
  showBaroTariffs: function() {
    this.hideBaseDiv();
    this.selectBaroTab('yes');
    $('#baroTariffs').css('display', 'block');
    return false;
  },
  selectBaroTab: function(tabId) {
    $('.tab').removeClass('active');
    $('.tab.' + tabId).addClass('active');

    // yes, no
    var list = '';
    var template = Handlebars.compile($('#tpl-tariff-list').html());
    if (tabId === 'yes') {
      var p = {
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
      var p = {
        items: [
          {name: '내집처럼 T로밍 중국'}
        ]
      };
      list += template(p);
    }
    $('#baroTariffs .tariffs').html(list);
  },
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
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="4"', txt: '인천공항 2터미널 1층' }
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
  onSelectCenter: function(e) {
    var centerId = Number($(e.target).parents('label').attr('id'));
    var centerName = $(e.target).parents('label').find('.txt').text();
    $('#terminal .txt').text(centerName);
    $('#currentCenter').html($('#center' + centerId).html());
    Tw.Popup.close();
    $('#terminal').focus(); // 액션시트 선택 후 강제 포커스(웹접근성)
  }
};

