/**
 * @file customer.agentsearch.detail.controller.ts
 * @author Hakjoon sim (hakjoon.sim@sk.com)
 * @since 2018.10.29
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
  talkMapArr?: Array<string>;
  star?: string;
}

class CustomerAgentsearchDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    const branchCode = req.query.code;
    this.getBranchDetailInfo(res, svcInfo, pageInfo, branchCode).subscribe(
      (detail) => {
        if (!FormatHelper.isEmpty(detail)) {
          res.render('agentsearch/customer.agentsearch.detail.html', { detail, svcInfo, pageInfo });
        }
      },
      (err) => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          pageInfo: pageInfo,
          svcInfo
        });
      }
    );
  }

  private getBranchDetailInfo(res: Response, svcInfo: any, pageInfo: any, code: string): Observable<BranchDetail | undefined> {
    return this.apiService.request(API_CMD.BFF_08_0007, { locCode: code }).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return this.purifyDetailInfo(resp.result);
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo: pageInfo,
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

    if (purified.custRateAvg.match(/\d/)) {
      purified.custRateAvg += '.0';
    }

    if (purified.agnYn === 'Y' || purified.star.includes('NaN') || purified.custRateAvg === '0.0') {
      purified.custRateCnt = '0';
    }

    // API 가 스펙대로 동작안하는데 쓰는 쪽에서 예외처리 하라함....... talkMap field 없으면 예외 처리
    if (!FormatHelper.isEmpty(purified.talkMap)) {
      purified.talkMapArr = purified.talkMap.split(/#\^|<br.*?>/gi);
    } else {
      purified.talkMapArr = [];
    }

    return purified;
  }
}

export default CustomerAgentsearchDetail;
