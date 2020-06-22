/**
 * @file [이용안내-사이트_이용방법-상세페이지]
 * @author Lee Kirim
 * @since 2018-12-13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import EnvHelper from '../../../../utils/env.helper';
import { CUSTOMER_SITE_OPTION_TYPE } from '../../../../types/string.type';
import {Observable} from 'rxjs/Observable';

/**
 * @interface
 */
interface IContent {
  cat: string;
  title: string;
  code: string;
}

/**
 * @desc 전달된 code 값을 파라미터로 콘텐츠 조회 API 호출 해 반환값을 렌더링
 */
class CustomerSvcInfoSite extends TwViewController {

  constructor() {
    super();
  }  

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any)  {
    const {code} = req.query;
    let curContent = this.findCurContent(code);

    // OP002-4354 : 검색에서 링크 이동이 가능하도록 H/C
    if ((code ===  'D00010' && String(process.env.NODE_ENV) === 'prd') 
        || (code ===  'D00015' && String(process.env.NODE_ENV) !== 'prd')) {
      curContent = code;
    }

    if (FormatHelper.isEmpty(curContent)) {
      return res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
    }

    Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_08_0064, {}, {}, [code]),
        // 컨텐츠관리 누적 조회 수 통계를 위한 API 발송
        this.apiService.request(API_CMD.BFF_08_0065, {}, null, [code])
    ).subscribe(([ contents, count]) => {
      const apiError = this.error.apiError([contents, count]);
      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          code: apiError.code,
          msg: apiError.msg,
          pageInfo,
          svcInfo
        });
      }

      res.render('svc-info/customer.svc-info.site.detail.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        contentHTML: this.modifyHTML(contents.result.icntsCtt), // 코드로 조회된 콘텐츠
        data: {
          title: curContent.title // 상세내용 제목
        }
      });
    });
  }

  /**
   * @function
   * @return {IContent | {}} 
   * @desc 쿼리로 전달될 code값과 CUSTOMER_SITE_OPTION_TYPE 리스트 내 code 값이 일치하는 객체를 반환
   */
  private findCurContent = (code: string): IContent | any => {
    return CUSTOMER_SITE_OPTION_TYPE.reduce((prev, cur) => {
      if (cur.code === code) {
        return cur;
      } else {
        return prev;
      }
    }, {});
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

export default CustomerSvcInfoSite;
