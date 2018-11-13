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
  this._tpayPopup = new Tw.TPayJoinLayerPopup(this.$container);
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this.data = params.data;
  this._render();
  this._bindEvent();
  this._initialize();
};

Tw.MyTBenefitMembershipJoin.prototype = {

  _render: function () {
    this.$joinBtn = this.$container.find('[data-id=join-btn]');
    this.$tAgreeCheckBox = this.$container.find('[data-id=all-agree-t]');
    this.$tAgreeItems = this.$container.find('[data-role=TL]');
    this.$cAgreeCheckBox = this.$container.find('[data-id=all-agree-c]');
    this.$cAgreeItems = this.$container.find('[data-role=CL]');
    this.$isCashbagCheckbox = this.$container.find('[data-id=usage_cashbag]');
    this.$cashbagAccodianBtn = this.$container.find('[data-id=cashbag_list]');
    this.$agreeViewBtn = this.$container.find('button.agree-view');
    if ( this.data.type === 'corporate' ) {
      this.$copListBtn = this.$container.find('[data-id=cop-list]');
      this.$emailAddr = this.$container.find('[data-id=email-addr]');
    }
    else if ( this.data.type === 'feature' ) {
      // TODO: 우편번호 공통화 작업 완료 후 처리
      // this.$zipCodeInput = this.$container.find('[data-id=zip-code-input]');
      this.$zipCodeBtn = this.$container.find('[data-id=zip-code]');
      // this.$zipCodeInputDetail_1 = this.$container.find('[data-id=zip-code-input-detail1]');
      // this.$zipCodeInputDetail_2 = this.$container.find('[data-id=zip-code-input-detail2]');
    }
  },

  _bindEvent: function () {
    this.$container.on('click', $.proxy(this._onClickContainer, this));
    this.$joinBtn.on('click', $.proxy(this._onClickJoinBtn, this));
    this.$tAgreeCheckBox.on('click', $.proxy(this._onClickTAgreeCheckbox, this));
    this.$cAgreeCheckBox.on('click', $.proxy(this._onClickCAgreeCheckbox, this));
    this.$tAgreeItems.on('mousedown', $.proxy(this._onClickTAgreeItems, this));
    this.$cAgreeItems.on('mousedown', $.proxy(this._onClickCAgreeItems, this));
    this.$agreeViewBtn.on('click', $.proxy(this._onItemsAgreeView, this));
    this.$isCashbagCheckbox.on('click', $.proxy(this._onClickCashbagCheckbox, this));
    if ( this.data.type === 'corporate' ) {
      this.$copListBtn.on('click', $.proxy(this._onClickCorporateList, this));
    }
    else if ( this.data.type === 'feature' ) {
      this.$zipCodeBtn.on('click', $.proxy(this._onClickZipCodeBtn, this));
    }
  },

  _initialize: function () {

    this.svcNominalRelCd = '010'; // default 본인
    this.myAddress = this.data.svcInfo.addr; // 주소
    this.addrCd = '03'; // 주소구분코드: 자택
    if ( this.data.type === 'corporate' && this.data.isCorporateBody ) {
      this.svcNominalRelCd = this.$copListBtn.attr('data-type');
      this.addrCd = '04'; // 직장
    }
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

  _onClickZipCodeBtn: function () {
    // TODO: 우편번호 검색 공통 영역으로 완료 되면 적용
    this._popupService.openAlert('TBD');
  },

  _onClickTAgreeCheckbox: function (event) {
    var checked = ($(event.target).parents('[role=checkbox]').attr('aria-checked') === 'true');
    this._tAllCheck = checked;
    for ( var i = 0; i < this.$tAgreeItems.length; i++ ) {
      var item = this.$tAgreeItems.eq(i);
      var $input = item.find('input');
      if ( checked ) {
        item.addClass('checked');
        $input.attr('checked', 'checked');
      }
      else {
        item.removeClass('checked');
        $input.removeAttr('checked');
      }
      item.attr('aria-checked', checked);
    }
  },

  _onClickCAgreeCheckbox: function (event) {
    var checked = ($(event.target).parents('[role=checkbox]').attr('aria-checked') === 'true');
    this._cAllCheck = checked;
    for ( var i = 0; i < this.$cAgreeItems.length; i++ ) {
      var item = this.$cAgreeItems.eq(i);
      var $input = item.find('input');
      if ( checked ) {
        item.addClass('checked');
        $input.attr('checked', 'checked');
      }
      else {
        item.removeClass('checked');
        $input.removeAttr('checked');
      }
      item.attr('aria-checked', checked);
    }
  },

  _onClickTAgreeItems: function (event) {
    var $target = $(event.target);
    if ( $target.hasClass('.agree-view') ) {
      this._onItemsAgreeView($target);
    }
    else {
      if ( this._tAllCheck ) {
        this.$tAgreeCheckBox.removeClass('checked').attr('aria-checked', 'false');
        this.$tAgreeCheckBox.find('input').removeAttr('checked');
        this._tAllCheck = false;
        this.$tAgreeItems.trigger('click');
      }
    }
  },

  _onClickCAgreeItems: function (event) {
    var $target = $(event.target);
    if ( $target.hasClass('.agree-view') ) {
      this._onItemsAgreeView($target);
    }
    else {
      if ( this._cAllCheck ) {
        this.$cAgreeCheckBox.removeClass('checked').attr('aria-checked', 'false');
        this.$cAgreeCheckBox.find('input').removeAttr('checked');
        this._cAllCheck = false;
        this.$cAgreeItems.trigger('click');
      }
    }
  },

  _onClickContainer: function () {
    var $items = this.$container.find('[aria-checked=true]:not(.all)');
    var array = [];
    $items.each($.proxy(function (index) {
      if ( $items.eq(index).attr('data-id') && $items.eq(index).attr('data-id').match(/L_/gi).length > 0 ) {
        var $item = $items.eq(index);
        var id = $item.attr('data-id');
        if ( !this._checkOkCashbag ) {
          if ( id === 'L_01' || id === 'L_02' ) {
            array.push($items.eq(index));
          }
        }
        else {
          array.push($items.eq(index));
        }
      }
    }, this));
    // 필수 항목 모두 체크되야 가입하기 버튼 활성화
    if ( this._checkOkCashbag ) {
      if ( array.length === 4 ) {
        this.$joinBtn.removeAttr('disabled');
      }
      else {
        this.$joinBtn.attr('disabled', 'disabled');
      }
    }
    else {
      if ( array.length === 2 ) {
        this.$joinBtn.removeAttr('disabled');
      }
      else {
        this.$joinBtn.attr('disabled', 'disabled');
      }
    }
  },

  _onClickCashbagCheckbox: function (event) {
    var $target = $(event.target);
    var checked = $target.prop('checked');
    if ( !checked ) {
      if ( this.$cAgreeCheckBox.find('input').prop('checked') ) {
        this.$cAgreeCheckBox.find('input').trigger('click');
      }
      this._checkOkCashbag = false;
    }
    else {
      this._checkOkCashbag = true;
    }
    this.$cashbagAccodianBtn.trigger('click');
  },

  _onClickJoinBtn: function () {
    var $items = this.$container.find('[aria-checked=true]');
    var params = {
      mbr_typ_cd: '0', // T 멤버십 리더스카드 만 발급 중
      svc_nominal_rel_cd: this.svcNominalRelCd, // 본인: 010, 직원: 090, 기타: 990
      card_isue_typ_cd: this.data.isFeature ? '0' : '1', // 플라스틱 카드 0, 모바일 카드 1
      skt_news_yn: 'N', // 광고성 정보 수신
      skt_tm_yn: 'N', // 고객 혜택 제공
      sms_agree_yn: 'N', // 멤버십 이용내역 안내
      ocb_accum_agree_yn: 'N', // OKcashbag 기능 추가
      mktg_agree_yn: 'N', // 마케팅활용
      cust_email_addr: '',
      addr_cd: this.addrCd
      // zip: this.$zipCodeInput.val(),
      // bas_addr: this.$zipCodeInputDetail_1.val()
      // dtl_addr: this.$zipCodeInputDetail_2.val()
    };

    if ( this.data.type === 'corporate' ) {
      params.cust_email_addr = this.$emailAddr.val(); // email 주소
    }

    for ( var i = 0; i < $items.length; i++ ) {
      var $item = $items.eq(i);
      switch ( $item.attr('data-type') ) {
        case 'ad':
          params.skt_news_yn = 'Y';
          break;
        case 'bsi':
          params.skt_tm_yn = 'Y';
          break;
        case 'sms':
          params.sms_agree_yn = 'Y';
          break;
        case 'okadd':
          params.ocb_accum_agree_yn = 'Y';
          break;
        case 'mak':
          params.mktg_agree_yn = 'Y';
          break;
      }
    }
    this._apiService.request(Tw.API_CMD.BFF_11_0011, params)
      .done($.proxy(this._onSuccessJoinMembership, this))
      .fail($.proxy(this._onFailJoinMembership, this));
  },

  _onSuccessJoinMembership: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.afterRequestSuccess('/membership/submain', '/membership/mymembership/history',
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.LINK_TITLE, Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.TITLE,
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.CONTENT);
      // TODO: 가입하기 완료 후 TPay 팝업 노출
      // 완료 팝업이 뜬 이후에 T Pay 관련 팝업 띄우기 위함
      setTimeout(this._tpayPopup.open, 500);
    }
    else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _onFailJoinMembership: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  },

  _onItemsAgreeView: function (event) {
    this._agreeViewTarget = $(event.target).siblings('[role="checkbox"]');
    var type = $(event.target).attr('data-type');
    new Tw.MembershipClauseLayerPopup({
      $element: this.$container,
      callback: $.proxy(this._agreeViewCallback, this)
    }).open(type);
  },

  _agreeViewCallback: function () {
    if ( !this._agreeViewTarget.find('input').prop('checked') ) {
      this._agreeViewTarget.find('input').trigger('click');
      this._agreeViewTarget = null;
    }
  }
};