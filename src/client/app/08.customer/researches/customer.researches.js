/*
 * FileName: customer.researches.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerResearches = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init();

  this._bindEvent();
};

Tw.CustomerResearches.prototype = {
  _bindEvent: function () {
    this.$container.on('click', 'li.bt-blue1 > button', $.proxy(this._handleParticipate, this));
    this.$container.on('click', 'li.bt-white2 > button', $.proxy(this._handleShowResult, this));
    this.$container.on('click', 'ul.select-list > li', $.proxy(this._setAvailableBtn, this));
    this.$container.on('click', '.fe-hint', $.proxy(this._goHint, this));
  },

  _handleParticipate: function (e) {
    var questionId = $(e.currentTarget).data('question-id');

    if (questionId) {
      // 설문 시작하기
      this._history.goLoad('researches/' + questionId);
    } else {
      // 참여하기 버튼 클릭
      var $root = $(e.currentTarget).parents('li.acco-box');
      var $list = $root.find('ul.select-list > li');
      var $etcText = $root.find('textarea.fe-etc-area');

      var options = {
        bnnrRsrchId: $root.data('research-id'),
        bnnrRsrchTypCd: $root.data('type-code'),
        canswNum: $root.data('answer-num'),
        etcTextNum: $etcText.data('etc-idx'),
        etcText: $etcText.val()
      };

      for (var i = 0; i < $list.length; i++) {
        if ($list[i].getAttribute('aria-checked') === 'true') {
          options['rpsCtt' + (i + 1)] = i + 1;
        }
      }

      this._apiService.request(Tw.API_CMD.BFF_08_0035, options)
        .done($.proxy(this._successParticipation, this));
    }
  },

  _successParticipation: function (resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      switch (resp.result) {
        case 'DUPLICATE':
          this._popupService.openAlert(Tw.MSG_CUSTOMER.RESEARCH_A01);
          break;
        case 'SUCCESSY':
        case 'SUCCESSN':
          this._popupService.openAlert(Tw.MSG_CUSTOMER.RESEARCH_A02);
          break;
      }
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },

  _handleShowResult: function (e) {
    // 결과보기
    var $root = $(e.currentTarget).parents('li.acco-box');
    var researchId = $root.data('research-id');
    this._history.goLoad('/customer/researches/result?researchId=' + researchId);
  },

  _setAvailableBtn: function (e) {
    var $target = $(e.currentTarget);
    var $root = $target.parents('li.acco-box');
    var selectedLi = $root.find('ul.select-list li[aria-checked="true"]');
    var $btn = $root.find('.bt-blue1 button');

    if (selectedLi.length === 0 && $target.hasClass('checkbox')) {
      $btn.attr('disabled', true);
    } else if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
    }
  },

  _goHint: function (e) {
    var url = e.target.getAttribute('data-hint-url');
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
        type: Tw.NTV_BROWSER.EXTERNAL,
        href: url
      });
    } else {
      window.open(url);
    }
  }
};

var goLink = function (url) {
  if (!url.includes('http')) {
    url = 'http://' + url;
  }

  if (Tw.BrowserHelper.isApp()) {
    this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
      type: Tw.NTV_BROWSER.EXTERNAL,
      href: url
    });
  } else {
    window.open(url);
  }
};