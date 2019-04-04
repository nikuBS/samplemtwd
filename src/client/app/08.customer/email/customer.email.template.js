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
    this.prevTemplate = '';
    this.prevTopic = ''; // service or quality
    this.prevTabTemp = '';
  },

  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');

    // service, quality template
    this.templateObj = {
      tpl_service_cell: Handlebars.compile($('#tpl_service_cell').html()),
      tpl_service_direct: Handlebars.compile($('#tpl_service_direct').html()),
      tpl_service_direct_brand: Handlebars.compile($('#tpl_service_direct_brand').html()),
      tpl_service_internet: Handlebars.compile($('#tpl_service_internet').html()),
      tpl_service_chocolate: Handlebars.compile($('#tpl_service_chocolate').html()),
      tpl_quality_cell: Handlebars.compile($('#tpl_quality_cell').html()),
      tpl_quality_wibro: Handlebars.compile($('#tpl_quality_wibro').html()),
      tpl_quality_internet: Handlebars.compile($('#tpl_quality_internet').html()),
      tpl_quality_phone: Handlebars.compile($('#tpl_quality_phone').html())
    }

    this.templateObj = this._addNameObj(this.templateObj); // 이름 추가

    this.serviceTemplateCase = {
      CELL: 'tpl_service_cell',
      CELL_MEMBER: 'tpl_service_cell',
      INTERNET: 'tpl_service_internet',
      DIRECT_BRAND: 'tpl_service_direct_brand',
      DIRECT: 'tpl_service_direct',
      CHOCO: 'tpl_service_chocolate',
    }

    this.qualityTemplateCase = {
      cell: 'tpl_quality_cell',
      wibro: 'tpl_quality_wibro',
      internet: 'tpl_quality_internet',
      phone: 'tpl_quality_phone'
    }
  },

  _bindEvent: function () {
    this.$container.on('changeServiceTemplate', $.proxy(this._changeServiceTemplate, this));
    this.$container.on('changeQualityTemplate', $.proxy(this._changeQualityTemplate, this));
    this.$container.on('click', '.fe-quality-inqSvcClCd li', $.proxy(this._onChangeQualityLineType, this));
  },

  // 서비스 상담 템플릿 선택
  _changeServiceTemplate: function (e, serviceCategory) {
    e.stopPropagation();
    e.preventDefault();

    // before temp changed set prev title, contents
    this._beforeChangeTemp(this.$wrap_tpl_service);

    // 변경할 템플릿 정보 얻기
    var Temp = this._getServiceTemplate(serviceCategory);
    
    // 이전 템플릿과 현재 템플릿이 같으면 return 
    if (this.prevTemplate === Temp.tempName) {
      return ;
    }

    // 템플릿
    this.$wrap_tpl_service.html(
      // 템플릿 오브젝트 [템플릿 이름]
      this.templateObj[this.serviceTemplateCase[Temp.tempName]].temp(Temp.add_obj)
    );
    
    // after temp changed
    this._afterChangeTemp(this.$wrap_tpl_service, Temp.tempName);

    // 현재 템플릿 이름 저장
    this.prevTemplate = Temp.tempName;

    skt_landing.widgets.widget_init(); // 기본 위젯 동작하도록
    Tw.Tooltip.separateInit(this.$wrap_tpl_service.find('.bt-link-tx')); // 툴팁 열리도록 

    // 버튼 교체
    $('.fe-service-register', this.$container).removeClass('none').attr('aria-hidden', false).prop('disabled', true);
    $('.fe-quality-register', this.$container).addClass('none').attr('aria-hidden', true);

    // 파일첨부 초기화 
    this.uploadObj.initFiles();

    new Tw.InputFocusService(this.$container, $('.bt-fixed-area button', this.$container)); // 이동 버튼으로 다음 입력으로 움직이도록 
  },

  // 품질 상담 템플릿 선택
  _changeQualityTemplate: function (e, opt) {
    e.stopPropagation();
    e.preventDefault();

    var qualityCategory = opt.qualityCategory || 'cell', // 기본선택값 cell 
        qualityType= opt.qualityType;

    // before temp changed
    this._beforeChangeTemp(this.$wrap_tpl_quality);

    // 변경할 템플릿 정보 얻기
    var Temp = this._getQualityTemplate(qualityCategory.depth1, qualityType);

    // 이전 템플릿과 현재 템플릿이 같으면 return 
    if (this.prevTemplate === Temp) {
      return ;
    }

    // 템플릿
    this.$wrap_tpl_quality.html(
      // 템플릿 오브젝트 [템플릿 이름]
      this.templateObj[this.qualityTemplateCase[Temp]].temp()
    );

    // after temp changed
    this._afterChangeTemp(this.$wrap_tpl_quality, qualityCategory.depth1);

    // 현재 템플릿 이름 저장
    this.prevTemplate = Temp;

    skt_landing.widgets.widget_init(); // 기본 위젯 동작하도록
    Tw.Tooltip.separateInit(this.$wrap_tpl_quality.find('.bt-link-tx')); // 툴팁 열리도록 

    // 버튼 교체
    $('.fe-service-register', this.$container).addClass('none').attr('aria-hidden', true);
    $('.fe-quality-register', this.$container).removeClass('none').attr('aria-hidden', false).prop('disabled', true);

    // 파일첨부 초기화 
    this.uploadObj.initFiles();

    new Tw.InputFocusService(this.$container, $('.bt-fixed-area button', this.$container)); // 이동 버튼으로 다음 입력으로 움직이도록 
    
  },

  // 서비스 템플릿 이름 결정하기
  _getServiceTemplate: function (category) {
   // get cur temp
   var tempName = category.depth1;
   var add_obj = {};

   // 예외 케이스 핸드폰
   if (tempName === "CELL") {
     var contentPlaceHolder = this._setTemplatePlaceholder(category);
     if (contentPlaceHolder !== Tw.CUSTOMER_EMAIL.DEFAULT_PLACEHOLDER) {
       tempName = "CELL_MEMBER";
     } 
     add_obj = {
       placeHolder: contentPlaceHolder,
       isDefaultValue: tempName === "CELL"
     }
   }

   // 예외 케이스 다이렉트 샵 
   if (tempName === 'DIRECT' && (category.depth2 === '07' || category.depth2 === '10')) {
     tempName = 'DIRECT_BRAND';
   }

   if (!this.serviceTemplateCase[tempName]) {
     tempName = 'CELL';
   }

   return {
     tempName: tempName, // 템플릿 이름
     add_obj: add_obj // 템플릿 호출시 옵션
   }
  },

  // 품질 템플릿 이름 결정하기
  _getQualityTemplate: function (category, type) {
    if (category === 'cell') {
      if (type && type.isWibro) {
        return 'wibro';
      } else {
        return 'cell';
      }
    } else if (category === 'internet') {
      if (type && type.isPhone) {
        return 'phone';
      } else {
        return 'internet';
      }
    } else {
      return 'cell';
    }
  },

  // before change templete save title, content
  _beforeChangeTemp: function ($tempContainer) {
    this.tempTitle = $('.fe-text_title', $tempContainer).val();
    this.tempContent = $('.fe-text_content', $tempContainer).val();
  },

  // after change templete enter saved title, content 
  _afterChangeTemp: function($tempContainer, tempName) {
    // apply saved title 
    $('.fe-text_title', $tempContainer).val($('.fe-text_title', $tempContainer).val() || this.tempTitle);
    // apply saved content
    if (this._isApplySavedContent(tempName)) {
      $('.fe-text_content', $tempContainer).val(this.tempContent);
    }

    // title, content init
    this.tempTitle = '';
    this.tempContent = '';
  },

  // 예외케이스 적용 후 콘텐츠 추가
  _isApplySavedContent: function (tempName) {
    // 예외케이스, 기본적용 콘텐츠가 있는 케이스 (초콜렛은 모두 같은 케이스 & 멤버십 = 500275)
    // 기존입력value 유지 케이스
    // 이전이후가 같은 내용이있는 컨텐츠거나, 
    // 이전선택과 이후선택 서비스가 모두 기본제공 컨텐츠가 없는 경우에만 기존 입력 유지
    var prev = this.prevTemplate;
    var current = tempName;

    return (this._getContentCase(prev) === this._getContentCase(current) || 
        (!this._getContentCase(prev) && !this._getContentCase(current))); 
  },

  _getContentCase: function (tempName) {
    return Tw.CUSTOMER_EMAIL_FILLED_CONTENT_CASE[tempName] || null;
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
  },

  // object 속성이름 추가
  _addNameObj: function (obj) {
    for (var i in obj) {
      obj[i] = {
        name: i,
        temp: obj[i]
      }
    }
    return obj;
  }
};