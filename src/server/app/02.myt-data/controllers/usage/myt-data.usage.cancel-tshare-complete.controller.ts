/**
 * FileName: myt-data.usage.cancel-tshare-complete.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.2.21
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_DATA_USAGE_CANCEL_TSHARE } from '../../../../types/string.type';

class MyTDataUsageCancelTshareComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const date = req.query.date || null;
    let usimNum = req.query.usimNum || null;
    if (FormatHelper.isEmpty(date) || FormatHelper.isEmpty(usimNum)) {
      const option = {
        title: MYT_DATA_USAGE_CANCEL_TSHARE.TITLE,
        msg: '',
        pageInfo,
        svcInfo
      };
      return this.error.render(res, option);
    }
    usimNum = this.convUsimFormat(usimNum);
    res.render('usage/myt-data.usage.cancel-tshare-complete.html', {
      date,
      pageInfo,
      usimNum
    });
  }

  /**
   * 유심 포멧으로 변환
   * @param {string} v
   * @private
   * return {string} ret
   */
  private convUsimFormat(v: any): any {
    if ( !v || v.replace(/-/g).trim().length < 14 ) {
      return v || '';
    }
    let ret = v.replace(/-/g).trim();
    ret = ret.substr(0, 4) + '-' + ret.substr(4, 4) + '-' + ret.substr(8, 4) + '-' + ret.substr(12, 2);
    return ret;
  }

}

export default MyTDataUsageCancelTshareComplete;
