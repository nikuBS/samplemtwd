/**
 * @file 설문조사 < 고객의견 < 이용안내
 * @author Jiyoung Jo
 * @since 2019.04.10
 */

Tw.CustomerResearch = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

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
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$container.on('change click', 'li input', $.proxy(this._handleSelectAnswer, this));
    this.$container.on('click', '.fe-go-next', $.proxy(this._goNext, this));
    this.$container.on('click', '.fe-go-prev', $.proxy(this._goPrev, this));
    this.$container.on('keyup', 'textarea.mt10', $.proxy(this._handleTypeEssay, this));
    this.$container.on('click', '.fe-submit-research', $.proxy(this._submitResearch, this));
  },

  /**
   * @desc jquery 객체 캐싱
   * @private
   */
  _cachedElement: function() {
    this.$questions = _.map(this.$container.find('.poll-box'), function(question) {
      return $(question);
    });
    this.$rateTxt = this.$container.find('.poll-chart-txt > dd');
    this.$rateBar = this.$container.find('.data-bar');
  },

  /**
   * @desc 답변 선택 시 다음 문항(분기형의 경우 답변마다 다음 문항번호가 다름) 지정 및 하단 버튼 활성화
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _handleSelectAnswer: function(e) {  
    var $root = this.$questions[this._currentIdx],
      next = e.currentTarget.getAttribute('data-next-question'),
      isEtc = e.currentTarget.getAttribute('data-is-etc'),
      $btn = $root.find('.bt-blue1 button'),
      $etc = $root.find('.fe-etc-area'),
      enable = !$root.data('is-essential'),
      $selected = $root.find('li.checked');

    this._nextIdx = this._getNextQuestion($selected); // 다음 문항 번호 지정
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

    if ($etc.length > 0) {  // 기타 보기가 선택된 경우
      if (isEtc === 'true' && e.currentTarget.getAttribute('checked')) {  
        $etc.removeAttr('disabled');
        enable = $etc.text().length > 0;
      } else {
        $etc.attr('disabled', true).val('');
      }
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
      this._setProgress(this._nextIdx);
    } else {
      $btn.attr('disabled', true);
      this._setProgress(this._currentIdx);
      delete this._nextIdx;
    }
  },

  /**
   * @desc '다음으로' 클릭한 경우
   * @param {Event} e 클릭이벤트
   * @private
   */
  _goNext: function(e) { 
    var next = this._currentIdx + 1;
    
    if (this._nextIdx) {
      next = this._nextIdx;
    }

    var $next = this.$questions[next];

    e.currentTarget.setAttribute('data-next-question', next);
    this.$questions[this._currentIdx].addClass('none').attr('aria-hidden', true); // 현재 문항 비노출

    if ($next) {  // 다음 문항이 있을 경우 다음 문항 노출
      $next.removeClass('none').attr('aria-hidden', false);
      $next.find('.fe-go-prev').attr('data-prev-question', this._currentIdx);
    }

    this._setAnswer();  // 현재 문항에 대한 답변 추가
    var $selected = $next.find('li.checked');
    this._currentIdx = next;
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

    var $btn = $root.find('.bt-blue1 button');

    if (target.value.length === 0) {
      if (this._nextIdx !== this._currentIdx) {
        this._setProgress(this._currentIdx);
        this._nextIdx = this._currentIdx;
      }
    } else if (!this._nextIdx || this._nextIdx === this._currentIdx) {
      this._setProgress(this._currentIdx + 1);
      this._nextIdx = this._currentIdx + 1;
    }

    if ($root.data('is-essential') && !target.value.length) {
      $btn.attr('disabled', true);
    } else if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
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
          this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A02, undefined, undefined, this._closeResearch);
          break;
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @desc 설문조사 닫기
   * @private
   */
  _closeResearch: function() {
    history.back();
  }
};
