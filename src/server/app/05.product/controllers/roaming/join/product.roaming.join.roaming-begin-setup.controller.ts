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


class ProductRoamingJoinRoamingBeginSetup extends TwViewController {
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
            this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '01'}, {}, prodId)
        ).subscribe(([ prodRedisInfo, prodApiInfo ]) => {

            if (FormatHelper.isEmpty(prodRedisInfo) || (prodApiInfo.code !== API_CODE.CODE_00)) {
                return this.error.render(res, {
                    svcInfo: svcInfo,
                    title: PRODUCT_TYPE_NM.JOIN
                });
            }

            res.render('roaming/join/product.roaming.join.roaming-begin-setup.html', {
                svcInfo : this.loginService.getSvcInfo(),
                prodRedisInfo : prodRedisInfo.result.summary,
                prodApiInfo : prodApiInfo.result,
                prodId : prodId
            });
        });


    }
}

export default ProductRoamingJoinRoamingBeginSetup;

