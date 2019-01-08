/**
 * 상품 해지 - T+B결합상품
 * FileName: benefit.terminate.tb-combination.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.23
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../types/string.type';
import FormatHelper from '../../../utils/format.helper';
import DateHelper from '../../../utils/date.helper';

class BenefitTerminateTbCombination extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param termInfo
   * @private
   */
  private _convertTermInfo(termInfo: any): any {
    return Object.assign(termInfo, {
      combinationGroup: this._convCombinationGroup(termInfo.combinationGroup),
      combinationWirelessMember: FormatHelper.isEmpty(termInfo.combinationWirelessMemberList) ? null :
        termInfo.combinationWirelessMemberList[0],
      combinationWireMember: FormatHelper.isEmpty(termInfo.combinationWireMemberList) ? null :
        termInfo.combinationWireMemberList[0]
    });
  }

  /**
   * @param combinationGroup
   * @private
   */
  private _convCombinationGroup(combinationGroup: any): any {
    return Object.assign(combinationGroup, {
      combStaDt: DateHelper.getShortDateWithFormat(combinationGroup.combStaDt, 'YYYY.M.DD')
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_10_0114, {}, {}, [prodId])
      .subscribe((termInfo) => {
        if (termInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: termInfo.code,
            msg: termInfo.msg
          }));
        }

        const convTermInfo: any = this._convertTermInfo(termInfo.result);
        if (FormatHelper.isEmpty(convTermInfo.combinationWireMember)) {
          return this.error.render(res, renderCommonInfo);
        }

        res.render('terminate/benefit.terminate.tb-combination.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          termInfo: convTermInfo
        }));
      });
  }
}

export default BenefitTerminateTbCombination;
