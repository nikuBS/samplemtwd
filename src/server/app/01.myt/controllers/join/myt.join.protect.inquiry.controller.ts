/**
 * FileName: myt.joinService.protect.inquiry.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.25
 *
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff-common.type';


class MytJSProtectInquiryController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.logger.info(this, 'UserInfo: ', svcInfo);

    const data = {
      title: svcInfo.svcAttrCd ? SVC_ATTR[svcInfo.svcAttrCd] : '',
      number: svcInfo.svcNum || '',
      svcInfo: svcInfo
    };

    // 사용자 정보를 읽어와 화면에 표시한다.
    res.render('join/myt.join.protect.inquiry.html', { data });
  }
}

export default MytJSProtectInquiryController;

