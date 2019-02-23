/**
 * FileName: benefit.my-benefit.rainbow-point.adjustment.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { BenefitMyBenefitRainbowPointCommon } from './benefit.my-benefit.rainbow-point.controller';
import { MY_BENEFIT_RAINBOW_POINT_ADJUSTMENT } from '../../../../types/string.type';

class BenefitMyBenefitRainbowPointAdjustment extends TwViewController {
  private _VIEW = {
    DEFAULT: 'my-benefit/benefit.my-benefit.rainbow-point.adjustment.html'
  };
  private _BASE_URL = '/benefit/my/rainbowpoint/adjustment';

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const curPage = req.query.curPage || 1;
    Observable.combineLatest(
      this.reqRainbowPointServices(),
      this.reqRainbowPointAdjustments(curPage)
    ).subscribe(([rainbowPointServices, rainbowPointAdjustments]) => {
      const apiError = this.error.apiError([
        rainbowPointServices, rainbowPointAdjustments
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const lines = this.getLineWithRainbowPoint(rainbowPointServices);
      const historyResult = this.getRainbowPointHistories(rainbowPointAdjustments);
      const paging = BenefitMyBenefitRainbowPointCommon.getPaging(this._BASE_URL,
        BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
        BenefitMyBenefitRainbowPointCommon.MAXIMUM_LIST_LENGTH, curPage, historyResult.totRecCnt);

      // 단일 회선인 경우 에러 처리
      if ( lines.length < 2 ) {
        return this.error.render(res, {
          title: MY_BENEFIT_RAINBOW_POINT_ADJUSTMENT.TITLE,
          msg: MY_BENEFIT_RAINBOW_POINT_ADJUSTMENT.ERROR,
          pageInfo: pageInfo,
          svcInfo
        });
      }
      const lineToGive = lines.find(function (line) {
        return line.svcMgmtNum === svcInfo.svcMgmtNum;
      });
      const lineToReceives = lines.filter(function (line) {
        return line.svcMgmtNum !== svcInfo.svcMgmtNum;
      });
      const lineToReceive = lineToReceives[0];
      const options = {
        svcInfo,
        pageInfo,
        lineToGive,
        lineToReceive,
        lineToGiveData: JSON.stringify(lineToGive),
        linesData: JSON.stringify(lines),
        histories: historyResult.history,
        paging
      };

      res.render(this._VIEW.DEFAULT, options);
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
    });
  }

  private reqRainbowPointServices(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0101, {});
  }

  private reqRainbowPointAdjustments(page: number): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0130, {
      size: BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
      page
    });
  }

  private getLineWithRainbowPoint(resp: any): any {
    const lines = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    lines.map((line) => {
      line.showPoint = FormatHelper.addComma(line.point);
      line.showSvcNum = FormatHelper.conTelFormatWithDash(line.svcNum);
    });
    return lines;
  }

  private getRainbowPointHistories(resp: any): any {
    const result = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    const histories = result.history;
    histories.map((history) => {
      history.showPoint = FormatHelper.addComma(history.point);
      history.showOpDt = DateHelper.getShortDate(history.opDt);
      history.showSndrSvcNum = FormatHelper.conTelFormatWithDash(history.sndrSvcNum);
      history.showBefrSvcNum = FormatHelper.conTelFormatWithDash(history.befrSvcNum);
    });
    return result;
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    return this.error.render(res, {
      title: MY_BENEFIT_RAINBOW_POINT_ADJUSTMENT.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo: pageInfo,
      svcInfo
    });
  }

}

export default BenefitMyBenefitRainbowPointAdjustment;
