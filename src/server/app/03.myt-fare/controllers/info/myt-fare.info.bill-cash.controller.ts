/**
 * @file [나의요금-현금영수증발급내역_리스트] 관련 처리
 * @author Lee Kirim
 * @since 2018-09-17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';


/**
 * 팁정보 형태 정의
 */
interface TipInfo {
  [key: string]: string;
}

/**
 * 현급영수증 발급내역 리스트 구현
 */
class MyTFareInfoBill extends TwViewController {

  constructor() {
    super();
  }

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
  
    this.apiService.request(API_CMD.BFF_07_0004, {}).subscribe((resp) => {

      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }

      resp.result.map((o) => {
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataAmt = FormatHelper.addComma(o.opAmt);
        o.sortDt = o.opDt;
        o.dataPhoneNumber = FormatHelper.conTelFormatWithDash(o.svcNum);
      });

      resp.result = resp.result.reduce((prev: any[], cur: any, index: number): any[] => {
        cur.listId = index; // 번호
        cur.listDt = cur.dataDt; // 날짜

        // 년도 바뀌면 표기를 위해 yearHeader 속성을 추가해 반환함
        if (prev.length) {
          if (prev.slice(-1)[0].sortDt.slice(0, 4) !== cur.sortDt.slice(0, 4)) {
            cur.yearHeader = cur.sortDt.slice(0, 4);
          }
        }

        prev.push(cur);

        return prev;
      }, []);

      res.render('info/myt-fare.info.bill-cash.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {
          list: resp.result,
          noticeInfo: this.getTipInfo() || []
        }});
    });    
  }

   // 꼭 확인해 주세요 팁 메뉴 정리
   private getTipInfo(): TipInfo[] {
    return [
      {link: 'MF_08_01_02_tip_01', view: 'M000295', title: '현금영수증 발급내역 확인'}
    ];
  }

}

export default MyTFareInfoBill;
