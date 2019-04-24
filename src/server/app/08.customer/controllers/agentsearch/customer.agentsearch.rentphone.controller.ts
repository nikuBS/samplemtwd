/**
 * @file 앰대폰 매장 리스트 화면 처리
 * @author Hakjoon sim
 * @since 2019-02-14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

interface Store {
  locName: string;
  searchAddr: string;
  jibunAddr: string;
  tel: string;
  locCode: string;
  geoX: string;
  geoY: string;
  orderDistrict: string;
}

class CustomerAgentsearchRentPhone extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    this.getRentPhoneStores(res, svcInfo, pageInfo).subscribe(
      (resp: Array<Store> | null) => {
        if (resp) {
          const currentList = resp.filter((item) => { // default 서울 지역만 filter
            return item.orderDistrict === '1';
          });
          res.render('agentsearch/customer.agentsearch.rentphone.html', {
            svcInfo, pageInfo, list: currentList, totalList: resp
          });
        }
      },
      err => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          pageInfo,
          svcInfo
        });
      }
    );
  }

  /**
   * @function
   * @desc 임대포 매장 리스트를 BFF에서 조회
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @returns Observable - BFF 조회 결과를 Observable 로 리턴
   */
  private getRentPhoneStores(res: Response, svcInfo: any, pageInfo: any): Observable<Array<Store> | null> {
    return this.apiService.request(API_CMD.BFF_08_0067, {}).map(((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result.regionInfoList;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo,
        svcInfo
      });

      return null;
    }));
  }
}

export default CustomerAgentsearchRentPhone;
