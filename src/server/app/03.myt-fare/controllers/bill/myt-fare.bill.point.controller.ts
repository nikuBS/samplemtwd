/**
 * @file myt-fare.bill.point.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.09.18
 * Description: 포인트 요금납부
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_FARE_PAYMENT_TITLE, SVC_ATTR_NAME, SVC_CD} from '../../../../types/bff.type';
import BrowserHelper from '../../../../utils/browser.helper';

class MyTFareBillPoint extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const data = {
      title: MYT_FARE_PAYMENT_TITLE.OKCASHBAG,
      svcInfo: svcInfo, // 회선정보 (필수 데이터)
      pageInfo: pageInfo // 페이지정보 (필수 데이터)
    };

    if (BrowserHelper.isApp(req)) { // 앱 환경 여부 체크
      this.getUnpaidList().subscribe((unpaidList) => { // 미납요금 대상자 조회
        if (unpaidList.code === API_CODE.CODE_00) {
          res.render('bill/myt-fare.bill.point.html', {
            ...data,
            unpaidList: this.parseData(unpaidList.result, svcInfo, allSvc)
          });
        } else {
          this.error.render(res, {
            code: unpaidList.code, msg: unpaidList.msg, pageInfo: pageInfo, svcInfo: svcInfo
          });
        }
      });
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      }); // 앱이 아닐 경우 앱 설치 유도 페이지로 이동
    }
  }

  /* 미납요금 대상자 조회 */
  private getUnpaidList(): any {
    return this.apiService.request(API_CMD.BFF_07_0021, {}).map((res) => {
      return res;
    });
  }

  /* 데이터 정보 가공 */
  private parseData(result: any, svcInfo: any, allSvc: any): any {
    const list = result.settleUnPaidList; // 미납리스트
    if (!FormatHelper.isEmpty(list)) {
      list.cnt = result.recCnt;
      list.invDt = '';
      list.defaultIndex = 0;

      /* list 갯수만큼 loop */
      list.map((data, index) => {
        data.invYearMonth = DateHelper.getShortDateWithFormat(data.invDt, 'YYYY.M.'); // 서버에서 내려오는 날짜를 YYYY.M. 포맷에 맞게 변경 */
        data.intMoney = this.removeZero(data.colAmt); // 금액 앞에 불필요하게 붙는 0 제거
        data.invMoney = FormatHelper.addComma(data.intMoney); // 금액에 콤마(,) 추가
        data.svcName = SVC_CD[data.svcCd]; // 서비스명 (모바일/인터넷...)
        data.svcNumber = data.svcCd === 'I' || data.svcCd === 'T' ? this.getAddr(data.svcMgmtNum, allSvc) :
          FormatHelper.conTelFormatWithDash(data.svcNum); // 서비스코드가 I나 T(인터넷/집전화 등)일 경우 주소 보여주고, M(모바일)일 경우 '-' 추가

        // 대표회선이고 청구날짜가 최근인 경우 가장 앞에 노출
        if (svcInfo.svcMgmtNum === data.svcMgmtNum && data.invDt > list.invDt) {
          list.invDt = data.invDt;
          list.defaultIndex = index;
        }
      });
    }
    return list;
  }

  /* 금액정보에서 앞자리 0 제거하는 method */
  private removeZero(input: string): string {
    let isNotZero = false;
    for (let i = 0; i < input.length; i++) {
      if (!isNotZero) {
        if (input[i] !== '0') {
          input = input.substr(i, input.length - i);
          isNotZero = true;
        }
      }
    }
    return input;
  }

  private getAddr(svcMgmtNum: any, allSvc: any): any {
    const serviceArray = allSvc.s; // 인터넷 회선
    let addr = '';

    serviceArray.map((data) => {
      if (data.svcMgmtNum === svcMgmtNum) {
        addr = data.addr; // 인터넷 회선 보유 시 주소 노출
      }
    });

    return addr;
  }

}

export default MyTFareBillPoint;
