/**
 * FileName: myt.benefit.rainbow-point.transfer.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { MYT_BENEFIT_RAINBOW_POINT } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { MytBenefitRainbowPointCommon } from './myt.benefit.rainbow-point.adjustment.controller';
import { RAINBOW_POINT_REL_CD } from '../../../../types/bff.type';

class MytBenefitRainbowPointTransferController extends TwViewController {
  public static VIEW = {
    DEFAULT: 'usage/myt.benefit.rainbow-point.transfer.html',
    ERROR: 'error/myt.benefit.rainbow-point.transfer.html'
  };

  private LINE_TYPE = {
    GIVE: 1,
    RECEIVE: 2
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const curPage = req.query.curPage || 1;
    Observable.combineLatest(
      this.reqRainbowPointFamilies(),
      this.reqRainbowPointTransfers(curPage)
    ).subscribe(([rainbowPointFamilies, rainbowPointTransfers]) => {
      if ( rainbowPointFamilies.code !== API_CODE.CODE_00 ) {
        res.render('error.server-error.html', {
          title: MYT_BENEFIT_RAINBOW_POINT.TITLE.TRANSFER,
          code: rainbowPointFamilies.code,
          msg: rainbowPointFamilies.msg,
          svcInfo: svcInfo
        });
        return;
      }
      if ( rainbowPointTransfers.code !== API_CODE.CODE_00 ) {
        res.render('error.server-error.html', {
          title: MYT_BENEFIT_RAINBOW_POINT.TITLE.TRANSFER,
          code: rainbowPointTransfers.code,
          msg: rainbowPointTransfers.msg,
          svcInfo: svcInfo
        });
        return;
      }

      const lines = this.getLineWithRainbowPoint(rainbowPointFamilies);
      const historyResult = this.getRainbowPointHistories(rainbowPointTransfers);
      const paging = MytBenefitRainbowPointCommon.getPaging('/myt/benefit/rainbow-point/transfer',
        MytBenefitRainbowPointCommon.ITEM_LENGTH_PER_PAGE,
        MytBenefitRainbowPointCommon.PAGE_SET_LENGTH, curPage, historyResult.totRecCnt);

      // 법정대리인 정보가 없는 경우 에러 처리
      if ( FormatHelper.isEmpty(lines) ) {
        res.render(MytBenefitRainbowPointTransferController.VIEW.ERROR, {
          svcInfo
        });
        return;
      }
      const linesToGive = this.getLines(svcInfo.svcMgmtNum, lines, this.LINE_TYPE.GIVE);
      const linesToReceive = this.getLines(svcInfo.svcMgmtNum, lines, this.LINE_TYPE.RECEIVE);
      const lineToGive = linesToGive[0];
      const lineToReceive = linesToReceive[0];

      console.log('~~~~~~~~linesToGive', linesToGive);
      console.log('~~~~~~~~linesToReceive', linesToReceive);

      res.render(MytBenefitRainbowPointTransferController.VIEW.DEFAULT, {
        svcInfo,
        lineToGive,
        lineToReceive,
        linesToGive: JSON.stringify(linesToGive),
        linesToReceive: JSON.stringify(linesToReceive),
        histories: historyResult.history,
        paging
      });
    }, (resp) => {
      res.render('error.server-error.html', {
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
      size: MytBenefitRainbowPointCommon.ITEM_LENGTH_PER_PAGE,
      page
    });
  }

  private getLineWithRainbowPoint(resp: any): any {
    const lines = MytBenefitRainbowPointCommon.getResult(resp);
    lines.map((line) => {
      line.showPoint = FormatHelper.addComma(line.point);
    });
    return lines;
  }

  private getRainbowPointHistories(resp: any): any {
    const result = MytBenefitRainbowPointCommon.getResult(resp);
    const histories = result.history;
    histories.map((history) => {
      history.showPoint = FormatHelper.addComma(history.point);
      history.showOpDt = DateHelper.getShortDateNoDot(history.opDt);
    });
    return result;
  }

  private getLines(svcMgmtNum: string, lines: any, _lineType: number): any {
    const isChild = this.isChild(svcMgmtNum, lines);
    let lineType;
    switch ( _lineType ) {
      case this.LINE_TYPE.GIVE:
        lineType = (isChild) ? RAINBOW_POINT_REL_CD.C : RAINBOW_POINT_REL_CD.P;
        break;
      case this.LINE_TYPE.RECEIVE:
        lineType = (isChild) ? RAINBOW_POINT_REL_CD.P : RAINBOW_POINT_REL_CD.C;
        break;
    }
    return lines.filter((line) => {
      return line.relCd === lineType;
    });
  }

  private isChild(svcMgmtNum: string, lines: any): any {
    const selectedLine = lines.find((line) => {
      return line.svcMgmtNum === svcMgmtNum;
    });
    return selectedLine.relCd === RAINBOW_POINT_REL_CD.C;
  }

}

export default MytBenefitRainbowPointTransferController;
