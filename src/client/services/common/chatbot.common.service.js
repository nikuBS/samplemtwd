/**
 * @file chatbot.common.service.js
 * @desc 챗봇 게인화 메시지 공통
 * @author 김진우 과장
 * @since 2021.03.10
 */

Tw.ChatbotCommonService = function() {
    // 발화어 리스트
    this._greetingKeywords = [
        { keyword: 'pay_bill', message:'이번달 요금 얼마 나왔어?', type: 'A', linkUrl: '/myt-fare/submain', xtEid: '', isOutLink: 'N' },
        { keyword: 'pay_bill', message:'이번 달 요금이 궁금하세요?<br/>지금 상세 내역을 확인해보세요.', type: 'B', linkUrl: '/myt-fare/submain', xtEid: '', isOutLink: 'N' },
        { keyword: 'hotbill', message:'실시간 이용요금 알려줘', type: 'A', linkUrl: '/myt-fare/bill/hotbill', xtEid: '', isOutLink: 'N' },
        { keyword: 'hotbill', message:'실시간 이용 요금이 궁금하세요?<br/>지금 상세 내역을 확인해보세요.', type: 'B', linkUrl: '/myt-fare/bill/hotbill', xtEid: '', isOutLink: 'N' },
        { keyword: 'hotdata', message:'실시간 잔여량 알려줘', type: 'A', linkUrl: '/myt-data/hotdata', xtEid: '', isOutLink: 'N' },
        { keyword: 'hotdata', message:'현재 데이터 잔여량이 궁금하신가요?<br/>지금 상세 내역을 확인해보세요.', type: 'B', linkUrl: '/myt-data/hotdata', xtEid: '', isOutLink: 'N' },
        { keyword: 'refill_coupon', message:'리필 쿠폰 선물할래', type: 'A', linkUrl: '/myt-data/recharge/coupon', xtEid: '', isOutLink: 'N' },
        { keyword: 'refill_coupon', message:'리필쿠폰 refillCouponCnt장이 남아있어요.<br/>지금 사용해 보시겠어요?', type: 'B', linkUrl: '/myt-data/recharge/coupon', xtEid: '', isOutLink: 'N' },
        { keyword: 'pay_mthd', message:'요금납부 변경 문의', type: 'A', linkUrl: '/myt-fare/bill/option', xtEid: '', isOutLink: 'N' },
        { keyword: 'pay_mthd', message:'지금 은행 자동이체로 납부 방법 변경하고 더 많은 소득 공제 혜택을 누리세요!', type: 'B', linkUrl: '/myt-fare/bill/option', xtEid: '', isOutLink: 'N' },
        { keyword: 'unpaid_amt', message:'미납요금 얼마야?', type: 'A', linkUrl: '/myt-fare/unbill', xtEid: '', isOutLink: 'N' },
        { keyword: 'unpaid_amt', message:'미납요금이 총 unpaidAmt원 있습니다!<br>바로 납부 하시겠어요?', type: 'B', linkUrl: '/myt-fare/unbill', xtEid: '', isOutLink: 'N' },
        { keyword: 'micro_pay', message:'휴대폰 결제금액 얼마야?', type: 'A', linkUrl: '/myt-fare/bill/small', xtEid: '', isOutLink: 'N' },
        { keyword: 'micro_pay', message:'이번 달 휴대폰 결제 금액이 있어요.<br/>지금 상세내역을 확인해보시겠어요?', type: 'B', linkUrl: '/myt-fare/bill/small', xtEid: '', isOutLink: 'N' },
        { keyword: 'contents_pay', message:'콘텐츠 이용요금 얼마야?', type: 'A', linkUrl: '/myt-fare/bill/contents', xtEid: '', isOutLink: 'N' },
        { keyword: 'contents_pay', message:'이번 달 콘텐츠 이용료가 있어요.<br/>지금 상세내역을 확인해보시겠어요?', type: 'B', linkUrl: '/myt-fare/bill/contents', xtEid: '', isOutLink: 'N' },
        { keyword: 'data_gift', message:'데이터 선물할래', type: 'A', linkUrl: '/myt-data/giftdata', xtEid: '', isOutLink: 'N' },
        { keyword: 'data_gift', message:'데이터 선물 예정이신가요?<br/>지금 바로 선물해보세요.', type: 'B', linkUrl: '/myt-data/giftdata', xtEid: '', isOutLink: 'N' },
        { keyword: 'cancel_pause', message:'일시정지 취소하고 싶어', type: 'A', linkUrl: '/myt-join/submain/suspend', xtEid: '', isOutLink: 'N' },
        { keyword: 'cancel_pause', message:'일시정지 pauseDayCnt일째 입니다.<br>지금 바로 일시정지 해제를 도와드릴까요?', type: 'B', linkUrl: '/myt-join/submain/suspend', xtEid: '', isOutLink: 'N' },
        { keyword: 'vcoloring', message:'V 컬러링이 뭐야?', type: 'A', unregYn : 'Y', linkUrl: 'https://www.vcoloring-event.com', xtEid: '', isOutLink: 'Y' },
        { keyword: 'vcoloring', message:'데이터의 vodRatio%를 동영상에 사용하셨네요!<br>V 컬러링으로 나의 원픽 동영상을 보여주세요!', type: 'B', unregYn : 'Y', linkUrl: 'https://www.vcoloring-event.com', xtEid: '', isOutLink: 'Y' },
        { keyword: 'vcoloring', message:'V 컬러링 설정하러 가기', type: 'A', unregYn : 'N', linkUrl: 'https://tworld.vcoloring.com', xtEid: '', isOutLink: 'Y' },
        { keyword: 'vcoloring', message:'V 컬러링을 사용 중이시네요! V 컬러링 앱에서 새로운 동영상을 확인해보세요!', type: 'B', unregYn : 'N', linkUrl: 'https://tworld.vcoloring.com', xtEid: '', isOutLink: 'Y' },
        { keyword: 'wavve', message:'영상 콘텐츠는 wavve에서', type: 'A', linkUrl: '/product/callplan?prod_id=NA00006577', xtEid: '', isOutLink: 'Y' },
        { keyword: 'wavve', message:'데이터 vodRatio%를 영상 시청에 쓰는 당신!<br>Wavve에서 데이터 걱정 없이 영상 시청하세요.', type: 'B', linkUrl: '/product/callplan?prod_id=NA00006577', xtEid: '', isOutLink: 'Y' },
        { keyword: 'flo', message:'무제한 음악 스트리밍 FLO', type: 'A', linkUrl: '/product/callplan?prod_id=NA00006520', xtEid: '', isOutLink: 'Y' },
        { keyword: 'flo', message:'음악을 즐겨듣는 당신에게 추천드립니다.<br>이젠 FLO 전용 데이터로 음악을 즐겨보세요.', type: 'B', linkUrl: '/product/callplan?prod_id=NA00006520', xtEid: '', isOutLink: 'Y' },
        { keyword: 'xbox', message:'5GX 클라우드 게임 알아보기', type: 'A', linkUrl: 'https://www.5gxcloudgame.com/main', xtEid: '', isOutLink: 'Y' },
        { keyword: 'xbox', message:'지금 5GX 클라우드 게임 신청하면<br>1개월 100원 이용권 혜택이 찾아갑니다!', type: 'B', linkUrl: 'https://www.5gxcloudgame.com/main', xtEid: '', isOutLink: 'Y' },
        { keyword: 'galaxy_all', message:'혜택받고 최신 갤럭시 시리즈로 바꿔보세요.', type: 'A', linkUrl: 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000182&utm_source=tworld&utm_medium=beta_message&utm_campaign=galaxy_all', xtEid: '', isOutLink: 'Y' },
        { keyword: 'galaxy_all', message:'혜택받고 최신 갤럭시 시리즈로 바꿔보세요.', type: 'B', linkUrl: 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000182&utm_source=tworld&utm_medium=beta_message&utm_campaign=galaxy_all', xtEid: '', isOutLink: 'Y' },
        { keyword: 'untactplan', message:'3만원 대의 5G 요금제를 이용해 보세요.', type: 'A', linkUrl: 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000170&utm_source=tworld&utm_medium=app_message&utm_campaign=untactplan', xtEid: '', isOutLink: 'Y' },
        { keyword: 'untactplan', message:'3만원 대의 5G 요금제를 이용해 보세요.', type: 'B', linkUrl: 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000170&utm_source=tworld&utm_medium=app_message&utm_campaign=untactplan', xtEid: '', isOutLink: 'Y' },
        { keyword: 'newphone', message:'휴대폰 바꾸고 T기프트도 챙기세요.', type: 'A', linkUrl: 'https://m.shop.tworld.co.kr/shop/main?referrer=&utm_source=tworld&utm_medium=app_message&utm_campaign=phone', xtEid: '', isOutLink: 'Y' },
        { keyword: 'newphone', message:'휴대폰 바꾸고 T기프트도 챙기세요.', type: 'B', linkUrl: 'https://m.shop.tworld.co.kr/shop/main?referrer=&utm_source=tworld&utm_medium=app_message&utm_campaign=phone', xtEid: '', isOutLink: 'Y' },
        { keyword: 'iphone12series', message:'혜택받고 아이폰 12로 바꿔 보세요.', type: 'A', linkUrl: 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000175&utm_source=tworld&utm_medium=app_message&utm_campaign=iphone12series', xtEid: '', isOutLink: 'Y' },
        { keyword: 'iphone12series', message:'혜택받고 아이폰 12로 바꿔 보세요.', type: 'B', linkUrl: 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000175&utm_source=tworld&utm_medium=app_message&utm_campaign=iphone12series', xtEid: '', isOutLink: 'Y' }
    ];

    // 페이지 및 그리킹 키워드별 오퍼통계 코드
    this._greetingXtEids = [
        {   // 메인
            pageUrl: '/main/home',
            xtEidArr: [
                { keyword: 'pay_bill', xtEid: 'CMMA_A2-672' },
                { keyword: 'hotbill', xtEid: 'CMMA_A2-673' },
                { keyword: 'hotdata', xtEid: 'CMMA_A2-674' },
                { keyword: 'refill_coupon', xtEid: 'CMMA_A2-675' },
                { keyword: 'pay_mthd', xtEid: 'CMMA_A2-676' },
                { keyword: 'unpaid_amt', xtEid: 'CMMA_A2-677' },
                { keyword: 'micro_pay', xtEid: 'CMMA_A2-678' },
                { keyword: 'contents_pay', xtEid: 'CMMA_A2-679' },
                { keyword: 'vcoloring', xtEid: 'CMMA_A2-680' },
                { keyword: 'wavve', xtEid: 'CMMA_A2-681' },
                { keyword: 'data_gift', xtEid: 'CMMA_A2-682' },
                { keyword: 'cancel_pause', xtEid: 'CMMA_A2-683' },
                { keyword: 'untactplan', xtEid: 'CMMA_A2-684' },
                { keyword: 'newphone', xtEid: 'CMMA_A2-685' },
                { keyword: 'iphone12series', xtEid: 'CMMA_A2-686' },
                { keyword: 'galaxy_all', xtEid: 'CMMA_A2-687' },
                { keyword: 'flo', xtEid: 'CMMA_A2-688' },
                { keyword: 'xbox', xtEid: 'CMMA_A2-689' }
            ]
        },
        {   // 나의 데이터/통화
            pageUrl: '/myt-data/submain', 
            xtEidArr: [
                { keyword: 'pay_bill', xtEid: 'CMMA_A3_B10-96' },
                { keyword: 'hotbill', xtEid: 'CMMA_A3_B10-97' },
                { keyword: 'hotdata', xtEid: 'CMMA_A3_B10-98' },
                { keyword: 'refill_coupon', xtEid: 'CMMA_A3_B10-99' },
                { keyword: 'pay_mthd', xtEid: 'CMMA_A3_B10-100' },
                { keyword: 'unpaid_amt', xtEid: 'CMMA_A3_B10-101' },
                { keyword: 'micro_pay', xtEid: 'CMMA_A3_B10-102' },
                { keyword: 'contents_pay', xtEid: 'CMMA_A3_B10-103' },
                { keyword: 'vcoloring', xtEid: 'CMMA_A3_B10-104' },
                { keyword: 'wavve', xtEid: 'CMMA_A3_B10-105' },
                { keyword: 'data_gift', xtEid: 'CMMA_A3_B10-106' },
                { keyword: 'cancel_pause', xtEid: 'CMMA_A3_B10-107' },
                { keyword: 'flo', xtEid: 'CMMA_A3_B10-108' },
                { keyword: 'xbox', xtEid: 'CMMA_A3_B10-109' }
            ]
        },
        {   // 나의요금
            pageUrl: '/myt-fare/submain', 
            xtEidArr: [
                { keyword: 'pay_bill', xtEid: 'CMMA_A3_B12-123' },
                { keyword: 'hotbill', xtEid: 'CMMA_A3_B12-124' },
                { keyword: 'hotdata', xtEid: 'CMMA_A3_B12-125' },
                { keyword: 'refill_coupon', xtEid: 'CMMA_A3_B12-126' },
                { keyword: 'pay_mthd', xtEid: 'CMMA_A3_B12-127' },
                { keyword: 'unpaid_amt', xtEid: 'CMMA_A3_B12-128' },
                { keyword: 'micro_pay', xtEid: 'CMMA_A3_B12-129' },
                { keyword: 'contents_pay', xtEid: 'CMMA_A3_B12-130' },
                { keyword: 'vcoloring', xtEid: 'CMMA_A3_B12-131' },
                { keyword: 'wavve', xtEid: 'CMMA_A3_B12-132' },
                { keyword: 'data_gift', xtEid: 'CMMA_A3_B12-133' },
                { keyword: 'cancel_pause', xtEid: 'CMMA_A3_B12-134' },
                { keyword: 'flo', xtEid: 'CMMA_A3_B12-135' },
                { keyword: 'xbox', xtEid: 'CMMA_A3_B12-136' }
            ]
        },
        {   // 나의 가입정보
            pageUrl: '/myt-join/submain', 
            xtEidArr: [
                { keyword: 'pay_bill', xtEid: 'CMMA_A3_B13-113' },
                { keyword: 'hotbill', xtEid: 'CMMA_A3_B13-114' },
                { keyword: 'hotdata', xtEid: 'CMMA_A3_B13-115' },
                { keyword: 'refill_coupon', xtEid: 'CMMA_A3_B13-116' },
                { keyword: 'pay_mthd', xtEid: 'CMMA_A3_B13-117' },
                { keyword: 'unpaid_amt', xtEid: 'CMMA_A3_B13-118' },
                { keyword: 'micro_pay', xtEid: 'CMMA_A3_B13-119' },
                { keyword: 'contents_pay', xtEid: 'CMMA_A3_B13-120' },
                { keyword: 'vcoloring', xtEid: 'CMMA_A3_B13-121' },
                { keyword: 'wavve', xtEid: 'CMMA_A3_B13-122' },
                { keyword: 'data_gift', xtEid: 'CMMA_A3_B13-123' },
                { keyword: 'cancel_pause', xtEid: 'CMMA_A3_B13-124' },
                { keyword: 'flo', xtEid: 'CMMA_A3_B13-125' },
                { keyword: 'xbox', xtEid: 'CMMA_A3_B13-126' }
            ]
        },
        {   // T멤버십
            pageUrl: '/membership/submain', 
            xtEidArr: [
                { keyword: 'pay_bill', xtEid: 'CMMA_A6_B22-19' },
                { keyword: 'hotbill', xtEid: 'CMMA_A6_B22-20' },
                { keyword: 'hotdata', xtEid: 'CMMA_A6_B22-21' },
                { keyword: 'refill_coupon', xtEid: 'CMMA_A6_B22-22' },
                { keyword: 'pay_mthd', xtEid: 'CMMA_A6_B22-23' },
                { keyword: 'unpaid_amt', xtEid: 'CMMA_A6_B22-24' },
                { keyword: 'micro_pay', xtEid: 'CMMA_A6_B22-25' },
                { keyword: 'contents_pay', xtEid: 'CMMA_A6_B22-26' },
                { keyword: 'vcoloring', xtEid: 'CMMA_A6_B22-27' },
                { keyword: 'wavve', xtEid: 'CMMA_A6_B22-28' },
                { keyword: 'data_gift', xtEid: 'CMMA_A6_B22-29' },
                { keyword: 'cancel_pause', xtEid: 'CMMA_A6_B22-30' },
                { keyword: 'flo', xtEid: 'CMMA_A6_B22-31' },
                { keyword: 'xbox', xtEid: 'CMMA_A6_B22-32' }
            ]
        },
        {   // 요금제
            pageUrl: '/product/mobileplan', 
            xtEidArr: [
                { keyword:'pay_bill', xtEid: 'CMMA_A4_B15-22' },
                { keyword:'hotbill', xtEid: 'CMMA_A4_B15-23' },
                { keyword:'hotdata', xtEid: 'CMMA_A4_B15-24' },
                { keyword:'refill_coupon', xtEid: 'CMMA_A4_B15-25' },
                { keyword:'pay_mthd', xtEid: 'CMMA_A4_B15-26' },
                { keyword:'unpaid_amt', xtEid: 'CMMA_A4_B15-27' },
                { keyword:'micro_pay', xtEid: 'CMMA_A4_B15-28' },
                { keyword:'contents_pay', xtEid: 'CMMA_A4_B15-29' },
                { keyword:'vcoloring', xtEid: 'CMMA_A4_B15-30' },
                { keyword:'wavve', xtEid: 'CMMA_A4_B15-31' },
                { keyword:'data_gift', xtEid: 'CMMA_A4_B15-32' },
                { keyword:'cancel_pause', xtEid: 'CMMA_A4_B15-33' },
                { keyword: 'flo', xtEid: 'CMMA_A4_B15-34' },
                { keyword: 'xbox', xtEid: 'CMMA_A4_B15-35' }
            ]
        },
        {   // 요금제 (리뉴얼)
            pageUrl: '/product/renewal/mobileplan', 
            xtEidArr: [
                { keyword:'pay_bill', xtEid: 'CMMA_A4_B15-22' },
                { keyword:'hotbill', xtEid: 'CMMA_A4_B15-23' },
                { keyword:'hotdata', xtEid: 'CMMA_A4_B15-24' },
                { keyword:'refill_coupon', xtEid: 'CMMA_A4_B15-25' },
                { keyword:'pay_mthd', xtEid: 'CMMA_A4_B15-26' },
                { keyword:'unpaid_amt', xtEid: 'CMMA_A4_B15-27' },
                { keyword:'micro_pay', xtEid: 'CMMA_A4_B15-28' },
                { keyword:'contents_pay', xtEid: 'CMMA_A4_B15-29' },
                { keyword:'vcoloring', xtEid: 'CMMA_A4_B15-30' },
                { keyword:'wavve', xtEid: 'CMMA_A4_B15-31' },
                { keyword:'data_gift', xtEid: 'CMMA_A4_B15-32' },
                { keyword:'cancel_pause', xtEid: 'CMMA_A4_B15-33' },
                { keyword: 'flo', xtEid: 'CMMA_A4_B15-34' },
                { keyword: 'xbox', xtEid: 'CMMA_A4_B15-35' }
            ]
        },
        {   // 부가서비스
            pageUrl: '/product/mobileplan-add',
            xtEidArr: [
                { keyword: 'pay_bill', xtEid: 'CMMA_A4_B16-68' },
                { keyword: 'hotbill', xtEid: 'CMMA_A4_B16-69' },
                { keyword: 'hotdata', xtEid: 'CMMA_A4_B16-70' },
                { keyword: 'refill_coupon', xtEid: 'CMMA_A4_B16-71' },
                { keyword: 'pay_mthd', xtEid: 'CMMA_A4_B16-72' },
                { keyword: 'unpaid_amt', xtEid: 'CMMA_A4_B16-73' },
                { keyword: 'micro_pay', xtEid: 'CMMA_A4_B16-74' },
                { keyword: 'contents_pay', xtEid: 'CMMA_A4_B16-75' },
                { keyword: 'vcoloring', xtEid: 'CMMA_A4_B16-76' },
                { keyword: 'wavve', xtEid: 'CMMA_A4_B16-77' },
                { keyword: 'data_gift', xtEid: 'CMMA_A4_B16-78' },
                { keyword: 'cancel_pause', xtEid: 'CMMA_A4_B16-79' },
                { keyword: 'flo', xtEid: 'CMMA_A4_B16-80' },
                { keyword: 'xbox', xtEid: 'CMMA_A4_B16-81' }
            ]
        }
    ];
};

Tw.ChatbotCommonService.prototype = {
    /**
     * 그리팅 메시지 키워드 목록을 구한다
     * @returns 그리팅 키워드
     */
    _getGreetingKeywords: function() {
        // 그리팅 메시지 키워드에 오퍼통계 코드 추가
        this._setGreetingXtEid();

        return this._greetingKeywords;
    },

    /**
    * @function
    * @desc 노출 안된 메시지 순서를 맨 앞으로 변경
    */
    _changeMlsGreetingRangking: function(mlsGreetingRangking) {
        Tw.Logger.info('[chatbot.common.service] [_changeMlsGreetingRangking] mlsGreetingRangking : ', mlsGreetingRangking);

        if ( !mlsGreetingRangking ) {
            return;
        }

        if ( mlsGreetingRangking.length === 0 ) {
            return;
        }

        if ( !Tw.CommonHelper.getCookie('CHATBOT_SHOW_GREETING_INDEX') ) {
            Tw.Logger.info('[chatbot.common.service] [_changeMlsGreetingRangking] CHATBOT_SHOW_GREETING_INDEX is null', '');
            Tw.CommonHelper.setCookie('CHATBOT_SHOW_GREETING_INDEX', '0');
            return;
        }

        var index = Number(Tw.CommonHelper.getCookie('CHATBOT_SHOW_GREETING_INDEX'));
        Tw.Logger.info('[chatbot.common.service] [_changeMlsGreetingRangking] CHATBOT_SHOW_GREETING_INDEX : ', index);
        index++;

        if ( index >= mlsGreetingRangking.length ) {
            index = mlsGreetingRangking.length - 1;
        }

        var nextGreeting = mlsGreetingRangking[index];
        mlsGreetingRangking.splice(index, 1);
        mlsGreetingRangking.unshift(nextGreeting);
        Tw.Logger.info('[chatbot.common.service] [_changeMlsGreetingRangking] mlsGreetingRangking : ', mlsGreetingRangking);

        if ( index >= mlsGreetingRangking.length - 1) {
            Tw.CommonHelper.setCookie('CHATBOT_SHOW_GREETING_INDEX', '');
        } else {
            Tw.CommonHelper.setCookie('CHATBOT_SHOW_GREETING_INDEX', String(index));
        }
    },

    /**
     * @function
     * @desc MLS 에서 받아온 티월드그리팅랭킹 앞에 키워드 추가
     * @param (String) 키워드
     */
    _mlsGreetingRangkingUnshift: function (keywordText, mlsGreetingRangking, greetingKeywords, mlsGreetingTextType) {
        var isOverlap = false;
        
        Tw.Logger.info('[chatbot.common.service] [_mlsGreetingRangkingUnshift] keywordText : ', keywordText);
        Tw.Logger.info('[chatbot.common.service] [_mlsGreetingRangkingUnshift] mlsGreetingRangking : ', mlsGreetingRangking);
        Tw.Logger.info('[chatbot.common.service] [_mlsGreetingRangkingUnshift] greetingKeywords : ', greetingKeywords);
        Tw.Logger.info('[chatbot.common.service] [_mlsGreetingRangkingUnshift] mlsGreetingTextType : ', mlsGreetingTextType);

        // 키워드 중복 검사
        mlsGreetingRangking.forEach(function (row) {
            if ( row === keywordText ) {
                isOverlap = true;
                Tw.Logger.info('[chatbot.common.service] [_mlsGreetingRangkingUnshift] 키워드 중복', '');
                return;
            }
        });

        if( isOverlap === false ) {
            greetingKeywords.forEach(function (row) {
                if( row.keyword && row.type && row.keyword === keywordText && row.type === mlsGreetingTextType && mlsGreetingRangking ) {
                    mlsGreetingRangking.unshift(row.keyword);
                    Tw.Logger.info('[chatbot.common.service] [_mlsGreetingRangkingUnshift] mlsGreetingRangking unshift success', '');
                    return;
                }
            });
        }
    },

    /**
     * @function
     * @desc 노출 날짜에 조건에 맞지 않는 키워드 삭제
     * @param mlsGreetingRangking 키워드 배열
     * @param keywordDateResult 키워드 노출날짜 환경설정 정보
     */
    _removeGreetingDate: function (mlsGreetingRangking, keywordDateResult) {
        Tw.Logger.info('[chatbot.common.service] [_removeGreetingDate] mlsGreetingRangking : ', mlsGreetingRangking);
        Tw.Logger.info('[chatbot.common.service] [_removeGreetingDate] keywordDateResult : ', keywordDateResult);

        var toDay = Tw.DateHelper.getCurrentShortDate();

        if ( keywordDateResult && keywordDateResult.code === Tw.API_CODE.CODE_00 && keywordDateResult.result ) {
            var keywordDateArr = keywordDateResult.result.split('|');
            keywordDateArr.forEach(function(keywordDate){
                if ( !keywordDate || keywordDate.length === 0 ) {
                    return;
                }

                var keywordDateInfoArr = keywordDate.split(',');
                var keyword = '';
                var startDate = '';
                var endDate = '';

                if ( keywordDateInfoArr.length === 3 ) {
                    keyword = keywordDateInfoArr[0].trim();
                    startDate = keywordDateInfoArr[1].trim();
                    endDate = keywordDateInfoArr[2].trim();
                } else {
                    return;
                }

                for (var i = 0; i < mlsGreetingRangking.length; i++) {
                    var greetingRangking = mlsGreetingRangking[i];

                    if ( greetingRangking === keyword ) {
                        Tw.Logger.info('[chatbot.common.service] [_removeGreetingDate] startDate : ', startDate, ', tobay : ', toDay);
                        Tw.Logger.info('[chatbot.common.service] [_removeGreetingDate] endDate : ', endDate, ', tobay : ', toDay);

                        // 시작일자가 오늘 날짜보다 크다면
                        if ( startDate && Tw.FormatHelper.isNumber(startDate) && Number(startDate) > Number(toDay) ) {
                            mlsGreetingRangking.splice(i, 1);
                            break;
                        }

                        // 종료일자가 오늘 날짜보다 작다면
                        if ( endDate && Tw.FormatHelper.isNumber(endDate) && Number(endDate) < Number(toDay) ) {
                            mlsGreetingRangking.splice(i, 1);
                            break;
                        }
                    }
                }
            });
        }
    },

    /**
     * @function
     * @desc 그리팅 메시지 키워드에 오퍼통계 코드 추가
     */
    _setGreetingXtEid: function() {
        var url = location.pathname;
        var greetingXtEid = {};
        
        for ( var i = 0; i < this._greetingXtEids.length; i++ ) {
            if ( this._greetingXtEids[i].pageUrl === url ) {
                greetingXtEid = this._greetingXtEids[i];
                break;
            }
        }

        if (greetingXtEid && greetingXtEid.xtEidArr ) {
            for ( var p = 0; p < this._greetingKeywords.length; p++ ) {
                var keywordItem = this._greetingKeywords[p];

                for ( var k = 0; k < greetingXtEid.xtEidArr.length; k++ ) {
                    var xtEidItem = greetingXtEid.xtEidArr[k];

                    if ( xtEidItem.keyword === keywordItem.keyword ) {
                        keywordItem.xtEid = xtEidItem.xtEid;
                    }
                }
            }
        }
    }
};