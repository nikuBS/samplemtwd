/**
 *FileNam: myt.join.product.combinations.data-share.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.30
 */

Tw.MyTJoinProductCombinationsDataShare = function(rootEl, combination) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._members = combination.combinationWirelessMemberList;
  this._groupInfo = combination.combinationGroup;

  this.bindEvent();
  this.init();
};

Tw.MyTJoinProductCombinationsDataShare.prototype = {
  init: function() {
    this._remainAmount = Number(this._groupInfo.grpRemainPt);
  },

  bindEvent: function() {
    this.$container.on('click', '.bt-blue1', $.proxy(this._openSharePopup, this));
  },

  _openSharePopup: function() {
    var amounts = [],
      benefitAmount = Math.floor(Number(this._groupInfo.grpOfrPt) / 100) * 100;

    while (benefitAmount >= 1) {
      amounts.push({ value: Tw.FormatHelper.addComma(String(benefitAmount)), disabled: this._remainAmount < benefitAmount });
      benefitAmount = benefitAmount - 100;
    }

    this._popupService.open(
      {
        hbs: 'MS_07_01_03_01',
        remainAmount: this._remainAmount,
        members: this._members,
        amounts: amounts,
        layer: true
      },
      $.proxy(this._handleOpenSharePopup, this)
    );
  },

  _handleOpenSharePopup: function($layer) {
    $layer.on('click', '.radio-slide li', $.proxy(this._handleSelectAmount, this, $layer));
    $layer.on('click', '.bt-red1', $.proxy(this._handleSubmitShare, this, $layer));
    $layer.on('click', '.prev-step', $.proxy(this._closeSharePopup, this));
  },

  _closeSharePopup: function() {
    this._popupService.close();
  },

  _handleSelectAmount: function($layer, e) {
    this._selectedAmount = Number(
      $(e.currentTarget)
        .find('span.fe-value')
        .text()
    );

    $layer.find('.bt-red1 button').removeAttr('disabled');
  },

  _handleSubmitShare: function($layer) {
    this._subjectIdx = $layer.find('.list-comp-input li.checked').data('index') || 0;
    var subject = this._members[this._subjectIdx];
    var groupInfo = this._groupInfo;

    // TODO: SMS 인증
    this._apiService
      .request(Tw.API_CMD.BFF_05_0138, {
        ofrrSvcMgmtNum: groupInfo.svcMgmtNum,
        ofrrSvcProdGrpCd: groupInfo.svcProdGrpCd,
        ofrrSvcProdGrpId: groupInfo.svcProdGrpId,
        befrSvcMgmtNum: subject.svcMgmtNum,
        reqQty: String(this._selectedAmount),
        remainPt: String(this._remainAmount - this._selectedAmount)
      })
      .done($.proxy(this._successSubmit, this));
  },

  _successSubmit: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    } else {
      var subject = this._members[this._subjectIdx];
      this._remainAmount = this._remainAmount - this._selectedAmount;
      this.$container.find('.data-num span.str').text(this._remainAmount);

      if (this._remainAmount < 100) {
        this.$container.find('.bt-slice.mt20').remove();
        this.$container.find('.msg-nodata-left.none').removeClass('none');
      }

      this._popupService.open(
        {
          hbs: 'MS_07_01_03_01_complete',
          name: subject.custNm,
          number: subject.svcNum,
          remainData: this._remainAmount,
          benefitData: this._groupInfo.grpOfrPt
        },
        $.proxy(this._openCompleteSubmitPopup, this)
      );
    }
  },

  _openCompleteSubmitPopup: function($layer) {
    $layer.on('click', '.prev-step', $.proxy(this._closeCompletePopup, this));
  },

  _closeCompletePopup: function() {
    this._popupService.close();
    this._historyService.goBack();
  }
};
