/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.
 *
 */

/**
 * FileName: myt.joinService.protect.change.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.25
 *
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff-common.type';


class MytJSProtectChangeController extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.logger.info(this, 'UserInfo ', svcInfo);
    const data = {
      svcInfo: svcInfo
    };

    // this.apiService.request('', {}).subscribe((responseData) => {
    // 화면 데이터 설정
    // const data = self.convertData(responseData);
    res.render('usage/myt.usage.pattern.html', { data });
    // });
  }
}

export default MytJSProtectChangeController;

