/**
 * FileName: customer.branch.detail.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.10.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

interface BranchDetail {
  locCode: string;
  locName: string;
  storeName: string;
  itrstShop: string;
  searchAddr: string;
  jibunAddr: string;
  tel: string;
  geoX: string;
  geoY: string;
  custRateAvg: string;
  custRateCnt: string;
  weekdayOpenTime: string;
  weekdayCloseTime: string;
  satOpenTime: string;
  satCloseTime: string;
  holidayOpenTime: string;
  holidayCloseTime: string;
  talkMap: string;
  premium: string;
  direct: string;
  rent: string;
  skb: string;
  apple: string;
  agnYn: string;
  authAgnYn: string;
  star?: string;
}

class CustomerBranchDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    const branchCode = req.query.code;
    this.getBranchDetailInfo(res, svcInfo, branchCode).subscribe(
      (detail) => {
        if (!FormatHelper.isEmpty(detail)) {
          res.render('branch/customer.branch.detail.html', { detail });
        }
      },
      (err) => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          svcInfo
        });
      }
    );
  }

  private getBranchDetailInfo(res: Response, svcInfo: any, code: string): Observable<BranchDetail | undefined> {
    return this.apiService.request(API_CMD.BFF_08_0007, { locCode: code }).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return this.purifyDetailInfo(resp.result);
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        svcInfo: svcInfo
      });

      return undefined;
    });
  }

  private purifyDetailInfo(detail: BranchDetail): BranchDetail {
    const purified: BranchDetail = { ...detail };

    purified.weekdayOpenTime = FormatHelper.insertColonForTime(purified.weekdayOpenTime);
    purified.weekdayCloseTime = FormatHelper.insertColonForTime(purified.weekdayCloseTime);
    purified.satOpenTime = FormatHelper.insertColonForTime(purified.satOpenTime);
    purified.satCloseTime = FormatHelper.insertColonForTime(purified.satCloseTime);
    purified.holidayOpenTime = FormatHelper.insertColonForTime(purified.holidayOpenTime);
    purified.holidayCloseTime = FormatHelper.insertColonForTime(purified.holidayCloseTime);

    const star = Math.round(parseFloat(purified.custRateAvg));
    purified.star = 'star' + star;

    return purified;
  }
}

export default CustomerBranchDetail;
