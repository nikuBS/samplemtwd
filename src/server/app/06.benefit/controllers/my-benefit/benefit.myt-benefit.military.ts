/**
 * FileName: benefit.myt-benefit.military.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 1.
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MY_BENEFIT } from '../../../../types/title.type';
import FormatHelper from '../../../../utils/format.helper';

class BenefitMilitary extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    this.apiService.request(API_CMD.BFF_05_0120, {})
      .subscribe(( military ) => {
        if ( military.code === API_CODE.CODE_00 ) {
          const options = {
            svcInfo,
            pageInfo,
            point: FormatHelper.addComma(military.result.usblPoint)
          };

          res.render('my-benefit/benefit.myt-benefit.military.html', options);
        } else {
          return this.error.render(res, {
            title: MY_BENEFIT.MAIN,
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            msg: military.msg,
            code: military.code
          });
        }
      });
  }

}

export default BenefitMilitary;
