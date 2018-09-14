/**
 * FileName: myt.benefit.rainbow-point.transfer.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { MYT_BENEFIT_RAINBOW_POINT } from '../../../../types/string.old.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { MyTBenefitRainbowPointCommon } from './myt.benefit.rainbow-point.adjustment.controller';
import { RAINBOW_POINT_REL_CD } from '../../../../types/bff.old.type';

class MyTBenefitRainbowPointTransfer extends TwViewController {
  public static VIEW = {
    DEFAULT: 'usage/myt.benefit.rainbow-point.transfer.html',
    ERROR: 'error/myt.benefit.rainbow-point.transfer.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const curPage = req.query.curPage || 1;
    Observable.combineLatest(
      this.reqRainbowPointFamilies(),
      this.reqRainbowPointTransfers(curPage)
    ).subscribe(([rainbowPointFamilies, rainbowPointTransfers]) => {
      const apiError = this.error.apiError([
        rainbowPointFamilies, rainbowPointTransfers
      ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return res.render('error.server-error.html', {
          title: MYT_BENEFIT_RAINBOW_POINT.TITLE.TRANSFER,
          code: apiError.code,
          msg: apiError.msg,
          svcInfo: svcInfo
        });
      }

      const lines = this.getLineWithRainbowPoint(rainbowPointFamilies);
      const historyResult = this.getRainbowPointHistories(rainbowPointTransfers);
      const paging = MyTBenefitRainbowPointCommon.getPaging('/myt/benefit/rainbow-point/transfer',
        MyTBenefitRainbowPointCommon.ITEM_LENGTH_PER_PAGE,
        MyTBenefitRainbowPointCommon.PAGE_SET_LENGTH, curPage, historyResult.totRecCnt);

      // 법정대리인 정보가 없는 경우 에러 처리
      if ( FormatHelper.isEmpty(lines) ) {
        return res.render(MyTBenefitRainbowPointTransfer.VIEW.ERROR, {
          svcInfo
        });
      }
      const lineToGive = this.getLineWithSvcMgmtNum(svcInfo.svcMgmtNum, lines);
      const linesToReceive = this.getLinesToReceive(svcInfo.svcMgmtNum, lines);
      const lineToReceive = linesToReceive[0];

      res.render(MyTBenefitRainbowPointTransfer.VIEW.DEFAULT, {
        svcInfo,
        lineToGive,
        lineToReceive,
        lineToGiveData: JSON.stringify(lineToGive),
        linesToReceiveData: JSON.stringify(linesToReceive),
        histories: historyResult.history,
        paging
      });
    }, (resp) => {
      return res.render('error.server-error.html', {
        title: MYT_BENEFIT_RAINBOW_POINT.TITLE.TRANSFER,
        code: resp.code,
        msg: resp.msg,
        svcInfo: svcInfo
      });
    });
  }

  private reqRainbowPointFamilies(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0103, {});
  }

  private reqRainbowPointTransfers(page: number): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0131, {
      size: MyTBenefitRainbowPointCommon.ITEM_LENGTH_PER_PAGE,
      page
    });
  }

  private getLineWithRainbowPoint(resp: any): any {
    const lines = MyTBenefitRainbowPointCommon.getResult(resp);
    lines.map((line) => {
      line.showPoint = FormatHelper.addComma(line.point);
      line.showRelNm = line.relCd === RAINBOW_POINT_REL_CD.P ? MYT_BENEFIT_RAINBOW_POINT.REL_NM.P : '';
    });
    return lines;
  }

  private getRainbowPointHistories(resp: any): any {
    const result = MyTBenefitRainbowPointCommon.getResult(resp);
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

}

export default MyTBenefitRainbowPointTransfer;
