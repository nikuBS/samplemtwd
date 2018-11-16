/**
 * FileName: myt-fare.bill.set.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.09.12
 */
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MyTBillSetData} from '../../../../mock/server/myt.fare.bill.set.mock';
import MyTFareBillSetCommon from './myt-fare.bill.set.common.controller';

class MyTFareBillSet extends MyTFareBillSetCommon {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string, pageInfo: any) {
    this.svcInfo = svcInfo;
    Observable.combineLatest(
      // this.mockReqBillType()
      this.reqBillType()
    ).subscribe(([resBillType]) => {
      if (resBillType.code === API_CODE.CODE_00) {
        const data = this.getData(resBillType.result, svcInfo, pageInfo);
        res.render('bill/myt-fare.bill.set.html', data);
      } else {
        this.fail(res, resBillType, svcInfo);
      }
    });
  }

  private getData(data: any, svcInfo: any, pageInfo: any): any {
    this.makeBillInfo(data);
    this.makeAnotherBillList(data);
    this.parseTel(data);
    this.makeOptions(data);

    return {
      svcInfo,
      pageInfo,
      data
    };
  }

  // 설정한 옵션 생성
  private makeOptions(data: any): void {
    const billType = data.billInfo[0].cd;
    const mergeType = billType + data.billInfo[1].cd;
    const lineType = this.getLinetype();

    const options = new Array();

    // Bill Letter  보안강화 (안내서 유형이 Bill Letter 포함일때)
    if ('H' === billType && data.scurBillYn === 'Y') {
      options.push('1');
    }
    // 휴대폰 번호 전체 표시 여부
    if ((mergeType !== 'HX' && mergeType !== 'HB') && data.phonNumPrtClCd === 'Y') {
      if (mergeType === 'BX') {
        if (lineType === 'S') {
          options.push('2');
        }
      } else {
        options.push('2');
      }
    }

    // 회선이 무선,와이브로 일때
    if (lineType === 'M' || lineType === 'W') {
      // 콘텐츠 이용 상세내역 표시
      if (billType === '2' && data.infoInvDtlDispYn === 'Y') {
        options.push('3');
      }
      // 회선이 무선 일때
      if (lineType === 'M') {
        // 콘텐츠 이용 상세내역 표시
        if (['H2', 'B2'].indexOf(mergeType) > -1 && data.infoInvDtlDispYn === 'Y') {
          options.push('3');
        }

        // 법정 대리인 함께 수령
        if (['HX', 'H2', 'BX', 'B2'].indexOf(mergeType) > -1 && data.ccurNotiYn === 'Y') {
          if (data.kidsYn === 'Y') {
            options.push('4');
          }
        }
      }
    }

    data.options = options;
  }

  // 하단 > "다른 요금안내서로 받기" 리스트
  private makeAnotherBillList(data: any): void {
    const billList = new Array();

    'P,H,B,2,1'.split(',').forEach((cd) => {
      // 현재 안내서는 빼기
      if (cd !== data.billInfo[0].cd) {
        if (this.getLinetype() === 'W' && ['H', 'B'].some(e => e === cd)) {
          return true;
        }

        this.pushBillInfo(billList, cd);
      }
    });

    data.billList = billList;
  }
}

export default MyTFareBillSet;
