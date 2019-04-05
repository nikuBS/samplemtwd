/**
 * 이용안내 > 공지사항
 * @file customer.svc-info.notice.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.23
 */

Tw.CustomerSvcInfoNotice = function(rootEl, category, ntcId, tworldChannel) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 공통 모듈 설정
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  // 기본 변수 설정
  this._category = category;
  this._ntcId = ntcId;
  this._tworldChannel = tworldChannel;
  this._setContentsList = [];
  this._page = 1;

  // 캐싱, 이벤트 및 최초동작 실행
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerSvcInfoNotice.prototype = {

  // Element 캐싱
  _cachedElement: function() {
    this.$list = this.$container.find('.fe-list');  // 목록
    this.$btnCategory = this.$container.find('.fe-btn_category'); // 카테고리 버튼
  },

  // 이벤트 바인딩
  _bindEvent: function() {
    this.$list.on('cssClassChanged', 'li.acco-box', $.proxy(this._setContentsReq, this)); // 공지사항 제목이 최초 클릭 되었을 때
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));  // 카테고리 설정 버튼 클릭시

    // 외부 링크 지원
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));

    // addClass가 일어날때 cssClassChanged 이벤트를 발생시켜 공지사항 제목이 클릭되었음을 감지하고자 할때 사용
    var originalAddClassMethod = $.fn.addClass;
    $.fn.addClass = function() {
      $(this).trigger('cssClassChanged');
      return originalAddClassMethod.apply( this, arguments );
    };
  },

  // 최초 동작
  _init: function() {
    if (Tw.FormatHelper.isEmpty(this._ntcId)) { // 파라미터로 ntcId 값이 없었다면 진입 하지 않아도 된다.
      return;
    }

    // 목록에서 ntcId 값을 찾는다.
    var item = this.$list.find('[data-ntc_id="' + this._ntcId  + '"]');

    // item 값이 있으면 클릭을 시켜주고, 해당 영역만큼 스크롤 이동을 시켜준다.
    if (item.length > 0) {
      setTimeout(function() {
        $.when(item.find('button').trigger('click'))
          .then(function() {
            $(window).scrollTop(item.offset().top - $('#header').height());
          });
      }, 100);
    }

    Tw.CommonHelper.replaceExternalLinkTarget(this.$container);
  },

  // 외부 링크 클릭시
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 앱이 아닐땐 과금 팝업 띄울 필요 없으므로 즉시 외부 링크 실행
    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    // 공통 과금팝업 노출 후 외부 링크 실행
    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  // 외부 링크 실행
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  },

  // 제목을 클릭시
  _setContentsReq: function(e) {
    if (this._category !== 'tworld') {  // T world 카테고리 일때만 내용 값을 가져오는 동작이 필요하므로 다른 카테고리 일때는 진입 안되도록 함
      return;
    }

    // 공지사항 키
    var ntcId = parseInt($(e.currentTarget).data('ntc_id'), 10);

    // 제목 클릭하여 내용 노출 된 상태서 새로고침시 그대로 같은 화면을 보여주기 위해 URL을 조작한다.
    this._historyService.replacePathName(window.location.pathname + '?ntcId=' + ntcId);

    // 이미 내용값을 API 통해 응답을 받은 키라면 다음 과정을 진행하지 않아도 된다.
    if (this._setContentsList.indexOf(ntcId) !== -1) {
      return;
    }

    // API 요청하여 T world 공지사항 내용을 요청
    this._apiService.request(Tw.API_CMD.BFF_08_0029, { expsChnlCd: this._tworldChannel, ntcId: ntcId })
      .done($.proxy(this._setContentsRes, this));
  },

  // T world 공지사항 내용 응답
  _setContentsRes: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {  // API 요청 실패시 오류 팝업 노출
      return Tw.Error(resp.code, resp.msg).pop();
    }

    // 추가 노출을 막기 위해, 배열에 키를 추가해둔다.
    this._setContentsList.push(parseInt(resp.result.ntcId, 10));

    // API 에서 내려받은 응답 값을 replace
    var $targetElem = this.$list.find('[data-ntc_id="' + resp.result.ntcId + '"] .notice-txt');
    $targetElem.html(this._fixHtml(resp.result.ntcCtt));

    Tw.CommonHelper.replaceExternalLinkTarget($targetElem);
  },

  // 카테고리 설정 팝업 오픈
  _openCategorySelectPopup: function() {
    this._isCategoryMove = false;
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list':[
            { 'label-attr': 'id="ra1"', 'txt': Tw.NOTICE.TWORLD,
              'radio-attr':'id="ra1" data-category="tworld" ' + (this._category === 'tworld' ? 'checked' : '') },
            { 'label-attr': 'id="ra2"', 'txt': Tw.NOTICE.DIRECTSHOP,
              'radio-attr':'id="ra2" data-category="directshop" ' + (this._category === 'directshop' ? 'checked' : '') },
            { 'label-attr': 'id="ra3"', 'txt': Tw.NOTICE.MEMBERSHIP,
              'radio-attr':'id="ra3" data-category="membership" ' + (this._category === 'membership' ? 'checked' : '') },
            { 'label-attr': 'id="ra4"', 'txt': Tw.NOTICE.ROAMING,
              'radio-attr':'id="ra4" data-category="roaming" ' + (this._category === 'roaming' ? 'checked' : '') }
          ]
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._categoryPopupBindEvent, this), $.proxy(this._goCategory, this), 'notice_category', this.$btnCategory);
  },

  // 카테고리 이동
  _goCategory: function() {
    if (!this._isCategoryMove) {  // 카테고리 설정 창을 바로 닫았을 경우 카테고리 이동을 실행하지 않는다.
      return;
    }

    this._historyService.goLoad('/customer/svc-info/notice?category=' + this._category);
  },

  // 카테고리 설정 팝업 이벤트 바인딩
  _categoryPopupBindEvent: function($layer) {
    $layer.on('click', '[data-category]', $.proxy(this._applyCategory, this));
  },

  // 카테고리 선택됨을 boolean 처리
  _applyCategory: function(e) {
    this._isCategoryMove = true;
    this._category = $(e.currentTarget).data('category');
    this._popupService.close();
  },

  // Dirty Html 방지
  _fixHtml: function(html) {
    var doc = document.createElement('div');
    doc.innerHTML = html;

    return doc.innerHTML;
  }

};
