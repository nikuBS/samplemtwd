/**
 * FileName: myt-join.product.combinations.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { COMBINATION_PRODUCT } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';

export default class MyTJoinProductCombinations extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (req.params.combination) {
      const id = req.params.combination;
      const pageId = COMBINATION_PRODUCT[id || ''];
      this.getCombination(id).subscribe(combination => {
        if (combination.code || !pageId) {
          return this.error.render(res, {
            ...combination,
            svcInfo
          });
        }

        res.render('product/myt-join.product.combinations.combination.html', { svcInfo, pageInfo, combination, pageId });
      });
    } else {
      this.apiService.request(API_CMD.BFF_05_0133, {}).subscribe(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            ...resp,
            svcInfo
          });
        }

        res.render('product/myt-join.product.combinations.html', {
          svcInfo,
          pageInfo,
          combinations: resp.result.combinationWirelessMemberList || []
        });
      });
    }
  }

  private getCombination = id => {
    return this.apiService.request({ ...API_CMD.BFF_05_0134, path: API_CMD.BFF_05_0134.path + '/' + id }, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return {
        ...resp.result,
        combinationGroup: {
          ...resp.result.combinationGroup,
          totBasFeeDcTx: FormatHelper.addComma(String(resp.result.combinationGroup.totBasFeeDcTx))
        },
        combinationWirelessMemberList: (resp.result.combinationWirelessMemberList || []).map(member => {
          return {
            ...member,
            aftBasFeeAmtTx: FormatHelper.addComma(String(member.aftBasFeeAmtTx)),
            basFeeAmtTx: FormatHelper.addComma(String(member.basFeeAmtTx)),
            basFeeDcTx: FormatHelper.addComma(String(member.basFeeDcTx)),
            bIdx: resp.result.combinationWireMemberList.findIndex(wire => {
              return wire.mblSvcMgmtNum === member.svcMgmtNum;
            })
          };
        })
      };
    });
  }
}
