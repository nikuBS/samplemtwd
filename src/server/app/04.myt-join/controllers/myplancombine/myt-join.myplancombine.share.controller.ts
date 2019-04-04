/**
 * FileName: myt-join.myplancombine.share.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2019.02.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

export default class MyTJoinMyPlanCombineShare extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (req.query.id) {
      this.getCombination(req.query.id).subscribe(comb => {
        if (comb.code) {
          return this.error.render(res, {
            ...comb,
            svcInfo,
            pageInfo
          });
        }
        res.render('myplancombine/myt-join.myplancombine.share.html', { svcInfo, pageInfo, ...comb });
      });
    } else {
      this.error.render(res, {
        pageInfo,
        svcInfo
      });
    }
  }

  private getCombination = id => {  // 데이터를 나눠쓸 결합 가족 정보 가져오기
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
        group: {
          ...group,
          combStaDt: DateHelper.getShortDate(group.combStaDt)
        },
        members: (resp.result.combinationWirelessMemberList || []).map(member => {
          return {
            ...member,
            badge: BADGE[member.relClCd],
            svcNum: FormatHelper.conTelFormatWithDash(member.svcNum)
          };
        })
      };
    });
  }
}
