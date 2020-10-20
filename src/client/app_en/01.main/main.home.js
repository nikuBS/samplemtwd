/**
 * @file main.home.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.06
 */

/**
 * @class
 * @desc 메인 > 홈(my)
 * @param rootEl - dom 객체
 * @param svcAttCd
 * @param emrNotice
 * @param menuId
 * @param isLogin
 * @param actRepYn
 * @constructor
 */
Tw.MainHome = function (rootEl, svcAttCd, emrNotice, menuId, isLogin, actRepYn, mbrNm,svcMgmtNum) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();

  this._svcMgmtNum = svcMgmtNum;
  this._menuId = menuId;
  this.$elBarcode = null;
  this.$elArrSmartCard = [];
  this.loadingStaus = [];
  this._emrNotice = null;
  this._targetDataLink = '';
  this._membershipBanner = null;
  this._isActRep = actRepYn === 'Y';
  this.$elArrMlsCard = [];
  this.mlsLoadingStaus = [];
  this._adid = null;
  this._twdUrl = '';
  this.mbrNm = mbrNm || '';

  this.isLogin = isLogin === 'true';
  this.svcAttCd = svcAttCd === 'true';
  // this._lineComponent = new Tw.LineComponent();

  // if ( location.hash === '#store' ) {
  //   setTimeout($.proxy(function () {
  //     skt_landing.action.home_slider({ initialSlide: 1, callback: $.proxy(this._onChangeSlider, this) });
  //     skt_landing.action.notice_slider();
  //   }, this), 40);
  // } else {
  //   setTimeout($.proxy(function () {
  //     skt_landing.action.home_slider({ initialSlide: 0, callback: $.proxy(this._onChangeSlider, this) });
  //     skt_landing.action.notice_slider();
  //   }, this), 40);
  // }

  
  this._bindEventLanding();
  this._bindEventLogin();
  this._registerHelper();

  //this._initPersonAction();

  if ( this.isLogin ) {
    this._cachedElement();
    this._bindEvent();
    this._setCoachMark();
    if ( this.svcAttCd ) {
      this._getMicroContentsData(this.$container.find('.fe-smart-micro'));
      this._getBillData(this.$container.find('.fe-smart-bill'));
    }
  }

  this._getProductData(this.$container.find('#plan-ul'));
  // new Tw.XtractorService(this.$container);
  this._nativeService.send(Tw.NTV_CMD.CLEAR_HISTORY, {});

  // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
  // this._lineComponent = new Tw.LineComponent();
  this._lineComponent = new Tw.LineComponent(this.$container, '.fe-bt-line', false, null);
};

