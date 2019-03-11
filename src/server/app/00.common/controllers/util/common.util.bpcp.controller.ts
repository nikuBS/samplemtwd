/**
 * FileName: common.util.bpcp.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.03.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class CommonUtilBpcp extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const renderCommonInfo = { svcInfo, pageInfo, isBpcp: true },
      bpcpServiceId = req.query.bpcpServiceId || '',
      eParam = req.query.eParam || '',
      sp = req.query.sp || '';

    if (sp === 'session') {
      return res.json({ code: '00', msg: 'success' });
    }

    if (FormatHelper.isEmpty(bpcpServiceId)) {
      return this.error.render(res, renderCommonInfo);
    }

    // BPCP에서 사용자 세션을 갱신하고자 왔는데 Node도 사용자 세션이 없다
    if (FormatHelper.isEmpty(svcInfo)) {
      return res.render('util/common.util.bpcp.login.html', {
        bpcpInfo: { bpcpServiceId, eParam },
        target: '/common/util/bpcp?bpcpServiceId=' + bpcpServiceId + '&eParam=' + eParam
      });
    }

    this.apiService.request(API_CMD.BFF_01_0039, { svcMgmtNum: svcInfo.svcMgmtNum, bpcpServiceId, eParam })
      .subscribe((bpcpInfo) => {
        if (bpcpInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: bpcpInfo.code,
            msg: bpcpInfo.msg
          }));
        }

        if (FormatHelper.isEmpty(bpcpInfo.result.svcUrl)) {
          return this.error.render(res, renderCommonInfo);
        }

        res.redirect(bpcpInfo.result.svcUrl + (bpcpInfo.result.svcUrl.indexOf('?') !== -1 ?
          '&tParam=' : '?tParam=') + bpcpInfo.result.svcUrl);
      });
  }
}

export default CommonUtilBpcp;
