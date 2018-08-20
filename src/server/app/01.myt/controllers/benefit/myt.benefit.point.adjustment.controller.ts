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
import { PREPAY_TITLE, UNIT } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import axios from 'axios';

class MytBenefitPointAdjustmentController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.reqRainbowPointServices(),
      this.reqRainbowPointAdjustments()
    ).subscribe(([ rainbowPointServices, rainbowPointAdjustments ]) => {
      const lines = this.getLineWithRainbowPoint(rainbowPointServices);
      const histories = this.getRainbowPointHistories(rainbowPointAdjustments);
      console.log('~~~~~~~~~~~`svcInfo', svcInfo);
      console.log('~~~~~~~~~~~`lines', lines);
      console.log('~~~~~~~~~~~`histories', histories);
      // 임시
      svcInfo.svcMgmtNum = '1140524501';

      // 단일 회선인 경우 에러 처리
      if (lines.length < 2) {
        res.render(MYT_BENEFIT_POINT_VIEW.ERROR, {
          svcInfo
        });
        return;
      }
      const lineToGive = lines.find(function(line) {
        return line.svcMgmtNum === svcInfo.svcMgmtNum;
      });
      const lineToReceives = lines.filter(function(line) {
        return line.svcMgmtNum !== svcInfo.svcMgmtNum;
      });
      const lineToReceive = lineToReceives[0];
      console.log('~~~~~~~~~~~`lineToGive', lineToGive);
      console.log('~~~~~~~~~~~`lineToReceive', lineToReceive);

      res.render(MYT_BENEFIT_POINT_VIEW.ADJUSTMENT, {
        svcInfo,
        lineToGive,
        lineToReceive,
        lines: JSON.stringify(lines),
        histories
      });
    }, (resp) => {
      res.render('error.server-error.html', {
        title: '이벤트',
        code: resp.code,
        msg: resp.msg,
        svcInfo: svcInfo
      });
    });
  }

  private reqRainbowPointServices(): Observable<any> {
    // return this.apiService.request(API_CMD.BFF_05_0101, {}).map((res) => {
    //   return res;
    // });
    return Observable.create((observer) => {
      setTimeout(() => {
        const resp = {
          'code': '00',
          'msg': 'success',
          'result': [
            {
              'svcMgmtNum': '1140524501',
              'svcNum': '010-53**-11**',
              'point': '34000'
            },
            {
              'svcMgmtNum': '1567521000',
              'svcNum': '010-62**-22**',
              'point': '1000'
            },
            {
              'svcMgmtNum': '7270451137',
              'svcNum': '010-47**-33**',
              'point': '400'
            }
          ]
        };
        if (resp.code === API_CODE.CODE_00) {
          observer.next(resp);
          observer.complete();
        } else {
          observer.error();
        }
      }, 500);
    });
  }

  private reqRainbowPointAdjustments(): Observable<any> {
    // return this.apiService.request(API_CMD.BFF_05_0130, {}).map((res) => {
    //   return res;
    // });
    return Observable.create((observer) => {
      setTimeout(() => {
        const resp = {
          'code': '00',
          'msg': 'success',
          'result': {
            'totRecCnt': '135',
            'history': [
              {
                'opDt': '20180720',
                'sndrSvcNum': '01011**22**',
                'befrSvcNum': '01033**44**',
                'point': '1000'
              }
            ]
          }
        };
        if (resp.code === API_CODE.CODE_00) {
          observer.next(resp);
          observer.complete();
        } else {
          observer.error();
        }
      }, 500);
    });
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
    return histories;
  }

  private getResult(resp: any): any {
    return resp.result;
  }

}

export default MytBenefitPointAdjustmentController;
