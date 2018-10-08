/**
 * FileName: myt-fare.bill.set.change.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.09.18
 * 나의요금 > 요금 안내서 설정 > 안내서 변경
 */
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CODE} from '../../../../types/api-command.type';
import MyTFareBillSetCommon from './myt-fare.bill.set.common.controller';
import {MYT_FARE_BILL_TYPE} from '../../../../types/string.type';

class MyTFareBillSetChange extends MyTFareBillSetCommon {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {

    this.svcInfo = svcInfo;
    Observable.combineLatest(
      // this.mockReqBillType()
      this.reqBillType()
    ).subscribe(([resBillType]) => {
      if ( resBillType.code === API_CODE.CODE_00) {
        let data = resBillType.result;
        data.query = req.query;
        data = this.getData(data, svcInfo);

        res.render( 'bill/myt-fare.bill.set.change.html', data );
      } else {
        this.fail(res, resBillType, svcInfo);
      }
    });
  }

  private getData(data: any, svcInfo: any): any {
    this.makeBillInfo(data);
    this.makeTogetherBill(data);
    this.parseData(data);
    this.makeHpParam(data);

    // 변경할 요금 안내서 유형
    data.changeBillInfo = {
      cd : data.query.billType,
      nm : MYT_FARE_BILL_TYPE[data.query.billType]
    };
    data.lineType = this.getLinetype();

    return {
      svcInfo,
      data
    };
  }

  // 함께 받을 요금 안내서 만들기
  private makeTogetherBill(data: any): void {
    const billType = data.query.billType;
    // 기타(우편) 함께 받는 요금 안내서 없음
    if ( billType === '1' ) {
      return;
    }

    const billArr = new Array();
    const lineType = this.getLinetype();
    this.pushBillInfo(billArr, 'X');

    // T world, Bill Letter
    if ( ['P', 'H'].some( o => o === billType ) ) {
      // 무선 일 때만
      if ( 'M' === lineType ) {
        // 단독 USIM 체크가 Y 일때 (= SMS 수신 가능일때)
        if ( 'Y' === data.isusimchk ) {
          this.pushBillInfo(billArr, 'B');
        }
      }
    }
    // 문자 , Bill Letter
    if ( ['B', 'H'].some( o => o === billType ) ) {
      this.pushBillInfo(billArr, '2');
    }

    if ( billArr.length > 1) {
      data.togetherList = billArr;
    }
  }

  // 핸드폰 번호 입력 파라미터 만들기
  private makeHpParam(data: any): void {
    const lineType = this.getLinetype();
    const param = {
      name : '',
      value : ''
    };
    // 이메일 안내서
    if (data.query.billType === '1') {
      param.name = 'cntcNum1';
      param.value = data.cntcNum1;
    } else if ( lineType === 'S' ) { // 유선회선일 때
      // 빌레터
      if (data.query.billType === 'H') {
        param.name = 'wireSmtBillSvcNum';
        param.value = data.wireSmtBillSvcNum;
      } else if (data.query.billType === 'B') { // 문자
        param.name = 'wsmsBillSndNum';
        param.value = data.wsmsBillSndNum;
      }
    }

    data.hpParam = param;
    // 법정 대리인 휴대폰 번호
    data.deputyHpParam = {
      name : 'ccurNotiSvcNum',
      value : data.ccurNotiSvcNum
    };
  }
}

export default MyTFareBillSetChange;
