
/*
 * FileName: customer.researches.research.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerResearch = function (rootEl) {
  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._init();
  this._bindEvent();
};

Tw.CustomerResearch.prototype = {
  _init: function () {
    this._currentStep = 1;
  },

  _bindEvent: function () {
    this.$container.on('click', 'li.bt-white2', $.proxy(this._handleGoToBefore, this));
    this.$container.on('click', 'li.bt-blue1', $.proxy(this._handleGoToNext, this));
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
  },

  _handleGoToNext: function (e) {
    // 다음으로 클릭
    var $target = $(e.currentTarget);
    var $root = $(e.target).closest('.poll-space-inner');

    if ($target.hasClass('fe-submit')) {
      this._submitResearch();
    } else if ($target.hasClass('fe-go-next')) {
      this._goToQuestion(this._currentStep + 1);
    } else {
      var $checkedLi = $root.find('li[aria-checked="true"]');

      var nextQuestion = $checkedLi.data('next-question');

      if (!nextQuestion) {
        this._goToQuestion(this._currentStep + 1);
      } else if (nextQuestion === '0') {
        this._submitResearch();
      } else {
        this._goToQuestion(nextQuestion);
      }
    }
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
  },

  _goHash: function (hash) {
    this._history.setHistory();
    this._history.goHash(hash);
  }
};