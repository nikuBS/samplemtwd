/**
 * @file 데이터 나눠쓰기 < 나의 결합상품 < 나의 가입 정보 < MyT
 * @author Jiyoung Jo
 * @since 2018.10.30
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
  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    // this.$container.on('click', '.prev-step', $.proxy(this._openCancelPopup, this));
    this.$container.on('click', '.list-comp-input li', $.proxy(this._handleSelectSubject, this));
    this.$container.on('click', '.small li', $.proxy(this._handleSelectAmount, this));
    this.$container.on('click', '#fe-submit', $.proxy(this._handleSubmitShare, this));
  },

  /**
   * @desc 데이터 나눠쓰기 대상 변경 시
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _handleSelectSubject: function(e) { 
    this._subject = {
      mgmtNum: e.currentTarget.getAttribute('data-svc'),
      name: e.currentTarget.getAttribute('data-name'),
      phoneNum: e.currentTarget.getAttribute('data-phone-number')
    };
  },

  /**
   * @desc 데이터 나눠쓰기 양 변경 시
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _handleSelectAmount: function(e) {  
    var $target = $(e.currentTarget);
    this._selected = $target.data('amount');

    if (!this._enable) {  // submit 버튼 활성화(나눠쓰기 대상의 경우 default 값이 있어서 데이터 나눠쓰기 변경시에만 submit 버튼 컨트롤)
      this.$container.find('#fe-submit').removeAttr('disabled');
      this._enable = true;
    }
  },

  /**
   * @desc 나눠쓰기 버튼 선택
   * @private
   */
  _handleSubmitShare: function() {  
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

  /**
   * @desc 나눠쓰기 요청에 대한 응답이 돌아온 경우
   * @param {object} resp BFF 응답
   */
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

  /**
   * @desc 클로즈 팝업
   * @private
   */
  _closeCompletePopup: function() { // 데이터 나눠쓰기 완료화면 close
    history.back();
  }
};
