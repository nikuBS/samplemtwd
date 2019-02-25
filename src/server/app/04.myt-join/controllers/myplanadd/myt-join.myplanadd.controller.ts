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

const PLAN_BUTTON_TYPE = {
  SET: 'SE',
  TERMINATE: 'TE',
  SUBSCRIBE: 'SC'
};

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
            pageInfo: pageInfo,
            title: '나의 부가서비스'
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
            pageInfo: pageInfo,
            title: '나의 부가서비스'
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
          ? {
              ...resp.result.roamingProd,
              addRoamingProdCnt: Number(resp.result.roamingProd.addRoamingProdCnt) - 1
            }
          : {}
      };
    });
  }

  private getWireAdditions = () => {
    return this.apiService.request(API_CMD.BFF_05_0129, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return {
        joined: (resp.result.pays || []).concat(resp.result.frees || []).map(this.convertAdditions),
        joinable: resp.result.joinables.map(this.convertAdditions).sort(this._sortAdditions),
        reserved: resp.result.reserveds.map(this.convertAdditions)
      };
    });
  }

  private convertAdditions = (addition: any) => {
    return {
      ...addition,
      ...(addition.btnList && addition.btnList.length > 0
        ? {
            btnList: addition.btnList
              .filter(btn => {
                return btn.btnTypCd === PLAN_BUTTON_TYPE.SET && addition.prodSetYn === 'Y';
              })
              .sort(this._sortButtons)
          }
        : {}),
      basFeeTxt: FormatHelper.getFeeContents(addition.basFeeTxt),
      scrbDt: DateHelper.getShortDate(addition.scrbDt)
    };
  }

  private _sortButtons = (a, b) => {
    if (a.btnTypCd) {
      if (a.btnTypCd === PLAN_BUTTON_TYPE.TERMINATE) {
        return 1;
      } else {
        return -1;
      }
    } else {
      return 0;
    }
  }

  private _sortAdditions = (a, b) => {
    const diff = DateHelper.getDifference(a.scrbDt, b.scrbDt);
    if (diff > 0) {
      return 1;
    } else if (diff < 0) {
      return -1;
    }

    return 0;
  }
}

export default MyTJoinMyPlanAdd;
