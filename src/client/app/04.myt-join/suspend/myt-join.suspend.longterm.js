/**
 * @file myt-join.suspend.longterm
 * @author Hyeryoun Lee
 * @since 2018-10-18
 */
/**
 * @member
 * @desc 보낼곳
 */
var FAX_NUMBERS = {
  CELL: 'skt257@sk.com',
  INTERNET: 'skt267@sk.com'
};

/*
var SUSPEND_TYPES = {
  MILITARY: 1,
  ABROAD: 2
};
*/

/**
 * @class
 * @desc 일시정지 내 장기일시정지 탭 관리
 * @param tabEl tab content wrapper
 * @param params 서버에서 전달하는 값
 */
Tw.MyTJoinSuspendLongTerm = function (tabEl, params) {
  /*
  this.TYPE = {
    MILITARY: 1,
    ABROAD: 2
  };
  */
  this.$container = tabEl;
  this._params = params;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._dlgSelectFile = null;
  this._uscanCompleted = false;
  this._cachedElement();
  this._requestSvcInfo();

  var $sectionMilitary = this.$container.find('.fe-military');
  var $sectionAbroad = this.$container.find('.fe-abroad');
  this._defaultMilitaryToDate = $sectionMilitary.find('[data-role="fe-to-dt"]').val();
  this._defaulAbroadFromeDate = $sectionAbroad.find('[data-role="fe-from-dt"]').val();
  // [OP002-4422] 일시정지 기간 입력 시 validation check
  this.militaryToDate = this._defaultMilitaryToDate; // $sectionMilitary.find('[data-role="fe-to-dt"]').val();
  this.militaryFromDate = $sectionMilitary.find('[data-role="fe-from-dt"]').val();
  this.abroadFromeDate = this._defaulAbroadFromeDate; // $sectionAbroad.find('[data-role="fe-from-dt"]').val();
  new Tw.InputFocusService(tabEl, this.$btSuspend);
};

