/**
 * FileName: myt.join.product-service.js
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.08.14
 */

Tw.MyTJoinProductService = function (rootEl) {
  this.$container = rootEl;
  this._cachedElement();
  this._bindEvents();
  this._init();
};

Tw.MyTJoinProductService.prototype = {

  _options: {
    'fee-plan': {
      isCall: false,
      callFunction: function() {
        new Tw.MyTJoinProductServiceFeePlan(this.$feePlan);
      }
    },
    'additions': {
      isCall: false,
      callFunction: function() {
        new Tw.MyTJoinProductServiceAdditions(this.$additions);
      }
    },
    'combinations': {
      isCall: false,
      callFunction: function() {
        new Tw.MyTJoinProductServiceCombinations(this.$combinations);
      }
    }
  },

  _cachedElement: function() {
    this.$feePlan = $('#myt-join-fee-plan');
    this.$additions = $('#myt-join-additions');
    this.$combinations = $('#myt-join-combinations');
    this.$tabLinker = this.$container.find('.tab-linker');
  },

  _init: function() {
    if (Tw.FormatHelper.isEmpty(window.location.hash)) {
      window.location.hash = 'fee-plan';
    }

    var initTabKey = window.location.hash.replace('#', '');

    this.$container.find('[data-tab="' + initTabKey + '"]').attr('aria-selected', 'true');
    this._callOptions(initTabKey);
    this._showAndHideTabContents(initTabKey);
  },

  _bindEvents: function() {
    this.$tabLinker.on('click', 'li', $.proxy(this._switchTabContents, this));
  },

  _switchTabContents: function(e) {
    var activeTabKey = $(e.currentTarget).data('tab');

    if (!this._options[activeTabKey].isCall) {
      this._callOptions(activeTabKey);
    }

    window.location.hash = activeTabKey;
    this._showAndHideTabContents(activeTabKey);
  },

  _callOptions: function(tabKey) {
    this._options[tabKey].isCall = true;
    this._options[tabKey].callFunction();
  },

  _showAndHideTabContents: function(tabKey) {
    this.$container.find('.tab-contents').hide();
    this.$container.find('#' + tabKey).show();
  }

};