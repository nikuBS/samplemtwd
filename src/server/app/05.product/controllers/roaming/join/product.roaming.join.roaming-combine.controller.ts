/**
 * FileName: product.roaming.join.roaming-combine.controller.ts
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


class ProductRoamingJoinRoamingCombine extends TwViewController {
    constructor() {
        super();
    }
    render(req: Request, res: Response, next: NextFunction, svcInfo: any) {



        const prodId = req.query.prodId || null;


        if (FormatHelper.isEmpty(prodId)) {
            return this.error.render(res, {
                svcInfo: svcInfo,
                title: PRODUCT_TYPE_NM.JOIN
            });
        }

        Observable.combineLatest(
            this.redisService.getData(REDIS_PRODUCT_INFO + prodId),
            this.apiService.request(API_CMD.BFF_10_0141, {}, {})
        ).subscribe(([ prodRedisInfo, prodBffInfo]) => {

            if (FormatHelper.isEmpty(prodRedisInfo) || (prodBffInfo.code !== API_CODE.CODE_00)) {
                return this.error.render(res, {
                    svcInfo: svcInfo,
                    title: PRODUCT_TYPE_NM.JOIN
                });
            }

            res.render('roaming/join/product.roaming.join.roaming-combine.html', {
                svcInfo : svcInfo,
                prodRedisInfo : prodRedisInfo.summary,
                prodBffInfo : prodBffInfo.result,
                prodId : prodId
            });
        });

        // res.render('roaming/join/product.roaming.join.roaming-combine.html', {
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
        //     prodBffInfo :  {
        //
        //
        //             "svcMgmtNum": "1178937507",
        //                 "svcNum": "01049525651",
        //                 "prodId": "NA00005690",
        //                 "prodNm": "T로밍 함께쓰기 3GB",
        //                 "startdtm": "20180908090000",
        //                 "enddtm": "20180918090000",
        //                 "usedays": "10",
        //                 "joinYn": true,
        //                 "svcProdGrpId": "RA0000000221963",
        //                 "togetherMemList": [
        //                 {
        //                     "svcProdGrpId": "RA0000000221963",
        //                     "svcMgmtNum": "1178937507",
        //                     "svcNum": "01049525651",
        //                     "childYn": false
        //                 },
        //                 {
        //                     "svcMgmtNum": "7262133476",
        //                     "svcNum": "01033988216",
        //
        //                     "custNm" : "한국방송공사" // 이름 or 법인명등 마스킹 적용되어 리턴
        //                     "childYn": true
        //                 }
        //             ]
        //
        //         },
        //     prodId : null
        // });


    }
}

export default ProductRoamingJoinRoamingCombine;

