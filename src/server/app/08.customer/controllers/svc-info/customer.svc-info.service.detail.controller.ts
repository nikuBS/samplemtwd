

/**
 * @file [이용안내-서비스_이용안내-상세페이지]
 * @author Lee Kirim
 * @since 2018-12-20
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

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any): void {
    const { listIndex, subIndex, code } = {
      code: req.query.code,
      listIndex: this.findIndex(req.query.code, 'listIndex'),
      subIndex: this.findIndex(req.query.code, 'subIndex')
    };
    
    if (FormatHelper.isEmpty(code) || FormatHelper.isEmpty(listIndex) || 
    FormatHelper.isEmpty(subIndex) || !listIndex || !subIndex) {
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
      const list = CUSTOMER_SERVICE_OPTION_TYPE[listIndex].sub_list[subIndex].dep_list || [];
      
      // 제목 구하기
      const result = Object.assign(resp.result, {
        title: CUSTOMER_SERVICE_OPTION_TYPE[listIndex].unitedTitle || CUSTOMER_SERVICE_OPTION_TYPE[listIndex].title,
        sub_title: CUSTOMER_SERVICE_OPTION_TYPE[listIndex].sub_list[subIndex].sub_title,
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

  /**
   * @function
   * @desc 주어진 code가 있는 객체의 index 를 반환 listIndex or subIndex
   * @param {string} code 찾을 코드이름
   * @param {string} returnKey 반환할 종류 listIndex or subIndex
   * @return {string} code에 해당하는 객체를 찾을 수 없으면 '' 반환
   */
  private findIndex = (code: string, returnKey: string): string => {
    if (FormatHelper.isEmpty(code)) {
      return '';
    }
    let result = {listIndex: '', subIndex: ''}; // 결과값 저장
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
  }

  /**
   * @function
   * @desc 주어진 리스트 내 code property 와 주어진 code 가 같은 값을 찾음
   * @param {array} list
   * @param {string} code
   * @returns {string} title
   */
  private getCurTitleFromDeps = (list: any[], code: string): string => {
    const content = list.reduce((prev, next) => {
      return (FormatHelper.isEmpty(prev) && 
        next.code === code) ? next : prev;
    }, {});
    return FormatHelper.isEmpty(content) ? '' : content.dep_title;
  }

  // 전송된 데이터 준 html 따로 관리
  private exceptHTML = (obj: object): object => {
    return Object.assign(obj, {icntsCtt: ''});
  }

  /**
   * @function
   * @desc 문자열로 전달된 html 문자중 주석 제거, {{cdn}} 을 이미지 경로로 교체
   * @param {string} html 
   * @return {string} 
   */
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
