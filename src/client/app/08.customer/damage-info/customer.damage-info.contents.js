/**
 * 이용안내 > 이용자피해예방센터 > 콘텐츠 페이지
 * @file customer.damage-info.contents.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.12.06
 */

Tw.CustomerDamageInfoContents = function(rootEl) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 공통 모듈 설정
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  // 이벤트 바인딩
  this._bindEvent();
  this._init();
};

Tw.CustomerDamageInfoContents.prototype = {

  _init: function() {
    Tw.CommonHelper.replaceExternalLinkTarget(this.$container);
  },

  _bindEvent: function() {
    this.$container.on('click', '.fe-idpt_pop', $.proxy(this._openPop, this));  // 레이어 팝업 공통 처리
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));  // 외부 링크 처리
    this.$container.on('click', '.fe-back', $.proxy(this._goBack, this)); // 뒤로가기 처리

    this._bindUIEvent(this.$container); // Pub 에서 전달한 이벤트 스크립트 소스.
  },

  _bindUIEvent: function($container) {
    // tab
    $container.find('.idpt-tab').each(function(){
      var tabBtn = $(this).find('li');
      $(tabBtn).on('click', function(){
        var i = $(this).index();
        $container.find('.idpt-tab > li').removeClass('on').eq(i).addClass('on');
        $container.find('.idpt-tab-content').removeClass('show').eq(i).addClass('show');
      });
    });

    // tooltip
    $container.find('.info-tooltip').each(function(){
      $container.find('.btn-tooltip-open').on('click', function(){
        var remStandard = $('body').css('font-size').replace('px','');
        var btnLeft = $(this).offset().left - 28;
        var btnRem = btnLeft/remStandard;
        $container.find('.idpt-tooltip-layer').css('left', btnRem + 'rem');
        $(this).next('div').show().attr('aria-hidden', 'false');
      });
    });

    $container.find('.btn-tooltip-close').on('click', function(){
      $container.find('.idpt-tooltip-layer').hide().attr('aria-hidden', 'true');
    });

    // accordian
    $container.find('.idpt-accordian > li > a').on('click', function(){
      $container.find('.idpt-accordian > li > a').removeClass('open').attr('aria-pressed', 'false');
      $container.find('.idpt-accordian-cont').slideUp();
      if ($(this).parent().find('.idpt-accordian-cont').is(':hidden')){
        $(this).addClass('open');
        $(this).parent().find('.idpt-accordian-cont').slideDown();
        $(this).attr('aria-pressed', 'true');
      }
    });

    // toggle (FAQ)
    $container.find('.idpt-toggle-btn').each(function(){
      $(this).on('click', function(){
        $(this).toggleClass('open').next('.idpt-toggle-cont').slideToggle();
        if ($(this).hasClass('open')){
          $(this).attr('aria-pressed', 'true');
        } else {
          $(this).attr('aria-pressed', 'false');
        }
      });
    });
  },

  // 뒤로 가기 처리
  _goBack: function() {
    this._historyService.goBack();
  },

  // 외부 링크 연결 처리
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var $elem = $(e.currentTarget),
      elemHref = $elem.attr('href');

    // 모웹이면 과금팝업 띄워줄 필요 없으니 바로 연결
    if (!Tw.BrowserHelper.isApp() || $elem.hasClass('fe-no_msg')) {
      return this._openExternalUrl(elemHref);
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, elemHref));
  },

  // 외부 링크 연결
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  },

  // 레이어 팝업 공통 처리
  _openPop: function(e) {
    this._popupService.open({
      hbs: 'idpt_' + $(e.currentTarget).data('pop')
    }, $.proxy(this._bindPop, this), null, 'idpt_pop', $(e.currentTarget));
  },

  // 레이어 팝업 띄운 후 이벤트 바인딩
  _bindPop: function($popupContainer) {
    this._bindUIEvent($popupContainer);
  }

};