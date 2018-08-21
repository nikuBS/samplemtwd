/*
* FileName: mty.join.product-service.combination.controller.ts
* Author: Jiyoung Jo (jiyoungjo@sk.com)
* Date: 2018.08.20
*/

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Request, Response, NextFunction } from 'express';
import { COMBINATION_PRODUCT_TYPE } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import StringHelper from '../../../../utils/string.helper';

interface ICombination {
  joinDate: string;
  totalPeriod: number;
  totalDiscount: string;
  count: number;
  status: string;
  members: IMember[];
  wireIndex: number;
  bProducts: { [key: string]: IBProduct };
  representationId: string;
}

interface IMember {
  name: string;
  relation: string;
  isRepresentation: boolean;
  svcNumber: string;
  period: number;
  servicePlan: string;
  managementId: string;
  // T끼리 온가족 할인
  afterDiscount?: string;
  beforeDiscount?: string;
  discountAmount?: string;
  discountRate?: number;
}

interface IBProduct {
  period?: number;
}

export default class MytJoinProductServiceCombinationController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any): void {
    const prodId = req.query.prodId || '';

    this.apiService.request({
      ...API_CMD.BFF_05_0134,
      path: API_CMD.BFF_05_0134.path + '/' + prodId
    }, {}).subscribe(resp => {
      if (resp.code === API_CODE.CODE_00) {
        const pageId = COMBINATION_PRODUCT_TYPE[prodId || ''];

        if (pageId) {
          res.render('join/myt.join.product-service.combination.html', {
            svcInfo: svcInfo,
            pageId,
            combination: this.getProperCombinationData(resp.result)
          });
        } else {
          res.render('error.server-error.html', {
            title: '사용중인 상품',
            code: resp.code,
            msg: resp.msg,
            svcInfo
          });
        }
      } else {
        res.render('error.server-error.html', {
          title: '사용중인 상품',
          code: resp.code,
          msg: resp.msg,
          svcInfo
        });
      }
    });
  }

  private getProperCombinationData = (combination: any): ICombination => {
    const group = combination.combinationGroup;
    return {
      joinDate: DateHelper.getShortDateNoDot(group.combStaDt),
      totalPeriod: group.totUseYy,
      totalDiscount: FormatHelper.convNumFormat(group.totBasFeeDcTx),
      count: group.mblSvcCnt,
      status: group.combSt,
      members: combination.combinationWirelessMemberList.map(this.getProperMemberData)
        .concat(combination.combinationWireMemberList.map(this.getProperMemberData)),
      wireIndex: combination.combinationWirelessMemberList.length,
      bProducts: this.getBProducts(combination.combinationWireMemberList),
      representationId: group.svcMgmtNum
    }
  }

  private getProperMemberData = (member: any): IMember => {
    return {
      name: StringHelper.replaceAt(member.custNm, 1, '*'),
      relation: member.relClNm,
      isRepresentation: member.relClCd === "00",
      svcNumber: StringHelper.maskPhoneNumber(member.svcNum),
      period: member.useYySum,
      servicePlan: member.feeProdNm,
      managementId: member.svcMgmtNum,
      afterDiscount: member.aftBasFeeAmtTx ? FormatHelper.convNumFormat(member.aftBasFeeAmtTx) : undefined,
      beforeDiscount: member.basFeeAmtTx ? FormatHelper.convNumFormat(member.aftBasFeeAmtTx) : undefined,
      discountAmount: member.basFeeDcTx ? FormatHelper.convNumFormat(member.aftBasFeeAmtTx) : undefined,
      discountRate: member.tcFeeBenf
    }
  }

  private getBProducts = (members: any[]): { [key: string]: IBProduct } => {
    const bProducts: { [key: string]: IBProduct } = {};
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      bProducts[member['mblSvcMgmtNum']] = {
        period: member['useYySum']
      }
    }

    return bProducts;
  }
}
