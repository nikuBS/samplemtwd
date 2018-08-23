/**
 * FileName: myt.benefit.rainbow-point.adjustment.controller.ts
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

class MytBenefitRainbowPointCommon {
  public static ITEM_LENGTH_PER_PAGE: number = 20;
  public static PAGE_SET_LENGTH: number = 5;

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

class MytBenefitRainbowPointAdjustmentController extends TwViewController {
  public static VIEW = {
    DEFAULT: 'usage/myt.benefit.rainbow-point.adjustment.html',
    ERROR: 'error/myt.benefit.rainbow-point.adjustment.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const curPage = req.query.curPage || 1;
    Observable.combineLatest(
      this.reqRainbowPointServices(),
      this.reqRainbowPointAdjustments(curPage)
    ).subscribe(([rainbowPointServices, rainbowPointAdjustments]) => {
      const apiError = this.error.apiError([
        rainbowPointServices, rainbowPointAdjustments
      ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return res.render('error.server-error.html', {
          title: MYT_BENEFIT_RAINBOW_POINT.TITLE.ADJUSTMENT,
          code: apiError.code,
          msg: apiError.msg,
          svcInfo: svcInfo
        });
      }

      const lines = this.getLineWithRainbowPoint(rainbowPointServices);
      const historyResult = this.getRainbowPointHistories(rainbowPointAdjustments);
      const paging = MytBenefitRainbowPointCommon.getPaging('/myt/benefit/rainbow-point/adjustment',
        MytBenefitRainbowPointCommon.ITEM_LENGTH_PER_PAGE,
        MytBenefitRainbowPointCommon.PAGE_SET_LENGTH, curPage, historyResult.totRecCnt);

      // 단일 회선인 경우 에러 처리
      if ( lines.length < 2 ) {
        return res.render(MytBenefitRainbowPointAdjustmentController.VIEW.ERROR, {
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

      res.render(MytBenefitRainbowPointAdjustmentController.VIEW.DEFAULT, {
        svcInfo,
        lineToGive,
        lineToReceive,
        lineToGiveData: JSON.stringify(lineToGive),
        linesData: JSON.stringify(lines),
        histories: historyResult.history,
        paging
      });
    }, (resp) => {
      return res.render('error.server-error.html', {
        title: MYT_BENEFIT_RAINBOW_POINT.TITLE.ADJUSTMENT,
        code: resp.code,
        msg: resp.msg,
        svcInfo: svcInfo
      });
    });
  }

  private reqRainbowPointServices(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0101, {});

    // return Observable.create((observer) => {
    //   setTimeout(() => {
    //     const resp = {
    //       'code': '00',
    //       'msg': 'success',
    //       'result': [
    //         {
    //           'svcMgmtNum': '1140524501',
    //           'svcNum': '010-53**-11**',
    //           'point': '34000'
    //         },
    //         {
    //           'svcMgmtNum': '1567521000',
    //           'svcNum': '010-62**-22**',
    //           'point': '1000'
    //         },
    //         {
    //           'svcMgmtNum': '7270451137',
    //           'svcNum': '010-47**-33**',
    //           'point': '400'
    //         }
    //       ]
    //     };
    //     if (resp.code === API_CODE.CODE_00) {
    //       observer.next(resp);
    //       observer.complete();
    //     } else {
    //       observer.error();
    //     }
    //   }, 500);
    // });
  }

  private reqRainbowPointAdjustments(page: number): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0130, {
      size: MytBenefitRainbowPointCommon.ITEM_LENGTH_PER_PAGE,
      page
    });
    // return Observable.create((observer) => {
    //   setTimeout(() => {
    //     const resp = {
    //       'code': '00',
    //       'msg': 'success',
    //       'result': {
    //         'totRecCnt': '63',
    //         'history': [
    //           {
    //             'opDt': '20180817',
    //             'sndrSvcNum': '01089643411',
    //             'befrSvcNum': '01035863411',
    //             'point': '100'
    //           },
    //           {
    //             'opDt': '20180814',
    //             'sndrSvcNum': '01035863411',
    //             'befrSvcNum': '01089643411',
    //             'point': '111'
    //           },
    //           {
    //             'opDt': '20180814',
    //             'sndrSvcNum': '01035863411',
    //             'befrSvcNum': '01094636516',
    //             'point': '2'
    //           },
    //           {
    //             'opDt': '20180814',
    //             'sndrSvcNum': '01089643411',
    //             'befrSvcNum': '01035863411',
    //             'point': '2'
    //           },
    //           {
    //             'opDt': '20180814',
    //             'sndrSvcNum': '01035863411',
    //             'befrSvcNum': '01089643411',
    //             'point': '2'
    //           },
    //           {
    //             'opDt': '20171103',
    //             'sndrSvcNum': '01035863411',
    //             'befrSvcNum': '01089643411',
    //             'point': '1'
    //           }
    //         ]
    //       }
    //     };
    //     if (resp.code === API_CODE.CODE_00) {
    //       observer.next(resp.result);
    //       observer.complete();
    //     } else {
    //       observer.error();
    //     }
    //   }, 500);
    // });
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

}

export {
  MytBenefitRainbowPointAdjustmentController,
  MytBenefitRainbowPointCommon
};
