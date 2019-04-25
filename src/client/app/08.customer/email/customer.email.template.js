/**
 * @file [이메일상담하기-템플릿교체]
 * @author Lee Kirim
 * @since 2018-10-29
 */

 /**
 * @class 
 * @desc 이메일상담하기 템플릿 교체에 대한 처리
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - customer.email.controller.ts 로 부터 전달되어 정보와 
 * - Tw.CustomerEmailUpload로 생성된 업로드객체(from customer.email.html 참조)
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
  /**
   * @function
   * @member 
   * @desc 객체 생성시 초기화에 필요한 것
   * @return {void}
   */
  _init: function () {
    this.tempTitle = '';
    this.tempContent = '';
    this.prevTemplate = ''; // 이전에 노출되고 있었던 템플릿 이름을 저장할 용도
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정 
   * customer.email.service.template.html
   * customer.email.quality.template.html
   * custmer.email.html 참조
   */
  _cachedElement: function () {
    // 서비스문의 wrapper
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    // 품질문의 wrapper
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');

    // service, quality template
    this.templateObj = {
      // 서비스문의
      tpl_service_cell: Handlebars.compile($('#tpl_service_cell').html()), // 휴대폰
      tpl_service_direct: Handlebars.compile($('#tpl_service_direct').html()), // 다이렉트 주문조회 케이스
      tpl_service_direct_brand: Handlebars.compile($('#tpl_service_direct_brand').html()), // 다이렉트 브랜드 선택 케이스
      tpl_service_internet: Handlebars.compile($('#tpl_service_internet').html()), // 인터넷
      tpl_service_chocolate: Handlebars.compile($('#tpl_service_chocolate').html()), // 초콜렛
      // 품질문의
      tpl_quality_cell: Handlebars.compile($('#tpl_quality_cell').html()), // 휴대폰
      tpl_quality_wibro: Handlebars.compile($('#tpl_quality_wibro').html()), // 와이브로 (현재 사용안됨)
      tpl_quality_internet: Handlebars.compile($('#tpl_quality_internet').html()), // 인터넷
      tpl_quality_phone: Handlebars.compile($('#tpl_quality_phone').html()) // 집전화
    }

    this.templateObj = this._addNameObj(this.templateObj); // 이름 추가 (해당 함수 참고)

    /**
     * @desc [서비스] 각 카테고리 명과 템플릿 명 매칭
     */
    this.serviceTemplateCase = {
      CELL: 'tpl_service_cell',
      CELL_MEMBER: 'tpl_service_cell', // 휴대폰 케이스에서 다른 템플릿 쓰는 케이스 따로 관리 (내용에 placeholder 값이 다름)
      INTERNET: 'tpl_service_internet',
      DIRECT_BRAND: 'tpl_service_direct_brand', // 다이렉트 케이스에서 브랜드 선택 케이스 따로 관리
      DIRECT: 'tpl_service_direct',
      CHOCO: 'tpl_service_chocolate',
    }

    /**
     * @desc [품질] 각 카테고리 명과 템플릿 명 매칭 
     */
    this.qualityTemplateCase = {
      cell: 'tpl_quality_cell',
      wibro: 'tpl_quality_wibro',
      internet: 'tpl_quality_internet',
      phone: 'tpl_quality_phone'
    }
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 서비스 템플릿 변경 이벤트 바인드
    this.$container.on('changeServiceTemplate', $.proxy(this._changeServiceTemplate, this));
    // 품질 템플릿 변경 이벤트 바인드
    this.$container.on('changeQualityTemplate', $.proxy(this._changeQualityTemplate, this));
    // 품질 템플릿 내 라디오 버튼 선택 이벤트 (선택에 따라 템플릿이 변경되어야 함)
    this.$container.on('click', '.fe-quality-inqSvcClCd li', $.proxy(this._onChangeQualityLineType, this));
  },

  /**
   * @function
   * @desc 서비스 상담 템플릿 변경
   * @param {event} e 
   * @param {object} serviceCategory { depth1: '', depth2: '' }
   */
  _changeServiceTemplate: function (e, serviceCategory) {
    e.stopPropagation();
    e.preventDefault();

    // 템플릿 변경 전 제목, 내용 value 값 저장 -> 템플릿 교체 후 value 값 채워넣을 용도
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
    
    // 템플릿 변경 후 제목, 내용 입력 
    this._afterChangeTemp(this.$wrap_tpl_service, Temp.tempName);

    // 현재 템플릿 이름 저장
    this.prevTemplate = Temp.tempName;

    skt_landing.widgets.widget_init(); // 기본 위젯 동작하도록
    Tw.Tooltip.separateInit(this.$wrap_tpl_service.find('.bt-link-tx')); // 툴팁 열리도록 

    // 등록하기 버튼 교체
    $('.fe-service-register', this.$container).removeClass('none').attr('aria-hidden', false).prop('disabled', true);
    $('.fe-quality-register', this.$container).addClass('none').attr('aria-hidden', true);

    // 파일첨부 초기화 
    this.uploadObj.initFiles();

    new Tw.InputFocusService(this.$container, $('.bt-fixed-area button', this.$container)); // 이동(엔터) 버튼으로 다음 input으로 움직이도록 
  },

  /**
   * @function
   * @desc 품질 상담 템플릿 변경
   * @param {event} e 
   * @param {object} opt  {qualityCategory: '', qualityType: { [isWibro or isPhone]: boolean }}
   */
  _changeQualityTemplate: function (e, opt) {
    e.stopPropagation();
    e.preventDefault();

    var qualityCategory = opt.qualityCategory || 'cell', // 기본선택값 cell 
        qualityType= opt.qualityType;

    // 템플릿 변경 전 제목, 내용 value 값 저장 -> 템플릿 교체 후 value 값 채워넣을 용도
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

    // 템플릿 변경 후 제목, 내용 입력 
    this._afterChangeTemp(this.$wrap_tpl_quality, qualityCategory.depth1);

    // 현재 템플릿 이름 저장
    this.prevTemplate = Temp;

    skt_landing.widgets.widget_init(); // 기본 위젯 동작하도록
    Tw.Tooltip.separateInit(this.$wrap_tpl_quality.find('.bt-link-tx')); // 툴팁 열리도록 

    // 등록하기 버튼 교체
    $('.fe-service-register', this.$container).addClass('none').attr('aria-hidden', true);
    $('.fe-quality-register', this.$container).removeClass('none').attr('aria-hidden', false).prop('disabled', true);

    // 파일첨부 초기화 
    this.uploadObj.initFiles();

    new Tw.InputFocusService(this.$container, $('.bt-fixed-area button', this.$container)); // 이동(엔터) 버튼으로 다음 input으로 움직이도록 
    
  },

  /**
   * @function
   * @desc 서비스 템플릿 이름 결정하기
   * @param {object} category {depth1:'', depth2:''}
   * @return {obejct} {tempName: '', add_obj: {} or {placeHolder:'', isDefaultValue: boolean}}
   */
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
     add_obj: add_obj // 템플릿 적용시 옵션
   }
  },

  /**
   * @function
   * @desc 품질 템플릿 이름 결정하기
   * @param {string} category 카테고리 이름
   * @param {object} type 하위 라디오버튼 선택여부 {[key: string]: boolean}
   * @return {string} 
   */
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

  /**
   * @function
   * @desc 템플릿 교체 전 입력되어 있던 제목, 내용 value값을 저장함
   * @param {element} $tempContainer 서비스 템플릿 wrapper or 품질 템플릿 wrapper
   */
  _beforeChangeTemp: function ($tempContainer) {
    // 제목
    this.tempTitle = $('.fe-text_title', $tempContainer).val();
    // 내용
    this.tempContent = $('.fe-text_content', $tempContainer).val();
  },

  /**
   * @function
   * @desc 템플릿 교체 후 저장되있던 입력 값 입력
   * @param {element} $tempContainer 
   * @param {string} tempName 
   */
  _afterChangeTemp: function($tempContainer, tempName) {
    // apply saved title - 제목 적용
    $('.fe-text_title', $tempContainer).val($('.fe-text_title', $tempContainer).val() || this.tempTitle);
    // apply saved content - 내용 적용
    if (this._isApplySavedContent(tempName)) {
      $('.fe-text_content', $tempContainer).val(this.tempContent);
    }

    // title, content init 초기화
    this.tempTitle = '';
    this.tempContent = '';
  },

  /**
   * @function
   * @desc  내용입력 추가 여부를 반환(예외케이스가 아닐때만)
   * @param {string} tempName 템플릿이름
   * @returns {boolean}
   */
  _isApplySavedContent: function (tempName) {
    // 예외케이스 (초콜렛은 모두 같은 케이스 & 멤버십 = 500275), 기본적용 콘텐츠가 있는 케이스
    // 기존입력value 유지 케이스
    // 이전이후가 같은 내용이있는 컨텐츠거나, 
    // 이전선택과 이후선택 서비스가 모두 기본제공 컨텐츠가 없는 경우에만 기존 입력 유지
    var prev = this.prevTemplate;
    var current = tempName;

    return (this._getContentCase(prev) === this._getContentCase(current) || 
        (!this._getContentCase(prev) && !this._getContentCase(current))); 
  },

  /**
   * @function
   * @desc 내용콘텐츠 입력 여부를 결정하기 위해 placeholder가 특정문구로 지정되어있는 템플릿일때 이름을 반환한다. 보통케이스에서는 null 반환
   * @param {name} tempName 템플릿이름
   * @returns {string | null}
   */
  _getContentCase: function (tempName) {
    return Tw.CUSTOMER_EMAIL_FILLED_CONTENT_CASE[tempName] || null;
  },

  /**
   * @function
   * @desc 서비스 > 1카테고리 [휴대폰] 케이스에서 2카테고리에 따라 내용 textarea의 placeholder값을 반환한다.
   * @param {object} serviceCategory {depth1:'', depth2:''}
   */
  _setTemplatePlaceholder: function (serviceCategory) {
    if ( serviceCategory.depth2 === '5000275' ) { // 멤버십 케이스 : 채워져있는 내용이 있음
      return Tw.CUSTOMER_EMAIL.MEMBERSHIP_PLACEHOLDER;
    } else {
      return Tw.CUSTOMER_EMAIL.DEFAULT_PLACEHOLDER;
    }
  },

  /**
   * @function
   * @desc 품질상담 내 라디오 버튼 선택시 템플릿 호출
   * @param {event} e 
   */
  _onChangeQualityLineType: function (e) {
    var nTabIndex = $(e.currentTarget).index() || 0;
    var category = this.$container.triggerHandler('getCategory');

    if ( category.quality.depth1 === 'cell' ) {
      // 0: 휴대폰 1: 와이브로 였으나 현재 와이브로 사용안함
      if ( nTabIndex === 0 ) {
        this.$container.trigger('changeQualityTemplate', {qualityCategory: category.quality, qualityType: { isWibro: false }});
      } else {
        this.$container.trigger('changeQualityTemplate', {qualityCategory: category.quality, qualityType: { isWibro: true }});
      }
    }

    if ( category.quality.depth1 === 'internet' ) {
      // 0: 인터넷 1: 집전화
      if ( nTabIndex === 0 ) {
        this.$container.trigger('changeQualityTemplate', {qualityCategory: category.quality, qualityType: { isPhone: false }});
      } else {
        this.$container.trigger('changeQualityTemplate', {qualityCategory: category.quality, qualityType: { isPhone: true }});
      }
    }
  },

  
  /**
   * @function
   * @desc object 속성이름 추가
   * {key : value, ...} 오브젝트를 {key: {name: key, temp: value}, ...} 형태로 변경해 반환
   * @param {object} obj {key : value, ...} 
   * @returns {object} {key: {name: key, temp: value}, ...}
   */
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