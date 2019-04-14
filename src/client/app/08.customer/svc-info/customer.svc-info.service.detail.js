/**
 * @file [이용안내-서비스_이용안내-상세페이지]
 * @author Lee Kirim
 * @since 2018-12-20
 */

/**
 * @class 
 * @desc 이용안내 서비스 이용안내 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - customer.svc-info.service.detail.controlloer.ts 로 부터 전달되어 온 정보
 */
Tw.CustomerSvcinfoServiceDetail = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._init();
  this._cachedElement();
  this._bindEvent();

};

Tw.CustomerSvcinfoServiceDetail.prototype = {
  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 처음 처리
   * @return {void}
   */
  _init: function () {
    this.rootPathName = this._historyService.pathname; // 페이지 주소
    this.queryParams = Tw.UrlHelper.getQueryParams(); // 쿼리로 받아온 값 code
    this._addExternalTitle();  // 새창열림 타이틀 넣기
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - customer.svc-info.service.detail.html 참고
   */
  _cachedElement: function () {
    this.$selectBtn = this.$container.find('.btn-dropdown'); // 카테고리 선택하기 버튼
    this.$defineUSIMBtn = this.$container.find('#fe-btn-define-usim'); //용어정리 버튼(유심)
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 카테고리 선택하기
    this.$selectBtn.on('click', $.proxy(this._typeActionSheetOpen, this));
    // from html DOM 주요용어 바로가기
    this.$defineUSIMBtn.on('click', $.proxy(this._USIMInfoCall, this));

    // 링크이동
    this.$container.on('click', '.fe-link-external:not([href^="#"])', $.proxy(this._openExternalUrl, this));
    this.$container.on('click', '.fe-link-internal:not([href^="#"])', $.proxy(this._openInternalUrl, this));
    this.$container.on('click', '.fe-link-inapp:not([href^="#"])', $.proxy(this._openInApp, this));

    // admin 제공된 tooltip 정보
    this.$container.on('click', '.btn-tooltip-open', $.proxy(this._openTooltipPop, this));
    this.$container.on('click', '.info-tooltip>p', $.proxy(this._openTooltipPop, this));

    // admin 제공 팝업
    this.$container.on('click', '.idpt-popup-open', $.proxy(this._openPagePop, this));
    
    // from idpt
    this._bindUIEvent(this.$container);
  },

  /**
   * @method
   * @return {void}
   * @desc [웹접근성] 관련
   * 어드민에서 받아온 html 콘텐츠에서 외부링크 존재 시 title 속성이 없으면 "새창열림" title 삽입
   */
  _addExternalTitle: function () {
    this.$container.find('.fe-link-external:not([href^="#"])').each(function(_ind, target){
      if(!$(target).attr('title')) {
        $(target).attr('title', Tw.COMMON_STRING.OPEN_NEW_TAB);
      }
    });
  },

  /**
   * @desc 외부이동링크 
   * @param {event} e 
   */
  _openExternalUrl: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.close();
    Tw.CommonHelper.openUrlExternal($(e.currentTarget).attr('href'));
  },

  /**
   * @desc 내부이동링크
   * @param {event} e 
   */
  _openInternalUrl: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._historyService.goLoad(location.origin + $(e.currentTarget).attr('href'));
  },

  /**
   * @desc 인앱이동 링크
   * @param {event} e 
   */
  _openInApp: function (e) {
    e.preventDefault();
    e.stopPropagation();

    Tw.CommonHelper.openUrlInApp(location.origin + $(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 카테고리 선택하기
   */
  _typeActionSheetOpen: function (e) {
    /**
     * @function 
     * @param {Object} {hbs: hbs 의 파일명, layer: 레이어 여부, title: 액션시트 제목, data: 데이터 리스트, btnfloating: {txt: 닫기버튼 문구, attr: 닫기버튼 attribute, class: 닫기버튼 클래스}}
     * @param {function} function_open_call_back 액션시트 연 후 호출 할 function
     * @param {function} function_close_call_back 액션시트 닫힌 후 호출할 function
     * @param {string} 액션시트 열 때 지정할 해쉬값, 기본값 popup{n}
     * @param {Object} $target 액션시트 닫힐 때 포커스 될 엘리먼트 여기에서는 카테고리 선택 버튼
     * @desc 라디오 선택 콤보박스 형태
     */
    this._popupService.open({
        hbs: 'actionsheet01',// hbs의 파일명
        layer: true,
        title: null,
        data: this._getOptions(this.data.list),
        btnfloating: {
          txt: Tw.BUTTON_LABEL.CLOSE,
          'class': 'tw-popup-closeBtn'
        }
      }, 
      $.proxy(this._ActionSheetBindEvent, this), 
      null,
      null,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 해당 리스트에서 액션시트 형식에 맞도록 반환 (dep_list 에서 추출)
   * @param {array} arr 
   * @return {object}
   */
  _getOptions: function (arr) {
    return {
      data: {
        list: arr.map(function(el){
          return {
            txt: el.dep_title,
            // option: 'checked', 
            'radio-attr': 'name="selectType" value="'+ el.code +'" id="radio'+el.code+'"',
            'label-attr': 'for="radio'+el.code+'"'
          };
        })
      }
    };
  },

  /**
   * @function
   * @desc 카테고리 선택 액션시트 불러와 진 후 callback function 
   * 현재 선택된 카테고리에 체크 표시, 라디오 버튼 클릭 이벤트 바인드
   * @param {element} $container 
   */
  _ActionSheetBindEvent: function ($container) {
    this.$selectButtons = $container.find('.ac-list>li');
    
    // 현재 값 선택 (checked)
    var code = this.queryParams.code;
    this.$selectButtons.find('input').filter(function(){
      return $(this).val() === code;
    }).prop('checked', true);
    
    // 라디오 선택 이벤트 바인드
    this.$selectButtons.on('click', $.proxy(this._setActionSheetValue, this));

    $container.find('.ac-list>li label').on('click', $.proxy(this._noDefaultEvent, this));
  },

  _noDefaultEvent: function(e) {
    e.preventDefault();
  },

  _setActionSheetValue: function (e) {
    // check
    this.$selectButtons.find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true);

    // move 
    this._moveDetailPage( $(e.currentTarget).find('input').val() );
  },

  /**
   * @function
   * @desc 상세페이지로 이동 쿼리로 code 전달 (상세페이지에서 해당 code를 API 로 전달함)
   * code 에 url: 이 있을때는 상세가 아닌 url 로 이동 
   * @param {string} code 
   */
  _moveDetailPage: function (code) {
    var targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    
    this._popupService.closeAllAndGo(targetURL + '?code=' + code);
  },

  // 유심용어 정리 바로가기 액션시트 start
  _USIMInfoCall: function (e) {
    e.preventDefault();
    this._apiService.request(Tw.API_CMD.BFF_08_0064, {}, {}, ['C00046'])
      .done($.proxy(this._USIMActionSheetOpen, this))
      .fail($.proxy(this._apiError, this, $(e.currentTarget)));
  },

  /**
   * @desc API 호출 응답받았을 때 팝업 호출
   * @param {JSON} data 
   */
  _USIMActionSheetOpen: function (data) {

    if ( data.code !== Tw.API_CODE.CODE_00 ) {
      return this._apiError(this.$defineUSIMBtn, data);
    }

    this._popupService.open({
        hbs: 'CS_07_02',
        contentHTML: data.result.icntsCtt
      },
      $.proxy(this._USIMActionSheetEvent, this), 
      null, 
      this._setPopupHash('usimDefine'),
      this.$defineUSIMBtn
    );
  },

  /**
   * @function
   * @desc 팝업열려는 해쉬값과 같으면 네이밍 변경(팝업이 안닫히는 이슈 해결)
   */
  _setPopupHash: function(hashName) {
    var curHash = this._historyService.getHash(); // #hashName_P 로 받아옴
    return (curHash.indexOf(hashName) === 1  ? 're' : '') + hashName; 
  },

  /**
   * @function callback
   * @desc 유심용어정리 팝업 열린 후 이벤트 및 객체 저장
   * @param {element} $container 유심용어정리 팝업 객체
   */
  _USIMActionSheetEvent: function ($container) {
    this.usimContentIndex = 0; // 초기화 
    this.$USIMContentsContainer = $container;
    this.$USIMSelectBtn = $container.find('.btn-dropdown'); // 유심정리 탭 선택
    this.$USIMSelectBtn.text(Tw.CUSTOMER_SERVICE_INFO_USIM_DEFINE.data.list[0].txt);
    this.$USIMSelectBtn.on('click', $.proxy(this._USIMSelect, this)); // 용어정리 카테고리 셀렉트 클릭 이벤트
  },

  /**
   * @function 
   * @desc 용어정리 탭 내 셀렉트 액션시트
   */
  _USIMSelect: function (e) {
    this._popupService.open({
        hbs: 'actionsheet01',// hbs의 파일명
        layer: true,
        title: null,
        data: Tw.CUSTOMER_SERVICE_INFO_USIM_DEFINE,
        btnfloating: {
          txt: Tw.BUTTON_LABEL.CLOSE,
          'class': 'tw-popup-closeBtn'
        }
      }, 
      $.proxy(this._USIMSelectBindEvent, this), 
      null, null,
      $(e.currentTarget)
    );
  },

  /**
   * @function callback
   * @desc 시트 열린 후 callback
   * @param {element} $selectContainer 유심용어정리 카테고리 액션시트 DOM 객체
   */
  _USIMSelectBindEvent: function ($selectContainer) {
    this.$USIMSelectLists = $selectContainer.find('.ac-list>li');
    this.$USIMSelectClostBtn = $selectContainer.find('.tw-popup-closeBtn');
    this.$USIMSelectLists.on('click', $.proxy(this._selectUSIMmenu, this));

    this.$USIMSelectLists.eq(this.usimContentIndex || 0).find('input').prop('checked', true);
  },

  /**
   * @desc 유심용어 정리 카테고리 선택시 교체
   * 유심용어 정리 등록 콘텐츠에 내용 모두 가져오고 선택된 카테고리 보이거나 가리는 방식으로 구현되어있음
   * @param {event} e 
   */
  _selectUSIMmenu: function (e) {
    this.usimContentIndex = parseFloat($(e.currentTarget).find('input').val()) -1;
    this.$USIMSelectLists.find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true);
    this.$USIMSelectBtn.text($(e.currentTarget).find('.txt').text());
    // 해당 컨텐츠 내용을 가리고 보이기 처리
    this.$USIMContentsContainer.find('.fe-usim-info').eq(this.usimContentIndex).show().siblings('.fe-usim-info').hide();
    // 팝업닫기
    this.$USIMSelectClostBtn.click();
  },
  // 유심용어 정리 바로가기 액션시트 end

  /**
   * @function 
   * @desc 어드민 등록 콘텐츠에서 필요한 액션 정의 from idpt
   * @param {element} $container 최상위 객체
   */
  _bindUIEvent: function ($container) {
    /**
     * @desc 탭버튼 클릭시 활성화 클래스
     */
    $('.idpt-tab', $container).each(function(){
      var tabBtn = $(this).find('li');
      $(tabBtn).click(function(){
        var i = $(this).index();
        $('.idpt-tab > li').removeClass('on').eq(i).addClass('on');
        $('.idpt-tab-content').removeClass('show').eq(i).addClass('show');
      });
    });

    /**
     * @desc 팝업 동작 해당 액션 사용하지 않음 (혹시 필요할 수 있어 남겨 둠)
     * 팝업은 히스토리 관리가 필요해 공통팝업으로 교체하도록 처리함
     */
    $('.idpt-tab-wrap', $container).each(function(){
      var $tabContents = $('.tab-contents', $(this));
      $('.tab-menu li', $(this)).each(function(index){
        var $tabBtn = $(this);
        $tabBtn.click(function(){
          $tabBtn.addClass('on').siblings().removeClass('on');
          $tabContents.removeClass('show');
          $tabContents.eq(index).addClass('show');
        });
      });
    });
  
    /**
     * 라디오 버튼 클릭이벤트 사용하지 않음 (혹시 필요할 수 있어 남겨 둠)
     */
    $('input[type=radio][name=call]', $container).on('click', function() {
      var chkValue = $('input[type=radio][name=call]:checked', $container).val();
      if (chkValue === '1') {
        $('.call-cont01').css('display', 'block');
        $('.call-cont02').css('display', 'none');
      } else if (chkValue  === '2') {
        $('.call-cont01').css('display', 'none');
        $('.call-cont02').css('display', 'block');
      }
    });
  
    /**
     * 라디오 버튼 클릭이벤트 사용하지 않음 (혹시 필요할 수 있어 남겨 둠)
     */
    $('input[type=radio][name=center]', $container).on('click', function() {
      var chkValue = $('input[type=radio][name=center]:checked', $container).val();
      if (chkValue === '1') {
        $('.center-cont01', $container).css('display', 'block');
        $('.center-cont02', $container).css('display', 'none');
      } else if (chkValue  === '2') {
        $('.center-cont01', $container).css('display', 'none');
        $('.center-cont02', $container).css('display', 'block');
      }
    });
  
    /**
     * 아코디언 형식 리스트 사용
     */
    $('.idpt-accordian > li > a', $container).on('click', function(e){
      e.preventDefault();
      // $('.idpt-accordian > li > a', $container).removeClass('open');
      // $('.idpt-accordian-cont', $container).slideUp();
      if ($(this).parent().find('.idpt-accordian-cont').is(':hidden')){
        $(this).addClass('open');
        $(this).parent().find('.idpt-accordian-cont').slideDown();
      } else {
        $(this).removeClass('open');
        $(this).parent().find('.idpt-accordian-cont').slideUp();
      }
    });
  
    /**
     * FAQ 콘텐츠에서 사용되는 메서드
     */
    $('.idpt-toggle-btn', $container).each(function(){
      $(this).click(function(){
        $(this).toggleClass('open').next('.idpt-toggle-cont').slideToggle();
      });
    });
  },

  /**
   * @function
   * @desc API 호출 후 에러 반환시 에러 서비스 호출
   * @param {Oject} $target API 호출시 이벤트 발생 시킨 엘리먼트
   * @param {JSON} err API 반환 코드 
   * @returns {boolean} false
   */
  _apiError: function ($target, err) {
    return Tw.Error(err.code, Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.msg).pop(null, $target);
  },



  /**
   * @function
   * @desc 어드민에서 등록된 툴팁 콘텐츠를 공통 모듈에서 사용하는 툴팁과 공통으로 사용되도록 함
   * @param {event} e 
   */
  _openTooltipPop: function (e) {
    var isTargetTitle = !!($(e.currentTarget).siblings('.btn-tooltip-open').length);
    var popId = isTargetTitle ? $(e.currentTarget).siblings('.btn-tooltip-open').attr('href'): $(e.currentTarget).attr('href');
    var titleText = isTargetTitle ? $(e.currentTarget).text() : $(e.currentTarget).prev('p').text();
    // 앞 번호 매겨져 있다면 변경
    titleText = titleText.replace(/^\d\d?\./gi,'');
    e.preventDefault();

    /**
     * @function 
     * @param {Object} {hbs: hbs 의 파일명, layer: 레이어 여부, title: 액션시트 제목, data: 데이터 리스트, btnfloating: {txt: 닫기버튼 문구, attr: 닫기버튼 attribute, class: 닫기버튼 클래스}}
     * @param {function} function_open_call_back 액션시트 연 후 호출 할 function
     * @param {function} function_close_call_back 액션시트 닫힌 후 호출할 function
     * @param {string} 액션시트 열 때 지정할 해쉬값, 기본값 popup{n}
     * @param {Object} $target 액션시트 닫힐 때 포커스 될 엘리먼트 여기에서는 카테고리 선택 버튼
     * @desc 라디오 선택 콤보박스 형태
     */
    this._popupService.open({
        url: Tw.Environment.cdn + '/hbs/',
        'pop_name': 'type_tx_scroll',
        'title': titleText || '',
        'title_type': 'tit-tooltip',
        'cont_align': 'tl',
        'contents': $(popId).find('.popup-title').html().replace(/<br ?\/?>/gi, '\n'),
        'tagStyle-div': 'div',
        'btn-close':'btn-tooltip-close tw-popup-closeBtn'
      }, 
      $.proxy(function($container){
        $container.find('.popup-info').show();
      }, this), 
      null, 
      null, 
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 어드민 등록 콘텐츠로부터 팝업 열려야 할때 공통 팝업 서비스 사용
   * @param {event} e 
   */
  _openPagePop: function (e) {
    var popId = $(e.currentTarget).data('popup') ? '#' + $(e.currentTarget).data('popup') : $(e.currentTarget).attr('href');
    e.preventDefault();
    
    this._popupService.open({
        hbs: 'svc-info.service.popup',
        'title': $(popId).find('.popup-title').html(),
        'isDoubleTitle': $(popId).find('.popup-title').find('br').length > 0 ? 'txt2-popup' : '',
        'contents': $(popId).find('.idpt-popup-cont').html()
      },
      $.proxy(function($container) {
        this._bindUIEvent($container);
      },this),
      null, null,
      $(e.currentTarget)
    );
  }
};