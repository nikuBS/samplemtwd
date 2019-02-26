Tw.CustomerResearches = function(rootEl, researches) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._cachedElement();
  this._bindEvent();
  this._init(researches);
};

Tw.CustomerResearches.prototype = {
  _init: function(researches) {
    this._tmpl = Handlebars.compile($('#fe-templ-researches').html());
    this._researches = _.map(researches, function(research) {
      return $.extend(research, {
        hasHint: research.bnnrRsrchTypCd === 'Q' && research.hintExUrl,
        examples: _.map(research.examples, function(exam, idx) {
          return $.extend(exam, { idx: idx });
        }),
        isRadio: research.bnnrRsrchRpsTypCd === 'S',
        isDoubleAlign: research.bnnrRsrchSortMthdCd === 'D',
        hasImage: research.examples[0] && research.examples[0].image,
        hasEtc: research.examples.length ? research.examples[research.examples.length - 1].isEtc : false,
        hasQuestions: research.bnnrRsrchTypCd === 'R'
      });
    });
    this._leftCount = researches.length;
  },

  _bindEvent: function() {
    this.$container.on('click', '.fe-submit', $.proxy(this._handleSubmit, this));
    this.$container.on('change', 'ul.select-list > li input', $.proxy(this._setEnableSubmit, this));
    this.$container.on('click', '.fe-hint', $.proxy(this._goHint, this));
    this.$container.on('click', '.bt-more', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.fe-nResearch li', $.proxy(this._toggleSelect, this));
  },

  _cachedElement: function() {
    this.$list = this.$container.find('.acco-list');
  },

  _handleSubmit: function(e) {
    var $root = $(e.currentTarget).parents('li.acco-box');
    var $list = $root.find('ul.select-list > li');
    var $etcText = $root.find('textarea.poll-area');
    var answerNumber = $root.data('answer-num');

    var options = {
      bnnrRsrchId: $root.data('research-id'),
      bnnrRsrchTypCd: $root.data('type-code')
    };

    if (answerNumber) {
      options.canswNum = $root.data('answer-num');
    }

    if ($etcText.length > 0) {
      options.etcTextNum = $etcText.data('etc-idx');
      options.etcText = $etcText.val();
    }

    for (var i = 0; i < $list.length; i++) {
      if ($list[i].getAttribute('aria-checked') === 'true') {
        options['rpsCtt' + (i + 1)] = i + 1;
      }
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0035, options).done($.proxy(this._handleSuccessSubmit, this));
  },

  _handleSuccessSubmit: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    switch (resp.result) {
      case 'DUPLICATE':
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A01);
        break;
      case 'SUCCESSY':
      case 'SUCCESSN':
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_RESEARCHES_A02);
        break;
    }
  },

  _setEnableSubmit: function(e) {
    var $target = $(e.currentTarget);
    var $root = $target.parents('li.acco-box');
    var $btn = $root.find('.item-two > .bt-blue1 button');

    if ($target.attr('type') === 'checkbox' && $root.find('ul.select-list li[aria-checked="true"]').length === 0) {
      $btn.attr('disabled', true);
    } else if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
    }
  },

  _goHint: function(e) {
    var url = e.target.getAttribute('data-hint-url');
    Tw.CommonHelper.openUrlExternal(url);
  },

  _handleLoadMore: function(e) {
    this._leftCount = this._leftCount - Tw.DEFAULT_LIST_COUNT;
    var list = this._researches;

    if (this._leftCount > 0) {
      list = this._researches.slice(0, Tw.DEFAULT_LIST_COUNT);
      this._researches = this._researches.slice(Tw.DEFAULT_LIST_COUNT);
    } else {
      $(e.currentTarget).remove();
    }

    this.$list.append(this._tmpl({ researches: list }));
  },

  _toggleSelect: function(e) {
    var $target = $(e.currentTarget),
      $input = $target.find('input'),
      isChecked = $target.attr('aria-checked') === 'true';
    $target.toggleClass('checked');
    if (isChecked) {
      $target.attr('aria-checked', 'false');
      $input.removeAttr('checked');
    } else {
      $target.attr('aria-checked', 'true');
      $input.attr('checked', true);
    }
  }
};
