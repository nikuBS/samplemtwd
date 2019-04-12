/**
 * @file [이용안내-사이트_이용방법]
 * @author Lee Kirim
 * @since 2018-12-13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import { CUSTOMER_SITE_OPTION_TYPE} from '../../../../types/string.type';
import EnvHelper from '../../../../utils/env.helper';

/**
 * @class
 * @desc 사이트 이용방법 탭1 내용은 string.type.ts / 탭2 내용은 API 호출로 반환된 값을 사용
 */
class CustomerSvcInfoSite extends TwViewController {
  constructor() {
    super();
  }

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any)  {
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
        TContent: this.modifyHTML(TContent.icntsCtt), // 티월드 콘텐츠(탭2 내용)
        data: CUSTOMER_SITE_OPTION_TYPE // 티월드 이용법 리스트(탭1 내용)
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
      html = html.replace(/<!--(.*?)-->/gmi, '') // 주석제거
        .replace(/{{cdn}}/gi, EnvHelper.getEnvironment('CDN')); // 이미지경로 변경
    return html;
  }

}

export default CustomerSvcInfoSite;
