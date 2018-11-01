/*
 * FileName: membership.benefit.franchisee.list.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class MembershipBenefitFranchiseeList extends TwViewController {
  private _area1List: Array<any> = [];
  private _area2List: Array<any> = [];

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {

    const brandCd: any = '';
    const ordCol: any = req.query.ordCol || 'N';
    const pageNo: any = req.query.pageNo || '1';
    const pageSize: any = req.query.pageSize || '20';
    const area1: any = req.query.area1;
    const area2: any = req.query.area2;

    const params = {
      ordCol: ordCol,
      pageNo: pageNo,
      pageSize: pageSize,
      area1: area1,
      area2: area2,
    };


    this.apiService.request(API_CMD.BFF_11_0021, {})
      .subscribe((resp) => {
        console.log('====== area1 ======');
        console.log(resp);

        resp = {
          'code': '00',
          'msg': 'success',
          'result': [
            { 'area': '강원' },
            { 'area': '경기' }
          ]
        };

        if ( resp.code === API_CODE.CODE_00 ) {
          this._area1List = resp.result;
        }
      });


    this._area2List = [];
    if ( area1 ) {
      this.apiService.request(API_CMD.BFF_11_0022, {area1: area1})
        .subscribe((resp) => {
          console.log('====== area2 ======');
          console.log(resp);

          resp = {
            'code': '00',
            'msg': 'success',
            'result': [
              { 'area': 'aaa' },
              { 'area': 'bbb' }
            ]
          };

          if ( resp.code === API_CODE.CODE_00 ) {
            this._area2List = resp.result;
          }
        });
    }


    this.apiService.request(API_CMD.BFF_11_0023, params)
      .subscribe((resp) => {
        console.log('====== 가맹점 목록 검색 ======');
        console.log(resp);

        resp = {
          'code': '00',
          'msg': 'success',
          'result': {
            'totalCnt': '46', // 총건수
            'list': [
              {
                'coCd': 'C111',
                'joinCd': 'B187',
                'mrchtNm': '명동역남산',
                'brandCd': '2012001524',
                'coPtnrNm': '파리바게뜨',
                'telNo': '0277147734',
                'addr': '서울 중구 퇴계로 118 (남산동1가)',
                'googleMapCoordX': '37.5605152',
                'googleMapCoordY': '126.9848583'
              }
            ]
          }
        };

        // if ( resp.code === API_CODE.CODE_00 ) {
          const options: any = {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            data: resp.result,
            area1List: this._area1List,
            area2List: this._area2List
          };

          res.render('benefit/membership.benefit.franchisee.list.html', options);
        // }
      });

  }
}

export default MembershipBenefitFranchiseeList;
