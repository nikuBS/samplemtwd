/**
 * @file [이용안내-사이트이용방법-m고객센터]
 * @author Lee Kirim
 * @since 2018-12-18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { URL_APP_STORE } from '../../../../types/outlink.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import EnvHelper from '../../../../utils/env.helper';


class CustomerSvcInfoMcenter extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any)  {
    this.apiService.request(API_CMD.BFF_08_0064, {}, {}, ['D00004'] ).subscribe(resp => {
      if ( resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo,
          svcInfo
        });
      }

      res.render('svc-info/customer.svc-info.site.mcenter.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        tWorldAppStoreURL: URL_APP_STORE['AOS'], // 임시로 AOS URL로 고정(현재 빈값)
        contentHTML: this.modifyHTML(resp.result['icntsCtt']),
        data: {}
      });

    });
  }

  /**
   * @function
   * @desc 문자열로 전달된 html 문자중 주석 제거, {{cdn}} 을 이미지 경로로 교체
   * @param {string} html 
   * @return {string} 
   */
  private modifyHTML = (html: string): string => {
    // 주석제거
    html = html.replace(/<!--(.*?)-->/gmi, '')
    // 이미지경로 변경
    .replace(/{{cdn}}/gi, EnvHelper.getEnvironment('CDN'));
  return html;
}

}

export default CustomerSvcInfoMcenter;
