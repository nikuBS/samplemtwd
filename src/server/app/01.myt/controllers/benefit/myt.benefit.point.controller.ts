/**
 * FileName: myt.benefit.point.controller.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 14.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';


class MyTBenefitPoint extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.getPointsData().subscribe(([ptOKCashAndT, ptRainbow, ptNoContract, ptMilitary, ptCookiz]) => {
      const points = {};
      if ( ptOKCashAndT.code === API_CODE.CODE_00 ) {
        points['OKCashBack'] = FormatHelper.addComma(ptOKCashAndT.result.availPt);
        points['T'] = FormatHelper.addComma(ptOKCashAndT.result.availTPt);
      } else {
        points['OKCashBack'] = 0;
        points['T'] = 0;
      }

      if ( ptRainbow.code === API_CODE.CODE_00 ) {
        points['Rainbow'] = FormatHelper.addComma(ptRainbow.result.usblPoint);
      } else {
        points['Rainbow'] = 0;
      }

      if ( ptNoContract.code === API_CODE.CODE_00 ) {
        points['NoContrack'] = FormatHelper.addComma(ptNoContract.result.usblPoint);
      } else {
        points['NoContrack'] = 0;
      }

      if ( ptMilitary.code === API_CODE.CODE_00 ) {
        points['Military'] = FormatHelper.addComma(ptMilitary.result.usblPoint);
      } else {
        points['Military'] = 0;
      }

      if ( ptCookiz.code === API_CODE.CODE_00 ) {
        points['Cookiz'] = FormatHelper.addComma(ptCookiz.result.usblPoint);
      } else {
        points['Cookiz'] = 0;
      }

      res.render('benefit/myt.benefit.point.html', { svcInfo: svcInfo, points: points });
    });
  }

  getPointsData(): Observable<any> {
    const obsOKCashAndTPoint: Observable<any> = this.apiService.request(API_CMD.BFF_07_0041, {});
    const obsRainbowPoint: Observable<any> = this.apiService.request(API_CMD.BFF_05_0132, {});
    const obsMilitaryPoint: Observable<any> = this.apiService.request(API_CMD.BFF_05_0120, {});
    const obsCookizPoint: Observable<any> = this.apiService.request(API_CMD.BFF_05_0115, {});

    const TODAY = DateHelper.getCurrentDate();
    const options = {
      startYear: DateHelper.getShortDateWithFormat(TODAY, 'YYYY', 'YYYYMMDD'),
      startMonth: DateHelper.getShortDateWithFormat(TODAY, 'MM', 'YYYYMMDD'),
      startDay: DateHelper.getShortDateWithFormat(TODAY, 'DD', 'YYYYMMDD'),
      endYear: DateHelper.getShortDateWithFormat(TODAY, 'YYYY', 'YYYYMMDD'),
      endMonth: DateHelper.getShortDateWithFormat(TODAY, 'MM', 'YYYYMMDD'),
      endDay: DateHelper.getShortDateWithFormat(TODAY, 'DD', 'YYYYMMDD')
    };
    const obsNoContractPoint: Observable<any> = this.apiService.request(API_CMD.BFF_05_0060, options);
    return Observable.combineLatest(
      obsOKCashAndTPoint,
      obsRainbowPoint,
      obsNoContractPoint,
      obsMilitaryPoint,
      obsCookizPoint
    );
  }
}

export default MyTBenefitPoint;
