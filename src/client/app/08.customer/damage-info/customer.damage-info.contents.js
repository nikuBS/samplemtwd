/**
 * FileName: customer.damage-info.contents.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.12.06
 */

Tw.CustomerDamageInfoContents = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._bindEvent();
};

Tw.CustomerDamageInfoContents.prototype = {

  _bindEvent: function() {
    this.$container.on('click', '.fe-idpt_pop', $.proxy(this._openPop, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));
    this.$container.on('click', '.fe-link-internal', $.proxy(this._openInternalUrl, this));

    this._bindUIEvent(this.$container);
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
        $(this).next('div').show();
      });
    });

    $container.find('.btn-tooltip-close').on('click', function(){
      $container.find('.idpt-tooltip-layer').hide();
    });

    // accordian
    $container.find('.idpt-accordian > li > a').on('click', function(){
      $container.find('.idpt-accordian > li > a').removeClass('open');
      $container.find('.idpt-accordian-cont').slideUp();
      if ($(this).parent().find('.idpt-accordian-cont').is(':hidden')){
        $(this).addClass('open');
        $(this).parent().find('.idpt-accordian-cont').slideDown();
      }
    });

    // toggle (FAQ)
    $container.find('.idpt-toggle-btn').each(function(){
      $(this).on('click', function(){
        $(this).toggleClass('open').next('.idpt-toggle-cont').slideToggle();
      });
    });
  },

  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  _openExternalUrl: function(href) {
    this._popupService.close();
    Tw.CommonHelper.openUrlExternal(href);
  },

  _openInternalUrl: function(e) {
    Tw.CommonHelper.openUrlInApp($(e.currentTarget).attr('href'));

    e.preventDefault();
    e.stopPropagation();
  },

  _openPop: function(e) {
    this._popupService.open({
      hbs: 'idpt_' + $(e.currentTarget).data('pop')
    }, $.proxy(this._bindPop, this), null, 'idpt_pop');
  },

  _bindPop: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_popup_close', $.proxy(this._closePop, this));
    this._bindUIEvent($popupContainer);
  },

  _closePop: function() {
    this._popupService.close();
  }

};