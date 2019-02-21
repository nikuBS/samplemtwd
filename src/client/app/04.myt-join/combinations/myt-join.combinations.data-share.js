/**
 *FileNam: myt.join.product.combinations.data-share.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.30
 */

Tw.MyTJoinCombinationsDataShare = function(rootEl, group) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._group = group;
  this._remain = Number(group.grpRemainPt);

  this._bindEvent();
};

Tw.MyTJoinCombinationsDataShare.prototype = {
  _bindEvent: function() {
    // this.$container.on('click', '.prev-step', $.proxy(this._openCancelPopup, this));
    this.$container.on('click', '.list-comp-input li', $.proxy(this._handleSelectSubject, this));
    this.$container.on('click', '.small li', $.proxy(this._handleSelectAmount, this));
    this.$container.on('click', '#fe-submit', $.proxy(this._handleSubmitShare, this));
  },

  _handleSelectSubject: function(e) {
    this._subject = {
      number: e.currentTarget.getAttribute('data-svc'),
      name: (name = e.currentTarget.getAttribute('data-name'))
    };
  },

  _handleSelectAmount: function(e) {
    var $target = $(e.currentTarget);
    this._selected = $target.data('amount');
    if (!$target.hasClass('disabled') && !this._enable) {
      this.$container.find('#fe-submit').removeAttr('disabled');
      this._enable = true;
    }
  },

  _handleSubmitShare: function() {
    if (!this._subject) {
      var $subject = this.$container.find('.list-comp-input li.checked');
      this._subject = {
        number: $subject.data('svc'),
        name: $subject.data('name')
      };
    }

    this._apiService
      .request(Tw.API_CMD.BFF_05_0138, {
        ofrrSvcMgmtNum: this._group.svcMgmtNum,
        ofrrSvcProdGrpCd: this._group.svcProdGrpCd,
        ofrrSvcProdGrpId: this._group.svcProdGrpId,
        befrSvcMgmtNum: String(this._subject.number),
        reqQty: String(this._selected),
        remainPt: String(this._remain - this._selected)
      })
      .done($.proxy(this._successSubmit, this));
  },

  _successSubmit: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    } else {
      this._popupService.open(
        {
          hbs: 'MS_07_01_03_01_complete',
          name: this._subject.name,
          number: this._subject.number,
          remainData: this._remain - this._selected,
          benefitData: this._group.grpOfrPt,
          layer: true
        },
        null,
        $.proxy(this._closeCompletePopup, this)
      );
    }
  },

  _closeCompletePopup: function() {
    history.back();
  }

  // _openCancelPopup: function() {
  //   this._popupService.openConfirmButton(
  //     Tw.ALERT_CANCEL,
  //     null,
  //     $.proxy(this._goBack, this),
  //     $.proxy(this._handleAfterClose, this),
  //     Tw.BUTTON_LABEL.NO,
  //     Tw.BUTTON_LABEL.YES
  //   );
  // },

  // _goBack: function() {
  //   this._popupService.close();
  //   this._isClose = true;
  // },

  // _handleAfterClose: function() {
  //   if (this._isClose) {
  //     history.back();
  //   }
  // }
};
