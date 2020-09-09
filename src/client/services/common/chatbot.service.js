Tw.ChatbotService = function() {
    this._apiService = Tw.Api;
    this._bpcpService = Tw.Bpcp;
    this._historyService = new Tw.HistoryService();
    this._svcInfo = null;

    this._hbsFile;     // 챗봇 발화어 노출 대상 화면별 팝업 디자인
    this._menuId;      // 어느 화면에서 진입한 케이스인지 구분하기 위해 챗봇으로 I/F 하기 위한 메뉴ID
    this._appVersion;  // 챗봇으로 I/F 하기 위한 모바일Tworld App 버전

    // 1, 2차 오픈일 경과 여부 체크를 위한 일자 관련 변수 [S]
    this._currentDate = Tw.DateHelper.getCurrentShortDate();
    this._firstOoenDate = Tw.DateHelper.getCurrentShortDate('20200723');
    this._secondOpenDate = Tw.DateHelper.getCurrentShortDate('20200827');
    // 1, 2차 오픈일 경과 여부 체크를 위한 일자 관련 변수 [E]

    // 챗봇 발화어 노출 대상군 판단을 위해 호출 필요한 API List
    this._defaultRequestUrls = [
        // { command: Tw.API_CMD.BFF_03_0014, params: {} },                             // 1. 개인정보이용동의 여부 및 동의일자
        { command: Tw.API_CMD.BFF_05_0030, params: {} }                            // 2. 미납 내역 조회 (/core-bill/v1/bill-pay/unpaid-bills)
        ,{ command: Tw.API_CMD.BFF_05_0040, params: {mappProdIds: 'NA00004184'} }   // 4. 소액결제 이용여부
        // 20/08/11 요건 삭제로 주석 처리 [S]
        // ,{ command: Tw.NODE_CMD.GET_CHILD_INFO, params: {} }                        // 3. 자녀회선 보유 여부 및 자녀회선수
        // ,{ command: Tw.API_CMD.BFF_05_0058, params: {} }                            // 5. 자동납부 신청여부
        // 20/08/11 요건 삭제로 주석 처리 [E]
    ];
    
    // 1차 사외 오픈 (7/23) 시점 접근 대상 단말 리스트
    this._accessAllowedDevice0723 = [
        // 'LGM-G600S',    // TEST
        'SM-G977N'      // 갤럭시S10 5G
        ,'SM-N971N'     // 갤럭시노트10 5G
        ,'SM-N976N'     // 갤럭시노트10 플러스 5G
    ];
    // 1차 사외 오픈 (7/23) 시점 챗봇 팝업 노출대상 화면 리스트
    this._chatbotPopDispPageUrls0723 = {
        // '/myt-fare/submain'   : 'mytfare_submain_chatbot_pop'           // 나의요금 서브메인
        '/myt-fare/submain'   : 'mytfare_submain_chatbot_pop_new'           // 나의요금 서브메인
    };

    // 2차 사외 오픈 (8/27) 시점 접근 대상 단말 리스트
    this._accessAllowedDevice0827 = [
        'LGM-G600S',     // TEST
        'SM-G977N'      // 갤럭시S10 5G
        ,'SM-N971N'     // 갤럭시노트10 5G
        ,'SM-N976N'     // 갤럭시노트10 플러스 5G
        // ,'SM-N960N'     // 갤럭시노트9
        // ,'SM-G960N'     // 갤럭시S9
        // ,'SM-G973N'     // 갤럭시S10
        // ,'SM-A516N'     // 갤A51 5G
        // ,'iPhone12_1'   // 아이폰11
        // ,'iPhone12_3'   // 아이폰11Pro

        // 8/26 SKT임원테스트를 위한 단말기 등록 [S]
        //, 'LM-V510N'
        //, 'SM-A220S'
        //, 'SM-N960N'
        //, 'SM-A805N'
        //, 'SM-A205S'
        // 8/26 SKT임원테스트를 위한 단말기 등록 [E]
    ];
    // 2차 사외 오픈 (8/27) 시점 챗봇 팝업 노출대상 화면 리스트
    this._chatbotPopDispPageUrls0827 = {
        // 20/08/11 요건 삭제로 주석 처리 [S]
        // '/product/mobileplan' : 'mobileplan_submain_chatbot_pop',        // 1. 요금제 서브메인
        // 20/08/11 요건 삭제로 주석 처리 [E]
        // '/myt-fare/submain'   : 'mytfare_submain_chatbot_pop',           // 2. 나의요금 서브메인
        // '/myt-data/submain'   : 'mytdata_submain_chatbot_pop'            // 3. 나의 데이터/통화
        '/myt-fare/submain'   : 'mytfare_submain_chatbot_pop_new'           // 2. 나의요금 서브메인        
        ,'/myt-data/submain'   : 'mytdata_submain_chatbot_pop_new'          // 3. 나의 데이터/통화
    };
    
    // 챗봇 상담하기 화면 경로
    this._chatbotDefaultPage = '/chatbot/counsel';

    // 종류별 챗봇 발화어 노출 기준 [S]
    this._twdAgreeYn = 'N~0';    // 개인정보 이용동의 여부 및 동의일자 (Y~숫자: 동의함~동의일자, N~0: 미동의)
    this._unpaidYn = 'Y';        // 미납내역 존재 여부 (Y: 미납 존재, N: 미납 없음)
    this._micropayYn = 'N';      // 소액결제 이용 여부 (Y: 이용, N: 미이용)

    // 20/08/11 요건 삭제로 주석 처리 [S]
    // this._haveChildYn = 'N~0';   // 자녀회선 보유 여부 및 자녀회선수 (Y~숫자: 자녀회선 보유~회선수, N~0: 자녀회선 없음)
    // this._autopayYn = 'N';       // 자동납부 신청 여부 (Y: 신청, N: 미신청)
    // 20/08/11 요건 삭제로 주석 처리 [E]
    // 종류별 챗봇 발화어 노출 기준 [E]

    // 20/08/11 요건 삭제로 주석 처리 [S]
    // this._childSvcInfo = [];     // 자녀 회선 리스트    
    // 20/08/11 요건 삭제로 주석 처리 [E]
    this._deviceModelCode;       // 접근 가능 단말 여부 체크를 위한 고객 회선의 단말모델코드 정보

    // 퍼블 관련 변수 [S]
    this._timer;
    this._isStartY = 0;
    this._isLastY = 0;
    // 퍼블 관련 변수 [E]

    new Tw.XtractorService($('body'));
    // this._tidLanding = new Tw.TidLandingComponent();
    this._registerHelper();
    this._init();
};

