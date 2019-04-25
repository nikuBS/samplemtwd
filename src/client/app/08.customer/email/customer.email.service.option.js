/**
 * @file [이메일상담하기-서비스상담]
 * @author Lee Kirim
 * @since 2018-10-29
 */

 /**
 * @class 
 * @desc 이메일상담하기 - 서비스상담 템플릿 동작에 관한 처리
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} allSvc - 회원 회선정보 
 */
Tw.CustomerEmailServiceOption = function (rootEl, allSvc) {
  this.allSvc = allSvc.allSvc;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailServiceOption.prototype = {
  /**
   * @function
   * @member 
   * @desc 객체 생성시 초기화에 필요한 것
   * @return {void}
   */
  _init: function () {
    this.listLimit = Tw.DEFAULT_LIST_COUNT; // 한번에 더 보기 갯수 (리스트에서 사용) 20
  },
  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정 
   */
  _cachedElement: function () {
    // 서비스상담 템플릿 wrapper - customer.email.html
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service'); 
    // 다이렉트 상담 케이스에서 사용하는 템플릿 customer.email.service.template.html - 현재 사용하지 않고 hbs 파일로 뺐습니다. (히스토리 관련 이슈)
    this.tpl_service_direct_order = Handlebars.compile($('#tpl_service_direct_order').html());
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    this.$wrap_tpl_service.on('click', '.fe-select-line', $.proxy(this._selectLine, this)); // 회선 선택 (여러 회선보유 고객일경우) - 서비스상담 > 휴대폰 or 인터넷 카테고리 선택시 노출됨
    this.$container.on('click', '.fe-select-brand', $.proxy(this._getDirectBrand, this)); // 브랜드 선택 (다이렉트 케이스)
    this.$container.on('click', '.fe-select-device', $.proxy(this._getDirectDevice, this)); // 기종 선택 (다이렉트 케이스)
    this.$container.on('click', '.fe-search-order', $.proxy(this._getOrderInfo, this)); // 주문조회 버튼 (다이렉트 케이스)
  },

  /**
   * @function
   * @desc 서비스문의 > 회선변경 액션시트 노출 휴대폰, 인터넷 카테고리일때만 호출됨
   * @param {event} e 
   */
  _selectLine: function (e) {
    e.stopPropagation();
    e.preventDefault();

    // 선택된 카테고리 
    var category = this.$container.triggerHandler('getCategory');
    // 노출할 목록
    var lineList = [];

    // 목록 정하기 휴대폰, 인터넷
    if ( category.service.depth1 === 'CELL' ) {
      lineList = this.allSvc.m;
    }

    if ( category.service.depth1 === 'INTERNET' ) {
      lineList = this.allSvc.s;
    }


    /**
     * @function
     * @desc 액션시트 형식에 맞도록 반환
     * @param {object} item 
     * @param {number} index 
     */
    var fnSelectLine = function (item, index) {
      var sItem;

      // I: 인터넷 T: IPTV
      if ( item.svcGr === 'I' || item.svcGr === 'T' ) {
        // 주소정보
        sItem = item.addr; 
      } else {
        // 전화번호로 판단 , 정보에 xxx-xxx-xxxx 대쉬 붙임
        sItem = Tw.FormatHelper.conTelFormatWithDash(item.svcNum);
      }

      return {
        txt: sItem, 
        'radio-attr': 'data-index="' + index + '" data-svcmgmtnum="'+ item.svcMgmtNum +'"' + 
                    ($('.fe-select-line').data('svcmgmtnum').toString() === item.svcMgmtNum ? ' checked' : ''),
        'label-attr': ' '
      };
    };

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
        hbs: 'actionsheet01',
        layer: true,
        // title: Tw.CUSTOMER_VOICE.LINE_CHOICE,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: lineList.map($.proxy(fnSelectLine, this)) }]
      },
      $.proxy(this._handleSelectLineChange, this),
      null,
      null,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 서비스문의 > 회선변경 선택시
   * @param {element} $layer 액션시트 레이어 
   */
  _handleSelectLineChange: function ($layer) {
    // 목록 선택 이벤트
    $layer.on('change', 'li input', $.proxy(this._selectLineCallback, this));
    // 웹접근성 초점 관련
    this._onWebAccessPopup($layer);
  },

  /**
   * @function
   * @desc 서비스문의 > 회선변경 처리
   * .fe-select-line 의 data 와 문구 적용
   * @param {event} e 
   */
  _selectLineCallback: function (e) {
    var $el = $(e.currentTarget);
    var nTabIndex = this.$container.triggerHandler('getTabIndex');
    if ( nTabIndex === 0 ) {
      $('#tab1-tab .fe-select-line').data('svcmgmtnum', $el.data('svcmgmtnum').toString());
      $('#tab1-tab .fe-select-line').text($el.parents('li').find('.txt').text().trim());
    } else {
      // 해당 조건에 올 수가 없는 것 같은데 왜 넣었는지 잘 모르겠음 (wraper 가 서비스 wrapper임..)
      $('#tab2-tab .fe-quality-line').data('svcmgmtnum', $el.data('svcmgmtnum').toString());
      $('#tab2-tab .fe-quality-line').text($el.text().trim());
    }

    this._popupService.close();
  },

  /**
   * @function
   * @desc 다이렉트 케이스 주문조회 API 호출
   * @param {event} e 
   */
  _getOrderInfo: function (e) {
    this._apiService.request(Tw.API_CMD.BFF_08_0016, { svcDvcClCd: 'M' })
      .done($.proxy(this._onSuccessOrderInfo, this, $(e.currentTarget)))
      .fail($.proxy(this._error, this));
  },

  /**
   * @function
   * @desc 브랜드 조회 클릭시 API 호출
   * @param {event} e 
   */
  _getDirectBrand: function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $elTarget = $(e.currentTarget);

    this._apiService.request(Tw.API_CMD.BFF_08_0015)
      .done($.proxy(this._onSuccessDirectBrand, this, $elTarget))
      .fail($.proxy(this._error, this));
  },

  /**
   * @function
   * @desc 기종선택 클릭시 API 호출
   * @param {event} e 
   */
  _getDirectDevice: function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $elTarget = $(e.currentTarget);

    // 선택된 브랜드 코드를 파라미터로 넘김
    if ( $('.fe-select-brand').data('brandcd') ) {
      this._apiService.request(Tw.API_CMD.BFF_08_0015, { brandCd: $('.fe-select-brand').data('brandcd') })
        .done($.proxy(this._onSuccessDirectDevice, this, $elTarget))
        .fail($.proxy(this._error, this));
    }
  },

  /**
   * @function
   * @desc 주문조회 API 호출 응답시 주문조회 팝업 노출
   * @param {element} $target 클릭 이벤트 발생 엘리먼트 주문조회 버튼
   * @param {JSON} res 응답데이터
   */
  _onSuccessOrderInfo: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // 응답데이터 가공
      var htOrderInfo = this._convertOrderInfo(res.result || {});
      // 팝업 노출
      this._popupService.open($.extend({
          hbs: 'CS_04_01_L03',
          layer: true,
        }, htOrderInfo),
        $.proxy(this._handleOrderCallback, this),
        null,
        'OrderInfo',
        $target
      );
      // 기본 위젯 액션 적용 체크박스 및 탭 등
      skt_landing.widgets.widget_init('.fe-wrap_direct_order');
    } else {
      Tw.Error(res.code, res.msg).pop(null, $target);
    }
  },

  /**
   * @function
   * @desc 주문조회 데이터 가공 - 더보기 노출여부 결정
   * @param {object} list 
   * @returns {object} htOrderList 
   */
  _convertOrderInfo: function (list) {
    var htOrderList = $.extend({}, list, { isMoreListShop: false, isMoreListUsed: false });

    if (list.listShop && list.listShop.length > this.listLimit ) {
      htOrderList.isMoreListShop = true;
    }

    if (list.listUsed && list.listUsed.length > this.listLimit ) {
      htOrderList.isMoreListUsed = true;
    }

    return htOrderList;
  },

  // 더 보기
  _onShowMoreList: function (e) {
    var $elTarget = $(e.currentTarget);
    var $elTabPanel = $elTarget.closest('[role=tabpanel]');
    var leftLength = $elTabPanel.find('.list-comp-input.none').length - this.listLimit;

    this._setListStatus.show($elTabPanel.find('.list-comp-input.none').slice(0, this.listLimit));

    if (leftLength <= 0) {
      $elTarget.remove();
    }
  },

  /**
   * @function 
   * @desc 주문조회 팝업 노출 후 callback function 
   * @param {element} $tempWrap 주문조회 팝업 엘리먼트
   */
  _handleOrderCallback: function ($tempWrap) {
    // 주문조회 팝업 후
    // 20개 까지 리스트 노출 (처음 hbs 목록 불러올때 모두 비노출 상태로 불러옴)
    // 탭1
    this._setListStatus.show($tempWrap.find('#tab1-tab .list-comp-input').slice(0, this.listLimit));
    // 탭2
    this._setListStatus.show($tempWrap.find('#tab2-tab .list-comp-input').slice(0, this.listLimit));
    
    // 이벤트 바인드
    $tempWrap.on('click', 'li.checkbox', $.proxy(this._selectOrder, this, $tempWrap)); // 체크이벤트 
    $tempWrap.on('click', '.fe-select-order', $.proxy(this._setOrderNumber, this, $tempWrap)); // 적용하기 버튼
    $tempWrap.on('click', '.fe-direct-more', $.proxy(this._onShowMoreList, this)) // 더보기 버튼
  },

  /**
   * @function
   * @desc 주문조회 팝업내 목록 토글 
   * @param {element} $tempWrap 주문조회 팝업 엘리먼트
   * @param {event} e 체크박스
   */
  _selectOrder: function ($tempWrap, e) {
    var $target = $(e.currentTarget);
    if ($target.is('.checked')) {
      // 선택된 주문 해제
      this._checkBox.uncheck($target);
      // 버튼 비활성화
      $('.fe-select-order', $tempWrap).prop('disabled', true);
    } else {
      // 선택된 주문 외 해제
      this._checkBox.uncheck($tempWrap.find('li.checkbox.checked'));
      // 선택된 주문 선택
      this._checkBox.check($target);
      // 버튼 활성화
      $('.fe-select-order', $tempWrap).prop('disabled', false);
    }
  },

  /**
   * @function 
   * @desc 주문조회 적용하기
   * @param {element} $tempWrap 주문조회 팝업 엘리먼트
   * @param {element} e 적용하기 버튼 엘리먼트
   */
  _setOrderNumber: function ($tempWrap, e) {
    var orderNumber = $('li.checked .fe-order-number', $tempWrap).text(); // 선택된 목록명
    $('.fe-text_order', this.$container).val(orderNumber); // value 변경
    $('.fe-text_order', this.$container).trigger('change'); // 밸리데이션 위해 호출
    this._popupService.close();
  },
 
  /**
   * @desc 주문조회 체크박스
   * @prop {check} 체크 
   * @function
   * @prop {uncheck} 체크 풀기
   * @function
   */
  _checkBox: {
    check: function ($target) {
      return $target.addClass('checked').find('input[type=checkbox]').prop('checked', true);
    },
    uncheck: function ($target) {
      return $target.removeClass('checked').find('input[type=checkbox]').prop('checked', false);
    }
  },

  /**
   * @desc 주문조회 show / hide
   * @prop {show} 보임
   * @prop {hide} 숨김
   */
  _setListStatus: {
    show: function ($target) {
      return $target.removeClass('none').attr('aria-hidden', false);
    },
    hide: function ($target) {
      return $target.addClass('none').attr('aria-hidden', true);
    }
  },


  /**
   * @function
   * @desc 브랜드 API 응답 후 선택 액션시트 노출
   * @param {element} $elButton 팝업 닫힌 후 포커스될 타겟 [웹접근성]
   * @param {JSON} res 응답데이터
   */
  _onSuccessDirectBrand: function ($elButton, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {

      /**
       * @function
       * @desc 액션시트 형식에 맞도록 데이터 반환
       * @param {object} item 
       * @param {number} index 
       */
      var fnSelectBrand = function (item, index) {
        return {
          txt: item.brandNm, 
          'radio-attr': 'data-index="' + index + '" data-brandCd="'+ item.brandCd +'"' + 
                      ($elButton.text() === item.brandNm ? ' checked' : ''),
          'label-attr': ' '
        };
      };

      this._popupService.open({
          hbs: 'actionsheet01',
          layer: true,
          data: [{ list: res.result.map($.proxy(fnSelectBrand, this)) }],
          btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE }
        },
        $.proxy(this._selectPopupCallback, this, $elButton),
        null,
        null,
        $elButton
      );

    } else {
      Tw.Error(res.code, res.msg).pop(null, $elButton);
    }
  },

  /**
   * @function
   * @desc 기종선택 API 응답 후 선택 액션시트 노출
   * @param {element} $elButton 팝업 닫힌 후 포커스될 타겟 [웹접근성]
   * @param {JSON} res 응답데이터
   */
  _onSuccessDirectDevice: function ($elButton, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var resultList = res.result || [];

      /**
       * @function
       * @desc 액션시트 형식에 맞도록 데이터 반환
       * @param {object} item 
       * @param {number} index 
       */
      var fnSelectDevice = function (item, index) {
        return {
          txt: item.modelNickName, 
          'radio-attr': 'data-index="' + index + '" data-phoneid="'+ item.phoneId +'"' + 
                      ($elButton.text() === item.modelNickName ? ' checked' : ''),
          'label-attr': ' '
        };
      };

      this._popupService.open({
          hbs: 'actionsheet01',
          layer: true,
          btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
          data: [{ list: resultList.map($.proxy(fnSelectDevice, this)) }],
          btnmore: (resultList.length > Tw.DEFAULT_LIST_COUNT) ? { attr: 'class="fe-btn-more"', txt: Tw.BUTTON_LABEL.MORE } : false // 기종선택에 액션시트내 더보기 노출이 필요할 수 있다
        },
        $.proxy(this._selectDevicePopupCallback, this, $elButton),
        null, null, 
        $elButton
      );
    } else {
      Tw.Error(res.code, res.msg).pop(null, $elButton);
    }
  },

  /**
   * @function
   * @desc 브랜드 액션시트 노출 후 callback function
   * @param {element} $target [브랜드] 선택 버튼 엘리먼트
   * @param {element} $layer 액션시트 레이어 엘리먼트
   */
  _selectPopupCallback: function ($target, $layer) {
    // 목록 선택 이벤트 바인드
    $layer.on('change', 'li input', $.proxy(this._setSelectedBrand, this, $target));
    // 웹접근성 초점관련
    this._onWebAccessPopup($layer);
  },

  /**
   * @function
   * @desc 기종선택 액션시트 노출 후 callback function
   * @param {element} $target [기종] 선택 버튼 엘리먼트
   * @param {element} $layer 액션시트 레이어 엘리먼트
   */
  _selectDevicePopupCallback: function ($target, $layer) {
    // 더보기 케이스 고려
    var nMaxList = Tw.DEFAULT_LIST_COUNT; // 20
    // 20개가 넘어가면 더보기 버튼 노출하고 더보기 버튼에 클릭 이벤트를 바인드
    if ( $layer.find('li').size() > nMaxList ) {
      $layer.find('li').slice(nMaxList).hide();
      $layer.on('click', '.fe-btn-more', $.proxy(this._onShowMoreDevice, this, $layer));
    }

    // 목록 선택 이벤트 바인드
    $layer.on('change', 'li input', $.proxy(this._setSelectedDevice, this, $target));
    // 웹접근성 초점관련
    this._onWebAccessPopup($layer);
  },

  /**
   * @function
   * @desc 기종선택에서 더보기 버튼 클릭시 노출
   * @param {element} $layer 액션시트 레이어 엘리먼트
   */
  _onShowMoreDevice: function ($layer) {
    // 지정된 갯수 만큼 더 노출 (20)
    if ( $layer.find('li').not(':visible').size() !== 0 ) {
      $layer.find('li').not(':visible').slice(0, Tw.DEFAULT_LIST_COUNT).show();
    }

    // 가려진 리스트 없을 경우 더보기 버튼 숨김
    if ( $layer.find('li').not(':visible').size() === 0 ) {
      $layer.find('.btn-more').hide();
    }
  },

  /**
   * @function
   * @desc 브랜드 선택 액션시트에서 목록 선택시 데이터 및 문구 변경
   * @param {element} $target 데이터 적용할 타겟 (브랜드 선택 버튼)
   * @param {element} el 선택된 목록 엘리먼트
   */
  _setSelectedBrand: function ($target, el) {
    var $el = $(el.currentTarget);
    var prev_txt = $target.text();
    this._popupService.close();

    // 브랜드 선택 버튼 문구 및 data 변경
    $target.text($el.parents('li').find('.txt').text().trim());
    $target.data('brandcd', $el.data('brandcd')); 

    // 브랜드 선택된 값이 이전에 선택된 값과 같지 않을때만 기종선택 문구및 data를 초기화 함
    if (prev_txt !== $target.text()) {
      this.$container.find('.fe-select-device').removeData('phoneid').text(Tw.CUSTOMER_EMAIL.ACTION_TYPE.SELECT_DEVICE);
    }
  },

  /**
   * @function
   * @desc 기종 선택 액션시트에서 목록 선택시 데이터 및 문구 변경
   * @param {element} $target 데이터 적용할 타겟 (기종 선택 버튼)
   * @param {element} el 선택된 목록 엘리먼트
   */
  _setSelectedDevice: function ($target, el) {
    var $el = $(el.currentTarget);
    $target.data('phoneid', $el.data('phoneid'));
    $target.text($el.parents('li').find('.txt').text().trim());
    this._popupService.close();
  },

  /**
   * @function
   * @desc API 에서 에러 발생시 에러 팝업 노출
   * @param {JSON} err 
   */
  _error: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  
  /**
   * @function [웹접근성]
   * @param {element} $layer 팝업액션시트 dom객체
   */
  _onWebAccessPopup: function ($layer) {
    // 액션시트 목록 클릭시 하위 radio 버튼에 change trigger
    $layer.on('click', 'li', $.proxy(this._onCommonClickService, this));
    // 액션시트에 초점가도록 대응 (IOS)
    this._onCommonFocus($layer);
  },

  /**
   * @function [웹접근성]
   * @param {element} $layer 액션시트 dom 객체
   * @decs 초점이동 관련
   */
  _onCommonFocus: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); 
  },

  /**
   * @function [웹접근성]
   * @desc 액션시트 목록 클릭시 하위 radio 버튼에 change trigger
   * @param {event} e 
   */
  _onCommonClickService: function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).siblings().find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true).trigger('change');
  },
  // end 웹접근성
};