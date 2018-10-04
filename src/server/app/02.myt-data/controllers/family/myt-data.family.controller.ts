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
      case 'setting':
        res.render('family/myt-data.family.setting.html', responseData);
        break;
      default:
        const response = Object.assign(responseData, this.getRemainDataInfo());
        res.render('family/myt-data.family.main.html', response);
    }
  }

  private getRemainDataInfo() {
    const mock = {
      code: '00',
      msg: '',
      result: {
        total: '2048',
        used: '400',
        remained: '1648',
        mbrList: [ {
          svcNum: '01094**04**',
          svcMgmtNum: '7226057315',
          custNm: '조*희',
          repYn: 'Y',
          prodId: 'NA00005959',
          prodNm: 'Data 인피니티',
          used: '0',
          limitedYn: 'N',
          limitation: ''
        } ]
      }
    };

    return mock;
  }

}

export default MyTDataFamily;
