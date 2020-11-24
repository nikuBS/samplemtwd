Tw.ChatbotService = function() {
    this._apiService = Tw.Api;
    this._bpcpService = Tw.Bpcp;
    this._historyService = new Tw.HistoryService();
    this._svcInfo = null;
    this._popupService = Tw.Popup; 
    this._twdUrl = '';
    this._adid = null;
   
    this._hbsFile;     // 챗봇 발화어 노출 대상 화면별 팝업 디자인
    this._menuId;      // 어느 화면에서 진입한 케이스인지 구분하기 위해 챗봇으로 I/F 하기 위한 메뉴ID
    this._appVersion;  // 챗봇으로 I/F 하기 위한 모바일Tworld App 버전
    this._loginType = 'N';   // 로그인 타입 ( T(정상로그인), S(간편로그인) )
    this._currentDate = Tw.DateHelper.getCurrentShortDate();    // 오늘날짜

    // 챗봇 발화어 노출 대상군 판단을 위해 호출 필요한 API List (201014)
    this._defaultRequestUrls = [
        { command: Tw.API_CMD.BFF_06_0001, params: {} }                             // 1. 리필쿠폰
        ,{ command: Tw.API_CMD.BFF_06_0002, params: {} }                            // 1-1. 리필쿠폰 사용이력
        ,{ command: Tw.API_CMD.BFF_05_0058, params: {} }                            // 2. 요금 납부방법 (01:은행자동납부, 02:카드자동납부, G1:은행지로자동납부)
        ,{ command: Tw.API_CMD.BFF_05_0030, params: {} }                            // 3. 미납 내역 조회 (/core-bill/v1/bill-pay/unpaid-bills)
        //,{ command: Tw.API_CMD.BFF_05_0040, params: {mappProdIds: 'NA00004184'} }   // 4. 소액결제 이용여부
        ,{ command: Tw.API_CMD.BFF_04_0007, params: {} }                            // 4. 소액결제 이용여부
        ,{ command: Tw.API_CMD.BFF_06_0015, params: {} }                            // 5. 데이터 선물가능
        ,{ command: Tw.API_CMD.BFF_05_0149, params: {} }                            // 6. 일시정지 (svcStCd: AC(사용중), SP(일시정지))
        ,{ command: Tw.API_CMD.BFF_04_0006, params: {} }                            // 7. 콘텐츠결제 이용 여부 (Y: 이용, N: 미이용)
        ,{ command: Tw.API_CMD.BFF_05_0235, params: {profile_id : 'default', item_ids : ['app_use_traffic_category_ratio','app_use_traffic_game_median_yn','app_use_traffic_music_ratio_median_yn']}}
    ];

    // 챗봇 팝업 노출대상 화면 리스트 (10/22)
     this._chatbotPopDispPageUrls = {
        //'/main/home' : 'greeting_pop',               // 0. 메인
        '/myt-data/submain' : 'greeting_pop',        // 1. 나의 데이터/통화
        '/myt-fare/submain'   : 'greeting_pop',      // 2. 나의요금
        '/myt-join/submain'   : 'greeting_pop',      // 3. 나의 가입정보
        '/membership/submain'   : 'greeting_pop',    // 4. T 멤버십
        '/product/mobileplan'   : 'greeting_pop',    // 5. 요금제
        '/product/mobileplan-add'   : 'greeting_pop' // 6. 부가서비스
    };

    // 발화어 리스트
    this._greetingKeywords = [
        // { keyword: 'initial', text:'챗봇으로 빠른 상담하기', type: 'A', message : '메뉴 찾기 어려우세요? 제가 도와드릴 수 있어요!'},
        // { keyword: 'initial', text:'챗봇으로 빠른 상담하기', type: 'B', message : '챗봇에게 궁금한 점을 물어보세요.'},  
        { keyword: 'pay_bill', message:'이번달 요금 얼마 나왔어?', type: 'A', linkUrl : ''},
        { keyword: 'pay_bill', message:'이번달 요금이 궁금하세요? <br> 이제 챗봇에게 물어보세요!', type: 'B', linkUrl : ''},
        { keyword: 'hotbill', message:'실시간 이용요금 알려줘', type: 'A', linkUrl : ''},  
        { keyword: 'hotbill', message:'실시간 이용 요금이 궁금하세요? <br>이제 챗봇에게 물어보세요!', type: 'B', linkUrl : ''},  
        { keyword: 'hotdata', message:'실시간 잔여량 알려줘', type: 'A', linkUrl : ''},    
        { keyword: 'hotdata', message:'현재 데이터 잔여량이 궁금하신가요? <br>챗봇에서 확인해보세요!', type: 'B', linkUrl : ''},    
        { keyword: 'refill_coupon', message:'리필 쿠폰 선물할래', type: 'A', linkUrl : ''},    
        { keyword: 'refill_coupon', message:'리필 쿠폰 refillCouponCnt장이 남아있어요. <br> 지금 챗봇에서 사용해 보시겠어요?', type: 'B', linkUrl : ''},    
        { keyword: 'pay_mthd', message:'요금납부 변경 문의', type: 'A', linkUrl : ''},    
        { keyword: 'pay_mthd', message:'지금 은행 자동이체로 납부 방법 변경하고 더 많은 소득 공제 혜택을 누리세요!', type: 'B', linkUrl : ''},    
        { keyword: 'unpaid_amt', message:'미납요금 얼마야?', type: 'A', linkUrl : ''},    
        { keyword: 'unpaid_amt', message:'미납요금이 총 unpaidAmt원 있습니다!<br> 바로 납부 하시겠어요?', type: 'B', linkUrl : ''},    
        // { keyword: 'membership_benefit', message:'내 멤버십 혜택이 뭐야?', type: 'A', message : '멤버십 혜택이 궁금하세요? 제가 알아봐 드릴 수 있어요!'},    
        // { keyword: 'membership_benefit', message:'내 멤버십 혜택이 뭐야?', type: 'B', message : '멤버십 혜택이 궁금하시다면, 챗봇에게 물어보세요.'},    
        { keyword: 'micro_pay', message:'소액결제 금액 얼마야?', type: 'A', linkUrl : ''},    
        { keyword: 'micro_pay', message:'이번 달 소액결제 이용 금액이 있어요. <br>지금 챗봇에서 확인해보시겠어요?', type: 'B', linkUrl : ''},    
        { keyword: 'contents_pay', message:'콘텐츠결제 금액 얼마야?', type: 'A', linkUrl : ''},    
        { keyword: 'contents_pay', message:'이번 달 콘텐츠 이용 금액이 있어요. <br>지금 챗봇에서 확인해보시겠어요?', type: 'B', linkUrl : ''},    
        { keyword: 'data_gift', message:'데이터 선물할래', type: 'A', linkUrl : ''},    
        // { keyword: 'data_gift', message:'T끼리 tCouponCnt회 / 가족 famCouponCnt회 데이터 선물이 가능하십니다. <br>지금 선물해 보시겠어요?', type: 'B', linkUrl : ''},   
        { keyword: 'data_gift', message:'데이터 선물 예정이신가요?챗봇이 도와드릴게요!', type: 'B', linkUrl : ''},    
        { keyword: 'cancel_pause', message:'일시정지 취소하고 싶어', type: 'A', linkUrl : ''},    
        { keyword: 'cancel_pause', message:'일시정지 pauseDayCnt일째 입니다. <br>지금 바로 일시정지 해제를 도와드릴까요?', type: 'B', linkUrl : ''},
        { keyword: 'vcoloring', message:'V컬러링이 뭐야?', type: 'A', unregYn : 'Y', linkUrl : 'https://www.vcoloring-event.com'},    
        { keyword: 'vcoloring', message:'데이터의 vodRatio%를 동영상시청에 사용하셨네요! <br>V컬러링으로 나의 원픽 동영상을 보여주세요!', type: 'B', unregYn : 'Y', linkUrl : 'https://www.vcoloring-event.com'},
        { keyword: 'vcoloring', message:'V컬러링 설정하러 가기', type: 'A', unregYn : 'N', linkUrl : 'https://tworld.vcoloring.com'},    
        { keyword: 'vcoloring', message:'V컬러링을 사용 중이시네요! <br>V컬러링 앱에서 새로운 동영상을 확인해보세요!', type: 'B', unregYn : 'N', linkUrl : 'https://tworld.vcoloring.com'},
        { keyword: 'wavve', message:'영상 콘텐츠는 wavve에서', type: 'A', linkUrl : 'https://m.tworld.co.kr/product/callplan?prod_id=NA00006577'},    
        { keyword: 'wavve', message:'데이터 vodRatio%를 영상 시청에 쓰는 당신! . <br>Wavve에서 데이터 걱정 없이 영상 시청하세요.', type: 'B', linkUrl : 'https://m.tworld.co.kr/product/callplan?prod_id=NA00006577'},
        { keyword: 'flo', message:'무제한 음악 스트리밍 FLO', type: 'A', linkUrl : 'https://m.tworld.co.kr/product/callplan?prod_id=NA00006520'},    
        { keyword: 'flo', message:'음악을 즐겨듣는 당신에게 추천드립니다. <br>이젠 FLO 전용 데이터로 음악을 즐겨보세요.', type: 'B', linkUrl : 'https://m.tworld.co.kr/product/callplan?prod_id=NA00006520'},
        { keyword: 'xbox', message:'5GX 클라우드 게임 알아보기', type: 'A', linkUrl : 'https://www.5gxcloudgame.com/main'},    
        { keyword: 'xbox', message:'지금 5GX 클라우드 게임 신청하면<br> 1개월 100원 이용권 혜택이 찾아갑니다!', type: 'B', linkUrl : 'https://www.5gxcloudgame.com/main'}
    ];

    // 챗봇 팝업 타입
    this._typeA = false;
    this._typeB = true;
    this._typeC = false;

    this._mlsGreetingImageType;         // MLS 에서 받아온 티월드그리팅이미지타입
    this._mlsGreetingTextType;          // MLS 에서 받아온 티월드그리팅텍스트타입
    this._mlsProcessId;                 // MLS 에서 받아온 precess_id (BFF_05_0232, BFF_05_0233에서 사용)
    this._mlsGreetingColor;             // MLS 에서 받아온 티월드그리팅 Color
    this._mlsGreetingTheme;             // MLS 에서 받아온 티월드그리팅 Theme
    this._mlsGreetingRangking = [];     // MLS 에서 받아온 티월드그리팅랭킹
    //this._addProdPayList = [];          // 유료부가서비스 리스트 (BFF_05_0222 데이터, vColoring, wavve, flo, xbox 발화여부 검증시 사용)
    this._greetingKeywordInfos = [];    // 노출할 발화어 정보

    this._defaultGreetingKeywords = ['pay_bill', 'hotbill', 'hotdata']; // 기본 발화어
    this._defaultMlsItems = 'hotbill|pay_bill|hotdata';                 // 기본 발화어의 MLS Item_id
    this._defaultColorB = 'purple';   // B타입 기본 컬러
    this._defaultColorC = 'purple';   // C타입 기본 컬러
    this._defaultThemeB = 'normal';   // B타입 기본 테마
    this._defaultThemeC = 'normal';   // C타입 기본 테마
    // MLS API 호출시 사용할 ChannelId
    this._mlsChannelId;
    
    // 챗봇 상담하기 화면 경로
    this._chatbotDefaultPage = '/chatbot/counsel';

    // 종류별 챗봇 발화어 노출 기준
    this._refilYn = 'N';         // 1. 사용가능 폰 있음 (Y: 있음, N: 없음) - refill_coupon
    this._refilHistYn = 'N';     // 1-1. 당월 리필쿠폰 사용이력 있음 (Y: 있음, N: 없음) - refill_coupon
    this._payMthdYn = 'N';       // 2. 자동납부 신청 표시 여부 (Y: 표시, N: 미표시) - pay_mthd
    this._unpaidYn = 'N';        // 3. 미납내역 존재 여부 (Y: 미납 존재, N: 미납 없음) - unpaid_amt
    // this._membershipYn = 'N';    // 4. 멤버십 가입 여부 (Y: 가입, N: 미가입) - membership_benefit - 삭제
    this._micropayYn = 'N';      // 4. 소액결제 이용 여부 (Y: 이용, N: 미이용) - micro_pay
    this._dataGiftYn='N';        // 5. 데이타 선물 가능 여부 (Y:가능 , N: 불가능) - data_gift
    this._pauseYn ='N';          // 6. 일시정지 여부 (Y: 정지, N: 미정지) - cancel_pause
    this._contentsPayYn ='N';    // 7. 콘텐츠결제 이용 여부 (Y: 이용, N: 미이용) - contents_pay
    this._vColoringYn ='N';      // 8. V컬러링 표시 여부 (Y: 표시, N: 미표시) - vcoloring
    this._vColoringProdUnregYn ='N';  // 8-1. V컬러링 부가서비스 미가입 여부 (Y: 미가입, N: 가입) - vcoloring
    this._wavveYn ='N';               // 9. waave 표시 여부 (Y: 표시, N: 미표시) - wavve
    this._wavveProdUnregYn ='N';      // 9. waave 부가서비스 미가입 여부 (Y: 미가입, N: 가입) - wavve
    this._floYn ='N';            // 10. flo 표시 여부 (Y: 표시, N: 미표시) - flo
    this._floProdUnregYn ='N';   // 10-1. flo 부가서비스 미가입 여부 (Y: 미가입, N: 가입) - flo
    this._xboxYn ='N';           // 11. xbox 표시 여부 (Y: 표시, N: 미표시) - xbox
    this._xboxProdUnregYn ='N';  // 11-1. xbox 부가서비스 미가입 여부 (Y: 미가입, N: 가입) - xbox

    // 개인화 변수
    this._refillCouponCnt = 0;  // 리필쿠폰
    this._unpaidAmt = 0;        // 미납요금
    this._tCouponCnt = 0;       // T끼리 데이터 선물가능횟수
    this._famCouponCnt = 0;     // 가족 데이터 선물가능횟수
    this._pauseDayCnt = 0;      // 일시정지 일수
    this._vodRatio = 0;         // 동영상 시청 비율

    // 부가서비스 ID - V컬러링 
    this._vColoringProdIds = [
        'NA00007017',
        'NA00007198',
        'NA00007123',
        'NA00007163'
    ];

    // 부가서비스 ID - wavve 
    this._wavveProdIds = [
        'NA00006577',
        'NA00006516',
        'NA00006517',
        'NA00006522',
        'NA00006523',
        'NA00006543',
        'NA00006544',
        'NA00006545',
        'NA00006546',
        'NA00006578',
        'NA00006579',
        'NA00006580',
        'NA00006584',
        'NA00006585',
        'NA00006586',
        'NA00006587',
        'NA00006622',
        'NA00006987'
    ];

    // 부가서비스 ID - flo 
    this._floProdIds = [
        'NA00006520',
        'NA00006165',
        'NA00006521',
        'NA00006527',
        'NA00006528',
        'NA00006541',
        'NA00006542',
        'NA00006576',
        'NA00006599',
        'NA00006600',
        'NA00006601',
        'NA00006602',
        'NA00006634',
        'NA00006986'
    ];

    // 부가서비스 ID - xbox 
    this._xboxProdIds = [
        'NA00007114',
        'NA00007116',
        'NA00007113',
        'NA00007119',
        'NA00007158',
        'NA00007160',
        'NA00007120'
    ];


    this._deviceModelCode;       // 접근 가능 단말 여부 체크를 위한 고객 회선의 단말모델코드 정보

    // 퍼블 관련 변수 [S]
    this._timer;
    this._isStartY = 0;
    this._isLastY = 0;
    this._greetingLines;
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
        var chatCloseIcoClickYN = Tw.CommonHelper.getSessionStorage('GREETING_DISABLED');
         
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
        
        // MLS API 호출시 사용할 urlPath별 ChannelId
        switch (urlPath) {
            case '/main/home':
                this._mlsChannelId = 'tw_greeting_rank_main';
                break;
            case '/myt-data/submain':
                this._mlsChannelId = 'tw_greeting_rank_sub_data';
                break;
            case '/myt-fare/submain':
                this._mlsChannelId = 'tw_greeting_rank_sub_fare';
                break;
            case '/myt-join/submain':
                this._mlsChannelId = 'tw_greeting_rank_sub_join';
                break;
            case '/membership/submain':
                this._mlsChannelId = 'tw_greeting_rank_sub_mbr';
                break;
            case '/product/mobileplan':
                this._mlsChannelId = 'tw_greeting_rank_sub_plan';
                break;
            case '/product/mobileplan-add':
                this._mlsChannelId = 'tw_greeting_rank_sub_vas';
                break; 
            default:
                this._mlsChannelId  = 'tw_greeting_rank_sub_fare';
                break;                    
        }

        console.log('[chatbot.service] [_init] 접속한 페이지 URL : ', urlPath);
        console.log('[chatbot.service] [_init] 현재 일자 : ', this._currentDate);
        
        var isAllowedOs = false;
        if(Tw.BrowserHelper.isIos()){
            console.log('[chatbot.service] [_init] 접속한 페이지 URL : ', Tw.BrowserHelper.isIos());
            (function () {
                var agent = userAgentString,
                start = agent.indexOf( 'OS' );
                if( ( agent.indexOf( 'iPhone' ) > -1) && start > -1 ){
                    if(window.Number( agent.substr( start + 3, 3 ).replace( '_', '.' ) )>12){
                     isAllowedOs = true; 
                     //console.log("13이상"+isAllowedOs);
                }else{
                     isAllowedOs = false;
                     //console.log("13이하"+isAllowedOs);
                }
                    }
            })();
        }
         if(Tw.BrowserHelper.isAndroid()){
           // var andVer = Tw.BrowserHelper.getAndroidVersion;
           
           if (userAgentString.indexOf("Android") >= 0) { 
              var androidV = parseFloat(userAgentString.slice(userAgentString.indexOf("Android") + 8)); 
              console.log("androidV : "+androidV)
              if (androidV < 8){
                  // andorid version is <=8
                   isAllowedOs = false;
                   console.log("isAllowedOs : "+isAllowedOs)
              }else{
                   // andorid version is >8
                   isAllowedOs = true;
                   console.log("isAllowedOs : "+isAllowedOs)
              }
           } 
        }

        var isAllowed = false;      // 챗봇 오픈여부 결정
        var isDefaultPage = false;  // 전체메뉴 > 챗봇 상담하기 를 통한 진입 여부 (20.11.16 - 사용 안함)
        // 챗봇 상담하기 (/chatbot/counsel) 로 접근하는 경우 중간의 게이트웨이 페이지가 있기 때문에 
        // 하드웨어 백 버튼 또는 하단의 확인 버튼 클릭시 게이트페이지로 돌아가게 되어 무한루프에 빠지게 되므로
        // 챗봇 상담하기 진입 이전의 referer 페이지로 replaceState 처리함.
        // 20.11.16 - 요건 변경 (단독메뉴 사라짐)
        // if (urlPath === '/chatbot/counsel') {
        //     Tw.Logger.info('[chatbot.service] [_init] 챗봇 상담하기 접근 시 리퍼러 페이지', urlPath);
        //     history.replaceState({}, '', document.referrer);
        // }        

        // chatbot 차단 여부 확인을 위한 API 호출 (환경설정데이터)
        var isAllowedChatbot = false;   // 챗봇 서비스 허용여부 - true일 경우 동작

        console.log('[chatbot.service] [_init] 챗봇 차단 여부 확인을 위한 API 호출', '');            
        var propertyId = { //chatbot 차단 여부 확인 API 호출 param
            property: Tw.REDIS_KEY.CHATBOT_DISABLE_TIME
        };

        this._apiService.requestArray([
            { command: Tw.API_CMD.BFF_01_0069, params: propertyId } // chatbot 차단 여부 확인 API
        ])
        .done($.proxy(function() {    
            var resBlockChatbot = arguments[0];

            var today = Tw.DateHelper.getFullDateAnd24Time(new Date());
            Tw.Logger.info('[chatbot.service] [_init] resBlockChatbot : ', resBlockChatbot);
            Tw.Logger.info('[chatbot.service] [_init] 현재 시간 : ', today);

            if (resBlockChatbot.code === Tw.API_CODE.CODE_00) {
                var isolTime = resBlockChatbot.result.split('~');
                var isolStaDtm = Tw.DateHelper.getFullDateAnd24Time(isolTime[0]);   // 차단 시작 시간
                var isolEndDtm = Tw.DateHelper.getFullDateAnd24Time(isolTime[1]);   // 차단 종료 시간
    
                Tw.Logger.info('[chatbot.service] [_init] 환경설정변수값 : ', resBlockChatbot.result);
                Tw.Logger.info('[chatbot.service] [_init] 차단 시작 시간 : ', isolStaDtm);
                Tw.Logger.info('[chatbot.service] [_init] 차단 종료 시간 : ', isolEndDtm);
                Tw.Logger.info('[chatbot.service] [_init] 챗봇 서비스 차단 여부 : ', Tw.DateHelper.isBetween(today, isolStaDtm, isolEndDtm));
                
                // 챗봇 서비스 허용여부 세팅
                isAllowedChatbot = !Tw.DateHelper.isBetween(today, isolStaDtm, isolEndDtm); // 챗봇 서비스 차단 여부 false이면 isAllowedChatbot는 true임에 유의
                Tw.Logger.info('[chatbot.service] [_init] 챗봇 서비스 허용 여부 (isAllowedChatbot) : ', isAllowedChatbot);

                if (isAllowedChatbot) {  // 챗봇 서비스 차단중이 아닐 경우
                    if (isAllowedOs) { // isAllowedDevice가 os로 변경됨
                        Tw.Logger.info('[chatbot.service] [_init] 접근 가능 단말인 경우', '');
                        console.log('[chatbot.service] [_init] 접근 가능 단말인 경우', '');
        
                        if (this._chatbotPopDispPageUrls[urlPath] !== undefined) {    
                            // 노출 대상 화면인 경우
                            console.log('[chatbot.service] [_init] 노출 대상 화면인 경우', '');
        
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
                }
                console.log('[chatbot.service] [_init] isAllowed : ', isAllowed);
                if (isAllowed) {
                    if (isDefaultPage) {    // 20.11.16 - 챗봇 상담하기 단독 메뉴 삭제되어 사용 안함
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
                                            //_this._checkBlockChatbotService('/chatbot/counsel');
                                        } else {
                                            // 준회원
                                        }
                                        
                                    } else {
                                        // 간편 로그인
                                        // Tw.Logger.info('[chatbot.service] [_init] 간편 로그인', '');
                                        console.log('[chatbot.service] [_init] 간편 로그인', '');
                                        //return;
                                        //_this._checkBlockChatbotService('/chatbot/counsel');
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
                            { command: Tw.NODE_CMD.GET_SVC_INFO, params: {} } // 회선 정보 (GET_SVC_INFO)
                        ])
                        .done($.proxy(function() {
                            var resp1 = arguments[0];   // GET_SVC_INFO
                            Tw.Logger.info('[chatbot.service] [_init] 회선 정보 (GET_SVC_INFO) : ', resp1.result);
                            console.log('[chatbot.service] [_init] 회선 정보 (GET_SVC_INFO) : ', resp1.result);

                            if(resp1.result===null){
                                Tw.CommonHelper.removeSessionStorage('GREETING_DISABLED');
                                // 미로그인
                                Tw.Logger.info('[chatbot.service] [_init] 미로그인', '');
                                console.log('[chatbot.service] [_init] 미로그인', '');
                                return;
                            }else{
                                Tw.Logger.info('[chatbot.service] [_init] 회선 정보 있음 : ', '');
                                console.log('[chatbot.service] [_init] 회선 정보 있음 : ', ''); 
                                this._apiService.requestArray([
                                    { command: Tw.API_CMD.BFF_05_0220, params: {} }, // 단말기 기술방식 (BFF_05_0220) 
                                    { command: Tw.API_CMD.BFF_05_0222, params: {} }, // 무선 나의 가입 부가서비스&옵션/할인 프로그램 (BFF_05_0222) 
                                    { command: Tw.API_CMD.BFF_05_0231, params: {'channel_ids':[this._mlsChannelId], 'sale_org_id':'V990550000'} } // 채널당 복수 실험연결 (BFF_05_0231)
                                ])
                                .done($.proxy(function() {
                                    var resp2 = arguments[0];   // BFF_05_0220
                                    var resp3 = arguments[1];   // BFF_05_0222
                                    var resp4 = arguments[2];   // BFF_05_0231
                                // 챗봇 발화어 노출 대상 단말 여부
                                //var isAllowedDevice = false;                           
                                    Tw.Logger.info('[chatbot.service] [_init] 단말기 기술방식 (BFF_05_0220) : ', resp2);
                                    Tw.Logger.info('[chatbot.service] [_init] 무선 나의 가입 부가서비스&옵션/할인 프로그램 (BFF_05_0222) : ', resp3);
                                    Tw.Logger.info('[chatbot.service] [_init] 채널당 복수 실험연결 (BFF_05_0231) : ', resp4);
                                    console.log('[chatbot.service] [_init] 단말기 기술방식 (BFF_05_0220) : ', resp2);
                                    console.log('[chatbot.service] [_init] 무선 나의 가입 부가서비스&옵션/할인 프로그램 (BFF_05_0222) : ', resp3);
                                    console.log('[chatbot.service] [_init] 채널당 복수 실험연결 (BFF_05_0231) : ', resp4);
                                    
                                    // 로그인타입 
                                    this._loginType = resp1.result.loginType;
                                    
                                    // 멤버십카드 번호가 존재하면
                                    // if (resp1.result.mbrCardNum){
                                    //     this._membershipYn = 'Y';
                                    // }

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
                                            this._hbsFile = this._chatbotPopDispPageUrls[urlPath];
                                            var menuList = JSON.parse(Tw.CommonHelper.getSessionStorage('MENU_DATA_INFO'));

                                            if (menuList.length > 0) {
                                                for (var i = 0; i < menuList.length; i++) {
                                                    if (urlPath === menuList[i].menuUrl) {
                                                        _this._menuId = menuList[i].menuId;
                                                    }
                                                }
                                            }
                                            this._svcInfo = resp1.result;          
                                        } else {
                                            // 챗봇 노출 비대상 (2G / 선불폰 / 태블릿/2nd device / 인터넷 / 집전화 / TV) 인 경우
                                            Tw.Logger.info('[chatbot.service] [_init] 챗봇 노출 비대상 (2G / 선불폰 / 태블릿/2nd device / 인터넷 / 집전화 / TV) 인 경우', '');
                                            return;
                                        }

                                        // 무선 나의 가입 부가서비스&옵션/할인 프로그램 (BFF_05_0222) 호출 성공시
                                        Tw.Logger.info('[chatbot.service] [_init] MLS API 조회 후 resp3 : ', resp3.code);
                                        console.log('[chatbot.service] [_init] MLS API 조회 후 resp3 : ', resp3.code);
                                        if (resp3.code===Tw.API_CODE.CODE_00) {    
                                            Tw.Logger.info('[chatbot.service] [_init] 부가서비스&옵션/할인 API 호출 성공', '');
                                            console.log('[chatbot.service] [_init] 부가서비스&옵션/할인 API 호출 성공', '');
                                            // 유료 부가서비스 리스트
                                            var addProdPayList = resp3.result.addProdPayList;
                                            Tw.Logger.info('[chatbot.service] [_init] addProdPayList', addProdPayList);
                                            console.log('[chatbot.service] [_init] addProdPayList', addProdPayList);

                                            var vColoringProdCnt = 0;   // vColoring 관련 부가서비스 가입수
                                            var wavveProdCnt = 0;       // wavve 관련 부가서비스 가입수
                                            var floProdCnt = 0;         // flo 관련 부가서비스 가입수
                                            var xboxProdCnt = 0;        // xbox 관련 부가서비스 가입수

                                            // 유료 부가서비스 리스트(addProdPayList) 로 루프
                                            for (var i = 0; i < addProdPayList.length; i++) {
                                                var addProd = addProdPayList[i].prodId;
                                                //Tw.Logger.info('[chatbot.service] [_init] addProd : ', addProd);

                                                // 1. VColoring 부가서비스 가입여부 체크
                                                for (var v = 0; v < this._vColoringProdIds.length; v++){
                                                    var vColoringProdId = this._vColoringProdIds[v];
                                                    //Tw.Logger.info('[chatbot.service] [_init] vColoringProdId : ', vColoringProdId);
                                                    if (addProd === vColoringProdId){
                                                        vColoringProdCnt++;
                                                    }
                                                }
                                                // 2. wavve 부가서비스 가입여부 체크
                                                for (var w = 0; w < this._wavveProdIds.length; w++){
                                                    var wavveProdId = this._wavveProdIds[w];
                                                    //Tw.Logger.info('[chatbot.service] [_init] wavveProdId : ', wavveProdId);
                                                    if (addProd === wavveProdId){
                                                        wavveProdCnt++;
                                                    }
                                                }
                                                // 3. flo 부가서비스 가입여부 체크
                                                for (var f = 0; f < this._floProdIds.length; f++){
                                                    var floProdId = this._floProdIds[f];
                                                    //Tw.Logger.info('[chatbot.service] [_init] floProdId : ', floProdId);
                                                    if (addProd === floProdId){
                                                        floProdCnt++;
                                                    }
                                                }
                                                // 4. xbox 부가서비스 가입여부 체크
                                                for (var x = 0; x < this._xboxProdIds.length; x++){
                                                    var xboxProdId = this._xboxProdIds[x];
                                                    //Tw.Logger.info('[chatbot.service] [_init] xboxProdId : ', xboxProdId);
                                                    if (addProd === xboxProdId){
                                                        xboxProdCnt++;
                                                    }
                                                }
                                            }
                                            Tw.Logger.info('[chatbot.service] [_init] vColoringProdCnt : ', vColoringProdCnt);
                                            Tw.Logger.info('[chatbot.service] [_init] wavveProdCnt : ', wavveProdCnt);
                                            Tw.Logger.info('[chatbot.service] [_init] floProdCnt : ', floProdCnt);
                                            Tw.Logger.info('[chatbot.service] [_init] xboxProdCnt : ', xboxProdCnt);

                                            if (vColoringProdCnt === 0) this._vColoringProdUnregYn ='Y';// V컬러링 부가서비스 미가입 여부
                                            if (wavveProdCnt === 0) this._wavveProdUnregYn ='Y';        // waave 부가서비스 미가입 여부
                                            if (floProdCnt === 0) this._floProdUnregYn ='Y';            // flo 부가서비스 미가입 여부
                                            if (xboxProdCnt === 0) this._xboxProdUnregYn ='Y';          // xbox 부가서비스 미가입 여부

                                            Tw.Logger.info('[chatbot.service] [_init] _vColoringProdUnregYn : ', this._vColoringProdUnregYn);
                                            Tw.Logger.info('[chatbot.service] [_init] _wavveProdUnregYn : ', this._wavveProdUnregYn);
                                            Tw.Logger.info('[chatbot.service] [_init] _floProdUnregYn : ', this._floProdUnregYn);
                                            Tw.Logger.info('[chatbot.service] [_init] _xboxProdUnregYn : ', this._xboxProdUnregYn);
                                        }

                                        // MLS API 호출 성공시
                                        Tw.Logger.info('[chatbot.service] [_init] MLS API 조회 후 resp4 : ', resp4.code);
                                        console.log('[chatbot.service] [_init] MLS API 조회 후 resp4 : ', resp4.code);
                                        if (resp4.code===Tw.API_CODE.CODE_00) {    
                                            Tw.Logger.info('[chatbot.service] [_init] MLS API 호출 성공', '');
                                            console.log('[chatbot.service] [_init] MLS API 호출 성공', '');
                                            
                                            var resultData = resp4.result.results[this._mlsChannelId];

                                            for (var i = 0; i < resultData.length; i++) {
                                                if (resultData[i].id === 'tw_greeting_image'){
                                                    
                                                    var imageTypeArray = resultData[i].props.bucket.split('_');
                                                    Tw.Logger.info('[chatbot.service] [_init] MLS API imageTypeArray : ', imageTypeArray);
                                                    // imageType
                                                    this._mlsGreetingImageType = imageTypeArray[0];
                                                    
                                                    // color
                                                   this._mlsGreetingColor = imageTypeArray[1];
                                                   
                                                    // theme
                                                    this._mlsGreetingTheme = imageTypeArray[2];
                                                    // processId
                                                    this._mlsProcessId = resultData[i].process_id;
                                                }
                                                if (resultData[i].id === 'tw_greeting_text'){
                                                    // textType
                                                    this._mlsGreetingTextType = resultData[i].props.bucket;
                                                }
                                                if (resultData[i].id === 'tw_greeting_ranking'){
                                                    // 발화어 배열
                                                    this._mlsGreetingRangking = resultData[i].props.ranking;
                                                }                                        
                                            }
                                            Tw.Logger.info('[chatbot.service] [_init] MLS API _mlsGreetingImageType : ', this._mlsGreetingImageType);
                                            console.log('[chatbot.service] [_init] MLS API _mlsGreetingImageType : ', this._mlsGreetingImageType);

                                            Tw.Logger.info('[chatbot.service] [_init] MLS API _mlsGreetingColor : ', this._mlsGreetingColor);
                                            console.log('[chatbot.service] [_init] MLS API _mlsGreetingColor : ', this._mlsGreetingColor);

                                            Tw.Logger.info('[chatbot.service] [_init] MLS API _mlsGreetingTheme : ', this._mlsGreetingTheme);
                                            console.log('[chatbot.service] [_init] MLS API _mlsGreetingTheme : ', this._mlsGreetingTheme);

                                            Tw.Logger.info('[chatbot.service] [_init] MLS API _mlsGreetingRangking : ', this._mlsGreetingRangking);
                                            console.log('[chatbot.service] [_init] MLS API _mlsGreetingRangking : ', this._mlsGreetingRangking);

                                            // hbs 파일에서 사용할 타입 정의 (imageType)
                                            if (this._mlsGreetingImageType === 'A'){
                                                this._typeA = true;
                                                this._typeB = false;
                                                this._typeC = false;
                                            }else if (this._mlsGreetingImageType === 'B'){
                                                this._typeA = false;
                                                this._typeB = true;
                                                this._typeC = false;
                                            }else if (this._mlsGreetingImageType === 'C'){
                                                this._typeA = false;
                                                this._typeB = false;
                                                this._typeC = true;
                                            }
                                            // 챗봇 팝업 그리기 전 분기
                                            this._preDrawChatbot();
                                        }else{
                                            // MLS API 0231 호출 후 오류난 경우(ex. 데이터가 없는 경우 등) , imageType = 'B', textType = 'A', 기본발화어
                                            // imageType
                                            this._mlsGreetingImageType = 'B';
                                            // textType
                                            this._mlsGreetingTextType = 'A';
                                            // 발화어 배열
                                            this._mlsGreetingRangking = this._defaultGreetingKeywords;
                                            // BFF_05_0232에서 쓰일 item_id
                                            var mlsItemIds = this._mlsGreetingImageType + '|' + this._mlsGreetingTextType + '||' + this._mlsGreetingRangking[0];
                                            // 발화어 배열 크기 (B타입인 경우 1)
                                            var greetingRangkingSize = 1;
                                            // processId (0232, 0233 호출하지 않도록 처리하기 위해 'N'으로)
                                            this._mlsProcessId = 'N';
                                            Tw.Logger.info('[chatbot.service] [_init] this._mlsGreetingRangking : ', this._mlsGreetingRangking);
                                            Tw.Logger.info('[chatbot.service] [_init] mlsItemIds : ', mlsItemIds);
                                            for (var i = 0; i < this._mlsGreetingRangking.length; i++) {
                                                for (var j = 0; j < this._greetingKeywords.length; j++){
                                                    var keyword = this._greetingKeywords[j].keyword;
                                                    var message = this._greetingKeywords[j].message;
                                                    var type = this._greetingKeywords[j].type
                                                    if ((this._mlsGreetingRangking[i] === keyword) && (this._mlsGreetingTextType === type)){
                                                        Tw.Logger.info('[chatbot.service] [_init] message : ', message);
                                                        Tw.Logger.info('[chatbot.service] [_init] type : ', type);
                                                        var greetingKeywordInfo = {keyword : keyword, message : message, type : type};
                                                        this._greetingKeywordInfos.push(greetingKeywordInfo);
                                                    }
                                                }
                                            }
                                            Tw.Logger.info('[chatbot.service] [_init] this._greetingKeywordInfos : ', this._greetingKeywordInfos);
                                            var option = [{
                                                cdn: Tw.Environment.cdn,
                                                greetingKeywordInfos : this._greetingKeywordInfos,
                                                typeA : false,
                                                typeB : true,
                                                typeC : false,
                                                color : this._defaultColorB,
                                                theme : this._defaultThemeB
                                            }];
                                            Tw.Logger.info('[chatbot.service] [_init] option : ', option);
                                            this._drawChatbotPop(option, mlsItemIds);
                                        }
                                    }         
                                }, this));
                            }
                        }, this));
                    }
                }
            }
        }, this));
    },

    /**
     * 핸들바 helper 등록
     * @private
     */
    _registerHelper: function () {

        Handlebars.registerHelper('isDisplay', function (targetCd, options) {
            Tw.Logger.info('[chatbot.service] [_registerHelper] [isDisplay] targetCd : ', targetCd);
            
            if (targetCd === 'Y') {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper({
            eq: function (v1, v2) {
                return v1 === v2;
            },
            ne: function (v1, v2) {
                return v1 !== v2;
            },
            lt: function (v1, v2) {
                return v1 < v2;
            },
            gt: function (v1, v2) {
                return v1 > v2;
            },
            lte: function (v1, v2) {
                return v1 <= v2;
            },
            gte: function (v1, v2) {
                return v1 >= v2;
            },
            and: function () {
                return Array.prototype.slice.call(arguments).every(Boolean);
            },
            or: function () {
                return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
            }
        });
    },

    _cacheElements: function () {
        Tw.Logger.info('[chatbot.service] [_cacheElements]', '');
        // 20/08/11 디자인 변경사항 적용 이후 버전 관련 변수
        this.$elChabot          = $('.tod-ui-chabot2');
        this.$btnTab            = $('.btn-tab');
        this.$combot = $('.tod-combot-btn');
        this.$combotC = $('.tod-combot-ctype');
        this.$combotBeta = $('.tod-combot-btn .beta');
        this.$combotClose = $('.tod-combot-btn .btn-close');
        this.$chattxt = $('.chat-txt');
        this.$combotColor = $('.tod-combot-btn').attr("data-color"); //201109 [OP002-11653] 컬러 추가
        this.$combotThema = $('.tod-combot-btn').attr("data-thema"); //201109 [OP002-11653] 테마 추가 
        this.$combotTxt2 = $('.tod-combot-btn.twoline .chat-txt');  //201109  
        this.$combotCloseC = $('.tod-combot-ctype-wrap .btn-close'); 
    },
  
    /**
     * @function
     * @desc 이벤트 바인드 / 콘테이너에 이벤트를 주고 있어 새로 생성되는 객체에도 이벤트가 바인드 됨을 유의해야 함
     */
    _bindEvent: function () {
        Tw.Logger.info('[chatbot.service] [_bindEvent]', '');

        var mlsGreetingImageType = this._mlsGreetingImageType;
        var mlsGreetingTextType = this._mlsGreetingTextType;
        var mlsGreetingColor    = this._mlsGreetingColor;
        var mlsGreetingTheme    = this._mlsGreetingTheme;
        var mlsChannelId = this._mlsChannelId;
        var mlsProcessId = this._mlsProcessId;

        var _this = this;
        console.log('GREETING_DISABLED:', Tw.CommonHelper.getSessionStorage('GREETING_DISABLED'));
        if(Tw.CommonHelper.getSessionStorage('GREETING_DISABLED') !=='Y') {
            // 3초 후 안내 팝업 슬라이드 업
            if(this._typeB){
                _this._timer = setTimeout( function () {
                    _this.$combot.addClass("open");
                }, 1500); 
                _this.$combotClose.on('click', function () {
                    //_this.$combot.hide();
                    _this.$combot.removeClass("open");
                    Tw.CommonHelper.setSessionStorage('GREETING_DISABLED', 'Y');

                    console.log('[chatbot.service] [_bindEvent] $(document).on(scroll)', '닫으면 안열리게 수정');
                    
                });  
               // _this._animateSvg('.profile1', Tw.Environment.cdn + '/js/chatbot_1.json', false);  
           switch(_this.$combotColor){
               
             case "purple" :
                  if(_this.$combotThema == 'normal'){
                        console.log("_this.$combotColor1"+_this.$combotColor);
                     _this._animateSvg('.profile1', Tw.Environment.cdn + '/js/chatbot_mask_purple.json', false);
                  }else{
                     _this._animateSvg('.profile1', Tw.Environment.cdn + '/js/chatbot_santa_purple.json', false);
                  }
                 break
             case "blue" :
                 if(_this.$combotThema == 'normal'){
                     _this._animateSvg('.profile1', Tw.Environment.cdn + '/js/chatbot_mask_blue.json', false);
                  }else{
                     _this._animateSvg('.profile1', Tw.Environment.cdn + '/js/chatbot_santa_blue.json', false);
                  }
                 break
             case "red" :
                 if(_this.$combotThema == 'normal'){
                     _this._animateSvg('.profile1', Tw.Environment.cdn + '/js/chatbot_mask_red.json', false);
                  }else{
                     _this._animateSvg('.profile1', Tw.Environment.cdn + '/js/chatbot_santa_red.json', false);
                  }
                    break
                default:
                    _this._animateSvg('.profile1', Tw.Environment.cdn + '/js/chatbot_mask_purple.json', false);//값이 없을때 넘어오는 기본 값
            }   

             //   _this._animateSvg('.profile1', Tw.Environment.cdn + '/js/chatbot_santa_purple.json', false);
            }else if(this._typeC){
                console.log("test");
                _this._timer = setTimeout(function() {
                    $(".tod-combot-ctype-wrap").addClass('slideUp'); 
                }, 3000);
                _this._rollingTimer = setTimeout(function() {
                    setInterval(function(){
                        $(".ul-rolling li:first").slideUp(
                            function() { 
                               $(this).appendTo(".ul-rolling").slideDown();
                            }
                        );
                    }, 2000); 
                }, 3000);
                _this.rolling=(function(){
                    $(".ul-rolling li:first").slideUp(
                        function() { 
                           $(this).appendTo(".ul-rolling").slideDown();
                        }
                    );
                });
                $('.tod-combot-ctype-wrap .btn-close').on('click', function () {
                    //_this.$combot.hide(); 
                    $(".tod-combot-ctype-wrap").removeClass("slideUp");
                    clearTimeout(_this._timer);
				    clearTimeout(_this._rollingTimer);
                    Tw.CommonHelper.setSessionStorage('GREETING_DISABLED', 'Y');

                    console.log('[chatbot.service] [_bindEvent] $(document).on(scroll)', '닫으면 안열리게 수정');
                    
                }); 
            }
            else{
                _this._timer = setTimeout(function() {
                    _this.$elChabot.addClass('slideUp'); 
                }, 3000);
            }

            // 윈도우 스크롤 시 챗봇
            $(document).on('scroll',$.proxy(function () {
                console.log('[chatbot.service] [_bindEvent] $(document).on(scroll)', '임시 윈도우 스크롤시 올라오지 않게 수정처리');
                _this._timer = setTimeout(function(){
                    _this.$elChabot.addClass('slideUp');
                }, 1000);
                clearTimeout(_this._timer);
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
                    Tw.CommonHelper.setSessionStorage('GREETING_DISABLED', 'Y');
                }
            });

            setTimeout( function () {
                _this._animateSvg('.profile2', Tw.Environment.cdn + '/js/chatbot_1.json', false);
            }, 3200 );
        }

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

             // B타입 말풍선이 닫혀 있는 상태에서 클릭할 경우는 initial 호출
            if (mlsGreetingImageType === 'B'){
                if (!_this.$combot.hasClass('open')) {
                    chatbotGubun = 'initial';
                }
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
                case 'hotdata':
                    extraParam += '&keyword=hotdata';
                    break;    
                case 'membership_benefit':
                    extraParam += '&keyword=membership_benefit';
                    break;  
                case 'cancel_pause':
                    extraParam += '&keyword=cancel_pause';
                    break;    
                case 'contents_pay':
                    extraParam += '&keyword=contents_pay';
                    break;        
                default:
                    extraParam += '&keyword=initial';
                    break;
            }

            // BFF_05_0233 MLS CHATBOT 사용자의 채널 / 아이템 click 이벤트
            if ( mlsProcessId !== 'N'){
                _this._apiService.request(Tw.API_CMD.BFF_05_0233, {
                        channel_id: mlsChannelId,
                        process_id: mlsProcessId,
                        item_id: mlsGreetingImageType + '|' + mlsGreetingTextType + '|' + chatbotGubun
                    }).done(
                        Tw.Logger.info('[chatbot.service] [_bindEvent]  : BFF_05_0233', '',extraParam)
                    );
            }
               _this._bpcpService.open_withExtraParam('BPCP:0000065084', _this._svcInfo ? _this._svcInfo.svcMgmtNum : null, eParam, extraParam);
        });
        $('.fe-home-external').on('click', function(e){
            var url = $(e.currentTarget).data('url');
            console.log('fe-home-externalurl'+url);
            if(!_this.$combot.hasClass('open') && this._typeB === 'B'){
                chatbotGubun = 'initial';
                _this._bpcpService.open_withExtraParam('BPCP:0000065084', _this._svcInfo ? _this._svcInfo.svcMgmtNum : null, '', '&keyword=initial');
            }else{
                if('https://www.vcoloring-event.com' === url){
                    Tw.CommonHelper.showDataCharge($.proxy(function() {
                        Tw.CommonHelper.openUrlExternal(url);
                      }, this), null);
                }else if('https://tworld.vcoloring.com' === url){
                    Tw.CommonHelper.showDataCharge($.proxy(function() {
                        Tw.CommonHelper.openUrlExternal(url);
                      }, this), null);
                }
                
            }
 
        });
            // 말풍선 (링크) 클릭시 
        $('.bpcpItemlink').on('click', function(e){
            Tw.Logger.info('[chatbot.service] [_bindEvent] $(.linkItem).on(click)', '');

            var url = $(e.currentTarget).data('url'); 
            console.log('bpcpItemlinkurl'+url);
            if(!_this.$combot.hasClass('open') && this._typeB === 'B'){
                chatbotGubun = 'initial';
                _this._bpcpService.open_withExtraParam('BPCP:0000065084', _this._svcInfo ? _this._svcInfo.svcMgmtNum : null, '', '&keyword=initial');
            }else{
                window.open(url, '_blank');
            }
                
                // Tw.CommonHelper.openUrlExternal('https://app.tworld.co.kr' + url);
           
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
     * @desc chatbot 차단 여부 확인을 위한 API 호출 (환경설정데이터) - 20.11.16 사용안함
     */
    // _checkBlockChatbotService: function (url) {
        
    //     var propertyId = {
    //         property: Tw.REDIS_KEY.CHATBOT_DISABLE_TIME
    //     };

    //     Tw.Logger.info('[chatbot.service] [_checkBlockChatbotService] 환경설정변수 ID : ', propertyId);

    //     // 챗봇 상담하기 (/chatbot/counsel) 로 접근하는 경우 중간의 게이트웨이 페이지가 있기 때문에 
    //     // 하드웨어 백 버튼 또는 하단의 확인 버튼 클릭시 게이트페이지로 돌아가게 되어 무한루프에 빠지게 되므로
    //     // 챗봇 상담하기 진입 이전의 referer 페이지로 replaceState 처리함.
    //     if (url === '/chatbot/counsel') {
    //         Tw.Logger.info('[chatbot.service] [_checkBlockChatbotService] 챗봇 상담하기 접근 시 리퍼러 페이지', url);
    //         history.replaceState({}, '', document.referrer);
    //     }        

    //     this._apiService.request(Tw.API_CMD.BFF_01_0069, propertyId)
    //         .done($.proxy(this._successGetIsolTime, this, url))
    //         .fail($.proxy(this._failGetIsolTime, this));
    // },


    // /**
    //  * @function
    //  * @member
    //  * @desc chatbot 차단 여부 확인 - 20.11.16 사용안함
    //  */
    // _successGetIsolTime: function (resp) {
        
    //     var today = Tw.DateHelper.getFullDateAnd24Time(new Date());
    //     Tw.Logger.info('[chatbot.service] [_successGetIsolTime] url : ', arguments[0]);
    //     Tw.Logger.info('[chatbot.service] [_successGetIsolTime] resp : ', arguments[1]);
    //     Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 현재 시간 : ', today);

    //     if (arguments[1].code === Tw.API_CODE.CODE_00) {
    //         var isolTime = arguments[1].result.split('~');
    //         var isolStaDtm = Tw.DateHelper.getFullDateAnd24Time(isolTime[0]);   // 차단 시작 시간
    //         var isolEndDtm = Tw.DateHelper.getFullDateAnd24Time(isolTime[1]);   // 차단 종료 시간

    //         Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 환경설정변수값 : ', arguments[1].result);
    //         Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 차단 시작 시간 : ', isolStaDtm);
    //         Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 차단 종료 시간 : ', isolEndDtm);
    //         Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 챗봇 서비스 차단 여부 : ', Tw.DateHelper.isBetween(today, isolStaDtm, isolEndDtm));
            
    //         if (Tw.DateHelper.isBetween(today, isolStaDtm, isolEndDtm)) {
    //             Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 챗봇 서비스 차단 중인 경우', '');

    //             if (arguments[0] === '/chatbot/counsel') {                    
    //                 location.href = '/common/util/service-block?fromDtm=' + isolTime[0] + '&toDtm=' + isolTime[1];
    //             } else {
    //                 return null;
    //             }
    //         } else {
    //             Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 챗봇 서비스 차단 중이 아닌 경우', '');
    //             Tw.Logger.info('[chatbot.service] [_successGetIsolTime] 챗봇 서비스 차단 중이 아닌 경우', '');
                
    //             Tw.Logger.info('[chatbot.service] [_successGetIsolTime] _loginType : ', this._loginType);
                
                
    //             if (this._loginType !== 'S'){
    //                 this._requestApis();
    //             } else { // 간편로그인일 경우 API 태우지 않고 MLS 랭킹 순서만 맞춰서 _drawchatbot 호출

    //                 // BFF_05_0232에서 쓰일 item_id
    //                 var mlsItemIds = this._mlsGreetingImageType + '|' + this._mlsGreetingTextType + '|';

    //                 // 실제 발화어 정보 리스트 세팅        
    //                 var greetingRangking = [];      // 발화어 노출 조건에 부합한 발화어 배열
    //                 var greetingRangkingSize = 0;   // 발화어 노출 조건에 부합한 발화어 배열 크기
                    
    //                 // imageType이 B인 경우는 발화어 한개, 그 외의 경우(A타입)는 발화어 4개
    //                 Tw.Logger.info('[chatbot.service] [_successGetIsolTime] this._mlsGreetingImageType : ', this._mlsGreetingImageType);
    //                 if (this._mlsGreetingImageType === 'B'){
    //                     greetingRangkingSize = 1;
    //                 }else{
    //                     greetingRangkingSize = 4;
    //                 }

    //                 Tw.Logger.info('[chatbot.service] [_successGetIsolTime] this._mlsGreetingRangking : ', this._mlsGreetingRangking);

    //                 if (this._mlsGreetingRangking.length > 0){
    //                 // 간편 로그인의 경우는 발화어 세개( hotbill, pay_bill, hotdata ) 만 표시
    //                     for (var i = 0; i < this._mlsGreetingRangking.length; i++) {
    //                         var mlsKeyword = this._mlsGreetingRangking[i];
    //                         if (greetingRangking.length < greetingRangkingSize ){
    //                             if (mlsKeyword === 'hotbill'){ // 1. hotbill
    //                                 greetingRangking.push(mlsKeyword);
    //                                 mlsItemIds = mlsItemIds + '|' + mlsKeyword;
    //                             } else if (mlsKeyword === 'pay_bill'){ // 2. pay_bill
    //                                 greetingRangking.push(mlsKeyword);
    //                                 mlsItemIds = mlsItemIds + '|' + mlsKeyword;                                
    //                             } else if (mlsKeyword === 'hotdata'){ // 3. hotdata
    //                                 greetingRangking.push(mlsKeyword);
    //                                 mlsItemIds = mlsItemIds + '|' + mlsKeyword;     
    //                             }
    //                         }
    //                     }
    //                 }else{                        
    //                     greetingRangking = this._defaultGreetingKeywords;
    //                     mlsItemIds = this._defaultMlsItems;
    //                 }


    //                 Tw.Logger.info('[chatbot.service] [_successGetIsolTime] greetingRangking : ', greetingRangking);
                    
    //                 for (var i = 0; i < greetingRangking.length; i++) {
    //                     for (var j = 0; j < this._greetingKeywords.length; j++){
    //                         if ((greetingRangking[i] === this._greetingKeywords[j].keyword) && (this._mlsGreetingTextType === this._greetingKeywords[j].type)){
    //                             var greetingKeywordInfo = {keyword : this._greetingKeywords[j].keyword, message : this._greetingKeywords[j].message, type : this._greetingKeywords[j].type};
    //                             this._greetingKeywordInfos.push(greetingKeywordInfo);
    //                         }
    //                     }
    //                 }
    //                 Tw.Logger.info('[chatbot.service] [_successGetIsolTime] this._greetingKeywordInfos : ', this._greetingKeywordInfos);

    //                 var option = [{
    //                     cdn: Tw.Environment.cdn,
    //                     greetingKeywordInfos : this._greetingKeywordInfos,
    //                     typeA : this._typeA,
    //                     typeB : this._typeB,
    //                     typeC : this._typeC
    //                 }];
    //                 Tw.Logger.info('[chatbot.service] [_successGetIsolTime] option : ', option);
    //                 this._drawChatbotPop(option, mlsItemIds);
    //             }
    //         }
    //     }
    // },

    // /**
    //  * @function
    //  * @member
    //  * @desc chatbot 차단 여부 조회 실패시 - 20.11.16 사용안함
    //  */
    // _failGetIsolTime: function (error) {
    //     // 차단 여부 조회 실패시 _requestApis() 를 호출하지 않음.
    //     Tw.Logger.error(error);
    // },

    /**
     * @function
     * @member
     * @desc 챗봇팝업 그리기 전 분기
     */
    _preDrawChatbot: function () {
        if (this._loginType !== 'S'){   // 간편로그인 아닌 경우 
            this._requestApis();
        } else { // 간편로그인일 경우 API 태우지 않고 MLS 랭킹 순서만 맞춰서 _drawchatbot 호출                    
            // BFF_05_0232에서 쓰일 item_id
            var mlsItemIds = this._mlsGreetingImageType + '|' + this._mlsGreetingTextType + '|';

            // 실제 발화어 정보 리스트 세팅        
            var greetingRangking = [];      // 발화어 노출 조건에 부합한 발화어 배열
            var greetingRangkingSize = 0;   // 발화어 노출 조건에 부합한 발화어 배열 크기
            
            // imageType이 B인 경우는 발화어 한개, 그 외의 경우(A타입)는 발화어 4개
            Tw.Logger.info('[chatbot.service] [_preDrawChatbot] this._mlsGreetingImageType : ', this._mlsGreetingImageType);
            if (this._mlsGreetingImageType === 'B'){
                greetingRangkingSize = 1;
            }else if (this._mlsGreetingImageType === 'C'){
                greetingRangkingSize = 3;
            }else{
                greetingRangkingSize = 4;
            }

            Tw.Logger.info('[chatbot.service] [_preDrawChatbot] this._mlsGreetingRangking : ', this._mlsGreetingRangking);

            if (this._mlsGreetingRangking.length > 0){
            // 간편 로그인의 경우는 발화어 세개( hotbill, pay_bill, hotdata ) 만 표시
                for (var i = 0; i < this._mlsGreetingRangking.length; i++) {
                    var mlsKeyword = this._mlsGreetingRangking[i];
                    if (greetingRangking.length < greetingRangkingSize ){
                        if (mlsKeyword === 'hotbill'){ // 1. hotbill
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        } else if (mlsKeyword === 'pay_bill'){ // 2. pay_bill
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;                                
                        } else if (mlsKeyword === 'hotdata'){ // 3. hotdata
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;     
                        }
                    }
                }
            }else{                        
                greetingRangking = this._defaultGreetingKeywords;
                mlsItemIds = this._defaultMlsItems;
            }


            Tw.Logger.info('[chatbot.service] [_preDrawChatbot] greetingRangking : ', greetingRangking);
            
            for (var i = 0; i < greetingRangking.length; i++) {
                for (var j = 0; j < this._greetingKeywords.length; j++){
                    var keyword = this._greetingKeywords[j].keyword;
                    var message = this._greetingKeywords[j].message;
                    var type = this._greetingKeywords[j].type
                    //message.replace(/\n/g, '<br/>');
                    if ((greetingRangking[i] === keyword) && (this._mlsGreetingTextType === type)){
                        Tw.Logger.info('[chatbot.service] [_preDrawChatbot] message : ', message);
                        Tw.Logger.info('[chatbot.service] [_preDrawChatbot] type : ', type);
                        var greetingKeywordInfo = {keyword : keyword, message : message, type : type};
                        this._greetingKeywordInfos.push(greetingKeywordInfo);
                    }
                }
            }
            Tw.Logger.info('[chatbot.service] [_preDrawChatbot] this._greetingKeywordInfos : ', this._greetingKeywordInfos);

            var option = [{
                cdn: Tw.Environment.cdn,
                greetingKeywordInfos : this._greetingKeywordInfos,
                typeA : this._typeA,
                typeB : this._typeB,
                typeC : this._typeC,
                color : this._defaultColorB,
                theme : this._defaultThemeB
            }];
            Tw.Logger.info('[chatbot.service] [_preDrawChatbot] option : ', option);
            this._drawChatbotPop(option, mlsItemIds);
        }
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
        } else {
            Tw.Logger.info('[chatbot.service] [_requestApis] 비로그인 상태', '');
        }        
    },


    /**
     * @function
     * @desc 말풍선 노출 대상군 확인
     */
    _checkTargetGroup: function (refillInfo,refillHistInfo, billmthInfo, unpaidBillInfo, micropayInfo , dataGiftInfo, pauseInfo, contentsInfo, userProfileInfo) {
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------refillInfo : ', refillInfo);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------refillHistInfo : ', refillHistInfo);    
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------billmthInfo : ', billmthInfo);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------dataGiftInfo : ', dataGiftInfo);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------micropayInfo : ', micropayInfo);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------pauseInfo : ', pauseInfo);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------contentsInfo : ', contentsInfo);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------userProfileInfo : ', userProfileInfo);
        // /* *******************************************
        //     1. 리필쿠폰 체크 
        // ******************************************* */
        if ( refillInfo.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 리필쿠폰  : ', refillInfo.result);

            if ( refillInfo.result.length > 0 ) {
                this._refilYn = 'Y';
            } else {
                this._refilYn = 'N';
            }
            this._refillCouponCnt = refillInfo.result.length;

            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 1. 사용가능 리필쿠폰 갯수  : ', this._refillCouponCnt);
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 1. 리필쿠폰 관련 말풍선 노출 대상군 여부 : ', this._refilYn);
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 1. 리필쿠폰 조회 API 리턴 에러', refillInfo.code, refillInfo.msg);

            this._refilYn = 'N';
            // Tw.Error(unpaidBillInfo.code, unpaidBillInfo.msg, '2. 미납내역').pop();
        }
        /* *******************************************
            1-1. 리필쿠폰 사용내역 여부 체크 
        ******************************************* */ 
        if(refillHistInfo.code === Tw.API_CODE.CODE_00){
          var curDt = Tw.DateHelper.getCurrentDateTime('YYYYMM');  
            var useCnt = 0;
            for (var i = 0; i < refillHistInfo.result.length; i++) {
                    if(refillHistInfo.result[i].copnUseDtm.substring(0,6)===curDt){
                        useCnt += 1;
                    }
 
                }
            if ( useCnt === 0 ) {
                this._refilHistYn = 'Y';
            } else {
                this._refilHistYn = 'N';
            }
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 1-1. 리필쿠폰 관련 (사용내역) 말풍선 노출 대상군 여부 : ', this._refilHistYn);
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 1-1. 리필쿠폰 사용내역 조회 API 리턴 에러', refillHistInfo.code, refillHistInfo.msg);
        }

        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        /* *******************************************
            2. 미납내역 관련 말풍선 노출 대상군 여부 체크 
        ******************************************* */
        if ( unpaidBillInfo.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 미납액 : ', unpaidBillInfo.result.unPaidTotSum);

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
            3. 소액결제 관련 말풍선 노출 대상군 여부 체크 
        ******************************************* */
        if ( micropayInfo.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 소액결제 합계금액 : ', micropayInfo.result.totalSumPrice);

            if(micropayInfo.result.totalSumPrice > 0){
                this._contentsPayYn = 'Y';
            }

            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 3. 소액결제 관련 말풍선 노출 대상군 여부 : ', this._micropayYn);
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 3. 소액결제 이용제한 여부 조회 API 리턴 에러', micropayInfo.code, micropayInfo.msg);

            this._micropayYn = 'N';
            // Tw.Error(micropayInfo.code, micropayInfo.msg, '4. 소액결제').pop();
        }

        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');

        /* *******************************************
            4. 자동납부 신청 관련 말풍선 노출 대상군 여부 체크 
        ******************************************* */
       if ( billmthInfo.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 납부방법 코드 : ', billmthInfo.result.payMthdCd);
            var rtnPayMthCd = billmthInfo.result.payMthdCd;    // 납부방법코드

            if (rtnPayMthCd !== '01') {
                this._payMthdYn = 'Y';
            }

            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 4. 자동납부 신청 관련 말풍선 노출 대상군 여부 : ', this._payMthdYn);
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 4. 납부방법 코드 조회 API 리턴 에러', billmthInfo.code, billmthInfo.msg);

            this._payMthdYn = 'N';
            Tw.Error(billmthInfo.code, billmthInfo.msg, '5. 자동납부').pop();
        }
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');

        // /* *******************************************
        //     5. 일시 중지 중 관련 말풍선 노출 대상군 여부 체크 
        // ******************************************* */
        if ( pauseInfo.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 일시정지  : ', pauseInfo.result.svcStCd);

            if ( pauseInfo.result.svcStCd === 'AC' ) {
                this._pauseYn = 'N';
            } else {
                this._pauseYn = 'Y';
                Tw.Logger.info('[chatbot.service] [_checkTargetGroup] pauseInfo.result.fromDt  : ', pauseInfo.result.fromDt);

                var fromDt = pauseInfo.result.fromDt;   // 일시정지 시작날짜
                var yyyy = fromDt.substr(0,4);
                var mm = fromDt.substr(4,2);
                var dd = fromDt.substr(6,2);        
                var pDay = new Date(yyyy, mm-1, dd);
                var nowDay = new Date();
                var diff = nowDay.getTime() - pDay.getTime();
                var pauseDays = Math.floor(diff/(1000*60*60*24));
                this._pauseDayCnt = pauseDays + 1;      // 일시정지 일수
                Tw.Logger.info('[chatbot.service] [_checkTargetGroup] pDay  : ', pDay);
                Tw.Logger.info('[chatbot.service] [_checkTargetGroup] nowDay  : ', nowDay);
                Tw.Logger.info('[chatbot.service] [_checkTargetGroup] pauseDays  : ', pauseDays);
                Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._pauseDayCnt  : ', this._pauseDayCnt);
            }

            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 5. 일시정지 관련 말풍선 노출 대상군 여부 : ', this._pauseYn);
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 5. 일시정지 조회 API 리턴 에러', pauseInfo.code, pauseInfo.msg);

            this._pauseYn = 'N';
            // Tw.Error(unpaidBillInfo.code, unpaidBillInfo.msg, '2. 미납내역').pop();
        }  
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        // /* *******************************************
        //     6. 데이타 선물하기 관련 말풍선 노출 대상군 여부 체크 
        // ******************************************* */        
        if ( dataGiftInfo.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] goodFamilyMemberYn  : ', dataGiftInfo.result.goodFamilyMemberYn);
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] dataGiftCnt  : ', dataGiftInfo.result.dataGiftCnt);
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] familyDataGiftCnt  : ', dataGiftInfo.result.familyDataGiftCnt);

            // message에서 치환할 변수 세팅
            this._tCouponCnt = dataGiftInfo.result.dataGiftCnt; // T끼리 데이터 선물가능횟수
            this._famCouponCnt = dataGiftInfo.result.familyDataGiftCnt; // 가족 데이터 선물가능횟수

            if(dataGiftInfo.result.goodFamilyMemberYn === 'Y'){
                    this._dataGiftYn = 'Y';
            }else{                
                if ((dataGiftInfo.result.dataGiftCnt !== '0') || (dataGiftInfo.result.familyDataGiftCnt !== '0')) {
                    this._dataGiftYn = 'Y';
                }           
           }
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 6. 데이타 선물하기 관련 말풍선 노출 대상군 여부 : ', this._dataGiftYn);
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 6. 데이타 선물 조회 API 리턴 에러', dataGiftInfo.code, dataGiftInfo.msg);

            this._dataGiftYn = 'N';
        }
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        // /* *******************************************
        //     7. 콘텐츠결제 관련 말풍선 노출 대상군 여부 체크 
        // ******************************************* */        
        if ( contentsInfo.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] invDtTotalAmtCharge  : ', contentsInfo.result.invDtTotalAmtCharge);

            if(contentsInfo.result.invDtTotalAmtCharge > 0){
                this._contentsPayYn = 'Y';
            }
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 7. 콘텐츠결제 관련 말풍선 노출 대상군 여부 : ', this._contentsPayYn);
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 7. 콘텐츠결제 조회 API 리턴 에러', contentsInfo.code, contentsInfo.msg);

            this._contentsPayYn = 'N';
        }
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');

        // /* *******************************************
        //   8.0 MLS User Profile 조회 (BFF_05_0235)
        // ******************************************* */        
        if ( userProfileInfo.code === Tw.API_CODE.CODE_00 ) {
            var resultData = userProfileInfo.result.results;
            for (var i = 0; i < resultData.app_use_traffic_category_ratio.length; i++) {
                if (resultData.app_use_traffic_category_ratio[i].category === '동영상'){                    
                    this._vodRatio = resultData.app_use_traffic_category_ratio[i].ratio;
                }
            }
            var appUseTrafficMusicRatioMedianYn = resultData.app_use_traffic_music_ratio_median_yn; // 음악감상 데이터가 소비평균보다 높은지 여부
            var appUseTrafficGameMedianYn = resultData.app_use_traffic_game_median_yn;  // 게임 데이터가 소비평균보다 높은지 여부

            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 8.0 MLS User Profile 조회 API(BFF_05_0235) this._vodRatio : ', this._vodRatio);
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 8.0 MLS User Profile 조회 API(BFF_05_0235) appUseTrafficGameMedianYn : ', appUseTrafficGameMedianYn);
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 8.0 MLS User Profile 조회 API(BFF_05_0235) appUseTrafficMusicRatioMedianYn : ', appUseTrafficMusicRatioMedianYn);
            // /* *******************************************
            //   8.1 V컬러링, 8.2 wavve 관련 말풍선 노출 대상군 여부 체크
            // ******************************************* */        
            if (this._vodRatio >= 30){
                this._vColoringYn = 'Y';
                if (this._wavveProdUnregYn === 'Y'){
                    this._wavveYn = 'Y';
                }
            }
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 8.1 V컬러링 관련 말풍선 노출 대상군 여부 : ', this._vColoringYn);
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 8.2 wavve 관련 말풍선 노출 대상군 여부 : ', this._wavveYn);
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
            // /* *******************************************
            //   8.3 flo 관련 말풍선 노출 대상군 여부 체크
            // ******************************************* */        
            if (this._floProdUnregYn === 'Y' && appUseTrafficMusicRatioMedianYn === 'Y'){
                this._floYn = 'Y';
            }
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 8.3 flo 관련 말풍선 노출 대상군 여부 : ', this._floYn);
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');

            // /* *******************************************
            //   8.4 xbox 관련 말풍선 노출 대상군 여부 체크
            // ******************************************* */        
            if (this._xboxProdUnregYn === 'Y' && appUseTrafficGameMedianYn === 'Y'){
                this._xboxYn = 'Y';
            }
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 8.4 xbox 관련 말풍선 노출 대상군 여부 : ', this._xboxYn);
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');
        } else {
            Tw.Logger.info('[chatbot.service] [_checkTargetGroup] 8.0 MLS User Profile 조회 API(BFF_05_0235) 리턴 에러', userProfileInfo.code, userProfileInfo.msg);
        }

        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] ----------------------------------------------------------', '');

        
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._mlsGreetingRangking : ', this._mlsGreetingRangking);

        // BFF_05_0232에서 쓰일 item_id
        var mlsItemIds = this._mlsGreetingImageType + '|' + this._mlsGreetingTextType + '|';

        // 실제 발화어 정보 리스트 세팅        
        var greetingRangking = [];      // 발화어 노출 조건에 부합한 발화어 배열
        var greetingRangkingSize = 0;   // 발화어 노출 조건에 부합한 발화어 배열 크기
        
        // imageType이 B인 경우는 발화어 한개, 그 외의 경우(A타입)는 발화어 4개
        if (this._mlsGreetingImageType === 'B'){
            greetingRangkingSize = 1;
        } else if (this._mlsGreetingImageType === 'C'){
            greetingRangkingSize = 3;
        } else{
            greetingRangkingSize = 4;

        }
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._refilYn : ', this._refilYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._refilHistYn : ', this._refilHistYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._payMthdYn : ', this._payMthdYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._unpaidYn : ', this._unpaidYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._micropayYn : ', this._micropayYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._pauseYn : ', this._pauseYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._dataGiftYn : ', this._dataGiftYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._contentsPayYn : ', this._contentsPayYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._vColoringYn : ', this._vColoringYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._wavveYn : ', this._wavveYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._floYn : ', this._floYn);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._xboxYn : ', this._xboxYn);

        if (this._mlsGreetingRangking.length > 0){   
            for (var i = 0; i < this._mlsGreetingRangking.length; i++) {
                var mlsKeyword = this._mlsGreetingRangking[i];
                if (greetingRangking.length < greetingRangkingSize ){
                    // * 발화어 노출 조건 *
                    if (mlsKeyword === 'refill_coupon'){ // 1. refill_coupon - 사용가능 리필 쿠폰 있음 && 당월 리필 쿠폰 사용내역 없음
                        if (this._refilYn === 'Y' && this._refilHistYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }
                    } else if (mlsKeyword === 'pay_mthd'){ // 2. pay_mthd - 납부 방법 != 은행 자동이체
                        if (this._payMthdYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }
                    } else if (mlsKeyword === 'unpaid_amt'){ // 3. unpaid_amt - 미납 요금 있음
                        if (this._unpaidYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }
                    // } else if (mlsKeyword === 'membership_benefit'){ // 4. membership_benefit - 멤버십 가입
                    //     if (this._membershipYn === 'Y'){
                    //         greetingRangking.push(mlsKeyword);
                    //         mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                    //     }
                    } else if (mlsKeyword === 'micro_pay'){ // 4. micro_pay - 소액결제 금액 있음
                        if (this._micropayYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }
                    } else if (mlsKeyword === 'data_gift'){ // 5. data_gift - 데이터 선물 가능
                        if (this._dataGiftYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }
                    } else if (mlsKeyword === 'cancel_pause'){ // 6. cancel_pause - 일시정지 중
                        if (this._pauseYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }
                    } else if (mlsKeyword === 'contents_pay'){ // 7. contents_pay - 컨텐츠 사용 금액 있음
                        if (this._contentsPayYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }    
                    } else if (mlsKeyword === 'vcoloring'){ // 8. vcoloring
                        if (this._vColoringYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        } 
                    } else if (mlsKeyword === 'wavve'){ // 9. wavve
                        if (this._wavveYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }    
                    } else if (mlsKeyword === 'flo'){ // 10. flo
                        if (this._floYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }   
                    } else if (mlsKeyword === 'xbox'){ // 11. xbox
                        if (this._xboxYn === 'Y'){
                            greetingRangking.push(mlsKeyword);
                            mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                        }                    
                    }else{
                        greetingRangking.push(mlsKeyword);
                        mlsItemIds = mlsItemIds + '|' + mlsKeyword;
                    }
                }
            }
        }else{                        
            greetingRangking = this._defaultGreetingKeywords;
            mlsItemIds = this._defaultMlsItems;
        }
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] greetingRangking : ', greetingRangking);
        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] mlsItemIds : ', mlsItemIds);

        // var msg = '리필 쿠폰 refillCouponCnt장이 남아있어요. <br>지금 챗봇에서 사용해 보시겠어요?';
        // var msg2 = msg.replace(/refillCouponCnt/g, this._refillCouponCnt);

        // var msg4 = '리필 쿠폰 refillCouponCnt장이 남아있어요. <br>지금 챗봇에서 사용해 보시겠어요?';
        // msg4 = msg4.replace(/refillCouponCnt/g, this._refillCouponCnt);
        // Tw.Logger.info('[chatbot.service] [_checkTargetGroup] msg2 : ', msg2);
        // Tw.Logger.info('[chatbot.service] [_checkTargetGroup] msg4 : ', msg4);
        
        
    for (var i = 0; i < greetingRangking.length; i++) {
        for (var j = 0; j < this._greetingKeywords.length; j++){
            var keyword = this._greetingKeywords[j].keyword;
            var type = this._greetingKeywords[j].type;
            var message = '';
            var linkUrl = '';
            if ((greetingRangking[i] === keyword) && (this._mlsGreetingTextType === type)){
                if (greetingRangking[i] === 'vcoloring'){
                    Tw.Logger.info('[chatbot.service] [_checkTargetGroup] vcoloring : vColoring!', '');
                    if (this._wavveProdUnregYn === this._greetingKeywords[j].unregYn){
                        message = this._greetingKeywords[j].message;
                        linkUrl = this._greetingKeywords[j].linkUrl;
                        if (this._wavveProdUnregYn === 'Y'){
                            message = message.replace(/vodRatio/g, this._vodRatio);
                        }
                    }
                }else{
                    message = this._greetingKeywords[j].message;
                    linkUrl = this._greetingKeywords[j].linkUrl;
                    // 메세지 내용을 개인화 데이터로 replace
                    if (greetingRangking[i] === 'refill_coupon'){ // 리필쿠폰
                        message = message.replace(/refillCouponCnt/g, this._refillCouponCnt);
                    }
                    if (greetingRangking[i] === 'unpaid_amt'){ // 미납요금
                        message = message.replace(/unpaidAmt/g, this._unpaidAmt);
                    }
                    if (greetingRangking[i] === 'data_gift'){ // 데이터 선물하기
                        message = message.replace(/tCouponCnt/g, this._tCouponCnt);
                        message = message.replace(/famCouponCnt/g, this._famCouponCnt);
                    }
                    if (greetingRangking[i] === 'cancel_pause'){ // 일시정지
                        message = message.replace(/pauseDayCnt/g, this._pauseDayCnt);
                    }
                    if (greetingRangking[i] === 'wavve'){ // wavve
                        message = message.replace(/vodRatio/g, this._vodRatio);
                    }
                }
                Tw.Logger.info('[chatbot.service] [_checkTargetGroup] message : ', message);
                Tw.Logger.info('[chatbot.service] [_checkTargetGroup] type : ', type);
                // vColoring의 경우 A, B 타입 외에 unRegYn(Y/N)으로도 나뉘어 있기 때문에
                // 루프 돌면서 message가 ''인 경우가 중복으로 생기므로 이럴 경우는 제외시켜줌
                if (message !== ''){
                    var greetingKeywordInfo = {keyword : keyword, message : message, type : type, linkUrl: linkUrl};
                    this._greetingKeywordInfos.push(greetingKeywordInfo);
                }
                // textType이 'B'인 경우 두줄 디자인으로
                if (type === 'B'){
                    this._greetingLines = 'twoline';
                }
            }
        }
}

        Tw.Logger.info('[chatbot.service] [_checkTargetGroup] this._greetingKeywordInfos : ', this._greetingKeywordInfos);

        var option = [{
            cdn: Tw.Environment.cdn,
            greetingKeywordInfos : this._greetingKeywordInfos,
            typeA : this._typeA,
            typeB : this._typeB,
            typeC : this._typeC,
            color : this._mlsGreetingColor,
            theme : this._mlsGreetingTheme, 
            greetingLines : this._greetingLines
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

            this._drawChatbotPop(option, mlsItemIds);
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
     * @param (Object) param1 - 발화어 노출 여부 체크를 위한 대상군 정보
     * @param (String) param2 - Mls API에서 사용할 item_id ( 'imageType | textType | keywords' 의 형태)
     */
    _drawChatbotPop: function (param1, param2) {
        var mlsChannelId = this._mlsChannelId;
        var mlsProcessId = this._mlsProcessId;
        
        var _this = this;
        var url = Tw.Environment.cdn + '/hbs/';

        Tw.Logger.info('[chatbot.service] [_drawChatbotPop] 발화어 노출 대상군 정보 : ', param1);
        Tw.Logger.info('[chatbot.service] [_drawChatbotPop] Mls API에서 사용할 item_id : ', param2);

        //$.get(url + param2 + '.hbs', function (text) {
        $.get(url + 'greeting_pop.hbs', function (text) {    
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
                if(Tw.CommonHelper.getSessionStorage('GREETING_DISABLED') !=='Y'){
                    _this.$elChabot.addClass('slideUp');
                }
 
            }, 3000);
        }).done(function () {
            _this._cacheElements();
            _this._bindEvent();
            _this._toggleEmoticon();      
            new Tw.XtractorService($('body'));
            // BFF_05_0232 MLS CHATBOT 사용자의 채널 / 아이템 노출 이벤트
            if ( mlsProcessId !== 'N' ){
                _this._apiService.request(Tw.API_CMD.BFF_05_0232, {
                    channel_id: mlsChannelId,
                    process_id: mlsProcessId,
                    item_id: param2
                }).done(
                    Tw.Logger.info('[chatbot.service] [_drawChatbotPop]  : BFF_05_0232', '')
                );
            }
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
        setTimeout( function () {
            $('.tod-combot-btn .beta').addClass('on');
          }, 200);
          switch(this.$combotColor){
            case 'purple' :
                this.$combot.css({'background':'linear-gradient(to right, #609aff , #877efc)'});
                break
            case 'blue' :
                this.$combot.css({'background':'linear-gradient(to right, #48beed, #439af7)'});
                break
            case 'red' :
                this.$combot.css({'background':'linear-gradient(to right, #ff9062 , #ff6372)'});
                break
            default:
                this.$combot.css({'background-image':'linear-gradient(to right, #609aff , #877efc)'});
        } 
          
    },

    _toggleEmoticon: function () {
        var _this = this;
        // Math.random 함수는 보안 이슈가 있으므로 사용 금지. 2 ~ 5초 사이에 랜덤으로 움직인다.
        setTimeout(function () {
            $('.tod-chatbot-img').toggleClass('on');
            _this._toggleEmoticon();
        }, (((window.crypto.getRandomValues(new Uint32Array(1)) / 4294967296) * (5 - 2)) + 2) * 1000);
    }
};