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
import { DATA_UNIT } from '../../../../types/string.old.type';

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
        const response = Object.assign(responseData, { familyInfo: this.getRemainDataInfo() });
        res.render('family/myt-data.family.main.html', response);
    }
  }

  private getRemainDataInfo() {
    const data = {
      code: '00',
      msg: '',
      result: {
        total: '2048',
        used: '400',
        remained: '1648',
        mbrList: [{
          svcNum: '01094**04**',
          svcMgmtNum: '7226057315',
          custNm: '조*희',
          repYn: 'Y',
          prodId: 'NA00005959',
          prodNm: 'Data 인피니티',
          used: '0',
          limitedYn: 'N',
          limitation: ''
        }, {
          svcNum: '01012**34**',
          svcMgmtNum: '7226057315',
          custNm: '박*수',
          repYn: 'N',
          prodId: 'NA00005959',
          prodNm: 'ting 요금제',
          used: '0',
          limitedYn: 'Y',
          limitation: '300'
        }]
      }
    };

    let result = data.result;

    result = Object.assign(result, {
      total: this.convertTFamilyDataSet(result.total),
      used: this.convertTFamilyDataSet(result.used),
      remained: this.convertTFamilyDataSet(result.remained)
    });

    return result;
  }

  private convertTFamilyDataSet(sQty) {
    return FormatHelper.convDataFormat(sQty, DATA_UNIT.MB);
  }
}

export default MyTDataFamily;
