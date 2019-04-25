/**
 * @file [이메일상담하기-카테고리선택]
 * @author Lee Kirim
 * @since 2018-10-26
 */

/**
 * @class 
 * @desc 이메일상담하기 카테고리 선택에 대한 이벤트들 
 * @param {Object} rootEl - 최상위 element Object
 */
Tw.CustomerEmailCategory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailCategory.prototype = {
  service: { depth1: 'CELL', depth2: '' }, // 서비스 카테고리 저장 초기 기본값 설정 핸드폰(CELL)
  quality: { depth1: '' }, // 품질 카테고리 

  _init: function () {
    this.service_category = Tw.CUSTOMER_EMAIL_SERVICE_CATEGORY; // 카테고리 리스트
    this.quality_category = Tw.CUSTOMER_EMAIL_QUALITY_CATEGORY; // 카테고리 리스트

    /**
     * 카테고리 정보 API 호출 this.category에 결과값 저장
     */
    this._apiService.request(Tw.API_CMD.BFF_08_0010, {})
      .done($.proxy(this._onLoadQuestionList, this));
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   */
  _cachedElement: function () {
    this.$select_service_depth1 = $('.fe-service_depth1'); // 서비스 > 1카테고리
    this.$select_service_depth2 = $('.fe-service_depth2'); // 서비스 > 2카테고리
    this.$select_quality_depth1 = $('.fe-quality_depth1'); // 품질 > 카테고리
    this.$wrap_tpl_faq = $('.fe-btn_faq'); // 자주하는 질문 버튼
    this.$wrap_service_category = this.$container.find('.fe-wrap-service-category'); // 서비스 카테고리 wrapper
    this.$wrap_quality_category = this.$container.find('.fe-wrap-quality-category'); // 품질 카테고리 wrapper
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service'); // 서비스 카테고리 콘텐츠(customer.email.html)
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality'); // 품질 카테고리 콘텐츠(customer.email.html)
  },

  /**
   * @function
   * @desc 이벤트 바인드 / 콘테이너에 이벤트를 주고 있어 새로 생성되는 객체에도 이벤트가 바인드 됨을 유의해야 함
   */
  _bindEvent: function () {
    this.$select_service_depth1.on('click', $.proxy(this._onClickService1Depth, this)); // 서비스 > 1카테고리 클릭이벤트
    this.$select_service_depth2.on('click', $.proxy(this._onClickService2Depth, this)); // 서비스 > 2카테고리 클릭이벤트
    this.$select_quality_depth1.on('click', $.proxy(this._onClickQuality1Depth, this)); // 품질 > 카테고릐 클릭이벤트
    this.$container.on('getCategory', $.proxy(this._getCurrentCategory, this)); // getCategory 카테고리 정보 반환
    this.$container.on('getTabIndex', $.proxy(this._getCurrentTab, this)); // getTabIndex 선택된 탭 index 구하기
  },

  /**
   * @function
   * @desc 카테고리 정보 API 호출 후 결과값 this.category에 저장
   * @param {JSON} res 
   */
  _onLoadQuestionList: function (res) {    
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.category = res.result;
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  /**
   * @function
   * @desc 1카테고리 선택 액션시트 열기 this.service_category 데이터를 베이스로 함
   * @param {event} e 
   */
  _onClickService1Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    /**
     * @function 
     * @desc 액션시트로 전달되는 값 설정
     * @param {object} item map 으로 전달되는 각 객체
     * @param {number} index 인덱스
     */
    var fnSelectLine = function (item, index) {
      return {
        txt: item.title, 
        'radio-attr': 'data-index="' + index + '" data-code="'+ item.category +'"' + (this.service.depth1 === item.category ? ' checked' : ''),
        'label-attr': ' '
      };
    };

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: this.service_category.map($.proxy(fnSelectLine, this)) }]
      },
      $.proxy(this._handleServiceChange1Depth, this),
      null, null,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 2카테고리 선택 액션시트 열기 this.service_category 데이터를 베이스로 함
   * @param {event} e 
   */
  _onClickService2Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    var sDepth1Category = this.$select_service_depth1.data('service-depth1');

    if ( sDepth1Category && this.category[sDepth1Category] ) {
      var service2DepthList = this.category[sDepth1Category];

    /**
     * @function 
     * @desc 액션시트로 전달되는 값 설정
     * @param {object} item map 으로 전달되는 각 객체
     * @param {number} index 인덱스
     */
      var fnSelectLine = function (item, index) {
        return {
          txt: item.ctgNm, 
          'radio-attr': 'data-index="' + index + '" data-code="'+ item.ofrCtgSeq +'"' + (this.service.depth2 === item.ofrCtgSeq ? ' checked' : ''),
          'label-attr': ' '
        };
      };

      this._popupService.open({
          hbs: 'actionsheet01',
          layer: true,
          // title: Tw.CUSTOMER_EMAIL.SELECT_SERVICE,
          btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
          data: [{
            list: service2DepthList.map($.proxy(fnSelectLine, this))
          }]
        },
        $.proxy(this._handleServiceChange2Depth, this),
        null, null, $(e.currentTarget)
      );
    }
  },

  /**
   * @function
   * @desc 2카테고리 선택 액션시트 열기 this.quality_category 데이터를 베이스로 함
   * @param {event} e 
   */
  _onClickQuality1Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    /**
     * @function 
     * @desc 액션시트로 전달되는 값 설정
     * @param {object} item map 으로 전달되는 각 객체
     * @param {number} index 인덱스
     */
    var fnSelectLine = function (item, index) {
      return {
        txt: item.title, 
        'radio-attr': 'data-index="' + index + '" data-code="'+ item.category +'"' + (this.quality.depth1 === item.category ? ' checked' : ''), 
        'label-attr': ' '
      };
    };

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: this.quality_category.map($.proxy(fnSelectLine, this)) }]
      },
      $.proxy(this._handleQualityChange1Depth, this),
      null, null, $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 서비스 > 1카테고리 선택 라디오 버튼 선택 이벤트
   * @param {element} $layer 
   */
  _handleServiceChange1Depth: function ($layer) {
    $layer.on('change', 'li input', $.proxy(this._onSelectService1Depth, this));
    this._onWebAccessPopup($layer); // 접근성 관련
  },

  /**
   * @function
   * @desc 서비스 > 2카테고리 선택 라디오 버튼 선택 이벤트
   * @param {element} $layer 
   */
  _handleServiceChange2Depth: function ($layer) {
    $layer.on('change', 'li input', $.proxy(this._onSelectService2Depth, this));
    this._onWebAccessPopup($layer); // 접근성 관련
  },

  /**
   * @function
   * @desc 품질 > 1카테고리 선택 라디오 버튼 선택 이벤트
   * @param {element} $layer 
   */
  _handleQualityChange1Depth: function ($layer) {
    $layer.on('change', 'li input', $.proxy(this._onSelectQuality1Depth, this));
    this._onWebAccessPopup($layer); // 접근성 관련
  },

  /**
   * @function [웹접근성]
   * @desc 카테고리 라디오버튼 클릭 
   */
  _onWebAccessPopup: function ($layer) {
    $layer.on('click', 'li', $.proxy(this._onCommonClickService, this));
    this._onCommonFocus($layer); // 접근성 관련
  },

  /**
   * @function
   * @desc IOS 팝업 초점이동 보완 카테고리 선택 액션시트로 초점가도록
   * @param {element} $layer 카테고리 선택 액션시트 엘리먼트 객체
   */
  _onCommonFocus: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); 
  },

  /**
   * @function [웹접근성]
   * @desc 카테고리 선택 레이어 라디오 버튼 선택 이벤트
   * @param {*} e 
   */
  _onCommonClickService: function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).siblings().find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true).trigger('change');
  },

  /**
   * @function
   * @desc 서비스 > 1카테고리 선택 이벤트
   * @param {event} e 
   */
  _onSelectService1Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    // 선택 카테고리 코드
    var sDepth1Value = $(e.currentTarget).data('code').toString(); 
    // 선택 카테고리 문구
    var sDepth1Text = $(e.currentTarget).parents('li').find('.txt').text();
    // 카테고리 선택 버튼 변경 볼드처리, 문구 변경, data 입력
    this.$select_service_depth1.addClass('tx-bold');
    this.$select_service_depth1.text(sDepth1Text);
    this.$select_service_depth1.data('service-depth1', sDepth1Value);
    this.service.depth1 = sDepth1Value; // 서비스 카테고리 prop

    // 선택된 카테고리가 휴대폰이나 인터넷일 경우 자주하는 질문 버튼 보임 or 숨김
    if ( sDepth1Value === 'CELL' || sDepth1Value === 'INTERNET' ) {
      this.$wrap_tpl_faq.show().attr('aria-hidden', false);
    } else {
      this.$wrap_tpl_faq.hide().attr('aria-hidden', true);
    }
    // 선택된 카테고리가 인터넷일 경우 안내문구 보임 or 숨김
    if ( sDepth1Value === 'INTERNET' ) {
      this.$wrap_service_category.find('.emailconsulting-wrap').show().attr('aria-hidden', false);
    } else {
      this.$wrap_service_category.find('.emailconsulting-wrap').hide().attr('aria-hidden', true);
    }

    // 선택된 2카테고리가 존재할 경우 초기화 
    var sDepth2Category = this.$select_service_depth2.data('service-depth2');
    if ( sDepth2Category ) {
      this.$select_service_depth2.removeClass('tx-bold');
      this.$select_service_depth2.text(Tw.CUSTOMER_EMAIL.SELECT_QUESTION);
      this.$select_service_depth2.data('service-depth2', null);
      this.service.depth2 = '';
    }

    // 카테고리 액션시트 변경
    this._popupService.close();

  },

  /**
   * @function
   * @desc 서비스 > 2카테고리 선택 이벤트
   * @param {event} e 
   */
  _onSelectService2Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    // 선택 카테고리 코드
    var sDepth2Value = $(e.currentTarget).data('code').toString();
    // 선택 카테고리 문구
    var sDepth2Text = $(e.currentTarget).parents('li').find('.txt').text();    
    // 카테고리 선택 버튼 변경 볼드처리, 문구변경, data 업데이트
    this.$select_service_depth2.addClass('tx-bold');
    this.$select_service_depth2.text(sDepth2Text);
    this.$select_service_depth2.data('service-depth2', sDepth2Value);
    this.service.depth2 = sDepth2Value; // 서비스 카테고리 prop

    // 두번째 카테고리 변경시 템플릿 변경 이벤트 trigger
    this.$container.trigger('changeServiceTemplate', this.service); // 해당 함수 customer.email.template.js 

    // 팝업닫기
    this._popupService.close();

  },

  /**
   * @function
   * @desc 품질 > 카테고리 선택 이벤트
   * @param {event} e 
   */
  _onSelectQuality1Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    // 선택 카테고리 코드
    var sDepth1Value = $(e.currentTarget).data('code').toString();
    // 선택 카테고리 문구
    var sDepth1Text = $(e.currentTarget).parents('li').find('.txt').text();    
    
    // 선택된 카테고리가 인터넷일경우 안내 문구 노출 or 비노출
    if ( sDepth1Value === 'internet' ) {
      this.$wrap_quality_category.find('.emailconsulting-wrap').show().attr('aria-hidden', false);
    } else {
      this.$wrap_quality_category.find('.emailconsulting-wrap').hide().attr('aria-hidden', true);
    }

    // 카테고리 선택 버튼 변경 볼드처리, 문구변경, data 업데이트
    this.$select_quality_depth1.addClass('tx-bold');
    this.$select_quality_depth1.text(sDepth1Text);
    this.$select_quality_depth1.data('quality-depth1', sDepth1Value);
    this.quality.depth1 = sDepth1Value; // 품질 카테고리 prop

    // 템플릿 변경 이벤트 trigger
    this.$container.trigger('changeQualityTemplate', {qualityCategory: this.quality}); // 해당 함수 customer.email.template.js 

    // 팝업닫기
    this._popupService.close();
  },

  /**
   * @function
   * @desc customer.email.service.option.js / customer.email.template.js 에서 호출됨
   * @returns {object} 카테고리 정보 반환
   */
  _getCurrentCategory: function () {
    var htCategory = {
      service: this.service,
      quality: this.quality
    };

    return htCategory;
  },

  /**
   * @function 
   * @desc 현재 선택된 탭의 index를 반환 customer.email.service.option.js 에서 호출
   * @returns {enum {0 1}} 0: 서비스 1: 품질
   */
  _getCurrentTab: function () {
    return $('[role=tablist]').find('[aria-selected=true]').index();
  }
};