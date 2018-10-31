/**
 * FileName: benefit.my-benefit.rainbow-point.transfer.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { MY_BENEFIT_RAINBOW_POINT_TRANSFER } from '../../../../types/string.type';
import { API_CMD } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { BenefitMyBenefitRainbowPointCommon } from './benefit.my-benefit.rainbow-point.controller';
import { RAINBOW_POINT_REL_CD } from '../../../../types/bff.type';

class BenefitMyBenefitRainbowPointTransfer extends TwViewController {
  private _VIEW = {
    DEFAULT: 'my-benefit/benefit.my-benefit.rainbow-point.transfer.html',
    ERROR: 'error.server-error.html'
  };
  private _BASE_URL = '/benefit/my-benefit/rainbow-point/transfer';

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const curPage = req.query.curPage || 1;
    Observable.combineLatest(
      this.reqRainbowPointFamilies(),
      this.reqRainbowPointTransfers(curPage)
    ).subscribe(([rainbowPointFamilies, rainbowPointTransfers]) => {
      const apiError = this.error.apiError([
        rainbowPointFamilies, rainbowPointTransfers
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this._renderError(res, apiError, svcInfo);
      }

      const lines = this.getLineWithRainbowPoint(rainbowPointFamilies);
      const historyResult = this.getRainbowPointHistories(rainbowPointTransfers);
      const paging = BenefitMyBenefitRainbowPointCommon.getPaging(this._BASE_URL,
        BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
        BenefitMyBenefitRainbowPointCommon.MAXIMUM_LIST_LENGTH, curPage, historyResult.totRecCnt);

      // 법정대리인 정보가 없는 경우 에러 처리
      if ( FormatHelper.isEmpty(lines) ) {
        return this.error.render(res, {
          title: MY_BENEFIT_RAINBOW_POINT_TRANSFER.TITLE,
          msg: MY_BENEFIT_RAINBOW_POINT_TRANSFER.ERROR,
          svcInfo
        });
      }
      const lineToGive = this.getLineWithSvcMgmtNum(svcInfo.svcMgmtNum, lines);
      const linesToReceive = this.getLinesToReceive(svcInfo.svcMgmtNum, lines);
      const lineToReceive = linesToReceive[0];
      const options = {
        svcInfo,
        pageInfo,
        lineToGive,
        lineToReceive,
        lineToGiveData: JSON.stringify(lineToGive),
        linesToReceiveData: JSON.stringify(linesToReceive),
        histories: historyResult.history,
        paging
      };

      res.render(this._VIEW.DEFAULT, options);
    }, (resp) => {
      return this._renderError(res, resp, svcInfo);
    });
  }

  private reqRainbowPointFamilies(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0103, {});
  }

  private reqRainbowPointTransfers(page: number): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0131, {
      size: BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
      page
    });
  }

  private getLineWithRainbowPoint(resp: any): any {
    const lines = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    lines.map((line) => {
      line.showPoint = FormatHelper.addComma(line.point);
      line.showRelNm = line.relCd === RAINBOW_POINT_REL_CD.P ? MY_BENEFIT_RAINBOW_POINT_TRANSFER.REL_NM.P : '';
    });
    return lines;
  }

  private getRainbowPointHistories(resp: any): any {
    const result = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    const histories = result.history;
    histories.map((history) => {
      history.showPoint = FormatHelper.addComma(history.point);
      history.showOpDt = DateHelper.getShortDateNoDot(history.opDt);
    });
    return result;
  }

  private getLineWithSvcMgmtNum(svcMgmtNum: string, lines: any): any {
    return lines.find((line) => {
      return line.svcMgmtNum === svcMgmtNum;
    });
  }

  private getLinesToReceive(svcMgmtNum: string, lines: any): any {
    const isChildLine = this.isChildLine(svcMgmtNum, lines);
    const receiveLineRelCd = isChildLine ? RAINBOW_POINT_REL_CD.P : RAINBOW_POINT_REL_CD.C;
    return lines.filter((line) => {
      return line.relCd === receiveLineRelCd;
    });
  }

  private isChildLine(svcMgmtNum: string, lines: any): any {
    const selectedLine = this.getLineWithSvcMgmtNum(svcMgmtNum, lines);
    return selectedLine.relCd === RAINBOW_POINT_REL_CD.C;
  }

  private _renderError(res, err, svcInfo): any {
    return res.render(this._VIEW.ERROR, {
      title: MY_BENEFIT_RAINBOW_POINT_TRANSFER.TITLE,
      code: err.code,
      msg: err.msg,
      svcInfo
    });
  }

}

export default BenefitMyBenefitRainbowPointTransfer;
