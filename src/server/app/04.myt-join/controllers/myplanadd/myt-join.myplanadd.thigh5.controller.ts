/**
 * @file myt-join.myplanadd.thigh5.controller.ts
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2019.05.31
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { MYT_JOIN_THIGH5_PREFERENTIAL } from '../../../../types/string.type';

const DGRADE_PROD_ID: any = [
  'NC00000075',   // 12개월 고금리
  'NC00000077',   // 24개월 고금리
];
const DGRADE_DAY_MAX = 44;

class MyTJoinMyPlanAddTHigh5 extends TwViewController {
  constructor() {
    super();
  }

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this._getAdditionTHigh5().subscribe(result => {
      if (result.code || result.thigh5Yn === 'N') {
        return this.error.render(res, {
          ...result,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      }

      let dGradeDayPercent = parseInt(result.dGradeDay, 10) / DGRADE_DAY_MAX * 100;
      if (dGradeDayPercent < 0) {
        dGradeDayPercent = 0;
      }
      if (dGradeDayPercent > 100) {
        dGradeDayPercent = 100;
      }

      res.render('myplanadd/myt-join.myplanadd.thigh5.html', {
        scrbDt: DateHelper.getShortDate(result.scrbDt),
        joinTermCd: result.joinTermCd === '01' ? 12 : 24,
        preferential: MYT_JOIN_THIGH5_PREFERENTIAL[result.thigh5ProdId] ? MYT_JOIN_THIGH5_PREFERENTIAL[result.thigh5ProdId] : '',
        dGradeYn: DGRADE_PROD_ID.indexOf(result.thigh5ProdId) !== -1 ? 'Y' : 'N',
        dGradeDay: parseInt(result.dGradeDay, 10),
        thigh5HeroYn: result.thigh5HeroYn,
        dGradeDayPercent,
        svcInfo,
        pageInfo
      });
    });
  }

  private _getAdditionTHigh5 = () => {
    return this.apiService.request(API_CMD.BFF_10_0179, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result;
    });
  }
}

export default MyTJoinMyPlanAddTHigh5;
