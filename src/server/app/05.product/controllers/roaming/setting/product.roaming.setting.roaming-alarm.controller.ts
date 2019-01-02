/**
 * FileName: product.roaming.setting.roaming-alarm.controller.ts
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


class ProductRoamingSettingRoamingAlarm extends TwViewController {
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
            this.apiService.request(API_CMD.BFF_10_0021, {}, {}, [prodId]),
        ).subscribe(([ prodRedisInfo, prodBffInfo ]) => {

            if (FormatHelper.isEmpty(prodRedisInfo) || (prodBffInfo.code !== API_CODE.CODE_00) ) {
                return this.error.render(res, {
                    svcInfo: svcInfo,
                    title: PRODUCT_TYPE_NM.SETTING,
                    code: prodBffInfo.code,
                    msg: prodBffInfo.msg,
                });
            }

            res.render('roaming/setting/product.roaming.setting.roaming-alarm.html', {
                svcInfo : svcInfo,
                prodRedisInfo : prodRedisInfo.summary,
                prodBffInfo : prodBffInfo.result,
                prodId : prodId,
                phoneNum : StringHelper.phoneStringToDash(svcInfo.svcNum)
            });
        });


    }
}

export default ProductRoamingSettingRoamingAlarm;

