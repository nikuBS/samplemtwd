/**
 * @file myt-fare.info.history.controller.ts
 * @author Lee Kirim (kirim@sk.com)
 * @since 2019. 2. 1
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class MyTFareInfoCancelDraw extends TwViewController {
    render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
        this.apiService.request(API_CMD.BFF_07_0070, {}).subscribe((resp: { code: string; result: any, msg?: string }) => {
            if (resp.code !== API_CODE.CODE_00) {
                return this.error.render(res, {
                    code: resp.code,
                    msg: resp.msg,
                    svcInfo: svcInfo
                });
            }
            
            res.render('info/myt-fare.info.cancel-draw.html', { svcInfo, pageInfo, 
                data: {
                    bankName: resp.result ? resp.result.bankNm : '',
                    bankAccount: resp.result ? resp.result.bankSerNum : '',
                    bankCd: resp.result ? resp.result.bankCd : ''
                }
            });
        });
    }
}

export default MyTFareInfoCancelDraw;
