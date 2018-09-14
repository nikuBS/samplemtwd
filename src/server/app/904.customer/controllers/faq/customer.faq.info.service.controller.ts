/**
 * FileName: customer.faq.service.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {CUSTOMER_SERVICEINFO_TYPE, CUSTOMER_SERVICEINFO_CATEGORY} from '../../../../types/string.old.type';

class CustomerFaqInfoService extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const serviceId = req.params.serviceId;
    const category = req.query.category;
    const subCategory = req.query.subCategory;
    const contentsIndex = req.query.contentsIndex;

    // this.logger.info(this, req.query.category, req.query.subCategory);

    if (!serviceId && (!category && !subCategory)) {
      res.render('faq/customer.faq.info.service.html', {
        svcInfo: svcInfo
      });
    } else {
      const title = CUSTOMER_SERVICEINFO_CATEGORY[req.query.category].title;

      if (!serviceId) {
        res.render('error.server-error.html', {
          title: title,
          code: '',
          msg: '',
          svcInfo: svcInfo
        });
      } else {

        const currentType = CUSTOMER_SERVICEINFO_TYPE[serviceId] || 'U';
        // CUSTOMER_SERVICEINFO_TYPE에 없는 케이스(주요 용어 페이지)는 U 설정 : 개발시 화면 아이디, JSP페이지의 API와 없었음.
        // 4개 페이지 아이디와, CUSTOMER_SERVICEINFO_TYPE에 매칭 필요함

        const hasSelector = this._check_hasSelector(currentType);

        this.apiService.request(API_CMD.BFF_08_0056, {
          seqNum: serviceId
        }).subscribe((resp) => {

          this.logger.info(this, `serviceId = ${serviceId}, category = ${category}, subCategory = ${subCategory}, contentsIndex = ${contentsIndex}`);
          // CUSTOMER_SERVICEINFO_CATEGORY[category].subDepth[subCategory]

          // USIM 잠금해제 주요용어 URL
          // /customer/faq/service-info/xxxx(USIM관련용어 Code)?category=6&subCategory=0&contentsIndex=0
          const subDepth = CUSTOMER_SERVICEINFO_CATEGORY[category].subDepth[subCategory] || null;
          this.logger.info(this, subDepth);

          if (resp.code === API_CODE.CODE_00) {
            res.render('faq/customer.faq.info.service-cases.html', {
              svcInfo: svcInfo,
              serviceId: serviceId,
              serviceCategoryTitle: title,
              category: category,
              subCategory: subCategory,
              resp: resp,
              subDepth: subDepth,
              contentsIndex: contentsIndex,
              hasSelector: hasSelector
            });
          } else {  // error
            this.logger.error(this, resp);
            res.render('error.server-error.html', {
              title: title,
              code: resp.code,
              msg: resp.msg,
              svcInfo: svcInfo
            });
          }
        });
      }

    }
  }

  private _check_hasSelector(type: string): boolean {
    let check;
    switch (type) {
      case 'A-1':
      case 'C-1':
        check = false;
        break;
      default:
        check = true;
        break;
    }
    return check;
  }

}


export default CustomerFaqInfoService;
