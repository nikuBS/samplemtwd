/*
 * FileName: membership.benefit.franchisee.map.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class MembershipBenefitFranchiseeMap extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const coCd: any = 'C111';
    const joinCd: any = 'B187';
    this.apiService.request(API_CMD.BFF_11_0024, { coCd: coCd, joinCd: joinCd })
      .subscribe((resp) => {
        console.log('====== 가맹점 정보 검색 ======');
        console.log(resp);
        /*

        */
        resp = {
          'code': '00',
          'msg': 'success',
          'result': {
            'coCd': 'C111',                        // PRM 제휴사 코드
            'joinCd': 'B187',                      // PRM 가맹점 코드
            'mrchtNm': '명동역남산',                 // 가맹점명
            'brandCd': '2012001524',               // 브랜드코드
            'coPtnrNm': '파리바게뜨',                // 제휴사명
            'telNo': '0277147734',                 // 전화번호
            'addr': '서울 중구 퇴계로 118 (남산동1가)', // 주소
            'googleMapCoordX': '37.5605152',       // 맵지도좌표값X
            'googleMapCoordY': '126.9848583'       // 맵지도좌표값Y
          }
        };

        if ( resp.code === API_CODE.CODE_00 ) {
          const options: any = {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            data: resp.result
          };

          res.render('benefit/membership.benefit.franchisee.map.html', options);
        }
      });


  }
}

export default MembershipBenefitFranchiseeMap;
