

/**
 * FileName: customer.svc-info.service.detail.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.12.20
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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    
    const { listIndex, subIndex, code } = req.query;
    
    if (FormatHelper.isEmpty(listIndex) || 
    FormatHelper.isEmpty(subIndex) || 
    FormatHelper.isEmpty(code)) {
      // 페이지가 존재하지 않으면
    }
    this.apiService.request(API_CMD.BFF_08_0056, {seqNum: code}).subscribe(resp => {
      if ( resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo
        });
      }

      // 셀렉트 박스에 쓰일 리스트
      const list = CUSTOMER_SERVICE_OPTION_TYPE[listIndex].sub_list[subIndex].dep_list || [];
      
      // 제목 구하기
      const result = Object.assign(resp.result, {
        title: CUSTOMER_SERVICE_OPTION_TYPE[listIndex].title,
        sub_title: CUSTOMER_SERVICE_OPTION_TYPE[listIndex].sub_list[subIndex].sub_title,
        dep_title: this.getCurTitleFromDeps(list, code)
      });

      res.render('svc-info/customer.svc-info.service.detail.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        // 별도로 코드관리
        contentHTML: this.modifyHTML(result['cntsCmmnt']),
        data: {
          // 코드를 제외한 데이터
          contents: this.exceptHTML(result),
          // 하위메뉴들이 있을경우 세부페이지에서 콤보박스 노출
          list
        }
      });
    });
  }
  // 해당 리스트에서 같은 코드 찾기
  private getCurTitleFromDeps = (list, code: string) => {
    const content = list.reduce((prev, next) => {
      return (FormatHelper.isEmpty(prev) && 
        next.code === code) ? next : prev;
    }, {});
    return FormatHelper.isEmpty(content) ? '' : content.dep_title;
  }

  // 전송된 데이터 준 html 따로 관리
  private exceptHTML = (obj: object): object => {
    return Object.assign(obj, {cntsCmmnt: ''});
  }

  // 전송된 html 수정 변경
  private modifyHTML = (html: string): string => {
      // 대문자 엘리먼트 소문자로
    html = html.replace(/<\/?[A-Z]+/gm, (s: string) => s.replace(/[A-Z]+/gi, (i: string) => i.toLowerCase()))
      // 주석제거
      .replace(/<!--(.*?)-->/gmi, '')
      // 이미지경로 변경
      .replace(/\/mpoc\/img\/center/gi, EnvHelper.getEnvironment('CDN') + '/img/service');
    return html;
  }

}

export default CustomerUseguideService;
