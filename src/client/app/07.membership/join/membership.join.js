/**
 * FileName: benefit.membership.join.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.29
 *
 */

Tw.MyTBenefitMembershipJoin = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this.data = params.data;
  this._render();
  this._bindEvent();
  this._initialize();
};

Tw.MyTBenefitMembershipJoin.prototype = {

  loadingView: function (value, selector) {
    if ( !selector ) {
      selector = '[data-id="container"]';
    }
    if ( value ) {
      Tw.CommonHelper.startLoading(selector, 'grey', true);
    }
    else {
      Tw.CommonHelper.endLoading(selector);
    }
  },

  _render: function () {
    this.$joinBtn = this.$container.find('[data-id=join-btn]');
    this.$tAgreeCheckBox = this.$container.find('[data-id=all-agree-t]');
    this.$tAgreeItems = this.$container.find('[data-role=TL]');
    this.$cAgreeCheckBox = this.$container.find('[data-id=all-agree-c]');
    this.$cAgreeItems = this.$container.find('[data-role=CL]');
    this.$isCashbagCheckbox = this.$container.find('[data-id=usage_cashbag]');
    this.$cashbagList = this.$container.find('[data-id=cashbag_list]');
    this.$agreeViewBtn = this.$container.find('button.more-vw');
    if ( this.data.isCorporateBody ) {
      this.$copListBtn = this.$container.find('[data-id=cop-list]');
      this.$emailAddr = this.$container.find('[data-id=email-addr]');
      this.$emailError = this.$container.find('[data-id=email-error]');
    }
  },

  _bindEvent: function () {
    this.$container.on('click', $.proxy(this._onClickContainer, this));
    this.$joinBtn.on('click', $.proxy(this._onClickJoinBtn, this));
    this.$tAgreeCheckBox.on('click', $.proxy(this._onClickTAgreeCheckbox, this));
    this.$cAgreeCheckBox.on('click', $.proxy(this._onClickCAgreeCheckbox, this));
    this.$tAgreeItems.on('click', $.proxy(this._onClickTAgreeItems, this));
    this.$cAgreeItems.on('click', $.proxy(this._onClickCAgreeItems, this));
    this.$agreeViewBtn.on('click', $.proxy(this._onItemsAgreeView, this));
    this.$isCashbagCheckbox.on('click', $.proxy(this._onClickCashbagCheckbox, this));
    if ( this.data.isCorporateBody ) {
      this.$copListBtn.on('click', $.proxy(this._onClickCorporateList, this));
      this.$emailAddr.on('focusout', $.proxy(this._checkEmailValidation, this));
    }
  },

  _initialize: function () {

    this.svcNominalRelCd = '010'; // default 본인
    this.addrCd = '03'; // 주소구분코드: 자택
    if ( this.data.isCorporateBody ) {
      this.svcNominalRelCd = this.$copListBtn.attr('data-type');
      this.addrCd = '04'; // 직장
    }
  },

  // 이메일 포커스 아웃 시 밸리데이션 추가
  _checkEmailValidation: function (event) {
    var $target = $(event.currentTarget);
    var value = $target.val();
    var isVaild = Tw.ValidationHelper.isEmail(value) || Tw.FormatHelper.isEmpty(value);
    if ( isVaild ) {
      if ( !this.$emailAddr.hasClass('blind') ) {
        this.$emailError.addClass('blind');
      }
    }
    else {
      this.$emailError.removeClass('blind');
    }
    this.isEmailVaild = !isVaild;
  },

  _onClickCorporateList: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.MEMBERSHIP_CORPORATE_LIST,
      data: Tw.POPUP_TPL.MEMBERSHIP_CORPORATE_LIST
    }, $.proxy(this._corporateListPopupCallback, this), null, 'select_nominee');
  },

  _corporateListPopupCallback: function ($layer) {
    var type = this.$copListBtn.attr('data-type');
    $layer.find('#' + type).addClass('checked');
    $layer.find('#' + type).find('input').prop('checked', true);
    $layer.on('click', '.nominal', $.proxy(this._setCorporateValue, this));
  },

  _setCorporateValue: function (event) {
    var $selectedValue = $(event.currentTarget);
    var id = $selectedValue.attr('id');
    this.$copListBtn.attr('data-type', id);
    this.$copListBtn.text($selectedValue.text());
    this.svcNominalRelCd = id;
    this._popupService.close();
  },

  _onClickTAgreeCheckbox: function (event) {
    var checked = $(event.currentTarget).find('input').prop('checked');
    this._tAllCheck = checked;
    for ( var i = 0; i < this.$tAgreeItems.length; i++ ) {
      var item = this.$tAgreeItems.eq(i);
      var $input = item.find('input');
      $input.prop('checked', checked);
    }
  },

  _onClickCAgreeCheckbox: function (event) {
    var checked = $(event.currentTarget).find('input').prop('checked');
    this._cAllCheck = checked;
    for ( var i = 0; i < this.$cAgreeItems.length; i++ ) {
      var item = this.$cAgreeItems.eq(i);
      var $input = item.find('input');
      $input.prop('checked', checked);
    }
  },

  _onClickTAgreeItems: function (event) {
    var $target = $(event.currentTarget).find('input');
    if ( this._tAllCheck && !$target.prop('checked') ) {
      this.$tAgreeCheckBox.find('input').prop('checked', false);
      this._tAllCheck = false;
    }
    else if ( this.$tAgreeItems.find('input').filter(':not(:checked)').length < 1 ) { // 전부 선택 시 모두 자동 선택
      this.$tAgreeCheckBox.find('input').trigger('click');
    }
  },

  _onClickCAgreeItems: function (event) {
    var $target = $(event.currentTarget).find('input');
    if ( this._cAllCheck && !$target.prop('checked') ) {
      this.$cAgreeCheckBox.find('input').prop('checked', false);
      this._cAllCheck = false;
    }
    else if ( this.$cAgreeItems.find('input').filter(':not(:checked)').length < 1 ) { // 전부 선택 시 모두 자동 선택
      this.$cAgreeCheckBox.find('input').trigger('click');
    }
  },

  _onClickContainer: function () {
    var $items = this.$container.find('.custom-form:not(.all)');
    var array = [];
    $items.each($.proxy(function (index) {
      var isLid = $items.eq(index).attr('data-id') && $items.eq(index).attr('data-id').match(/L_/gi);
      if ( isLid && isLid.length > 0 ) {
        var $item = $items.eq(index);
        var $input = $item.find('input');
        var id = $item.attr('data-id');
        if ( !this._checkOkCashbag ) {
          if ( id === 'L_01' || id === 'L_02' || id === 'L_05' ) {
            if ( $input.prop('checked') ) {
              array.push($items.eq(index));
            }
          }
        }
        else {
          if ( $input.prop('checked') ) {
            array.push($items.eq(index));
          }
        }
      }
    }, this));
    // 필수 항목 모두 체크되야 가입하기 버튼 활성화
    if ( this._checkOkCashbag ) {
      if ( array.length === 5 ) {
        this.$joinBtn.removeAttr('disabled');
      }
      else {
        this.$joinBtn.attr('disabled', 'disabled');
      }
    }
    else {
      if ( array.length === 3 ) {
        this.$joinBtn.removeAttr('disabled');
      }
      else {
        this.$joinBtn.attr('disabled', 'disabled');
      }
    }
    // 이메일주소가 잘못된 경우
    if ( this.data.isCorporateBody && this.isEmailVaild ) {
      this.$joinBtn.attr('disabled', 'disabled');
    }
  },

  _onClickCashbagCheckbox: function (event) {
    var $target = $(event.currentTarget).find('input');
    var checked = $target.prop('checked');
    if ( checked ) {
      this.$cashbagList.removeClass('blind');
      this._checkOkCashbag = true;
    }
    else {
      // DV001-15097 OKcashbag 기능 취초 시 알럿 추가
      this._popupService.openConfirmButton(Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A63.MSG, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A63.TITLE,
        $.proxy(function () {
          if ( !this.$cashbagList.hasClass('blind') ) {
            this.$cashbagList.addClass('blind');
          }
          if ( this.$cAgreeCheckBox.find('input').prop('checked') ) {
            this.$cAgreeCheckBox.find('input').trigger('click');
          }
          this._checkOkCashbag = false;
          this._popupService.close();
        }, this), $.proxy(function () {
          if ( this._checkOkCashbag ) {
            this.$isCashbagCheckbox.find('input').trigger('click');
          }
        }, this), Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    }
  },

  _onClickJoinBtn: function () {
    // 이메일주소가 잘못된 경우
    if ( this.data.isCorporateBody && this.isEmailVaild ) {
      this.$joinBtn.attr('disabled', 'disabled');
      return false;
    }
    this._popupService.openModalTypeA(Tw.ALERT_MSG_MEMBERSHIP.JOIN.TITLE, Tw.ALERT_MSG_MEMBERSHIP.JOIN.CONTENT,
      Tw.ALERT_MSG_MEMBERSHIP.JOIN.OK_BTN, null, $.proxy(this._requestMembershipJoin, this), null);
  },

  _requestMembershipJoin: function () {
    this.loadingView(true);
    var $defaultOpt = this.$container.find('input[type=checkbox]');
    var params = {
      mbr_typ_cd: '0', // T 멤버십 리더스카드 만 발급 중
      svc_nominal_rel_cd: this.svcNominalRelCd, // 본인: 010, 직원: 090, 기타: 990
      card_isue_typ_cd: '1', // 플라스틱 카드 0, 모바일 카드 1
      skt_news_yn: 'N', // 광고성 정보 수신
      skt_tm_yn: 'N', // 고객 혜택 제공
      sms_agree_yn: 'N', // 멤버십 이용내역 안내
      ocb_accum_agree_yn: 'N', // OKcashbag 기능 추가
      mktg_agree_yn: 'N', // 마케팅활용
      addr_cd: this.addrCd,
      cust_email_addr: this.$emailAddr.val() || '' // email 주소
    };

    var cashbagCnt = 0;
    for ( var i = 0; i < $defaultOpt.length; i++ ) {
      var $item = $defaultOpt.eq(i);
      var checked = $item.prop('checked');
      switch ( $item.parent().attr('data-type') ) {
        case 'ad':
          if ( checked ) {
            params.skt_news_yn = 'Y';
          }
          break;
        case 'bsi':
          if ( checked ) {
            params.skt_tm_yn = 'Y';
          }
          break;
        case 'sms':
          if ( checked ) {
            params.sms_agree_yn = 'Y';
          }
          break;
        case 'ovc':
          if ( this._checkOkCashbag && checked ) {
            cashbagCnt = 1;
          }
          break;
        case 'odi':
          if ( this._checkOkCashbag && checked ) {
            cashbagCnt = 2;
          }
          break;
        case 'mak':
          if ( this._checkOkCashbag && checked ) {
            params.mktg_agree_yn = 'Y';
          }
          break;
      }
    }
    if ( cashbagCnt === 2 ) {
      params.ocb_accum_agree_yn = 'Y';
    }
    this._apiService.request(Tw.API_CMD.BFF_11_0011, params)
      .done($.proxy(this._onSuccessJoinMembership, this))
      .fail($.proxy(this._onFailJoinMembership, this));
    this._popupService.close();
  },

  _onSuccessJoinMembership: function (resp) {
    this.loadingView(false);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.afterRequestSuccess('/membership/my/history', '/membership/submain',
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.LINK_TITLE, Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.TITLE,
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.CONTENT);
      // 완료 팝업이 뜬 이후에 T Pay 관련 팝업 띄우기 위함
      setTimeout($.proxy(function () {
        new Tw.TPayJoinLayerPopup(this.$container).open();
      }, this), 100);
    }
    else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _onFailJoinMembership: function (resp) {
    this.loadingView(false);
    Tw.Error(resp.code, resp.msg).pop();
  },

  _onItemsAgreeView: function (event) {
    this._agreeViewTarget = $(event.currentTarget).siblings('.custom-form').find('input');
    var type = $(event.currentTarget).attr('data-type');
    if ( type === 'BE_04_02_L09' ) {
      Tw.CommonHelper.openUrlExternal(Tw.POPUP_TPL.MEMBERSHIP_CLAUSE_ITEM['09'].url);
    }
    else {
      new Tw.MembershipClauseLayerPopup({
        $element: this.$container,
        callback: $.proxy(this._agreeViewCallback, this)
      }).open(type);
    }
  },

  _agreeViewCallback: function () {
    if ( !this._agreeViewTarget.prop('checked') ) {
      this._agreeViewTarget.prop('checked', true);
      this._agreeViewTarget = null;
    }
  }
};