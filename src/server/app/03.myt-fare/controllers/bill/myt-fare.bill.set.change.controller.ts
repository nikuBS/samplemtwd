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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    this.svcInfo = svcInfo;
    Observable.combineLatest(
      // this.mockReqBillType()
      this.reqBillType()
    ).subscribe(([resBillType]) => {
      if (resBillType.code === API_CODE.CODE_00) {
        let data = resBillType.result;
        data.query = req.query;
        data = this.getData(data, svcInfo, pageInfo);

        res.render('bill/myt-fare.bill.set.change.html', data);
      } else {
        this.fail(res, resBillType, svcInfo);
      }
    });
  }

  private getData(data: any, svcInfo: any, pageInfo: any): any {
    this.makeBillInfo(data);
    this.makeTogetherBill(data);
    this.parseData(data);
    this.makeHpParam(data);
    this.makeUsageGuideTipId(data);

    // 변경할 요금 안내서 유형
    data.changeBillInfo = {
      cd: data.query.billType,
      nm: MYT_FARE_BILL_TYPE[data.query.billType]
    };
    data.lineType = this.getLinetype();
    data.svcGr = svcInfo.svcGr;

    return {
      svcInfo,
      pageInfo,
      data
    };
  }

  // '요금 안내서 이용안내' TIP ID 생성
  private makeUsageGuideTipId(data: any): void {
    const tipId = {
      'P': 'MF_04_02_tip_01',  // T world
      'H': 'MF_04_02_tip_02',  // Bill Letter
      'B': 'MF_04_02_tip_03',  // 문자
      '2': 'MF_04_02_tip_04',  // 이메일
      '1': 'MF_04_02_tip_05'  // 기타(우편)
    };
    data.tipId = tipId[data.query.billType];
  }

  // 함께 받을 요금 안내서 만들기
  private makeTogetherBill(data: any): void {
    const billType = data.query.billType;
    // 기타(우편) 함께 받는 요금 안내서 없음
    if (billType === '1') {
      return;
    }

    const billArr = new Array();
    const lineType = this.getLinetype();

    this.pushBillInfo(billArr, 'P' === billType ? 'NO' : 'X');

    // 'T world 확인'
    if ('P' === billType) {
      // 무선 이면서 SMS 수신 가능
      if ('M' === lineType && 'Y' === data.isusimchk) {
        this.pushBillInfo(billArr, 'YES');
      } else { // 유선 이거나 SMS 수신불가일때
        data.isNotTogether = true;  // 유선 일때는 '입력하실 정보가 없습니다.'
      }
    } else if ('H' === billType) { // Bill Letter
      // 무선 일 때만
      if ('M' === lineType) {
        this.pushBillInfo(billArr, 'B');
      }
      this.pushBillInfo(billArr, '2');
    } if ('B' === billType) { // 문자
      this.pushBillInfo(billArr, '2');
    }

    if (billArr.length > 1) {
      data.togetherList = billArr;
    }
  }

  // 핸드폰 번호 입력 파라미터 만들기
  private makeHpParam(data: any): void {
    const lineType = this.getLinetype();
    const param = {
      name: '',
      value: ''
    };
    // 기타(우편)
    if (data.query.billType === '1') {
      param.name = 'cntcNum1';
      param.value = data.cntcNum1;
    } else if (lineType === 'S') { // 유선회선일 때
      // 빌레터
      if (data.query.billType === 'H') {
        param.name = 'wireSmtBillSvcNum';
        param.value = data.wireSmtBillSvcNum;
      } else if (data.query.billType === 'B') { // 문자
        param.name = 'wsmsBillSndNum';
        param.value = data.wsmsBillSndNum;
      }
    }
    // "다른 요금안내서로 받기" 인 경우는 핸드폰 번호 공백으로 한다.
    if (data.query.isChangeInfo !== 'Y') {
      param.value = '';
    }

    data.hpParam = param;
    // 법정 대리인 휴대폰 번호
    data.deputyHpParam = {
      name: 'ccurNotiSvcNum',
      value: data.ccurNotiSvcNum
    };
  }
}

export default MyTFareBillSetChange;
