/**
 * FileName: customer.useguide.site.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.10.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

import {URL_APP_STORE} from '../../../../types/outlink.type';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

class CustomerUseguideSite extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    if (query.current === 'mcustomer-center') {
      this.renderView(res, 'useguide/customer.useguide.site.m-customer-center.html',
          {svcInfo: svcInfo, pageInfo: pageInfo, tWorldAppStoreURL: URL_APP_STORE['AOS']});  // 임시로 AOS URL로 고정(현재 빈값)
    } else {

      const dummyData = {
        title: '',
        desc: '',
        html: '                <p class=".mcustomer-title03">가려진 정보 확인 방법</p>\n' +
            '                <p class="mcustomer-text04">가려진 정보란, 고객님의 소중한 정보가 *으로 가려져 보이는 것입니다.</p>\n' +
            '                <div class="site-informationuse-imgbox">\n' +
            '                    <img src="/img/dummy/CI_15_02.jpg" alt="TBD" />\n' +
            '                </div>'
      };

      switch (req.params.category) {
        case 'masked-info-check':
          this.renderView(res, 'useguide/customer.useguide.site.detail.html',
              {svcInfo: svcInfo, pageInfo: pageInfo, data: {type: 'A', data: dummyData}});
          break;
        case 'smart-micro-payment':
        case 'multi-line':
        case 'company-phone-remove':
        case 'web-accessibility':
        case 'service-menu':
          this.renderView(res, 'useguide/customer.useguide.site.detail.html',
              {svcInfo: svcInfo, pageInfo: pageInfo, data: {type: 'B', data: dummyData}});
          break;
        default:
          this.renderView(res, 'useguide/customer.useguide.site.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {}});
          return;
      }
    }
  }

  private renderView(res: Response, view: string, options: any) {
    res.render(view, options);
  }

  private getKeyWithQuery(queryString: string): any {
    return queryString.split('').filter((elem, idx, arr) => {
      if (elem === '-') {
        arr[idx + 1] = arr[idx + 1].toUpperCase();
        return '';
      }
      return elem;
    }).join('');
  }
}

export default CustomerUseguideSite;
