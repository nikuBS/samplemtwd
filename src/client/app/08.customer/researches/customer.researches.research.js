
/*
 * FileName: customer.researches.research.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerResearch = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.CustomerResearch.prototype = {
  MAX_ESSAY_BYTES: 100,
  _init: function () {
    this._currentStep = 1;
    this._answers = {};
    this._questionCount = this.$progress.data('question-count') || 1;
  },

  _bindEvent: function () {
    this.$container.on('click', 'li.bt-white2', $.proxy(this._handleGoToBefore, this));
    this.$container.on('click', 'li.bt-blue1', $.proxy(this._handleGoToNext, this));
    this.$container.on('change', 'ul.select-list input', $.proxy(this._setAvailableBtn, this));
    this.$container.on('keyup', 'textarea.mt10', $.proxy(this._handleTypeEssay, this));
  },

  _cachedElement: function () {
    this.$progress = this.$container.find('.poll-chart-sbox');
  },

  _handleGoToBefore: function (e) {
    // 이전으로 클릭
    var beforeQuestion = $(e.currentTarget).data('before-question');

    if (beforeQuestion === 'main') {
      this._currentStep = 1;
      this._goHash(beforeQuestion);
    } else {
      this._currentStep = beforeQuestion;
      this._goHash('q' + beforeQuestion);
    }

    this._setProgressBar();
  },

  _handleGoToNext: function (e) {
    // 다음으로 클릭
    var $target = $(e.currentTarget);
    var $root = this.$container.find(this._currentStep > 1 ? '#q' + this._currentStep : '#main');

    this._setAnswers($root);

    if ($target.hasClass('fe-submit')) {
      this._submitResearch();
    } else if ($target.hasClass('fe-go-next')) {
      this._goToQuestion(this._currentStep + 1);
    } else {
      var $checkedLi = $root.find('li[aria-checked="true"]');

      var nextQuestion = $checkedLi.data('next-question');

      if (!nextQuestion) {
        this._goToQuestion(this._currentStep + 1);
      } else {
        this._goToQuestion(nextQuestion);
      }
    }

    this._setProgressBar();
  },

  _setProgressBar: function () {
    var nProgress = Math.floor((this._currentStep - 1) / this._questionCount * 100) + '%';
    this.$progress.find('dd').text(nProgress);
    this.$progress.find('.data-bar').width(nProgress);
  },

  _goToQuestion: function (nextQuestion) {
    if (this._currentStep <= 1) {
      this.$container.find('#q' + nextQuestion + ' li.bt-white2').attr('data-before-question', 'main');
    } else {
      this.$container.find('#q' + nextQuestion + ' li.bt-white2').attr('data-before-question', this._currentStep);
    }
    this._currentStep = nextQuestion;
    this._goHash('q' + nextQuestion);
  },

  _submitResearch: function () {
    // 참여하기 클릭
    this._history.setHistory();
    var values = Object.values(this._answers);
    this._apiService.request(Tw.API_CMD.BFF_08_0036, {
      qstnId: this.$container.data('research-id'),
      totalCnt: values.length,
      agrmt: values
    }).done($.proxy(this._successParticipation, this));
  },

  _successParticipation: function (resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      switch (resp.result) {
        case 'DUPLICATE':
          this._popupService.openAlert(Tw.MSG_CUSTOMER.RESEARCH_A01, undefined, undefined, $.proxy(this._goBack, this));
          break;
        case 'SUCCESS':
          this._popupService.openAlert(Tw.MSG_CUSTOMER.RESEARCH_A02, undefined, undefined, $.proxy(this._goBack, this));
          break;
      }
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg, undefined, undefined, $.proxy(this._goBack, this));
    }
  },

  _goBack: function () {
    this._history.goBack();
  },

  _setAvailableBtn: function (e) {
    var $root = this.$container.find(this._currentStep > 1 ? '#q' + this._currentStep : '#main');
    var selectedLi = $root.find('ul.select-list li[aria-checked="true"]');
    var $btn = $root.find('.bt-blue1 button');

    if (selectedLi.length === 0 && !e.target.getAttribute('checked')) {
      $btn.attr('disabled', true);
    } else if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
    }
  },

  _handleTypeEssay: function (e) {
    var target = e.currentTarget;
    var byteCount = Tw.InputHelper.getByteCount(target.value);

    while (byteCount > this.MAX_ESSAY_BYTES) {
      target.value = target.value.slice(0, -1);
      byteCount = Tw.InputHelper.getByteCount(target.value);
    }

    var $root = this.$container.find(this._currentStep > 1 ? '#q' + this._currentStep : '#main');
    $root.find('.max-byte em').text(byteCount);

    var $btn = $root.find('.bt-blue1 button');

    if ($root.data('necessary') && !target.value) {
      $btn.attr('disabled', true);
    } else if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
    }
  },

  _setAnswers: function ($root) {
    var answerType = $root.data('answer-type');
    var answers = {
      inqNum: this._currentStep.toString(),
      inqItmTyp: answerType
    };

    var inqRpsCtt = '';
    var $etc = $root.find('.fe-etc-area');

    if (answerType === 0) {
      var selectedInput = $root.find('ul.select-list li[aria-checked="true"] input');
      inqRpsCtt = selectedInput.attr('title');
    } else if (answerType === 1) {
      var selectedInputs = $root.find('ul.select-list li[aria-checked="true"] input');
      for (var i = 0; i < selectedInputs.length; i++) {
        if (i > 0) {
          inqRpsCtt += ', ';
        }

        inqRpsCtt += selectedInputs[i].getAttribute('title');
      }
    } else {
      inqRpsCtt = $root.find('textarea.mt10').val();
    }
    answers.inqRpsCtt = inqRpsCtt;

    if ($etc) {
      answers.etcTextNum = $etc.data('etc-area');
      answers.etcText = $etc.val();
    }

    this._answers[this._currentStep] = answers;
  },

  _goHash: function (hash) {
    this._history.replaceURL('#' + hash);
  }
};