/**
 * FileName: benefit.myt-benefit.military.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 1.
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import DateHelper from '../../../../utils/date.helper';
import { MY_BENEFIT } from '../../../../types/title.type';
import FormatHelper from '../../../../utils/format.helper';

class BenefitMilitary extends TwViewController {
  private _total: number = 0;

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0120, {})
    ).subscribe(([military]) => {
        // TODO error check all
        if ( military.code === API_CODE.CODE_00 ) {
          const options = {
            svcInfo,
            pageInfo,
            point: FormatHelper.addComma(military.result.usblPoint)
          };

          res.render('my-benefit/benefit.military.html', options);
        } else {
          return this.error.render(res, {
            title: MY_BENEFIT.MAIN,
            svcInfo: svcInfo
          });
        }
      }
    );
  }

}

export default BenefitMilitary;
