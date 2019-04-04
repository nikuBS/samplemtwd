/**
 * FileName: customer.researches.result.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2019.01.04
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
// import { of } from 'rxjs/observable/of';
// import { ResearchResult } from '../../../../mock/server/customer.researches.mock';

export default class CustomerResearchesResult extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.getResult(req.query.id).subscribe(result => {
      if (result.code) {
        return this.error.render(res, {
          svcInfo,
          pageInfo,
          ...result
        });
      }

      res.render('researches/customer.researches.result.html', { svcInfo, pageInfo, result });
    });
  }

  private getResult = id => {
    // return of(ResearchResult).map(resp => {
    return this.apiService.request(API_CMD.BFF_08_0024, { bnnrRsrchId: id }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const result = resp.result[0];

      if (result) {
        const examples: any[] = [],
          totalCount = result.totRpsCnt,
          answer = Number(result.canswNum || 0);
        let i = 1,
          maxIdx = 0;

        while (result['exCtt' + i]) {
          const count = result['rpsCtt' + i + 'Cnt'];
          examples.push({
            content: result['exCtt' + i] || '',
            count,
            rate: totalCount === 0 ? 0 : Math.floor((count / totalCount) * 100),
            isAnswer: answer === i
          });
          maxIdx = result['rpsCtt' + (maxIdx + 1) + 'Cnt'] < count ? i - 1 : maxIdx;
          i++;
        }

        return {
          ...result,
          staDtm: DateHelper.getShortDate(result.staDtm),
          endDtm: DateHelper.getShortDate(result.endDtm),
          isProceeding: result.endDtm && DateHelper.getDifference(result.endDtm) > 0,
          examples,
          totalCount,
          maxIdx
        };
      } else {
        return result;
      }
    });
  }
}
