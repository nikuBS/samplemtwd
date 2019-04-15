/**
 * @file [이용안내-서비스_이용안내]
 * @author Lee Kirim
 * @since 2018-12-20
 */

/**
 * @class 
 * @desc 이용안내 서비스 이용안내 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - customer.svc-info.service.controlloer.ts 로 부터 전달되어 온 정보
 */
Tw.CustomerSvcinfoService = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerSvcinfoService.prototype = {
  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 처음 처리
   * rootPathName - 현재 주소
   * @return {void}
   */
  _init : function() {
    this.rootPathName = this._historyService.pathname;
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - customer.svc-info.service.html 참고
   */
  _cachedElement: function () {
    this.$selectBtn = this.$container.find('.fe-select-box'); // 셀렉트 박스 열기
    this.$selectConfirm = this.$container.find('.fe-select-btn'); // 셀렉트 확정 (셀렉트 박스 있는 케이스 메뉴) 이동
    this.$moveBtn = this.$container.find('.fe-move-btn'); // 바로 ( 셀렉트 박스 없는 케이스 메뉴 ) 이동
  },
  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 셀렉트 박스 클릭 이벤트 - 카테고리 선택 열기
    this.$selectBtn.on('click', $.proxy(this._typeActionSheetOpen,this));
    // 셀렉트 확정 클릭 이벤트 - 페이지 이동
    this.$selectConfirm.on('click', $.proxy(this._moveEvent, this));
    // 바로이동 버튼 클릭 이벤트 - 페이지 이동
    this.$moveBtn.on('click', $.proxy(this._moveEvent, this));
  },

  /**
   * @desc 카테고리 선택 열기
   * @param {event} e 
   */
  _typeActionSheetOpen: function (e) {
    var selectIndex = $(e.currentTarget).data('selectIndex'); // 해당 엘리먼트의 data-select-index 
    var selectSubdex =  $(e.currentTarget).data('selectSubdex'); // 해당 엘리먼트의 data-select-subdex
    
    if(Tw.FormatHelper.isEmpty(selectIndex) || Tw.FormatHelper.isEmpty(selectSubdex)) {
      return ;
    }
    // 해당 셀렉트 확정 버튼 엘리먼트
    this.$curConfirmBtn = this.$selectConfirm.filter(function(){
      return $(this).data('selectIndex') === selectIndex && $(this).data('selectSubdex') === selectSubdex;
    });
    // 해당 셀렉트 엘리먼트
    this.$curSelectBtn = this.$selectBtn.filter(function(){
      return $(this).data('selectIndex') === selectIndex && $(this).data('selectSubdex') === selectSubdex;
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
        hbs: 'actionsheet01',// hbs의 파일명
        layer: true,
        title: this.data.list[selectIndex].sub_list[selectSubdex].sub_title,
        data: this._getOptions(this.data.list[selectIndex].sub_list[selectSubdex].dep_list),
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
   * @desc 해당 리스트에서 액션시트 형식에 맞도록 반환
   * @param {array} arr 
   * @return {object}
   */
  _getOptions: function (arr) {
    return {
      data: {
        list: arr.map(function(el){
          return {
            txt: el.dep_title,
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

    // check 
    var code = this.$curConfirmBtn.data('listCode').toString();
    this.$selectButtons.find('input').filter(function(){
      return $(this).val() === code;
    }).prop('checked', true);

    // event
    this.$selectButtons.on('click', $.proxy(this._setActionSheetValue, this));
    $container.find('.ac-list>li label').on('click', $.proxy(this._noDefaultEvent, this));
  },
  
  _noDefaultEvent: function(e) {
    e.preventDefault();
  },

  /**
   * @function
   * @desc 라디오버튼 클릭이벤트
   * checked 표기, 셀렉트의 text 변경, 카테고리 선택 레이어 닫기, 확인버튼의 listCode data변경
   * @param {event} e 
   */
  _setActionSheetValue: function (e) {
    // check
    this.$selectButtons.find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true);

    // text
    this.$curSelectBtn.text($(e.currentTarget).find('.txt').text().trim());

    // popup close
    this._popupService.close();

    // change listCode
    this.$curConfirmBtn.data('listCode', $(e.currentTarget).find('input').val());
  },

  /**
   * @function
   * @desc 해당엘리먼트가 가지고 있는 listCode data 를 매개로 하는 함수 호출 (페이지 이동)
   * @param {event} e 
   */
  _moveEvent: function (e) {
    this._moveDetailPage( $(e.currentTarget).data('listCode') );
  },

  /**
   * @function
   * @desc 상세페이지로 이동 쿼리로 code 전달 (상세페이지에서 해당 code를 API 로 전달함)
   * code 에 url: 이 있을때는 상세가 아닌 url 로 이동 
   * @param {string} code 
   */
  _moveDetailPage: function (code) {
    var targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    if (code.indexOf('url:') >= 0) {
      this._historyService.goLoad(code.replace('url:', ''));
    } else {
      this._historyService.goLoad(targetURL + '/detail?code=' + code);
    }
  }
};