Tw.MainHome.prototype = {
  
  /**
   * @function
   * @desc 로그인시 element 변수 초기화
   * @return {void}
   * @private
   */
  _cachedElement: function () {
    //this._svcMgmtNum = this.$container.find('.fe-bt-line').data('svcmgmtnum') &&
    //  this.$container.find('.fe-bt-line').data('svcmgmtnum').toString();

      
 
  },


  _registerHelper: function() {

    // 조건문을 사용하기 위해
    Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifunEquals', function (arg1, arg2, options) {
      return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
    });
  },
  

  /**
   * @function
   * @desc 로그인과 관련 없는 이벤트 바인딩
   * @return {void}
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-link-billguide', $.proxy(this._onClickGoBillGuide, this));
    this.$container.on('click', '.fe-mainLine', $.proxy(this._onUserInfo, this));    
  },

  /**
   * @function
   * @desc 랜딩 관련 이벤트 바인딩
   * @return {void}
   * @private
   */
  _bindEventLanding: function () {
    this.$container.on('click', '.fe-home-external', $.proxy(this._onClickExternal, this));
    this.$container.on('click', '.fe-home-internal', $.proxy(this._onClickInternal, this));
    this.$container.on('click', '.fe-home-sso-external', $.proxy(this._onClickSsoExternal, this));
  },

  _getProductData: function(element) {
    this._apiService.request(
      Tw.API_CMD.BFF_10_0202_EN, {idxCtgCd: 'F01100'})
    .done($.proxy(this._successProductData, this, element))
    .fail($.proxy(this._errorProductData, this));
  },

  /**
   * @function
   * @desc 로그인 이벤트 바인딩
   * @return {void}
   * @private
   */
  _bindEventLogin: function () {
    this.$container.on('click', '.fe-bt-home-login', $.proxy(this._onClickLogin, this));
    this.$container.on('click', '.fe-bt-signup', $.proxy(this._onClickSignup, this));    
  },

  _successProductData: function(element, resp) {
    var list = this._parsePlanData(resp);
    var $planTemp = $('#plan-ul');
    if ( $planTemp.length > 0 && list.length > 0 ) {
      var tplPlanCard = Handlebars.compile(Tw.HOME_PLAN_TMPL);
      $planTemp.html(tplPlanCard({
        list: list
      }))
      
      console.log($planTemp.html())
      skt_landing.widgets.widget_init(); // 이게 핵심
    }
  },

  _parsePlanData: function(planData) {
    if ( planData.code === Tw.API_CODE.CODE_00 ) {
      var CODE_5GX_PLAN = 'T000000079';
      var CODE_T_PLAN = 'T000000075';
      var CODE_0_PLAN = 'T000000029';

      var dataList = planData.result.grpProdList;
      return dataList.reduce(function(arr, item) {
        if ( item.prodGrpId === CODE_5GX_PLAN || item.prodGrpId === CODE_T_PLAN || item.prodGrpId === CODE_0_PLAN) { // 5GX PLAN, T PLAN, 0 PLAN 의 값만 추출
          var prodList = item.prodList;
          var ariaSelected = "false";
          var tempColor = "";
          var resultProdList = prodList.reduce(function(arr, item, index) {
            var odd_even_type = (index % 2) ? 'even' : 'odd'; // 홀수, 짝수를 구함.
            var basFeeInfo = Tw.ProductHelper.convProductBasfeeInfo(prodList[index].basFeeEngInfo);
            var basOfrVcallTmsEngCttTrans = prodList[index].basOfrVcallTmsEngCtt;
            if(basOfrVcallTmsEngCttTrans=='Unlimited landline & mobile phone calls'){
              basOfrVcallTmsEngCttTrans = 'Unlimited';
            }
           arr.push(Object.assign(item, {
              odd_even_type: odd_even_type,
              basFeeInfo : basFeeInfo.value,
              basOfrVcallTmsEngCttTrans : basOfrVcallTmsEngCttTrans
            }));
            return arr;
          }, []);
          if(item.prodGrpId === CODE_5GX_PLAN){
            ariaSelected = "true"
            tempColor = " five-gx";
          }
          Object.assign(item, {
            'tab_index' : arr.length + 1,
            'lastContents' : resultProdList.length % 2,
            'ariaSelected' : ariaSelected,
            'tempColor' : tempColor
          });
          var assign = Object.assign(item, resultProdList); // 병합
          arr.push(assign);
        } 
        return arr;
      }, []);
    } else {
      return [];
    }
  },

  _setProductData: function(arr,item) {
      var prodList = item.prodList;
          var ariaSelected = "false";
          var tempColor = "";
          var resultProdList = prodList.reduce(function(arr, item, index) {
            var odd_even_type = (index % 2) ? 'even' : 'odd'; // 홀수, 짝수를 구함.
            var basFeeInfo = Tw.ProductHelper.convProductBasfeeInfo(prodList[index].basFeeEngInfo);
            var basOfrVcallTmsEngCttTrans = prodList[index].basOfrVcallTmsEngCtt;
            if(basOfrVcallTmsEngCttTrans=='Unlimited landline & mobile phone calls'){
              basOfrVcallTmsEngCttTrans = 'Unlimited';
            }
           arr.push(Object.assign(item, {
              odd_even_type: odd_even_type,
              basFeeInfo : basFeeInfo.value,
              basOfrVcallTmsEngCttTrans : basOfrVcallTmsEngCttTrans
            }));
            return arr;
          }, []);
          if(item.prodGrpId === CODE_5GX_PLAN){
            ariaSelected = "true"
            tempColor = " five-gx";
          }
          Object.assign(item, {
            'tab_index' : arr.length + 1,
            'lastContents' : resultProdList.length % 2,
            'ariaSelected' : ariaSelected,
            'tempColor' : tempColor
          });
          var assign = Object.assign(item, resultProdList); // 병합
          arr.push(assign);
  },

  _errorProductData: function(error) {
    alert('error!##!' + error)
    console.log(error)
  },

  /**
   * @function
   * @desc 로그인 버튼 클릭 처리
   * @return {void}
   * @private
   */
  _onClickLogin: function () {
    this._tidLanding.goLogin();
  },
   /**
   * @function
   * @desc 회원가입 버튼 클릭 처리
   * @return {void}
   * @private
   */
  _onClickSignup: function () {
    this._tidLanding.goSignup();
  },
  /**
   * @function
   * @desc 외부 브라우저 랜딩 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickExternal: function ($event) {
    var url = $($event.currentTarget).data('url');

    // // 모바일T App 을 통하여 접근한 경우에만 adid 값을 넘김
    // if ( Tw.BrowserHelper.isApp() ) {
    //   // 현재 iOS App 에서는 GET_ADID 메서드가 제공되고 있지 않으므로 우선 Android App 에 대해서만 적용하여 테스트함.
    //   // 추후 iOS App 에서 해당 메서드 제공되도록 배포되면 아래 조건문을 제거
    //   if ( Tw.BrowserHelper.isAndroid() ) {
    //     this._twdUrl = url;
    //     this._nativeService.send(Tw.NTV_CMD.GET_ADID, {}, $.proxy(this._getAdid, this));
    //     // Native API 는 비동기로 호출되므로 링크 이동을 _getAdid 함수내에서 처리하도록 한다.
    //   } else {
    //     Tw.CommonHelper.openUrlExternal(url);
    //   }
    // } else {
    Tw.CommonHelper.openUrlExternal(url);
    // }
  },

  /**
   * @function
   * @desc 외부 브라우저 랜딩 처리(SSO)
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickSsoExternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openSsoUrlExternal(url);
  },
  /**
   * @function
   * @desc 사용자 정보 영역 클릭 시 동작 정의, 등록된 회선이 2개 이상인 경우에만 회선관리 actionsheet 노출
   * @param  {} $event
   */
  _onUserInfo: function ($event) {
    var $target = $($event.currentTarget);
    // if ( this._isMultiLine ) {
      if ( !this._lineComponent ) {
        // OP002-5925 : [FE] (W-1911-065-02) 2019 App./모바일웹접근성 샘플링 결과 반영(수정)
        this._lineComponent = new Tw.LineComponent(null, null, false, $target);
      }

      this._lineComponent.onClickLineView(this._svcMgmtNum, $target);      
      //this._lineComponent.onClickLine(this._svcInfo.svcMgmtNum, $target);
    // }
  },
  /**
   * @function
   * @desc
   * @param res
   * @private
   */
  _getAdid: function (res) {
    var url = this._twdUrl;
    var dstUrl = '';
    var str = '?';
    this._twdUrl = '';

    dstUrl = url.replace('http://', '');
    dstUrl = dstUrl.replace('https://', '');

    if ( res.resultCode !== Tw.NTV_CODE.CODE_00 || Tw.FormatHelper.isEmpty(res.params.adid) ) {
      return;
    }

    this._adid = res.params.adid;

    if ( url.indexOf('?') > -1 ) {
      str = '&';
    }

    url += str + 'url=1&dstUrl=' + encodeURIComponent(dstUrl) + '&adid=' + this._adid;

    // 링크 이동 처리
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 내부 이동 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickInternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    this._historyService.goLoad(url);

    $event.preventDefault();
    $event.stopPropagation();
  },
 
 

  /**
   * @function
   * @desc 요금안내서 버튼 클릭 처리
   * @return {void}
   * @private
   */
  _onClickGoBillGuide: function () {
    this._historyService.goLoad('/en/myt-fare/billguide/guide');
  },
 

  /**
   * @function
   * @desc 요금안내서 카드 데이터 요청
   * @param element
   * @private
   */
  _getBillData: function (element) {

    if(element.length == 0)
      return;

    var command = Tw.API_CMD.BFF_04_0008;
    if ( this._isActRep ) {
      command = Tw.API_CMD.BFF_04_0009;
    }
    var storeBill = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.HOME_BILL));
    if ( Tw.FormatHelper.isEmpty(storeBill) || Tw.DateHelper.convDateFormat(storeBill.expired).getTime() < new Date().getTime() ||
      this._svcMgmtNum !== storeBill.svcMgmtNum ) {
      this._apiService.request(command, {})
        .done($.proxy(this._successBillData, this, element))
        .fail($.proxy(this._failBillData, this));
    } else {
      this._drawBillData(element, storeBill.data);
    }
  },

  /**
   * @function
   * @desc 요금안내서 카드 데이터 처리
   * @param element
   * @param resp
   * @private
   */
  _successBillData: function (element, resp) {
    var storeData = {
      data: resp,
      expired: Tw.DateHelper.add5min(new Date()),
      svcMgmtNum: this._svcMgmtNum
    };
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_BILL, JSON.stringify(storeData));

    this._drawBillData(element, resp);
  },

  /**
   * @function
   * @desc 요금안내서 카드 데이터 실패 처리
   * @param error
   * @private
   */
  _failBillData: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 요금안내서 카드 렌더링
   * @param element
   * @param resp
   * @private
   */
  _drawBillData: function (element, resp) {
    var result = this._parseBillData(resp);

    if ( !Tw.FormatHelper.isEmpty(result) ) {
      var $billTemp = $('#fe-smart-bill');
      var tplBillCard = Handlebars.compile($billTemp.html());
      element.html(tplBillCard(result));
      element.removeClass('empty');
      element.addClass('nogaps');
      element.on('click', '#fe-bt-payment', _.debounce($.proxy(this._onClickPayment, this), 500));
    } else {
      element.hide();
    }
    //this._resetHeight();
  },

  /**
   * @function
   * @desc 요금안내서 카드 내 납부하기 버튼 클릭 처리
   * @param $event
   * @private
   */
  _onClickPayment: function ($event) {
    var svcAttrCd = $($event.currentTarget).data('svcattrcd');
    new Tw.MyTFareBill(this.$container, svcAttrCd, $($event.currentTarget));
  },

  /**
   * @function
   * @desc 요금안내서 데이터 파싱
   * @param billData
   * @returns {*}
   * @private
   */
  _parseBillData: function (billData) {
    
    if ( billData.code === Tw.API_CODE.BFF_0006 || billData.code === Tw.API_CODE.BFF_0011 ) {
      if ( billData.result.fallbackClCd === 'F0004' ) {
        // 대체문구 추후적용
        return null;
      } else {
        return null;
      }
    // billData.result 가 Object이나 내용이 없는 경우가 있음. -> invDt 가 있는지 체크 추가.
    } else if ( billData.code === Tw.API_CODE.CODE_00 && billData.result && billData.result.invDt) {  

      var invMonth = Tw.DateHelper.getCurrentMonth(billData.result.invDt);
      var invMonthMMM  = moment(billData.result.invDt).locale('en').format('MMM.');
      var billMonthMMM = moment(billData.result.invDt).locale('en').add(1, 'days').format('MMM.');

      var billMonth = '1';
      if ( invMonth === '12' ) {
        billMonth = '1';
      } else {
        billMonth = +invMonth + 1;
      }

      return {
        showData: true,
        isActRep: this._isActRep,
        useAmtTot: billData.result.amt,
        invEndDt: Tw.DateHelper.getShortDate(billData.result.invDt),
        invStartDt: Tw.DateHelper.getShortFirstDate(billData.result.invDt),
        // invMonth: Tw.DateHelper.getCurrentMonth(billData.result.invDt),
        // billMonth: +Tw.DateHelper.getCurrentMonth(billData.result.invDt) + 1
        invMonth: invMonth,
        billMonth: billMonth,
        invMonthMMM: invMonthMMM,
        billMonthMMM: billMonthMMM
      };
    } else {
      return {
        showData: false
      };
    }
  },

  /**
   * @function
   * @desc 소액결제/콘텐츠 이용요금 카드 데이터 요청
   * @param element
   * @private
   */
  _getMicroContentsData: function (element) {
    if(element.length == 0)
      return;

    var microContentsStore = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.HOME_MICRO_CONTENTS));
    if ( Tw.FormatHelper.isEmpty(microContentsStore) || Tw.DateHelper.convDateFormat(microContentsStore.expired).getTime() < new Date().getTime() ||
      this._svcMgmtNum !== microContentsStore.svcMgmtNum ) {
      this._apiService.requestArray([
        { command: Tw.API_CMD.BFF_04_0006, params: {} },
        { command: Tw.API_CMD.BFF_04_0007, params: {} }
      ]).done($.proxy(this._successMicroContentsData, this, element))
        .fail($.proxy(this._failMicroContentsData, this));
    } else {

      this._drawMicroContentsData(element, microContentsStore.data.contents, microContentsStore.data.micro);
    }
  },

  /**
   * @function
   * @desc 소액결제/콘텐츠 이용요금 카드 데이터 처리
   * @param element
   * @param contentsResp
   * @param microResp
   * @private
   */
  _successMicroContentsData: function (element, contentsResp, microResp) {
    var storeData = {
      data: {
        contents: contentsResp,
        micro: microResp
      },
      expired: Tw.DateHelper.add5min(new Date()),
      svcMgmtNum: this._svcMgmtNum
    };
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_MICRO_CONTENTS, JSON.stringify(storeData));
    this._drawMicroContentsData(element, contentsResp, microResp);
  },

  /**
   * @function
   * @desc 소액결제/콘텐츠 이용요금 카드 데이터 요청 실패 처리
   * @param error
   * @private
   */
  _failMicroContentsData: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 소액결제/콘텐츠 이용요금 카드 렌더링
   * @param element
   * @param contentsResp
   * @param microResp
   * @private
   */
  _drawMicroContentsData: function (element, contentsResp, microResp) {
    var apiBlock = false;
    var result = {
      micro: 0,
      contents: 0,
      invEndDt: Tw.DateHelper.getShortDate(new Date()),
      invStartDt: Tw.DateHelper.getShortFirstDate(new Date())
    };
    if ( microResp.code === Tw.API_CODE.BFF_0006 || microResp.code === Tw.API_CODE.BFF_0011 ) {
      if ( microResp.result.fallbackClCd === 'F0004' ) {
        // 대체문구 추후적용
        apiBlock = true;
      } else {
        apiBlock = true;
      }
    } else if ( microResp.code === Tw.API_CODE.CODE_00 ) {
      result.micro = Tw.FormatHelper.addComma(microResp.result.totalSumPrice);
    }

    if ( contentsResp.code === Tw.API_CODE.BFF_0006 || contentsResp.code === Tw.API_CODE.BFF_0011 ) {
      if ( contentsResp.result.fallbackClCd === 'F0004' ) {
        // 대체문구 추후적용
        apiBlock = true;
      } else {
        apiBlock = true;
      }
    } else if ( contentsResp.code === Tw.API_CODE.CODE_00 ) {
      result.contents = Tw.FormatHelper.addComma(contentsResp.result.invDtTotalAmtCharge);
    }

    if ( apiBlock ) {
      element.hide();
    } else {
      var $microContentsTemp = $('#fe-smart-micro-contents');
      var tplMicroContentsCard = Handlebars.compile($microContentsTemp.html());
      element.html(tplMicroContentsCard(result));
      element.removeClass('empty');
      element.addClass('nogaps');
    }

    //this._resetHeight();
  },
 
 

  /**
   * @function
   * @desc 코치마크 처리
   * @private
   */
  _setCoachMark: function () {
    new Tw.CoachMark(this.$container, '.fe-coach-line', '.fe-coach-line-target', Tw.NTV_STORAGE.COACH_LINE);
    new Tw.CoachMark(this.$container, '#fe-coach-data', '.fe-coach-data-target', Tw.NTV_STORAGE.COACH_DATA);
  },




  /**
   * @desc 개인화 말풍선 영역
   */
  _initPersonAction: function () {
    var personTimer = null, hideTimer1 = null, hideTimer2 = null;
    var personIcoClickYN = Tw.CommonHelper.getSessionStorage('PERSON_ICO_CLICKED'); // 한번 이상 개인화 진입 아이콘 클릭
    if ( personIcoClickYN === 'Y' ) {
      $('.h-person').removeClass('show');
      $('.h-person .btn-comment').hide();
    }

    function personAction() {
      clearTimeout(personTimer);
      clearTimeout(hideTimer1);
      clearTimeout(hideTimer2);

      personTimer = setTimeout(function () {
        $('.h-person').addClass('show');
        hideTimer1 = setTimeout(function () {
          $('.h-person').removeClass('show');
          hideTimer2 = setTimeout(function () {
            $('.h-person .btn-comment').hide();
          }, 1000)
        }, 3000);
      }, 500);
    }

    $(window).on('scroll', function () {
      if ( $(this).scrollTop() === 0 ) {
        if ( personIcoClickYN !== 'Y' ) {
          personAction();
        }
      } else {
        if ( personIcoClickYN !== 'Y' ) {
          $('.h-person .btn-comment').show();  //2020.05.13 추가
        }
        $('.h-person').removeClass('show');
      }
    });
    if ( personIcoClickYN !== 'Y' ) {
      personAction();
    }
  }
};
