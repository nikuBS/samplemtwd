/**
 * @file 설문조사 < 고객의견 < 이용안내
 * @author Jiyoung Jo
 * @since 2019.04.10
 */

Tw.CustomerResearches = function(rootEl, researches, ctgCd) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$container);
  this._ctgCd = ctgCd;

  this._cachedElement();
  this._bindEvent();
  this._init(researches);
};

Tw.CustomerResearches.prototype = {
  _surveyCtgCd: [
    {
      list: [
        {
          txt: Tw.SURVEY_CATEGORY_STR.ING,
          'radio-attr': 'class="focus-elem" ctgCd="I"',
          'label-attr': ' ',
          ctgCd: 'I'
        },
        {
          txt: Tw.SURVEY_CATEGORY_STR.END,
          'radio-attr': 'class="focus-elem" ctgCd="E"',
          'label-attr': ' ',
          ctgCd: 'E'
        }
      ]
    }
  ],

  /**
   * @desc 설문조사 데이터 변경
   * @param {Array} researches
   * @private
   */
  _init: function(researches) {
    // console.log('_init');
    var _this = this;
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

    if (Tw.FormatHelper.isEmpty(this._ctgCd)) {
      this._ctgCd = 'I';
    }
    
    _.each(this._surveyCtgCd[0].list, function (item) {
      if (item.ctgCd === _this._ctgCd) {
        item['radio-attr'] = item['radio-attr'] + ' checked';
      }
    });

    var selectedCtg = _.find(this._surveyCtgCd[0].list, {
      ctgCd: this._ctgCd
    });
    // console.log('[customer.researches] [_init] selectedCtg', selectedCtg);

    var ctgValue = selectedCtg ? selectedCtg.txt : this._surveyCtgCd[0].list[0].txt;
    // console.log('[customer.researches] [_init] ctgValue', ctgValue);
    this.$container.find('.bt-select').text(ctgValue);

    // console.log('[customer.researches] [_init] researches', researches);
    // this._checkParticipatedSurvey();
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$container.find('.fe-submit').click(_.debounce($.proxy(this._handleSubmit, this), 300));
    this.$container.on('change', 'ul.survey-researchbox > li input', $.proxy(this._handleChangeSelect, this));
    this.$container.on('click', '.fe-hint', $.proxy(this._goHint, this));
    this.$container.on('click', '.fe-bt-more', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.fe-nResearch li.category-type', $.proxy(this._setSelect, this));
    this.$container.on('click', '.fe-nResearch .fe-submit', $.proxy(this._handleSubmit, this));
    this.$container.on('click', '.fe-nResearch .acco-tit', $.proxy(this._toggleShowDetail, this));
    this.$container.on('click', 'a', $.proxy(this._clearForm, this));
    this.$container.on('click', '.fe-link-external:not([href^="#"])', $.proxy(this._openExternalUrl, this));
    this.$container.on('click', '.fe-join-research, .fe-result-research, .fe-join-pollquiz', $.proxy(this._joinResearch, this));
    this.$container.on('click', '.bt-select', $.proxy(this._changeSurveyCategory, this));
  },

  /**
   * @desc jquery 객체 캐싱
   * @private
   */
  _cachedElement: function() {
    // this.$list = this.$container.find('.acco-list');
    this.$list = this.$container.find('.tod-poll-list');
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
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A02, undefined, undefined, undefined, undefined, $target);
        break;
      case 'SUCCESSN':
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A03, undefined, undefined, undefined, undefined, $target);
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
    // var $btn = $root.find('.item-two > .bt-blue1 button');
    var $btn = $root.find('.item-two > li .fe-submit');

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
    // console.log('[_handleLoadMore] this._leftCount', this._leftCount);
    // console.log('[_handleLoadMore] Tw.DEFAULT_LIST_COUNT', Tw.DEFAULT_LIST_COUNT);

    this._leftCount = this._leftCount - Tw.DEFAULT_LIST_COUNT;
    var list = this._researches;

    // console.log('[_handleLoadMore] this._leftCount', this._leftCount);
    // console.log('[_handleLoadMore] this._researches', this._researches);

    if (this._leftCount > 0) {  // 남은 데이터가 20개 이상일 경우
      list = this._researches.slice(0, Tw.DEFAULT_LIST_COUNT);
      this._researches = this._researches.slice(Tw.DEFAULT_LIST_COUNT);
    } else {
      $(e.currentTarget).remove();  // 더보기 버튼 제거
    }

    // console.log('[_handleLoadMore] this._tmpl({ researches: list })', this._tmpl({ researches: list }));

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
  },

  /**
   * @function
   * @desc 외부 브라우저 이동
   * @param $event
   * @private
   */
  _joinResearch: function ($event) {
    var url = $($event.currentTarget).data('url');
    this._historyService.goLoad(url);
  },

  /**
   * @function
   * @desc 카테고리 정렬기준 변경
   * @param 
   */
  _changeSurveyCategory : function (e) {
    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
      data: this._surveyCtgCd
    }, $.proxy(this._onOpenCategoryActionSheet, this), null, 'select-category', this.$container.find('.bt-select'));
  },

  /**
   * @function
   * @desc 등급선택 액션시트 오픈
   * @param {Object} $container
   */
  _onOpenCategoryActionSheet: function ($container) {
    $container.find('li input').change($.proxy(function (event) {
      var ctgCd = $(event.currentTarget).attr('ctgCd');
      // console.log('[customer.researches] [_onOpenCategoryActionSheet] $(event.currentTarget).attr("ctgCd")', $(event.currentTarget).attr('ctgCd'));

      var options = {
        ctgCd: ctgCd
      };

      _.each(this._surveyCtgCd[0].list, function (item) {
        item['radio-attr'] = 'id="' + ctgCd + '-radio"' + 'class="focus-elem" ctgCd="'+item.ctgCd+'"' + (item.ctgCd === ctgCd ? 'checked' : '');
      });

      this._popupService.close();
      this._changeList(options);
    }, this));

    // 웹접근성 대응
    Tw.CommonHelper.focusOnActionSheet($container);
  },

  /**
   * @function
   * @desc 진행중/종료 설문조사 리스트 변경
   * @param {Object} options
   */
  _changeList: function (options) {
    window.location.href = '/customer/svc-info/researches?ctgCd=' + options.ctgCd;
  },

  /**
   * @function
   * @desc 기 참여한 설문조사에 대해서는 '참여완료' 뱃지 적용
   * @private
   */
  _checkParticipatedSurvey: function () {
    var participateInfo = this._participateInfo;

    for (var idx in participateInfo) {
      var participateInfoObj = participateInfo[idx];
      var targetObj = this.$container.find('[data-research-id="' + participateInfoObj.researchId +'"]').find('.poll-question');

      var questionTitle = targetObj.text() + '(참여완료))';
      targetObj.text(questionTitle);

      console.log('[customer.researches] [_checkParticipatedSurvey] targetObj : ', targetObj);
    }
  }
};
