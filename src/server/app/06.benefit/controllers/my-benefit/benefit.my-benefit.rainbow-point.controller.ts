/**
 * MenuName: 할인/혜택 > 나의 할인 혜택 > 레인보우 포인트
 * @file benefit.my-benefit.rainbow-point.controller.ts
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018. 10. 26.
 * Summary: 레인보우 포인트 정보 조회
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { MY_BENEFIT_RAINBOW_POINT } from '../../../../types/string.type';
import DateHelper from '../../../../utils/date.helper';

class BenefitMyBenefitRainbowPointCommon {
  public static MAXIMUM_ITEM_LENGTH: number = 1000;   // 최대 1000건의 이력까지 노출해주도록 임의 처리 (최대 노출이력 건수 늘려야할 소요 있을지?)
  // public static MAXIMUM_LIST_LENGTH: number = 5;   // 페이징 -> 더보기 방식 변경에 따른 미사용

  // 페이징 -> 더보기 방식 변경에 따른 미사용
  // public static getPaging(uri: string, itemLengthPerPage: number, pagesetLength: number, curPage: number, total: number): any {
  //   const startNum = (Math.floor((curPage - 1) / pagesetLength) * pagesetLength) + 1;
  //   const totalPage = Math.ceil((total / itemLengthPerPage));
  //   const totalPageset = Math.ceil(totalPage / pagesetLength);
  //   const currentPageset = Math.floor((curPage - 1) / pagesetLength) + 1;
  //   const endNum = currentPageset < totalPageset ? startNum + pagesetLength - 1 : totalPage;
  //   const prevPageIdx = currentPageset > 0 ? ((currentPageset - 1) * pagesetLength) : null;
  //   const nextPageIdx = totalPageset > currentPageset ? (currentPageset * pagesetLength) + 1 : null;
  //   const needPaging = total > itemLengthPerPage;
  //   return {
  //     needPaging,
  //     uri,
  //     startNum,
  //     endNum,
  //     curPage,
  //     total,
  //     prevPageIdx,
  //     nextPageIdx
  //   };
  // }

  public static getResult(resp: any): any {
    return resp.result;
  }

}

class BenefitMyBenefitRainbowPoint extends TwViewController {
  private _VIEW = {
    DEFAULT: 'my-benefit/benefit.my-benefit.rainbow-point.html'
  };
  private _BASE_URL = '/benefit/my/rainbowpoint';

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
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const rainbowPointsInfo = this.getRainbowPointsInfo(respRainbowPointsInfo);
      const rainbowPointHistoryResult = this.getRainbowPointHistoryResult(respRainbowPointHistories);
      const rainbowPointHistories = rainbowPointHistoryResult.history;
      const linesToAdjustment = BenefitMyBenefitRainbowPointCommon.getResult(rainbowPointServices);
      const linesToTransfer = BenefitMyBenefitRainbowPointCommon.getResult(rainbowPointFamilies);

      const isMultiLineToAdjustment = this.isMultiLine(linesToAdjustment);
      const isMultiLineToTransfer = this.isMultiLine(linesToTransfer);

      // 페이징 -> 더보기 방식 변경에 따른 미사용
      // const paging = BenefitMyBenefitRainbowPointCommon.getPaging(this._BASE_URL,
      //   BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
      //   BenefitMyBenefitRainbowPointCommon.MAXIMUM_LIST_LENGTH, curPage, rainbowPointHistoryResult.totRecCnt);

      const options = {
        rainbowPointsInfo,
        rainbowPointHistories,
        isMultiLineToAdjustment,
        isMultiLineToTransfer,
        // paging,  // 페이징 -> 더보기 방식 변경에 따른 미사용
        svcInfo,
        pageInfo
      };

      // console.log('~~~~~~~~~~~~~~~~aa', options);

      res.render(this._VIEW.DEFAULT, options);

    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
    });
  }

  /**
   * 레인보우포인트 정보 조회
   * @private
   * return Observable
   */
  private reqRainbowPointsInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0132, {});
  }

  /**
   * 레인보우포인트 이용내역 조회
   * @private
   * return Observable
   */
  private reqRainbowPointHistories(page: number): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0100, {
      size: BenefitMyBenefitRainbowPointCommon.MAXIMUM_ITEM_LENGTH,
      page
    });
  }

  /**
   * 레인보우포인트 동일명의 회선 조회
   * @private
   * return Observable
   */
  private reqRainbowPointServices(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0101, {});
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
   * 레인보우포인트 정보 조회 데이터 가공 후 반환
   * @param resp
   * @private
   * return rainbowPointsInfo{Object}
   */
  private getRainbowPointsInfo(resp: any): any {
    const rainbowPointsInfo = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    rainbowPointsInfo.usblPoint = FormatHelper.addComma(rainbowPointsInfo.usblPoint);
    rainbowPointsInfo.erndPoint = FormatHelper.addComma(rainbowPointsInfo.erndPoint);
    rainbowPointsInfo.usdPoint = FormatHelper.addComma(rainbowPointsInfo.usdPoint);
    rainbowPointsInfo.exprdPoint = FormatHelper.addComma(rainbowPointsInfo.exprdPoint);
    rainbowPointsInfo.nearlyExprdPoint = FormatHelper.addComma(rainbowPointsInfo.nearlyExprdPoint);
    return rainbowPointsInfo;
  }

  /**
   * 레인보우포인트 이용내역 조회 데이터 가공 후 반환
   * @param resp
   * @private
   * return rainbowPointsInfo{Object}
   */
  private getRainbowPointHistoryResult(resp: any): any {
    const rainbowPointHistoryResult = BenefitMyBenefitRainbowPointCommon.getResult(resp);
    rainbowPointHistoryResult.history.map((history) => {
      history.opDt = DateHelper.getShortDate(history.opDt);
      history.point = FormatHelper.addComma(history.point);
      history.point = FormatHelper.addComma(history.point);
      history.opClNm = MY_BENEFIT_RAINBOW_POINT.OLCLCD[history.opClCd];
    });
    return rainbowPointHistoryResult;
  }

  /**
   * 복수회선 여부 판단
   * @param lines
   * @private
   * return {Boolean}
   */
  private isMultiLine(lines: any): boolean {
    return lines.length > 1;
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    return this.error.render(res, {
      title: MY_BENEFIT_RAINBOW_POINT.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export {
  BenefitMyBenefitRainbowPoint,
  BenefitMyBenefitRainbowPointCommon
};
