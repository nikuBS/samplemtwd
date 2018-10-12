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
import { BFF_06_0044_familyInfo, BFF_06_0045_ImmediatelyInfo, BFF_06_0047_MonthlyInfo } from '../../../../mock/server/myt.data.family.mock';

class MyTDataFamily extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const page = req.params.page;
    let responseData: any = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req)
    };

    switch (page) {
      case 'complete':
        res.render('family/myt-data.family.complete.html', {
          ...responseData,
          query: req.query
        });
        break;
      case 'setting':
        responseData = {
          ...responseData,
          immediatelyInfo: this.getImmediatelyInfo(),
          monthlyInfo: this.getMonthlyInfo()
        };

        res.render('family/myt-data.family.setting.html', responseData);
        break;
      default:
        responseData = {
          ...responseData,
          familyInfo: this.getRemainDataInfo()
        };

        res.render('family/myt-data.family.main.html', responseData);
    }
  }

  private getRemainDataInfo() {
    const result = BFF_06_0044_familyInfo.result;

    const representation = result.mbrList.find(member => member.repYn === 'Y');

    return {
      ...result,
      total: this.convertTFamilyDataSet(result.total),
      used: this.convertTFamilyDataSet(result.used),
      remained: this.convertTFamilyDataSet(result.remained),
      representation: representation ? representation.svcMgmtNum : ''
    };
  }

  private getImmediatelyInfo() {
    return BFF_06_0045_ImmediatelyInfo.result;
  }

  private getMonthlyInfo() {
    return BFF_06_0047_MonthlyInfo.result;
  }

  private convertTFamilyDataSet(sQty) {
    return FormatHelper.convDataFormat(sQty, DATA_UNIT.MB);
  }
}

export default MyTDataFamily;
