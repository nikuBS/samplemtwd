/**
 * @file myt-fare.bill.prepay.main.js
 * @author Jayoon Kong
 * @since 2018.10.04
 * @editor 양정규 2021.01.20
 * @desc 소액결제/콘텐츠이용료 메인화면
 */

/**
 * @namespace
 * @desc 소액결제/콘텐츠이용료 메인화면 namespace
 * @param rootEl - dom 객체
 * @param title - 소액결제/콘텐츠이용료
 * @param className - 다른 객채에서 생성시 전달할 클래스명
 * @param callback - 다른 객체에서 생성시 초기화 후 호출 할 콜백 함수
 */
Tw.MyTFareBillPrepayMain = function (rootEl, title, className, callback) {
  this.$container = rootEl;
  this.$title = title;
  this.$isPrepay = className === '.popup-page';
  this.$className = className || '.container';
  this.$callback = callback;
  this._isAdult = this.$container.data('is-adult');  // OP002-7282. 미성년자 여부 추가

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._historyService = new Tw.HistoryService(rootEl);

  if (!this.$isPrepay) {
    this._init();
  }
};

Tw.MyTFareBillPrepayMain.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    // CDN 읽어온 이후 여부 체크
    if( !Tw.Environment.init ) {
      $(window).on(Tw.INIT_COMPLETE, $.proxy(this._checkIsAfterChange, this));
    } else {
      this._checkIsAfterChange(); // 자동선결제 해지 후 다시 메인으로 왔을 경우 처리
    }

    this._initVariables();
    this._checkAgree(function (){
      this.getRemainLimit();
      this._preventLink();
      this._makeEid();
      this._bindEvent();
    }.bind(this));
  },

  /**
   * @function
   * @desc initialize variables
   */
  _initVariables: function () {
    this._amountUsedTemplate = Handlebars.compile($('#amount-used-templ').html()); // 휴대폰 결제/콘텐츠 이용요금 템플릿
    this._prepayAreaTemplate = Handlebars.compile($('#prepay-area-templ').html()); // 휴대폰 결제 "선결제" 영역 템플릿
    this.$amountUsed = this.$container.find('.fe-amount-used');
    this.$tab1 = this.$container.find('.fe-tab1'); // 휴대폰 결제 탭
    this.$tab2 = this.$container.find('.fe-tab2'); // 콘텐츠 이용료 탭
  },

  /**
   * @function
   * @desc 휴대폰 결제 이용동의 여부 확인하여 알럿 띄움
   * @private
   */
  _checkAgree: function (callback) {
    var code = this.$container.data('code');
    if (code !== 'BIL0030' && code !== 'BIL0031') {
      return callback();
    }

    this._setData([
      this._getDefData('small'),
      this._getDefData('contents')
    ]);

    var self = this;
    this._popupService.open({
      hbs: 'NMF_06_case1',
      data: {isAdult: this.$container.data('is-adult')},
      layer: true
    }, function ($layer) { // load callback
      self.makeEidBuilder()
        .setEid('agreeNo', 1)
        .setEid('agreeYes', 2)
        .build();
      $layer.on('click', '.fe-close', function () {
        // 팝업 닫기 및 이전 페이지로 이동하기 위해 -2
        self._historyService.go(-2);
      });
      $layer.on('click', '[data-url]', $.proxy(self._goUrl, self));
    }, null, 'checkAgree');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('change', '.fe-set-use', $.proxy(this._changeUseStatus, this));
    this.$container.on('click', '.fe-set-password', $.proxy(this._setPassword, this));
    this.$container.on('click', '[data-unusual-state]', $.proxy(this._unusualBlock, this));
    this.$container.on('click', '#fe-tab1', $.proxy(this._checkAble, this));
    this.$container.on('click', '[data-url]', $.proxy(this._goUrl, this));
    $('.fe-faq').on('click', $.proxy(this._increaseViews, this));
  },

  /**
   * @desc 오퍼통계 eid 만들기
   * @private
   */
  _makeEid: function () {
    this.makeEidBuilder()
      .setEid('usedOn', 3) // 이용설정 '이용중'
      .setEid('usedOff', 4) // 이용설정 '차단중'
      .setEid('smallTab', 15) // 휴대폰 결제 탭
      .setEid('otherFind', 32) // 다른정보를 찾고 계신가요
      .setEid('contentsTab', 33) // 콘텐츠 이용료 탭
      .build();
  },

  /**
   * @function
   * @desc "휴대폰 결제" 탭 선택 시 미성년자인 경우 사용불가 알럿 띄우기
   * @param e
   * @private
   */
  _checkAble: function (e){
    if (!this.$container.data('is-adult')) {
      this._popupService.openAlert('미성년 고객님은 휴대폰 결제를 이용하실 수 없습니다.', null, null, null, null, $(e.currentTarget));
    }
  },

  /**
   * @function
   * @desc 쿼리스트링에 type이 있을 경우 toast 출력 (자동선결제 해지 후 돌아왔을 때)
   */
  _checkIsAfterChange: function () {
    var type = Tw.UrlHelper.getQueryParams().type;
    if (type) {
      var message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_CANCEL_AUTO_PREPAY; // 자동선결제 해지가 완료되었습니다.

      if (!this._isBackOrReload() && message !== '') {
        this._commonHelper.toast(message); // 뒤로가기나 새로고침이 아닐 경우, 메시지가 누락되지 않았을 경우 토스트 출력
      }
    }
  },

  /**
   * @function
   * @desc 잔여한도 조회 API 호출: 작업중..
   */
  getRemainLimit: function () {
    this._startLoading.call(this);
    var self = this, param = {
      requestCnt: 0,
      gubun: 'Request'
    }, request, _request, response;
    var data = {
      small: {
        def: $.Deferred(),
        title: 'small',
        cmd: Tw.API_CMD.BFF_07_0073,
        param: $.extend({}, param)
      },
      contents: {
        def: $.Deferred(),
        title: 'contents',
        cmd: Tw.API_CMD.BFF_07_0081,
        param: $.extend({}, param)
      }
    };

    // BFF 조회
    request = function (title) {
      var options = data[title];
      _request(title);
      return options.def.promise();
    };

    _request = function (title) {
      var options = data[title];
      self._apiService.request(options.cmd, options.param)
        .done(response.bind(self, options))
        .fail($.proxy(self._remainFail, self));
    };

    response = function (_options, res) {
      if (res.code !== Tw.API_CODE.CODE_00) {
        _options.def.reject(res);
        return;
      }
      var retry = function (timeout) {
        setTimeout($.proxy(_request, this, _options.title), timeout); // n초 후 재호출
      };
      var param = _options.param;
      if (param.gubun === 'Request') {
        param.gubun = 'Done';
        param.requestCnt++; // 최초 호출 이후 gubun과 requestCnt 변경

        retry(1000); // 1초 후 재호출
        return;
      }

      if (res.result.gubun !== 'Done') { // 실패하면 다시 호출
        if (param.requestCnt < 6) {
          param.requestCnt++; // requestCnt 증가 (+1)
          retry(3000); // 3초 delay 후 재호출
        } else {
          _options.def.reject({
            code: 'ERROR',
            msg: Tw.ALERT_MSG_MYT_FARE.PREPAY_REMAIN_ERROR
          });
        }
        return;
      }

      // 성공시 처리로직
      _options.def.resolve(res);
    };

    // $title 이 공백이면 소액, 콘텐츠 둘다 호출
    if (Tw.FormatHelper.isEmpty(this.$title)) {
      var succ = Tw.API_CODE.CODE_00;
      if (this._isAdult) {
        $.when(request('small'), request('contents'))
          .done(function (small, contents){
            self._endLoading();
            var error = _.find([small, contents], function (item){
              return item.code !== succ;
            });
            if (error) {
              self._remainFail(error);
              return;
            }
            small.title = 'small';
            contents.title = 'contents';
            self._setData([small, contents]);
          }).fail($.proxy(this._remainFail, this));
        return;
      }
      // 미성년자는 "콘텐츠 이용료"만 조회한다.
      request('contents').done(function (contents){
        self._endLoading();
        if (contents.code !== succ) {
          self._remainFail(contents);
          return;
        }
        contents.title = 'contents';
        self._setData([contents]);
      }).fail(self._remainFail.bind(self));
      return;
    }
    request(this.$title).done(function (resp){
      self._endLoading();
      self.$callback(resp);
    }).fail(this._remainFail.bind(this));

  },

  /**
   * @function
   * @desc 기본 데이타
   * @param title
   * @return {{result: {remainUseLimit: number, tmthUseAmt: number, payLimitAmt: number, tmthChrgPsblAmt: number}, code: (string|*), title}}
   * @private
   */
  _getDefData: function (title) {
    return {
      code: Tw.API_CODE.CODE_00,
      title: title,
      result: {
        tmthChrgPsblAmt: '0', // 선결제 가능금액
        tmthUseAmt: '0', // 당월 사용금액
        payLimitAmt: '0', // 총한도(월한도)
        remainUseLimit: '0' // 잔여한도
      }
    };
  },

  /**
   * @function
   * @desc set data
   * @param datas{array}
   */
  _setData: function (datas) {
    if (Tw.FormatHelper.isEmptyArray(datas)) {
      return;
    }
    var list = _.reduce(datas, function (r, item){
      if (item.code !== Tw.API_CODE.CODE_00) {
        return r;
      }
      var isContents = item.title === 'contents',
        result = item.result;
      // 콘텐츠 이용요금 페이지에서만 사용
      if (isContents) {
        this._isAdult = result.isAdult || 'Y';
      }

      var addComma = Tw.FormatHelper.addComma;
      r.push({
        isContents: isContents,
        title: item.title,
        titleName: this._getTitleKo(item.title),
        autoChrgStCd: result.autoChrgStCd, // 자동선결제 신청상태(U: 사용중, 그 외는 미신청)
        stateCd: result.autoChrgStCd === 'U' ? 'U' : 'D', // 자동 선결제 신청상태 (U: 사용중, D:미사용)
        stateTxt: result.autoChrgStCd === 'U' ? Tw.MYT_FARE_PAYMENT_NAME.CHANGE : Tw.MYT_FARE_PAYMENT_NAME.REQUEST,
        historyUrl: '/myt-fare/bill/'+ item.title +'/history',
        tmthUseAmt: addComma(result.tmthUseAmt),  // 당월 사용금액
        payLimitAmt: addComma(result[isContents ? 'useContentsLimitAmt' : 'microPayLimitAmt']), // 총한도(월한도)
        remainUseLimit: addComma(result.remainUseLimit),  // 잔여한도
        tmthChrgPsblAmt: addComma(result.tmthChrgPsblAmt), // 설결제 가능금액
        prepayCd: parseInt(result.tmthChrgPsblAmt || '0', 10) > 0 ? 'U' : 'D'
      });
      return r;
    }.bind(this),[]);

    // 상단 이용금액 영역 오퍼통계 코드 생성
    var usedAreaMakeEid = function () {
      // 휴대폰 결제
      var $el = this.$container.find('[data-title="small"]');
      this.makeEidBuilder($el)
        .setEid('changeLimit', 5) // 한도변경
        .setEid('autoPrepay-D', 6) // 태그 > 자동 선결제 신청
        .setEid('autoPrepay-U', 7) // 태그 > 자동 선결제 변경
        .setEid('searchHistory', 8) // 이용내역 조회
        .setEid('setPasswordNC', 9) // 결제비밀번호 신청
        .setEid('setPasswordAC', 10) // 결제비밀번호 변경
        .build();

      // 콘텐츠 이용료
      $el = this.$container.find('[data-title="contents"]');
      this.makeEidBuilder($el)
        .setEid('changeLimit', 11) // 한도변경
        .setEid('autoPrepay-D', 12) // 자동 선결제 신청
        .setEid('autoPrepay-U', 13) // 자동 선결제 변경
        .setEid('searchHistory', 14) // 이용내역 조회
        .build();
    }.bind(this);

    // 하단 탭 오퍼통계 코드 생성
    var tabsMakeEid = function () {
      // 휴대폰 결제
      var $el = this.$tab1;
      this.makeEidBuilder($el)
        .setEid('prepayD', 16) // 선결제 신청
        .setEid('prepayU', 17) // 선결제 결제
        .setEid('joinPassword', 18) // 결제 비밀번호 가입하기
        .setEid('tabAutoPrepayD', 19) // 자동 선결제 신청
        .setEid('tabAutoPrepayU', 20) // 자동 선결제 변경/해지
        .setEid('autoBlockHistory', 21) // 자동 결제 차단내역
        .setEid('historyTip', 22) // 이용내역 TIP
        .setEid('search', 23) // 조회하기
        .build();

      // 콘텐츠 이용료
      $el = this.$tab2;
      this.makeEidBuilder($el)
        .setEid('prepayD', 34) // 선결제 신청
        .setEid('prepayU', 35) // 선결제 결제
        .setEid('tabAutoPrepayD', 36) // 자동 선결제 신청
        .setEid('tabAutoPrepayU', 37) // 자동 선결제 변경/해지
        .setEid('historyTip', 38) // 이용내역 TIP
        .setEid('search', 39) // 조회하기
        .build();
    }.bind(this);

    this._renderAmountUsed(list);
    this._renderPrepaid(list);
    usedAreaMakeEid();
    tabsMakeEid();
    this._bindEventAfterData();
  },

  /**
   * @function
   * @desc API 응답 이후 event binding
   */
  _bindEventAfterData: function () {
    this.$container.on('click', '.fe-change-limit', $.proxy(this._changeLimit, this));
    this.$container.on('click', '.fe-prepay', $.proxy(this._prepay, this));
    this.$container.on('click', '.fe-auto-prepay', $.proxy(this._autoPrepay, this));
  },

  _renderAmountUsed: function (list) {
    if (Tw.FormatHelper.isEmptyArray(list)) {
      return;
    }
    this.$amountUsed.append(this._amountUsedTemplate({list: list}));
    this._preventLink(this.$amountUsed);
    skt_landing.widgets.widget_init();
  },

  /**
   * @function
   * @desc 선결제 영역 렌더링
   * @param data
   * @private
   */
   _renderPrepaid: function (list) {
    if (Tw.FormatHelper.isEmptyArray(list)) {
      return;
    }
    list.forEach(function (item){
      var title = item.title;
      var $parent = title === 'small' ? this.$tab1 : this.$tab2;
      $parent.prepend(this._prepayAreaTemplate(item));
    }.bind(this));

    this._preventLink();
  },

  /**
   * @function
   * @param e
   * @desc 특이고객 차단
   */
  _unusualBlock: function (e) {
    if ($(e.currentTarget).data('unusualState') === 'Y') {
      e.stopImmediatePropagation(); // 다른 이벤트 중지
      // Tw.Error('', Tw.MYT_FARE_BILL.ERROR.UNUSUAL_CUSTOMER_MSG, Tw.MYT_FARE_BILL.ERROR.UNUSUAL_CUSTOMER_SUB_MSG).pop();
      var error = Tw.MYT_FARE_BILL.ERROR.UNUSUAL_CUSTOMER;
      this._popupService.openAlert(error.MSG, error.TITLE);
    }
  },

  /**
   * @function
   * @desc url 이동
   * @param e
   * @private
   */
  _goUrl: function (e) {
    var url = $(e.currentTarget).data('url');
    if(Tw.FormatHelper.isEmpty(url)) {
      return;
    }
    this._historyService.goLoad(url);
  },

  /**
   * @function
   * @desc faq 조회수 증가 요청
   * @param e
   * @private
   */
  _increaseViews: function (e) {
    var $box = $(e.currentTarget).closest('[data-faq-id]');
    if ($box.hasClass('on')) {
      this._apiService.request(Tw.API_CMD.BFF_08_0086, {ifaqId: $box.data('faq-id').toString()});
    }
  },

  /**
   * @function
   * @desc a tag href='#' 인경우, 링크 무효화 시키기
   * @param $container
   * @private
   */
  _preventLink: function ($container) {
    $container = $container || this.$container;
    _.forEach(($container.find('a[href="#"]') || []), function (item){
      $(item).attr('onclick', 'return false;');
    });
  },

  /**
   * @desc title return
   * @param event
   * @return {any}
   * @private
   */
  _getTitle: function (event) {
    return $(event.currentTarget).closest('[data-title]').data('title');
  },

  /**
   * @function
   * @desc 이용한도 변경
   */
  _changeLimit: function (e) {
    var $target = $(e.currentTarget);
    new Tw.MyTFareBillPrepayChangeLimit(this.$container, this._getTitle(e), $target);
  },
  /**
   * @function
   * @desc 선결제 팝업 로드
   * @param e
   */
  _prepay: function (e) {
    var title = this._getTitle(e),
      amt = $(e.currentTarget).data('amt').toString();

    // 20.04.06 OP002-7282 : 미성년자인 경우 에러페이지로 이동
    if(title === 'contents' && this._isAdult !== 'Y') {
      return this._goErrorMinor();
    }

    if (amt !== '0') {
      if (Tw.BrowserHelper.isApp()) { // 앱일 경우에만 이동
        // [OP002-9462] 선결제 기능 조건부
        this._apiService.request(Tw.API_CMD.BFF_07_0104, {})
          .done($.proxy(this._checkTimeSuccess, this, e))
          .fail($.proxy(function (err) {
            this._showErrorPopup(Tw.POPUP_TITLE.NOTIFY, err.msg, e.currentTarget);
          }, this));
      } else {
        this._goAppInfo(e); // 웹일 경우 앱 설치 유도 페이지로 이동
      }
    } else {
      // 0원이면 안내 alert 노출
      var error = Tw.ALERT_MSG_MYT_FARE.ALERT_2_A89,
        titleKo = this._getTitleKo(title);
      var aTitle = error.TITLE, msg = error.MSG.replace('{title}', titleKo);

      this._showErrorPopup(aTitle, msg, e.currentTarget);
    }
  },
  /**
   * 선결제 가능 시간 확인 후 처리
   * @param e
   * @param res
   * @private
   */
  _checkTimeSuccess: function (e, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      /*
      const res = {
        result: {
          "msg": "Swing 에러메시지",
          "msg_disp_yn": "메시지노출여부(매월말 23시 50분~00분인 경우 Y, 그외에는 N)"
        }
      };
      */
      if (res.result.msg_disp_yn === 'N') {
        new Tw.MyTFareBillPrepayMainSKpay({
          $element: this.$container,
          callbackSKpay: $.proxy(this._goSKpay, this, e),
          callbackPrepay: $.proxy(this._goPrepayCallback, this, e)
        }).openPaymentOption(e);
      } else {
        this._showErrorPopup(Tw.POPUP_TITLE.NOTIFY, res.result.msg, e.currentTarget);
      }
    } else {
      Tw.Error(res.code, res.msg).pop(); // 에러 시 공통팝업 호출
    }
  },
  /**
   * 에러표시창
   * @param {String|null} [title]
   * @param {String} contents
   * @param {HTMLElement} target
   * @private
   */
  _showErrorPopup: function (title, contents, target) {
    this._popupService.openAlert(contents, title,'',null, '', $(target));
  },
    /**
   * @function
   * @desc 실시간 계좌이체, 체크/신용카드 결제
   * @param prepayType
   */
  _goPrepayCallback: function (e, prepayType) {
    var url = '/myt-fare/bill/'+ this._getTitle(e);
    // prepayType=account (실시간 계좌이체), 그외 : 체크/신용카드 결제
    url += prepayType === 'account' ? '/prepay-account' : '/prepay';
    this._historyService.goLoad(url);
  },
