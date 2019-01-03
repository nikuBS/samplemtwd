/**
 * FileName: customer.svc-info.site.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.12.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import { CUSTOMER_SITE_SEQNUM_TO_DETAIL_URL } from '../../../../types/bff.type';
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

    const page = req.params ? (req.params.page || null) : null;

    if (this.isExistingPage(page)) {
      return res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
    }

    this.apiService.request(API_CMD.BFF_08_0057, {svcDvcClCd: 'G'}).subscribe(resp => {
      if ( resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo
        });
      }

      const curPageContents = this.findCurPage(resp.result, page);

      res.render('svc-info/customer.svc-info.site.detail.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        contentHTML: this.modifyHTML(curPageContents['cntsCmmnt']),
        data: {
          type: page === '001' ? 'A' : 'B', 
          content: this.exceptHTML(curPageContents)
        }
      });
    });
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
      .replace(/\/mpoc\/img\/common/gi, EnvHelper.getEnvironment('CDN') + '/img/customer');
    return html;
  }

  // 쿼리스트링으로 받아온 detail(:000) 페이지가 존재하는지 여부
  private isExistingPage = (page: string): boolean => {
    return FormatHelper.isEmpty(
      Object.keys(CUSTOMER_SITE_SEQNUM_TO_DETAIL_URL).filter((key) => {
        return FormatHelper.leadingZeros(CUSTOMER_SITE_SEQNUM_TO_DETAIL_URL[key], 3) === page;
      })
    );
  }

  // 조회된 리스트로부터 쿼리스트링으로 받아온 id 값에 해당하는 데이터콘텐츠 구하기
  private findCurPage = (list: Array<any>, page: string): object => {
    return list.reduce((prev, next) => {
      if (FormatHelper.isEmpty(prev)) {
        return FormatHelper.leadingZeros(CUSTOMER_SITE_SEQNUM_TO_DETAIL_URL[next.seqNo], 3) === page ? next : prev;
      } else {
        return prev;
      }
    }, {});
  }
}

export default CustomerSvcInfoSite;
