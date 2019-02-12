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
import { SVC_CD } from '../../../types/bff.type';
import FormatHelper from '../../../utils/format.helper';
import DateHelper from '../../../utils/date.helper';

class BenefitTerminateTbCombination extends TwViewController {
  constructor() {
    super();
  }

  private _allowedProdIds = ['NH00000037', 'NH00000039', 'NH00000040', 'NH00000041', 'TW00000062', 'TW00000063'];

  /**
   * @param termInfo
   * @private
   */
  private _convertTermInfo(termInfo: any): any {
    return Object.assign(termInfo, {
      combinationGroup: this._convCombinationGroup(termInfo.combinationGroup),
      combinationWirelessMember: FormatHelper.isEmpty(termInfo.combinationWirelessMemberList) ? null :
        this._convertWirelessInfo(termInfo.combinationWirelessMemberList[0]),
      combinationWireMember: FormatHelper.isEmpty(termInfo.combinationWireMemberList) ? null :
        this._convertWireInfo(termInfo.combinationWireMemberList[0])
    });
  }

  /**
   * @param wireLessInfo
   * @private
   */
  private _convertWirelessInfo(wireLessInfo: any): any {
    return Object.assign(wireLessInfo, {
      svcNum: FormatHelper.conTelFormatWithDash(wireLessInfo.svcNum)
    });
  }

  /**
   * @param wireInfo
   * @private
   */
  private _convertWireInfo(wireInfo: any): any {
    return Object.assign(wireInfo, {
      svcCdNm: SVC_CD[wireInfo.svcCd]
    });
  }

  /**
   * @param combinationGroup
   * @private
   */
  private _convCombinationGroup(combinationGroup: any): any {
    return Object.assign(combinationGroup, {
      combStaDt: DateHelper.getShortDateWithFormat(combinationGroup.combStaDt, 'YYYY.M.DD.')
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIds.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_10_0114, {}, {}, [prodId])
      .subscribe((termInfo) => {
        if (termInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: termInfo.code,
            msg: termInfo.msg,
            isBackCheck: true
          }));
        }

        res.render('terminate/benefit.terminate.tb-combination.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          termInfo: this._convertTermInfo(termInfo.result)
        }));
      });
  }
}

export default BenefitTerminateTbCombination;
