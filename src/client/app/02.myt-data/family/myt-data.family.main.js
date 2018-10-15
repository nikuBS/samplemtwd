/**
 * FileName: myt-data.family.main.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.01
 */

Tw.MyTDataFamilyMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyMain.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', 'ul.select-list > li', $.proxy(this._handleChangeLimitType, this));
    this.$container.on('keyup', 'span.input > input', $.proxy(this._handleChangeLimitation, this));
    this.$container.on('click', '.toggle-inner-btn > button', $.proxy(this._submitLimitation, this));
  },

  _handleChangeLimitType: function (e) {
    var $target = $(e.currentTarget);
    var $btn = $target.parents('div.acco-content').find('.toggle-inner-btn > button');
    var $input = $target.find('span.input input');
    
    if ($input) {
      $btn.attr('disabled', Number($input.val()) === $target.data('init-value'))
    } else {
      $btn.attr('disabled', !!$target.data('init-value'));
    }
  },

  _handleChangeLimitation: function (e) {
    var $target = $(e.currentTarget);
    var $parent = $target.closest('li');

    $target.parents('div.acco-content').find('.toggle-inner-btn > button').attr('disabled', Number($target.val()) === $parent.data('init-value'));
  },

  _submitLimitation: function (e) {
    var $target = $(e.currentTarget);
    var member = $target.data('member');
    var limitation = $target.parents('div.acco-content').find('li[aria-checked="true"] span.input input').val();

    if (limitation) {
      this._apiService.request(Tw.API_CMD.BFF_06_0050, {
        mbrSvcMgmtNum: member,
        dataQty: limitation
      }).done($.proxy(this._successChangeLimitation, this))
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0051, {
        mbrSvcMgmtNum: member
      }).done($.proxy(this._successChangeLimitation, this))
    }
  },

  _successChangeLimitation: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      this._popupService.toast(Tw.MYT_DATA_FAMILY_TOAST.SUCCESS_CHANGE);
    }
  }
};
