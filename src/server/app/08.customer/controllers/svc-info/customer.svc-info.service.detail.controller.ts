

/**
 * @file customer.svc-info.service.detail.controller.ts
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018.12.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { CUSTOMER_SERVICE_OPTION_TYPE } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import EnvHelper from '../../../../utils/env.helper';
import FormatHelper from '../../../../utils/format.helper';

class CustomerUseguideService extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any): void {
    const { listIndex, subIndex, code } = {
      code: req.query.code,
      listIndex: this.findIndex(req.query.code, 'listIndex'),
      subIndex: this.findIndex(req.query.code, 'subIndex')
    };
    if (FormatHelper.isEmpty(code) || FormatHelper.isEmpty(listIndex) || 
    FormatHelper.isEmpty(subIndex)) {
      // 페이지가 존재하지 않으면
      return res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
    }
    this.apiService.request(API_CMD.BFF_08_0064, {}, {}, [code] ).subscribe(resp => {
      if ( resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo,
          svcInfo
        });
      }

      // 셀렉트 박스에 쓰일 리스트
      const list = CUSTOMER_SERVICE_OPTION_TYPE[listIndex as any].sub_list[subIndex as any].dep_list || [];
      
      // 제목 구하기
      const result = Object.assign(resp.result, {
        title: CUSTOMER_SERVICE_OPTION_TYPE[listIndex as any].unitedTitle || CUSTOMER_SERVICE_OPTION_TYPE[listIndex as any].title,
        sub_title: CUSTOMER_SERVICE_OPTION_TYPE[listIndex as any].sub_list[subIndex as any].sub_title,
        dep_title: this.getCurTitleFromDeps(list, code)
      });

      res.render('svc-info/customer.svc-info.service.detail.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        // 별도로 코드관리
        contentHTML: this.modifyHTML(result['icntsCtt']),
        data: {
          // 코드를 제외한 데이터
          contents: this.exceptHTML(result),
          // 하위메뉴들이 있을경우 세부페이지에서 콤보박스 노출
          list,
          listIndex,
          subIndex
        }
      });
    });
  }

  private findIndex = (code: string, returnKey: string): string | null => {
    if (FormatHelper.isEmpty(code)) {
      return null;
    }
    let result = {listIndex: '', subIndex: ''};
    CUSTOMER_SERVICE_OPTION_TYPE.map((list, listIndex) => {
      list.sub_list.map((sub_list, subIndex) => {
        if (sub_list.code && sub_list.code === code) {
          result = Object.assign(result, {
            listIndex,
            subIndex
          });
        }
        if (sub_list.dep_list && sub_list.dep_list.length) {
          sub_list.dep_list.map((dep_list) => {
            if (dep_list.code === code) {
              result = Object.assign(result, {
                listIndex,
                subIndex
              });
            }
          });
        }
      });
    });
    return result[returnKey].toString();
  };

  // 해당 리스트에서 같은 코드 찾기
  private getCurTitleFromDeps = (list, code: string) => {
    const content = list.reduce((prev, next) => {
      return (FormatHelper.isEmpty(prev) && 
        next.code === code) ? next : prev;
    }, {});
    return FormatHelper.isEmpty(content) ? '' : content.dep_title;
  };

  // 전송된 데이터 준 html 따로 관리
  private exceptHTML = (obj: object): object => {
    return Object.assign(obj, {icntsCtt: ''});
  };

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

export default CustomerUseguideService;
