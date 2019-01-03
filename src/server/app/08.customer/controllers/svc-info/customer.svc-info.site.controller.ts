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

    this.apiService.request(API_CMD.BFF_08_0057, {svcDvcClCd: 'G'}).subscribe(resp => {
      if ( resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo
        });
      }

      res.render('svc-info/customer.svc-info.site.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        data: this.setListUp(resp.result || [])
      });
    });

    

  }

  private setListUp = (list) => {
    list.map((o, index) => {
      // 순서 적용
      o.listIndex = CUSTOMER_SITE_SEQNUM_TO_DETAIL_URL[o.seqNo] || null;
      // detail000 주소로 입력됨
      o.linkNum = FormatHelper.leadingZeros(
        CUSTOMER_SITE_SEQNUM_TO_DETAIL_URL[o.seqNo], 3); // 000 
    });

    // listIndex 로 오름차순 정렬
    FormatHelper.sortObjArrAsc(list, 'listIndex');
    return list;
  }

}

export default CustomerSvcInfoSite;
