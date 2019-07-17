/**
 * @file tevent.common.js
 * @author Jayoon Kong
 * @since 2018.11.21
 * @desc 이벤트
 */
/**
 * @namespace
 * @desc 이벤트 namespace
 * @param rootEl - dom 객체
 */
Tw.TeventCommon = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.TeventCommon.prototype = {
  /**
   * @function
   * @desc 변수 초기화 및 이벤트 바인딩
   */
  _init: function () {
    this._initVariables();
    this._bindEvent();
    this._reqTwdAdRcvAgreeInfo();
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 여부 조회 및 미동의시 배너영역 노출 
   * @param 
   */
  _reqTwdAdRcvAgreeInfo: function () {
    // 이벤트 페이지는 비로그인시 접근도 가능한 화면이기 때문에 
    // T world 광고정보수신동의 여부를 조회하기 이전에 로그인 여부를 먼저 조회하도록 한다. (로그인 시에만 T world 광고정보수신동의 여부 조회하도록)
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
    .done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00) {
        if(res.result !== null) { // 로그인된 경우
          // T world 광고정보수신동의 여부 조회
          this._apiService.request(Tw.API_CMD.BFF_03_0021, {})
          .done($.proxy(function (res) {
            if (res.code === Tw.API_CODE.CODE_00) {
              if (res.result.twdAdRcvAgreeYn === 'N') {
                $('#agree-banner-area').show();
              }
            } else {
              // BFF_03_0021 API 호출 시 API code 가 정상으로 넘어오지 않더라도 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
              // Tw.Error(res.code, res.msg).pop();
              return;
            }
          }, this))
          .fail(function (err) {
            // BFF_03_0021 API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
            // Tw.Error(err.code, err.msg).pop();
            return;
          });
        } else {  // 비로그인
          return;
        }
      }
    }, this))
    .fail(function (err) {
      // GET_SVC_INFO API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
      // Tw.Error(err.code, err.msg).pop();
      return;
    });    
  },

  /**
   * @function
   * @desc 변수 초기화
   */
  _initVariables: function () {
    this.$eventSelector = this.$container.find('.fe-select-event');
    this.$contentList = this.$container.find('.fe-content-list');
    this.$standardNode = this.$contentList.find('li.fe-first:first');
    this.$moreBtn = this.$container .find('.fe-more-btn');

    this._uri = window.location.pathname.split('/')[2];
    this._page = 0;
    this._totalPage = this.$contentList.attr('data-page') - 1;
    this._totalCnt = this.$contentList.attr('data-cnt');
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$eventSelector.on('click', $.proxy(this._openEventPop, this));
    this.$contentList.on('click', 'li', $.proxy(this._getDetailEvent, this));
    this.$moreBtn.on('click', $.proxy(this._setMoreData, this));

    this.$container.on('change', '.fe-agree', $.proxy(this._modAgree, this));  // T world 광고정보수신동의 활성화 처리
    this.$container.on('click', '.fe-show-detail', $.proxy(this._showAgreeDetail, this));   // T world 광고정보수신동의 약관 상세보기
    this.$container.on('click', '.fe-close', $.proxy(this._closeAgree, this));   // T world 광고정보수신동의 배너 닫기
  },
  /**
   * @function
   * @desc 이벤트 리스트 선택
   * @param e
   */
  _openEventPop: function (e) {
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.TEVENT_LIST,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    },
      $.proxy(this._onOpenPopup, this),
      null,
      'select',
      $(e.currentTarget));
  },
  /**
   * @function
   * @desc actionsheet event binding
   * @param $layer
   */
  _onOpenPopup: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성

    $layer.find('input#' + this._uri).attr('checked', 'checked');
    $layer.on('change', '.ac-list', $.proxy(this._goLoad, this));
  },
  /**
   * @function
   * @desc 선택한 이벤트 페이지로 이동
   */
  _goLoad: function (event) {
    var $uri = $(event.target).attr('id');
    this._historyService.replaceURL('/tevent/' + $uri);
  },
  /**
   * @function
   * @desc 더보기
   * @param event
   */
  _setMoreData: function (event) {
    var $target = $(event.currentTarget);
    if (this._page < this._totalPage) {
      this._page++;
      this._requestForList($target);
    }
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 활성화 처리
   */
  _modAgree: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0022, {twdAdRcvAgreeYn: 'Y'})
      .done(function (){
        $('#agree-banner-area').hide();
      })
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 약관 상세보기
   */
  _showAgreeDetail: function () {
    Tw.CommonHelper.openTermLayer2('03');
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 배너 닫기
   */
  _closeAgree: function () {
    $('#agree-banner-area').hide();
  },

  /**
   * @function
   * @desc 리스트 더보기 API 호출
   * @param $target
   */
  _requestForList: function ($target) {
    var $apiName = this._getApiName();
    var $reqData = this._makeRequestData();

    this._apiService.request($apiName, $reqData)
      .done($.proxy(this._getSuccess, this, $target))
      .fail($.proxy(this._getFail, this, $target));
  },
  /**
   * @function
   * @desc get api name
   * @returns {string}
   */
  _getApiName: function () {
    var $apiName = '';
    if (this._uri === 'ing') {
      $apiName = Tw.API_CMD.BFF_09_0001; // 진행중 리스트
    } else if (this._uri === 'last') {
      $apiName = Tw.API_CMD.BFF_09_0003; // 지난이벤트
    } else {
      $apiName = Tw.API_CMD.BFF_09_0004; // 당첨자발표
    }
    return $apiName;
  },
  /**
   * @function
   * @desc 요청 데이터 생성
   * @returns {{svcDvcClCd: string, mtwdExpYn: string, page: number, size: number}}
   */
  _makeRequestData: function () {
    return {
      svcDvcClCd: 'M',
      mtwdExpYn: 'Y',
      page: this._page,
      size: Tw.DEFAULT_LIST_COUNT
    };
  },
  /**
   * @function
   * @desc list API 결과 처리
   * @param $target
   * @param res
   */
  _getSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setData(res.result.content);
    } else {
      this._getFail($target, res);
    }
  },
  /**
   * @function
   * @desc API error 처리
   * @param $target
   * @param err
   */
  _getFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  /**
   * @function
   * @desc set result data
   * @param $content
   */
  _setData: function ($content) {
    if (!this.$standardNode.hasClass('fe-done')) {
      this.$standardNode.addClass('fe-done');
    }

    for (var i = 0; i < $content.length; i++) {
      var $liNode = this.$standardNode.clone();
      $liNode.removeClass('none');
      $liNode.attr('id', $content[i].prNum);
      $liNode.find('.fe-event-title').text($content[i].prNm);
      $liNode.find('.fe-event-day').text(Tw.DateHelper.getShortDateNoDot($content[i].prStaDt) + ' ~ ' +
        Tw.DateHelper.getShortDateNoDot($content[i].prEndDt)
      );

      var $dayNode = $liNode.find('.fe-dday-wrap');
      var $dday = Tw.DateHelper.getNewRemainDate($content[i].prEndDt) - 1;
      if ($dday <= 7) {
        $dayNode.find('.fe-dday').text($dday);
        $dayNode.show();
      } else {
        $dayNode.hide();
      }

      var $typeNode = $liNode.find('.fe-event-type');
      if ($content[i].prTypCd === 'E') {
        $typeNode.text(Tw.EVENT_TYPE[$content[i].prTypCd]);
        $typeNode.show();
      } else {
        $typeNode.hide();
      }

      if (this._uri === 'ing') {
        $liNode.find('.fe-event-img img').attr({
          'src': Tw.Environment.cdn + $content[i].filePath,
          'alt': $content[i].prCtt
        });
      } else if (this._uri === 'win') {
        $liNode.find('.fe-event-win-date').text(Tw.DateHelper.getShortDateNoDot($content[i].winDt));
      }
      $liNode.on('click', $.proxy(this._getDetailEvent, this, $liNode.attr('id')));
      this.$contentList.append($liNode);
    }
    this._setHiddenMoreBtn();
  },
  /**
   * @function
   * @desc show more data
   * @param idx
   * @param target
   */
  _showMoreData: function (idx, target) {
    var $target = $(target);
    if ($target.hasClass('none')) {
      if (idx < this._page * Tw.DEFAULT_LIST_COUNT) {
        $target.removeClass('none');
      }
    }
    this._setHiddenMoreBtn();
  },
  /**
   * @function
   * @desc 더보기 버튼 셋팅
   */
  _setHiddenMoreBtn: function () {
    if (this._page === this._totalPage) {
      this.$moreBtn.hide();
    } else {
      this.$moreBtn.show();
    }
  },
  /**
   * @function
   * @desc 이벤트 상세페이지로 이동
   * @param id
   */
  _getDetailEvent: function (id) {
    if (typeof(id) !== 'string') {
      var event = id;
      id = $(event.currentTarget).attr('id');
    }

    var url = '/tevent';
    if (this._uri === 'win') {
      url = url + '/win/detail?id=';
    } else {
      url = url + '/detail?id=';
    }
    this._historyService.goLoad(url + id);
  }
};
