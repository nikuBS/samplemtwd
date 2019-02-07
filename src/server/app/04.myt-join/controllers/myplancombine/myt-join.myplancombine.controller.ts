/**
 * FileName: myt-join.myplancombine.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { COMBINATION_PRODUCT } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { MYT_JOIN_PERSONAL, MYT_JOIN_FAMILY } from '../../../../types/string.type';

export default class MyTJoinMyPlanCombine extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (req.params.combination) {
      const prodId = req.params.combination;
      const pageId = COMBINATION_PRODUCT[prodId || ''];

      if (!pageId) {
        return this.error.render(res, {
          svcInfo
        });
      }

      this.getCombination(prodId, svcInfo, req.query.type).subscribe(combination => {
        if (combination.code) {
          return this.error.render(res, {
            ...combination,
            svcInfo
          });
        }

        res.render('myplancombine/myt-join.myplancombine.combination.html', { svcInfo, pageInfo, combination, pageId, prodId });
      });
    } else {
      this.getCombinations().subscribe(combinations => {
        if (combinations.code) {
          return this.error.render(res, {
            ...combinations,
            svcInfo
          });
        }

        res.render('myplancombine/myt-join.myplancombine.html', {
          svcInfo,
          pageInfo,
          combinations
        });
      });
    }
  }

  private getCombinations = () => {
    return this.apiService.request(API_CMD.BFF_05_0133, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return (resp.result.combinationMemberList || []).map(comb => {
        return {
          ...comb,
          scrbDt: DateHelper.getShortDate(comb.scrbDt)
        };
      });
    });
  }

  private getCombination = (id, svcInfo, type) => {
    return this.apiService.request(API_CMD.BFF_05_0134, {}, {}, [id]).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      const BADGE = {
        '00': 'f-delegate',
        '01': 'partner',
        '02': 'children',
        '03': 'parents',
        '04': 'brother',
        '05': 'grandchildren',
        '06': 'grandparents'
      };

      const group = resp.result.combinationGroup;
      return {
        ...resp.result,
        combinationGroup: {
          ...group,
          svcProdGrpNm: type && type === '1' ? group.svcProdGrpNm.replace(MYT_JOIN_FAMILY, MYT_JOIN_PERSONAL) : group.svcProdGrpNm,
          totBasFeeDcTx: FormatHelper.addComma(String(group.totBasFeeDcTx)),
          combStaDt: DateHelper.getShortDate(group.combStaDt),
          isRepresentation: group.svcMgmtNum === svcInfo.svcMgmtNum
        },
        combinationWirelessMemberList: (resp.result.combinationWirelessMemberList || []).map(member => {
          return {
            ...member,
            aftBasFeeAmtTx: FormatHelper.addComma(String(member.aftBasFeeAmtTx)),
            basFeeAmtTx: FormatHelper.addComma(String(member.basFeeAmtTx)),
            basFeeDcTx: FormatHelper.addComma(String(member.basFeeDcTx)),
            badge: BADGE[member.relClCd],
            bIdx: resp.result.combinationWireMemberList.findIndex(wire => {
              return wire.mblSvcMgmtNum === member.svcMgmtNum;
            }),
            svcNum: FormatHelper.conTelFormatWithDash(member.svcNum),
            asgnNum: FormatHelper.conTelFormatWithDash(member.asgnNum)
          };
        })
      };
    });
  }
}
