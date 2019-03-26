/**
 * FileName: myt-join.suspend.longterm
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 18.
 */
/**
 * 일시정지 내 장기일시정지 탭 관리
 * @param tabEl tab content wrapper
 * @param params
 * @constructor
 */
Tw.MyTJoinSuspendLongTerm = function (tabEl, params) {
  this.TYPE = {
    MILITARY: 1,
    ABROAD: 2
  };

  this.$container = tabEl;
  this._params = params;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._fileDialog = null;

  this._cachedElement();
  this._requestSvcInfo();

  this._defaultMilitaryToDate = this.$container.find('.fe-military [data-role="fe-to-dt"]').val();
  this._defaulAbroadFromeDate = this.$container.find('.fe-abroad [data-role="fe-from-dt"]').val();

  new Tw.InputFocusService(tabEl, this.$btSuspend);
};

Tw.MyTJoinSuspendLongTerm.prototype = {
  _cachedElement: function () {
    this.$optionType = this.$container.find('[data-role="fe-suspend-type"]');
    this.$optionSuspendAll = this.$container.find('[data-role="fe-suspend-all"]');
    this.$btUpload = this.$container.find('.fe-upload-file');
    this.$inputTel = this.$container.find('[data-id="fe-input-tel"]');
    this.$btRelation = this.$container.find('[data-id="fe-relation"]');
    this.$btSuspend = this.$container.find('[data-id="fe-bt-suspend"]');
    this.$inputEmail = this.$container.find('[data-id="fe-input-email"]');
    this.$btnNativeContactList = this.$container.find('.fe-btn_native_contact');
  },

  _bindEvent: function () {
    this.$btUpload.on('click', $.proxy(this._openCommonFileDialog, this));
    this.$optionType.on('change', $.proxy(this._onSuspendTypeChanged, this));
    this.$inputTel.on('keyup', $.proxy(Tw.InputHelper.insertDashCellPhone, this, this.$inputTel));
    this.$btRelation.on('click', $.proxy(this._onClickRelation, this));
    this.$btSuspend.on('click', $.proxy(this._onClickSuspend, this));
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this._changeSuspendType('military');
  },

  _requestSvcInfo: function () {
    Tw.Api.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(function (resp) {
        if ( resp.code === Tw.API_CODE.CODE_00 ) {
          this._svcInfo = resp.result;
          this._bindEvent();
        } else {
          Tw.Error(resp.code, resp.msg).pop();
        }
      }, this));
  },

  /**
   * 신청 사유(군입대/해외체류) 변경 시 호출
   * 기존에 파일 선택이 되어 있으면 파일 삭제 alert 표시
   * @param e
   * @private
   */
  _onSuspendTypeChanged: function (e) {
    var type = e.target.value;
    if ( this._files ) {
      this._popupService.openModalTypeA(Tw.POPUP_TITLE.CONFIRM, Tw.MYT_JOIN_SUSPEND.CONFIRM_RESET_FILE.MESSAGE,
        Tw.MYT_JOIN_SUSPEND.CONFIRM_RESET_FILE.BTNAME, $.proxy(this._onOpenTypeChange, this, type),
        $.proxy(this._changeSuspendType, this, type), null, null, null,  $(e.currentTarget));
    } else {
      this._changeSuspendType(type);
    }
  },

  /**
   * 선택 된 타입 별 입력항목 노출 상태를 변경
   * @param type 군입대: 'military', 해외출국: 'abroad'
   * @private
   */
  _changeSuspendType: function (type) {
    this._files = null;
    this._popupService.close();
    if ( type === 'military' ) {
      this.$container.find('.fe-military').show();
      this.$container.find('.fe-military').attr('aria-hidden', false);
      this.$container.find('.fe-abroad').hide();
      this.$container.find('.fe-abroad').attr('aria-hidden', true);
    } else {
      this.$container.find('.fe-military').hide();
      this.$container.find('.fe-military').attr('aria-hidden', true);
      this.$container.find('.fe-abroad').show();
      this.$container.find('.fe-abroad').attr('aria-hidden', false);
    }
    this.$btSuspend.prop('disabled', true);
  },
  /**
   * 장기일시정지 사유 변경 확인 alert event binding
   * @param type
   * @param $popup
   * @private
   */
  _onOpenTypeChange: function (type, $popup) {
    $popup.find('.tw-popup-closeBtn').on('click', $.proxy(this._cancelSuspendType, this, type));
  },
  /**
   * 장기일시정지 사유 변경 취소 시 radio 선택 취소
   * @param type
   * @private
   */
  _cancelSuspendType: function (type) {
    setTimeout($.proxy(function () {
      this.$optionType.filter('[value!="' + type + '"]').parent().addClass('checked');
      this.$optionType.filter('[value="' + type + '"]').parent().removeClass('checked');
    }, this), 100);
  },
  /**
   * 파일 업로드 다이얼로그(CS_04_01_L02) open
   * @param e
   * @private
   */
  _openCommonFileDialog: function (e) {
    var count, popup;
    if ( !this._fileDialog ) {
      this._fileDialog = new Tw.MytJoinSuspendUpload();
    }
    if ( $(e.target).data('type') === 'fe-military' ) {
      popup = {
        content: Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TIP,
        title: Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TITLE,
        hash: 'tip'
      };
      count = 2;
    } else {
      popup = {
        content: Tw.MYT_JOIN_SUSPEND.LONG.ABROAD.TIP,
        title: Tw.MYT_JOIN_SUSPEND.LONG.ABROAD.TITLE,
        hash: 'tip'
      };
      count = 1;
    }
    this._fileDialog.show($.proxy(this._onCommonFileDialogConfirmed, this),
      count, this._files, null, popup,  $(e.currentTarget));
  },

  /**
   * 파일 첨부 완료 시 일시정지 버튼 활성화
   * @param files
   * @private
   */
  _onCommonFileDialogConfirmed: function (files) {
    this._files = files;
    this.$btSuspend.prop('disabled', false);
  },

  /**
   * Node server로 파일 업로드 요청
   * @param files
   * @private
   */
  _requestUpload: function (files) {
    var formData = new FormData();
    formData.append('dest', Tw.UPLOAD_TYPE.SUSPEND);
    _.map(files, $.proxy(function (file) {
      formData.append('file', file);
    }, this));
    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this))
      .fail($.proxy(this._onError, this));
  },

  _successUploadFile: function (res) {
    // USCAN upload
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var convFileList = res.result.map(function (item) {
        return {
          fileSize: item.size,
          fileName: item.name,
          filePath: item.path
        };
      });
      this._requestUscan(convFileList);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _requestUscan: function (convFileList) {
    this._apiService.request(Tw.API_CMD.BFF_01_0046, {
      recvFaxNum: 'skt257@sk.com',
      proMemo: '', // TBD 필수값임 확인필요
      scanFiles: convFileList
    })
      .done($.proxy(this._onSuccessUscanUpload, this))
      .fail($.proxy(this._onError, this));
  },

  _onSuccessUscanUpload: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._requestSuspend();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onError: function (res) {
    Tw.Error(res.code, res.msg).pop();
  },

  /**
   * 관계 입력항목 선택 시 actionsheet  보임
   * @private
   */
  _onClickRelation: function () {
    var options = $.extend(true, [], Tw.SUSPEND_RELATION.list);
    var selected = _.find(options, { value: this.$btRelation.val() });
    if ( selected ) {
      selected.option = 'checked';
    }
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.SUSPEND_RELATION.title,
      data: [
        { list: _.assign(options, selected) }
      ]
    }, $.proxy(this._selectRelationCallback, this), null, null,  $(event.currentTarget));
  },

  _selectRelationCallback: function ($layer) {
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedRelation, this));
  },

  _setSelectedRelation: function (event) {
    var $selectedValue = $(event.currentTarget);
    var value = $selectedValue.data('value');
    this.$btRelation.text(value);
    this.$btRelation.val(value);
    this._popupService.close();
  },

  /**
   * 장기일시정지 버튼 클릭시
   *  1. Node server로 파일 전송(Tw.NODE_CMD.UPLOAD_FILE)
   *  2. USCAN 전송(BFF_01_0046)
   *  3. 장기일시정지 신청(BFF_01_0046)
   * @private
   */
  _onClickSuspend: function (event) {
    var option = {};
    var from, to, diff, $period;
    if ( this.$optionType.filter('[checked]').val() === 'military' ) {
      //validation check
      $period = this.$container.find('.fe-military.fe-period');
      from = $period.find('[data-role="fe-from-dt"]').val().replace(/-/g, '');
      to = $period.find('[data-role="fe-to-dt"]').val().replace(/-/g, '');
      diff = Tw.DateHelper.getDiffByUnit(from, to, 'months') * -1;
      if ( diff < 0 ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VAILD_PERIOD_01,
          null, null, null, null, $(event.currentTarget));
        return;
      } else if ( diff > 24 ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_LONG_TERM_PERIOD,
          null, null, null, null,  $(event.currentTarget));
        return;
      }
      option.svcChgRsnCd = '21';
      option.fromDt = from;
      option.toDt = to;
    } else {
      //validation check
      from = Tw.DateHelper.getCurrentShortDate();
      $period = this.$container.find('.fe-abroad.fe-date');
      to = $period.find('[data-role="fe-from-dt"]').val().replace(/-/g, '');
      diff = Tw.DateHelper.getDiffByUnit(to, from, 'days');
      if ( diff < 0 ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE,
          null, null, null, null,  $(event.currentTarget));
        return;
      } else if ( diff > 30 ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE_01,
          null, null, null, null,  $(event.currentTarget));
        return;
      }
      option.svcChgRsnCd = '22';
      option.fromDt = this.$container.find('.fe-abroad [data-role="fe-from-dt"]').val().replace(/-/g, '');
    }
    option.icallPhbYn = this.$optionSuspendAll.attr('checked') ? 'Y' : 'N';

    // 추가연락처
    if ( !_.isEmpty(this.$inputTel.val()) ) {
      option.cntcNum = this.$inputTel.val();
      option.cntcNumRelNm = this.$btRelation.val();
    }

    if ( !_.isEmpty(this.$inputEmail.val()) ) {
      option.email = this.$inputEmail.val();
    }
    this._suspendOptions = option;

    if ( Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
      var convFileList = _.compact(this._files).map(function (item) {
        return {
          fileSize: item.size,
          fileName: item.name,
          filePath: item.path
        };
      });
      this._requestUscan(convFileList);
    } else {
      this._requestUpload(this._files);
    }
  },

  _requestSuspend: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0197, this._suspendOptions)
      .done($.proxy(this._onSuccessRequest, this))
      .fail($.proxy(this._onError, this));
  },

  _onSuccessRequest: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._suspendOptions.command = 'longterm';
      this._suspendOptions.svcNum = this._svcInfo.svcNum;
      this._historyService.replaceURL('/myt-join/submain/suspend/complete?' + $.param(this._suspendOptions));
    } else if ( res.code in Tw.MYT_JOIN_SUSPEND.ERROR ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR[res.code] || res.msg,
        null, null, null, null,  $(event.currentTarget));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onClickBtnAddr: function (e) {
    e.stopPropagation();
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      var formatted = Tw.StringHelper.phoneStringToDash(params.phoneNumber);
      this.$inputTel.val(formatted);
      this.$inputTel.trigger('change');
    }
  },

  hasChanged: function () {
    var changed = !_.isEmpty(this._files) ||
      this.$optionType.filter('[checked]').val() !== 'military' ||
      !_.isEmpty(this.$inputEmail.val()) ||
      !_.isEmpty(this.$btRelation.val()) ||
      !_.isEmpty(this.$inputTel.val()) ||
      this._defaultMilitaryToDate !== this.$container.find('.fe-military [data-role="fe-to-dt"]').val() ||
      this._defaulAbroadFromeDate !== this.$container.find('.fe-abroad [data-role="fe-from-dt"]').val();
    return changed;
  },

  _isLowerVersionAndroid: function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion();
    return androidVersion && androidVersion.indexOf('4.4') !== -1;
  }
};