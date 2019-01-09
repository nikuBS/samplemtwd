/**
 * FileName: product.roaming.terminate.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import { REDIS_KEY } from '../../../../types/redis.type';


class ProductRoamingTerminate extends TwViewController {
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
            this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
            this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '03'}, {}, [prodId])
        ).subscribe(([ prodRedisInfo, prodBffInfo ]) => {

            if (FormatHelper.isEmpty(prodRedisInfo) || (prodBffInfo.code !== API_CODE.CODE_00)) {
                return this.error.render(res, {
                    svcInfo: svcInfo,
                    title: PRODUCT_TYPE_NM.JOIN
                });
            }

            res.render('roaming/product.roaming.terminate.html', {
                svcInfo : svcInfo,
                prodRedisInfo : prodRedisInfo.result.summary,
                prodBffInfo : prodBffInfo.result,
                prodId : prodId
            });
        });
    }
}

export default ProductRoamingTerminate;

