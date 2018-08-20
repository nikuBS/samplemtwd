/**
 * FileName: myt.benefit.discount.detail.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.14
 */

Tw.MyTBenefitDisCntDetail = function (params) {
  this._popupService = Tw.Popup;
  this.$container = params.$element;
  this.data = params.data;
  this.type = params.type;
  this._history = new Tw.HistoryService(this.$container);

  this._rendered();
  this._bindEvent();
};

Tw.MyTBenefitDisCntDetail.prototype = {
  _rendered: function () {
    // 정보확인
    this.$verifyInfoBtn = this.$container.find('.bt-blue1');
    // 혜택자세히보기
    this.$scrutinyBtn = this.$container.find('.bt-white1');
  },

  _bindEvent: function () {
    this.$verifyInfoBtn.on('click', $.proxy(this._moveToVerifyInfoPage, this));
    this.$scrutinyBtn.on('click', $.proxy(this._moveToScruinyPage, this));
  },

  _moveToVerifyInfoPage: function () {
    switch ( this.type ) {
      case 'dis':
      case 'fee':
      case 'welf':
        if ( this.data.empty ) {
          // 비대상 (TBD) - 요금상품 페이지가 동일한 것으로 추정
          this._popupService.openAlert('TBD');
        }
        else {
          // 대상 (선택요금약정, 휴대폰요금약정, 복지고객할인)
          this._history.goLoad('/myt/join/contract-terminal');
        }
        break;
      case 'fund':
      case 'long':
        // 대상,비대상 모두 약정할인 및 단말분할 상황 정보로 이동 (T 지원금 약정, 장기고객가입)
        this._history.goLoad('/myt/join/contract-terminal');
        break;
      case 'prdc':
        if ( this.data.empty ) {
          // 비대상 (TBD)
          this._popupService.openAlert('TBD');
        }
        else {
          // 대상 (결합상품목록)
          this._history.goLoad('/myt/join/product-service');
        }
        break;
    }
  },

  _moveToScruinyPage: function () {
    this._popupService.openAlert('TBD');
    switch ( this.type ) {
      case 'dis':
        // TBD
        break;
      case 'fund':
        // TBD
        break;
      case 'fee':
        // TBD
        break;
      case 'prdc':
        // TBD
        break;
      case 'long':
        // TBD
        break;
      case 'welf':
        // TBD
        break;
    }
  }
};