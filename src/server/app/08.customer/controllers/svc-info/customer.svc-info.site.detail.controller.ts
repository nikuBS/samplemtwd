/**
 * @file customer.svc-info.site.controller.ts
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018.12.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import EnvHelper from '../../../../utils/env.helper';
import { CUSTOMER_STIE_OPTION_TYPE } from '../../../../types/string.type';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

interface Content {
  cat: string;
  title: string;
  code: string;
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
    const {code} = req.query; 
    const curContent = this.findCurContent(code);

    if (FormatHelper.isEmpty(curContent)) {
      return res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
    }

    this.apiService.request(API_CMD.BFF_08_0064, {}, {}, [code]).subscribe(resp => {
      if ( resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo,
          svcInfo
        });
      }

      res.render('svc-info/customer.svc-info.site.detail.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        contentHTML: this.modifyHTML(resp.result.icntsCtt),
        data: {
          // type: code === 'D00007' ? 'A' : 'B',  // 가려진 타입 예외 하나만 적용
          title: curContent.title
        }
      });
    });
  }

  private findCurContent = (code: string): Content | any => {
    return CUSTOMER_STIE_OPTION_TYPE.reduce((prev, cur) => {
      if (cur.code === code) {
        return cur;
      } else {
        return prev;
      }
    }, {});
  }

  // 전송된 html 수정 변경
  private modifyHTML = (html: string): string => {
      // 대문자 엘리먼트 소문자로
      // html = html.replace(/<\/?[A-Z]+/gm, (s: string) => s.replace(/[A-Z]+/gi, (i: string) => i.toLowerCase()))
      // 주석제거
      html = html.replace(/<!--(.*?)-->/gmi, '')
      // 이미지경로 변경
      .replace(/{{cdn}}/gi, EnvHelper.getEnvironment('CDN'));
    return html;
  }
}

export default CustomerSvcInfoSite;
