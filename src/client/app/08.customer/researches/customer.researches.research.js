Tw.CustomerResearch = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerResearch.prototype = {
  _init: function() {
    this._currentIdx = 0;
    this._answers = {};
    this._questionCount = this.$questions.length;
  },

  _bindEvent: function() {
    this.$container.on('click', '.select-list > li', $.proxy(this._handleSelectAnswer, this));
    this.$container.on('click', '.fe-go-next', $.proxy(this._goNext, this));
    this.$container.on('click', '.fe-go-prev', $.proxy(this._goPrev, this));
    this.$container.on('change', 'ul.select-list input', $.proxy(this._setAvailableBtn, this));
    this.$container.on('keyup', 'textarea.mt10', $.proxy(this._handleTypeEssay, this));
    this.$container.on('click', '#fe-submit-research', $.proxy(this._submitResearch, this));
  },

  _cachedElement: function() {
    this.$questions = _.map(this.$container.find('.poll-box'), function(question) {
      return $(question);
    });
    this.$rateTxt = this.$container.find('.poll-chart-txt > dd');
    this.$rateBar = this.$container.find('.data-bar');
  },

  _handleSelectAnswer: function(e) {
    var next = e.currentTarget.getAttribute('data-next-question');
    if (e.currentTarget.getAttribute('aria-checked') === 'true') {
      if (next) {
        this._nextIdx = Number(next) - 1;
      }
    } else {
      delete this._nextIdx;
    }
  },

  _goNext: function(e) {
    var next = this._nextIdx || this._currentIdx + 1,
      $next = this.$questions[next];

    e.currentTarget.setAttribute('data-next-question', next);
    this.$questions[this._currentIdx].addClass('none');

    if ($next) {
      $next.removeClass('none');
      $next.find('.fe-go-prev').attr('data-prev-question', this._currentIdx);
    }

    this._setAnswer();
    this._setProgress(next);
    this._currentIdx = next;
    delete this._nextIdx;
  },

  _goPrev: function(e) {
    var prev = Number(e.currentTarget.getAttribute('data-prev-question')),
      $prev = this.$questions[prev];

    this.$questions[this._currentIdx].addClass('none');
    if ($prev) {
      $prev.removeClass('none');
    }

    this._nextIdx = this._currentIdx;
    delete this._answers[prev];
    this._currentIdx = prev;
    this._setProgress(prev);
  },

  _setProgress: function(idx) {
    var rate = Math.floor((idx / this._questionCount) * 100) + '%';
    this.$rateTxt.text(rate);
    this.$rateBar.width(rate);
  },

  _setAvailableBtn: function(e) {
    var $root = this.$questions[this._currentIdx];
    var selectedLi = $root.find('ul.select-list li[aria-checked="true"]');
    var $btn = $root.find('.bt-blue1 button');

    if (selectedLi.length === 0 && !e.target.getAttribute('checked')) {
      $btn.attr('disabled', true);
    } else if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
    }
  },

  _handleTypeEssay: function(e) {
    var target = e.currentTarget;
    var $root = this.$questions[this._currentIdx];

    var $btn = $root.find('.bt-blue1 button');

    if ($root.data('is-essential') && (!target.value || target.value === '')) {
      $btn.attr('disabled', true);
    } else if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
    }
  },

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

    if (answerType === 2) {
      var text = $root.find('textarea.mt10').val();
      if (text.length === 0) {
        return;
      }
      inqRpsCtt = text;
    } else {
      for (; i < listLen; i++) {
        if ($list[i].getAttribute('aria-checked') === 'true') {
          if (inqRpsCtt) {
            inqRpsCtt += ',';
          }
          inqRpsCtt += i + 1;
        }
      }

      if ($etc.length > 0) {
        answer.etcTextNum = $etc.data('etc-idx');
        answer.etcText = $etc.val();
      }
    }

    answer.inqRpsCtt = inqRpsCtt;
    this._answers[this._currentIdx] = answer;
  },

  _submitResearch: function() {
    // submit
    this._setAnswer();
    var values = Object.values(this._answers);

    this._apiService
      .request(Tw.API_CMD.BFF_08_0036, {
        qstnId: this.$container.data('research-id'),
        totalCnt: this._questionCount,
        agrmt: values
      })
      .done($.proxy(this._successParticipation, this));
  },

  _successParticipation: function(resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      switch (resp.result) {
        case 'DUPLICATE':
          this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A01, undefined, undefined, this._popupService.close);
          break;
        case 'SUCCESS':
          this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A02, undefined, undefined, this._popupService.close);
          break;
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }
};
