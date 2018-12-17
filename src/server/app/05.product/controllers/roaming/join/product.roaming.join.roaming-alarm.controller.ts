/**
 * FileName: product.roaming.join.roaming-alarm.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import {REDIS_PRODUCT_INFO} from '../../../../../types/redis.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../../utils/string.helper';


class ProductRoamingJoinRoamingAlarm extends TwViewController {
    constructor() {
        super();
    }
    render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
        const prodId = req.query.prod_id || null;


        if (FormatHelper.isEmpty(prodId)) {
            return this.error.render(res, {
                svcInfo: svcInfo,
                title: PRODUCT_TYPE_NM.JOIN
            });
        }

        Observable.combineLatest(
            this.redisService.getData(REDIS_PRODUCT_INFO + prodId),
            this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '01'}, {}, prodId)
        ).subscribe(([ prodRedisInfo, prodApiInfo ]) => {
            
            if (FormatHelper.isEmpty(prodRedisInfo) || (prodApiInfo.code !== API_CODE.CODE_00)) {
                return this.error.render(res, {
                    svcInfo: svcInfo,
                    title: PRODUCT_TYPE_NM.JOIN,
                    code: prodApiInfo.code,
                    msg: prodApiInfo.msg,
                });
            }

            res.render('roaming/join/product.roaming.join.roaming-alarm.html', {
                svcInfo : svcInfo,
                prodRedisInfo : prodRedisInfo.result.summary,
                prodApiInfo : prodApiInfo.result,
                prodId : prodId,
                phoneNum : StringHelper.phoneStringToDash(svcInfo.showSvc)
            });
        });

        // res.render('roaming/join/product.roaming.join.roaming-alarm.html', {
        //     svcInfo : { svcMgmtNum: '1000285302',
        //         svcNum: '01054**62**',
        //         svcGr: 'A',
        //         svcAttrCd: 'M1',
        //         repSvcYn: 'Y',
        //         pwdStCd: '',
        //         nickNm: '',
        //         prodId: 'NA00004775',
        //         prodNm: 'band 데이터 퍼펙트',
        //         addr: '****',
        //         actRepYn: 'Y',
        //         smsUsableYn: 'Y',
        //         motpUsableYn: 'N',
        //         totalSvcCnt: '3',
        //         expsSvcCnt: '1',
        //         mbrNm: '강*수',
        //         loginType: 'T',
        //         noticeType: '',
        //         svcStCd: 'AC',
        //         eqpMdlNm: '갤럭시 노트 8_256G',
        //         svcScrbDt: '19960916',
        //         svcLastUpdDtm: '20180822090118',
        //         showName: '휴대폰',
        //         showSvc: '01054**62**'
        //     },
        //     prodRedisInfo : { prodNm: 'T로밍 OnePass400기간형',
        //         prodIconImgUrl: null,
        //         prodSmryDesc: '전 세계 주요국에서 신청한 기간 동안 LTE/3G 데이터를 안심하고 이용할 수 있는 요금제',
        //         prodBasBenfCtt: null,
        //         sktProdBenfCtt: null,
        //         basOfrGbDataQtyCtt: '-',
        //         basOfrMbDataQtyCtt: null,
        //         basOfrVcallTmsCtt: '-',
        //         basOfrCharCntCtt: null,
        //         smryHtmlCtt: null,
        //         basFeeInfo: '16500',
        //         freeYn: 'N' },
        //     prodBffInfo : {
        //         "preinfo": {
        //             "svcNumMask": "010xx**xx**",
        //             "svcProdGrpId": "",
        //             "autoJoinList": [
        //                 {
        //                     "svcProdCd": "3",
        //                     "svcProdNm": "부가서비스",
        //                     "prodNm": "보험멤버십할인"
        //                 }
        //             ],
        //             "autoTermList": [
        //                 {
        //                     "svcProdCd": "3",
        //                     "svcProdNm": "부가서비스",
        //                     "prodNm": "보험멤버십할인"
        //                 }
        //             ],
        //             "joinNoticeList": [
        //                 {
        //                     "prodNm": "보험멤버십할인",
        //                     "noticeTxt": "<font color=#313131><br>&#8226; <B>음성통화 기능이 지원되지 않는 단말</B>에 대해서는 부가서비스 <B>가입이 제한</B>됩니다.</font>"
        //                 }
        //             ],
        //             "termNoticeList": [
        //                 {
        //                     "prodNm": "mVoIP한도정지",
        //                     "noticeTxt": "본 서비스 해지시 본인인증 절차가 필요합니다."
        //                 }
        //             ],
        //             "frProdInfo": {
        //                 "prodId": "NA00004775",
        //                 "prodNm": "band 데이터 퍼펙트",
        //                 "basFeeInfo": "무료",
        //                 "basOfrDataQtyCtt": "11.0GB",
        //                 "basOfrVcallTmsCtt": "집전화·이동전화 무제한",
        //                 "basOfrCharCntCtt": "기본제공",
        //                 "chgSktProdBenfCtt": ""
        //             },
        //             "toProdInfo": {
        //                 "prodId": "NA00005959",
        //                 "prodNm": "Data 인피니티",
        //                 "basFeeInfo": "100000",
        //                 "basOfrDataQtyCtt": "무제한",
        //                 "basOfrVcallTmsCtt": "집전화·이동전화 무제한",
        //                 "basOfrCharCntCtt": "기본제공",
        //                 "chgSktProdBenfCtt": "test"
        //             }
        //         },
        //         "downgrade": {
        //             "guidMsgCtt": "요금제 변경 시, 마이스마트콜을 이용 중인 경우 유료로 전환되며, 멜론 모바일 스트리밍 무료 이용 혜택도 종료됩니다. (재인증 불가)",
        //             "htmlMsgYn": "N"
        //         },
        //         "installmentAgreement": {
        //             "penAmt": "0",
        //             "frDcAmt": "0",
        //             "toDcAmt": "0",
        //             "agrmtDayCnt": "0",
        //             "agrmtUseCnt": "0",
        //             "premTermYn": "N",
        //             "premTermMsg": "",
        //             "gapDcCd": "",
        //             "gapDcAmt": "0"
        //         },
        //         "stipulationInfo": {
        //             "scrbStplAgreeYn": "Y",
        //             "scrbStplAgreeTitNm": "",
        //             "scrbStplAgreeHtmlCtt": "<p>test</p>",
        //             "termStplAgreeYn": "N",
        //             "termStplAgreeTitNm": "",
        //             "termStplAgreeHtmlCtt": "",
        //             "psnlInfoCnsgAgreeYn": "Y",
        //             "psnlInfoCnsgAgreeTitNm": "",
        //             "psnlInfoCnsgHtmlCtt": "<p>test</p>",
        //             "psnlInfoOfrAgreeYn": "Y",
        //             "psnlInfoOfrAgreeTitNm": "",
        //             "psnlInfoOfrHtmlCtt": "<p>test</p>",
        //             "adInfoOfrAgreeYn": "Y",
        //             "adInfoOfrAgreeTitNm": "",
        //             "adInfoOfrHtmlCtt": "<p>test</p>"
        //         }
        //     },
        //     prodId : null
        // });

    }
}

export default ProductRoamingJoinRoamingAlarm;

