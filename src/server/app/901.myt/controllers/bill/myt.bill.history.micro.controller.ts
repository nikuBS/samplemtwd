/**
 * FileName: myt.bill.history.micro.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff.old.type';
import {DATE_FORMAT, MYT_BILL_HISTORY_STR} from '../../../../types/string.old.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';


class MyTBillHistoryMicro extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {

      const isQueryEmpty: any = FormatHelper.isEmpty(req.query);
      const current: any = req.path.split('/').splice(-1)[0];

      if (resp.code === API_CODE.CODE_00) {

        if (isQueryEmpty && current === 'micro') {

          const endMDD = DateHelper.getShortDateWithFormat(new Date(), 'M.DD', null);
          const startMDD = endMDD.replace(endMDD.substr(-2), '') + '01';
          const curYYYYM_kor = DateHelper.getShortDateWithFormat(new Date(), DATE_FORMAT.YYYYMM_TYPE_1);

          // if(response.code)
          res.render('bill/myt.bill.history.micro.html', {
            svcInfo: svcInfo,
            curYYYYM_kor: curYYYYM_kor,
            startMDD: startMDD,
            endMDD: endMDD
          });

        } else if (!isQueryEmpty && current === 'detail') {

          req.query.useDate = DateHelper.getShortDateWithFormat(req.query.useDate, DATE_FORMAT.YYYYMMDDHHMM_TYPE_0);
          const isLong = req.query.pgName.length >= 30 ? 'long' : '';

          res.render('bill/myt.bill.history.micro.detail.html', {
            svcInfo: svcInfo,
            pageTitle: req.query.type === '0' ?
                MYT_BILL_HISTORY_STR.PAGE_TITLE.MICRO_DETAIL : MYT_BILL_HISTORY_STR.PAGE_TITLE.AUTOPAY_BLIND_DETAIL,
            isLong: isLong,
            ...req.query
          });

        } else if (isQueryEmpty && current === 'detail') {
          res.render('../../../903.payment/views/containers/payment.prepay.error.html', {
            svcInfo: svcInfo,
            title: MYT_BILL_HISTORY_STR.PAGE_TITLE.ILLEGIAL_ACCESS
          });
        }

      } else {

        res.render('../../../903.payment/views/containers/payment.prepay.error.html', {
          err: resp,
          svcInfo: svcInfo,
          title: MYT_PAY_HISTORY_TITL.MICRO
        });
      }
    });
  }

}


export default MyTBillHistoryMicro;
