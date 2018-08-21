/**
 * FileName: myt.join.product-service.js
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.08.14
 */

Tw.MyTJoinProductService = function (rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvents();
  this._init();
};

Tw.MyTJoinProductService.prototype = {
  _options: {
    'fee-plan': {
      isCall: false,
      callFunction: function () {
        new Tw.MyTJoinProductServiceFeePlan(this.$feePlan);
      }
    },
    'additions': {
      isCall: false,
      callFunction: function () {
        new Tw.MyTJoinProductServiceAdditions(this.$additions);
      }
    },
    'combinations': {
      isCall: false,
      callFunction: function () {
        new Tw.MyTJoinProductServiceCombinations(this.$combinations);
      }
    }
  },

  _cachedElement: function () {
    this.$feePlan = this.$container.find('#feeplan-contents');
    this.$additions = this.$container.find('#additions-contents');
    this.$combinations = this.$container.find('#combinations-contents');
    this.$tabLinker = this.$container.find('.tab-linker');
  },

  _init: function () {
    if (Tw.FormatHelper.isEmpty(window.location.hash)) {
      this._historyService.goHash('fee-plan');
    }

    var initTabKey = window.location.hash.replace('#', '');

    this.$container.find('#' + initTabKey + '-tab').attr('aria-selected', 'true');
    this._callOptions(initTabKey);
  },

  _bindEvents: function () {
    this.$tabLinker.on('click', 'li', $.proxy(this._switchTabContents, this));
  },

  _switchTabContents: function (e) {
    var activeTabKey = $(e.currentTarget).attr('id').replace('-tab', '');

    if (!this._options[activeTabKey].isCall) {
      this._callOptions(activeTabKey);
    }

    this._historyService.goHash(activeTabKey);
  },

  _callOptions: function (tabKey) {
    this._options[tabKey].isCall = true;
    this._options[tabKey].callFunction.apply(this);
  }
};