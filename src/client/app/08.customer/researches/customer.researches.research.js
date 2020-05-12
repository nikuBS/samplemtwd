/**
 * @file 설문조사 < 고객의견 < 이용안내
 * @author Jiyoung Jo
 * @since 2019.04.10
 */

Tw.CustomerResearch = function(rootEl, researchInfo) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._researchInfo = researchInfo;

  // console.log('this._researchInfo ===== ', this._researchInfo);
  // console.log('후속설문 id, this._researchInfo.fwupQstnId ===== ', this._researchInfo.fwupQstnId);
  // console.log('후속설문 제목, this._researchInfo.fwupQstnTitleNm ===== ', this._researchInfo.fwupQstnTitleNm);
  // console.log('후속설문 기 참여 여부, this._researchInfo.fwupCmplYn ===== ', this._researchInfo.fwupCmplYn);
  // console.log('현재 설문 제목, this._researchInfo.qstnTitleNm ===== ', this._researchInfo.qstnTitleNm);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerResearch.prototype = {
  /**
   * @desc 초기화
   * @private
   */
  _init: function() {
    this._currentIdx = 0;
    this._answers = {};
    this._questionCount = this.$questions.length;
    this._surveyType = $('div.poll-box').data('type-code');   // 퀴즈/투표 유형 (Q,P)

    // console.log('this._surveyType', this._surveyType);
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    // this.$container.on('change click', 'li input', $.proxy(this._handleSelectAnswer, this));
    this.$container.on('click', 'li input', $.proxy(this._handleSelectAnswer, this));
    this.$container.on('click', '.fe-hint', $.proxy(this._goHint, this));
    this.$container.on('click', '.fe-go-next', $.proxy(this._goNext, this));
    this.$container.on('click', '.fe-go-prev', $.proxy(this._goPrev, this));
    this.$container.on('keyup', 'textarea.mt10', $.proxy(this._handleTypeEssay, this));
    this.$container.on('click', '.fe-submit-research', $.proxy(this._submitResearch, this));
    this.$container.on('click', '.fe-poll-quiz-submit', $.proxy(this._handleSubmit, this));
  },

  /**
   * @desc jquery 객체 캐싱
   * @private
   */
  _cachedElement: function() {
    this.$questions = _.map(this.$container.find('.poll-box'), function(question) {
      return $(question);
    });
    // this.$rateTxt = this.$container.find('.poll-chart-txt > dd');
    this.$rateTxt = this.$container.find('.progress-value');
    this.$rateBar = this.$container.find('.data-bar');
  },

  /**
   * @desc 답변 선택 시 다음 문항(분기형의 경우 답변마다 다음 문항번호가 다름) 지정 및 하단 버튼 활성화
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _handleSelectAnswer: function(e) {  
    var $root = this.$questions[this._currentIdx],
      $target = $(e.currentTarget),
      isEtc = e.currentTarget.getAttribute('data-is-etc'),
      $parent = $target.closest('.select-list'),
      $checkedLi = $parent.find('[aria-checked="true"]').not($target),
      $etc = $root.find('.fe-etc-area');

    // console.log('[_handleSelectAnswer] $root', $root);
    // console.log('[_handleSelectAnswer] 중복체크 가능여부', $target.parents('li').hasClass('checkbox') ? '중복체크 가능' : '중복체크 불가');
    
    // console.log('[_handleSelectAnswer] $checkedLi.length', $checkedLi.length);
    // console.log('[_handleSelectAnswer] $checkedLi', $checkedLi);
    
    /**********************************************
    * 퀴즈(Q) 나 투표(P) 인 경우
    **********************************************/
    if (this._surveyType !== undefined) {
      console.log('[_handleSelectAnswer]', '퀴즈 또는 투표');

      // var $btn = $root.find('.fe-poll-quiz-submit');
      var $btn = $('.fe-poll-quiz-submit');
      var enable = true;

      $checkedLi.attr('aria-checked', false);              // 선택한 항목 외 라디오박스 체크 비활성화
      $target.parents('li').attr('aria-checked', true);    // 선택한 라디오박스 체크 활성화
      // $root.find('.fe-poll-quiz-submit').removeAttr('disabled');    // 참여하기 버튼 활성화

      // console.log('[_handleSelectAnswer] $etc.length', $etc.length);
      // console.log('[_handleSelectAnswer] isEtc', isEtc);
      // console.log('[_handleSelectAnswer] $target.parents("li").attr("aria-checked")', $target.parents('li').attr('aria-checked'));

      if ($etc.length > 0) {  // 기타 보기가 선택된 경우
        if (isEtc === 'true' && $target.parents('li').attr('aria-checked')) {
          $etc.removeAttr('disabled');
          enable = $etc.text().length > 0;
        } else {
          $etc.attr('disabled', true).val('');

          if (!this.$maxLength) {
            this.$maxLength = $root.find('.max-byte em');
          }
          this.$maxLength.text(0);  // 입력 바이트 노출
        }
      }

      // console.log('[_handleSelectAnswer] enable', enable);
    } 
    /**********************************************
    * 설문조사 (R) 인 경우
    **********************************************/
    else {
      console.log('[_handleSelectAnswer]', '설문조사');
      
      if ($target.parents('li').hasClass('checkbox')) {
        console.log('checkbox (중복선택 가능');
        // console.log('[_handleSelectAnswer] $target.parents("li").attr("aria-checked")', $target.parents('li').attr('aria-checked'));

        if ($target.parents('li').attr('aria-checked') === 'true') {                         // 기 선택된 항목을 다시 한번 체크하는 경우 aria-checked=false 처리한다.
          // console.log('기 선택되어 있던 항목을 다시 체크하는 경우');
          $target.parents('li').attr('aria-checked', false).removeClass('checked');

          // console.log('$target.attr("data-is-etc")', $target.attr('data-is-etc'));
          if ($target.attr('data-is-etc') === 'true') {
            // console.log('test area 비활성화 처리');
            $root.find('.fe-etc-area').attr('disabled', true).val('');
            isEtc = 'false';

            if (!this.$maxLength) {
              this.$maxLength = $root.find('.max-byte em');
            }
            this.$maxLength.text(0);  // 입력 바이트 노출
          }

        } else {
          console.log('선택되어 있지 않던 항목을 체크하는 경우');
          $target.parents('li').attr('aria-checked', true).addClass('checked');     // 선택한 라디오박스 체크 활성화
        }        
      } else {
        console.log('radiobox (중복선택 불가');
        $checkedLi.attr('aria-checked', false).removeClass('checked');            // 선택한 항목 외 라디오박스 체크 비활성화
        $target.parents('li').attr('aria-checked', true).addClass('checked');     // 선택한 라디오박스 체크 활성화
      }

      var next = e.currentTarget.getAttribute('data-next-question'),
        $btn = $root.find('.fe-bt-change button'),
        enable = !$root.data('is-essential'),
        $selected = $root.find('li.checked');

      // console.log('[_handleSelectAnswer] next', next);
      // console.log('[_handleSelectAnswer] $selected.length', $selected.length);
      // console.log('[_handleSelectAnswer] $selected', $selected);
      // console.log('[_handleSelectAnswer] enable', enable);
      // console.log('[_handleSelectAnswer] $btn', $btn);
      // console.log('[_handleSelectAnswer] this._currentIdx', this._currentIdx);

      this._nextIdx = this._getNextQuestion($selected); // 다음 문항 번호 지정
      // console.log('[_handleSelectAnswer] this._nextIdx', this._nextIdx);

      if ($selected.length > 0) { // selected 된 답변이 있는 경우
        if (e.currentTarget.getAttribute('type') === 'radio') { // 라디오 타입인 경우 분기 처리
          switch (Number(next)) {
            case Tw.CUSTOMER_RESEARCH_NEXT_TYPE.END: {  // 다음 문항이 설문 종료일 경우
              $btn.text(Tw.CUSTOMER_RESEARCHES_BUTTONS.SUBMIT).switchClass('fe-go-next', 'fe-submit-research');
              break;
            }
            case Tw.CUSTOMER_RESEARCH_NEXT_TYPE.NEXT: { // 다음 문항으로 이동일 경우
              if (this._nextIdx !== this._questionCount) {  // 다음 문항이 설문종료가 아닌 경우
                $btn.text(Tw.CUSTOMER_RESEARCHES_BUTTONS.NEXT).switchClass('fe-submit-research', 'fe-go-next');
              }
              break;
            }
            default: {
              $btn.text(Tw.CUSTOMER_RESEARCHES_BUTTONS.NEXT).switchClass('fe-submit-research', 'fe-go-next');
              break;
            }
          }
        }

        enable = true;
      }

      var list = $root.find('ul.select-list li.checked');
      // console.log('$root.find("ul.select-list li.checked")', $root.find('ul.select-list li.checked'));

      list.each(function (idx) {
        // console.log('list.eq(idx).children()', list.eq(idx).children());
        // console.log('list.eq(idx).find("[data-is-etc="true"]").length', list.eq(idx).find('[data-is-etc="true"]').length);

        if (list.eq(idx).find('[data-is-etc="true"]').length > 0) {
          isEtc = 'true';
        }
      });

      // console.log('[_handleSelectAnswer] $etc.length', $etc.length);
      // console.log('[_handleSelectAnswer] $etc', $etc);
      // console.log('[_handleSelectAnswer] isEtc', isEtc);
      // console.log('[_handleSelectAnswer] $(e.currentTarget)', $(e.currentTarget));
      // console.log('[_handleSelectAnswer] enable (1)', enable);

      if ($etc.length > 0) {  // 기타 보기가 선택된 경우
        if (isEtc === 'true') {
          $etc.removeAttr('disabled');
          // console.log('$etc.text()', $etc.text());
          // console.log('$etc.text().length', $etc.text().length);
          // console.log('$($etc).val()', $($etc).val());
          // console.log('$($etc).val().length', $($etc).val().length);
          enable = $($etc).val().length > 0;
        } else {
          $etc.attr('disabled', true).val('');
        }
      }
      // console.log('[_handleSelectAnswer] enable (2)', enable);
    }
    this._setButtonStatus($btn, enable);
  },

  /**
   * @desc 다음 문항 index 가져오기
   * @param {$ojbect} $selected 선택된 답변
   * @private
   */
  _getNextQuestion: function($selected) { // 다음 문항 index 가져오기
    if ($selected.hasClass('radiobox')) {
      var next_type = $selected.find('input').data('next-question') || 0;
      switch (next_type) {
        case Tw.CUSTOMER_RESEARCH_NEXT_TYPE.END: {
          return this._questionCount;
        }
        case Tw.CUSTOMER_RESEARCH_NEXT_TYPE.NEXT: {
          return this._currentIdx + 1;
        }
        default: {
          return next_type - 1;
        }
      }
    }

    return this._currentIdx + 1;
  },

  /**
   * @desc 이전으로, 다음으로, 제추랗기 버튼 활성화 처리
   * @param {$object} $btn 활성화 처리될 버튼
   * @param {boolean} enable 활성화 여부
   * @private
   */
  _setButtonStatus: function($btn, enable) {
    if (enable) {
      $btn.removeAttr('disabled');
      if (this._surveyType === undefined) {
        this._setProgress(this._nextIdx);
      }
    } else {
      $btn.attr('disabled', true);
      if (this._surveyType === undefined) {
        this._setProgress(this._currentIdx);
        delete this._nextIdx;
      }
    }
  },

  /**
   * @desc '다음으로' 클릭한 경우
   * @param {Event} e 클릭이벤트
   * @private
   */
  _goNext: function(e) {
    // console.log('[_goNext] this._currentIdx', this._currentIdx);
    // console.log('[_goNext] this._nextIdx', this._nextIdx);
    var next = this._currentIdx + 1;
    
    if (this._nextIdx) {
      next = this._nextIdx;
    }
    // console.log('[_goNext] next', next);

    var $next = this.$questions[next];
    // console.log('[_goNext] $next', $next);

    e.currentTarget.setAttribute('data-next-question', next);
    this.$questions[this._currentIdx].addClass('none').attr('aria-hidden', true); // 현재 문항 비노출

    if ($next) {  // 다음 문항이 있을 경우 다음 문항 노출
      $next.removeClass('none').attr('aria-hidden', false);
      $next.find('.fe-go-prev').attr('data-prev-question', this._currentIdx);
    }

    this._setAnswer();  // 현재 문항에 대한 답변 추가
    var $selected = $next.find('li.checked');
    this._currentIdx = next;
    // console.log('[_goNext] this._currentIdx', this._currentIdx);
    this._setProgress($selected.length > 0 ? this._getNextQuestion($selected) : next);  // 진행률 계산
    delete this._nextIdx;
    delete this.$maxLength;
  },

  /**
   * @desc '이전으로 클릭한 경우
   * @param {Event} e 클릭이벤트
   * @private
   */
  _goPrev: function(e) {  
    var prev = Number(e.currentTarget.getAttribute('data-prev-question')),
      $prev = this.$questions[prev];

    this.$questions[this._currentIdx].addClass('none').attr('aria-hidden', true); // 현재 문항 비노출
    if ($prev) {
      $prev.removeClass('none').attr('aria-hidden', false); // 이전 문항 노출
    }

    this._nextIdx = this._currentIdx;

    for (i = prev + 1; i < this._questionCount; i++) {
      this._answers[i] && delete this._answers[i];  // 답변에서 다음 문항 지움
    }

    this._currentIdx = prev;
    this._setProgress(this._nextIdx); // 진행률 계산
    delete this.$maxLength;
  },

  /**
   * @desc 진행률 표시 처리
   * @param {number} idx 진행중인 설문 문항 번호
   * @private
   */
  _setProgress: function(idx) {
    var rate = Math.floor((idx / this._questionCount) * 100) + '%';
    this.$rateTxt.text(rate);
    this.$rateBar.width(rate);
  },

  /**
   * @desc 주관식, 기타 항목에 키보드 입력이 들어온 경우 
   * @param {Event} e 타입이벤트
   * @private
   */
  _handleTypeEssay: function(e) { 
    var target = e.currentTarget,
      $root = this.$questions[this._currentIdx];
    var byteCount = Tw.InputHelper.getByteCount(target.value);

    if (!this.$maxLength) {
      this.$maxLength = $root.find('.max-byte em');
    }

    while (byteCount > 100) { // 최대 100Byte 입력 가능, 그 이상 입력된 경우 지움
      target.value = target.value.slice(0, -1);
      byteCount = Tw.InputHelper.getByteCount(target.value);
    }

    this.$maxLength.text(Tw.FormatHelper.addComma(String(byteCount)));  // 입력 바이트 노출

    // 설문조사 인 경우
    if (this._surveyType === undefined) {
      var $btn = $root.find('.fe-bt-change button');

      if (target.value.length === 0) {
        if (this._nextIdx !== this._currentIdx) {
          this._setProgress(this._currentIdx);
          this._nextIdx = this._currentIdx;
        }
      } else if (!this._nextIdx || this._nextIdx === this._currentIdx) {
        this._setProgress(this._currentIdx + 1);
        this._nextIdx = this._currentIdx + 1;
      }

      var $etc = $root.find('.fe-etc-area');
      // console.log('[_handleTypeEssay] $($etc).val()', $($etc).val());
      // console.log('[_handleTypeEssay] $($etc).val().length', $($etc).val().length);
  
      if ($root.data('is-essential') && !target.value.length) {
        $btn.attr('disabled', true);
      } else if ($btn.attr('disabled')) {
        $btn.attr('disabled', false);
      }
    } 
    // 투표 또는 퀴즈 인 경우
    else {
      // var $btn = $root.find('.fe-poll-quiz-submit');
      var $btn = $('.fe-poll-quiz-submit');

      if (!target.value.length) {
        $btn.attr('disabled', true);
      } else if ($btn.attr('disabled')) {
        $btn.attr('disabled', false);
      }
    }
    
  },

  /**
   * @desc 서버에 응답 제출을 위한 응답 object 셋팅(BFF 인풋 파라미터가 특이함)
   * @private
   */
  _setAnswer: function() {  
    var $root = this.$questions[this._currentIdx],
      answerType = $root.data('answer-type'),
      answer = {
        inqNum: String(this._currentIdx + 1),
        inqItmTyp: answerType
      },
      inqRpsCtt = '',
      $etc = $root.find('.fe-etc-area'),
      $list = $root.find('ul.select-list li'),
      listLen = $list.length || 0,
      i = 0;

    if (answerType === 2) { // 주관식인 경우
      var text = $root.find('textarea.mt10').val();
      if (text.length === 0) {
        return;
      }
      inqRpsCtt = text;
    } else {  // 라디오 or 체크박스
      for (; i < listLen; i++) {
        if ($list[i].getAttribute('aria-checked') === 'true') {
          if (inqRpsCtt) {
            inqRpsCtt += ',';
          }
          inqRpsCtt += i + 1;
        }
      }

      if ($etc.length > 0) {  // 기타항목이 있는 경우
        answer.etcTextNum = $etc.data('etc-idx'); // 기타 항목 번호 서버에 전달해줘야 함
        answer.etcText = $etc.val();
      }
    }

    answer.inqRpsCtt = inqRpsCtt;

    this._answers[this._currentIdx] = answer;
  },

  /**
   * @desc 설문조사 제출
   * @private
   */
  _submitResearch: function() { 
    this._setAnswer();  // 마지막 문항 추가
    var values = $.map(this._answers, function(answer) {
      return answer;
    });

    this._apiService
      .request(Tw.API_CMD.BFF_08_0036, {
        qstnId: this.$container.data('research-id'),
        totalCnt: values.length,
        agrmt: values
      })
      .done($.proxy(this._successSubmit, this));
  },

  /**
   * @desc 설문조사 제출 응답 시
   * @param {object} resp 서버 응답
   * @private
   */
  _successSubmit: function(resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      switch (resp.result) {
        case 'DUPLICATE': // 기참여인경우
          this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A01, undefined, undefined, this._closeResearch);
          break;
        case 'SUCCESS':
          // console.log('Case 내부 다음설문 id, this._researchInfo.fwupQstnId ==== ', this._researchInfo.fwupQstnId);
          // console.log('Case 내부 현재설문 제목, this._researchInfo.fwupQstnId ==== ', this._researchInfo.qstnTitleNm);
          // console.log('Case 내부 다음설문 제목, this._researchInfo.fwupQstnId ==== ', this._researchInfo.fwupQstnTitleNm);
          // console.log('Case 내부 다음설문 기 참여 여부, this._researchInfo.fwupCmplYn ==== ', this._researchInfo.fwupCmplYn);

          // 다음 설문 id가 있고 다음 설문이 이미 참여하지 않았을 경우에만 true
            if ((!Tw.FormatHelper.isEmpty(this._researchInfo.fwupQstnId)) && (this._researchInfo.fwupCmplYn === 'N')) {
              var PopupData = Tw.CUSTOMER_RESEARCHES_BUTTONS;
              this._popupService.openModalTypeA(  // 공유 확인 팝업
                  PopupData.TITLE.replace('{curSurTn}', this._researchInfo.qstnTitleNm),
                  PopupData.NEXT_RESEARCHE_POPUP.replace('{nextSurTn}', this._researchInfo.fwupQstnTitleNm),
                  PopupData.SUBMIT,
                  null,
                  $.proxy(this._onNextSurvey, this),
                  $.proxy(this._popupCloseCallback, this),
                  'nextSurvey',
                  undefined,
                  this
                  // $(e.currentTarget)  // 웹접근성 포커스 처리를 위한 jquery 객체
              );
          } else {  // 다음 설문 id가 없거나 이미 다음 설문을 진행한 경우
            this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A02, undefined, undefined, this._closeResearch);
          }
          break;
      } // end of switch
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },


  /**
   * @desc 다음 설문조사가 존재하는 경우 팝업에서 참여하기 버튼 클릭 시
   * @private
   */
  _onNextSurvey: function() {
    // this._historyService.resetHistory(-1);
    // this._popupService.close();
    this._popupService.closeAllAndGo('/customer/svc-info/researches?id=' + this._researchInfo.fwupQstnId);
    // this._historyService.goLoad('/customer/svc-info/researches?id=' + this._researchInfo.fwupQstnId);
    // this._historyService.replace('/customer/svc-info/researches?id=' + this._researchInfo.fwupQstnId);
    // this._popupService.close();
  },


  /**
   * @desc 다음 설문조사가 존재하는 경우 팝업에서 취소 버튼 클릭 시
   * @param {Event} e 클릭이벤트
   * @private
   */
  _popupCloseCallback: function(e) {
    // this._popupService.closeAllAndGo('/customer/svc-info/researches');
    this._popupService.close();
    this._closeResearch();
  },



  /**
   * @desc 퀴즈/투표 제출
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _handleSubmit: function(e) {
    var $target = $(e.currentTarget),
      $root = $target.parents('li.acco-box');

    // var $this = $target.parents('div.poll-box');
    var $this = $('div.poll-box');

    var researchId = $this.data('research-id');
    var researchTypCd = $this.data('type-code');
    var researchAnswerNum = $this.data('answer-num');

    var $etcText = $this.find('textarea.poll-area');
    var $list = $this.find('ul.select-list > li');

    // console.log('researchId', researchId);
    // console.log('researchTypCd', researchTypCd);
    // console.log('researchAnswerNum', researchAnswerNum);

    var options = {
      bnnrRsrchId: $this.data('research-id'),
      bnnrRsrchTypCd: $this.data('type-code')
    };

    if (researchTypCd === 'Q' && researchAnswerNum) {
      options.canswNum = researchAnswerNum;  // 정답번호 서버에 전달해야 함
    }

    // console.log('$etcText.length', $etcText.length);

    if ($etcText.length > 0) {
      options.etcTextNum = $etcText.data('etc-idx');  // 기타 문항번호 서버에 전달해야 함
      options.etcText = $etcText.val();

      // console.log('options.etcTextNum', options.etcTextNum);
      // console.log('options.etcText', options.etcText);
    }

    // console.log('$list.length', $list.length);

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
   * @desc 설문조사 참여 완료시
   * @param {$object} $target 저장하기 버튼(팝업 닫은 후 포커싱 처리를 위한 객체)
   * @param {object} resp 서버응답 데이터
   */
  _handleSuccessSubmit: function($target, resp) {
    console.log('research.research', '[_handleSuccessSubmit]');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    switch (resp.result) {
      case 'DUPLICATE':
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A01, undefined, undefined, this._closeResearch, undefined, $target);
        break;
      case 'SUCCESSY':
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A02, undefined, undefined, this._closeResearch, undefined, $target);
        break;
      case 'SUCCESSN':
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A03, undefined, undefined, this._closeResearch, undefined, $target);
        break;
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
   * @desc 설문조사 닫기
   * @private
   */
  _closeResearch: function() {
    // this._popupService.closeAllAndGo('/customer/svc-info/researches');
    // this._historyService.replace('/customer/svc-info/researches');
    location.href = '/customer/svc-info/researches';
    // history.back();
  }
};
