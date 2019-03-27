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
    this.$container.on('change click', 'li input', $.proxy(this._handleSelectAnswer, this));
    this.$container.on('click', '.fe-go-next', $.proxy(this._goNext, this));
    this.$container.on('click', '.fe-go-prev', $.proxy(this._goPrev, this));
    this.$container.on('keyup', 'textarea.mt10', $.proxy(this._handleTypeEssay, this));
    this.$container.on('click', '.fe-submit-research', $.proxy(this._submitResearch, this));
  },

  _cachedElement: function() {
    this.$questions = _.map(this.$container.find('.poll-box'), function(question) {
      return $(question);
    });
    this.$rateTxt = this.$container.find('.poll-chart-txt > dd');
    this.$rateBar = this.$container.find('.data-bar');
  },

  _handleSelectAnswer: function(e) {
    var $root = this.$questions[this._currentIdx],
      next = e.currentTarget.getAttribute('data-next-question'),
      isEtc = e.currentTarget.getAttribute('data-is-etc'),
      $btn = $root.find('.bt-blue1 button'),
      $etc = $root.find('.fe-etc-area'),
      enable = !$root.data('is-essential'),
      $selected = $root.find('li.checked');

    this._nextIdx = this._getNextQuestion($selected); 
    if ($selected.length > 0) {
      if (e.currentTarget.getAttribute('type') === 'radio') {
        switch (Number(next)) {
          case Tw.CUSTOMER_RESEARCH_NEXT_TYPE.END: {
            $btn.text(Tw.CUSTOMER_RESEARCHES_BUTTONS.SUBMIT).switchClass('fe-go-next', 'fe-submit-research');
            break;
          }
          case Tw.CUSTOMER_RESEARCH_NEXT_TYPE.NEXT: {
            if (this._nextIdx !== this._questionCount) {
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

    if ($etc.length > 0) {
      if (isEtc === 'true' && e.currentTarget.getAttribute('checked')) {
        $etc.removeAttr('disabled');
        enable = $etc.text().length > 0;
      } else {
        $etc.attr('disabled', true).val('');
      }
    }

    this._setButtonStatus($btn, enable);
  },

  _getNextQuestion: function($selected) {
    if ($selected.hasClass('radiobox')) {
      var next_type = $selected.data('next-question') || 0;
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

  _goNext: function(e) {
    var next = this._currentIdx + 1;

    if (this._nextIdx) {
      next = this._nextIdx;
    }

    var $next = this.$questions[next];

    e.currentTarget.setAttribute('data-next-question', next);
    this.$questions[this._currentIdx].addClass('none').attr('aria-hidden', true);

    if ($next) {
      $next.removeClass('none').attr('aria-hidden', false);
      $next.find('.fe-go-prev').attr('data-prev-question', this._currentIdx);
    }

    this._setAnswer();
    var $selected = $next.find('li.checked');
    this._currentIdx = next;
    this._setProgress($selected.length > 0 ? this._getNextQuestion($selected) : next);
    delete this._nextIdx;
    delete this.$maxLength;
  },

  _goPrev: function(e) {
    var prev = Number(e.currentTarget.getAttribute('data-prev-question')),
      $prev = this.$questions[prev];

    this.$questions[this._currentIdx].addClass('none').attr('aria-hidden', true);
    if ($prev) {
      $prev.removeClass('none').attr('aria-hidden', false);
    }

    this._nextIdx = this._currentIdx;

    for (i = prev + 1; i < this._questionCount; i++) {
      this._answers[i] && delete this._answers[i];
    }

    this._currentIdx = prev;
    this._setProgress(this._nextIdx);
    delete this.$maxLength;
  },

  _setProgress: function(idx) {
    var rate = Math.floor((idx / this._questionCount) * 100) + '%';
    this.$rateTxt.text(rate);
    this.$rateBar.width(rate);
  },

  _handleTypeEssay: function(e) {
    var target = e.currentTarget,
      $root = this.$questions[this._currentIdx];
    var byteCount = Tw.InputHelper.getByteCount(target.value);

    if (!this.$maxLength) {
      this.$maxLength = $root.find('.max-byte em');
    }

    while (byteCount > 100) {
      target.value = target.value.slice(0, -1);
      byteCount = Tw.InputHelper.getByteCount(target.value);
    }

    this.$maxLength.text(Tw.FormatHelper.addComma(String(byteCount)));

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
    var values = $.map(this._answers, function(answer, key) {
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

  _successSubmit: function(resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      switch (resp.result) {
        case 'DUPLICATE':
          this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A01, undefined, undefined, this._cloaseResearch);
          break;
        case 'SUCCESS':
          this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A02, undefined, undefined, this._cloaseResearch);
          break;
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _cloaseResearch: function() {
    history.back();
  }
};
