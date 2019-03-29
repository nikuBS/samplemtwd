/**
 * MenuName: 할인/혜택 > 나의 할인 혜택 > 레인보우 포인트 > 포인트 양도
 * FileName: benefit.my-benefit.rainbow-point.transfer.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.30
 * Summary: 레인보우 포인트 포인트 양도 내역 조회
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
    DEFAULT: 'my-benefit/benefit.my-benefit.rainbow-point.transfer.html'
  };
  private _BASE_URL = '/benefit/my/rainbowpoint/transfer';

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
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const lines = this.getLineWithRainbowPointFamilies(rainbowPointFamilies);
      const transfersResult = this.getRainbowPointTransfersResult(rainbowPointTransfers);
      const paging = BenefitMyBenefitRainbowPointCommon.getPaging(this._BASE_URL,
        BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
        BenefitMyBenefitRainbowPointCommon.MAXIMUM_LIST_LENGTH, curPage, transfersResult.totRecCnt);

      // 법정대리인 정보가 없는 경우 에러 처리
      if ( FormatHelper.isEmpty(lines) ) {
        return this.error.render(res, {
          title: MY_BENEFIT_RAINBOW_POINT_TRANSFER.TITLE,
          msg: MY_BENEFIT_RAINBOW_POINT_TRANSFER.ERROR,
          pageInfo: pageInfo,
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
        histories: transfersResult.history,
        paging
      };

      res.render(this._VIEW.DEFAULT, options);
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
    });
  }

  /**
   * 레인보우포인트 양도가능 회선 조회
   * @private
   * return Observable
   */
  private reqRainbowPointFamilies(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0103, {});
  }

  /**
   * 레인보우포인트 양도 내역 조회
   * @private
   * return Observable
   */
  private reqRainbowPointTransfers(page: number): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0131, {
      size: BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
      page
    });
  }

  /**
   * 레인보우포인트 양도가능 회선 데이터 가공 후 반환
   * @private
   * return lines
   */
  private getLineWithRainbowPointFamilies(resp: any): any {
    const lines = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    lines.map((line) => {
      line.showPoint = FormatHelper.addComma(line.point);
      line.showRelNm = line.relCd === RAINBOW_POINT_REL_CD.P ? MY_BENEFIT_RAINBOW_POINT_TRANSFER.REL_NM.P : '';
      line.showSvcNum = FormatHelper.conTelFormatWithDash(line.svcNum);
    });
    return lines;
  }

  /**
   * 레인보우포인트 양도 내역 데이터 가공 후 반환
   * @private
   * return lines
   */
  private getRainbowPointTransfersResult(resp: any): any {
    const result = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    const histories = result.history;
    histories.map((history) => {
      history.showPoint = FormatHelper.addComma(history.point);
      history.showOpDt = DateHelper.getShortDate(history.opDt);
      history.showBefrSvcNum = FormatHelper.conTelFormatWithDash(history.befrSvcNum);
    });
    return result;
  }

  /**
   * svcMgmtNum의 회선 반환
   * @param svcMgmtNum
   * @private
   * return line
   */
  private getLineWithSvcMgmtNum(svcMgmtNum: string, lines: any): any {
    return lines.find((line) => {
      return line.svcMgmtNum === svcMgmtNum;
    });
  }

  /**
   * 포인트 양도 받는 회선 정보 반환
   * @param svcMgmtNum
   * @private
   * return lines
   */
  private getLinesToReceive(svcMgmtNum: string, lines: any): any {
    const isChildLine = this.isChildLine(svcMgmtNum, lines);
    const receiveLineRelCd = isChildLine ? RAINBOW_POINT_REL_CD.P : RAINBOW_POINT_REL_CD.C;
    return lines.filter((line) => {
      return line.relCd === receiveLineRelCd;
    });
  }

  /**
   * 해당 라인이 청소년인지 여부
   * @param svcMgmtNum
   * @private
   * return {Boolean}
   */
  private isChildLine(svcMgmtNum: string, lines: any): any {
    const selectedLine = this.getLineWithSvcMgmtNum(svcMgmtNum, lines);
    return selectedLine.relCd === RAINBOW_POINT_REL_CD.C;
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    return this.error.render(res, {
      title: MY_BENEFIT_RAINBOW_POINT_TRANSFER.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo: pageInfo,
      svcInfo
    });
  }

}

export default BenefitMyBenefitRainbowPointTransfer;
