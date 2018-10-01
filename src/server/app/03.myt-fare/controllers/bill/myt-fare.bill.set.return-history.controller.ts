/**
 * FileName: myt-fare.bill.set.return-history.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.09.12
 */
import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

class MyTFareBillSetReturnHistory extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    res.render('bill/myt-fare.bill.set.return-history.html', {svcInfo});
    /*Observable.combineLatest(
      this.reqBillType()
    ).subscribe(([resBillType]) => {
      this.logger.debug(this, '## test', resBillType);
      if ( resBillType.code === API_CODE.CODE_00) {
        // const data = this.getData(resBillType.result, svcInfo);
        res.render( 'bill/myt-fare.bill.set.return-history.html', svcInfo );
      } else {
        this.fail(res, resBillType, svcInfo);
      }
    });*/
  }

  private reqBillType(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0039_N, {});
  }

  // API Response fail
  private fail(res: Response, data: any, svcInfo: any): void {
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      svcInfo: svcInfo
    });
  }

}

export default MyTFareBillSetReturnHistory;
