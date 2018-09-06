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

      if ( ptOKCashAndT.code !== API_CODE.CODE_00 ||
        ptRainbow.code !== API_CODE.CODE_00 ||
        ptNoContract.code !== API_CODE.CODE_00 ||
        (ptMilitary.code !== API_CODE.CODE_00 && ptMilitary.code !== 'BIL0071') ||
        (ptCookiz.code !== API_CODE.CODE_00 && ptCookiz.code !== 'BIL0070')
      ) {
        return this.error.render(res, {svcInfo});
      } else {
        const points = {};
        points['OKCashBack'] = FormatHelper.addComma(ptOKCashAndT.result.availPt);
        points['T'] = FormatHelper.addComma(ptOKCashAndT.result.availTPt);
        points['Rainbow'] = FormatHelper.addComma(ptRainbow.result.usblPoint);

        // 포인트 없을 때 비노출
        if ( parseInt(ptNoContract.result.usablePt, 10) > 0 ) {
          points['NoContract'] = FormatHelper.addComma(ptNoContract.result.usablePt);
        }

        // 포인트 없을 때 비노출
        if ( ptMilitary.code !== 'BIL0071' && parseInt(ptMilitary.result.usblPoint, 10) > 0 ) {
          points['Military'] = FormatHelper.addComma(ptMilitary.result.usblPoint);
        }

        // 포인트 없을 때 비노출
        if ( ptCookiz.code !== 'BIL0070' && parseInt(ptCookiz.result.usblPoint, 10) > 0 ) {
          points['Cookiz'] = FormatHelper.addComma(ptCookiz.result.usblPoint);
        }
        const showPointPayment = parseInt(points['OKCashBack'] + points['T'] + points['Rainbow'], 10) > 0;
        res.render('benefit/myt.benefit.point.html', { svcInfo: svcInfo, points: points, showPointPayment });
      }
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
