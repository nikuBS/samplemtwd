/**
 * FileName: customer.researches.result.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2019.01.04
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

export default class CustomerResearchesResult extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.getResult(req.query.id).subscribe(result => {
      if (!result || result.code) {
        return this.error.render(res, {
          svcInfo,
          ...result
        });
      }

      res.render('researches/customer.researches.result.html', { svcInfo, pageInfo, result });
    });
  }

  private getResult = id => {
    return this.apiService.request(API_CMD.BFF_08_0024, { bnnrRsrchId: id }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const result = resp.result[0];

      if (result) {
        const examples: any[] = [],
          totalCount = result.totRpsCnt,
          answer = Number(result.canswNum || 0);
        let i = 1;

        while (result['exCtt' + i]) {
          examples.push({
            content: result['exCtt' + i] || '',
            count: result['rpsCtt' + i + 'Cnt'],
            rate: totalCount === 0 ? 0 : Math.floor((result['rpsCtt' + i + 'Cnt'] / totalCount) * 100),
            isAnswer: answer === i
          });
          i++;
        }

        return {
          ...resp.result,
          staDtm: DateHelper.getShortDate(result.staDtm),
          endDtm: DateHelper.getShortDate(result.endDtm),
          isProceeding: result.endDtm && DateHelper.getDifference(result.endDtm.replace(/\./g, '')) > 0,
          examples,
          totalCount
        };
      } else {
        return result;
      }
    });
  }
}
