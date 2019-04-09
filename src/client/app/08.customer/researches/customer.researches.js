Tw.CustomerResearches = function(rootEl, researches) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._cachedElement();
  this._bindEvent();
  this._init(researches);
};

Tw.CustomerResearches.prototype = {
  /**
   * @desc 설문조사 데이터 변경
   * @param {Array} researches
   * @private
   */
  _init: function(researches) {
    this._tmpl = Handlebars.compile($('#fe-templ-researches').html());
    this._researches = _.map(researches, function(research) {
      return $.extend(research, {
        hasHint: research.bnnrRsrchTypCd === 'Q' && research.hintExUrl,
        examples: _.map(research.examples, function(exam, idx) {
          return $.extend(exam, { idx: idx });
        }),
        hasHtml: _.some(research.examples, function(exam) {
          return exam.motHtml;
        }),
        isMultiple: research.bnnrRsrchRpsTypCd === 'C',
        isDoubleAlign: research.bnnrRsrchSortMthdCd === 'D',
        hasImage: research.examples[0] && research.examples[0].image,
        hasEtc: research.examples.length ? research.examples[research.examples.length - 1].isEtc : false,
        hasQuestions: research.bnnrRsrchTypCd === 'R'
      });
    });
    this._leftCount = researches.length;
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$container.find('.fe-submit').click(_.debounce($.proxy(this._handleSubmit, this), 300));
    this.$container.on('change', 'ul.survey-researchbox > li input', $.proxy(this._handleChangeSelect, this));
    this.$container.on('click', '.fe-hint', $.proxy(this._goHint, this));
    this.$container.on('click', '.bt-more', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.fe-nResearch li.category-type', $.proxy(this._setSelect, this));
    this.$container.on('click', '.fe-nResearch .fe-submit', $.proxy(this._handleSubmit, this));
    this.$container.on('click', '.fe-nResearch .acco-tit', $.proxy(this._toggleShowDetail, this));
    this.$container.on('click', 'a', $.proxy(this._clearForm, this));
    this.$container.on('click', '.fe-link-external:not([href^="#"])', $.proxy(this._openExternalUrl, this));
  },

  /**
   * @desc jquery 객체 캐싱
   * @private
   */
  _cachedElement: function() {
    this.$list = this.$container.find('.acco-list');
  },

  /**
   * @desc 외부 링크 열기
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _openExternalUrl: function(e) { 
    e.preventDefault();
    e.stopPropagation();

    Tw.CommonHelper.openUrlExternal($(e.currentTarget).attr('href'));
  },

  /**
   * @desc 라디오 or 체크박스 선택 처리
   * @param {Event} e 클릭 이벤트 객체
   * @private
   */
  _handleChangeSelect: function(e) {  
    var $target = $(e.currentTarget);

    $target
      .closest('.survey-researchbox')
      .find('li[aria-checked="true"]')
      .attr('aria-checked', false);
    $target.closest('li').attr('aria-checked', true);

    this._setEnableSubmit(e);
  },

  /**
   * @desc 설문조사 제출
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _handleSubmit: function(e) {  
    var $target = $(e.currentTarget),
      $root = $target.parents('li.acco-box');
    var $list = $root.find('ul.survey-researchbox > li');
    var $etcText = $root.find('textarea.poll-area');
    var answerNumber = $root.data('answer-num');

    var options = {
      bnnrRsrchId: $root.data('research-id'),
      bnnrRsrchTypCd: $root.data('type-code')
    };

    if (answerNumber) {
      options.canswNum = answerNumber;  // 정답번호 서버에 전달해야 함
    }

    if ($etcText.length > 0) {
      options.etcTextNum = $etcText.data('etc-idx');  // 기타 문항번호 서버에 전달해야 함
      options.etcText = $etcText.val();
    }

    for (var i = 0; i < $list.length; i++) {
      if ($list[i].getAttribute('aria-checked') === 'true') {
        options['rpsCtt' + (i + 1)] = i + 1;
      }
    }

    $list.prop('aria-checked', false);
    $list.find('input').prop('checked', false);
    $target.prop('disabled', true);

    this._apiService.request(Tw.API_CMD.BFF_08_0035, options).done($.proxy(this._handleSuccessSubmit, this, $target));
  },

  /**
   * @desc 입력 폼 초기화
   * @private
   */
  _clearForm: function() {  
    var $list = this.$container.find('ul.survey-researchbox > li');
    $list.prop('aria-checked', false);
    $list.find('input').prop('checked', false);
    this.$container.find('.fe-submit').prop('disabled', true);
  },

  /**
   * @desc 설문조사 참여 완료시
   * @param {$object} $target 저장하기 버튼(팝업 닫은 후 포커싱 처리를 위한 객체)
   * @param {object} resp 서버응답 데이터
   */
  _handleSuccessSubmit: function($target, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    switch (resp.result) {
      case 'DUPLICATE':
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A01, undefined, undefined, undefined, undefined, $target);
        break;
      case 'SUCCESSY':
      case 'SUCCESSN':
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A02, undefined, undefined, undefined, undefined, $target);
        break;
    }
  },

  /**
   * @desc 참여하기 버튼 활성화
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _setEnableSubmit: function(e) { 
    var $target = $(e.currentTarget);
    var $root = $target.parents('li.acco-box');
    var $btn = $root.find('.item-two > .bt-blue1 button');

    if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
    }
  },

  /**
   * @desc 힌트보기 클릭시 외부 링크, 과금 팝업 처리
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _goHint: function(e) {  
    var link = e.target.getAttribute('data-hint-url');
    if (link.indexOf('http') !== -1) {
      if (Tw.BrowserHelper.isApp()) {
        Tw.CommonHelper.showDataCharge(function() {
          Tw.CommonHelper.openUrlExternal(link);
        });
      } else {
        Tw.CommonHelper.openUrlExternal(link);
      }
    } else {
      window.location.href = link;
    }
  },

  /**
   * @desc 더보기 클릭 시
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _handleLoadMore: function(e) {  
    this._leftCount = this._leftCount - Tw.DEFAULT_LIST_COUNT;
    var list = this._researches;

    if (this._leftCount > 0) {  // 남은 데이터가 20개 이상일 경우
      list = this._researches.slice(0, Tw.DEFAULT_LIST_COUNT);
      this._researches = this._researches.slice(Tw.DEFAULT_LIST_COUNT);
    } else {
      $(e.currentTarget).remove();  // 더보기 버튼 제거
    }

    this.$list.append(this._tmpl({ researches: list }));
  },

  /**
   * @desc 더보기 추가된 항목들에 대해 마크업 이벤트가 처리가 안되어 추가 - 라디오, 체크박스 change 처리
   * @param {Event} e 클릭 이벤트 
   */
  _setSelect: function(e) {
    var $target = $(e.currentTarget);

    if ($target.find('input').prop('disabled')) {
      $target.prop('checked', false);
      return;
    }

    var $parent = $target.closest('.survey-researchbox'),
      $checkedLi = $parent.find('li.checked').not($target);

    $checkedLi
      .removeClass('checked')
      .prop('aria-checked', false)
      .find('input')
      .prop('checked', false);
    $target
      .addClass('checked')
      .prop('aria-checked', true)
      .find('input')
      .prop('checked', true);

    this._setEnableSubmit(e);
  },

  /**
   * @desc 더보기 추가된 항목들에 대해 마크업 이벤트가 처리가 안되어 추가 - 자세히 보기
   * @param {Event} e 클릭 이벤트 
   */
  _toggleShowDetail: function(e) {
    var $target = $(e.currentTarget).closest('li');
    if ($target.hasClass('on')) {
      $target.removeClass('on');
    } else {
      $target.addClass('on');
    }
  }
};
