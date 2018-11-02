/**
 * FileName: benefit.my-benefit.rainbow-point.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 10. 26.
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { MY_BENEFIT_RAINBOW_POINT } from '../../../../types/string.type';
import DateHelper from '../../../../utils/date.helper';

class BenefitMyBenefitRainbowPointCommon {
  public static MAXIMUM_ITEM_LENGTH: number = 20;
  public static MAXIMUM_LIST_LENGTH: number = 5;

  public static getPaging(uri: string, itemLengthPerPage: number, pagesetLength: number, curPage: number, total: number): any {
    const startNum = (Math.floor((curPage - 1) / pagesetLength) * pagesetLength) + 1;
    const totalPage = Math.ceil((total / itemLengthPerPage));
    const totalPageset = Math.ceil(totalPage / pagesetLength);
    const currentPageset = Math.floor((curPage - 1) / pagesetLength) + 1;
    const endNum = currentPageset < totalPageset ? startNum + pagesetLength - 1 : totalPage;
    const prevPageIdx = currentPageset > 0 ? ((currentPageset - 1) * pagesetLength) : null;
    const nextPageIdx = totalPageset > currentPageset ? (currentPageset * pagesetLength) + 1 : null;
    const needPaging = total > itemLengthPerPage;
    return {
      needPaging,
      uri,
      startNum,
      endNum,
      curPage,
      total,
      prevPageIdx,
      nextPageIdx
    };
  }

  public static getResult(resp: any): any {
    return resp.result;
  }

}

class BenefitMyBenefitRainbowPoint extends TwViewController {
  private _VIEW = {
    DEFAULT: 'my-benefit/benefit.my-benefit.rainbow-point.html',
    ERROR: 'error.server-error.html'
  };
  private _BASE_URL = '/benefit/my-benefit/rainbow-point';

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const curPage = req.query.curPage || 1;
    Observable.combineLatest(
      this.reqRainbowPointsInfo(),
      this.reqRainbowPointHistories(curPage),
      this.reqRainbowPointServices(),
      this.reqRainbowPointFamilies()
    ).subscribe(([respRainbowPointsInfo, respRainbowPointHistories, rainbowPointServices, rainbowPointFamilies]) => {
      const apiError = this.error.apiError([
        respRainbowPointsInfo, respRainbowPointHistories, rainbowPointServices, rainbowPointFamilies
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this._renderError(res, apiError, svcInfo);
      }

      const rainbowPointsInfo = this.getRainbowPointsInfo(respRainbowPointsInfo);
      const rainbowPointHistoryResult = this.getRainbowPointHistoryResult(respRainbowPointHistories);
      const rainbowPointHistories = rainbowPointHistoryResult.history;
      const linesToAdjustment = BenefitMyBenefitRainbowPointCommon.getResult(rainbowPointServices);
      const linesToTransfer = BenefitMyBenefitRainbowPointCommon.getResult(rainbowPointFamilies);

      const isMultiLineToAdjustment = this.isMultiLine(linesToAdjustment);
      const isMultiLineToTransfer = this.isMultiLine(linesToTransfer);

      const paging = BenefitMyBenefitRainbowPointCommon.getPaging(this._BASE_URL,
        BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
        BenefitMyBenefitRainbowPointCommon.MAXIMUM_LIST_LENGTH, curPage, rainbowPointHistoryResult.totRecCnt);

      const options = {
        rainbowPointsInfo,
        rainbowPointHistories,
        isMultiLineToAdjustment,
        isMultiLineToTransfer,
        paging,
        svcInfo,
        pageInfo
      };

      // console.log('~~~~~~~~~~~~~~~~aa', options);

      res.render(this._VIEW.DEFAULT, options);

    }, (resp) => {
      return this._renderError(res, resp, svcInfo);
    });
  }

  private reqRainbowPointsInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0132, {});
  }

  private reqRainbowPointHistories(page: number): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0100, {
      size: BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
      page
    });
  }

  private reqRainbowPointServices(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0101, {});
  }

  private reqRainbowPointFamilies(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0103, {});
  }

  private getRainbowPointsInfo(resp: any): any {
    const rainbowPointsInfo = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    rainbowPointsInfo.usblPoint = FormatHelper.addComma(rainbowPointsInfo.usblPoint);
    rainbowPointsInfo.erndPoint = FormatHelper.addComma(rainbowPointsInfo.erndPoint);
    rainbowPointsInfo.usdPoint = FormatHelper.addComma(rainbowPointsInfo.usdPoint);
    rainbowPointsInfo.exprdPoint = FormatHelper.addComma(rainbowPointsInfo.exprdPoint);
    rainbowPointsInfo.nearlyExprdPoint = FormatHelper.addComma(rainbowPointsInfo.nearlyExprdPoint);
    return rainbowPointsInfo;
  }

  private getRainbowPointHistoryResult(resp: any): any {
    const rainbowPointHistoryResult = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    rainbowPointHistoryResult.history.map((history) => {
      history.opDt = DateHelper.getShortDateNoDot(history.opDt);
      history.point = FormatHelper.addComma(history.point);
      history.point = FormatHelper.addComma(history.point);
      history.opClNm = MY_BENEFIT_RAINBOW_POINT.OLCLCD[history.opClCd];
    });
    return rainbowPointHistoryResult;
  }

  private isMultiLine(lines: any): boolean {
    return lines.length > 1;
  }

  private _renderError(res, err, svcInfo): any {
    return res.render(this._VIEW.ERROR, {
      title: MY_BENEFIT_RAINBOW_POINT.TITLE,
      code: err.code,
      msg: err.msg,
      svcInfo: svcInfo
    });
  }
}

export {
  BenefitMyBenefitRainbowPoint,
  BenefitMyBenefitRainbowPointCommon
};
