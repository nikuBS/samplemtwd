/**
 * FileName: myt.bill.history.limit.change.common.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.27
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff-common.type';
import FormatHelper from '../../../../utils/format.helper';


class MyTBillHistoryMicroLimitChange extends TwViewController {

  private view: any;

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {
      const paths = req.path.split('/');
      const current = paths[paths.length - 3];
      let errorTitle: any;
      let current_API_CMD: any;

      switch (current) {
        case 'micro':
          current_API_CMD = API_CMD.BFF_05_0080;
          errorTitle = MYT_PAY_HISTORY_TITL.MICRO;
          break;
        case 'contents' :
          current_API_CMD = API_CMD.BFF_05_0066;
          errorTitle = MYT_PAY_HISTORY_TITL.CONTENTS;
          break;
        default:
          break;
      }

      if (resp.code === API_CODE.CODE_00) {

        this.apiService.request(current_API_CMD, {}).subscribe((response) => {

          switch (current) {
            case 'micro':
              this.view = 'bill/myt.bill.history.micro.limit.change.html';
              response.result.monLimit = response.result.microPayLimitAmt;
              break;
            case 'contents' :
              this.view = 'bill/myt.bill.history.contents.limit.change.html';
              break;
            default:
              break;
          }
          response.result.formedMonLimit = FormatHelper.addComma(response.result.monLimit);
          response.result.formedDayLimit = FormatHelper.addComma(response.result.dayLimit);
          response.result.formedOnceLimit = FormatHelper.addComma(response.result.onceLimit);
          response.result.paySpectrum = [500000, 300000, 200000, 150000, 120000, 60000, 50000, 30000];

          // paySpectrum에 끼워 넣어야 함.

          if (response.code === API_CODE.CODE_00) {
            res.render(this.view, {
              result: response.result,
              svcInfo: svcInfo,
              current: current
            });
          } else {
            this.logger.error(this, response);
          }
        });
      } else {
        res.render('../../../03.payment/views/containers/payment.prepay.error.html', {
          err: resp,
          svcInfo: svcInfo,
          title: errorTitle
        });
      }
    });
  }

}


export default MyTBillHistoryMicroLimitChange;
