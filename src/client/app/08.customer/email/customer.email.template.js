/**
 * FileName: customer.email.template.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailTemplate = function (rootEl, data) {
  this.allSvc = data.allSvc;
  this.uploadObj = data.uploadObj;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailTemplate.prototype = {
  _init: function () {
    this.tempTitle = '';
    this.tempContent = '';
    this.prevServiceTemp = '';
    this.prevTopic = ''; // service or quality
    this.prevTabTemp = '';
  },

  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');

    // service, quality template
    this.tpl_service_cell = Handlebars.compile($('#tpl_service_cell').html());
    this.tpl_quality_cell = Handlebars.compile($('#tpl_quality_cell').html());
    this.tpl_quality_wibro = Handlebars.compile($('#tpl_quality_wibro').html());
    this.tpl_service_direct = Handlebars.compile($('#tpl_service_direct').html());
    this.tpl_service_direct_brand = Handlebars.compile($('#tpl_service_direct_brand').html());
    this.tpl_service_internet = Handlebars.compile($('#tpl_service_internet').html());
    this.tpl_service_chocolate = Handlebars.compile($('#tpl_service_chocolate').html());
    this.tpl_quality_internet = Handlebars.compile($('#tpl_quality_internet').html());
    this.tpl_quality_phone = Handlebars.compile($('#tpl_quality_phone').html());
  },

  _bindEvent: function () {
    this.$container.on('changeServiceTemplate', $.proxy(this._changeServiceTemplate, this));
    this.$container.on('changeQualityTemplate', $.proxy(this._changeQualityTemplate, this));
    this.$container.on('click', '.fe-quality-inqSvcClCd li', $.proxy(this._onChangeQualityLineType, this));
  },

  _changeServiceTemplate: function (e, serviceCategory) {
    e.stopPropagation();
    e.preventDefault();

    // before temp changed
    this._beforeChangeTemp(this.$wrap_tpl_service);

    // template channel change prevServiceTemp init
    if (this.prevTopic !== 'Service') {
      this.prevServiceTemp = this.prevTabTemp;
    } else {
      this.prevTabTemp = serviceCategory.depth2;
    }
    this.prevTopic = 'Service';

    // 같은카테고리 반복시에는 갱신 x
    if (this.prevServiceTemp === serviceCategory) {
      return ;
    }


    switch ( serviceCategory.depth1 ) {
      case 'CELL':
        var templatePlaceholder = this._setTemplatePlaceholder(serviceCategory);
        this.$wrap_tpl_service.html(this.tpl_service_cell({
          placeHolder: templatePlaceholder,
          isDefaultValue: templatePlaceholder === Tw.CUSTOMER_EMAIL.DEFAULT_PLACEHOLDER ? true : false
        }));
        break;
      case 'INTERNET':
        this.$wrap_tpl_service.html(this.tpl_service_internet());
        break;
      case 'DIRECT':
        if ( serviceCategory.depth2 === '07' || serviceCategory.depth2 === '10' ) {
          this.$wrap_tpl_service.html(this.tpl_service_direct_brand());
        } else {
          this.$wrap_tpl_service.html(this.tpl_service_direct());
        }
        break;
      case 'CHOCO':
        this.$wrap_tpl_service.html(this.tpl_service_chocolate());
        break;
      default:
        this.$wrap_tpl_service.html(this.tpl_service_cell());
    }

    // after temp changed
    this._afterChangeTemp(this.$wrap_tpl_service, serviceCategory.depth2);

    skt_landing.widgets.widget_init();
    Tw.Tooltip.separateInit(this.$wrap_tpl_service.find('.bt-link-tx'));

    $('.fe-service-register', this.$container).removeClass('none').attr('aria-hidden', false).prop('disabled', true);
    $('.fe-quality-register', this.$container).addClass('none').attr('aria-hidden', true);
    this.uploadObj.initFiles();

    new Tw.InputFocusService(this.$container, $('.bt-fixed-area button', this.$container)); // 이동 버튼으로 다음 입력으로 움직이도록 
  },

  _changeQualityTemplate: function (e, opt) {
    e.stopPropagation();
    e.preventDefault();

    var qualityCategory = opt.qualityCategory || 'cell', // 기본선택값 cell 
        qualityType= opt.qualityType;

    // before temp changed
    this._beforeChangeTemp(this.$wrap_tpl_quality);

    // template channel change prevServiceTemp init
    if (this.prevTopic !== 'Quality') {
      this.prevServiceTemp = this.prevTabTemp;
    } else {
      this.prevTabTemp = qualityType;
    }
    this.prevTopic = 'Quality';

    // 같은카테고리 반복시에는 갱신 x
    if (this.prevServiceTemp === qualityType ) {
      return ;
    }

    switch ( qualityCategory.depth1 ) {
      case 'cell':
        if ( qualityType && qualityType.isWibro ) {
          this.$wrap_tpl_quality.html(this.tpl_quality_wibro());
        } else {
          this.$wrap_tpl_quality.html(this.tpl_quality_cell());
        }
        break;
      case 'internet':
        if ( qualityType && qualityType.isPhone ) {
          this.$wrap_tpl_quality.html(this.tpl_quality_phone());
        } else {          
          this.$wrap_tpl_quality.html(this.tpl_quality_internet());
        }
        break;
      default:
        this.$wrap_tpl_quality.html(this.tpl_quality_cell());
    }

    // after temp changed
    this._afterChangeTemp(this.$wrap_tpl_quality, qualityCategory.depth1);

    skt_landing.widgets.widget_init();
    // skt_landing.widgets.widget_radio(this.$wrap_tpl_quality);
    Tw.Tooltip.separateInit(this.$wrap_tpl_quality.find('.bt-link-tx'));

    $('.fe-service-register', this.$container).addClass('none').attr('aria-hidden', true);
    $('.fe-quality-register', this.$container).removeClass('none').attr('aria-hidden', false).prop('disabled', true);
    this.uploadObj.initFiles();

    new Tw.InputFocusService(this.$container, $('.bt-fixed-area button', this.$container)); // 이동 버튼으로 다음 입력으로 움직이도록 
    
  },


  // before change templete save title, content
  _beforeChangeTemp: function ($tempContainer) {
    this.tempTitle = $('.fe-text_title', $tempContainer).val();
    this.tempContent = $('.fe-text_content', $tempContainer).val();
  },

  // after change templete enter saved title, content 
  _afterChangeTemp: function($tempContainer, currentService) {
    // apply saved title 
    $('.fe-text_title', $tempContainer).val($('.fe-text_title', $tempContainer).val() || this.tempTitle);
    // apply saved content
    if (this._isApplySavedContent(currentService)) {
      $('.fe-text_content', $tempContainer).val(this.tempContent);
    }

    // title, content init
    this.tempTitle = '';
    this.tempContent = '';
    // prev Templete save
    this.prevServiceTemp = currentService;
  },

  // 예외케이스 적용 후 콘텐츠 추가
  _isApplySavedContent: function (currentSevice) {
    // 예외케이스, 기본적용 콘텐츠가 있는 케이스 (초콜렛은 모두 같은 케이스 & 멤버십 = 500275)
    // 기존입력value 유지 케이스
    // 이전이후가 같은 내용이있는 컨텐츠거나, 
    // 이전선택과 이후선택 서비스가 모두 기본제공 컨텐츠가 없는 경우에만 기존 입력 유지
    var prev = this.prevServiceTemp;
    var current = currentSevice;

    return (this._getContentCase(prev) === this._getContentCase(current) || 
        (!this._getContentCase(prev) && !this._getContentCase(current))); 
  },

  _getContentCase: function (serviceCategory) {
    return Tw.CUSTOMER_EMAIL_FILLED_CONTENT_CASE[serviceCategory] || null;
  },


  _setTemplatePlaceholder: function (serviceCategory) {
    if ( serviceCategory.depth2 === '5000275' ) { // 멤버십 케이스 : 채워져있는 내용이 있음
      return Tw.CUSTOMER_EMAIL.MEMBERSHIP_PLACEHOLDER;
    } else {
      return Tw.CUSTOMER_EMAIL.DEFAULT_PLACEHOLDER;
    }
  },

  _onChangeQualityLineType: function (e) {
    var nTabIndex = $(e.currentTarget).index() || 0;
    var category = this.$container.triggerHandler('getCategory');

    if ( category.quality.depth1 === 'cell' ) {
      if ( nTabIndex === 0 ) {
        this.$container.trigger('changeQualityTemplate', {qualityCategory: category.quality, qualityType: { isWibro: false }});
      } else {
        this.$container.trigger('changeQualityTemplate', {qualityCategory: category.quality, qualityType: { isWibro: true }});
      }
    }

    if ( category.quality.depth1 === 'internet' ) {
      if ( nTabIndex === 0 ) {
        this.$container.trigger('changeQualityTemplate', {qualityCategory: category.quality, qualityType: { isPhone: false }});
      } else {
        this.$container.trigger('changeQualityTemplate', {qualityCategory: category.quality, qualityType: { isPhone: true }});
      }
    }
  }
};