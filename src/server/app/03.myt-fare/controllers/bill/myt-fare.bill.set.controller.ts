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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this.svcInfo = svcInfo;
    Observable.combineLatest(
      // this.mockReqBillType()
      this.reqBillType()
    ).subscribe(([resBillType]) => {
      if ( resBillType.code === API_CODE.CODE_00) {
        const data = this.getData(resBillType.result, svcInfo);
        res.render( 'bill/myt-fare.bill.set.html', data );
      } else {
        this.fail(res, resBillType, svcInfo);
      }
    });
  }

  private getData(data: any, svcInfo: any): any {
    this.makeBillInfo(data);
    this.makeAnotherBillList(data);
    this.parseTel(data);

    return {
      svcInfo,
      data
    };
  }

  // 하단 > "다른 요금안내서로 받기" 리스트
  private makeAnotherBillList(data: any): void {
    const billList = new Array();

    'P,H,B,2,1'.split(',').forEach( (cd) => {
      // 현재 안내서는 빼기
      if ( cd !== data.billInfo[0].cd ) {
        if ( this.getLinetype() === 'W' && ['H', 'B'].some( e => e === cd ) ) {
          return true;
        }

        this.pushBillInfo(billList, cd);
      }
    });

    data.billList = billList;
  }
}

export default MyTFareBillSet;