Tw.MyTJoinSuspendLongTerm.prototype = {
  /**
   * @function
   * @desc Cache elements for binding events.
   * @returns {void}
   */
  _cachedElement: function () {
    this.$suspendType = this.$container.find('[data-role="fe-suspend-type"]');
    this.$rdoCallBlockAll = this.$container.find('[data-role="fe-call-block-all"]');
    this.$btUpload = this.$container.find('.fe-upload-file');
    this.$inputTel = this.$container.find('[data-id="fe-input-tel"]');
    this.$btRelation = this.$container.find('[data-id="fe-relation"]');
    this.$btSuspend = this.$container.find('[data-id="fe-bt-suspend"]');
    this.$inputEmail = this.$container.find('[data-id="fe-input-email"]');
    this.$btnNativeContactList = this.$container.find('.fe-btn_native_contact');
    this.$militaryType = this.$container.find('[data-id="fe-military-type"]');
    // [OP002-4422] 일시정지 기간 입력 시 validation check
    this.$inputDateSelect = this.$container.find('[data-role="fe-date-select"]');
    this._$coachMark = this.$container.find('.tod-coach-mark'); // .find('button.close');
    // 업로드된 파일 목록 나열
    this._$filenameList = this.$container.find('.filename-list');
    var $tmplUploadItem = this.$container.find('#fe-tmpl-upload-item');
    this._templateUploadItem = Handlebars.compile($tmplUploadItem.html());
  },
  /**
   * @function
   * @desc Bind events to elements.
   */
  _bindEvent: function () {
    this.$btUpload.on('click', $.proxy(this._openCommonFileDialog, this));
    this.$suspendType.on('change', $.proxy(this._onSuspendTypeChanged, this));
    this.$inputTel.on('keyup', $.proxy(Tw.InputHelper.insertDashCellPhone, this, this.$inputTel));
    this.$btRelation.on('click', $.proxy(this._onSelectRelationClicked, this));
    this.$btSuspend.on('click', _.debounce($.proxy(this._onClickSuspend, this), 500));
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    // [OP002-4422] 일시정지 기간 입력 시 vaildation check
    this.$inputDateSelect
      .on('focus', 'input[type="date"]', $.proxy(this._onFocusDateSelect, this))
      .on('change', 'input[type="date"]', $.proxy(this._onChangeDateSelect, this));
    var onCoachMarkCloseClicked = $.proxy(this._onCoachMarkCloseClicked, this);
    this._$coachMark.find('button.close').on('click', onCoachMarkCloseClicked);
    // 지금은 삭제를 위한 버튼 하나밖에 없기 때문에, selector를 단순화했다.
    this._$filenameList.on('click', 'button', $.proxy(this._onUploadItemDeleteClicked, this));
    this._changeSuspendType('military');
    // 닫지 않아도 5초내 닫히도록 한다.
    setInterval(onCoachMarkCloseClicked, 5000);
  },
  /**
   * @function
   * @desc SvcInfo 요청
   */
  _requestSvcInfo: function () {
    Tw.Api.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(function (resp) {
        if (resp.code === Tw.API_CODE.CODE_00) {
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
   * @param {Object} event
   */
  _onSuspendTypeChanged: function (event) {
    var $target = $(event.target);
    var suspendType = $target.data('type');
    if (this._files) {
      this._popupService.openModalTypeA(Tw.POPUP_TITLE.CONFIRM, Tw.MYT_JOIN_SUSPEND.CONFIRM_RESET_FILE.MESSAGE,
        Tw.MYT_JOIN_SUSPEND.CONFIRM_RESET_FILE.BTNAME, $.proxy(this._onOpenTypeChange, this, suspendType),
        $.proxy(this._changeSuspendType, this, suspendType), null, null, null,
        $target);
    } else {
      this._changeSuspendType(suspendType);
    }
  },
  /**
   * @function
   * @desc 선택 된 타입 별 입력항목 노출 상태를 변경
   * @param {string} suspendType 군입대: 'military', 해외출국: 'abroad'
   */
  _changeSuspendType: function (suspendType) {
    // 첨부된 목록 초기화
    this._files = null;
    this._$filenameList.empty();
    this._uscanCompleted = false;
    this._popupService.close();
    if (suspendType === 'military') {
      // TODO: 매번 찾는 것을 효율적이지 못하다.
      this.$container.find('.fe-military')
        .show()
        .attr('aria-hidden', false);
      this.$container.find('.fe-abroad')
        .hide()
        .attr('aria-hidden', true);
    } else {
      // TODO: 매번 찾는 것을 효율적이지 못하다.
      this.$container.find('.fe-military')
        .hide()
        .attr('aria-hidden', true);
      this.$container.find('.fe-abroad')
        .show()
        .attr('aria-hidden', false);
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
   * @param {string} suspendType
   */
  _cancelSuspendType: function (suspendType) {
    setTimeout($.proxy(function () {
      // TODO: 아래 기능은 widget이 처리해주는 것이 좋을 듯하다.
      this.$suspendType
        .filter('[data-type!="' + suspendType + '"]')
        .attr('checked', 'checked')
        .parent()
        .attr('aria-checked', 'true')
        .addClass('checked');
      this.$suspendType
        .filter('[data-type="' + suspendType + '"]')
        .removeAttr('checked')
        .parent()
        .attr('aria-checked', 'false')
        .removeClass('checked');
      if (suspendType === 'military') {
        this.$militaryType.prop('checked', false);
      }
    }, this), 100);
  },
  /**
   * @function
   * @desc 파일 업로드 다이얼로그(CS_04_01_L02) open
   * @param {Object} event
   */
  _openCommonFileDialog: function (event) {
    var $target = $(event.target);
    var options;
    var countFile;
    if (!this._dlgSelectFile) {
      this._dlgSelectFile = new Tw.MytJoinSuspendUpload();
    }
    if ($target.data('type') === 'military') {
      options = {
        content: Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TIP,
        title: Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TITLE,
        hash: 'tip'
      };
      countFile = 2;
    } else {
      options = {
        content: Tw.MYT_JOIN_SUSPEND.LONG.ABROAD.TIP,
        title: Tw.MYT_JOIN_SUSPEND.LONG.ABROAD.TITLE,
        hash: 'tip'
      };
      countFile = 1;
    }
    this._dlgSelectFile.show($.proxy(this._onDlgSelectFileSelected, this),
      countFile, this._files, null, options, $target);
  },
  /**
   * @function
   * @desc 파일 첨부 완료 시 일시정지 버튼 활성화
   * @param files
   */
  _onDlgSelectFileSelected: function (files) {
    this._files = files;
    this._$filenameList.html(this._templateUploadItem({
      files: _.map(this._files, function (file, index) {
        // WARNING: 서버로 전달되어도, 혼동이 없는 값이어야 하고, File class와 중복되지 않아야 한다.
        // WARNING: 삭제할 때, 위치를 구분하기 위한 값이지, 실제 index는 아니다.
        file._iid = index;
        return file;
      })
    }));
    this._uscanCompleted = false;
    // this.$btSuspend.prop('disabled', false);
    this.$btSuspend.prop('disabled', !(files && files.length > 0));
  },
  /**
   * @function
   * @desc Node server로 파일 업로드 요청
   * @param {Array} files
   */
  _requestUpload: function (files) {
    var formData = new FormData();
    formData.append('dest', Tw.UPLOAD_TYPE.SUSPEND);
    _.each(files, function (file) {
      formData.append('file', file);
    });
    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success call back for _requestUpload
   * @param {Object} res
   */
  _successUploadFile: function (res) {
    // USCAN upload
    if (res.code === Tw.API_CODE.CODE_00) {
      var filesOrg = this._files;
      var files = _.map(res.result, function (file) {
        // TODO: 서버에서 메시지를 사용자가 올린 이름으로 주고 있지 않다. (서버 개선 후 제거)
        var fileOrg = _.find(filesOrg, {name: file.originalName});
        fileOrg.serverName = file.name;
        return {
          fileSize: file.size,
          fileName: file.name,
          filePath: file.path
        };
      });
      this._requestUscan(files);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  /**
   * @function
   * @desc USCAN 요청
   * @param {Array} files
   * @private
   */
  _requestUscan: function (files) {
    this._apiService
      .request(Tw.API_CMD.BFF_01_0046, {
        recvFaxNum: FAX_NUMBERS.CELL, // 'skt257@sk.com',
        proMemo: '장기 미사용', // TBD 필수값임 확인필요, 재첨부인 경우 "재첨부 장기 미사용"
        scanFiles: files
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
    if (res.code === Tw.API_CODE.CODE_00) {
      this._uscanCompleted = true;
      this._requestSuspend();
    } else {
      // USCAN upload 오류는 여기서 처리
      // TODO: 서버에서 메시지를 사용자가 올린 이름으로 주고 있지 않다. (서버 개선 후 제거)
      var msg = res.msg;
      _.each(this._files, function (file) {
        msg = msg.replace(new RegExp(file.serverName), '"' + file.name + '"');
      });
      Tw.Error(res.code, msg).pop();
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
   * @param {Object} event
   */
  _onSelectRelationClicked: function (event) {
    var options = $.extend(true, [], Tw.SUSPEND_RELATION.list);
    var selected = _.find(options, {'radio-attr': 'data-value="' + this.$btRelation.val() + '"'});
    if (selected) {
      selected['radio-attr'] += ' checked';
    }
    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      btnfloating: {
        'attr': 'type="button" data-role="fe-bt-close"',
        'class': 'tw-popup-closeBtn',
        'txt': Tw.BUTTON_LABEL.CLOSE
      },
      data: [{list: _.assign(options, selected)}]
    }, $.proxy(this._selectRelationCallback, this), null, 'select-relation', $(event.target));
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
    var option = {
      icallPhbYn: this.$rdoCallBlockAll.attr('checked') ? 'Y' : 'N'
    };
    var value;
    // 사용자 입력으로 기한을 체크하기 때문에 접수하기 버튼 입력 이후 처리하는 부분 제거
    if (this.$suspendType.filter('[checked]').data('type') === 'military') { // 군입대
      var $period = this.$container.find('.fe-military.fe-period');
      option.svcChgRsnCd = this.$militaryType.prop('checked') ?
        Tw.MYT_SUSPEND_REASON_CODE.SEMI_MILITARY_ : Tw.MYT_SUSPEND_REASON_CODE.MILITARY;
      option.fromDt = $period.find('[data-role="fe-from-dt"]').val().replace(/-/g, '');
      option.toDt = $period.find('[data-role="fe-to-dt"]').val().replace(/-/g, '');
    } else { // 해외체류
      option.svcChgRsnCd = Tw.MYT_SUSPEND_REASON_CODE.OVERSEAS;
      option.fromDt = this.$container.find('.fe-abroad [data-role="fe-from-dt"]').val().replace(/-/g, '');
    }

    // 추가연락처
    value = this.$inputTel.val();
    if (!_.isEmpty(value)) {
      option.cntcNum = value.replace(/-/gi, '');
      option.cntcNumRelNm = this.$btRelation.val();
    }

    // 이메일
    value = this.$inputEmail.val();
    if (!_.isEmpty(value)) {
      option.email = value;
    }
    this._suspendOptions = option;

    if (this._uscanCompleted) { // 인증 취소 후 재시도 시 중복 업로드 방지
      this._requestSuspend();
    } else {
      // 모바일웹 4.4 버젼은 파일 업로드 미지원
      if (Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid()) {
        // var files = _.compact(this._files).map(function (item) {
        var files = _.map(this._files, function (file) {
          return {
            fileSize: file.size,
            fileName: file.name,
            filePath: file.path
          };
        });
        this._requestUscan(files);
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
    var tooltip = _.find(Tw.Tooltip.getContentList(), {mtwdTtipId: 'MS_03_05_03_tip_03'});
    if (!_.isEmpty(tooltip)) {
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
  _onPopupClose: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0197, this._suspendOptions)
      .done($.proxy(this._onSuccessRequest, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success call back for _requestSuspend
   * @param {Object} res
   */
  _onSuccessRequest: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._suspendOptions.command = 'longterm';
      this._suspendOptions.svcNum = this._svcInfo.svcNum;
      // TODO: Popup으로 표현되어야 한다.
      this._historyService.replaceURL('/myt-join/submain/suspend/complete?' + $.param(this._suspendOptions));
    } else if (res.code in Tw.MYT_JOIN_SUSPEND.ERROR) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR[res.code] || res.msg,
        null, null, null, null, this.$btSuspend);
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
   * @param {Object} res
   */
  _onContact: function (res) {
    if (res.resultCode === Tw.NTV_CODE.CODE_00) {
      this.$inputTel.val(Tw.StringHelper.phoneStringToDash(res.params.phoneNumber));
      this.$inputTel.trigger('change');
    }
  },
  /**
   * @function
   * @desc 사용자 입력 내용 여부 체크
   * @returns {boolean}
   */
  hasChanged: function () {
    return !_.isEmpty(this._files) ||
      // this.$suspendType.filter('[checked]').val() !== 'military' ||
      this.$suspendType.filter('[checked]').data('type') !== 'military' ||
      !_.isEmpty(this.$inputEmail.val()) ||
      !_.isEmpty(this.$btRelation.val()) ||
      !_.isEmpty(this.$inputTel.val()) ||
      // TODO: 매번 찾는 것을 효율적이지 못하다.
      this._defaultMilitaryToDate !== this.$container.find('.fe-military [data-role="fe-to-dt"]').val() ||
      this._defaulAbroadFromeDate !== this.$container.find('.fe-abroad [data-role="fe-from-dt"]').val();
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
  _onFocusDateSelect: function (event) {
    var role = event.target.getAttribute('data-role');
    var isMilitary = this.$suspendType.filter('[checked]').data('type') === 'military';
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
  _onChangeDateSelect: function (event) {
    var isMilitary = this.$suspendType.filter('[checked]').data('type') === 'military';
    var targetRole = event.target.getAttribute('data-role');
    if (!event.target.value) {
      // input 내 빈값인(삭제) 경우 - 기존 선택된 날짜로 초기화 시켜준다.
      if (isMilitary) {
        if (targetRole === 'fe-from-dt') {
          event.target.value = this.militaryFromDate;
        } else {
          event.target.value = this.militaryToDate;
        }
      } else {
        event.target.value = this.abroadFromeDate;
      }
      return false;
    }
    //validation check
    var from, to, diff, $period, msg;
    if (isMilitary) {
      // 군입대
      var curDate = Tw.DateHelper.getDateCustomFormat('YYYYMMDD');
      $period = this.$container.find('.fe-military.fe-period');
      from = $period.find('[data-role="fe-from-dt"]').val().replace(/-/g, '');
      if (from < curDate) {
        // 시작일이 현재일보다 이전을 선택한 경우
        msg = Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE;
      } else {
        to = $period.find('[data-role="fe-to-dt"]').val().replace(/-/g, '');
        if (from > to) {
          // 시작일이 종료일보다 이전인 경우
          msg = Tw.MYT_JOIN_SUSPEND.NOT_VAILD_PERIOD_01;
        } else {
          // 장기일시정지 기간이 24개월을 넘기는 경우
          diff = Tw.DateHelper.getDiffByUnit(to, from, 'months');
          if (diff > 24) {
            msg = Tw.MYT_JOIN_SUSPEND.NOT_VALID_LONG_TERM_PERIOD;
          }
        }
      }
      if (msg) {
        if (targetRole === 'fe-from-dt') {
          event.target.value = this.militaryFromDate;
        } else {
          event.target.value = this.militaryToDate;
        }
      } else {
        // 정상으로 날짜를 선택한 경우 변경값을 저장해준다.
        this.abroadFromeDate = event.target.value;
        if (targetRole === 'fe-from-dt') {
          this.militaryFromDate = event.target.value;
        } else {
          this.militaryToDate = event.target.value;
        }
      }
    } else {
      // 해외체류
      $period = this.$container.find('.fe-abroad.fe-date');
      from = $period.find('[data-role="fe-from-dt"]').val().replace(/-/g, '');
      to = Tw.DateHelper.getCurrentShortDate();
      if (from < to) {
        // 시작일이 오늘보다 이전인 경우
        msg = Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE;
      } else {
        diff = Tw.DateHelper.getDiffByUnit(from, to, 'days');
        // 시작일이 오늘보다 30일 이후는 신청 안되도록 처리
        if (diff > 30) {
          msg = Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE_01;
        }
      }
      if (msg && targetRole === 'fe-from-dt') {
        event.target.value = this.abroadFromeDate;
      } else {
        // 정상으로 날짜를 선택한 경우 변경값을 저장해준다.
        this.abroadFromeDate = event.target.value;
      }
    }
    if (msg) {
      // 날짜를 잘못 선택한 경우
      this._popupService.openAlert(msg, null, null, null, null, $(event.target));
    }
  },
  _onCoachMarkCloseClicked: function () {
    this._$coachMark.hide();
  },
  _onUploadItemDeleteClicked: function (event) {
    // Nullable이기에, 과한 대응을 해놓는다.
    if (this._files && this._files.length) {
      var $target = $(event.target).closest('li');
      this._popupService.openConfirm(Tw.POPUP_CONTENTS.REMOVE_UPLOAD_ITEM, Tw.POPUP_TITLE.CONFIRM,
        $.proxy(function ($target) {
          var _iid = $target.data('iid');
          // 목록에서 제거
          this._files.splice(_.findIndex(this._files, {_iid: _iid}), 1);
          // DOM에서 제거
          $target.remove();
          this._popupService.close();
          // 이렇게 해줘야 군입대 혹은 해외체류간의 선택에 대한 묻기를 하지 않는다.
          if (this._files.length === 0) {
            this._files = null;
          }
        }, this, $target),
        $.proxy(this._popupService.close, this._popupService), $target
      );
    }
  }
};
