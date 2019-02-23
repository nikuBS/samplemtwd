/*
 * FileName: membership.benefit.brand.map.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Editor: Inhwan Kim (skt.P132150@partner.sk.com)
 * Date: 2018.11.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

interface Input {
  coCd: string;
  joinCd: string;
}

interface Result {
    coCd: string; // PRM 제휴사 코드
    joinCd: string; // PRM 가맹점 코드
    mrchtNm: string; // 가맹점명
    brandCd: string; // 브랜드코드
    coPtnrNm: string; // 제휴사명
    telNo: string; // 전화번호
    addr: string; // 주소
    googleMapCoordX: string; // 구글맵지도좌표값X
    googleMapCoordY: string; // 구글맵지도좌표값Y
}

class MembershipBenefitBrandMap extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, child: any, pageInfo: any) {

    const input: Input = {
      coCd: req.query.coCd || '',
      joinCd: req.query.joinCd || ''
    };

    this.getInfo(input, res, svcInfo, pageInfo).subscribe(
      (result: Result) => {
        if (!FormatHelper.isEmpty(result)) {
          res.render('benefit/membership.benefit.brand.map.html', {
            result, svcInfo, pageInfo
          });
        }
      },
      (err) => {
        this.error.render(svcInfo, {
          code: err.code,
          msg: err.msg,
          pageInfo: pageInfo,
          svcInfo
        });
      }
    );
  }

  private getInfo(input: Input, res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_11_0024, input).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.smg,
        pageInfo: pageInfo,
        svcInfo
      });

      return undefined;
    });
  }
}

export default MembershipBenefitBrandMap;
