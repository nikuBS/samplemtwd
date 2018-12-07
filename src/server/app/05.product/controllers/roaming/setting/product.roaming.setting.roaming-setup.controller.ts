/**
 * FileName: product.roaming.setting.roaming-setup.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.03
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import {REDIS_PRODUCT_INFO} from '../../../../../types/redis.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';


class ProductRoamingSettingRoamingSetup extends TwViewController {
    constructor() {
        super();
    }
    render(req: Request, res: Response, next: NextFunction, svcInfo: any) {


        const prodId = req.query.prodId || null;

        if (FormatHelper.isEmpty(prodId)) {
                return this.error.render(res, {
                    svcInfo: svcInfo,
                    title: PRODUCT_TYPE_NM.SETTING
                });
            }

            Observable.combineLatest(
                this.redisService.getData(REDIS_PRODUCT_INFO + prodId),
                this.apiService.request(API_CMD.BFF_10_0091, {}, {}, prodId)
            ).subscribe(([ prodRedisInfo, prodBffInfo ]) => {

                if (FormatHelper.isEmpty(prodRedisInfo) || (prodBffInfo.code !== API_CODE.CODE_00)) {
                    return this.error.render(res, {
                        svcInfo: svcInfo,
                        title: PRODUCT_TYPE_NM.SETTING
                    });
                }

                res.render('roaming/setting/product.roaming.setting.roaming-setup.html', {
                    svcInfo : svcInfo,
                    prodRedisInfo : prodRedisInfo.summary,
                    prodBffInfo : prodBffInfo.result,
                    prodId : prodId
                });
        });



        // res.render('roaming/setting/product.roaming.setting.roaming-setup.html', {
        //     svcInfo : svcInfo,
        //     prodRedisInfo : { prodNm: 'T로밍 데이터 1만원',
        //         prodIconImgUrl: null,
        //         prodSmryDesc: '전세계 150개국 이상에서 3G/LTE 데이터로밍을 실속있게 이용가능한 한도 요금제',
        //         prodBasBenfCtt: null,
        //         sktProdBenfCtt: null,
        //         basOfrGbDataQtyCtt: '-',
        //         basOfrMbDataQtyCtt: null,
        //         basOfrVcallTmsCtt: '-',
        //         basOfrCharCntCtt: null,
        //         smryHtmlCtt: null,
        //         basFeeInfo: '11000',
        //         freeYn: 'N' },
        //     prodBffInfo : {
        //         "svcStartDt" : "20181210"
        //         ,"svcEndDt" : "20181225"
        //         ,"svcStartTm" : "12"
        //         ,"svcEndTm" : "12"
        //         ,"startEndTerm" : "15"
        //         ,"prodNm" : "T로밍 요금제"
        //         ,"prodFee" : ""
        //         ,"romSetClCd" : "DTDN"
        //         ,"isAdult" : "true"
        //         ,"chkCurProdStat" : "false"
        //         ,"settingYn" : true
        //
        //     },
        //     prodId : 'test'
        // });

    }
}

export default ProductRoamingSettingRoamingSetup;

