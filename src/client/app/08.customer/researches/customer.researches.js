Tw.CustomerResearches = function(rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._bindEvent();
};

Tw.CustomerResearches.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '.fe-submit', $.proxy(this._handleSubmit, this));
    this.$container.on('click', 'ul.select-list > li', $.proxy(this._setEnableSubmit, this));
    this.$container.on('click', '.fe-hint', $.proxy(this._goHint, this));
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

    if ($target.hasClass('checkbox') && $root.find('ul.select-list li[aria-checked="true"]').length === 0) {
      $btn.attr('disabled', true);
    } else if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
    }
  },

  _goHint: function(e) {
    var url = e.target.getAttribute('data-hint-url');
    Tw.CommonHelper.openUrlExternal(url);
  }
};
