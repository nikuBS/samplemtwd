/**
 * @file myt-fare.bill.option.change-address.controller.ts
 * @author Jayoon Kong
 * @since 2019.01.18
 * @desc 자동납부 미사용자 연락처 및 주소 변경 관리 page
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';

/**
 * @class
 * @desc 자동납부 미사용자 연락처 및 주소 변경 관리
 */
class MyTFareBillOptionChangeAddress extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.getAddrInfo().subscribe((addrInfo) => {
      if (addrInfo.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.option.change-address.html', {
          svcInfo: svcInfo, // 회선 정보 (필수)
          pageInfo: pageInfo, // 페이지 정보 (필수)
          addrInfo: this.parseInfo(addrInfo.result) // 주소 조회
        });
      } else {
        this.error.render(res, {
          code: addrInfo.code,
          msg: addrInfo.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }

  /**
   * @function
   * @desc 자동납부 미사용자 연락처 및 주소 조회
   * @returns {Observable<any>}
   */
  private getAddrInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0146, {}).map((res) => {
      return res;
    });
  }

  /**
   * @function
   * @desc parsing data
   * @param info
   * @returns {any}
   */
  private parseInfo(info: any): any {
    if (info.svcNum) {
      info.phoneNum = StringHelper.phoneStringToDash(info.svcNum); // 휴대폰 번호일 경우 '-' 추가
    }
    return info;
  }
}

export default MyTFareBillOptionChangeAddress;
