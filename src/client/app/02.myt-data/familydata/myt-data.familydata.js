/**
 * FileName: myt-data.familydata.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.01
 */

Tw.MyTDataFamily = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
};

Tw.MyTDataFamily.prototype = {
  MAX_LIMITATION: 200,

  _bindEvent: function() {
    this.$container.on('click', '.fe-setting-limit', $.proxy(this._openChangeLimit, this));
  },

  _successChangeLimitation: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      this._popupService.toast(Tw.MYT_DATA_FAMILY_TOAST.SUCCESS_CHANGE);
      if (this.$limitBtn) {
        this.$limitBtn.data('limitation', this._limitation);
        if (this._limitation === false) {
          this.$limitBtn
            .parent()
            .find('span')
            .text(Tw.T_FAMILY_MOA_NO_LIMITATION);
        } else {
          this.$limitBtn
            .parent()
            .find('span')
            .text(this._limitation + Tw.DATA_UNIT.GB);
        }
      }
    }
  },

  _openChangeLimit: function(e) {
    var $target = $(e.currentTarget),
      $li = $target.parents('li'),
      member = $li.data('member'),
      limitation = $target.data('limitation');

    this.$limitBtn = $target;
    this._popupService.open(
      {
        hbs: 'DC_02_03',
        member: member,
        limitation: limitation,
        data: $li.find('.r-txt').html()
      },
      $.proxy(this._handleOpenChangeLimitation, this, member.mgmtNum, limitation)
    );
  },

  _handleOpenChangeLimitation: function(mgmtNum, limitation, $layer) {
    $layer.on('click', '.bt-red1', $.proxy(this._handleSubmitLimitation, this, mgmtNum, limitation));
    $layer.on('click', '.prev-step', this._popupService.close);
    $layer.on('change', 'input[type="radio"]', $.proxy(this._handleChangeLimitType, this, $layer));
    $layer.on('keyup', 'span.input input', $.proxy(this._handleChangeLimitation, this, $layer));
  },

  _handleSubmitLimitation: function(mgmtNum, originLimit) {
    var limitation = this._limitation;

    if (originLimit === limitation) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.A5);
    } else if (limitation === false) {
      this._popupService.close();
      this._apiService.request(Tw.API_CMD.BFF_06_0051, {}, {}, [mgmtNum]).done($.proxy(this._successChangeLimitation, this));
    } else if (this.MAX_LIMITATION < Number(limitation)) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.A6.MSG, Tw.ALERT_MSG_MYT_DATA.A6.TITLE);
    } else {
      this._popupService.close();
      this._apiService
        .request(Tw.API_CMD.BFF_06_0050, {
          mbrSvcMgmtNum: mgmtNum,
          dataQty: limitation
        })
        .done($.proxy(this._successChangeLimitation, this));
    }
  },

  _handleChangeLimitType: function($layer, e) {
    var inputId = e.currentTarget.id;
    var $btn = $layer.find('.bt-red1 > button'),
      $input = $layer.find('span.input input'),
      value = $input.val();

    if (inputId === 'sradio2') {
      $btn.attr('disabled', value.length === 0);
      $input.removeAttr('disabled');
      this._limitation = value;
    } else {
      $btn.attr('disabled', false);
      $input.attr('disabled', true);
      this._limitation = false;
    }
  },

  _handleChangeLimitation: function($layer, e) {
    var value = e.currentTarget.value,
      lastChar = value[value.length - 1];

    if (lastChar === '.' || lastChar === '-') {
      e.currentTarget.value = value.slice(0, -1);
    }

    $layer.find('.bt-red1 > button').attr('disabled', value.length === 0);
    this._limitation = value;
  }

  // _handleClickClose: function() {
  //   this._popupService.close();
  // this._popupService.openConfirmButton(
  //   Tw.ALERT_CANCEL,
  //   null,
  //   $.proxy(this._goBack, this),
  //   $.proxy(this._handleAfterClose, this),
  //   Tw.BUTTON_LABEL.NO,
  //   Tw.BUTTON_LABEL.YES
  // );
  // }

  // _goBack: function() {
  //   this._popupService.close();
  //   this._isClose = true;
  // },

  // _handleAfterClose: function() {
  //   if (this._isClose) {
  //     history.back();
  //     this._isClose = false;
  //   }
  // }
};
