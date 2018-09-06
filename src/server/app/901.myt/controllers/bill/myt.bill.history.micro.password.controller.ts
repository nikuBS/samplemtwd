/**
 * FileName: myt.bill.history.micro.password.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.26
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';


class MyTBillHistoryMicroPassword extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const svcNum = FormatHelper.conTelFormatWithDash(svcInfo.svcNum);

    this.apiService.request(API_CMD.BFF_05_0085, {}).subscribe((response) => {

      if (response.code === API_CODE.CODE_00) {
        // cpinStCd: "NC"
        // 소액결제 비밀번호 상태(NC:미설정,AC:설정,LC:잠김,IC:초기화)

        this.logger.info(this, response);
        // const isQueryEmpty: any = FormatHelper.isEmpty(req.query);
        const current: any = req.path.split('/').splice(-1)[0];
        this.logger.info(this, current);

        // const cpinStcd = response.resutl.cpinStCd;
        const cpinStcd = current === 'password' ? 'AC' : 'NC';

        res.render('bill/myt.bill.history.micro.password.html', {
          svcInfo: svcInfo,
          svcNum: svcNum,
          cpinStCd: cpinStcd,
          current: current
        });
      }
    });

  }

}


export default MyTBillHistoryMicroPassword;
