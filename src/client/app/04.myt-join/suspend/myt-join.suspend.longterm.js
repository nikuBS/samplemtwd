/**
 * @file myt-join.suspend.longterm
 * @author Hyeryoun Lee
 * @since 2018-10-18
 */
/**
 * @class
 * @desc 일시정지 내 장기일시정지 탭 관리
 * @param tabEl tab content wrapper
 * @param params 서버에서 전달하는 값
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
  this._uscanCompleted = false;
  this._cachedElement();
  this._requestSvcInfo();

  this._defaultMilitaryToDate = this.$container.find('.fe-military [data-role="fe-to-dt"]').val();
  this._defaulAbroadFromeDate = this.$container.find('.fe-abroad [data-role="fe-from-dt"]').val();
  // [OP002-4422] 일시정지 기간 입력 시 vaildation check
  this.militaryToDate = this.$container.find('.fe-military [data-role="fe-to-dt"]').val();
  this.militaryFromDate = this.$container.find('.fe-military [data-role="fe-from-dt"]').val();
  this.abroadFromeDate = this.$container.find('.fe-abroad [data-role="fe-from-dt"]').val();
  new Tw.InputFocusService(tabEl, this.$btSuspend);
};

Tw.MyTJoinSuspendLongTerm.prototype = {
  /**
   * @function
   * @desc Cache elements for binding events.
   * @returns {void}
   */
  _cachedElement: function () {
    this.$optionType = this.$container.find('[data-role="fe-suspend-type"]');
    this.$optionSuspendAll = this.$container.find('[data-role="fe-suspend-all"]');
    this.$btUpload = this.$container.find('.fe-upload-file');
    this.$inputTel = this.$container.find('[data-id="fe-input-tel"]');
    this.$btRelation = this.$container.find('[data-id="fe-relation"]');
    this.$btSuspend = this.$container.find('[data-id="fe-bt-suspend"]');
    this.$inputEmail = this.$container.find('[data-id="fe-input-email"]');
    this.$btnNativeContactList = this.$container.find('.fe-btn_native_contact');
    this.$militaryType = this.$container.find('[data-id="fe-military-type"]');
    // [OP002-4422] 일시정지 기간 입력 시 vaildation check
    this.$inputDateSelect = this.$container.find('[data-role="fe-date-select"]');
  },
  /**
   * @function
   * @desc Bind events to elements.
   */
  _bindEvent: function () {
    this.$btUpload.on('click', $.proxy(this._openCommonFileDialog, this));
    this.$optionType.on('change', $.proxy(this._onSuspendTypeChanged, this));
    this.$inputTel.on('keyup', $.proxy(Tw.InputHelper.insertDashCellPhone, this, this.$inputTel));
    this.$btRelation.on('click', $.proxy(this._onClickRelation, this));
    this.$btSuspend.on('click', _.debounce($.proxy(this._onClickSuspend, this), 500));
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    // [OP002-4422] 일시정지 기간 입력 시 vaildation check
    this.$inputDateSelect.on('focus', 'input[type="date"]', $.proxy(this._onFocusDateSelect, this));
    this.$inputDateSelect.on('change', 'input[type="date"]', $.proxy(this._onChangeDateSelect, this));
    this._changeSuspendType('military');
  },
  /**
   * @function
   * @desc SvcInfo 요청
   */
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
   * @function
   * @desc 신청 사유(군입대/해외체류) 변경 시 호출
   * 기존에 파일 선택이 되어 있으면 파일 삭제 alert 표시
   * @param e
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
   * @function
   * @desc 선택 된 타입 별 입력항목 노출 상태를 변경
   * @param type 군입대: 'military', 해외출국: 'abroad'
   */
  _changeSuspendType: function (type) {
    this._files = null;
    this._uscanCompleted = false;
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
      this.$militaryType.prop('checked', false);
    }
    this.$btSuspend.prop('disabled', true);
  },
  /**
   * @function
   * @desc 장기일시정지 사유 변경 확인 alert event binding
   * @param type
   * @param $popup
   */
  _onOpenTypeChange: function (type, $popup) {
    $popup.find('.tw-popup-closeBtn').on('click', $.proxy(this._cancelSuspendType, this, type));
  },
  /**
   * @function
   * @desc 장기일시정지 사유 변경 취소 시 radio 선택 취소
   * @param type
   */
  _cancelSuspendType: function (type) {
    setTimeout($.proxy(function () {
      this.$optionType.filter('[value!="' + type + '"]').parent().addClass('checked');
      this.$optionType.filter('[value="' + type + '"]').parent().removeClass('checked');
      if( type === 'military' ){
        this.$militaryType.prop('checked', false);
      }
    }, this), 100);
  },
  /**
   * @function
   * @desc 파일 업로드 다이얼로그(CS_04_01_L02) open
   * @param e
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
   * @function
   * @desc 파일 첨부 완료 시 일시정지 버튼 활성화
   * @param files
   */
  _onCommonFileDialogConfirmed: function (files) {
    this._files = files;
    this._uscanCompleted = false;
    this.$btSuspend.prop('disabled', false);
  },
  /**
   * @function
   * @desc Node server로 파일 업로드 요청
   * @param files
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
  /**
   * @function
   * @desc Success call back for _requestUpload
   * @param res
   */
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
  /**
   * @function
   * @desc USCAN 요청
   * @param convFileList
   * @private
   */
  _requestUscan: function (convFileList) {
    this._apiService.request(Tw.API_CMD.BFF_01_0046, {
      recvFaxNum: 'skt257@sk.com',
      proMemo: '', // TBD 필수값임 확인필요
      scanFiles: convFileList
    })
      .done($.proxy(this._onSuccessUscanUpload, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success call back for _requestUscan
   * @param res
   */
  _onSuccessUscanUpload: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._uscanCompleted = true;
      this._requestSuspend();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  /**
   * @function
   * @desc Error call back
   * @param res
   */
  _onError: function (res) {
    Tw.Error(res.code, res.msg).pop();
  },
  /**
   * @function
   * @desc 관계 입력항목 선택 시 actionsheet 보임
   */
  _onClickRelation: function () {
    var options = $.extend(true, [], Tw.SUSPEND_RELATION.list);
    var selected = _.find(options, { 'radio-attr' : 'data-value="'+this.$btRelation.val()+ '"' });
    if ( selected ) {
      selected['radio-attr'] += ' checked';
    }
    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' },
      data:  [ {list :  _.assign(options, selected)}]
    }, $.proxy(this._selectRelationCallback, this), null, null,  $(event.currentTarget));
  },
  /**
   * @function
   * @desc 관계 입력 팝업 event binding
   * @param $layer popup layer element
   */
  _selectRelationCallback: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer);
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedRelation, this));
  },
  /**
   * @function
   * @desc Event listener for the button click on [data-value=*]
   * @param event
   */
  _setSelectedRelation: function (event) {
    var $selectedValue = $(event.currentTarget);
    var value = $selectedValue.data('value');
    this.$btRelation.text(value);
    this.$btRelation.val(value);
    this._popupService.close();
  },
  /**
   * @function
   * @desc 장기일시정지 버튼 클릭시
   *  1. Node server로 파일 전송(Tw.NODE_CMD.UPLOAD_FILE)
   *  2. USCAN 전송(BFF_01_0046)
   *  3. 장기일시정지 신청(BFF_05_0197)
   */
  _onClickSuspend: function (/* event */) {
    var option = {};
      // 사용자 입력으로 기한을 체크하기 때문에 접수하기 버튼 입력 이후 처리하는 부분 제거
    if ( this.$optionType.filter('[checked]').val() === 'military' ) { // 군입대
      var $period = this.$container.find('.fe-military.fe-period');
      option.svcChgRsnCd = this.$militaryType.prop('checked') ?
        Tw.MYT_SUSPEND_REASON_CODE.SEMI_MILITARY_: Tw.MYT_SUSPEND_REASON_CODE.MILITARY;
      option.fromDt = $period.find('[data-role="fe-from-dt"]').val().replace(/-/g, '');;
      option.toDt = $period.find('[data-role="fe-to-dt"]').val().replace(/-/g, '');
    } else { // 해외체류
      option.svcChgRsnCd = Tw.MYT_SUSPEND_REASON_CODE.OVERSEAS;
      option.fromDt = this.$container.find('.fe-abroad [data-role="fe-from-dt"]').val().replace(/-/g, '');
    }
    option.icallPhbYn = this.$optionSuspendAll.attr('checked') ? 'Y' : 'N';

    // 추가연락처
    if ( !_.isEmpty(this.$inputTel.val()) ) {
      option.cntcNum = this.$inputTel.val().replace(/-/gi, '' );
      option.cntcNumRelNm = this.$btRelation.val();
    }

    if ( !_.isEmpty(this.$inputEmail.val()) ) {
      option.email = this.$inputEmail.val();
    }
    this._suspendOptions = option;

    if( this._uscanCompleted ){ // 인증 취소 후 재시도 시 중복 업로드 방지
      this._requestSuspend();
    } else {
      // 모바일웹 4.4 버젼은 파일 업로드 미지원
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
    }
  },
  /**
   * @function
   * @desc 장기일시정지 요청
   */
  _requestSuspend: function () {
    //[OP002-692] 장기일시정지 안내 TIP 팝업 사용
    var tooltip =  _.find( Tw.Tooltip.getContentList() || [], { mtwdTtipId: 'MS_03_05_03_tip_03' });
    if(!_.isEmpty(tooltip)) {
      this._popupService.open({
          url: '/hbs/',
          hbs: 'popup',
          'title': tooltip.ttipTitNm,
          'btn-close': 'btn-tooltip-close tw-popup-closeBtn',
          'title_type': 'tit-tooltip',
          'cont_align': 'tl font-only-black',
          'contents': tooltip.ttipCtt,
          'tooltip': 'tooltip-pd'
        },
        null, $.proxy(this._onPopupClose, this), null, this.$btSuspend
      );
    }
  },
  /**
   * @function
   * @desc 신청 툴팁팝업 close callback
   */
  _onPopupClose: function(){
    this._apiService.request(Tw.API_CMD.BFF_05_0197, this._suspendOptions)
      .done($.proxy(this._onSuccessRequest, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success call back for _requestSuspend
   * @param res
   */
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
  /**
   * @function
   * @desc '주소록'버튼 클릭
   * @param e
   */
  _onClickBtnAddr: function (e) {
    e.stopPropagation();
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },
  /**
   * @function
   * @desc  Success call back for Tw.NTV_CMD.GET_CONTACT
   * @param response
   */
  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      var formatted = Tw.StringHelper.phoneStringToDash(params.phoneNumber);
      this.$inputTel.val(formatted);
      this.$inputTel.trigger('change');
    }
  },
  /**
   * @function
   * @desc 사용자 입력 내용 여부 체크
   * @returns {boolean}
   */
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
  /**
   * @function
   * @desc  파일 업로드 지원 가능 버젼(4.4 이상) 체크
   * @returns {*|boolean}
   */
  _isLowerVersionAndroid: function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion();
    return androidVersion && androidVersion.indexOf('4.4') !== -1;
  },

  /**
   * @function
   * @desc 일시정지 기간 선택 시 값 저장 [OP002-4422]
   * @param event
   * @private
   */
  _onFocusDateSelect: function(event) {
    var role = event.target.getAttribute('data-role');
    var isMilitary = this.$optionType.filter('[checked]').val() === 'military';
    var value = event.target.value;
    switch (role) {
      case 'fe-to-dt':
        if (isMilitary) {
          this.militaryToDate = value;
        }
        break;
      case 'fe-from-dt':
        if (isMilitary) {
          this.militaryFromDate = value;
        } else {
          this.abroadFromeDate = value;
        }
        break;
      default:
        break;
    }
  },

  /**
   * @function
   * @desc 일시정지 기간 변경 시 기간 체크 [OP002-4422]
   * @param event
   * @private
   */
  _onChangeDateSelect: function(event) {
    //validation check
    var from, to, diff, $period, msg;
    var targetRole = event.target.getAttribute('data-role');
    if ( this.$optionType.filter('[checked]').val() === 'military' ) {// 군입대
      $period = this.$container.find('.fe-military.fe-period');
      from = $period.find('[data-role="fe-from-dt"]').val().replace(/-/g, '');
      to = $period.find('[data-role="fe-to-dt"]').val().replace(/-/g, '');
      diff = Tw.DateHelper.getDiffByUnit(from, to, 'months') * -1;
      if ( diff < 0 ) {
        msg = Tw.MYT_JOIN_SUSPEND.NOT_VAILD_PERIOD_01;
      } else if ( diff > 24 ) {
        msg = Tw.MYT_JOIN_SUSPEND.NOT_VALID_LONG_TERM_PERIOD;
      }
      if (msg) {
        if (targetRole === 'fe-from-dt') {
          event.target.value = this.militaryFromDate;
        } else {
          event.target.value = this.militaryToDate;
        }
      }
    } else { // 해외체류
      $period = this.$container.find('.fe-abroad.fe-date');
      from = Tw.DateHelper.getCurrentShortDate();
      to = $period.find('[data-role="fe-from-dt"]').val().replace(/-/g, '');
      diff = Tw.DateHelper.getDiffByUnit(to, from, 'days');
      if (diff < 0) {
        msg = Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE;
      } else if (diff > 30) {
        msg = Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE_01;
      }
      if (msg && targetRole === 'fe-from-dt') {
        event.target.value = this.abroadFromeDate;
      }
    }
    if (msg) {
      this._popupService.openAlert(msg, null, null, null, null, $(event.currentTarget));
    }
  }
};
