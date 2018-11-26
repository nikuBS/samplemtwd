/**
 * FileName: myt-join.myplanadd.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from 'rxjs/Observable';

class MyTJoinMyPlanAdd extends TwViewController {
  constructor() {
    super();
  }

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (svcInfo.svcAttrCd.includes('M')) {
      this.getMobileAdditions().subscribe(mobile => {
        if (mobile.code) {
          return this.error.render(res, {
            ...mobile,
            svcInfo: svcInfo,
            title: '나의 부가상품'
          });
        }

        res.render('myplanadd/myt-join.myplanadd.mobile.html', { svcInfo, pageInfo, ...mobile });
      });
    } else {
      this.getWireAdditions().subscribe(wire => {
        if (wire.code) {
          return this.error.render(res, {
            ...wire,
            svcInfo: svcInfo,
            title: '나의 부가상품'
          });
        }

        res.render('myplanadd/myt-join.myplanadd.wire.html', { svcInfo, pageInfo, ...wire });
      });
    }
  }

  private getMobileAdditions = () => {
    return this.apiService.request(API_CMD.BFF_05_0137, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return {
        additions: (resp.result.addProdList || []).map(this.convertAdditions),
        roaming: resp.result.roamingProd
      };
    });
  }

  private getWireAdditions = () => {
    return this.apiService.request(API_CMD.BFF_05_0129, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return {
        joined: resp.result.pays.map(this.convertAdditions),
        joinable: resp.result.joinables.map(this.convertAdditions)
      };
    });
  }

  private convertAdditions = (addition: any) => {
    return {
      ...addition,
      basFeeTxt: FormatHelper.getFeeContents(addition.basFeeTxt),
      scrbDt: DateHelper.getShortDateNoDot(addition.scrbDt)
    };
  }
}

export default MyTJoinMyPlanAdd;
