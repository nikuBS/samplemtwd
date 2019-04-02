/**
 * FileName: myt.join.product.combinations.data-share.js
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

  _handleSelectSubject: function(e) { // 데이터 나눠쓰기 대상 변경 시
    this._subject = {
      mgmtNum: e.currentTarget.getAttribute('data-svc'),
      name: e.currentTarget.getAttribute('data-name'),
      phoneNum: e.currentTarget.getAttribute('data-phone-number')
    };
  },

  _handleSelectAmount: function(e) {  // 데이터 나눠쓰기 양 선택 시
    var $target = $(e.currentTarget);
    this._selected = $target.data('amount');

    if (!this._enable) {  // submit 버튼 활성화(나눠쓰기 대상의 경우 default 값이 있어서 데이터 나눠쓰기 변경시에만 submit 버튼 컨트롤)
      this.$container.find('#fe-submit').removeAttr('disabled');
      this._enable = true;
    }
  },

  _handleSubmitShare: function() {  // 나눠쓰기 버튼 클릭시
    if (!this._subject) { // 대상 설정 안되어 있는 경우
      var $subject = this.$container.find('.list-comp-input li.checked'); // 대상 리스트에서 checked된 대상 찾기
      this._subject = {
        mgmtNum: $subject.data('svc'),
        name: $subject.data('name'),
        phoneNum: $subject.data('phone-number')
      };
    }

    this._apiService
      .request(Tw.API_CMD.BFF_05_0138, {
        ofrrSvcMgmtNum: this._group.svcMgmtNum,
        ofrrSvcProdGrpCd: this._group.svcProdGrpCd,
        ofrrSvcProdGrpId: this._group.svcProdGrpId,
        befrSvcMgmtNum: String(this._subject.mgmtNum),
        reqQty: String(this._selected),
        remainPt: String(this._remain - this._selected)
      })
      .done($.proxy(this._successSubmit, this));
  },

  _successSubmit: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    } else {  // 성공시 완료 화면 띄움
      this._popupService.open(
        {
          hbs: 'MS_07_01_03_01_complete',
          name: this._subject.name,
          number: this._subject.phoneNum,
          remainData: this._remain - this._selected,
          benefitData: this._group.grpOfrPt,
          layer: true
        },
        null,
        $.proxy(this._closeCompletePopup, this)
      );
    }
  },

  _closeCompletePopup: function() { // 데이터 나눠쓰기 완료화면 close
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
