/**
 * @file customer.svc-info.site.controller.ts
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018.12.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { CUSTOMER_STIE_OPTION_TYPE } from '../../../../types/string.type';
import EnvHelper from '../../../../utils/env.helper';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

class CustomerSvcInfoSite extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any)  {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    this.apiService.request(API_CMD.BFF_08_0064, {}, {}, ['D00003'] ).subscribe(resp => {
      if ( resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo,
          svcInfo
        });
      }
      
      const TContent = resp.result || {};

      res.render('svc-info/customer.svc-info.site.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        TContent: this.modifyHTML(TContent.icntsCtt),
        data: this.setListUp(CUSTOMER_STIE_OPTION_TYPE)
      });
    });
  }

  // 전송된 html 수정 변경
  private modifyHTML = (html: string): string => {
    // 주석제거
    html = html.replace(/<!--(.*?)-->/gmi, '')
    // 이미지경로 변경
    .replace(/{{cdn}}/gi, EnvHelper.getEnvironment('CDN'));
  return html;
};

  private setListUp = (list) => {
    return list.map((o, listIndex) => Object.assign(o, {listIndex}));
  }

}

export default CustomerSvcInfoSite;
