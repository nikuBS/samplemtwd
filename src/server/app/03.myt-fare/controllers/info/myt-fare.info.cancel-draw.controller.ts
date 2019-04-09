/**
 * @file [나의요금-자동납부_통합인출_해제] 관련 처리
 * @author Lee Kirim
 * @since 2019. 2. 1
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

/**
 * 해제에 관련한 정보를 조회해 렌더링함
 * 계좌정보
 */
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
