/**
 * FileName: myt-fare.info.bill-tax.send-email.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2019. 2. 1
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';


class MytFareInfoBillTaxSendEmail extends TwViewController {
    public render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
        const date: string = req.query.date;
        
        if (FormatHelper.isEmpty(date)) {
            return res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
        }

        this.apiService.request(API_CMD.BFF_07_0017, {selType: 'M', selSearch: date})
        .subscribe((resp: {code: string, msg: string, result: any}) => {
            if (resp.code !== API_CODE.CODE_00) {
                return this.error.render(res, {
                    code: resp.code,
                    msg: resp.msg,
                    pageInfo: pageInfo,
                    svcInfo: svcInfo
                });
            }

            const curBillInfo = resp.result.taxReprintList[0];
            return res.render('info/myt-fare.info.bill-tax.send-email.html', {svcInfo, pageInfo, data: {
                ...curBillInfo,
                ctzBizName : svcInfo.eqpMdlNm,
                taxBillYearMonth : DateHelper.getCurrentShortDate(curBillInfo.taxBillIsueDt).substring(0, 6),
                taxBillIsueDt : DateHelper.getShortDate(curBillInfo.taxBillIsueDt),
                splyPrc : FormatHelper.addComma(curBillInfo.splyPrc.toString()),
                vatAmt : FormatHelper.addComma(curBillInfo.vatAmt.toString()),
                totAmt : FormatHelper.addComma(curBillInfo.totAmt.toString())
            }});
        });
        
    }
}

export default MytFareInfoBillTaxSendEmail;
