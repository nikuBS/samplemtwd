/**
 * FileName: myt-fare.bill.tpoint.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.7
 * Description: T포인트 요금납부 1회 예약 및 자동납부 관리
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_NAME, MYT_FARE_PAYMENT_TITLE} from '../../../../types/bff.type';
import {SELECT_POINT} from '../../../../types/string.type';
import StringHelper from '../../../../utils/string.helper';

class MyTFareBillTPoint extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getTPoint(), // T포인트 정보 조회
      this.getAutoTPoint() // T포인트 자동납부 예약 여부 조회
    ).subscribe(([tpoint, auto]) => {
      if (tpoint.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.tpoint.html', {
          tpoint: this.parseData(tpoint.result),
          autoInfo: this.getAutoData(auto),
          title: MYT_FARE_PAYMENT_TITLE.TPOINT,
          svcInfo: svcInfo, // 회선 정보 (필수)
          pageInfo: pageInfo // 페이지 정보 (필수)
        });
      } else {
        this.error.render(res, {
          code: tpoint.code,
          msg: tpoint.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }

  /* T포인트 정보 조회 */
  private getTPoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0041, {});
  }

  /* T포인트 자동납부 예약 정보 조회 */
  private getAutoTPoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0051, { ptClCd: 'TPT' });
  }

  /* 데이터 가공 */
  private parseData(data: any): any {
    data.point = FormatHelper.addComma(data.availTPt); // 사용 가능한 T포인트에 콤마(,) 추가
    data.endDate = DateHelper.getNextYearShortDate(); // 자동납부 종료일을 포맷에 맞게 변경

    return data;
  }

  private getAutoData(autoInfo: any): any {
    if (autoInfo.code === API_CODE.CODE_00) {
      return {
        isAuto: autoInfo.result.strRbpStatTxt === MYT_FARE_PAYMENT_NAME.IS_AUTO, // 자동납부 신청인 경우
        endDate: FormatHelper.isEmpty(autoInfo.result.disOcbEffDate) ? DateHelper.getNextYearShortDate()
          : DateHelper.getShortDate(autoInfo.result.disOcbEffDate), // 자동납부 종료일
        ocbTermTodoAmt: FormatHelper.addComma(autoInfo.result.ocbTermTodoAmt), // 자동납부 설정된 포인트에 콤마 (,) 추가
        amtId: FormatHelper.isEmpty(autoInfo.result.ocbTermTodoAmt) ? null : autoInfo.result.ocbTermTodoAmt, // 자동납부 설정된 포인트
        amtText: FormatHelper.isEmpty(autoInfo.result.ocbTermTodoAmt) ? SELECT_POINT.DEFAULT :
          FormatHelper.addComma(autoInfo.result.ocbTermTodoAmt) + 'P' // 자동납부 설정된 포인트에 콤마 (,) 추가
      };
    }
    return null;
  }

}

export default MyTFareBillTPoint;
