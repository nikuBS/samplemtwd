/**
 * @file common.util.bpcp.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019.03.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';

class CommonUtilBpcp extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const renderCommonInfo = { svcInfo, pageInfo },
      bpcpServiceId = req.query.bpcpServiceId || '',
      eParam = req.query.eParam || '',
      sp = req.query.sp || '';

    if (sp === 'session') {
      res.write('');
      res.end();
      return;
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

        const protocol: any = String(process.env.NODE_ENV) !== 'local' ? 'https://' : 'http://';
        let url: any = bpcpInfo.result.svcUrl.replace(/\s/g, '');

        if (!FormatHelper.isEmpty(bpcpInfo.result.tParam)) {
          url += (bpcpInfo.result.svcUrl.indexOf('?') !== -1 ? '&tParam=' : '?tParam=') + bpcpInfo.result.tParam;
        }

        url += '&ref_poc=' + (BrowserHelper.isApp(req) ? 'app' : 'mweb');
        url += '&ref_origin=' + protocol + req.headers.host;

        res.redirect(url);
      });
  }
}

export default CommonUtilBpcp;