/**
   * @function
   * @desc SK Pay 결제
   */
  _goSKpay: function (e) {
    var title = this._getTitle(e);
    this._historyService.goLoad('/myt-fare/bill/'+ title +'/skpay');
  },
  /**
   * @function
   * @desc 자동선결제 페이지로 이동
   * @param e
   */
  _autoPrepay: function (e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    var title = this._getTitle(e);
    // 자동 선결제 신청 상태일 경우 변경 및 해지 페이지로 이동
    if ($target.data('state') === 'U') {
      this._historyService.goLoad('/myt-fare/bill/' + title + '/auto/info');
      return;
    }

    // 20.04.06 OP002-7282 : 미성년자인 경우 에러페이지로 이동
    if(title === 'contents' && this._isAdult !== 'Y') {
      return this._goErrorMinor();
    }

    if (Tw.BrowserHelper.isApp()) {
      this._historyService.goLoad('/myt-fare/bill/' + title + '/auto');
    } else {
      this._goAppInfo(e);
    }
  },
  /**
   * @function
   * @desc 소액결제 사용/차단 설정
   * @param event
   */
  _changeUseStatus: function (event) {
    var $target = $(event.currentTarget);
    $target.attr('data-xt_eid', $target.attr('checked') ? 'CMMA_A3_B12-C53-3' : 'CMMA_A3_B12-C53-4');
    new Tw.MyTFareBillSmallSetUse(this.$container, $(event.target));
  },
  /**
   * @function
   * @desc 소액결제 비밀번호 신청 및 변경
   */
  _setPassword: function () {
    new Tw.MyTFareBillSmallSetPassword(this.$container, $('.fe-set-password'));
  },
  /**
   * @function
   * @desc 앱 설치 유도 페이지로 이동
   * @param e
   */
  _goAppInfo: function (e) {
    this._popupService.open({
      'hbs': 'open_app_info',
      'isAndroid': Tw.BrowserHelper.isAndroid(),
      'cdn': Tw.Environment.cdn
    }, $.proxy(this._onOpenTworld, this), null, null, $(e.currentTarget));
  },
  /**
   * @function
   * @desc 앱 설치 유도 페이지
   * @param $layer
   */
  _onOpenTworld: function ($layer) {
    new Tw.CommonShareAppInstallInfo($layer);
  },
  /**
   * @function
   * @desc 뒤로가기 및 새로고침 체크
   * @returns {boolean}
   */
  _isBackOrReload: function () {
    if (window.performance) {
      if (performance.navigation.type === 1 || performance.navigation.type === 2) {
        return true;
      }
    }
  },

  /**
   * @function
   * @desc title(small, contents) 의 한글 이름명 리턴
   * @param title
   * @return {string}
   * @private
   */
  _getTitleKo: function (title) {
    return title === 'small' ? '휴대폰 결제' : '콘텐츠 이용료';
  },

  /**
   * @function
   * @desc 미성년자인경우 사용제한 페이지로 이동
   */
  _goErrorMinor: function() {
    var _error = Tw.MYT_FARE_BILL.ERROR.MINORS_RESTRICTIONS;
    Tw.Error(_error.CODE, _error.MSG).page();
  },

  _startLoading: function () {
    Tw.CommonHelper.startLoading(this.$title ? this.$container : this.$amountUsed, 'grey');
  },

  _endLoading: function () {
    Tw.CommonHelper.endLoading(this.$title ? this.$container : this.$amountUsed);
  },

  /**
   * @function
   * @desc 통계코드 data attr 생성
   * @private
   */
  makeEidBuilder: function ($container) {
    var eid = {};
    $container = $container || this.$container;

    var setEid = function (key, eidCd) {
      eid[key] = 'CMMA_A3_B12-C53-' + eidCd;
      return this;
    };

    var build = function () {
      $.each($container.find('[data-make-eid]'), function (idx, item){
        var $item = $(item);
        var eidCd = eid[$item.data('make-eid')];
        if (eidCd) {
          $item.attr('data-xt_eid', eidCd)
            .attr('data-xt_csid', 'NO')
            .attr('data-xt_action', 'BC');
          $item.removeAttr('data-make-eid');
        }
      });
    };

    return {
      setEid: setEid,
      build: build
    };

  },

  /**
   * @function
   * @desc 잔여한도 조회 API Error 처리
   * @param err
   */
  _remainFail: function (err) {
    this._endLoading();
    Tw.Error(err.code, err.msg).pop();
    // Tw.Error(err.code, err.msg).replacePage();
  }
};
