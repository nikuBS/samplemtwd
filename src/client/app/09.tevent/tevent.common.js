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

  this._isLogined = false;
  this._isAdult = false;
  this._userId = null;

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
    this._checkAge();
    // this._reqTwdAdRcvAgreeInfo();
  },

/**
   * @function
   * @desc 성인 여부 (만 14세 이상) 체크
   * @param 
   */
  _checkAge: function () {
    var _this = this;
    // 이벤트 페이지는 비로그인시 접근도 가능한 화면이기 때문에 
    // 성인인지 여부를 체크하기 이전에 로그인 여부를 먼저 조회하도록 한다. (로그인 시에만 성인 여부 조회하도록)
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
    .done($.proxy(function (res) {
      if(res.code===Tw.API_CODE.CODE_00) {
        if(res.result !== null && res.result.loginType !== 'S') { // 로그인되어 있고, 간편로그인이 아닌 경우
          this._isLogined = true;

          this._userId = res.result.userId;

          // 성인인지 여부 (만 14세 이상) 체크
          this._apiService.request(Tw.API_CMD.BFF_08_0080, {})
          .done($.proxy(function (res) {
            if (res.code === Tw.API_CODE.CODE_00) {
              if (res.result.age >= 14) {
                this._isAdult = true;
                this._reqTwdAdRcvAgreeInfo();
              }
            } else {
              // BFF_08_0080 API 호출 시 API code 가 정상으로 넘어오지 않더라도 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
              // Tw.Error(res.code, res.msg).pop();
              return;
            }
          }, this))
          .fail(function (err) {
            // BFF_08_0080 API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
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
   * @desc T world 광고정보수신동의 여부 조회 및 미동의시 배너영역 노출 
   * @param 
   */
  _reqTwdAdRcvAgreeInfo: function () {
    // 이벤트 페이지는 비로그인시 접근도 가능한 화면이기 때문에 
    // T world 광고정보수신동의 여부를 조회하기 이전에 로그인 여부를 먼저 조회하도록 한다. (로그인 시에만 T world 광고정보수신동의 여부 조회하도록)
    if (this._isLogined) {
      // T world 광고정보수신동의 여부 조회
      this._apiService.request(Tw.API_CMD.BFF_03_0021, {})
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          if (res.result.twdAdRcvAgreeYn === 'N') {

            if ( this._isAdult ) {
              $('#agree-banner-area').show();
              
              // 모바일App
              if ( Tw.BrowserHelper.isApp() ) {
                var data = Tw.CommonHelper.getLocalStorage('hideTwdAdRcvAgreePop_' + this._userId);

                // 최초 접근시 또는 다음에 보기 체크박스 클릭하지 않은 경우
                if (Tw.FormatHelper.isEmpty(data)) {
                  // $('#agree-popup-area').show();
                  this._onOpenAgreePopup();
                  // return;
                } 
                // 그 외 경우 처리
                else {
                  data = JSON.parse(data);

                  var now = new Date();
                  now = Tw.DateHelper.convDateFormat(now);
  
                  if ( Tw.DateHelper.convDateFormat(data.expireTime) < now ) { // 만료시간이 지난 데이터 일 경우
                    // console.log('만료시점이 지난 경우 (노출)');
                    // 광고 정보 수신동의 팝업 노출
                    // $('#agree-popup-area').show();
                    this._onOpenAgreePopup();
                  } else {
                    // console.log('만료시점 이전인 경우 (비노출)');
                  }
                }
              } 
              // 모바일웹
              else {
                if ( Tw.CommonHelper.getCookie('hideTwdAdRcvAgreePop_' + this._userId) !== null ) {
                  // console.log('다음에 보기 처리 이력 존재');
                } else {
                  // console.log('최초 접근시 또는 다음에 보기 체크박스 클릭하지 않은 경우 (노출)');
                  // 광고 정보 수신동의 팝업 노출
                  // $('#agree-popup-area').show();
                  this._onOpenAgreePopup();
                }
              }              
            }
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
    }
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
    this.$container.on('click', '.fe-pop-agree', $.proxy(this._modAgreePop, this));  // T world 광고정보수신동의 활성화 처리 (팝업)
    this.$container.on('click', '.fe-show-detail', $.proxy(this._showAgreeDetail, this));   // T world 광고정보수신동의 약관 상세보기
    this.$container.on('click', '.fe-pop-show-detail', $.proxy(this._showAgreePopDetail, this));   // T world 광고정보수신동의 약관 상세보기
    this.$container.on('click', '.fe-close', $.proxy(this._closeAgree, this));   // T world 광고정보수신동의 배너 닫기
    this.$container.on('click', '.fe-pop-close', $.proxy(this._closeAgreePop, this));   // T world 광고정보수신동의 팝업 닫기
    this.$container.on('click', '.fe-pop-hide', $.proxy(this._hideTwdAdRcvAgreePop, this));   // T world 광고정보수신동의 팝업 하루동안 보지않기 처리
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
      .done($.proxy(function () {
        $('#agree-banner-area').hide();
        // $('#agree-popup-area').hide();
        var toastMsg = '수신동의가 완료되었습니다.';
        // Tw.CommonHelper.toast(toastMsg);        
        Tw.Popup.toast(toastMsg);
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 활성화 처리 (팝업)
   */
  _modAgreePop: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0022, {twdAdRcvAgreeYn: 'Y'})
      .done($.proxy(function (){
        $('#agree-banner-area').hide();
        // $('#agree-popup-area').hide();
        this._onCloseAgreePopup();
        var toastMsg = '수신동의가 완료되었습니다.';
        // Tw.CommonHelper.toast(toastMsg);
        Tw.Popup.toast(toastMsg);
      }, this))
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
   * @desc T world 광고정보수신동의 팝업 약관 상세보기
   */
  _showAgreePopDetail: function () {
    // $('#agree-popup-area').hide();
    this._onCloseAgreePopup();
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
   * @desc T world 광고정보수신동의 팝업 닫기
   */
  _closeAgreePop: function () {
    // $('#agree-popup-area').hide();
    this._onCloseAgreePopup();
  },

  /**
   * @function
   * @desc T world 광고정보수신동의 팝업 다음에 보기 처리 (반영구적으로 비노출)
   */
  _hideTwdAdRcvAgreePop: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._setLocalStorage('hideTwdAdRcvAgreePop', this._userId, 365*10);
    } else {
      this._setCookie('hideTwdAdRcvAgreePop', this._userId, 365*10);
    }

    // $('#agree-popup-area').hide();
    this._onCloseAgreePopup();
  },

  /**
   * @function
   * @desc 다음에 보기 처리 (Native localstorage 영역에 저장, 반영구적으로 비노출)
   */
  _setLocalStorage: function (key, userId, expiredays) {
    var keyName = key + '_' + userId;  // ex) hideTwdAdRcvAgreePop_shindh
    var today = new Date();
    
    today.setDate( today.getDate() + expiredays );

    Tw.CommonHelper.setLocalStorage(keyName, JSON.stringify({
      // expireTime: Tw.DateHelper.convDateFormat(today)
      expireTime: today
    }));
  },

  /**
   * @function
   * @desc 다음에 보기 쿠키 처리 (반영구적으로 비노출)
   */
  _setCookie: function (key, userId, expiredays) {
    var cookieName = key + '_' + userId;  // ex) hideTwdAdRcvAgreePop_shindh
    var today = new Date();

    today.setDate( today.getDate() + expiredays );

    document.cookie = cookieName + '=Y; path=/; expires=' + today.toGMTString() + ';';
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
    var $target = null;
    var _this = this;

    if (typeof(id) !== 'string') {
      var event = id;
      $target = $(event.currentTarget);
      id = $target.attr('id');
    }

    var url = '/tevent';
    if (this._uri === 'win') {
      url = url + '/win/detail?id=';
    } else {
      url = url + '/detail?id=';
    }

    var billYn = $target.attr('data-billYn');

    if (Tw.BrowserHelper.isApp()) {
      Tw.Native.send(Tw.NTV_CMD.GET_NETWORK, {},
        $.proxy(function (res) {
            if ( res.resultCode === Tw.NTV_CODE.CODE_00 && !res.params.isWifiConnected ) {
              // WIFI 망이 아닌 경우

              if (billYn === 'Y') {
                // 과금여부가 Y 인 경우
                _this._popupService.openConfirm(null,Tw.POPUP_CONTENTS.NO_WIFI,
                  $.proxy(function () {
                    _this._popupService.close();
                    _this._historyService.goLoad(url + id);
                  },_this),
                  $.proxy(_this._popupService.close,_this._popupService),$target
                );
              } else {
                // 과금여부가 N 인 경우
                _this._historyService.goLoad(url + id);
              }
            } else {
              // WIFI 망인 경우
              _this._historyService.goLoad(url + id);
            }
          }, _this)
      );
    } else {
      // 모바일WEB
      _this._historyService.goLoad(url + id);
    }
    
    
    // if (billYn === 'Y') {
    //   this._popupService.openConfirm(null,Tw.POPUP_CONTENTS.NO_WIFI,
    //     $.proxy(function () {
    //       this._popupService.close();
    //       this._historyService.goLoad(url + id);
    //     },this),
    //     $.proxy(this._popupService.close,this._popupService),$target
    //   );
    // } else {
    //   this._historyService.goLoad(url + id);
    // }
  },
  
  /**
   * @function
   * @desc 광고성정보수신동의 팝업 open
   */
  _onOpenAgreePopup: function() {
    var template = $('#fe-agree-popup'); // 각각의 메뉴 추가를 위한 handlebar template
    this._agreePopup = Handlebars.compile(template.html());
    this.$container.attr('aria-hidden', 'false');
    this.$container.find('#contents').after(this._agreePopup({ }));
    this._popupService._addHash(null, 'ad-info-agreement');
  },

  /**
   * @function
   * @desc 광고성정보수신동의 팝업 close
   */
  _onCloseAgreePopup: function () {
    this.$container.attr('aria-hidden', 'true');
    if ( window.location.hash.indexOf('ad-info-agreement') !== -1 ) {
      this._historyService.goBack();
    }
  }
};
