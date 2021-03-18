/**
 * @file chatbot.common.service.js
 * @desc 챗봇 게인화 메시지 공통
 * @author 김진우 과장
 * @since 2021.03.10
 */

Tw.ChatbotCommonService = function() {
    // 발화어 리스트
    this._greetingKeywords = [
        { keyword: 'pay_bill', message:'이번달 요금 얼마 나왔어?', type: 'A', linkUrl : '/myt-fare/submain'},
        { keyword: 'pay_bill', message:'이번 달 요금이 궁금하세요?<br/>지금 상세 내역을 확인해보세요.', type: 'B', linkUrl : '/myt-fare/submain'},
        { keyword: 'hotbill', message:'실시간 이용요금 알려줘', type: 'A', linkUrl : '/myt-fare/bill/hotbill'},
        { keyword: 'hotbill', message:'실시간 이용 요금이 궁금하세요?<br/>지금 상세 내역을 확인해보세요.', type: 'B', linkUrl : '/myt-fare/bill/hotbill'},
        { keyword: 'hotdata', message:'실시간 잔여량 알려줘', type: 'A', linkUrl : '/myt-data/hotdata'},
        { keyword: 'hotdata', message:'현재 데이터 잔여량이 궁금하신가요?<br/>지금 상세 내역을 확인해보세요.', type: 'B', linkUrl : '/myt-data/hotdata'},
        { keyword: 'refill_coupon', message:'리필 쿠폰 선물할래', type: 'A', linkUrl : '/myt-data/recharge/coupon'},
        { keyword: 'refill_coupon', message:'리필쿠폰 refillCouponCnt장이 남아있어요.<br/>지금 사용해 보시겠어요?', type: 'B', linkUrl : '/myt-data/recharge/coupon'},
        { keyword: 'pay_mthd', message:'요금납부 변경 문의', type: 'A', linkUrl : '/myt-fare/bill/option'},
        { keyword: 'pay_mthd', message:'지금 은행 자동이체로 납부 방법 변경하고 더 많은 소득 공제 혜택을 누리세요!', type: 'B', linkUrl : '/myt-fare/bill/option'},
        { keyword: 'unpaid_amt', message:'미납요금 얼마야?', type: 'A', linkUrl : '/myt-fare/unbill'},
        { keyword: 'unpaid_amt', message:'미납요금이 총 unpaidAmt원 있습니다!<br>바로 납부 하시겠어요?', type: 'B', linkUrl : '/myt-fare/unbill'},
        { keyword: 'micro_pay', message:'휴대폰 결제금액 얼마야?', type: 'A', linkUrl : '/myt-fare/bill/small'},
        { keyword: 'micro_pay', message:'이번 달 휴대폰 결제 금액이 있어요.<br/>지금 상세내역을 확인해보시겠어요?', type: 'B', linkUrl : '/myt-fare/bill/small'},
        { keyword: 'contents_pay', message:'콘텐츠 이용요금 얼마야?', type: 'A', linkUrl : '/myt-fare/bill/contents'},
        { keyword: 'contents_pay', message:'이번 달 콘텐츠 이용료가 있어요.<br/>지금 상세내역을 확인해보시겠어요?', type: 'B', linkUrl : '/myt-fare/bill/contents'},
        { keyword: 'data_gift', message:'데이터 선물할래', type: 'A', linkUrl : '/myt-data/giftdata'},
        { keyword: 'data_gift', message:'데이터 선물 예정이신가요?<br/>지금 바로 선물해보세요.', type: 'B', linkUrl : '/myt-data/giftdata'},
        { keyword: 'cancel_pause', message:'일시정지 취소하고 싶어', type: 'A', linkUrl : '/myt-join/submain/suspend'},
        { keyword: 'cancel_pause', message:'일시정지 pauseDayCnt일째 입니다.<br>지금 바로 일시정지 해제를 도와드릴까요?', type: 'B', linkUrl : '/myt-join/submain/suspend'},
        { keyword: 'vcoloring', message:'V 컬러링이 뭐야?', type: 'A', unregYn : 'Y', linkUrl : 'https://www.vcoloring-event.com'},
        { keyword: 'vcoloring', message:'데이터의 vodRatio%를 동영상에 사용하셨네요!<br>V 컬러링으로 나의 원픽 동영상을 보여주세요!', type: 'B', unregYn : 'Y', linkUrl : 'https://www.vcoloring-event.com'},
        { keyword: 'vcoloring', message:'V 컬러링 설정하러 가기', type: 'A', unregYn : 'N', linkUrl : 'https://tworld.vcoloring.com'},
        { keyword: 'vcoloring', message:'V 컬러링을 사용 중이시네요! V 컬러링 앱에서 새로운 동영상을 확인해보세요!', type: 'B', unregYn : 'N', linkUrl : 'https://tworld.vcoloring.com'},
        { keyword: 'wavve', message:'영상 콘텐츠는 wavve에서', type: 'A', linkUrl : '/product/callplan?prod_id=NA00006577'},
        { keyword: 'wavve', message:'데이터 vodRatio%를 영상 시청에 쓰는 당신!<br>Wavve에서 데이터 걱정 없이 영상 시청하세요.', type: 'B', linkUrl : '/product/callplan?prod_id=NA00006577'},
        { keyword: 'flo', message:'무제한 음악 스트리밍 FLO', type: 'A', linkUrl : '/product/callplan?prod_id=NA00006520'},
        { keyword: 'flo', message:'음악을 즐겨듣는 당신에게 추천드립니다.<br>이젠 FLO 전용 데이터로 음악을 즐겨보세요.', type: 'B', linkUrl : '/product/callplan?prod_id=NA00006520'},
        { keyword: 'xbox', message:'5GX 클라우드 게임 알아보기', type: 'A', linkUrl : 'https://www.5gxcloudgame.com/main'},
        { keyword: 'xbox', message:'지금 5GX 클라우드 게임 신청하면<br>1개월 100원 이용권 혜택이 찾아갑니다!', type: 'B', linkUrl : 'https://www.5gxcloudgame.com/main'},
        { keyword: 'galaxy_all', message:'혜택받고 최신 갤럭시 시리즈로 바꿔보세요.', type: 'A', linkUrl : 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000182&utm_source=tworld&utm_medium=beta_message&utm_campaign=galaxy_all', startDate : '20210318', endDate : '20210415' },
        { keyword: 'galaxy_all', message:'혜택받고 최신 갤럭시 시리즈로 바꿔보세요.', type: 'B', linkUrl : 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000182&utm_source=tworld&utm_medium=beta_message&utm_campaign=galaxy_all', startDate : '20210318', endDate : '20210415' },
        { keyword: 'untactplan', message:'3만원 대의 5G 요금제를 이용해 보세요.', type: 'A', linkUrl : 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000170&utm_source=tworld&utm_medium=app_message&utm_campaign=untactplan' },
        { keyword: 'untactplan', message:'3만원 대의 5G 요금제를 이용해 보세요.', type: 'B', linkUrl : 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000170&utm_source=tworld&utm_medium=app_message&utm_campaign=untactplan' },
        { keyword: 'newphone', message:'휴대폰 바꾸고 T기프트도 챙기세요.', type: 'A', linkUrl : 'https://m.shop.tworld.co.kr/shop/main?referrer=&utm_source=tworld&utm_medium=app_message&utm_campaign=phone' },
        { keyword: 'newphone', message:'휴대폰 바꾸고 T기프트도 챙기세요.', type: 'B', linkUrl : 'https://m.shop.tworld.co.kr/shop/main?referrer=&utm_source=tworld&utm_medium=app_message&utm_campaign=phone' },
        { keyword: 'iphone12series', message:'혜택받고 아이폰 12로 바꿔 보세요.', type: 'A', linkUrl : 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000175&utm_source=tworld&utm_medium=app_message&utm_campaign=iphone12series' },
        { keyword: 'iphone12series', message:'혜택받고 아이폰 12로 바꿔 보세요.', type: 'B', linkUrl : 'https://m.shop.tworld.co.kr/exhibition/view?exhibitionId=P00000175&utm_source=tworld&utm_medium=app_message&utm_campaign=iphone12series' }
    ];
};

Tw.ChatbotCommonService.prototype = {
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
        var _this = this;
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
                    // 그리팅 키워드 시작일 종료일 검사
                    if ( _this._checkGreetingDate(row.keyword) ) {
                        mlsGreetingRangking.unshift(row.keyword);
                        Tw.Logger.info('[chatbot.common.service] [_mlsGreetingRangkingUnshift] mlsGreetingRangking unshift success', '');
                        return;
                    }
                }
            });
        }
    },

    /**
     * @function
     * @desc 그리팅 키워드 시작일 종료일 유효성 검사
     * @param (String) keyword
     * @returns boolean
     */
     _checkGreetingDate: function (keyword) {
        Tw.Logger.info('[chatbot.common.service] [_checkGreetingDate] 그리팅 키워드 시작일 종료일 유효성 검사 시작 keyword : ', keyword);
        var toDay = Tw.DateHelper.getCurrentShortDate();
        var greetingKeywords = this._greetingKeywords;
        var targetKeyword = {};

        greetingKeywords.forEach(function(item) {
            if ( item.keyword === keyword ) {
                targetKeyword = item;
                return;
            }
        });
            
        Tw.Logger.info('[chatbot.common.service] [_checkGreetingDate] targetKeyword : ', targetKeyword);

        // 시작일자가 오늘 날짜보다 크다면
        if ( targetKeyword.startDate && Tw.FormatHelper.isNumber(targetKeyword.startDate) && Number(targetKeyword.startDate) > Number(toDay) ) {
            Tw.Logger.info('[chatbot.common.service] [_checkGreetingDate] startDate : ' + targetKeyword.startDate + ', toDay : ' + toDay, '');
            Tw.Logger.info('[chatbot.common.service] [_checkGreetingDate] return : ', 'false');
            return false;
        }

        // 종료일자가 오늘 날짜보다 작다면
        if ( targetKeyword.endDate && Tw.FormatHelper.isNumber(targetKeyword.endDate) && Number(targetKeyword.endDate) < Number(toDay) ) {
            Tw.Logger.info('[chatbot.common.service] [_checkGreetingDate] endDate : ' + targetKeyword.endDate + ', toDay : ' + toDay, '');
            Tw.Logger.info('[chatbot.common.service] [_checkGreetingDate] return : ', 'false');
            return false;
        }

        Tw.Logger.info('[chatbot.common.service] [_checkGreetingDate] return : ', 'true');
        return true;
    }
};