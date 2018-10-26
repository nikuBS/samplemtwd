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

class BenefitMyBenefitRainbowPoint extends TwViewController {
  private _MAXIMUM_ITEM_LENGTH = 20;
  private _MAXIMUM_LIST_LENGTH = 5;
  private _VIEW = {
    DEFAULT: 'my-benefit/benefit.my-benefit.rainbow-point.html',
    ERROR: 'error.server-error.html'
  };
  private _BASE_URL = '/benefit/my-benefit/rainbow-point';

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

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const curPage = req.query.curPage || 1;
    Observable.combineLatest(
      this._reqRainbowPointsInfo(),
      this._reqRainbowPointHistories(curPage)
    ).subscribe(([respRainbowPointsInfo, respRainbowPointHistories]) => {
      const apiError = this.error.apiError([
        respRainbowPointsInfo, respRainbowPointHistories
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this._renderError(res, apiError, svcInfo);
      }

      const rainbowPointsInfo = this._getRainbowPointsInfo(respRainbowPointsInfo);
      const rainbowPointHistoryResult = this._getRainbowPointHistoryResult(respRainbowPointHistories);
      const rainbowPointHistories = rainbowPointHistoryResult.history;

      const paging = BenefitMyBenefitRainbowPoint.getPaging(this._BASE_URL,
        this._MAXIMUM_ITEM_LENGTH,
        this._MAXIMUM_LIST_LENGTH, curPage, rainbowPointHistoryResult.totRecCnt);

      const options = {
        rainbowPointsInfo,
        rainbowPointHistories,
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

  private _reqRainbowPointsInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0132, {});
  }

  private _reqRainbowPointHistories(page: number): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0100, {
      size: this._MAXIMUM_ITEM_LENGTH,
      page
    });
  }

  private _renderError(res, err, svcInfo): any {
    return res.render(this._VIEW.ERROR, {
      title: MY_BENEFIT_RAINBOW_POINT.TITLE,
      code: err.code,
      msg: err.msg,
      svcInfo: svcInfo
    });
  }

  private _getRainbowPointsInfo(resp: any): any {
    const rainbowPointsInfo = this._getResult(resp);
    rainbowPointsInfo.usblPoint = FormatHelper.addComma(rainbowPointsInfo.usblPoint);
    rainbowPointsInfo.erndPoint = FormatHelper.addComma(rainbowPointsInfo.erndPoint);
    rainbowPointsInfo.usdPoint = FormatHelper.addComma(rainbowPointsInfo.usdPoint);
    rainbowPointsInfo.exprdPoint = FormatHelper.addComma(rainbowPointsInfo.exprdPoint);
    rainbowPointsInfo.nearlyExprdPoint = FormatHelper.addComma(rainbowPointsInfo.nearlyExprdPoint);
    return rainbowPointsInfo;
  }

  private _getRainbowPointHistoryResult(resp: any): any {
    const rainbowPointHistoryResult = this._getResult(resp);
    rainbowPointHistoryResult.history.map((history) => {
      history.opDt = DateHelper.getShortDateNoDot(history.opDt);
      history.point = FormatHelper.addComma(history.point);
      history.point = FormatHelper.addComma(history.point);
      history.opClNm = MY_BENEFIT_RAINBOW_POINT.OLCLCD[history.opClCd];
    });
    return rainbowPointHistoryResult;
  }

  private _getResult(resp: any): any {
    return resp.result;
  }
}

export default BenefitMyBenefitRainbowPoint;
