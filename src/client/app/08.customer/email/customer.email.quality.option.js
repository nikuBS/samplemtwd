/**
 * @file [이메일상담하기-품질상담]
 * @author Lee Kirim
 * @since 2018-10-29
 */

/**
 * @class 
 * @desc 이메일상담하기 퓸질상담 템플릿 동작에 관한 처리
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} allSvc - 회원 회선정보 
 */
Tw.CustomerEmailQualityOption = function (rootEl, allSvc) {
  this.allSvc = allSvc.allSvc;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailQualityOption.prototype = {
  /**
   * @function
   * @member 
   * @desc 객체 생성시 초기화에 필요한 것
   * @return {void}
   */
  _init: function () {
    // 품질 > 휴대폰 카테고리에서 사용함 현상 선택 목록
    this.quality_options = Tw.CUSTOMER_EMAIL_QUALITY_QUESTION;
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정 customer.email.html
   */
  _cachedElement: function () {
    // 품질상담 템플릿 wrapper
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 회선선택 셀렉트 버튼 (현재 사용안함) 회선두개존재시 선택할 수 있게 했으나 품질상담시 무조건 회선 직접입력으로 수정함
    this.$wrap_tpl_quality.on('click', '.fe-select-line', $.proxy(this._onSelectLine, this)); // 휴대폰 카테고리일때
    this.$wrap_tpl_quality.on('click', 'button.fe-select-phone-line', $.proxy(this._onSelectQualityPhoneLine, this)); // 집전화 및 인터넷 카테고리
    // 휴대폰 카테고리에서 현상 선택 이벤트 
    this.$container.on('click', '.fe-occurrence', $.proxy(this._showOptionSheet, this, 'Q_TYPE01'));
    this.$container.on('click', '.fe-occurrence_detail', $.proxy(this._showOptionSheet, this, 'Q_TYPE02'));
    this.$container.on('click', '.fe-place', $.proxy(this._showOptionSheet, this, 'Q_TYPE03'));
    this.$container.on('click', '.fe-place_detail', $.proxy(this._showOptionSheet, this, 'Q_TYPE04'));
    this.$container.on('click', '.fe-occurrence_date', $.proxy(this._showOptionSheet, this, 'Q_TYPE05'));

    this.$container.on('click', '.option_value', $.proxy(this._selectPopupCallback, this)); // 기존 액션시트에서 사용되었으나 현재 사용안함
    this.$container.on('click', '.fe-search-post', $.proxy(this._onClickSearchPost, this)); // 우편번호 찾기 버튼 클릭이벤트
  },

  /**
   * @function
   * @desc 우편번호 찾기 공통함수 호출
   * @param {event} e 
   */
  _onClickSearchPost: function (e) {
    new Tw.CommonPostcodeMain(this.$container, $(e.currentTarget), $.proxy(this._setAddress, this));
  },

  /**
   * @function
   * @desc 우편번호 찾기 callback 함수
   * 우편번호, 기본주소, 상세주소 value 변경 , 밸리데이션폼 (등록하기 버튼 활성화여부)
   * @param {object} address 
   */
  _setAddress: function (address) {
    this.$container.find('.fe-zip').val(address.zip);
    this.$container.find('.fe-main-address').val(address.main);
    this.$container.find('.fe-detail-address').val(address.detail);

    this.$container.trigger('validateForm');
  },

  /**
   * @function
   * @desc 품질상담 > 인터넷/집전화/IPTV > 회선변경
   * @param {event} e 
   */
  _onSelectQualityPhoneLine: function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $wrapTplQuality = this.$wrap_tpl_quality;

    var $target = $(e.currentTarget);
    // var isInternetLine = $('.fe-quality-inqSvcClCd li.checked').index() === 0; // 라디오 버튼 선택여부 0: 인터넷/TV 1: 집전화 -> 인터넷케이스일때 true
    // 2019-07-12 OP002-439 : 라디오 버튼 (인터넷/TV , 집전화) 비노출로 변경. 무조건 회선선택 하는거 노출

    var txt = '';
    // 리스트 설정
    var list = this.allSvc.s.map(function (item, index) {
      // I: 인터넷 T: IPTV
      if(item.svcGr === 'I' || item.svcGr === 'T'){
        txt = item.addr;
      }
      // 집전화 케이스일때
      else if (item.svcGr === 'U'){
        txt = Tw.FormatHelper.conTelFormatWithDash(item.svcNum);
      }

      var _svcMgmtNum = $wrapTplQuality.find('.fe-select-phone-line').data('svcmgmtnum');
      var radioAttrVal = Tw.StringHelper.stringf('data-index="{0}" data-svcmgmtnum="{1}" data-svc-gr="{2}"', index, item.svcMgmtNum, item.svcGr );
      radioAttrVal += _svcMgmtNum === item.svcMgmtNum ? ' checked' : ' ';
      return {
        'txt': txt,
        'radio-attr': radioAttrVal,
        'label-attr': ' '
      };
    });

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
        btnfloating: { 'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: list }]
      },
      $.proxy(this._handleQualityPhoneLine, this, $target),
      null, null, $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 회선선택 액션시트 열리고 callback function
   * @param {element} $target 액션시트 닫힌후 포커스될 버튼 : 회선선택버튼 [웹접근성]
   * @param {element} $layer 액션시트 엘리먼트
   */
  _handleQualityPhoneLine: function ($target, $layer) {
    // 선택이벤트
    $layer.on('change', 'li input', $.proxy(this._handleSelectType, this, $target));
    // 웹접근성
    this._onWebAccessPopup($layer); 
  },

  /**
   * @function
   * @desc 품질상담 > 휴대폰 > 회선변경 
   * @param {event} e 
   */
  _onSelectLine: function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $target = $(e.currentTarget);

    var fnFilter = function ($target, item) {
      var isChecked = $target.data('svcmgmtnum').toString() === item.svcMgmtNum;
      var dashNumber = Tw.FormatHelper.conTelFormatWithDash(item.svcNum);

      return $.extend({}, item, {
        'label-attr': ' ',
        'txt': dashNumber,
        'radio-attr': 'data-svcmgmtnum="' + item.svcMgmtNum + '"' + (isChecked ? ' checked' : ' ')
      });
    };

    // 노출목록
    var list = _.map(this.allSvc.m, $.proxy(fnFilter, this, $target));

    // 선택 액션시트 열기
    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { 'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: list }]
      },
      $.proxy(this._handleOpenSelectType, this, $target),
      null, null,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 회선선택 열리고 callback function
   * 품질상담 > 회선변경 선택시
   * @param {element} $target 문구 및 데이터 변경될 타겟
   * @param {element} $layer 액션시트 엘리먼트
   */
  _handleOpenSelectType: function ($target, $layer) {
    $layer.on('change', 'li.type1 input', $.proxy(this._handleSelectType, this, $target));
    this._onWebAccessPopup($layer);
  },

  // 품질상담 > 회선변경 처리
  /**
   * @function
   * @desc 회선변경 액션시트에서 라디오 버튼 클릭 이벤트
   * 선택된 회선 data 및 문구 변경
   * @param {element} $target 문구 및 데이터 변경할 타겟
   * @param {event} e 선택된 타켓
   */
  _handleSelectType: function ($target, e) {
    var $currentTarget = $(e.currentTarget);
    
    var svcNum = $currentTarget.parents('li').find('.txt').text().trim();
    var svcMgmtNum = $currentTarget.data('svcmgmtnum');

    $target.text(svcNum);
    $target.data('svcmgmtnum', svcMgmtNum);

    var $inqSvcClCd = this.$wrap_tpl_quality.find('.fe-quality-inqSvcClCd');
    // I: 인터넷 T: IPTV
    if(['I','T'].indexOf($target.data('svcGr')) !== -1) {
      $inqSvcClCd.find('[value="I"]').prop('checked', true);
    } else {
      $inqSvcClCd.find('[value="P"]').prop('checked', true);
    }
    e.stopPropagation();
    e.preventDefault();

    this._popupService.close();
  },

  /**
   * @function
   * @desc 현상 선택 액션시트 열기 품질 > 휴대폰 카테고리에서 노출
   * @param {string} sType 노출할 케이스
   * @param {event} e 
   */
  _showOptionSheet: function (sType, e) {
    var $elButton = $(e.currentTarget);

    /**
     * @function
     * @desc 액션시트 형식에 맞도록 목록 변환
     */
    var fnSelectLine = function ($elButton, item, index) {
      return {
        txt: item.text, 
        'radio-attr': 'data-index="' + index + '"' + ($elButton.text() === item.text ? ' checked' : ''), 
        'label-attr': ' '
      };
    };

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: this.quality_options[sType].list.map($.proxy(fnSelectLine, this, $elButton)) }]
      },
      $.proxy(this._selectPopupCallback, this, $elButton),
      null,
      null,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 현상 선택 액션시트 열린후 호출되는 callback function
   * @param {element} $target 액션시트내 목록 선택 후 값 변결될 타겟 엘리먼트 
   * @param {element} $layer 액션시트 레이어 엘리먼트
   */
  _selectPopupCallback: function ($target, $layer) {
    // 목록 선택 이벤트 바인드
    $layer.on('change', 'li input', $.proxy(this._setSelectedValue, this, $target));
    // 웹접근성 초점관련
    this._onWebAccessPopup($layer);
  },

  /**
   * @function
   * @desc 현상선택 적용 및 밸리데이션 호출 (등록하기 버튼 활성화 여부 결정)
   * @param {element} $target 문구 data 변경될 타겟
   * @param {*} el 선택된 목록 타겟
   */
  _setSelectedValue: function ($target, el) {
    var value = $(el.currentTarget).parents('li').find('.txt').text().trim();
    $target.text(value);
    $target.data('value', value);
    this._popupService.close();
    this.$container.trigger('validateForm');
  },

  /**
   * @function [웹접근성]
   * @param {element} $layer 팝업액션시트 dom객체
   */
  _onWebAccessPopup: function ($layer) {
    $layer.on('click', 'li', $.proxy(this._onCommonClickService, this));
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
   * @function
   * @desc li 클릭시 하위 input check trigger
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