Tw.ChatbotService.prototype = {
    /**
     * @function
     * @member
     * @desc svcInfo 요청 및 초기화 실행
     * @returns {void}
     */
    _init: function () {
        var _this = this;

        // Tw.Logger.log('[chatbot.service] [_init] App/WEB 체크', '');
        console.log('[chatbot.service] [_init] App/WEB 체크', '');

        if ( !Tw.BrowserHelper.isApp() ) {
            // App 에서만 접근 가능 (Web 에서는 비노출)
            // Tw.Logger.info('[chatbot.service] [_init] WEB 을 통한 접근', '');
            console.log('[chatbot.service] [_init] WEB 을 통한 접근', '');
            return;
        } else {
            // Tw.Logger.info('[chatbot.service] [_init] APP 을 통한 접근', '');
            console.log('[chatbot.service] [_init] APP 을 통한 접근', '');
            var userAgentString = Tw.BrowserHelper.getUserAgent();

            // App Version 정보
            if ( /appVersion:/.test(userAgentString) ) {
                _this._appVersion = userAgentString.match(/\|appVersion:([\.0-9]*)\|/)[1];
                // Tw.Logger.info('[chatbot.service] [_init] App 버전 정보 : ', _this._appVersion);
                console.log('[chatbot.service] [_init] App 버전 정보 : ', _this._appVersion);
            }

            // 단말 모델 정보
            if ( /model:/.test(userAgentString) ) {
                _this._deviceModelCode = userAgentString.split('model:')[1].split('|')[0];
                // Tw.Logger.info('[chatbot.service] [_init] 단말 모델 정보 : ', _this._deviceModelCode);
                console.log('[chatbot.service] [_init] 단말 모델 정보 : ', _this._deviceModelCode);
            }
        }

        // 챗봇 노출 대상 화면 여부 체크
        var urlPath = location.pathname;

        // Tw.Logger.info('[chatbot.service] [_init] 접속한 페이지 URL : ', urlPath);
        // Tw.Logger.info('[chatbot.service] [_init] 1차 사외 오픈 일자 : ', this._firstOoenDate);
        // Tw.Logger.info('[chatbot.service] [_init] 2차 사외 오픈 일자 : ', this._secondOpenDate);
        // Tw.Logger.info('[chatbot.service] [_init] 현재 일자 : ', this._currentDate);
        console.log('[chatbot.service] [_init] 접속한 페이지 URL : ', urlPath);
        console.log('[chatbot.service] [_init] 1차 사외 오픈 일자 : ', this._firstOoenDate);
        console.log('[chatbot.service] [_init] 2차 사외 오픈 일자 : ', this._secondOpenDate);
        console.log('[chatbot.service] [_init] 현재 일자 : ', this._currentDate);

        var isAllowed = false;      // 오픈 일자 경과 여부
        var isDefaultPage = false;  // 전체메뉴 > 챗봇 상담하기 를 통한 진입 여부
        if (Tw.DateHelper.getDiffByUnit(this._currentDate, this._firstOoenDate, 'day') > -1) {
            // 1차 사외 오픈 일자 이후

            if (Tw.DateHelper.getDiffByUnit(this._currentDate, this._secondOpenDate, 'day') > -1) {
                // 2차 사외 오픈 일자 이후
                // Tw.Logger.info('[chatbot.service] [_init] 2차 사외 오픈 일자 이후인 경우', '');
                console.log('[chatbot.service] [_init] 2차 사외 오픈 일자 이후인 경우', '');

                if (this._chatbotPopDispPageUrls0827[urlPath] !== undefined) {
                    // 2차 사외 오픈 시점 노출 대상 화면인 경우
                    // Tw.Logger.info('[chatbot.service] [_init] 2차 사외 오픈 시점 노출 대상 화면인 경우', '');
                    console.log('[chatbot.service] [_init] 2차 사외 오픈 시점 노출 대상 화면인 경우', '');

                    isAllowed = true;
                } else if (urlPath === this._chatbotDefaultPage) {
                    // 전체 메뉴 > 챗봇 체험하기 접근 시
                    // 진입화면, 유무선, 발화어, T월드 앱 버전, 개인정보 수집/이용동의
                    // Tw.Logger.info('[chatbot.service] [_init] 전체 메뉴 > 챗봇 체험하기 접근 시', '');
                    console.log('[chatbot.service] [_init] 전체 메뉴 > 챗봇 체험하기 접근 시', '');
                    
                    isAllowed = true;
                    isDefaultPage = true;
                } else {
                    // 대상화면이 아닌 경우
                    // Tw.Logger.info('[chatbot.service] [_init] 챗봇 팝업 노출 대상 화면이 아닌 경우', '');
                    console.log('[chatbot.service] [_init] 챗봇 팝업 노출 대상 화면이 아닌 경우', '');
                }

            } else {
                // 1차 사외 오픈 일자 이후 && 2차 사외 오픈 일자 이전
                // Tw.Logger.info('[chatbot.service] [_init] 1차 사외 오픈 일자 이후지만 2차 사외 오픈 일자 이전인 경우', '');
                console.log('[chatbot.service] [_init] 1차 사외 오픈 일자 이후지만 2차 사외 오픈 일자 이전인 경우', '');

                if (this._chatbotPopDispPageUrls0723[urlPath] !== undefined) {
                    // 1차 사외 오픈 시점 노출 대상 화면인 경우
                    // Tw.Logger.info('[chatbot.service] [_init] 1차 사외 오픈 시점 노출 대상 화면인 경우', '');
                    console.log('[chatbot.service] [_init] 1차 사외 오픈 시점 노출 대상 화면인 경우', '');

                    isAllowed = true;
                } else if (urlPath === this._chatbotDefaultPage) {
                    // 전체 메뉴 > 챗봇 체험하기 접근 시
                    // 진입화면, 유무선, 발화어, T월드 앱 버전, 개인정보 수집/이용동의
                    // Tw.Logger.info('[chatbot.service] [_init] 전체 메뉴 > 챗봇 체험하기 접근 시', '');
                    console.log('[chatbot.service] [_init] 전체 메뉴 > 챗봇 체험하기 접근 시', '');

                    isAllowed = true;
                    isDefaultPage = true;
                } else {
                    // 대상화면이 아닌 경우
                    // Tw.Logger.info('[chatbot.service] [_init] 챗봇 팝업 노출 대상 화면이 아닌 경우', '');
                    console.log('[chatbot.service] [_init] 챗봇 팝업 노출 대상 화면이 아닌 경우', '');
                }
            }
        } else {
            // Tw.Logger.info('[chatbot.service] [_init] 1차 사외 오픈 일자 이전인 경우', '');
            console.log('[chatbot.service] [_init] 1차 사외 오픈 일자 이전인 경우', '');
        }



        if (isAllowed) {
            if (isDefaultPage) {
                // Tw.Logger.info('[chatbot.service] [_init] 전체메뉴 > 챗봇 상담하기 를 통해 진입한 경우', '');
                console.log('[chatbot.service] [_init] 전체메뉴 > 챗봇 상담하기 를 통해 진입한 경우', '');

                this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
                .done($.proxy(function(res) {
                    if (res.code===Tw.API_CODE.CODE_00) {
                        if (res.result !== null) {
                            if (res.result !== null && res.result.loginType !== 'S') {
                                if (res.result.expsSvcCnt !== '0') {
                                    // 정회원
                                    this._svcInfo = res.result;

                                    // 챗봇 서비스 차단 여부 체크
                                    _this._checkBlockChatbotService('/chatbot/counsel');
                                } else {
                                    // 준회원
                                }
                                
                            } else {
                                // 간편 로그인
                                // Tw.Logger.info('[chatbot.service] [_init] 간편 로그인', '');
                                console.log('[chatbot.service] [_init] 간편 로그인', '');
                                return;
                            }
                        } else {
                            // 미로그인
                            // Tw.Logger.info('[chatbot.service] [_init] 미로그인', '');
                            console.log('[chatbot.service] [_init] 미로그인', '');
                            return;
                        }                        
                    }
                }, this));
            } else {
                // Tw.Logger.info('[chatbot.service] [_init] 챗봇 팝업 노출대상 화면에 진입한 경우', '');
                console.log('[chatbot.service] [_init] 챗봇 팝업 노출대상 화면에 진입한 경우', '');

                this._apiService.requestArray([
                    { command: Tw.NODE_CMD.GET_SVC_INFO, params: {} },
                    { command: Tw.API_CMD.BFF_05_0220, params: {} }
                ])
                .done($.proxy(function() {
                    var resp1 = arguments[0];   // GET_SVC_INFO
                    var resp2 = arguments[1];   // BFF_05_0220

                    Tw.Logger.info('[chatbot.service] [_init] 회선 정보 (GET_SVC_INFO) : ', resp1.result);
                    Tw.Logger.info('[chatbot.service] [_init] 단말기 기술방식 (BFF_05_0220) : ', resp2);

                    if (resp1.code===Tw.API_CODE.CODE_00) {
                        if (resp1.result !== null) {
                            if (resp1.result !== null && resp1.result.loginType !== 'S') {   // 간편로그인은 제외
                                if (resp2.code===Tw.API_CODE.CODE_00) {
    
                                    var eqpMthdCd = resp2.result.eqpMthdCd;
                                    Tw.Logger.info('[chatbot.service] [_init] 단말기 기술방식 코드 (5G : F / LTE : L / 3G : W) : ', eqpMthdCd);

                                    var beqpSclEqpClSysCd = resp2.result.beqpSclEqpClSysCd;
                                    Tw.Logger.info('[chatbot.service] [_init] 단말기분류체계코드 (0102001 : Voice or Data 가능한 tablet / 0202001 : Voice 불가능한 Tablet) : ', beqpSclEqpClSysCd);
            
                                    // 챗봇 노출 접근대상  : 5G (F) / LTE (L) / 3G (W)
                                    // 태블릿은 접근 불가 (태블릿 : 0102001, 0202001)
                                    if (resp1.result.svcAttrCd === 'M1' && ['W', 'L', 'F'].indexOf(eqpMthdCd) > -1 
                                        && ['0102001', '0202001'].indexOf(beqpSclEqpClSysCd) < 0
                                    ) {
                                        Tw.Logger.info('[chatbot.service] [_init] 챗봇 접근 대상 (5G/LTE/3G 이고 태블릿이 아닌 경우) 인 경우', '');

                                        // 챗봇 발화어 노출 대상 단말 여부
                                        var isAllowedDevice = false;
    
                                        if (Tw.DateHelper.getDiffByUnit(this._currentDate, this._firstOoenDate, 'day') > -1) {
                                            // 1차 사외 오픈 일자 이후
            
                                            if (Tw.DateHelper.getDiffByUnit(this._currentDate, this._secondOpenDate, 'day') > -1) {
                                                // 2차 사외 오픈 일자 이후
                                                Tw.Logger.info('[chatbot.service] [_init] 2차 사외 오픈 시점 접근 가능 단말 여부 체크', '');
    
                                                for (var idx = 0; idx < _this._accessAllowedDevice0827.length; idx++) {
                                                    var allowed_device = _this._accessAllowedDevice0827[idx];
    
                                                    if (_this._deviceModelCode.indexOf(allowed_device) > -1) {
                                                        isAllowedDevice = true;
                                                    }
                                                } // end for
    
                                                // 접근 대상 단말인 경우 종류별 발화어 노출여부 판단을 위한 API 를 호출한다.
                                                if (isAllowedDevice) {
                                                    this._hbsFile = this._chatbotPopDispPageUrls0827[urlPath];
                                                    var menuList = JSON.parse(Tw.CommonHelper.getSessionStorage('MENU_DATA_INFO'));
                
                                                    if (menuList.length > 0) {
                                                        for (var i = 0; i < menuList.length; i++) {
                                                            if (urlPath === menuList[i].menuUrl) {
                                                                _this._menuId = menuList[i].menuId;
                                                            }
                                                        }
                                                    }
    
                                                    this._svcInfo = resp1.result;
                                                }
                                            } else {
                                                // 1차 사외 오픈 일자 이후 && 2차 사외 오픈 일자 이전
                                                Tw.Logger.info('[chatbot.service] [_init] 1차 사외 오픈 시점 접근 가능 단말 여부 체크', '');
    
                                                for (var idx = 0; idx < _this._accessAllowedDevice0723.length; idx++) {
                                                    var allowed_device = _this._accessAllowedDevice0723[idx];
    
                                                    if (_this._deviceModelCode.indexOf(allowed_device) > -1) {
                                                        isAllowedDevice = true;
                                                    }
                                                } // end for
    
                                                // 접근 대상 단말인 경우 종류별 발화어 노출여부 판단을 위한 API 를 호출한다.
                                                if (isAllowedDevice) {
                                                    this._hbsFile = this._chatbotPopDispPageUrls0723[urlPath];
                                                    var menuList = JSON.parse(Tw.CommonHelper.getSessionStorage('MENU_DATA_INFO'));
                
                                                    if (menuList.length > 0) {
                                                        for (var i = 0; i < menuList.length; i++) {
                                                            if (urlPath === menuList[i].menuUrl) {
                                                                _this._menuId = menuList[i].menuId;
                                                            }
                                                        }
                                                    }
    
                                                    this._svcInfo = resp1.result;
                                                }
                                            }
                                        } else {
                                            Tw.Logger.info('[chatbot.service] [_init] 1차 사외 오픈 일자 이전인 경우', '');
                                            return;
                                        }
                                    } else {
                                        // 챗봇 노출 비대상 (2G / 선불폰 / 태블릿/2nd device / 인터넷 / 집전화 / TV) 인 경우
                                        Tw.Logger.info('[chatbot.service] [_init] 챗봇 노출 비대상 (2G / 선불폰 / 태블릿/2nd device / 인터넷 / 집전화 / TV) 인 경우', '');
                                        return;
                                    }

                                    // 챗봇 서비스 차단 여부 체크
                                    this._checkBlockChatbotService();
                                }
                            } else {
                                // 간편 로그인
                                Tw.Logger.info('[chatbot.service] [_init] 간편 로그인', '');
                                console.log('[chatbot.service] [_init] 간편 로그인', '');
                                return;
                            }
                        } else {
                            // 미로그인
                            Tw.Logger.info('[chatbot.service] [_init] 미로그인', '');
                            console.log('[chatbot.service] [_init] 미로그인', '');
                            return;
                        }
                    }
                }, this));
            }

            // // 챗봇 서비스 차단 여부 체크
            // this._checkBlockChatbotService();
        }
    },

    /**
     * 핸들바 helper 등록
     * @private
     */
    _registerHelper: function () {

        // 20/08/11 요건 삭제로 주석 처리 [S]
        // /*
        //  개인정보 이용 동의 하였고 동의한지 3일 이상 경과한 경우,
        //  "이용요금분석해줘" 말풍선 노출
        // */
        // Handlebars.registerHelper('isTargetTwdInfoRcvAgree', function (targetCd, options) {
        //     Tw.Logger.info('[chatbot.service] [_registerHelper] [isTargetTwdInfoRcvAgree] targetCd : ', targetCd);

        //     var targetCdArray = targetCd.split('~');

        //     if (targetCdArray[0] === 'Y' && targetCdArray[1] > 3) {
        //         return options.fn(this);
        //     } else {
        //         return options.inverse(this);
        //     }
        // });

        // /*
        //  자식회선이 등록되어 있고 2명 이상인 경우,
        //  "이용요금분석해줘" 말풍선 노출
        // */
        // Handlebars.registerHelper('haveTwoOrMoreChilds', function (targetCd, options) {
        //     Tw.Logger.info('[chatbot.service] [_registerHelper] [haveTwoOrMoreChilds] targetCd : ', targetCd);

        //     var targetCdArray = targetCd.split('~');

        //     if (targetCdArray[0] === 'Y') {
        //         if (targetCdArray[1] > 1) {
        //             // return options.inverse(this);
        //             return options.fn(this);            //test
        //         } else {
        //             // return options.fn(this);
        //             return options.inverse(this);       //test
        //         }
        //     }
        // });
        // 20/08/11 요건 삭제로 주석 처리 [E]

        Handlebars.registerHelper('isDisplay', function (targetCd, options) {
            Tw.Logger.info('[chatbot.service] [_registerHelper] [isDisplay] targetCd : ', targetCd);
            
            if (targetCd === 'Y') {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
    },

    _cacheElements: function () {
        Tw.Logger.info('[chatbot.service] [_cacheElements]', '');

        // 20/08/11 디자인 변경사항 적용 전 버전 관련 변수
        // 20/08/11 디자인 변경으로 인한 삭제 [S]
        // this.$elPopChabot       = $('.popup-chabot');
        // this.$elPopChabotBlind  = $('.popup-chabot .popup-blind');
        // this.$elChabot          = $('.tod-ui-chabot');
        // this.$elChabotButton    = $('.tod-ui-chabot-button');
        // this.$elOneButton       = $('.tod-ui-chabot-button .chat-btn');
        // 20/08/11 디자인 변경으로 인한 삭제 [E]

        // 20/08/11 디자인 변경사항 적용 이후 버전 관련 변수
        this.$elChabot          = $('.tod-ui-chabot2');
        this.$btnTab            = $('.btn-tab');
        
    },
  
    /**
     * @function
     * @desc 이벤트 바인드 / 콘테이너에 이벤트를 주고 있어 새로 생성되는 객체에도 이벤트가 바인드 됨을 유의해야 함
     */
    _bindEvent: function () {
        Tw.Logger.info('[chatbot.service] [_bindEvent]', '');

        var _this = this;

        // 3초 후 안내 팝업 슬라이드 업
        _this._timer = setTimeout(function() {
            _this.$elChabot.addClass('slideUp'); 
        }, 3000);

        // 윈도우 스크롤 시 챗봇
        $(document).on('scroll',$.proxy(function () {
            Tw.Logger.info('[chatbot.service] [_bindEvent] $(document).on(scroll)', '');

            clearTimeout(_this._timer);
            _this._timer = setTimeout(function(){ 
                _this.$elChabot.addClass('slideUp'); 
            }, 1000);
        }, _this));

        //touch event
        _this.$btnTab.on('touchstart', function(e) {
            // e.preventDefault();
            _this._isStartY = e.originalEvent.touches[0].clientY;
        });

        _this.$btnTab.on('touchmove', function(e) {
            // e.preventDefault();
            _this._isLastY = e.originalEvent.touches[0].clientY;
        });

        _this.$btnTab.on('touchend', function(e) {
            // e.preventDefault();
            // click인 경우
            if (Math.abs(_this._isStartY - _this._isLastY) < 20) {
                _this.expanded();
            // 닫혀 있는데 아래로 내린 경우 - 창 최대화
            } else if (!_this.$elChabot.hasClass('expanded') && _this._isStartY > _this._isLastY ) {
                _this.expanded();
            // 열려 있는데 아래로 내린 경우 - 창 최소화
            } else if (_this.$elChabot.hasClass('expanded') && _this._isStartY < _this._isLastY ) {
                _this.expanded();
            // 닫혀 있는데 아래로 내린 경우 - 창 숨김
            } else if (!_this.$elChabot.hasClass('expanded') && _this._isStartY < _this._isLastY ) {
                _this.$elChabot.removeClass('slideUp');
            }
        });

        setTimeout( function () {
            _this._animateSvg('.profile2', Tw.Environment.cdn + '/js/chatbot_1.json', false);
        }, 3200 );
        
        // 20/08/11 디자인 변경으로 인한 삭제 [S]
        // /*
        // 1. 페이지 진입시 스크롤 없을 경우 3초 후 노출  (노출 후 스크롤시 팝업유지)
        // 2. 페이지 진입하자마자 3초 이내에 스크롤 발생시 스크롤 멈춘 후 (움직임 없이 1초 후) 노출
        // 3. 바텀까지 내려간 후 팝업 바로 노출
        // 4. 팝업 올라오는 속도 0.5초
        // */       
        
        // //3초후 
        // _this._timer = setTimeout(function() {
        //     _this.$elChabot.addClass('slideUp'); 
        // }, 3000);

        // // 스크롤 이벤트
        // $(document).on('scroll',$.proxy(function () {
        //     Tw.Logger.info('[chatbot.service] [_bindEvent] $(document).on(scroll)', '');

        //     clearTimeout(_this._timer);
        //     _this._timer = setTimeout(function(){ 
        //         _this._chatBot && _this.$elChabot.addClass('slideUp'); 
        //     }, 1000);
        // }, _this));

        // //tab 클릭 시 
        // $('.tod-ui-chabot .btn-tab').on('click', function() {
        //     Tw.Logger.info('[chatbot.service] [_bindEvent] $(.tod-ui-chabot .btn-tab).on(click)', '');

        //     _this.expanded();
        // });

        // //close 버튼 클릭 시 
        // $('.tod-ui-chabot .btn-close').on('click', function() {
        //     Tw.Logger.info('[chatbot.service] [_bindEvent] $(.tod-ui-chabot .btn-close).on(click)', '초기화 / 챗봇 아이콘 노출');

        //     /* 초기화 */
        //     $('body').removeClass('noscroll');
        //     _this.$elPopChabotBlind.addClass('none');
        //     _this.$elChabotButton.removeClass('none');
        //     _this.$elChabot.removeClass('expanded').removeClass('slideUp');
        //     _this.$elChabot.attr('data-scroll', 'true');

        //     _this._chatBot = false;
        //     _this.playChatBtn();
        // });

        // //chatbot 아이콘형 버튼 클릭 시 
        // // $('.popup-chabot .chabot-button').on('click', function(){
        // $('.popup-chabot .tod-chat-btn').on('click', function(){
        //     Tw.Logger.info('[chatbot.service] [_bindEvent] $(.popup-chabot .tod-chat-btn).on(click)', '');

        //     _this._chatBot = true;

        //     setTimeout(function(){ 
        //         _this.$elChabot.addClass('slideUp');
        //     }, 300);

        //     _this.chatBtn();
        // });
       // 20/08/11 디자인 변경으로 인한 삭제 [E]

        // 말풍선 (링크) 클릭시 
        $('.linkItem').on('click', function(e){
            Tw.Logger.info('[chatbot.service] [_bindEvent] $(.linkItem).on(click)', '');

            var url = $(e.currentTarget).data('url');
            Tw.Logger.info('[chatbot.service] [_bindEvent] url : ', url);
            Tw.Logger.info('[chatbot.service] [_bindEvent] $(e.currentTarget).hasClass("pop") ? ', $(e.currentTarget).hasClass('pop'));

            if ( $(e.currentTarget).hasClass('pop') ) {
                // window.open('http://150.28.70.24:3000' + url, '_blank');
                window.open(url, '_blank');
                // Tw.CommonHelper.openUrlExternal('https://app.tworld.co.kr' + url);
            } else {
                window.location.href = url;
            }
        });

        // 말풍선 (챗봇 발화어) 클릭시 
        $('.bpcpItem').on('click', function(e){
            Tw.Logger.info('[chatbot.service] [_bindEvent] $(.bpcpItem).on(click)', '');

            var chatbotGubun = ''
            if ($(e.currentTarget).hasClass('link-chatbot-go')) {
                chatbotGubun = $(e.currentTarget).attr('class').replace('link-chatbot-go bpcpItem', '').trim();
            } else {
                chatbotGubun = $(e.currentTarget).attr('class').replace('item bpcpItem', '').trim();
            }
            var serviceType = '';     // 유무선 여부 (M:무선, W:유선)
            Tw.Logger.info('[chatbot.service] [_bindEvent] 챗봇 발화어 구분 : ', '[' + chatbotGubun + ']');

            if (_this._svcInfo.svcAttrCd === 'M1') {
                serviceType = 'M';
            } else if (['S1', 'S2', 'S3'].indexOf(_this._svcInfo.svcAttrCd) > -1) {
                serviceType = 'W';
            }
            Tw.Logger.info('[chatbot.service] [_bindEvent] 유무선 여부 (M:무선, W:유선) : ', serviceType);

            var eParam = '';
            var chkAccessDtm = Tw.DateHelper.getFullDateAnd24Time(new Date());
            // var extraParam = 'menuId=' + _this._menuId + '&svcGr=' + _this._svcInfo.svcGr + '&svcType=' + serviceType + '&appVersion=' + _this._appVersion + '&twdAgreeInfo=' + _this._twdAgreeYn.split('~')[0];
            var extraParam = 'menuId=' + _this._menuId + '&svcGr=' + _this._svcInfo.svcGr + '&svcType=' + serviceType + '&appVersion=' + _this._appVersion + '&chkAccessDtm=' + chkAccessDtm;
            Tw.Logger.info('[chatbot.service] [_bindEvent] BPCP 연동시 추가 I/F 위한 파라미터 : ', extraParam);

            switch (chatbotGubun) {
                case 'rcmnd_prod':
                    extraParam += '&keyword=rcmnd_prod';
                    break;
                case 'usage_pattern':
                    extraParam += '&keyword=usage_pattern';
                    break;
                case 'data_gift':
                    extraParam += '&keyword=data_gift';
                    break;
                case 'refill_coupon':
                    extraParam += '&keyword=refill_coupon';
                    break;
                case 'unpaid_amt':
                    extraParam += '&keyword=unpaid_amt';
                    break;
                case 'hotbill':
                    extraParam += '&keyword=hotbill';
                    break;
                case 'pay_mthd':
                    extraParam += '&keyword=pay_mthd';
                    break;
                case 'pay_bill':
                    extraParam += '&keyword=pay_bill';
                    break;
                case 'micro_pay':
                    extraParam += '&keyword=micro_pay';
                    break;
                default:
                    extraParam += '&keyword=initial';
                    break;
            }

            _this._bpcpService.open_withExtraParam('BPCP:0000065084', _this._svcInfo ? _this._svcInfo.svcMgmtNum : null, eParam, extraParam);
        });

        // 20/08/11 요건 삭제로 주석 처리 [S]
        // // 자녀 실시간요금/이번달이용요금 조회 시 자녀회선 선택 UI 전환
        // $('.selectChildLine').on('click', function(e){
        //     Tw.Logger.info('[chatbot.service] [_bindEvent] $(.selectChildLine).on(click)', '');

        //     $('#initial-ui').hide();

        //     if ($(e.currentTarget).hasClass('hotbill')) {
        //         $('#fe-child-line-ui .tit-txt').text('자녀 실시간 사용요금');
        //         $('#fe-child-line-ui .usebill').hide();
        //         $('#fe-child-line-ui .hotbill').show();
        //     } else if ($(e.currentTarget).hasClass('usebill')) {
        //         $('#fe-child-line-ui .tit-txt').text('자녀 이번 달 이용요금');
        //         $('#fe-child-line-ui .hotbill').hide();
        //         $('#fe-child-line-ui .usebill').show();
        //     }
        //     // Tw.Logger.info('자녀 관련 말풍선 클릭 - $(e.currentTarget) : ', $(e.currentTarget));

        //     // Tw.Logger.info('자녀 관련 말풍선 클릭 : ', $('#fe-child-line-ui .tit-txt').text());

        //     $('#fe-child-line-ui').show();
        // });

        // $('.item-prev').on('click', function (e) {
        //     Tw.Logger.info('[chatbot.service] [_bindEvent] $(.item-prev).on(click)', '');

        //     $('#fe-child-line-ui').hide();
        //     $('#initial-ui').show();
        // });
        // 20/08/11 요건 삭제로 주석 처리 [E]


        // 좌상단 메뉴버튼 클릭 시 챗봇 팝업 영역 비노출을 위한 처리
        // $(window).bind('hashchange', function(){
        //     Tw.Logger.info('[chatbot.service] [_bindEvent] $(window).bind(hashchange)', '');
        //     Tw.Logger.info('[chatbot.service] [_bindEvent] window.location.hash : ', window.location.hash);
        //     Tw.Logger.info('[chatbot.service] [_bindEvent] this._historyService.getHash() : ', _this._historyService.getHash());

        //     if (_this._historyService.getHash() === '#menu') {
        //         Tw.Logger.info('[chatbot.service] [_bindEvent] _this._historyService.getHash() === "#menu"', '');

        //         // 20/08/11 디자인 변경으로 인한 삭제 [S]
        //         // _this.$elChabot.hide();
        //         // _this.$elChabotButton.hide();
        //         // 20/08/11 디자인 변경으로 인한 삭제 [E]
        //     } else if (_this._historyService.getHash() === '') {
        //         Tw.Logger.info('[chatbot.service] [_bindEvent] _this._historyService.getHash() === ""', '');

        //         // 20/08/11 디자인 변경으로 인한 삭제 [S]
        //         // _this.$elChabot.show();
        //         // _this.$elChabotButton.show();
        //         // 20/08/11 디자인 변경으로 인한 삭제 [E]
        //     }
        // });
    },

    /**
     * @function
     * @member
     * @desc chatbot 차단 여부 확인을 위한 API 호출 (환경설정데이터)
     */
    _checkBlockChatbotService: function (url) {
        
        var propertyId = {
            property: Tw.REDIS_KEY.CHATBOT_DISABLE_TIME
        };

        Tw.Logger.info('[chatbot.service] [_checkBlockChatbotService] 환경설정변수 ID : ', propertyId);

        // 챗봇 상담하기 (/chatbot/counsel) 로 접근하는 경우 중간의 게이트웨이 페이지가 있기 때문에 
        // 하드웨어 백 버튼 또는 하단의 확인 버튼 클릭시 게이트페이지로 돌아가게 되어 무한루프에 빠지게 되므로
        // 챗봇 상담하기 진입 이전의 referer 페이지로 replaceState 처리함.
        if (url === '/chatbot/counsel') {
            Tw.Logger.info('[chatbot.service] [_checkBlockChatbotService] 챗봇 상담하기 접근 시 리퍼러 페이지', url);
            history.replaceState({}, '', document.referrer);
        }        

        this._apiService.request(Tw.API_CMD.BFF_01_0069, propertyId)
            .done($.proxy(this._successGetIsolTime, this, url))
            .fail($.proxy(this._failGetIsolTime, this));
    },


    /**
     * @function
     * @member
     * @desc chatbot 차단 여부 확인
     */
    _successGetIsolTime: function (resp) {
        
        var today = Tw.DateHelper.getFullDateAnd24Time(new Date());
        Tw.Logger.info('[chatbot.service] [_successGetIsolTime] url : ', arguments[0]);
        Tw.Logger.info('[chatbot.service] [_successGetIsolTime] resp : ', arguments[1]);
        Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 현재 시간 : ', today);

        if (arguments[1].code === Tw.API_CODE.CODE_00) {
            var isolTime = arguments[1].result.split('~');
            var isolStaDtm = Tw.DateHelper.getFullDateAnd24Time(isolTime[0]);   // 차단 시작 시간
            var isolEndDtm = Tw.DateHelper.getFullDateAnd24Time(isolTime[1]);   // 차단 종료 시간

            Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 환경설정변수값 : ', arguments[1].result);
            Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 차단 시작 시간 : ', isolStaDtm);
            Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 차단 종료 시간 : ', isolEndDtm);
            Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 챗봇 서비스 차단 여부 : ', Tw.DateHelper.isBetween(today, isolStaDtm, isolEndDtm));
            
            if (Tw.DateHelper.isBetween(today, isolStaDtm, isolEndDtm)) {
                Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 챗봇 서비스 차단 중인 경우', '');

                if (arguments[0] === '/chatbot/counsel') {                    
                    location.href = '/common/util/service-block?fromDtm=' + isolTime[0] + '&toDtm=' + isolTime[1];
                } else {
                    return null;
                }
            } else {
                Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 챗봇 서비스 차단 중이 아닌 경우', '');

                this._requestApis();
            }
        }
    },

    /**
     * @function
     * @member
     * @desc chatbot 차단 여부 조회 실패시
     */
    _failGetIsolTime: function (error) {
        // 차단 여부 조회 실패시 _requestApis() 를 호출하지 않음.
        Tw.Logger.error(error);
    },

    /**
     * @function
     * @member
     * @desc 로그인 여부에 따른 분기 처리
     */
    _requestApis: function () {
        if (this._svcInfo) {
            Tw.Logger.info('[chatbot.service] [_requestApis] 로그인 상태', this._svcInfo);

            if (this._svcInfo.expsSvcCnt !== '0') { // 준회원이 아닌 경우에만 타겟군 판단을 위한 API를 호출하도록 처리.
                Tw.Logger.info('[chatbot.service] [_requestApis] 정회원인 경우', '');
                // Tw.Logger.info('[chatbot.service] [_requestApis] api list', this._defaultRequestUrls);

                for (var i = 0; i < this._defaultRequestUrls.length; i++) {
                    if (Tw.API_CMD.BFF_03_0014 === this._defaultRequestUrls[i].command) {
                        Tw.Logger.info('[chatbot.service] [_requestApis] Tw.API_CMD.BFF_03_0014 에 서비스관리번호를 pathParams 로 추가', '');

                        this._defaultRequestUrls[i].pathParams = [this._svcInfo.svcMgmtNum];
                    }
                }

                Tw.Logger.info('[chatbot.service] [_requestApis] 호출할 API 리스트 : ', this._defaultRequestUrls);

                this._apiService.requestArray(this._defaultRequestUrls)
                    .done($.proxy(this._checkTargetGroup, this));
            
            } else {    // 준회원인 경우
                Tw.Logger.info('[chatbot.service] [_requestApis] 준회원인 경우', '');
                // 준회원의 경우 BPCP 연동 시 서비스관리번호가 없기 때문에 _redirectChatbotPage() 호출 시 오류가 발생하나
                // 이선근 매니저 요청으로 우선 메뉴 접근 제외는 보류하도록 요청 받아 _redirectChatbotPage() 호출하도록 일단 처리함.
                this._redirectChatbotPage();
            }

            // this._apiService.requestArray([
            //     { command: Tw.API_CMD.BFF_03_0014, params: {}, pathParams: [this._svcInfo.svcMgmtNum] },    // 1. 개인정보이용동의 여부 및 동의일자
            //     { command: Tw.API_CMD.BFF_05_0030, params: {} },    // 2. 미납 내역 조회 (/core-bill/v1/bill-pay/unpaid-bills)
            //     { command: Tw.NODE_CMD.GET_CHILD_INFO, params: {} },// 3. 자녀회선 보유 여부 및 자녀회선수
            //     { command: Tw.API_CMD.BFF_05_0040, params: {mappProdIds: 'NA00004184'} },    // 4. 소액결제 이용여부
            //     { command: Tw.API_CMD.BFF_05_0058, params: {} }     // 5. 자동납부 신청여부
            // ])
            // .done($.proxy(this._checkTargetGroup, this));
        } else {
            Tw.Logger.info('[chatbot.service] [_requestApis] 비로그인 상태', '');
        }        
    },


    /**
     * @function
     * @desc 말풍선 노출 대상군 확인
     */
    _checkTargetGroup: function (/*twdAgreeInfo,*/ unpaidBillInfo, micropayInfo /*, childInfo, autopayInfo*/ ) {
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        // 8/25 챗봇 내 개인화 추천서비스에 대한 요건이 삭제되었으므로 개인화 이용정보 수집동의 여부는 조회하지 않도록 처리 [S]
        // /* ******************************************* 
        //     1. 이용요금분석 관련 말풍선 노출 대상군 여부 체크 
        // ******************************************* */
        // if ( twdAgreeInfo.code === Tw.API_CODE.CODE_00 ) {
        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] SKT 개인정보수집이용동의 여부 : ', twdAgreeInfo.result.agr203Yn);
        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] SKT 개인정보수집이용동의 일자 : ', twdAgreeInfo.result.agr203Dtm);

        //     if (twdAgreeInfo.result.agr203Yn === 'N') {
        //         this._twdAgreeYn = 'N~0';
        //     } else {
        //         /* **************************************************************************************************
        //            **************************************************************************************************
        //            < TO-DO >
        //              : BFF_03_0021 의 경우 개인정보 이용동의 여부만 리턴해주기 때문에, 
        //                이용동의일자를 받아오는 API 를 확인하여 BFF_03_0021를 대체할 필요가 있음
        //         **************************************************************************************************
        //         ************************************************************************************************** */

        //         var currentDate = Tw.DateHelper.getCurrentShortDate();
        //         var agreeDate = Tw.DateHelper.getCurrentShortDate(Tw.DateHelper.convDateFormat(twdAgreeInfo.result.agr203Dtm));
        //         Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 현재 일자 : ', currentDate);
        //         Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 동의 일자 : ', agreeDate);
        //         var gap = Tw.DateHelper.getDiffByUnit(currentDate, agreeDate, 'day');
        //         Tw.Logger.info('[chatbot.service] [_checkTargetGroup] gap : ', gap);
                
        //         this._twdAgreeYn = 'Y~' + gap;
        //     }

        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 1. 이용요금분석 관련 말풍선 노출 대상군 여부 : ', this._twdAgreeYn);
        // } else {
        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 1. 티월드 개인정보 이용동의 여부 조회 API 리턴 에러', twdAgreeInfo.code, twdAgreeInfo.msg);

        //     this._twdAgreeYn = 'N~0';
        //     // Tw.Error(twdAgreeInfo.code, twdAgreeInfo.msg, '1. 이용요금분석').pop();
        // }
        // 8/25 챗봇 내 개인화 추천서비스에 대한 요건이 삭제되었으므로 개인화 이용정보 수집동의 여부는 조회하지 않도록 처리 [E]
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        /* *******************************************
            2. 미납내역 관련 말풍선 노출 대상군 여부 체크 
        ******************************************* */
        if ( unpaidBillInfo.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 미납금액 : ', unpaidBillInfo.result.unPaidTotSum);

            if ( unpaidBillInfo.result.unPaidTotSum === '0' ) {
                this._unpaidYn = 'N';
            } else {
                this._unpaidYn = 'Y';
            }

            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 2. 미납내역 관련 말풍선 노출 대상군 여부 : ', this._unpaidYn);
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 2. 미납금액 조회 API 리턴 에러', unpaidBillInfo.code, unpaidBillInfo.msg);

            this._unpaidYn = 'N';
            // Tw.Error(unpaidBillInfo.code, unpaidBillInfo.msg, '2. 미납내역').pop();
        }

        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        /* *******************************************
            4. 소액결제 관련 말풍선 노출 대상군 여부 체크 
        ******************************************* */
        if ( micropayInfo.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 휴대폰결제 이용동의 (NA00004184) 상품 가입여부 : ', micropayInfo.result.isAdditionUse);

            if (micropayInfo.result.isAdditionUse === 'Y') {
                this._micropayYn = 'Y';
            }

            // var usedValueList = ['0', '2', '6']; // 소액결제 제한 없음/사용 코드값
            // var rtnUseYn = micropayInfo.result.isAdditionUse; // 소액결제 사용여부

            // for (var i = 0; i < usedValueList.length; i++) {
            //     if (rtnUseYn === usedValueList[i]) {
            //         this._micropayYn = 'Y';
            //     }
            // }

            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 4. 소액결제 관련 말풍선 노출 대상군 여부 : ', this._micropayYn);
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 4. 소액결제 이용제한 여부 조회 API 리턴 에러', micropayInfo.code, micropayInfo.msg);

            this._micropayYn = 'N';
            // Tw.Error(micropayInfo.code, micropayInfo.msg, '4. 소액결제').pop();
        }

        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        // 20/08/11 요건 삭제로 주석 처리 [S]
        // /* *******************************************
        //     3. 자녀 실시간/이용요금 관련 말풍선 노출 대상군 여부 체크 
        // ******************************************* */
        // if ( childInfo.code === Tw.API_CODE.CODE_00 ) {
        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 자녀회선 존재 여부 : ', !Tw.FormatHelper.isEmpty(childInfo.result));

        //     if (!Tw.FormatHelper.isEmpty(childInfo.result)) {
        //         var childCnt = childInfo.result.length;

        //         for (var i = 0; i < childInfo.result.length; i++) {
        //             var tmp = {svcmgmtnum: childInfo.result[i].svcMgmtNum, svcnum: Tw.FormatHelper.conTelFormatWithDash(childInfo.result[i].svcNum)};
        //             this._childSvcInfo.push(tmp);
        //         }

        //         Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._childSvcInfo : ', this._childSvcInfo);

        //         this._haveChildYn = 'Y~' + childCnt;
        //     } else {
        //         this._haveChildYn = 'N~0';
        //     }

        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 3. 자녀 실시간/이용요금 관련 말풍선 노출 대상군 여부 : ', this._haveChildYn);
        // } else {
        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 3. 자녀회선 존재 여부 조회 API 리턴 에러', childInfo.code, childInfo.msg);

        //     this._haveChildYn = 'N~0';
        //     // Tw.Error(childInfo.code, childInfo.msg, '3. 자녀 실시간/이용요금').pop();
        // }

        // Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        // /* *******************************************
        //     4. 소액결제 관련 말풍선 노출 대상군 여부 체크 
        // ******************************************* */
        // if ( micropayInfo.code === Tw.API_CODE.CODE_00 ) {
        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 휴대폰결제 이용동의 (NA00004184) 상품 가입여부 : ', micropayInfo.result.isAdditionUse);

        //     if (micropayInfo.result.isAdditionUse === 'Y') {
        //         this._micropayYn = 'Y';
        //     }

        //     // var usedValueList = ['0', '2', '6']; // 소액결제 제한 없음/사용 코드값
        //     // var rtnUseYn = micropayInfo.result.isAdditionUse; // 소액결제 사용여부

        //     // for (var i = 0; i < usedValueList.length; i++) {
        //     //     if (rtnUseYn === usedValueList[i]) {
        //     //         this._micropayYn = 'Y';
        //     //     }
        //     // }

        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 4. 소액결제 관련 말풍선 노출 대상군 여부 : ', this._micropayYn);
        // } else {
        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 4. 소액결제 이용제한 여부 조회 API 리턴 에러', micropayInfo.code, micropayInfo.msg);

        //     this._micropayYn = 'N';
        //     // Tw.Error(micropayInfo.code, micropayInfo.msg, '4. 소액결제').pop();
        // }

        // Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        // /* *******************************************
        //     5. 자동납부 신청 관련 말풍선 노출 대상군 여부 체크 
        // ******************************************* */
        // if ( autopayInfo.code === Tw.API_CODE.CODE_00 ) {
        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 납부방법 코드 : ', autopayInfo.result.payMthdCd);

        //     var autopayValueList = ['01', '02', 'G1'];      // 01: 은행자동납부, 02: 카드자동납부, G1:은행지로자동납부
        //     var rtnPayMthCd = autopayInfo.result.payMthdCd;    // 납부방법코드

        //     for (var i = 0; i < autopayValueList.length; i++) {
        //         if (rtnPayMthCd === autopayValueList[i]) {
        //             this._autopayYn = 'Y';
        //         }
        //     }

        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 5. 자동납부 신청 관련 말풍선 노출 대상군 여부 : ', this._autopayYn);
        // } else {
        //     Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 5. 납부방법 코드 조회 API 리턴 에러', autopayInfo.code, autopayInfo.msg);

        //     this._autopayYn = 'N';
        //     // Tw.Error(autopayInfo.code, autopayInfo.msg, '5. 자동납부').pop();
        // }
        // Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        // 20/08/11 요건 삭제로 주석 처리 [E]
        
        var targetValue = [
            // this._twdAgreeYn,
            this._unpaidYn
            ,this._micropayYn
            // 20/08/11 요건 삭제로 주석 처리 [S]
            // ,this._haveChildYn
            // ,this._autopayYn
            // 20/08/11 요건 삭제로 주석 처리 [E]
        ];
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 발화어 종류별 노출 여부 판단을 위한 대상군 여부 정보 : ', targetValue);


        var option = [{
            cdn: Tw.Environment.cdn
            ,data: targetValue
            // 20/08/11 요건 삭제로 주석 처리 [S]
            // ,child: this._childSvcInfo
            // 20/08/11 요건 삭제로 주석 처리 [E]
        }];
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] option : ', option);

        

        // 챗봇 팝업 노출 대상 화면인 경우 this._hbsFile 이 null 이 아님.
        // this._hbsFile 이 null 인 경우는 전체메뉴 > 쳇봇 상담하기 를 통한 진입인 경우이므로 
        // 별도 분기처리를 해준다.
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] hbs 파일 경로 : ', this._hbsFile);

        if (Tw.FormatHelper.isEmpty(this._hbsFile)) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 쳇봇 상담하기 를 통한 진입인 경우', '');

            this._redirectChatbotPage();
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 쳇봇 발화어 노출 대상 화면를 통한 진입인 경우', ' - 화면을 그려주기 위한 메서드 (_drawChatbotPop) 호출');

            this._drawChatbotPop(option, this._hbsFile);
        }
    },

    /**
     * @function
     * @desc 쳇봇 상담하기 를 통한 진입인 경우 BPCP 연동을 통하여 챗봇 화면으로 리다이렉트
     */
    _redirectChatbotPage: function () {
        var _this = this;
        var serviceType = '';     // 유무선 여부 (M:무선, W:유선)

        if (_this._svcInfo.svcAttrCd === 'M1') {
            serviceType = 'M';
        } else if (['S1', 'S2', 'S3'].indexOf(_this._svcInfo.svcAttrCd) > -1) {
            serviceType = 'W';
        }

        Tw.Logger.info('[chatbot.service] [_redirectChatbotPage] 유무선 여부 (M:무선, W:유선) : ', serviceType);

        var eParam = '';
        var chkAccessDtm = Tw.DateHelper.getFullDateAnd24Time(new Date());
        // var extraParam = 'menuId=&svcType=' + serviceType + '&svcGr=' + _this._svcInfo.svcGr + '&appVersion=' + _this._appVersion + '&twdAgreeInfo=' + _this._twdAgreeYn.split('~')[0] + '&keyword=initial';
        var extraParam = 'menuId=&svcType=' + serviceType + '&svcGr=' + _this._svcInfo.svcGr + '&appVersion=' + _this._appVersion + '&keyword=initial' + '&chkAccessDtm=' + chkAccessDtm;

        Tw.Logger.info('[chatbot.service] [_redirectChatbotPage] BPCP 연동시 추가 I/F 위한 파라미터 : ', extraParam);

        Tw.Logger.info('[chatbot.service] [_redirectChatbotPage] 챗봇 상담 시작하기 객체 : ', $('.btn-chabot-default'));

        $('.btn-chabot-default').attr('data-param', extraParam);

        // 인트로 페이지에서 '챗봇 상담 시작하기' 버튼 클릭시
        $('.btn-chabot-default').on('click', function(e){
            Tw.Logger.info('[chatbot.service] [_bindEvent] $(.btn-chabot-default).on(click)', '');


            $(e.currentTarget).addClass('on');

            var param = $(e.currentTarget).data('param');
            Tw.Logger.info('[chatbot.service] [_bindEvent] param : ', param);

            _this._bpcpService.open_withExtraParam('BPCP:0000065084', _this._svcInfo ? _this._svcInfo.svcMgmtNum : null, '', param);
        });

        $('.popup-closeBtn').on('click', $.proxy(function () {
            _this._historyService.goBack();
        }, this));
        
        // _this._bpcpService.open_withExtraParam('BPCP:0000065084', _this._svcInfo ? _this._svcInfo.svcMgmtNum : null, eParam, extraParam);
    },

    /**
     * @function
     * @desc 챗봇 팝업을 그려주는 메서드
     * @param (Object) param1 - 발화어 노출 여부 체크를 위한 대상군 정보 및 자녀 회선 정보
     * @param (String) param2 - hbs 파일 경로
     */
    _drawChatbotPop: function (param1, param2) {
        var _this = this;
        var url = Tw.Environment.cdn + '/hbs/';

        Tw.Logger.info('[chatbot.service] [_drawChatbotPop] 발화어 노출 대상군 정보 : ', param1);
        Tw.Logger.info('[chatbot.service] [_drawChatbotPop] hbs 파일 경로 : ', url + param2);

        $.get(url + param2 + '.hbs', function (text) {
            var tmpl = Handlebars.compile(text);
            var html = tmpl({param: param1});

            $('.wrap').append(html);

            Tw.Logger.info('[chatbot.service] [_drawChatbotPop] 챗봇 팝업 내 발화어 버튼 리스트 : ', $('.tod-ui-chabot2 .list .item'));

            _this._timer = setTimeout(function () {
                Tw.Logger.info('[chatbot.service] [_drawChatbotPop] 챗봇 팝업 객체 : ', _this.$elChabot);

                // 설문조사 플로팅 배너 객체 ($(".tod-floating")) 가 존재하는 경우 챗봇 발화어 팝업과 겹치므로 설문조사 플로팅 배너를 hide 처리한다.
                if ($('.tod-floating').length > 0) {
                    $('.tod-floating').hide();
                }

                _this.$elChabot.addClass('slideUp');
            }, 3000);
        }).done(function () {
            _this._cacheElements();
            _this._bindEvent();
            _this._toggleEmoticon();      
            new Tw.XtractorService($('body'));

            // 20/08/11 요건 삭제로 주석 처리 [S]
            // /*
            // 팝업 타이틀 문구 노출 우선순위 
            // 1. 미납요금 有 --> 황*우님 미납요금이 있으시네요
            // 2. 자녀 有 or 소액결제 이용중 --> 찾으실 만한 메뉴를 모아봤어요
            // 3. 자동납부 미신청 --> 자동납부신청 하시고 결과만 확인하세요.
            // 4. 조건에 해당 사항 없는 고객 --> T world 챗봇이 도와드릴까요?
            // */
            // if (param1[0].data[1] === 'Y') {
            //     // $('#initial-ui .tit-txt').text(_this._svcInfo.mbrNm + '님 <strong>미납요금</strong>이 있으시네요');
            //     $('#initial-ui .tit-txt').append(_this._svcInfo.mbrNm + '님 <strong>미납요금</strong>이 있으시네요');
            //     // $('#initial-ui .tit-txt').text('님 <strong>미납요금</strong>이 있으시네요');
            // } else if (param1[0].data[2].substr(0, 1) === 'Y' || param1[0].data[3] === 'Y') {
            //     // $('#initial-ui .tit-txt').text('찾으실 만한 메뉴를 모아봤어요');
            //     $('#initial-ui .tit-txt').append('찾으실 만한 메뉴를 모아봤어요');
            // } else if (param1[0].data[4] === 'Y') {
            //     // $('#initial-ui .tit-txt').text('<strong>자동납부신청</strong> 하시고 결과만 확인하세요');
            //     $('#initial-ui .tit-txt').append('<strong>자동납부신청</strong> 하시고 결과만 확인하세요');
            // } else {
            //     // $('#initial-ui .tit-txt').text('<strong>T world 챗봇</strong>이 도와드릴까요?');
            //     $('#initial-ui .tit-txt').append('<strong>T world 챗봇</strong>이 도와드릴까요?');
            // }
            // Tw.Logger.info('[chatbot.service] [_drawChatbotPop] 챗봇 팝업 타이틀 문구 : ', $('#initial-ui .tit-txt').text());
            // 20/08/11 요건 삭제로 주석 처리 [E]
        }).fail(function () {
            // 팝업 객체 그려주기 실패 시
            // 별도의 처리를 하지 않는다.
            Tw.Logger.info('[chatbot.service] [_drawChatbotPop] 팝업 객체 그려주기 실패', '');
        });
    },

    toggleNowrap: function (e) {
        $(e.currentTarget).attr('data-scroll', 'true');     // (e.currentTarget) --> this.$elChabot
        
        // $('.tod-ui-chabot .list-wrap').addClass('nowrap');
        $('.tod-ui-chabot2 .list-wrap').addClass('nowrap');
    },

    expanded: function () {
        if (this.$elChabot.hasClass('expanded')) {  // 확장 상태일 때
            $('body').removeClass('noscroll');
            this.$elChabot.removeClass('expanded');
            this.$elChabot.attr('data-scroll', 'true');
            this.$elChabot.on('webkitTransitionEnd', this.toggleNowrap);
        } else {
            $('body').addClass('noscroll');
            this.$elChabot.attr('data-scroll', 'false').addClass('expanded');
            this.$elChabot.off('webkitTransitionEnd', this.toggleNowrap);
        }
    },

    _animateSvg: function (element, path, loop) {
        var target = document.querySelectorAll(element);

        bodymovin.loadAnimation({
            container: target[target.length - 1],
            path: path,
            renderer: 'svg',
            loop: loop,
            autoplay: true,
            rendererSettions: { progressiveLoad: false, }
        }).play();
    },

    _toggleEmoticon: function () {
        var _this = this;
        // Math.random 함수는 보안 이슈가 있으므로 사용 금지. 2 ~ 5초 사이에 랜덤으로 움직인다.
        setTimeout(function () {
            $('.tod-chatbot-img').toggleClass('on');
            _this._toggleEmoticon();
        }, (((window.crypto.getRandomValues(new Uint32Array(1)) / 4294967296) * (5 - 2)) + 2) * 1000);
    }

    // 20/08/11 디자인 변경으로 인한 삭제 [S]
    // expanded: function () {
    //     var _this = this;

    //     if (this.$elChabot.hasClass('expanded')) {  // 확장 상태일 때
    //         $('body').removeClass('noscroll');
    //         this.$elChabot.removeClass('expanded');
    //         this.$elChabot.on('webkitTransitionEnd', this.toggleNowrap);
    //         setTimeout(function () {
    //             _this.$elPopChabotBlind.addClass('none');
    //         }, 300);
    //     } else {
    //         $('body').addClass('noscroll');
    //         this.$elPopChabotBlind.removeClass('none');
    //         this.$elChabot.attr('data-scroll', 'false').addClass('expanded');
    //         this.$elChabot.off('webkitTransitionEnd', this.toggleNowrap);
    //     }
    // },

    // toggleNowrap: function (e) {
    //     // this.$elChabot.attr('data-scroll', 'true');
    //     $(e.currentTarget).attr('data-scroll', 'true');     // (e.currentTarget) --> this.$elChabot
        
    //     $('.tod-ui-chabot .list-wrap').addClass('nowrap');
    //     // $('.tod-ui-chabot .list-wrap')[0].classList.add('nowrap');
    // },

    // //챗봇_icon-reset 
    // chatBtn : function () {
    //     this.$elChabotButton.addClass('none');
    //     this.$elChabot.removeClass('default color-red color-blue color-green color-purple');
    //     this.$elChabot.addClass('default');
    //     // $('.tod-ui-chabot-button')[0].classList.add('none');
    //     // $('.tod-ui-chabot-button .tod-chat-btn')[0].classList.remove('default color-red color-blue color-green color-purple'); 
    //     // $('.tod-ui-chabot-button .tod-chat-btn')[0].classList.add('default');

    //     this.stopChatBtn();
    // },

    // //챗본_icon-play
    // playChatBtn : function () {
    //     var colorArr = ['red', 'blue', 'green', 'purple'];
    //     var count = 0;
    //     var activeClass;

    //     this._timerBtn = setInterval(function () {
    //         activeClass = colorArr[count];

    //         // this.$elChabot.removeClass('default');
    //         // this.$elChabot.addClass('color-' + activeClass);
    //         $('.tod-ui-chabot-button .tod-chat-btn')[0].classList.remove('default'); 
    //         $('.tod-ui-chabot-button .tod-chat-btn')[0].classList.add('color-' + activeClass);
            
    //         $('.tod-chat-btn ' + '.' + activeClass).css('display', 'inline-block');

    //         setTimeout( function() {
    //             // this.$elChabot.removeClass('color-' + activeClass);
    //             // this.$elChabot.addClass('default');
    //             $('.tod-ui-chabot-button .tod-chat-btn')[0].classList.remove('color-' + activeClass); 
    //             $('.tod-ui-chabot-button .tod-chat-btn')[0].classList.add('default');

    //             if (count >= colorArr.length - 1) {
    //                 count = 0;
    //             } else {
    //                 count++; 
    //             }
    //         }, 3000);

    //         setTimeout( function() { 
    //             $('.tod-chat-btn ' + '.' + activeClass).css('display', 'none');
    //         }, 4000);
    //     }, 20000);  // 20초마다 보여짐
    // },

    // //챗봇_icon-stop
    // stopChatBtn : function () {
    //     clearInterval(this._timerBtn);
    // }
    // 20/08/11 디자인 변경으로 인한 삭제 [E]
};
