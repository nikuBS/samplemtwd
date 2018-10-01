/**
 * FileName: myt-data.family.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.10.01
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTDataFamily extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req)
    };

    switch ( page ) {
      case 'complete':
        res.render('family/myt-data.family.complete.html', responseData);
        break;
      case 'config':
        res.render('family/myt-data.family.config.html', responseData);
        break;
      default:
        const response = Object.assign(responseData, this.getFamilyInfo());
        res.render('family/myt-data.family.main.html', response);
    }
  }

  private getFamilyInfo() {
    const mock = {
      code: '00',
      msg: '',
      result: {
        svcNum: '01062919433',
        svcMgmtNum: '1451646217',
        repYn: 'Y',
        custNm: '한정남',
        freeProdId: 'NA00005958',
        freeProdNm: '패밀리',
        usedAmt: '0',
        ownerYn: 'Y'
      }
    };

    return mock;
  }

}

export default MyTDataFamily;
