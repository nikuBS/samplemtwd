/**
 * FileName: myt.benefit.point.adjustment.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { MYT_BENEFIT_POINT_VIEW } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

class MytBenefitPointAdjustmentController extends TwViewController {
  private static ITEM_LENGTH_PER_PAGE: number = 20;
  private static PAGE_SET_LENGTH: number = 5;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const curPage = req.query.curPage || 1;
    Observable.combineLatest(
      this.reqRainbowPointServices(),
      this.reqRainbowPointAdjustments(curPage)
    ).subscribe(([rainbowPointServices, rainbowPointAdjustments]) => {
      if (rainbowPointServices.code !== API_CODE.CODE_00) {
        res.render('error.server-error.html', {
          title: rainbowPointServices.code,
          code: rainbowPointServices.code,
          msg: rainbowPointServices.msg,
          svcInfo: svcInfo
        });
        return;
      }
      if (rainbowPointAdjustments.code !== API_CODE.CODE_00) {
        res.render('error.server-error.html', {
          title: rainbowPointAdjustments.code,
          code: rainbowPointAdjustments.code,
          msg: rainbowPointAdjustments.msg,
          svcInfo: svcInfo
        });
        return;
      }

      const lines = this.getLineWithRainbowPoint(rainbowPointServices);
      const historyResult = this.getRainbowPointHistories(rainbowPointAdjustments);
      const paging = this.getPaging('/myt/benefit/point/adjustment', MytBenefitPointAdjustmentController.ITEM_LENGTH_PER_PAGE,
        MytBenefitPointAdjustmentController.PAGE_SET_LENGTH, curPage, historyResult.totRecCnt);
      // console.log('~~~~~~~~~~~`svcInfo', svcInfo);
      // console.log('~~~~~~~~~~~`lines', lines);
      // console.log('~~~~~~~~~~~`historyResult', historyResult);

      // 단일 회선인 경우 에러 처리
      if ( lines.length < 2 ) {
        res.render(MYT_BENEFIT_POINT_VIEW.ERROR, {
          svcInfo
        });
        return;
      }
      const lineToGive = lines.find(function (line) {
        return line.svcMgmtNum === svcInfo.svcMgmtNum;
      });
      const lineToReceives = lines.filter(function (line) {
        return line.svcMgmtNum !== svcInfo.svcMgmtNum;
      });
      const lineToReceive = lineToReceives[0];
      // console.log('~~~~~~~~~~~`lineToGive', lineToGive);
      // console.log('~~~~~~~~~~~`lineToReceive', lineToReceive);
      // console.log('~~~~~~~~~~~`paging', paging);

      res.render(MYT_BENEFIT_POINT_VIEW.ADJUSTMENT, {
        svcInfo,
        lineToGive,
        lineToReceive,
        lines: JSON.stringify(lines),
        histories: historyResult.history,
        paging
      });
    }, (resp) => {
      res.render('error.server-error.html', {
        title: resp.code,
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
      size: MytBenefitPointAdjustmentController.ITEM_LENGTH_PER_PAGE,
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
    const lines = this.getResult(resp);
    lines.map((line) => {
      line.showPoint = FormatHelper.addComma(line.point);
    });
    return lines;
  }

  private getRainbowPointHistories(resp: any): any {
    const result = this.getResult(resp);
    const histories = result.history;
    histories.map((history) => {
      history.showPoint = FormatHelper.addComma(history.point);
      history.showOpDt = DateHelper.getShortDateNoDot(history.opDt);
    });
    return result;
  }

  private getResult(resp: any): any {
    return resp.result;
  }

  private getPaging(uri: string, itemLengthPerPage: number, pagesetLength: number, curPage: number, total: number): any {
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

}

export default MytBenefitPointAdjustmentController;
